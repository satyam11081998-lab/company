'use client';

import { Hero, VARIANTS, type UserVariant } from '@/components/dashboard/hero';
import { ConstellationSection } from '@/components/dashboard/constellation';
import { CommandPanel } from '@/components/dashboard/command-panel';
import { NewsCard } from '@/components/dashboard/news-card';
import { GuesstimateCard } from '@/components/dashboard/guesstimate-card';
import { ConsistencyCard } from '@/components/dashboard/consistency-card';
import { RecentCard } from '@/components/dashboard/recent-card';
import { LiveTape } from '@/components/dashboard/fomo';
import type { ReadinessResult, ReadinessSubmission } from '@/lib/readiness';
import type { NextAction, FreeQuota } from '@/lib/next-action';
import type { ScoreDimension, GuesstimateDimension } from '@/lib/constants';
import type { DailyContentResponse } from '@/lib/api';

export interface DashboardClientProps {
  userName: string;
  points: number;
  readiness: ReadinessResult;
  action: NextAction;
  quota: FreeQuota;
  benchmark?: Partial<Record<ScoreDimension, number>>;
  trajectory: number[];
  submissions: ReadinessSubmission[];
  rankNum: number;
  totalUsers: number;
  percentile: number | null;
  avgScore: number | null;
  streak: number;
  initialDaily?: DailyContentResponse | null;
  guesstimateSkills?: Partial<Record<GuesstimateDimension, number>>;
  guesstimateCount?: number;
}

export default function DashboardClient(props: DashboardClientProps) {
  const {
    userName, points, readiness, trajectory, submissions,
    rankNum, totalUsers, percentile, streak,
  } = props;

  // Map real data to UserVariant shape for the prototype components
  const solved = submissions.filter((s) => s.score != null).length;
  const scored = submissions.filter((s) => s.score != null && s.case_type !== 'guesstimate');
  const latest = scored.length ? scored[scored.length - 1].score ?? 0 : 0;
  const best = scored.length ? Math.max(...scored.map((s) => s.score as number)) : 0;
  const readinessVal = readiness.status === 'scored' ? readiness.score : null;

  // Determine user state: new (<5 cases), power (>100), mid (default)
  const userState = solved < 5 ? 'new' : solved > 100 ? 'power' : 'mid';

  // Build a UserVariant from real data, falling back to VARIANTS mock for missing fields
  const base = VARIANTS[userState as keyof typeof VARIANTS];
  const u: UserVariant = {
    ...base,
    name: userName,
    greeting: new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }),
    streak,
    bestStreak: Math.max(streak, base.bestStreak),
    rank: rankNum,
    totalUsers,
    percentile: percentile ?? base.percentile,
    readiness: readinessVal,
    readinessDelta: base.readinessDelta,
    latest,
    best,
    casesSolved: solved,
    totalPoints: points,
    trajectory: trajectory.length > 1 ? trajectory : base.trajectory,
    weekCases: base.weekCases,
    sessionMinutes: base.sessionMinutes,
  };

  // Hero variant: newcomer → case, high streak → streak, has readiness → readiness, default → case
  const heroVariant = solved < 5
    ? 'case'
    : streak > 30
    ? 'streak'
    : readinessVal != null && readinessVal >= 65
    ? 'readiness'
    : 'case';

  return (
    <div className="dash density-balanced" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-section, 20px)', padding: '24px 36px' }}>
      {/* HERO */}
      <Hero u={u} variant={heroVariant} />

      {/* LIVE TAPE */}
      <LiveTape />

      {/* NEWS + GUESSTIMATE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--gap-grid, 16px)' }}>
        <NewsCard u={u} />
        <GuesstimateCard u={u} />
      </div>

      {/* CONSTELLATION */}
      <ConstellationSection u={u} filter="all" userState={userState} />

      {/* COMMAND PANEL */}
      <CommandPanel u={u} show={{ session: true, progress: true, growth: true }} />

      {/* CONSISTENCY + RECENT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-grid, 20px)', alignItems: 'start' }}>
        <ConsistencyCard u={u} />
        <RecentCard u={u} />
      </div>
    </div>
  );
}
