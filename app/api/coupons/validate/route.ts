import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { loadCoupon, checkCoupon, normalizeCode, isValidCodeShape } from '@/lib/coupons';

/**
 * POST /api/coupons/validate — { code, tier? } -> { valid, pct, tierScope, code }
 *                                              | { valid: false, reason }.
 *
 * Display-time check only: the /upgrade page calls it so the user sees the
 * discounted price BEFORE Razorpay opens. It grants nothing — order creation
 * re-validates from scratch and verify/webhook re-validate again.
 *
 * Handles both coupon shapes (C7 v2): user-locked deck-vault rewards, which
 * never confirm the existence of someone else's code, and public influencer
 * codes, which anyone signed in may use. The owner's commission is NEVER part
 * of this response — buyers must not see what a creator earns.
 */

const rateLimit = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // GUEST MODE (0045). Validation is the reconnaissance step: without this a
    // guest could brute-force coupon codes at zero cost and without an account
    // to rate-limit meaningfully. Same 403 as the two Razorpay doors.
    if (user.is_anonymous) {
      return NextResponse.json(
        { error: 'Create an account to use a coupon.' },
        { status: 403 },
      );
    }

    const now = Date.now();
    const last = rateLimit.get(user.id);
    if (last && now - last < 1500) {
      return NextResponse.json({ error: 'Too many requests, please wait' }, { status: 429 });
    }
    rateLimit.set(user.id, now);

    const body = await req.json().catch(() => ({}));
    const code = normalizeCode(body.code);
    if (!isValidCodeShape(code)) {
      return NextResponse.json({ valid: false, reason: 'That doesn’t look like a valid code.' });
    }
    // Tier is advisory here (the real gate is at order creation). Default to
    // 'pro' so a scope-limited code still reports honestly on the upgrade page.
    const tier = body.tier === 'lite' ? 'lite' : 'pro';

    const svc = createServiceClient();
    const coupon = await loadCoupon(svc, code);

    // Lazily mark a lapsed coupon so the admin list stays truthful.
    if (coupon && coupon.status === 'active' && new Date(coupon.expires_at).getTime() < Date.now()) {
      await svc.from('discount_coupons').update({ status: 'expired' }).eq('id', coupon.id);
      return NextResponse.json({ valid: false, reason: 'This coupon has expired.' });
    }

    const check = checkCoupon(coupon, user.id, tier);
    if (!check.ok) {
      return NextResponse.json({ valid: false, reason: check.reason });
    }

    return NextResponse.json({
      valid: true,
      code: check.coupon.code,
      pct: check.coupon.discount_pct,
      tierScope: check.coupon.tier_scope,
      expiresAt: check.coupon.expires_at,
    });
  } catch (err) {
    console.error('coupon validate error:', err);
    return NextResponse.json({ error: 'Could not validate the coupon' }, { status: 500 });
  }
}
