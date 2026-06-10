import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const stadiumNonMatchday: Page = {
  slug: 'cases/unconventional/stadium-non-matchday',
  title: 'The Stadium That Works 20 Days a Year',
  subtitle: 'A fixed asset with 345 idle days. Invent its second business.',
  kind: 'case',
  meta: { difficulty: 'easy', caseType: 'Unconventional', readingTimeMin: 8, tags: ['asset-utilization', 'creative-structure'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'A state cricket association owns a 45,000-seat stadium in a metro suburb. It hosts ~20 match days a year; the other ~345 days it earns almost nothing while costing ₹35 crore annually in maintenance, staff, and debt service. The association asks: how do we monetize the asset year-round without compromising the pitch or match operations?' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Useful trick for asset-monetization cases: inventory the asset as *components*, not as a whole. A stadium isn\'t one thing — it\'s a pitch, stands, concourses, parking, boxes, kitchens, a brand, and a location. Which components are restricted? I assume the pitch is sacred and match windows are immovable.', note: 'Decomposing the asset into separately-rentable components is the whole game in utilization cases.' },
        { speaker: 'interviewer', md: 'Correct — the square (pitch area) must stay protected, and BCCI match windows take absolute priority with 10-day preparation buffers. Everything else is negotiable. The association also wants recurring income, not one-off events only.' },
        { speaker: 'candidate', md: 'So I\'ll sort opportunities along two axes: pitch-risk (does it touch the field?) and revenue type (recurring contract vs per-event). The recurring, zero-pitch-risk quadrant is the priority.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 700, ariaLabel: 'Two by two matrix of stadium monetization options by pitch risk and revenue recurrence, with component inventory across the top', caption: 'Component inventory × (pitch-risk, recurrence). The top-left quadrant pays the bills; events are the cherry, not the cake.', svg: `<svg viewBox="0 0 700 350" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="sncs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="snng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="170" y="12" width="360" height="38" rx="10" fill="url(#snng)" filter="url(#sncs)"/>
  <text x="350" y="36" text-anchor="middle" font-size="11" font-weight="700" fill="#ffffff">COMPONENTS: stands · concourses · boxes · kitchens · parking · brand</text>
  <text x="180" y="78" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--muted-foreground))">RECURRING REVENUE</text>
  <text x="520" y="78" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--muted-foreground))">PER-EVENT REVENUE</text>
  <g text-anchor="middle">
    <rect x="40" y="88" width="280" height="105" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.75" filter="url(#sncs)"/>
    <text x="180" y="109" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">ZERO PITCH RISK · RECURRING ★</text>
    <text x="180" y="127" font-size="9" fill="hsl(var(--muted-foreground))">corporate-box annual leases as offices/lounges ·</text>
    <text x="180" y="141" font-size="9" fill="hsl(var(--muted-foreground))">concourse retail + F&amp;B leases · cloud kitchens ·</text>
    <text x="180" y="155" font-size="9" fill="hsl(var(--muted-foreground))">weekday parking contracts (metro suburb!) ·</text>
    <text x="180" y="169" font-size="9" fill="hsl(var(--muted-foreground))">naming rights · sports academy in practice areas</text>
    <text x="180" y="186" font-size="9" font-weight="700" fill="hsl(var(--foreground))">target: cover the ₹35 cr fixed base</text>
    <rect x="380" y="88" width="280" height="105" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#sncs)"/>
    <text x="520" y="109" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">ZERO PITCH RISK · PER-EVENT</text>
    <text x="520" y="127" font-size="9" fill="hsl(var(--muted-foreground))">concerts on protected decking (4–6/yr) ·</text>
    <text x="520" y="141" font-size="9" fill="hsl(var(--muted-foreground))">exhibitions/conferences in concourses ·</text>
    <text x="520" y="155" font-size="9" fill="hsl(var(--muted-foreground))">weddings in hospitality areas · film shoots</text>
    <text x="520" y="172" font-size="9" font-weight="700" fill="hsl(var(--foreground))">high ticket, lumpy — upside layer</text>
    <rect x="40" y="213" width="280" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" stroke-dasharray="5 4"/>
    <text x="180" y="234" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PITCH-ADJACENT · RECURRING</text>
    <text x="180" y="252" font-size="9" fill="hsl(var(--muted-foreground))">stadium-run experience tours · "play on a</text>
    <text x="180" y="266" font-size="9" fill="hsl(var(--muted-foreground))">pro net" packages · corporate cricket leagues</text>
    <text x="180" y="280" font-size="9" fill="hsl(var(--muted-foreground))">on outfield practice wickets (curator-approved)</text>
    <rect x="380" y="213" width="280" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" stroke-dasharray="5 4"/>
    <text x="520" y="234" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PITCH RISK · PER-EVENT — HANDLE WITH CARE</text>
    <text x="520" y="252" font-size="9" fill="hsl(var(--muted-foreground))">large festivals on the outfield · non-cricket</text>
    <text x="520" y="266" font-size="9" fill="hsl(var(--muted-foreground))">sports — only with full turf-replacement bond</text>
    <text x="520" y="280" font-size="9" fill="hsl(var(--muted-foreground))">priced into the contract, never in season</text>
  </g>
  <text x="350" y="332" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">Rule of thumb: lease the parts that don't move (boxes, concourses, parking); event-ize the parts that do.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Put numbers on the recurring quadrant.' },
        { speaker: 'candidate', md: 'Boxes: 60 corporate boxes × ₹18 lakh/year as branded lounges/offices with matchday privileges ≈ ₹10.8 crore. Concourse retail: 8,000 m² leasable at ₹70/m²/month ≈ ₹6.7 crore. Parking: 3,000 cars × ₹3,000/month × 60% weekday occupancy ≈ ₹6.5 crore. Academy: 800 students × ₹60,000 ≈ ₹4.8 crore. Naming rights: ₹8–10 crore for a metro stadium. Total ≈ **₹37–39 crore recurring** — the fixed base is covered before a single concert.', note: 'Five line items, each with explicit assumptions, summing against the ₹35 crore target stated upfront.' },
        { speaker: 'interviewer', md: 'And the catch?' },
        { speaker: 'candidate', md: 'Operating model. An association of cricket administrators shouldn\'t run malls and parking lots. Lease to specialist operators on revenue-share — lower headline numbers, but real ones. Also matchday conflict: every lease needs 20-25 blackout days written in, and the box conversions need reversible fit-outs.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the association', items: [
        'Lease the static components — boxes, concourse retail, parking, academy space — to specialist operators with matchday blackout clauses; target ₹35+ crore recurring to neutralize the cost base.',
        'Sell naming rights once the venue has a year-round footfall story — it raises the rights\' value materially.',
        'Layer 4–6 large events a year (concerts on protected decking, off-season only) as upside, each with a turf-restoration bond.',
        'Create a small asset-management cell (3–4 professionals) to manage operators — the association governs, operators operate.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'For idle-asset cases, **decompose the asset into separately-monetizable components**, then sort by risk-to-core-purpose × revenue recurrence. Recurring leases beat glamorous events — and the owner usually shouldn\'t be the operator.' },
    ]},
  ],
};
