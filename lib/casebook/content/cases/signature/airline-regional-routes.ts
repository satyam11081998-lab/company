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
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'The CEO\'s claim is testable: what fraction of regional passengers connect onward to trunk flights, and what revenue do they contribute there? Also — are the ₹240 crore losses fully-allocated or marginal? Allocation method decides this case.', note: 'Two questions, both aimed at the exact analytical crux: connecting revenue and cost allocation.' },
        { speaker: 'interviewer', md: 'Good. 38% of regional passengers connect to trunk routes. The ₹240 crore is fully-allocated — includes a share of corporate overhead, hub airport charges, and fleet ownership costs that wouldn\'t disappear if the routes closed.' },
        { speaker: 'candidate', md: 'Then I need to rebuild the picture twice: each regional route\'s **avoidable** loss (what we\'d actually save by cutting it), and its **network contribution** (the trunk-route margin its connecting passengers generate). A route is worth keeping if network contribution exceeds avoidable loss — route by route, not as a blob.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Made the CEO’s claim testable — each route’s *avoidable* loss versus its *network contribution* — and pinned the cost-allocation method that decides the case.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier route framework: avoidable loss versus network feed panels, the keep-fix-cut decision rule, an 8-5-9 segmentation tier with 40 versus 85 crore for keepers and 75 versus 12 crore for cuts, and a 100-plus crore verdict bar', caption: 'Two numbers decide each of the 22 — and the 8/5/9 tier shows them per bucket. The blob answer was worth ₹25 cr; the segmented one, ₹100+.', svg: `<svg viewBox="0 0 720 510" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="arng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#arng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">PER ROUTE: KEEP, FIX, OR CUT?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">₹240 cr "loss" = ₹95 cr unavoidable + ₹145 cr avoidable, vs ₹120 cr of feed</text>
  <path d="M360 60 L360 70 M215 70 L505 70 M215 70 L215 82 M505 70 L505 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="95" y="84" width="240" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="215" y="104" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">A · AVOIDABLE LOSS</text>
    <text x="215" y="121" font-size="8.5" fill="hsl(var(--muted-foreground))">fully-allocated loss − overhead share</text>
    <text x="215" y="135" font-size="8.5" fill="hsl(var(--muted-foreground))">(stays) − fleet ownership that redeploys</text>
    <text x="215" y="149" font-size="8.5" fill="hsl(var(--muted-foreground))">− hub charges that persist</text>
    <text x="215" y="171" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹145 cr network-wide</text>
    <text x="215" y="186" font-size="8" fill="hsl(var(--muted-foreground))">cash actually saved by cutting</text>
    <rect x="385" y="84" width="240" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="104" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">B · NETWORK FEED</text>
    <text x="505" y="121" font-size="8.5" fill="hsl(var(--muted-foreground))">38% of regional pax connect: their trunk</text>
    <text x="505" y="135" font-size="8.5" fill="hsl(var(--muted-foreground))">margin − recapture haircut (40–60%)</text>
    <text x="505" y="149" font-size="8.5" fill="hsl(var(--muted-foreground))">+ cargo feed + loyalty ecosystem</text>
    <text x="505" y="171" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹120 cr network-wide</text>
    <text x="505" y="186" font-size="8" fill="hsl(var(--muted-foreground))">margin that dies with the route</text>
  </g>
  <path d="M215 194 L215 210 M505 194 L505 210 M215 210 L505 210 M360 210 L360 222" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="120" y="224" width="480" height="62" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="360" y="245" text-anchor="middle" font-size="10" font-weight="700" fill="hsl(var(--primary))">B &gt; A → KEEP (the "loss" is an accounting artifact)</text>
  <text x="360" y="261" text-anchor="middle" font-size="9.5" fill="hsl(var(--foreground))">B &lt; A but fixable → FIX (right-size aircraft, frequency, pricing)</text>
  <text x="360" y="276" text-anchor="middle" font-size="9.5" fill="hsl(var(--foreground))">B ≪ A, no fix → CUT (redeploy aircraft to trunk demand)</text>
  <path d="M360 286 L360 298 M135 298 L585 298 M135 298 L135 312 M360 298 L360 312 M585 298 L585 312" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="314" width="210" height="72" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="135" y="332" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">KEEP 8 · FEED ≥55%</text>
    <text x="135" y="348" font-size="8.5" fill="hsl(var(--muted-foreground))">avoidable ₹40 cr vs feed ₹85 cr</text>
    <text x="135" y="368" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">+₹45 cr by keeping</text>
    <rect x="255" y="314" width="210" height="72" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="332" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FIX 5 · THE MIDDLE</text>
    <text x="360" y="348" font-size="8.5" fill="hsl(var(--muted-foreground))">70–90-seaters · hub-bank timing · subsidies</text>
    <text x="360" y="368" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">revisit in 12 months</text>
    <rect x="480" y="314" width="210" height="72" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="585" y="332" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">CUT 9 · FEED &lt;12%</text>
    <text x="585" y="348" font-size="8.5" fill="hsl(var(--muted-foreground))">avoidable ₹75 cr vs feed ₹12 cr</text>
    <text x="585" y="368" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">+₹63 cr from exit</text>
  </g>
  <path d="M135 386 L135 402 M360 386 L360 402 M585 386 L585 402 M135 402 L585 402 M360 402 L360 416" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="418" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="437" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹100+ CR/YR vs ₹25 CR FROM CUT-EVERYTHING</text>
  <text x="360" y="454" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">report every regional route monthly on avoidable P&amp;L + feed — kill the fully-allocated mirage permanently</text>
  <text x="360" y="492" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Both executives held a partial truth: the CFO counted unavoidable costs as savings; the CEO claimed feed for routes where 10% connect.</text>
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
