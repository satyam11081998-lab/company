import type { Page } from '@/lib/casebook/types';

export const valueAndSynergies: Page = {
  slug: 'core-frameworks/m-and-a/value-and-synergies',
  title: 'Value & Synergies',
  titleEmphasize: 'Synergies',
  subtitle: 'What is the target worth, and how much extra does combining create? This page covers the valuation toolkit, the synergy taxonomy, and the value bridge that turns those numbers into a defensible view of net benefit.',
  kind: 'framework',
  meta: { readingTimeMin: 13, tags: ['core-frameworks', 'm-and-a', 'valuation', 'synergies'], caseType: 'M&A' },
  blocks: [
    { type: 'hook', md: 'Synergy is the most abused word in M&A. Every banker pitching a deal promises it; most deals never deliver it. The skill is not naming synergies — anyone can — but valuing them honestly: separating the reliable cost savings from the wishful revenue gains, netting them against what it costs to capture them, and refusing to hand the entire benefit to the seller in the price.', emphasize: 'valuing them honestly' },

    { type: 'prose', md: 'This page is the financial core of an M&A case. It answers two linked questions: what is the target worth on its own, and how much additional value does our specific ownership create? Together they set the ceiling on what you should pay. (This is the strategic-buyer view; the Private Equity page reframes value creation for a financial buyer.)' },

    { type: 'heading', level: 2, text: 'What is the target worth?', emphasize: 'worth' },

    { type: 'prose', md: 'Start with standalone value — what the target is worth on its own cash flows, before any synergy. There are three ways to estimate it, and the discipline is to triangulate rather than trust a single number.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Valuation toolkit: DCF, trading multiples, and precedent deals, with guidance to triangulate", caption: "Three ways to value a target — DCF (intrinsic), trading multiples (relative), and precedent transactions (what others paid).", svg: `<svg viewBox="0 0 720 500" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="235" y="18" width="250" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="0.02em" fill="#ffffff">WHAT IS THE TARGET WORTH?</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">three ways to value — triangulate, don't pick one</text>

  <path d="M360 64 C360 84, 140 82, 140 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 360 82, 360 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 580 82, 580 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>

  <rect x="40" y="102" width="200" height="170" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="58" y="124" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">DCF</text>
  <text x="58" y="139" font-size="8.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">INTRINSIC VALUE</text>
  <text x="58" y="159" font-size="9.5" fill="hsl(var(--foreground))">PV of future free cash</text>
  <text x="58" y="172" font-size="9.5" fill="hsl(var(--foreground))">flows, discounted at WACC</text>
  <text x="58" y="194" font-size="9" fill="hsl(var(--muted-foreground))">+ most rigorous</text>
  <text x="58" y="210" font-size="9" fill="hsl(var(--muted-foreground))">+ captures the specific case</text>
  <text x="58" y="230" font-size="9" fill="hsl(var(--muted-foreground))">− sensitive to assumptions</text>
  <text x="58" y="246" font-size="9" fill="hsl(var(--muted-foreground))">  (growth, discount rate)</text>
  <text x="58" y="264" font-size="8.5" font-style="italic" fill="hsl(var(--primary))">the case-interview default</text>

  <rect x="260" y="102" width="200" height="170" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="278" y="124" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">TRADING MULTIPLES</text>
  <text x="278" y="139" font-size="8.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">RELATIVE VALUE</text>
  <text x="278" y="159" font-size="9.5" fill="hsl(var(--foreground))">Apply a peer multiple</text>
  <text x="278" y="172" font-size="9.5" fill="hsl(var(--foreground))">(EV/EBITDA, P/E) to target</text>
  <text x="278" y="194" font-size="9" fill="hsl(var(--muted-foreground))">+ fast, market-grounded</text>
  <text x="278" y="210" font-size="9" fill="hsl(var(--muted-foreground))">+ good sanity check</text>
  <text x="278" y="230" font-size="9" fill="hsl(var(--muted-foreground))">− needs true comparables</text>
  <text x="278" y="246" font-size="9" fill="hsl(var(--muted-foreground))">− inherits market mispricing</text>
  <text x="278" y="264" font-size="8.5" font-style="italic" fill="hsl(var(--primary))">cross-check your DCF</text>

  <rect x="480" y="102" width="200" height="170" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="498" y="124" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">PRECEDENT DEALS</text>
  <text x="498" y="139" font-size="8.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">WHAT OTHERS PAID</text>
  <text x="498" y="159" font-size="9.5" fill="hsl(var(--foreground))">Multiples from past</text>
  <text x="498" y="172" font-size="9.5" fill="hsl(var(--foreground))">acquisitions of similar firms</text>
  <text x="498" y="194" font-size="9" fill="hsl(var(--muted-foreground))">+ includes control premium</text>
  <text x="498" y="210" font-size="9" fill="hsl(var(--muted-foreground))">+ real transaction evidence</text>
  <text x="498" y="230" font-size="9" fill="hsl(var(--muted-foreground))">− deals are context-specific</text>
  <text x="498" y="246" font-size="9" fill="hsl(var(--muted-foreground))">− data often scarce</text>
  <text x="498" y="264" font-size="8.5" font-style="italic" fill="hsl(var(--primary))">sets the premium benchmark</text>

  <!-- nav band -->
  <rect x="40" y="294" width="640" height="190" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="318" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — IN A CASE, DCF IS YOUR SPINE; THE OTHERS SANITY-CHECK IT</text>
  <circle cx="64" cy="342" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="346" font-size="10.5" fill="hsl(var(--foreground))">Build the DCF: estimate the target's free cash flows, pick a sensible growth and discount rate, take the PV.</text>
  <text x="74" y="362" font-size="10.5" fill="hsl(var(--foreground))">That is the standalone value you then add synergies to.</text>
  <circle cx="64" cy="384" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="388" font-size="10.5" fill="hsl(var(--foreground))">Cross-check with a multiple — "peers trade at 12× EBITDA, my DCF implies 11×, so it is in the right zone."</text>
  <circle cx="64" cy="410" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="414" font-size="10.5" fill="hsl(var(--foreground))">Precedent deals tell you the control premium acquirers actually pay — useful for judging the offer price.</text>
  <circle cx="64" cy="436" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="440" font-size="10.5" fill="hsl(var(--foreground))">Never rely on one method. Triangulating three numbers is more defensible than a single false-precision figure.</text>
  <text x="60" y="466" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Interviewers rarely want a full DCF built live — they want to see you know the logic and can reason about the drivers.</text>
</svg>` },

    { type: 'callout', variant: 'tip', title: 'You will not build a full DCF live', md: 'Interviewers want to see that you understand valuation logic — free cash flows, a discount rate, a terminal value — and can reason about what moves the number, not that you can crunch a ten-year model in your head. Saying "I would build a DCF of the target\'s free cash flows and sanity-check it against peer multiples" is usually enough; then reason about the key drivers.' },

    { type: 'heading', level: 2, text: 'The synergy taxonomy', emphasize: 'synergy taxonomy' },

    { type: 'prose', md: 'Synergies are the extra value created by combining the two businesses — value that exists for this buyer and not for the target alone. They come in three flavours, and they are not equally trustworthy.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Synergy taxonomy splitting into operational revenue, operational cost, and financial synergies", caption: "The synergy taxonomy — operational (revenue and cost) and financial. Cost synergies are reliable; revenue synergies are the most overestimated.", svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="245" y="18" width="230" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="0.02em" fill="#ffffff">THE SYNERGY TAXONOMY</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">the extra value from combining, by type</text>

  <path d="M360 64 C360 84, 190 82, 190 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>
  <path d="M360 64 C360 84, 530 82, 530 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75"/>

  <!-- OPERATIONAL -->
  <rect x="40" y="102" width="300" height="40" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="190" y="127" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">OPERATIONAL SYNERGIES</text>

  <path d="M190 142 C190 158, 115 156, 115 172" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
  <path d="M190 142 C190 158, 265 156, 265 172" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>

  <rect x="40" y="172" width="150" height="150" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="58" y="194" font-size="10.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">REVENUE</text>
  <text x="58" y="210" font-size="8.5" fill="hsl(var(--muted-foreground))">sell more, or at more</text>
  <circle cx="60" cy="230" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="234" font-size="9.5" fill="hsl(var(--foreground))">Cross-sell to each</text>
  <text x="70" y="246" font-size="9.5" fill="hsl(var(--foreground))">other's customers</text>
  <circle cx="60" cy="266" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="270" font-size="9.5" fill="hsl(var(--foreground))">Wider distribution</text>
  <circle cx="60" cy="290" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="294" font-size="9.5" fill="hsl(var(--foreground))">Pricing power</text>
  <text x="58" y="314" font-size="8" font-style="italic" fill="hsl(var(--muted-foreground))">most overestimated</text>

  <rect x="200" y="172" width="140" height="150" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="218" y="194" font-size="10.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">COST</text>
  <text x="218" y="210" font-size="8.5" fill="hsl(var(--muted-foreground))">spend less, combined</text>
  <circle cx="220" cy="230" r="2.5" fill="hsl(var(--primary))"/><text x="230" y="234" font-size="9.5" fill="hsl(var(--foreground))">Economies of scale</text>
  <circle cx="220" cy="254" r="2.5" fill="hsl(var(--primary))"/><text x="230" y="258" font-size="9.5" fill="hsl(var(--foreground))">Remove duplication</text>
  <circle cx="220" cy="278" r="2.5" fill="hsl(var(--primary))"/><text x="230" y="282" font-size="9.5" fill="hsl(var(--foreground))">Shared R&amp;D / SG&amp;A</text>
  <text x="218" y="306" font-size="8" font-style="italic" fill="hsl(var(--muted-foreground))">more reliable</text>

  <!-- FINANCIAL -->
  <rect x="380" y="102" width="300" height="40" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="530" y="127" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">FINANCIAL SYNERGIES</text>

  <rect x="380" y="172" width="300" height="150" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="398" y="194" font-size="10.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">FROM THE BALANCE SHEET, NOT OPERATIONS</text>
  <circle cx="400" cy="216" r="2.5" fill="hsl(var(--primary))"/><text x="410" y="220" font-size="9.5" fill="hsl(var(--foreground))">Tax shield — use losses, optimise structure</text>
  <circle cx="400" cy="240" r="2.5" fill="hsl(var(--primary))"/><text x="410" y="244" font-size="9.5" fill="hsl(var(--foreground))">Improved leverage / lower cost of capital</text>
  <circle cx="400" cy="264" r="2.5" fill="hsl(var(--primary))"/><text x="410" y="268" font-size="9.5" fill="hsl(var(--foreground))">Greater debt capacity combined</text>
  <circle cx="400" cy="288" r="2.5" fill="hsl(var(--primary))"/><text x="410" y="292" font-size="9.5" fill="hsl(var(--foreground))">Access to cheaper financing</text>
  <text x="398" y="314" font-size="8" font-style="italic" fill="hsl(var(--muted-foreground))">real, but rarely the headline reason for a deal</text>

  <!-- nav band -->
  <rect x="40" y="344" width="640" height="178" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="368" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — DISCOUNT REVENUE SYNERGIES, TRUST COST SYNERGIES MORE</text>
  <circle cx="64" cy="392" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="396" font-size="10.5" fill="hsl(var(--foreground))">Cost synergies are more reliable — you control them (close a plant, merge teams). Revenue synergies</text>
  <text x="74" y="412" font-size="10.5" fill="hsl(var(--foreground))">depend on customers behaving as hoped, so haircut them hard before putting them in a valuation.</text>
  <circle cx="64" cy="434" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="438" font-size="10.5" fill="hsl(var(--foreground))">Always net synergies against the cost to achieve them — integration is not free, and the timing matters.</text>
  <circle cx="64" cy="460" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="464" font-size="10.5" fill="hsl(var(--foreground))">Name the synergy type — "cost synergy from shared plant" beats a vague "there are synergies."</text>
  <text x="60" y="490" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">A deal justified mainly by revenue synergies is a riskier deal. Say so — it shows you know where bids go wrong.</text>
  <text x="60" y="508" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Synergies are an input to valuation, not a separate prize — they raise what the target is worth to this buyer.</text>
</svg>` },

    { type: 'callout', variant: 'pitfall', title: 'Revenue synergies are where deals die', md: 'Cost synergies are within your control — close a duplicate plant, merge two finance teams, and the saving is real. Revenue synergies assume customers will buy more from the combined company than they did from the two apart, which frequently does not happen. Haircut revenue synergies hard, and never let a deal rest mainly on them. If the math only works with aggressive revenue synergies, that is a warning, not a green light.' },

    { type: 'heading', level: 2, text: 'The value bridge', emphasize: 'value bridge' },

    { type: 'prose', md: 'Put it together. Standalone value plus synergies, net of the cost to capture them, is the most the target is worth to you — the ceiling on price. The net benefit is whatever sits between that ceiling and what you actually pay.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Value bridge waterfall from standalone value through synergies, price, and integration to net benefit", caption: "The value bridge — standalone value plus synergies sets the ceiling; net benefit is the gap between that ceiling and the price paid.", svg: `<svg viewBox="0 0 720 480" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="240" y="18" width="240" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="0.02em" fill="#ffffff">THE VALUE BRIDGE</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">from standalone value to net benefit</text>

  <!-- baseline -->
  <line x1="60" y1="300" x2="680" y2="300" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>

  <!-- bar 1: standalone value (positive, tall) -->
  <rect x="80" y="150" width="90" height="150" rx="4" fill="hsl(214 64% 19%)"/>
  <text x="125" y="142" text-anchor="middle" font-size="10" font-weight="700" fill="hsl(var(--foreground))">Standalone</text>
  <text x="125" y="320" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">target's own</text>
  <text x="125" y="332" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">cash flows</text>

  <!-- + synergies (stacked up from top of bar1) -->
  <rect x="200" y="110" width="90" height="40" rx="4" fill="hsl(356 74% 46%)"/>
  <text x="245" y="102" text-anchor="middle" font-size="10" font-weight="700" fill="hsl(var(--foreground))">+ Synergies</text>
  <text x="245" y="135" text-anchor="middle" font-size="9" fill="#ffffff">net of cost</text>
  <line x1="170" y1="150" x2="200" y2="150" stroke="hsl(var(--border-strong))" stroke-width="1" stroke-dasharray="3 2"/>

  <!-- = total value to buyer (marker) -->
  <rect x="320" y="110" width="90" height="190" rx="4" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="365" y="102" text-anchor="middle" font-size="10" font-weight="700" fill="hsl(var(--foreground))">= Value to us</text>
  <text x="365" y="200" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">the ceiling</text>
  <text x="365" y="212" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">on price</text>

  <!-- - price (down) -->
  <rect x="440" y="110" width="90" height="120" rx="4" fill="hsl(214 30% 55%)"/>
  <text x="485" y="102" text-anchor="middle" font-size="10" font-weight="700" fill="hsl(var(--foreground))">− Price</text>
  <text x="485" y="175" text-anchor="middle" font-size="9" fill="#ffffff">what we pay</text>
  <line x1="410" y1="110" x2="440" y2="110" stroke="hsl(var(--border-strong))" stroke-width="1" stroke-dasharray="3 2"/>

  <!-- - integration (down) -->
  <rect x="560" y="230" width="90" height="30" rx="4" fill="hsl(214 20% 68%)"/>
  <text x="605" y="222" text-anchor="middle" font-size="10" font-weight="700" fill="hsl(var(--foreground))">− Integration</text>
  <text x="605" y="249" text-anchor="middle" font-size="8.5" fill="hsl(var(--foreground))">cost to capture</text>
  <line x1="530" y1="230" x2="560" y2="230" stroke="hsl(var(--border-strong))" stroke-width="1" stroke-dasharray="3 2"/>

  <!-- = net benefit (the gap that remains, shown as a red bracket on far right) -->
  <line x1="650" y1="260" x2="650" y2="300" stroke="hsl(var(--primary))" stroke-width="2.5"/>
  <text x="662" y="276" font-size="9" font-weight="700" fill="hsl(var(--primary))">NET</text>
  <text x="662" y="288" font-size="9" font-weight="700" fill="hsl(var(--primary))">BENEFIT</text>

  <!-- nav band -->
  <rect x="40" y="350" width="640" height="114" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="374" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — VALUE TO US IS THE CEILING; NEVER PAY IT ALL</text>
  <circle cx="64" cy="398" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="402" font-size="10.5" fill="hsl(var(--foreground))">Standalone value + synergies = the most the target is worth to this buyer. Pay less than that and the</text>
  <text x="74" y="418" font-size="10.5" fill="hsl(var(--foreground))">net benefit is positive; the gap between value and price is the deal's margin of safety.</text>
  <circle cx="64" cy="440" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="444" font-size="10.5" fill="hsl(var(--foreground))">If you must pay the full synergy value to win, the seller captures all the upside — walk, or rethink the bid.</text>
</svg>` },

    { type: 'callout', variant: 'insight', title: 'The price discipline that scores', md: 'The gap between value-to-you and price is the deal\'s margin of safety. If you pay the full value including every synergy, the seller captures all the upside and you are betting flawless execution just to break even. Strong candidates name the maximum they would pay and hold a discount below it — and walk when a competitive auction pushes price past value.' },

    { type: 'heading', level: 2, text: 'Worked mini-case', emphasize: 'Worked mini-case' },

    { type: 'prose', md: 'A short numerical example of the bridge in action — note how the candidate separates standalone value from synergies, discounts the revenue synergy, and reasons about the price ceiling.' },

    { type: 'dialogue', title: 'Valuing a logistics target', turns: [
      { speaker: 'interviewer', md: 'A national retailer is acquiring a regional logistics company. The target generates about ₹50cr of free cash flow a year, growing slowly. The retailer thinks there are big synergies. How would you value it and decide a price?' },
      { speaker: 'candidate', md: 'Standalone first. ₹50cr of roughly flat free cash flow — as a rough DCF, at say a 10% discount rate with low growth, that is in the ballpark of ₹500cr of standalone value. I would sanity-check against logistics-sector multiples, but let me use ₹500cr as the base. Now synergies — and I would split them. The reliable one is cost: the retailer can fill the target\'s empty backhaul trips with its own freight, raising utilisation. That is largely within their control. The riskier one is revenue: cross-selling the target\'s services to the retailer\'s suppliers — possible, but I would discount it heavily.' },
      { speaker: 'interviewer', md: 'Say cost synergies are worth ₹150cr in present value and revenue synergies a claimed ₹200cr. What do you do with those?' },
      { speaker: 'candidate', md: 'I would take most of the cost synergy — call it ₹130cr after the cost to capture it, since integrating fleets and systems is not free. The ₹200cr revenue synergy I would haircut hard, maybe to ₹60-80cr, because it depends on suppliers actually switching. So value to the retailer is roughly ₹500cr standalone + ₹130cr + ₹70cr ≈ ₹700cr. That is the ceiling. I would advise paying meaningfully below it — perhaps ₹580-620cr — so the retailer keeps a margin of safety and is not paying today for synergies that may not fully materialise. If a bidding war pushed the price toward ₹700cr, I would advise walking, because at that price the seller captures all the value the retailer worked to create.' },
      { speaker: 'narrator', md: 'The candidate valued standalone first, split synergies by reliability, discounted the revenue synergy explicitly, built the value ceiling, and held a disciplined gap between value and price — even naming the walk-away point.', note: 'Standalone, then synergies by reliability, then a price held below the value ceiling.' },
    ]},

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'You will estimate standalone value by triangulating DCF, trading multiples, and precedent deals — and reason about the drivers rather than building a full model live.',
      'You will classify synergies as operational (revenue and cost) or financial, and weight cost synergies as reliable while haircutting revenue synergies hard.',
      'You will net every synergy against the cost and time required to capture it, rather than counting the gross figure.',
      'You will treat standalone value plus net synergies as the ceiling on price, and hold a disciplined gap below it as the deal\'s margin of safety.',
      'You will flag a deal that depends mainly on revenue synergies as a riskier deal, and name a walk-away price when an auction pushes value away.',
    ]},
  ],
};
