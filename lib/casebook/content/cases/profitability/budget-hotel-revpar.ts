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
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Flat rate, flat occupancy, falling profit — so either revenue has a composition problem the averages hide, or costs rose. First: did total revenue actually stay flat, or only RevPAR?', note: 'When averages look fine but profit isn\'t, suspect the averages. This case is an averages trap from the first line.' },
        { speaker: 'interviewer', md: 'Total room revenue is flat to the rupee. Non-room revenue is negligible. And total operating cost rose about 9%.' },
        { speaker: 'candidate', md: 'Then the case is: why did cost rise 9% with identical occupancy? Unless… the *pattern* of occupancy changed. The same annual occupancy can be smooth or spiky — and spiky is expensive. May I test that?' },
        { speaker: 'interviewer', md: 'Go on — what would "spiky" mean here and why would it cost more?' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'prose', md: 'The structure splits cost growth into price effects (wages, utilities tariffs) and volume/pattern effects (how demand distributes across days). The unlock is recognizing that **occupancy variance**, not occupancy level, drives staffing and utility costs.' },
      { type: 'svg', maxWidth: 720, ariaLabel: 'Tree splitting a hotel cost increase into input price effects and demand pattern effects, with demand pattern broken into weekday spike and weekend trough', caption: 'Same average occupancy, different week shape — the pattern branch is where this case hides.', svg: `<svg viewBox="0 0 720 350" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="bhcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="bhng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="250" y="16" width="220" height="46" rx="12" fill="url(#bhng)" filter="url(#bhcs)"/>
  <text x="360" y="36" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">WHY DID COST RISE 9%?</text>
  <text x="360" y="52" text-anchor="middle" font-size="9.5" fill="#b9c4d6">with flat revenue and flat occupancy</text>
  <path d="M360 62 L360 80 M190 80 L530 80 M190 80 L190 96 M530 80 L530 96" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <rect x="80" y="98" width="220" height="48" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#bhcs)"/>
  <text x="190" y="118" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">INPUT PRICES</text>
  <text x="190" y="135" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">wages · utilities tariffs · supplies</text>
  <rect x="420" y="98" width="220" height="48" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#bhcs)"/>
  <text x="530" y="118" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">DEMAND PATTERN</text>
  <text x="530" y="135" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">same average · different shape</text>
  <path d="M530 146 L530 162 M420 162 L640 162 M420 162 L420 178 M640 162 L640 178" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <rect x="345" y="180" width="150" height="58" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
  <text x="420" y="200" text-anchor="middle" font-size="10" font-weight="700" fill="hsl(var(--foreground))">WEEKDAY SPIKE</text>
  <text x="420" y="215" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">95%+ occupancy Tue–Thu →</text>
  <text x="420" y="227" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">contract staff · walked guests</text>
  <rect x="565" y="180" width="150" height="58" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
  <text x="640" y="200" text-anchor="middle" font-size="10" font-weight="700" fill="hsl(var(--foreground))">WEEKEND TROUGH</text>
  <text x="640" y="215" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">35% occupancy Fri–Sun →</text>
  <text x="640" y="227" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">fixed staff idle · energy floor</text>
  <rect x="120" y="270" width="480" height="46" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="360" y="289" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">INSIGHT: COST FOLLOWS PEAK DEMAND, REVENUE FOLLOWS AVERAGE DEMAND</text>
  <text x="360" y="306" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">a hotel staffed for Tuesday's 95% earns Saturday's 35%</text>
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
