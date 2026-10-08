/**
 * Customer analytics (server half): gathers the facts the user may see and
 * hands them to lib/crm/analytics.ts. Needs view_analytics. Revenue is only
 * Razorpay-verified INR revenue (the sync's mece_revenue_inr), internal
 * accounts are excluded, and USD/EUR are never mixed into rupee totals.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import {
  type CustomerFact, type SpendItem, cacByChannel, channelOf, clvFinite, clvGuptaLehmann, clvSimple, cohortTable, concentration, customerEquity,
  customerProfit, deciles, estimateMargin, estimateRetention, expectedLifetime, lifecycleFunnel, quadrants, whaleCurve, QUADRANT_ADVICE,
} from '@/lib/crm/analytics';
import { summarize } from '@/lib/crm/surveys';
import { canSetup, fieldAccess } from '@/lib/crm/permissions';
import type { CrmContext, CrmRecord } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { queryAll } from './records';
import type { Meta } from './meta';

export interface AnalyticsSettings { usdInr: number; annualDiscount: number; horizonMonths: number; costPerCase: number; feePct: number }
export const DEFAULT_ANALYTICS: AnalyticsSettings = { usdInr: 84, annualDiscount: 0.12, horizonMonths: 24, costPerCase: 150, feePct: 0.02 };

export async function loadAnalyticsSettings(): Promise<AnalyticsSettings> {
  const { data } = await createServiceClient().from('crm_settings').select('value').eq('key', 'analytics.settings').maybeSingle();
  const v = ((data as { value?: Partial<AnalyticsSettings> } | null)?.value ?? {}) as Partial<AnalyticsSettings>;
  const n = (x: unknown, lo: number, hi: number, d: number) => { const y = Number(x); return Number.isFinite(y) && y >= lo && y <= hi ? y : d; };
  return {
    usdInr: n(v.usdInr, 1, 1000, DEFAULT_ANALYTICS.usdInr), annualDiscount: n(v.annualDiscount, 0, 1, DEFAULT_ANALYTICS.annualDiscount),
    horizonMonths: n(v.horizonMonths, 1, 120, DEFAULT_ANALYTICS.horizonMonths), costPerCase: n(v.costPerCase, 0, 100000, DEFAULT_ANALYTICS.costPerCase), feePct: n(v.feePct, 0, 0.2, DEFAULT_ANALYTICS.feePct),
  };
}

export async function saveAnalyticsSettings(ctx: CrmContext, raw: Partial<AnalyticsSettings>) {
  if (!canSetup(ctx, 'manage_reports') && !canSetup(ctx, 'manage_setup')) throw new CrmAccessError();
  const svc = createServiceClient();
  const cur = await loadAnalyticsSettings();
  const RANGES: Record<keyof AnalyticsSettings, [number, number, string]> = {
    usdInr: [1, 1000, 'USD → INR must be between 1 and 1000.'], annualDiscount: [0, 1, 'The discount rate is a fraction between 0 and 1 (0.12 = 12%).'],
    horizonMonths: [1, 120, 'The horizon must be 1–120 months.'], costPerCase: [0, 100000, 'Cost per case must be ₹0–₹1,00,000.'], feePct: [0, 0.2, 'The payment fee is a fraction between 0 and 0.2.'],
  };
  const merged: AnalyticsSettings = { ...cur };
  for (const [k, v] of Object.entries(raw ?? {})) {
    if (!(k in RANGES)) continue;
    const [lo, hi, msg] = RANGES[k as keyof AnalyticsSettings];
    const x = Number(v);
    if (!Number.isFinite(x) || x < lo || x > hi) throw new CrmUserError(msg);
    merged[k as keyof AnalyticsSettings] = x;
  }
  await svc.from('crm_settings').upsert({ key: 'analytics.settings', value: merged, updated_at: new Date().toISOString(), updated_by: ctx.userId });
  return loadAnalyticsSettings();
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);

function factOf(c: CrmRecord, s: AnalyticsSettings, cases: Map<string, number>): CustomerFact {
  const d = c.data;
  return {
    id: c.id,
    revenue: num(d.mece_revenue_inr),
    payments: num(d.mece_payments_count),
    firstPaid: (d.mece_first_paid_at as string) ?? null,
    lastPaid: (d.mece_last_paid_at as string) ?? null,
    costToServe: num(d.mece_ai_cost_usd) * s.usdInr,
    signedUp: (d.mece_signed_up_at as string) ?? c.created_at,
    lastActive: (d.mece_last_active_at as string) ?? null,
    casesSolved: num(d.mece_cases_solved),
    channel: typeof d.lead_source === 'string' && d.lead_source ? d.lead_source : channelOf(d.mece_referral_source as string),
    plan: String(d.mece_tier ?? 'free'),
    market: String(d.market ?? 'IN'),
    segment: (d.rfm_segment as string) ?? undefined,
    supportCases: cases.get(c.id) ?? 0,
  };
}

export async function customerAnalytics(ctx: CrmContext, meta: Meta) {
  if (!canSetup(ctx, 'view_analytics')) throw new CrmAccessError('You don’t have access to analytics.');
  // money facts are hidden from some profiles; analytics must not leak them in totals
  for (const f of ['mece_revenue_inr', 'mece_ai_cost_usd']) if (fieldAccess(ctx, 'contacts', f) === 'hidden') throw new CrmAccessError('Your profile hides revenue, so customer analytics is not available to you.');
  const s = await loadAnalyticsSettings();
  const svc = createServiceClient();
  const now = Date.now();
  const contacts = (await queryAll(ctx, meta, 'contacts', { match: 'all', conditions: [{ field: 'mece_internal', op: 'neq', value: true }, { field: 'mece_signed_up_at', op: 'not_empty' }] }, 50_000)).rows;
  const caseRows = (await queryAll(ctx, meta, 'cases', null, 20_000).catch(() => ({ rows: [] as CrmRecord[] }))).rows;
  const casesBy = new Map<string, number>();
  for (const k of caseRows) { const cid = typeof k.data.contact_id === 'string' ? k.data.contact_id : null; if (cid) casesBy.set(cid, (casesBy.get(cid) ?? 0) + 1); }
  const facts = contacts.map((c) => factOf(c, s, casesBy));
  const payers = facts.filter((f) => f.payments > 0 && f.revenue > 0);

  // ---- retention, margin, CLV
  const ret = estimateRetention(facts, now);
  const mar = estimateMargin(facts, ret.cycleDays, now, s.feePct);
  const base = { monthlyMargin: mar.marginPerMonth, retention: ret.monthly, annualDiscount: s.annualDiscount, horizonMonths: s.horizonMonths };
  const clv = { simple: clvSimple(base), guptaLehmann: clvGuptaLehmann(base), finite: clvFinite(base), lifetimeMonths: expectedLifetime(base.retention) };
  const segmentBy = (key: (f: CustomerFact) => string) => {
    const groups = new Map<string, CustomerFact[]>();
    for (const f of payers) groups.set(key(f), [...(groups.get(key(f)) ?? []), f]);
    return [...groups.entries()].map(([seg, rows]) => {
      const r = estimateRetention(rows, now, 45, ret.monthly);
      const m = estimateMargin(rows, r.cycleDays, now, s.feePct);
      const i = { monthlyMargin: m.marginPerMonth, retention: r.monthly, annualDiscount: s.annualDiscount, horizonMonths: s.horizonMonths };
      return { segment: seg, customers: rows.length, revenue: Math.round(rows.reduce((a, x) => a + x.revenue, 0)), arpuMonth: m.arpu, marginMonth: m.marginPerMonth, retention: r.monthly, retentionEstimated: r.estimated, clvSimple: clvSimple(i), clvDiscounted: clvFinite(i) };
    }).sort((a, b) => b.revenue - a.revenue);
  };

  // ---- acquisition spend and CAC
  const spend: SpendItem[] = [];
  const camps = (await queryAll(ctx, meta, 'campaigns', null, 5000).catch(() => ({ rows: [] as CrmRecord[] }))).rows;
  const typeChannel: Record<string, string> = { 'Social': 'Instagram', 'Influencer / coupon': 'Influencer coupon', 'Paid ads': 'Paid ads', 'Email broadcast': 'Email campaign', 'Campus event': 'Campus / college', 'Referral': 'Referral', 'SEO / content': 'Google search', 'Webinar / workshop': 'Campus / college', 'Partnership': 'Partner college' };
  for (const c of camps) if (num(c.data.actual_cost) > 0) spend.push({ channel: typeChannel[String(c.data.type ?? '')] ?? 'Other', amount: num(c.data.actual_cost), at: (c.data.start_date as string) ?? c.created_at, source: `campaign: ${c.name}` });
  const pos = (await queryAll(ctx, meta, 'purchase_orders', { match: 'all', conditions: [{ field: 'cost_category', op: 'eq', value: 'Marketing (acquisition)' }] }, 5000).catch(() => ({ rows: [] as CrmRecord[] }))).rows;
  for (const p of pos) spend.push({ channel: 'Unattributed marketing', amount: num(p.data.grand_total), at: (p.data.po_date as string) ?? p.created_at, source: `PO: ${p.name}` });
  const { data: coupons } = await svc.from('coupon_redemptions').select('commission_paise, created_at').gt('commission_paise', 0).limit(20_000);
  for (const c of (coupons ?? []) as Array<{ commission_paise: number; created_at: string }>) spend.push({ channel: 'Influencer coupon', amount: c.commission_paise / 100, at: c.created_at, source: 'coupon commission' });
  const fixed = (await queryAll(ctx, meta, 'purchase_orders', { match: 'all', conditions: [{ field: 'cost_category', op: 'in', value: ['Platform (fixed)', 'Cost to serve (variable)', 'Content'] }] }, 5000).catch(() => ({ rows: [] as CrmRecord[] }))).rows;
  const cac90 = cacByChannel(facts, spend, now - 90 * 86_400_000, now + 1);
  const cacAll = cacByChannel(facts, spend, 0, now + 1);
  const newPerMonth = Math.round((facts.filter((f) => f.firstPaid && now - new Date(f.firstPaid).getTime() <= 90 * 86_400_000).length / 3) * 10) / 10;
  const equity = customerEquity({ ...base, currentCustomers: facts.filter((f) => f.plan !== 'free').length || payers.length, newPerMonth, cac: cacAll.blendedCac ?? 0, acquisitionMonths: 12 });

  // ---- profitability (ABC) and concentration
  const activePayers = payers.length || 1;
  const fixedTotal = fixed.reduce((a, p) => a + num(p.data.grand_total), 0);
  const perCustomerFixed = fixedTotal / activePayers;
  const profits = payers.map((f) => ({ id: f.id, profit: customerProfit(f, perCustomerFixed, { fixedCost: fixedTotal, costPerCase: s.costPerCase, feePct: s.feePct }), tenureDays: Math.max(0, ((f.lastPaid ? new Date(f.lastPaid).getTime() : now) - new Date(f.firstPaid ?? f.signedUp ?? now).getTime()) / 86_400_000) }));
  const quad = quadrants(profits);
  // free users cost money too (AI usage) — shown separately, never mixed into payer profit
  const freeCost = Math.round(facts.filter((f) => f.payments === 0).reduce((a, f) => a + f.costToServe, 0));

  // ---- lifecycle, cohorts, loyalty
  const funnel = lifecycleFunnel(contacts.map((c) => ({
    onboarded: !!c.data.mece_onboarded_at, activated: num(c.data.mece_cases_solved) > 0, paying: num(c.data.mece_payments_count) > 0,
    repeat: num(c.data.mece_payments_count) > 1, activeNow: !!c.data.mece_last_active_at && now - new Date(String(c.data.mece_last_active_at)).getTime() <= 30 * 86_400_000,
  })));
  const internal = (await queryAll(ctx, meta, 'contacts', { match: 'all', conditions: [{ field: 'mece_internal', op: 'eq', value: true }] }, 5000)).rows.map((c) => c.mece_user_id).filter((x): x is string => !!x);
  const { data: cohortRows } = await svc.rpc('crm_cohort_activity', { p_months: 12, p_excluded_users: internal });
  const cohorts = cohortTable(((cohortRows ?? []) as Array<{ cohort: string; month_index: number; cohort_size: number; active_users: number; paying_users: number }>).map((r) => ({ cohort: r.cohort, monthIndex: r.month_index, size: r.cohort_size, active: r.active_users, paying: r.paying_users })));
  const { data: surveyRows } = await svc.from('crm_survey_responses').select('kind, score, answered_at').not('answered_at', 'is', null).gte('answered_at', new Date(now - 365 * 86_400_000).toISOString()).limit(20_000);
  const sr = (surveyRows ?? []) as Array<{ kind: 'nps' | 'csat' | 'ces'; score: number }>;
  const loyalty = { nps: summarize('nps', sr.filter((r) => r.kind === 'nps').map((r) => r.score)), csat: summarize('csat', sr.filter((r) => r.kind === 'csat').map((r) => r.score)), ces: summarize('ces', sr.filter((r) => r.kind === 'ces').map((r) => r.score)) };
  const rfm = new Map<string, number>();
  for (const f of facts) if (f.segment) rfm.set(f.segment, (rfm.get(f.segment) ?? 0) + 1);

  return {
    settings: s,
    population: { contacts: facts.length, payers: payers.length, onPlan: facts.filter((f) => f.plan !== 'free').length, revenue: Math.round(payers.reduce((a, f) => a + f.revenue, 0)) },
    retention: ret, margin: mar, clv,
    clvBy: { plan: segmentBy((f) => f.plan), channel: segmentBy((f) => f.channel), market: segmentBy((f) => f.market), rfm: segmentBy((f) => f.segment ?? 'Not scored') },
    cac: { last90: cac90, allTime: cacAll, spendItems: spend.length, newPerMonth },
    equity,
    concentration: concentration(payers.map((f) => f.revenue)),
    profit: { whale: whaleCurve(profits.map((p) => p.profit)), deciles: deciles(profits.map((p) => p.profit)), quadrants: { counts: quad.counts, profitMedian: quad.profitMedian, tenureMedianDays: quad.tenureMedianDays, advice: QUADRANT_ADVICE }, fixedTotal: Math.round(fixedTotal), perCustomerFixed: Math.round(perCustomerFixed), freeUserCost: freeCost },
    funnel, cohorts, loyalty,
    rfm: [...rfm.entries()].map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n),
  };
}
