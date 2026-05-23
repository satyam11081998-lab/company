'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SubmissionRow } from '@/lib/types';

interface ProgressChartProps {
  submissions: SubmissionRow[];
}

interface ChartPoint {
  index: number;
  date: string;
  score: number;
  fullDate: string;
}

export default function ProgressChart(props: ProgressChartProps) {
  const submissions = props.submissions;

  // Need at least 2 submissions to show a meaningful chart
  if (!submissions || submissions.length < 2) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Progress over time</h2>
            <p className="mt-1 text-xs text-muted-foreground/70">Your score trajectory across submissions</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            {submissions.length === 0 ? 'No submissions yet' : 'One submission so far'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Submit {submissions.length === 0 ? 'your first case' : 'one more case'} to see your progress chart
          </p>
        </div>
      </Card>
    );
  }

  // Sort oldest → newest so the line shows progression chronologically
  const sorted = [...submissions].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const data: ChartPoint[] = sorted.map((s, i) => {
    const date = new Date(s.created_at);
    return {
      index: i + 1,
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      score: s.score ?? 0,
      fullDate: date.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
    };
  });

  // Compute trend — compare last 3 to previous 3 (or whatever's available)
  const recentCount = Math.min(3, Math.floor(data.length / 2));
  const recentAvg = data.slice(-recentCount).reduce((sum, d) => sum + d.score, 0) / recentCount;
  const earlierAvg = data.slice(0, recentCount).reduce((sum, d) => sum + d.score, 0) / recentCount;
  const trendDelta = recentAvg - earlierAvg;
  const trendDirection: 'up' | 'down' | 'flat' = trendDelta > 3 ? 'up' : trendDelta < -3 ? 'down' : 'flat';

  const allTimeAvg = Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length);
  const latestScore = data[data.length - 1].score;
  const bestScore = Math.max(...data.map((d) => d.score));

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Progress over time</h2>
          <p className="mt-1 text-xs text-muted-foreground/70">Your score trajectory across {data.length} submissions</p>
        </div>
        <TrendBadge direction={trendDirection} delta={Math.round(trendDelta)} />
      </div>

      {/* Mini stats row */}
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <StatBox label="Latest" value={latestScore} />
        <StatBox label="Average" value={allTimeAvg} />
        <StatBox label="Best" value={bestScore} highlight />
      </div>

      {/* Chart */}
      <div className="mt-6 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickCount={6}
            />
            <ReferenceLine
              y={allTimeAvg}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: 'avg', position: 'insideRight', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              itemStyle={{ color: 'hsl(var(--primary))' }}
              formatter={(value: number) => [value + '/100', 'Score']}
              labelFormatter={(_, payload) => {
                if (payload && payload[0]) {
                  return (payload[0].payload as ChartPoint).fullDate;
                }
                return '';
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function TrendBadge(props: { direction: 'up' | 'down' | 'flat'; delta: number }) {
  const { direction, delta } = props;
  if (direction === 'up') {
    return (
      <div className="inline-flex items-center gap-1 rounded-md bg-success-soft px-2 py-1 text-xs font-semibold text-success">
        <TrendingUp className="h-3.5 w-3.5" />
        +{delta} pts trending up
      </div>
    );
  }
  if (direction === 'down') {
    return (
      <div className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-primary">
        <TrendingDown className="h-3.5 w-3.5" />
        {delta} pts trending down
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
      <Minus className="h-3.5 w-3.5" />
      Holding steady
    </div>
  );
}

function StatBox(props: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={'rounded-md border p-3 ' + (props.highlight ? 'border-primary/30 bg-accent' : 'border-border bg-muted/50')}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{props.label}</p>
      <p className={'mt-1 text-xl font-bold tabular-nums ' + (props.highlight ? 'text-primary' : 'text-foreground')}>
        {props.value}<span className="text-xs font-normal text-muted-foreground">/100</span>
      </p>
    </div>
  );
}