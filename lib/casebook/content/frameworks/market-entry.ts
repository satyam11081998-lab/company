import type { Page } from '@/lib/casebook/types';

export const marketEntry: Page = {
  slug: 'core-frameworks/market-entry',
  title: 'Market Entry',
  titleEmphasize: 'Market Entry',
  subtitle: 'Should we enter this market — and if so, how? The second-most-common case shape, and the one where candidates most often jump to "how" before earning the right to ask it. This page gives you the full decision, in order, with the navigation the casebooks skip.',
  kind: 'framework',
  meta: { readingTimeMin: 18, tags: ['core-frameworks', 'market-entry'], caseType: 'Market Entry' },
  blocks: [
    { type: 'hook', md: 'Every market-entry case is really four questions hiding inside one: is the market attractive, can we win, will it pay, and how should we go in. Weak candidates answer the fourth one first — picking "joint venture" in minute two before proving the market is even worth entering. Strong candidates walk the four in order and stop the moment the answer turns to no. This page is that walk, made visual.', emphasize: 'four questions hiding inside one' },

    { type: 'prose', md: 'Market entry shows up whenever a client considers a new geography, segment, channel, or product line. The framework is a sequence of gates: each question must clear before the next one matters. Get the order right and you sound like someone who has actually advised on an entry; get it wrong and you sound like someone reciting buckets.' },

    { type: 'callout', variant: 'insight', title: 'The order is the framework', md: 'Unlike profitability — where you decompose one equation — market entry is a *sequence of decisions*. Attractive? Then: can we win? Then: will it pay? Only then: how? Each gate can end the case. The discipline of walking them in order, and stopping early when a gate fails, is the single biggest differentiator on these cases.' },

    { type: 'heading', level: 2, text: 'The decision spine', emphasize: 'decision spine' },

    { type: 'prose', md: 'Start here on every market-entry prompt. These four questions, in this order, are the backbone — everything else hangs off them.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Market entry decision spine with four sequential questions and a both-yes gate", caption: "The market-entry decision spine — four questions in order: is it attractive, can we win, how do we enter, and will it pay.", svg: `<svg viewBox="0 0 720 560" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <!-- root question -->
  <rect x="250" y="20" width="220" height="50" rx="12" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="43" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="0.03em" fill="#ffffff">SHOULD WE ENTER?</text>
  <text x="360" y="59" text-anchor="middle" font-size="9" fill="#b9c4d6">four questions, in order</text>

  <!-- Q1 + Q2 sit side by side (the "should") -->
  <path d="M360 70 C360 92, 200 90, 200 110" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <path d="M360 70 C360 92, 520 90, 520 110" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>

  <rect x="60" y="112" width="280" height="92" rx="12" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="80" y="136" font-size="9.5" font-weight="700" letter-spacing="0.09em" fill="hsl(var(--primary))">QUESTION 1</text>
  <text x="80" y="158" font-size="13.5" font-weight="700" fill="hsl(var(--foreground))">Is the market attractive?</text>
  <text x="80" y="178" font-size="10.5" fill="hsl(var(--muted-foreground))">size · growth · margins · competition</text>
  <text x="80" y="194" font-size="10.5" fill="hsl(var(--muted-foreground))">· barriers · macro context</text>

  <rect x="380" y="112" width="280" height="92" rx="12" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="400" y="136" font-size="9.5" font-weight="700" letter-spacing="0.09em" fill="hsl(var(--primary))">QUESTION 2</text>
  <text x="400" y="158" font-size="13.5" font-weight="700" fill="hsl(var(--foreground))">Can we win?</text>
  <text x="400" y="178" font-size="10.5" fill="hsl(var(--muted-foreground))">our capabilities · cost position</text>
  <text x="400" y="194" font-size="10.5" fill="hsl(var(--muted-foreground))">· brand · distribution · right to play</text>

  <!-- gate -->
  <path d="M200 204 C200 224, 360 224, 360 240" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <path d="M520 204 C520 224, 360 224, 360 240" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>

  <rect x="210" y="242" width="300" height="46" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#cs)"/>
  <text x="360" y="262" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">BOTH YES?  →  QUESTION 3</text>
  <text x="360" y="279" text-anchor="middle" font-size="10" fill="hsl(var(--muted-foreground))">attractive AND winnable before you discuss how</text>

  <!-- Q3 -->
  <path d="M360 288 C360 302, 360 302, 360 316" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="120" y="318" width="480" height="78" rx="12" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="140" y="342" font-size="9.5" font-weight="700" letter-spacing="0.09em" fill="hsl(var(--primary))">QUESTION 3 — HOW DO WE ENTER?</text>
  <text x="140" y="364" font-size="11.5" font-weight="600" fill="hsl(var(--foreground))">Organic build</text><text x="250" y="364" font-size="10.5" fill="hsl(var(--muted-foreground))">· control, slow</text>
  <text x="360" y="364" font-size="11.5" font-weight="600" fill="hsl(var(--foreground))">JV</text><text x="390" y="364" font-size="10.5" fill="hsl(var(--muted-foreground))">· local expertise, shared</text>
  <text x="140" y="384" font-size="11.5" font-weight="600" fill="hsl(var(--foreground))">Acquisition</text><text x="250" y="384" font-size="10.5" fill="hsl(var(--muted-foreground))">· fast, expensive, integration risk</text>

  <!-- Q4 -->
  <path d="M360 396 C360 410, 360 410, 360 424" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="160" y="426" width="400" height="74" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="180" y="450" font-size="9.5" font-weight="700" letter-spacing="0.09em" fill="hsl(var(--primary))">QUESTION 4 — WILL IT PAY?</text>
  <text x="180" y="471" font-size="11" fill="hsl(var(--foreground))">Market size × achievable share × (price − variable cost) − fixed</text>
  <text x="180" y="490" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">this is a profitability problem — the case braids here</text>

  <text x="360" y="528" text-anchor="middle" font-size="10.5" font-style="italic" fill="hsl(var(--muted-foreground))">Never jump to "how" before "should." Most weak answers pick an entry mode before proving the market is worth entering.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Question 1 — is the market attractive?', emphasize: 'attractive' },

    { type: 'prose', md: 'The external view: is this a prize worth chasing? Four lenses — market, customers, competition, barriers — plus the macro backdrop. Lead with market size; if the prize is small or shrinking, you can often end the analysis there.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Market attractiveness across four lenses plus macro, with guidance to lead with market size", caption: "Is the market attractive? — the external view across market, customers, competition, and barriers, plus macro context.", svg: `<svg viewBox="0 0 720 620" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
  </defs>

  <!-- root -->
  <rect x="205" y="18" width="310" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="0.02em" fill="#ffffff">IS THE MARKET ATTRACTIVE?</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">the external view — four lenses + macro</text>

  <!-- four children via curved connectors -->
  <path d="M360 64 C360 84, 130 82, 130 100" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 285 82, 285 100" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 435 82, 435 100" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 590 82, 590 100" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>

  <!-- L1: Market -->
  <rect x="40" y="100" width="180" height="150" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="58" y="124" font-size="12" font-weight="700" fill="hsl(var(--foreground))">MARKET</text>
  <text x="58" y="138" font-size="8.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">IS THE PRIZE BIG?</text>
  <circle cx="60" cy="158" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="162" font-size="10" fill="hsl(var(--foreground))">Size (units / value)</text>
  <circle cx="60" cy="178" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="182" font-size="10" fill="hsl(var(--foreground))">Growth rate</text>
  <circle cx="60" cy="198" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="202" font-size="10" fill="hsl(var(--foreground))">Profit margins</text>
  <circle cx="60" cy="218" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="222" font-size="10" fill="hsl(var(--foreground))">Maturity / lifecycle</text>
  <text x="58" y="242" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">size it with a guesstimate</text>

  <!-- L2: Customers -->
  <rect x="232" y="100" width="180" height="150" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="250" y="124" font-size="12" font-weight="700" fill="hsl(var(--foreground))">CUSTOMERS</text>
  <text x="250" y="138" font-size="8.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">WHO BUYS, AND WHY?</text>
  <circle cx="252" cy="158" r="2.5" fill="hsl(var(--primary))"/><text x="262" y="162" font-size="10" fill="hsl(var(--foreground))">Segments &amp; needs</text>
  <circle cx="252" cy="178" r="2.5" fill="hsl(var(--primary))"/><text x="262" y="182" font-size="10" fill="hsl(var(--foreground))">Willingness to pay</text>
  <circle cx="252" cy="198" r="2.5" fill="hsl(var(--primary))"/><text x="262" y="202" font-size="10" fill="hsl(var(--foreground))">Switching behaviour</text>
  <circle cx="252" cy="218" r="2.5" fill="hsl(var(--primary))"/><text x="262" y="222" font-size="10" fill="hsl(var(--foreground))">Reaction to a new entrant</text>
  <text x="250" y="242" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">is there an unmet need?</text>

  <!-- L3: Competition -->
  <rect x="424" y="100" width="180" height="150" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="442" y="124" font-size="12" font-weight="700" fill="hsl(var(--foreground))">COMPETITION</text>
  <text x="442" y="138" font-size="8.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">HOW CONTESTED?</text>
  <circle cx="444" cy="158" r="2.5" fill="hsl(var(--primary))"/><text x="454" y="162" font-size="10" fill="hsl(var(--foreground))">Concentration (few/many)</text>
  <circle cx="444" cy="178" r="2.5" fill="hsl(var(--primary))"/><text x="454" y="182" font-size="10" fill="hsl(var(--foreground))">Rival strength &amp; share</text>
  <circle cx="444" cy="198" r="2.5" fill="hsl(var(--primary))"/><text x="454" y="202" font-size="10" fill="hsl(var(--foreground))">Likely competitive response</text>
  <circle cx="444" cy="218" r="2.5" fill="hsl(var(--primary))"/><text x="454" y="222" font-size="10" fill="hsl(var(--foreground))">Substitutes</text>
  <text x="442" y="242" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">a big market crowded = trap</text>

  <!-- L4: Barriers -->
  <rect x="540" y="100" width="140" height="150" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)" opacity="0"/>
  <!-- (placeholder removed; barriers placed below to avoid overlap) -->

  <!-- Barriers row, full width below -->
  <rect x="40" y="266" width="320" height="120" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="58" y="290" font-size="12" font-weight="700" fill="hsl(var(--foreground))">BARRIERS TO ENTRY</text>
  <text x="58" y="304" font-size="8.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">WHAT BLOCKS US GETTING IN?</text>
  <circle cx="60" cy="324" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="328" font-size="10" fill="hsl(var(--foreground))">Capital intensity / scale needed</text>
  <circle cx="60" cy="344" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="348" font-size="10" fill="hsl(var(--foreground))">Regulation, licences, IP / patents</text>
  <circle cx="60" cy="364" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="368" font-size="10" fill="hsl(var(--foreground))">Access to suppliers &amp; distribution</text>

  <!-- Macro -->
  <rect x="380" y="266" width="300" height="120" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="398" y="290" font-size="12" font-weight="700" fill="hsl(var(--foreground))">MACRO CONTEXT</text>
  <text x="398" y="304" font-size="8.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">THE BACKDROP</text>
  <circle cx="400" cy="324" r="2.5" fill="hsl(var(--primary))"/><text x="410" y="328" font-size="10" fill="hsl(var(--foreground))">PESTEL — political, economic, social, tech, env, legal</text>
  <circle cx="400" cy="344" r="2.5" fill="hsl(var(--primary))"/><text x="410" y="348" font-size="10" fill="hsl(var(--foreground))">Porter's 5 Forces for structural attractiveness</text>
  <circle cx="400" cy="364" r="2.5" fill="hsl(var(--primary))"/><text x="410" y="368" font-size="10" fill="hsl(var(--foreground))">Currency, trade, regulatory risk (if cross-border)</text>

  <!-- nav layer -->
  <rect x="40" y="402" width="640" height="200" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="426" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — ATTRACTIVE MEANS BIG, GROWING, PROFITABLE, AND WINNABLE-LOOKING</text>
  <circle cx="64" cy="450" r="2.5" fill="hsl(var(--primary))"/><text x="74" y="454" font-size="10.5" fill="hsl(var(--foreground))">Lead with Market — if the prize is small or shrinking, the rest barely matters. Size it first.</text>
  <circle cx="64" cy="474" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="478" font-size="10.5" fill="hsl(var(--foreground))">A big market is not enough: a large, fast-growing market that is fiercely contested or walled by</text>
  <text x="74" y="494" font-size="10.5" fill="hsl(var(--foreground))">barriers can be less attractive than a smaller, sleepy one you can dominate.</text>
  <circle cx="64" cy="516" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="520" font-size="10.5" fill="hsl(var(--foreground))">Customers + Competition together answer "can we take share?" — the bridge to the can-we-win view.</text>
  <circle cx="64" cy="540" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="544" font-size="10.5" fill="hsl(var(--foreground))">Treat Macro as a filter, not a checklist — name only the 2-3 forces that actually move this decision.</text>
  <text x="60" y="572" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The casebook frames these as "external risks." Same content — attractiveness is just risk stated positively.</text>
  <text x="60" y="590" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Don't recite all four lenses equally; spend time where the prize and the contest actually are.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Question 2 — can we win?', emphasize: 'can we win' },

    { type: 'prose', md: 'An attractive market you cannot win in is a trap. The internal view asks whether *this client* has a real right to play — a specific edge in cost, differentiation, or access. Vague strength ("we are a big company") is not an edge; a concrete advantage incumbents would struggle to copy is.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Right to win across cost position, differentiation, and access with guidance on naming a real edge", caption: "Can we win? — the internal view across cost position, differentiation, and access. A right to win must rest on a specific edge.", svg: `<svg viewBox="0 0 720 470" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
  </defs>

  <rect x="240" y="18" width="240" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="0.02em" fill="#ffffff">CAN WE WIN?</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">the internal view — our right to play</text>

  <path d="M360 64 C360 84, 150 82, 150 100" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 360 82, 360 100" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 570 82, 570 100" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>

  <rect x="40" y="100" width="200" height="150" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="58" y="124" font-size="12" font-weight="700" fill="hsl(var(--foreground))">COST POSITION</text>
  <text x="58" y="138" font-size="8.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">CAN WE MAKE IT PAY?</text>
  <circle cx="60" cy="158" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="162" font-size="10" fill="hsl(var(--foreground))">Scale &amp; cost structure</text>
  <circle cx="60" cy="178" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="182" font-size="10" fill="hsl(var(--foreground))">Input / supply access</text>
  <circle cx="60" cy="198" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="202" font-size="10" fill="hsl(var(--foreground))">Tech / process advantage</text>
  <circle cx="60" cy="218" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="222" font-size="10" fill="hsl(var(--foreground))">Existing infrastructure</text>
  <text x="58" y="242" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">can we match incumbent costs?</text>

  <rect x="260" y="100" width="200" height="150" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="278" y="124" font-size="12" font-weight="700" fill="hsl(var(--foreground))">DIFFERENTIATION</text>
  <text x="278" y="138" font-size="8.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">WHY US OVER THEM?</text>
  <circle cx="280" cy="158" r="2.5" fill="hsl(var(--primary))"/><text x="290" y="162" font-size="10" fill="hsl(var(--foreground))">Product / quality edge</text>
  <circle cx="280" cy="178" r="2.5" fill="hsl(var(--primary))"/><text x="290" y="182" font-size="10" fill="hsl(var(--foreground))">Brand &amp; reputation</text>
  <circle cx="280" cy="198" r="2.5" fill="hsl(var(--primary))"/><text x="290" y="202" font-size="10" fill="hsl(var(--foreground))">Unique IP / capability</text>
  <circle cx="280" cy="218" r="2.5" fill="hsl(var(--primary))"/><text x="290" y="222" font-size="10" fill="hsl(var(--foreground))">Customer relationships</text>
  <text x="278" y="242" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">a reason to switch to us</text>

  <rect x="480" y="100" width="200" height="150" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="498" y="124" font-size="12" font-weight="700" fill="hsl(var(--foreground))">ACCESS</text>
  <text x="498" y="138" font-size="8.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">CAN WE REACH THE BUYER?</text>
  <circle cx="500" cy="158" r="2.5" fill="hsl(var(--primary))"/><text x="510" y="162" font-size="10" fill="hsl(var(--foreground))">Distribution &amp; channels</text>
  <circle cx="500" cy="178" r="2.5" fill="hsl(var(--primary))"/><text x="510" y="182" font-size="10" fill="hsl(var(--foreground))">Partnerships / licences</text>
  <circle cx="500" cy="198" r="2.5" fill="hsl(var(--primary))"/><text x="510" y="202" font-size="10" fill="hsl(var(--foreground))">Regulatory permission</text>
  <circle cx="500" cy="218" r="2.5" fill="hsl(var(--primary))"/><text x="510" y="222" font-size="10" fill="hsl(var(--foreground))">Talent &amp; local know-how</text>
  <text x="498" y="242" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">a great product unsold = nothing</text>

  <rect x="40" y="266" width="640" height="180" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="290" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — "ATTRACTIVE" AND "WINNABLE" ARE DIFFERENT TESTS</text>
  <circle cx="64" cy="314" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="318" font-size="10.5" fill="hsl(var(--foreground))">The market can be wonderful and you can still have no right to win — and vice versa. Score both.</text>
  <circle cx="64" cy="338" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="342" font-size="10.5" fill="hsl(var(--foreground))">Anchor right-to-win on a real edge: a specific cost, product, or access advantage over incumbents.</text>
  <text x="74" y="358" font-size="10.5" fill="hsl(var(--foreground))">"We're a strong company" is not an edge. "We already own the cold-chain they'd have to build" is.</text>
  <circle cx="64" cy="380" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="384" font-size="10.5" fill="hsl(var(--foreground))">Access is the most underrated arm — many entries fail not on product but on distribution and</text>
  <text x="74" y="400" font-size="10.5" fill="hsl(var(--foreground))">regulation. In India especially, distribution depth often decides the winner.</text>
  <text x="60" y="426" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Strong on attractiveness, weak on right-to-win → consider partnering or acquiring rather than building.</text>
</svg>` },

    { type: 'prose', md: 'Some interviewers — and several casebooks — frame the whole "should we enter" question as a risk analysis instead. The content is identical; only the framing flips. It is worth recognising both so you can match whichever the interviewer uses.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Risk lens framing market entry as internal and external risks, mapped onto the primary framing", caption: "An alternative framing — the same analysis stated as risk. Internal risks mirror \"can we win\"; external risks mirror \"is it attractive.\"", svg: `<svg viewBox="0 0 720 440" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
  </defs>

  <rect x="225" y="18" width="270" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="0.02em" fill="#ffffff">ALTERNATIVE: THE RISK LENS</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">same content, framed as what could go wrong</text>

  <path d="M360 64 C360 86, 200 84, 200 104" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 86, 520 84, 520 104" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>

  <rect x="60" y="104" width="280" height="150" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="80" y="128" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">INTERNAL RISKS</text>
  <text x="80" y="142" font-size="8.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">= CAN WE WIN, INVERTED</text>
  <circle cx="82" cy="162" r="2.5" fill="hsl(var(--primary))"/><text x="92" y="166" font-size="10.5" fill="hsl(var(--foreground))">Constraints — capital, capacity, talent</text>
  <circle cx="82" cy="184" r="2.5" fill="hsl(var(--primary))"/><text x="92" y="188" font-size="10.5" fill="hsl(var(--foreground))">Resources — what we lack vs need</text>
  <circle cx="82" cy="206" r="2.5" fill="hsl(var(--primary))"/><text x="92" y="210" font-size="10.5" fill="hsl(var(--foreground))">Execution &amp; integration risk</text>
  <text x="80" y="236" font-size="9" font-style="italic" fill="hsl(var(--muted-foreground))">the flip side of cost / diff / access</text>

  <rect x="380" y="104" width="280" height="150" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="400" y="128" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">EXTERNAL RISKS</text>
  <text x="400" y="142" font-size="8.5" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">= ATTRACTIVENESS, INVERTED</text>
  <circle cx="402" cy="162" r="2.5" fill="hsl(var(--primary))"/><text x="412" y="166" font-size="10.5" fill="hsl(var(--foreground))">Industry — rivals, customers, barriers</text>
  <circle cx="402" cy="184" r="2.5" fill="hsl(var(--primary))"/><text x="412" y="188" font-size="10.5" fill="hsl(var(--foreground))">Macro — PESTEL, regulation, currency</text>
  <circle cx="402" cy="206" r="2.5" fill="hsl(var(--primary))"/><text x="412" y="210" font-size="10.5" fill="hsl(var(--foreground))">Competitive retaliation</text>
  <text x="400" y="236" font-size="9" font-style="italic" fill="hsl(var(--muted-foreground))">the flip side of market / competition</text>

  <rect x="60" y="270" width="600" height="152" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="80" y="294" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">WHEN TO USE THIS FRAMING INSTEAD</text>
  <circle cx="84" cy="318" r="2.5" fill="hsl(var(--foreground))"/><text x="94" y="322" font-size="10.5" fill="hsl(var(--foreground))">Several casebooks (and some interviewers) frame market entry as a risk analysis. The content is</text>
  <text x="94" y="338" font-size="10.5" fill="hsl(var(--foreground))">identical to attractiveness + right-to-win — just stated as "what could go wrong" instead of "is it good."</text>
  <circle cx="84" cy="360" r="2.5" fill="hsl(var(--foreground))"/><text x="94" y="364" font-size="10.5" fill="hsl(var(--foreground))">Reach for it when the prompt is risk-flavoured ("what are the risks of entering?") or when the client</text>
  <text x="94" y="380" font-size="10.5" fill="hsl(var(--foreground))">is clearly nervous — leading with risk meets them where they are.</text>
  <text x="80" y="406" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Don't run both framings in one case — pick the one that fits the question, and know they map onto each other.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Question 3 — will it pay?', emphasize: 'will it pay' },

    { type: 'prose', md: 'Attractive and winnable still has to clear the math. This is the quantitative gate — and the exact point where a market-entry case braids into a profitability case. The equation is the profitability tree applied to the entry scenario.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Feasibility equation breaking into market size, achievable share, contribution, and fixed cost, with the profitability braid", caption: "Will it pay? — market size × achievable share × contribution − fixed cost. This is where market entry braids into profitability.", svg: `<svg viewBox="0 0 720 500" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="225" y="18" width="270" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13.5" font-weight="700" letter-spacing="0.02em" fill="#ffffff">WILL IT PAY? — THE GATE</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">attractive + winnable still has to clear the math</text>

  <!-- equation strip -->
  <path d="M360 64 C360 80, 360 80, 360 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="40" y="94" width="640" height="56" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#cs)"/>
  <text x="360" y="120" text-anchor="middle" font-size="14" font-weight="700" fill="hsl(var(--foreground))">Profit = Market size × Achievable share × (Price − Variable cost) − Fixed cost</text>
  <text x="360" y="139" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">size the market with a guesstimate; estimate share qualitatively from right-to-win</text>

  <!-- four components -->
  <path d="M360 150 C360 166, 130 164, 130 182" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M360 150 C360 166, 285 164, 285 182" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M360 150 C360 166, 435 164, 435 182" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M360 150 C360 166, 590 164, 590 182" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>

  <rect x="40" y="182" width="180" height="92" rx="10" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="58" y="204" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">Market size</text>
  <text x="58" y="222" font-size="9.5" fill="hsl(var(--muted-foreground))">guesstimate it —</text>
  <text x="58" y="236" font-size="9.5" fill="hsl(var(--muted-foreground))">top-down or bottom-up.</text>
  <text x="58" y="256" font-size="9" font-style="italic" fill="hsl(var(--primary))">the quant set-piece</text>

  <rect x="232" y="182" width="180" height="92" rx="10" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="250" y="204" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">Achievable share</text>
  <text x="250" y="222" font-size="9.5" fill="hsl(var(--muted-foreground))">not the whole market —</text>
  <text x="250" y="236" font-size="9.5" fill="hsl(var(--muted-foreground))">a realistic slice from</text>
  <text x="250" y="250" font-size="9.5" fill="hsl(var(--muted-foreground))">right-to-win.</text>
  <text x="250" y="267" font-size="9" font-style="italic" fill="hsl(var(--primary))">where candidates over-claim</text>

  <rect x="424" y="182" width="120" height="92" rx="10" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="442" y="204" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">Contribution</text>
  <text x="442" y="222" font-size="9.5" fill="hsl(var(--muted-foreground))">price minus</text>
  <text x="442" y="236" font-size="9.5" fill="hsl(var(--muted-foreground))">variable cost,</text>
  <text x="442" y="250" font-size="9.5" fill="hsl(var(--muted-foreground))">per unit.</text>

  <rect x="556" y="182" width="124" height="92" rx="10" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="574" y="204" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">Fixed cost</text>
  <text x="574" y="222" font-size="9.5" fill="hsl(var(--muted-foreground))">the entry</text>
  <text x="574" y="236" font-size="9.5" fill="hsl(var(--muted-foreground))">investment to</text>
  <text x="574" y="250" font-size="9.5" fill="hsl(var(--muted-foreground))">recover.</text>

  <!-- braid callout -->
  <rect x="40" y="294" width="640" height="186" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="318" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">THIS IS WHERE MARKET ENTRY BRAIDS INTO PROFITABILITY</text>
  <circle cx="64" cy="342" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="346" font-size="10.5" fill="hsl(var(--foreground))">Once you decide the market is attractive and winnable, "will it pay?" is a profitability problem.</text>
  <text x="74" y="362" font-size="10.5" fill="hsl(var(--foreground))">The four terms above are just the profitability tree applied to the entry scenario.</text>
  <circle cx="64" cy="384" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="388" font-size="10.5" fill="hsl(var(--foreground))">Say the braid out loud: "I'm satisfied the market is attractive — now I'll shift to whether our</text>
  <text x="74" y="404" font-size="10.5" fill="hsl(var(--foreground))">specific entry makes money." That signals control (see Navigating Tricky &amp; Blended Cases).</text>
  <circle cx="64" cy="426" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="430" font-size="10.5" fill="hsl(var(--foreground))">For multi-year entries, extend to NPV / payback — discount the cash flows, find the breakeven year.</text>
  <text x="60" y="458" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The most common miss: claiming an unrealistic share. A 2% share of a huge market often beats a fantasy 30%.</text>
</svg>` },

    { type: 'callout', variant: 'tip', title: 'Name the braid out loud', md: 'When you reach this gate, say it: "I am satisfied the market is attractive and we can win — now I will shift to whether our specific entry actually makes money, which is a profitability question." That sentence signals deliberate navigation. (We cover this move in depth on *Navigating Tricky & Blended Cases*, and the math itself on *Profitability*.)' },

    { type: 'heading', level: 2, text: 'Question 4 — how do we enter?', emphasize: 'how do we enter' },

    { type: 'prose', md: 'Only once the first three gates clear do you discuss mode. Three options sit on a control-versus-speed trade-off — and the skill is not listing them, it is *choosing* the one that closes this client\'s specific gap.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Three entry modes with pros, cons, and a which-mode-when decision guide", caption: "How do we enter? — organic, JV, or acquisition on a control-versus-speed trade-off, with a guide to choosing the right mode.", svg: `<svg viewBox="0 0 720 560" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
  </defs>

  <rect x="250" y="18" width="220" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="0.02em" fill="#ffffff">HOW DO WE ENTER?</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">three modes, on a control–speed trade-off</text>

  <path d="M360 64 C360 82, 145 80, 145 98" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 82, 360 80, 360 98" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 82, 575 80, 575 98" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>

  <!-- ORGANIC -->
  <rect x="40" y="98" width="200" height="190" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="60" y="122" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">ORGANIC BUILD</text>
  <text x="60" y="137" font-size="8.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">DO IT YOURSELF</text>
  <text x="60" y="159" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">+ Pros</text>
  <text x="60" y="175" font-size="9.5" fill="hsl(var(--muted-foreground))">full control</text>
  <text x="60" y="189" font-size="9.5" fill="hsl(var(--muted-foreground))">build experience curve</text>
  <text x="60" y="203" font-size="9.5" fill="hsl(var(--muted-foreground))">keep all the upside</text>
  <text x="60" y="225" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">− Cons</text>
  <text x="60" y="241" font-size="9.5" fill="hsl(var(--muted-foreground))">slow, high capex</text>
  <text x="60" y="255" font-size="9.5" fill="hsl(var(--muted-foreground))">no local knowledge</text>
  <text x="60" y="269" font-size="9.5" fill="hsl(var(--muted-foreground))">highest execution risk</text>

  <!-- JV -->
  <rect x="260" y="98" width="200" height="190" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="280" y="122" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">JOINT VENTURE</text>
  <text x="280" y="137" font-size="8.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">PARTNER UP</text>
  <text x="280" y="159" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">+ Pros</text>
  <text x="280" y="175" font-size="9.5" fill="hsl(var(--muted-foreground))">local expertise fast</text>
  <text x="280" y="189" font-size="9.5" fill="hsl(var(--muted-foreground))">shared cost &amp; risk</text>
  <text x="280" y="203" font-size="9.5" fill="hsl(var(--muted-foreground))">scale quickly</text>
  <text x="280" y="225" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">− Cons</text>
  <text x="280" y="241" font-size="9.5" fill="hsl(var(--muted-foreground))">limited control</text>
  <text x="280" y="255" font-size="9.5" fill="hsl(var(--muted-foreground))">profit sharing</text>
  <text x="280" y="269" font-size="9.5" fill="hsl(var(--muted-foreground))">partner / culture clash</text>

  <!-- ACQUISITION -->
  <rect x="480" y="98" width="200" height="190" rx="12" fill="url(#cg)" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="500" y="122" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">ACQUISITION</text>
  <text x="500" y="137" font-size="8.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">BUY YOUR WAY IN</text>
  <text x="500" y="159" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">+ Pros</text>
  <text x="500" y="175" font-size="9.5" fill="hsl(var(--muted-foreground))">fastest to scale</text>
  <text x="500" y="189" font-size="9.5" fill="hsl(var(--muted-foreground))">instant share &amp; assets</text>
  <text x="500" y="203" font-size="9.5" fill="hsl(var(--muted-foreground))">local expertise built-in</text>
  <text x="500" y="225" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">− Cons</text>
  <text x="500" y="241" font-size="9.5" fill="hsl(var(--muted-foreground))">most expensive</text>
  <text x="500" y="255" font-size="9.5" fill="hsl(var(--muted-foreground))">integration risk</text>
  <text x="500" y="269" font-size="9.5" fill="hsl(var(--muted-foreground))">may overpay</text>

  <!-- which mode when -->
  <rect x="40" y="306" width="640" height="234" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="330" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">WHICH MODE WHEN — THE PART CASEBOOKS LEAVE OUT</text>
  <text x="60" y="356" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Choose ORGANIC when:</text>
  <text x="240" y="356" font-size="10.5" fill="hsl(var(--muted-foreground))">you have a real edge to transplant, time is not tight,</text>
  <text x="240" y="371" font-size="10.5" fill="hsl(var(--muted-foreground))">and control / margin matter most.</text>
  <text x="60" y="397" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Choose JV when:</text>
  <text x="240" y="397" font-size="10.5" fill="hsl(var(--muted-foreground))">local knowledge / relationships are the missing piece,</text>
  <text x="240" y="412" font-size="10.5" fill="hsl(var(--muted-foreground))">or regulation requires a local partner.</text>
  <text x="60" y="438" font-size="11" font-weight="700" fill="hsl(var(--foreground))">Choose ACQUISITION when:</text>
  <text x="240" y="438" font-size="10.5" fill="hsl(var(--muted-foreground))">speed and incumbent share matter, the window is</text>
  <text x="240" y="453" font-size="10.5" fill="hsl(var(--muted-foreground))">closing, and a good target exists at a fair price.</text>
  <text x="60" y="486" font-size="10.5" font-weight="600" fill="hsl(var(--foreground))">The deciding axes: how much time, how much local knowledge gap, and how much control you need.</text>
  <text x="60" y="510" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Don't just list the three modes and stop — that is a B answer. Recommend one, tied to this client's specific gap.</text>
  <text x="60" y="528" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The mode should follow from the right-to-win analysis: enter where your gap is smallest to close.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Navigating it live', emphasize: 'Navigating it live' },

    { type: 'prose', md: 'Put it together as a single live path. The casebooks show the components; this is how you actually move through them in the room — and where to stop.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Market entry diagnostic flow as a five-step ordered path with a both-yes gate", caption: "How to navigate a market-entry case live — clarify, attractive, winnable, gate, will-it-pay, then how. The order is the skill.", svg: `<svg viewBox="0 0 720 560" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <!-- step 1 -->
  <rect x="220" y="20" width="280" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="42" text-anchor="middle" font-size="13" font-weight="700" fill="#ffffff">1 · Clarify objective &amp; constraints</text>
  <text x="360" y="57" text-anchor="middle" font-size="9" fill="#b9c4d6">why this market, by when, what return</text>

  <path d="M360 66 C360 80, 360 80, 360 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>

  <!-- step 2 -->
  <rect x="160" y="94" width="400" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="116" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">2 · Is the market attractive?</text>
  <text x="360" y="133" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">size first — if the prize is small, stop and say so</text>

  <path d="M360 144 C360 158, 360 158, 360 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>

  <!-- step 3 -->
  <rect x="160" y="172" width="400" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="194" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">3 · Can we win?</text>
  <text x="360" y="211" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">name a specific edge — cost, product, or access</text>

  <!-- gate -->
  <path d="M360 222 C360 236, 360 236, 360 248" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="210" y="250" width="300" height="44" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#cs)"/>
  <text x="360" y="270" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="0.03em" fill="hsl(var(--primary))">BOTH YES?</text>
  <text x="360" y="286" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">if either is no → recommend not entering, and stop</text>

  <!-- step 4 -->
  <path d="M360 294 C360 308, 360 308, 360 320" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="160" y="322" width="400" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="344" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">4 · Will it pay? (braid to profitability)</text>
  <text x="360" y="361" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">size × share × contribution − fixed; say the braid aloud</text>

  <path d="M360 372 C360 386, 360 386, 360 398" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>

  <!-- step 5 -->
  <rect x="160" y="400" width="400" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="422" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">5 · How to enter?</text>
  <text x="360" y="439" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">pick the mode that closes your specific gap</text>

  <!-- closing band -->
  <rect x="40" y="466" width="640" height="74" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="490" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">THE ORDER IS THE SKILL</text>
  <text x="60" y="511" font-size="10.5" fill="hsl(var(--foreground))">Weak candidates jump to entry mode in minute two. Strong ones earn the right to discuss "how" by</text>
  <text x="60" y="527" font-size="10.5" fill="hsl(var(--foreground))">first proving "should" — attractive, winnable, and profitable — and they stop early if the answer is no.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Worked mini-case', emphasize: 'Worked mini-case' },

    { type: 'prose', md: 'Watch the spine in action. Note how the candidate refuses to discuss entry mode until the first three gates clear, sizes the prize before getting excited, and names the braid into profitability explicitly.' },

    { type: 'dialogue', title: 'A coffee-chain entry case', turns: [
      { speaker: 'interviewer', md: 'Our client is a large European coffee-shop chain. They are considering entering India with their own cafes. Should they?' },
      { speaker: 'candidate', md: 'I\'d work through four questions in order: is the Indian cafe market attractive, can this chain win in it, will their specific entry make money, and only then how they should enter. Before I start — what is their objective and timeline? Is this a growth play, a brand play, and over what horizon?' },
      { speaker: 'interviewer', md: 'Growth. They want a meaningful new revenue stream within five years.' },
      { speaker: 'candidate', md: 'Then I\'ll start with attractiveness, and size first. India\'s organised cafe market is smaller than Europe\'s but growing fast — rising urban incomes, a young population, cafes as social spaces. I\'d want the market size and growth rate, but my hypothesis is the prize is mid-sized and growing, not huge today. Is it attractive enough to continue?' },
      { speaker: 'interviewer', md: 'Assume yes — it is growing around 12% a year. Move on.' },
      { speaker: 'candidate', md: 'Now, can they win? This is where I\'m more cautious. Incumbents like domestic chains and a strong global player already have prime real estate and local supply chains. The European chain\'s edge would have to be brand cachet and product quality — but coffee in India competes with chai and with cheaper local cafes, so willingness to pay is a real question. Their weak spot is access: real estate and local operations. That already hints the answer to "how."' },
      { speaker: 'interviewer', md: 'Say more about that hint.' },
      { speaker: 'candidate', md: 'Their gap is local market knowledge, real estate, and supply chain — not product or brand. When the gap is local access rather than capability, organic build is slow and risky, and a joint venture with a local F&B operator usually closes that gap fastest. So I\'m already leaning JV — but I want to clear the money question first. I\'m satisfied the market is attractive and they have a plausible brand edge, so I\'ll shift to whether the entry pays: market size times the share they can realistically take times contribution per cup, minus the fixed cost of opening and running cafes. The share number is where I\'d be conservative — a premium foreign chain might take low-single-digit share in five years, not twenty.' },
      { speaker: 'narrator', md: 'The candidate walked the spine in order, sized before judging, located the client\'s gap as access (not product), let that gap point toward JV, and named the braid into profitability with conservative share — never once jumping to "how" prematurely.', note: 'Walk the gates in order, let the right-to-win gap choose the entry mode, and stay conservative on share.' },
    ]},

    { type: 'callout', variant: 'insight', title: 'What made that an A-grade answer', md: 'Three things: the candidate sized the prize before getting excited, diagnosed the *specific* gap (access, not capability) instead of hand-waving "they\'re strong," and let that diagnosis drive the entry-mode recommendation rather than listing all three modes. The mode followed from the right-to-win analysis — exactly as the framework intends.' },

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'You will walk market entry as four ordered gates — attractive? can we win? will it pay? how? — and stop early when a gate fails, instead of reciting buckets.',
      'You will assess attractiveness across market, customers, competition, and barriers, plus macro — leading with market size, because a small or shrinking prize ends the analysis fast.',
      'You will anchor "can we win" on a specific edge in cost, differentiation, or access — never on vague corporate strength — and recognise the risk-lens framing as the same analysis inverted.',
      'You will treat "will it pay" as a profitability problem (size × achievable share × contribution − fixed), name the braid out loud, and stay conservative on achievable share.',
      'You will choose the entry mode that closes the client\'s specific gap — organic, JV, or acquisition — rather than listing all three, letting the right-to-win diagnosis drive the recommendation.',
    ]},
  ],
};
