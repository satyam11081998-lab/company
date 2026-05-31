import type { Page } from '@/lib/casebook/types';

export const mergersAcquisitions: Page = {
  slug: 'core-frameworks/m-and-a',
  title: 'M&A',
  titleEmphasize: 'M&A',
  subtitle: 'Should this deal happen, and what is it worth? M&A cases test whether you can value a target, judge synergies honestly, and weigh the soft factors that sink most real deals. This is the overview; valuation, due diligence, and the private-equity lens each get their own page.',
  kind: 'framework',
  meta: { readingTimeMin: 14, tags: ['core-frameworks', 'm-and-a', 'private-equity'], caseType: 'M&A' },
  blocks: [
    { type: 'hook', md: 'An M&A case looks intimidating — valuation, synergies, due diligence, integration — but it collapses to one question: is the net benefit of this deal positive? Value created, plus synergies, minus the price and the cost to integrate — and then the soft checks that quietly kill most real deals. Get that equation framed and the rest is just filling in the terms.', emphasize: 'is the net benefit of this deal positive' },

    { type: 'prose', md: 'Mergers and acquisitions are the deep-dive on inorganic growth — when a company (or an investor) grows by buying rather than building. These cases reward structure and honesty: a clear valuation, conservative synergies, and the discipline to flag when culture, integration, or risk should override an attractive spreadsheet. This page frames the whole decision; the linked pages go deep on each piece.' },

    { type: 'callout', variant: 'note', title: 'This is a multi-part framework', md: 'M&A is broad, so it is split across pages. This overview covers the net-benefit decision and the buyer\'s lens. **Value & Synergies** goes deep on what the combination is worth; **Due Diligence** covers the investigate-before-you-buy process; and **Private Equity** reframes everything for a financial buyer focused on returns and exit. Start here, then follow the thread that fits your case.' },

    { type: 'heading', level: 2, text: 'The net-benefit tree', emphasize: 'net-benefit tree' },

    { type: 'prose', md: 'Frame every deal as a single question: is the net benefit positive? It splits into a financial half (does the math work?) and a non-financial half (should we, beyond the math?). Both must clear — a deal that pencils out can still fail on culture or risk.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "M&A net benefit tree splitting into financial and non-financial halves with their sub-factors", caption: "The M&A net-benefit tree — financial (value added vs costs) and non-financial (acquirer fit, external risks).", svg: `<svg viewBox="0 0 720 560" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="210" y="18" width="300" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13.5" font-weight="700" letter-spacing="0.02em" fill="#ffffff">NET BENEFIT OF THE DEAL</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">value created − price paid, financial + non-financial</text>

  <path d="M360 64 C360 86, 195 84, 195 104" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <path d="M360 64 C360 86, 525 84, 525 104" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>

  <!-- FINANCIAL -->
  <rect x="40" y="104" width="310" height="40" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="195" y="129" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">FINANCIAL — does the math work?</text>

  <path d="M195 144 C195 160, 120 158, 120 174" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M195 144 C195 160, 270 158, 270 174" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>

  <rect x="40" y="174" width="150" height="150" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="58" y="196" font-size="10.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">VALUE ADDED</text>
  <text x="58" y="216" font-size="10" font-weight="600" fill="hsl(var(--foreground))">Standalone value</text>
  <text x="58" y="230" font-size="9" fill="hsl(var(--muted-foreground))">PV of target's cash flows</text>
  <text x="58" y="252" font-size="10" font-weight="600" fill="hsl(var(--foreground))">+ Synergies</text>
  <text x="58" y="266" font-size="9" fill="hsl(var(--muted-foreground))">operational + financial</text>
  <text x="58" y="288" font-size="9" fill="hsl(var(--muted-foreground))">the extra from combining</text>
  <text x="58" y="312" font-size="8.5" font-style="italic" fill="hsl(var(--primary))">see Value &amp; Synergies</text>

  <rect x="200" y="174" width="150" height="150" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="218" y="196" font-size="10.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">COSTS</text>
  <text x="218" y="216" font-size="10" font-weight="600" fill="hsl(var(--foreground))">Acquisition price</text>
  <text x="218" y="230" font-size="9" fill="hsl(var(--muted-foreground))">usually given by interviewer</text>
  <text x="218" y="252" font-size="10" font-weight="600" fill="hsl(var(--foreground))">Integration cost</text>
  <text x="218" y="266" font-size="9" fill="hsl(var(--muted-foreground))">IT, process, org, people</text>
  <text x="218" y="288" font-size="9" fill="hsl(var(--muted-foreground))">often underestimated</text>
  <text x="218" y="312" font-size="8.5" font-style="italic" fill="hsl(var(--primary))">see Valuation</text>

  <!-- NON-FINANCIAL -->
  <rect x="370" y="104" width="310" height="40" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="525" y="129" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">NON-FINANCIAL — should we, beyond price?</text>

  <path d="M525 144 C525 160, 450 158, 450 174" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M525 144 C525 160, 600 158, 600 174" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>

  <rect x="370" y="174" width="150" height="150" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="388" y="196" font-size="10.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">ACQUIRER FIT</text>
  <text x="388" y="216" font-size="10" font-weight="600" fill="hsl(var(--foreground))">Cultural fit</text>
  <text x="388" y="230" font-size="9" fill="hsl(var(--muted-foreground))">norms, geography, style</text>
  <text x="388" y="252" font-size="10" font-weight="600" fill="hsl(var(--foreground))">Organizational fit</text>
  <text x="388" y="266" font-size="9" fill="hsl(var(--muted-foreground))">structure, talent overlap</text>
  <text x="388" y="288" font-size="10" font-weight="600" fill="hsl(var(--foreground))">Strategy fit</text>
  <text x="388" y="302" font-size="9" fill="hsl(var(--muted-foreground))">aligned long-term goals</text>

  <rect x="530" y="174" width="150" height="150" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="548" y="196" font-size="10.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">EXTERNAL RISKS</text>
  <text x="548" y="216" font-size="9.5" fill="hsl(var(--foreground))">Regulatory / antitrust</text>
  <text x="548" y="236" font-size="9.5" fill="hsl(var(--foreground))">Macro &amp; political</text>
  <text x="548" y="256" font-size="9.5" fill="hsl(var(--foreground))">Market &amp; competitive</text>
  <text x="548" y="276" font-size="9.5" fill="hsl(var(--foreground))">reaction</text>
  <text x="548" y="300" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">scan with PESTEL</text>

  <!-- nav band -->
  <rect x="40" y="346" width="640" height="196" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="370" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — A DEAL IS WORTH DOING ONLY IF NET BENEFIT IS POSITIVE</text>
  <circle cx="64" cy="394" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="398" font-size="10.5" fill="hsl(var(--foreground))">The deal makes sense when: standalone value + synergies − price − integration cost &gt; 0, AND the</text>
  <text x="74" y="414" font-size="10.5" fill="hsl(var(--foreground))">non-financial factors (fit, risk) do not kill it. Both halves must clear.</text>
  <circle cx="64" cy="436" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="440" font-size="10.5" fill="hsl(var(--foreground))">Synergies are where acquirers overpay — value them conservatively and separately from standalone value.</text>
  <circle cx="64" cy="462" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="466" font-size="10.5" fill="hsl(var(--foreground))">Most deals that fail do so on the soft side — culture and integration — not the spreadsheet. Do not skip it.</text>
  <circle cx="64" cy="488" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="492" font-size="10.5" fill="hsl(var(--foreground))">The price is usually given. Your job is to decide whether the value justifies it — not to accept it as fixed truth.</text>
  <text x="60" y="518" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Frame the whole case as "is the net benefit positive?" — that single question organises everything below it.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Who is buying — and why it changes everything', emphasize: 'Who is buying' },

    { type: 'prose', md: 'Before structuring, ask one question that reframes the entire case: is this a strategic buyer or a financial buyer? A company buying a company chases synergies and fit; a PE fund buying to sell later chases returns and an exit. They share the valuation and due-diligence toolkit, but what *creates value* — and therefore what you analyse — is different.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Strategic versus financial buyer comparison showing different core questions and value sources", caption: "The framing fork — strategic buyer (synergies, fit, indefinite hold) versus financial buyer (returns, leverage, timed exit).", svg: `<svg viewBox="0 0 720 500" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="220" y="18" width="280" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="0.02em" fill="#ffffff">WHO IS BUYING, AND WHY?</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">the framing fork — it changes the whole analysis</text>

  <path d="M360 64 C360 84, 190 82, 190 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <path d="M360 64 C360 84, 530 82, 530 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>

  <!-- STRATEGIC -->
  <rect x="40" y="102" width="300" height="44" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="190" y="123" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">STRATEGIC BUYER</text>
  <text x="190" y="138" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">a company buying a company (M&amp;A)</text>

  <rect x="40" y="160" width="300" height="172" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="58" y="182" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">CORE QUESTION</text>
  <text x="58" y="200" font-size="10.5" fill="hsl(var(--foreground))">Does owning this make our combined</text>
  <text x="58" y="214" font-size="10.5" fill="hsl(var(--foreground))">business stronger?</text>
  <text x="58" y="240" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">VALUE COMES FROM</text>
  <circle cx="60" cy="258" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="262" font-size="10" fill="hsl(var(--foreground))">Synergies (revenue + cost)</text>
  <circle cx="60" cy="278" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="282" font-size="10" fill="hsl(var(--foreground))">Capability, IP, market access</text>
  <circle cx="60" cy="298" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="302" font-size="10" fill="hsl(var(--foreground))">Strategic fit, defensive moats</text>
  <text x="58" y="324" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">holds indefinitely; integrates the target</text>

  <!-- FINANCIAL -->
  <rect x="380" y="102" width="300" height="44" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="530" y="123" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">FINANCIAL BUYER</text>
  <text x="530" y="138" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">a PE fund buying to sell later</text>

  <rect x="380" y="160" width="300" height="172" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="398" y="182" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">CORE QUESTION</text>
  <text x="398" y="200" font-size="10.5" fill="hsl(var(--foreground))">Can we buy, improve, and exit at a</text>
  <text x="398" y="214" font-size="10.5" fill="hsl(var(--foreground))">strong return in 4–6 years?</text>
  <text x="398" y="240" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">VALUE COMES FROM</text>
  <circle cx="400" cy="258" r="2.5" fill="hsl(var(--primary))"/><text x="410" y="262" font-size="10" fill="hsl(var(--foreground))">Operational improvement</text>
  <circle cx="400" cy="278" r="2.5" fill="hsl(var(--primary))"/><text x="410" y="282" font-size="10" fill="hsl(var(--foreground))">Multiple expansion + leverage</text>
  <circle cx="400" cy="298" r="2.5" fill="hsl(var(--primary))"/><text x="410" y="302" font-size="10" fill="hsl(var(--foreground))">A clear exit (sale / IPO)</text>
  <text x="398" y="324" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">time-bound; usually keeps target standalone</text>

  <!-- nav band -->
  <rect x="40" y="354" width="640" height="128" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="378" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — ASK WHO THE BUYER IS BEFORE YOU STRUCTURE</text>
  <circle cx="64" cy="402" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="406" font-size="10.5" fill="hsl(var(--foreground))">Strategic buyer → lead with synergies and fit. Running a returns/exit analysis here misreads the case.</text>
  <circle cx="64" cy="426" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="430" font-size="10.5" fill="hsl(var(--foreground))">Financial buyer (PE) → lead with standalone value, the improvement plan, and the exit. Synergies matter less.</text>
  <text x="60" y="456" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Both share the valuation and due-diligence machinery — but the lens, and what creates value, differs. The PE</text>
  <text x="60" y="472" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">lens is covered on its own page; the rest of this section takes the strategic-buyer view unless noted.</text>
</svg>` },

    { type: 'callout', variant: 'insight', title: 'Name the buyer first', md: 'This single question saves you from the most common M&A misstep: running a synergy analysis for a PE fund, or a returns-and-exit analysis for a strategic acquirer. The *Private Equity* page takes the financial-buyer view in full; everything else in this section assumes a strategic buyer unless stated.' },

    { type: 'heading', level: 2, text: 'Navigating it live', emphasize: 'Navigating it live' },

    { type: 'prose', md: 'The live path is disciplined: clarify the buyer, value the target on its own, add synergies conservatively, then test that total against the price and integration cost — and only then weigh the soft factors. Value before price, math before fit, but never skip fit.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "M&A diagnostic flow as a five-step ordered path with a soft-side gate", caption: "How to run an M&A case live — clarify the buyer, value standalone, add synergies, compare to price plus integration, then check fit and risk.", svg: `<svg viewBox="0 0 720 556" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="200" y="20" width="320" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="42" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">1 · Clarify the deal &amp; the buyer</text>
  <text x="360" y="57" text-anchor="middle" font-size="9" fill="#b9c4d6">objective, strategic vs financial, horizon, price on table</text>

  <path d="M360 66 C360 80, 360 80, 360 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="94" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="116" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">2 · Value the target standalone</text>
  <text x="360" y="133" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">PV of its own cash flows — what it is worth before any synergy</text>

  <path d="M360 144 C360 158, 360 158, 360 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="172" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="194" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">3 · Add synergies — conservatively</text>
  <text x="360" y="211" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">revenue + cost synergies, net of the cost to achieve them</text>

  <path d="M360 222 C360 236, 360 236, 360 248" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="250" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="272" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">4 · Compare value to price + integration cost</text>
  <text x="360" y="289" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">is total value created &gt; total cost to acquire and integrate?</text>

  <path d="M360 300 C360 314, 360 314, 360 326" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="210" y="328" width="300" height="44" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#cs)"/>
  <text x="360" y="348" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="0.02em" fill="hsl(var(--primary))">FINANCIALS CLEAR? CHECK THE SOFT SIDE</text>
  <text x="360" y="364" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">fit + risk can veto a deal the math approves</text>

  <path d="M360 372 C360 386, 360 386, 360 398" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="400" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="422" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">5 · Recommend — with price &amp; conditions</text>
  <text x="360" y="439" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">go / no-go, the most you'd pay, and the key risks to manage</text>

  <rect x="40" y="468" width="640" height="78" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="491" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">THE DISCIPLINE — VALUE BEFORE PRICE, MATH BEFORE FIT, BUT NEVER SKIP FIT</text>
  <text x="60" y="510" font-size="10.5" fill="hsl(var(--foreground))">Weak answers debate the headline price first. Strong ones value the target, add synergies honestly, then</text>
  <text x="60" y="528" font-size="10.5" fill="hsl(var(--foreground))">judge price against that value — and still pressure-test culture, integration, and risk before saying yes.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Worked mini-case', emphasize: 'Worked mini-case' },

    { type: 'prose', md: 'Watch the net-benefit frame in action — the candidate refuses to debate the headline price first, values the target standalone, sizes synergies honestly, and lets the soft factors carry real weight.' },

    { type: 'dialogue', title: 'A packaged-foods acquisition', turns: [
      { speaker: 'interviewer', md: 'Our client is a large Indian FMCG company. A regional health-snacks brand is for sale at ₹400cr, and our client is considering buying it. Should they?' },
      { speaker: 'candidate', md: 'I\'ll frame this as: is the net benefit positive? That is the standalone value of the snacks brand, plus synergies our client can create, minus the ₹400cr price and the cost to integrate — and then whether the non-financial factors support it. First, is this a strategic buyer? It sounds like an FMCG company buying for strategic reasons, not a fund, so I\'ll lead with synergies and fit rather than exit.' },
      { speaker: 'interviewer', md: 'Correct, strategic buyer. Where do you go?' },
      { speaker: 'candidate', md: 'I\'d value the brand standalone first — the present value of its own cash flows at current trajectory. Then synergies, and here our client has a real one: their distribution network. A regional brand sold at ₹400cr is probably distribution-constrained; pushing it through a national FMCG network could materially lift volume. That is a revenue synergy. There may be cost synergies too — shared manufacturing, procurement scale, combined SG&A. I\'d size the revenue synergy carefully, because that is usually the bigger and the more overestimated number.' },
      { speaker: 'interviewer', md: 'Say the brand is worth ₹350cr standalone and you estimate ₹120cr of synergies. The price is ₹400cr. Verdict?' },
      { speaker: 'candidate', md: 'Standalone ₹350cr plus ₹120cr synergies is ₹470cr of value, against a ₹400cr price — so on the math there is roughly ₹70cr of positive net benefit before integration cost. I\'d want the integration cost estimate, because if it runs ₹40-50cr the margin gets thin. But the bigger flag is the soft side: a health-snacks brand often has a founder-led, premium culture that can clash with a large FMCG operating model. If integration crushes what made the brand work, the ₹120cr synergy evaporates. So my answer is a conditional yes — the deal creates value if they can protect the brand\'s identity and keep integration cost in check, and I\'d cap the price near ₹400cr rather than chase it higher.' },
      { speaker: 'narrator', md: 'The candidate framed net benefit explicitly, valued standalone before synergies, identified the real revenue synergy (distribution) while flagging it as the overestimated number, and let culture and integration carry veto weight rather than treating the deal as a pure math problem.', note: 'Value standalone first, size synergies conservatively, and let the soft factors genuinely count.' },
    ]},

    { type: 'callout', variant: 'pitfall', title: 'Synergies are where deals overpay', md: 'Revenue synergies are the most overestimated number in M&A — they assume the combined business sells more than the two did apart, which often does not materialise. Size them conservatively, separate them from standalone value, and never let the synergy story justify a price the standalone value cannot. When in doubt, discount the synergy and see if the deal still clears.' },

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'You will frame every M&A case as one question — is net benefit positive? — where value created plus synergies must exceed price plus integration cost, and the soft factors must not veto it.',
      'You will identify the buyer first: a strategic buyer chases synergies and fit; a financial buyer (PE) chases returns and an exit — and the lens changes what you analyse.',
      'You will value the target standalone before adding synergies, and size synergies conservatively because revenue synergies are the most overestimated number in deals.',
      'You will treat acquirer fit (cultural, organizational, strategic) and external risk as real veto factors, since most failed deals fail on the soft side, not the spreadsheet.',
      'You will follow the thread into Value & Synergies, Due Diligence, and the Private Equity lens as the specific case demands, rather than treating M&A as one undifferentiated topic.',
    ]},
  ],
};
