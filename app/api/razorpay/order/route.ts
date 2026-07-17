import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { priceFor, isBillingPeriod, discountedPaise, couponCoversTier } from '@/lib/tier';

const rateLimit = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Optional coupon (Deck Vault Rewards). Fully backward-compatible: a missing
    // coupon leaves the flow exactly as before. An INVALID coupon is a hard 400 —
    // never silently charge full price when the user believes a discount applies.
    const couponCode = typeof body.coupon === 'string'
      ? body.coupon.trim().toUpperCase()
      : '';
    const notes: Record<string, string> = { tier, period, user_id: user.id };
    if (couponCode) {
      if (!/^[A-Z0-9-]{4,32}$/.test(couponCode)) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
      }
      const svc = createServiceClient();
      const { data: coupon } = await svc
        .from('discount_coupons')
        .select('id, code, user_id, discount_pct, tier_scope, status, expires_at')
        .eq('code', couponCode)
        .maybeSingle();
      const c = coupon as {
        id: string; code: string; user_id: string; discount_pct: number;
        tier_scope: string; status: string; expires_at: string;
      } | null;
      if (!c || c.user_id !== user.id || c.status !== 'active') {
        return NextResponse.json({ error: 'Invalid or already used coupon' }, { status: 400 });
      }
      if (new Date(c.expires_at).getTime() < Date.now()) {
        await svc.from('discount_coupons').update({ status: 'expired' }).eq('id', c.id);
        return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
      }
      if (!couponCoversTier(c.tier_scope, tier as 'lite' | 'pro')) {
        return NextResponse.json({ error: `This coupon applies to the ${c.tier_scope.toUpperCase()} plan` }, { status: 400 });
      }
      amount = discountedPaise(tier as 'lite' | 'pro', period, c.discount_pct);
      notes.coupon = c.code;
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
