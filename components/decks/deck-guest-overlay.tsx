'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Trophy, X } from 'lucide-react';

/**
 * Login / sign-up overlay for LOGGED-OUT visitors on a public deck page.
 *
 * The 404 fix (migration 0049) is what lets a stranger from Google actually SEE
 * the deck. This is the first thing they meet on it: the free preview and the
 * summary stay readable behind a soft backdrop, with one card inviting them to
 * create an account.
 *
 * DELIBERATELY DISMISSIBLE. The owner's rule is "they should still see it, but
 * ask them to log in or sign up first — and if they don't, let them keep
 * browsing as an anonymous visitor." A hard gate would contradict the entire
 * reason these pages are public and indexable. Dismissal is remembered for the
 * browser session so moving between decks doesn't re-nag.
 *
 * Renders NOTHING for anyone who already has a session (real OR anonymous) —
 * they are already past the ask — and NOTHING on the server, so crawlers get
 * the full free preview + summary in the HTML with no overlay (not cloaking).
 *
 * Every auth link carries `?next=/decks/<slug>` so login/sign-up returns the
 * visitor to this exact deck.
 */

const DISMISS_KEY = 'mece:deck-guest-overlay-dismissed';

export default function DeckGuestOverlay({
  slug,
  competition,
}: {
  slug: string;
  competition?: string;
}) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let cancelled = false;

    // Dismissed earlier this session? Never nag again.
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
    } catch {
      /* sessionStorage can throw in privacy mode — fall through and just ask */
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      // Only ask the truly logged-out. A real or anonymous session is past this.
      if (!user) setShow(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Escape closes the overlay (same as the backdrop / "keep reading").
  useEffect(() => {
    if (!show) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show]);

  const next = `/decks/${slug}`;

  function dismiss() {
    setShow(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  if (!mounted || !show) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-end justify-center p-4 sm:items-center">
      {/* Soft backdrop — the deck stays visible behind it, which is the point:
          show the thing, then ask. Clicking it dismisses (keep reading). */}
      <button
        type="button"
        aria-label="Keep reading the preview"
        onClick={dismiss}
        className="absolute inset-0 bg-background/70 backdrop-blur-[3px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deck-guest-overlay-title"
        className="animate-fade-in relative z-10 w-full max-w-sm rounded-2xl border border-primary/25 bg-card p-6 text-center shadow-2xl"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <h2 id="deck-guest-overlay-title" className="text-lg font-bold text-foreground">See this winning deck in full</h2>
        <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
          Log in or create a free account to unlock more slides
          {competition ? ` from ${competition}` : ''} and every other winning deck in the Vault.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Sign up free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="inline-flex w-full items-center justify-center rounded-full border border-border px-5 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            Log in
          </Link>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="mt-4 inline-block text-[12px] font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Keep reading the preview
        </button>
      </div>
    </div>,
    document.body,
  );
}
