'use client';
  
import { Card } from '@/components/ui/card';
import { Lock, Star } from 'lucide-react';
import type { SubmissionRow } from '@/lib/types';
import { SCORE_DIMENSIONS, SCORE_DIMENSION_LABELS, SCORE_DIMENSION_MAX } from '@/lib/constants';

interface Props {
  submissions: SubmissionRow[];
}

// 5 mastery levels per dimension (0-20%, 20-40%, ..., 80-100%)
const LEVELS = [20, 40, 60, 80, 100];

/**
 * 6 dimensions × 5 mastery levels grid.
 * Cells filled = mastered, hollow = locked.
 * Uses brand colors only (cardinal red).
 */
export default function SkillMasteryGrid({ submissions }: Props) {
  // Compute average % score per dimension
  const dimensionScores: Record<string, { sum: number; count: number; max: number }> = {};
  SCORE_DIMENSIONS.forEach((d) => {
    dimensionScores[d] = { sum: 0, count: 0, max: SCORE_DIMENSION_MAX[d] || 100 };
  });

  submissions.forEach((s) => {
    const bd = s.feedback_json?.breakdown;
    if (!bd) return;
    SCORE_DIMENSIONS.forEach((d) => {
      if (typeof bd[d] === 'number') {
        dimensionScores[d].sum += bd[d];
        dimensionScores[d].count++;
      }
    });
  });

  const dimAvgPct: Record<string, number> = {};
  SCORE_DIMENSIONS.forEach((d) => {
    const { sum, count, max } = dimensionScores[d];
    dimAvgPct[d] = count > 0 ? Math.round((sum / count / max) * 100) : 0;
  });

  const dimensionsAbove70 = SCORE_DIMENSIONS.filter((d) => dimAvgPct[d] >= 70).length;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-small font-semibold uppercase tracking-wider text-muted-foreground">
            Skill mastery
          </h3>
          <p className="text-micro text-muted-foreground/70 mt-0.5">
            6 dimensions · 5 levels each
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full">
          <Star className="h-3.5 w-3.5 text-primary" />
          <span className="text-small font-semibold text-primary">
            {dimensionsAbove70} of 6 above 70%
          </span>
        </div>
      </div>

      {/* Grid: 6 rows × 5 columns. Each row = dimension. */}
      <div className="space-y-2">
        {SCORE_DIMENSIONS.map((dim) => {
          const pct = dimAvgPct[dim];
          return (
            <div key={dim} className="flex items-center gap-3">
              {/* Label */}
              <div className="w-32 flex-shrink-0">
                <p className="text-small font-medium text-foreground truncate">
                  {SCORE_DIMENSION_LABELS[dim] || dim}
                </p>
                <p className="text-micro text-muted-foreground tabular-nums">{pct}%</p>
              </div>

              {/* 5 cells */}
              <div className="flex-1 grid grid-cols-5 gap-1.5">
                {LEVELS.map((threshold, idx) => {
                  const filled = pct >= threshold;
                  const isCurrentLevel = !filled && (idx === 0 || pct >= LEVELS[idx - 1]);
                  return (
                    <div
                      key={threshold}
                      className={`h-7 rounded-sm border flex items-center justify-center transition-colors ${
                        filled
                          ? 'bg-primary border-primary text-white'
                          : isCurrentLevel
                          ? 'bg-primary/5 border-primary/30 text-primary/40'
                          : 'bg-muted border-border text-muted-foreground/30'
                      }`}
                      title={`${SCORE_DIMENSION_LABELS[dim] || dim}: ${threshold}%`}
                    >
                      {filled ? (
                        <Star className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-center gap-4 text-micro text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-primary" />
          Mastered
        </span>
        <span className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-primary/5 border border-primary/30" />
          Current
        </span>
        <span className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-muted border border-border" />
          Locked
        </span>
      </div>
    </Card>
  );
}
