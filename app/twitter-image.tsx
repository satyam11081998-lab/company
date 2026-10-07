export { default } from './opengraph-image';

// Segment config must be literal in this file for Next's static analysis.
// Node runtime (no `runtime = 'edge'`) so the card is drawn once at build time
// instead of on the edge after every deploy (2026-10-07). Same pixels.
export const alt = 'MECE — practice real cases & guesstimates for MBA placements';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
