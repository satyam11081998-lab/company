import type { Page } from '@/lib/casebook/types';

export const weddingsIndiaAnnual: Page = {
  slug: 'guesstimates/weddings-india-annual',
  title: 'Weddings in India per year',
  subtitle: 'Cohort-flow logic — the population pyramid does the work.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['cohort', 'flow'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of weddings in India each year. The clean route is **cohort flow**: how many people reach marrying age annually, and what fraction eventually marries. Avoid the trap of starting from "number of marriage halls" — supply-side here is far messier.' },
    { type: 'svg', maxWidth: 620, ariaLabel: 'Cohort flow from people reaching marriage age each year to marriage rate to weddings per year', caption: 'One cohort enters marriage age each year; nearly all of it eventually marries — divide by two for couples.', svg: `<svg viewBox="0 0 620 240" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="wing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="25" y="26" width="170" height="64" rx="10" fill="url(#wing)"/>
    <text x="110" y="50" font-size="10" font-weight="700" fill="#ffffff">ANNUAL COHORT</text>
    <text x="110" y="67" font-size="9" fill="#b9c4d6">~23M people turn</text>
    <text x="110" y="80" font-size="9" fill="#b9c4d6">marriage age each year</text>
    <rect x="230" y="26" width="170" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="315" y="50" font-size="10" font-weight="700" fill="hsl(var(--foreground))">EVER-MARRY RATE</text>
    <text x="315" y="67" font-size="9" fill="hsl(var(--muted-foreground))">India: ~90%+ marry</text>
    <text x="315" y="80" font-size="9" fill="hsl(var(--muted-foreground))">(very high vs West)</text>
    <rect x="435" y="26" width="165" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="517" y="50" font-size="10" font-weight="700" fill="hsl(var(--primary))">COUPLES ÷ 2</text>
    <text x="517" y="67" font-size="9" fill="hsl(var(--muted-foreground))">two people per</text>
    <text x="517" y="80" font-size="9" fill="hsl(var(--muted-foreground))">wedding</text>
  </g>
  <path d="M195 58 L226 58 M400 58 L431 58" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M315 90 L315 118 M517 90 L517 118 M315 118 L517 118 M416 118 L416 140" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="266" y="144" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="416" y="169" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 1 CRORE WEDDINGS / YEAR</text>
  <text x="310" y="216" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Steady-state logic: in a stable pyramid, weddings/year ≈ cohort size × marry-rate ÷ 2 — timing shifts don't change the flow.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Cohort size', md: '1.4B with ~23M people per year-of-age cohort in the young bands.' },
      { title: 'Marry rate', md: 'India\'s ever-married rate is very high: assume **~90%** → 21M people marrying "per cohort-year."' },
      { title: 'Couples', md: '21M ÷ 2 ≈ **~1.05 crore weddings a year**. (Remarriage adds a little; cross-cohort age gaps don\'t change the steady-state flow.)' },
      { title: 'So what', md: 'At ₹10–12 lakh average spend, that\'s a **₹10–12 lakh crore** annual industry — bigger than most sectors people name.' },
    ]},
    { type: 'mathBox', md: '23M cohort × 90% ÷ 2 ≈ **1.03 crore weddings/yr**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'If challenged with "but people marry at different ages," explain steady-state: in a stable population, *when* people marry shifts timing, not the annual flow. This one-line demographic argument is what separates a clean answer from a muddled one.' },
  ],
};
