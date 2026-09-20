'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

const SNAPSHOT_KEY = 'mece:guest-session';
/**
 * Same-TAB marker. Written next to the snapshot in sessionStorage, which dies
 * with the tab, so its presence means "the guest practice in this snapshot
 * happened in this very tab".
 *
 * SHARED-DEVICE SAFETY. The snapshot itself has to live in localStorage (an
 * OAuth round trip can land in another tab, and a guest who closes the tab
 * still holds the same Supabase session). But localStorage is also shared with
 * the NEXT PERSON to use the browser — and on a college lab or hostel PC that
 * is the normal case, not the edge case. Without this marker the sequence is:
 * person A practises anonymously at 09:00 and leaves; person B signs into
 * their own account at 14:00; the bridge finds A's still-valid token, and the
 * server — correctly, by its own rules, since the caller really does hold both
 * sessions — moves A's attempts, transcripts and score onto B's account. That
 * is cross-user disclosure for A, irreversible loss for A, and invisible
 * server-side.
 *
 * So: same tab claims silently, anything else ASKS.
 */
const SAME_TAB_KEY = 'mece:guest-session-tab';
/** A snapshot older than this is stale enough that the token will have expired
 *  anyway; dropping it keeps the key from lingering forever in localStorage. */
const MAX_SNAPSHOT_AGE_MS = 24 * 60 * 60 * 1000;

interface Snapshot {
  user_id: string;
  access_token: string;
  ts: number;
}

function readSnapshot(): Snapshot | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Snapshot;
    if (!s?.user_id || !s?.access_token) return null;
    if (Date.now() - (s.ts ?? 0) > MAX_SNAPSHOT_AGE_MS) {
      localStorage.removeItem(SNAPSHOT_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function writeSnapshot(s: Snapshot): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(s));
  } catch {
    /* private mode / quota — the claim simply won't happen, never throw */
  }
}

function clearSnapshot(): void {
  try {
    localStorage.removeItem(SNAPSHOT_KEY);
    sessionStorage.removeItem(SAME_TAB_KEY);
  } catch {
    /* ignore */
  }
}

/** True when the snapshot was taken in THIS tab. */
function isSameTab(userId: string): boolean {
  try {
    return sessionStorage.getItem(SAME_TAB_KEY) === userId;
  } catch {
    return false;
  }
}

function markSameTab(userId: string): void {
  try {
    sessionStorage.setItem(SAME_TAB_KEY, userId);
  } catch {
    /* private mode — the claim just asks instead of firing silently */
  }
}

/**
 * Carries anonymous practice across a login.
 *
 * ── The problem ──────────────────────────────────────────────────────
 * Guest conversion (`updateUser` / `linkIdentity`) keeps the SAME auth row, so
 * work survives. But a visitor who practises anonymously and then signs in to
 * an account they ALREADY had becomes a different uuid, and everything they
 * just did stays parented to the throwaway guest row: gone from their history,
 * gone from their scores, and collected by the 30-day guest cleanup. Before
 * this component the product told them so in a toast ("today's practice won't
 * carry over") because there was nothing else it could do.
 *
 * ── Why one component instead of hooks at each login site ────────────
 * There are four ways into a session — email+password, Google, LinkedIn, and
 * the email-confirmation round trip — and each lands on a different route,
 * two of them after a full-page redirect that discards React state. Hooking
 * each one means four chances to forget. This sits in the root layout and
 * watches auth state instead, so it fires for every path including ones added
 * later:
 *
 *   • while the session is anonymous → keep a fresh snapshot of its access
 *     token (Supabase rotates it, so re-snapshotting on every auth event keeps
 *     a usable one rather than a stale one);
 *   • the moment a DIFFERENT, non-anonymous user appears → hand that token to
 *     /api/guest/claim, which verifies it server-side and re-parents the work.
 *
 * localStorage, not sessionStorage: an OAuth redirect can land in a different
 * tab, and a guest who closes the tab and comes back still holds the same
 * Supabase session, so the snapshot must outlive the tab.
 *
 * Fails silently by design. A failed claim must never block a login.
 */
export default function GuestClaimBridge() {
  const router = useRouter();
  const claiming = useRef(false);
  const offered = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function reconcile(user: { id: string; is_anonymous?: boolean } | null, accessToken?: string | null) {
      if (cancelled || !user) return;

      // Guest: refresh the snapshot so the token we hold is the current one.
      if (user.is_anonymous === true) {
        if (accessToken) {
          writeSnapshot({ user_id: user.id, access_token: accessToken, ts: Date.now() });
          markSameTab(user.id);
        }
        return;
      }

      // Permanent account. Is there guest work waiting to be claimed?
      const snap = readSnapshot();
      if (!snap) return;
      if (snap.user_id === user.id) {
        // Converted in place — same row, nothing to move.
        clearSnapshot();
        return;
      }
      if (claiming.current) return;

      // Same tab -> this is the person who did the practising; claim it.
      // Different tab or a later browser session -> it may well be someone
      // else on a shared machine, so ASK rather than move their work silently.
      if (!isSameTab(snap.user_id)) {
        offerClaim(snap.access_token);
        return;
      }
      await doClaim(snap.access_token, { silent: false });
    }

    /** Ask before moving practice that may belong to someone else. */
    function offerClaim(token: string) {
      if (offered.current) return;
      offered.current = true;
      toast('Practice found on this browser', {
        description:
          'An earlier session on this device solved some cases without an account. Add that practice to your account?',
        duration: 30000,
        action: {
          label: 'Add it',
          onClick: () => { void doClaim(token, { silent: false }); },
        },
        cancel: {
          label: 'Not mine',
          // Clearing is the point: if it is not theirs, the next page load
          // must not ask again, and nobody else should inherit the offer.
          onClick: () => clearSnapshot(),
        },
      });
    }

    async function doClaim(token: string, { silent }: { silent: boolean }) {
      if (claiming.current) return;
      claiming.current = true;
      try {
        const res = await fetch('/api/guest/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestAccessToken: token }),
        });
        const body = await res.json().catch(() => ({}));

        // Clear on any DEFINITIVE answer — success, or a rejection that will
        // never succeed on retry. 501 (migration not run) is definitive too:
        // leaving the snapshot made every single page load retry forever
        // against a deploy that cannot serve it.
        if (res.ok || res.status === 400 || res.status === 401 || res.status === 501) clearSnapshot();

        if (res.ok && body?.claimed) {
          const n = Number(body?.moved?.attempts ?? 0);
          toast.success(
            n === 1
              ? 'Your guest practice has been added to this account.'
              : `${n} practice sessions have been added to this account.`,
          );
          // The page was rendered before the rows moved, so it is showing a
          // history that is now out of date.
          router.refresh();
        } else if (!res.ok && !silent) {
          // The save wall PROMISES the work moves across. If it did not, the
          // user has to hear it from us rather than discover an empty history
          // later — swallowing this was the whole problem with the old path.
          console.error('[guest-claim] failed:', res.status, body);
          toast.error(
            res.status === 501
              ? "Your earlier practice couldn't be moved across — it's saved, but this account can't pick it up yet."
              : "Your earlier practice couldn't be moved across. Nothing was lost — try again or contact support.",
          );
        }
      } catch (e) {
        // Network blip — keep the snapshot and try again next load.
        console.warn('[guest-claim] deferred:', e);
      } finally {
        claiming.current = false;
      }
    }

    // Current state on mount…
    supabase.auth.getSession().then(({ data: { session } }) => {
      void reconcile(
        (session?.user as { id: string; is_anonymous?: boolean } | undefined) ?? null,
        session?.access_token,
      );
    });

    // …and every transition after it (SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED).
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Signing out hands the browser back — on a shared machine, to someone
      // else. Anything still pending is dropped with the session.
      if (event === 'SIGNED_OUT') {
        clearSnapshot();
        offered.current = false;
        return;
      }
      void reconcile(
        (session?.user as { id: string; is_anonymous?: boolean } | undefined) ?? null,
        session?.access_token,
      );
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
