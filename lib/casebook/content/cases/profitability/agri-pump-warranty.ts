import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const agriPumpWarranty: Page = {
  slug: 'cases/profitability/agri-pump-warranty',
  title: 'The Pump Maker\'s Vanishing Margin',
  subtitle: 'Revenue steady, margins sliding for six quarters. A cost-side hunt.',
  kind: 'case',
  meta: { difficulty: 'easy', caseType: 'Profitability', readingTimeMin: 7, tags: ['cost-side', 'manufacturing'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client manufactures agricultural water pumps in Coimbatore, selling through 800 dealers across South India. Revenue has been steady at about ₹600 crore, but operating margin has slid from 14% to 9% over six quarters. Diagnose the cause and recommend fixes.' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Since revenue is steady, this looks cost-side — but let me confirm: is the revenue *composition* steady too? Same products, same prices, same dealer terms?' },
        { speaker: 'interviewer', md: 'Yes — prices, mix, and dealer margins are unchanged. The problem is below the revenue line.', note: 'The interviewer closes the revenue branch explicitly. Take the hint and go deep on cost — don\'t re-litigate revenue.' },
        { speaker: 'candidate', md: 'Then I\'ll decompose the cost base: COGS — materials, labour, energy; then below-the-line — logistics, warranty and service, SG&A. Margin lost 5 points on ₹600 crore, so I\'m hunting roughly ₹30 crore of new annual cost.' },
      ]},
      { type: 'callout', variant: 'tip', md: 'Convert margin points into **rupees** immediately (5 pts × ₹600 cr = ₹30 cr). It turns an abstract "margins fell" into a concrete hunt, and tells you what size of cause is even plausible.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Three-tier cost tree splitting COGS and below-the-line costs into six leaves with verdicts, warranty tripled from 6 to 19 crore, false-economy math row of 8 crore saving versus 13 crore claims and 4 crore overtime, net minus 9 crore verdict bar', caption: 'The ₹30-crore hunt resolved — five leaves flat, warranty tripled. The false-economy row prices the cheap winding at total cost.', svg: `<svg viewBox="0 0 720 455" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="apng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#apng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">TOTAL COST BASE</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">find the new ₹30 crore — 5 margin pts × ₹600 cr revenue</text>
  <path d="M360 60 L360 70 M190 70 L529 70 M190 70 L190 82 M529 70 L529 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="60" y="84" width="260" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="190" y="108" font-size="10" font-weight="700" fill="hsl(var(--foreground))">COGS</text>
    <rect x="399" y="84" width="260" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="529" y="108" font-size="10" font-weight="700" fill="hsl(var(--foreground))">BELOW THE LINE</text>
  </g>
  <path d="M190 124 L190 138 M77 138 L303 138 M77 138 L77 152 M190 138 L190 152 M303 138 L303 152" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M529 124 L529 138 M416 138 L642 138 M416 138 L416 152 M529 138 L529 152 M642 138 L642 152" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="25" y="154" width="105" height="92" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="77" y="172" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">MATERIALS</text>
    <text x="77" y="187" font-size="8" fill="hsl(var(--muted-foreground))">copper · steel</text>
    <text x="77" y="200" font-size="8" fill="hsl(var(--muted-foreground))">up slightly, hedged</text>
    <text x="77" y="226" font-size="10" font-weight="700" fill="hsl(var(--primary))">flat ✓</text>
    <rect x="138" y="154" width="105" height="92" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="190" y="172" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LABOUR</text>
    <text x="190" y="187" font-size="8" fill="hsl(var(--muted-foreground))">factory wages</text>
    <text x="190" y="200" font-size="8" fill="hsl(var(--muted-foreground))">% of revenue</text>
    <text x="190" y="226" font-size="10" font-weight="700" fill="hsl(var(--primary))">flat ✓</text>
    <rect x="251" y="154" width="105" height="92" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="303" y="172" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">ENERGY</text>
    <text x="303" y="187" font-size="8" fill="hsl(var(--muted-foreground))">power · fuel</text>
    <text x="303" y="200" font-size="8" fill="hsl(var(--muted-foreground))">% of revenue</text>
    <text x="303" y="226" font-size="10" font-weight="700" fill="hsl(var(--primary))">flat ✓</text>
    <rect x="364" y="154" width="105" height="92" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="416" y="172" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">WARRANTY</text>
    <text x="416" y="187" font-size="8" fill="hsl(var(--muted-foreground))">claims tripled —</text>
    <text x="416" y="200" font-size="8" fill="hsl(var(--muted-foreground))">cheap winding cohort</text>
    <text x="416" y="222" font-size="10" font-weight="700" fill="hsl(var(--primary))">₹6 → ₹19 cr</text>
    <text x="416" y="237" font-size="8" fill="hsl(var(--muted-foreground))">3× field failures</text>
    <rect x="477" y="154" width="105" height="92" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="529" y="172" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LOGISTICS</text>
    <text x="529" y="187" font-size="8" fill="hsl(var(--muted-foreground))">freight · depots</text>
    <text x="529" y="200" font-size="8" fill="hsl(var(--muted-foreground))">% of revenue</text>
    <text x="529" y="226" font-size="10" font-weight="700" fill="hsl(var(--primary))">flat ✓</text>
    <rect x="590" y="154" width="105" height="92" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="642" y="172" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SG&amp;A</text>
    <text x="642" y="187" font-size="8" fill="hsl(var(--muted-foreground))">sales · admin</text>
    <text x="642" y="200" font-size="8" fill="hsl(var(--muted-foreground))">% of revenue</text>
    <text x="642" y="226" font-size="10" font-weight="700" fill="hsl(var(--primary))">flat ✓</text>
  </g>
  <path d="M77 246 L77 264 M190 246 L190 264 M303 246 L303 264 M416 246 L416 264 M529 246 L529 264 M642 246 L642 264 M77 264 L642 264 M135 264 L135 278 M360 264 L360 278 M585 264 L585 278" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="280" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="135" y="298" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PROCUREMENT SAVING</text>
    <text x="135" y="314" font-size="8.5" fill="hsl(var(--muted-foreground))">₹400 × 200,000 pumps</text>
    <text x="135" y="330" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">+₹8 cr / yr</text>
    <rect x="255" y="280" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="298" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">NEW WARRANTY CLAIMS</text>
    <text x="360" y="314" font-size="8.5" fill="hsl(var(--muted-foreground))">₹19 cr − ₹6 cr baseline</text>
    <text x="360" y="330" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">−₹13 cr / yr</text>
    <rect x="480" y="280" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="585" y="298" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SERVICE OVERTIME</text>
    <text x="585" y="314" font-size="8.5" fill="hsl(var(--muted-foreground))">same failures, same cohort</text>
    <text x="585" y="330" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ −₹4 cr / yr</text>
  </g>
  <path d="M135 338 L135 352 M360 338 L360 352 M585 338 L585 352 M135 352 L585 352 M360 352 L360 364" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="366" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="385" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">NET −₹9 CR/YR — THE "SAVING" CAUSED THE SLIDE</text>
  <text x="360" y="402" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">revert/dual-source the winding · service the at-risk cohort pre-season · TCO gate on procurement</text>
  <text x="360" y="438" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Today's warranty line reflects decisions made 20 months ago — price every procurement saving at total cost, not unit cost.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Materials are up slightly but hedged. Labour, energy, logistics, SG&A — all flat as a % of revenue. Warranty and service costs have tripled, from ₹6 crore to ₹19 crore a year.' },
        { speaker: 'candidate', md: 'That\'s ₹13 crore of the ₹30 crore — a big piece, and tripling is a step-change, not drift. Warranty spikes usually trace to a cohort: a component change, a new supplier, or a new product line. Did anything enter the bill of materials about two years ago?', note: 'Cohort thinking — warranty cost today reflects units sold 1–2 years ago.' },
        { speaker: 'interviewer', md: 'Yes — the client switched to a cheaper motor-winding supplier 20 months ago, saving ₹400 per pump. Field failure rates on that cohort are 3× the old supplier\'s. The remaining gap, by the way, is volume-driven overtime in the service network — caused by the same failures.' },
        { speaker: 'candidate', md: 'So the "saving" is the cause of nearly the whole margin slide — the cheaper winding saves about ₹8 crore a year on 2 lakh pumps, but generates ₹13 crore in claims plus service overtime, and is quietly damaging the brand with farmers whose pumps fail mid-season.' },
      ]},
      { type: 'reveal', summary: 'Reveal the cost-benefit math', blocks: [
        { type: 'mathBox', title: 'The false economy', md: 'Saving: ₹400 × 200,000 pumps = **+₹8 cr/yr**\nNew warranty cost: ₹19 cr − ₹6 cr = **−₹13 cr/yr**\nService overtime: ≈ **−₹4 cr/yr**\nNet: **−₹9 cr/yr**, before any brand/dealer-confidence damage.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend', items: [
        'Revert (or dual-source) the motor winding; qualify the cheap supplier only if failure rates converge in accelerated-life testing.',
        'Proactively service the high-risk installed cohort before peak irrigation season — cheaper than failures plus reputation damage.',
        'Institute a total-cost-of-ownership gate on procurement: no component change ships without a warranty-impact projection.',
        'Track warranty cost **per cohort**, not per quarter, so the next bad batch is visible in months instead of six quarters.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Cost-side cases reward a clean MECE sweep — but the elegant move is **cohort logic**: today\'s warranty line reflects yesterday\'s decisions. And every procurement "saving" should be priced at total cost, not unit cost.' },
    ]},
  ],
};
