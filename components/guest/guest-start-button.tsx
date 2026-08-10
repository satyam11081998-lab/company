'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { ensureGuestSession, isGuestModeEnabled } from '@/lib/guest';

/**
 * The ONLY place an anonymous session is ever created.
 *
 * Guest mode deliberately mints the anonymous auth row on an explicit CLICK —
 * never from a `useEffect` on mount. That single decision buys three things
 * that a mount-effect cannot:
 *
 *  1. CRAWLER SAFETY. Googlebot renders JavaScript and carries no cookie, so a
 *     mount-effect would fire for every crawl of every page: Googlebot,
 *     Bingbot, AhrefsBot, SemrushBot and GPTBot would each mint a fresh
 *     `auth.users` row on every pass, and the rendered DOM Google indexes
 *     would be a post-sign-in view rather than the marketing page. Bots do not
 *     click, so none of that happens here.
 *  2. COST. Anonymous rows are real rows and the routes behind them cost real
 *     money per call. Only intentful humans create one.
 *  3. HONESTY. Nobody gets an invisible account created merely for reading a
 *     page.
 *
 * After the session exists we `router.refresh()` rather than navigate: the
 * server components on this route re-run WITH the new cookie and render the
 * real solve workspace in place. No redirect, no flash, URL unchanged.
 */
export default function GuestStartButton({
  label = 'Start solving',
  className = '',
  fullWidth = true,
}: {
  label?: string;
  className?: string;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feature flag off → render nothing, so the caller's existing sign-in wall
  // remains the only path. Rollback is a env var flip, not a deploy.
  if (!isGuestModeEnabled()) return null;

  const busy = working || pending;

  async function onClick() {
    setError(null);
    setWorking(true);
    try {
      const user = await ensureGuestSession();
      if (!user) {
        // Guest mode flag is off — not an error, just nothing to do here.
        setError('Guest practice is not available right now. Please sign up instead.');
        return;
      }
      startTransition(() => router.refresh());
    } catch (err) {
      // ensureGuestSession throws a diagnosable message for the three
      // configuration failures (anonymous sign-ins off, migration 0045 not
      // run, CAPTCHA on without a site key). Surface it rather than replacing
      // it with a generic string that sends the next person code-hunting for a
      // dashboard setting.
      setError(err instanceof Error ? err.message : 'Could not start a practice session.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className={fullWidth ? 'w-full' : undefined}>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={`inline-flex ${
          fullWidth ? 'w-full' : ''
        } items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-70 ${className}`}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Setting up…
          </>
        ) : (
          <>
            {label} <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/80">
        No sign-up needed. Your work saves when you create an account.
      </p>
      {error && <p className="mt-2 text-center text-[12px] text-destructive">{error}</p>}
    </div>
  );
}
