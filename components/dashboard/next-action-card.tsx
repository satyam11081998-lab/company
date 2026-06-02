'use client';
// DELIVERABLE — the "Do this next" hero. One action, deep-linked. When the best move is a
// gated lever for a free user (e.g. re-attempt to fix a dimension), it flips into a
// contextual upgrade prompt — the dashboard's primary conversion seam.
import { ArrowRight, Lock, Target } from 'lucide-react';
import type { NextAction } from '@/lib/next-action';

export function NextActionCard({ action }: { action: NextAction }) {
  if (action.paywalled) {
    return (
      <div className="rounded-xl border border-primary/40 bg-accent p-6">
        <div className="flex items-center gap-2 text-accent-foreground">
          <Lock className="h-4 w-4" aria-hidden />
          <span className="text-label">DO THIS NEXT · PRO</span>
        </div>
        <p className="text-h3 mt-2 text-foreground">{action.label}</p>
        <p className="text-body text-muted-foreground mt-1">
          {action.reason} Re-attempts and targeted drills are a Pro lever — your weakest
          dimension improves most on the second pass.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/upgrade"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-strong text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            Unlock with Pro <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
          <a
            href={action.href}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-strong text-foreground hover:bg-muted transition-colors"
          >
            Try once free
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-primary">
        <Target className="h-4 w-4" aria-hidden />
        <span className="text-label">DO THIS NEXT</span>
      </div>
      <p className="text-h3 mt-2">{action.label}</p>
      <p className="text-body text-muted-foreground mt-1">{action.reason}</p>
      <a
        href={action.href}
        className="ambient-pulse mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-strong text-primary-foreground hover:bg-primary-hover transition-colors"
      >
        {action.cta} <ArrowRight className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}

export default NextActionCard;
