import { unstable_noStore as noStore } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { Card } from '@/components/ui/card';
import JourneyDashboardClient from './client';

export const dynamic = 'force-dynamic';

/* ── Types shared by server → client ─────────────────────────────── */

export interface SessionSummary {
  session_id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  device: string | null;
  first_path: string;
  last_path: string;
  started_at: string;
  page_count: number;
  action_count: number;
  total_duration_ms: number;
  referrer: string | null;
  engagement: 'bounced' | 'browsing' | 'engaged' | 'converted';
  action_types: string[];
}

export interface RawPageEvent {
  id: number;
  occurred_at: string;
  session_id: string;
  user_id: string | null;
  kind: string;
  path: string;
  referrer: string | null;
  duration_ms: number | null;
  device: string | null;
}

export interface RawAction {
  id: number;
  occurred_at: string;
  session_id: string;
  user_id: string | null;
  path: string;
  action: string;
  category: string | null;
  label: string | null;
  value: Record<string, unknown> | null;
  device: string | null;
}

/* ── Funnel stage definitions ────────────────────────────────────── */
// NOTE (2026-09-12 analytics hardening): funnel stages are now computed from
// SOURCE-OF-TRUTH tables (users / case_attempts / submissions / payments), not
// from best-effort client `user_actions`. The previous action-based funnel
// under-counted every stage because the `complete_signup` / `complete_payment`
// client events frequently never fired (e.g. 28 real signups → 0 counted).
const FUNNEL_LABELS = {
  visited: 'Visited Site',
  signed_up: 'Signed Up',
  onboarded: 'Completed Onboarding',
  started: 'Started a Case',
  submitted: 'Submitted Case',
  viewed_pricing: 'Viewed Pricing',
  paid: 'Completed Payment',
} as const;

export interface UserSummary {
  user_id: string;
  name: string | null;
  email: string | null;
  session_count: number;
  total_pages: number;
  total_actions: number;
  total_duration_ms: number;
  last_active: string;
  first_seen: string;
  devices: string[];
  top_actions: string[];
  engagement: 'bounced' | 'browsing' | 'engaged' | 'converted';
}

export interface TopPage {
  path: string;
  views: number;
  sessions: number;
  avg_duration_ms: number | null;
}

export interface ExitPage {
  path: string;
  count: number;
}

/** One point on the traffic trend. Views and visitors are the same measure
 *  family and the same order of magnitude, so they share one y-axis. */
export interface TrendPoint {
  /** bucket start, YYYY-MM-DD (IST) */
  date: string;
  /** human label for the axis, e.g. "12 Sep" or "w/c 12 Sep" */
  label: string;
  views: number;
  visitors: number;
}

/** Window + fetch safety caps. Events are fetched NEWEST-first then re-sorted
 *  ascending in memory, so if a cap is hit we drop the OLDEST rows in the
 *  window (never the newest), and we surface a truncation flag to the UI. */
/** Selectable windows. `days: null` = all time.
 *
 *  COST NOTE: this page is a dynamic server component, so every range change is
 *  a fresh render on Vercel's Node/Fluid budget. That is one admin, a few loads
 *  a day — negligible — PROVIDED all-time does not pull the whole events table
 *  into memory to aggregate. It does not: the row fetches stay capped exactly as
 *  they are for 7 days, and the headline totals come from `count: 'exact',
 *  head: true` (a COUNT in Postgres, no rows over the wire). Detail panels are
 *  therefore built from the newest N events; the existing truncation banner
 *  already says so, and it matters more the wider the window.
 */
const RANGES = {
  '7d':  { days: 7,   label: 'Last 7 days' },
  '30d': { days: 30,  label: 'Last 30 days' },
  'all': { days: null as number | null, label: 'All time' },
} as const;
export type RangeKey = keyof typeof RANGES;

const WINDOW_DAYS = 7;
const PAGE_EVENTS_CAP = 20000;
const ACTIONS_CAP = 10000;
const SESSIONS_CAP = 1000; // sessions handed to the client (stats use all of these)
// PostgREST returns at most 1000 rows unless a limit is given. That cap was
// invisible while every user query was fenced to 7 days; on an all-time window
// it would quietly stop counting at a thousand signups and report it as fact.
const USER_ROW_CAP = 50_000;

const PLACEHOLDER_EMAIL_RE = /@(seed\.mece\.in|mece-seed\.local|leaderboard\.mece\.in)$/i;

/* ── Helpers ──────────────────────────────────────────────────────── */

/** Parse referrer URL to a human-readable source. */
function parseReferrerSource(ref: string | null): string | null {
  if (!ref) return null;
  try {
    const host = new URL(ref).hostname.replace(/^www\./, '');
    if (host.includes('google')) return 'Google';
    if (host.includes('bing')) return 'Bing';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('facebook') || host.includes('fb.com')) return 'Facebook';
    if (host.includes('twitter') || host.includes('x.com')) return 'Twitter / X';
    if (host.includes('youtube')) return 'YouTube';
    if (host.includes('whatsapp')) return 'WhatsApp';
    if (host.includes('t.me') || host.includes('telegram')) return 'Telegram';
    if (host.includes('reddit')) return 'Reddit';
    if (host.includes('mece.in') || host.includes('localhost')) return null; // internal
    return host;
  } catch {
    return null;
  }
}

/** Classify session engagement level based on behaviour. */
function classifyEngagement(
  pageCount: number,
  durationMs: number,
  actionTypes: string[],
): 'bounced' | 'browsing' | 'engaged' | 'converted' {
  const hasPayment = actionTypes.some(a => a === 'complete_payment');
  if (hasPayment) return 'converted';
  const hasHighValueAction = actionTypes.some(a =>
    ['start_case', 'submit_case', 'view_results', 'complete_signup', 'complete_onboarding',
     'generate_gd_brief', 'view_gd_brief', 'save_to_cheatsheet', 'initiate_checkout'].includes(a),
  );
  if (hasHighValueAction) return 'engaged';
  if (pageCount <= 1 && durationMs < 15_000) return 'bounced';
  return 'browsing';
}

/** IST hour (Asia/Kolkata, UTC+5:30) for an ISO timestamp, 0..23.
 *  The previous code used Date.getHours() which runs in the server's UTC tz,
 *  shifting the whole "when visitors come" chart by −5h30m for an India audience. */
function istHour(iso: string): number {
  const istMs = new Date(iso).getTime() + 5.5 * 60 * 60 * 1000;
  return new Date(istMs).getUTCHours();
}

export default async function AdminJourneysPage({
  searchParams,
}: {
  searchParams?: { range?: string };
}) {
  noStore();
  const svc = createServiceClient();

  const rangeKey: RangeKey =
    searchParams?.range === '30d' ? '30d' : searchParams?.range === 'all' ? 'all' : '7d';
  const range = RANGES[rangeKey];

  // null for all time. Every window filter below goes through `since()` so a
  // null start means "no filter" rather than an invalid date silently matching
  // nothing — the failure mode that turns an empty dashboard into a mystery.
  const windowStart: string | null =
    range.days === null ? null : new Date(Date.now() - range.days * 86_400_000).toISOString();

  const since = <T extends { gte: (col: string, v: string) => T }>(q: T, col: string): T =>
    windowStart ? q.gte(col, windowStart) : q;

  // ── Fetch recent events NEWEST-first (so a cap drops the oldest, not the
  //    newest), then sort ascending in memory for session reconstruction. ──
  const [pageRes, actionRes] = await Promise.all([
    since(
      svc
        .from('page_events')
        .select('id, occurred_at, session_id, user_id, kind, path, referrer, duration_ms, device'),
      'occurred_at',
    )
      .order('occurred_at', { ascending: false })
      .limit(PAGE_EVENTS_CAP),
    since(
      svc
        .from('user_actions')
        .select('id, occurred_at, session_id, user_id, path, action, category, label, value, device'),
      'occurred_at',
    )
      .order('occurred_at', { ascending: false })
      .limit(ACTIONS_CAP),
  ]);

  const asc = (a: { occurred_at: string }, b: { occurred_at: string }) =>
    new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime();

  const rawPageEvents = [...((pageRes.data as RawPageEvent[] | null) ?? [])].sort(asc);
  const rawActions = [...((actionRes.data as RawAction[] | null) ?? [])].sort(asc);
  const pageEventsTruncated = ((pageRes.data as unknown[] | null)?.length ?? 0) >= PAGE_EVENTS_CAP;
  const actionsTruncated = ((actionRes.data as unknown[] | null)?.length ?? 0) >= ACTIONS_CAP;
  const actionsTableMissing = !!actionRes.error && /user_actions|relation|does not exist/i.test(actionRes.error.message ?? '');

  // ── Exclude INTERNAL accounts from analytics ──────────────────────
  // Admins, the demo/showcase account, and seed/leaderboard placeholder
  // accounts are not real visitors and would pollute every metric. Real
  // guests (is_guest) are KEPT — they are genuine trial humans. Anonymous
  // events (no user_id) are always kept.
  const { data: exclRows } = await svc.from('users').select('id, is_admin, is_demo, email');
  const excludedIds = new Set<string>();
  for (const r of (exclRows ?? []) as { id: string; is_admin: boolean | null; is_demo: boolean | null; email: string | null }[]) {
    if (r.is_admin || r.is_demo) excludedIds.add(r.id);
    else if (typeof r.email === 'string' && PLACEHOLDER_EMAIL_RE.test(r.email)) excludedIds.add(r.id);
  }
  const keep = (uid: string | null) => !uid || !excludedIds.has(uid);
  const pageEvents = rawPageEvents.filter((e) => keep(e.user_id));
  const actions = rawActions.filter((a) => keep(a.user_id));

  // ── Aggregate sessions ────────────────────────────────────────────
  const sessionMap = new Map<string, {
    user_id: string | null;
    device: string | null;
    first_path: string;
    last_path: string;
    started_at: string;
    page_count: number;
    action_count: number;
    total_duration_ms: number;
    referrer: string | null;
    action_types: string[];
  }>();

  for (const ev of pageEvents) {
    if (ev.kind !== 'view') continue;
    let s = sessionMap.get(ev.session_id);
    if (!s) {
      s = {
        user_id: ev.user_id,
        device: ev.device,
        first_path: ev.path,
        last_path: ev.path,
        started_at: ev.occurred_at,
        page_count: 0,
        action_count: 0,
        total_duration_ms: 0,
        referrer: ev.referrer ?? null,
        action_types: [],
      };
      sessionMap.set(ev.session_id, s);
    }
    s.page_count += 1;
    s.last_path = ev.path;
    if (!s.user_id && ev.user_id) s.user_id = ev.user_id;
    // Keep first non-null referrer (usually on the landing page)
    if (!s.referrer && ev.referrer) s.referrer = ev.referrer;
  }

  // Attach duration from leave events
  for (const ev of pageEvents) {
    if (ev.kind !== 'leave' || !ev.duration_ms) continue;
    const s = sessionMap.get(ev.session_id);
    if (s) s.total_duration_ms += ev.duration_ms;
  }

  // Count actions per session and collect action types
  for (const a of actions) {
    const s = sessionMap.get(a.session_id);
    if (s) {
      s.action_count += 1;
      if (!s.action_types.includes(a.action)) s.action_types.push(a.action);
    }
  }

  // ── Resolve user names/emails for display ─────────────────────────
  const userIds = [...new Set(
    [...sessionMap.values()].map(s => s.user_id).filter((id): id is string => !!id)
  )];

  const userMap = new Map<string, { name: string | null; email: string | null }>();
  if (userIds.length > 0) {
    const { data: users } = await svc
      .from('users')
      .select('id, name, email')
      .in('id', userIds.slice(0, 500));
    for (const u of (users ?? []) as { id: string; name: string | null; email: string | null }[]) {
      userMap.set(u.id, { name: u.name, email: u.email });
    }
  }

  // Build session summaries, sorted most-recent first. We keep up to
  // SESSIONS_CAP (not 200) so the client's summary tiles reflect the whole
  // window; the client slices the visible LIST separately for rendering.
  const sessions: SessionSummary[] = Array.from(sessionMap.entries())
    .map(([session_id, s]) => {
      const userInfo = s.user_id ? userMap.get(s.user_id) : null;
      return {
        session_id,
        user_id: s.user_id,
        user_name: userInfo?.name ?? null,
        user_email: userInfo?.email ?? null,
        device: s.device,
        first_path: s.first_path,
        last_path: s.last_path,
        started_at: s.started_at,
        page_count: s.page_count,
        action_count: s.action_count,
        total_duration_ms: s.total_duration_ms,
        referrer: parseReferrerSource(s.referrer),
        engagement: classifyEngagement(s.page_count, s.total_duration_ms, s.action_types),
        action_types: s.action_types,
      };
    })
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    .slice(0, SESSIONS_CAP);

  // ── Funnel: computed from SOURCE-OF-TRUTH tables (not client events) ──
  const uniqueVisitorIds = new Set<string>();
  for (const ev of pageEvents) {
    if (ev.kind === 'view' && ev.user_id) uniqueVisitorIds.add(ev.user_id);
  }
  const uniqueAnonymousSessions = new Set<string>();
  for (const ev of pageEvents) {
    if (ev.kind === 'view' && !ev.user_id) uniqueAnonymousSessions.add(ev.session_id);
  }
  const totalVisitors = uniqueVisitorIds.size + uniqueAnonymousSessions.size;

  // Distinct real users who reached each milestone inside the window.
  const distinctReal = async (
    table: 'case_attempts' | 'submissions',
  ): Promise<number> => {
    const { data } = await since(svc.from(table).select('user_id'), 'created_at');
    const set = new Set<string>();
    for (const r of (data ?? []) as { user_id: string | null }[]) {
      if (r.user_id && keep(r.user_id)) set.add(r.user_id);
    }
    return set.size;
  };

  const [signupRows, onboardedRows, startedCount, submittedCount, paidRows] = await Promise.all([
    since(svc.from('users').select('id, email, is_admin, is_demo, is_guest, created_at'), 'created_at')
      .limit(USER_ROW_CAP),
    since(
      svc.from('users').select('id, email, is_admin, is_demo, is_guest, onboarding_completed_at'),
      'onboarding_completed_at',
    ).not('onboarding_completed_at', 'is', null).limit(USER_ROW_CAP),
    distinctReal('case_attempts'),
    distinctReal('submissions'),
    svc.from('payments').select('user_id, status, paid_at, created_at').eq('status', 'paid'),
  ]);

  const isRealUserRow = (r: { is_admin?: boolean | null; is_demo?: boolean | null; is_guest?: boolean | null; email?: string | null }) =>
    !r.is_admin && !r.is_demo && !r.is_guest && !(typeof r.email === 'string' && PLACEHOLDER_EMAIL_RE.test(r.email));

  const signedUp = ((signupRows.data ?? []) as any[]).filter(isRealUserRow).length;
  const onboarded = ((onboardedRows.data ?? []) as any[]).filter(isRealUserRow).length;

  // Pricing interest: distinct visitors who hit a pricing/upgrade path.
  const pricingVisitors = new Set<string>();
  for (const ev of pageEvents) {
    if (ev.kind === 'view' && /^\/(pricing|upgrade)/.test(ev.path)) {
      pricingVisitors.add(ev.user_id ?? `anon:${ev.session_id}`);
    }
  }

  // Paid conversions inside the window (distinct real users).
  const paidUsersInWindow = new Set<string>();
  const windowStartMs = windowStart ? new Date(windowStart).getTime() : 0;
  for (const p of (paidRows.data ?? []) as { user_id: string | null; paid_at: string | null; created_at: string }[]) {
    const when = p.paid_at ?? p.created_at;
    if (p.user_id && keep(p.user_id) && new Date(when).getTime() >= windowStartMs) paidUsersInWindow.add(p.user_id);
  }
  const paidLast7d = paidUsersInWindow.size;

  const funnelStages = [
    { label: FUNNEL_LABELS.visited, count: totalVisitors },
    { label: FUNNEL_LABELS.signed_up, count: signedUp },
    { label: FUNNEL_LABELS.onboarded, count: onboarded },
    { label: FUNNEL_LABELS.started, count: startedCount },
    { label: FUNNEL_LABELS.submitted, count: submittedCount },
    { label: FUNNEL_LABELS.viewed_pricing, count: pricingVisitors.size },
    { label: FUNNEL_LABELS.paid, count: paidLast7d },
  ];

  // ── Referrer distribution ─────────────────────────────────────────
  const referrerCounts = new Map<string, number>();
  let directCount = 0;
  for (const s of sessions) {
    if (s.referrer) {
      referrerCounts.set(s.referrer, (referrerCounts.get(s.referrer) ?? 0) + 1);
    } else {
      directCount += 1;
    }
  }
  const referrerBreakdown = [
    { source: 'Direct / Bookmark', count: directCount },
    ...[...referrerCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count })),
  ];

  // ── Hourly distribution (IST) ─────────────────────────────────────
  const hourlyViews = new Array(24).fill(0);
  for (const ev of pageEvents) {
    if (ev.kind === 'view') {
      hourlyViews[istHour(ev.occurred_at)] += 1;
    }
  }

  // ── Page flow (most common transitions) ───────────────────────────
  const flowCounts = new Map<string, number>();
  const sessionEvents = new Map<string, string[]>();
  for (const ev of pageEvents) {
    if (ev.kind !== 'view') continue;
    const list = sessionEvents.get(ev.session_id) ?? [];
    list.push(ev.path);
    sessionEvents.set(ev.session_id, list);
  }
  for (const paths of sessionEvents.values()) {
    for (let i = 0; i < paths.length - 1; i++) {
      const key = `${paths[i]} → ${paths[i + 1]}`;
      flowCounts.set(key, (flowCounts.get(key) ?? 0) + 1);
    }
  }
  const topFlows = [...flowCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([flow, count]) => ({ flow, count }));

  // ── Recently active users (grouped by user_id) ────────────────────
  const userSessionMap = new Map<string, {
    name: string | null;
    email: string | null;
    session_count: number;
    total_pages: number;
    total_actions: number;
    total_duration_ms: number;
    last_active: string;
    first_seen: string;
    devices: Set<string>;
    top_action_types: Map<string, number>;
    paths: Set<string>;
    engagement_best: 'bounced' | 'browsing' | 'engaged' | 'converted';
  }>();

  for (const s of sessions) {
    if (!s.user_id) continue;
    let u = userSessionMap.get(s.user_id);
    if (!u) {
      const info = userMap.get(s.user_id);
      u = {
        name: info?.name ?? null,
        email: info?.email ?? null,
        session_count: 0,
        total_pages: 0,
        total_actions: 0,
        total_duration_ms: 0,
        last_active: s.started_at,
        first_seen: s.started_at,
        devices: new Set(),
        top_action_types: new Map(),
        paths: new Set(),
        engagement_best: 'bounced',
      };
      userSessionMap.set(s.user_id, u);
    }
    u.session_count += 1;
    u.total_pages += s.page_count;
    u.total_actions += s.action_count;
    u.total_duration_ms += s.total_duration_ms;
    if (new Date(s.started_at) > new Date(u.last_active)) u.last_active = s.started_at;
    if (new Date(s.started_at) < new Date(u.first_seen)) u.first_seen = s.started_at;
    if (s.device) u.devices.add(s.device);
    u.paths.add(s.first_path);
    u.paths.add(s.last_path);
    for (const at of s.action_types) {
      u.top_action_types.set(at, (u.top_action_types.get(at) ?? 0) + 1);
    }
    const engOrder = { bounced: 0, browsing: 1, engaged: 2, converted: 3 };
    if (engOrder[s.engagement] > engOrder[u.engagement_best]) u.engagement_best = s.engagement;
  }

  const recentUsers: UserSummary[] = [...userSessionMap.entries()]
    .map(([user_id, u]) => ({
      user_id,
      name: u.name,
      email: u.email,
      session_count: u.session_count,
      total_pages: u.total_pages,
      total_actions: u.total_actions,
      total_duration_ms: u.total_duration_ms,
      last_active: u.last_active,
      first_seen: u.first_seen,
      devices: [...u.devices],
      top_actions: [...u.top_action_types.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([action]) => action),
      engagement: u.engagement_best,
    }))
    .sort((a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime());

  // ── Top pages (aggregate view counts + avg time) ──────────────────
  const byPath = new Map<string, { views: number; sessions: Set<string>; durSum: number; durN: number }>();
  const exitByPath = new Map<string, number>();
  let totalViews = 0;

  for (const ev of pageEvents) {
    if (ev.kind === 'view') {
      totalViews += 1;
      const g = byPath.get(ev.path) || { views: 0, sessions: new Set<string>(), durSum: 0, durN: 0 };
      g.views += 1;
      g.sessions.add(ev.session_id);
      byPath.set(ev.path, g);
    } else if (ev.kind === 'leave' && ev.duration_ms) {
      const g = byPath.get(ev.path);
      if (g) { g.durSum += ev.duration_ms; g.durN += 1; }
    }
  }
  // Exit pages: last viewed page per session
  for (const [, paths] of sessionEvents.entries()) {
    if (paths.length > 0) {
      const exitPath = paths[paths.length - 1];
      exitByPath.set(exitPath, (exitByPath.get(exitPath) ?? 0) + 1);
    }
  }

  const topPages: TopPage[] = [...byPath.entries()]
    .map(([path, g]) => ({
      path,
      views: g.views,
      sessions: g.sessions.size,
      avg_duration_ms: g.durN ? g.durSum / g.durN : null,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);

  const exitPages: ExitPage[] = [...exitByPath.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Total distinct sessions in the window (for an honest exit-% denominator).
  const totalSessionsInWindow = sessionEvents.size;

  // ── Exact totals, independent of the row caps ─────────────────────
  // `head: true` asks Postgres for a COUNT and returns no rows, so this stays
  // cheap on an all-time window where the row fetch above is capped. It does
  // NOT exclude internal accounts (that needs the rows) — so it is reported as
  // "recorded", distinct from the filtered `totalViews`, rather than quietly
  // replacing it. Two numbers that measure different things get two names.
  const exactViewsRes = await since(
    svc.from('page_events').select('id', { count: 'exact', head: true }).eq('kind', 'view'),
    'occurred_at',
  );
  const exactViewsRecorded = exactViewsRes.count ?? null;

  // ── Traffic trend ─────────────────────────────────────────────────
  // Daily buckets up to ~60 points, weekly beyond, so all-time stays readable
  // instead of becoming a thousand one-pixel columns.
  const trend: TrendPoint[] = (() => {
    const views = pageEvents.filter((e) => e.kind === 'view');
    if (views.length === 0) return [];

    const firstMs = new Date(views[0].occurred_at).getTime();
    const startMs = windowStart ? new Date(windowStart).getTime() : firstMs;
    const spanDays = Math.max(1, Math.ceil((Date.now() - startMs) / 86_400_000));
    const weekly = spanDays > 60;
    const stepMs = weekly ? 7 * 86_400_000 : 86_400_000;

    // Anchor buckets to IST day starts so they line up with every other date in
    // the product (streaks, daily_schedule, the signups chart).
    const istDayStartMs = (ms: number) => {
      const key = new Date(ms + 5.5 * 3600_000).toISOString().slice(0, 10);
      return new Date(key + 'T00:00:00.000Z').getTime() - 5.5 * 3600_000;
    };

    const originMs = istDayStartMs(startMs);
    const bucketIndex = (ms: number) => Math.floor((ms - originMs) / stepMs);
    const lastIndex = bucketIndex(Date.now());

    const byIndex = new Map<number, { views: number; visitors: Set<string> }>();
    for (let i = 0; i <= lastIndex; i++) byIndex.set(i, { views: 0, visitors: new Set() });

    for (const ev of views) {
      const i = bucketIndex(new Date(ev.occurred_at).getTime());
      const b = byIndex.get(i);
      if (!b) continue;
      b.views += 1;
      b.visitors.add(ev.user_id ?? `anon:${ev.session_id}`);
    }

    const fmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
    return [...byIndex.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([i, b]) => {
        const ms = originMs + i * stepMs;
        return {
          date: new Date(ms + 5.5 * 3600_000).toISOString().slice(0, 10),
          label: (weekly ? 'w/c ' : '') + fmt.format(new Date(ms)),
          views: b.views,
          visitors: b.visitors.size,
        };
      });
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every visitor&apos;s path through the product — signed-in and anonymous alike. Internal accounts (admin, demo, seed) are excluded. Funnel &amp; conversions are computed from source-of-truth tables. Times shown in IST. {range.label}.
        </p>
      </div>

      {actionsTableMissing && (
        <Card className="border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
          The <code>user_actions</code> table doesn&apos;t exist yet. Run migration{' '}
          <code>0056_user_actions.sql</code> in Supabase, then reload. Action tracking will start collecting once it&apos;s live.
        </Card>
      )}

      {(pageEventsTruncated || actionsTruncated) && (
        <Card className="border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
          Heads up: this window has more events than the dashboard loads at once
          (cap {PAGE_EVENTS_CAP.toLocaleString('en-IN')} page events / {ACTIONS_CAP.toLocaleString('en-IN')} actions).
          The <strong>newest</strong> events are shown; the oldest in the window are omitted. Traffic-level totals are safe; move to daily rollups before relying on this at higher volume.
        </Card>
      )}

      <JourneyDashboardClient
        sessions={sessions}
        pageEvents={pageEvents}
        actions={actions}
        funnelStages={funnelStages}
        referrerBreakdown={referrerBreakdown}
        hourlyViews={hourlyViews}
        topFlows={topFlows}
        recentUsers={recentUsers}
        topPages={topPages}
        exitPages={exitPages}
        totalViews={totalViews}
        paidLast7d={paidLast7d}
        totalSessionsInWindow={totalSessionsInWindow}
        trend={trend}
        rangeKey={rangeKey}
        rangeLabel={range.label}
        exactViewsRecorded={exactViewsRecorded}
      />
    </div>
  );
}
