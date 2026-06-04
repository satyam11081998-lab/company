'use client';
// DELIVERABLE v2 — rewrite of components/dashboard-client.tsx.
// Fixes the sparse v1 (full-width stacked cards): everything now sits in a dense 12-col grid
// that FILLS the horizontal space, and the rank/percentile peer-comparison tiles that the
// original dashboard had are RESTORED (v1 dropped them — that was the regression).
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import SectionHeader from '@/components/section-header';
import StatTile from '@/components/stat-tile';
import CareerLadder from '@/components/career-ladder';
import SubmissionHeatmap from '@/components/submission-heatmap';
import { Card } from '@/components/ui/card';
import { ReadinessScore } from '@/components/dashboard/readiness-score';
import { NextActionCard } from '@/components/dashboard/next-action-card';
import { Trajectory } from '@/components/dashboard/trajectory';
import GuesstimateSkillsChart from '@/components/dashboard/guesstimate-skills-chart';
import type { GuesstimateDimension } from '@/lib/constants';
import { FreeQuotaMeter } from '@/components/dashboard/free-quota-meter';
import { DimensionBullets } from '@/components/dashboard/dimension-bullets';
import { CoverageMap } from '@/components/dashboard/coverage-map';
import { DailyPicksStrip } from '@/components/dashboard/daily-picks-strip';
import { cn } from '@/lib/utils';
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

  return (
    <div className="container max-w-6xl py-8 md:py-10 space-y-8 stagger">
      {/* Hero */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">{today}</p>
          <h1 className="mt-1.5 text-h1 text-foreground">Hey, {userName}.</h1>
        </div>
        <Link href="/practice?tab=scored" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-body font-semibold text-primary-foreground hover:bg-primary-hover transition-colors min-h-[44px]">
          Start a case <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* DOING LAYER — today's picks, lifted from the old /home (first thing they see) */}
      <DailyPicksStrip initialDaily={initialDaily} />

      {/* ROW 1 — command + peer standing (fills width: 4 / 5 / 3) */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4"><ReadinessScore result={readiness} /></div>
        <div className="lg:col-span-5"><NextActionCard action={action} /></div>
        <div className="lg:col-span-3">
          <Card className="flex h-full flex-col p-5">
            <p className="text-label text-muted-foreground">WHERE YOU STAND</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[34px] leading-none font-mono-data font-bold tabular-nums text-foreground">#{rankNum}</span>
              <span className="text-small text-muted-foreground">of {totalUsers}</span>
            </div>
            {percentile != null ? (
              <>
                <p className="mt-1 text-small text-success font-medium">Top {Math.max(1, 100 - percentile)}% of aspirants</p>
                <div className="relative mt-auto pt-4">
                  <div className="h-1.5 rounded-full bg-muted" />
                  <div className="absolute bottom-0 h-1.5 w-[3px] rounded bg-foreground" style={{ left: `calc(${percentile}% - 1px)` }} />
                  <div className="mt-2 flex justify-between text-micro text-muted-foreground"><span>rest of India</span><span>you</span></div>
                </div>
              </>
            ) : (
              <p className="mt-1 text-small text-muted-foreground">Solve a case to get ranked.</p>
            )}
          </Card>
        </div>
      </div>

      {/* ROW 2 — the numbers (4 tiles) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Avg Score" value={avgScore != null ? avgScore : '—'} valueSuffix={avgScore != null ? '/100' : ''} sublabel="per submission" dotColor="warning" />
        <StatTile label="Day Streak" value={streak} sublabel={streak > 0 ? 'keep it alive' : 'start today'} dotColor="primary">
          <div className="mt-auto flex items-center gap-1 pt-3 text-primary"><Flame className={cn("h-4 w-4", streak > 0 && "ambient-flame")} /><span className="text-small text-muted-foreground">{streak >= 3 ? 'on a roll' : 'building a habit'}</span></div>
        </StatTile>
        <StatTile label="Cases Solved" value={solved} sublabel="scored attempts" dotColor="success" />
        <StatTile label="Points" value={points.toLocaleString('en-IN')} sublabel={tier.name} dotColor="navy">
          {toNext > 0 && (
            <div className="mt-auto pt-3">
              <div className="flex justify-between text-micro text-muted-foreground"><span>to next tier</span><span className="font-mono-data">{toNext} pts</span></div>
            </div>
          )}
        </StatTile>
      </div>

      {/* ROW 3 — skill profile (8) + trajectory (4) */}
      {readiness.status === 'scored' && (
        <section>
          <SectionHeader label="SKILL PROFILE" subtitle="Your scores vs the cohort, by dimension" />
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Card className="p-6"><DimensionBullets dimensions={readiness.dimensions} benchmark={benchmark} /></Card>
            </div>
            <div className="lg:col-span-4"><Trajectory scores={trajectory} className="h-full" /></div>
          </div>
        </section>
      )}

      {/* ROW 3b — guesstimate skills (separate 5-dim rubric; always visible, own empty state) */}
      <section>
        <SectionHeader label="GUESSTIMATE SKILLS" subtitle="Your estimation skills, scored on the guesstimate rubric" />
        <Card className="p-6">
          <GuesstimateSkillsChart skills={guesstimateSkills} count={guesstimateCount} />
        </Card>
      </section>

      {/* ROW 4 — coverage (7) + convert/quota (5) */}
      <section>
        <SectionHeader label="COVERAGE" subtitle="Where you're tested — and where you're not" />
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7"><CoverageMap cells={readiness.coverage} /></div>
          <div className="lg:col-span-5"><FreeQuotaMeter quota={quota} /></div>
        </div>
      </section>

      {/* ROW 5 — career (8) + activity heatmap (4) */}
      <section>
        <SectionHeader label="CAREER JOURNEY" subtitle="Points unlock the next tier" />
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8"><CareerLadder points={points} /></div>
          <div className="lg:col-span-4"><SubmissionHeatmap submissions={submissions} weeks={12} showStreak /></div>
        </div>
      </section>
    </div>
  );
}
