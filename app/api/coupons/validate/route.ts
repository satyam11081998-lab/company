import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * POST /api/coupons/validate — { code } -> { valid, pct, tierScope, code } | { valid: false, reason }.
 *
 * Display-time check only: the /upgrade page calls it so the user sees the
 * discounted price BEFORE Razorpay opens. It grants nothing — order creation
 * re-validates from scratch and verify/webhook re-validate again. Coupons are
 * user-locked, so this never confirms the existence of someone else's code.
 */

const rateLimit = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = Date.now();
    const last = rateLimit.get(user.id);
    if (last && now - last < 1500) {
      return NextResponse.json({ error: 'Too many requests, please wait' }, { status: 429 });
    }
    rateLimit.set(user.id, now);

    const body = await req.json().catch(() => ({}));
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    if (!/^[A-Z0-9-]{4,32}$/.test(code)) {
      return NextResponse.json({ valid: false, reason: 'That doesn’t look like a valid code.' });
    }

    const svc = createServiceClient();
    const { data } = await svc
      .from('discount_coupons')
      .select('id, code, user_id, discount_pct, tier_scope, status, expires_at')
      .eq('code', code)
      .maybeSingle();
    const c = data as {
      id: string; code: string; user_id: string; discount_pct: number;
      tier_scope: string; status: string; expires_at: string;
    } | null;

    // Same message for "doesn't exist" and "not yours" — no oracle for guessing codes.
    if (!c || c.user_id !== user.id) {
      return NextResponse.json({ valid: false, reason: 'Invalid coupon code.' });
    }
    if (c.status === 'redeemed') {
      return NextResponse.json({ valid: false, reason: 'This coupon has already been used.' });
    }
    if (c.status === 'revoked') {
      return NextResponse.json({ valid: false, reason: 'This coupon is no longer valid.' });
    }
    if (c.status === 'expired' || new Date(c.expires_at).getTime() < Date.now()) {
      if (c.status === 'active') {
        await svc.from('discount_coupons').update({ status: 'expired' }).eq('id', c.id);
      }
      return NextResponse.json({ valid: false, reason: 'This coupon has expired.' });
    }

    return NextResponse.json({
      valid: true,
      code: c.code,
      pct: c.discount_pct,
      tierScope: c.tier_scope,
      expiresAt: c.expires_at,
    });
  } catch (err) {
    console.error('coupon validate error:', err);
    return NextResponse.json({ error: 'Could not validate the coupon' }, { status: 500 });
  }
}
