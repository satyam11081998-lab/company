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
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'This is channel entry rather than market entry — same product, same country, new shelf. Quick checks: what\'s the gross margin online versus what offline trade will demand? And is the brand known beyond its online buyers — do offline shoppers recognize it?', note: 'Naming the case type ("channel entry") early signals you won\'t waste time on country-entry boilerplate.' },
        { speaker: 'interviewer', md: 'Online gross margin is 70%. General trade and modern trade will take 35–45% combined through distributor and retailer margins. Brand awareness: strong among urban women 18–35 on social media; near-zero beyond that.' },
        { speaker: 'candidate', md: 'So offline halves the margin but removes the CAC that\'s strangling online growth. The real comparison is **contribution per unit after channel costs**: online = margin minus rising CAC; offline = thinner margin, no CAC, plus discovery we can\'t buy online anymore. I\'ll structure around where to show up first and what the P&L per channel looks like.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Channel entry structure comparing contribution economics of online versus three offline formats and sequencing them', caption: 'Compare channels on contribution per unit, then sequence by fit with the brand\'s current strength.', svg: `<svg viewBox="0 0 720 350" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="d2cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="d2ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="235" y="14" width="250" height="44" rx="12" fill="url(#d2ng)" filter="url(#d2cs)"/>
  <text x="360" y="34" text-anchor="middle" font-size="12" font-weight="700" fill="#ffffff">WHICH SHELF, IN WHAT ORDER?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">judge every channel on contribution/unit + brand fit</text>
  <path d="M360 58 L360 76 M120 76 L600 76 M120 76 L120 92 M280 76 L280 92 M440 76 L440 92 M600 76 L600 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <g text-anchor="middle">
    <rect x="40" y="94" width="160" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#d2cs)"/>
    <text x="120" y="113" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">BEAUTY RETAIL CHAINS</text>
    <text x="120" y="130" font-size="9" fill="hsl(var(--muted-foreground))">assisted selling · right</text>
    <text x="120" y="143" font-size="9" fill="hsl(var(--muted-foreground))">audience · ~40% trade take</text>
    <text x="120" y="160" font-size="9" font-weight="600" fill="hsl(var(--foreground))">fit: HIGH · reach: medium</text>
    <text x="120" y="175" font-size="8.5" fill="hsl(var(--muted-foreground))">phase 1</text>
    <rect x="200" y="94" width="160" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#d2cs)"/>
    <text x="280" y="113" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">MODERN TRADE</text>
    <text x="280" y="130" font-size="9" fill="hsl(var(--muted-foreground))">supermarkets · listing fees</text>
    <text x="280" y="143" font-size="9" fill="hsl(var(--muted-foreground))">· planogram wars · ~42% take</text>
    <text x="280" y="160" font-size="9" font-weight="600" fill="hsl(var(--foreground))">fit: MED · reach: high</text>
    <text x="280" y="175" font-size="8.5" fill="hsl(var(--muted-foreground))">phase 2</text>
    <rect x="360" y="94" width="160" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#d2cs)"/>
    <text x="440" y="113" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">GENERAL TRADE</text>
    <text x="440" y="130" font-size="9" fill="hsl(var(--muted-foreground))">10M+ kiranas · needs distributor</text>
    <text x="440" y="143" font-size="9" fill="hsl(var(--muted-foreground))">network · no brand support</text>
    <text x="440" y="160" font-size="9" font-weight="600" fill="hsl(var(--foreground))">fit: LOW today · reach: vast</text>
    <text x="440" y="175" font-size="8.5" fill="hsl(var(--muted-foreground))">phase 3 / selective SKUs</text>
    <rect x="520" y="94" width="160" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#d2cs)"/>
    <text x="600" y="113" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">OWN STORES / KIOSKS</text>
    <text x="600" y="130" font-size="9" fill="hsl(var(--muted-foreground))">full margin · full capex</text>
    <text x="600" y="143" font-size="9" fill="hsl(var(--muted-foreground))">· brand theatre · slow scale</text>
    <text x="600" y="160" font-size="9" font-weight="600" fill="hsl(var(--foreground))">fit: flagship only</text>
    <text x="600" y="175" font-size="8.5" fill="hsl(var(--muted-foreground))">2–3 cities max</text>
  </g>
  <rect x="130" y="225" width="460" height="46" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="360" y="244" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">SEQUENCE = WHERE THE EXISTING AUDIENCE ALREADY SHOPS</text>
  <text x="360" y="261" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">beauty chains convert the brand's online fame; kiranas need fame the brand doesn't have yet</text>
  <text x="360" y="310" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">Offline isn't one channel — each format has its own P&L, gatekeeper, and failure mode.</text>
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
