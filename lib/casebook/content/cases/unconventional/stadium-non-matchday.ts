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
      { type: 'svg', maxWidth: 720, ariaLabel: 'Stadium monetization matrix by pitch risk and revenue recurrence, a five-item revenue build tier of boxes 10.8, retail 6.7, parking 6.5, academy 4.8 and naming rights 8 to 10 crore, and a verdict bar showing 37 to 39 crore recurring against the 35 crore cost base', caption: 'The matrix sorts the ideas; the build tier prices the winning quadrant — five leases cover the ₹35 cr base before a single concert.', svg: `<svg viewBox="0 0 720 565" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="snng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#snng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">MONETIZE 345 IDLE DAYS</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">₹35 cr/yr cost base · pitch sacred · components: stands · boxes · kitchens · parking · brand</text>
  <text x="190" y="84" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--muted-foreground))">RECURRING REVENUE</text>
  <text x="530" y="84" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--muted-foreground))">PER-EVENT REVENUE</text>
  <g text-anchor="middle">
    <rect x="50" y="94" width="280" height="105" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
    <text x="190" y="115" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">ZERO PITCH RISK · RECURRING ★</text>
    <text x="190" y="133" font-size="8.5" fill="hsl(var(--muted-foreground))">corporate-box annual leases as offices/lounges ·</text>
    <text x="190" y="147" font-size="8.5" fill="hsl(var(--muted-foreground))">concourse retail + F&amp;B · cloud kitchens ·</text>
    <text x="190" y="161" font-size="8.5" fill="hsl(var(--muted-foreground))">weekday parking (metro suburb!) · naming rights ·</text>
    <text x="190" y="175" font-size="8.5" fill="hsl(var(--muted-foreground))">sports academy in practice areas</text>
    <text x="190" y="192" font-size="9" font-weight="700" fill="hsl(var(--foreground))">target: cover the ₹35 cr fixed base</text>
    <rect x="390" y="94" width="280" height="105" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="530" y="115" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">ZERO PITCH RISK · PER-EVENT</text>
    <text x="530" y="133" font-size="8.5" fill="hsl(var(--muted-foreground))">concerts on protected decking (4–6/yr) ·</text>
    <text x="530" y="147" font-size="8.5" fill="hsl(var(--muted-foreground))">exhibitions/conferences in concourses ·</text>
    <text x="530" y="161" font-size="8.5" fill="hsl(var(--muted-foreground))">weddings in hospitality areas · film shoots</text>
    <text x="530" y="178" font-size="9" font-weight="700" fill="hsl(var(--foreground))">high ticket, lumpy — upside layer</text>
    <rect x="50" y="219" width="280" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" stroke-dasharray="5 4"/>
    <text x="190" y="240" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PITCH-ADJACENT · RECURRING</text>
    <text x="190" y="258" font-size="8.5" fill="hsl(var(--muted-foreground))">experience tours · "play on a pro net" packages ·</text>
    <text x="190" y="272" font-size="8.5" fill="hsl(var(--muted-foreground))">corporate cricket leagues on outfield practice</text>
    <text x="190" y="286" font-size="8.5" fill="hsl(var(--muted-foreground))">wickets (curator-approved)</text>
    <rect x="390" y="219" width="280" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" stroke-dasharray="5 4"/>
    <text x="530" y="240" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PITCH RISK · PER-EVENT — CAREFUL</text>
    <text x="530" y="258" font-size="8.5" fill="hsl(var(--muted-foreground))">large festivals on the outfield · non-cricket sports —</text>
    <text x="530" y="272" font-size="8.5" fill="hsl(var(--muted-foreground))">only with a full turf-replacement bond priced in,</text>
    <text x="530" y="286" font-size="8.5" fill="hsl(var(--muted-foreground))">never in season</text>
  </g>
  <path d="M360 313 L360 322 M85 322 L637 322 M85 322 L85 336 M223 322 L223 336 M361 322 L361 336 M499 322 L499 336 M637 322 L637 336" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="20" y="338" width="130" height="64" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="85" y="356" font-size="9" font-weight="700" fill="hsl(var(--foreground))">BOXES</text>
    <text x="85" y="372" font-size="8" fill="hsl(var(--muted-foreground))">60 × ₹18L/yr</text>
    <text x="85" y="390" font-size="10" font-weight="700" fill="hsl(var(--primary))">₹10.8 cr</text>
    <rect x="158" y="338" width="130" height="64" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="223" y="356" font-size="9" font-weight="700" fill="hsl(var(--foreground))">RETAIL</text>
    <text x="223" y="372" font-size="8" fill="hsl(var(--muted-foreground))">8,000 m² × ₹70/mo</text>
    <text x="223" y="390" font-size="10" font-weight="700" fill="hsl(var(--primary))">₹6.7 cr</text>
    <rect x="296" y="338" width="130" height="64" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="361" y="356" font-size="9" font-weight="700" fill="hsl(var(--foreground))">PARKING</text>
    <text x="361" y="372" font-size="8" fill="hsl(var(--muted-foreground))">3,000 × ₹3k × 60%</text>
    <text x="361" y="390" font-size="10" font-weight="700" fill="hsl(var(--primary))">₹6.5 cr</text>
    <rect x="434" y="338" width="130" height="64" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="499" y="356" font-size="9" font-weight="700" fill="hsl(var(--foreground))">ACADEMY</text>
    <text x="499" y="372" font-size="8" fill="hsl(var(--muted-foreground))">800 × ₹60,000</text>
    <text x="499" y="390" font-size="10" font-weight="700" fill="hsl(var(--primary))">₹4.8 cr</text>
    <rect x="572" y="338" width="130" height="64" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="637" y="356" font-size="9" font-weight="700" fill="hsl(var(--foreground))">NAMING</text>
    <text x="637" y="372" font-size="8" fill="hsl(var(--muted-foreground))">metro-stadium rights</text>
    <text x="637" y="390" font-size="10" font-weight="700" fill="hsl(var(--primary))">₹8–10 cr</text>
  </g>
  <path d="M85 402 L85 416 M223 402 L223 416 M361 402 L361 416 M499 402 L499 416 M637 402 L637 416 M85 416 L637 416 M360 416 L360 430" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="432" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="451" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹37–39 CR RECURRING vs ₹35 CR BASE — COVERED ✓</text>
  <text x="360" y="468" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">before a single concert · every lease carries 20–25 blackout days · box fit-outs reversible</text>
  <text x="360" y="506" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Cricket administrators should not run malls and parking lots — lease to specialist operators on revenue-share.</text>
  <text x="360" y="524" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The association governs; operators operate.</text>
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
