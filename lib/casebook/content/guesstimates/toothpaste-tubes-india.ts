import type { Page } from '@/lib/casebook/types';

export const toothpasteTubesIndia: Page = {
  slug: 'guesstimates/toothpaste-tubes-india',
  title: 'Toothpaste tubes sold in India per year',
  subtitle: 'Usage-rate build — grams per day beats percentages.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 4, tags: ['consumption', 'usage-rate'] },
  blocks: [
    { type: 'prose', md: 'Estimate annual toothpaste tube sales in India. The crisp route goes through **physical usage**: grams per brushing → tube life → tubes per household per year. Physical-quantity logic is harder to challenge than plucked percentages.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree splitting households into urban and rural, each with its own penetration, usage and pack size, converted through tube life into tubes per year and summed', caption: 'Urban and rural run on different pack sizes and usage — split first, convert each branch through its own tube life, then add.', svg: `<svg viewBox="0 0 720 510" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="ttng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#ttng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">TOOTHPASTE TUBES / YEAR</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">300M households, split by geography</text>
  <path d="M360 60 L360 76 M185 76 L535 76 M185 76 L185 92 M535 76 L535 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="55" y="94" width="260" height="56" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="114" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">URBAN ≈ 110M HH</text>
    <text x="185" y="131" font-size="9" fill="hsl(var(--muted-foreground))">penetration ~95% → 105M using HH</text>
    <text x="185" y="144" font-size="9" fill="hsl(var(--muted-foreground))">larger packs, heavier use</text>
    <rect x="405" y="94" width="260" height="56" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="114" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">RURAL ≈ 190M HH</text>
    <text x="535" y="131" font-size="9" fill="hsl(var(--muted-foreground))">penetration ~80% → 150M using HH</text>
    <text x="535" y="144" font-size="9" fill="hsl(var(--muted-foreground))">small packs, lighter use</text>
  </g>
  <path d="M185 150 L185 166 M100 166 L270 166 M100 166 L100 182 M270 166 L270 182" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M535 150 L535 166 M450 166 L620 166 M450 166 L450 182 M620 166 L620 182" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="20" y="184" width="160" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="100" y="203" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">USAGE / HH / DAY</text>
    <text x="100" y="220" font-size="8.5" fill="hsl(var(--muted-foreground))">3.8 brushers × 0.8g</text>
    <text x="100" y="234" font-size="8.5" fill="hsl(var(--muted-foreground))">× 1.4 brushes/day</text>
    <text x="100" y="254" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 4.2 g/day</text>
    <rect x="190" y="184" width="160" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="270" y="203" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PACK → TUBE LIFE</text>
    <text x="270" y="220" font-size="8.5" fill="hsl(var(--muted-foreground))">avg pack ~150g</text>
    <text x="270" y="234" font-size="8.5" fill="hsl(var(--muted-foreground))">150 ÷ 4.2 ≈ 36 days</text>
    <text x="270" y="254" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 10 tubes/yr</text>
    <rect x="370" y="184" width="160" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="450" y="203" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">USAGE / HH / DAY</text>
    <text x="450" y="220" font-size="8.5" fill="hsl(var(--muted-foreground))">3.2 brushers × 0.6g</text>
    <text x="450" y="234" font-size="8.5" fill="hsl(var(--muted-foreground))">× 1.1 brushes/day</text>
    <text x="450" y="254" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 2.1 g/day</text>
    <rect x="540" y="184" width="160" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="620" y="203" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PACK → TUBE LIFE</text>
    <text x="620" y="220" font-size="8.5" fill="hsl(var(--muted-foreground))">avg pack ~70g (₹10–20 LUPs)</text>
    <text x="620" y="234" font-size="8.5" fill="hsl(var(--muted-foreground))">70 ÷ 2.1 ≈ 33 days</text>
    <text x="620" y="254" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 11 tubes/yr</text>
  </g>
  <path d="M100 276 L100 294 M270 276 L270 294 M100 294 L270 294 M185 294 L185 312" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M450 276 L450 294 M620 276 L620 294 M450 294 L620 294 M535 294 L535 312" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="75" y="314" width="220" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="333" font-size="10" font-weight="700" fill="hsl(var(--primary))">105M × 10 ≈ 1.05B tubes</text>
    <text x="185" y="348" font-size="8.5" fill="hsl(var(--muted-foreground))">urban: fewer, bigger tubes</text>
    <rect x="425" y="314" width="220" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="333" font-size="10" font-weight="700" fill="hsl(var(--foreground))">150M × 11 ≈ 1.65B tubes</text>
    <text x="535" y="348" font-size="8.5" fill="hsl(var(--muted-foreground))">rural: more, smaller tubes</text>
  </g>
  <path d="M185 356 L185 378 M535 356 L535 378 M185 378 L535 378 M360 378 L360 396" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="398" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="417" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 2.5–2.7 BILLION TUBES / YEAR</text>
  <text x="360" y="434" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">value check: × ~₹55 blended ≈ ₹14,000+ cr — matches the oral-care market</text>
  <text x="360" y="478" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The urban/rural split is the insight: rural buys MORE tubes (small packs) but less tonnage — count ≠ volume.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Households', md: '1.4B ÷ ~4.7 per household ≈ **300M households**; toothpaste penetration ~85% → **255M** using households.' },
      { title: 'Usage per household', md: '~3.5 effective brushers × 0.7g per brush × ~1.3 brushes/day ≈ **~3g/day**.' },
      { title: 'Tube life', md: 'Blended tube size ~120g (urban 150–200g, rural 50–80g) ÷ 3g ≈ **40 days** → ~9 tubes/HH/year.' },
      { title: 'Total', md: '255M × ~9–10 ≈ **~2.3–2.6 billion tubes a year** (splitting urban/rural pack sizes, as in the tree, lands at the top of that range).' },
    ]},
    { type: 'mathBox', md: 'Blended: 255M HH × 9.1 ≈ 2.3B · Split: 105M×10 + 150M×11 ≈ **2.5–2.7B tubes/yr**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Physical chains are robust, but flag the blended-tube-size assumption — pack mix is where FMCG interviewers probe. If asked for market value: ~2.3B tubes × ~₹60 blended ≈ **₹14,000 crore**, which sits near the real oral-care market — a strong cross-check to volunteer.' },
  ],
};
