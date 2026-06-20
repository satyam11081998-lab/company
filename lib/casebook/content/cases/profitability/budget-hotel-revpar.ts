import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const budgetHotelRevpar: Page = {
  slug: 'cases/profitability/budget-hotel-revpar',
  title: 'The Budget Hotel Chain\'s Weekend Problem',
  subtitle: 'Same rooms, same rates — and a profit decline nobody can locate.',
  kind: 'case',
  meta: { difficulty: 'challenging', caseType: 'Profitability', readingTimeMin: 11, tags: ['hospitality', 'segmentation'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client operates 60 budget business hotels (~70 rooms each) across Indian tier-1 and tier-2 cities. Average room rate and total occupancy are both *unchanged* year-on-year, yet property-level profit fell 15%. The CFO insists the numbers "don\'t add up." Find what everyone is missing.' },
    ]},
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Flat rate, flat occupancy, falling profit — so either revenue has a composition problem the averages hide, or costs rose. First: did total revenue actually stay flat, or only RevPAR?', note: 'When averages look fine but profit isn\'t, suspect the averages. This case is an averages trap from the first line.' },
        { speaker: 'interviewer', md: 'Total room revenue is flat to the rupee. Non-room revenue is negligible. And total operating cost rose about 9%.' },
        { speaker: 'candidate', md: 'Then the case is: why did cost rise 9% with identical occupancy? Unless… the *pattern* of occupancy changed. The same annual occupancy can be smooth or spiky — and spiky is expensive. May I test that?' },
        { speaker: 'interviewer', md: 'Go on — what would "spiky" mean here and why would it cost more?' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Distinguished flat total revenue from flat RevPAR and put the occupancy *pattern* — smooth versus spiky — on trial as the hidden cost driver.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'prose', md: 'The structure splits cost growth into price effects (wages, utilities tariffs) and volume/pattern effects (how demand distributes across days). The unlock is recognizing that **occupancy variance**, not occupancy level, drives staffing and utility costs.' },
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree splitting a 9 percent hotel cost rise into input prices and demand pattern, with weekday occupancy re-sorting from 78 to 94 percent and weekend from 62 to 38 percent, a two-lever sizing row of 55 and 24 lakh per week, and a 41 crore verdict bar', caption: 'Same ~70% average, completely re-sorted week — 78/62 became 94/38. The two-lever row sizes the way back.', svg: `<svg viewBox="0 0 720 490" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="bhng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#bhng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">WHY DID COST RISE 9%?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">rate flat · occupancy flat (~70% avg) — interrogate the shape, not the level</text>
  <path d="M360 60 L360 70 M125 70 L477 70 M125 70 L125 82 M477 70 L477 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="84" width="190" height="42" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="125" y="101" font-size="10" font-weight="700" fill="hsl(var(--foreground))">INPUT PRICES</text>
    <text x="125" y="117" font-size="8.5" fill="hsl(var(--muted-foreground))">wages · tariffs · supplies</text>
    <rect x="347" y="84" width="260" height="42" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="477" y="101" font-size="10" font-weight="700" fill="hsl(var(--primary))">DEMAND PATTERN — the unlock</text>
    <text x="477" y="117" font-size="8.5" fill="hsl(var(--muted-foreground))">same average, different week shape</text>
  </g>
  <path d="M125 126 L125 152 M477 126 L477 138 M360 138 L595 138 M360 138 L360 152 M595 138 L595 152" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="125" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PRICE DRIFT</text>
    <text x="125" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">no step-change found</text>
    <text x="125" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">that explains 9% —</text>
    <text x="125" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">the hunt moves right</text>
    <text x="125" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">secondary</text>
    <text x="125" y="256" font-size="8" fill="hsl(var(--muted-foreground))">park unless data returns here</text>
    <rect x="265" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">WEEKDAY · TUE–THU</text>
    <text x="360" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">corporate travel recovered:</text>
    <text x="360" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">contract housekeeping, overtime,</text>
    <text x="360" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">walking overbooked guests</text>
    <text x="360" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">78% → 94%</text>
    <text x="360" y="256" font-size="8" fill="hsl(var(--muted-foreground))">selling out at a flat rate = underpriced</text>
    <rect x="500" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="595" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">WEEKEND · FRI–SUN</text>
    <text x="595" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">leisure moved to amenity-rich</text>
    <text x="595" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">rivals; fixed staffing + energy</text>
    <text x="595" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">floor still fully loaded</text>
    <text x="595" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">62% → 38%</text>
    <text x="595" y="256" font-size="8" fill="hsl(var(--muted-foreground))">a third of rooms carry the cost base</text>
  </g>
  <path d="M125 264 L125 282 M360 264 L360 282 M595 264 L595 282 M125 282 L595 282 M215 282 L215 298 M505 282 L505 298" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="300" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="318" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LEVER 1 · PRICE THE PEAK</text>
    <text x="215" y="334" font-size="8.5" fill="hsl(var(--muted-foreground))">60 × 70 rooms × 3 nights × 94% × ₹300</text>
    <text x="215" y="350" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹55L / week</text>
    <rect x="385" y="300" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="318" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LEVER 2 · DE-COST THE TROUGH</text>
    <text x="505" y="334" font-size="8.5" fill="hsl(var(--muted-foreground))">flexible rosters + floor shutdown ≈ ₹40k/hotel</text>
    <text x="505" y="350" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹24L / week</text>
  </g>
  <path d="M215 358 L215 376 M505 358 L505 376 M215 376 L505 376 M360 376 L360 390" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="170" y="392" width="380" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="411" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹41 CR / YEAR — REVERSES THE 15% DECLINE</text>
  <text x="360" y="428" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">dynamic weekday pricing · cost-side weekends · product-fit segments, not 30% discounts</text>
  <text x="360" y="468" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Cost is built for the peak; revenue is earned on the average. A hotel staffed for Tuesday at 94% earns Saturday at 38%.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Sharp. Here\'s the data: two years ago weekday occupancy was 78% and weekend 62%. Now it\'s 94% weekday, 38% weekend. Average: still ~70%. Corporate travel recovered; leisure guests moved to newer competitors with pools and family amenities.' },
        { speaker: 'candidate', md: 'So the averages concealed a complete re-sorting of the week. Costs rose because peaks are expensive twice over: weekdays need contract housekeeping, overtime, and occasionally "walking" overbooked guests to other hotels; weekends still carry the fixed staffing and energy floor with a third of the rooms paying for it.' },
        { speaker: 'interviewer', md: 'The CEO\'s instinct is to cut weekend rates 30% to win leisure travellers back. React.' },
        { speaker: 'candidate', md: 'I\'d push back. Our product is business-shaped — small rooms, work desks, no family amenities. A 30% discount won\'t conjure leisure demand we structurally can\'t serve; it mostly cheapens the brand. Better: monetize the weekday peak with dynamic pricing — we\'re selling out Tuesday at a flat rate, which means we\'re underpriced — and attack weekend economics on the cost side, or find weekend demand that *fits* the product: trainings, exam-center stays, crew contracts.', note: 'Rejects the anchor with a reason rooted in product-market fit, then redirects both branches.' },
      ]},
      { type: 'reveal', summary: 'Reveal the worked numbers', blocks: [
        { type: 'mathBox', title: 'Sizing the two moves', md: 'Weekday upside: 60 hotels × 70 rooms × 3 nights × 94% × ₹300 dynamic premium ≈ **₹55 lakh/week**\nWeekend cost fix: flexible staffing + floor-wise shutdown ≈ ₹40,000/hotel/weekend ≈ **₹24 lakh/week**\nCombined ≈ ₹41 cr/year — more than reverses the 15% profit decline.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend', items: [
        'Introduce dynamic weekday pricing (the chain is structurally underpriced Tue–Thu at 94% occupancy).',
        'Re-engineer weekends on the cost side: flexible staffing rosters, consolidating guests onto fewer floors, energy setbacks.',
        'Chase product-fit weekend segments — corporate trainings, exam candidates, airline/rail crew block bookings — instead of discount-led leisure.',
        'Replace average-occupancy reporting with **day-of-week occupancy and contribution** at the board level.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Averages hide re-distributions. When level metrics are flat but profit moves, interrogate the **shape** — by day, by segment, by SKU. And remember: cost is built for the peak; revenue is earned on the average.' },
    ]},
  ],
};
