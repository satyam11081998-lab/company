/**
 * Casebook pages that have a fuller standalone guide elsewhere on the site.
 *
 * A casebook page is the version you want mid-case: short, dense, no history.
 * Some topics also have a full reference page that would bloat the casebook if
 * inlined. This map is how a reader finds it — the link is rendered in the
 * sticky right rail, below "On this page" and pinned so it stays reachable at
 * any scroll depth.
 *
 * Related to but deliberately separate from CASEBOOK_CANONICAL_OVERRIDES in
 * lib/seo.ts. Every canonicalised page should have a deep dive (that is where
 * its canonical points), but a page can have a deep dive WITHOUT canonicalising
 * away — for instance when both pages target different queries and should both
 * rank. Deriving one from the other would quietly couple a navigation decision
 * to an indexing decision.
 */
export interface DeepDive {
  href: string;
  label: string;
  blurb: string;
}

export const CASEBOOK_DEEP_DIVES: Record<string, DeepDive> = {
  'core-frameworks/mece': {
    href: '/learn/mece-framework',
    label: 'The complete MECE guide',
    blurb:
      'Origin, pronunciation, 12 worked examples, 6 ways to build a split, the GRIPS test, criticisms and 14 FAQs.',
  },
};

export function getDeepDive(slug?: string): DeepDive | null {
  if (!slug) return null;
  return CASEBOOK_DEEP_DIVES[slug] ?? null;
}
