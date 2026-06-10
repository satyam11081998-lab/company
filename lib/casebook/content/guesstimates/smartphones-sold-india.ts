import type { Page } from '@/lib/casebook/types';

export const smartphonesSoldIndia: Page = {
  slug: 'guesstimates/smartphones-sold-india',
  title: 'Smartphones sold in India per year',
  subtitle: 'A replacement-cycle estimate — the stock-and-flow workhorse.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 5, tags: ['stock-and-flow', 'consumption'] },
  blocks: [
    { type: 'prose', md: 'Estimate annual smartphone unit sales in India. The elegant route is **stock and flow**: sales = installed base ÷ replacement cycle + first-time buyers. Resist jumping to "X% of population buys one."' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier estimation tree: population to installed base and replacement cycle on one branch, feature-phone upgraders and new users on the other, computed to annual smartphone sales', caption: 'The full tree — population to installed base to cycle on the left; first-time engines on the right; every node carries its number.', svg: `<svg viewBox="0 0 720 500" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="ssng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#ssng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">ANNUAL SMARTPHONE SALES</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">stock-and-flow: replacement + first-time</text>
  <path d="M360 60 L360 76 M190 76 L530 76 M190 76 L190 92 M530 76 L530 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="60" y="94" width="260" height="50" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="190" y="114" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">REPLACEMENT ENGINE</text>
    <text x="190" y="131" font-size="9" fill="hsl(var(--muted-foreground))">installed base ÷ replacement cycle</text>
    <rect x="400" y="94" width="260" height="50" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="530" y="114" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">FIRST-TIME ENGINE</text>
    <text x="530" y="131" font-size="9" fill="hsl(var(--muted-foreground))">people buying smartphone #1</text>
  </g>
  <path d="M190 144 L190 160 M105 160 L275 160 M105 160 L105 176 M275 160 L275 176" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M530 144 L530 160 M455 160 L615 160 M455 160 L455 176 M615 160 L615 176" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="25" y="178" width="160" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="105" y="197" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">INSTALLED BASE</text>
    <text x="105" y="214" font-size="8.5" fill="hsl(var(--muted-foreground))">population 1.4B</text>
    <text x="105" y="228" font-size="8.5" fill="hsl(var(--muted-foreground))">× ~47% own a smartphone</text>
    <text x="105" y="248" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 650M devices</text>
    <rect x="195" y="178" width="160" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="275" y="197" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">REPLACEMENT CYCLE</text>
    <text x="275" y="214" font-size="8.5" fill="hsl(var(--muted-foreground))">budget ~3 yr × 60% share</text>
    <text x="275" y="228" font-size="8.5" fill="hsl(var(--muted-foreground))">premium ~4.5 yr × 40%</text>
    <text x="275" y="248" font-size="10" font-weight="700" fill="hsl(var(--primary))">blended ≈ 4 yr</text>
    <rect x="375" y="178" width="160" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="455" y="197" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FEATURE → SMART</text>
    <text x="455" y="214" font-size="8.5" fill="hsl(var(--muted-foreground))">~250M feature-phone users</text>
    <text x="455" y="228" font-size="8.5" fill="hsl(var(--muted-foreground))">× ~5% upgrade per year</text>
    <text x="455" y="248" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 12M/yr</text>
    <rect x="545" y="178" width="160" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="625" y="197" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">NEW YOUNG USERS</text>
    <text x="625" y="214" font-size="8.5" fill="hsl(var(--muted-foreground))">~23M turn 15–16 each yr</text>
    <text x="625" y="228" font-size="8.5" fill="hsl(var(--muted-foreground))">× ~25% first device is new</text>
    <text x="625" y="248" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 6M/yr</text>
  </g>
  <path d="M105 270 L105 288 M275 270 L275 288 M105 288 L275 288 M190 288 L190 306" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M455 270 L455 288 M625 270 L625 288 M455 288 L625 288 M540 288 L540 306" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="80" y="308" width="220" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="190" y="327" font-size="10" font-weight="700" fill="hsl(var(--primary))">650M ÷ 4 yr ≈ 160M/yr</text>
    <text x="190" y="342" font-size="8.5" fill="hsl(var(--muted-foreground))">~90% of the market</text>
    <rect x="430" y="308" width="220" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="540" y="327" font-size="10" font-weight="700" fill="hsl(var(--foreground))">12M + 6M ≈ 18M/yr</text>
    <text x="540" y="342" font-size="8.5" fill="hsl(var(--muted-foreground))">shrinking as penetration matures</text>
  </g>
  <path d="M190 350 L190 372 M540 350 L540 372 M190 372 L540 372 M360 372 L360 392" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="394" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="413" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">TOTAL ≈ 175–180M UNITS / YEAR</text>
  <text x="360" y="430" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">cross-check: reported shipments ~150M → gap signals a lengthening cycle</text>
  <text x="360" y="470" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Sensitivity: ±0.5 yr on the cycle moves the answer ±20M — flag it before the interviewer does.</text>
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
