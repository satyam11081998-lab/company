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
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Doubling in three years means ~26% CAGR against what base growth? And two capability checks: is manufacturing capacity a constraint, and is the family open to outside capital or acquisitions?' },
        { speaker: 'interviewer', md: 'Organic drift is ~10% a year. Capacity can be expanded — that\'s capex, not a blocker. No outside equity; modest debt is fine; small acquisitions possible.', note: 'The gap is now precise: 10% comes free, the case must find the other ~16 points/yr.' },
        { speaker: 'candidate', md: 'So the case is: where do ~₹250 crore of *new* annual revenue come from by year three? I\'ll use the growth matrix — existing/new products × existing/new markets — and size each cell before choosing, because at 26% CAGR we likely need two or three cells, not one.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 700, ariaLabel: 'Growth option matrix for a regional snack brand with four quadrants sized by potential revenue contribution', caption: 'Size every cell first; choose second. The numbers in each quadrant are the candidate\'s sizing from the analysis.', svg: `<svg viewBox="0 0 700 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="rscs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="rsng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="225" y="12" width="250" height="40" rx="11" fill="url(#rsng)" filter="url(#rscs)"/>
  <text x="350" y="37" text-anchor="middle" font-size="12" font-weight="700" fill="#ffffff">FIND ₹250 CR OF NEW REVENUE</text>
  <text x="160" y="80" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--muted-foreground))">EXISTING MARKETS (MP)</text>
  <text x="540" y="80" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--muted-foreground))">NEW MARKETS</text>
  <g text-anchor="middle">
    <rect x="40" y="90" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#rscs)"/>
    <text x="180" y="112" font-size="10" font-weight="700" fill="hsl(var(--primary))">PENETRATE DEEPER</text>
    <text x="180" y="130" font-size="9" fill="hsl(var(--muted-foreground))">45k → 80k outlets · rural routes</text>
    <text x="180" y="144" font-size="9" fill="hsl(var(--muted-foreground))">· chemist/paan adjacency · ₹5 packs</text>
    <text x="180" y="166" font-size="11" font-weight="700" fill="hsl(var(--foreground))">≈ +₹80–100 cr</text>
    <text x="180" y="180" font-size="8.5" fill="hsl(var(--muted-foreground))">high confidence · existing muscle</text>
    <rect x="380" y="90" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#rscs)"/>
    <text x="520" y="112" font-size="10" font-weight="700" fill="hsl(var(--primary))">ADJACENT STATES</text>
    <text x="520" y="130" font-size="9" fill="hsl(var(--muted-foreground))">Maharashtra (Vidarbha) · Chhattisgarh ·</text>
    <text x="520" y="144" font-size="9" fill="hsl(var(--muted-foreground))">Rajasthan border belts — taste-contiguous</text>
    <text x="520" y="166" font-size="11" font-weight="700" fill="hsl(var(--foreground))">≈ +₹100–120 cr</text>
    <text x="520" y="180" font-size="8.5" fill="hsl(var(--muted-foreground))">medium confidence · needs distributors</text>
    <rect x="40" y="210" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#rscs)"/>
    <text x="180" y="232" font-size="10" font-weight="700" fill="hsl(var(--foreground))">NEW PRODUCTS, HOME TURF</text>
    <text x="180" y="250" font-size="9" fill="hsl(var(--muted-foreground))">festive gift packs · roasted/healthy line</text>
    <text x="180" y="264" font-size="9" fill="hsl(var(--muted-foreground))">· ready-to-eat poha/chivda breakfast</text>
    <text x="180" y="286" font-size="11" font-weight="700" fill="hsl(var(--foreground))">≈ +₹40–60 cr</text>
    <text x="180" y="300" font-size="8.5" fill="hsl(var(--muted-foreground))">brand stretch is credible at home</text>
    <rect x="380" y="210" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" stroke-dasharray="5 4" filter="url(#rscs)"/>
    <text x="520" y="232" font-size="10" font-weight="700" fill="hsl(var(--foreground))">DIVERSIFY</text>
    <text x="520" y="250" font-size="9" fill="hsl(var(--muted-foreground))">national e-comm/q-comm flagship SKUs ·</text>
    <text x="520" y="264" font-size="9" fill="hsl(var(--muted-foreground))">export to diaspora (US/Gulf) via partner</text>
    <text x="520" y="286" font-size="11" font-weight="700" fill="hsl(var(--foreground))">≈ +₹20–30 cr</text>
    <text x="520" y="300" font-size="8.5" fill="hsl(var(--muted-foreground))">cheap to test · don't bet the plan on it</text>
  </g>
  <text x="350" y="340" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">Sized cells sum to ₹240–310 cr — the target is reachable without any heroic single bet.</text>
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
