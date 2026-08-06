import type { SupabaseClient } from '@supabase/supabase-js';
import { couponCoversTier, commissionPaise, type BillingPeriod } from '@/lib/tier';

/**
 * Coupon resolution — the ONE place that decides whether a code is usable.
 *
 * Contract C7 (v2). There are two shapes of coupon and they share this file so
 * /api/coupons/validate, /api/razorpay/order, /api/razorpay/verify and the
 * webhook can never drift apart:
 *
 *   user_id NOT NULL → USER-LOCKED, single use. Deck Vault Rewards. Behaviour
 *                      is byte-for-byte what shipped in C7 v1: only the owner
 *                      can use it, redeeming flips status to 'redeemed'.
 *   user_id NULL     → PUBLIC / influencer. Anyone signed in can use it,
 *                      capped by max_redemptions (NULL = unlimited).
 *                      Redeeming increments redemption_count; status stays
 *                      'active' until an admin revokes it or it expires.
 *
 * `commission_pct` is what the coupon OWNER earns on each sale. It is written
 * to coupon_redemptions (service-role only, RLS-deny for everyone) and must
 * never be returned to a buyer-facing endpoint.
 */

export interface CouponRow {
  id: string;
  code: string;
  user_id: string | null;
  discount_pct: number;
  tier_scope: string;
  source: string;
  status: string;
  expires_at: string;
  commission_pct: number | null;
  max_redemptions: number | null;
  redemption_count: number | null;
  owner_name: string | null;
  redeemed_payment_id: string | null;
}

const COUPON_COLUMNS =
  'id, code, user_id, discount_pct, tier_scope, source, status, expires_at, ' +
  'commission_pct, max_redemptions, redemption_count, owner_name, redeemed_payment_id';

/** Codes are stored and compared upper-case; this is the only accepted shape. */
export function normalizeCode(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toUpperCase() : '';
}

export function isValidCodeShape(code: string): boolean {
  return /^[A-Z0-9-]{4,32}$/.test(code);
}

/** Load a coupon by code with the SERVICE-ROLE client. Never call with a session client. */
export async function loadCoupon(
  svc: SupabaseClient,
  code: string,
): Promise<CouponRow | null> {
  const { data } = await svc
    .from('discount_coupons')
    .select(COUPON_COLUMNS)
    .eq('code', code)
    .maybeSingle();
  return (data as CouponRow | null) ?? null;
}

export function isPublicCoupon(c: CouponRow): boolean {
  return c.user_id === null;
}

export type CouponCheck =
  | { ok: true; coupon: CouponRow }
  | { ok: false; reason: string };

/**
 * Can `userId` redeem this coupon for `tier` right now?
 *
 * Deliberately returns the SAME message for "no such code" and "not your
 * code", so a user-locked coupon cannot be discovered by brute force. Public
 * codes are meant to be shared, so their failures are specific and helpful.
 */
export function checkCoupon(
  c: CouponRow | null,
  userId: string,
  tier: 'lite' | 'pro',
  opts: { atOrderTime: boolean } = { atOrderTime: true },
): CouponCheck {
  if (!c) return { ok: false, reason: 'Invalid coupon code.' };

  // User-locked: ownership is a hard gate and leaks nothing on failure.
  if (c.user_id !== null && c.user_id !== userId) {
    return { ok: false, reason: 'Invalid coupon code.' };
  }

  if (c.status === 'redeemed') {
    // A public code reaches 'redeemed' by hitting its cap, not by one person
    // using it — say the true thing rather than accusing them of reusing it.
    return {
      ok: false,
      reason: isPublicCoupon(c)
        ? 'This coupon has reached its limit.'
        : 'This coupon has already been used.',
    };
  }
  if (c.status === 'revoked') {
    return { ok: false, reason: 'This coupon is no longer valid.' };
  }
  if (c.status !== 'active') {
    return { ok: false, reason: 'This coupon has expired.' };
  }
  if (opts.atOrderTime && new Date(c.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: 'This coupon has expired.' };
  }
  if (!couponCoversTier(c.tier_scope, tier)) {
    return {
      ok: false,
      reason: `This coupon applies to the ${c.tier_scope.toUpperCase()} plan.`,
    };
  }
  if (
    c.max_redemptions !== null &&
    (c.redemption_count ?? 0) >= c.max_redemptions
  ) {
    return { ok: false, reason: 'This coupon has reached its limit.' };
  }

  return { ok: true, coupon: c };
}

/**
 * Burn a coupon after a confirmed payment, and write the commission ledger.
 *
 * Idempotent by construction:
 *  - the ledger has a UNIQUE index on razorpay_payment_id, so /verify and the
 *    webhook racing on the same payment insert once and the loser no-ops;
 *  - user-locked burns are guarded with .eq('status','active');
 *  - the public counter is RECOUNTED from the ledger rather than incremented,
 *    so neither a retry nor two concurrent redemptions can drift it.
 *
 * Never throws — a bookkeeping failure must not fail a payment that already
 * succeeded. Failures are logged for reconciliation.
 */
export async function redeemCoupon(
  svc: SupabaseClient,
  coupon: CouponRow,
  args: {
    userId: string;
    tier: 'lite' | 'pro';
    period: BillingPeriod;
    listPricePaise: number;
    paidPaise: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
  },
): Promise<void> {
  const pct = Number(coupon.commission_pct ?? 0);
  const commission = commissionPaise(args.tier, args.period, pct);

  try {
    const { data: inserted, error } = await svc
      .from('coupon_redemptions')
      .insert({
        coupon_id: coupon.id,
        code: coupon.code,
        user_id: args.userId,
        razorpay_order_id: args.razorpayOrderId,
        razorpay_payment_id: args.razorpayPaymentId,
        tier: args.tier,
        period: args.period,
        list_price_paise: args.listPricePaise,
        paid_paise: args.paidPaise,
        discount_paise: Math.max(0, args.listPricePaise - args.paidPaise),
        commission_pct: pct,
        commission_paise: commission,
      })
      .select('id');

    // Duplicate payment id → the other handler already booked this sale.
    if (error) {
      if (error.code !== '23505') {
        console.error('[coupons] ledger insert failed:', error);
      }
      return;
    }
    if (!inserted || inserted.length === 0) return;

    if (isPublicCoupon(coupon)) {
      // Public code: refresh the counter FROM THE LEDGER, never
      // `loadedValue + 1`. Two concurrent redemptions both read the same
      // stale row, so an increment would lose one update and let a capped
      // code over-redeem. Counting the ledger (which the unique payment id
      // already made exact) is the only value that cannot drift.
      const { count } = await svc
        .from('coupon_redemptions')
        .select('id', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id);
      const used = count ?? (coupon.redemption_count ?? 0) + 1;
      const patch: Record<string, unknown> = { redemption_count: used };
      if (coupon.max_redemptions !== null && used >= coupon.max_redemptions) {
        patch.status = 'redeemed';
      }
      await svc.from('discount_coupons').update(patch).eq('id', coupon.id);
    } else if (coupon.status === 'active') {
      // User-locked code: single use, exactly as in C7 v1.
      await svc
        .from('discount_coupons')
        .update({
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
          redeemed_payment_id: args.razorpayPaymentId,
        })
        .eq('id', coupon.id)
        .eq('status', 'active');
    }
  } catch (e) {
    console.error('[coupons] redeem failed:', e);
  }
}

/**
 * Re-validation at payment time. Looser than order time on purpose: the user
 * already paid the discounted amount in good faith, so an expiry that elapsed
 * between order creation and capture must not void their payment.
 */
export function couponHonouredAtPayment(
  c: CouponRow | null,
  userId: string,
  paymentId: string,
): boolean {
  if (!c) return false;
  if (c.user_id !== null && c.user_id !== userId) return false;
  return (
    c.status === 'active' ||
    // Expired AFTER the order was created — the buyer already paid the
    // discounted amount in good faith, so the order still stands.
    c.status === 'expired' ||
    (c.status === 'redeemed' &&
      // Idempotent retry of the same payment, or a public code that hit its
      // cap between order creation and capture.
      (c.redeemed_payment_id === paymentId || isPublicCoupon(c)))
  );
}
