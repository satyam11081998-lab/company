import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const peEyecareChain: Page = {
  slug: 'cases/ma-pe-dd/pe-eyecare-chain',
  title: 'The PE Fund and the Eye Hospital Chain',
  subtitle: 'Five-year hold, 3× target. Underwrite the deal like an investor.',
  kind: 'case',
  meta: { difficulty: 'challenging', caseType: 'M&A', readingTimeMin: 11, tags: ['private-equity', 'healthcare', 'returns-math'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client is a mid-market PE fund evaluating a majority stake in an eye-care hospital chain: 18 centres, ₹240 crore revenue, ₹48 crore EBITDA, growing ~15% a year. The fund targets 3× money over a five-year hold. The deal team asks you to assess whether this asset can deliver, and what the value-creation plan must contain.' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'PE cases run on the returns equation: entry multiple, EBITDA growth, exit multiple, leverage. So first — what entry valuation is being discussed, and how much debt would the structure carry?' },
        { speaker: 'interviewer', md: 'Entry at 14× EBITDA — ₹672 crore enterprise value — with 40% debt funding. Assume exit at the same 14× unless you argue otherwise.', note: 'With entry = exit multiple and known leverage, the whole 3× question collapses into one number: how big must exit EBITDA be?' },
        { speaker: 'candidate', md: 'Then I can reverse-engineer the requirement before judging the asset. Equity in: 60% × 672 ≈ ₹403 crore. For 3×, equity out ≈ ₹1,210 crore. I\'ll work out what exit EBITDA that implies, then test whether this chain can plausibly get there — organic growth, new centres, margin work — and what could break it.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 700, ariaLabel: 'Private equity returns bridge from required exit equity back to required EBITDA, with three value-creation levers and key risks', caption: 'Reverse-engineer the requirement first; only then ask if the asset can meet it.', svg: `<svg viewBox="0 0 700 350" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="pecs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="peng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <g text-anchor="middle">
    <rect x="40" y="20" width="185" height="64" rx="10" fill="url(#peng)" filter="url(#pecs)"/>
    <text x="132" y="44" font-size="10" font-weight="700" fill="#ffffff">EQUITY IN ≈ ₹403 CR</text>
    <text x="132" y="62" font-size="9" fill="#b9c4d6">60% of 14 × ₹48 cr EV</text>
    <rect x="258" y="20" width="185" height="64" rx="10" fill="url(#peng)" filter="url(#pecs)"/>
    <text x="350" y="44" font-size="10" font-weight="700" fill="#ffffff">3× TARGET ≈ ₹1,210 CR</text>
    <text x="350" y="62" font-size="9" fill="#b9c4d6">equity value at exit, year 5</text>
    <rect x="476" y="20" width="185" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.75" filter="url(#pecs)"/>
    <text x="568" y="44" font-size="10" font-weight="700" fill="hsl(var(--primary))">EXIT EBITDA ≈ ₹98 CR</text>
    <text x="568" y="62" font-size="9" fill="hsl(var(--muted-foreground))">(1,210 + residual debt) ÷ 14</text>
  </g>
  <path d="M350 84 L350 110" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <rect x="150" y="112" width="400" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="350" y="137" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.03em" fill="hsl(var(--primary))">REQUIRED: ₹48 CR → ₹98 CR = 15.4% EBITDA CAGR</text>
  <path d="M180 152 L180 176 M350 152 L350 176 M520 152 L520 176" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="80" y="178" width="200" height="84" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#pecs)"/>
    <text x="180" y="199" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">SAME-CENTRE GROWTH</text>
    <text x="180" y="217" font-size="9" fill="hsl(var(--muted-foreground))">surgeries/centre · payor mix</text>
    <text x="180" y="231" font-size="9" fill="hsl(var(--muted-foreground))">(cash vs insurance) · optical retail</text>
    <text x="180" y="249" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">~8–10%/yr</text>
    <rect x="250" y="178" width="200" height="84" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#pecs)" transform="translate(0,0)"/>
    <rect x="250" y="178" width="200" height="84" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="350" y="199" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">NEW CENTRES</text>
    <text x="350" y="217" font-size="9" fill="hsl(var(--muted-foreground))">18 → 30 hub-and-spoke ·</text>
    <text x="350" y="231" font-size="9" fill="hsl(var(--muted-foreground))">tier-2 cataract demand · 24-mo ramp</text>
    <text x="350" y="249" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">+₹25–30 cr EBITDA by yr 5</text>
    <rect x="420" y="178" width="200" height="84" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="520" y="199" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">MARGIN WORK</text>
    <text x="520" y="217" font-size="9" fill="hsl(var(--muted-foreground))">procurement (IOL lenses) · central</text>
    <text x="520" y="231" font-size="9" fill="hsl(var(--muted-foreground))">diagnostics · theatre utilization</text>
    <text x="520" y="249" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">+150–250 bps</text>
  </g>
  <text x="350" y="300" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">Risks that break the plan: surgeon attrition (the real asset walks out at night), insurance price caps, multiple compression at exit.</text>
  <text x="350" y="320" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">The three levers must sum to 15.4% CAGR with room to spare — underwrite the gap, not the hope.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Does it add up?' },
        { speaker: 'candidate', md: 'Same-centre growth of 8–10% plus 12 new centres contributing ₹25–30 crore by year 5 plus margin gains lands around ₹95–105 crore exit EBITDA — straddling the ₹98 crore requirement. So the base case *just* works, which is exactly the problem: a plan that needs everything to go right isn\'t underwriteable. The deal needs either a price negotiation — every 1× off entry is roughly ₹48 crore less equity needed — or a credible fourth lever, like an optical-retail attach strategy or M&A of single-centre operators at 7–8× that arbitrages straight to our 14×.', note: 'The verdict "it barely works, therefore negotiate or add levers" is more valuable than a yes/no.' },
        { speaker: 'interviewer', md: 'The partner asks: what\'s the single biggest risk you\'d DD?' },
        { speaker: 'candidate', md: 'Surgeon economics and lock-ins. In eye care the cash flows follow 25–30 senior surgeons, not the brand. I\'d DD attrition history, compensation versus market, equity participation, and whether the top 5 surgeons\' patient volumes survive a change of ownership. Second: payor mix drift — government-scheme cataract reimbursements are price-capped, and a mix shift toward schemes silently compresses realization.' },
      ]},
      { type: 'reveal', summary: 'Reveal the returns math', blocks: [
        { type: 'mathBox', title: 'The reverse-engineered requirement', md: 'EV in: 14 × 48 = ₹672 cr · Debt 40% = ₹269 cr · **Equity ₹403 cr**\nTarget: 3 × 403 = **₹1,210 cr** equity out\nAssume debt paid to ~₹160 cr by yr 5 → required EV = 1,210 + 160 = ₹1,370 cr\nRequired EBITDA = 1,370 ÷ 14 = **~₹98 cr** → 15.4% CAGR vs 15% historic = **no margin of safety**' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the deal team', items: [
        'Proceed only with a sharper entry: target 12–12.5× (≈ ₹600 cr EV) — at 14× the plan has zero margin of safety against a 3× underwrite.',
        'Add a buy-and-build lever: acquire 3–4 single-centre operators at 7–8× during the hold; the multiple arbitrage alone adds ~0.4× to fund returns.',
        'Make surgeon retention the deal\'s central DD item and the first 100-day action: lock-ins, phantom equity, and succession depth per centre.',
        'Stress-test exit at 12× — if returns fall below 2.2× there, the deal is a pass at any entry above 12.5×.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'PE cases reward **reverse-engineering the requirement** before evaluating the asset: equity in → target multiple → required exit EBITDA → required CAGR. Then judge the value-creation plan against that bar — and treat "base case barely clears" as a negotiation instruction, not an approval.' },
    ]},
  ],
};
