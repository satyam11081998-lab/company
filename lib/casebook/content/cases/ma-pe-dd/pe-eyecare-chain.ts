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
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'PE cases run on the returns equation: entry multiple, EBITDA growth, exit multiple, leverage. So first — what entry valuation is being discussed, and how much debt would the structure carry?' },
        { speaker: 'interviewer', md: 'Entry at 14× EBITDA — ₹672 crore enterprise value — with 40% debt funding. Assume exit at the same 14× unless you argue otherwise.', note: 'With entry = exit multiple and known leverage, the whole 3× question collapses into one number: how big must exit EBITDA be?' },
        { speaker: 'candidate', md: 'Then I can reverse-engineer the requirement before judging the asset. Equity in: 60% × 672 ≈ ₹403 crore. For 3×, equity out ≈ ₹1,210 crore. I\'ll work out what exit EBITDA that implies, then test whether this chain can plausibly get there — organic growth, new centres, margin work — and what could break it.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Locked the returns equation (entry multiple, leverage, exit) so the asset can be judged against the equity return it must deliver.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier private equity tree: returns bridge from 403 crore equity in to 1,210 crore target implying 98 crore exit EBITDA, a 15.4 percent required CAGR bar, three value-creation levers with sub-numbers, a levers-sum row straddling the bar, and a no-margin-of-safety verdict', caption: 'The requirement reverse-engineered, then the levers — they sum to ₹95–105 cr against a ₹98 cr bar. "Barely clears" is the finding.', svg: `<svg viewBox="0 0 720 575" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="peng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#peng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">CAN THIS DELIVER 3× IN 5 YEARS?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">entry 14× · 40% debt · exit 14× — reverse-engineer the requirement first</text>
  <path d="M360 60 L360 70 M125 70 L595 70 M125 70 L125 82 M360 70 L360 82 M595 70 L595 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="82" width="190" height="72" rx="9" fill="url(#peng)"/>
    <text x="125" y="104" font-size="9.5" font-weight="700" fill="#ffffff">EQUITY IN</text>
    <text x="125" y="126" font-size="10.5" font-weight="700" fill="#ffffff">≈ ₹403 cr</text>
    <text x="125" y="142" font-size="8" fill="#b9c4d6">60% of 14 × ₹48 cr EV</text>
    <rect x="265" y="82" width="190" height="72" rx="9" fill="url(#peng)"/>
    <text x="360" y="104" font-size="9.5" font-weight="700" fill="#ffffff">3× TARGET, YEAR 5</text>
    <text x="360" y="126" font-size="10.5" font-weight="700" fill="#ffffff">≈ ₹1,210 cr out</text>
    <text x="360" y="142" font-size="8" fill="#b9c4d6">3 × 403 equity value at exit</text>
    <rect x="500" y="82" width="190" height="72" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="595" y="104" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">EXIT EBITDA NEEDED</text>
    <text x="595" y="126" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹98 cr</text>
    <text x="595" y="142" font-size="8" fill="hsl(var(--muted-foreground))">(1,210 + ₹160 cr residual debt) ÷ 14</text>
  </g>
  <path d="M125 154 L125 168 M360 154 L360 168 M595 154 L595 168 M125 168 L595 168 M360 168 L360 180" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="185" y="182" width="350" height="40" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="360" y="207" text-anchor="middle" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">REQUIRED: ₹48 → ₹98 CR = 15.4% EBITDA CAGR</text>
  <path d="M360 222 L360 234 M125 234 L595 234 M125 234 L125 246 M360 234 L360 246 M595 234 L595 246" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="248" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="125" y="268" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SAME-CENTRE GROWTH</text>
    <text x="125" y="285" font-size="8.5" fill="hsl(var(--muted-foreground))">surgeries/centre · payor mix</text>
    <text x="125" y="299" font-size="8.5" fill="hsl(var(--muted-foreground))">(cash vs insurance) ·</text>
    <text x="125" y="313" font-size="8.5" fill="hsl(var(--muted-foreground))">optical retail attach</text>
    <text x="125" y="335" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">~8–10%/yr</text>
    <text x="125" y="350" font-size="8" fill="hsl(var(--muted-foreground))">vs 15% historic top-line</text>
    <rect x="265" y="248" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="268" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">NEW CENTRES</text>
    <text x="360" y="285" font-size="8.5" fill="hsl(var(--muted-foreground))">18 → 30, hub-and-spoke ·</text>
    <text x="360" y="299" font-size="8.5" fill="hsl(var(--muted-foreground))">tier-2 cataract demand ·</text>
    <text x="360" y="313" font-size="8.5" fill="hsl(var(--muted-foreground))">24-month ramp each</text>
    <text x="360" y="335" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">+₹25–30 cr by yr 5</text>
    <text x="360" y="350" font-size="8" fill="hsl(var(--muted-foreground))">12 centres × ramp curve</text>
    <rect x="500" y="248" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="268" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">MARGIN WORK</text>
    <text x="595" y="285" font-size="8.5" fill="hsl(var(--muted-foreground))">IOL lens procurement ·</text>
    <text x="595" y="299" font-size="8.5" fill="hsl(var(--muted-foreground))">central diagnostics ·</text>
    <text x="595" y="313" font-size="8.5" fill="hsl(var(--muted-foreground))">theatre utilization</text>
    <text x="595" y="335" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">+150–250 bps</text>
    <text x="595" y="350" font-size="8" fill="hsl(var(--muted-foreground))">on 20% EBITDA margin today</text>
  </g>
  <path d="M125 358 L125 376 M360 358 L360 376 M595 358 L595 376 M125 376 L595 376 M215 376 L215 392 M505 376 L505 392" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="394" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="412" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LEVERS SUM</text>
    <text x="215" y="428" font-size="8.5" fill="hsl(var(--muted-foreground))">organic + 12 centres + margin gains</text>
    <text x="215" y="444" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">₹95–105 cr — straddles the bar</text>
    <rect x="385" y="394" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="412" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">THE PROBLEM</text>
    <text x="505" y="428" font-size="8.5" fill="hsl(var(--muted-foreground))">15.4% required vs 15% historic growth</text>
    <text x="505" y="444" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">no margin of safety</text>
  </g>
  <path d="M215 452 L215 468 M505 452 L505 468 M215 468 L505 468 M360 468 L360 480" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="482" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="501" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">RE-PRICE TO 12–12.5× OR ADD A LEVER — NOT AT 14×</text>
  <text x="360" y="518" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">buy-and-build at 7–8× arbitrages to 14× (+0.4×) · stress exit at 12×: below 2.2× = pass</text>
  <text x="360" y="552" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The real asset walks out at night — 25–30 senior surgeons. Underwrite the gap, not the hope.</text>
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
