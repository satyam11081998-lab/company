import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';

/**
 * "Log in to continue" — the guest overlay for browse surfaces (/practice).
 *
 * Deliberately NOT a redirect. A guest who opens the practice library sees the
 * real questions behind a blur, with a solid card over them. Showing the thing
 * they cannot have yet is a far better argument for an account than bouncing
 * them somewhere else, which teaches them nothing about what they are missing.
 *
 * This is presentation only. `lib/access.ts` and `services/access_guard.py`
 * remain the boundary — a guest still cannot attempt anything beyond today's
 * daily pair even if they defeat this with devtools, which they are welcome to
 * try.
 *
 * Usage: wrap the browse content. The children are blurred and made inert; the
 * card floats above. `sticky` rather than `fixed` so the card follows the
 * viewport without collapsing page height.
 */
export default function LoginToContinueOverlay({
  children,
  title = 'Log in to continue',
  message = 'Today’s case and guesstimate are free without an account. The full library — every case, every guesstimate — opens when you sign up.',
  next = '/practice',
}: {
  children: React.ReactNode;
  title?: string;
  message?: string;
  next?: string;
}) {
  return (
    <div className="relative">
      {/* The real content, readable but plainly out of reach. `select-none` and
          `pointer-events-none` stop a guest interacting with cards that would
          only refuse them one screen later. */}
      <div
        aria-hidden
        className="pointer-events-none select-none blur-[5px] opacity-60 saturate-50"
      >
        {children}
      </div>

      {/* Solid card, centred, following the scroll. */}
      <div className="pointer-events-none absolute inset-0">
        <div className="sticky top-1/3 mx-auto w-full max-w-sm px-4">
          <div className="pointer-events-auto rounded-2xl border border-primary/25 bg-card p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">{message}</p>

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

            <Link
              href="/dashboard"
              className="mt-4 inline-block text-[12px] font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Or practise today’s free case
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
