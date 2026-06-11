import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { SKELETON_LIBRARY_PRICE_INR } from '@/lib/constants';

/** Verify the Razorpay payment and grant Skeleton Library access. */
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const bodyText = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret).update(bodyText).digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const signatureBuffer = Buffer.from(razorpay_signature, 'hex');

    if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Signature proves a payment happened, not what was paid for — re-fetch
    // the order and validate amount + product, mirroring the tier flow.
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    let order: any;
    try {
      order = await instance.orders.fetch(razorpay_order_id);
    } catch {
      return NextResponse.json({ error: 'Could not verify order with Razorpay' }, { status: 400 });
    }
    const expectedPaise = SKELETON_LIBRARY_PRICE_INR * 100;
    if (Number(order.amount) !== expectedPaise) {
      return NextResponse.json({ error: 'Paid amount does not match the product' }, { status: 400 });
    }
    if (order.notes?.product !== 'skeleton-library') {
      return NextResponse.json({ error: 'Product mismatch' }, { status: 400 });
    }

    // Replay guard — payment id is unique in skeleton_access.
    const { data: existing } = await supabase
      .from('skeleton_access').select('user_id').eq('user_id', user.id).maybeSingle();
    if (existing) {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    const { error: insertError } = await supabase.from('skeleton_access').insert({
      user_id: user.id,
      razorpay_order_id,
      razorpay_payment_id,
      amount_paise: expectedPaise,
    });

    if (insertError) {
      console.error('Failed to grant skeleton access:', insertError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Skeleton Library Verify Error:', err);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
