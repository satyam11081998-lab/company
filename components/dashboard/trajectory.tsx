// DELIVERABLE — "Am I improving?" Trailing trajectory of recent first-attempt scores as a
// sparkline + trend delta (last 3 vs prior 3). Small-multiples-friendly; honest about
// trailing average, not cumulative totals.
'use client';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-dashboard-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface Props {
  /** chronological (oldest first) recent first-attempt scores, 0..100. */
  scores: number[];
  className?: string;
}

export function Trajectory({ scores, className }: Props) {
  const pts = scores.slice(-14);
  const hasData = pts.length >= 2;
  const mounted = useMounted(650);

  let trend = 0;
  if (pts.length >= 2) {
    const tail = pts.slice(-3);
    const prior = pts.slice(-6, -3);
    const avg = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
    trend = Math.round(avg(tail) - (prior.length ? avg(prior) : avg(tail)));
  }

  const W = 240;
  const H = 56;
  const min = Math.min(...pts, 0);
  const max = Math.max(...pts, 100);
  const span = max - min || 1;
  const path = pts
    .map((s, i) => {
      const x = (i / Math.max(1, pts.length - 1)) * W;
      const y = H - ((s - min) / span) * H;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-success' : trend < 0 ? 'text-warning' : 'text-muted-foreground';

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-label text-muted-foreground uppercase tracking-widest">Trajectory</p>
        {hasData && (
          <span className={cn('inline-flex items-center gap-1 text-[13px] font-medium', trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" aria-hidden />
            {trend > 0 ? '+' : ''}
            {trend} pts
          </span>
        )}
      </div>
      {hasData ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-auto w-full" role="img" aria-label="recent score trend">
          <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={mounted ? 0 : 1}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        </svg>
      ) : (
        <p className="text-[12.5px] text-muted-foreground mt-3">A couple more cases and your trend appears here.</p>
      )}
      <p className="text-[11.5px] text-muted-foreground mt-3">Last {pts.length} scored cases · trailing average</p>
    </div>
  );
}

export default Trajectory;
