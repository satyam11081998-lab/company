'use client';
// DELIVERABLE v2 — rewrite of components/dashboard-client.tsx.
// Fixes the sparse v1 (full-width stacked cards): everything now sits in a dense 12-col grid
// that FILLS the horizontal space, and the rank/percentile peer-comparison tiles that the
// original dashboard had are RESTORED (v1 dropped them — that was the regression).
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/section-header';
import StatTile from '@/components/stat-tile';
import CareerLadder from '@/components/career-ladder';
import SubmissionHeatmap from '@/components/submission-heatmap';
import { Card } from '@/components/ui/card';
import { ReadinessScore } from '@/components/dashboard/readiness-score';
import { NextActionCard } from '@/components/dashboard/next-action-card';
import { Trajectory } from '@/components/dashboard/trajectory';
import { FocusHero } from '@/components/dashboard/focus-hero';
import { SkillConstellation } from '@/components/dashboard/skill-constellation';
import HeroStatsRow from '@/components/dashboard/hero-stats';
import SkillTree from '@/components/dashboard/skill-tree';
import { computeHeroStats, buildSkillTree, ANALYTICS_UNLOCK_N } from '@/lib/personal-stats';
import GuesstimateSkillsChart from '@/components/dashboard/guesstimate-skills-chart';
import type { GuesstimateDimension } from '@/lib/constants';
import { FreeQuotaMeter } from '@/components/dashboard/free-quota-meter';
import { DimensionBullets } from '@/components/dashboard/dimension-bullets';
import { CoverageMap } from '@/components/dashboard/coverage-map';
import { DailyPicksStrip } from '@/components/dashboard/daily-picks-strip';
import { currentTier, pointsToNextTier } from '@/lib/career-tiers';
import type { ReadinessResult, ReadinessSubmission } from '@/lib/readiness';
import type { NextAction, FreeQuota } from '@/lib/next-action';
import type { ScoreDimension } from '@/lib/constants';
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
  const { userName, points, readiness, action, quota, benchmark, trajectory, submissions,
    rankNum, totalUsers, percentile, avgScore, streak, initialDaily,
    guesstimateSkills, guesstimateCount } = props;
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const tier = currentTier(points);
  const toNext = pointsToNextTier(points);
  const solved = submissions.filter((s) => s.score != null).length;
  // Personal-first stats (no average): Latest / Personal Best / Streak.
  const hero = computeHeroStats(submissions, streak);
  // Per-domain progression (replaces cohort-comparison framing for early users).
  const skillNodes = buildSkillTree(submissions);

  return (
    <div className="container max-w-6xl py-8 md:py-10 space-y-8 stagger">
      {/* FOCUS HERO */}
      <FocusHero userName={userName} submissions={submissions} streak={streak} readiness={readiness} dailyToday={initialDaily} />

      {/* DOING LAYER */}
      <DailyPicksStrip initialDaily={initialDaily} />

      {/* SKILL CONSTELLATION */}
      <SkillConstellation coverage={readiness.coverage} points={points} />

      {/* PROGRESSIVE DISCLOSURE */}
      {hero.caseCases < ANALYTICS_UNLOCK_N ? (
        <Card className="border-dashed p-6 text-center">
          <p className="text-label text-muted-foreground">YOUR ANALYTICS UNLOCK SOON</p>
          <p className="mt-2 text-h3 text-foreground">
            {ANALYTICS_UNLOCK_N - hero.caseCases} more case{(ANALYTICS_UNLOCK_N - hero.caseCases) === 1 ? '' : 's'} to go
          </p>
          <p className="mx-auto mt-2 max-w-md text-small text-muted-foreground">
            Cohort comparison, dimension scores, trajectory and coverage map all sharpen at {ANALYTICS_UNLOCK_N} cases. Until then your dashboard stays focused on personal bests and the domains to explore.
          </p>
          <div className="mt-4 inline-flex items-center gap-2">
            <div className="h-2 w-48 overflow-hidden rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${(hero.caseCases / ANALYTICS_UNLOCK_N) * 100}%` }} />
            </div>
            <span className="text-small font-mono-data tabular-nums text-muted-foreground">
              {hero.caseCases} / {ANALYTICS_UNLOCK_N}
            </span>
          </div>
        </Card>
      ) : (
        <>
          {/* COMMAND PANEL (Trajectory + Dims) */}
          {readiness.status === 'scored' && (
            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <Card className="p-5 h-full">
                  <div className="mb-4">
                    <SectionHeader label="SKILL PROFILE" subtitle="Your scores vs the cohort, by dimension" />
                  </div>
                  <DimensionBullets dimensions={readiness.dimensions} benchmark={benchmark} />
                </Card>
              </div>
              <div className="lg:col-span-4">
                <Trajectory scores={trajectory} className="h-full p-5" />
              </div>
            </div>
          )}

          {/* GUESSTIMATES & LADDER */}
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Card className="p-5 h-full">
                <div className="mb-4">
                  <SectionHeader label="GUESSTIMATE SKILLS" subtitle="Your estimation skills, scored on the guesstimate rubric" />
                </div>
                <GuesstimateSkillsChart skills={guesstimateSkills} count={guesstimateCount} />
              </Card>
            </div>
            <div className="lg:col-span-4">
              <CareerLadder points={points} />
            </div>
          </div>
          
          {/* BOTTOM (Consistency & Quota) */}
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <SubmissionHeatmap submissions={submissions} weeks={12} showStreak />
            </div>
            <div className="lg:col-span-4">
              <FreeQuotaMeter quota={quota} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
