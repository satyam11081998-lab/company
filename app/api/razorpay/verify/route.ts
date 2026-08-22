import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { priceFor, periodDays, isBillingPeriod, discountedPaise, BILLING_PERIOD_LABELS } from '@/lib/tier';
import { sendUpgradeReceipt } from '@/lib/email/send';
import {
  loadCoupon,
  couponHonouredAtPayment,
  redeemCoupon,
  type CouponRow,
} from '@/lib/coupons';

// SECURITY (2026-08-22): in PRODUCTION, refuse to honour a payment made against
// TEST-MODE Razorpay keys. A test-mode checkout produces a genuinely valid
// signature (signed with the test secret) and would otherwise pass every check
// below and grant real Pro for a free test card — money that never appears in
// the Live dashboard. Fail closed: if prod is misconfigured onto test keys,
// upgrades stop working (loudly) instead of being given away silently.
function testKeysInProduction(): boolean {
  const isProd =
    process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  return isProd && keyId.startsWith('rzp_test');
}

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // GUEST MODE (0045) — see /api/razorpay/order. Both doors must be shut:
    // /order and /verify are independently reachable, and C7's money rule is
    // enforced across all four coupon call sites, not just the first one.
    if (user.is_anonymous) {
      return NextResponse.json(
        { error: 'Create an account before purchasing — your practice will carry over.' },
        { status: 403 },
      );
    }

    if (testKeysInProduction()) {
      console.error('[verify] BLOCKED: RAZORPAY_KEY_ID is a rzp_test key in a production deploy.');
      return NextResponse.json(
        { error: 'Payments are temporarily unavailable. Please try again later.' },
        { status: 503 },
      );
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

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const signatureBuffer = Buffer.from(razorpay_signature, 'hex');

    if (expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      // The signature proves a payment happened but NOT which plan was paid for.
      // Re-fetch the order and validate the amount against the claimed tier.
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
      // Period is taken from the order's server-set notes, never from the client,
      // so the access window can't be inflated by tampering with the verify body.
      const period = isBillingPeriod(order?.notes?.period) ? order.notes.period : 'monthly';

      // Coupon-aware expected amount. notes.coupon is server-set at order
      // creation; here we re-load the coupon row (DB is the source of truth for
      // the %) and only honor it if it belongs to THIS user and is still live —
      // or was already redeemed by THIS payment (idempotent retry). Expiry is
      // deliberately gated at order time, not here: the user already paid the
      // discounted amount in good faith.
      const couponCode = typeof order?.notes?.coupon === 'string' ? order.notes.coupon : '';
      let couponRow: CouponRow | null = null;
      const listPaise = priceFor(tier, period) * 100;
      let expectedPaise = listPaise;
      if (couponCode) {
        couponRow = await loadCoupon(createServiceClient(), couponCode);
        const ok = couponHonouredAtPayment(couponRow, user.id, razorpay_payment_id);
        if (!ok) {
          return NextResponse.json({ error: 'The coupon on this order is not valid' }, { status: 400 });
        }
        expectedPaise = discountedPaise(tier, period, couponRow!.discount_pct);
      }
      if (Number(order.amount) !== expectedPaise) {
        return NextResponse.json({ error: 'Paid amount does not match the selected plan' }, { status: 400 });
      }
      if (order.notes && order.notes.tier && order.notes.tier !== tier) {
        return NextResponse.json({ error: 'Plan mismatch' }, { status: 400 });
      }

      // SECURITY (2026-08-22): confirm the PAYMENT is real and captured.
      // The signature check only proves that whoever produced `signature` holds
      // the key secret — it does NOT prove a payment was actually made or that
      // `razorpay_payment_id` even exists. Fetch the payment from Razorpay and
      // assert it is CAPTURED, belongs to THIS order, and settled the expected
      // amount. A fabricated/forged payment id (e.g. from a leaked secret) does
      // not exist at Razorpay and 404s here; an authorized-but-uncaptured or
      // failed payment is rejected too.
      let payment: any;
      try {
        payment = await instance.payments.fetch(razorpay_payment_id);
      } catch {
        return NextResponse.json({ error: 'Payment could not be verified with Razorpay' }, { status: 400 });
      }
      if (!payment || payment.order_id !== razorpay_order_id) {
        return NextResponse.json({ error: 'Payment does not belong to this order' }, { status: 400 });
      }
      if (payment.status !== 'captured') {
        return NextResponse.json({ error: 'Payment has not been captured' }, { status: 400 });
      }
      if (Number(payment.amount) !== expectedPaise) {
        return NextResponse.json({ error: 'Captured amount does not match the selected plan' }, { status: 400 });
      }

      // Privileged writes MUST run as the service role. Migration 0006's
      // trg_guard_user_cols silently reverts subscription_tier/dates/points for
      // any non-service-role caller (and `payments` has no insert policy), so the
      // session client above would "succeed" without changing the tier. The
      // session client is only used to identify the paying user.
      const db = createServiceClient();

      // Replay guard — never process the same payment twice.
      const { data: existingPay } = await db
        .from('payments').select('id').eq('razorpay_payment_id', razorpay_payment_id).maybeSingle();
      if (existingPay) {
        return NextResponse.json({ success: true, alreadyProcessed: true });
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + periodDays(period) * 24 * 60 * 60 * 1000);

      // Update user tier + subscription dates. `.select()` so a silently
      // blocked write (RLS / guard trigger / missing service key) surfaces as
      // zero rows updated and returns an error — never a false success.
      const { data: updatedRows, error: updateError } = await db
        .from('users')
        .update({
          subscription_tier: tier,
          subscription_started_at: now.toISOString(),
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq('id', user.id)
        .select('id, name, email');

      if (updateError || !updatedRows || updatedRows.length === 0) {
        console.error("Failed to update user tier in DB:", updateError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      // Insert payment record for audit trail (use the actual paid amount).
      const amountPaise = Number(order.amount);
      const { error: paymentError } = await db
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

      // Burn the coupon and write the commission ledger exactly once. The
      // ledger's UNIQUE(razorpay_payment_id) makes this race-safe against the
      // webhook, so an influencer can never be credited twice for one sale.
      if (couponRow) {
        await redeemCoupon(db, couponRow, {
          userId: user.id,
          tier,
          period,
          listPricePaise: listPaise,
          paidPaise: amountPaise,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        });
      }

      // Branded upgrade receipt (transactional, via Google Workspace SMTP).
      // Non-blocking: an email failure must never fail a paid upgrade. Runs only
      // on first processing (the replay guard returned above for repeats), so the
      // webhook backstop won't double-send.
      try {
        const recipient = updatedRows[0] as { name?: string | null; email?: string | null };
        await sendUpgradeReceipt(recipient?.email || user.email || '', {
          name: recipient?.name ?? null,
          tierLabel: tier === 'pro' ? 'Pro' : 'Lite',
          periodLabel: BILLING_PERIOD_LABELS[isBillingPeriod(period) ? period : 'monthly'],
          amountInr: Math.round(Number(order.amount) / 100),
          expiresAt: expiresAt.toISOString(),
        });
      } catch (e) {
        console.error('[verify] upgrade receipt email failed:', e);
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
