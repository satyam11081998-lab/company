import type { Page } from '@/lib/casebook/types';

export const streetlightsMetro: Page = {
  slug: 'guesstimates/streetlights-metro',
  title: 'Streetlights in a metro city',
  subtitle: 'Road-length × spacing — geometry does the estimating.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['geometry', 'infrastructure'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of streetlights in a 600-km² metro of 10 million people. The road network is the skeleton: estimate **road-length per km²**, then divide by pole spacing. Geometry beats demographics here.' },
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', title: 'Clarifying questions before building the tree', turns: [
        { speaker: 'candidate', md: 'Definition: public streetlights along roads in a ~600-km² metro — individual light *fixtures*, not poles (a pole can carry two) — excluding private compound, decorative, and flood lighting?', note: 'Fixtures-vs-poles is a quiet ~1.5× error if left unstated.' },
        { speaker: 'interviewer', md: 'Public road luminaires, count fixtures.' },
        { speaker: 'candidate', md: 'The metro is ~10 million over ~600 km²?' },
        { speaker: 'interviewer', md: 'Yes.' },
        { speaker: 'candidate', md: 'Geometry beats demographics here — I’ll estimate road-length per km², split by road type, and divide by typical pole spacing.', note: 'The road network, not the population, is the skeleton of this estimate.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'The fixture unit, the public-road boundary, and a road-length ÷ pole-spacing geometry build.' },
    ]},
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier geometry tree: city area through derived road density to road length, split into arterial both-sides and local one-side lighting with different pole spacing, plus parks and junctions, summed with per-capita check', caption: 'Area → derived road density → road mix with per-type spacing → sum + extras → per-capita check. Geometry, not demographics.', svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="slng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#slng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">STREETLIGHTS · 600 km² METRO</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">road geometry does the estimating</text>
  <path d="M360 60 L360 78" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="80" width="300" height="56" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="99" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">ROAD DENSITY — DERIVE IT, DO NOT QUOTE IT</text>
    <text x="360" y="115" font-size="8.5" fill="hsl(var(--muted-foreground))">a 1-km² grid with blocks every ~150m holds ~13 km of road</text>
    <text x="360" y="129" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">600 km² × ~12 km/km² ≈ 7,000 road-km</text>
  </g>
  <path d="M360 136 L360 152 M125 152 L595 152 M125 152 L125 168 M360 152 L360 168 M595 152 L595 168" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="170" width="190" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="125" y="190" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">ARTERIAL · 15%</text>
    <text x="125" y="207" font-size="8.5" fill="hsl(var(--muted-foreground))">1,050 km · wide, fast roads</text>
    <text x="125" y="221" font-size="8.5" fill="hsl(var(--muted-foreground))">lit BOTH sides · ~30 m spacing</text>
    <text x="125" y="235" font-size="8.5" fill="hsl(var(--muted-foreground))">1,050 ÷ 0.03 × 2</text>
    <text x="125" y="257" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ 70,000 poles</text>
    <rect x="265" y="170" width="190" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="190" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LOCAL STREETS · 85%</text>
    <text x="360" y="207" font-size="8.5" fill="hsl(var(--muted-foreground))">5,950 km · residential lanes</text>
    <text x="360" y="221" font-size="8.5" fill="hsl(var(--muted-foreground))">lit ONE side · ~40 m spacing</text>
    <text x="360" y="235" font-size="8.5" fill="hsl(var(--muted-foreground))">5,950 ÷ 0.04</text>
    <text x="360" y="257" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ 149,000 poles</text>
    <rect x="500" y="170" width="190" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="190" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">NON-ROAD LIGHTING</text>
    <text x="595" y="207" font-size="8.5" fill="hsl(var(--muted-foreground))">parks, junctions (high-mast),</text>
    <text x="595" y="221" font-size="8.5" fill="hsl(var(--muted-foreground))">flyovers, bus stands,</text>
    <text x="595" y="235" font-size="8.5" fill="hsl(var(--muted-foreground))">market squares</text>
    <text x="595" y="257" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ +10,000</text>
  </g>
  <path d="M125 274 L125 296 M360 274 L360 296 M595 274 L595 296 M125 296 L595 296 M360 296 L360 312" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="314" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="333" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 2.3 LAKH STREETLIGHTS</text>
  <text x="360" y="350" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">70k + 149k + 10k</text>
  <path d="M360 358 L360 374 M185 374 L535 374 M185 374 L185 390 M535 374 L535 390" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="65" y="392" width="240" height="60" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="185" y="412" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">CHECK 1 · PER CAPITA</text>
    <text x="185" y="429" font-size="8.5" fill="hsl(var(--muted-foreground))">2.3L ÷ 10M ≈ 1 light per 43 people</text>
    <text x="185" y="443" font-size="8.5" fill="hsl(var(--muted-foreground))">metros report 1 per 40–60 ✓</text>
    <rect x="415" y="392" width="240" height="60" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="535" y="412" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">CHECK 2 · POWER BILL</text>
    <text x="535" y="429" font-size="8.5" fill="hsl(var(--muted-foreground))">2.3L × ~100W LED × 11 hrs ≈ 250 MWh/night</text>
    <text x="535" y="443" font-size="8.5" fill="hsl(var(--muted-foreground))">≈ ₹60–70 cr/yr — sane municipal line item ✓</text>
  </g>
  <text x="360" y="496" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Deriving the road-density anchor from block geometry, live, is exactly what this genre tests.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Road length', md: 'Dense urban grids carry ~10–15 km of road per km² → 600 × 12 ≈ **7,000 road-km**.' },
      { title: 'Split the mix', md: 'Arterials/highways ~15% (1,050 km), lit **both sides** at ~30 m spacing; local streets ~85% (5,950 km), lit one side at ~40 m.' },
      { title: 'Count', md: 'Arterial: 1,050 km ÷ 0.03 × 2 ≈ 70K. Local: 5,950 ÷ 0.04 ≈ 149K. Parks, junctions, flyovers ≈ +10K.' },
      { title: 'Total', md: '**≈ 2.3 lakh streetlights.**' },
    ]},
    { type: 'mathBox', md: '(1,050÷0.03×2) + (5,950÷0.04) + 10k ≈ 70k + 149k + 10k ≈ **2.3 lakh**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The road-density figure (10–15 km/km²) is the one unfamiliar number — anchor it physically: a 1-km² grid of blocks every ~150 m contains ~13 km of internal road. Deriving your anchor from geometry, on the spot, is exactly what this genre of guesstimate tests.' },
  ],
};
