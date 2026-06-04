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
    maxBookmarks: 50,
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
 * Tier prices in INR.
 */
export const TIER_PRICES: Record<Exclude<SubscriptionTier, 'free'>, number> = {
  lite: 199,
  pro: 499,
};
