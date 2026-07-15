import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';

function withNext(base: '/signup' | '/login', next?: string) {
  if (!next) return base;
  return `${base}?next=${encodeURIComponent(next)}`;
}

/**
 * The single sign-in wall shown whenever a guest hits a gated action ("Start",
 * "Submit", personal data, …). Offers BOTH paths — Sign up (primary) and Log in
 * (secondary) — per product decision. `next` returns the visitor to exactly
 * where they were after authenticating (login/signup pages already read it).
 *
 * Not a client component: it's pure links, so it works inside server components
 * and adds no JS.
 */
export default function SignInWall({
  title = 'Sign in to continue',
  message = 'Create an account to start solving, track your score, and climb the leaderboard.',
  next,
  className = '',
  compact = false,
}: {
  title?: string;
  message?: string;
  next?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-sm rounded-xl border border-primary/20 bg-card text-center shadow-xl ${
        compact ? 'p-5' : 'p-6 sm:p-8'
      } ${className}`}
    >
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
        <Lock className="h-5 w-5 text-primary" />
      </div>
      <h2 className={`font-bold text-foreground ${compact ? 'text-base' : 'text-lg sm:text-xl'}`}>{title}</h2>
      <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">{message}</p>
      <div className="mt-5 flex flex-col gap-2.5">
        <Link
          href={withNext('/signup', next)}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
        >
          Sign up <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={withNext('/login', next)}
          className="inline-flex w-full items-center justify-center rounded-full border border-border px-5 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted"
        >
          Log in
        </Link>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground/70">No credit card required</p>
    </div>
  );
}

/**
 * Small inline "locked" chip — used to mark a control/section that needs an
 * account (e.g. next to a disabled Submit). Keeps the lock language consistent.
 */
export function LockBadge({ label = 'Sign in', className = '' }: { label?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${className}`}
    >
      <Lock className="h-3 w-3" />
      {label}
    </span>
  );
}
