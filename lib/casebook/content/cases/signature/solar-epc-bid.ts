import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const solarEpcBid: Page = {
  slug: 'cases/signature/solar-epc-bid',
  title: 'Bid or No-Bid: The 400 MW Solar Tender',
  subtitle: 'Pricing under uncertainty, capacity trade-offs, and a rival who bids crazy.',
  kind: 'case',
  meta: { difficulty: 'challenging', caseType: 'Signature · Pricing × Risk', readingTimeMin: 11, tags: ['infrastructure', 'bidding', 'blended'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client is a solar EPC (engineering-procurement-construction) firm — ₹2,200 crore revenue, order book 1.4× revenue. A state utility has floated a 400 MW tender worth roughly ₹1,600 crore, awarded to the lowest technically-qualified bidder. Two questions from the CEO: should we bid at all, and if yes, at what price — knowing one aggressive rival has been winning tenders at prices the client "cannot understand."' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Bid decisions have three layers: do we *want* it (strategic value + capacity), can we *win* it (competitive read), and what price keeps it worth winning (economics + risk pricing). First: at 1.4× book-to-revenue, do we have execution capacity for a 1,600-crore, presumably 18-month project without starving existing commitments?', note: 'Capacity first — a tender you can\'t execute profitably is a trap regardless of price.' },
        { speaker: 'interviewer', md: 'Tight but feasible: it would push the book to ~2.1×, requiring one new project-management vertical and subcontracting ~30% of installation. And the strategic angle: the client has never worked with this state utility, which has a 3 GW pipeline coming.' },
        { speaker: 'candidate', md: 'So strategic value is real — this is partly a market-entry bid, which justifies a thinner margin but **not** a negative one. Now the economics: module costs are ~60% of an EPC bid and volatile, and the tender presumably fixes our price for 18 months. The risk architecture matters as much as the margin: who carries module price risk, land delays, grid-connection delays?' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Bid decision structure with three gates: strategic fit and capacity, competitive read including the irrational rival, and price built from cost plus risk pricing plus strategic discount', caption: 'Three gates, in order. The rival\'s "crazy" bids get explained, not envied, at gate two.', svg: `<svg viewBox="0 0 720 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="secs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="seng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <marker id="sear" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>
  <g text-anchor="middle">
    <rect x="40" y="30" width="190" height="96" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#secs)"/>
    <text x="135" y="52" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">GATE 1 · WANT IT?</text>
    <text x="135" y="70" font-size="9" fill="hsl(var(--muted-foreground))">capacity: book 1.4× → 2.1×</text>
    <text x="135" y="84" font-size="9" fill="hsl(var(--muted-foreground))">· 30% subcontract need</text>
    <text x="135" y="98" font-size="9" fill="hsl(var(--muted-foreground))">strategic: 3 GW utility pipeline</text>
    <text x="135" y="115" font-size="9" font-weight="700" fill="hsl(var(--foreground))">YES, with conditions</text>
    <rect x="265" y="30" width="190" height="96" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#secs)"/>
    <text x="360" y="52" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">GATE 2 · CAN WE WIN?</text>
    <text x="360" y="70" font-size="9" fill="hsl(var(--muted-foreground))">decode the rival: module tie-ups?</text>
    <text x="360" y="84" font-size="9" fill="hsl(var(--muted-foreground))">in-house installation? buying the</text>
    <text x="360" y="98" font-size="9" fill="hsl(var(--muted-foreground))">market? change-order recovery game?</text>
    <text x="360" y="115" font-size="9" font-weight="700" fill="hsl(var(--foreground))">explain, then decide</text>
    <rect x="490" y="30" width="190" height="96" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#secs)"/>
    <text x="585" y="52" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">GATE 3 · AT WHAT PRICE?</text>
    <text x="585" y="70" font-size="9" fill="hsl(var(--muted-foreground))">base cost + risk premiums</text>
    <text x="585" y="84" font-size="9" fill="hsl(var(--muted-foreground))">(module volatility · delay LDs)</text>
    <text x="585" y="98" font-size="9" fill="hsl(var(--muted-foreground))">− strategic entry discount</text>
    <text x="585" y="115" font-size="9" font-weight="700" fill="hsl(var(--foreground))">floor = walk-away, written down</text>
  </g>
  <path d="M230 78 L259 78" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#sear)"/>
  <path d="M455 78 L484 78" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#sear)"/>
  <rect x="90" y="170" width="540" height="120" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="360" y="192" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">THE PRICE BUILD (₹ CR)</text>
  <text x="120" y="215" font-size="10" fill="hsl(var(--foreground))">Base cost (modules 60% hedged via supplier MoU + BoS + install + PM)</text>
  <text x="600" y="215" text-anchor="end" font-size="10" font-weight="600" fill="hsl(var(--foreground))">1,385</text>
  <text x="120" y="235" font-size="10" fill="hsl(var(--foreground))">+ Risk premiums: unhedged module 40% · LD exposure · monsoon float</text>
  <text x="600" y="235" text-anchor="end" font-size="10" font-weight="600" fill="hsl(var(--foreground))">+72</text>
  <text x="120" y="255" font-size="10" fill="hsl(var(--foreground))">+ Target margin 7% → − strategic entry discount (~2 pts, priced not vibes)</text>
  <text x="600" y="255" text-anchor="end" font-size="10" font-weight="600" fill="hsl(var(--foreground))">+73</text>
  <text x="120" y="277" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">BID ≈ ₹1,530 cr · WALK-AWAY FLOOR ≈ ₹1,490 cr</text>
  <text x="360" y="330" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">If the rival bids below your explained-cost floor, losing the tender is the profitable outcome.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Spend a minute on the rival. Their last three wins were 8–10% below everyone else.' },
        { speaker: 'candidate', md: 'Four rational explanations before assuming insanity: (1) a structural cost edge — captive module sourcing or an in-house install force versus our 30% subcontracting; (2) buying market share with investor money, deliberately; (3) the change-order game — bid low, recover margin through variations and claims, which utilities increasingly resist; (4) winner\'s-curse incompetence that will surface as defaults. The response differs: against (1) we fix our cost structure; against (2) and (4) we wait them out — capital and luck both run out; against (3) we compete on *credibility of delivery* with the utility\'s procurement team, who\'ve been burned before. What we never do is match a price we can\'t explain.', note: 'Decoding an "irrational" competitor into four testable hypotheses is the signature move of this case.' },
        { speaker: 'interviewer', md: 'The CEO says: "Take 3% margin — it\'s worth it for the relationship." Your floor says no. Final answer?' },
        { speaker: 'candidate', md: 'Hold the ₹1,490 floor and here\'s the framing: the relationship argument is already *in* the price — we gave up two margin points for entry. Below the floor, every additional crore of "relationship" is bought with execution risk on a project where LDs and module volatility can turn 3% into −4% — and a delayed, penalized first project *destroys* the relationship we\'re buying. If we lose, we stay close to the utility, let the aggressive rival absorb the 18-month risk, and bid the next tranche of the 3 GW pipeline with proven discipline.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the CEO', items: [
        'Bid — strategic entry into a 3 GW pipeline justifies it — at ≈ ₹1,530 crore, with a written walk-away floor of ₹1,490 crore agreed by the board *before* bid day.',
        'De-risk the cost base first: lock a module-supply MoU covering ≥60% of requirement, and pre-qualify install subcontractors with back-to-back LD clauses.',
        'Run the rival diagnostic as real work, not gossip: if they have a structural cost edge, that\'s our next year\'s agenda regardless of this tender.',
        'If outbid below our floor: formally debrief with the utility, track the winner\'s execution, and position for tranche 2 — losing well is a strategy.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Bid cases braid pricing with risk architecture: the number is **cost + priced risk + margin − priced strategy**, and the floor is written down before emotions run. And when a rival\'s price looks crazy, decode it into hypotheses — the right response depends entirely on *which kind* of crazy it is.' },
    ]},
  ],
};
