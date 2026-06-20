import type { Page } from '@/lib/casebook/types';

export const officeElevatorTrips: Page = {
  slug: 'guesstimates/office-elevator-trips',
  title: 'Elevator trips per day in a 30-floor office tower',
  subtitle: 'A micro-operations estimate — peaks, batching, and round trips.',
  kind: 'guesstimate',
  meta: { difficulty: 'challenging', readingTimeMin: 5, tags: ['micro-operations', 'peak-analysis'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of elevator **trips** (door-close to door-open movements) per day in a 30-floor office tower with 6 elevators. The unit matters: trips ≠ passengers, because elevators batch people. This is a fully synthetic system — every number must be constructed.' },
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', title: 'Clarifying questions before building the tree', turns: [
        { speaker: 'candidate', md: 'The unit drives everything: a ‘trip’ is one door-close to door-open *car movement*, not a passenger journey — for this 30-floor, 6-elevator tower, a typical weekday?', note: 'Trips ≠ passengers because elevators batch; mis-defining this is the classic error.' },
        { speaker: 'interviewer', md: 'Correct — car movements, typical working day.' },
        { speaker: 'candidate', md: 'Should I construct every number, since there’s no external data here?' },
        { speaker: 'interviewer', md: 'Yes, it’s fully synthetic.' },
        { speaker: 'candidate', md: 'Then: building population → person-journeys (arrivals, lunch, departures, inter-floor) → compress by batching → add empty repositioning trips → sanity-check against six cars’ capacity.', note: 'Batching and empty trips are what turn person-journeys into car movements.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'The trip-as-car-movement unit, a synthetic build, and person-journeys compressed by batching plus empty trips.' },
    ]},
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree from building population through journey types per person to peak and off-peak batching, plus empty repositioning trips, summed and checked per car per minute', caption: 'Population → journey inventory → batching by period → + empty trips → physical check. Off-peak generates MORE trips than peak.', svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="oeng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#oeng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">ELEVATOR TRIPS / DAY</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">30 floors · 6 cars · trips ≠ passengers</text>
  <path d="M360 60 L360 78" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="80" width="300" height="42" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="97" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">POPULATION: 28 office floors × ~120 ≈ 3,400</text>
    <text x="360" y="113" font-size="9" fill="hsl(var(--muted-foreground))">+ ~600 daily visitors = 4,000 people</text>
  </g>
  <path d="M360 122 L360 138 M125 138 L595 138 M125 138 L125 154 M360 138 L360 154 M595 138 L595 154" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="156" width="190" height="84" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="125" y="176" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">COMMUTE JOURNEYS</text>
    <text x="125" y="193" font-size="8.5" fill="hsl(var(--muted-foreground))">arrive + leave = 2 each</text>
    <text x="125" y="207" font-size="8.5" fill="hsl(var(--muted-foreground))">concentrated 9–11am, 5–7pm</text>
    <text x="125" y="227" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 8,000/day</text>
    <rect x="265" y="156" width="190" height="84" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="176" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LUNCH JOURNEYS</text>
    <text x="360" y="193" font-size="8.5" fill="hsl(var(--muted-foreground))">~85% go down & up = 2 ×</text>
    <text x="360" y="207" font-size="8.5" fill="hsl(var(--muted-foreground))">3,400 × 0.85, in a 90-min window</text>
    <text x="360" y="227" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 5,800/day</text>
    <rect x="500" y="156" width="190" height="84" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="176" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">MISC JOURNEYS</text>
    <text x="595" y="193" font-size="8.5" fill="hsl(var(--muted-foreground))">meetings, smoke/coffee breaks,</text>
    <text x="595" y="207" font-size="8.5" fill="hsl(var(--muted-foreground))">visitors ≈ 1.3/person spread thin</text>
    <text x="595" y="227" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 5,200/day</text>
  </g>
  <path d="M125 240 L125 258 M360 240 L360 258 M595 240 L595 258 M125 258 L595 258 M360 258 L360 274" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="210" y="276" width="300" height="36" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="299" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 19,000 PERSON-JOURNEYS / DAY</text>
  </g>
  <path d="M360 312 L360 328 M185 328 L535 328 M185 328 L185 344 M535 328 L535 344" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="65" y="346" width="240" height="72" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="185" y="366" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PEAK (4 hrs) · 60% of journeys</text>
    <text x="185" y="383" font-size="8.5" fill="hsl(var(--muted-foreground))">11.4k ÷ ~10 people/car (full cars)</text>
    <text x="185" y="403" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 1,150 loaded trips</text>
    <rect x="415" y="346" width="240" height="72" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="535" y="366" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">OFF-PEAK (8 hrs) · 40%</text>
    <text x="535" y="383" font-size="8.5" fill="hsl(var(--muted-foreground))">7.6k ÷ ~2.5 people/car (batching collapses)</text>
    <text x="535" y="403" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 3,050 loaded trips</text>
  </g>
  <path d="M185 418 L185 440 M535 418 L535 440 M185 440 L535 440 M360 440 L360 456" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="165" y="458" width="390" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="477" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">4,200 loaded + ~17% empty repositioning ≈ 4,900 TRIPS / DAY</text>
  <text x="360" y="494" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">check: ÷ 6 cars ÷ 12 hrs ≈ 1 movement per car per minute ✓</text>
  <text x="360" y="528" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Counter-intuition to flag: off-peak makes 3× the trips of peak — light loads, not heavy ones, dominate trip count.</text>
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
