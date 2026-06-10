import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const intercityBusDynamic: Page = {
  slug: 'cases/pricing/intercity-bus-dynamic',
  title: 'Should the Sleeper Bus Price Like an Airline?',
  subtitle: 'Same seat, same route — should Tuesday cost less than Friday?',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'Pricing', readingTimeMin: 9, tags: ['dynamic-pricing', 'transport'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client runs 120 premium sleeper buses on intercity routes like Mumbai–Goa and Bengaluru–Hyderabad, selling at fixed prices per route (~₹1,400 average). Occupancy swings from 55% midweek to 100% sold-out-with-waitlist on Fridays, Sundays, and holidays. The CEO asks: should we adopt airline-style dynamic pricing, and what would it earn us?' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'The occupancy spread already answers "is there mispricing" — sold-out Fridays mean we\'re underpriced at peak; 55% Tuesdays may mean overpriced off-peak, or just thin demand. Before recommending: how do customers book — direct app or aggregators? And what does the competition do on these routes?' },
        { speaker: 'interviewer', md: '60% book via aggregator platforms, 40% direct. Competitors are mostly fixed-price too; trains are the real midweek competitor. Waitlists on Friday run 30–40 seats per bus.', note: 'A 30–40 seat waitlist on a ~36-berth bus means peak demand is roughly 2× capacity — enormous headroom.' },
        { speaker: 'candidate', md: 'A waitlist the size of the bus itself is the clearest underpricing signal you can get. I\'ll structure this as: where\'s the revenue leak (peak vs off-peak), how much can dynamic pricing recover, and what are the execution risks — fairness perception, aggregator mechanics, and competitive response.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 700, ariaLabel: 'Two-sided pricing opportunity: peak underpricing with waitlist evidence and off-peak utilization, with three execution risks below', caption: 'Both ends leak revenue — but they need opposite price moves, and the risks live in execution, not math.', svg: `<svg viewBox="0 0 700 330" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="ibcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="ibng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="235" y="14" width="230" height="42" rx="11" fill="url(#ibng)" filter="url(#ibcs)"/>
  <text x="350" y="40" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">TWO LEAKS, OPPOSITE FIXES</text>
  <g text-anchor="middle">
    <rect x="60" y="80" width="270" height="96" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#ibcs)"/>
    <text x="195" y="103" font-size="10" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">PEAK: UNDERPRICED</text>
    <text x="195" y="122" font-size="9.5" fill="hsl(var(--muted-foreground))">100% + waitlist ≈ 2× demand</text>
    <text x="195" y="138" font-size="9.5" fill="hsl(var(--muted-foreground))">price is rationing by luck, not value</text>
    <text x="195" y="160" font-size="10" font-weight="700" fill="hsl(var(--foreground))">fix: raise peak fares in steps</text>
    <rect x="370" y="80" width="270" height="96" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#ibcs)"/>
    <text x="505" y="103" font-size="10" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">OFF-PEAK: EMPTY BERTHS</text>
    <text x="505" y="122" font-size="9.5" fill="hsl(var(--muted-foreground))">55% occupancy · marginal cost of a</text>
    <text x="505" y="138" font-size="9.5" fill="hsl(var(--muted-foreground))">filled berth ≈ ₹60 (linen + booking fee)</text>
    <text x="505" y="160" font-size="10" font-weight="700" fill="hsl(var(--foreground))">fix: discounted advance fares midweek</text>
  </g>
  <g text-anchor="middle">
    <rect x="60" y="206" width="180" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="150" y="227" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FAIRNESS RISK</text>
    <text x="150" y="243" font-size="8.5" fill="hsl(var(--muted-foreground))">"₹2,600 for a bus?!" —</text>
    <text x="150" y="256" font-size="8.5" fill="hsl(var(--muted-foreground))">cap the ratio, frame as early-bird</text>
    <rect x="260" y="206" width="180" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="350" y="227" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">AGGREGATOR RISK</text>
    <text x="350" y="243" font-size="8.5" fill="hsl(var(--muted-foreground))">platforms sort by price —</text>
    <text x="350" y="256" font-size="8.5" fill="hsl(var(--muted-foreground))">peak hikes lose ranking visibility</text>
    <rect x="460" y="206" width="180" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="550" y="227" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">COMPETITIVE RISK</text>
    <text x="550" y="243" font-size="8.5" fill="hsl(var(--muted-foreground))">rivals stay flat &amp; advertise it —</text>
    <text x="550" y="256" font-size="8.5" fill="hsl(var(--muted-foreground))">premium product must justify gap</text>
  </g>
  <text x="350" y="305" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">The math says yes loudly; the design problem is making "yes" survive customers, platforms, and rivals.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Size the prize. A bus has 36 berths; assume 40 peak departures and 80 off-peak departures a week across the fleet… actually, let\'s keep it per-bus-per-week: 3 peak and 4 off-peak departures.' },
        { speaker: 'candidate', md: 'Peak: 3 departures × 36 berths, currently all at ₹1,400. With a stepped curve — first third at ₹1,400, middle at ₹1,800, last third at ₹2,300 — average ≈ ₹1,830, +₹430/berth: 3 × 36 × 430 ≈ **+₹46,400/bus/week**, and the waitlist says volume holds. Off-peak: 4 × 36 at 55% = 79 filled; an advance-purchase ₹999 fare could lift occupancy to ~70% — 22 extra berths × ₹999 ≈ +₹22,000, minus dilution from full-fare bookers who\'d have paid ₹1,400 anyway, say 15 × ₹400 = ₹6,000 — net ≈ **+₹16,000**. Total ≈ ₹62,000/bus/week, ~₹39 crore annualized across 120 buses — roughly a 20% revenue lift at near-zero marginal cost.', note: 'Counts the dilution honestly. Most candidates forget that off-peak discounts also reach people who would have paid full fare.' },
        { speaker: 'interviewer', md: 'And the fairness backlash?' },
        { speaker: 'candidate', md: 'Three design rules: cap the peak-to-floor ratio at ~2.3× (airlines run 5–10× and get hated for it); frame everything as *early-bird savings* off a higher anchor rather than surge on a base; and keep prices fixed once booked — no repricing, no airline-style fare classes visible. Buses sell to families, not expense accounts; perception discipline is worth a few rupees of theoretical yield.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the CEO', items: [
        'Adopt stepped, occupancy-triggered pricing: 3 fare steps per departure, peak ceiling ~2.3× the off-peak floor — not continuous airline-style surge.',
        'Frame as early-bird discounts from a raised anchor; never let a customer watch a price rise mid-booking.',
        'Pilot on two routes for eight weeks; measure revenue per departure, direct-app share, and review sentiment before fleet rollout.',
        'Use the off-peak ₹999 fare to attack rail-substitutable midweek demand, and push it through the direct app only — protecting aggregator rank at peak.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'A waitlist is a price signal, not an ops problem. Dynamic-pricing cases are 30% arithmetic and 70% **mechanism design** — caps, framing, and channel handling decide whether the math survives contact with real customers.' },
    ]},
  ],
};
