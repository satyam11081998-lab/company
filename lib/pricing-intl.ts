import type { SubscriptionTier } from '@/lib/types';
import type { Currency } from '@/lib/market';
import { isBillingPeriod, type BillingPeriod } from '@/lib/billing';

/**
 * INTERNATIONAL price list (US dollars / euros). Holds no rupee figures.
 *
 * The international UI (/us pages, the international /upgrade) imports prices
 * from HERE, never from lib/tier.ts — which also carries the India table — so
 * India pricing is not shipped in the JavaScript an international visitor
 * downloads. The server still has one source of truth: lib/tier.ts priceFor()
 * reads this same table for USD/EUR.
 */

/**
 * International price matrix (US + Europe), in WHOLE currency units.
 *
 * Owner decision 2026-09-25: the international entry point is Lite $29 and
 * Pro $49 a month. The 3-month prepay carries the same kind of discount India
 * gets (India saves ~17%): Lite $69 (≈$23/mo, save 21%) and Pro $119
 * (≈$39.67/mo, save 19%). Europe pays the same numbers in euros — the common
 * SaaS convention, and VAT-inclusive-friendly round prices.
 *
 * INR stays in TIER_PRICING above, untouched. Nothing India-facing reads this
 * table: priceFor() defaults to INR, so every pre-existing caller is unchanged.
 */
export const INTL_TIER_PRICING: Record<
  Exclude<Currency, 'INR'>,
  Record<Exclude<SubscriptionTier, 'free'>, Record<BillingPeriod, number>>
> = {
  USD: {
    lite: { monthly: 29, quarter: 69 },
    pro: { monthly: 49, quarter: 119 },
  },
  EUR: {
    lite: { monthly: 29, quarter: 69 },
    pro: { monthly: 49, quarter: 119 },
  },
};

export function isCurrency(v: unknown): v is Currency {
  return v === 'INR' || v === 'USD' || v === 'EUR';
}

/** Whole-unit price for an international tier + period. */
export function intlPriceFor(
  tier: Exclude<SubscriptionTier, 'free'>,
  period: BillingPeriod,
  currency: Exclude<Currency, 'INR'>,
): number {
  return INTL_TIER_PRICING[currency][tier][isBillingPeriod(period) ? period : 'monthly'];
}

/** Per-month equivalent, to the cent. */
export function intlPerMonthEquivalent(
  tier: Exclude<SubscriptionTier, 'free'>,
  period: BillingPeriod,
  currency: Exclude<Currency, 'INR'>,
): number {
  const months = period === 'quarter' ? 3 : 1;
  return Math.round((intlPriceFor(tier, period, currency) / months) * 100) / 100;
}

/** Whole-percent saving of a prepay period against paying monthly. */
export function intlPeriodSavingPct(
  tier: Exclude<SubscriptionTier, 'free'>,
  period: BillingPeriod,
  currency: Exclude<Currency, 'INR'>,
): number {
  const months = period === 'quarter' ? 3 : 1;
  const full = intlPriceFor(tier, 'monthly', currency) * months;
  const paid = intlPriceFor(tier, period, currency);
  return full > 0 ? Math.round((1 - paid / full) * 100) : 0;
}
