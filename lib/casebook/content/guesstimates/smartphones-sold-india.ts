import type { Page } from '@/lib/casebook/types';

export const smartphonesSoldIndia: Page = {
  slug: 'guesstimates/smartphones-sold-india',
  title: 'Smartphones sold in India per year',
  subtitle: 'A replacement-cycle estimate — the stock-and-flow workhorse.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 5, tags: ['stock-and-flow', 'consumption'] },
  blocks: [
    { type: 'prose', md: 'Estimate annual smartphone unit sales in India. The elegant route is **stock and flow**: sales = installed base ÷ replacement cycle + first-time buyers. Resist jumping to "X% of population buys one."' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Estimation tree splitting smartphone sales into replacement demand from the installed base and first-time buyer demand', caption: 'Two engines of demand: people replacing phones, and people getting their first one.', svg: `<svg viewBox="0 0 640 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="ssng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="210" y="14" width="220" height="44" rx="11" fill="url(#ssng)"/>
  <text x="320" y="33" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">ANNUAL SMARTPHONE SALES</text>
  <text x="320" y="49" text-anchor="middle" font-size="9" fill="#b9c4d6">replacement + first-time</text>
  <path d="M320 58 L320 74 M170 74 L470 74 M170 74 L170 90 M470 74 L470 90" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="55" y="92" width="230" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="170" y="112" font-size="10" font-weight="700" fill="hsl(var(--primary))">REPLACEMENT</text>
    <text x="170" y="129" font-size="9" fill="hsl(var(--muted-foreground))">installed base ~650M ÷</text>
    <text x="170" y="143" font-size="9" fill="hsl(var(--muted-foreground))">~4-yr average cycle</text>
    <text x="170" y="159" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ 160M/yr</text>
    <rect x="355" y="92" width="230" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="470" y="112" font-size="10" font-weight="700" fill="hsl(var(--foreground))">FIRST-TIME BUYERS</text>
    <text x="470" y="129" font-size="9" fill="hsl(var(--muted-foreground))">feature-phone upgraders +</text>
    <text x="470" y="143" font-size="9" fill="hsl(var(--muted-foreground))">teens entering ownership age</text>
    <text x="470" y="159" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ 15–20M/yr</text>
  </g>
  <rect x="170" y="190" width="300" height="38" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="320" y="214" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">TOTAL ≈ 175–180M units/year</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Installed base', md: '1.4B people; smartphone users ≈ 45–50% → **~650M** active devices.' },
      { title: 'Replacement cycle', md: 'Budget phones ~3 yrs, premium ~4–5 yrs; blended **~4 years** → 650 ÷ 4 ≈ **160M** replacement units.' },
      { title: 'First-time buyers', md: 'Feature-phone-to-smartphone upgrades and new young users ≈ **15–20M/yr** (slowing as penetration matures).' },
      { title: 'Total', md: '160 + 18 ≈ **~175M units a year**.' },
    ]},
    { type: 'mathBox', md: '650M base ÷ 4-yr cycle = 162M + ~18M first-time ≈ **180M units/yr**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Flag the two swing assumptions: the **replacement cycle** (each ±0.5 yr moves the answer ~20M) and the installed base. Offer the cross-check: actual Indian market shipments run ~150M — your number should land the same order of magnitude, and the gap signals a lengthening cycle.' },
  ],
};
