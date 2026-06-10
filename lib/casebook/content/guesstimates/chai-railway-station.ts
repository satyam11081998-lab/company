import type { Page } from '@/lib/casebook/types';

export const chaiRailwayStation: Page = {
  slug: 'guesstimates/chai-railway-station',
  title: 'Cups of chai sold daily at a major railway station',
  subtitle: 'Footfall × conversion — with dwell time as the hidden multiplier.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 4, tags: ['footfall', 'conversion'] },
  blocks: [
    { type: 'prose', md: 'Estimate daily chai sales (cups) at a major junction station (~3.5 lakh daily passengers). Footfall builds need two refinements beginners skip: **who** is in the footfall (long-distance vs suburban), and **how long they wait** — dwell time drives consumption.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Footfall segmented into long distance and suburban passengers with different dwell times and chai conversion rates', caption: 'Same station, two populations: the hour-long waiter buys chai; the 4-minute commuter doesn\'t.', svg: `<svg viewBox="0 0 640 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="csng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="200" y="14" width="240" height="42" rx="11" fill="url(#csng)"/>
  <text x="320" y="33" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">3.5 LAKH DAILY PASSENGERS</text>
  <text x="320" y="49" text-anchor="middle" font-size="9" fill="#b9c4d6">+ ~80k accompaniers &amp; staff</text>
  <g text-anchor="middle">
    <rect x="60" y="86" width="240" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="180" y="107" font-size="10" font-weight="700" fill="hsl(var(--primary))">LONG-DISTANCE · ~40%</text>
    <text x="180" y="124" font-size="9" fill="hsl(var(--muted-foreground))">~1.4L pax · dwell 45–60 min</text>
    <text x="180" y="138" font-size="9" fill="hsl(var(--muted-foreground))">hot platform tea culture →</text>
    <text x="180" y="152" font-size="9" fill="hsl(var(--muted-foreground))">~45% buy ≥1 cup, avg 1.3</text>
    <text x="180" y="170" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ 80k cups</text>
    <rect x="340" y="86" width="240" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="460" y="107" font-size="10" font-weight="700" fill="hsl(var(--foreground))">SUBURBAN · ~60%</text>
    <text x="460" y="124" font-size="9" fill="hsl(var(--muted-foreground))">~2.1L pax · dwell 3–5 min</text>
    <text x="460" y="138" font-size="9" fill="hsl(var(--muted-foreground))">rushing commuters →</text>
    <text x="460" y="152" font-size="9" fill="hsl(var(--muted-foreground))">~7% buy</text>
    <text x="460" y="170" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ 15k cups</text>
  </g>
  <rect x="170" y="196" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="320" y="221" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 1 LAKH CUPS / DAY</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Segment footfall', md: '3.5L passengers: ~40% long-distance (waiting, families, tea ritual), ~60% suburban (sprinting for the 8:42 local). Add ~80K accompaniers/staff/vendors.' },
      { title: 'Long-distance', md: '1.4L × 45% buyers × 1.3 cups ≈ **~80K cups** — dwell time converts to consumption.' },
      { title: 'Suburban', md: '2.1L × ~7% ≈ **~15K cups** — conversion collapses when dwell is minutes.' },
      { title: 'Others', md: '80K accompaniers/staff at ~10% ≈ **~8K cups**.' },
      { title: 'Total', md: '**≈ 1 lakh cups/day** (≈ ₹15 lakh at ₹15/cup, across ~60–80 stalls ≈ 1,300 cups/stall — plausible).' },
    ]},
    { type: 'mathBox', md: '80k + 15k + 8k ≈ **103k cups/day** · per-stall check: 100k ÷ 70 stalls ≈ 1.4k/stall ✓' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The segmentation by **dwell time** is the answer\'s skeleton — say it first. The per-stall sanity check (1,300–1,500 cups ≈ one cup every 40 seconds over 16 hours, across 2–3 servers) closes the loop physically.' },
  ],
};
