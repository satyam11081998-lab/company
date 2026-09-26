import type { SubscriptionTier, UserRow } from '@/lib/types';

/**
 * Tier identity only — who is on which plan, right now. NO PRICES live here.
 *
 * Split out of lib/tier.ts (2026-09-25) so client code that only needs to know
 * a user's tier (the app shell's user context, badges, gates) does not pull
 * the rupee price table into every page's JavaScript — including the pages an
 * international (US / Europe) account sees. lib/tier.ts re-exports everything
 * here, so existing `from '@/lib/tier'` imports are unchanged.
 */

/**
 * Minimal row shape for computing the effective tier: any object carrying
 * the two subscription columns. Lets narrow DB selects (admin lists, quota
 * routes) be passed without casting to the full UserRow -- the body only
 * ever reads these two fields, and UserRow satisfies this shape, so every
 * existing caller is unaffected.
 */
type TierBearingRow = Partial<Pick<UserRow, 'subscription_tier' | 'subscription_expires_at'>>;

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
export function hasTier(user: TierBearingRow | null, required: SubscriptionTier): boolean {
  if (!user) return required === 'free';
  const effective = effectiveTier(user);
  return TIER_LEVELS[effective] >= TIER_LEVELS[required];
}

/**
 * Computes the user's actual tier right now (taking expiry into account).
 * Use this anywhere you display tier or check permissions.
 */
export function effectiveTier(user: TierBearingRow | null): SubscriptionTier {
  if (!user) return 'free';
  if (!user.subscription_tier || user.subscription_tier === 'free') return 'free';
  if (!user.subscription_expires_at) return user.subscription_tier;
  const expiresAt = new Date(user.subscription_expires_at);
  if (expiresAt.getTime() < Date.now()) return 'free';
  return user.subscription_tier;
}

/**
 * Friendly labels for tier display.
 */
export const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  lite: 'Lite',
  pro: 'Pro',
};
