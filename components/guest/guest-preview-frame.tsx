import Link from 'next/link';

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
 * The starting actions live in <GuestPracticeActions/>, rendered above this by
 * app/(app)/dashboard/page.tsx with today's real case, guesstimate and news
 * ids — each going straight to /cases/<id>. This bar carries only the log-in
 * link, so a visitor is never asked to "start" twice to reach one case.
 *
 * Zero client JS: pure links.
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
      {/* The sample dashboard stays INERT in both modes.
          It is built from `buildGuestDashboardProps()` — synthetic submissions,
          `demo-case-N` ids, hero CTAs hard-coded to /practice. Making it
          clickable (as an earlier version of this file did) sends a visitor who
          taps anything on it to /practice or a case id that does not exist,
          which reads as the product being broken.
          The REAL actions live in <GuestPracticeActions/>, rendered above this
          by app/(app)/dashboard/page.tsx with today's actual case, guesstimate
          and news-brief ids. That block is fully interactive; this one is a
          picture of what the dashboard becomes. */}
      <div aria-hidden className="pointer-events-none select-none">{children}</div>

      <div
        className="sticky bottom-0 z-40 mt-2 px-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-primary/25 bg-card/95 p-4 shadow-2xl backdrop-blur-sm">
          {guestMode ? (
            /* No "Start practising" button here, deliberately.
               <GuestPracticeActions/> is rendered ABOVE this frame with today's
               real case, guesstimate and news ids, and each of those goes
               STRAIGHT to /cases/<id>. A second button here only refreshed this
               same page into the same dashboard, so the journey read
               landing -> dashboard -> "start" -> dashboard again -> pick a case.
               Two dashboards for one decision. The actions block is the single
               place to start from; this bar is now just the door for people who
               already have an account. */
            <Link
              href={loginHref}
              className="text-[13px] font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Already have an account? Log in
            </Link>
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
