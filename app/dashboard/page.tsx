import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import type { UserRow, CaseRow, GdBriefRow, SubmissionRow } from '@/lib/types';
import { CASE_TYPE_LABELS, DIFFICULTY_COLORS, DIFFICULTY_LABELS, SCORE_DIMENSIONS, SCORE_DIMENSION_LABELS, SCORE_DIMENSION_MAX } from '@/lib/constants';
import { Card } from '@/components/ui/card';
import { Trophy, Sparkles, FileText, Newspaper, ArrowRight, Target, Zap, Award, Star } from 'lucide-react';
import ProgressChart from '@/components/progress-chart';

export const dynamic = 'force-dynamic';

/** Authenticated dashboard — today's case, today's brief, points, rank, recent activity. */
export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const [userRes, todayCaseRes, todayBriefRes, recentSubsRes, rankRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('cases').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('gd_briefs').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('submissions').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('users').select('id, points').order('points', { ascending: false }),
  ]);

  const userRow = (userRes.data as UserRow | null) || {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || null,
    email: authUser.email || '',
    avatar_url: authUser.user_metadata?.avatar_url || null,
    points: 0,
    created_at: new Date().toISOString(),
  };

  const todayCase = todayCaseRes.data as CaseRow | null;
  const todayBrief = todayBriefRes.data as GdBriefRow | null;
  const recentSubs = (recentSubsRes.data as SubmissionRow[] | null) || [];
  const allUsers = (rankRes.data as { id: string; points: number }[] | null) || [];
  const rank = allUsers.findIndex((u) => u.id === authUser.id);
  const rankDisplay = rank >= 0 ? `#${rank + 1}` : '—';

  // Milestones
  const milestones = [
    { label: 'First case', threshold: 10, icon: Target },
    { label: 'Rising star', threshold: 50, icon: Zap },
    { label: 'Centurion', threshold: 100, icon: Award },
    { label: 'Case ace', threshold: 250, icon: Star },
    { label: 'Consultant', threshold: 500, icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-muted">
      <AppNav user={userRow} />
      <main className="container py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back{userRow.name ? `, ${userRow.name.split(' ')[0]}` : ''} 👋</h1>
          <p className="mt-1 text-muted-foreground">Here&apos;s what to work on today.</p>
        </div>

        {/* ===== Inverted Navy KPI Strip ===== */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
          <KpiCard label="Your points" value={userRow.points} icon={<Sparkles className="h-5 w-5 text-primary" />} />
          <KpiCard label="Your rank" value={rankDisplay} icon={<Trophy className="h-5 w-5 text-primary" />} />
          <KpiCard label="Submissions" value={recentSubs.length} icon={<FileText className="h-5 w-5 text-primary" />} sublabel="recent" />
          <KpiCard label="GD briefs" value={todayBrief ? '1 new' : '—'} icon={<Newspaper className="h-5 w-5 text-primary" />} sublabel="today" />
        </div>

        {/* ===== Main Content: Cards + Sidebar ===== */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_260px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* ===== Dual Content Cards ===== */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Today's case — cardinal red accent */}
              <Card className="flex flex-col p-6 border-l-4 border-l-primary animate-slide-up">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Today&apos;s case</h2>
                  <span className="rounded-md bg-navy text-navy-foreground px-2 py-0.5 text-xs font-medium">Recommended</span>
                </div>
                {todayCase ? (
                  <>
                    <h3 className="mt-3 text-xl font-semibold text-foreground">{todayCase.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground/80">{CASE_TYPE_LABELS[todayCase.type] || todayCase.type}</span>
                      <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[todayCase.difficulty] || ''}`}>{DIFFICULTY_LABELS[todayCase.difficulty] || todayCase.difficulty}</span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{todayCase.content}</p>
                    <Link href={`/cases/${todayCase.id}`} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                      Solve this case <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No active cases yet. Check back soon.</p>
                )}
              </Card>

              {/* Today's brief — navy accent */}
              <Card className="flex flex-col p-6 border-l-4 border-l-navy animate-slide-up" style={{ animationDelay: '60ms' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Today&apos;s GD brief</h2>
                  <Newspaper className="h-4 w-4 text-muted-foreground/70" />
                </div>
                {todayBrief ? (
                  <>
                    <h3 className="mt-3 text-xl font-semibold text-foreground">{todayBrief.topic}</h3>
                    <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{todayBrief.summary}</p>
                    <Link href="/gd-briefs" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                      Read full brief <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No briefs yet.</p>
                )}
              </Card>
            </div>

            {/* ===== Progress Chart ===== */}
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <ProgressChart submissions={recentSubs} />
            </div>
            
            {/* ===== Heatmap — Recent Submission Scores ===== */}
            {recentSubs.length > 0 && (
              <Card className="p-6 animate-slide-up" style={{ animationDelay: '120ms' }}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Score heatmap</h2>
                <p className="mt-1 text-xs text-muted-foreground/70">Recent submission scores by dimension</p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="pb-2 text-left font-medium text-muted-foreground w-28">Dimension</th>
                        {recentSubs.map((s, i) => (
                          <th key={s.id} className="pb-2 text-center font-medium text-muted-foreground px-1">
                            #{recentSubs.length - i}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {SCORE_DIMENSIONS.map((dim) => (
                        <tr key={dim}>
                          <td className="py-2 font-medium text-foreground/80 whitespace-nowrap">{SCORE_DIMENSION_LABELS[dim]}</td>
                          {recentSubs.map((s) => {
                            const fb = (s.feedback_json || {}) as { breakdown?: Record<string, number> };
                            const val = Number(fb.breakdown?.[dim] ?? 0);
                            const max = SCORE_DIMENSION_MAX[dim] ?? 100;
                            const pct = max > 0 ? val / max : 0;
                            const heatColor = pct >= 0.7
                              ? 'bg-emerald-500/80 dark:bg-emerald-400/60 text-white'
                              : pct >= 0.4
                              ? 'bg-amber-400/80 dark:bg-amber-500/50 text-foreground'
                              : 'bg-red-400/70 dark:bg-red-500/40 text-white';
                            return (
                              <td key={s.id} className="py-2 px-1 text-center">
                                <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-[10px] font-bold ${heatColor}`}>
                                  {val}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ===== Dense Activity List with Triage Bars ===== */}
            <div className="animate-slide-up" style={{ animationDelay: '180ms' }}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent activity</h2>
              <Card className="mt-3 divide-y divide-border">
                {recentSubs.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">No submissions yet — <Link href="/cases" className="font-medium text-primary hover:underline">try a case</Link>.</p>
                ) : (
                  recentSubs.map((s) => {
                    const score = s.score ?? 0;
                    const triageClass = score >= 70 ? 'triage-green' : score >= 40 ? 'triage-amber' : 'triage-red';
                    return (
                      <Link key={s.id} href={`/results/${s.id}`} className="flex items-center justify-between p-4 transition-colors hover:bg-muted group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-medium text-foreground">Submission · {new Date(s.created_at).toLocaleString()}</p>
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{s.answer_text.slice(0, 120)}…</p>
                          {/* Triage bar */}
                          <div className="mt-2 w-full bg-muted rounded-full overflow-hidden h-1">
                            <div className={`triage-bar h-1 ${triageClass}`} style={{ width: `${score}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                          <span className="text-lg font-bold tabular-nums text-foreground">{s.score ?? '—'}<span className="text-xs font-normal text-muted-foreground">/100</span></span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    );
                  })
                )}
              </Card>
            </div>
          </div>

          {/* ===== Right Sidebar: Red Percentile Ring + Milestones ===== */}
          <div className="space-y-6">
            {/* Score Ring */}
            <Card className="flex flex-col items-center p-6 animate-slide-up" style={{ animationDelay: '80ms' }}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Total score</h3>
              <div className="mt-4 score-ring" style={{ '--progress': Math.min(userRow.points, 100) } as React.CSSProperties}>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">{userRow.points}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">points</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Rank {rankDisplay} overall</p>
            </Card>

            {/* Milestone Sidebar */}
            <Card className="p-6 animate-slide-up" style={{ animationDelay: '140ms' }}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Milestones</h3>
              <div className="mt-4 space-y-0">
                {milestones.map((m, idx) => {
                  const reached = userRow.points >= m.threshold;
                  const Icon = m.icon;
                  const isLast = idx === milestones.length - 1;
                  return (
                    <div key={m.label} className="flex items-start gap-3">
                      {/* Vertical line + dot */}
                      <div className="flex flex-col items-center">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                          reached
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-muted-foreground'
                        }`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 h-6 ${reached ? 'bg-primary/40' : 'bg-border'}`} />
                        )}
                      </div>
                      {/* Label */}
                      <div className="pt-1">
                        <p className={`text-sm font-medium ${reached ? 'text-foreground' : 'text-muted-foreground'}`}>{m.label}</p>
                        <p className="text-[10px] text-muted-foreground">{m.threshold} pts</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Inverted navy KPI card — dark background, white text. */
function KpiCard({ label, value, icon, sublabel }: { label: string; value: string | number; icon: React.ReactNode; sublabel?: string }) {
  return (
    <Card className="bg-navy text-navy-foreground p-5 border-0 shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-navy-foreground/60">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-bold text-navy-foreground">
        {value} {sublabel && <span className="text-sm font-normal text-navy-foreground/50">{sublabel}</span>}
      </p>
    </Card>
  );
}
