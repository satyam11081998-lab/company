import type { Page } from '@/lib/casebook/types';

export const officeElevatorTrips: Page = {
  slug: 'guesstimates/office-elevator-trips',
  title: 'Elevator trips per day in a 30-floor office tower',
  subtitle: 'A micro-operations estimate — peaks, batching, and round trips.',
  kind: 'guesstimate',
  meta: { difficulty: 'challenging', readingTimeMin: 5, tags: ['micro-operations', 'peak-analysis'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of elevator **trips** (door-close to door-open movements) per day in a 30-floor office tower with 6 elevators. The unit matters: trips ≠ passengers, because elevators batch people. This is a fully synthetic system — every number must be constructed.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Estimation from building population through person-journeys per day to trips after batching, split by peak and off-peak', caption: 'Person-journeys ÷ batch size = trips, computed separately for peak (full cars) and off-peak (near-empty cars).', svg: `<svg viewBox="0 0 640 260" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="oeng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="30" y="24" width="180" height="74" rx="10" fill="url(#oeng)"/>
    <text x="120" y="48" font-size="10" font-weight="700" fill="#ffffff">POPULATION</text>
    <text x="120" y="65" font-size="9" fill="#b9c4d6">28 office floors × ~120</text>
    <text x="120" y="79" font-size="9" fill="#b9c4d6">people ≈ 3,400 occupants</text>
    <rect x="250" y="24" width="170" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="335" y="48" font-size="10" font-weight="700" fill="hsl(var(--foreground))">PERSON-JOURNEYS</text>
    <text x="335" y="65" font-size="9" fill="hsl(var(--muted-foreground))">in/out (2) + lunch (2) +</text>
    <text x="335" y="79" font-size="9" fill="hsl(var(--muted-foreground))">misc (1.5) ≈ 5.5 each ≈ 19k</text>
    <rect x="460" y="24" width="160" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="540" y="48" font-size="10" font-weight="700" fill="hsl(var(--primary))">BATCHING</text>
    <text x="540" y="65" font-size="9" fill="hsl(var(--muted-foreground))">peak: ~10/car ·</text>
    <text x="540" y="79" font-size="9" fill="hsl(var(--muted-foreground))">off-peak: ~2.5/car</text>
  </g>
  <path d="M210 61 L246 61 M420 61 L456 61" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <g text-anchor="middle">
    <rect x="80" y="128" width="220" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="190" y="149" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PEAK (4 hrs): 60% of journeys</text>
    <text x="190" y="166" font-size="9" fill="hsl(var(--muted-foreground))">11.4k ÷ 10 per car ≈ 1,150 trips</text>
    <text x="190" y="181" font-size="9" fill="hsl(var(--muted-foreground))">+ ~40% empty repositioning</text>
    <rect x="340" y="128" width="220" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="450" y="149" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">OFF-PEAK (8 hrs): 40%</text>
    <text x="450" y="166" font-size="9" fill="hsl(var(--muted-foreground))">7.6k ÷ 2.5 per car ≈ 3,050 trips</text>
    <text x="450" y="181" font-size="9" fill="hsl(var(--muted-foreground))">(light loads dominate trip count)</text>
  </g>
  <rect x="170" y="208" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="320" y="233" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 4,500–5,000 TRIPS / DAY</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Population', md: '28 usable office floors × ~120 people ≈ **3,400 occupants** + ~600 daily visitors.' },
      { title: 'Person-journeys', md: 'Arrive + leave (2) + lunch round trip (2) + meetings/breaks (~1.5) ≈ 5.5 × 3,400 ≈ **~19,000 journeys**.' },
      { title: 'Batching', md: 'Peak cars carry ~10 people; off-peak ~2.5. Split journeys 60/40 peak/off-peak → 1,150 + 3,050 ≈ 4,200 loaded trips.' },
      { title: 'Empty trips', md: 'Elevators reposition empty (down at morning peak); add ~15–20% → **~4,800 trips/day**.' },
      { title: 'Sanity', md: '4,800 ÷ 6 cars ÷ 12 hrs ≈ 67 trips/car/hour ≈ one movement per minute — physically reasonable.' },
    ]},
    { type: 'mathBox', md: '19k journeys → 4.2k loaded trips + 17% empty ≈ **4.9k trips** · check: ~1 trip/car/minute ✓' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The counter-intuitive result to flag: **off-peak generates more trips than peak** because batching collapses. And always close synthetic builds with a physical-plausibility check (trips per car per minute) — it\'s the only external anchor available.' },
  ],
};
