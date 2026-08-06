import { createServiceClient } from '@/lib/supabase/service';
import CouponsAdminClient, { type AdminCoupon, type AdminRedemption } from './coupons-admin-client';

// Admin gating happens in the parent admin layout (users.is_admin).
export const dynamic = 'force-dynamic';

interface CouponRow {
  id: string;
  code: string;
  user_id: string | null;
  discount_pct: number;
  tier_scope: string;
  source: string;
  status: string;
  expires_at: string;
  created_at: string;
  owner_name: string | null;
  owner_handle: string | null;
  owner_contact: string | null;
  commission_pct: number | null;
  max_redemptions: number | null;
  redemption_count: number | null;
  admin_note: string | null;
}

interface RedemptionRow {
  id: string;
  coupon_id: string;
  code: string;
  user_id: string | null;
  tier: string;
  period: string;
  list_price_paise: number;
  paid_paise: number;
  discount_paise: number;
  commission_paise: number;
  payout_status: string;
  created_at: string;
}

export default async function AdminCouponsPage() {
  const svc = createServiceClient();

  // Public/influencer codes only. Deck Vault Rewards coupons are user-locked
  // and managed from /admin/deck-vault.
  const [couponsRes, redemptionsRes] = await Promise.all([
    svc
      .from('discount_coupons')
      .select(
        'id, code, user_id, discount_pct, tier_scope, source, status, expires_at, created_at, ' +
        'owner_name, owner_handle, owner_contact, commission_pct, max_redemptions, redemption_count, admin_note',
      )
      .is('user_id', null)
      .order('created_at', { ascending: false })
      .limit(200),
    svc
      .from('coupon_redemptions')
      .select(
        'id, coupon_id, code, user_id, tier, period, list_price_paise, paid_paise, ' +
        'discount_paise, commission_paise, payout_status, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  const couponRows = (couponsRes.data as CouponRow[] | null) || [];
  const redemptionRows = (redemptionsRes.data as RedemptionRow[] | null) || [];

  // Buyer names for the redemption log. Email is intentionally included —
  // this page is admin-only and reconciling a payout needs a real identity.
  const buyerIds = Array.from(
    new Set(redemptionRows.map((r) => r.user_id).filter((v): v is string => !!v)),
  );
  const buyers = new Map<string, { name: string | null; email: string | null }>();
  if (buyerIds.length > 0) {
    const { data } = await svc.from('users').select('id, name, email').in('id', buyerIds);
    for (const u of (data as { id: string; name: string | null; email: string | null }[] | null) || []) {
      buyers.set(u.id, { name: u.name, email: u.email });
    }
  }

  const byCoupon = new Map<string, RedemptionRow[]>();
  for (const r of redemptionRows) {
    if (!byCoupon.has(r.coupon_id)) byCoupon.set(r.coupon_id, []);
    byCoupon.get(r.coupon_id)!.push(r);
  }

  const coupons: AdminCoupon[] = couponRows.map((c) => {
    const rs = byCoupon.get(c.id) ?? [];
    const pending = rs.filter((r) => r.payout_status === 'pending');
    return {
      id: c.id,
      code: c.code,
      discountPct: c.discount_pct,
      commissionPct: Number(c.commission_pct ?? 0),
      tierScope: c.tier_scope,
      status: c.status,
      ownerName: c.owner_name || '—',
      ownerHandle: c.owner_handle,
      ownerContact: c.owner_contact,
      note: c.admin_note || '',
      maxRedemptions: c.max_redemptions,
      redemptionCount: rs.length || c.redemption_count || 0,
      expiresAt: c.expires_at,
      createdAt: c.created_at,
      grossPaise: rs.reduce((a, r) => a + r.paid_paise, 0),
      commissionOwedPaise: pending.reduce((a, r) => a + r.commission_paise, 0),
      commissionTotalPaise: rs.reduce((a, r) => a + r.commission_paise, 0),
    };
  });

  const redemptions: AdminRedemption[] = redemptionRows.map((r) => {
    const who = r.user_id ? buyers.get(r.user_id) : null;
    return {
      id: r.id,
      couponId: r.coupon_id,
      code: r.code,
      buyerName: who?.name || '—',
      buyerEmail: who?.email || '—',
      tier: r.tier,
      period: r.period,
      listPricePaise: r.list_price_paise,
      paidPaise: r.paid_paise,
      discountPaise: r.discount_paise,
      commissionPaise: r.commission_paise,
      payoutStatus: r.payout_status,
      createdAt: r.created_at,
    };
  });

  return <CouponsAdminClient coupons={coupons} redemptions={redemptions} />;
}
