import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const airlineRegionalRoutes: Page = {
  slug: 'cases/signature/airline-regional-routes',
  title: 'The Airline\'s Bleeding Regional Network',
  subtitle: 'Profitability meets network strategy — cutting a route can cost more than keeping it.',
  kind: 'case',
  meta: { difficulty: 'challenging', caseType: 'Signature · Profitability × Strategy', readingTimeMin: 12, tags: ['aviation', 'network-economics', 'blended'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client is a full-service Indian airline. Its 22 regional routes (smaller cities → metro hubs) lose ₹240 crore a year combined, while its 35 trunk routes (metro–metro) make ₹610 crore. The CFO wants to cut the regional network entirely. The CEO resists, claiming the regional routes "feed" the profitable network. Resolve it with analysis, not opinions.' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'The CEO\'s claim is testable: what fraction of regional passengers connect onward to trunk flights, and what revenue do they contribute there? Also — are the ₹240 crore losses fully-allocated or marginal? Allocation method decides this case.', note: 'Two questions, both aimed at the exact analytical crux: connecting revenue and cost allocation.' },
        { speaker: 'interviewer', md: 'Good. 38% of regional passengers connect to trunk routes. The ₹240 crore is fully-allocated — includes a share of corporate overhead, hub airport charges, and fleet ownership costs that wouldn\'t disappear if the routes closed.' },
        { speaker: 'candidate', md: 'Then I need to rebuild the picture twice: each regional route\'s **avoidable** loss (what we\'d actually save by cutting it), and its **network contribution** (the trunk-route margin its connecting passengers generate). A route is worth keeping if network contribution exceeds avoidable loss — route by route, not as a blob.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Route evaluation framework comparing avoidable loss against network feed contribution, producing a keep, fix, or cut decision per route', caption: 'The decision rule, per route: avoidable loss vs network feed. The blob answer ("cut all 22") is guaranteed wrong.', svg: `<svg viewBox="0 0 720 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="arcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="arng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="235" y="14" width="250" height="44" rx="12" fill="url(#arng)" filter="url(#arcs)"/>
  <text x="360" y="34" text-anchor="middle" font-size="12" font-weight="700" fill="#ffffff">PER ROUTE: KEEP, FIX, OR CUT?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">two numbers decide each of the 22</text>
  <g text-anchor="middle">
    <rect x="60" y="86" width="280" height="110" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#arcs)"/>
    <text x="200" y="108" font-size="10" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">A · AVOIDABLE LOSS</text>
    <text x="200" y="127" font-size="9" fill="hsl(var(--muted-foreground))">fully-allocated loss</text>
    <text x="200" y="141" font-size="9" fill="hsl(var(--muted-foreground))">− corporate overhead share (stays)</text>
    <text x="200" y="155" font-size="9" fill="hsl(var(--muted-foreground))">− fleet ownership if planes redeploy/can't sell</text>
    <text x="200" y="169" font-size="9" fill="hsl(var(--muted-foreground))">− hub charges that persist</text>
    <text x="200" y="187" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">= cash actually saved by cutting</text>
    <rect x="380" y="86" width="280" height="110" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#arcs)"/>
    <text x="520" y="108" font-size="10" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">B · NETWORK FEED</text>
    <text x="520" y="127" font-size="9" fill="hsl(var(--muted-foreground))">connecting pax × trunk fare share ×</text>
    <text x="520" y="141" font-size="9" fill="hsl(var(--muted-foreground))">trunk margin − (those seats resold to</text>
    <text x="520" y="155" font-size="9" fill="hsl(var(--muted-foreground))">local demand? subtract recapture)</text>
    <text x="520" y="169" font-size="9" fill="hsl(var(--muted-foreground))">+ cargo feed + loyalty ecosystem value</text>
    <text x="520" y="187" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">= margin that dies with the route</text>
  </g>
  <path d="M200 196 L200 224 M520 196 L520 224 M200 224 L520 224 M360 224 L360 246" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <rect x="120" y="248" width="480" height="62" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="360" y="270" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.03em" fill="hsl(var(--primary))">B &gt; A → KEEP (it's a feeder, the "loss" is an accounting artifact)</text>
  <text x="360" y="287" text-anchor="middle" font-size="10" fill="hsl(var(--foreground))">B &lt; A but fixable → FIX (right-size aircraft, frequency, pricing)</text>
  <text x="360" y="302" text-anchor="middle" font-size="10" fill="hsl(var(--foreground))">B ≪ A, no fix → CUT (and redeploy the aircraft to trunk demand)</text>
  <text x="360" y="340" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">Both executives are wrong: the CFO counts unavoidable costs as savings; the CEO claims feed for routes where only 10% connect.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Data for the network: of the ₹240 crore fully-allocated loss, ₹95 crore is allocated overhead and unavoidable fleet/hub cost. Connecting passengers contribute an estimated ₹120 crore of trunk-route margin, but it varies wildly: eight routes connect 55%+ of passengers; nine routes connect under 12%.' },
        { speaker: 'candidate', md: 'So network-wide: avoidable loss ≈ ₹145 crore against ₹120 crore of feed — cutting *everything* would still hurt by destroying more trunk margin than… no wait, let me be careful: cutting all 22 saves ₹145 crore cash but kills ₹120 crore of feed margin — net saving only ₹25 crore, a rounding error for the airline, and that\'s before recapture assumptions. But the blob hides the real answer: the eight high-feed routes almost certainly have B > A individually — keep. The nine low-feed routes are genuine bleeders — likely cut. The middle five get the "fix" treatment: smaller aircraft, schedule timed to hub banks, or regional-subsidy schemes.', note: 'Catches his own sign confusion out loud and recovers — and lands the segmented answer the blob analysis concealed.' },
        { speaker: 'interviewer', md: 'The CFO says recapture saves you: "cut the feeders and we\'ll sell those trunk seats to someone else."' },
        { speaker: 'candidate', md: 'Partially true and testable: trunk load factors run what — high 80s? Then yes, some recapture. But connecting passengers book early, pay through fares, and fly midweek; replacing them with spot leisure demand at marginal fares recovers maybe 40–60% of the margin. I\'d apply a route-level recapture haircut, not a blanket assumption — on high-frequency metro pairs recapture is real; on thinner trunks it isn\'t.' },
      ]},
      { type: 'reveal', summary: 'Reveal the segmented verdict', blocks: [
        { type: 'mathBox', title: 'The 8 / 5 / 9 split', md: 'KEEP 8 (feed ≥55%): avoidable loss ≈ ₹40 cr vs feed ≈ ₹85 cr → net +₹45 cr to the network\nFIX 5: right-size to 70–90-seaters, retime to hub banks; revisit in 12 months\nCUT 9 (feed <12%): avoidable loss ≈ ₹75 cr vs feed ≈ ₹12 cr → net +₹63 cr from exit\nNet improvement ≈ **₹100+ cr/yr** vs ₹25 cr from the CFO\'s cut-everything plan.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend', items: [
        'Reject both executive positions: segment the 22 routes into keep-8 / fix-5 / cut-9 using avoidable loss vs network feed, route by route.',
        'Exit the nine low-feed routes over two schedules (slot and crew redeployment), redeploying aircraft to trunk frequency where load factors support it.',
        'Fix the middle five with right-sized aircraft and hub-bank timing; apply for regional connectivity subsidies where eligible.',
        'Institutionalize the metric: report every regional route monthly on avoidable P&L + feed contribution, killing the fully-allocated mirage permanently.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Signature-level cases braid two disciplines — here, cost accounting (avoidable vs allocated) and network strategy (feed economics). The meta-lesson: when two executives disagree, both usually hold a *partial* truth; the analysis that segments the portfolio resolves what the argument cannot.' },
    ]},
  ],
};
