import type { Page } from '@/lib/casebook/types';

export const tollPlazaCollection: Page = {
  slug: 'guesstimates/toll-plaza-collection',
  title: 'Daily collection at a highway toll plaza',
  subtitle: 'Flow-rate estimation — count what passes a point.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 4, tags: ['flow-rate', 'transport'] },
  blocks: [
    { type: 'prose', md: 'Estimate the daily toll collection at a busy national-highway plaza (e.g., on a metro-to-metro corridor). This is a **flow-rate** build: vehicles per lane per hour × lanes × hours × mix-weighted toll.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Flow estimation from vehicles per lane hour times lanes times hours, multiplied by traffic-mix weighted average toll', caption: 'Flow × mix-weighted price. The mix table is where the money hides — trucks pay 3–7× cars.', svg: `<svg viewBox="0 0 640 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="tpng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="30" y="26" width="180" height="74" rx="10" fill="url(#tpng)"/>
    <text x="120" y="50" font-size="10" font-weight="700" fill="#ffffff">VEHICLE FLOW</text>
    <text x="120" y="67" font-size="9" fill="#b9c4d6">FASTag lane ≈ 400–500/hr ×</text>
    <text x="120" y="81" font-size="9" fill="#b9c4d6">8 lanes × ~70% utilization</text>
    <rect x="250" y="26" width="170" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="335" y="50" font-size="10" font-weight="700" fill="hsl(var(--foreground))">DAILY VEHICLES</text>
    <text x="335" y="67" font-size="9" fill="hsl(var(--muted-foreground))">~2,500/hr peak-adjusted</text>
    <text x="335" y="81" font-size="9" fill="hsl(var(--muted-foreground))">× 24 hrs ≈ 55–60k</text>
    <rect x="460" y="26" width="160" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="540" y="50" font-size="10" font-weight="700" fill="hsl(var(--primary))">MIX-WEIGHTED TOLL</text>
    <text x="540" y="67" font-size="9" fill="hsl(var(--muted-foreground))">60% cars ₹120 · 30%</text>
    <text x="540" y="81" font-size="9" fill="hsl(var(--muted-foreground))">trucks ₹400 · 10% bus ₹350</text>
  </g>
  <path d="M210 63 L246 63 M420 63 L456 63" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M335 100 L335 128 M540 100 L540 128 M335 128 L540 128 M437 128 L437 150" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="287" y="154" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="437" y="179" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ ₹1.2–1.4 CR / DAY</text>
  <text x="320" y="222" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Weighted toll ≈ 0.6×120 + 0.3×400 + 0.1×350 = ₹227 — trucks are 30% of traffic, 55% of revenue.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Flow', md: 'A FASTag lane processes ~7–8 vehicles/minute ≈ 450/hour. 8 lanes × ~70% average utilization (night dips, peak surges) ≈ **2,500 vehicles/hour**.' },
      { title: 'Daily count', md: '2,500 × 24 ≈ **~58,000 vehicles/day** — sanity: busy NH corridors report 40–80K.' },
      { title: 'Mix-weighted toll', md: '60% cars (₹120), 30% trucks/MAVs (₹400 avg), 10% buses (₹350) → **~₹227 blended**.' },
      { title: 'Collection', md: '58,000 × ₹227 ≈ **~₹1.3 crore/day** (~₹480 crore/year).' },
    ]},
    { type: 'mathBox', md: '8 lanes × 450/hr × 70% × 24h ≈ 58k × ₹227 ≈ **₹1.3 cr/day**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The mix-weighting is the differentiator: stating "trucks are a third of traffic but more than half the revenue" shows you understand toll-road economics — it\'s also why truck-route diversion is the #1 revenue risk in toll concession deals.' },
  ],
};
