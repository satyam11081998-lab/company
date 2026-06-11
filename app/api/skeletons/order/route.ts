import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { SKELETON_LIBRARY_PRICE_INR } from '@/lib/constants';

const rateLimit = new Map<string, number>();

/** Create a Razorpay order for the one-time Deck Skeleton Library purchase. */
export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = Date.now();
    const lastRequest = rateLimit.get(user.id);
    if (lastRequest && now - lastRequest < 5000) {
      return NextResponse.json({ error: 'Too many requests, please wait' }, { status: 429 });
    }
    rateLimit.set(user.id, now);

    // Already owns it? Don't take their money twice.
    const { data: existing } = await supabase
      .from('skeleton_access').select('user_id').eq('user_id', user.id).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'You already own the Skeleton Library' }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await instance.orders.create({
      amount: SKELETON_LIBRARY_PRICE_INR * 100, // paise
      currency: 'INR',
      receipt: `skel_${Date.now()}_${user.id.substring(0, 5)}`,
      notes: { product: 'skeleton-library', user_id: user.id },
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Skeleton Library Create Order Error:', err);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
