import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deck Vault pricing — the single source of truth for what these products cost.
 * Amounts are computed server-side from these constants and never trusted from
 * the client (mirrors the tier-price rule in lib/tier.ts).
 */
export const DECK_SINGLE_PRICE_INR = 99; // unlock one deck
export const DECK_VAULT_PRICE_INR = 499; // unlock the whole vault

/**
 * Does `userId` have full (locked-page) access to deck `skeletonId`?
 *
 * True for: an admin, an unexpired Pro subscription, a whole-vault unlock
 * (public.skeleton_access), or a single-deck purchase (public.deck_purchases)
 * for this skeleton.
 *
 * Works with EITHER the RLS-scoped session client (which can only read the
 * caller's own rows — exactly what we want) or the service client. Fails CLOSED:
 * any error returns false, so a locked slide is only ever released to a verified
 * entitled viewer.
 */
export async function hasDeckAccess(
  db: SupabaseClient,
  userId: string,
  skeletonId: string | null,
): Promise<boolean> {
  try {
    const { data: u } = await db
      .from('users')
      .select('is_admin, subscription_tier, subscription_expires_at')
      .eq('id', userId)
      .maybeSingle();
    if (u?.is_admin === true) return true;
    if (
      u?.subscription_tier === 'pro' &&
      (!u.subscription_expires_at || new Date(u.subscription_expires_at) > new Date())
    ) {
      return true;
    }

    // Whole-vault one-time unlock (₹499).
    const { data: vault } = await db
      .from('skeleton_access')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (vault) return true;

    // Single-deck purchase (₹99).
    if (skeletonId) {
      const { data: single } = await db
        .from('deck_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('skeleton_id', skeletonId)
        .maybeSingle();
      if (single) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Whole-vault-or-better access (admin / active Pro / vault unlock). No deck id. */
export async function hasVaultAccess(db: SupabaseClient, userId: string): Promise<boolean> {
  return hasDeckAccess(db, userId, null);
}
