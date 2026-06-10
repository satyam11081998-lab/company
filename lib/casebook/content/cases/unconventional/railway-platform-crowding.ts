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
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Crowding is density: people on platforms ÷ platform area over time. With area fixed, I can reduce the *people*, the *time they spend* standing there, or smooth the *distribution* across platforms and minutes. Quick facts: what share of platform occupants are passengers versus accompaniers/vendors? And how early do passengers arrive before their train?', note: 'Unconventional cases reward defining the governing quantity (here: person-minutes per square metre) before any solutions.' },
        { speaker: 'interviewer', md: 'Surveys say: 70% passengers, 18% people seeing someone off, 12% vendors and staff. Long-distance passengers arrive 45–70 minutes early on average. Suburban passengers arrive ~8 minutes early. Both share the same concourse and some platforms.' },
        { speaker: 'candidate', md: 'Two findings jump out: a fifth of the crowd isn\'t travelling at all, and long-distance passengers spend nearly an hour occupying platform space they only need for five minutes of boarding. The structure: reduce non-travellers, shift waiting off-platform, and stagger/redistribute flows. Capacity expansion is off-limits — good; this is a flow problem, not a capacity problem.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 700, ariaLabel: 'Crowding decomposed into person-minutes per area: fewer people, fewer minutes each, better distribution across space and time, with levers under each', caption: 'Density = people × dwell time ÷ (area × spread). Area is fixed; the other three are the case.', svg: `<svg viewBox="0 0 700 340" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="rpcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="rpng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="215" y="14" width="270" height="46" rx="12" fill="url(#rpng)" filter="url(#rpcs)"/>
  <text x="350" y="34" text-anchor="middle" font-size="12" font-weight="700" fill="#ffffff">PEAK DENSITY = P × T ÷ (A × S)</text>
  <text x="350" y="51" text-anchor="middle" font-size="9" fill="#b9c4d6">people × dwell ÷ (area × spread) — area is frozen</text>
  <path d="M350 60 L350 78 M130 78 L570 78 M130 78 L130 94 M350 78 L350 94 M570 78 L570 94" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <g text-anchor="middle">
    <rect x="30" y="96" width="200" height="120" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#rpcs)"/>
    <text x="130" y="117" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">P · FEWER PEOPLE</text>
    <text x="130" y="136" font-size="9" fill="hsl(var(--muted-foreground))">platform tickets: price peak ×5</text>
    <text x="130" y="151" font-size="9" fill="hsl(var(--muted-foreground))">or suspend at peak (18% of crowd)</text>
    <text x="130" y="166" font-size="9" fill="hsl(var(--muted-foreground))">· vendor restocking windows</text>
    <text x="130" y="181" font-size="9" fill="hsl(var(--muted-foreground))">shifted off-peak (12%)</text>
    <text x="130" y="201" font-size="9" font-weight="700" fill="hsl(var(--foreground))">addressable: ~25–30% of bodies</text>
    <rect x="250" y="96" width="200" height="120" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#rpcs)"/>
    <text x="350" y="117" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">T · LESS DWELL TIME</text>
    <text x="350" y="136" font-size="9" fill="hsl(var(--muted-foreground))">long-distance: hold passengers in</text>
    <text x="350" y="151" font-size="9" fill="hsl(var(--muted-foreground))">off-platform waiting halls; admit to</text>
    <text x="350" y="166" font-size="9" fill="hsl(var(--muted-foreground))">platform when train is berthed</text>
    <text x="350" y="181" font-size="9" fill="hsl(var(--muted-foreground))">(airport-gate model) · live coach display</text>
    <text x="350" y="201" font-size="9" font-weight="700" fill="hsl(var(--foreground))">cuts 60-min dwell to ~15 min</text>
    <rect x="470" y="96" width="200" height="120" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#rpcs)"/>
    <text x="570" y="117" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">S · BETTER SPREAD</text>
    <text x="570" y="136" font-size="9" fill="hsl(var(--muted-foreground))">re-time 3–4 long-distance departures</text>
    <text x="570" y="151" font-size="9" fill="hsl(var(--muted-foreground))">out of the 8–9 am band · re-assign</text>
    <text x="570" y="166" font-size="9" fill="hsl(var(--muted-foreground))">suburban lines to under-used platforms</text>
    <text x="570" y="181" font-size="9" fill="hsl(var(--muted-foreground))">· one-way circulation on foot bridges</text>
    <text x="570" y="201" font-size="9" font-weight="700" fill="hsl(var(--foreground))">flattens the 8:15–8:45 spike</text>
  </g>
  <rect x="140" y="248" width="420" height="44" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="350" y="266" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">PRIORITIZE BY: DENSITY REDUCED ÷ COST ÷ TIME-TO-IMPLEMENT</text>
  <text x="350" y="283" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">the waiting-hall (T) lever dominates: one passenger-hour saved = one body-hour off the platform</text>
  <text x="350" y="322" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">No new platforms needed — the terminus has spare *time and space*, just in the wrong places.</text>
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
