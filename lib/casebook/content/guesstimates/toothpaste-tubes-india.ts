import type { Page } from '@/lib/casebook/types';

export const toothpasteTubesIndia: Page = {
  slug: 'guesstimates/toothpaste-tubes-india',
  title: 'Toothpaste tubes sold in India per year',
  subtitle: 'Usage-rate build — grams per day beats percentages.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 4, tags: ['consumption', 'usage-rate'] },
  blocks: [
    { type: 'prose', md: 'Estimate annual toothpaste tube sales in India. The crisp route goes through **physical usage**: grams per brushing → tube life → tubes per household per year. Physical-quantity logic is harder to challenge than plucked percentages.' },
    { type: 'svg', maxWidth: 620, ariaLabel: 'Estimation tree from households through usage in grams per day to tube life and tubes per year', caption: 'Households → grams/day → tube life → tubes/year. Each node is physically checkable.', svg: `<svg viewBox="0 0 620 240" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="ttng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="20" y="26" width="180" height="64" rx="10" fill="url(#ttng)"/>
    <text x="110" y="50" font-size="10" font-weight="700" fill="#ffffff">USING HOUSEHOLDS</text>
    <text x="110" y="67" font-size="9" fill="#b9c4d6">~300M HH × ~85%</text>
    <text x="110" y="80" font-size="9" fill="#b9c4d6">penetration ≈ 255M</text>
    <rect x="230" y="26" width="170" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="315" y="50" font-size="10" font-weight="700" fill="hsl(var(--foreground))">DAILY USAGE</text>
    <text x="315" y="67" font-size="9" fill="hsl(var(--muted-foreground))">~3.5 brushers × ~0.7g ×</text>
    <text x="315" y="80" font-size="9" fill="hsl(var(--muted-foreground))">~1.3 brushes ≈ 3g/HH/day</text>
    <rect x="430" y="26" width="170" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="515" y="50" font-size="10" font-weight="700" fill="hsl(var(--primary))">TUBE LIFE</text>
    <text x="515" y="67" font-size="9" fill="hsl(var(--muted-foreground))">avg tube ~120g ÷ 3g/day</text>
    <text x="515" y="80" font-size="9" fill="hsl(var(--muted-foreground))">≈ 40 days → ~9 tubes/yr</text>
  </g>
  <path d="M200 58 L226 58 M400 58 L426 58" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M315 90 L315 118 M515 90 L515 118 M315 118 L515 118 M415 118 L415 140" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="265" y="144" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="415" y="169" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 2.3 BILLION TUBES / YEAR</text>
  <text x="310" y="216" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Mix note: rural skews to small 50–80g packs — tube *count* runs higher than tonnage suggests.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Households', md: '1.4B ÷ ~4.7 per household ≈ **300M households**; toothpaste penetration ~85% → **255M** using households.' },
      { title: 'Usage per household', md: '~3.5 effective brushers × 0.7g per brush × ~1.3 brushes/day ≈ **~3g/day**.' },
      { title: 'Tube life', md: 'Blended tube size ~120g (urban 150–200g, rural 50–80g) ÷ 3g ≈ **40 days** → ~9 tubes/HH/year.' },
      { title: 'Total', md: '255M × 9 ≈ **~2.3 billion tubes a year**.' },
    ]},
    { type: 'mathBox', md: '255M HH × (3g × 365 ÷ 120g) ≈ 255M × 9.1 ≈ **2.3B tubes/yr**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Physical chains are robust, but flag the blended-tube-size assumption — pack mix is where FMCG interviewers probe. If asked for market value: ~2.3B tubes × ~₹60 blended ≈ **₹14,000 crore**, which sits near the real oral-care market — a strong cross-check to volunteer.' },
  ],
};
