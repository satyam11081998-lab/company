import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const d2cSkincareOffline: Page = {
  slug: 'cases/market-entry/d2c-skincare-offline',
  title: 'The D2C Brand That Must Leave the Internet',
  subtitle: 'Online growth is maxing out. Offline retail is a different sport.',
  kind: 'case',
  meta: { difficulty: 'easy', caseType: 'Market Entry', readingTimeMin: 8, tags: ['d2c', 'retail', 'channel-entry'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client is a digital-first Indian skincare brand doing ₹220 crore annual revenue, ~85% through its own website and marketplaces. Online customer-acquisition costs have doubled in two years and growth has slowed to 15%. The founders want to enter offline retail. Evaluate the move and design the entry.' },
    ]},
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'This is channel entry rather than market entry — same product, same country, new shelf. Quick checks: what\'s the gross margin online versus what offline trade will demand? And is the brand known beyond its online buyers — do offline shoppers recognize it?', note: 'Naming the case type ("channel entry") early signals you won\'t waste time on country-entry boilerplate.' },
        { speaker: 'interviewer', md: 'Online gross margin is 70%. General trade and modern trade will take 35–45% combined through distributor and retailer margins. Brand awareness: strong among urban women 18–35 on social media; near-zero beyond that.' },
        { speaker: 'candidate', md: 'So offline halves the margin but removes the CAC that\'s strangling online growth. The real comparison is **contribution per unit after channel costs**: online = margin minus rising CAC; offline = thinner margin, no CAC, plus discovery we can\'t buy online anymore. I\'ll structure around where to show up first and what the P&L per channel looks like.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Reframed it as channel entry, not market entry, and centred the build on contribution per unit after channel costs — online CAC versus offline trade margin.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier channel entry tree: four offline formats each with trade take and phase, a contribution math row comparing online at 280 rupees after CAC with beauty retail at 270 rupees, and a sequencing verdict bar', caption: 'Four formats, each with its own P&L and phase — and the contribution row showing why a ₹280 vs ₹270 dead heat still decides the case.', svg: `<svg viewBox="0 0 720 425" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="d2ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#d2ng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">WHICH SHELF, IN WHAT ORDER?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">₹220 cr, 85% online · CAC doubled — judge every shelf on contribution/unit</text>
  <path d="M360 60 L360 70 M115 70 L605 70 M115 70 L115 80 M278 70 L278 80 M442 70 L442 80 M605 70 L605 80" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="35" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="115" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">BEAUTY CHAINS</text>
    <text x="115" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">assisted selling · the online</text>
    <text x="115" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">audience already shops here</text>
    <text x="115" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">~40% trade take</text>
    <text x="115" y="170" font-size="10" font-weight="700" fill="hsl(var(--primary))">PHASE 1 · 10 cities</text>
    <text x="115" y="186" font-size="8" fill="hsl(var(--muted-foreground))">6 hero SKUs, &gt;2 units/store/day</text>
    <rect x="198" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="278" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">MODERN TRADE</text>
    <text x="278" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">supermarkets · listing fees ·</text>
    <text x="278" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">planogram wars</text>
    <text x="278" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">~42% trade take</text>
    <text x="278" y="170" font-size="10" font-weight="700" fill="hsl(var(--primary))">PHASE 2</text>
    <text x="278" y="186" font-size="8" fill="hsl(var(--muted-foreground))">offline-only pack sizes vs price wars</text>
    <rect x="362" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="442" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">GENERAL TRADE</text>
    <text x="442" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">10M+ kiranas · needs distributor</text>
    <text x="442" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">network · zero brand support;</text>
    <text x="442" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">awareness near-zero beyond 18–35</text>
    <text x="442" y="170" font-size="10" font-weight="700" fill="hsl(var(--primary))">PHASE 3 · selective</text>
    <text x="442" y="186" font-size="8" fill="hsl(var(--muted-foreground))">needs fame the brand lacks yet</text>
    <rect x="525" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="605" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">OWN STORES</text>
    <text x="605" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">full margin · full capex ·</text>
    <text x="605" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">brand theatre · slow scale</text>
    <text x="605" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">flagship economics only</text>
    <text x="605" y="170" font-size="10" font-weight="700" fill="hsl(var(--primary))">2–3 cities max</text>
    <text x="605" y="186" font-size="8" fill="hsl(var(--muted-foreground))">theatre, not distribution</text>
  </g>
  <path d="M115 202 L115 220 M278 202 L278 220 M442 202 L442 220 M605 202 L605 220 M115 220 L605 220 M215 220 L215 236 M505 220 L505 236" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="238" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="215" y="256" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">ONLINE · NEW CUSTOMER</text>
    <text x="215" y="272" font-size="8.5" fill="hsl(var(--muted-foreground))">70% × ₹900 = ₹630 − ₹350 CAC</text>
    <text x="215" y="288" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ ₹280 — and shrinking</text>
    <rect x="385" y="238" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="256" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">BEAUTY RETAIL · PER SALE</text>
    <text x="505" y="272" font-size="8.5" fill="hsl(var(--muted-foreground))">₹540 to company − ₹270 COGS, no CAC</text>
    <text x="505" y="288" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹270 — and stable</text>
  </g>
  <path d="M215 296 L215 312 M505 296 L505 312 M215 312 L505 312 M360 312 L360 326" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="328" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="347" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">ENTER NOW: BEAUTY CHAINS → MODERN TRADE → SELECT GT</text>
  <text x="360" y="364" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">₹280 vs ₹270 is a tie; the CAC trajectory breaks it — enter from strength, not desperation</text>
  <text x="360" y="402" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Offline is not one channel — each format has its own P&amp;L, gatekeeper, and failure mode. Working capital, not demand, kills D2C entries.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Run the numbers: average online order ₹900, CAC now ₹350, gross margin 70%. In beauty retail, the same basket sells at ₹900 with a 40% trade take. Which channel makes more per order?' },
        { speaker: 'candidate', md: 'Online: 70% of 900 = ₹630 gross, minus ₹350 CAC = **₹280** for a *new* customer — though repeat orders skip the CAC. Offline: 60% take-home × 70%-equivalent product margin… cleaner to compute directly: revenue to company ≈ ₹540, COGS ≈ ₹270 (30% of MRP), so ≈ **₹270**. Verdict: a new online customer and an offline sale now contribute almost identically — but offline scales without CAC inflation, while online\'s ₹280 shrinks every quarter as CAC climbs.', note: 'Does the arithmetic both ways and lands on the strategic point: the trend matters more than today\'s tie.' },
        { speaker: 'interviewer', md: 'What\'s the biggest execution risk you\'d flag to these digital-native founders?' },
        { speaker: 'candidate', md: 'Working capital and fill rates. Online, they sell stock they hold; offline, they\'ll fund 60–90 days of channel inventory, face returns and expiry, and a stockout at a chain costs the shelf slot itself. The org needs a sales+distribution muscle they\'ve never built — I\'d hire it, not improvise it.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the founders', items: [
        'Enter offline now — the CAC trend makes it inevitable; entering from strength beats entering from desperation in two years.',
        'Phase 1: top-2 beauty retail chains in 10 cities with the 6 hero SKUs only; prove sell-through (>2 units/store/day) before widening.',
        'Phase 2: modern trade with offline-specific pack sizes (lower price points) to avoid price-comparison with online bundles.',
        'Hire a CPG sales head and set up distributor financing before phase 2 — working capital, not demand, is what kills D2C offline entries.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Channel-entry cases turn on **contribution-per-unit arithmetic across channels** and the *trajectory* of those numbers, not their snapshot. And sequencing follows the customer: enter the shelf your existing audience already visits.' },
    ]},
  ],
};
