import { NextResponse } from 'next/server';
import crypto from 'crypto';
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !tier) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (tier !== 'lite' && tier !== 'pro') {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const bodyText = razorpay_order_id + '|' + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Update user tier + subscription dates
      const { error: updateError } = await supabase
        .from('users')
        .update({
          subscription_tier: tier,
          subscription_started_at: now.toISOString(),
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq('id', user.id);
        
      if (updateError) {
        console.error("Failed to update user tier in DB:", updateError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      // Insert payment record for audit trail
      const amountPaise = (TIER_PRICES as Record<string, number>)[tier] * 100;
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          tier,
          amount_paise: amountPaise,
          currency: 'INR',
          status: 'paid',
          paid_at: now.toISOString(),
        });

      if (paymentError) {
        // Non-blocking: tier is already updated, log the payment insert failure
        console.error("Failed to insert payment record:", paymentError);
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Razorpay Verify Signature Error:", err);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

