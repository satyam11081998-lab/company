import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/service';
import { priceFor, periodDays, isBillingPeriod, discountedPaise, BILLING_PERIOD_LABELS } from '@/lib/tier';
import { sendUpgradeReceipt } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

/**
 * Razorpay webhook — asynchronous payment reconciliation.
 *
 * Why it exists: the synchronous /api/razorpay/verify path only runs if the
 * user stays on the page after paying. If they close the tab, this webhook is
 * the backstop that still grants access. It also records failed payments and
 * processes refunds (downgrade to free).
 *
 * SETUP (until both are set, this route is an inert 200 no-op, so it is safe to deploy):
 *   1. Vercel env: SUPABASE_SERVICE_ROLE_KEY (server-only) and RAZORPAY_WEBHOOK_SECRET
 *   2. Razorpay Dashboard → Settings → Webhooks → add https://mece.in/api/razorpay/webhook
 *      with the same secret, subscribed to: order.paid, payment.failed,
 *      refund.created, refund.processed
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Not configured yet → acknowledge (200) so Razorpay doesn't retry forever, do nothing.
  if (!secret || !serviceKey) {
    return NextResponse.json({ ok: false, reason: 'webhook not configured' }, { status: 200 });
  }

  const signature = req.headers.get('x-razorpay-signature') || '';
  const raw = await req.text(); // raw body REQUIRED for signature verification

  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  const valid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
  if (!valid) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'bad payload' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const type: string = event?.event || '';

  try {
    if (type === 'order.paid') {
      const order = event?.payload?.order?.entity;
      const payment = event?.payload?.payment?.entity;
      const notes = order?.notes || {};
      const tier = notes.tier;
      const uid = notes.user_id;
      const paymentId = payment?.id;

      if ((tier === 'lite' || tier === 'pro') && uid && paymentId) {
        // Idempotency / replay guard.
        const { data: existing } = await supabase
          .from('payments').select('id').eq('razorpay_payment_id', paymentId).maybeSingle();
        if (existing) return NextResponse.json({ ok: true, dedup: true });

        const period = isBillingPeriod(notes.period) ? notes.period : 'monthly';

        // Coupon-aware expected amount — mirrors /api/razorpay/verify exactly.
        // notes.coupon is server-set at order creation; the DB row is the source
        // of truth for ownership + %. Expiry is gated at order time, not here.
        const couponCode = typeof notes.coupon === 'string' ? notes.coupon : '';
        let couponRow: { id: string; user_id: string; discount_pct: number; status: string; redeemed_payment_id: string | null } | null = null;
        let expectedPaise = priceFor(tier, period) * 100;
        if (couponCode) {
          const { data: c } = await supabase
            .from('discount_coupons')
            .select('id, user_id, discount_pct, status, redeemed_payment_id')
            .eq('code', couponCode)
            .maybeSingle();
          couponRow = c as typeof couponRow;
          const okOwner = !!couponRow && couponRow.user_id === uid;
          const okState = !!couponRow && (
            couponRow.status === 'active' ||
            couponRow.status === 'expired' ||
            (couponRow.status === 'redeemed' && couponRow.redeemed_payment_id === paymentId)
          );
          if (!okOwner || !okState) {
            return NextResponse.json({ ok: false, reason: 'coupon mismatch' }, { status: 200 });
          }
          expectedPaise = discountedPaise(tier, period, couponRow!.discount_pct);
        }
        if (Number(order.amount) !== expectedPaise) {
          return NextResponse.json({ ok: false, reason: 'amount mismatch' }, { status: 200 });
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + periodDays(period) * 24 * 60 * 60 * 1000);
        await supabase.from('users').update({
          subscription_tier: tier,
          subscription_started_at: now.toISOString(),
          subscription_expires_at: expiresAt.toISOString(),
        }).eq('id', uid);
        await supabase.from('payments').insert({
          user_id: uid,
          razorpay_order_id: order.id,
          razorpay_payment_id: paymentId,
          tier,
          amount_paise: Number(order.amount),
          currency: 'INR',
          status: 'paid',
          paid_at: now.toISOString(),
        });

        // Burn the coupon exactly once (race-safe vs /verify via .eq status guard).
        if (couponRow && couponRow.status === 'active') {
          await supabase
            .from('discount_coupons')
            .update({ status: 'redeemed', redeemed_at: now.toISOString(), redeemed_payment_id: paymentId })
            .eq('id', couponRow.id)
            .eq('status', 'active');
        }

        // Branded upgrade receipt (transactional). Non-blocking; first-time only
        // (the dedup guard above returns for repeats), so verify + webhook won't double-send.
        try {
          const { data: u } = await supabase.from('users').select('name, email').eq('id', uid).maybeSingle();
          const target = u as { name?: string | null; email?: string | null } | null;
          if (target?.email) {
            await sendUpgradeReceipt(target.email, {
              name: target.name ?? null,
              tierLabel: tier === 'pro' ? 'Pro' : 'Lite',
              periodLabel: BILLING_PERIOD_LABELS[isBillingPeriod(period) ? period : 'monthly'],
              amountInr: Math.round(Number(order.amount) / 100),
              expiresAt: expiresAt.toISOString(),
            });
          }
        } catch (e) {
          console.error('[webhook] upgrade receipt email failed:', e);
        }
      }
    } else if (type === 'payment.failed') {
      const payment = event?.payload?.payment?.entity;
      const notes = payment?.notes || {};
      if (payment?.id && notes.user_id) {
        await supabase.from('payments').insert({
          user_id: notes.user_id,
          razorpay_order_id: payment.order_id || '',
          razorpay_payment_id: payment.id,
          tier: notes.tier === 'pro' ? 'pro' : 'lite',
          amount_paise: Number(payment.amount || 0),
          currency: 'INR',
          status: 'failed',
        });
      }
    } else if (type === 'refund.created' || type === 'refund.processed') {
      const refund = event?.payload?.refund?.entity;
      const paymentId = refund?.payment_id;
      if (paymentId) {
        const { data: pay } = await supabase
          .from('payments').select('id, user_id').eq('razorpay_payment_id', paymentId).maybeSingle();
        if (pay) {
          await supabase.from('payments').update({ status: 'refunded' }).eq('id', (pay as any).id);
          await supabase.from('users').update({
            subscription_tier: 'free',
            subscription_expires_at: null,
          }).eq('id', (pay as any).user_id);
        }
      }
    }
  } catch (e) {
    // Acknowledge to avoid infinite Razorpay retries; investigate via logs.
    console.error('razorpay webhook handler error:', e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  return NextResponse.json({ ok: true });
}
