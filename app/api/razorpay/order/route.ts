import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { TIER_PRICES } from '@/lib/tier';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tier } = body;

    if (tier !== 'lite' && tier !== 'pro') {
      return NextResponse.json({ error: 'Invalid tier specified' }, { status: 400 });
    }
    const amount = TIER_PRICES[tier as 'lite' | 'pro'] * 100; // INR -> paise, single source of truth

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${user.id.substring(0, 5)}`,
      notes: { tier, user_id: user.id },
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
