import type { Page } from '@/lib/casebook/types';

export const pricing: Page = {
  slug: 'core-frameworks/pricing',
  title: 'Pricing',
  titleEmphasize: 'Pricing',
  subtitle: 'What should we charge? Pricing cases reward the candidate who leads with what the customer will pay rather than defaulting to cost-plus. This page covers the three methods, the price band that bounds the answer, elasticity, and the launch plays the casebooks leave out.',
  kind: 'framework',
  meta: { readingTimeMin: 17, tags: ['core-frameworks', 'pricing'], caseType: 'Pricing' },
  blocks: [
    { type: 'hook', md: 'Ask a weak candidate to price something and they reach for cost plus a margin — the one method that ignores the only thing that matters: what the customer will actually pay. Cost tells you the floor you must clear, not the price you should charge. The skill in a pricing case is to bound the problem between cost and willingness-to-pay, then place the price deliberately for the objective — not to mark up a spreadsheet.', emphasize: 'what the customer will actually pay' },

    { type: 'prose', md: 'A pricing case gives you a product and asks what to charge — for a new launch, a relaunch, or a repricing. Like profitability, it is one connected decision: establish the objective, bound the viable range, choose a method to land within it, and sense-check against how demand responds. Get the logic right and the number follows.' },

    { type: 'callout', variant: 'insight', title: 'Objective first, always', md: 'The same product can have three right prices depending on the goal. Maximising profit, grabbing market share, and signalling a premium brand each point to a different number. Pin down the objective before you compute anything — it is the lens that turns a range of viable prices into a single recommendation.' },

    { type: 'heading', level: 2, text: 'The three methods', emphasize: 'three methods' },

    { type: 'prose', md: 'There are three ways to price, and the cleanest way to hold them is internal-looking versus external-looking: cost (what it costs us) looks inward and sets the floor, while competitor benchmarking and value/willingness-to-pay look outward and define the ceiling.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Pricing methods master: cost-based, competitor-based, and value-based, framed internal vs external", caption: "The three pricing methods, framed internal-looking (cost — the floor) versus external-looking (competitor benchmark and value — the ceiling).", svg: `<svg viewBox="0 0 720 560" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="270" y="18" width="180" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="0.02em" fill="#ffffff">PRICING</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">three methods, two directions to look</text>

  <path d="M360 64 C360 84, 190 82, 190 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <path d="M360 64 C360 84, 530 82, 530 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>

  <!-- INTERNAL -->
  <rect x="40" y="102" width="300" height="44" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="190" y="123" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">INTERNAL-LOOKING</text>
  <text x="190" y="138" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">what does it cost us? — the floor</text>

  <rect x="40" y="160" width="300" height="150" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="58" y="182" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">COST-BASED (cost-plus)</text>
  <text x="58" y="197" font-size="8.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">PRICE = COST + MARKUP</text>
  <circle cx="60" cy="217" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="221" font-size="10" fill="hsl(var(--foreground))">Fixed + variable cost per unit</text>
  <circle cx="60" cy="239" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="243" font-size="10" fill="hsl(var(--foreground))">R&amp;D / one-time costs to recover</text>
  <circle cx="60" cy="261" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="265" font-size="10" fill="hsl(var(--foreground))">Target margin, breakeven, payback</text>
  <text x="58" y="290" font-size="9" font-style="italic" fill="hsl(var(--muted-foreground))">+ simple, guarantees cost recovery</text>
  <text x="58" y="304" font-size="9" font-style="italic" fill="hsl(var(--muted-foreground))">− ignores what the customer will pay</text>

  <!-- EXTERNAL -->
  <rect x="380" y="102" width="300" height="44" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="530" y="123" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">EXTERNAL-LOOKING</text>
  <text x="530" y="138" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">what is it worth out there? — the ceiling</text>

  <path d="M530 146 C530 156, 455 154, 455 164" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M530 146 C530 156, 605 154, 605 164" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>

  <rect x="370" y="164" width="150" height="146" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="388" y="186" font-size="11" font-weight="700" fill="hsl(var(--foreground))">COMPETITOR</text>
  <text x="388" y="200" font-size="8.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">BENCHMARK</text>
  <circle cx="390" cy="219" r="2.5" fill="hsl(var(--primary))"/><text x="400" y="223" font-size="9.5" fill="hsl(var(--foreground))">Rivals' prices</text>
  <circle cx="390" cy="240" r="2.5" fill="hsl(var(--primary))"/><text x="400" y="244" font-size="9.5" fill="hsl(var(--foreground))">Reference price</text>
  <circle cx="390" cy="261" r="2.5" fill="hsl(var(--primary))"/><text x="400" y="265" font-size="9.5" fill="hsl(var(--foreground))">Feature deltas</text>
  <circle cx="390" cy="282" r="2.5" fill="hsl(var(--primary))"/><text x="400" y="286" font-size="9.5" fill="hsl(var(--foreground))">Substitutes</text>

  <rect x="530" y="164" width="150" height="146" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="548" y="186" font-size="11" font-weight="700" fill="hsl(var(--foreground))">VALUE-BASED</text>
  <text x="548" y="200" font-size="8.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">WILLINGNESS TO PAY</text>
  <circle cx="550" cy="219" r="2.5" fill="hsl(var(--primary))"/><text x="560" y="223" font-size="9.5" fill="hsl(var(--foreground))">Value to customer</text>
  <circle cx="550" cy="240" r="2.5" fill="hsl(var(--primary))"/><text x="560" y="244" font-size="9.5" fill="hsl(var(--foreground))">Opportunity cost</text>
  <circle cx="550" cy="261" r="2.5" fill="hsl(var(--primary))"/><text x="560" y="265" font-size="9.5" fill="hsl(var(--foreground))">of no product</text>
  <circle cx="550" cy="282" r="2.5" fill="hsl(var(--primary))"/><text x="560" y="286" font-size="9.5" fill="hsl(var(--foreground))">Extrapolate benefit</text>

  <!-- nav band -->
  <rect x="40" y="330" width="640" height="208" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="354" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — COST IS THE FLOOR, VALUE IS THE CEILING, PRICE SITS BETWEEN</text>
  <circle cx="64" cy="378" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="382" font-size="10.5" fill="hsl(var(--foreground))">Cost sets the floor (below it you lose money); value/WTP sets the ceiling (above it nobody buys);</text>
  <text x="74" y="398" font-size="10.5" fill="hsl(var(--foreground))">competitors anchor where in that band the market expects you to land.</text>
  <circle cx="64" cy="420" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="424" font-size="10.5" fill="hsl(var(--foreground))">Default to VALUE-BASED when you can — it captures the most. Cost-plus is the fallback when value is</text>
  <text x="74" y="440" font-size="10.5" fill="hsl(var(--foreground))">genuinely unknowable; pure cost-plus leaves money on the table whenever customers would pay more.</text>
  <circle cx="64" cy="462" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="466" font-size="10.5" fill="hsl(var(--foreground))">Strong answers triangulate all three into a price RANGE, then pick within it based on the objective.</text>
  <circle cx="64" cy="488" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="492" font-size="10.5" fill="hsl(var(--foreground))">The objective decides: profit-max, market penetration, or brand positioning each point to a different price.</text>
  <text x="60" y="518" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Never lead with "cost plus 20%." Start from value and the customer, then check it clears cost and fits the market.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'The price band', emphasize: 'price band' },

    { type: 'prose', md: 'Those methods together bound the answer. Cost is the floor — price below it and every sale loses money. Willingness-to-pay is the ceiling — price above it and nobody buys. The competitor reference price anchors where in that band the market expects you to sit. Find the band first; it turns an open question into a bounded one.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Vertical price band showing cost floor, WTP ceiling, competitor reference, and objective markers", caption: "The price band — cost is the floor, willingness-to-pay the ceiling, and the competitor price anchors the middle. The objective places the price within it.", svg: `<svg viewBox="0 0 720 480" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="245" y="18" width="230" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="0.02em" fill="#ffffff">THE PRICE BAND</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">cost floor, value ceiling, price in between</text>

  <!-- vertical scale on left -->
  <text x="95" y="92" text-anchor="middle" font-size="9" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--muted-foreground))">HIGH</text>
  <text x="95" y="372" text-anchor="middle" font-size="9" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--muted-foreground))">LOW</text>
  <line x1="120" y1="98" x2="120" y2="360" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>

  <!-- CEILING band (value / WTP) -->
  <rect x="140" y="100" width="320" height="46" rx="6" fill="hsl(356 74% 46%)" opacity="0.12" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="160" y="121" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">CEILING — willingness to pay</text>
  <text x="160" y="137" font-size="9" fill="hsl(var(--muted-foreground))">above this, the customer walks away</text>

  <!-- competitor reference line -->
  <line x1="140" y1="200" x2="460" y2="200" stroke="hsl(var(--border-strong))" stroke-width="1.5" stroke-dasharray="6 3"/>
  <text x="160" y="194" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">Competitor reference price</text>
  <text x="160" y="216" font-size="9" fill="hsl(var(--muted-foreground))">where the market currently anchors</text>

  <!-- the viable price zone -->
  <rect x="140" y="148" width="320" height="160" rx="6" fill="hsl(214 60% 30%)" opacity="0.06"/>
  <text x="300" y="262" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">your price lives somewhere in this zone —</text>
  <text x="300" y="276" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">the objective decides where</text>

  <!-- FLOOR band (cost) -->
  <rect x="140" y="310" width="320" height="46" rx="6" fill="hsl(214 50% 40%)" opacity="0.12" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <text x="160" y="331" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">FLOOR — unit cost</text>
  <text x="160" y="347" font-size="9" fill="hsl(var(--muted-foreground))">below this, every sale loses money</text>

  <!-- objective markers on the right -->
  <text x="480" y="121" font-size="9" font-weight="700" fill="hsl(var(--primary))">skim / brand →</text>
  <text x="480" y="200" font-size="9" font-weight="700" fill="hsl(var(--foreground))">match market →</text>
  <text x="480" y="331" font-size="9" font-weight="700" fill="hsl(var(--foreground))">penetrate →</text>

  <!-- nav band -->
  <rect x="40" y="376" width="640" height="86" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="400" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — FIND THE BAND FIRST, THEN PLACE THE PRICE BY OBJECTIVE</text>
  <circle cx="64" cy="424" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="428" font-size="10.5" fill="hsl(var(--foreground))">Establish the floor (cost) and ceiling (WTP) to bound the problem, then use the objective to place the price:</text>
  <text x="74" y="444" font-size="10.5" fill="hsl(var(--foreground))">near the ceiling to skim or signal premium, near the floor to penetrate, near competitors to play it safe.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'The value ladder', emphasize: 'value ladder' },

    { type: 'prose', md: 'The most important method is value-based, and the clearest way to see it is as a ladder. You start at cost and climb — every rupee of price above cost has to be justified by something the customer values: a new utility, an innovation, higher quality, brand. Name those layers and you can defend a premium.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Value ladder stepping from cost base up through value layers to the marked price", caption: "The value ladder — price climbs above cost only as far as customer-valued layers (new utility, innovation, quality, brand) justify.", svg: `<svg viewBox="0 0 720 470" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="235" y="18" width="250" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="0.02em" fill="#ffffff">THE VALUE LADDER</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">what justifies a price above cost?</text>

  <!-- left: COST base -->
  <rect x="50" y="120" width="120" height="150" rx="8" fill="hsl(214 64% 19%)"/>
  <text x="110" y="112" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--foreground))">COST</text>
  <text x="110" y="195" text-anchor="middle" font-size="9" fill="#ffffff">what it costs</text>
  <text x="110" y="208" text-anchor="middle" font-size="9" fill="#ffffff">us to make</text>
  <text x="110" y="290" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">the floor</text>

  <!-- the climbing layers -->
  <rect x="200" y="232" width="110" height="38" rx="6" fill="hsl(214 56% 30%)"/>
  <text x="255" y="255" text-anchor="middle" font-size="9.5" font-weight="600" fill="#ffffff">New utility</text>
  <rect x="320" y="194" width="110" height="38" rx="6" fill="hsl(214 50% 38%)"/>
  <text x="375" y="217" text-anchor="middle" font-size="9.5" font-weight="600" fill="#ffffff">Innovation</text>
  <rect x="440" y="156" width="110" height="38" rx="6" fill="hsl(356 64% 50%)"/>
  <text x="495" y="179" text-anchor="middle" font-size="9.5" font-weight="600" fill="#ffffff">Quality</text>
  <rect x="560" y="118" width="110" height="38" rx="6" fill="hsl(356 74% 46%)"/>
  <text x="615" y="141" text-anchor="middle" font-size="9.5" font-weight="600" fill="#ffffff">Brand</text>

  <!-- dashed climb line -->
  <path d="M170 232 L200 232 M310 213 L320 213 M430 175 L440 175 M550 137 L560 137" stroke="hsl(var(--border-strong))" stroke-width="1.25" stroke-dasharray="3 2" fill="none"/>

  <!-- price ceiling marker -->
  <line x1="560" y1="100" x2="680" y2="100" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-dasharray="5 3"/>
  <text x="620" y="94" text-anchor="middle" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">MARKED PRICE</text>

  <!-- baseline -->
  <line x1="50" y1="270" x2="680" y2="270" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>

  <!-- nav band -->
  <rect x="40" y="300" width="640" height="158" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="324" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — THE GAP BETWEEN COST AND PRICE IS VALUE YOU CAN JUSTIFY</text>
  <circle cx="64" cy="348" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="352" font-size="10.5" fill="hsl(var(--foreground))">Every rupee of price above cost has to be earned by something the customer values — a new utility, an</text>
  <text x="74" y="368" font-size="10.5" fill="hsl(var(--foreground))">innovation, higher quality, or brand. Name the layers and you can defend a premium with conviction.</text>
  <circle cx="64" cy="390" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="394" font-size="10.5" fill="hsl(var(--foreground))">This is the value-based method made visual: start at cost, climb each value layer to reach a defensible price.</text>
  <circle cx="64" cy="416" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="420" font-size="10.5" fill="hsl(var(--foreground))">If you cannot name the layers, you cannot justify the premium — and competitors will undercut you to cost.</text>
  <text x="60" y="446" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">For a genuinely new product with no reference price, this ladder IS your pricing logic — build up from cost via value.</text>
</svg>` },

    { type: 'callout', variant: 'tip', title: 'Build creative proxies for value', md: 'Interviewers rarely hand you willingness-to-pay — you have to estimate it. Use proxies: what does the customer pay for the next-best alternative, what does the product save or earn them, what is the cost of having no solution at all? "This software saves a 50-person team an hour a day, so it is worth roughly that much labour cost" is the kind of value reasoning that justifies a price far above cost.' },

    { type: 'heading', level: 2, text: 'What kind of product is it?', emphasize: 'What kind of product' },

    { type: 'prose', md: 'How you price depends on what you are pricing. A product with close competitors has a reference price to anchor against; a genuinely new invention has none, so you must build up from cost via the value ladder. And for a new launch, two opposite strategies — skimming and penetration — flow from the objective.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Product nature spectrum from new invention to vs-rival, plus skimming versus penetration launch plays", caption: "The nature of the product picks the method — new invention leans on value, an existing rival product leans on benchmarking. For launches, skim versus penetrate.", svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="215" y="18" width="290" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="12.5" font-weight="700" letter-spacing="0.02em" fill="#ffffff">WHAT KIND OF PRODUCT IS IT?</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">the nature of the product picks your method</text>

  <!-- spectrum of 4 -->
  <path d="M40 92 h140 l14 16 l-14 16 h-140 z" fill="hsl(356 74% 46%)"/>
  <text x="105" y="114" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff">NEW INVENTION</text>
  <path d="M204 92 h150 l14 16 l-14 16 h-150 z" fill="hsl(214 56% 28%)"/>
  <text x="272" y="114" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff">MODIFICATION</text>
  <path d="M378 92 h150 l14 16 l-14 16 h-150 z" fill="hsl(214 56% 24%)"/>
  <text x="446" y="114" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff">SIMILAR EXISTING</text>
  <path d="M552 92 h116 l14 16 l-14 16 h-116 z" fill="hsl(214 64% 19%)"/>
  <text x="603" y="114" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff">VS A RIVAL</text>

  <text x="105" y="146" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">no reference price —</text>
  <text x="105" y="158" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">value-based / ladder</text>
  <text x="272" y="146" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">anchor to the old</text>
  <text x="272" y="158" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">price + value delta</text>
  <text x="446" y="146" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">benchmark to peers,</text>
  <text x="446" y="158" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">adjust for features</text>
  <text x="603" y="146" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">match / undercut,</text>
  <text x="603" y="158" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">price to win share</text>

  <text x="360" y="186" text-anchor="middle" font-size="9" font-style="italic" fill="hsl(var(--muted-foreground))">left = least reference, lean on value; right = more reference, lean on benchmark</text>

  <!-- launch strategy split -->
  <rect x="40" y="202" width="640" height="34" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="224" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">FOR A NEW LAUNCH — TWO OPPOSITE PLAYS</text>

  <rect x="40" y="248" width="310" height="120" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="58" y="270" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">SKIMMING</text>
  <text x="58" y="285" font-size="8.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">START HIGH, LOWER LATER</text>
  <circle cx="60" cy="305" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="309" font-size="10" fill="hsl(var(--foreground))">Capture high-WTP early adopters first</text>
  <circle cx="60" cy="326" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="330" font-size="10" fill="hsl(var(--foreground))">Recover R&amp;D fast; signal premium</text>
  <circle cx="60" cy="347" r="2.5" fill="hsl(var(--foreground))"/><text x="70" y="351" font-size="10" fill="hsl(var(--foreground))">Best when differentiated, low rivalry</text>

  <rect x="370" y="248" width="310" height="120" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="388" y="270" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">PENETRATION</text>
  <text x="388" y="285" font-size="8.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">START LOW, BUILD SHARE</text>
  <circle cx="390" cy="305" r="2.5" fill="hsl(var(--primary))"/><text x="400" y="309" font-size="10" fill="hsl(var(--foreground))">Win volume and market share fast</text>
  <circle cx="390" cy="326" r="2.5" fill="hsl(var(--primary))"/><text x="400" y="330" font-size="10" fill="hsl(var(--foreground))">Deter entry; build network / scale</text>
  <circle cx="390" cy="347" r="2.5" fill="hsl(var(--foreground))"/><text x="400" y="351" font-size="10" fill="hsl(var(--foreground))">Best when elastic, scale matters</text>

  <!-- nav band -->
  <rect x="40" y="386" width="640" height="136" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="410" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — THE PRODUCT TYPE AND THE OBJECTIVE PICK THE PLAY</text>
  <circle cx="64" cy="434" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="438" font-size="10.5" fill="hsl(var(--foreground))">A genuinely new product has no reference price — build up from cost via the value ladder, then choose skim</text>
  <text x="74" y="454" font-size="10.5" fill="hsl(var(--foreground))">or penetrate based on the objective and how easily rivals can copy you.</text>
  <circle cx="64" cy="476" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="480" font-size="10.5" fill="hsl(var(--foreground))">Skim if you are differentiated and want margin now; penetrate if the market is price-sensitive and scale wins.</text>
  <text x="60" y="506" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">An existing product already has an anchor — the question is whether to hold, raise, or cut from that reference.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Why the best price isn\'t the highest', emphasize: 'isn\'t the highest' },

    { type: 'prose', md: 'A common trap is to price right at willingness-to-pay. But profit is price times volume minus cost — and raising price sheds volume. The profit-maximising price sits below the ceiling, at the peak of the trade-off. How far below depends on elasticity: how sharply volume falls when price rises.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Elasticity profit curve showing the profit-maximising price below willingness-to-pay", caption: "Elasticity — the profit curve peaks below willingness-to-pay because raising price loses volume. How far below depends on how elastic demand is.", svg: `<svg viewBox="0 0 720 500" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="205" y="18" width="310" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="12.5" font-weight="700" letter-spacing="0.02em" fill="#ffffff">WHY THE BEST PRICE ISN'T THE HIGHEST</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">elasticity — raise price, lose volume; profit is the trade-off</text>

  <!-- chart axes -->
  <line x1="90" y1="100" x2="90" y2="300" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <line x1="90" y1="300" x2="560" y2="300" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <text x="60" y="200" text-anchor="middle" font-size="9.5" font-weight="700" fill="hsl(var(--muted-foreground))" transform="rotate(-90 60 200)">PROFIT</text>
  <text x="325" y="322" text-anchor="middle" font-size="9.5" font-weight="700" fill="hsl(var(--muted-foreground))">PRICE →</text>

  <!-- profit curve (inverted U) -->
  <path d="M110 290 Q 230 90, 325 120 Q 440 150, 540 285" fill="none" stroke="hsl(var(--primary))" stroke-width="2.5"/>

  <!-- peak marker -->
  <line x1="305" y1="118" x2="305" y2="300" stroke="hsl(var(--border-strong))" stroke-width="1.25" stroke-dasharray="4 3"/>
  <circle cx="305" cy="113" r="4" fill="hsl(var(--primary))"/>
  <text x="305" y="103" text-anchor="middle" font-size="10" font-weight="700" fill="hsl(var(--primary))">profit-max price</text>

  <!-- too low / too high labels -->
  <text x="140" y="278" font-size="8.5" fill="hsl(var(--muted-foreground))">too low:</text>
  <text x="140" y="290" font-size="8.5" fill="hsl(var(--muted-foreground))">volume, thin margin</text>
  <text x="470" y="270" font-size="8.5" fill="hsl(var(--muted-foreground))">too high:</text>
  <text x="470" y="282" font-size="8.5" fill="hsl(var(--muted-foreground))">margin, no volume</text>

  <!-- side note panel -->
  <rect x="580" y="100" width="110" height="200" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="595" y="122" font-size="9" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">ELASTICITY</text>
  <text x="595" y="142" font-size="8.5" fill="hsl(var(--foreground))">how much</text>
  <text x="595" y="154" font-size="8.5" fill="hsl(var(--foreground))">volume drops</text>
  <text x="595" y="166" font-size="8.5" fill="hsl(var(--foreground))">when price rises</text>
  <text x="595" y="190" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">Elastic:</text>
  <text x="595" y="202" font-size="8.5" fill="hsl(var(--muted-foreground))">volume very</text>
  <text x="595" y="214" font-size="8.5" fill="hsl(var(--muted-foreground))">price-sensitive</text>
  <text x="595" y="236" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">Inelastic:</text>
  <text x="595" y="248" font-size="8.5" fill="hsl(var(--muted-foreground))">volume holds</text>
  <text x="595" y="260" font-size="8.5" fill="hsl(var(--muted-foreground))">as price rises</text>
  <text x="595" y="284" font-size="8" font-style="italic" fill="hsl(var(--muted-foreground))">inelastic =</text>
  <text x="595" y="295" font-size="8" font-style="italic" fill="hsl(var(--muted-foreground))">room to raise</text>

  <!-- nav band -->
  <rect x="40" y="330" width="640" height="158" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="354" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — PRICE FOR PROFIT, NOT FOR THE BIGGEST NUMBER</text>
  <circle cx="64" cy="378" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="382" font-size="10.5" fill="hsl(var(--foreground))">Profit = price × volume − cost. Raising price lifts margin per unit but loses volume; the best price balances</text>
  <text x="74" y="398" font-size="10.5" fill="hsl(var(--foreground))">the two. That is why the profit-maximising price sits below willingness-to-pay, not at it.</text>
  <circle cx="64" cy="420" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="424" font-size="10.5" fill="hsl(var(--foreground))">Ask how elastic demand is: if inelastic (few substitutes, essential, loyal), there is room to raise price;</text>
  <text x="74" y="440" font-size="10.5" fill="hsl(var(--foreground))">if elastic (many substitutes, discretionary), a price rise can cut profit by driving volume away.</text>
  <circle cx="64" cy="462" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="466" font-size="10.5" fill="hsl(var(--foreground))">In a case, you rarely have the exact curve — reason qualitatively about elasticity and the volume trade-off.</text>
</svg>` },

    { type: 'callout', variant: 'pitfall', title: 'Don\'t confuse the highest price with the best price', md: 'Charging the maximum a few customers would pay can leave you with high margin and almost no volume — less total profit than a lower price that sells far more. Always reason about the volume you give up when you raise price. If demand is inelastic (essentials, few substitutes, loyal customers) there is room to push price; if elastic (discretionary, many substitutes) a rise can backfire.' },

    { type: 'heading', level: 2, text: 'Navigating it live', emphasize: 'Navigating it live' },

    { type: 'prose', md: 'Put it together as a live path: objective, then product and customer, then bound the band, then triangulate the methods, then place the price for the goal with elasticity in mind.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Pricing diagnostic flow as a five-step path with an elasticity-and-objective gate", caption: "How to run a pricing case live — clarify the objective, understand product and customer, bound the band, triangulate the methods, place the price.", svg: `<svg viewBox="0 0 720 558" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="195" y="20" width="330" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="42" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">1 · Clarify the objective</text>
  <text x="360" y="57" text-anchor="middle" font-size="9" fill="#b9c4d6">profit-max, market share, breakeven, or brand positioning?</text>

  <path d="M360 66 C360 80, 360 80, 360 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="94" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="116" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">2 · Understand the product &amp; customer</text>
  <text x="360" y="133" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">new or existing? who buys it, and what is it worth to them?</text>

  <path d="M360 144 C360 158, 360 158, 360 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="172" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="194" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">3 · Bound the band — floor and ceiling</text>
  <text x="360" y="211" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">cost sets the floor; willingness-to-pay sets the ceiling</text>

  <path d="M360 222 C360 236, 360 236, 360 248" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="250" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="272" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">4 · Triangulate the three methods</text>
  <text x="360" y="289" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">value-based lead, checked against cost-plus and competitors</text>

  <path d="M360 300 C360 314, 360 314, 360 326" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="210" y="328" width="300" height="44" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#cs)"/>
  <text x="360" y="348" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="0.02em" fill="hsl(var(--primary))">CHECK ELASTICITY &amp; THE OBJECTIVE</text>
  <text x="360" y="364" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">place the price in the band for the goal, not the max number</text>

  <path d="M360 372 C360 386, 360 386, 360 398" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="400" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="422" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">5 · Recommend a price (or a range)</text>
  <text x="360" y="439" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">with the logic, and how you'd test it before committing</text>

  <rect x="40" y="466" width="640" height="80" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="490" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">THE MOVE THAT SCORES — OBJECTIVE FIRST, VALUE-LED, BOUNDED BY THE BAND</text>
  <text x="60" y="510" font-size="10.5" fill="hsl(var(--foreground))">Weak answers jump to "cost plus a margin." Strong ones anchor on the objective, lead with what the customer</text>
  <text x="60" y="528" font-size="10.5" fill="hsl(var(--foreground))">will pay, bound it by cost and WTP, and place the price deliberately — not at the highest number the market allows.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Worked mini-case', emphasize: 'Worked mini-case' },

    { type: 'prose', md: 'Watch the method in action — note how the candidate refuses to start from cost, pins the objective, estimates value with a proxy, bounds the band, and lets elasticity and objective place the final price.' },

    { type: 'dialogue', title: 'Pricing a new water purifier', turns: [
      { speaker: 'interviewer', md: 'An Indian appliance company has developed a new home water purifier with a filter that lasts twice as long as anything on the market. What price should they set?' },
      { speaker: 'candidate', md: 'Before a number, two questions. What is the objective — profit, share, or premium positioning? And is there anything directly comparable, or is this genuinely new? My hypothesis is it is a modification of an existing category (purifiers exist) with a real innovation (the long-life filter), so I have both a reference price to anchor on and a value story to climb above it.' },
      { speaker: 'interviewer', md: 'The objective is profit, and yes — standard purifiers retail around ₹15,000. Where do you go?' },
      { speaker: 'candidate', md: 'Then I would bound the band. The floor is their unit cost — say it is ₹8,000 to make and they want a healthy margin, so they will not go below maybe ₹11,000-12,000. The ceiling is willingness-to-pay, and here the long-life filter is the value story. A normal purifier needs filter replacements costing, say, ₹2,000 a year; if this one halves that, it saves the customer roughly ₹1,000 a year, or ₹4,000-5,000 over its life. So a rational customer should pay up to about ₹4,000-5,000 more than a standard ₹15,000 unit — a ceiling near ₹19,000-20,000.' },
      { speaker: 'interviewer', md: 'So you would price at ₹20,000?' },
      { speaker: 'candidate', md: 'No — that is the ceiling, not the best price. Two reasons. First, most customers do not fully rationalise lifetime savings, so I would not assume they will pay the entire ₹5,000 premium up front. Second, the objective is profit, not the highest price: purifiers are fairly elastic — there are cheaper substitutes — so pricing at the very top would lose a lot of volume. I would position it at a clear but not maximal premium, around ₹17,000-18,000: meaningfully above the ₹15,000 reference to capture the filter value and signal quality, but not so high that the volume loss outweighs the margin. I would also suggest testing two price points in a few markets before a national launch.' },
      { speaker: 'narrator', md: 'The candidate refused to start from cost, pinned the objective, used a value proxy (filter savings) to estimate the ceiling, bounded the band between cost and WTP, and then placed the price below the ceiling for elasticity and the profit objective — even proposing a price test.', note: 'Objective first, value proxy for the ceiling, then place below it for elasticity and goal.' },
    ]},

    { type: 'callout', variant: 'note', title: 'Pricing is a lever, not an island', md: 'Pricing shows up inside other cases constantly. It is one branch of the revenue side of a Profitability tree, and a core organic lever in a Growth case (revenue per user). When a pricing question appears mid-case, the same logic applies — bound the band, lead with value, place for the objective — and naming that connection signals you see the whole picture.' },

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'You will pin the objective first — profit, share, breakeven, or brand — because the same product has a different right price for each goal.',
      'You will hold the three methods as cost (internal, the floor) versus competitor benchmarking and value/WTP (external, the ceiling), and lead with value rather than defaulting to cost-plus.',
      'You will bound the answer in a price band between cost and willingness-to-pay, using the competitor reference to anchor, before proposing any number.',
      'You will estimate value with creative proxies — savings, next-best alternative, cost of no solution — to justify a premium above cost via the value ladder.',
      'You will place the price below the ceiling for profit, reasoning about elasticity and the volume you give up, and recognise pricing as a lever inside Profitability and Growth cases too.',
    ]},
  ],
};
