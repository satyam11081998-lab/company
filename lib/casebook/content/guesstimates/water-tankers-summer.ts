import type { Page } from '@/lib/casebook/types';

export const waterTankersSummer: Page = {
  slug: 'guesstimates/water-tankers-summer',
  title: 'Water tankers needed daily in a metro summer',
  subtitle: 'A gap analysis — estimate demand, estimate supply, size the shortfall.',
  kind: 'guesstimate',
  meta: { difficulty: 'challenging', readingTimeMin: 6, tags: ['gap-analysis', 'public-systems'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of private water-tanker trips per day in a 10-million metro at summer peak. This is a **gap guesstimate**: tankers don\'t serve total demand — they serve the shortfall between municipal supply and need. Size both sides, then convert the gap to trips.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier gap analysis: summer demand built from per-capita norms and commercial use, supply degraded by reservoir dip and leakage, gap split between borewells and tankers, converted to trips and fleet', caption: 'Demand branch up, supply branch down, the gap split between borewells and tankers, then converted to trips and fleet.', svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="wtng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#wtng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">TANKER TRIPS / DAY · SUMMER</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">tankers serve the GAP — size both sides</text>
  <path d="M360 60 L360 76 M185 76 L535 76 M185 76 L185 92 M535 76 L535 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="55" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="185" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--foreground))">DEMAND SIDE</text>
    <text x="185" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">what the city needs in May</text>
    <rect x="405" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--foreground))">SUPPLY SIDE</text>
    <text x="535" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">what actually reaches taps</text>
  </g>
  <path d="M185 138 L185 154 M100 154 L270 154 M100 154 L100 170 M270 154 L270 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M535 138 L535 154 M450 154 L620 154 M450 154 L450 170 M620 154 L620 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="20" y="172" width="160" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="100" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">RESIDENTIAL</text>
    <text x="100" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">10M × 135 LPCD norm</text>
    <text x="100" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">× 1.15 summer factor</text>
    <text x="100" y="245" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 1,550 MLD</text>
    <rect x="190" y="172" width="160" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="270" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">COMMERCIAL + INST.</text>
    <text x="270" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">offices, hotels, hospitals,</text>
    <text x="270" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">construction ≈ +20%</text>
    <text x="270" y="245" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ +300 MLD</text>
    <rect x="370" y="172" width="160" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="450" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">INSTALLED SUPPLY</text>
    <text x="450" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">municipal capacity ~1,500</text>
    <text x="450" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">MLD − 10% reservoir dip</text>
    <text x="450" y="245" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 1,350 MLD</text>
    <rect x="540" y="172" width="160" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="620" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">− LEAKAGE / THEFT</text>
    <text x="620" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">distribution losses ~25% —</text>
    <text x="620" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">often the biggest term in urban water math</text>
    <text x="620" y="245" font-size="10" font-weight="700" fill="hsl(var(--primary))">→ 1,200 MLD delivered</text>
  </g>
  <path d="M100 268 L100 286 M270 268 L270 286 M100 286 L270 286 M185 286 L185 302" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M450 268 L450 286 M620 268 L620 286 M450 286 L620 286 M535 286 L535 302" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="85" y="304" width="200" height="36" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="185" y="327" font-size="10" font-weight="700" fill="hsl(var(--foreground))">DEMAND ≈ 1,850 MLD</text>
    <rect x="435" y="304" width="200" height="36" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="327" font-size="10" font-weight="700" fill="hsl(var(--foreground))">SUPPLY ≈ 1,200 MLD</text>
  </g>
  <path d="M185 340 L185 360 M535 340 L535 360 M185 360 L535 360 M360 360 L360 374" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="170" y="376" width="380" height="58" rx="10" fill="url(#wtng)"/>
  <text x="360" y="397" text-anchor="middle" font-size="10.5" font-weight="700" fill="#ffffff">GAP ≈ 650 MLD</text>
  <text x="360" y="413" text-anchor="middle" font-size="8.5" fill="#b9c4d6">borewells + storage absorb ~60% · tankers serve the rest ≈ 260 MLD</text>
  <text x="360" y="427" text-anchor="middle" font-size="8.5" fill="#b9c4d6">÷ 10,000 L per tanker trip</text>
  <path d="M360 434 L360 450" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="165" y="452" width="390" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="471" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 26,000 TRIPS / DAY ≈ 6–7k tankers × 4 trips</text>
  <text x="360" y="488" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">≈ ₹26 cr/day at ₹1,000/trip — a seasonal industry the size of a unicorn</text>
  <text x="360" y="526" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Announcing "tankers serve the demand–supply gap, so I'll size both sides" is 80% of the marks before any arithmetic.</text>
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
