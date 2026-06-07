// DELIVERABLE v2 — bullet charts, 2-column dense layout with an explicit cohort delta.
// Replaces components/dimension-radar.tsx. Fixes v1: tracks were full-width (stretched) and
// the cohort tick was invisible. Now: 2 columns (short honest tracks), a clear navy cohort
// marker, and a +/− delta chip vs the cohort per dimension (the legible "ahead/behind").
'use client';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-dashboard-motion';
import { SCORE_DIMENSION_LABELS, SCORE_DIMENSION_MAX, type ScoreDimension } from '@/lib/constants';
import type { DimensionStat } from '@/lib/readiness';

interface Props {
  dimensions: DimensionStat[];
  benchmark?: Partial<Record<ScoreDimension, number>>;
  className?: string;
}

const ORDER: ScoreDimension[] = [
  'structure', 'quantitative', 'synthesis', 'business_judgment', 'creativity', 'presence',
];

export function DimensionBullets({ dimensions, benchmark, className }: Props) {
  const byDim = new Map(dimensions.map((d) => [d.dimension, d]));
  return (
    <div className={cn('grid gap-x-8 gap-y-4 sm:grid-cols-2', className)}>
      {ORDER.map((dim, i) => {
        const d = byDim.get(dim) ?? { dimension: dim, max: SCORE_DIMENSION_MAX[dim], earned: 0, ratio: 0 };
        const userPct = Math.min(100, d.ratio * 100);
        const benchPts = benchmark?.[dim];
        const benchPct = benchPts != null && d.max > 0 ? Math.min(100, (benchPts / d.max) * 100) : null;
        const delta = benchPts != null ? Math.round(d.earned - benchPts) : null;
        return (
          <div key={dim} className="flex flex-col">
            <div className="flex items-center justify-between mb-[6px]">
              <span className="text-[12.5px] font-medium text-foreground truncate">{SCORE_DIMENSION_LABELS[dim]}</span>
              <span className="flex items-center gap-2">
                <span className="text-[12.5px] font-mono-data tabular-nums text-foreground">
                  {Math.round(d.earned)}/{d.max}
                </span>
                {delta != null && (
                  <span
                    className={cn(
                      'text-[10.5px] font-semibold tabular-nums rounded px-1.5 py-[2px] leading-none',
                      delta >= 0 ? 'text-success bg-success/10' : 'text-warning bg-warning/10'
                    )}
                  >
                    {delta >= 0 ? '+' : '−'}
                    {Math.abs(delta)}
                  </span>
                )}
              </span>
            </div>
            <div className="relative h-[6px] rounded-full bg-muted overflow-hidden">
              <AnimatedFill pct={userPct} delay={120 + i * 90} />
              {benchPct != null && (
                <div
                  className="absolute -top-[1px] -bottom-[1px] w-[2.5px] rounded-sm bg-navy"
                  style={{ left: `calc(${benchPct}% - 1.25px)`, zIndex: 10 }}
                  title="cohort median"
                />
              )}
            </div>
          </div>
        );
      })}
      {benchmark && (
        <p className="text-[11.5px] text-muted-foreground sm:col-span-2 mt-1">
          Bar = your recency-weighted score · navy tick = cohort median · chip = gap vs cohort
        </p>
      )}
    </div>
  );
}

function AnimatedFill({ pct, delay }: { pct: number; delay: number }) {
  const mounted = useMounted(delay);
  return (
    <div
      className="absolute inset-y-0 left-0 rounded-full bg-primary"
      style={{ width: `${mounted ? pct : 0}%`, transition: 'width .7s cubic-bezier(.22,1,.36,1)' }}
    />
  );
}

export default DimensionBullets;
