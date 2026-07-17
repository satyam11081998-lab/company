'use server';

/**
 * Deck Vault Rewards — admin review actions.
 *
 * approveDeckSubmission: marks the submission approved and mints the user's
 *   single-use coupon (MECE-DECK-XXXXXX, 30-day expiry, Pro scope). The %
 *   defaults to the matrix (corporate 60 / bschool 40) but the admin can
 *   override per case from the review UI.
 * rejectDeckSubmission: marks it rejected with a note shown to the user
 *   (resubmission is allowed).
 *
 * All writes run on the service client AFTER an is_admin check on the session.
 */

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { UserRow } from '@/lib/types';

const COUPON_VALID_DAYS = 30;

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!(userData as Partial<UserRow>)?.is_admin) {
    throw new Error('Forbidden: Admins only');
  }
}

/** Unambiguous alphabet (no 0/O/1/I/L) so codes survive being read out loud. */
function generateCouponCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += alphabet[bytes[i] % alphabet.length];
  return `MECE-DECK-${suffix}`;
}

export async function approveDeckSubmission(
  submissionId: string,
  discountPct: number,
): Promise<{ success: boolean; couponCode?: string; error?: string }> {
  try {
    await requireAdmin();

    const pct = Math.round(Number(discountPct));
    if (!Number.isFinite(pct) || pct < 1 || pct > 90) {
      return { success: false, error: 'Discount must be between 1 and 90 percent' };
    }

    const svc = createServiceClient();
    const { data: sub } = await svc
      .from('deck_submissions')
      .select('id, user_id, status')
      .eq('id', submissionId)
      .maybeSingle();
    const s = sub as { id: string; user_id: string; status: string } | null;
    if (!s) return { success: false, error: 'Submission not found' };
    if (s.status !== 'pending') return { success: false, error: `Already ${s.status}` };

    // Mint the coupon first (unique partial index enforces one live deck-vault
    // coupon per user — a conflict means they somehow already have one).
    const code = generateCouponCode();
    const expiresAt = new Date(Date.now() + COUPON_VALID_DAYS * 24 * 60 * 60 * 1000);
    const { data: coupon, error: couponError } = await svc
      .from('discount_coupons')
      .insert({
        code,
        user_id: s.user_id,
        discount_pct: pct,
        tier_scope: 'pro',
        source: 'deck_vault',
        submission_id: s.id,
        status: 'active',
        expires_at: expiresAt.toISOString(),
      })
      .select('id')
      .single();
    if (couponError || !coupon) {
      return {
        success: false,
        error: couponError?.message?.includes('discount_coupons_one_active')
          ? 'This user already has an active deck-vault coupon'
          : couponError?.message || 'Could not create the coupon',
      };
    }

    const { error: subError } = await svc
      .from('deck_submissions')
      .update({
        status: 'approved',
        discount_pct: pct,
        coupon_id: (coupon as { id: string }).id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', s.id)
      .eq('status', 'pending'); // race-safe vs a double-click / second tab
    if (subError) return { success: false, error: subError.message };

    revalidatePath('/admin/deck-vault');
    return { success: true, couponCode: code };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function rejectDeckSubmission(
  submissionId: string,
  note: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const svc = createServiceClient();
    const { error } = await svc
      .from('deck_submissions')
      .update({
        status: 'rejected',
        admin_note: (note || '').trim().slice(0, 500),
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .eq('status', 'pending');
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/deck-vault');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
