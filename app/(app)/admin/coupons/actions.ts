'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { UserRow } from '@/lib/types';

/**
 * Admin actions for PUBLIC (influencer) coupons.
 *
 * Deliberately scoped: these only ever create or mutate rows with
 * `user_id IS NULL`. User-locked Deck Vault Rewards coupons are minted and
 * burned by the Deck Rewards flow and are not editable from here — mixing the
 * two would let an admin accidentally void a coupon someone earned.
 */

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!(data as Partial<UserRow>)?.is_admin) throw new Error('Forbidden');
}

type Result<T = undefined> = { success: boolean; error?: string; data?: T };

function revalidate() {
  revalidatePath('/admin/coupons');
}

/**
 * Not exported: this file carries 'use server', where every export becomes a
 * server action. The client passes a matching object literal instead.
 */
interface CouponInput {
  code: string;
  discountPct: number;
  commissionPct: number;
  tierScope: 'any' | 'lite' | 'pro';
  ownerName: string;
  ownerHandle?: string;
  ownerContact?: string;
  maxRedemptions: number | null;
  validDays: number;
  note?: string;
}

export async function createInfluencerCoupon(input: CouponInput): Promise<Result<{ code: string }>> {
  try {
    await requireAdmin();

    const code = (input.code || '').trim().toUpperCase();
    if (!/^[A-Z0-9-]{4,32}$/.test(code)) {
      return { success: false, error: 'Code must be 4-32 characters: A-Z, 0-9 or hyphen.' };
    }
    const discount = Math.round(Number(input.discountPct));
    const commission = Math.round(Number(input.commissionPct) * 100) / 100;
    if (!Number.isFinite(discount) || discount < 1 || discount > 90) {
      return { success: false, error: 'Discount must be between 1% and 90%.' };
    }
    if (!Number.isFinite(commission) || commission < 0 || commission > 50) {
      return { success: false, error: 'Commission must be between 0% and 50%.' };
    }
    if (!['any', 'lite', 'pro'].includes(input.tierScope)) {
      return { success: false, error: 'Invalid plan scope.' };
    }
    if (!input.ownerName?.trim()) {
      return { success: false, error: 'Who is this code for? Enter an owner name.' };
    }
    const days = Math.round(Number(input.validDays));
    if (!Number.isFinite(days) || days < 1 || days > 1095) {
      return { success: false, error: 'Validity must be between 1 and 1095 days.' };
    }
    const cap =
      input.maxRedemptions === null || input.maxRedemptions === undefined
        ? null
        : Math.round(Number(input.maxRedemptions));
    if (cap !== null && (!Number.isFinite(cap) || cap < 1)) {
      return { success: false, error: 'Redemption cap must be a positive number, or blank for unlimited.' };
    }

    const svc = createServiceClient();

    const { data: clash } = await svc
      .from('discount_coupons').select('id').eq('code', code).maybeSingle();
    if (clash) return { success: false, error: `${code} already exists.` };

    const { error } = await svc.from('discount_coupons').insert({
      code,
      user_id: null,               // public code — anyone signed in can use it
      discount_pct: discount,
      tier_scope: input.tierScope,
      source: 'influencer',
      status: 'active',
      expires_at: new Date(Date.now() + days * 86_400_000).toISOString(),
      owner_name: input.ownerName.trim(),
      owner_handle: input.ownerHandle?.trim() || null,
      owner_contact: input.ownerContact?.trim() || null,
      commission_pct: commission,
      max_redemptions: cap,
      redemption_count: 0,
      admin_note: input.note?.trim() || '',
    });
    if (error) return { success: false, error: error.message };

    revalidate();
    return { success: true, data: { code } };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to create coupon.' };
  }
}

/** Revoke (or restore) a public code. Never touches user-locked coupons. */
export async function setCouponStatus(
  id: string,
  status: 'active' | 'revoked',
): Promise<Result> {
  try {
    await requireAdmin();
    const svc = createServiceClient();
    const { data, error } = await svc
      .from('discount_coupons')
      .update({ status })
      .eq('id', id)
      .is('user_id', null)
      .select('id');
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) {
      return { success: false, error: 'Not a public coupon (or already gone).' };
    }
    revalidate();
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to update coupon.' };
  }
}

/**
 * Mark every pending redemption on a code as paid out. Records the moment so
 * the next payout run only picks up what has accrued since.
 */
export async function markCommissionPaid(couponId: string): Promise<Result<{ count: number }>> {
  try {
    await requireAdmin();
    const svc = createServiceClient();
    const { data, error } = await svc
      .from('coupon_redemptions')
      .update({ payout_status: 'paid', paid_out_at: new Date().toISOString() })
      .eq('coupon_id', couponId)
      .eq('payout_status', 'pending')
      .select('id');
    if (error) return { success: false, error: error.message };
    revalidate();
    return { success: true, data: { count: data?.length ?? 0 } };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to record payout.' };
  }
}
