import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Wraps a "teaser" surface (dashboard, leaderboard) that a guest may SEE but not
 * use. The inner content is rendered fully — so it looks alive and intriguing —
 * but made inert (`pointer-events-none` + `aria-hidden`) so no link, button, or
 * personal action fires. A thin top banner sets expectations and a sticky
 * bottom bar keeps "sign in to continue" one tap away as the visitor scrolls.
 *
 * Mobile-first: the sticky bar is a full-width pill anchored above the safe
 * area; on wider screens it centers to a comfortable max width.
 *
 * Pure links / CSS — no client JS. Page scrolling is unaffected because the
 * inert subtree is transparent to pointer events (touch scroll still reaches
 * the document).
 */
export default function GuestPreviewFrame({
  children,
  title = 'Sign in to continue',
  message = 'This is a live demo. Sign in to make it yours — track real scores and progress.',
  next,
}: {
  children: React.ReactNode;
  title?: string;
  message?: string;
  next?: string;
}) {
  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : '/signup';
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login';

  return (
    <div className="relative">
      {/* Expectation-setting banner */}
      <div className="border-b border-primary/15 bg-primary/[0.06]">
        <div className="container flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 text-center text-[12.5px] text-foreground/80">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>
            You&apos;re exploring a <span className="font-semibold text-foreground">live demo</span>. Sign in to see your
            real data.
          </span>
        </div>
      </div>

      {/* Inert teaser content — visible, but nothing is clickable */}
      <div aria-hidden className="pointer-events-none select-none">
        {children}
      </div>

      {/* Sticky sign-in prompt, above the mobile bottom safe area */}
      <div
        className="sticky bottom-0 z-40 mt-2 px-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        <div className="mx-auto flex max-w-xl flex-col items-center gap-2.5 rounded-2xl border border-primary/25 bg-card/95 p-3.5 shadow-2xl backdrop-blur-sm sm:flex-row sm:justify-between sm:gap-4 sm:p-4">
          <div className="text-center sm:text-left">
            <p className="text-[14px] font-semibold text-foreground">{title}</p>
            <p className="text-[12px] text-muted-foreground">{message}</p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Link
              href={loginHref}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted sm:flex-none"
            >
              Log in
            </Link>
            <Link
              href={signupHref}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover sm:flex-none"
            >
              Sign up <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
