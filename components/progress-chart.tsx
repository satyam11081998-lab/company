'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { AreaChart } from '@tremor/react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Medal, Flag } from 'lucide-react';
import type { SubmissionRow } from '@/lib/types';

interface ProgressChartProps {
  submissions: SubmissionRow[];
}

interface ChartPoint {
  index: number;
  date: string;
  caseTitle: string;
  Score: number;
  '3-case Avg': number | null;
  percentile: number; // calculated conceptually
}

// -----------------------------------------------------------------------------
// Tremor Custom Tooltip
// -----------------------------------------------------------------------------
const CustomTooltip = (props: any) => {
  const { payload, active } = props;
  if (!active || !payload || payload.length === 0) return null;
  
  const data = payload[0].payload as ChartPoint;
  
  return (
    <div className="w-56 rounded-md border border-border bg-background p-3 shadow-lg z-50">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
        <span className="font-medium text-foreground text-sm">{data.date}</span>
        <span className="text-micro font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          Top {100 - data.percentile}%
        </span>
      </div>
      <div className="space-y-1.5">
        <p className="text-small font-medium text-foreground truncate" title={data.caseTitle}>
          {data.caseTitle}
        </p>
        
        {payload.map((category: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: category.color }} 
              />
              <span className="text-small text-muted-foreground">{category.dataKey}:</span>
            </div>
            <span className="font-medium text-small text-foreground">
              {category.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export default function ProgressChart({ submissions }: ProgressChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Data prep
  const data: ChartPoint[] = useMemo(() => {
    if (!submissions || submissions.length === 0) return [];
    
    // Sort oldest → newest
    const sorted = [...submissions].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Get max score to calculate relative percentile for this user
    const maxScore = Math.max(...sorted.map(s => s.score ?? 0));

    return sorted.map((s, i) => {
      const date = new Date(s.created_at);
      
      // Moving avg (last 3)
      let avg: number | null = null;
      if (i >= 2) {
        avg = Math.round(((sorted[i].score ?? 0) + (sorted[i-1].score ?? 0) + (sorted[i-2].score ?? 0)) / 3);
      } else if (i === 1) {
        avg = Math.round(((sorted[i].score ?? 0) + (sorted[i-1].score ?? 0)) / 2);
      } else {
        avg = s.score; // For first item, avg is just the score
      }

      // Mock percentile calculation (relative to own best for demonstration)
      const score = s.score ?? 0;
      const percentile = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

      return {
        index: i,
        date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        caseTitle: 'Practice Case', // Real app would join with cases table
        Score: score,
        '3-case Avg': avg,
        percentile,
      };
    });
  }, [submissions]);

  // Empty state
  if (data.length < 2) {
    return (
      <Card className="p-4 h-full flex flex-col border-border/60">
        <div>
          <h2 className="text-small font-semibold uppercase tracking-wide text-muted-foreground">Performance Trajectory</h2>
          <p className="mt-1 text-small text-muted-foreground/70">Score history and moving average</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center animate-fade-in">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <p className="text-body font-medium text-foreground">
            {data.length === 0 ? 'No submissions yet' : 'One submission so far'}
          </p>
          <p className="mt-1 text-small text-muted-foreground max-w-xs">
            Submit {data.length === 0 ? 'your first case' : 'one more case'} to unlock your progress analytics and percentile rankings.
          </p>
        </div>
      </Card>
    );
  }

  // Calculate milestones / extreme points for annotations
  const bestScoreIndex = data.reduce((bestIdx, current, idx, arr) => 
    current.Score > arr[bestIdx].Score ? idx : bestIdx, 0
  );
  
  // Trend computation
  const latestScore = data[data.length - 1].Score;
  const allTimeAvg = Math.round(data.reduce((sum, d) => sum + d.Score, 0) / data.length);
  
  const recentCount = Math.min(3, Math.floor(data.length / 2));
  const recentAvg = data.slice(-recentCount).reduce((sum, d) => sum + d.Score, 0) / recentCount;
  const earlierAvg = data.slice(0, Math.max(1, data.length - recentCount)).reduce((sum, d) => sum + d.Score, 0) / Math.max(1, data.length - recentCount);
  const trendDelta = recentAvg - earlierAvg;
  const trendDirection = trendDelta > 3 ? 'up' : trendDelta < -3 ? 'down' : 'flat';

  return (
    <Card className="p-4 relative overflow-hidden group border-border/60">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-small font-semibold uppercase tracking-wide text-muted-foreground">Performance Trajectory</h2>
          <p className="mt-1 text-small text-muted-foreground/70">Across {data.length} total submissions</p>
        </div>
        <TrendBadge direction={trendDirection} delta={Math.round(trendDelta)} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatBox label="Latest Score" value={latestScore} />
        <StatBox label="All-Time Avg" value={allTimeAvg} />
        <StatBox label="Peak Score" value={data[bestScoreIndex].Score} highlight />
      </div>

      <div className="relative h-64 w-full mt-4" ref={chartRef}>
        
        {/* Horizontal Milestone Overlay Lines */}
        {/* Tremor's AreaChart has fixed margins, we approximate the Y positions for 0-100 scale */}
        <div className="absolute inset-0 pointer-events-none z-0 pr-[10px] pl-[40px] py-[10px]">
           <div className="relative w-full h-full">
             {/* 85 - Excellent */}
             <div className="absolute top-[15%] left-0 w-full border-t border-dashed border-emerald-500/30">
               <span className="absolute -top-4 -right-1 text-[9px] font-medium text-emerald-600/70 uppercase">Excellent (85)</span>
             </div>
             {/* 70 - Good */}
             <div className="absolute top-[30%] left-0 w-full border-t border-dashed border-amber-500/30">
               <span className="absolute -top-4 -right-1 text-[9px] font-medium text-amber-600/70 uppercase">Good (70)</span>
             </div>
             {/* 50 - Passing */}
             <div className="absolute top-[50%] left-0 w-full border-t border-dashed border-rose-500/30">
               <span className="absolute -top-4 -right-1 text-[9px] font-medium text-rose-600/70 uppercase">Passing (50)</span>
             </div>
           </div>
        </div>

        {/* Annotations Layer */}
        <div className="absolute inset-0 pointer-events-none z-20 pr-[10px] pl-[40px] py-[10px]">
          <div className="relative w-full h-full">
            {/* Best Score Annotation */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-full pb-2 flex flex-col items-center animate-fade-in"
              style={{ 
                left: `${(bestScoreIndex / (data.length - 1)) * 100}%`,
                top: `${100 - data[bestScoreIndex].Score}%` 
              }}
            >
              <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                <Medal className="h-3 w-3" /> Peak
              </div>
              <div className="w-px h-3 bg-primary" />
            </div>

            {/* First Submission Annotation */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-full pb-2 flex flex-col items-center animate-fade-in"
              style={{ 
                left: '0%',
                top: `${100 - data[0].Score}%` 
              }}
            >
              <div className="bg-navy text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                <Flag className="h-3 w-3" /> Start
              </div>
              <div className="w-px h-3 bg-navy" />
            </div>
          </div>
        </div>

        {/* Tremor AreaChart */}
        <div className="relative z-10 w-full h-full">
          <AreaChart
            data={data}
            index="date"
            categories={["Score", "3-case Avg"]}
            colors={["rose-600", "slate-400"]}
            valueFormatter={(number: number) => number.toString()}
            showAnimation={true}
            animationDuration={800}
            minValue={0}
            maxValue={100}
            showLegend={false}
            showGridLines={false}
            customTooltip={CustomTooltip}
            className="h-full w-full [&_.recharts-text]:text-[10px] md:[&_.recharts-text]:text-xs"
            curveType="monotone"
          />
        </div>
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function TrendBadge({ direction, delta }: { direction: 'up' | 'down' | 'flat'; delta: number }) {
  if (direction === 'up') {
    return (
      <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-600">
        <TrendingUp className="h-3.5 w-3.5" />
        <span className="text-micro font-semibold">+{delta} pts recent</span>
      </div>
    );
  }
  if (direction === 'down') {
    return (
      <div className="flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-red-600">
        <TrendingDown className="h-3.5 w-3.5" />
        <span className="text-micro font-semibold">{delta} pts recent</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
      <Minus className="h-3.5 w-3.5" />
      <span className="text-micro font-semibold">Flat recent</span>
    </div>
  );
}

function StatBox({ label, value, highlight = false }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border ${highlight ? 'border-primary/20 bg-primary/5' : 'border-border/60 bg-muted/20'} p-3 flex flex-col items-center justify-center transition-colors`}>
      <p className="text-micro font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-bold tracking-tight ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}