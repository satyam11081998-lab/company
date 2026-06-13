import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { priceFor, isBillingPeriod } from '@/lib/tier';

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
    const amount = priceFor(tier as 'lite' | 'pro', period) * 100; // INR -> paise, single source of truth

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${user.id.substring(0, 5)}`,
      notes: { tier, period, user_id: user.id },
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
