/**
 * MECE → CRM sync. Idempotent; safe to run any time (cron daily, "Sync now").
 *
 *   users (not guests)          → Contacts   external_key user:<id>
 *   colleges with ≥1 user        → Accounts   college:<id>
 *   payments                     → Deals (B2C pipeline) + Invoices (paid/refunded)
 *   deck / vault / voice packs   → Deals + Invoices
 *   plans expiring / expired     → Deals (Renewals pipeline)
 *   feedback_reports             → Cases
 *   catalogue (plans, packs)     → Products, Price Books, Vendors (insert-only)
 *
 * Writes go through crm_sync_upsert (data = existing || patch), so fields the
 * CRM owns — owner, tags, notes, lifecycle overrides, custom fields — are
 * never overwritten. Revenue follows lib/revenue.ts exactly.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { EXCLUDED_PAYMENT_IDS, PLACEHOLDER_EMAIL_RE } from '@/lib/revenue';
import { TIER_PRICING } from '@/lib/tier';
import { INTL_TIER_PRICING } from '@/lib/pricing-intl';
import { REALTIME_PACKS } from '@/lib/realtime-packs';
import { DECK_VAULT_PRICE_INR } from '@/lib/deck-access';
import { fetchAll } from './db';
import { blockedHashes, blocklistHash } from './blocklist';
import { loadMetaWith } from './meta';

const DAY = 86_400_000;
const ABANDON_AFTER_DAYS = 3;
const RENEWAL_WINDOW_DAYS = 14;
const LAPSE_DAYS = 60;

interface SyncRow {
  module: string;
  external_key: string;
  name: string;
  mece_user_id?: string | null;
  data: Record<string, unknown>;
  created_at?: string | null;
}

export interface SyncStats {
  contacts: number;
  accounts: number;
  deals: number;
  invoices: number;
  renewals: number;
  cases: number;
  catalogue: number;
  changed: number;
  ms: number;
  warnings: string[];
}

async function upsert(svc: SupabaseClient, rows: SyncRow[]): Promise<number> {
  let changed = 0;
  for (let i = 0; i < rows.length; i += 400) {
    const { data, error } = await svc.rpc('crm_sync_upsert', { p_rows: rows.slice(i, i + 400) });
    if (error) throw error;
    changed += Number(data ?? 0);
  }
  return changed;
}

async function idsByKey(svc: SupabaseClient, module: string, prefix: string): Promise<Map<string, { id: string; data: Record<string, unknown> }>> {
  const { rows } = await fetchAll<{ id: string; external_key: string; data: Record<string, unknown> }>(
    (o) => svc.from('crm_records').select('id, external_key, data', o).eq('module', module).like('external_key', `${prefix}%`).order('id'),
    200_000,
  );
  return new Map(rows.map((r) => [r.external_key, { id: r.id, data: r.data ?? {} }]));
}

/** Give brand-new rows their auto-number (existing rows keep theirs). */
async function numberNew(svc: SupabaseClient, rows: SyncRow[], existing: Map<string, unknown>, key: string, field: string, prefix: string, pad: number) {
  const fresh = rows.filter((r) => !existing.has(r.external_key));
  if (!fresh.length) return;
  const { data: start, error } = await svc.rpc('crm_reserve_numbers', { p_key: key, p_n: fresh.length });
  if (error) throw error;
  fresh.forEach((r, i) => { r.data[field] = `${prefix}${String(Number(start) + i).padStart(pad, '0')}`; });
}

const iso = (v: unknown) => (typeof v === 'string' && v ? new Date(v).toISOString() : null);
const dateOnly = (v: unknown) => (typeof v === 'string' && v ? new Date(v).toISOString().slice(0, 10) : null);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---- users → contacts -----------------------------------------------------
const USER_COLS = 'id, name, full_name, email, phone, created_at, onboarding_completed_at, subscription_tier, subscription_expires_at, college_id, college_other, batch_year, placement_focus, referral_source, linkedin_url, streak_count, points, marketing_opt_out, is_admin, is_demo, is_guest, market';
const isPerson = (u: any) => !u.is_guest && !!u.email && !String(u.email).endsWith('@guest.invalid');
const isInternalUser = (u: any) => !!u.is_admin || !!u.is_demo || PLACEHOLDER_EMAIL_RE.test(String(u.email));

/** One MECE user (+ their usage/revenue facts) → their contact row. */
function userToContact(u: any, f: any, internalUser: boolean, accountId: string | null, now: number): SyncRow {
  const tierActive = (u.subscription_tier === 'lite' || u.subscription_tier === 'pro') && u.subscription_expires_at && new Date(u.subscription_expires_at).getTime() > now;
  const everPaid = Number(f.paid_count ?? 0) > 0;
  const lastActive = [f.last_seen_at, f.last_solved_at, u.created_at].filter(Boolean).map((x: string) => new Date(x).getTime()).reduce((a: number, b: number) => Math.max(a, b), 0);
  const expiredAgo = u.subscription_expires_at ? (now - new Date(u.subscription_expires_at).getTime()) / DAY : Infinity;
  let lifecycle: string;
  if (tierActive) lifecycle = 'Paying';
  else if (everPaid) lifecycle = expiredAgo <= LAPSE_DAYS ? 'Lapsed' : 'Churned';
  else if (now - lastActive > LAPSE_DAYS * DAY && now - new Date(u.created_at).getTime() > LAPSE_DAYS * DAY) lifecycle = 'Churned';
  else if (Number(f.cases_solved ?? 0) > 0) lifecycle = 'Activated';
  else if (u.onboarding_completed_at) lifecycle = 'Onboarded';
  else lifecycle = 'Signed up';
  const intl = [Number(f.rev_usd_cents ?? 0) ? `$${(Number(f.rev_usd_cents) / 100).toFixed(2)}` : null, Number(f.rev_eur_cents ?? 0) ? `€${(Number(f.rev_eur_cents) / 100).toFixed(2)}` : null].filter(Boolean).join(' + ');
  const fullName = String(u.full_name || u.name || String(u.email).split('@')[0]).slice(0, 255);
  return {
    module: 'contacts', external_key: `user:${u.id}`, name: fullName, mece_user_id: u.id, created_at: u.created_at,
    data: {
      full_name: fullName,
      email: String(u.email).toLowerCase(),
      phone: u.phone ?? null,
      account_id: accountId,
      lifecycle_stage: lifecycle,
      market: u.market ?? 'IN',
      linkedin_url: u.linkedin_url ?? null,
      email_opt_out: !!u.marketing_opt_out,
      mece_signed_up_at: iso(u.created_at),
      mece_onboarded_at: iso(u.onboarding_completed_at),
      mece_tier: tierActive ? u.subscription_tier : 'free',
      mece_tier_expires_at: iso(u.subscription_expires_at),
      mece_college: u.college_other ?? null,
      mece_batch_year: u.batch_year ?? null,
      mece_placement_focus: u.placement_focus ?? null,
      mece_referral_source: u.referral_source ?? null,
      mece_cases_solved: Number(f.cases_solved ?? 0),
      mece_avg_score: f.avg_score === null || f.avg_score === undefined ? null : Number(f.avg_score),
      mece_best_score: f.best_score ?? null,
      mece_first_solved_at: iso(f.first_solved_at),
      mece_last_active_at: lastActive ? new Date(lastActive).toISOString() : null,
      mece_active_days_30: Number(f.active_days_30 ?? 0),
      mece_streak: u.streak_count ?? 0,
      mece_points: u.points ?? 0,
      mece_revenue_inr: internalUser ? 0 : Number(f.rev_inr_paise ?? 0) / 100,
      mece_revenue_intl: internalUser ? null : intl || null,
      mece_payments_count: internalUser ? 0 : Number(f.paid_count ?? 0),
      mece_first_paid_at: iso(f.first_paid_at),
      mece_last_paid_at: iso(f.last_paid_at),
      mece_ai_cost_usd: Number(f.ai_cost_usd ?? 0),
      mece_voice_minutes: Number(f.voice_minutes ?? 0),
      mece_internal: internalUser,
      mece_account_deleted: false,
    },
  };
}

/**
 * New sign-ups → contacts without waiting for the daily sync (CRM tick and the
 * Contacts list). Usage and revenue facts arrive with the next full sync.
 */
export async function syncNewUsers(svc: SupabaseClient, max = 300): Promise<number> {
  const since = new Date(Date.now() - 14 * DAY).toISOString();
  const { data } = await svc.from('users').select(USER_COLS).gte('created_at', since).eq('is_guest', false).order('created_at', { ascending: false }).limit(max);
  const users = ((data ?? []) as any[]).filter(isPerson);
  if (!users.length) return 0;
  const { data: have } = await svc.from('crm_records').select('external_key').eq('module', 'contacts').in('external_key', users.map((u) => `user:${u.id}`));
  const known = new Set(((have ?? []) as Array<{ external_key: string }>).map((h) => h.external_key));
  const blocked = await blockedHashes(svc);
  const fresh = users.filter((u) => !known.has(`user:${u.id}`) && !blocked.has(blocklistHash(String(u.email))));
  if (!fresh.length) return 0;
  const colleges = [...new Set(fresh.map((u) => u.college_id).filter(Boolean))] as string[];
  const { data: accs } = colleges.length ? await svc.from('crm_records').select('id, external_key').eq('module', 'accounts').in('external_key', colleges.map((c) => `college:${c}`)) : { data: [] };
  const accountOf = new Map(((accs ?? []) as Array<{ id: string; external_key: string }>).map((a) => [a.external_key.slice(8), a.id]));
  const now = Date.now();
  return upsert(svc, fresh.map((u) => userToContact(u, {}, isInternalUser(u), u.college_id ? accountOf.get(u.college_id) ?? null : null, now)));
}

/** Re-read one user's account flags into their contact at once (after an admin changes them). */
export async function refreshContactFlags(svc: SupabaseClient, userId: string) {
  const { data: u } = await svc.from('users').select(USER_COLS).eq('id', userId).maybeSingle();
  if (!u || !isPerson(u)) return;
  const { data: c } = await svc.from('crm_records').select('id, locked').eq('module', 'contacts').eq('external_key', `user:${userId}`).maybeSingle();
  const rec = c as { id: string; locked: { kind?: string } | null } | null;
  if (!rec || rec.locked?.kind === 'dpdp_erased') return;
  await svc.rpc('crm_merge_data', { p_rows: [{ id: rec.id, data: { market: (u as any).market ?? 'IN', mece_internal: isInternalUser(u), email_opt_out: !!(u as any).marketing_opt_out } }] });
}

// ---- in-app feedback reports ↔ cases ---------------------------------------
const REPORT_COLS = 'id, user_id, category, message, contact_email, path, status, admin_note, created_at';
const REPORT_TYPE: Record<string, string> = { data_discrepancy: 'Content error', stale_data: 'Content error', bug: 'Bug', suggestion: 'Feature request', content_error: 'Content error', general: 'Question', other: 'Question' };
const REPORT_STATUS: Record<string, string> = { new: 'New', triaged: 'Open', in_progress: 'In progress', resolved: 'Resolved', dismissed: 'Closed' };

/** One feedback report → its case row. Status, priority and notes are set only when the case is new (then they belong to the CRM). */
function reportToCase(r: any, existing: { id: string; data: Record<string, unknown> } | undefined, contactId: string | null, userEmail: string | null): SyncRow {
  const msg = String(r.message ?? '').replace(/\s+/g, ' ').trim();
  const email = (r.contact_email || userEmail || null) as string | null;
  const data: Record<string, unknown> = {
    subject: `${REPORT_TYPE[r.category] ?? 'Question'}: ${msg.slice(0, 80)}${msg.length > 80 ? '…' : ''}`,
    case_origin: 'In-app report', type: REPORT_TYPE[r.category] ?? 'Question', contact_id: contactId,
    reporter_email: email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email.toLowerCase() : null,
    description: String(r.message ?? '').slice(0, 32000), mece_report_id: r.id, mece_page: r.path ? String(r.path).slice(0, 255) : null,
  };
  if (!existing) {
    data.status = REPORT_STATUS[r.status] ?? 'New';
    data.priority = r.category === 'bug' ? 'High' : 'Medium';
  }
  // notes written in the old admin Feedback screen move onto the case once
  if (r.admin_note && !(existing?.data.internal_comments)) data.internal_comments = String(r.admin_note).slice(0, 3000);
  return { module: 'cases', external_key: `report:${r.id}`, name: String(data.subject), mece_user_id: r.user_id ?? null, created_at: r.created_at, data };
}

/**
 * New in-app reports → cases without waiting for the daily sync (runs on the
 * CRM's 5-minute tick and when the Cases list opens). Cheap: looks only at the
 * last 14 days and skips reports that already have a case.
 */
export async function syncNewReports(svc: SupabaseClient, max = 200): Promise<number> {
  const since = new Date(Date.now() - 14 * DAY).toISOString();
  const { data } = await svc.from('feedback_reports').select(REPORT_COLS).gte('created_at', since).order('created_at', { ascending: false }).limit(max);
  const reports = (data ?? []) as any[];
  if (!reports.length) return 0;
  const keys = reports.map((r) => `report:${r.id}`);
  const { data: have } = await svc.from('crm_records').select('external_key').eq('module', 'cases').in('external_key', keys);
  const known = new Set(((have ?? []) as Array<{ external_key: string }>).map((h) => h.external_key));
  const fresh = reports.filter((r) => !known.has(`report:${r.id}`));
  if (!fresh.length) return 0;
  const uids = [...new Set(fresh.map((r) => r.user_id).filter(Boolean))] as string[];
  const [{ data: contacts }, { data: users }, blocked] = await Promise.all([
    uids.length ? svc.from('crm_records').select('id, external_key, locked').eq('module', 'contacts').in('external_key', uids.map((u) => `user:${u}`)) : Promise.resolve({ data: [] }),
    uids.length ? svc.from('users').select('id, email').in('id', uids) : Promise.resolve({ data: [] }),
    blockedHashes(svc),
  ]);
  const contactRows = (contacts ?? []) as Array<{ id: string; external_key: string; locked: { kind?: string } | null }>;
  const erasedUsers = new Set(contactRows.filter((c) => c.locked?.kind === 'dpdp_erased').map((c) => c.external_key.slice(5)));
  const contactOf = new Map(contactRows.map((c) => [c.external_key.slice(5), c.id]));
  const emailOf = new Map(((users ?? []) as Array<{ id: string; email: string | null }>).map((u) => [u.id, u.email]));
  const rows = fresh
    .filter((r) => !(r.user_id && erasedUsers.has(r.user_id)))
    .map((r) => reportToCase(r, undefined, r.user_id ? contactOf.get(r.user_id) ?? null : null, r.user_id ? emailOf.get(r.user_id) ?? null : null))
    .filter((r) => !(typeof r.data.reporter_email === 'string' && blocked.has(blocklistHash(r.data.reporter_email))));
  if (!rows.length) return 0;
  await numberNew(svc, rows, new Map(), 'cases.case_number', 'case_number', 'CS-', 5);
  return upsert(svc, rows);
}

/** CRM case status → the original report's status (Closed straight after Resolved stays resolved; Closed otherwise = dismissed). */
export function reportStatusFor(caseStatus: unknown, previousStatus: unknown): string | null {
  switch (caseStatus) {
    case 'New': return 'new';
    case 'Open': return 'triaged';
    case 'In progress': case 'Waiting on customer': case 'Escalated': return 'in_progress';
    case 'Resolved': return 'resolved';
    case 'Closed': return previousStatus === 'Resolved' ? 'resolved' : 'dismissed';
    default: return null;
  }
}

export async function runSync(svc: SupabaseClient, trigger: string, actorId: string | null = null): Promise<SyncStats> {
  const t0 = Date.now();
  const warnings: string[] = [];
  const { data: run } = await svc.from('crm_sync_runs').insert({ trigger, stats: {} }).select('id').single();
  const runId = (run as { id: string } | null)?.id;
  try {
    const meta = await loadMetaWith(svc);
    const catalogue = await seedCatalogue(svc);
    const now = Date.now();

    // ---- users + facts --------------------------------------------------
    const { rows: users } = await fetchAll<any>((o) => svc.from('users').select(USER_COLS, o).order('id'), 200_000);
    const people = users.filter(isPerson);
    const internal = new Set(people.filter(isInternalUser).map((u) => u.id as string));

    // DPDP erasure: erased records are never written again, and people who were erased
    // (by record or by email) are not brought back by the sync.
    const blocked = await blockedHashes(svc);
    const { rows: erasedRows } = await fetchAll<{ external_key: string | null; mece_user_id: string | null }>((o) => svc.from('crm_records').select('external_key, mece_user_id', o).eq('locked->>kind', 'dpdp_erased').order('id'), 200_000);
    const erasedKeys = new Set(erasedRows.map((r) => r.external_key).filter(Boolean) as string[]);
    const erasedUsers = new Set([
      ...(erasedRows.map((r) => r.mece_user_id).filter(Boolean) as string[]),
      ...people.filter((u) => blocked.has(blocklistHash(String(u.email)))).map((u) => u.id as string),
    ]);
    const keep = (r: SyncRow) => !erasedKeys.has(r.external_key) && !(r.mece_user_id && erasedUsers.has(r.mece_user_id));

    const { data: factRows, error: factErr } = await svc.rpc('crm_user_facts', { p_excluded: [...EXCLUDED_PAYMENT_IDS] });
    if (factErr) throw factErr;
    const facts = new Map<string, any>(((factRows ?? []) as any[]).map((f) => [f.user_id, f]));

    // ---- colleges → accounts --------------------------------------------
    const collegeIds = [...new Set(people.map((u) => u.college_id).filter(Boolean))] as string[];
    const colleges = collegeIds.length
      ? ((await svc.from('colleges').select('id, name, short_name, type, tier, city, state_code').in('id', collegeIds.slice(0, 5000))).data ?? []) as any[]
      : [];
    const byCollege = new Map<string, any[]>();
    for (const u of people) if (u.college_id) byCollege.set(u.college_id, [...(byCollege.get(u.college_id) ?? []), u]);
    const accountRows: SyncRow[] = colleges.map((c) => {
      const members = (byCollege.get(c.id) ?? []).filter((u) => !internal.has(u.id));
      const paying = members.filter((u) => (u.subscription_tier === 'lite' || u.subscription_tier === 'pro') && u.subscription_expires_at && new Date(u.subscription_expires_at).getTime() > now);
      const scores = members.map((u) => facts.get(u.id)?.avg_score).filter((x) => typeof x === 'number' || typeof x === 'string').map(Number);
      const rev = members.reduce((n, u) => n + Number(facts.get(u.id)?.rev_inr_paise ?? 0), 0) / 100;
      return {
        module: 'accounts', external_key: `college:${c.id}`, name: c.name,
        data: {
          account_name: c.name, account_type: 'College / B-school', tier: c.tier ? String(c.tier) : null, city: c.city ?? null, state: c.state_code ?? null,
          mece_college_id: c.id, mece_users: members.length, mece_paying_users: paying.length, mece_revenue_inr: Math.round(rev * 100) / 100,
          mece_avg_score: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null,
        },
      };
    });
    let changed = await upsert(svc, accountRows);
    const accountIds = await idsByKey(svc, 'accounts', 'college:');

    // ---- contacts --------------------------------------------------------
    const contactRows: SyncRow[] = people.map((u) => userToContact(u, facts.get(u.id) ?? {}, internal.has(u.id), u.college_id ? accountIds.get(`college:${u.college_id}`)?.id ?? null : null, now));
    changed += await upsert(svc, contactRows.filter(keep));
    const contactIds = await idsByKey(svc, 'contacts', 'user:');
    // Users deleted from the app: flag (never delete — privacy review decides)
    const live = new Set(people.map((u) => `user:${u.id}`));
    const gone = [...contactIds.keys()].filter((k) => !live.has(k) && !erasedKeys.has(k) && contactIds.get(k)!.data.mece_account_deleted !== true);
    if (gone.length) {
      changed += await upsert(svc, gone.map((k) => ({ module: 'contacts', external_key: k, name: '', data: { mece_account_deleted: true, lifecycle_stage: 'Churned' } })));
    }
    const userById = new Map(people.map((u) => [u.id as string, u]));
    const contactOf = (uid: string | null) => (uid ? contactIds.get(`user:${uid}`)?.id ?? null : null);
    const accountOf = (uid: string | null) => {
      const u = uid ? userById.get(uid) : null;
      return u?.college_id ? accountIds.get(`college:${u.college_id}`)?.id ?? null : null;
    };

    // ---- money → deals + invoices ---------------------------------------
    const [pay, decks, vault, mins, coupons] = await Promise.all([
      fetchAll<any>((o) => svc.from('payments').select('id, user_id, razorpay_order_id, razorpay_payment_id, tier, amount_paise, currency, status, created_at, paid_at', o).order('id'), 200_000),
      fetchAll<any>((o) => svc.from('deck_purchases').select('id, user_id, razorpay_order_id, razorpay_payment_id, amount_paise, created_at', o).order('id'), 200_000),
      fetchAll<any>((o) => svc.from('skeleton_access').select('user_id, razorpay_order_id, razorpay_payment_id, amount_paise, granted_at', o).order('user_id'), 200_000),
      fetchAll<any>((o) => svc.from('realtime_purchases').select('razorpay_payment_id, user_id, minutes, amount_paise, created_at', o).order('razorpay_payment_id'), 200_000),
      fetchAll<any>((o) => svc.from('coupon_redemptions').select('razorpay_payment_id, code, period', o).order('razorpay_payment_id'), 200_000),
    ]).catch((e) => { throw e; });
    const couponByPay = new Map<string, { code: string; period: string | null }>(coupons.rows.filter((c) => c.razorpay_payment_id).map((c) => [c.razorpay_payment_id, { code: c.code, period: c.period }]));

    const dealRows: SyncRow[] = [];
    const invoiceRows: SyncRow[] = [];
    const paidByUser = new Map<string, string[]>(); // user → sorted paid-at list (for type)
    for (const p of pay.rows.filter((x) => x.status === 'paid' && x.razorpay_payment_id)) {
      paidByUser.set(p.user_id, [...(paidByUser.get(p.user_id) ?? []), p.paid_at ?? p.created_at].sort());
    }
    const userName = (uid: string | null) => (uid ? userById.get(uid)?.full_name || userById.get(uid)?.name || userById.get(uid)?.email || 'Unknown' : 'Unknown');

    const pushInvoice = (key: string, dealKey: string, uid: string | null, title: string, amount: number, currency: string, when: string | null, status: string, payRef: string | null, taxPct: number) => {
      invoiceRows.push({
        module: 'invoices', external_key: `invoice:${key}`, name: title, mece_user_id: uid, created_at: when,
        data: {
          subject: title, invoice_date: dateOnly(when), status, contact_id: contactOf(uid), account_id: accountOf(uid),
          payment_ref: payRef, currency,
          // B2C prices are tax-inclusive; the line carries the gross amount.
          line_items: [{ product_id: null, product_name: title, quantity: 1, list_price: amount, discount: 0, tax_pct: taxPct, total: amount }],
          sub_total: amount, discount_total: 0, tax_total: 0, adjustment: 0, grand_total: amount,
          _deal_key: dealKey,
        },
      });
    };

    for (const p of pay.rows) {
      const uid = p.user_id as string | null;
      const amount = Number(p.amount_paise ?? 0) / 100;
      const currency = String(p.currency || 'INR').toUpperCase();
      const created = new Date(p.created_at).getTime();
      const verified = p.status === 'paid' && !!p.razorpay_payment_id;
      let stage = 'checkout_started';
      let lost: string | null = null;
      if (verified) stage = 'closed_won';
      else if (p.status === 'refunded') { stage = 'closed_lost'; lost = 'Refunded'; }
      else if (p.status === 'failed') { stage = now - created > ABANDON_AFTER_DAYS * DAY ? 'closed_lost' : 'payment_failed'; lost = stage === 'closed_lost' ? 'Payment failed' : null; }
      else if (now - created > ABANDON_AFTER_DAYS * DAY) { stage = 'closed_lost'; lost = 'Abandoned checkout'; }
      const paidList = uid ? paidByUser.get(uid) ?? [] : [];
      const when = p.paid_at ?? p.created_at;
      const isFirst = verified ? paidList[0] === when : paidList.length === 0;
      const coupon = p.razorpay_payment_id ? couponByPay.get(p.razorpay_payment_id) : undefined;
      const title = `${cap(p.tier)}${coupon?.period ? ` (${coupon.period})` : ''} — ${userName(uid)}`;
      dealRows.push({
        module: 'deals', external_key: `payment:${p.id}`, name: title, mece_user_id: uid, created_at: p.created_at,
        data: {
          deal_name: title, pipeline: 'B2C subscriptions', stage, amount, currency, closing_date: dateOnly(when),
          contact_id: contactOf(uid), account_id: accountOf(uid), type: isFirst ? 'New business' : 'Upgrade',
          product_line: cap(p.tier), period: coupon?.period ?? null, lost_reason: lost,
          payment_ref: p.razorpay_payment_id ?? null, order_ref: p.razorpay_order_id ?? null, paid_at: verified ? iso(p.paid_at ?? p.created_at) : null,
          coupon_code: coupon?.code ?? null, internal_test: uid ? internal.has(uid) : false,
        },
      });
      if (verified || p.status === 'refunded') {
        pushInvoice(`payment:${p.id}`, `payment:${p.id}`, uid, `MECE ${cap(p.tier)} plan`, amount, currency, when, p.status === 'refunded' ? 'Refunded' : 'Paid', p.razorpay_payment_id ?? null, currency === 'INR' ? 18 : 0);
      }
    }
    const oneOff = (kind: string, key: string, uid: string | null, product: string, amount: number, when: string, payRef: string | null) => {
      const title = `${product} — ${userName(uid)}`;
      dealRows.push({
        module: 'deals', external_key: `${kind}:${key}`, name: title, mece_user_id: uid, created_at: when,
        data: {
          deal_name: title, pipeline: 'B2C subscriptions', stage: 'closed_won', amount, currency: 'INR', closing_date: dateOnly(when),
          contact_id: contactOf(uid), account_id: accountOf(uid), type: 'Add-on', product_line: product.startsWith('Deck') ? 'Deck' : product.startsWith('Vault') ? 'Vault access' : 'Voice minutes',
          period: 'one-time', payment_ref: payRef, paid_at: iso(when), internal_test: uid ? internal.has(uid) : false,
        },
      });
      pushInvoice(`${kind}:${key}`, `${kind}:${key}`, uid, `MECE ${product}`, amount, 'INR', when, 'Paid', payRef, 18);
    };
    for (const d of decks.rows.filter((x) => x.razorpay_payment_id)) oneOff('deck', d.id, d.user_id, 'Deck', Number(d.amount_paise ?? 0) / 100, d.created_at, d.razorpay_payment_id);
    for (const v of vault.rows.filter((x) => x.razorpay_payment_id)) oneOff('vault', `${v.user_id}:${v.razorpay_payment_id}`, v.user_id, 'Vault access', Number(v.amount_paise ?? 0) / 100, v.granted_at, v.razorpay_payment_id);
    for (const r of mins.rows.filter((x) => x.razorpay_payment_id)) oneOff('voice', r.razorpay_payment_id, r.user_id, `Voice minutes (${Number(r.minutes)} min)`, Number(r.amount_paise ?? 0) / 100, r.created_at, r.razorpay_payment_id);

    // ---- renewals --------------------------------------------------------
    const existingRenewals = await idsByKey(svc, 'deals', 'renewal:');
    for (const u of people) {
      if (!(u.subscription_tier === 'lite' || u.subscription_tier === 'pro') || !u.subscription_expires_at || internal.has(u.id)) continue;
      const exp = new Date(u.subscription_expires_at).getTime();
      const daysLeft = (exp - now) / DAY;
      const key = `renewal:${u.id}:${dateOnly(u.subscription_expires_at)}`;
      const existing = existingRenewals.get(key);
      if (!existing && (daysLeft > RENEWAL_WINDOW_DAYS || daysLeft < -30)) continue;
      // Renewed = a verified payment after this renewal window opened.
      const renewedAfter = (paidByUser.get(u.id) ?? []).some((t) => new Date(t).getTime() > exp - RENEWAL_WINDOW_DAYS * DAY);
      let stage: string | null = null;
      if (renewedAfter && daysLeft < RENEWAL_WINDOW_DAYS) stage = 'closed_won';
      else if (daysLeft < -7) stage = 'closed_lost';
      else if (!existing) stage = 'up_for_renewal';
      const title = `Renewal: ${cap(u.subscription_tier)} — ${u.full_name || u.name || u.email}`;
      const data: Record<string, unknown> = {
        deal_name: title, pipeline: 'Renewals', amount: TIER_PRICING[u.subscription_tier as 'lite' | 'pro'].monthly, currency: 'INR',
        closing_date: dateOnly(u.subscription_expires_at), contact_id: contactOf(u.id), account_id: accountOf(u.id), type: 'Renewal',
        product_line: cap(u.subscription_tier),
      };
      if (stage) data.stage = stage; // never override a stage a person set, unless the outcome is known
      if (stage === 'closed_lost') data.lost_reason = 'Other';
      dealRows.push({ module: 'deals', external_key: key, name: title, mece_user_id: u.id, data });
    }
    const renewals = dealRows.filter((r) => r.external_key.startsWith('renewal:')).length;
    // Stage → probability + forecast category, exactly as a save in the CRM would set them
    // (forecasts, weighted pipeline and deal health read these). Only when this sync sets the stage.
    for (const row of dealRows) {
      if (typeof row.data.stage !== 'string') continue;
      const st = meta.pipelines.find((pl) => pl.name === row.data.pipeline)?.config.stages.find((x) => x.key === row.data.stage);
      if (st) { row.data.probability = st.probability; row.data.forecast_category = st.forecast; }
    }
    changed += await upsert(svc, dealRows.filter(keep));
    const dealIds = await idsByKey(svc, 'deals', '');
    for (const inv of invoiceRows) {
      inv.data.deal_id = dealIds.get(String(inv.data._deal_key))?.id ?? null;
      delete inv.data._deal_key;
    }
    const existingInvoices = await idsByKey(svc, 'invoices', 'invoice:');
    const invoicesKept = invoiceRows.filter(keep);
    await numberNew(svc, invoicesKept, existingInvoices, 'invoices.invoice_number', 'invoice_number', 'INV-', 5);
    changed += await upsert(svc, invoicesKept);

    // ---- support reports → cases ---------------------------------------
    const reports = await fetchAll<any>((o) => svc.from('feedback_reports').select(REPORT_COLS, o).order('id'), 50_000);
    const existingCases = await idsByKey(svc, 'cases', 'report:');
    const caseRows: SyncRow[] = reports.rows.map((r) => reportToCase(r, existingCases.get(`report:${r.id}`), contactOf(r.user_id), (r.user_id ? userById.get(r.user_id)?.email : null) ?? null));
    const casesKept = caseRows.filter((r) => keep(r) && !(typeof r.data.reporter_email === 'string' && blocked.has(blocklistHash(r.data.reporter_email))));
    await numberNew(svc, casesKept, existingCases, 'cases.case_number', 'case_number', 'CS-', 5);
    changed += await upsert(svc, casesKept);

    const stats: SyncStats = {
      contacts: contactRows.length, accounts: accountRows.length, deals: dealRows.length - renewals, invoices: invoiceRows.length,
      renewals, cases: caseRows.length, catalogue, changed, ms: Date.now() - t0, warnings,
    };
    if (runId) await svc.from('crm_sync_runs').update({ finished_at: new Date().toISOString(), stats }).eq('id', runId);
    await svc.from('crm_audit').insert({ actor_id: actorId, actor_kind: actorId ? 'user' : 'sync', action: 'sync', meta: stats });
    return stats;
  } catch (e) {
    const msg = (e as Error)?.message ?? String(e);
    if (runId) await svc.from('crm_sync_runs').update({ finished_at: new Date().toISOString(), error: msg.slice(0, 2000) }).eq('id', runId);
    throw e;
  }
}

/** Products, price books and vendors — inserted once, then owned by the CRM. */
async function seedCatalogue(svc: SupabaseClient): Promise<number> {
  const products: SyncRow[] = [];
  const P = (key: string, name: string, cat: string, price: number | null, currency: string, period: string | null, desc: string) =>
    products.push({ module: 'products', external_key: `product:${key}`, name, data: { product_name: name, product_code: key.toUpperCase().replace(/[:]/g, '-'), product_category: cat, unit_price: price, currency, period, tax_pct: currency === 'INR' ? 18 : 0, active: true, description: desc } });
  for (const tier of ['lite', 'pro'] as const) {
    for (const period of ['monthly', 'quarter'] as const) {
      P(`${tier}:${period}:inr`, `${cap(tier)} — ${period === 'monthly' ? 'monthly' : '3 months'}`, 'Subscription', TIER_PRICING[tier][period], 'INR', period, `MECE ${cap(tier)} plan, India pricing (₹, tax inclusive).`);
      for (const cur of ['USD', 'EUR'] as const) {
        P(`${tier}:${period}:${cur.toLowerCase()}`, `${cap(tier)} — ${period === 'monthly' ? 'monthly' : '3 months'} (${cur})`, 'Subscription', INTL_TIER_PRICING[cur][tier][period], cur, period, `MECE ${cap(tier)} plan, international pricing.`);
      }
    }
  }
  for (const [id, pack] of Object.entries(REALTIME_PACKS)) P(`voice:${id}`, `Voice minutes — ${pack.label}`, 'Voice minutes', pack.priceInr, 'INR', 'one-time', `${pack.minutes} minutes of live voice interviews.`);
  P('vault', 'Deck Vault access', 'Vault access', DECK_VAULT_PRICE_INR, 'INR', 'one-time', 'Unlocks the whole Deck Vault.');
  P('deck', 'Single deck', 'Deck', null, 'INR', 'one-time', 'One consulting deck from the Deck Vault (price varies by deck).');
  P('campus', 'Campus licence (per student, per year)', 'Campus licence', null, 'INR', 'annual', 'B2B licence for a college or consulting club. Priced per deal.');
  P('workshop', 'Case-interview workshop', 'Workshop', null, 'INR', 'one-time', 'Live workshop for a cohort. Priced per deal.');

  const vendors: SyncRow[] = [
    ['openai', 'OpenAI', 'AI / LLM', 'Interviewer, scoring, voice (Realtime, Whisper, TTS).'],
    ['google', 'Google (Gemini)', 'AI / LLM', 'Gemini Live voice, GD briefs, images.'],
    ['render', 'Render', 'Hosting', 'Python backend (FastAPI).'],
    ['vercel', 'Vercel', 'Hosting', 'Next.js website.'],
    ['supabase', 'Supabase', 'Database', 'Postgres, auth, storage.'],
    ['resend', 'Resend', 'Email', 'Bulk email.'],
    ['razorpay', 'Razorpay', 'Payments', 'Payment gateway fees.'],
    ['workspace', 'Google Workspace', 'Tools', 'team@ mailbox and transactional email.'],
  ].map(([k, n, c, d]) => ({ module: 'vendors', external_key: `vendor:${k}`, name: n, data: { vendor_name: n, category: c, description: d, currency: 'INR' } }));

  const rows = [...products, ...vendors].map((r) => ({ ...r, source: 'sync' }));
  const { data, error } = await svc.from('crm_records').upsert(
    rows.map((r) => ({ module: r.module, external_key: r.external_key, name: r.name, data: r.data, source: 'system' })),
    { onConflict: 'module,external_key', ignoreDuplicates: true },
  ).select('id');
  if (error) throw error;

  // Price books (after products exist)
  const prod = await idsByKey(svc, 'products', 'product:');
  const book = (key: string, name: string, currency: string, filter: (k: string) => boolean, model = 'Flat') => {
    const entries = [...prod.entries()].filter(([k]) => filter(k)).map(([k, v]) => ({
      product_id: v.id, product_name: String(v.data.product_name ?? k), quantity: 1, list_price: Number(v.data.unit_price ?? 0), discount: 0, tax_pct: 0,
    }));
    return { module: 'price_books', external_key: `pricebook:${key}`, name, data: { price_book_name: name, currency, pricing_model: model, active: true, entries } };
  };
  const books = [
    book('in', 'India (INR)', 'INR', (k) => k.endsWith(':inr') || k.startsWith('product:voice') || k === 'product:vault'),
    book('us', 'International (USD)', 'USD', (k) => k.endsWith(':usd')),
    book('eu', 'Europe (EUR)', 'EUR', (k) => k.endsWith(':eur')),
  ];
  const r2 = await svc.from('crm_records').upsert(
    books.map((b) => ({ module: b.module, external_key: b.external_key, name: b.name, data: b.data, source: 'system' })),
    { onConflict: 'module,external_key', ignoreDuplicates: true },
  );
  if (r2.error) throw r2.error;
  return (data ?? []).length;
}
