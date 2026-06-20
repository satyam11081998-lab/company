import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const japaneseStationeryIndia: Page = {
  slug: 'cases/market-entry/japanese-stationery-india',
  title: 'A Japanese Stationery Giant Eyes India',
  subtitle: 'Premium pens in a price-sensitive market. Should they come?',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'Market Entry', readingTimeMin: 10, tags: ['consumer-goods', 'india-entry'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client is a Japanese stationery manufacturer — premium gel pens, mechanical pencils, and notebooks priced 3–5× Indian mass brands. They dominate Japan and Southeast Asia and now want a view: should they enter India, and if so, how?' },
    ]},
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Before sizing anything: what does the client want from India — revenue at scale, a manufacturing base, or a defensive move because competitors are entering? And what\'s their bar — payback period or share target?' },
        { speaker: 'interviewer', md: 'Revenue growth; Japan is a shrinking, ageing market. They\'d want a clear path to ₹500 crore annual revenue within 5 years to bother.', note: 'The "why" reframes everything: a growth-hungry client with a shrinking home market accepts more risk than an opportunistic one.' },
        { speaker: 'candidate', md: 'That target lets me work backwards. I\'ll take the standard spine: is the market attractive, can *they specifically* win, how to enter, and does the math reach ₹500 crore.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Pinned the India objective and the ₹500 crore bar, enabling a work-backwards market-entry spine (attractive → can-we-win → how → does the math reach the target).' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Three-tier decision tree for entering India: four questions each carrying numbers, market of 12,000 crore with premium at 8 percent equal to 960 growing to 1,450 crore, implied share math showing 500 crore equals 34 percent and is implausible, achievable case of 325 to 375 crore, and an enter-but-reset verdict bar', caption: 'The spine rebuilt with the numbers in every node — Q4 turns the ₹500 cr ambition into an implied 34% share, and kills it.', svg: `<svg viewBox="0 0 720 425" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="jsng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#jsng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">ENTER INDIA?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">client target: ₹500 cr by year 5 — test it before planning around it</text>
  <path d="M360 60 L360 70 M115 70 L605 70 M115 70 L115 80 M278 70 L278 80 M442 70 L442 80 M605 70 L605 80" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="35" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="115" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">Q1 · ATTRACTIVE?</text>
    <text x="115" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">₹12,000 cr market, +9%/yr</text>
    <text x="115" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">premium (&gt;₹100) = 8%</text>
    <text x="115" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">= ₹960 cr today</text>
    <text x="115" y="170" font-size="10" font-weight="700" fill="hsl(var(--primary))">→ ~₹1,450 cr (yr 5)</text>
    <text x="115" y="186" font-size="8" fill="hsl(var(--muted-foreground))">growth + premiumization</text>
    <rect x="198" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="278" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">Q2 · CAN WE WIN?</text>
    <text x="278" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">product edge real; zero brand</text>
    <text x="278" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">awareness, distribution gap;</text>
    <text x="278" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">ASP ₹150 retail</text>
    <text x="278" y="170" font-size="10" font-weight="700" fill="hsl(var(--primary))">₹90 realized</text>
    <text x="278" y="186" font-size="8" fill="hsl(var(--muted-foreground))">after trade margins + duties</text>
    <rect x="362" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="442" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">Q3 · HOW?</text>
    <text x="442" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">import &amp; distribute · JV ·</text>
    <text x="442" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">acquire · local mfg —</text>
    <text x="442" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">mode follows the segment</text>
    <text x="442" y="170" font-size="10" font-weight="700" fill="hsl(var(--primary))">JV opens ₹30–60 line</text>
    <text x="442" y="186" font-size="8" fill="hsl(var(--muted-foreground))">= the ₹4,000+ cr mid segment</text>
    <rect x="525" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="605" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">Q4 · DOES IT PAY?</text>
    <text x="605" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">reverse-engineer the target:</text>
    <text x="605" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">what share does ₹500 cr</text>
    <text x="605" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">imply by year 5?</text>
    <text x="605" y="170" font-size="10" font-weight="700" fill="hsl(var(--primary))">implied ~34% share</text>
    <text x="605" y="186" font-size="8" fill="hsl(var(--muted-foreground))">the question that decides the case</text>
  </g>
  <path d="M115 202 L115 220 M278 202 L278 220 M442 202 L442 220 M605 202 L605 220 M115 220 L605 220 M215 220 L215 236 M505 220 L505 236" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="238" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="256" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FEASIBILITY CHECK</text>
    <text x="215" y="272" font-size="8.5" fill="hsl(var(--muted-foreground))">₹500 ÷ ₹1,450 cr ≈ 34% vs 5–15% benchmark</text>
    <text x="215" y="288" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">implausible ✗</text>
    <rect x="385" y="238" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="256" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">ACHIEVABLE CASE</text>
    <text x="505" y="272" font-size="8.5" fill="hsl(var(--muted-foreground))">12% × ₹1,450 ≈ ₹175 cr + mid-JV ₹150–200 cr</text>
    <text x="505" y="288" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">₹325–375 cr stretch</text>
  </g>
  <path d="M215 296 L215 312 M505 296 L505 312 M215 312 L505 312 M360 312 L360 326" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="328" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="347" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">ENTER — BUT RESET THE TARGET TO ≈ ₹350 CR</text>
  <text x="360" y="364" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">premium import first (top 8 metros) → mid-segment JV for scale · walk away above 15% implied share</text>
  <text x="360" y="402" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Reverse-engineer the implied share before building any plan — "enter, but your target is wrong" is often the strongest answer.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Take Q1 and Q4 together. India\'s writing-instruments market is ≈ ₹12,000 crore retail, growing 9%. The premium segment (>₹100 price points) is about 8% of it. Your client\'s realistic price points average ₹150 at retail, ₹90 to the company after trade margins and duties.' },
        { speaker: 'candidate', md: 'So premium today ≈ ₹960 crore retail, maybe ₹1,400–1,500 crore in five years at current growth plus premiumization. A ₹500 crore retail-equivalent target would mean **a third of the entire premium segment** — implausible for a new entrant against entrenched premium lines. At company realization it\'s even harsher. The target as stated fails the feasibility check; the honest answer is "not at ₹500 crore in 5 years — here\'s what is achievable."', note: 'Candidates who force the client\'s number to "work" with heroic assumptions get marked down. Testing the target IS the answer.' },
        { speaker: 'interviewer', md: 'Good. The client then asks: is there any move that changes the math rather than just shrinking the target?' },
        { speaker: 'candidate', md: 'Two levers change the addressable pie. First, **stretch down**: a made-for-India line at ₹30–60 — Japanese quality positioning, Indian price point — which opens the ₹4,000+ crore mid segment; that likely needs local manufacturing or a JV for cost. Second, **B2B and institutional**: corporate gifting and modern-trade private label, which buys distribution fast. The realistic strategy is premium-first for brand, mid-segment JV for scale.' },
      ]},
      { type: 'reveal', summary: 'Reveal the sizing math', blocks: [
        { type: 'mathBox', title: 'Feasibility check', md: 'Premium segment: ₹12,000 cr × 8% = **₹960 cr** today → ~₹1,450 cr in yr 5\nTarget ₹500 cr ⇒ ~**34% segment share** by year 5 — vs typical successful-entrant benchmarks of 5–15%\nAchievable instead: 12% × ₹1,450 cr ≈ **₹175 cr premium** + mid-segment JV ≈ ₹150–200 cr ⇒ **₹325–375 cr** stretch case' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend', items: [
        'Enter — the market is attractive and the product edge is real — but reset the target: ₹350 crore by year 5 is the credible stretch case.',
        'Phase 1 (yrs 1–2): import-and-distribute premium range through modern trade + e-commerce in the top 8 metros; build brand with students and professionals.',
        'Phase 2 (yrs 2–4): JV or contract-manufacture a ₹30–60 made-for-India line to unlock the mid segment — this is where the volume lives.',
        'Walk away from any plan requiring >15% premium-segment share; that\'s the feasibility line.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'When the client hands you a revenue target, **reverse-engineer the implied market share** before building any entry plan. "Enter, but your target is wrong" is a perfectly strong — often the strongest — recommendation.' },
    ]},
  ],
};
