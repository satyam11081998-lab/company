import type { Page } from '@/lib/casebook/types';

export const weddingsIndiaAnnual: Page = {
  slug: 'guesstimates/weddings-india-annual',
  title: 'Weddings in India per year',
  subtitle: 'Cohort-flow logic — the population pyramid does the work.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['cohort', 'flow'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of weddings in India each year. The clean route is **cohort flow**: how many people reach marrying age annually, and what fraction eventually marries. Avoid the trap of starting from "number of marriage halls" — supply-side here is far messier.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier cohort-flow tree from population pyramid to annual marrying cohort, adjusted for ever-marry rate and remarriage, divided into couples, with a market-size extension by spend tier', caption: 'Pyramid → cohort flow → adjustments → couples — then the spend-tier extension that turns a count into a market.', svg: `<svg viewBox="0 0 720 520" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="wing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#wing)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">WEDDINGS IN INDIA / YEAR</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">steady-state cohort flow</text>
  <path d="M360 60 L360 78" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="80" width="300" height="52" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="100" font-size="10" font-weight="700" fill="hsl(var(--foreground))">ANNUAL MARRIAGE-AGE COHORT</text>
    <text x="360" y="117" font-size="9" fill="hsl(var(--muted-foreground))">stable pyramid → <tspan font-weight="700" fill="hsl(var(--primary))">~23M people</tspan> flow into marrying age yearly</text>
  </g>
  <path d="M360 132 L360 148 M185 148 L535 148 M185 148 L185 164 M360 148 L360 164 M535 148 L535 164" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="75" y="166" width="220" height="78" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="185" y="186" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">EVER-MARRY RATE</text>
    <text x="185" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">India ~90%+ (vs ~70% West)</text>
    <text x="185" y="217" font-size="8.5" fill="hsl(var(--muted-foreground))">arranged-marriage norm holds</text>
    <text x="185" y="235" font-size="10" font-weight="700" fill="hsl(var(--primary))">23M × 90% = 20.7M</text>
    <rect x="250" y="166" width="220" height="78" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" transform="translate(110,0)"/>
    <text x="470" y="186" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">+ REMARRIAGES</text>
    <text x="470" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">low in India, ~2–3% of flow</text>
    <text x="470" y="217" font-size="8.5" fill="hsl(var(--muted-foreground))">(widow/divorce remarriage)</text>
    <text x="470" y="235" font-size="10" font-weight="700" fill="hsl(var(--primary))">+ ~0.5M people</text>
  </g>
  <path d="M185 244 L185 262 M470 244 L470 262 M185 262 L470 262 M327 262 L327 278" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="187" y="280" width="280" height="48" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="327" y="299" font-size="10" font-weight="700" fill="hsl(var(--primary))">21.2M people marrying ÷ 2 per couple</text>
    <text x="327" y="316" font-size="9" fill="hsl(var(--muted-foreground))">timing shifts (later marriage) do not change steady-state flow</text>
  </g>
  <path d="M327 328 L327 348" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="157" y="350" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="327" y="369" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 1.05 CRORE WEDDINGS / YEAR</text>
  <text x="327" y="386" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">the extension interviewers love: size the market by spend tier ↓</text>
  <g text-anchor="middle">
    <rect x="55" y="416" width="190" height="56" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="150" y="436" font-size="9" font-weight="700" fill="hsl(var(--foreground))">MASS ~70%</text>
    <text x="150" y="451" font-size="8.5" fill="hsl(var(--muted-foreground))">~₹3L avg → ₹2.2 lakh cr</text>
    <rect x="265" y="416" width="190" height="56" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="436" font-size="9" font-weight="700" fill="hsl(var(--foreground))">MIDDLE ~25%</text>
    <text x="360" y="451" font-size="8.5" fill="hsl(var(--muted-foreground))">~₹15L avg → ₹3.9 lakh cr</text>
    <rect x="475" y="416" width="190" height="56" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="570" y="436" font-size="9" font-weight="700" fill="hsl(var(--primary))">PREMIUM ~5%</text>
    <text x="570" y="451" font-size="8.5" fill="hsl(var(--muted-foreground))">~₹60L avg → ₹3.2 lakh cr</text>
  </g>
  <text x="360" y="500" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">≈ ₹9–10 lakh crore industry — and 5% of weddings carry a third of the money.</text>
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
