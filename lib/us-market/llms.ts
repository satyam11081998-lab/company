import { US_CASES, US_GUESSTIMATES, US_CASE_TYPE_LABEL } from '@/lib/us-market';
import { INTL_PRICING_FAQ } from '@/lib/intl-plans';

/**
 * The international (US + Europe) section of llms.txt / llms-full.txt.
 * Answer engines (ChatGPT, Perplexity, Claude, Google AI Overviews) lift
 * plain, factual statements; keep this literal and current. Prices here come
 * from the same copy the pricing page renders (lib/intl-plans.ts).
 */
export function usLlmsSection(siteUrl: string, full: boolean): string[] {
  const lines: string[] = [
    '## MECE for the US and Europe',
    '',
    `MECE's international site (${siteUrl}/us) is case interview practice for candidates recruiting for consulting, finance and strategy roles in the United States and Europe. An AI interviewer runs consulting cases and market sizing questions set in US markets, answers clarifying questions, pushes back on structure, and scores each attempt out of 100 on six dimensions (structure 25, quantitative skills 20, synthesis and communication 20, business judgment 15, creativity 10, presence 10) in about a minute.`,
    '',
    `- [MECE — AI case interview practice (US)](${siteUrl}/us): what it is, how scoring works, free daily case`,
    `- [Pricing (US dollars / euros)](${siteUrl}/us/pricing): Free; Lite $29/month or $69 for 3 months; Pro $49/month or $119 for 3 months; the same numbers in euros in Europe; one-time payments, no auto-renewal`,
    `- [50 case interview examples](${siteUrl}/us/case-interview-examples): profitability, market entry, M&A, pricing, growth, operations, cost reduction, go-to-market and competitive strategy cases`,
    `- [50 market sizing questions](${siteUrl}/us/market-sizing-questions): US guesstimate questions with scope, from warm-up to final-round difficulty`,
    '',
  ];
  if (!full) return lines;

  lines.push('### Pricing FAQ', '');
  for (const f of INTL_PRICING_FAQ) lines.push(`**${f.q}** ${f.a}`, '');

  lines.push('### Case interview examples (prompts)', '');
  for (const c of US_CASES) {
    lines.push(`- **${c.title}** (${US_CASE_TYPE_LABEL[c.type]}, ${c.difficulty}; ${siteUrl}/us/case-interview-examples#${c.slug}): ${c.situation}`);
  }
  lines.push('', '### Market sizing questions', '');
  for (const g of US_GUESSTIMATES) {
    lines.push(`- **${g.title}** (${g.difficulty}; ${siteUrl}/us/market-sizing-questions#${g.slug}): ${g.scope}`);
  }
  lines.push('');
  return lines;
}
