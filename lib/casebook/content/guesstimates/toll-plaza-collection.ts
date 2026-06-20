import type { Page } from '@/lib/casebook/types';

export const tollPlazaCollection: Page = {
  slug: 'guesstimates/toll-plaza-collection',
  title: 'Daily collection at a highway toll plaza',
  subtitle: 'Flow-rate estimation — count what passes a point.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 4, tags: ['flow-rate', 'transport'] },
  blocks: [
    { type: 'prose', md: 'Estimate the daily toll collection at a busy national-highway plaza (e.g., on a metro-to-metro corridor). This is a **flow-rate** build: vehicles per lane per hour × lanes × hours × mix-weighted toll.' },
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', title: 'Clarifying questions before building the tree', turns: [
        { speaker: 'candidate', md: 'Framing: daily toll *collection* in rupees at one busy national-highway plaza — both directions combined — weighted by vehicle mix, since trucks pay multiples of a car?', note: 'Both-directions and mix-weighting are the two calls that most move the rupee figure.' },
        { speaker: 'interviewer', md: 'Yes — both directions, mix-weighted, one busy plaza.' },
        { speaker: 'candidate', md: 'A typical day?' },
        { speaker: 'interviewer', md: 'Yes.' },
        { speaker: 'candidate', md: 'Then it’s a flow-rate build: vehicles per lane per hour × lanes × operating hours, then a mix-weighted average toll.', note: 'Counting what passes a point is the right primitive for a flow problem.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Both-directions scope, mix-weighted toll, and a flow-rate (lane × hour) build.' },
    ]},
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree: lane throughput times lanes times utilization gives daily vehicles, split into cars, trucks and buses each with count share and toll rate, multiplied and summed to daily collection', caption: 'Flow build on the left, the three-class mix in the middle, revenue per class at the bottom — trucks carry the plaza.', svg: `<svg viewBox="0 0 720 520" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="tpng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#tpng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">TOLL PLAZA COLLECTION / DAY</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">flow × mix-weighted toll</text>
  <path d="M360 60 L360 78" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="80" width="300" height="52" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="100" font-size="10" font-weight="700" fill="hsl(var(--foreground))">STEP 1 · VEHICLE FLOW</text>
    <text x="360" y="117" font-size="9" fill="hsl(var(--muted-foreground))">8 FASTag lanes × ~450/hr × 70% util × 24h ≈ <tspan font-weight="700" fill="hsl(var(--primary))">58,000 vehicles</tspan></text>
  </g>
  <path d="M360 132 L360 148 M125 148 L595 148 M125 148 L125 164 M360 148 L360 164 M595 148 L595 164" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="166" width="190" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="125" y="186" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">CARS / JEEPS / VANS</text>
    <text x="125" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">~60% of traffic = 34,800</text>
    <text x="125" y="217" font-size="8.5" fill="hsl(var(--muted-foreground))">toll ≈ ₹120</text>
    <text x="125" y="239" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ ₹42 lakh</text>
    <text x="125" y="256" font-size="8" fill="hsl(var(--muted-foreground))">32% of revenue</text>
    <rect x="265" y="166" width="190" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="186" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">TRUCKS / MAVs</text>
    <text x="360" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">~30% of traffic = 17,400</text>
    <text x="360" y="217" font-size="8.5" fill="hsl(var(--muted-foreground))">toll ≈ ₹400 (axle-tiered)</text>
    <text x="360" y="239" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ ₹70 lakh</text>
    <text x="360" y="256" font-size="8" fill="hsl(var(--muted-foreground))">53% of revenue from 30% of traffic</text>
    <rect x="500" y="166" width="190" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="186" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">BUSES</text>
    <text x="595" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">~10% of traffic = 5,800</text>
    <text x="595" y="217" font-size="8.5" fill="hsl(var(--muted-foreground))">toll ≈ ₹350</text>
    <text x="595" y="239" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ ₹20 lakh</text>
    <text x="595" y="256" font-size="8" fill="hsl(var(--muted-foreground))">15% of revenue</text>
  </g>
  <path d="M125 270 L125 290 M360 270 L360 290 M595 270 L595 290 M125 290 L595 290 M360 290 L360 306" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="308" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="327" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹1.3 CR / DAY (~₹480 cr/yr)</text>
  <text x="360" y="344" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">blended toll ≈ ₹227/vehicle · busy NH corridors report 40–80k vehicles ✓</text>
  <path d="M360 352 L360 368" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="160" y="370" width="400" height="56" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="390" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SENSITIVITY THAT MATTERS</text>
    <text x="360" y="407" font-size="8.5" fill="hsl(var(--muted-foreground))">a 5-pt shift of trucks to a parallel free route cuts revenue ~9% —</text>
    <text x="360" y="420" font-size="8.5" fill="hsl(var(--muted-foreground))">truck diversion is the #1 risk priced into toll-road concession bids</text>
  </g>
  <text x="360" y="470" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Trucks: a third of the traffic, more than half the money. Mix-weighting IS the answer.</text>
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
