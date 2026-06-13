import type { SubscriptionTier, UserRow } from '@/lib/types';

/**
 * Tier hierarchy. Higher number = more access.
 * Used for permission checks like `hasTier(user, 'lite')` which is true for lite OR pro.
 */
const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  lite: 1,
  pro: 2,
};

/**
 * Returns true if the user's current effective tier is AT LEAST the required tier.
 * Handles expired subscriptions — if expires_at is past, user falls back to 'free'.
 */
export function hasTier(user: UserRow | null, required: SubscriptionTier): boolean {
  if (!user) return required === 'free';
  const effective = effectiveTier(user);
  return TIER_LEVELS[effective] >= TIER_LEVELS[required];
}

/**
 * Computes the user's actual tier right now (taking expiry into account).
 * Use this anywhere you display tier or check permissions.
 */
export function effectiveTier(user: UserRow | null): SubscriptionTier {
  if (!user) return 'free';
  if (!user.subscription_tier || user.subscription_tier === 'free') return 'free';
  if (!user.subscription_expires_at) return user.subscription_tier;
  const expiresAt = new Date(user.subscription_expires_at);
  if (expiresAt.getTime() < Date.now()) return 'free';
  return user.subscription_tier;
}

/**
 * Per-tier limits. Centralized so we can tune later without touching feature code.
 */
export const TIER_LIMITS = {
  free: {
    maxReattempts: 0,         // free users can attempt each case once
    maxHintQuestions: 0,       // no hint chatbot
    maxBookmarks: 0,           // no bookmarking
    learnExamplesPerDomain: 2, // first 2 examples visible
    newsScope: 'all' as const,
    practiceQuestionsPerDay: 3,
    dailyExtraCases: 0,
    dailyExtraGuesstimates: 0,
    gdBriefs: false,
  },
  lite: {
    maxReattempts: Infinity,
    maxHintQuestions: 5,       // 5 canned Q&A per case
    maxBookmarks: 0,           // bookmarks/cheat-sheet are Pro-only (matches pricing page)
    learnExamplesPerDomain: 2,
    newsScope: 'mba-relevant' as const,
    practiceQuestionsPerDay: Infinity,
    dailyExtraCases: 2,
    dailyExtraGuesstimates: 2,
    gdBriefs: true,
  },
  pro: {
    maxReattempts: Infinity,
    maxHintQuestions: Infinity, // live chatbot
    maxBookmarks: Infinity,
    learnExamplesPerDomain: 2,
    newsScope: 'mba-relevant' as const,
    practiceQuestionsPerDay: Infinity,
    dailyExtraCases: Infinity,
    dailyExtraGuesstimates: Infinity,
    gdBriefs: true,
  },
} as const;

/**
 * Friendly labels for tier display.
 */
export const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  lite: 'Lite',
  pro: 'Pro',
};

/**
 * Billing periods. Monthly is the established baseline; quarter and annual are
 * prepay options that simply grant a longer access window (see BILLING_PERIOD_DAYS).
 */
export type BillingPeriod = 'monthly' | 'quarter' | 'annual';

export const BILLING_PERIODS: BillingPeriod[] = ['monthly', 'quarter', 'annual'];

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: 'Monthly',
  quarter: '3 months',
  annual: 'Annual',
};

/** Short suffix shown next to a price, e.g. "₹999 /yr". */
export const BILLING_PERIOD_SUFFIX: Record<BillingPeriod, string> = {
  monthly: '/mo',
  quarter: '/3 mo',
  annual: '/yr',
};

/** Access window granted per period — drives `subscription_expires_at`. */
export const BILLING_PERIOD_DAYS: Record<BillingPeriod, number> = {
  monthly: 30,
  quarter: 91,
  annual: 365,
};

/**
 * Full price matrix in INR. Monthly stays the long-standing ₹199 / ₹499; the
 * 3-month and annual columns are prepay prices (cheaper per month) that map to
 * a longer expiry window rather than to any new feature.
 */
export const TIER_PRICING: Record<Exclude<SubscriptionTier, 'free'>, Record<BillingPeriod, number>> = {
  lite: { monthly: 199, quarter: 499, annual: 999 },
  pro: { monthly: 499, quarter: 1299, annual: 2499 },
};

/**
 * Monthly tier prices in INR. Kept as the single-source default that existing
 * call sites import; derived from the matrix so there is one source of truth.
 */
export const TIER_PRICES: Record<Exclude<SubscriptionTier, 'free'>, number> = {
  lite: TIER_PRICING.lite.monthly,
  pro: TIER_PRICING.pro.monthly,
};

export function isBillingPeriod(v: unknown): v is BillingPeriod {
  return v === 'monthly' || v === 'quarter' || v === 'annual';
}

/** Price in INR for a tier + period. Unknown periods fall back to monthly. */
export function priceFor(
  tier: Exclude<SubscriptionTier, 'free'>,
  period: BillingPeriod = 'monthly',
): number {
  return TIER_PRICING[tier][isBillingPeriod(period) ? period : 'monthly'];
}

/** Access window (days) for a billing period. Unknown periods fall back to monthly. */
export function periodDays(period: BillingPeriod = 'monthly'): number {
  return BILLING_PERIOD_DAYS[isBillingPeriod(period) ? period : 'monthly'];
}

/** Effective per-month price (for "≈ ₹X/mo" subtext on prepay options). */
export function perMonthEquivalent(
  tier: Exclude<SubscriptionTier, 'free'>,
  period: BillingPeriod = 'monthly',
): number {
  const months = period === 'annual' ? 12 : period === 'quarter' ? 3 : 1;
  return Math.round(priceFor(tier, period) / months);
}
