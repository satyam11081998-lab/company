import type { Page } from '@/lib/casebook/types';

export const growth: Page = {
  slug: 'core-frameworks/growth',
  title: 'Growth',
  titleEmphasize: 'Growth',
  subtitle: 'A company wants to grow X% — where does it come from? Growth cases reward the candidate who turns a vague "find ways to grow" into a sized gap and a portfolio of sources to fill it. This page gives you the full tree, the Ansoff matrix, and the gap method the casebooks leave out.',
  kind: 'framework',
  meta: { readingTimeMin: 17, tags: ['core-frameworks', 'growth'], caseType: 'Growth' },
  blocks: [
    { type: 'hook', md: 'Most candidates treat a growth case as a brainstorm: list every way a company could grow and hope one sticks. But a growth prompt almost always hides a *number* — grow 20% a year, double revenue by FY30 — and the real task is to size the gap to that number and decide which sources will fill it. Brainstorming names the levers; sizing the gap and allocating across them is what wins the case.', emphasize: 'size the gap to that number' },

    { type: 'prose', md: 'Growth shows up whenever a client wants to get bigger — more revenue, more users, more markets — and asks how. Like profitability, it is one connected decomposition rather than a sequence of gates: you break growth into its sources, go deep on the ones that fit the business, and recombine them into a plan that hits the target.' },

    { type: 'callout', variant: 'insight', title: 'A target, not a brainstorm', md: 'The single biggest differentiator on growth cases is refusing to brainstorm in a vacuum. Pin down the number and the timeline first, then everything you say is in service of closing a specific gap. "Here are ten ways to grow" is a B answer; "the gap is ₹900cr, and here is how I would source it" is an A.' },

    { type: 'heading', level: 2, text: 'The growth tree', emphasize: 'growth tree' },

    { type: 'prose', md: 'Growth comes from three sources. Organic growth uses what the company already has; inorganic growth buys or partners for it; and non-core growth taps adjacent revenue most candidates forget. Draw this first to show you see the whole opportunity, not just the obvious arm.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Growth tree with organic, inorganic, and non-core arms and a portfolio navigation panel", caption: "The growth tree — three sources: organic, inorganic, and non-core, each broken into its levers.", svg: `<svg viewBox="0 0 720 480" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <!-- root -->
  <rect x="250" y="20" width="220" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="42" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="0.03em" fill="#ffffff">GROWTH</text>
  <text x="360" y="57" text-anchor="middle" font-size="9" fill="#b9c4d6">hit the target, from three sources</text>

  <!-- three arms -->
  <path d="M360 66 C360 88, 160 86, 160 106" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <path d="M360 66 C360 88, 360 86, 360 106" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <path d="M360 66 C360 88, 575 86, 575 106" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>

  <!-- ORGANIC -->
  <rect x="50" y="106" width="220" height="44" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="160" y="127" text-anchor="middle" font-size="13" font-weight="700" fill="hsl(var(--foreground))">ORGANIC</text>
  <text x="160" y="142" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">grow with what we have</text>

  <!-- organic two children -->
  <path d="M160 150 C160 168, 95 166, 95 184" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M160 150 C160 168, 225 166, 225 184" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <rect x="30" y="184" width="130" height="92" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="48" y="206" font-size="11" font-weight="700" fill="hsl(var(--foreground))">More users</text>
  <text x="48" y="223" font-size="9" fill="hsl(var(--muted-foreground))">market size ×</text>
  <text x="48" y="236" font-size="9" fill="hsl(var(--muted-foreground))">market share</text>
  <text x="48" y="258" font-size="8.5" font-style="italic" fill="hsl(var(--primary))">acquire &amp; retain</text>

  <rect x="170" y="184" width="130" height="92" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="188" y="206" font-size="11" font-weight="700" fill="hsl(var(--foreground))">More per user</text>
  <text x="188" y="223" font-size="9" fill="hsl(var(--muted-foreground))">revenue/user −</text>
  <text x="188" y="236" font-size="9" fill="hsl(var(--muted-foreground))">cost/user</text>
  <text x="188" y="258" font-size="8.5" font-style="italic" fill="hsl(var(--primary))">deepen the wallet</text>

  <!-- INORGANIC -->
  <rect x="270" y="106" width="180" height="44" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="127" text-anchor="middle" font-size="13" font-weight="700" fill="hsl(var(--foreground))">INORGANIC</text>
  <text x="360" y="142" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">buy or partner for growth</text>
  <rect x="315" y="184" width="180" height="92" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="333" y="206" font-size="10" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">OPTIONS</text>
  <circle cx="337" cy="224" r="2.5" fill="hsl(var(--primary))"/><text x="347" y="228" font-size="10" fill="hsl(var(--foreground))">Acquisition / merger</text>
  <circle cx="337" cy="245" r="2.5" fill="hsl(var(--primary))"/><text x="347" y="249" font-size="10" fill="hsl(var(--foreground))">Joint venture</text>
  <circle cx="337" cy="266" r="2.5" fill="hsl(var(--primary))"/><text x="347" y="270" font-size="10" fill="hsl(var(--foreground))">Build / buy capability</text>

  <!-- NON-CORE -->
  <rect x="450" y="106" width="240" height="44" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="570" y="127" text-anchor="middle" font-size="13" font-weight="700" fill="hsl(var(--foreground))">NON-CORE</text>
  <text x="570" y="142" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">adjacent revenue most forget</text>
  <rect x="510" y="184" width="180" height="92" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="528" y="206" font-size="10" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">EXAMPLES</text>
  <circle cx="532" cy="224" r="2.5" fill="hsl(var(--primary))"/><text x="542" y="228" font-size="10" fill="hsl(var(--foreground))">Lease idle assets</text>
  <circle cx="532" cy="245" r="2.5" fill="hsl(var(--primary))"/><text x="542" y="249" font-size="10" fill="hsl(var(--foreground))">Advertising / data revenue</text>
  <circle cx="532" cy="266" r="2.5" fill="hsl(var(--primary))"/><text x="542" y="270" font-size="10" fill="hsl(var(--foreground))">Value-added services</text>

  <!-- nav band -->
  <rect x="30" y="298" width="660" height="166" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="50" y="322" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — GROWTH IS A PORTFOLIO, NOT A SINGLE LEVER</text>
  <circle cx="54" cy="346" r="2.5" fill="hsl(var(--foreground))"/><text x="64" y="350" font-size="10.5" fill="hsl(var(--foreground))">Organic is the default — cheaper, lower risk. Reach for inorganic when the gap is too big or too</text>
  <text x="64" y="366" font-size="10.5" fill="hsl(var(--foreground))">urgent for organic alone, or when a capability is faster to buy than to build.</text>
  <circle cx="54" cy="388" r="2.5" fill="hsl(var(--foreground))"/><text x="64" y="392" font-size="10.5" fill="hsl(var(--foreground))">Non-core is the arm candidates forget — naming it (idle assets, ad revenue, VAS) is an easy</text>
  <text x="64" y="408" font-size="10.5" fill="hsl(var(--foreground))">differentiator, especially for asset-heavy or high-traffic businesses.</text>
  <circle cx="54" cy="430" r="2.5" fill="hsl(var(--foreground))"/><text x="64" y="434" font-size="10.5" fill="hsl(var(--foreground))">Strong answers blend sources to hit the target — not "let's do M&amp;A," but "X% from core, Y% from new."</text>
  <text x="50" y="456" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Size the target first; the mix of arms should follow from how big the gap is and how fast it must close.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Organic growth — the two engines', emphasize: 'two engines' },

    { type: 'prose', md: 'Organic growth runs on two engines: win more users, or extract more value from each user. The first is market size × share; the second is revenue per user minus cost per user. Notice the second engine is just the profitability tree applied to a single customer — growth and profitability share the same DNA.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Organic growth deep-dive showing the more-users engine and the more-per-user engine with their levers", caption: "Organic growth has two engines — more users (market size × share) or more value per user (revenue/user − cost/user).", svg: `<svg viewBox="0 0 720 620" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="230" y="18" width="260" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13.5" font-weight="700" letter-spacing="0.02em" fill="#ffffff">ORGANIC GROWTH</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">two engines: more users, more per user</text>

  <path d="M360 64 C360 84, 185 82, 185 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 535 82, 535 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>

  <!-- LEFT: MORE USERS -->
  <rect x="40" y="102" width="290" height="40" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="185" y="127" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">MORE USERS  =  market size × share</text>

  <rect x="40" y="156" width="290" height="120" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="58" y="178" font-size="9.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">GROW THE BASE — ACQUISITION &amp; RETENTION</text>
  <circle cx="60" cy="198" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="202" font-size="10.5" fill="hsl(var(--foreground))">Improve the customer journey / funnel</text>
  <circle cx="60" cy="218" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="222" font-size="10.5" fill="hsl(var(--foreground))">Branding &amp; marketing reach</text>
  <circle cx="60" cy="238" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="242" font-size="10.5" fill="hsl(var(--foreground))">New / deeper distribution channels</text>
  <circle cx="60" cy="258" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="262" font-size="10.5" fill="hsl(var(--foreground))">Retention — churn is anti-growth</text>

  <rect x="40" y="288" width="290" height="78" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="58" y="310" font-size="9.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">WHERE TO FIND NEW USERS (ANSOFF)</text>
  <text x="58" y="330" font-size="10" fill="hsl(var(--foreground))">existing product → new segments / geographies</text>
  <text x="58" y="348" font-size="10" fill="hsl(var(--foreground))">new product → existing or new markets</text>
  <text x="58" y="362" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">the 2×2 on the next diagram</text>

  <!-- RIGHT: MORE PER USER -->
  <rect x="390" y="102" width="290" height="40" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="535" y="127" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">MORE PER USER  =  rev/user − cost/user</text>

  <rect x="390" y="156" width="290" height="120" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="408" y="178" font-size="9.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">LIFT REVENUE PER USER</text>
  <circle cx="410" cy="198" r="2.5" fill="hsl(var(--primary))"/><text x="420" y="202" font-size="10.5" fill="hsl(var(--foreground))">Price (mind elasticity)</text>
  <circle cx="410" cy="218" r="2.5" fill="hsl(var(--primary))"/><text x="420" y="222" font-size="10.5" fill="hsl(var(--foreground))">Cross-sell &amp; up-sell</text>
  <circle cx="410" cy="238" r="2.5" fill="hsl(var(--primary))"/><text x="420" y="242" font-size="10.5" fill="hsl(var(--foreground))">Bundling &amp; price discrimination</text>
  <circle cx="410" cy="258" r="2.5" fill="hsl(var(--primary))"/><text x="420" y="262" font-size="10.5" fill="hsl(var(--foreground))">Frequency — more transactions / user</text>

  <rect x="390" y="288" width="290" height="78" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="408" y="310" font-size="9.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">LOWER COST PER USER</text>
  <text x="408" y="330" font-size="10" fill="hsl(var(--foreground))">value-chain efficiency, process innovation</text>
  <text x="408" y="348" font-size="10" fill="hsl(var(--foreground))">scale economies, vertical integration</text>
  <text x="408" y="360" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">profit per user = revenue/user − cost/user</text>

  <!-- nav band -->
  <rect x="40" y="388" width="640" height="214" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="412" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — PICK THE ENGINE THAT FITS THE BUSINESS</text>
  <circle cx="64" cy="436" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="440" font-size="10.5" fill="hsl(var(--foreground))">Low penetration, big untapped market → lead with MORE USERS (acquisition, distribution, Ansoff).</text>
  <circle cx="64" cy="460" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="464" font-size="10.5" fill="hsl(var(--foreground))">Saturated market, loyal base → lead with MORE PER USER (price, cross-sell, frequency, retention).</text>
  <circle cx="64" cy="484" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="488" font-size="10.5" fill="hsl(var(--foreground))">Retention sits in both: a retained user is a cheaper "new" user and a higher-value one. Do not skip it.</text>
  <circle cx="64" cy="508" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="512" font-size="10.5" fill="hsl(var(--foreground))">Revenue/user splits like the profitability tree — price × units − cost. Growth and profitability share DNA.</text>
  <text x="60" y="540" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Quick test: is it cheaper for this business to win a new customer, or to get more from the ones it has?</text>
  <text x="60" y="562" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">That answer tells you which engine to lead with — and usually you will recommend a blend of both.</text>
  <text x="60" y="586" font-size="9.5" font-weight="600" fill="hsl(var(--foreground))">Don't list all eight levers — size the two or three that move this client's number most.</text>
</svg>` },

    { type: 'prose', md: 'When the engine is "more users," the next question is *where* those users come from — and that is exactly what the Ansoff matrix structures: existing or new product, against existing or new market, ranked by risk.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Ansoff two-by-two matrix of product versus market with risk ranking and a climb-the-ladder navigation panel", caption: "The Ansoff matrix — four ways to grow ranked by risk: penetration, product development, market development, and diversification.", svg: `<svg viewBox="0 0 720 560" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="240" y="18" width="240" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13.5" font-weight="700" letter-spacing="0.02em" fill="#ffffff">THE ANSOFF MATRIX</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">where to grow — product × market, risk-ranked</text>

  <!-- axis labels -->
  <text x="290" y="98" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--muted-foreground))">EXISTING PRODUCT</text>
  <text x="540" y="98" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--muted-foreground))">NEW PRODUCT</text>
  <text x="150" y="190" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--muted-foreground))" transform="rotate(-90 150 190)">EXISTING MARKET</text>
  <text x="150" y="385" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--muted-foreground))" transform="rotate(-90 150 385)">NEW MARKET</text>

  <!-- quadrant 1: Market Penetration (existing/existing) - lowest risk -->
  <rect x="180" y="110" width="250" height="160" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="200" y="134" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">MARKET PENETRATION</text>
  <text x="200" y="150" font-size="8.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">LOWEST RISK · START HERE</text>
  <text x="200" y="172" font-size="10" fill="hsl(var(--muted-foreground))">Sell more of today's product to</text>
  <text x="200" y="186" font-size="10" fill="hsl(var(--muted-foreground))">today's market.</text>
  <circle cx="202" cy="206" r="2.5" fill="hsl(var(--primary))"/><text x="212" y="210" font-size="9.5" fill="hsl(var(--foreground))">Steal share, raise frequency</text>
  <circle cx="202" cy="224" r="2.5" fill="hsl(var(--primary))"/><text x="212" y="228" font-size="9.5" fill="hsl(var(--foreground))">More distribution, better marketing</text>
  <circle cx="202" cy="242" r="2.5" fill="hsl(var(--primary))"/><text x="212" y="246" font-size="9.5" fill="hsl(var(--foreground))">Improve retention</text>

  <!-- quadrant 2: Product Development (new product / existing market) -->
  <rect x="440" y="110" width="250" height="160" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="460" y="134" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">PRODUCT DEVELOPMENT</text>
  <text x="460" y="150" font-size="8.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">MEDIUM RISK</text>
  <text x="460" y="172" font-size="10" fill="hsl(var(--muted-foreground))">New product to a market you</text>
  <text x="460" y="186" font-size="10" fill="hsl(var(--muted-foreground))">already understand.</text>
  <circle cx="462" cy="206" r="2.5" fill="hsl(var(--primary))"/><text x="472" y="210" font-size="9.5" fill="hsl(var(--foreground))">New SKUs, line extensions</text>
  <circle cx="462" cy="224" r="2.5" fill="hsl(var(--primary))"/><text x="472" y="228" font-size="9.5" fill="hsl(var(--foreground))">Cross-sell to existing base</text>
  <circle cx="462" cy="242" r="2.5" fill="hsl(var(--foreground))"/><text x="472" y="246" font-size="9.5" fill="hsl(var(--foreground))">Leverage the relationship you own</text>

  <!-- quadrant 3: Market Development (existing product / new market) -->
  <rect x="180" y="280" width="250" height="160" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="200" y="304" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">MARKET DEVELOPMENT</text>
  <text x="200" y="320" font-size="8.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">MEDIUM RISK</text>
  <text x="200" y="342" font-size="10" fill="hsl(var(--muted-foreground))">Today's product to a new market</text>
  <text x="200" y="356" font-size="10" fill="hsl(var(--muted-foreground))">or segment.</text>
  <circle cx="202" cy="376" r="2.5" fill="hsl(var(--primary))"/><text x="212" y="380" font-size="9.5" fill="hsl(var(--foreground))">New geographies</text>
  <circle cx="202" cy="394" r="2.5" fill="hsl(var(--primary))"/><text x="212" y="398" font-size="9.5" fill="hsl(var(--foreground))">New customer segments</text>
  <circle cx="202" cy="412" r="2.5" fill="hsl(var(--foreground))"/><text x="212" y="416" font-size="9.5" fill="hsl(var(--foreground))">New channels (e.g. D2C, quick-comm)</text>

  <!-- quadrant 4: Diversification (new/new) - highest risk -->
  <rect x="440" y="280" width="250" height="160" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="460" y="304" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">DIVERSIFICATION</text>
  <text x="460" y="320" font-size="8.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">HIGHEST RISK · HANDLE WITH CARE</text>
  <text x="460" y="342" font-size="10" fill="hsl(var(--muted-foreground))">New product AND new market —</text>
  <text x="460" y="356" font-size="10" fill="hsl(var(--muted-foreground))">two unknowns at once.</text>
  <circle cx="462" cy="376" r="2.5" fill="hsl(var(--primary))"/><text x="472" y="380" font-size="9.5" fill="hsl(var(--foreground))">Often via acquisition, not build</text>
  <circle cx="462" cy="394" r="2.5" fill="hsl(var(--primary))"/><text x="472" y="398" font-size="9.5" fill="hsl(var(--foreground))">Justify only with a real synergy</text>
  <circle cx="462" cy="412" r="2.5" fill="hsl(var(--foreground))"/><text x="472" y="416" font-size="9.5" fill="hsl(var(--foreground))">Most growth-case traps live here</text>

  <!-- nav band -->
  <rect x="40" y="456" width="640" height="92" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="480" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — CLIMB THE RISK LADDER FROM THE BOTTOM-LEFT</text>
  <circle cx="64" cy="504" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="508" font-size="10.5" fill="hsl(var(--foreground))">Exhaust penetration before reaching for riskier quadrants — it is cheapest and uses assets you own.</text>
  <circle cx="64" cy="528" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="532" font-size="10.5" fill="hsl(var(--foreground))">Move one step away at a time. Jumping straight to diversification is the classic over-reach in growth cases.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Inorganic and non-core', emphasize: 'Inorganic and non-core' },

    { type: 'prose', md: 'When organic growth cannot close the gap in time, the company can buy or partner its way there — or tap revenue sources outside its core. These two arms are where most candidates fall short, so naming them well is an easy way to stand out.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Inorganic and non-core growth detail with a how-to-use differentiator panel", caption: "The two underused arms — inorganic (acquire, partner, build capability) and non-core (idle assets, advertising, value-added services).", svg: `<svg viewBox="0 0 720 500" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="210" y="18" width="300" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="12.5" font-weight="700" letter-spacing="0.02em" fill="#ffffff">INORGANIC &amp; NON-CORE GROWTH</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">the two arms candidates underuse</text>

  <path d="M360 64 C360 84, 190 82, 190 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 530 82, 530 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>

  <!-- INORGANIC -->
  <rect x="40" y="102" width="300" height="40" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="190" y="127" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">INORGANIC — buy or partner</text>
  <rect x="40" y="156" width="300" height="170" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="58" y="178" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Acquisition</text>
  <text x="58" y="194" font-size="9.5" fill="hsl(var(--muted-foreground))">fastest scale; buy share, capability, or entry</text>
  <text x="58" y="222" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Joint venture / partnership</text>
  <text x="58" y="238" font-size="9.5" fill="hsl(var(--muted-foreground))">shared cost &amp; local expertise; less control</text>
  <text x="58" y="266" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Build / buy a capability</text>
  <text x="58" y="282" font-size="9.5" fill="hsl(var(--muted-foreground))">acquire a team, tech, or IP you lack</text>
  <text x="58" y="310" font-size="9" font-style="italic" fill="hsl(var(--primary))">full M&amp;A evaluation lives on the M&amp;A page</text>

  <!-- NON-CORE -->
  <rect x="380" y="102" width="300" height="40" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="530" y="127" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">NON-CORE — adjacent revenue</text>
  <rect x="380" y="156" width="300" height="170" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="398" y="178" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Monetise idle assets</text>
  <text x="398" y="194" font-size="9.5" fill="hsl(var(--muted-foreground))">lease space, rent fleet, license IP</text>
  <text x="398" y="222" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Advertising &amp; data revenue</text>
  <text x="398" y="238" font-size="9.5" fill="hsl(var(--muted-foreground))">sell audience / insights (high-traffic firms)</text>
  <text x="398" y="266" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Value-added services</text>
  <text x="398" y="282" font-size="9.5" fill="hsl(var(--muted-foreground))">financing, warranties, subscriptions, after-sales</text>
  <text x="398" y="310" font-size="9" font-style="italic" fill="hsl(var(--primary))">often high-margin and underexploited</text>

  <!-- nav band -->
  <rect x="40" y="348" width="640" height="132" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="372" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THESE — THE EASY DIFFERENTIATORS</text>
  <circle cx="64" cy="396" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="400" font-size="10.5" fill="hsl(var(--foreground))">Reach for inorganic when the gap is too large or too urgent for organic, or a capability is faster bought.</text>
  <circle cx="64" cy="420" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="424" font-size="10.5" fill="hsl(var(--foreground))">Always name non-core — almost no candidate does. For asset-heavy (real estate, fleet) or high-traffic</text>
  <text x="74" y="440" font-size="10.5" fill="hsl(var(--foreground))">(apps, marketplaces) businesses, adjacent revenue can be the highest-margin growth available.</text>
  <text x="60" y="466" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Mentioning non-core costs one sentence and signals you see the whole opportunity, not just the obvious arm.</text>
</svg>` },

    { type: 'callout', variant: 'tip', title: 'Always name non-core', md: 'It costs one sentence and almost no candidate does it. "There may also be non-core revenue here — monetising idle assets, advertising to their traffic, or value-added services" signals you see the whole opportunity. For asset-heavy or high-traffic businesses, this can be the highest-margin growth on the table. (Inorganic moves connect to the *M&A* framework, covered separately.)' },

    { type: 'heading', level: 2, text: 'The growth-gap method', emphasize: 'growth-gap method' },

    { type: 'prose', md: 'This is the part the casebooks skip — and the heart of a strong growth answer. A target minus the current trajectory equals the gap that *new* initiatives must deliver. Size that gap, then allocate it across the sources above. This turns the tree from a list into a plan.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Growth gap method showing target minus current equals gap, allocated across growth sources", caption: "The growth-gap method — target minus current trajectory equals the gap, then allocate it across core, adjacencies, and inorganic.", svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="225" y="18" width="270" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="0.02em" fill="#ffffff">THE GROWTH-GAP METHOD</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">turn a target into an allocation across levers</text>

  <path d="M360 64 C360 80, 360 80, 360 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>

  <!-- the gap equation -->
  <rect x="60" y="94" width="600" height="80" rx="12" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#cs)"/>
  <text x="150" y="126" text-anchor="middle" font-size="13" font-weight="700" fill="hsl(var(--foreground))">TARGET</text>
  <text x="150" y="146" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">e.g. ₹1,500cr</text>
  <text x="150" y="160" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">by FY30</text>
  <text x="270" y="138" text-anchor="middle" font-size="20" font-weight="700" fill="hsl(var(--muted-foreground))">−</text>
  <text x="370" y="126" text-anchor="middle" font-size="13" font-weight="700" fill="hsl(var(--foreground))">CURRENT TRAJECTORY</text>
  <text x="370" y="146" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">where the business lands if</text>
  <text x="370" y="160" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">nothing changes (≈ category growth)</text>
  <text x="500" y="138" text-anchor="middle" font-size="20" font-weight="700" fill="hsl(var(--muted-foreground))">=</text>
  <text x="595" y="126" text-anchor="middle" font-size="13" font-weight="700" fill="hsl(var(--primary))">THE GAP</text>
  <text x="595" y="146" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">what new initiatives</text>
  <text x="595" y="160" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">must deliver</text>

  <path d="M360 174 C360 190, 360 190, 360 202" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>

  <!-- allocate across levers -->
  <rect x="60" y="204" width="600" height="40" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="229" text-anchor="middle" font-size="12" font-weight="700" fill="hsl(var(--foreground))">ALLOCATE THE GAP ACROSS GROWTH SOURCES</text>

  <path d="M360 244 C360 256, 160 254, 160 266" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M360 244 C360 256, 360 254, 360 266" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M360 244 C360 256, 560 254, 560 266" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>

  <rect x="60" y="266" width="190" height="88" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="78" y="288" font-size="11" font-weight="700" fill="hsl(var(--foreground))">From the core</text>
  <text x="78" y="306" font-size="9.5" fill="hsl(var(--muted-foreground))">penetration, share gain,</text>
  <text x="78" y="320" font-size="9.5" fill="hsl(var(--muted-foreground))">more per user</text>
  <text x="78" y="342" font-size="9" font-style="italic" fill="hsl(var(--primary))">realistic, near-term %</text>

  <rect x="265" y="266" width="190" height="88" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="283" y="288" font-size="11" font-weight="700" fill="hsl(var(--foreground))">From adjacencies</text>
  <text x="283" y="306" font-size="9.5" fill="hsl(var(--muted-foreground))">new products, segments,</text>
  <text x="283" y="320" font-size="9.5" fill="hsl(var(--muted-foreground))">geographies (Ansoff)</text>
  <text x="283" y="342" font-size="9" font-style="italic" fill="hsl(var(--primary))">medium-term %</text>

  <rect x="470" y="266" width="190" height="88" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="488" y="288" font-size="11" font-weight="700" fill="hsl(var(--foreground))">From inorganic</text>
  <text x="488" y="306" font-size="9.5" fill="hsl(var(--muted-foreground))">M&amp;A / JV to close a gap</text>
  <text x="488" y="320" font-size="9.5" fill="hsl(var(--muted-foreground))">organic can't reach in time</text>
  <text x="488" y="342" font-size="9" font-style="italic" fill="hsl(var(--primary))">the balancing item</text>

  <!-- nav band -->
  <rect x="40" y="372" width="640" height="148" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="396" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">WHY THIS IS THE WHOLE GAME — THE CASEBOOKS SHOW THE TREE, NOT THIS</text>
  <circle cx="64" cy="420" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="424" font-size="10.5" fill="hsl(var(--foreground))">A growth case is not "list ways to grow." It is "hit THIS number." Always size the gap first.</text>
  <circle cx="64" cy="444" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="448" font-size="10.5" fill="hsl(var(--foreground))">Compare the gap to category growth: if the target is far above it, the core alone cannot get there —</text>
  <text x="74" y="464" font-size="10.5" fill="hsl(var(--foreground))">that mathematically forces adjacencies or inorganic, and you can say so with conviction.</text>
  <circle cx="64" cy="486" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="490" font-size="10.5" fill="hsl(var(--foreground))">Recommend a portfolio with rough %s: "≈60% from core, 25% from new segments, 15% from a bolt-on."</text>
  <text x="60" y="512" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Sizing the gap turns a vague brainstorm into a defensible plan — this is what separates an A from a B.</text>
</svg>` },

    { type: 'callout', variant: 'pitfall', title: 'The trajectory trap', md: 'Candidates compare the target to *zero* and feel any growth idea counts. Compare it instead to the current trajectory — where the business lands if nothing changes, roughly category growth. If the target sits far above that line, the core alone cannot close it, which *mathematically forces* adjacencies or inorganic. Skipping this step makes recommendations feel arbitrary instead of forced by the numbers.' },

    { type: 'heading', level: 2, text: 'Navigating it live', emphasize: 'Navigating it live' },

    { type: 'prose', md: 'Put it together as a live path: clarify the target, size the gap, exhaust the cheap core levers first, then climb outward only as far as the gap requires, and close with an allocated portfolio.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Growth diagnostic flow as a five-step ordered path with a core-enough gate", caption: "How to run a growth case live — clarify target, size the gap, exhaust the core, climb to adjacencies and inorganic, recommend a portfolio.", svg: `<svg viewBox="0 0 720 560" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="200" y="20" width="320" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="42" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">1 · Clarify the target &amp; timeline</text>
  <text x="360" y="57" text-anchor="middle" font-size="9" fill="#b9c4d6">"grow" is meaningless without a number and a date</text>

  <path d="M360 66 C360 80, 360 80, 360 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="160" y="94" width="400" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="116" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">2 · Size the gap</text>
  <text x="360" y="133" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">target − current trajectory; compare to category growth</text>

  <path d="M360 144 C360 158, 360 158, 360 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="160" y="172" width="400" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="194" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">3 · Exhaust the core first</text>
  <text x="360" y="211" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">more users + more per user — cheapest, lowest risk</text>

  <path d="M360 222 C360 236, 360 236, 360 248" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="210" y="250" width="300" height="44" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#cs)"/>
  <text x="360" y="270" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="0.02em" fill="hsl(var(--primary))">CORE ENOUGH TO CLOSE THE GAP?</text>
  <text x="360" y="286" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">if yes → you're done; if no → go further out</text>

  <path d="M360 294 C360 308, 360 308, 360 320" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="160" y="322" width="400" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="344" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">4 · Add adjacencies, then inorganic</text>
  <text x="360" y="361" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">Ansoff for adjacencies; M&amp;A/JV for what organic can't reach in time</text>

  <path d="M360 372 C360 386, 360 386, 360 398" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="160" y="400" width="400" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="422" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">5 · Recommend a portfolio with %s</text>
  <text x="360" y="439" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">"X% from core, Y% from new, Z% from a bolt-on" — and the risks</text>

  <rect x="40" y="468" width="640" height="74" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="492" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">THE MOVE THAT SCORES — SIZE, THEN ALLOCATE</text>
  <text x="60" y="513" font-size="10.5" fill="hsl(var(--foreground))">Weak answers brainstorm growth ideas. Strong answers size the gap, then allocate it across sources</text>
  <text x="60" y="529" font-size="10.5" fill="hsl(var(--foreground))">with rough percentages — turning a list of tactics into a defensible plan to hit the actual target.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Worked mini-case', emphasize: 'Worked mini-case' },

    { type: 'prose', md: 'Watch the gap method in action. Note how the candidate refuses to brainstorm until the target is pinned, sizes the gap against the current trajectory, exhausts the core before reaching outward, and lands on an allocated portfolio rather than a wish-list.' },

    { type: 'dialogue', title: 'A packaged-foods growth case', turns: [
      { speaker: 'interviewer', md: 'Our client is an Indian packaged-foods company, around ₹600cr revenue today. The board wants to reach ₹1,500cr in five years. How would they get there?' },
      { speaker: 'candidate', md: 'Before I suggest anything, let me size the gap. They want to go from ₹600cr to ₹1,500cr in five years — that is roughly 20% a year, against a packaged-foods category growing maybe 10-12%. So if they just ride the category, they land around ₹1,000-1,050cr. The gap that new initiatives must fill is therefore roughly ₹450-500cr on top of trajectory. Does that framing match how the board thinks about it?' },
      { speaker: 'interviewer', md: 'That is exactly right, and a good catch — they are currently growing with the category. So where does the extra ₹450cr come from?' },
      { speaker: 'candidate', md: 'I would source it in order of risk. First the core: can they grow users and value per user faster than the category? More users through deeper distribution — packaged foods in India is a distribution game, so expanding into more towns and more outlets per town is the obvious near-term lever. And more per user through premiumisation and cross-sell across their range. My hypothesis is the core can deliver a meaningful chunk — say half the gap — but probably not all of it at 20%.' },
      { speaker: 'interviewer', md: 'Why not all of it?' },
      { speaker: 'candidate', md: 'Because distribution expansion has a ceiling each year, and premiumisation is gradual. To close the rest I would climb the Ansoff ladder one step: new products to their existing market — adjacent categories they can sell through the same distribution and brand, like moving from snacks into breakfast or condiments. That reuses their biggest asset, the distribution network. If even that leaves a gap, a bolt-on acquisition of a regional brand could buy both share and distribution faster than building. So my rough allocation: about half the gap from the core, a third from adjacent products, and the balance from a possible bolt-on — and I would pressure-test each before committing.' },
      { speaker: 'narrator', md: 'The candidate sized the gap against trajectory before proposing anything, exhausted the cheap core levers first, climbed Ansoff only one step (existing market, new product — reusing distribution), and ended with an allocated portfolio plus a stated intent to validate. That is the gap method, not a brainstorm.', note: 'Size against trajectory, exhaust the core, climb one step at a time, end with an allocated portfolio.' },
    ]},

    { type: 'callout', variant: 'insight', title: 'What made that an A-grade answer', md: 'The candidate converted "grow to ₹1,500cr" into a ₹450-500cr gap above trajectory, then sourced it deliberately: core first, one Ansoff step out, inorganic as the balancing item — each tied to the client\'s real asset (distribution). No brainstorm, no jump to diversification, and a portfolio with rough proportions instead of a list. That is exactly what the gap method and the Ansoff ladder are for.' },

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'You will turn a growth prompt into a sized gap — target minus current trajectory — before proposing anything, instead of brainstorming ways to grow.',
      'You will decompose growth into three sources — organic (more users, more per user), inorganic (buy or partner), and non-core (adjacent revenue) — and draw the whole tree, not just the obvious arm.',
      'You will use the Ansoff matrix to structure where new users come from, climbing from penetration outward and treating diversification as the riskiest last resort.',
      'You will compare the gap to category growth: if the target sits far above trajectory, the core alone cannot close it, which forces adjacencies or inorganic — and you can say so with conviction.',
      'You will close with an allocated portfolio — rough percentages from core, adjacencies, and inorganic — tied to the client\'s real assets, rather than a list of tactics.',
    ]},
  ],
};
