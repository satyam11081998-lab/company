'use client';

import { Hero, VARIANTS, type UserVariant } from '@/components/dashboard/hero';
import { ConstellationSection } from '@/components/dashboard/constellation';
import { CommandPanel } from '@/components/dashboard/command-panel';
import { NewsCard } from '@/components/dashboard/news-card';
import { GuesstimateCard } from '@/components/dashboard/guesstimate-card';
import { ConsistencyCard } from '@/components/dashboard/consistency-card';
import { RecentCard } from '@/components/dashboard/recent-card';
// LiveTape removed per owner directive 2026-06-07 — strip not wanted.
// Keep the import path commented for traceability if it's brought back.
// import { LiveTape } from '@/components/dashboard/fomo';
import type { ReadinessResult, ReadinessSubmission } from '@/lib/readiness';
import type { NextAction, FreeQuota } from '@/lib/next-action';
import type { ScoreDimension, GuesstimateDimension } from '@/lib/constants';
import type { DailyContentResponse } from '@/lib/api';
import type { GrowthDelta } from '@/lib/dashboard/growth-deltas';
import type { ActivityItem } from '@/lib/dashboard/recent';
import type { PeerProximityData } from '@/lib/dashboard/peer-proximity';
// LiveTape removed → TapeEvent import no longer needed.
// import type { TapeEvent } from '@/lib/dashboard/activity-feed';
import type { ProofRailData } from '@/lib/dashboard/proof-rail';
import type { SkillGraphData } from '@/lib/dashboard/skill-graph';
import { currentTier, nextTier as careerNextTier, pointsToNextTier } from '@/lib/career-tiers';

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
  heatmap: import('@/lib/dashboard/heatmap').HeatmapData;
  growthDeltas: GrowthDelta[];
  activityFeed: ActivityItem[];
  peerProximity: PeerProximityData;
  cohortActivity?: any[]; // LiveTape removed; prop kept optional so page.tsx doesn't need to change.
  proofRail: ProofRailData;
  skillGraph: SkillGraphData;
  nodeTargets: Map<string, import('@/lib/dashboard/node-to-case').NodeOpenTarget>;
  todayMeta: import('@/lib/dashboard/today-meta').TodayMeta;
}

export default function DashboardClient(props: DashboardClientProps) {
  const {
    userName, points, readiness, trajectory, submissions,
    rankNum, totalUsers, percentile, streak,
    heatmap, growthDeltas, activityFeed, peerProximity, proofRail,
    skillGraph, nodeTargets, todayMeta
  } = props;
  // cohortActivity intentionally NOT destructured — LiveTape removed.

  // Map real data to UserVariant shape for the prototype components
  const solved = submissions.filter((s) => s.score != null).length;
  const scored = submissions.filter((s) => s.score != null && s.case_type !== 'guesstimate');
  const latest = scored.length ? scored[scored.length - 1].score ?? 0 : 0;
  const best = scored.length ? Math.max(...scored.map((s) => s.score as number)) : 0;
  const readinessVal = readiness.status === 'scored' ? readiness.score : null;

  // Determine user state: new (<5 cases), power (>100), mid (default)
  const userState = solved < 5 ? 'new' : solved > 100 ? 'power' : 'mid';

  // Real career tier derived from points via the SSOT lib (lib/career-tiers).
  // Without this override, `u.tier` would inherit VARIANTS mock strings like
  // 'Senior Analyst' / 'Manager' (consulting-firm names from the prototype)
  // instead of the owner's real ladder (Day 0 Dreamer → Day 1 Hero).
  const tierNow = currentTier(points);
  const tierNext = careerNextTier(points) ?? tierNow;
  const toNextPts = pointsToNextTier(points);

  // Build a UserVariant from real data, falling back to VARIANTS mock for missing fields
  const base = VARIANTS[userState as keyof typeof VARIANTS];
  const u: UserVariant = {
    ...base,
    userState,
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
    tier: tierNow.name,
    nextTier: tierNext.name,
    toNext: toNextPts,
    trajectory: trajectory.length > 1 ? trajectory : base.trajectory,
    weekCases: base.weekCases,
    sessionMinutes: base.sessionMinutes,
    heatmap,
    activityFeed,
    growthDeltas,
    peerProximity,
    proofRail,
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
      {/* HERO SECTION */}
      <Hero
        u={u}
        variant={heroVariant}
        proofRail={proofRail}
        today={todayMeta.casePick}
      />

      {/* NEWS + GUESSTIMATE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--gap-grid, 16px)' }}>
        <NewsCard u={u} brief={props.initialDaily?.brief || undefined} />
        <GuesstimateCard u={u} daily={props.initialDaily?.guesstimate || undefined} />
      </div>

      {/* CONSTELLATION SKILL TREE */}
      <ConstellationSection
        u={u}
        // Always show the full constellation — the prior `filter='prof'` for
        // mid users dimmed every non-profitability node to 0.25 opacity,
        // which read as "the whole map is washed out". Owner directive
        // 2026-06-07: every cluster should render at full saturation.
        filter="all"
        userState={u.userState ?? 'mid'}
        skillGraph={skillGraph}
        nodeTargets={nodeTargets}
        // Personal recent activity feeds the side panel's "Recent attempts"
        // list, filtered by the selected node's cluster.
        recentFeed={activityFeed}
      />

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
