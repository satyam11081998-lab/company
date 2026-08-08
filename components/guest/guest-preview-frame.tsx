import Link from 'next/link';
import GuestStartButton from '@/components/guest/guest-start-button';

/**
 * Cold-start wrapper for a guest-viewable surface (currently /dashboard).
 *
 * REWRITTEN for guest mode (0045). The previous version made the whole subtree
 * inert (`pointer-events-none` + `aria-hidden`), stamped a "You're exploring a
 * live demo" banner on top and pinned a sticky "Sign in to continue" bar to the
 * bottom. All three are gone, on an explicit product decision: the surface must
 * not read as a demo, and must not nag for a login before the visitor has been
 * given anything. Under anonymous auth there is nothing to fake and nothing to
 * gate — one click and this becomes their real dashboard.
 *
 * What remains is a single primary action. `GuestStartButton` mints the
 * anonymous session on CLICK (never on mount, so crawlers never trigger it) and
 * refreshes in place; the server components then re-run with the session and
 * render live data. When `NEXT_PUBLIC_GUEST_MODE` is off the button renders
 * null and only the log-in link remains — rollback is an env flip, not a
 * deploy.
 *
 * Still zero client JS beyond the button itself.
 */
export default function GuestPreviewFrame({
  children,
  next,
}: {
  children: React.ReactNode;
  next?: string;
}) {
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login';
  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : '/signup';
  // NEXT_PUBLIC_* is inlined at build time and readable in a server component.
  const guestMode = process.env.NEXT_PUBLIC_GUEST_MODE === 'true';

  return (
    <div className="relative">
      {/* With guest mode OFF this must behave exactly as it did before the
          rewrite — inert content behind a sign-in prompt. Rollback has to
          restore the old experience, not leave a half-migrated surface whose
          only call to action is "log in". */}
      {guestMode ? children : <div aria-hidden className="pointer-events-none select-none">{children}</div>}

      <div
        className="sticky bottom-0 z-40 mt-2 px-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-primary/25 bg-card/95 p-4 shadow-2xl backdrop-blur-sm">
          {guestMode ? (
            <>
              <p className="text-center text-[14px] font-semibold text-foreground">
                Today&apos;s case and guesstimate are open
              </p>
              <p className="-mt-1 text-center text-[12px] text-muted-foreground">
                Solve them right now. Nothing to fill in.
              </p>
              {/* Label is "Start practising", not "Start today's case": this
                  button refreshes THIS page into the live dashboard, it does not
                  navigate to the case. Promising a case and delivering a
                  dashboard is the kind of small dishonesty that costs the next
                  click. */}
              <GuestStartButton label="Start practising" />
              <Link
                href={loginHref}
                className="text-[12px] font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Already have an account? Log in
              </Link>
            </>
          ) : (
            <>
              <p className="text-center text-[14px] font-semibold text-foreground">
                Sign in to unlock your dashboard
              </p>
              <p className="-mt-1 text-center text-[12px] text-muted-foreground">
                Track your real readiness, streak, and rank across India.
              </p>
              <div className="flex w-full items-center gap-2">
                <Link
                  href={loginHref}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Log in
                </Link>
                <Link
                  href={signupHref}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
                >
                  Sign up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
