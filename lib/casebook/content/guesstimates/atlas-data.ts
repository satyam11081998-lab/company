import type { AtlasData } from '../../atlas-types';
import { ATLAS_CORE } from './atlas-core';
import { ATLAS_SYSTEMS } from './atlas-systems';

/**
 * The Guesstimate Data Atlas.
 *
 * Split across two files purely for readability — `atlas-core.ts` holds the
 * anchors and the human/economic base, `atlas-systems.ts` the systems that
 * run on top of it plus the arithmetic and the cross-checks.
 *
 * Every datum carries `asOf`, `source` and an honest `grade`. If you add a
 * number without all three, the block will still render it, but the sheet
 * stops being worth trusting — which is the only thing it has.
 */
export const DATA_ATLAS: AtlasData = {
  updated: 'September 2026',
  sections: [...ATLAS_CORE, ...ATLAS_SYSTEMS],
};
