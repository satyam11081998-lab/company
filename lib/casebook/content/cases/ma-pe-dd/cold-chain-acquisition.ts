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
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Acquisitions need three tests: standalone value (is the asset good?), synergy value (is it worth more to *us*?), and price versus both. But the prior question — what\'s the strategic intent? Is the client buying growth, capability, or defence against the #1 player?' },
        { speaker: 'interviewer', md: 'Capability. Quick-commerce and pharma clients keep asking the client for cold delivery; it has none. Building greenfield was estimated at 4 years and ₹600 crore to reach equivalent scale.', note: 'The build-vs-buy benchmark (₹600 cr, 4 yrs) is gold: it bounds what "control of this capability" is worth before any DCF.' },
        { speaker: 'candidate', md: 'So buy-vs-build already favours buying *if* this asset is healthy: ₹450 crore now versus ₹600 crore and four lost years. My structure: standalone quality of the target, synergies — both revenue and cost, each sized and probability-weighted — then integration risks, then the price verdict.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Set the strategic intent and the three acquisition tests — standalone value, synergy value, and price — with buy-vs-build already favouring buy if the asset is healthy.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier M&A tree: standalone value 336 crore, synergies and risks, a synergy quantification tier haircutting revenue synergy to 2 crore and weighting cost synergy to 8 crore, a valuation bridge from 336 to a 396 crore ceiling versus the 450 crore ask, and an open-at-370 verdict bar', caption: 'Value it three times — and the quantification tier shows the haircuts: banker cross-sell to ₹2 cr, route overlap at 75% to ₹8 cr.', svg: `<svg viewBox="0 0 720 505" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="ccng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#ccng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">IS ₹450 CR A GOOD CHEQUE?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">vs build: ₹600 cr + 4 years — but "cheaper than the worst alternative" is not the bar</text>
  <path d="M360 60 L360 70 M125 70 L595 70 M125 70 L125 82 M360 70 L360 82 M595 70 L595 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="82" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="125" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">1 · STANDALONE</text>
    <text x="125" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">growth &amp; margin trend · client</text>
    <text x="125" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">concentration · fleet age ·</text>
    <text x="125" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">warehouse lease terms</text>
    <text x="125" y="169" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">₹28 cr × 12 = ₹336 cr</text>
    <text x="125" y="184" font-size="8" fill="hsl(var(--muted-foreground))">regional-logistics multiple</text>
    <rect x="265" y="82" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">2 · SYNERGIES</text>
    <text x="360" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">revenue: cross-sell cold to 1,100</text>
    <text x="360" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">parcel accounts · cost: 30</text>
    <text x="360" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">overlapping line-haul routes</text>
    <text x="360" y="169" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">size × probability</text>
    <text x="360" y="184" font-size="8" fill="hsl(var(--muted-foreground))">weighted by who controls them</text>
    <rect x="500" y="82" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">3 · RISKS / DD</text>
    <text x="595" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">founder-dependent client book ·</text>
    <text x="595" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">driver attrition · pharma cold-cert</text>
    <text x="595" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">compliance · culture clash</text>
    <text x="595" y="169" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">15–20% earn-out</text>
    <text x="595" y="184" font-size="8" fill="hsl(var(--muted-foreground))">tied to client retention at 24 mo</text>
  </g>
  <path d="M125 192 L125 208 M360 192 L360 208 M595 192 L595 208 M125 208 L595 208 M215 208 L215 224 M505 208 L505 224" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="226" width="240" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="244" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">REVENUE SYNERGY — savage haircut</text>
    <text x="215" y="260" font-size="8.5" fill="hsl(var(--muted-foreground))">bank: 88 accts × ₹40L = ₹35 cr rev (~₹4 cr EBITDA)</text>
    <text x="215" y="280" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">@ 3–4% adoption ≈ ₹2 cr</text>
    <rect x="385" y="226" width="240" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="244" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">COST SYNERGY — we control it</text>
    <text x="505" y="260" font-size="8.5" fill="hsl(var(--muted-foreground))">30 routes × ₹35L = ₹10.5 cr, weighted ~75%</text>
    <text x="505" y="280" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹8 cr EBITDA</text>
  </g>
  <path d="M215 290 L215 304 M505 290 L505 304 M135 304 L585 304 M135 304 L135 318 M360 304 L360 318 M585 304 L585 318" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="320" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="135" y="338" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">STANDALONE</text>
    <text x="135" y="354" font-size="8.5" fill="hsl(var(--muted-foreground))">28 × 12</text>
    <text x="135" y="370" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">₹336 cr</text>
    <rect x="255" y="320" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="338" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">+ SYNERGIES, 50% SHARED</text>
    <text x="360" y="354" font-size="8.5" fill="hsl(var(--muted-foreground))">cost +₹48 cr · revenue +₹12 cr</text>
    <text x="360" y="370" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">ceiling ≈ ₹396 cr</text>
    <rect x="480" y="320" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="585" y="338" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">THE ASK</text>
    <text x="585" y="354" font-size="8.5" fill="hsl(var(--muted-foreground))">₹450 cr = seller keeps 100% of synergy</text>
    <text x="585" y="370" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">reject as offered ✗</text>
  </g>
  <path d="M135 378 L135 394 M360 378 L360 394 M585 378 L585 394 M135 394 L585 394 M360 394 L360 408" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="410" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="429" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">OPEN AT ₹370 CR · WALK AT ₹420 — PURSUE, REPRICED</text>
  <text x="360" y="446" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">DD kill-or-confirm: key-man clauses · reefer fleet age · pharma cold-certs · capture route synergy in year 1</text>
  <text x="360" y="484" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The seller's banker priced the synergies into the ask. Your job is to take them back out.</text>
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
