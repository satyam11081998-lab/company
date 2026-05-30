import type { Page } from '@/lib/casebook/types';

export const dueDiligence: Page = {
  slug: 'core-frameworks/m-and-a/due-diligence',
  title: 'Due Diligence',
  titleEmphasize: 'Due Diligence',
  subtitle: 'Before committing capital, investigate. This page covers the three-phase diligence process and the four commercial lenses consultants use to decide whether a business is worth buying — a framework that applies to any "should we invest" question, not just private equity.',
  kind: 'framework',
  meta: { readingTimeMin: 13, tags: ['core-frameworks', 'm-and-a', 'due-diligence', 'private-equity'], caseType: 'Due Diligence' },
  blocks: [
    { type: 'hook', md: 'Due diligence is professional scepticism turned into a process. A banker pitches the deal; the diligence team\'s job is to find the reason not to do it. In a case, that mindset is the whole game — you are not asked to describe the target, you are asked to hunt for the deal-breaker hiding in the market, the moat, the numbers, or the customer base, and to translate what you find into the price you should pay.', emphasize: 'find the reason not to do it' },

    { type: 'prose', md: 'Commercial due diligence is the part of a deal a consulting firm actually runs — assessing whether the business is sound, while bankers and lawyers handle the financial and legal pieces. Although it is the classic private-equity step, the framework generalises to any case where a client asks "should I invest in, acquire, or enter this?" If you can run commercial DD, you can structure a large share of investment cases.' },

    { type: 'heading', level: 2, text: 'The diligence process', emphasize: 'diligence process' },

    { type: 'prose', md: 'Diligence runs in three phases: frame the investment, investigate it, then decide and plan. The middle phase is where the analysis lives; the bookends set it up and conclude it.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Three-phase due diligence process with pre, core diligence, and post phases", caption: "Due diligence as a three-phase process — pre-diligence (frame), diligence (the four commercial lenses), and post-diligence (decide and plan the exit).", svg: `<svg viewBox="0 0 720 470" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="225" y="18" width="270" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="0.02em" fill="#ffffff">DUE DILIGENCE — THE PROCESS</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">investigate before you commit, in three phases</text>

  <path d="M360 64 C360 82, 130 80, 130 98" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 82, 360 80, 360 98" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 82, 590 80, 590 98" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>

  <!-- PRE -->
  <rect x="40" y="98" width="180" height="40" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="130" y="123" text-anchor="middle" font-size="12" font-weight="700" fill="hsl(var(--foreground))">1 · PRE-DILIGENCE</text>
  <rect x="40" y="152" width="180" height="128" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="58" y="174" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">FRAME THE INVESTMENT</text>
  <circle cx="60" cy="194" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="198" font-size="9.5" fill="hsl(var(--foreground))">Investor profile</text>
  <circle cx="60" cy="216" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="220" font-size="9.5" fill="hsl(var(--foreground))">Existing portfolio</text>
  <circle cx="60" cy="238" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="242" font-size="9.5" fill="hsl(var(--foreground))">Investment objective</text>
  <text x="58" y="266" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">why, and does it fit?</text>

  <!-- DILIGENCE (core, taller) -->
  <rect x="240" y="98" width="240" height="40" rx="10" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#cs)"/>
  <text x="360" y="123" text-anchor="middle" font-size="12" font-weight="700" fill="hsl(var(--foreground))">2 · DILIGENCE (the core)</text>
  <rect x="240" y="152" width="240" height="128" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="258" y="174" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">FOUR COMMERCIAL LENSES</text>
  <circle cx="260" cy="194" r="2.5" fill="hsl(var(--primary))"/><text x="270" y="198" font-size="9.5" fill="hsl(var(--foreground))">Market — size, outlook, drivers</text>
  <circle cx="260" cy="216" r="2.5" fill="hsl(var(--primary))"/><text x="270" y="220" font-size="9.5" fill="hsl(var(--foreground))">Competition — benchmark, moat</text>
  <circle cx="260" cy="238" r="2.5" fill="hsl(var(--primary))"/><text x="270" y="242" font-size="9.5" fill="hsl(var(--foreground))">Business — financial &amp; non-financial</text>
  <circle cx="260" cy="260" r="2.5" fill="hsl(var(--primary))"/><text x="270" y="264" font-size="9.5" fill="hsl(var(--foreground))">Customer — loyalty, segments</text>

  <!-- POST -->
  <rect x="500" y="98" width="180" height="40" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="590" y="123" text-anchor="middle" font-size="12" font-weight="700" fill="hsl(var(--foreground))">3 · POST-DILIGENCE</text>
  <rect x="500" y="152" width="180" height="128" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="518" y="174" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">DECIDE &amp; PLAN</text>
  <circle cx="520" cy="194" r="2.5" fill="hsl(var(--primary))"/><text x="530" y="198" font-size="9.5" fill="hsl(var(--foreground))">Valuation &amp; transaction</text>
  <circle cx="520" cy="216" r="2.5" fill="hsl(var(--primary))"/><text x="530" y="220" font-size="9.5" fill="hsl(var(--foreground))">Growth / value plan</text>
  <circle cx="520" cy="238" r="2.5" fill="hsl(var(--primary))"/><text x="530" y="242" font-size="9.5" fill="hsl(var(--foreground))">Exit options</text>
  <text x="518" y="266" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">how we make a return</text>

  <!-- nav band -->
  <rect x="40" y="302" width="640" height="150" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="326" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — DD IS A "SHOULD WE INVEST" FRAMEWORK, NOT JUST A PE STEP</text>
  <circle cx="64" cy="350" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="354" font-size="10.5" fill="hsl(var(--foreground))">The middle phase — the four commercial lenses — is the part you actually analyse in a case. Pre and post</text>
  <text x="74" y="370" font-size="10.5" fill="hsl(var(--foreground))">frame and conclude it.</text>
  <circle cx="64" cy="392" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="396" font-size="10.5" fill="hsl(var(--foreground))">This generalises far beyond PE: any "should the client invest / acquire / enter" prompt can use these lenses.</text>
  <circle cx="64" cy="418" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="422" font-size="10.5" fill="hsl(var(--foreground))">Notice the overlap with Market Entry — both ask "is this attractive and can we win." DD adds the investor's exit.</text>
  <text x="60" y="444" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Commercial DD is the consulting firm's job in a deal — assessing the business, while bankers/lawyers handle the rest.</text>
</svg>` },

    { type: 'callout', variant: 'insight', title: 'This is market entry with an exit', md: 'Notice the overlap: the diligence phase asks "is the market attractive and can this business win in it" — the same questions as a market-entry case. Due diligence adds the investor\'s lens on top: not just "is this a good business" but "can we buy it at a price that earns our return, and how do we eventually exit." If you know market entry, you are most of the way to commercial DD.' },

    { type: 'heading', level: 2, text: 'The four commercial lenses', emphasize: 'four commercial lenses' },

    { type: 'prose', md: 'The heart of diligence is four lenses applied to the target. Market and competition test whether it sits in a good position; business and customer test whether that position is durable enough to rely on the cash flows you are paying for.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Four commercial due diligence lenses with sub-items and a deal-breaker-hunting navigation panel", caption: "The four commercial DD lenses — market, competition, business, customer. The job is to hunt for the deal-breaker and tie findings to price.", svg: `<svg viewBox="0 0 720 560" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="215" y="18" width="290" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="12.5" font-weight="700" letter-spacing="0.02em" fill="#ffffff">THE FOUR COMMERCIAL DD LENSES</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">is this a good business, and will it stay good?</text>

  <path d="M360 64 C360 84, 130 82, 130 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 285 82, 285 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 435 82, 435 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 590 82, 590 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>

  <rect x="40" y="102" width="150" height="160" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="58" y="124" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">MARKET</text>
  <text x="58" y="139" font-size="8.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">IS THE POND BIG?</text>
  <circle cx="60" cy="160" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="164" font-size="9.5" fill="hsl(var(--foreground))">Size (guesstimate)</text>
  <circle cx="60" cy="182" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="186" font-size="9.5" fill="hsl(var(--foreground))">Future outlook</text>
  <circle cx="60" cy="204" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="208" font-size="9.5" fill="hsl(var(--foreground))">Growth drivers</text>
  <circle cx="60" cy="226" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="230" font-size="9.5" fill="hsl(var(--foreground))">Cyclicality</text>
  <text x="58" y="252" font-size="8" font-style="italic" fill="hsl(var(--muted-foreground))">like market entry</text>

  <rect x="200" y="102" width="150" height="160" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="218" y="124" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">COMPETITION</text>
  <text x="218" y="139" font-size="8.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">CAN IT DEFEND?</text>
  <circle cx="220" cy="160" r="2.5" fill="hsl(var(--primary))"/><text x="230" y="164" font-size="9.5" fill="hsl(var(--foreground))">Benchmark vs peers</text>
  <circle cx="220" cy="182" r="2.5" fill="hsl(var(--primary))"/><text x="230" y="186" font-size="9.5" fill="hsl(var(--foreground))">Differentiation</text>
  <circle cx="220" cy="204" r="2.5" fill="hsl(var(--primary))"/><text x="230" y="208" font-size="9.5" fill="hsl(var(--foreground))">Moat &amp; durability</text>
  <circle cx="220" cy="226" r="2.5" fill="hsl(var(--primary))"/><text x="230" y="230" font-size="9.5" fill="hsl(var(--foreground))">Threat of entry</text>
  <text x="218" y="252" font-size="8" font-style="italic" fill="hsl(var(--muted-foreground))">is the moat real?</text>

  <rect x="360" y="102" width="150" height="160" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="378" y="124" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">BUSINESS</text>
  <text x="378" y="139" font-size="8.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">IS IT WELL-RUN?</text>
  <circle cx="380" cy="160" r="2.5" fill="hsl(var(--primary))"/><text x="390" y="164" font-size="9.5" fill="hsl(var(--foreground))">Financials &amp; unit econ</text>
  <circle cx="380" cy="182" r="2.5" fill="hsl(var(--primary))"/><text x="390" y="186" font-size="9.5" fill="hsl(var(--foreground))">Monetisation model</text>
  <circle cx="380" cy="204" r="2.5" fill="hsl(var(--primary))"/><text x="390" y="208" font-size="9.5" fill="hsl(var(--foreground))">Operations &amp; team</text>
  <circle cx="380" cy="226" r="2.5" fill="hsl(var(--primary))"/><text x="390" y="230" font-size="9.5" fill="hsl(var(--foreground))">Cash &amp; funding</text>
  <text x="378" y="252" font-size="8" font-style="italic" fill="hsl(var(--muted-foreground))">financial + non-fin</text>

  <rect x="520" y="102" width="160" height="160" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="538" y="124" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">CUSTOMER</text>
  <text x="538" y="139" font-size="8.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">ARE THEY LOYAL?</text>
  <circle cx="540" cy="160" r="2.5" fill="hsl(var(--primary))"/><text x="550" y="164" font-size="9.5" fill="hsl(var(--foreground))">Behavioural — retention</text>
  <circle cx="540" cy="182" r="2.5" fill="hsl(var(--primary))"/><text x="550" y="186" font-size="9.5" fill="hsl(var(--foreground))">Psychographic — why</text>
  <circle cx="540" cy="204" r="2.5" fill="hsl(var(--primary))"/><text x="550" y="208" font-size="9.5" fill="hsl(var(--foreground))">Firmographic — who</text>
  <circle cx="540" cy="226" r="2.5" fill="hsl(var(--primary))"/><text x="550" y="230" font-size="9.5" fill="hsl(var(--foreground))">Concentration risk</text>
  <text x="538" y="252" font-size="8" font-style="italic" fill="hsl(var(--muted-foreground))">churn kills returns</text>

  <!-- nav band -->
  <rect x="40" y="284" width="640" height="238" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="308" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — DD HUNTS FOR DEAL-BREAKERS, NOT JUST A DESCRIPTION</text>
  <circle cx="64" cy="332" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="336" font-size="10.5" fill="hsl(var(--foreground))">The point of DD is to find the thing that kills the investment — a shrinking market, a fake moat, hidden</text>
  <text x="74" y="352" font-size="10.5" fill="hsl(var(--foreground))">customer concentration, unsustainable unit economics. Lead with what would most threaten the thesis.</text>
  <circle cx="64" cy="374" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="378" font-size="10.5" fill="hsl(var(--foreground))">Market and Competition together test "is this a good pond and a good fish in it" — same logic as market entry.</text>
  <circle cx="64" cy="400" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="404" font-size="10.5" fill="hsl(var(--foreground))">Business and Customer test durability — can the cash flows you are paying for actually be relied on?</text>
  <circle cx="64" cy="426" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="430" font-size="10.5" fill="hsl(var(--foreground))">Customer concentration is a classic deal-breaker: if one client is 40% of revenue, the moat may be an illusion.</text>
  <circle cx="64" cy="452" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="456" font-size="10.5" fill="hsl(var(--foreground))">Tie every finding back to valuation — a weak lens lowers the price you should pay, it does not just "look bad."</text>
  <text x="60" y="482" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">A consultant doing commercial DD is paid to be the professional sceptic — assume the thesis is wrong until the</text>
  <text x="60" y="500" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">evidence across these four lenses says otherwise. That mindset is what the interviewer is testing.</text>
</svg>` },

    { type: 'callout', variant: 'pitfall', title: 'Customer concentration is the classic killer', md: 'A business can look healthy on every other lens and still be a bad investment if one or two customers make up most of its revenue — lose them and the cash flows you valued vanish. Always probe concentration: by customer, by product, by geography, by channel. A "strong" business resting on one client is a fragile one, and spotting that is exactly what diligence is for.' },

    { type: 'heading', level: 2, text: 'Navigating it live', emphasize: 'Navigating it live' },

    { type: 'prose', md: 'Run a diligence case as a thesis you actively try to break. State why this should be a good investment, pressure-test that claim across the four lenses, and convert what you find into a price and a recommendation.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Due diligence diagnostic flow as a five-step path with a thesis-survival gate", caption: "How to run a due-diligence case live — frame, form a thesis, pressure-test across four lenses, translate findings into value, recommend.", svg: `<svg viewBox="0 0 720 510" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="195" y="20" width="330" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="42" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">1 · Frame the investment</text>
  <text x="360" y="57" text-anchor="middle" font-size="9" fill="#b9c4d6">who is investing, why, what return, over what horizon</text>

  <path d="M360 66 C360 80, 360 80, 360 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="94" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="116" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">2 · Form the investment thesis</text>
  <text x="360" y="133" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">state up front why this should be a good investment — then test it</text>

  <path d="M360 144 C360 158, 360 158, 360 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="172" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="194" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">3 · Pressure-test across the four lenses</text>
  <text x="360" y="211" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">market, competition, business, customer — hunt for the deal-breaker</text>

  <path d="M360 222 C360 236, 360 236, 360 248" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="210" y="250" width="300" height="44" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#cs)"/>
  <text x="360" y="270" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="0.02em" fill="hsl(var(--primary))">THESIS SURVIVE? ANY RED FLAGS?</text>
  <text x="360" y="286" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">one fatal flaw (fake moat, churn) can sink it alone</text>

  <path d="M360 294 C360 308, 360 308, 360 320" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="322" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="344" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">4 · Translate findings into value</text>
  <text x="360" y="361" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">each risk adjusts the price; strengths support it</text>

  <path d="M360 372 C360 386, 360 386, 360 398" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="400" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="422" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">5 · Recommend — invest / pass / re-price</text>
  <text x="360" y="439" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">with the conditions and the value-creation plan to follow</text>

  <rect x="40" y="466" width="640" height="40" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="491" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Lead with a thesis, then try to break it. Confirmation-hunting ("look, it's good!") is the failure mode DD exists to prevent.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Worked mini-case', emphasize: 'Worked mini-case' },

    { type: 'prose', md: 'A short example of the diligence mindset — note how the candidate states a thesis, then immediately hunts for what could break it, and converts a red flag into a re-pricing rather than a flat no.' },

    { type: 'dialogue', title: 'Diligence on a D2C brand', turns: [
      { speaker: 'interviewer', md: 'A PE fund is considering buying a direct-to-consumer skincare brand growing 40% a year. They\'ve asked us to run commercial diligence. How would you approach it?' },
      { speaker: 'candidate', md: 'I\'d start with the investment thesis: the bull case is presumably "a fast-growing brand in a large, premiumising skincare market with loyal repeat customers, that a fund can scale further and exit in five years." My job is to pressure-test that, hunting for what could break it. I\'d go across four lenses, but given a 40%-growth D2C brand, I\'d front-load two suspicions: is the growth bought with unsustainable marketing spend, and is retention real or is it churning and re-acquiring?' },
      { speaker: 'interviewer', md: 'Good instincts. Why those two first?' },
      { speaker: 'candidate', md: 'Because they are the classic D2C deal-breakers. On the business lens, many D2C brands grow fast by spending heavily on digital ads — if customer acquisition cost is rising and lifetime value is not, the growth is unprofitable and stops the moment you slow spend. On the customer lens, a brand can show big revenue growth while quietly churning customers, masking it with new acquisition. So I\'d want the unit economics — CAC, LTV, payback period — and a cohort retention curve. On market and competition I\'d check that the category is genuinely growing and that the brand has a real moat beyond marketing, because skincare has low barriers to entry.' },
      { speaker: 'interviewer', md: 'Say diligence finds retention is strong, but CAC has doubled in two years as the brand scaled. What do you tell the fund?' },
      { speaker: 'candidate', md: 'That changes the price, not necessarily the answer. Strong retention means the customer base is real — that supports the thesis. But doubling CAC means future growth is more expensive than the historical 40% implies, so I\'d lower my forward growth and margin assumptions, which lowers the valuation. My recommendation would be: the business is fundamentally sound and worth owning, but not at a price that extrapolates 40% growth cheaply — re-price the deal to reflect rising acquisition cost, and make a post-deal plan to diversify acquisition channels away from paid ads. So: invest, but at a lower price and with a clear value-creation plan.' },
      { speaker: 'narrator', md: 'The candidate stated the thesis, front-loaded the most likely deal-breakers for that business type, distinguished the red flag that kills a deal (fake retention) from the one that re-prices it (rising CAC), and converted the finding into a valuation adjustment plus a value-creation plan rather than a binary yes/no.', note: 'State a thesis, hunt the likely deal-breakers first, and turn findings into price, not just verdicts.' },
    ]},

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'You will run diligence in three phases — frame the investment, investigate across the four lenses, then decide and plan — and recognise the framework applies to any "should we invest" case.',
      'You will pressure-test across market, competition, business, and customer, leading with whatever would most threaten the investment thesis rather than describing the business evenly.',
      'You will approach DD as professional scepticism — state a thesis and actively try to break it, rather than hunting for confirmation that the deal is good.',
      'You will probe for the classic deal-breakers — fake moats, unsustainable unit economics, and especially customer concentration — because one fatal flaw can sink an otherwise healthy business.',
      'You will translate every finding into value: a weak lens lowers the price you should pay or re-prices the deal, rather than simply "looking bad," and a red flag may mean re-price rather than walk.',
    ]},
  ],
};
