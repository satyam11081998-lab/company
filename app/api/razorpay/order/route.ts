import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { priceFor, isBillingPeriod, discountedPaise } from '@/lib/tier';
import { loadCoupon, checkCoupon, normalizeCode, isValidCodeShape } from '@/lib/coupons';
import { notifyAdmin } from '@/lib/telegram';
import { DECK_SINGLE_PRICE_INR, DECK_VAULT_PRICE_INR } from '@/lib/deck-access';

const rateLimit = new Map<string, number>();

// Abuse guard: a user may create at most this many payment orders per rolling
// hour. Someone firing far more than this and letting them fail/cancel is
// probing the payment flow or card-testing, not buying. A genuine buyer needs
// only one or two attempts.
const MAX_ATTEMPTS_PER_HOUR = 6;

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

    // ── Abuse guard: cap payment attempts per user per rolling hour ─────────
    // Counts this user's recent attempts (every order is logged as a 'created'
    // row below, plus any 'failed' rows the webhook records). Self-contained —
    // works even if the Razorpay webhook is not configured. The in-memory
    // debounce above only stops rapid double-clicks; this stops a determined
    // loop across minutes.
    const guardDb = createServiceClient();
    const windowStart = new Date(now - 60 * 60 * 1000).toISOString();
    const { count: recentAttempts } = await guardDb
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', windowStart)
      .in('status', ['created', 'failed']);
    if ((recentAttempts ?? 0) >= MAX_ATTEMPTS_PER_HOUR) {
      return NextResponse.json(
        { error: 'Too many payment attempts. Please wait an hour and try again, or contact team@mece.in.' },
        { status: 429 },
      );
    }

    const body = await req.json();
    // `product` selects a Deck Vault purchase ('deck' = one deck ₹99,
    // 'vault' = whole vault ₹499). Absent → a Lite/Pro subscription (unchanged).
    const product = typeof body.product === 'string' ? body.product : null;

    let amount: number;                       // paise, computed server-side ONLY
    let notes: Record<string, string>;        // server-set; the client can inject nothing
    let couponCode = '';

    if (product === 'deck' || product === 'vault') {
      // ── Deck Vault purchases ─────────────────────────────────────────────
      const svc = createServiceClient();
      if (product === 'vault') {
        amount = DECK_VAULT_PRICE_INR * 100;
        notes = { product: 'vault', user_id: user.id };
      } else {
        const skeletonId = typeof body.skeletonId === 'string' ? body.skeletonId.trim() : '';
        if (!skeletonId) {
          return NextResponse.json({ error: 'Missing deck.' }, { status: 400 });
        }
        const { data: deck } = await svc
          .from('deck_skeletons').select('id, is_active').eq('id', skeletonId).maybeSingle();
        if (!deck || (deck as { is_active?: boolean }).is_active === false) {
          return NextResponse.json({ error: 'Deck not found.' }, { status: 404 });
        }
        // Refuse if the user already has access (owns this deck, the whole vault,
        // or is Pro/admin) — never charge for something already unlocked.
        const [{ data: owned }, { data: vault }, { data: urow }] = await Promise.all([
          svc.from('deck_purchases').select('id').eq('user_id', user.id).eq('skeleton_id', skeletonId).maybeSingle(),
          svc.from('skeleton_access').select('user_id').eq('user_id', user.id).maybeSingle(),
          svc.from('users').select('is_admin, subscription_tier, subscription_expires_at').eq('id', user.id).maybeSingle(),
        ]);
        const u = urow as { is_admin?: boolean; subscription_tier?: string; subscription_expires_at?: string | null } | null;
        const isPro = u?.subscription_tier === 'pro' && (!u.subscription_expires_at || new Date(u.subscription_expires_at) > new Date());
        if (owned || vault || u?.is_admin || isPro) {
          return NextResponse.json({ error: 'You already have access to this deck.' }, { status: 400 });
        }
        amount = DECK_SINGLE_PRICE_INR * 100;
        notes = { product: 'deck', skeleton_id: skeletonId, user_id: user.id };
      }
    } else {
      // ── Subscription (Lite / Pro) — unchanged from before ────────────────
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
      amount = priceFor(tier as 'lite' | 'pro', period) * 100; // INR -> paise, single source of truth
      notes = { tier, period, user_id: user.id };

      // Optional coupon. Fully backward-compatible: a missing coupon leaves the
      // flow exactly as before. An INVALID coupon is a hard 400 — never silently
      // charge full price when the user believes a discount applies.
      couponCode = normalizeCode(body.coupon);
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

    // Log the attempt (audit trail + the counter the abuse guard reads above).
    // Non-blocking: a logging failure must never block a legitimate checkout.
    // On the attempt that reaches the cap, alert on Telegram exactly once
    // (later attempts are refused above before reaching this point).
    // Only subscription attempts are logged to `payments` (its `tier` column is
    // NOT NULL and checked lite/pro). Deck/vault purchases skip the attempt log;
    // the abuse guard's main job is protecting the subscription path anyway.
    try {
      if (!product) {
        await guardDb.from('payments').insert({
          user_id: user.id,
          razorpay_order_id: order.id,
          tier: notes.tier,
          amount_paise: amount,
          currency: 'INR',
          status: 'created',
        });
        if ((recentAttempts ?? 0) + 1 >= MAX_ATTEMPTS_PER_HOUR) {
          await notifyAdmin(
            `🚨 MECE payment abuse guard: ${user.email || user.id} reached ${(recentAttempts ?? 0) + 1} payment attempts in the last hour — further orders are now blocked for an hour.\ntier=${notes.tier}${couponCode ? ` coupon=${couponCode}` : ''}`,
          );
        }
      }
    } catch (e) {
      console.error('[order] attempt log/alert failed:', e);
    }

    return NextResponse.json(order);
  } catch (err: any) {
    console.error("Razorpay Create Order Error:", err);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
