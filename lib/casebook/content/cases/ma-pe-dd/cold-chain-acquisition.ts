import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const coldChainAcquisition: Page = {
  slug: 'cases/ma-pe-dd/cold-chain-acquisition',
  title: 'The Parcel Giant Buys a Cold Chain',
  subtitle: 'A ₹450-crore acquisition pitch. Decide if the synergies are real.',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'M&A', readingTimeMin: 10, tags: ['synergies', 'logistics'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client is India\'s #2 express-parcel company (₹3,800 crore revenue). An investment bank has pitched the acquisition of a regional cold-chain logistics player — 95 reefer trucks, 6 cold warehouses in the South, ₹260 crore revenue, ₹28 crore EBITDA — at an asking price of ₹450 crore. The board wants your view in three weeks.' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Acquisitions need three tests: standalone value (is the asset good?), synergy value (is it worth more to *us*?), and price versus both. But the prior question — what\'s the strategic intent? Is the client buying growth, capability, or defence against the #1 player?' },
        { speaker: 'interviewer', md: 'Capability. Quick-commerce and pharma clients keep asking the client for cold delivery; it has none. Building greenfield was estimated at 4 years and ₹600 crore to reach equivalent scale.', note: 'The build-vs-buy benchmark (₹600 cr, 4 yrs) is gold: it bounds what "control of this capability" is worth before any DCF.' },
        { speaker: 'candidate', md: 'So buy-vs-build already favours buying *if* this asset is healthy: ₹450 crore now versus ₹600 crore and four lost years. My structure: standalone quality of the target, synergies — both revenue and cost, each sized and probability-weighted — then integration risks, then the price verdict.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 700, ariaLabel: 'M&A evaluation structure: standalone value, revenue and cost synergies, integration risk, against asking price', caption: 'Value the target three times: alone, in our hands, and against the cheque.', svg: `<svg viewBox="0 0 700 340" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cccs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="ccng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="240" y="14" width="220" height="44" rx="12" fill="url(#ccng)" filter="url(#cccs)"/>
  <text x="350" y="34" text-anchor="middle" font-size="12" font-weight="700" fill="#ffffff">IS ₹450 CR A GOOD CHEQUE?</text>
  <text x="350" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">vs build: ₹600 cr + 4 years</text>
  <path d="M350 58 L350 76 M130 76 L570 76 M130 76 L130 92 M350 76 L350 92 M570 76 L570 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <g text-anchor="middle">
    <rect x="30" y="94" width="200" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cccs)"/>
    <text x="130" y="115" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">1 · STANDALONE</text>
    <text x="130" y="133" font-size="9" fill="hsl(var(--muted-foreground))">growth &amp; margin trend ·</text>
    <text x="130" y="147" font-size="9" fill="hsl(var(--muted-foreground))">client concentration · fleet age ·</text>
    <text x="130" y="161" font-size="9" fill="hsl(var(--muted-foreground))">warehouse lease terms</text>
    <text x="130" y="178" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">≈ ₹28 cr × 12 = ₹336 cr</text>
    <rect x="250" y="94" width="200" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#cccs)"/>
    <text x="350" y="115" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">2 · SYNERGIES</text>
    <text x="350" y="133" font-size="9" fill="hsl(var(--muted-foreground))">REVENUE: cross-sell cold to parcel</text>
    <text x="350" y="147" font-size="9" fill="hsl(var(--muted-foreground))">clients · national pharma contracts</text>
    <text x="350" y="161" font-size="9" fill="hsl(var(--muted-foreground))">COST: line-haul + last-mile overlap</text>
    <text x="350" y="178" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">size × probability, each</text>
    <rect x="470" y="94" width="200" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cccs)"/>
    <text x="570" y="115" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">3 · RISKS / DD</text>
    <text x="570" y="133" font-size="9" fill="hsl(var(--muted-foreground))">founder-dependent client book ·</text>
    <text x="570" y="147" font-size="9" fill="hsl(var(--muted-foreground))">driver attrition · compliance of</text>
    <text x="570" y="161" font-size="9" fill="hsl(var(--muted-foreground))">cold certs · culture clash</text>
    <text x="570" y="178" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">what kills the deal?</text>
  </g>
  <rect x="120" y="220" width="460" height="48" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="350" y="240" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">VERDICT = STANDALONE + PROBABILITY-WEIGHTED SYNERGIES vs ₹450 CR</text>
  <text x="350" y="257" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">pay for the asset and *some* synergy — never pay for all of it</text>
  <text x="350" y="310" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">The seller's banker priced the synergies into the ask. Your job is to take them back out.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Work the synergies. The client has 1,100 corporate accounts; the bank claims 8% would buy cold-chain services averaging ₹40 lakh a year each. Cost side: 30 of the target\'s line-haul routes overlap with the client\'s network, ₹35 lakh annual saving per overlapping route.' },
        { speaker: 'candidate', md: 'Revenue claim: 88 accounts × ₹40 lakh = ₹35 crore of new revenue — at the target\'s ~11% margin, ~₹4 crore EBITDA. But banker cross-sell rates are fantasy; haircut to 3–4% adoption: ~₹1.5–2 crore EBITDA, ramping over 3 years. Cost: 30 routes × ₹35 lakh = ₹10.5 crore — these I\'d weight 70–80% because route consolidation is within our control: ~₹8 crore. Total credible synergy EBITDA ≈ **₹10 crore**, not the bank\'s ~₹15 crore.', note: 'Differential probability weighting: cost synergies (we control) get high weights; revenue synergies (customers decide) get savage haircuts.' },
        { speaker: 'interviewer', md: 'So is ₹450 crore fair?' },
        { speaker: 'candidate', md: 'Standalone: ₹28 crore at a 12× regional-logistics multiple ≈ ₹336 crore. Synergized: (28+10) × 12 ≈ ₹456 crore — the ask equals **full synergy value**, meaning the seller captures everything we\'d create. I\'d counter at ₹370–390 crore — standalone plus roughly half the cost synergies — and walk above ₹420 unless DD reveals upside. One more lens: even at ₹450 it beats the ₹600-crore greenfield, but "cheaper than the worst alternative" isn\'t the bar; creating value for our shareholders is.' },
      ]},
      { type: 'reveal', summary: 'Reveal the valuation bridge', blocks: [
        { type: 'mathBox', title: 'Bridge (12× EBITDA throughout)', md: 'Standalone: 28 × 12 = **₹336 cr**\n+ cost synergies: 8 × 12 × 50% shared = **+₹48 cr**\n+ revenue synergies: ~2 × 12 × 50% = **+₹12 cr**\nBid ceiling ≈ **₹396 cr** · opening ≈ ₹370 cr · walk-away ₹420 cr\nAsk ₹450 cr = seller keeps 100% of synergy value → reject as offered.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the board', items: [
        'Pursue the deal — capability logic and buy-vs-build both hold — but not at ₹450 crore; open at ₹370 crore, walk at ₹420.',
        'Make DD kill-or-confirm three things: client contracts surviving founder exit (key-man clauses), reefer fleet age/maintenance records, and pharma cold-cert compliance.',
        'Structure protection: 15–20% of consideration as earn-out tied to client retention at 24 months.',
        'Pre-plan integration around the 30 overlapping routes — the cost synergy is the only one we fully control, so capture it in the first year.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Value the target three times — standalone, synergized, and versus the ask — and probability-weight synergies by **who controls them**: cost synergies you control, revenue synergies the customer controls. Whoever pays full synergy value has transferred the deal\'s entire upside to the seller.' },
    ]},
  ],
};
