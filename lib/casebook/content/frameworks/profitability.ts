import type { Page } from '@/lib/casebook/types';

export const profitability: Page = {
  slug: 'core-frameworks/profitability',
  title: 'Profitability',
  titleEmphasize: 'Profitability',
  subtitle: 'The most common case shape, and the one whose tree you must be able to draw in your sleep. This page takes you from the master equation down to the specific leak — and shows you how to navigate it under pressure, not just memorise it.',
  kind: 'framework',
  meta: { readingTimeMin: 18, tags: ['core-frameworks', 'profitability'], caseType: 'Profitability' },
  blocks: [
    { type: 'hook', md: 'Every profitability case is the same equation wearing a different costume: profit equals revenue minus cost. What separates a strong candidate is not knowing that equation — everyone does — but knowing how to walk *down* it: which branch to open first, how deep to go, and when to stop. The casebooks hand you the map. This page hands you the map and teaches you to read it while the clock runs.', emphasize: 'how to walk down it' },

    { type: 'prose', md: 'Profitability is the workhorse of case interviewing — the single most common shape, and the backbone of many cases that look like something else. Master its decomposition and you have a structure ready for any prompt where profit, margin, or cost has moved. The framework is simple to state and deep to apply: **Profit = Revenue − Cost**, with each side broken down until you reach a lever you can actually pull.' },

    { type: 'callout', variant: 'insight', title: 'Depth is optional; the map is not', md: 'You will rarely walk the entire tree in one case — there is not time, and most cases hinge on one or two branches. But you must *know* the whole tree, because that is what lets you place the client’s problem precisely and choose which branch to chase. Knowing the map is non-negotiable; how deep you walk it is a judgement call you make live.' },

    { type: 'heading', level: 2, text: 'The master tree', emphasize: 'master tree' },

    { type: 'prose', md: 'Start every profitability case here. Profit splits into revenue and cost; revenue into price, volume, and mix; cost into its drivers. This is the skeleton you draw in the first sixty seconds, before you know anything specific — it signals structured thinking and gives you somewhere to hang every fact that follows.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Profitability driver tree showing profit splitting into revenue and cost with their drivers", caption: "The profitability driver tree — profit decomposes into revenue and cost, each broken down to the levers you can pull.", svg: `<svg viewBox="0 0 760 520" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <!-- soft elevation shadow -->
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#0f1c33" flood-opacity="0.10"/>
    </filter>
    <filter id="rootShadow" x="-30%" y="-30%" width="160%" height="200%">
      <feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/>
    </filter>
    <!-- navy gradient for the root -->
    <linearGradient id="navyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(214 64% 19%)"/>
      <stop offset="1" stop-color="hsl(214 74% 11%)"/>
    </linearGradient>
    <!-- faint top sheen for arm cards -->
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(var(--card))"/>
      <stop offset="1" stop-color="hsl(var(--background))"/>
    </linearGradient>
  </defs>

  <!-- ===== CONNECTORS (curved, drawn first) ===== -->
  <!-- root bottom (360,92) curving out to revenue-top (180,150) and cost-top (580,150) -->
  <path d="M360 92 C360 122, 180 120, 180 150" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <path d="M360 92 C360 122, 580 120, 580 150" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <!-- arm head down to its panel -->
  <path d="M180 198 C180 214, 180 214, 180 232" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M580 198 C580 214, 580 214, 580 232" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>

  <!-- minus operator between the two arms -->
  <circle cx="380" cy="174" r="15" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.5" filter="url(#cardShadow)"/>
  <line x1="372" y1="174" x2="388" y2="174" stroke="hsl(var(--foreground))" stroke-width="2.25" stroke-linecap="round"/>

  <!-- ===== ROOT: PROFIT ===== -->
  <rect x="278" y="40" width="204" height="52" rx="12" fill="url(#navyGrad)" filter="url(#rootShadow)"/>
  <text x="380" y="66" text-anchor="middle" font-size="16" font-weight="700" letter-spacing="0.04em" fill="#ffffff">PROFIT</text>
  <text x="380" y="82" text-anchor="middle" font-size="10" letter-spacing="0.02em" fill="#b9c4d6">net income · EBITDA · margin %</text>

  <!-- ===== ARM HEAD: REVENUE ===== -->
  <rect x="92" y="150" width="176" height="48" rx="11" fill="url(#cardGrad)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cardShadow)"/>
  <text x="180" y="174" text-anchor="middle" font-size="13.5" font-weight="700" letter-spacing="0.03em" fill="hsl(var(--foreground))">REVENUE</text>
  <text x="180" y="189" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">price × volume</text>

  <!-- ===== ARM HEAD: COST ===== -->
  <rect x="492" y="150" width="176" height="48" rx="11" fill="url(#cardGrad)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cardShadow)"/>
  <text x="580" y="174" text-anchor="middle" font-size="13.5" font-weight="700" letter-spacing="0.03em" fill="hsl(var(--foreground))">COST</text>
  <text x="580" y="189" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">fixed + variable</text>

  <!-- ===== REVENUE DRIVER PANEL ===== -->
  <rect x="44" y="232" width="272" height="252" rx="14" fill="hsl(var(--card))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cardShadow)"/>
  <text x="68" y="262" font-size="10.5" font-weight="700" letter-spacing="0.10em" fill="hsl(var(--primary))">REVENUE DRIVERS</text>
  <line x1="68" y1="274" x2="292" y2="274" stroke="hsl(var(--border))" stroke-width="1"/>

  <!-- driver row: Price -->
  <circle cx="73" cy="298" r="3.5" fill="hsl(var(--primary))"/>
  <text x="88" y="302" font-size="13.5" font-weight="600" fill="hsl(var(--foreground))">Price</text>
  <text x="88" y="319" font-size="10.5" fill="hsl(var(--muted-foreground))">list price · discounts · realised price</text>
  <line x1="68" y1="335" x2="292" y2="335" stroke="hsl(var(--border))" stroke-width="0.75" opacity="0.6"/>

  <!-- driver row: Volume -->
  <circle cx="73" cy="360" r="3.5" fill="hsl(var(--primary))"/>
  <text x="88" y="364" font-size="13.5" font-weight="600" fill="hsl(var(--foreground))">Volume</text>
  <text x="88" y="381" font-size="10.5" fill="hsl(var(--muted-foreground))">units sold · by segment or channel</text>
  <line x1="68" y1="397" x2="292" y2="397" stroke="hsl(var(--border))" stroke-width="0.75" opacity="0.6"/>

  <!-- driver row: Mix -->
  <circle cx="73" cy="422" r="3.5" fill="hsl(var(--primary))"/>
  <text x="88" y="426" font-size="13.5" font-weight="600" fill="hsl(var(--foreground))">Mix</text>
  <text x="88" y="443" font-size="10.5" fill="hsl(var(--muted-foreground))">shift between high / low-margin lines</text>

  <text x="68" y="470" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">average price can move with zero price change</text>

  <!-- ===== COST DRIVER PANEL ===== -->
  <rect x="444" y="232" width="272" height="252" rx="14" fill="hsl(var(--card))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cardShadow)"/>
  <text x="468" y="262" font-size="10.5" font-weight="700" letter-spacing="0.10em" fill="hsl(var(--primary))">COST DRIVERS</text>
  <line x1="468" y1="274" x2="692" y2="274" stroke="hsl(var(--border))" stroke-width="1"/>

  <!-- driver row: Variable -->
  <circle cx="473" cy="298" r="3.5" fill="hsl(var(--primary))"/>
  <text x="488" y="302" font-size="13.5" font-weight="600" fill="hsl(var(--foreground))">Variable cost</text>
  <text x="488" y="319" font-size="10.5" fill="hsl(var(--muted-foreground))">materials · labour · packaging · freight</text>
  <line x1="468" y1="335" x2="692" y2="335" stroke="hsl(var(--border))" stroke-width="0.75" opacity="0.6"/>

  <!-- driver row: Fixed -->
  <circle cx="473" cy="360" r="3.5" fill="hsl(var(--primary))"/>
  <text x="488" y="364" font-size="13.5" font-weight="600" fill="hsl(var(--foreground))">Fixed cost</text>
  <text x="488" y="381" font-size="10.5" fill="hsl(var(--muted-foreground))">rent · salaries · depreciation · overhead</text>
  <line x1="468" y1="397" x2="692" y2="397" stroke="hsl(var(--border))" stroke-width="0.75" opacity="0.6"/>

  <!-- driver row: Per-unit -->
  <circle cx="473" cy="422" r="3.5" fill="hsl(var(--primary))"/>
  <text x="488" y="426" font-size="13.5" font-weight="600" fill="hsl(var(--foreground))">Per-unit economics</text>
  <text x="488" y="443" font-size="10.5" fill="hsl(var(--muted-foreground))">cost per unit at the current volume</text>

  <text x="468" y="470" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">low volume inflates per-unit fixed cost</text>
</svg>` },

    { type: 'prose', md: 'The skeleton is not the analysis — it is the scaffold. The real work is descending the branch that matters. The next sections go down each arm to the depth a tough interviewer will push you to, starting with revenue.' },

    { type: 'heading', level: 2, text: 'Down the revenue arm', emphasize: 'revenue arm' },

    { type: 'prose', md: 'Revenue is price × volume × mix, but each of those opens further. Volume is set by supply *and* demand; demand breaks into how many customers you have, how much they spend, and how often. Push deep enough and a vague “sales are down” becomes a precise “we are losing repeat customers in the post-purchase stage.” That precision is the difference between a B and an A.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Revenue decomposition tree five levels deep ending in pre, during, and post customer journey stages", caption: "The full revenue decomposition — five levels deep, from total revenue to where in the customer journey a leak actually sits.", svg: `<svg viewBox="0 0 720 760" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
  </defs>

  <!-- ===== L1 REVENUE root ===== -->
  <rect x="280" y="20" width="160" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="42" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="0.04em" fill="#ffffff">REVENUE</text>
  <text x="360" y="57" text-anchor="middle" font-size="9" fill="#b9c4d6">= price × volume × mix</text>

  <!-- L1->L2 connectors to 3 children -->
  <path d="M360 66 L360 80" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <line x1="130" y1="80" x2="590" y2="80" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M130 80 L130 96" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 80 L360 96" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M590 80 L590 96" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>

  <!-- ===== L2: Price / Volume / Mix ===== -->
  <rect x="60" y="96" width="140" height="40" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="130" y="116" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">PRICE / UNIT</text>
  <text x="130" y="129" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">list → realised</text>

  <rect x="290" y="96" width="140" height="40" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="116" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))"># UNITS</text>
  <text x="360" y="129" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">supply ∩ demand</text>

  <rect x="520" y="96" width="140" height="40" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="590" y="116" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">PRODUCT MIX</text>
  <text x="590" y="129" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">core / non-core</text>

  <!-- # UNITS splits into Supply + Demand (L3) -->
  <path d="M360 136 L360 150" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <line x1="250" y1="150" x2="470" y2="150" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M250 150 L250 164" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M470 150 L470 164" stroke="hsl(var(--border))" stroke-width="1.5"/>

  <!-- L3 Supply -->
  <rect x="180" y="164" width="140" height="38" rx="9" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="250" y="183" text-anchor="middle" font-size="12" font-weight="700" fill="hsl(var(--foreground))">SUPPLY</text>
  <text x="250" y="195" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">can we make/serve enough?</text>

  <!-- L3 Demand -->
  <rect x="400" y="164" width="140" height="38" rx="9" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="470" y="183" text-anchor="middle" font-size="12" font-weight="700" fill="hsl(var(--foreground))">DEMAND</text>
  <text x="470" y="195" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">customers × value × freq</text>

  <!-- Supply -> value chain note panel (L4) -->
  <path d="M250 202 L250 216" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <rect x="60" y="216" width="300" height="118" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="80" y="240" font-size="9.5" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">SUPPLY = VALUE CHAIN CAPACITY</text>
  <text x="80" y="262" font-size="10.5" font-weight="600" fill="hsl(var(--foreground))">Primary:</text>
  <text x="138" y="262" font-size="10.5" fill="hsl(var(--muted-foreground))">procure · make · distribute · serve</text>
  <text x="80" y="282" font-size="10.5" font-weight="600" fill="hsl(var(--foreground))">Support:</text>
  <text x="138" y="282" font-size="10.5" fill="hsl(var(--muted-foreground))">SG&amp;A · IT · people</text>
  <text x="80" y="308" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">A unit not produced is revenue lost —</text>
  <text x="80" y="322" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">check capacity before blaming demand.</text>

  <!-- Demand -> customers / order value / frequency (L4) -->
  <path d="M470 202 L470 216" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <rect x="380" y="216" width="280" height="118" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="400" y="240" font-size="9.5" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">DEMAND BREAKS INTO THREE</text>
  <circle cx="404" cy="259" r="2.5" fill="hsl(var(--primary))"/><text x="414" y="263" font-size="10.5" fill="hsl(var(--foreground))"># Customers — acquisition & retention</text>
  <circle cx="404" cy="281" r="2.5" fill="hsl(var(--primary))"/><text x="414" y="285" font-size="10.5" fill="hsl(var(--foreground))">Avg order value — basket size</text>
  <circle cx="404" cy="303" r="2.5" fill="hsl(var(--primary))"/><text x="414" y="307" font-size="10.5" fill="hsl(var(--foreground))">Order frequency — repeat rate</text>
  <text x="400" y="326" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">revenue/customer = value × frequency</text>

  <!-- L5 # Customers deepest: pre/during/post -->
  <path d="M200 334 L200 350 L520 350" fill="none" stroke="hsl(var(--border))" stroke-width="1.25" stroke-dasharray="3 3"/>
  <text x="200" y="368" font-size="9.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))"># CUSTOMERS — analyse across the journey</text>

  <rect x="60" y="380" width="195" height="92" rx="10" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="78" y="402" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">PRE</text>
  <text x="78" y="420" font-size="9.5" fill="hsl(var(--muted-foreground))">awareness, consideration,</text>
  <text x="78" y="433" font-size="9.5" fill="hsl(var(--muted-foreground))">how they discover you</text>
  <text x="78" y="453" font-size="9" font-style="italic" fill="hsl(var(--muted-foreground))">marketing reach & funnel top</text>

  <rect x="263" y="380" width="195" height="92" rx="10" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="281" y="402" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">DURING</text>
  <text x="281" y="420" font-size="9.5" fill="hsl(var(--muted-foreground))">conversion, pricing,</text>
  <text x="281" y="433" font-size="9.5" fill="hsl(var(--muted-foreground))">purchase experience</text>
  <text x="281" y="453" font-size="9" font-style="italic" fill="hsl(var(--muted-foreground))">where deals are won or lost</text>

  <rect x="466" y="380" width="194" height="92" rx="10" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="484" y="402" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">POST</text>
  <text x="484" y="420" font-size="9.5" fill="hsl(var(--muted-foreground))">retention, loyalty,</text>
  <text x="484" y="433" font-size="9.5" fill="hsl(var(--muted-foreground))">repeat & referral</text>
  <text x="484" y="453" font-size="9" font-style="italic" fill="hsl(var(--muted-foreground))">drives frequency & LTV</text>

  <!-- context band at deepest level -->
  <rect x="60" y="486" width="600" height="64" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="80" y="508" font-size="9.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">WHY GO THIS DEEP</text>
  <text x="80" y="528" font-size="10.5" fill="hsl(var(--foreground))">A revenue drop is never just "sales fell." It is a specific leak — fewer customers in the</text>
  <text x="80" y="543" font-size="10.5" fill="hsl(var(--foreground))">PRE stage, weaker conversion DURING, or lost repeat business POST. Name the level.</text>
</svg>` },

    { type: 'callout', variant: 'tip', title: 'How to read this tree live', md: 'Do not recite it top to bottom. Use the master split to isolate revenue vs cost, then ask one question to pick the revenue sub-branch (“is this a price problem or a volume problem?”), then go deep only there. The depth exists so you can follow the evidence down — not so you can narrate every node.' },

    { type: 'prose', md: 'When the problem clearly sits in the *number of customers*, there is a sharper lens than price × volume: the customer funnel. It localises exactly which stage — awareness, conversion, retention — is leaking, and each stage points to a different fix. Knowing when to switch to this lens is itself a judgement signal.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Customer journey funnel from awareness to advocacy as an alternative revenue decomposition", caption: "An alternative decomposition of the revenue arm — when the issue is the number of customers, the funnel pinpoints which stage is leaking.", svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.20"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>

  <rect x="220" y="18" width="280" height="44" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="0.03em" fill="#ffffff">ALTERNATIVE: THE CUSTOMER FUNNEL</text>
  <text x="360" y="54" text-anchor="middle" font-size="9" fill="#b9c4d6">another way to break down # customers</text>

  <!-- funnel: 5 trapezoid bands narrowing downward, left side. labels + dropoff on right -->
  <!-- band 1 -->
  <path d="M70 84 h300 l-26 52 h-248 z" fill="hsl(214 64% 16%)"/>
  <text x="220" y="116" text-anchor="middle" font-size="13" font-weight="700" fill="#ffffff">Awareness</text>
  <!-- band 2 -->
  <path d="M96 140 h248 l-26 52 h-196 z" fill="hsl(214 58% 26%)"/>
  <text x="220" y="172" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">Consideration</text>
  <!-- band 3 -->
  <path d="M122 196 h196 l-26 52 h-144 z" fill="hsl(356 74% 46%)"/>
  <text x="220" y="228" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">Purchase / Conversion</text>
  <!-- band 4 -->
  <path d="M148 252 h144 l-26 52 h-92 z" fill="hsl(356 64% 56%)"/>
  <text x="220" y="284" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">Retention</text>
  <!-- band 5 -->
  <path d="M174 308 h92 l-26 44 h-40 z" fill="hsl(356 54% 66%)"/>
  <text x="220" y="336" text-anchor="middle" font-size="10.5" font-weight="700" fill="#ffffff">Advocacy</text>

  <!-- right-side stage explainers -->
  <text x="400" y="98" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Do they know you exist?</text>
  <text x="400" y="114" font-size="10" fill="hsl(var(--muted-foreground))">reach · impressions · top-of-funnel spend</text>

  <text x="400" y="156" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Are you on the shortlist?</text>
  <text x="400" y="172" font-size="10" fill="hsl(var(--muted-foreground))">consideration set · brand preference</text>

  <text x="400" y="212" font-size="11" font-weight="700" fill="hsl(var(--primary))">Do they actually buy?</text>
  <text x="400" y="228" font-size="10" fill="hsl(var(--muted-foreground))">conversion rate · pricing · friction at checkout</text>

  <text x="400" y="268" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Do they come back?</text>
  <text x="400" y="284" font-size="10" fill="hsl(var(--muted-foreground))">repeat rate · churn · lifetime value</text>

  <text x="400" y="324" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Do they bring others?</text>
  <text x="400" y="340" font-size="10" fill="hsl(var(--muted-foreground))">referral · word-of-mouth · network effect</text>

  <!-- when-to-use panel -->
  <rect x="40" y="378" width="640" height="138" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="402" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">WHEN TO REACH FOR THIS INSTEAD OF PRICE × VOLUME</text>
  <circle cx="64" cy="424" r="2.5" fill="hsl(var(--primary))"/><text x="74" y="428" font-size="10.5" fill="hsl(var(--foreground))">When the problem is clearly "# customers" — the funnel localises exactly which stage leaks.</text>
  <circle cx="64" cy="446" r="2.5" fill="hsl(var(--primary))"/><text x="74" y="450" font-size="10.5" fill="hsl(var(--foreground))">For digital, D2C, subscription, retail — anywhere acquisition &amp; retention drive the business.</text>
  <circle cx="64" cy="468" r="2.5" fill="hsl(var(--primary))"/><text x="74" y="472" font-size="10.5" fill="hsl(var(--foreground))">Each stage has its own fix: awareness = marketing; conversion = pricing/UX; retention = product.</text>
  <text x="60" y="498" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Same revenue node, different lens. Pick the decomposition that isolates the client's actual leak fastest.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Down the cost arm', emphasize: 'cost arm' },

    { type: 'prose', md: 'The cleanest way to decompose cost is to walk the value chain — follow the product from raw input to the customer, naming the costs incurred at each stage. This mirrors how the business actually spends money, so it surfaces line items a generic “fixed vs variable” split would miss.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Cost value chain with four primary stages and supporting activities, each with cost line items", caption: "The cost base as a value chain — every stage a product passes through, with the specific drivers under each.", svg: `<svg viewBox="0 0 720 780" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="stg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 60% 24%)"/></linearGradient>
  </defs>

  <!-- root -->
  <rect x="270" y="18" width="180" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="0.04em" fill="#ffffff">COST BASE</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">walk the value chain, stage by stage</text>

  <text x="40" y="92" font-size="10" font-weight="700" letter-spacing="0.09em" fill="hsl(var(--primary))">PRIMARY ACTIVITIES — follow the product from raw input to the customer</text>

  <!-- stage chevrons helper: header bar + body. 4 primary stages stacked as full-width rows -->
  <!-- STAGE 1 -->
  <path d="M40 104 h560 l16 16 l-16 16 h-560 z" fill="url(#stg)"/>
  <text x="56" y="125" font-size="12.5" font-weight="700" fill="#ffffff">1 · Procure raw materials</text>
  <text x="430" y="125" font-size="9.5" fill="#b9c4d6">inbound logistics</text>
  <rect x="40" y="140" width="576" height="56" rx="0" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <circle cx="58" cy="160" r="2.5" fill="hsl(var(--primary))"/><text x="68" y="164" font-size="10.5" fill="hsl(var(--foreground))">Raw material cost + supplier contract terms</text>
  <circle cx="330" cy="160" r="2.5" fill="hsl(var(--primary))"/><text x="340" y="164" font-size="10.5" fill="hsl(var(--foreground))">Inbound transport + packaging</text>
  <circle cx="58" cy="182" r="2.5" fill="hsl(var(--primary))"/><text x="68" y="186" font-size="10.5" fill="hsl(var(--foreground))"># Suppliers × contract value × duration</text>
  <circle cx="330" cy="182" r="2.5" fill="hsl(var(--primary))"/><text x="340" y="186" font-size="10.5" fill="hsl(var(--foreground))">Wastage / yield loss at intake</text>

  <!-- STAGE 2 -->
  <path d="M40 206 h560 l16 16 l-16 16 h-560 z" fill="url(#stg)"/>
  <text x="56" y="227" font-size="12.5" font-weight="700" fill="#ffffff">2 · Manufacture</text>
  <text x="430" y="227" font-size="9.5" fill="#b9c4d6">conversion costs</text>
  <rect x="40" y="242" width="576" height="56" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <circle cx="58" cy="262" r="2.5" fill="hsl(var(--primary))"/><text x="68" y="266" font-size="10.5" fill="hsl(var(--foreground))">Plant maintenance + setup costs</text>
  <circle cx="330" cy="262" r="2.5" fill="hsl(var(--primary))"/><text x="340" y="266" font-size="10.5" fill="hsl(var(--foreground))">Idle capacity / downtime losses</text>
  <circle cx="58" cy="284" r="2.5" fill="hsl(var(--primary))"/><text x="68" y="288" font-size="10.5" fill="hsl(var(--foreground))">Labour hours × rate · utilisation</text>
  <circle cx="330" cy="284" r="2.5" fill="hsl(var(--primary))"/><text x="340" y="288" font-size="10.5" fill="hsl(var(--foreground))">Material wastage + equipment wear</text>

  <!-- STAGE 3 -->
  <path d="M40 308 h560 l16 16 l-16 16 h-560 z" fill="url(#stg)"/>
  <text x="56" y="329" font-size="12.5" font-weight="700" fill="#ffffff">3 · Distribute &amp; store</text>
  <text x="430" y="329" font-size="9.5" fill="#b9c4d6">outbound logistics</text>
  <rect x="40" y="344" width="576" height="56" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <circle cx="58" cy="364" r="2.5" fill="hsl(var(--primary))"/><text x="68" y="368" font-size="10.5" fill="hsl(var(--foreground))">Distributor count × order size × frequency</text>
  <circle cx="330" cy="364" r="2.5" fill="hsl(var(--primary))"/><text x="340" y="368" font-size="10.5" fill="hsl(var(--foreground))">Warehousing + storage</text>
  <circle cx="58" cy="386" r="2.5" fill="hsl(var(--primary))"/><text x="68" y="390" font-size="10.5" fill="hsl(var(--foreground))">Outbound transport + packaging</text>
  <circle cx="330" cy="386" r="2.5" fill="hsl(var(--primary))"/><text x="340" y="390" font-size="10.5" fill="hsl(var(--foreground))">Retail channel margin × volume by tier</text>

  <!-- STAGE 4 -->
  <path d="M40 410 h560 l16 16 l-16 16 h-560 z" fill="url(#stg)"/>
  <text x="56" y="431" font-size="12.5" font-weight="700" fill="#ffffff">4 · Post-sales service</text>
  <text x="430" y="431" font-size="9.5" fill="#b9c4d6">after the sale</text>
  <rect x="40" y="446" width="576" height="56" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <circle cx="58" cy="466" r="2.5" fill="hsl(var(--primary))"/><text x="68" y="470" font-size="10.5" fill="hsl(var(--foreground))"># Customers × service frequency × cost</text>
  <circle cx="330" cy="466" r="2.5" fill="hsl(var(--primary))"/><text x="340" y="470" font-size="10.5" fill="hsl(var(--foreground))">Spare parts, replacements, returns</text>
  <circle cx="58" cy="488" r="2.5" fill="hsl(var(--primary))"/><text x="68" y="492" font-size="10.5" fill="hsl(var(--foreground))">Warranty &amp; repair provisioning</text>
  <circle cx="330" cy="488" r="2.5" fill="hsl(var(--primary))"/><text x="340" y="492" font-size="10.5" fill="hsl(var(--foreground))">Waste from defects / inefficiency</text>

  <!-- SUPPORTING -->
  <text x="40" y="528" font-size="10" font-weight="700" letter-spacing="0.09em" fill="hsl(var(--primary))">SUPPORTING ACTIVITIES — spread across every stage above</text>
  <rect x="40" y="538" width="576" height="86" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <circle cx="58" cy="562" r="2.5" fill="hsl(var(--primary))"/><text x="68" y="566" font-size="10.5" fill="hsl(var(--foreground))">R&amp;D / technology</text>
  <circle cx="250" cy="562" r="2.5" fill="hsl(var(--primary))"/><text x="260" y="566" font-size="10.5" fill="hsl(var(--foreground))">Financing costs</text>
  <circle cx="430" cy="562" r="2.5" fill="hsl(var(--primary))"/><text x="440" y="566" font-size="10.5" fill="hsl(var(--foreground))">Branding &amp; advertising</text>
  <circle cx="58" cy="588" r="2.5" fill="hsl(var(--primary))"/><text x="68" y="592" font-size="10.5" fill="hsl(var(--foreground))">Human capital (capacity × efficiency × utilisation)</text>
  <circle cx="430" cy="588" r="2.5" fill="hsl(var(--primary))"/><text x="440" y="592" font-size="10.5" fill="hsl(var(--foreground))">SG&amp;A · overhead</text>
  <text x="58" y="613" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">These rarely move with volume — treat most as fixed when you split fixed vs variable.</text>

  <!-- NAVIGATION layer: the solving intelligence -->
  <rect x="40" y="640" width="640" height="118" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="664" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — DON'T WALK ALL SEVEN, FIND THE BIGGEST MOVER</text>
  <circle cx="64" cy="686" r="2.5" fill="hsl(var(--primary))"/><text x="74" y="690" font-size="10.5" fill="hsl(var(--foreground))">Ask for the cost breakdown first — one or two stages are usually 70%+ of the base.</text>
  <circle cx="64" cy="708" r="2.5" fill="hsl(var(--primary))"/><text x="74" y="712" font-size="10.5" fill="hsl(var(--foreground))">Size which stage moved, then go deep there only. Walking all seven equally wastes time.</text>
  <circle cx="64" cy="730" r="2.5" fill="hsl(var(--primary))"/><text x="74" y="734" font-size="10.5" fill="hsl(var(--foreground))">Manufacturing &amp; raw materials dominate for goods; service &amp; people for services.</text>
  <text x="60" y="752" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The structure shows you everywhere to look; judgement is knowing where not to.</text>
</svg>` },

    { type: 'prose', md: 'The value chain tells you *where* costs live. A second, complementary split — fixed versus variable — tells you how they *behave* as volume changes. That behaviour hides one of the most common traps in profitability cases.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Cost split into variable and fixed with the fixed-cost dilution trap explained", caption: "Splitting cost by behaviour — variable scales with volume, fixed does not. The dilution trap catches candidates who mistake a volume problem for a cost problem.", svg: `<svg viewBox="0 0 760 470" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
  </defs>

  <!-- connectors: COST splits into Variable + Fixed -->
  <path d="M380 92 L380 116" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <line x1="200" y1="116" x2="560" y2="116" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <path d="M200 116 L200 144" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <path d="M560 116 L560 144" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <!-- plus operator -->
  <circle cx="380" cy="116" r="13" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.5" filter="url(#cs)"/>
  <line x1="373" y1="116" x2="387" y2="116" stroke="hsl(var(--foreground))" stroke-width="2" stroke-linecap="round"/>
  <line x1="380" y1="109" x2="380" y2="123" stroke="hsl(var(--foreground))" stroke-width="2" stroke-linecap="round"/>

  <!-- ROOT COST -->
  <rect x="300" y="38" width="160" height="50" rx="12" fill="url(#ng)" filter="url(#rs)"/>
  <text x="380" y="61" text-anchor="middle" font-size="15" font-weight="700" letter-spacing="0.04em" fill="#ffffff">COST</text>
  <text x="380" y="77" text-anchor="middle" font-size="10" fill="#b9c4d6">total cost base</text>

  <!-- VARIABLE panel -->
  <rect x="60" y="144" width="280" height="150" rx="14" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="84" y="172" font-size="13.5" font-weight="700" letter-spacing="0.03em" fill="hsl(var(--foreground))">VARIABLE COST</text>
  <text x="84" y="188" font-size="10" font-weight="700" letter-spacing="0.09em" fill="hsl(var(--primary))">SCALES WITH VOLUME</text>
  <line x1="84" y1="197" x2="316" y2="197" stroke="hsl(var(--border))" stroke-width="1"/>
  <circle cx="88" cy="219" r="3" fill="hsl(var(--primary))"/><text x="100" y="223" font-size="11.5" fill="hsl(var(--foreground))">Raw materials · components</text>
  <circle cx="88" cy="243" r="3" fill="hsl(var(--primary))"/><text x="100" y="247" font-size="11.5" fill="hsl(var(--foreground))">Direct labour · freight</text>
  <circle cx="88" cy="267" r="3" fill="hsl(var(--primary))"/><text x="100" y="271" font-size="11.5" fill="hsl(var(--foreground))">Best expressed per unit</text>

  <!-- FIXED panel -->
  <rect x="420" y="144" width="280" height="150" rx="14" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="444" y="172" font-size="13.5" font-weight="700" letter-spacing="0.03em" fill="hsl(var(--foreground))">FIXED COST</text>
  <text x="444" y="188" font-size="10" font-weight="700" letter-spacing="0.09em" fill="hsl(var(--primary))">INDEPENDENT OF VOLUME</text>
  <line x1="444" y1="197" x2="676" y2="197" stroke="hsl(var(--border))" stroke-width="1"/>
  <circle cx="448" cy="219" r="3" fill="hsl(var(--primary))"/><text x="460" y="223" font-size="11.5" fill="hsl(var(--foreground))">Rent · plant · depreciation</text>
  <circle cx="448" cy="243" r="3" fill="hsl(var(--primary))"/><text x="460" y="247" font-size="11.5" fill="hsl(var(--foreground))">Salaried staff · overhead</text>
  <circle cx="448" cy="267" r="3" fill="hsl(var(--primary))"/><text x="460" y="271" font-size="11.5" fill="hsl(var(--foreground))">Spread over total units</text>

  <!-- THE TRAP callout band -->
  <rect x="60" y="318" width="640" height="120" rx="14" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="84" y="346" font-size="11" font-weight="700" letter-spacing="0.10em" fill="hsl(var(--primary))">THE FIXED-COST DILUTION TRAP</text>
  <text x="84" y="372" font-size="12" fill="hsl(var(--foreground))">When volume falls, fixed cost is spread over fewer units — so cost</text>
  <text x="84" y="391" font-size="12" fill="hsl(var(--foreground))">per unit rises even though nothing got more expensive.</text>
  <text x="84" y="417" font-size="11.5" font-weight="600" fill="hsl(var(--foreground))">Candidates chase cost-cutting when the real fix is recovering volume.</text>
</svg>` },

    { type: 'callout', variant: 'pitfall', title: 'The fixed-cost dilution trap', md: 'When volume falls, fixed cost spreads over fewer units, so cost *per unit* rises — even though nothing actually got more expensive. Candidates see rising unit cost and dive into cost-cutting, when the real fix is recovering volume. Always check whether a “cost problem” is really a disguised volume problem before recommending cuts.' },

    { type: 'heading', level: 2, text: 'Navigating it live', emphasize: 'Navigating it live' },

    { type: 'prose', md: 'Here is the part the casebooks leave out. Knowing the tree is necessary but not sufficient — the skill that earns offers is *navigation*: isolating the side that moved with one question, then working that branch in order, instead of opening all of them at once. This flow is how a strong candidate moves through a profitability case.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Diagnostic decision flow: first ask whether revenue fell or cost rose, then follow the ordered branch", caption: "How to navigate the tree in a live case — isolate revenue vs cost with one question first, then work the branch in order to the likely lever.", svg: `<svg viewBox="0 0 760 560" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="arrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <!-- STEP 1: start -->
  <rect x="280" y="32" width="200" height="48" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="380" y="54" text-anchor="middle" font-size="13.5" font-weight="700" fill="#ffffff">Profit has dropped</text>
  <text x="380" y="70" text-anchor="middle" font-size="9.5" fill="#b9c4d6">resist opening every branch</text>

  <!-- arrow down to the diagnostic question -->
  <path d="M380 80 L380 104" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#arrow)"/>

  <!-- DECISION diamond-ish (rounded) -->
  <rect x="250" y="110" width="260" height="56" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.75" filter="url(#cs)"/>
  <text x="380" y="133" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--primary))">FIRST QUESTION</text>
  <text x="380" y="152" text-anchor="middle" font-size="12" fill="hsl(var(--foreground))">Did revenue fall, or did cost rise?</text>

  <!-- branch arrows -->
  <path d="M300 166 C260 188, 200 188, 175 206" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#arrow)"/>
  <path d="M460 166 C500 188, 560 188, 585 206" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#arrow)"/>
  <text x="232" y="190" text-anchor="middle" font-size="10.5" font-style="italic" fill="hsl(var(--muted-foreground))">revenue</text>
  <text x="528" y="190" text-anchor="middle" font-size="10.5" font-style="italic" fill="hsl(var(--muted-foreground))">cost</text>

  <!-- LEFT branch: REVENUE path -->
  <rect x="40" y="208" width="270" height="300" rx="14" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="64" y="236" font-size="12.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--foreground))">IF REVENUE</text>
  <line x1="64" y1="245" x2="286" y2="245" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="64" y="270" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">ASK IN ORDER</text>
  <text x="64" y="294" font-size="11.5" font-weight="600" fill="hsl(var(--foreground))">1 · Price or volume?</text>
  <text x="64" y="312" font-size="10.5" fill="hsl(var(--muted-foreground))">split realised price from units</text>
  <text x="64" y="338" font-size="11.5" font-weight="600" fill="hsl(var(--foreground))">2 · Which segment?</text>
  <text x="64" y="356" font-size="10.5" fill="hsl(var(--muted-foreground))">localise the drop by line / channel</text>
  <text x="64" y="382" font-size="11.5" font-weight="600" fill="hsl(var(--foreground))">3 · Is it mix?</text>
  <text x="64" y="400" font-size="10.5" fill="hsl(var(--muted-foreground))">check before blaming price</text>
  <rect x="64" y="420" width="222" height="68" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="76" y="442" font-size="10" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">LIKELY LEVER</text>
  <text x="76" y="462" font-size="11" fill="hsl(var(--foreground))">defend price / mix; win back</text>
  <text x="76" y="478" font-size="11" fill="hsl(var(--foreground))">the high-margin segment</text>

  <!-- RIGHT branch: COST path -->
  <rect x="450" y="208" width="270" height="300" rx="14" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="474" y="236" font-size="12.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--foreground))">IF COST</text>
  <line x1="474" y1="245" x2="696" y2="245" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="474" y="270" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">ASK IN ORDER</text>
  <text x="474" y="294" font-size="11.5" font-weight="600" fill="hsl(var(--foreground))">1 · Fixed or variable?</text>
  <text x="474" y="312" font-size="10.5" fill="hsl(var(--muted-foreground))">express variable per unit</text>
  <text x="474" y="338" font-size="11.5" font-weight="600" fill="hsl(var(--foreground))">2 · Did volume fall?</text>
  <text x="474" y="356" font-size="10.5" fill="hsl(var(--muted-foreground))">check the dilution trap first</text>
  <text x="474" y="382" font-size="11.5" font-weight="600" fill="hsl(var(--foreground))">3 · Which line item?</text>
  <text x="474" y="400" font-size="10.5" fill="hsl(var(--muted-foreground))">size the biggest mover</text>
  <rect x="474" y="420" width="222" height="68" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="486" y="442" font-size="10" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">LIKELY LEVER</text>
  <text x="486" y="462" font-size="11" fill="hsl(var(--foreground))">if volume-driven, fix volume —</text>
  <text x="486" y="478" font-size="11" fill="hsl(var(--foreground))">not costs; else target the item</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Worked mini-case', emphasize: 'Worked mini-case' },

    { type: 'prose', md: 'Watch the tree get used on a real prompt. Notice how the candidate isolates the side that moved before opening any branch, hypothesises before asking for numbers, and lands on a specific leak rather than a vague “costs are high.”' },

    { type: 'dialogue', title: 'A snack-foods profitability case', turns: [
      { speaker: 'interviewer', md: 'Our client is a mid-sized Indian packaged-snacks company — think namkeen and chips. Over the last two years their EBITDA margin has fallen from 14% to 9%, even though revenue grew. The CEO wants to know why and what to do. Where do you start?' },
      { speaker: 'candidate', md: 'Profit margin is down while revenue is up, so this is not a demand collapse — something is compressing the gap between revenue and cost. Before I structure: is the 5-point fall in *margin* percentage, and is it fairly steady or a sudden drop? And do we know if revenue grew through price, volume, or mix?' },
      { speaker: 'interviewer', md: 'Margin percentage, declining steadily. Revenue grew almost entirely through volume — they pushed hard into smaller towns. Price per pack is roughly flat.' },
      { speaker: 'candidate', md: 'That is a strong clue. Revenue up on volume, price flat, but margin compressing — so either cost per unit is rising faster than the volume gains, or the new volume is lower-margin. I would split into two checks. First, mix: are the smaller-town sales skewed to cheaper packs or lower-margin lines? Second, cost: is the cost-to-serve those new markets higher? I would start with mix, since volume-led expansion into new geographies usually shifts the product and channel mix.' },
      { speaker: 'interviewer', md: 'Good instinct. Mix has shifted — small towns buy mostly ₹5 and ₹10 packs, which carry thinner margins than the ₹20+ packs that dominate cities. But the team also says distribution costs are up. Walk me through how you would size which matters more.' },
      { speaker: 'candidate', md: 'So we have two compressors — a mix shift toward thin-margin small packs, and higher distribution cost to reach dispersed rural retail. On the cost side I would walk the value chain to the distribution stage specifically: cost is likely distributor count × drop size × frequency, and rural has many small drops, so cost per unit delivered is structurally higher. To size which matters more, I would compare the margin per pack lost to mix against the incremental distribution cost per unit for the new markets. If mix explains, say, three of the five points and distribution two, the recommendation is mix-led: rationalise the small-pack push or re-price it, while attacking rural distribution efficiency as the secondary lever.' },
      { speaker: 'narrator', md: 'The candidate never opened the price branch or the manufacturing branch — the early questions ruled them out. They followed volume → mix and the value chain → distribution, the two branches the evidence pointed to, and sized them against each other before recommending. That is navigation, not recitation.', note: 'Isolate, hypothesise, go deep only where the evidence leads, then size before you conclude.' },
    ]},

    { type: 'callout', variant: 'insight', title: 'What made that an A-grade structure', md: 'The candidate used the master tree to orient, then let the interviewer’s answers prune the tree — closing price and manufacturing early, descending only volume→mix and the distribution stage of the value chain. The tree was the map; the questions were the navigation. That is exactly what the diagnostic flow above trains.' },

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'You will be able to draw the profitability master tree from memory — Profit = Revenue − Cost, each decomposed to pullable levers — and use it as the opening structure for any profit, margin, or cost prompt.',
      'You will decompose revenue to depth: price × volume × mix, with volume splitting into supply and demand, and demand into customers × order value × frequency — and switch to the customer funnel when the issue is the number of customers.',
      'You will decompose cost by walking the value chain stage by stage, then cross-check with a fixed-versus-variable split to expose the dilution trap.',
      'You will avoid the fixed-cost dilution trap: a rising per-unit cost driven by falling volume is a volume problem, not a cost problem.',
      'You will navigate the tree, not recite it — isolate the side that moved with one question, hypothesise before asking for numbers, descend only the branch the evidence supports, and size competing causes before concluding.',
    ]},
  ],
};
