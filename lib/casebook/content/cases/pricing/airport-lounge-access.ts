import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const airportLoungeAccess: Page = {
  slug: 'cases/pricing/airport-lounge-access',
  title: 'Pricing the Airport Lounge',
  subtitle: 'A walk-in lounge with empty sofas and full flights outside. Set the price.',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'Pricing', readingTimeMin: 9, tags: ['value-based', 'segmentation', 'travel'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client operates a 200-seat premium lounge in a major Indian airport\'s domestic terminal. Today 80% of guests enter free via credit-card programmes that reimburse the lounge ₹650 per visit. The operator wants to launch **walk-in paid access** and asks: what should the price be?' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Pricing needs three anchors: cost floor, competitor reference, and customer value ceiling. But first — what\'s the objective: maximize walk-in revenue, fill off-peak capacity, or protect the card-programme relationships that pay the bills?' },
        { speaker: 'interviewer', md: 'Primary: incremental revenue. Constraint: do nothing that makes the card networks renegotiate below ₹650. Current occupancy: 45% off-peak, 95% at morning and evening banks.', note: 'The constraint is the interesting part — a public walk-in price becomes a *reference price* for the card networks\' next negotiation.' },
        { speaker: 'candidate', md: 'That constraint cuts deep: if we post ₹500 walk-in, the card networks will ask why they pay ₹650. So the walk-in price must sit **above** ₹650 — it\'s not just demand math, it\'s protecting the existing book. Let me build floor, reference, and ceiling, then segment by time of day.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Pricing band from 280 rupee cost floor through 650 rupee contract floor and competitor band to 2,000 rupee value ceiling, then a peak off-peak segmentation tier of 1,999 capped and 1,399 slot-based, a revenue math row of 2.7 crore per year and 2.3 crore contribution, and a two-price verdict bar', caption: 'The band, then the policy — price is not one number. Both prices sit far above the ₹650 contract reference.', svg: `<svg viewBox="0 0 720 560" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="alng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#alng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">WHERE IN THE BAND?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">incremental revenue — without giving the card networks a reason to renegotiate ₹650</text>
  <path d="M360 60 L360 76" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g>
    <rect x="130" y="78" width="460" height="34" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
    <text x="145" y="99" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">VALUE CEILING ≈ ₹1,500–2,000</text>
    <text x="575" y="99" text-anchor="end" font-size="9" fill="hsl(var(--muted-foreground))">layover meals + quiet + showers vs ₹800 café spend</text>
    <rect x="130" y="120" width="460" height="34" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="145" y="141" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">COMPETITOR BAND ≈ ₹1,100–1,400</text>
    <text x="575" y="141" text-anchor="end" font-size="9" fill="hsl(var(--muted-foreground))">other-terminal lounges · day-pass apps</text>
    <rect x="130" y="162" width="460" height="34" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="2" stroke-dasharray="6 3"/>
    <text x="145" y="183" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">CONTRACT FLOOR = ₹650 — the real floor</text>
    <text x="575" y="183" text-anchor="end" font-size="9" fill="hsl(var(--muted-foreground))">card networks watch this number</text>
    <rect x="130" y="204" width="460" height="34" rx="6" fill="hsl(var(--muted-foreground))" opacity="0.25"/>
    <text x="145" y="225" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">COST FLOOR ≈ ₹280/guest</text>
    <text x="575" y="225" text-anchor="end" font-size="9" fill="hsl(var(--muted-foreground))">F&amp;B consumption + variable staffing — irrelevant here</text>
  </g>
  <path d="M360 238 L360 252 M215 252 L505 252 M215 252 L215 264 M505 252 L505 264" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="266" width="240" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="286" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">OFF-PEAK · 45% OCCUPANCY</text>
    <text x="215" y="303" font-size="8.5" fill="hsl(var(--muted-foreground))">default walk-in window —</text>
    <text x="215" y="317" font-size="8.5" fill="hsl(var(--muted-foreground))">app-based, slot-limited passes</text>
    <text x="215" y="339" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">₹1,399</text>
    <text x="215" y="353" font-size="8" fill="hsl(var(--muted-foreground))">top of competitor band, value-justified</text>
    <rect x="385" y="266" width="240" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="505" y="286" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PEAK · 95% OCCUPANCY</text>
    <text x="505" y="303" font-size="8.5" fill="hsl(var(--muted-foreground))">full of ₹650 card guests — protect</text>
    <text x="505" y="317" font-size="8.5" fill="hsl(var(--muted-foreground))">the experience that justifies ₹650</text>
    <text x="505" y="339" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">₹1,999 · 15 passes/bank</text>
    <text x="505" y="353" font-size="8" fill="hsl(var(--muted-foreground))">guaranteed seat, hard cap</text>
  </g>
  <path d="M215 358 L215 374 M505 358 L505 374" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="376" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="394" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">REVENUE</text>
    <text x="215" y="410" font-size="8.5" fill="hsl(var(--muted-foreground))">25 × ₹1,399 + 20 × ₹1,999 ≈ ₹75k/day</text>
    <text x="215" y="426" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹2.7 cr / year</text>
    <rect x="385" y="376" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="394" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">CONTRIBUTION</text>
    <text x="505" y="410" font-size="8.5" fill="hsl(var(--muted-foreground))">− 45 guests × ₹280 variable ≈ ₹12.6k/day</text>
    <text x="505" y="426" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹2.3 cr / year</text>
  </g>
  <path d="M215 434 L215 450 M505 434 L505 450 M215 450 L505 450 M360 450 L360 464" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="466" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="485" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">₹1,399 OFF-PEAK · ₹1,999 PEAK — ₹2.3 CR PURE MARGIN</text>
  <text x="360" y="502" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">never below ~₹1,100 publicly · bundle upward (+₹400 shower, +₹600 meal) · zero risk to the ₹650 book</text>
  <text x="360" y="540" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The cost floor is irrelevant; the contract floor does its job. Before posting any price, ask who else sees it.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Give me a number, and deal with the 95% peak problem.' },
        { speaker: 'candidate', md: 'Headline price **₹1,399** — top of the competitor band, justified by showers and à-la-carte dining, comfortably above the ₹650 contract reference. But at peak banks the lounge is nearly full of card guests, so walk-ins would degrade the experience that justifies ₹650. So: walk-in sales are **off-peak only by default**, via a slot-based app purchase. At peak, either close walk-ins or price at ₹1,999 with a guaranteed-seat promise, capped at, say, 15 passes per bank.', note: 'Time-based segmentation falls straight out of the occupancy data — price isn\'t one number, it\'s a policy.' },
        { speaker: 'interviewer', md: 'Estimate the annual walk-in revenue at your prices. Assume 25 off-peak walk-ins/day and 20 peak passes/day sell.' },
        { speaker: 'candidate', md: '25 × ₹1,399 ≈ ₹35,000/day off-peak; 20 × ₹1,999 ≈ ₹40,000/day peak — ~₹75,000/day, ~₹2.7 crore/year. Variable cost ≈ 45 guests × ₹280 ≈ ₹12,600/day, so ~₹2.3 crore incremental contribution. Modest but nearly pure margin on existing fixed costs — and zero risk to the ₹650 book since both prices sit far above it.' },
      ]},
      { type: 'reveal', summary: 'Reveal the willingness-to-pay logic', blocks: [
        { type: 'mathBox', title: 'Value ceiling, built not guessed', md: 'Layover spend avoided: meal ₹500–700 + coffee ₹250 + airport wifi-lounge seat ₹0 but scarce\nComfort premium for 2+ hrs (quiet, shower, charging): ₹500–800 stated-preference range\nCeiling ≈ ₹1,500–2,000 for the segment that books lounges ad hoc — business travellers on long layovers.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend', items: [
        'Launch walk-in at ₹1,399 off-peak (app-based, slot-limited) and ₹1,999 guaranteed-seat at peak, capped per bank.',
        'Never discount below ~₹1,100 publicly — the visible walk-in price is the card networks\' next negotiating anchor; protect it.',
        'Bundle experiments upward, not downward: +₹400 shower add-on, +₹600 meal upgrade — lifts realized value without touching the headline.',
        'Review after one quarter against two metrics: pass sell-through and card-guest satisfaction scores at peak.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Build the band — floor, reference, ceiling — but always ask **who else sees this price**. When an existing B2B contract references your public price, that contract becomes the real floor, and segmentation by time becomes how you serve new demand without breaking the old book.' },
    ]},
  ],
};
