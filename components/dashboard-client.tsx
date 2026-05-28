'use client';
  
import Link from 'next/link';
import { ArrowRight, Target } from 'lucide-react';
import SectionHeader from '@/components/section-header';
import StatTile from '@/components/stat-tile';
import CareerLadder from '@/components/career-ladder';
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
        {/* TOP ROW: Stats & Activity */}
        <section className="animate-slide-up">
          <SectionHeader 
            label="PERFORMANCE & ACTIVITY"
            subtitle="Your platform standing and recent submissions"
          />
          <div className="grid lg:grid-cols-12 gap-4">
            {/* 4 Stat Tiles (2x2 grid) */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <StatTile
                label="Points"
                value={user.points.toLocaleString('en-IN')}
                sublabel={tierName}
                dotColor="primary"
              >
                {/* Progress to next tier visual */}
                {nextTierPts && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    <div className="flex justify-between text-micro text-muted-foreground">
                      <span>Progress to {nextTierPts}</span>
                      <span className="font-mono font-medium">{Math.round((user.points / nextTierPts) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.round((user.points / nextTierPts) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </StatTile>

              <StatTile
                label="Rank"
                value={`#${rankNum}`}
                sublabel={`of ${totalUsers} students`}
                dotColor="navy"
              >
                {/* Context bar visual */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex justify-between text-[10px] uppercase font-semibold text-muted-foreground/60">
                      <span>#1</span>
                      <span>#{(Math.ceil(totalUsers / 10) * 10) || 50}</span>
                    </div>
                    <div className="relative h-1.5 w-full bg-muted rounded-full">
                      <div 
                        className="absolute top-0 h-full w-2 bg-navy rounded-full transform -translate-x-1" 
                        style={{ left: `${Math.max(5, Math.min(95, (rankNum / totalUsers) * 100))}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </StatTile>

              <StatTile
                label="Avg Score"
                value={avgScore !== null ? avgScore.toString() : '—'}
                valueSuffix={avgScore !== null ? '/100' : ''}
                sublabel="per submission"
                dotColor="warning"
              >
                {/* Mini 5-bar sparkline visual */}
                <div className="mt-2 flex items-end gap-1 h-6">
                  {submissions.slice(0, 5).reverse().map((sub, i) => {
                    const score = sub.score || 0;
                    const height = Math.max(10, score);
                    return (
                      <div 
                        key={i} 
                        className={`w-full rounded-sm transition-all duration-300 ${score >= 70 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-primary'}`}
                        style={{ height: `${height}%`, opacity: 0.2 + (i * 0.2) }}
                        title={`Score: ${score}`}
                      />
                    );
                  })}
                  {submissions.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-micro text-muted-foreground italic">No data</div>
                  )}
                </div>
              </StatTile>

              <StatTile
                label="Percentile"
                value={percentile !== null ? percentile.toString() : '—'}
                valueSuffix={percentile !== null ? '%ile' : ''}
                sublabel={percentile !== null ? "Top percentile band" : "Complete a case"}
                dotColor="success"
              >
                {/* Distribution visual */}
                {percentile !== null && (
                  <div className="mt-2 flex flex-col gap-1 w-full">
                    <div className="flex justify-between text-micro text-muted-foreground">
                      <span>Bottom</span>
                      <span className="text-success font-medium">Top {100 - percentile}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gradient-to-r from-muted via-success/20 to-success rounded-full overflow-hidden relative">
                      <div 
                        className="absolute top-0 bottom-0 border-r-2 border-background bg-foreground" 
                        style={{ left: 0, width: `${percentile}%` }} 
                      />
                    </div>
                  </div>
                )}
              </StatTile>
            </div>

            {/* Heatmap */}
            <div className="lg:col-span-3">
              <SubmissionHeatmap submissions={submissions} weeks={4} title="Heatmap" />
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-4 h-full">
              <RecentSubmissionsTable submissions={submissions.slice(0, 5)} />
            </div>
          </div>
        </section>

        {/* BOTTOM ROW: Profile, Progress, Ladder */}
        <section className="animate-slide-up" style={{ animationDelay: '60ms' }}>
          <SectionHeader 
            label="SKILL PROFILE & CAREER"
            subtitle="Your strengths and progression"
          />
          <div className="grid lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3">
              <Card className="p-4 h-full flex flex-col">
                <h3 className="text-small font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skill Profile</h3>
                <div className="flex-1 flex items-center justify-center w-full">
                  <DimensionRadar breakdown={latestBreakdown} benchmark={benchmark} />
                </div>
              </Card>
            </div>
            <div className="lg:col-span-6">
              <ProgressChart submissions={submissions.slice(0, 12).reverse()} />
            </div>
            <div className="lg:col-span-3">
              <CareerLadder points={user.points} />
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
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-small font-semibold uppercase tracking-wider text-muted-foreground">
          Recent activity
        </h3>
        <Link href="/home" className="text-micro text-primary font-semibold hover:underline">View All →</Link>
      </div>
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
