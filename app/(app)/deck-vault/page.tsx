import { redirect } from 'next/navigation';

/**
 * Deck Vault Rewards (case-competition discount) has been disconnected.
 *
 * The upload -> verify -> discount-coupon flow is no longer offered. The route
 * is kept as a permanent redirect to /upgrade so any old links, bookmarks, or
 * cached promo surfaces resolve somewhere sensible instead of 404-ing.
 *
 * The original submission UI lives in git history; the backend API, DB tables,
 * and already-issued coupons were intentionally left intact (reversible).
 */
export default function DeckVaultRewardsPage() {
  redirect('/upgrade');
}
