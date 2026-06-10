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
      { type: 'svg', maxWidth: 680, ariaLabel: 'Cost decomposition tree for a pump manufacturer splitting cost of goods sold and operating expenses into six leaf buckets', caption: 'The ₹30-crore hunt — interrogate each leaf for "what changed in 18 months?"', svg: `<svg viewBox="0 0 680 300" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="apcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="apng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="230" y="16" width="220" height="46" rx="12" fill="url(#apng)" filter="url(#apcs)"/>
  <text x="340" y="36" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">TOTAL COST BASE</text>
  <text x="340" y="52" text-anchor="middle" font-size="9.5" fill="#b9c4d6">find the new ₹30 crore</text>
  <path d="M340 62 L340 78 M170 78 L510 78 M170 78 L170 94 M510 78 L510 94" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <rect x="70" y="96" width="200" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#apcs)"/>
  <text x="170" y="120" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">COGS</text>
  <rect x="410" y="96" width="200" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#apcs)"/>
  <text x="510" y="120" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">BELOW THE LINE</text>
  <path d="M170 136 L170 150 M60 150 L280 150 M60 150 L60 164 M170 150 L170 164 M280 150 L280 164" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M510 136 L510 150 M400 150 L620 150 M400 150 L400 164 M510 150 L510 164 M620 150 L620 164" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="15" y="166" width="90" height="44" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="60" y="185" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">MATERIALS</text>
    <text x="60" y="199" font-size="8.5" fill="hsl(var(--muted-foreground))">copper · steel</text>
    <rect x="125" y="166" width="90" height="44" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="170" y="185" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LABOUR</text>
    <text x="170" y="199" font-size="8.5" fill="hsl(var(--muted-foreground))">wages · overtime</text>
    <rect x="235" y="166" width="90" height="44" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="280" y="185" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">ENERGY</text>
    <text x="280" y="199" font-size="8.5" fill="hsl(var(--muted-foreground))">power · fuel</text>
    <rect x="355" y="166" width="90" height="44" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="400" y="185" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">WARRANTY</text>
    <text x="400" y="199" font-size="8.5" fill="hsl(var(--muted-foreground))">claims · service</text>
    <rect x="465" y="166" width="90" height="44" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="510" y="185" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LOGISTICS</text>
    <text x="510" y="199" font-size="8.5" fill="hsl(var(--muted-foreground))">freight · depots</text>
    <rect x="575" y="166" width="90" height="44" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="620" y="185" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SG&amp;A</text>
    <text x="620" y="199" font-size="8.5" fill="hsl(var(--muted-foreground))">sales · admin</text>
  </g>
  <text x="340" y="250" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">Ask one question per leaf: "what changed in the last 18 months?" — then chase the leaf that answers.</text>
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
