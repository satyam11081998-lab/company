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
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Before sizing anything: what does the client want from India — revenue at scale, a manufacturing base, or a defensive move because competitors are entering? And what\'s their bar — payback period or share target?' },
        { speaker: 'interviewer', md: 'Revenue growth; Japan is a shrinking, ageing market. They\'d want a clear path to ₹500 crore annual revenue within 5 years to bother.', note: 'The "why" reframes everything: a growth-hungry client with a shrinking home market accepts more risk than an opportunistic one.' },
        { speaker: 'candidate', md: 'That target lets me work backwards. I\'ll take the standard spine: is the market attractive, can *they specifically* win, how to enter, and does the math reach ₹500 crore.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Market entry spine for a premium stationery brand entering India: attractiveness, right to win, entry mode, and path to 500 crore', caption: 'The decision spine, loaded with this case\'s specifics — note Q4 is a reverse-engineered target, not an open question.', svg: `<svg viewBox="0 0 720 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="jscs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="jsng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="250" y="14" width="220" height="44" rx="12" fill="url(#jsng)" filter="url(#jscs)"/>
  <text x="360" y="34" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">ENTER INDIA?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">target: ₹500 cr by year 5</text>
  <path d="M360 58 L360 74 M115 74 L605 74 M115 74 L115 90 M278 74 L278 90 M442 74 L442 90 M605 74 L605 90" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <g text-anchor="middle">
    <rect x="35" y="92" width="160" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#jscs)"/>
    <text x="115" y="111" font-size="9" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">Q1 · ATTRACTIVE?</text>
    <text x="115" y="128" font-size="9.5" fill="hsl(var(--muted-foreground))">premium-segment size</text>
    <text x="115" y="142" font-size="9.5" fill="hsl(var(--muted-foreground))">· growth · competition</text>
    <text x="115" y="156" font-size="9.5" fill="hsl(var(--muted-foreground))">· import duties</text>
    <rect x="198" y="92" width="160" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#jscs)"/>
    <text x="278" y="111" font-size="9" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">Q2 · CAN WE WIN?</text>
    <text x="278" y="128" font-size="9.5" fill="hsl(var(--muted-foreground))">product superiority</text>
    <text x="278" y="142" font-size="9.5" fill="hsl(var(--muted-foreground))">· brand pull vs zero</text>
    <text x="278" y="156" font-size="9.5" fill="hsl(var(--muted-foreground))">awareness · distribution gap</text>
    <rect x="362" y="92" width="160" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#jscs)"/>
    <text x="442" y="111" font-size="9" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">Q3 · HOW?</text>
    <text x="442" y="128" font-size="9.5" fill="hsl(var(--muted-foreground))">export &amp; distribute</text>
    <text x="442" y="142" font-size="9.5" fill="hsl(var(--muted-foreground))">· JV with Indian brand</text>
    <text x="442" y="156" font-size="9.5" fill="hsl(var(--muted-foreground))">· acquire · local mfg</text>
    <rect x="525" y="92" width="160" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#jscs)"/>
    <text x="605" y="111" font-size="9" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">Q4 · DOES IT PAY?</text>
    <text x="605" y="128" font-size="9.5" fill="hsl(var(--muted-foreground))">reverse-engineer:</text>
    <text x="605" y="142" font-size="9.5" fill="hsl(var(--muted-foreground))">what share/doors/ASP</text>
    <text x="605" y="156" font-size="9.5" fill="hsl(var(--muted-foreground))">does ₹500 cr imply?</text>
  </g>
  <rect x="140" y="210" width="440" height="46" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="360" y="229" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">FEASIBILITY CHECK: IS THE IMPLIED SHARE PLAUSIBLE?</text>
  <text x="360" y="246" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">if ₹500 cr needs 40% of the premium segment, the answer is "not as planned"</text>
  <text x="360" y="300" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">With a hard revenue target, Q4 stops being "estimate profits" and becomes "sanity-check the ambition."</text>
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
