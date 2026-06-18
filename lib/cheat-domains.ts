/**
 * Fixed domain taxonomy for cheat-sheet items. The user assigns the domain
 * (no auto-classification). NULL domain renders as "Uncategorized".
 * Accent colours are category hues (not theme tokens) used for dots/borders.
 */
export const CHEAT_DOMAINS = [
  { id: 'finance', label: 'Finance', accent: '#2563EB' },
  { id: 'marketing', label: 'Marketing & Brand', accent: '#DB2777' },
  { id: 'strategy', label: 'Strategy', accent: '#7C3AED' },
  { id: 'operations', label: 'Operations', accent: '#0891B2' },
  { id: 'economy', label: 'Economy & Policy', accent: '#CA8A04' },
  { id: 'technology', label: 'Technology', accent: '#059669' },
  { id: 'people', label: 'People & Org', accent: '#EA580C' },
  { id: 'general', label: 'General', accent: '#64748B' },
] as const;

export type CheatDomainId = (typeof CHEAT_DOMAINS)[number]['id'];

export const CHEAT_DOMAIN_IDS: CheatDomainId[] = CHEAT_DOMAINS.map((d) => d.id);

export const UNCATEGORIZED = { id: 'uncategorized', label: 'Uncategorized', accent: '#94A3B8' } as const;

/** Resolve a domain id (or null/unknown) to its display meta. */
export function domainMeta(id: string | null | undefined): { id: string; label: string; accent: string } {
  return CHEAT_DOMAINS.find((d) => d.id === id) ?? UNCATEGORIZED;
}
