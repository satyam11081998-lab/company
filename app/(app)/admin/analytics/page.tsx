import { unstable_noStore as noStore } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { Card } from '@/components/ui/card';

// Admin gating happens in the parent admin layout (users.is_admin).
export const dynamic = 'force-dynamic';

const WINDOW_LIMIT = 8000; // most-recent events to aggregate

interface Ev {
  session_id: string;
  user_id: string | null;
  kind: string;
  path: string;
  duration_ms: number | null;
  device: string | null;
  occurred_at: string;
}

function fmtDur(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

export default async function AdminAnalyticsPage() {
  noStore();
  const svc = createServiceClient();

  const { data, error } = await svc
    .from('page_events')
    .select('session_id, user_id, kind, path, duration_ms, device, occurred_at')
    .order('occurred_at', { ascending: false })
    .limit(WINDOW_LIMIT);

  const events = (data as Ev[] | null) || [];

  // ── aggregate ──────────────────────────────────────────────────────────
  const byPath = new Map<string, { views: number; sessions: Set<string>; durSum: number; durN: number }>();
  const sessions = new Set<string>();
  const exitByPath = new Map<string, number>();
  const seenExit = new Set<string>();
  let totalViews = 0;
  let durSum = 0;
  let durN = 0;
  let mobile = 0;
  let desktop = 0;

  for (const e of events) {
    sessions.add(e.session_id);
    if (e.kind === 'view') {
      totalViews += 1;
      const g = byPath.get(e.path) || { views: 0, sessions: new Set<string>(), durSum: 0, durN: 0 };
      g.views += 1;
      g.sessions.add(e.session_id);
      byPath.set(e.path, g);
      if (e.device === 'mobile') mobile += 1;
      else if (e.device === 'desktop') desktop += 1;
    } else if (typeof e.duration_ms === 'number') {
      durSum += e.duration_ms;
      durN += 1;
      const g = byPath.get(e.path);
      if (g) {
        g.durSum += e.duration_ms;
        g.durN += 1;
      }
    }
    // events are newest-first, so the FIRST one seen per session is its last → its exit page
    if (!seenExit.has(e.session_id)) {
      seenExit.add(e.session_id);
      exitByPath.set(e.path, (exitByPath.get(e.path) || 0) + 1);
    }
  }

  const topPages = Array.from(byPath.entries())
    .map(([path, g]) => ({
      path,
      views: g.views,
      sessions: g.sessions.size,
      avg: g.durN ? g.durSum / g.durN : null,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);

  const exitPages = Array.from(exitByPath.entries())
    .map(([path, n]) => ({ path, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 10);

  const uniqueSessions = sessions.size;
  const avgPages = uniqueSessions ? (totalViews / uniqueSessions).toFixed(1) : '0';
  const avgTime = durN ? fmtDur(durSum / durN) : '—';
  const mobilePct = mobile + desktop ? Math.round((mobile / (mobile + desktop)) * 100) : 0;

  const tableMissing = !!error && /page_events|relation|does not exist/i.test(error.message || '');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Product analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Where visitors go, how long they stay, and where journeys end — the last {WINDOW_LIMIT.toLocaleString('en-IN')} events. Your own admin browsing is excluded.
        </p>
      </div>

      {tableMissing && (
        <Card className="border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
          The <code>page_events</code> table doesn&apos;t exist yet. Run migration{' '}
          <code>0055_page_events.sql</code> in Supabase, then reload. Tracking starts collecting once it&apos;s live.
        </Card>
      )}

      {!tableMissing && events.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No events yet. Once the tracker is deployed and people browse the site, data appears here.
        </Card>
      )}

      {/* summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Page views', totalViews.toLocaleString('en-IN')],
          ['Unique sessions', uniqueSessions.toLocaleString('en-IN')],
          ['Pages / session', avgPages],
          ['Avg time / page', avgTime],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <div className="text-2xl font-bold tabular-nums text-foreground">{value}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* top pages */}
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top pages</span>
            <span className="text-xs text-muted-foreground">{mobilePct}% mobile</span>
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
                {topPages.map((p) => (
                  <tr key={p.path}>
                    <td className="max-w-[220px] truncate px-4 py-2 font-medium text-foreground">{p.path}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{p.views}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{p.sessions}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{p.avg != null ? fmtDur(p.avg) : '—'}</td>
                  </tr>
                ))}
                {topPages.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No page views yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* exit pages — where journeys end (friction) */}
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Where journeys end</span>
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
                {exitPages.map((p) => (
                  <tr key={p.path}>
                    <td className="max-w-[220px] truncate px-4 py-2 font-medium text-foreground">{p.path}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{p.n}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                      {uniqueSessions ? Math.round((p.n / uniqueSessions) * 100) : 0}%
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
  );
}
