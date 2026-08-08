import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { priceFor, isBillingPeriod, discountedPaise } from '@/lib/tier';
import { loadCoupon, checkCoupon, normalizeCode, isValidCodeShape } from '@/lib/coupons';

const rateLimit = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // GUEST MODE (0045). Anonymous users hold the `authenticated` role, so
    // every check written "is there a user?" silently starts admitting them.
    // Money is the surface where that matters most: a guest could buy Pro
    // against a throwaway identity they can never sign back into, and — worse —
    // burn a capped influencer coupon's redemptions (C7 v2) while booking a
    // commission to an account that evaporates. Refused server-side, not merely
    // hidden in the UI.
    if (user.is_anonymous) {
      return NextResponse.json(
        { error: 'Create an account before purchasing — your practice will carry over.' },
        { status: 403 },
      );
    }

    const now = Date.now();
    const lastRequest = rateLimit.get(user.id);
    if (lastRequest && now - lastRequest < 5000) { // 5 seconds debounce
      return NextResponse.json({ error: 'Too many requests, please wait' }, { status: 429 });
    }
    rateLimit.set(user.id, now);

    const body = await req.json();
    const { tier } = body;
    // Billing period is optional and backward-compatible: a missing/legacy body
    // (no `period`) behaves exactly like before — monthly.
    const period = body.period === undefined ? 'monthly' : body.period;

    if (tier !== 'lite' && tier !== 'pro') {
      return NextResponse.json({ error: 'Invalid tier specified' }, { status: 400 });
    }
    if (!isBillingPeriod(period)) {
      return NextResponse.json({ error: 'Invalid billing period specified' }, { status: 400 });
    }
    let amount = priceFor(tier as 'lite' | 'pro', period) * 100; // INR -> paise, single source of truth

    // Optional coupon. Fully backward-compatible: a missing coupon leaves the
    // flow exactly as before. An INVALID coupon is a hard 400 — never silently
    // charge full price when the user believes a discount applies.
    //
    // Both coupon shapes go through lib/coupons (C7 v2): user-locked deck-vault
    // rewards behave exactly as they did, public influencer codes are usable by
    // any signed-in buyer up to their redemption cap.
    const couponCode = normalizeCode(body.coupon);
    const notes: Record<string, string> = { tier, period, user_id: user.id };
    if (couponCode) {
      if (!isValidCodeShape(couponCode)) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
      }
      const svc = createServiceClient();
      const c = await loadCoupon(svc, couponCode);
      if (c && c.status === 'active' && new Date(c.expires_at).getTime() < Date.now()) {
        await svc.from('discount_coupons').update({ status: 'expired' }).eq('id', c.id);
        return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
      }
      const check = checkCoupon(c, user.id, tier as 'lite' | 'pro');
      if (!check.ok) {
        return NextResponse.json({ error: check.reason }, { status: 400 });
      }
      amount = discountedPaise(tier as 'lite' | 'pro', period, check.coupon.discount_pct);
      // notes.coupon is server-set and is the ONLY channel a coupon reaches
      // verify/webhook — the client can never inject one.
      notes.coupon = check.coupon.code;
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${user.id.substring(0, 5)}`,
      notes,
    };

    const order = await instance.orders.create(options);
    
    return NextResponse.json(order);
  } catch (err: any) {
    console.error("Razorpay Create Order Error:", err);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
