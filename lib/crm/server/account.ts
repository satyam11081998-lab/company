/**
 * MECE account tools inside the CRM (moved from the old admin Users screen).
 * MECE admins only (users.is_admin → CRM super-admin): these change the
 * person's real app account, so a CRM profile permission is not enough.
 *
 *   accountDetail  — profile, plan, sessions/devices, coupons, recent submissions
 *   setDemo        — showcase account flag (hidden from leaderboard + stats)
 *   signOutAll     — revoke every live session
 *   setMarket      — IN / US / EU (prices, case bank, leaderboard)
 *   adminPulse     — revenue received + sign-ups (the old Users page header)
 *
 * Every change is audited in the CRM and copied onto the contact at once.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { effectiveTier } from '@/lib/tier';
import { getRevenueSummary } from '@/lib/revenue';
import { isUuid } from '@/lib/crm/fields';
import type { CrmContext } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { audit } from './db';
import { loadRecordRaw } from './records';
import { refreshContactFlags } from './sync';

function needAdmin(ctx: CrmContext) {
  if (!ctx.superAdmin) throw new CrmAccessError('Only MECE admins can manage accounts.');
}

async function userIdOf(recordId: string): Promise<string> {
  if (!isUuid(recordId)) throw new CrmAccessError('Record not found.');
  const rec = await loadRecordRaw(createServiceClient(), recordId);
  if (!rec || rec.module !== 'contacts' || !rec.mece_user_id) throw new CrmUserError('This contact has no MECE account.');
  if (rec.locked?.kind === 'dpdp_erased') throw new CrmUserError('This person’s data was erased.');
  return rec.mece_user_id;
}

export interface AccountDetail {
  userId: string;
  tier: string; subStartedAt: string | null; subExpiresAt: string | null;
  isAdmin: boolean; isDemo: boolean; market: 'IN' | 'US' | 'EU' | null; onboardedAt: string | null; createdAt: string;
  collegeEmail: string | null; collegeEmailVerifiedAt: string | null;
  showLinkedin: boolean | null; linkedinFollowClaimedAt: string | null; weeklyHoursTarget: number | null; goalText: string | null;
  points: number; streak: number; streakLastDate: string | null;
  submissionCount: number; avgScore: number | null; bestScore: number | null;
  coupons: Array<{ id: string; code: string; tier: string; period: string; paidPaise: number; discountPaise: number; createdAt: string }>;
  sessions: Array<{ id: string; ip: string | null; city: string | null; region: string | null; country: string | null; userAgent: string | null; deviceLabel: string | null; createdAt: string; lastSeenAt: string; revokedAt: string | null }>;
  recentSubmissions: Array<{ id: string; caseTitle: string; caseType: string | null; score: number | null; createdAt: string }>;
}

export async function accountDetail(ctx: CrmContext, recordId: string): Promise<AccountDetail> {
  needAdmin(ctx);
  const userId = await userIdOf(recordId);
  const svc = createServiceClient();
  const { data: uRaw } = await svc.from('users').select('*').eq('id', userId).maybeSingle();
  if (!uRaw) throw new CrmUserError('The MECE account no longer exists.');
  const u = uRaw as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  // optional tables may be missing on some environments; one missing table must not blank the panel
  const safe = async <T,>(p: PromiseLike<{ data: unknown }>): Promise<T[]> => { try { const { data } = await p; return (data as T[]) ?? []; } catch { return []; } };
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [coupons, sessions, subs] = await Promise.all([
    safe<any>(svc.from('coupon_redemptions').select('id, code, tier, period, paid_paise, discount_paise, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)),
    safe<any>(svc.from('user_sessions').select('id, ip, city, region, country, user_agent, device_label, created_at, last_seen_at, revoked_at').eq('user_id', userId).order('last_seen_at', { ascending: false }).limit(20)),
    safe<any>(svc.from('submissions').select('id, score, created_at, cases(title, type)').eq('user_id', userId).order('created_at', { ascending: false }).limit(400)),
  ]);
  const scored = subs.filter((s: any) => typeof s.score === 'number');
  await audit(svc, { actor_id: ctx.userId, action: 'account_view', module: 'contacts', record_id: recordId });
  return {
    userId,
    tier: effectiveTier(u as never), subStartedAt: u.subscription_started_at ?? null, subExpiresAt: u.subscription_expires_at ?? null,
    isAdmin: !!u.is_admin, isDemo: !!u.is_demo, market: u.market === 'IN' || u.market === 'US' || u.market === 'EU' ? u.market : null,
    onboardedAt: u.onboarding_completed_at ?? null, createdAt: u.created_at,
    collegeEmail: u.college_email ?? null, collegeEmailVerifiedAt: u.college_email_verified_at ?? null,
    showLinkedin: u.show_linkedin ?? null, linkedinFollowClaimedAt: u.linkedin_follow_claimed_at ?? null, weeklyHoursTarget: u.weekly_hours_target ?? null, goalText: u.goal_text ?? null,
    points: u.points ?? 0, streak: u.streak_count ?? 0, streakLastDate: u.streak_last_date ?? null,
    submissionCount: subs.length,
    avgScore: scored.length ? Math.round(scored.reduce((a: number, s: any) => a + s.score, 0) / scored.length) : null,
    bestScore: scored.length ? Math.max(...scored.map((s: any) => s.score)) : null,
    coupons: coupons.map((c: any) => ({ id: c.id, code: c.code, tier: c.tier, period: c.period, paidPaise: c.paid_paise, discountPaise: c.discount_paise, createdAt: c.created_at })),
    sessions: sessions.map((s: any) => ({ id: s.id, ip: s.ip, city: s.city, region: s.region, country: s.country, userAgent: s.user_agent, deviceLabel: s.device_label, createdAt: s.created_at, lastSeenAt: s.last_seen_at, revokedAt: s.revoked_at })),
    recentSubmissions: subs.slice(0, 25).map((s: any) => ({ id: s.id, caseTitle: s.cases?.title ?? 'Untitled', caseType: s.cases?.type ?? null, score: s.score, createdAt: s.created_at })),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function setDemo(ctx: CrmContext, recordId: string, isDemo: boolean) {
  needAdmin(ctx);
  const userId = await userIdOf(recordId);
  if (userId === ctx.userId) throw new CrmUserError('Don’t flag your own account as a demo.');
  const svc = createServiceClient();
  const { data, error } = await svc.from('users').update({ is_demo: !!isDemo }).eq('id', userId).select('id');
  if (error) throw error;
  if (!data?.length) throw new CrmUserError('The MECE account no longer exists.');
  await refreshContactFlags(svc, userId);
  await audit(svc, { actor_id: ctx.userId, action: 'account_demo_flag', module: 'contacts', record_id: recordId, meta: { isDemo: !!isDemo } });
}

export async function signOutAll(ctx: CrmContext, recordId: string) {
  needAdmin(ctx);
  const userId = await userIdOf(recordId);
  const svc = createServiceClient();
  const { data, error } = await svc.from('user_sessions').update({ revoked_at: new Date().toISOString(), revoked_by: 'admin' }).eq('user_id', userId).is('revoked_at', null).select('id');
  if (error) throw error;
  await audit(svc, { actor_id: ctx.userId, action: 'account_sign_out_all', module: 'contacts', record_id: recordId, meta: { sessions: data?.length ?? 0 } });
  return { count: data?.length ?? 0 };
}

export async function setMarket(ctx: CrmContext, recordId: string, market: string) {
  needAdmin(ctx);
  if (market !== 'IN' && market !== 'US' && market !== 'EU') throw new CrmUserError('Unknown market.');
  const userId = await userIdOf(recordId);
  const svc = createServiceClient();
  const { data, error } = await svc.from('users').update({ market }).eq('id', userId).select('id');
  if (error) throw error;
  if (!data?.length) throw new CrmUserError('The MECE account no longer exists.');
  await refreshContactFlags(svc, userId);
  await audit(svc, { actor_id: ctx.userId, action: 'account_market', module: 'contacts', record_id: recordId, meta: { market } });
}

const IST = 5.5 * 3_600_000;
const istDay = (t: string | number) => new Date(new Date(t).getTime() + IST).toISOString().slice(0, 10);

/** Revenue received + sign-up pulse (live from the app tables). */
export async function adminPulse(ctx: CrmContext) {
  needAdmin(ctx);
  const svc = createServiceClient();
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const today = istDay(Date.now());
  const weekAgo = istDay(Date.now() - 6 * 86_400_000);
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [revenue, total, guests, paid, recent] = await Promise.all([
    getRevenueSummary(svc),
    count(svc.from('users').select('id', { count: 'exact', head: true }).eq('is_guest', false)),
    count(svc.from('users').select('id', { count: 'exact', head: true }).eq('is_guest', true)),
    count(svc.from('users').select('id', { count: 'exact', head: true }).eq('is_guest', false).in('subscription_tier', ['lite', 'pro']).gt('subscription_expires_at', new Date().toISOString())),
    svc.from('users').select('created_at').eq('is_guest', false).gte('created_at', since).limit(20_000),
  ]);
  const days: Array<{ date: string; count: number }> = [];
  for (let i = 29; i >= 0; i--) days.push({ date: istDay(Date.now() - i * 86_400_000), count: 0 });
  const byDay = new Map(days.map((d) => [d.date, d]));
  for (const r of (recent.data ?? []) as Array<{ created_at: string }>) { const b = byDay.get(istDay(r.created_at)); if (b) b.count++; }
  return {
    revenue,
    users: { total, guests, paid, today: byDay.get(today)?.count ?? 0, week: days.filter((d) => d.date >= weekAgo).reduce((a, d) => a + d.count, 0) },
    signups: days,
  };
}
