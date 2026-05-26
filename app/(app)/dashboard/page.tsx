import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

import DimensionRadar from '@/components/dimension-radar';
import type { UserRow, SubmissionRow } from '@/lib/types';
import {
  CASE_TYPE_LABELS, DIFFICULTY_COLORS, DIFFICULTY_LABELS,
  SCORE_DIMENSIONS, SCORE_DIMENSION_LABELS, SCORE_DIMENSION_MAX
} from '@/lib/constants';
import { ArrowRight, Target, Zap, Award, Star, Trophy, BookOpen, Gem, Crown } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');
  const authUser = session.user;

  const [userRes, recentSubsRes, benchmarkRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('submissions').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(8),
    supabase.from('submissions').select('feedback_json').not('feedback_json', 'is', null).limit(100),
  ]);

  const userRow = (userRes.data as UserRow | null) || {
    id: authUser.id, name: authUser.user_metadata?.full_name || null,
    email: authUser.email || '', avatar_url: null, points: 0,
    created_at: new Date().toISOString(),
  };
  const recentSubs = (recentSubsRes.data as SubmissionRow[] | null) || [];

  const [rankCountRes, totalCountRes] = await Promise.all([
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gt('points', userRow.points),
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true }),
  ]);

  const rankNum = (rankCountRes.count ?? 0) + 1;
  const totalUsers = totalCountRes.count ?? 0;
  const percentile = rankNum && totalUsers > 1
    ? Math.round(((totalUsers - rankNum) / (totalUsers - 1)) * 100)
    : null;

  const scoredSubs = recentSubs.filter(s => s.score !== null);
  const avgScore   = scoredSubs.length > 0
    ? Math.round(scoredSubs.reduce((a, s) => a + (s.score ?? 0), 0) / scoredSubs.length)
    : null;

  // Best dimension from latest submission
  const latestFb = (scoredSubs[0]?.feedback_json || {}) as { breakdown?: Record<string, number> };
  let bestDim = '—';
  if (latestFb.breakdown) {
    let best = 0;
    Object.entries(latestFb.breakdown).forEach(([dim, val]) => {
      const pct = val / (SCORE_DIMENSION_MAX[dim] ?? 100);
      if (pct > best) { best = pct; bestDim = SCORE_DIMENSION_LABELS[dim] || dim; }
    });
  }

  // Aggregate benchmark from seed submissions
  const benchmarkAgg = { count: 0, sums: {} as Record<string, number> };
  (benchmarkRes.data || []).forEach(sub => {
    const breakdown = (sub.feedback_json as any)?.breakdown;
    if (breakdown) {
      benchmarkAgg.count++;
      Object.entries(breakdown).forEach(([dim, val]) => {
        if (typeof val === 'number') {
          benchmarkAgg.sums[dim] = (benchmarkAgg.sums[dim] || 0) + val;
        }
      });
    }
  });
  const benchmark: Record<string, number> = {};
  if (benchmarkAgg.count > 0) {
    Object.entries(benchmarkAgg.sums).forEach(([dim, total]) => {
      benchmark[dim] = total / benchmarkAgg.count;
    });
  }

  // Milestones — displayed bottom→top (lowest at bottom, highest at top)
  const MILESTONES = [
    { pts: 0,    label: 'Day 0 Dreamer',       icon: Target, tip: 'Just showed up. Bold move.' },
    { pts: 50,   label: 'Casebook Collector',   icon: Zap,    tip: 'Downloaded 12 casebooks, read 1.' },
    { pts: 100,  label: 'MECE Believer',        icon: Award,  tip: 'Uses MECE in casual conversation.' },
    { pts: 250,  label: 'Deck Polisher',        icon: Star,   tip: 'Pixel-perfect slides at 2am.' },
    { pts: 500,  label: 'Fundae Machine',       icon: Trophy, tip: 'Gives gyan. Takes none.' },
    { pts: 1000, label: 'PPO Chaser',           icon: Gem,    tip: 'The summer internship grind.' },
    { pts: 2000, label: 'Summer Legend',        icon: Crown,  tip: 'They talk about you in case comps.' },
  ];
  const nextMilestone = MILESTONES.find(m => m.pts > userRow.points);
  const lastReached   = [...MILESTONES].reverse().find(m => m.pts <= userRow.points) || MILESTONES[0];

  // Ring geometry — scale to 2000 pts max
  const ptsRingPct   = Math.min(userRow.points / 2000, 1);
  const pctlRingPct  = (percentile ?? 0) / 100;
  const scoreRingPct = (avgScore ?? 0) / 100;

  // SVG ring helper
  const R1 = 74, R2 = 58, R3 = 42;
  const arc = (r: number, pct: number) => {
    const circ = 2 * Math.PI * r;
    return { circ, offset: circ * (1 - Math.max(0, Math.min(1, pct))) };
  };
  const a1 = arc(R1, ptsRingPct);
  const a2 = arc(R2, pctlRingPct);
  const a3 = arc(R3, scoreRingPct);

  const firstName = userRow.name?.split(' ')[0] ?? null;

  return (
    <div className="min-h-screen bg-muted">

      <main className="container max-w-7xl py-10 space-y-6">

        {/* ══════════════════════════════════════════════════════════
            GREETING ROW
        ══════════════════════════════════════════════════════════ */}
        <div className="flex items-end justify-between animate-fade-in">
          <div>
            <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="mt-1.5 text-4xl font-bold tracking-tight text-foreground">
              {firstName ? `Hey, ${firstName}.` : 'Your dashboard.'}
            </h1>
          </div>
          <Link
            href="/cases"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
          >
            Start a case <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* ══════════════════════════════════════════════════════════
            KPI STRIP — 4 individual white rounded cards
        ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
          <KpiCard
            label="Points"
            value={userRow.points.toString()}
            sub={lastReached ? lastReached.label : 'No rank yet'}
            dotColor="bg-primary"
          />
          <KpiCard
            label="Rank"
            value={rankNum ? `#${rankNum}` : '—'}
            sub={`of ${totalUsers} students`}
            dotColor="bg-navy"
            unit=""
          />
          <KpiCard
            label="Avg Score"
            value={avgScore !== null ? `${avgScore}` : '—'}
            sub="per submission"
            unit="/100"
            dotColor="bg-amber-400"
          />
          <KpiCard
            label="Percentile"
            value={percentile !== null ? `${percentile}` : '—'}
            sub={nextMilestone ? `next: ${nextMilestone.pts} pts` : 'Top tier'}
            unit="%ile"
            dotColor="bg-emerald-500"
          />
        </div>

        {/* ══════════════════════════════════════════════════════════
            MAIN 3-COLUMN GRID — 5 + 4 + 3 columns
        ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-5">

          {/* ── Col A (5/12): Score profile ring ─────────────────── */}
          <div className="col-span-12 md:col-span-5 ui-card p-6 flex flex-col items-center animate-slide-up">
            <div className="self-start w-full flex items-center justify-between mb-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Score profile</span>
              {percentile !== null && (
                <span className="tag tag-red">
                  Top {100 - percentile}%
                </span>
              )}
            </div>

            {/* Triple concentric SVG rings */}
            <div className="relative" style={{ width: 176, height: 176 }}>
              <svg width="176" height="176" viewBox="0 0 176 176" fill="none">
                {/* Track rings */}
                <circle cx="88" cy="88" r={R1} stroke="hsl(var(--border))" strokeWidth="7" />
                <circle cx="88" cy="88" r={R2} stroke="hsl(var(--border))" strokeWidth="5.5" />
                <circle cx="88" cy="88" r={R3} stroke="hsl(var(--border))" strokeWidth="4" />

                {/* Progress rings — animate in */}
                <circle
                  cx="88" cy="88" r={R1}
                  stroke="hsl(var(--primary))" strokeWidth="7"
                  strokeDasharray={a1.circ} strokeDashoffset={a1.offset}
                  strokeLinecap="square" transform="rotate(-90 88 88)"
                  style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
                />
                <circle
                  cx="88" cy="88" r={R2}
                  stroke="hsl(var(--navy))" strokeWidth="5.5"
                  strokeDasharray={a2.circ} strokeDashoffset={a2.offset}
                  strokeLinecap="square" transform="rotate(-90 88 88)"
                  style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1) 0.15s' }}
                />
                <circle
                  cx="88" cy="88" r={R3}
                  stroke="hsl(var(--primary) / 0.35)" strokeWidth="4"
                  strokeDasharray={a3.circ} strokeDashoffset={a3.offset}
                  strokeLinecap="square" transform="rotate(-90 88 88)"
                  style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s' }}
                />
              </svg>

              {/* Centre — large number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-4xl font-bold tabular-nums text-foreground" style={{ letterSpacing: '-0.04em' }}>
                  {userRow.points}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">pts</span>
              </div>
            </div>

            {/* Legend table */}
            <div className="mt-6 w-full divide-y divide-border">
              <LegendRow color="bg-primary"          label="Points progress"  value={`${Math.round(ptsRingPct * 100)}%`} />
              <LegendRow color="bg-navy"             label="Percentile rank"  value={percentile !== null ? `${percentile}th` : '—'} />
              <LegendRow color="bg-primary/35"       label="Avg score"        value={avgScore !== null ? `${avgScore}/100` : '—'} />
              <LegendRow color="bg-transparent border border-border" label="Best dimension" value={bestDim} small />
            </div>
          </div>



          {/* ── Col C (3/12): Milestone tracker — bottom-to-top ──── */}
          <div className="col-span-12 md:col-span-3 ui-card p-5 animate-slide-up flex flex-col" style={{ animationDelay: '210ms' }}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Career ladder</span>
              {nextMilestone && (
                <span className="text-xs font-semibold text-primary">{nextMilestone.pts - userRow.points} pts to go</span>
              )}
            </div>

            {/* Ladder — climbed from bottom to top */}
            <div className="flex-1 flex flex-col-reverse">
              {MILESTONES.map((m, i, arr) => {
                const reached = userRow.points >= m.pts;
                const isCurrent = lastReached?.pts === m.pts;
                const Icon = m.icon;
                const nextTier = arr[i + 1];
                
                let progressToNext = 0;
                if (isCurrent && nextTier) {
                  progressToNext = ((userRow.points - m.pts) / (nextTier.pts - m.pts)) * 100;
                  progressToNext = Math.max(0, Math.min(100, progressToNext));
                }

                return (
                  <div key={m.label} className="flex flex-col">
                    <div className={`flex gap-3 py-2 px-3 -mx-3 rounded-r-md transition-colors ${
                      isCurrent ? 'border-l-4 border-l-primary bg-primary/5' : ''
                    } ${reached ? 'opacity-100' : 'opacity-50'}`}>
                      {/* Dot icon */}
                      <div className="flex flex-col items-center justify-center pt-0.5">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                          isCurrent
                            ? 'bg-primary/10 border-primary text-primary'
                            : reached
                            ? 'bg-navy border-navy text-white'
                            : 'bg-card border-border text-muted-foreground/40'
                        }`}>
                          <Icon className="h-3 w-3" />
                        </div>
                      </div>
                      
                      {/* Label row */}
                      <div className="flex flex-col justify-center flex-1 py-0.5">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-semibold leading-none ${
                            isCurrent ? 'text-primary' : reached ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {m.label}
                          </p>
                          <span className={`text-[10px] font-mono tabular-nums flex-shrink-0 ${
                            reached ? 'text-foreground' : 'text-muted-foreground/60'
                          }`}>
                            {m.pts}
                          </span>
                        </div>
                        {/* Fun tip */}
                        {reached && (
                          <p className="mt-1.5 text-[10px] text-muted-foreground/60 italic normal-case tracking-normal leading-tight">
                            {m.tip}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress bar to NEXT tier */}
                    {nextTier && (
                      <div className="flex gap-3 px-3 -mx-3">
                        {/* The connector line */}
                        <div className="w-6 flex justify-center py-1">
                          <div className={`w-px h-full min-h-[24px] ${reached && !isCurrent ? 'bg-navy/30' : 'bg-border/60'}`} />
                        </div>
                        {/* The progress bar if current */}
                        <div className="flex-1 py-3 flex flex-col justify-center">
                          {isCurrent && (
                            <div>
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                                ↑ Next: {nextTier.label}
                              </p>
                              <div className="h-1 bg-border rounded-full overflow-hidden w-full">
                                <div 
                                  className="h-full bg-primary transition-all duration-1000" 
                                  style={{ width: `${progressToNext}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              CHARTS ROW — Radar + Line chart side by side
          ══════════════════════════════════════════════════════ */}
            <div className="col-span-12 lg:col-span-8 lg:col-start-3 grid md:grid-cols-2 gap-5 animate-slide-up" style={{ animationDelay: '280ms' }}>
              {/* Radar chart */}
              <div className="ui-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Skill Radar</span>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">Latest submission vs Top 10%</p>
                  </div>
                  {bestDim !== '—' && <span className="tag tag-red">Best: {bestDim}</span>}
                </div>
                <DimensionRadar breakdown={latestFb.breakdown} benchmark={benchmark} />
              </div>
              {/* Line chart */}
              <div className="ui-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Score Progression</span>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">{scoredSubs.length} scored submissions</p>
                  </div>
                  {avgScore !== null && <span className="tag tag-navy">{avgScore} avg</span>}
                </div>
                <ScoreLineChart subs={recentSubs} />
              </div>
            </div>

          {/* ══════════════════════════════════════════════════════
              RECENT ACTIVITY — white card with activity list
          ══════════════════════════════════════════════════════ */}
          <div className="col-span-12 ui-card overflow-hidden animate-slide-up" style={{ animationDelay: '350ms' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recent activity</span>
              {/* Inline sparkline */}
              {recentSubs.length >= 2 && (
                <div className="flex items-end gap-0.5 h-5">
                  {[...recentSubs].reverse().map((s, i) => {
                    const h = Math.max(3, Math.round(((s.score ?? 0) / 100) * 20));
                    const c = (s.score ?? 0) >= 70 ? 'bg-emerald-500'
                            : (s.score ?? 0) >= 40 ? 'bg-amber-400'
                            : 'bg-primary';
                    return <div key={i} className={`w-1.5 ${c} rounded-sm`} style={{ height: h }} />;
                  })}
                </div>
              )}
            </div>

            {/* Rows */}
            {recentSubs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <BookOpen className="h-8 w-8 text-muted-foreground/25" />
                <p className="text-sm text-muted-foreground">No submissions yet</p>
                <Link href="/cases" className="text-sm font-semibold text-primary hover:text-primary-hover">
                  Try your first case →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentSubs.map((s, i) => {
                  const score = s.score ?? 0;
                  const hasScore = s.score !== null;
                  const triageCls = score >= 70 ? 'triage-green' : score >= 40 ? 'triage-amber' : 'triage-red';
                  const scoreCls  = score >= 70 ? 'text-emerald-600 dark:text-emerald-400'
                                  : score >= 40 ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-primary';
                  return (
                    <Link
                      key={s.id}
                      href={`/results/${s.id}`}
                      className="flex items-center gap-5 px-6 py-3.5 hover:bg-muted/40 transition-colors group"
                      style={{ animationDelay: `${350 + i * 40}ms` }}
                    >
                      {/* Row number */}
                      <span className="text-xs text-muted-foreground/40 w-4 flex-shrink-0 tabular-nums font-mono">
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      {/* Score — dominant number */}
                      <div className="flex items-baseline gap-0.5 w-16 flex-shrink-0">
                        <span className={`font-mono text-xl font-bold tabular-nums ${hasScore ? scoreCls : 'text-muted-foreground'}`}>
                          {hasScore ? score : '—'}
                        </span>
                        {hasScore && <span className="text-xs text-muted-foreground">/100</span>}
                      </div>

                      {/* Triage bar + answer snippet */}
                      <div className="flex-1 min-w-0">
                        {hasScore && (
                          <div className={`triage ${triageCls} mb-1.5`} style={{ width: `${Math.max(2, score)}%`, maxWidth: '160px' }} />
                        )}
                        <p className="text-sm text-muted-foreground truncate leading-none">{s.answer_text.slice(0, 90)}…</p>
                      </div>

                      {/* Timestamp */}
                      <span className="hidden lg:block text-xs text-muted-foreground/50 flex-shrink-0 tabular-nums">
                        {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>

                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────── */

function KpiCard({
  label, value, sub, unit, dotColor,
}: {
  label: string; value: string; sub: string; unit?: string; dotColor?: string;
}) {
  return (
    <div className="ui-card p-5 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        {dotColor && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-4xl font-bold tabular-nums text-foreground" style={{ letterSpacing: '-0.04em' }}>
          {value}
        </span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <p className="text-xs text-muted-foreground truncate">{sub}</p>
    </div>
  );
}

function LegendRow({ color, label, value, small }: { color: string; label: string; value: string; small?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={`font-mono font-semibold tabular-nums ${small ? 'text-[11px]' : 'text-sm'} text-foreground`}>{value}</span>
    </div>
  );
}



/* ── Score line chart — smooth SVG with red gradient fill ───────── */
function ScoreLineChart({ subs }: { subs: SubmissionRow[] }) {
  const scored = [...subs].reverse().filter(s => s.score !== null);

  if (scored.length === 0) {
    return (
      <div style={{ height: 160 }} className="flex flex-col items-center justify-center gap-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <polyline points="4,24 10,16 16,20 22,10 28,14"
            stroke="hsl(var(--border))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-xs text-muted-foreground">No scored submissions yet</p>
      </div>
    );
  }

  if (scored.length === 1) {
    return (
      <div style={{ height: 160 }} className="flex flex-col items-center justify-center gap-1">
        <span className="text-5xl font-bold font-mono text-foreground" style={{ letterSpacing: '-0.04em' }}>
          {scored[0].score}
        </span>
        <span className="text-xs text-muted-foreground">1 submission · submit more to see trend</span>
      </div>
    );
  }

  const W = 340, H = 150;
  const PL = 32, PR = 12, PT = 12, PB = 28;
  const plotW = W - PL - PR;
  const plotH = H - PT - PB;
  const n = scored.length;

  // Score at each point, 0-100
  const px = (i: number) => PL + (i / (n - 1)) * plotW;
  const py = (score: number) => PT + (1 - score / 100) * plotH;

  const pts = scored.map((s, i) => ({ x: px(i), y: py(s.score ?? 0), score: s.score ?? 0 }));

  // Smooth cubic bezier path
  const linePath = pts.map((p, i) => {
    if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `C${cpx.toFixed(1)},${prev.y.toFixed(1)} ${cpx.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');

  // Filled area (close down to baseline)
  const fillPath = `${linePath} L${pts[n - 1].x.toFixed(1)},${(PT + plotH).toFixed(1)} L${PL.toFixed(1)},${(PT + plotH).toFixed(1)} Z`;

  // Y axis grid labels
  const yLabels = [0, 50, 100];

  return (
    <div className="w-full max-w-[420px] mx-auto pt-6 pb-2">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="score-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
            <stop offset="85%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y grid + labels */}
        {yLabels.map(v => {
          const y = py(v);
          return (
            <g key={v}>
              <line x1={PL} y1={y} x2={W - PR} y2={y}
                stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray={v === 0 ? 'none' : '3 3'} />
              <text x={PL - 6} y={y} textAnchor="end" dominantBaseline="middle"
                fontSize="9" fill="hsl(var(--muted-foreground))">{v}</text>
            </g>
          );
        })}

        {/* X axis labels (submission numbers) */}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle"
            fontSize="9" fill="hsl(var(--muted-foreground))">
            #{i + 1}
          </text>
        ))}

        {/* Gradient fill */}
        <path d={fillPath} fill="url(#score-gradient)" />

        {/* Main line */}
        <path d={linePath} fill="none"
          stroke="hsl(var(--primary))" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Data point dots */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2.5" />
            <text x={p.x} y={p.y - 10} textAnchor="middle"
              fontSize="10" fontWeight="700" fill="hsl(var(--primary))">
              {p.score}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
