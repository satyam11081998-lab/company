import type { Page } from '@/lib/casebook/types';

export const waterTankersSummer: Page = {
  slug: 'guesstimates/water-tankers-summer',
  title: 'Water tankers needed daily in a metro summer',
  subtitle: 'A gap analysis — estimate demand, estimate supply, size the shortfall.',
  kind: 'guesstimate',
  meta: { difficulty: 'challenging', readingTimeMin: 6, tags: ['gap-analysis', 'public-systems'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of private water-tanker trips per day in a 10-million metro at summer peak. This is a **gap guesstimate**: tankers don\'t serve total demand — they serve the shortfall between municipal supply and need. Size both sides, then convert the gap to trips.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Gap analysis between summer water demand and shrunken municipal supply, with the gap converted into tanker trips', caption: 'Demand stays, supply shrinks — the tanker market IS the gap. Estimate it directly.', svg: `<svg viewBox="0 0 640 260" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="wtng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="40" y="24" width="260" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="170" y="46" font-size="10" font-weight="700" fill="hsl(var(--foreground))">SUMMER DEMAND</text>
    <text x="170" y="64" font-size="9" fill="hsl(var(--muted-foreground))">10M × 135 LPCD norm × 1.15</text>
    <text x="170" y="78" font-size="9" fill="hsl(var(--muted-foreground))">summer factor + commercial ~20%</text>
    <text x="170" y="100" font-size="11" font-weight="700" fill="hsl(var(--foreground))">≈ 1,850 MLD</text>
    <rect x="340" y="24" width="260" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="470" y="46" font-size="10" font-weight="700" fill="hsl(var(--foreground))">SUMMER SUPPLY</text>
    <text x="470" y="64" font-size="9" fill="hsl(var(--muted-foreground))">municipal ~1,500 MLD − 10%</text>
    <text x="470" y="78" font-size="9" fill="hsl(var(--muted-foreground))">reservoir dip − 25% leakage/theft</text>
    <text x="470" y="100" font-size="11" font-weight="700" fill="hsl(var(--foreground))">≈ 1,200 MLD delivered</text>
  </g>
  <path d="M170 116 L170 146 M470 116 L470 146 M170 146 L470 146 M320 146 L320 168" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="145" y="172" width="350" height="46" rx="10" fill="url(#wtng)"/>
  <text x="320" y="192" text-anchor="middle" font-size="10.5" font-weight="700" fill="#ffffff">GAP ≈ 650 MLD — borewells fill ~60%, tankers the rest</text>
  <text x="320" y="208" text-anchor="middle" font-size="9" fill="#b9c4d6">tanker-served ≈ 260 MLD ÷ 10,000 L/trip</text>
  <text x="320" y="244" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 25,000 TANKER TRIPS / DAY</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Demand', md: 'Norm ~135 litres/person/day × 10M × 1.15 summer factor + ~20% commercial/institutional ≈ **1,850 MLD** (million litres/day).' },
      { title: 'Effective supply', md: 'Installed municipal ~1,500 MLD, minus summer reservoir dip (~10%) and distribution losses (~25%) → **~1,200 MLD reaching users**.' },
      { title: 'The gap', md: '~650 MLD. Private borewells and storage absorb ~60%; tankers serve the rest ≈ **260 MLD**.' },
      { title: 'Trips', md: 'Standard tanker = 10,000 L → 260 MLD ÷ 10K ≈ **26,000 trips/day**, by roughly 6–7K tankers doing ~4 trips each.' },
    ]},
    { type: 'mathBox', md: '(1,850 − 1,200) × 40% tanker share ÷ 10k L ≈ **26k trips/day** ≈ ₹26 cr/day at ₹1,000/trip' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Structure-first wins here: announcing "tankers serve the demand-supply **gap**, so I\'ll size both sides" is 80% of the marks before any arithmetic. The leakage assumption (~25%) is India-realistic and worth citing — it\'s often the biggest single term in urban water math.' },
  ],
};
