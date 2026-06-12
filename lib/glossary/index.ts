/**
 * Glossary utility functions.
 *
 * Central access point for glossary term lookup, filtering, and enumeration.
 * Used by:
 *   - app/glossary/page.tsx (index page)
 *   - app/glossary/[term]/page.tsx (individual term pages)
 *   - app/sitemap.ts (sitemap generation)
 */

import { GLOSSARY_TERMS, type GlossaryTerm } from './terms';

export type { GlossaryTerm };
export { GLOSSARY_TERMS };

/** Lookup a term by its URL slug. Returns undefined if not found. */
export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.slug === slug);
}

/** Get all terms in a specific category, alphabetically sorted. */
export function getTermsByCategory(
  category: GlossaryTerm['category']
): GlossaryTerm[] {
  return GLOSSARY_TERMS
    .filter((t) => t.category === category)
    .sort((a, b) => a.term.localeCompare(b.term));
}

/** Get all slugs — used by generateStaticParams(). */
export function getAllSlugs(): string[] {
  return GLOSSARY_TERMS.map((t) => t.slug);
}

/** Get related terms for a given slug (resolved from relatedTerms slugs). */
export function getRelatedTerms(slug: string): GlossaryTerm[] {
  const term = getTermBySlug(slug);
  if (!term) return [];
  return term.relatedTerms
    .map((s) => getTermBySlug(s))
    .filter((t): t is GlossaryTerm => t !== undefined);
}

/** All unique categories, sorted. */
export const CATEGORIES: GlossaryTerm['category'][] = [
  'consulting',
  'finance',
  'marketing',
  'operations',
  'product',
  'strategy',
];

/** Human-readable labels for each category. */
export const CATEGORY_LABELS: Record<GlossaryTerm['category'], string> = {
  consulting: 'Consulting',
  finance: 'Finance',
  marketing: 'Marketing',
  operations: 'Operations',
  product: 'Product',
  strategy: 'Strategy',
};
