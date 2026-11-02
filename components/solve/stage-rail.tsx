'use client';

import { memo } from 'react';

/**
 * Where the candidate is in the universal process — CLARIFY → … → CONCLUDE for a
 * guesstimate, CLARIFY → … → RECOMMEND for a case.
 *
 * A SEPARATE object from the structure tree, and drawn separately on purpose. The tree is
 * what they have built; this is where they are in building it. Merging them into one
 * diagram was the obvious move and it ruins both: the process is a line, the structure is
 * a tree, and a chart that is both is neither.
 *
 * The stage is derived server-side from the tree itself (services/case_models.stage_of),
 * never asked of a model — a decomposition with no figures in it IS the decompose stage,
 * so classifying it would be re-reading something already known and getting it wrong some
 * of the time.
 *
 * DESIGN CONTRACT (docs/CASEBOOK_DESIGN_CONTRACT.md):
 *   §C  cardinal red marks exactly one thing: the stage they are on now.
 *   §C  no multi-colour scale. Done / now / ahead are carried by weight and muting alone.
 *   §B  declared type classes only (.text-micro). No ad-hoc sizes, no opacity on text.
 *   §D  no left-accent borders, no pills, no progress bar with a coloured fill.
 */

export interface StageRailProps {
  stages: string[];
  current?: string | null;
  className?: string;
}

function StageRailImpl({ stages, current, className = '' }: StageRailProps) {
  if (!stages || stages.length === 0) return null;
  const i = current ? stages.findIndex((s) => s === current) : -1;

  return (
    <div className={className}>
      <h2 className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">
        Where you are
      </h2>
      <ol className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {stages.map((s, n) => {
          const done = i >= 0 && n < i;
          const now = n === i;
          return (
            <li key={s} className="flex items-center gap-1.5">
              <span
                className={
                  'text-micro ' +
                  (now
                    ? 'font-semibold text-primary'
                    : done
                      ? 'text-foreground'
                      : 'text-muted-foreground')
                }
                aria-current={now ? 'step' : undefined}
              >
                {s}
              </span>
              {n < stages.length - 1 && (
                /* A hairline separator, not an arrow: the process is iterative and an
                   arrow would promise a one-way march it does not make. */
                <span aria-hidden className="text-micro text-muted-foreground">
                  ·
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export const StageRail = memo(StageRailImpl);
export default StageRail;
