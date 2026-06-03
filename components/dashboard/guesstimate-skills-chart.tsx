'use client';
// G3 — separate guesstimate skills chart. Guesstimates are scored on their own
// 5-dim rubric (1..5) and are fully excluded from the 6-dim case analytics, so they
// get their own panel here, beside the case dimension chart.
import {
  GUESSTIMATE_DIMENSIONS,
  GUESSTIMATE_DIMENSION_LABELS,
  GUESSTIMATE_DIMENSION_MAX,
  type GuesstimateDimension,
} from '@/lib/constants';

export default function GuesstimateSkillsChart({
  skills,
  count,
}: {
  skills?: Partial<Record<GuesstimateDimension, number>>;
  count?: number;
}) {
  const n = count ?? 0;
  const data = skills ?? {};

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-small font-semibold uppercase tracking-wide text-muted-foreground">
          Guesstimate skills
        </h3>
        <span className="text-small text-muted-foreground/70">
          {n > 0 ? `${n} attempt${n === 1 ? '' : 's'}` : 'no attempts yet'}
        </span>
      </div>

      {n === 0 ? (
        <p className="mt-4 text-body text-muted-foreground">
          Solve a guesstimate to see your scoping, structure, segmentation, arithmetic, and
          sanity-check skills here.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {GUESSTIMATE_DIMENSIONS.map((dim) => {
            const value = data[dim];
            const has = typeof value === 'number';
            const pct = has ? Math.max(0, Math.min(100, (value! / GUESSTIMATE_DIMENSION_MAX) * 100)) : 0;
            return (
              <div key={dim}>
                <div className="flex items-center justify-between text-body">
                  <span className="font-medium text-foreground/80">
                    {GUESSTIMATE_DIMENSION_LABELS[dim]}
                  </span>
                  <span className="font-semibold text-foreground">
                    {has ? value!.toFixed(1) : '—'}
                    <span className="text-muted-foreground/70">/{GUESSTIMATE_DIMENSION_MAX}</span>
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
