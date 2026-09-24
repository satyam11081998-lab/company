import type { AtlasData, AtlasVisual } from '../../atlas-types';
import { ATLAS_CORE } from './atlas-core';
import { ATLAS_SYSTEMS } from './atlas-systems';
import { ATLAS_VISUALS } from './atlas-visuals';

/**
 * The Guesstimate Data Atlas.
 *
 * Split across four files on purpose:
 *   atlas-core.ts     — the anchors and the human / economic base (numbers)
 *   atlas-systems.ts  — the systems on top, the arithmetic, the cross-checks
 *   atlas-visuals.ts  — the charts and source chips, keyed by section id
 *   this file         — the merge
 *
 * Numbers and charts are kept apart so a chart can be re-cut without anyone
 * touching a sourced datum, and so neither file grows past reading length.
 *
 * Every datum carries `asOf`, `source` and an honest `grade`. If you add a
 * number without all three, the block will still render it, but the sheet
 * stops being worth trusting — which is the only thing it has.
 */
export const DATA_ATLAS: AtlasData = {
  updated: 'September 2026',
  sections: [...ATLAS_CORE, ...ATLAS_SYSTEMS].map((s) => {
    const extra = ATLAS_VISUALS[s.id];
    const visuals: AtlasVisual[] = extra?.visuals ?? [];
    return { ...s, visuals, sources: extra?.sources ?? s.sources, covers: extra?.covers };
  }),
};
