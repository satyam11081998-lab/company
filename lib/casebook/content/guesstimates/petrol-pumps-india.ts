import type { Page } from '@/lib/casebook/types';

export const petrolPumpsIndia: Page = {
  slug: 'guesstimates/petrol-pumps-india',
  title: 'Petrol pumps in India',
  subtitle: 'Demand ÷ capacity — the canonical infrastructure build.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['infrastructure', 'demand-capacity'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of petrol pumps (fuel stations) in India. Infrastructure guesstimates almost always resolve as **total demand ÷ capacity per unit**: fuel consumed nationally ÷ what one station can viably sell.' },
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', title: 'Clarifying questions before building the tree', turns: [
        { speaker: 'candidate', md: 'Definition: retail fuel stations (petrol/diesel outlets) across India — physical outlets, all brands, public retail — not CNG-only sites or private captive pumps?', note: 'Settling what counts as a ‘pump’ prevents double-counting captive and alt-fuel sites.' },
        { speaker: 'interviewer', md: 'Public retail fuel outlets, all brands.' },
        { speaker: 'candidate', md: 'All India, current?' },
        { speaker: 'interviewer', md: 'Yes.' },
        { speaker: 'candidate', md: 'Infrastructure like this resolves as total demand ÷ capacity, so I’ll build national fuel consumption first, then divide by what one viable station sells.', note: 'States the canonical demand-÷-capacity frame up front.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'The retail-outlet definition and a national-fuel-demand ÷ per-station-capacity build.' },
    ]},
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree: vehicle fleet split into two-wheelers, cars and commercial vehicles, each with count times litres per day, summed to national demand, divided by viable station throughput', caption: 'The full tree — each vehicle class carries its own count × intensity. Note commercial vehicles: 8% of the fleet, ~60% of the fuel.', svg: `<svg viewBox="0 0 720 520" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="ppng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#ppng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">PETROL PUMPS IN INDIA</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">national fuel demand ÷ viable station throughput</text>
  <path d="M360 60 L360 78" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="80" width="300" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="105" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">STEP 1 · FLEET FUEL DEMAND, BY CLASS</text>
  </g>
  <path d="M360 120 L360 136 M125 136 L595 136 M125 136 L125 152 M360 136 L360 152 M595 136 L595 152" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="125" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">TWO-WHEELERS</text>
    <text x="125" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">~250M active</text>
    <text x="125" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">~25 km/day ÷ 45 km/L</text>
    <text x="125" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">≈ 0.6 L/day each</text>
    <text x="125" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ 150M L/day</text>
    <text x="125" y="256" font-size="8" fill="hsl(var(--muted-foreground))">26% of demand</text>
    <rect x="265" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">CARS</text>
    <text x="360" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">~60M active</text>
    <text x="360" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">~22 km/day ÷ 15 km/L</text>
    <text x="360" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">≈ 1.5 L/day each</text>
    <text x="360" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ 90M L/day</text>
    <text x="360" y="256" font-size="8" fill="hsl(var(--muted-foreground))">15% of demand</text>
    <rect x="500" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="595" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">COMMERCIAL (the key)</text>
    <text x="595" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">~28M trucks/buses/LCVs</text>
    <text x="595" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">~150+ km/day, run all day</text>
    <text x="595" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">≈ 12 L/day each</text>
    <text x="595" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ 340M L/day</text>
    <text x="595" y="256" font-size="8" fill="hsl(var(--muted-foreground))">59% of demand from 8% of fleet</text>
  </g>
  <path d="M125 264 L125 282 M360 264 L360 282 M595 264 L595 282 M125 282 L595 282 M360 282 L360 298" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="210" y="300" width="300" height="40" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="325" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">TOTAL ≈ 580M LITRES / DAY</text>
  </g>
  <path d="M360 340 L360 356 M215 356 L505 356 M215 356 L215 372 M505 356 L505 372" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="374" width="240" height="58" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="215" y="394" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">STEP 2 · STATION VIABILITY</text>
    <text x="215" y="410" font-size="8.5" fill="hsl(var(--muted-foreground))">urban 10k+ L/day · highway 8k · rural 3–4k</text>
    <text x="215" y="425" font-size="10" font-weight="700" fill="hsl(var(--primary))">blended ≈ 6,500 L/day</text>
    <rect x="385" y="374" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="394" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">STEP 3 · DIVIDE</text>
    <text x="505" y="412" font-size="10" font-weight="700" fill="hsl(var(--foreground))">580M ÷ 6,500</text>
    <text x="505" y="427" font-size="8.5" fill="hsl(var(--muted-foreground))">demand ÷ unit capacity</text>
  </g>
  <path d="M215 432 L215 450 M505 432 L505 450 M215 450 L505 450 M360 450 L360 462" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="464" width="340" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="489" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 85,000–95,000 PUMPS (reality: ~90k ✓)</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Fleet', md: 'Registered-and-active: ~250M two-wheelers, ~60M cars, ~28M commercial vehicles (trucks, buses, LCVs).' },
      { title: 'Fuel per vehicle', md: '2W ~0.6 L/day, cars ~1.5 L/day, commercial ~12 L/day (they run all day — this is the term beginners underweight).' },
      { title: 'National demand', md: '150 + 90 + 340 ≈ **~580M litres/day**.' },
      { title: 'Station viability', md: 'A station needs ~6,000–7,000 L/day blended to survive (urban much higher, highway/rural lower).' },
      { title: 'Count', md: '580M ÷ 6,500 ≈ **~90,000 pumps**.' },
    ]},
    { type: 'mathBox', md: '(250M×0.6 + 60M×1.5 + 28M×12) ÷ 6,500 L/station ≈ 580M ÷ 6.5k ≈ **~90k pumps**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The insight to volunteer: **commercial vehicles consume more fuel than all private vehicles combined** despite being ~8% of the fleet. Interviewers reward the candidate who weights by usage intensity, not vehicle count.' },
  ],
};
