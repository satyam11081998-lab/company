'use client';

/**
 * LinkedIn follow → one-time unlock (+1 bank case, +1 bank guesstimate).
 *
 * Two surfaces:
 *  - <LinkedInFollowPrompt/>  — auto-opening dialog on /results/[id] after a
 *    FREE user completes a daily-counted attempt. Frequency-capped to once
 *    per IST day via localStorage; gone forever once claimed (server flag)
 *    or opted out.
 *  - <LinkedInFollowInline/>  — compact block inside the /cases/[id] lock
 *    overlay when a free user has exhausted their bank ('free-extra-used').
 *
 * Honor-system claim: "Follow" is a real <a target="_blank"> (no popup
 * blockers); the claim button arms when the user returns to this tab
 * (visibilitychange) or after 8s, whichever comes first. POST
 * /api/linkedin-follow sets the server flag; useUser().refresh() +
 * router.refresh() propagate it everywhere (client context + server gates).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Linkedin, ExternalLink, Gift } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useUser } from '@/components/user-context';
import { LINKEDIN_COMPANY_URL } from '@/lib/constants';

const LS_LAST_SHOWN = 'mece-li-follow-last-shown'; // IST day string
const LS_OPT_OUT = 'mece-li-follow-optout';

/** IST day string — same convention as lib/access.ts / lib/daily-server.ts. */
function todayIst(): string {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Shared two-step follow → claim state machine. */
function useFollowClaim(onClaimed?: () => void) {
  const router = useRouter();
  const { refresh } = useUser();
  const [followClicked, setFollowClicked] = useState(false);
  const [armed, setArmed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onFollowClick = useCallback(() => {
    setFollowClicked(true);
    timerRef.current = setTimeout(() => setArmed(true), 8000);
  }, []);

  useEffect(() => {
    if (!followClicked) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') setArmed(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [followClicked]);

  const claim = useCallback(async () => {
    setClaiming(true);
    try {
      const res = await fetch('/api/linkedin-follow', { method: 'POST' });
      if (!res.ok) throw new Error('claim failed');
      toast.success('Unlocked! +1 case and +1 guesstimate added to your free bank.');
      await refresh();   // client user context picks up the claimed flag
      router.refresh();  // server components (lock overlay, gates) recompute
      onClaimed?.();
    } catch {
      toast.error("Couldn't unlock right now — please try again.");
    } finally {
      setClaiming(false);
    }
  }, [refresh, router, onClaimed]);

  return { followClicked, armed, claiming, onFollowClick, claim };
}

/** Shared buttons: step 1 follow link, step 2 claim. */
function FollowButtons({
  fc,
  compact = false,
}: {
  fc: ReturnType<typeof useFollowClaim>;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-2.5 ${compact ? '' : 'items-stretch'}`}>
      <a
        href={LINKEDIN_COMPANY_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={fc.onFollowClick}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0A66C2] px-5 py-2.5 text-body font-semibold text-white transition-colors hover:bg-[#004182]"
      >
        <Linkedin className="h-4 w-4" aria-hidden="true" />
        Follow MECE on LinkedIn
        <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
      </a>
      {fc.followClicked && (
        <button
          type="button"
          onClick={fc.claim}
          disabled={!fc.armed || fc.claiming}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-body font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {fc.claiming
            ? 'Unlocking…'
            : fc.armed
            ? "I've followed — unlock my bonus"
            : 'Come back after following…'}
        </button>
      )}
    </div>
  );
}

/**
 * Results-page popup. Renders nothing unless ALL of:
 * free tier, not yet claimed, this submission was a daily-counted attempt,
 * not opted out, not already shown today.
 */
export function LinkedInFollowPrompt({ wasDaily }: { wasDaily: boolean }) {
  const { user, isFree } = useUser();
  const [open, setOpen] = useState(false);
  const claimed = !!user?.linkedin_follow_claimed_at;
  const eligible = wasDaily && isFree && !claimed;
  const fc = useFollowClaim(() => setOpen(false));

  useEffect(() => {
    if (!eligible) return;
    try {
      if (localStorage.getItem(LS_OPT_OUT) === '1') return;
      if (localStorage.getItem(LS_LAST_SHOWN) === todayIst()) return;
    } catch {
      return; // storage unavailable → fail closed (no popup)
    }
    const t = setTimeout(() => {
      try {
        localStorage.setItem(LS_LAST_SHOWN, todayIst());
      } catch {}
      setOpen(true);
    }, 1200); // let the score paint first
    return () => clearTimeout(t);
  }, [eligible]);

  const optOut = () => {
    try {
      localStorage.setItem(LS_OPT_OUT, '1');
    } catch {}
    setOpen(false);
  };

  if (!eligible) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" aria-hidden="true" />
            Daily done. Want one more — free?
          </DialogTitle>
          <DialogDescription>
            Follow MECE on LinkedIn and we&apos;ll permanently add{' '}
            <strong className="text-foreground">+1 case and +1 guesstimate</strong> to your
            free bank. One follow, yours forever.
          </DialogDescription>
        </DialogHeader>
        <FollowButtons fc={fc} />
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-small text-muted-foreground transition-colors hover:text-foreground"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={optOut}
            className="text-small text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            Don&apos;t show again
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Lock-screen inline offer. Parent (/cases/[id] server page) already checks
 * reason === 'free-extra-used' and the claimed flag; the client-side guard
 * here is a second belt for stale renders.
 */
export function LinkedInFollowInline({ bucket }: { bucket: 'case' | 'guesstimate' }) {
  const { user, isFree } = useUser();
  const fc = useFollowClaim();
  if (!isFree || user?.linkedin_follow_claimed_at) return null;

  return (
    <div className="mt-5 border-t border-border pt-5 text-left">
      <p className="flex items-center gap-1.5 text-small font-semibold text-foreground">
        <Gift className="h-4 w-4 text-primary" aria-hidden="true" />
        Or unlock one more {bucket} — free
      </p>
      <p className="mb-3 mt-1 text-small text-muted-foreground">
        Follow MECE on LinkedIn → +1 case and +1 guesstimate added to your bank, permanently.
      </p>
      <FollowButtons fc={fc} compact />
    </div>
  );
}
