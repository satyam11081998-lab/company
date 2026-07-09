'use client';

import type { CreditMonitorStatus } from '@/lib/ai-credit';

/**
 * Admin card showing today's AI credit usage vs daily budget,
 * with a visual progress bar and Telegram alert status.
 */
export function AiCreditMonitor({ status }: { status: CreditMonitorStatus }) {
  const pct = Math.min(status.usageRatio * 100, 100);
  const barColor = status.budgetExceeded
    ? 'bg-rose-500'
    : status.usageRatio > 0.75
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Daily credit monitor
        </h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            status.budgetExceeded
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${status.budgetExceeded ? 'bg-rose-500' : 'bg-emerald-500'}`}
          />
          {status.budgetExceeded ? 'Budget exceeded' : 'Within budget'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground tabular-nums">
            ${status.todaySpendUsd < 1 ? status.todaySpendUsd.toFixed(4) : status.todaySpendUsd.toFixed(2)}
          </span>{' '}
          / ${status.dailyBudgetUsd.toFixed(0)} budget
        </span>
        <span className="tabular-nums">{(status.usageRatio * 100).toFixed(1)}%</span>
      </div>

      {/* Telegram status */}
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className={`h-1.5 w-1.5 rounded-full ${status.telegramConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`}
        />
        Telegram alerts: {status.telegramConfigured ? 'configured' : 'not configured'}
      </div>
    </div>
  );
}
