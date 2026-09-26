/**
 * Billing periods — shared by the India and international price lists.
 * Currency-free on purpose (split out of lib/tier.ts, 2026-09-25) so the
 * international pricing UI can import it without the rupee table.
 * lib/tier.ts re-exports all of it; existing imports are unchanged.
 */

/**
 * Billing periods. Monthly is the established baseline; quarter and annual are
 * prepay options that simply grant a longer access window (see BILLING_PERIOD_DAYS).
 */
export type BillingPeriod = 'monthly' | 'quarter';

// Only monthly and a 3-month prepay are offered (annual was removed).
export const BILLING_PERIODS: BillingPeriod[] = ['monthly', 'quarter'];

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: 'Monthly',
  quarter: '3 months',
};

/** Short suffix shown next to a price, e.g. "₹999 /yr". */
export const BILLING_PERIOD_SUFFIX: Record<BillingPeriod, string> = {
  monthly: '/mo',
  quarter: '/3 mo',
};

/** Access window granted per period — drives `subscription_expires_at`. */
export const BILLING_PERIOD_DAYS: Record<BillingPeriod, number> = {
  monthly: 30,
  quarter: 91,
};

export function isBillingPeriod(v: unknown): v is BillingPeriod {
  return v === 'monthly' || v === 'quarter';
}

/** Access window (days) for a billing period. Unknown periods fall back to monthly. */
export function periodDays(period: BillingPeriod = 'monthly'): number {
  return BILLING_PERIOD_DAYS[isBillingPeriod(period) ? period : 'monthly'];
}
