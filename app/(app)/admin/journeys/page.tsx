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

const FUNNEL_ACTIONS = [
  { label: 'Visited Site', action: null, kind: 'view' },
  { label: 'Signed Up', action: 'complete_signup', kind: 'action' },
  { label: 'Completed Onboarding', action: 'complete_onboarding', kind: 'action' },
  { label: 'Started a Case', action: 'start_case', kind: 'action' },
  { label: 'Submitted Case', action: 'submit_case', kind: 'action' },
  { label: 'Viewed Results', action: 'view_results', kind: 'action' },
  { label: 'Viewed Pricing', action: 'view_pricing', kind: 'action' },
  { label: 'Completed Payment', action: 'complete_payment', kind: 'action' },
];

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

export default async function AdminJourneysPage() {
  noStore();
  const svc = createServiceClient();

  // ── Fetch recent sessions (last 7 days, max 10k events) ───────────
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [pageRes, actionRes] = await Promise.all([
    svc
      .from('page_events')
      .select('id, occurred_at, session_id, user_id, kind, path, referrer, duration_ms, device')
      .gte('occurred_at', sevenDaysAgo)
      .order('occurred_at', { ascending: true })
      .limit(10000),
    svc
      .from('user_actions')
      .select('id, occurred_at, session_id, user_id, path, action, category, label, value, device')
      .gte('occurred_at', sevenDaysAgo)
      .order('occurred_at', { ascending: true })
      .limit(5000),
  ]);

  const pageEvents = (pageRes.data as RawPageEvent[] | null) ?? [];
  const actions = (actionRes.data as RawAction[] | null) ?? [];
  const actionsTableMissing = !!actionRes.error && /user_actions|relation|does not exist/i.test(actionRes.error.message ?? '');

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
      .in('id', userIds.slice(0, 200));
    for (const u of (users ?? []) as { id: string; name: string | null; email: string | null }[]) {
      userMap.set(u.id, { name: u.name, email: u.email });
    }
  }

  // Build session summaries, sorted most-recent first
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
    .slice(0, 200);

  // ── Build funnel data ─────────────────────────────────────────────
  const uniqueVisitorIds = new Set<string>();
  for (const ev of pageEvents) {
    if (ev.kind === 'view' && ev.user_id) uniqueVisitorIds.add(ev.user_id);
  }
  const uniqueAnonymousSessions = new Set<string>();
  for (const ev of pageEvents) {
    if (ev.kind === 'view' && !ev.user_id) uniqueAnonymousSessions.add(ev.session_id);
  }
  const totalVisitors = uniqueVisitorIds.size + uniqueAnonymousSessions.size;

  const funnelStages = FUNNEL_ACTIONS.map(({ label, action, kind }) => {
    if (kind === 'view') {
      return { label, count: totalVisitors };
    }
    const usersWhoDidThis = new Set<string>();
    for (const a of actions) {
      if (a.action === action && a.user_id) usersWhoDidThis.add(a.user_id);
    }
    return { label, count: usersWhoDidThis.size };
  });

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

  // ── Hourly distribution ───────────────────────────────────────────
  const hourlyViews = new Array(24).fill(0);
  for (const ev of pageEvents) {
    if (ev.kind === 'view') {
      const hour = new Date(ev.occurred_at).getHours();
      hourlyViews[hour] += 1;
    }
  }

  // ── Page flow (most common transitions) ───────────────────────────
  const flowCounts = new Map<string, number>();
  // Group events by session, then build transitions
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">User Journeys</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track every visitor&apos;s path through the product — signed-in users and anonymous visitors alike. Where they came from, what they did, how long they stayed, and where they dropped off. Last 7 days.
        </p>
      </div>

      {actionsTableMissing && (
        <Card className="border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
          The <code>user_actions</code> table doesn&apos;t exist yet. Run migration{' '}
          <code>0056_user_actions.sql</code> in Supabase, then reload. Action tracking will start collecting once it&apos;s live.
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
      />
    </div>
  );
}
