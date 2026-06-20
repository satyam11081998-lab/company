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
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Bid decisions have three layers: do we *want* it (strategic value + capacity), can we *win* it (competitive read), and what price keeps it worth winning (economics + risk pricing). First: at 1.4× book-to-revenue, do we have execution capacity for a 1,600-crore, presumably 18-month project without starving existing commitments?', note: 'Capacity first — a tender you can\'t execute profitably is a trap regardless of price.' },
        { speaker: 'interviewer', md: 'Tight but feasible: it would push the book to ~2.1×, requiring one new project-management vertical and subcontracting ~30% of installation. And the strategic angle: the client has never worked with this state utility, which has a 3 GW pipeline coming.' },
        { speaker: 'candidate', md: 'So strategic value is real — this is partly a market-entry bid, which justifies a thinner margin but **not** a negative one. Now the economics: module costs are ~60% of an EPC bid and volatile, and the tender presumably fixes our price for 18 months. The risk architecture matters as much as the margin: who carries module price risk, land delays, grid-connection delays?' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Structured the bid as want-it / win-it / price-it, recognising the strategic market-entry value that justifies a thin — but not negative — margin.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier bid decision tree: three gates with numbers, a four-hypothesis rival-decode tier covering cost edge, buying share, change-order game and winners curse each with its counter-move, the price build from 1,385 plus 72 plus 73 crore, and a bid-1,530 floor-1,490 verdict bar', caption: 'Three gates, then the rival decoded into four testable hypotheses — each with its counter-move — before any number is written down.', svg: `<svg viewBox="0 0 720 565" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="seng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#seng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">BID OR NO-BID: ₹1,600 CR TENDER</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">lowest technically-qualified bidder wins — three gates, in order</text>
  <path d="M360 60 L360 70 M125 70 L595 70 M125 70 L125 82 M360 70 L360 82 M595 70 L595 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="84" width="190" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="125" y="104" font-size="9" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">GATE 1 · WANT IT?</text>
    <text x="125" y="121" font-size="8.5" fill="hsl(var(--muted-foreground))">capacity: book 1.4× → 2.1×,</text>
    <text x="125" y="135" font-size="8.5" fill="hsl(var(--muted-foreground))">30% subcontracting · strategic:</text>
    <text x="125" y="149" font-size="8.5" fill="hsl(var(--muted-foreground))">3 GW utility pipeline behind it</text>
    <text x="125" y="171" font-size="10" font-weight="700" fill="hsl(var(--primary))">YES, with conditions</text>
    <rect x="265" y="84" width="190" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="104" font-size="9" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">GATE 2 · CAN WE WIN?</text>
    <text x="360" y="121" font-size="8.5" fill="hsl(var(--muted-foreground))">the rival wins 8–10% below</text>
    <text x="360" y="135" font-size="8.5" fill="hsl(var(--muted-foreground))">everyone — explain it before</text>
    <text x="360" y="149" font-size="8.5" fill="hsl(var(--muted-foreground))">deciding anything</text>
    <text x="360" y="171" font-size="10" font-weight="700" fill="hsl(var(--primary))">decode, never envy ↓</text>
    <rect x="500" y="84" width="190" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="104" font-size="9" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">GATE 3 · AT WHAT PRICE?</text>
    <text x="595" y="121" font-size="8.5" fill="hsl(var(--muted-foreground))">base cost + priced risk</text>
    <text x="595" y="135" font-size="8.5" fill="hsl(var(--muted-foreground))">(module volatility · delay LDs)</text>
    <text x="595" y="149" font-size="8.5" fill="hsl(var(--muted-foreground))">− strategic entry discount</text>
    <text x="595" y="171" font-size="10" font-weight="700" fill="hsl(var(--primary))">floor written before bid day</text>
  </g>
  <path d="M125 184 L125 200 M360 184 L360 200 M595 184 L595 200 M125 200 L595 200 M115 200 L115 214 M278 200 L278 214 M442 200 L442 214 M605 200 L605 214" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="35" y="216" width="160" height="92" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="115" y="234" font-size="9" font-weight="700" fill="hsl(var(--foreground))">① COST EDGE</text>
    <text x="115" y="250" font-size="8" fill="hsl(var(--muted-foreground))">captive module sourcing,</text>
    <text x="115" y="263" font-size="8" fill="hsl(var(--muted-foreground))">in-house install force</text>
    <text x="115" y="284" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">counter: fix our costs</text>
    <rect x="198" y="216" width="160" height="92" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="278" y="234" font-size="9" font-weight="700" fill="hsl(var(--foreground))">② BUYING SHARE</text>
    <text x="278" y="250" font-size="8" fill="hsl(var(--muted-foreground))">deliberate, with</text>
    <text x="278" y="263" font-size="8" fill="hsl(var(--muted-foreground))">investor money</text>
    <text x="278" y="284" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">counter: wait them out</text>
    <rect x="362" y="216" width="160" height="92" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="442" y="234" font-size="9" font-weight="700" fill="hsl(var(--foreground))">③ CHANGE-ORDER GAME</text>
    <text x="442" y="250" font-size="8" fill="hsl(var(--muted-foreground))">bid low, recover margin via</text>
    <text x="442" y="263" font-size="8" fill="hsl(var(--muted-foreground))">variations and claims</text>
    <text x="442" y="284" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">counter: sell delivery credibility</text>
    <rect x="525" y="216" width="160" height="92" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="605" y="234" font-size="9" font-weight="700" fill="hsl(var(--foreground))">④ WINNER'S CURSE</text>
    <text x="605" y="250" font-size="8" fill="hsl(var(--muted-foreground))">incompetence that will</text>
    <text x="605" y="263" font-size="8" fill="hsl(var(--muted-foreground))">surface as defaults</text>
    <text x="605" y="284" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">counter: let them absorb it</text>
  </g>
  <path d="M115 308 L115 322 M278 308 L278 322 M442 308 L442 322 M605 308 L605 322 M115 322 L605 322 M360 322 L360 336" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <rect x="90" y="338" width="540" height="116" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="360" y="360" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">THE PRICE BUILD (₹ CR)</text>
  <text x="120" y="382" font-size="9.5" fill="hsl(var(--foreground))">Base cost (modules 60% hedged via supplier MoU + BoS + install + PM)</text>
  <text x="600" y="382" text-anchor="end" font-size="9.5" font-weight="600" fill="hsl(var(--foreground))">1,385</text>
  <text x="120" y="401" font-size="9.5" fill="hsl(var(--foreground))">+ Risk premiums: unhedged module 40% · LD exposure · monsoon float</text>
  <text x="600" y="401" text-anchor="end" font-size="9.5" font-weight="600" fill="hsl(var(--foreground))">+72</text>
  <text x="120" y="420" font-size="9.5" fill="hsl(var(--foreground))">+ Target margin 7% → − strategic entry discount (~2 pts, priced not vibes)</text>
  <text x="600" y="420" text-anchor="end" font-size="9.5" font-weight="600" fill="hsl(var(--foreground))">+73</text>
  <text x="360" y="442" text-anchor="middle" font-size="10" font-weight="700" fill="hsl(var(--primary))">the relationship argument is already in the price — two margin points of it</text>
  <path d="M360 454 L360 468" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="470" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="489" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">BID ≈ ₹1,530 CR · WRITTEN FLOOR ≈ ₹1,490 CR</text>
  <text x="360" y="506" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">module MoU ≥60% first · back-to-back LDs with subcontractors · if outbid below floor, debrief and position for tranche 2</text>
  <text x="360" y="544" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">If the rival bids below your explained-cost floor, losing the tender is the profitable outcome. Losing well is a strategy.</text>
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
