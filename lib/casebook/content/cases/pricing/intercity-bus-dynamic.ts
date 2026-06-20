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
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'The occupancy spread already answers "is there mispricing" — sold-out Fridays mean we\'re underpriced at peak; 55% Tuesdays may mean overpriced off-peak, or just thin demand. Before recommending: how do customers book — direct app or aggregators? And what does the competition do on these routes?' },
        { speaker: 'interviewer', md: '60% book via aggregator platforms, 40% direct. Competitors are mostly fixed-price too; trains are the real midweek competitor. Waitlists on Friday run 30–40 seats per bus.', note: 'A 30–40 seat waitlist on a ~36-berth bus means peak demand is roughly 2× capacity — enormous headroom.' },
        { speaker: 'candidate', md: 'A waitlist the size of the bus itself is the clearest underpricing signal you can get. I\'ll structure this as: where\'s the revenue leak (peak vs off-peak), how much can dynamic pricing recover, and what are the execution risks — fairness perception, aggregator mechanics, and competitive response.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Read the occupancy spread as clear peak underpricing and framed the case as leak → recoverable upside → execution risks (fairness, channel).' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree: peak underpricing and off-peak empty berths, stepped-curve math averaging 1,830 rupees for plus 46,400 per bus week, off-peak fill math netting plus 16,000, three execution risks, and a verdict bar of 62,000 per bus per week or 39 crore annually', caption: 'Two leaks, opposite fixes — and the math tier under each. The honest part is subtracting the ₹6k dilution.', svg: `<svg viewBox="0 0 720 495" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="ibng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#ibng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">TWO LEAKS, OPPOSITE FIXES</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">100% + waitlist on Fridays · 55% on Tuesdays — both ends leak revenue</text>
  <path d="M360 60 L360 70 M215 70 L505 70 M215 70 L215 82 M505 70 L505 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="95" y="84" width="240" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="104" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">PEAK: UNDERPRICED</text>
    <text x="215" y="121" font-size="8.5" fill="hsl(var(--muted-foreground))">30–40 seat waitlist on a 36-berth bus —</text>
    <text x="215" y="135" font-size="8.5" fill="hsl(var(--muted-foreground))">price rations by luck, not value</text>
    <text x="215" y="157" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">demand ≈ 2× capacity</text>
    <text x="215" y="172" font-size="8" fill="hsl(var(--muted-foreground))">fix: raise peak fares in steps</text>
    <rect x="385" y="84" width="240" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="505" y="104" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">OFF-PEAK: EMPTY BERTHS</text>
    <text x="505" y="121" font-size="8.5" fill="hsl(var(--muted-foreground))">marginal cost of a filled berth ≈ ₹60</text>
    <text x="505" y="135" font-size="8.5" fill="hsl(var(--muted-foreground))">(linen + booking fee) · rail competes midweek</text>
    <text x="505" y="157" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">55% occupancy</text>
    <text x="505" y="172" font-size="8" fill="hsl(var(--muted-foreground))">fix: discounted advance fares</text>
  </g>
  <path d="M215 180 L215 196 M505 180 L505 196" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="198" width="240" height="72" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="216" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">STEPPED CURVE · 3 peak deps/wk</text>
    <text x="215" y="232" font-size="8.5" fill="hsl(var(--muted-foreground))">⅓ @ ₹1,400 · ⅓ @ ₹1,800 · ⅓ @ ₹2,300</text>
    <text x="215" y="246" font-size="8.5" fill="hsl(var(--muted-foreground))">avg ≈ ₹1,830 → +₹430/berth</text>
    <text x="215" y="262" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">3 × 36 × 430 ≈ +₹46,400/wk</text>
    <rect x="385" y="198" width="240" height="72" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="216" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">OFF-PEAK FILL · 4 deps/wk</text>
    <text x="505" y="232" font-size="8.5" fill="hsl(var(--muted-foreground))">₹999 advance fare: 55% → ~70%</text>
    <text x="505" y="246" font-size="8.5" fill="hsl(var(--muted-foreground))">+22 × ₹999 ≈ ₹22k − dilution 15 × ₹400</text>
    <text x="505" y="262" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">net ≈ +₹16,000/wk</text>
  </g>
  <path d="M215 270 L215 286 M505 270 L505 286 M135 286 L585 286 M135 286 L135 300 M360 286 L360 300 M585 286 L585 300" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="302" width="210" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="135" y="322" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FAIRNESS RISK</text>
    <text x="135" y="338" font-size="8" fill="hsl(var(--muted-foreground))">"₹2,600 for a bus?!" — cap ratio at ~2.3×,</text>
    <text x="135" y="352" font-size="8" fill="hsl(var(--muted-foreground))">frame as early-bird off a raised anchor</text>
    <rect x="255" y="302" width="210" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="322" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">AGGREGATOR RISK</text>
    <text x="360" y="338" font-size="8" fill="hsl(var(--muted-foreground))">60% book via platforms that sort by price —</text>
    <text x="360" y="352" font-size="8" fill="hsl(var(--muted-foreground))">push the ₹999 fare through direct app only</text>
    <rect x="480" y="302" width="210" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="585" y="322" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">COMPETITIVE RISK</text>
    <text x="585" y="338" font-size="8" fill="hsl(var(--muted-foreground))">rivals stay flat and advertise it —</text>
    <text x="585" y="352" font-size="8" fill="hsl(var(--muted-foreground))">the premium product must justify the gap</text>
  </g>
  <path d="M135 366 L135 382 M360 366 L360 382 M585 366 L585 382 M135 382 L585 382 M360 382 L360 396" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="398" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="417" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹62,000 / BUS / WEEK → ~₹39 CR / YR (+20%)</text>
  <text x="360" y="434" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">3 fare steps, ceiling 2.3× floor · no repricing after booking · pilot 2 routes, 8 weeks</text>
  <text x="360" y="472" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">A waitlist is a price signal, not an ops problem. Dynamic pricing is 30% arithmetic, 70% mechanism design.</text>
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
