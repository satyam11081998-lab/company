'use client';
  
import Link from 'next/link';
import { ArrowRight, Target } from 'lucide-react';
import SectionHeader from '@/components/section-header';
import StatTile from '@/components/stat-tile';
import CareerLadder from '@/components/career-ladder';
import DailyRankTile from '@/components/daily-rank-tile';
import DimensionRadar from '@/components/dimension-radar';
import ProgressChart from '@/components/progress-chart';
import SubmissionHeatmap from '@/components/submission-heatmap';
import { Card } from '@/components/ui/card';
import type { UserRow, SubmissionRow } from '@/lib/types';

interface Props {
  user: UserRow;
  submissions: SubmissionRow[];
  rankNum: number;
  totalUsers: number;
  percentile: number | null;
  avgScore: number | null;
  benchmark: Record<string, number>;
}

export default function DashboardClient({
  user, submissions, rankNum, totalUsers, percentile, avgScore, benchmark,
}: Props) {
  const firstName = user.name?.split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  // Derive tier name for "Points" stat sublabel
  const tierName = deriveTierName(user.points);
  const nextTierPts = deriveNextTierPts(user.points);

  // Use the latest scored submission's breakdown for the radar
  const latestScored = submissions.find((s) => s.score !== null && s.feedback_json?.breakdown);
  const latestBreakdown = latestScored?.feedback_json?.breakdown || {};

  return (
    <>
      {/* Hero */}
      <div className="container max-w-6xl pt-6 md:pt-10 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div>
            <p className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">
              {today}
            </p>
            <h1 className="mt-2 text-h1 text-foreground">
              Hey, {firstName}.
            </h1>
          </div>
          <Link 
            href="/home"
            className="inline-flex items-center justify-center gap-1.5 bg-primary text-white text-body font-semibold px-5 py-2.5 rounded-md hover:bg-primary-hover transition-colors flex-shrink-0 w-full sm:w-auto min-h-[44px]"
          >
            Start a case
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="container max-w-6xl pb-16 space-y-6 md:space-y-10 mt-6">
        {/* SECTION: Performance */}
        <section className="animate-slide-up">
          <SectionHeader 
            label="PERFORMANCE"
            subtitle="How you're doing across the platform"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatTile
              label="Points"
              value={user.points.toLocaleString('en-IN')}
              sublabel={tierName}
              dotColor="primary"
            />
            <StatTile
              label="Rank"
              value={`#${rankNum}`}
              sublabel={`of ${totalUsers} students`}
              dotColor="navy"
            />
            <StatTile
              label="Avg Score"
              value={avgScore !== null ? avgScore.toString() : '—'}
              valueSuffix={avgScore !== null ? '/100' : ''}
              sublabel="per submission"
              dotColor="warning"
            />
            <StatTile
              label="Percentile"
              value={percentile !== null ? percentile.toString() : '—'}
              valueSuffix={percentile !== null ? '%ile' : ''}
              sublabel={nextTierPts ? `next: ${nextTierPts} pts` : 'top tier reached'}
              dotColor="success"
            />
          </div>
        </section>

        {/* SECTION: Skill Profile */}
        <section className="animate-slide-up" style={{ animationDelay: '60ms' }}>
          <SectionHeader 
            label="SKILL PROFILE"
            subtitle="Your strengths and trajectories"
          />
          <div className="grid md:grid-cols-2 gap-5">
            <DimensionRadar breakdown={latestBreakdown} benchmark={benchmark} />
            <ProgressChart submissions={submissions.slice(0, 12).reverse()} />
          </div>
        </section>

        {/* SECTION: Career Journey */}
        <section className="animate-slide-up" style={{ animationDelay: '120ms' }}>
          <SectionHeader 
            label="CAREER JOURNEY"
            subtitle="Climb the ladder. Earn the badge."
          />
          <div className="grid md:grid-cols-2 gap-5">
            <CareerLadder points={user.points} />
            <DailyRankTile />
          </div>
        </section>

        {/* SECTION: Activity */}
        <section className="animate-slide-up" style={{ animationDelay: '180ms' }}>
          <SectionHeader 
            label="ACTIVITY"
            subtitle="Your last 30 days at a glance"
          />
          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <SubmissionHeatmap submissions={submissions} weeks={6} title="Activity heatmap" />
            </div>
            <div className="md:col-span-2">
              <RecentSubmissionsTable submissions={submissions.slice(0, 8)} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function deriveTierName(points: number): string {
  if (points >= 2000) return 'Summer Legend';
  if (points >= 1000) return 'PPO Chaser';
  if (points >= 500)  return 'Fundae Machine';
  if (points >= 250)  return 'Deck Polisher';
  if (points >= 100)  return 'MECE Believer';
  if (points >= 50)   return 'Casebook Collector';
  return 'Day 0 Dreamer';
}

function deriveNextTierPts(points: number): number | null {
  const thresholds = [50, 100, 250, 500, 1000, 2000];
  for (const t of thresholds) {
    if (points < t) return t;
  }
  return null;
}

function RecentSubmissionsTable({ submissions }: { submissions: SubmissionRow[] }) {
  if (submissions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Target className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-body text-foreground font-medium">No submissions yet</p>
        <Link href="/home" className="mt-3 inline-block text-small text-primary font-medium hover:underline">
          Start your first case →
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-small font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Recent activity
      </h3>
      <div className="overflow-x-auto table-scroll-mobile -mx-2 px-2">
        <div className="divide-y divide-border min-w-[500px]">
          {submissions.map((sub, idx) => (
            <Link
              key={sub.id}
              href={`/results/${sub.id}`}
              className="flex items-center gap-3 py-2.5 hover:bg-muted/30 transition-colors rounded-sm px-2 -mx-2"
            >
              <span className="text-micro font-mono text-muted-foreground tabular-nums w-6">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className={`text-small font-mono font-semibold tabular-nums w-12 ${scoreColor(sub.score)}`}>
                {sub.score !== null ? sub.score : '—'}<span className="text-muted-foreground font-normal text-micro">/100</span>
              </span>
              <span className="text-small text-foreground flex-1 truncate">
                {sub.answer_text.slice(0, 90).replace(/\s+/g, ' ')}
                {sub.answer_text.length > 90 ? '…' : ''}
              </span>
              <span className="hidden sm:inline text-micro text-muted-foreground flex-shrink-0">
                {new Date(sub.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
              <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}

function scoreColor(score: number | null): string {
  if (score === null) return 'text-muted-foreground';
  if (score >= 70) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-primary';
}
