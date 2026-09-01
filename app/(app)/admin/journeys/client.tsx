'use client';

/**
 * JourneyDashboardClient — interactive admin dashboard for user journeys.
 *
 * Four tabs:
 *   1. Sessions — searchable, filterable list with drill-down timeline
 *   2. Conversion Funnel — multi-step drop-off visualization
 *   3. Traffic Sources — referrer breakdown + hourly distribution
 *   4. Page Flows — most common page transitions
 *
 * Handles all visitors: signed-in users AND anonymous visitors.
 */

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { anonLabel } from '@/lib/analytics';
import { Card } from '@/components/ui/card';
import JourneyTimeline, { type TimelineEvent } from '@/components/admin/journey-timeline';
import JourneyFunnel from '@/components/admin/journey-funnel';
import {
  Smartphone, Monitor, ArrowRight, Clock, MousePointerClick,
  Eye, Search, ChevronLeft, Layers, Filter as FilterIcon,
  UserX, UserCheck, Users, Globe, TrendingUp, Zap, XCircle,
  BarChart3, Route,
} from 'lucide-react';
import type { SessionSummary, RawPageEvent, RawAction, UserSummary, TopPage, ExitPage } from './page';

interface Props {
  sessions: SessionSummary[];
  pageEvents: RawPageEvent[];
  actions: RawAction[];
  funnelStages: { label: string; count: number }[];
  referrerBreakdown: { source: string; count: number }[];
  hourlyViews: number[];
  topFlows: { flow: string; count: number }[];
  recentUsers: UserSummary[];
  topPages: TopPage[];
  exitPages: ExitPage[];
  totalViews: number;
}

type Tab = 'sessions' | 'users' | 'pages' | 'funnel' | 'traffic' | 'flows';
type UserTypeFilter = 'all' | 'anonymous' | 'signed_in';
type EngagementFilter = 'all' | 'bounced' | 'browsing' | 'engaged' | 'converted';

const ENGAGEMENT_BADGES: Record<string, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  bounced:   { label: 'Bounced',   color: 'bg-red-500/10 text-red-600',     icon: XCircle },
  browsing:  { label: 'Browsing',  color: 'bg-gray-500/10 text-gray-600',   icon: Eye },
  engaged:   { label: 'Engaged',   color: 'bg-blue-500/10 text-blue-600',   icon: Zap },
  converted: { label: 'Converted', color: 'bg-green-500/10 text-green-600', icon: TrendingUp },
};

function fmtDur(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${time}`;
}

export default function JourneyDashboardClient({
  sessions, pageEvents, actions, funnelStages,
  referrerBreakdown, hourlyViews, topFlows,
  recentUsers, topPages, exitPages, totalViews,
}: Props) {
  const router = useRouter();
  // Keep the dashboard near real-time: the page is force-dynamic, so refreshing
  // re-runs the server fetch. Poll every 25s (only while the tab is visible, so a
  // backgrounded admin tab doesn't hammer the DB).
  useEffect(() => {
    const tick = () => { if (document.visibilityState === 'visible') router.refresh(); };
    const t = setInterval(tick, 25000);
    return () => clearInterval(t);
  }, [router]);

  const [tab, setTab] = useState<Tab>('sessions');
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'mobile' | 'desktop'>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>('all');
  const [engagementFilter, setEngagementFilter] = useState<EngagementFilter>('all');

  // ── Filtered sessions ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = sessions;
    if (deviceFilter !== 'all') list = list.filter(s => s.device === deviceFilter);
    if (userTypeFilter === 'anonymous') list = list.filter(s => !s.user_id);
    else if (userTypeFilter === 'signed_in') list = list.filter(s => !!s.user_id);
    if (engagementFilter !== 'all') list = list.filter(s => s.engagement === engagementFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.user_name?.toLowerCase().includes(q)) ||
        (s.user_email?.toLowerCase().includes(q)) ||
        s.session_id.toLowerCase().includes(q) ||
        s.first_path.toLowerCase().includes(q) ||
        s.last_path.toLowerCase().includes(q) ||
        (s.referrer?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [sessions, search, deviceFilter, userTypeFilter, engagementFilter]);

  // ── Build timeline events for selected session ────────────────────
  const timelineEvents: TimelineEvent[] = useMemo(() => {
    if (!selectedSession) return [];
    const pEvents: TimelineEvent[] = pageEvents
      .filter(ev => ev.session_id === selectedSession)
      .map(ev => ({
        id: ev.id,
        type: ev.kind as 'view' | 'leave',
        path: ev.path,
        occurred_at: ev.occurred_at,
        duration_ms: ev.duration_ms,
      }));
    const aEvents: TimelineEvent[] = actions
      .filter(a => a.session_id === selectedSession)
      .map(a => ({
        id: a.id,
        type: 'action' as const,
        path: a.path,
        occurred_at: a.occurred_at,
        action: a.action,
        category: a.category,
        label: a.label,
        value: a.value,
      }));
    return [...pEvents, ...aEvents].sort(
      (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()
    );
  }, [selectedSession, pageEvents, actions]);

  // ── Stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = sessions.length;
    const anon = sessions.filter(s => !s.user_id).length;
    const signedIn = total - anon;
    const bounced = sessions.filter(s => s.engagement === 'bounced').length;
    const engaged = sessions.filter(s => s.engagement === 'engaged').length;
    const converted = sessions.filter(s => s.engagement === 'converted').length;
    const avgPages = total ? (sessions.reduce((sum, s) => sum + s.page_count, 0) / total).toFixed(1) : '0';
    const avgDur = total ? fmtDur(sessions.reduce((sum, s) => sum + s.total_duration_ms, 0) / total) : '—';
    const mobilePct = total ? Math.round((sessions.filter(s => s.device === 'mobile').length / total) * 100) : 0;
    const bouncePct = total ? Math.round((bounced / total) * 100) : 0;
    // Anonymous insights
    const anonList = sessions.filter(s => !s.user_id);
    const anonAvgPages = anonList.length ? (anonList.reduce((sum, s) => sum + s.page_count, 0) / anonList.length).toFixed(1) : '0';
    const anonAvgDur = anonList.length ? fmtDur(anonList.reduce((sum, s) => sum + s.total_duration_ms, 0) / anonList.length) : '—';
    const anonBounce = anonList.length ? Math.round((anonList.filter(s => s.engagement === 'bounced').length / anonList.length) * 100) : 0;
    const entryMap = new Map<string, number>();
    const exitMap = new Map<string, number>();
    for (const s of anonList) {
      entryMap.set(s.first_path, (entryMap.get(s.first_path) ?? 0) + 1);
      exitMap.set(s.last_path, (exitMap.get(s.last_path) ?? 0) + 1);
    }
    const anonEntries = [...entryMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([path, count]) => ({ path, count, pct: Math.round((count / (anonList.length || 1)) * 100) }));
    const anonExits = [...exitMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([path, count]) => ({ path, count, pct: Math.round((count / (anonList.length || 1)) * 100) }));
    return {
      total, anon, signedIn, bounced, engaged, converted,
      avgPages, avgDur, mobilePct, bouncePct,
      anonAvgPages, anonAvgDur, anonBounce, anonEntries, anonExits,
    };
  }, [sessions]);

  const selectedSessionData = selectedSession ? sessions.find(s => s.session_id === selectedSession) : null;
  const maxHourly = Math.max(...hourlyViews, 1);

  return (
    <div className="space-y-4">
      {/* ── Summary Tiles ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {([
          ['Sessions', stats.total.toLocaleString('en-IN')],
          ['Anonymous', `${stats.anon}`, `${stats.total ? Math.round((stats.anon / stats.total) * 100) : 0}%`],
          ['Signed In', `${stats.signedIn}`],
          ['Bounced', `${stats.bouncePct}%`],
          ['Engaged', `${stats.engaged}`],
          ['Converted', `${stats.converted}`],
          ['Pages/session', stats.avgPages],
          ['Avg duration', stats.avgDur],
        ] as [string, string, string?][]).map(([label, value, sub]) => (
          <Card key={label} className="p-2.5">
            <div className="text-base font-bold tabular-nums text-foreground">{value}</div>
            <div className="text-[10px] text-muted-foreground">
              {label}{sub && <span className="ml-1 opacity-60">({sub})</span>}
            </div>
          </Card>
        ))}
      </div>

      {/* ── Anonymous Insight Card ───────────────────────────────────── */}
      {stats.anon > 0 && (
        <Card className="border-orange-500/20 bg-orange-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserX className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-foreground">Anonymous Visitors — Not Yet Signed Up</h3>
            <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-600">
              {stats.anon.toLocaleString('en-IN')} sessions
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="text-base font-bold tabular-nums">{stats.anonAvgPages}</div>
              <div className="text-[11px] text-muted-foreground">Pages / session</div>
            </div>
            <div>
              <div className="text-base font-bold tabular-nums">{stats.anonAvgDur}</div>
              <div className="text-[11px] text-muted-foreground">Avg duration</div>
            </div>
            <div>
              <div className={`text-base font-bold tabular-nums ${stats.anonBounce > 60 ? 'text-red-500' : ''}`}>{stats.anonBounce}%</div>
              <div className="text-[11px] text-muted-foreground">Bounce rate</div>
            </div>
            <div>
              <div className="text-base font-bold tabular-nums">{stats.total ? Math.round((stats.signedIn / stats.total) * 100) : 0}%</div>
              <div className="text-[11px] text-muted-foreground">Sign-up rate</div>
            </div>
          </div>
          {(stats.anonEntries.length > 0 || stats.anonExits.length > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {stats.anonEntries.length > 0 && (
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Where they land</div>
                  {stats.anonEntries.map(p => (
                    <div key={p.path} className="flex items-center justify-between text-xs py-0.5">
                      <span className="truncate max-w-[200px] text-foreground">{p.path}</span>
                      <span className="tabular-nums text-muted-foreground ml-2">{p.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
              {stats.anonExits.length > 0 && (
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Where they leave</div>
                  {stats.anonExits.map(p => (
                    <div key={p.path} className="flex items-center justify-between text-xs py-0.5">
                      <span className="truncate max-w-[200px] text-foreground">{p.path}</span>
                      <span className="tabular-nums text-muted-foreground ml-2">{p.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
        {([
          { key: 'sessions' as Tab, label: 'Sessions', icon: Layers },
          { key: 'users' as Tab, label: 'Recently Active', icon: Users },
          { key: 'pages' as Tab, label: 'Top Pages', icon: BarChart3 },
          { key: 'funnel' as Tab, label: 'Funnel', icon: FilterIcon },
          { key: 'traffic' as Tab, label: 'Traffic Sources', icon: Globe },
          { key: 'flows' as Tab, label: 'Page Flows', icon: Route },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSelectedSession(null); }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── TAB: SESSIONS ──────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {tab === 'sessions' && !selectedSession && (
        <Card className="overflow-hidden p-0">
          {/* Filters */}
          <div className="flex flex-col gap-2 border-b border-border bg-muted/40 px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name, email, path, or referrer…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* User type */}
                <div className="flex items-center gap-0.5">
                  {([
                    { key: 'all' as UserTypeFilter, label: 'All', icon: Users },
                    { key: 'anonymous' as UserTypeFilter, label: 'Anon', icon: UserX },
                    { key: 'signed_in' as UserTypeFilter, label: 'Users', icon: UserCheck },
                  ]).map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setUserTypeFilter(key)}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                        userTypeFilter === key ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    ><Icon className="h-3 w-3" />{label}</button>
                  ))}
                </div>
                {/* Device */}
                <div className="flex items-center gap-0.5">
                  {(['all', 'mobile', 'desktop'] as const).map(d => (
                    <button key={d} onClick={() => setDeviceFilter(d)}
                      className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                        deviceFilter === d ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >{d === 'all' ? 'All' : d === 'mobile' ? '📱' : '🖥'}</button>
                  ))}
                </div>
                {/* Engagement */}
                <div className="flex items-center gap-0.5">
                  {(['all', 'bounced', 'browsing', 'engaged', 'converted'] as EngagementFilter[]).map(e => (
                    <button key={e} onClick={() => setEngagementFilter(e)}
                      className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                        engagementFilter === e ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >{e === 'all' ? 'All' : e.charAt(0).toUpperCase() + e.slice(1)}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Session list */}
          <div className="divide-y divide-border">
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {search ? 'No sessions match your search.' : 'No sessions recorded yet.'}
              </div>
            )}
            {filtered.map(s => {
              const badge = ENGAGEMENT_BADGES[s.engagement];
              const BadgeIcon = badge.icon;
              return (
                <button
                  key={s.session_id}
                  onClick={() => setSelectedSession(s.session_id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  {/* Device + anonymous dot */}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    {s.device === 'mobile'
                      ? <Smartphone className="h-4 w-4 text-muted-foreground" />
                      : <Monitor className="h-4 w-4 text-muted-foreground" />}
                    {!s.user_id && <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-orange-500 border-2 border-card" />}
                  </div>

                  {/* User + path */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {s.user_name || s.user_email || anonLabel(s.session_id)}
                      </span>
                      <span className={`shrink-0 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.color}`}>
                        <BadgeIcon className="h-2.5 w-2.5" />{badge.label}
                      </span>
                      {s.referrer && (
                        <span className="shrink-0 rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">
                          via {s.referrer}
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground">{fmtDate(s.started_at)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span className="max-w-[120px] truncate">{s.first_path}</span>
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      <span className="max-w-[120px] truncate">{s.last_path}</span>
                      {s.action_types.length > 0 && (
                        <span className="ml-1 text-[10px] text-blue-500">
                          [{s.action_types.slice(0, 3).join(', ')}{s.action_types.length > 3 ? '…' : ''}]
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex shrink-0 items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1" title="Pages"><Eye className="h-3 w-3" />{s.page_count}</span>
                    {s.action_count > 0 && (
                      <span className="flex items-center gap-1 text-blue-500" title="Actions"><MousePointerClick className="h-3 w-3" />{s.action_count}</span>
                    )}
                    <span className="flex items-center gap-1" title="Duration"><Clock className="h-3 w-3" />{fmtDur(s.total_duration_ms)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── SESSION DRILL-DOWN ───────────────────────────────────────── */}
      {tab === 'sessions' && selectedSession && selectedSessionData && (
        <div className="space-y-4">
          <button onClick={() => setSelectedSession(null)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" /> Back to sessions
          </button>

          <Card className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-foreground">
                    {selectedSessionData.user_name || selectedSessionData.user_email || anonLabel(selectedSessionData.session_id)}
                  </h2>
                  {!selectedSessionData.user_id && (
                    <span className="rounded bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-600">Not signed up</span>
                  )}
                  {(() => {
                    const b = ENGAGEMENT_BADGES[selectedSessionData.engagement];
                    const I = b.icon;
                    return <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${b.color}`}><I className="h-2.5 w-2.5" />{b.label}</span>;
                  })()}
                </div>
                {selectedSessionData.user_email && selectedSessionData.user_name && (
                  <p className="text-xs text-muted-foreground">{selectedSessionData.user_email}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{fmtDate(selectedSessionData.started_at)}</span>
                <span className="flex items-center gap-1">
                  {selectedSessionData.device === 'mobile' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                  {selectedSessionData.device ?? 'Unknown'}
                </span>
                {selectedSessionData.referrer && (
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" />via {selectedSessionData.referrer}</span>
                )}
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{selectedSessionData.page_count} pages</span>
                <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{selectedSessionData.action_count} actions</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{fmtDur(selectedSessionData.total_duration_ms)}</span>
              </div>
            </div>
            {/* Action types summary */}
            {selectedSessionData.action_types.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedSessionData.action_types.map(a => (
                  <span key={a} className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                    {a.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Journey Timeline</h3>
            <JourneyTimeline events={timelineEvents} userId={selectedSessionData.user_id} />
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── TAB: FUNNEL ────────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {tab === 'funnel' && (
        <Card className="p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Conversion Funnel</h3>
            <p className="text-[11px] text-muted-foreground">
              How visitors progress from landing on the site to becoming paying customers. Includes all visitors — signed-in and anonymous. Last 7 days.
            </p>
          </div>
          <JourneyFunnel stages={funnelStages} />
          <p className="mt-3 text-[11px] text-muted-foreground">
            The gap between &quot;Visited Site&quot; and &quot;Signed Up&quot; represents anonymous visitors who left without creating an account.
          </p>
        </Card>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── TAB: TRAFFIC SOURCES ───────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {tab === 'traffic' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Referrer breakdown */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Where Visitors Come From</h3>
            <div className="space-y-2">
              {referrerBreakdown.map(({ source, count }) => {
                const total = referrerBreakdown.reduce((s, r) => s + r.count, 0) || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-medium text-foreground">{source}</span>
                      <span className="tabular-nums text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500/60" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {referrerBreakdown.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">No referrer data yet.</p>
              )}
            </div>
          </Card>

          {/* Hourly distribution */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">When Visitors Come (by Hour)</h3>
            <div className="flex items-end gap-[3px] h-32">
              {hourlyViews.map((count, hour) => (
                <div key={hour} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  <div className="absolute -top-5 hidden group-hover:block rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background whitespace-nowrap z-10">
                    {hour}:00 — {count} views
                  </div>
                  <div
                    className="w-full rounded-t bg-blue-500/60 hover:bg-blue-500/80 transition-colors"
                    style={{ height: `${Math.max(2, (count / maxHourly) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── TAB: PAGE FLOWS ────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {tab === 'flows' && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Most Common Page Transitions</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">How visitors navigate between pages — the most frequent paths taken.</p>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">#</th>
                <th className="px-4 py-2 text-left font-medium">From Page</th>
                <th className="px-4 py-2 text-center font-medium" />
                <th className="px-4 py-2 text-left font-medium">To Page</th>
                <th className="px-4 py-2 text-right font-medium">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topFlows.map((f, i) => {
                const parts = f.flow.split(' → ');
                const maxFlow = topFlows[0]?.count || 1;
                return (
                  <tr key={f.flow}>
                    <td className="px-4 py-2 tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-foreground max-w-[180px] truncate">{parts[0]}</td>
                    <td className="px-2 py-2 text-center"><ArrowRight className="inline h-3 w-3 text-muted-foreground" /></td>
                    <td className="px-4 py-2 font-medium text-foreground max-w-[180px] truncate">{parts[1]}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500/60" style={{ width: `${(f.count / maxFlow) * 100}%` }} />
                        </div>
                        <span className="tabular-nums text-foreground font-medium w-8 text-right">{f.count}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {topFlows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Not enough data for flow analysis yet.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── TAB: RECENTLY ACTIVE USERS ─────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {tab === 'users' && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recently Active Users</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Signed-in users sorted by last activity. {recentUsers.length} users active in the last 7 days.
            </p>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No signed-in user activity yet.</div>
            )}
            {recentUsers.map(u => {
              const badge = ENGAGEMENT_BADGES[u.engagement];
              const BadgeIcon = badge.icon;
              return (
                <div key={u.user_id} className="flex items-start gap-3 px-4 py-3">
                  {/* Avatar circle */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {(u.name?.[0] ?? u.email?.[0] ?? '?').toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {u.name || u.email || 'Unknown'}
                      </span>
                      <span className={`shrink-0 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.color}`}>
                        <BadgeIcon className="h-2.5 w-2.5" />{badge.label}
                      </span>
                    </div>
                    {u.name && u.email && (
                      <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Last: {fmtDate(u.last_active)}</span>
                      <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{u.session_count} sessions</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{u.total_pages} pages</span>
                      {u.total_actions > 0 && (
                        <span className="flex items-center gap-1 text-blue-500"><MousePointerClick className="h-3 w-3" />{u.total_actions} actions</span>
                      )}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{fmtDur(u.total_duration_ms)} total</span>
                      {u.devices.map(d => (
                        <span key={d}>{d === 'mobile' ? '📱' : '🖥'}</span>
                      ))}
                    </div>
                    {/* Action tags */}
                    {u.top_actions.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {u.top_actions.map(a => (
                          <span key={a} className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                            {a.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── TAB: TOP PAGES & EXIT PAGES ────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {tab === 'pages' && (
        <div className="space-y-4">
          {/* Total views stat */}
          <Card className="p-3 w-fit">
            <div className="text-base font-bold tabular-nums text-foreground">{totalViews.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-muted-foreground">Total page views (last 7 days)</div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Top pages */}
            <Card className="overflow-hidden p-0">
              <div className="border-b border-border bg-muted/40 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top Pages</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Path</th>
                      <th className="px-4 py-2 text-right font-medium">Views</th>
                      <th className="px-4 py-2 text-right font-medium">Sessions</th>
                      <th className="px-4 py-2 text-right font-medium">Avg time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topPages.map(p => (
                      <tr key={p.path}>
                        <td className="max-w-[220px] truncate px-4 py-2 font-medium text-foreground">{p.path}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{p.views}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{p.sessions}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                          {p.avg_duration_ms != null ? fmtDur(p.avg_duration_ms) : '—'}
                        </td>
                      </tr>
                    ))}
                    {topPages.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No page views yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Exit pages */}
            <Card className="overflow-hidden p-0">
              <div className="border-b border-border bg-muted/40 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Where Journeys End</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Exit page</th>
                      <th className="px-4 py-2 text-right font-medium">Sessions ended</th>
                      <th className="px-4 py-2 text-right font-medium">% of sessions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {exitPages.map(p => (
                      <tr key={p.path}>
                        <td className="max-w-[220px] truncate px-4 py-2 font-medium text-foreground">{p.path}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{p.count}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                          {sessions.length ? Math.round((p.count / sessions.length) * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                    {exitPages.length === 0 && (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No sessions yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                A page with many exits and low avg time is a friction point worth fixing.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
