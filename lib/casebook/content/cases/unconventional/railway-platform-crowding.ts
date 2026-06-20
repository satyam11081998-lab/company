import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const railwayPlatformCrowding: Page = {
  slug: 'cases/unconventional/railway-platform-crowding',
  title: 'Decongest the Railway Terminus',
  subtitle: 'No P&L, no client revenue — structure a public-operations problem.',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'Unconventional', readingTimeMin: 9, tags: ['public-sector', 'operations'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'A major metro-city railway terminus sees dangerous platform crowding between 7:30–10:00 am. The divisional railway manager — your client — cannot add platforms or land for at least five years. Reduce peak crowding meaningfully within 12 months, with a modest budget.' },
    ]},
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Crowding is density: people on platforms ÷ platform area over time. With area fixed, I can reduce the *people*, the *time they spend* standing there, or smooth the *distribution* across platforms and minutes. Quick facts: what share of platform occupants are passengers versus accompaniers/vendors? And how early do passengers arrive before their train?', note: 'Unconventional cases reward defining the governing quantity (here: person-minutes per square metre) before any solutions.' },
        { speaker: 'interviewer', md: 'Surveys say: 70% passengers, 18% people seeing someone off, 12% vendors and staff. Long-distance passengers arrive 45–70 minutes early on average. Suburban passengers arrive ~8 minutes early. Both share the same concourse and some platforms.' },
        { speaker: 'candidate', md: 'Two findings jump out: a fifth of the crowd isn\'t travelling at all, and long-distance passengers spend nearly an hour occupying platform space they only need for five minutes of boarding. The structure: reduce non-travellers, shift waiting off-platform, and stagger/redistribute flows. Capacity expansion is off-limits — good; this is a flow problem, not a capacity problem.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Framed crowding as density and isolated two levers — non-travellers occupying platforms and long-distance passengers’ dwell time.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree decomposing platform density into people, dwell time and spread levers with numbers, an airport-gate math tier cutting 7.9 lakh person-minutes to 2.2 lakh for minus 70 percent, and a phased rollout verdict bar', caption: 'Density = P × T ÷ (A × S), with the math tier under the dominant lever — 7.9L person-minutes become 2.2L.', svg: `<svg viewBox="0 0 720 440" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="rpng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#rpng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">PEAK DENSITY = P × T ÷ (A × S)</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">people × dwell ÷ (area × spread) — area is frozen for five years</text>
  <path d="M360 60 L360 70 M125 70 L595 70 M125 70 L125 82 M360 70 L360 82 M595 70 L595 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="84" width="190" height="130" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="125" y="104" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">P · FEWER PEOPLE</text>
    <text x="125" y="121" font-size="8.5" fill="hsl(var(--muted-foreground))">platform tickets: ×5 price or</text>
    <text x="125" y="135" font-size="8.5" fill="hsl(var(--muted-foreground))">suspend at peak (18% of crowd) ·</text>
    <text x="125" y="149" font-size="8.5" fill="hsl(var(--muted-foreground))">vendor restocking windows</text>
    <text x="125" y="163" font-size="8.5" fill="hsl(var(--muted-foreground))">moved off-peak (12%)</text>
    <text x="125" y="186" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">~25–30% of bodies</text>
    <text x="125" y="201" font-size="8" fill="hsl(var(--muted-foreground))">a fifth of the crowd is not travelling</text>
    <rect x="265" y="84" width="190" height="130" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="104" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">T · LESS DWELL — dominant</text>
    <text x="360" y="121" font-size="8.5" fill="hsl(var(--muted-foreground))">long-distance arrive 45–70 min</text>
    <text x="360" y="135" font-size="8.5" fill="hsl(var(--muted-foreground))">early; hold in waiting halls, admit</text>
    <text x="360" y="149" font-size="8.5" fill="hsl(var(--muted-foreground))">when berthed (airport-gate model)</text>
    <text x="360" y="163" font-size="8.5" fill="hsl(var(--muted-foreground))">· live coach displays + SMS gates</text>
    <text x="360" y="186" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">60 → ~15 min dwell</text>
    <text x="360" y="201" font-size="8" fill="hsl(var(--muted-foreground))">halls exist — unattractive, unenforced</text>
    <rect x="500" y="84" width="190" height="130" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="104" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">S · BETTER SPREAD</text>
    <text x="595" y="121" font-size="8.5" fill="hsl(var(--muted-foreground))">re-time 3–4 long-distance</text>
    <text x="595" y="135" font-size="8.5" fill="hsl(var(--muted-foreground))">departures out of 8–9 am ·</text>
    <text x="595" y="149" font-size="8.5" fill="hsl(var(--muted-foreground))">re-assign suburban platforms ·</text>
    <text x="595" y="163" font-size="8.5" fill="hsl(var(--muted-foreground))">one-way footbridge circulation</text>
    <text x="595" y="186" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">flattens 8:15–8:45</text>
    <text x="595" y="201" font-size="8" fill="hsl(var(--muted-foreground))">the spike, not the average</text>
  </g>
  <path d="M125 214 L125 232 M360 214 L360 232 M595 214 L595 232 M125 232 L595 232 M215 232 L215 246 M505 232 L505 246" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="248" width="240" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="215" y="266" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">TODAY · PEAK BAND</text>
    <text x="215" y="282" font-size="8.5" fill="hsl(var(--muted-foreground))">12 trains × 1,200 pax × 55 min early</text>
    <text x="215" y="302" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ 7.9L person-minutes</text>
    <rect x="385" y="248" width="240" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="266" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">AIRPORT-GATE MODEL</text>
    <text x="505" y="282" font-size="8.5" fill="hsl(var(--muted-foreground))">12 × 1,200 × 15 min ≈ 2.2L → −5.8L</text>
    <text x="505" y="302" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">−70% of long-distance load</text>
  </g>
  <path d="M215 312 L215 328 M505 312 L505 328 M215 328 L505 328 M360 328 L360 342" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="344" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="363" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">PHASE 1 GATE MODEL → 2 PLATFORM TICKETS → 3 RE-TIMING</text>
  <text x="360" y="380" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">months 1–3 / 2–6 / 6–12 · target person-minutes/m² on a CCTV counting dashboard, not anecdotes</text>
  <text x="360" y="418" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Most "capacity" crises are flow problems — the terminus has spare time and space, just in the wrong places.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Estimate the impact of the airport-gate model alone.' },
        { speaker: 'candidate', md: 'Say 12 long-distance departures in the peak band, ~1,200 passengers each, arriving ~55 minutes early on average. Today that\'s 12 × 1,200 × 55 ≈ 7.9 lakh passenger-minutes on platforms. Holding them in a concourse hall until 15 minutes pre-departure cuts platform dwell to ~15 minutes: 12 × 1,200 × 15 ≈ 2.2 lakh. That removes **~5.8 lakh passenger-minutes — roughly 70% of long-distance platform load** — using waiting halls that already exist but are unattractive and unenforced.', note: 'Quantifies with rough numbers and states the operational requirement (enforcement + displays), not just the idea.' },
        { speaker: 'interviewer', md: 'What breaks this in practice?' },
        { speaker: 'candidate', md: 'Three things: passengers don\'t trust announcements, so they camp at platforms — fix with reliable coach-position displays and SMS gates; the halls are unpleasant — fix with fans, seating, and vendor stalls (which also relocates vendors off platforms); and enforcement at platform entry needs gating staff for the first months until behaviour settles. None requires capex beyond a few crore.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the DRM', items: [
        'Phase 1 (months 1–3): airport-gate waiting for long-distance trains + live coach displays — the single biggest density lever, near-zero capex.',
        'Phase 2 (months 2–6): peak-hour platform-ticket suspension and vendor restocking windows moved off-peak — removes ~25% of non-traveller bodies.',
        'Phase 3 (months 6–12): re-time 3–4 long-distance departures out of the 8–9 am band and rebalance suburban platform assignments.',
        'Measure with a density dashboard (CCTV people-counting per platform per 5 minutes) — set the target as person-minutes/m², not anecdotes.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Unconventional cases want you to **define the governing metric** (here, person-minutes per square metre) and decompose it like a P&L. Most "capacity" crises are flow problems — the system has slack, just at the wrong place or time.' },
    ]},
  ],
};
