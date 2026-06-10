import type { Page } from '@/lib/casebook/types';

export const petrolPumpsIndia: Page = {
  slug: 'guesstimates/petrol-pumps-india',
  title: 'Petrol pumps in India',
  subtitle: 'Demand ÷ capacity — the canonical infrastructure build.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['infrastructure', 'demand-capacity'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of petrol pumps (fuel stations) in India. Infrastructure guesstimates almost always resolve as **total demand ÷ capacity per unit**: fuel consumed nationally ÷ what one station can viably sell.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Estimation tree from vehicle fleet fuel demand divided by viable station throughput to station count', caption: 'Fleet → daily fuel demand → ÷ station throughput → station count.', svg: `<svg viewBox="0 0 640 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="ppng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="25" y="26" width="180" height="74" rx="10" fill="url(#ppng)"/>
    <text x="115" y="48" font-size="10" font-weight="700" fill="#ffffff">FLEET FUEL DEMAND</text>
    <text x="115" y="65" font-size="9" fill="#b9c4d6">2W: 250M × 0.6 L/day = 150M L</text>
    <text x="115" y="79" font-size="9" fill="#b9c4d6">cars: 60M × 1.5 = 90M L</text>
    <text x="115" y="93" font-size="9" fill="#b9c4d6">trucks/buses: ~28M × 12 ≈ 340M L</text>
    <rect x="245" y="26" width="170" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="330" y="50" font-size="10" font-weight="700" fill="hsl(var(--foreground))">TOTAL ≈ 580M L/DAY</text>
    <text x="330" y="68" font-size="9" fill="hsl(var(--muted-foreground))">(commercial vehicles dominate</text>
    <text x="330" y="82" font-size="9" fill="hsl(var(--muted-foreground))">— most people get this wrong)</text>
    <rect x="455" y="26" width="165" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="537" y="50" font-size="10" font-weight="700" fill="hsl(var(--primary))">STATION THROUGHPUT</text>
    <text x="537" y="68" font-size="9" fill="hsl(var(--muted-foreground))">viable average ≈</text>
    <text x="537" y="82" font-size="9" fill="hsl(var(--muted-foreground))">6,000–7,000 L/day</text>
  </g>
  <path d="M205 63 L241 63 M415 63 L451 63" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M330 100 L330 128 M537 100 L537 128 M330 128 L537 128 M433 128 L433 150" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="283" y="154" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="433" y="179" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 85,000–95,000 PUMPS</text>
  <text x="320" y="226" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Reality ≈ 90,000+ — this build lands inside the truth, which is what a guesstimate is for.</text>
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
