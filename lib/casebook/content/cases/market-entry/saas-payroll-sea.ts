import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const saasPayrollSea: Page = {
  slug: 'cases/market-entry/saas-payroll-sea',
  title: 'An Indian SaaS Goes to Southeast Asia',
  subtitle: 'Payroll software is a local-rules business. Can it travel?',
  kind: 'case',
  meta: { difficulty: 'challenging', caseType: 'Market Entry', readingTimeMin: 11, tags: ['saas', 'international', 'b2b'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client sells payroll-and-compliance SaaS to 18,000 Indian SMEs at ~₹40,000 average annual contract value (ACV), growing 35% with strong retention. The board wants international expansion and has shortlisted Southeast Asia. Assess the move and recommend a market and an entry route.' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Payroll is unusually localization-heavy — tax tables, labour law, statutory filings differ per country and change yearly. So first: why international at all, when India SME penetration is still low? Is this board ambition or a real ceiling?', note: 'Challenging the premise is risky — but payroll\'s localization burden makes "why leave India?" the single best first question here.' },
        { speaker: 'interviewer', md: 'Fair challenge. India remains big, but two US-funded competitors are discounting aggressively at home; the board wants a second engine before the home market commoditizes. Budget is $5M over two years.' },
        { speaker: 'candidate', md: 'A hedge, then — with a hard budget. That argues for *one* country done deeply, not a regional spray. I\'ll screen SEA markets on three axes: SME-payroll demand and willingness to pay, regulatory complexity (our moat once built, our cost to build), and competitive whitespace. Then pick build-vs-partner-vs-acquire.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Country screen matrix for Southeast Asian payroll SaaS entry with three evaluation axes and entry route options', caption: 'One country, done deeply — the screen and the route are the whole case.', svg: `<svg viewBox="0 0 720 370" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="spcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="spng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="250" y="14" width="220" height="44" rx="12" fill="url(#spng)" filter="url(#spcs)"/>
  <text x="360" y="34" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">WHICH COUNTRY, WHICH ROUTE?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">$5M · 2 years · one bet</text>
  <path d="M360 58 L360 74 M150 74 L570 74 M150 74 L150 90 M360 74 L360 90 M570 74 L570 90" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <g text-anchor="middle">
    <rect x="50" y="92" width="200" height="76" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#spcs)"/>
    <text x="150" y="111" font-size="9" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">DEMAND &amp; WTP</text>
    <text x="150" y="128" font-size="9.5" fill="hsl(var(--muted-foreground))"># SMEs with &gt;20 staff</text>
    <text x="150" y="142" font-size="9.5" fill="hsl(var(--muted-foreground))">· digitization of payroll</text>
    <text x="150" y="156" font-size="9.5" fill="hsl(var(--muted-foreground))">· achievable ACV vs India</text>
    <rect x="260" y="92" width="200" height="76" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#spcs)"/>
    <text x="360" y="111" font-size="9" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">REGULATORY BUILD COST</text>
    <text x="360" y="128" font-size="9.5" fill="hsl(var(--muted-foreground))">statutory complexity ·</text>
    <text x="360" y="142" font-size="9.5" fill="hsl(var(--muted-foreground))">language · change velocity</text>
    <text x="360" y="156" font-size="9.5" fill="hsl(var(--muted-foreground))">(cost now, MOAT later)</text>
    <rect x="470" y="92" width="200" height="76" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#spcs)"/>
    <text x="570" y="111" font-size="9" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">WHITESPACE</text>
    <text x="570" y="128" font-size="9.5" fill="hsl(var(--muted-foreground))">incumbent strength ·</text>
    <text x="570" y="142" font-size="9.5" fill="hsl(var(--muted-foreground))">global players' coverage ·</text>
    <text x="570" y="156" font-size="9.5" fill="hsl(var(--muted-foreground))">local-champion risk</text>
  </g>
  <path d="M360 168 L360 192" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <rect x="80" y="196" width="560" height="98" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="360" y="218" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">ENTRY ROUTE — THE LOCALIZATION BURDEN DECIDES</text>
  <text x="110" y="241" font-size="10" font-weight="600" fill="hsl(var(--foreground))">Build:</text>
  <text x="160" y="241" font-size="10" fill="hsl(var(--muted-foreground))">12–18 months of statutory engine work before first rupee — burns most of the $5M</text>
  <text x="110" y="261" font-size="10" font-weight="600" fill="hsl(var(--foreground))">Partner:</text>
  <text x="172" y="261" font-size="10" fill="hsl(var(--muted-foreground))">white-label a local compliance engine; faster, splits margin, dependency risk</text>
  <text x="110" y="281" font-size="10" font-weight="600" fill="hsl(var(--foreground))">Acquire:</text>
  <text x="172" y="281" font-size="10" fill="hsl(var(--muted-foreground))">buy a small local payroll player for its rules engine + book; $2–4M for a sub-scale asset</text>
  <text x="360" y="330" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">In compliance software, the localization moat cuts both ways: expensive to enter, defensible once in.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Screen data: Indonesia — 1.2M target SMEs, low SaaS penetration, complex and fast-changing rules, Bahasa-only, two funded local champions. Philippines — 350K target SMEs, English-friendly, US-style payroll culture, moderate rules, no dominant SME player. Vietnam — 500K SMEs, rules moderate, but payroll deeply informal. Singapore — small, saturated, high ACV.' },
        { speaker: 'candidate', md: 'Indonesia is the biggest prize but the worst fit for $5M: language, regulatory velocity, and funded local champions each multiply cost. Vietnam\'s informality means we\'d be selling formalization, not software — a different, slower business. Singapore is a flag, not a market. The **Philippines** wins on fit: English lowers product and sales translation cost, no dominant incumbent, and US-influenced payroll culture matches SaaS buying behavior. 350K SMEs at even $800 ACV is a $280M TAM — plenty for a second engine.', note: 'Picks with reasons tied to the client\'s constraint ($5M, 2 years), not to raw market size. Biggest ≠ best.' },
        { speaker: 'interviewer', md: 'And the route?' },
        { speaker: 'candidate', md: 'Partner-first, acquire-later. Year 1: white-label a local statutory engine, sell with our front-end to BPO-adjacent SMEs in Manila and Cebu — prove 300–500 paying logos. If the wedge holds, use remaining budget to acquire the partner or a rules-engine asset and internalize the moat. Building from scratch spends the whole budget before validating demand — wrong order.' },
      ]},
      { type: 'reveal', summary: 'Reveal the budget math', blocks: [
        { type: 'mathBox', title: '$5M, two ways', md: 'Build-first: $2.5M statutory engine (18 mo) + $1.5M GTM = first revenue month ~20 — **validation comes last**\nPartner-first: $0.4M integration + $1.8M GTM → 400 logos × $800 = $320K ARR by month ~12; reserve $2.5M for the buy-or-build decision **after** demand is proven.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the board', items: [
        'Go international as a hedge — but one country, done deeply: the Philippines, on fit-to-budget, not Indonesia, on size.',
        'Partner-first entry: white-label local compliance, own the customer experience, validate 300–500 logos in 12 months.',
        'Pre-negotiate acquisition rights with the compliance partner — option value for the moat, exercised only on proof.',
        'Kill criteria up front: <250 logos or <70% gross retention at month 15 → stop, refocus on India.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'For B2B software entries, screen countries on **cost-to-localize and fit-to-budget**, not headline TAM — and sequence entry so the cheapest validation comes first. The biggest market is often the most expensive place to learn you were wrong.' },
    ]},
  ],
};
