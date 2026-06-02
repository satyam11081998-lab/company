// DELIVERABLE v2 — monetization surface, now COMPACT. v1 rendered a big half-empty card for
// Pro users ("Unlimited practice" with oceans of space). Now: a one-line strip for paying
// users (low-key value reinforcement), and the full conversion card only for free users.
import { Infinity as InfinityIcon, Zap } from 'lucide-react';
import type { FreeQuota } from '@/lib/next-action';

export function FreeQuotaMeter({ quota }: { quota: FreeQuota }) {
  if (quota.unlimited) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3">
        <InfinityIcon className="h-4 w-4 text-success shrink-0" aria-hidden />
        <span className="text-small text-foreground">Unlimited practice</span>
        <span className="text-micro text-muted-foreground capitalize ml-auto">{quota.tier} plan</span>
      </div>
    );
  }

  const dots = Array.from({ length: quota.limit }, (_, i) => i < quota.used);
  const out = quota.remaining <= 0;
  return (
    <div className="rounded-xl border border-primary/40 bg-accent p-5">
      <div className="flex items-center gap-2 text-accent-foreground">
        <Zap className="h-4 w-4" aria-hidden />
        <span className="text-label">FREE PRACTICE TODAY</span>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        {dots.map((filled, i) => (
          <span key={i} className={filled ? 'h-2 flex-1 rounded-full bg-primary' : 'h-2 flex-1 rounded-full bg-muted'} />
        ))}
      </div>
      <p className="text-small text-foreground mt-3">
        {out
          ? "You've used today's free cases — resets midnight IST."
          : `${quota.remaining} of ${quota.limit} free cases left · resets midnight IST.`}
      </p>
      <a
        href="/upgrade"
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-strong text-primary-foreground hover:bg-primary-hover transition-colors"
      >
        Go unlimited — ₹199/mo
      </a>
    </div>
  );
}

export default FreeQuotaMeter;
