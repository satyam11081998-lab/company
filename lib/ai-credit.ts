/**
 * AI credit / balance monitor.
 *
 * Reads the `ai_usage_log` ledger (migration 0036) to compute today's spend
 * and compare it against the daily budget env var. Used by the admin
 * "AI usage" page to show a credit-monitor card with Telegram alert status.
 */

import { createServiceClient } from '@/lib/supabase/service';

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** UTC instant of the most recent IST midnight. */
function istMidnightUtc(): number {
  const istNow = new Date(Date.now() + IST_OFFSET_MS);
  const istMid = Date.UTC(
    istNow.getUTCFullYear(),
    istNow.getUTCMonth(),
    istNow.getUTCDate(),
    0,
    0,
    0,
  );
  return istMid - IST_OFFSET_MS;
}

export interface CreditMonitorStatus {
  /** Estimated spend so far today (IST). */
  todaySpendUsd: number;
  /** Daily budget from env (default $10). */
  dailyBudgetUsd: number;
  /** Fraction of budget used (0–1+). */
  usageRatio: number;
  /** Whether the kill-switch threshold has been crossed. */
  budgetExceeded: boolean;
  /** Whether a Telegram bot token is configured. */
  telegramConfigured: boolean;
}

export async function getCreditMonitorStatus(): Promise<CreditMonitorStatus> {
  const supabase = createServiceClient();
  const dailyBudgetUsd = Number(process.env.AI_DAILY_BUDGET_USD) || 10;
  const telegramConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

  const sinceIso = new Date(istMidnightUtc()).toISOString();

  // Sum today's estimated cost from the ledger.
  let todaySpendUsd = 0;
  const PAGE = 1000;
  for (let from = 0; from < 20_000; from += PAGE) {
    const { data, error } = await supabase
      .from('ai_usage_log')
      .select('est_cost_usd')
      .gte('created_at', sinceIso)
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    for (const row of data) {
      todaySpendUsd += row.est_cost_usd == null ? 0 : Number(row.est_cost_usd) || 0;
    }
    if (data.length < PAGE) break;
  }

  const usageRatio = dailyBudgetUsd > 0 ? todaySpendUsd / dailyBudgetUsd : 0;

  return {
    todaySpendUsd,
    dailyBudgetUsd,
    usageRatio,
    budgetExceeded: todaySpendUsd >= dailyBudgetUsd,
    telegramConfigured,
  };
}
