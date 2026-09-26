import type { UsCase } from './types';

/**
 * Display labels for the US case types. Kept in its own module so client
 * components can import it without pulling the 100-item case bank
 * (./index.ts) into the browser bundle.
 */
export const US_CASE_TYPE_LABEL: Record<UsCase['type'], string> = {
  profitability: 'Profitability',
  'market entry': 'Market entry',
  growth: 'Growth strategy',
  pricing: 'Pricing',
  'm&a': 'M&A / private equity',
  operations: 'Operations',
  'cost reduction': 'Cost reduction',
  'go to market': 'Go-to-market',
  'competitive strategy': 'Competitive strategy',
};

/** Label for any case row type, including the market sizing bucket. */
export function usTypeLabel(type: string | null | undefined): string {
  if (!type) return 'Case';
  if (type === 'guesstimate') return 'Market sizing';
  return (US_CASE_TYPE_LABEL as Record<string, string>)[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

/** The nine US case types, in the order the skill map and charts show them. */
export const US_CASE_TYPES: UsCase['type'][] = [
  'profitability',
  'market entry',
  'growth',
  'pricing',
  'm&a',
  'operations',
  'cost reduction',
  'go to market',
  'competitive strategy',
];
