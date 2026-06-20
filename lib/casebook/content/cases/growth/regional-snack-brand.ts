import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const regionalSnackBrand: Page = {
  slug: 'cases/growth/regional-snack-brand',
  title: 'Doubling a Regional Snack Brand',
  subtitle: 'A beloved local namkeen maker wants 2× in three years. Map every road.',
  kind: 'case',
  meta: { difficulty: 'easy', caseType: 'Growth', readingTimeMin: 8, tags: ['fmcg', 'ansoff'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client makes traditional namkeen snacks with a cult following in Madhya Pradesh — ₹300 crore revenue, 70% from one state, distribution in 45,000 outlets there. The family owners want to double revenue in three years and have asked you to map the options and pick a path.' },
    ]},
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Doubling in three years means ~26% CAGR against what base growth? And two capability checks: is manufacturing capacity a constraint, and is the family open to outside capital or acquisitions?' },
        { speaker: 'interviewer', md: 'Organic drift is ~10% a year. Capacity can be expanded — that\'s capex, not a blocker. No outside equity; modest debt is fine; small acquisitions possible.', note: 'The gap is now precise: 10% comes free, the case must find the other ~16 points/yr.' },
        { speaker: 'candidate', md: 'So the case is: where do ~₹250 crore of *new* annual revenue come from by year three? I\'ll use the growth matrix — existing/new products × existing/new markets — and size each cell before choosing, because at 26% CAGR we likely need two or three cells, not one.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Reframed the goal as ~₹250 crore of *new* revenue by year three, confirmed capacity and capital headroom, and set up a growth-matrix build of where it comes from.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Sized growth matrix with four quadrants carrying revenue estimates, a confidence-per-rupee sequencing row ordering the four engines, and a verdict bar summing 240 to 310 crore against the doubling target', caption: 'Size every cell first; choose second. The sequencing row orders the engines by confidence-per-rupee — the matrix alone is a list, not a plan.', svg: `<svg viewBox="0 0 720 505" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="rsng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#rsng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">FIND ₹250 CR OF NEW REVENUE</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">organic drift gives 10%/yr free — the case must find the other ~16 pts</text>
  <text x="190" y="84" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--muted-foreground))">EXISTING MARKETS (MP)</text>
  <text x="530" y="84" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--muted-foreground))">NEW MARKETS</text>
  <g text-anchor="middle">
    <rect x="50" y="94" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="190" y="116" font-size="10" font-weight="700" fill="hsl(var(--primary))">PENETRATE DEEPER</text>
    <text x="190" y="134" font-size="8.5" fill="hsl(var(--muted-foreground))">45k → 80k outlets · rural routes ·</text>
    <text x="190" y="148" font-size="8.5" fill="hsl(var(--muted-foreground))">chemist/paan adjacency · ₹5 packs</text>
    <text x="190" y="170" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ +₹80–100 cr</text>
    <text x="190" y="184" font-size="8" fill="hsl(var(--muted-foreground))">35,000 new × ₹28,000 ≈ ₹98 cr ✓</text>
    <rect x="390" y="94" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="530" y="116" font-size="10" font-weight="700" fill="hsl(var(--primary))">ADJACENT STATES</text>
    <text x="530" y="134" font-size="8.5" fill="hsl(var(--muted-foreground))">Vidarbha · Chhattisgarh · Rajasthan</text>
    <text x="530" y="148" font-size="8.5" fill="hsl(var(--muted-foreground))">border belts — taste-contiguous</text>
    <text x="530" y="170" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ +₹100–120 cr</text>
    <text x="530" y="184" font-size="8" fill="hsl(var(--muted-foreground))">medium confidence · needs distributors</text>
    <rect x="50" y="214" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="190" y="236" font-size="10" font-weight="700" fill="hsl(var(--foreground))">NEW PRODUCTS, HOME TURF</text>
    <text x="190" y="254" font-size="8.5" fill="hsl(var(--muted-foreground))">festive gift packs · roasted/healthy line ·</text>
    <text x="190" y="268" font-size="8.5" fill="hsl(var(--muted-foreground))">ready-to-eat poha/chivda breakfast</text>
    <text x="190" y="290" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ +₹40–60 cr</text>
    <text x="190" y="304" font-size="8" fill="hsl(var(--muted-foreground))">brand stretch is credible at home</text>
    <rect x="390" y="214" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" stroke-dasharray="5 4"/>
    <text x="530" y="236" font-size="10" font-weight="700" fill="hsl(var(--foreground))">DIVERSIFY</text>
    <text x="530" y="254" font-size="8.5" fill="hsl(var(--muted-foreground))">national e-comm/q-comm flagship SKUs ·</text>
    <text x="530" y="268" font-size="8.5" fill="hsl(var(--muted-foreground))">diaspora exports (US/Gulf) via partner</text>
    <text x="530" y="290" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ +₹20–30 cr</text>
    <text x="530" y="304" font-size="8" fill="hsl(var(--muted-foreground))">cheap to test · never bet the plan on it</text>
  </g>
  <path d="M360 316 L360 322 M115 322 L605 322 M115 322 L115 330 M278 322 L278 330 M442 322 L442 330 M605 322 L605 330" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="35" y="332" width="160" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="115" y="350" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">1 · MP DEPTH</text>
    <text x="115" y="366" font-size="8" fill="hsl(var(--muted-foreground))">now — same salesforce</text>
    <text x="115" y="382" font-size="10" font-weight="700" fill="hsl(var(--primary))">+₹80–100 cr</text>
    <rect x="198" y="332" width="160" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="278" y="350" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">2 · VIDARBHA FIRST</text>
    <text x="278" y="366" font-size="8" fill="hsl(var(--muted-foreground))">staged, in parallel</text>
    <text x="278" y="382" font-size="10" font-weight="700" fill="hsl(var(--primary))">+₹100–120 cr</text>
    <rect x="362" y="332" width="160" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="442" y="350" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">3 · PRODUCTS, MP-ONLY</text>
    <text x="442" y="366" font-size="8" fill="hsl(var(--muted-foreground))">rides existing routes</text>
    <text x="442" y="382" font-size="10" font-weight="700" fill="hsl(var(--foreground))">+₹40–60 cr</text>
    <rect x="525" y="332" width="160" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="605" y="350" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">4 · DIASPORA / Q-COMM</text>
    <text x="605" y="366" font-size="8" fill="hsl(var(--muted-foreground))">cheap experiment only</text>
    <text x="605" y="382" font-size="10" font-weight="700" fill="hsl(var(--foreground))">+₹20–30 cr</text>
  </g>
  <path d="M115 390 L115 404 M278 390 L278 404 M442 390 L442 404 M605 390 L605 404 M115 404 L605 404 M360 404 L360 416" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="418" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="437" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">Σ ₹240–310 CR — DOUBLE, WITHOUT A HEROIC BET</text>
  <text x="360" y="454" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">gate: 70% distributor fill rates in Vidarbha by month 6 · no price cuts in MP — availability, not price</text>
  <text x="360" y="488" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">What breaks first is capacity: the second-plant decision lands by month 9, and freshness radius keeps the expansion contiguous.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Your matrix sums to the target. The owners can\'t fund and manage all four cells at once, though. How do you sequence, and what breaks first?' },
        { speaker: 'candidate', md: 'Sequence by confidence-per-rupee: deepen MP penetration immediately — it\'s the same salesforce and distributors, just more routes and the ₹5 price point. Start adjacent-state entry in parallel but staged: Vidarbha first, where taste profiles and wholesale networks overlap. New products launch in MP only, riding existing distribution. The diaspora/q-comm cell runs as a cheap experiment. What breaks first is **production and the supply chain** — doubling volume means a second plant decision by month 9, and namkeen freshness limits shipping radius, which is exactly why the expansion must stay contiguous rather than jumping to, say, Delhi.', note: 'Sequencing logic + naming the operational binding constraint unprompted — that\'s the difference between a list and a plan.' },
        { speaker: 'interviewer', md: 'The family asks: should we cut prices to accelerate share gain in MP?' },
        { speaker: 'candidate', md: 'No — at ~70% share of hearts in MP, price cuts mostly give away margin on volume we already get. The growth there is *availability*, not price: more outlets, better fill rates, smaller pack entry points. Spend the same money on distribution.' },
      ]},
      { type: 'reveal', summary: 'Reveal the penetration math', blocks: [
        { type: 'mathBox', title: 'Outlet expansion sizing', md: 'Current: 45,000 outlets ≈ ₹210 cr in MP → ~₹46,700/outlet/yr\nNew outlets skew smaller/rural: assume 60% of current throughput\n35,000 new × ₹28,000 ≈ **+₹98 cr** — matches the matrix estimate.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the owners', items: [
        'Run a three-engine plan: MP depth (+₹100 cr), contiguous-state expansion (+₹110 cr), home-turf product extensions (+₹50 cr) — diaspora/q-commerce as a low-cost option.',
        'Sequence by confidence-per-rupee; gate adjacent states on hitting 70% distributor fill rates in Vidarbha by month 6.',
        'Commit the second-plant decision by month 9 — capacity lead times, not demand, will cap year-3 revenue.',
        'Do not cut price in MP; convert the same spend into route expansion and ₹5 entry packs.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Growth cases are won by **sizing every cell before choosing**, then sequencing by confidence-per-rupee. And in food, geography is an operations question — freshness radius and distributor networks decide where you *can* grow, not just where you\'d like to.' },
    ]},
  ],
};
