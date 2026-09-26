import type { UsCase, UsGuesstimate } from './types';
import { US_CASES_A } from './cases-a';
import { US_CASES_B } from './cases-b';
import { US_GUESSTIMATES_A } from './guesstimates-a';
import { US_GUESSTIMATES_B } from './guesstimates-b';

export type { UsCase, UsGuesstimate } from './types';

/** The 50 US cases, in code order. */
export const US_CASES: UsCase[] = [...US_CASES_A, ...US_CASES_B];
/** The 50 US guesstimates (market sizing), in code order. */
export const US_GUESSTIMATES: UsGuesstimate[] = [...US_GUESSTIMATES_A, ...US_GUESSTIMATES_B];

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

/** The markdown prompt stored in cases.content — what the candidate sees. */
export function usCaseContent(c: UsCase): string {
  const facts = c.facts.map((f) => `- ${f}`).join('\n');
  const asks = c.asks.map((a, i) => `${i + 1}. ${a}`).join('\n');
  return `# ${c.title}\n\n**Client situation.** ${c.situation}\n\n**What you know**\n${facts}\n\n## Your task (≈ ${c.minutes} min)\n\n${asks}`;
}

export function usGuesstimateContent(g: UsGuesstimate): string {
  return (
    `# ${g.title}\n\n${g.scope}\n\n## What a strong answer includes (≈ ${g.minutes} min)\n\n` +
    '1. Clarify the scope and units before you start.\n' +
    '2. A clear, MECE structure (top-down or bottom-up) that segments the key driver.\n' +
    '3. A number for every assumption, multiplied through to a single point estimate.\n' +
    '4. A sanity check against something you already know.'
  );
}

export function pointsFor(difficulty: 'easy' | 'medium' | 'hard', guesstimate: boolean): number {
  if (guesstimate) return difficulty === 'hard' ? 100 : difficulty === 'medium' ? 85 : 70;
  return difficulty === 'hard' ? 110 : difficulty === 'medium' ? 85 : 75;
}
