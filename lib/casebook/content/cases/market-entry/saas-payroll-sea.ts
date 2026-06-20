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
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Payroll is unusually localization-heavy — tax tables, labour law, statutory filings differ per country and change yearly. So first: why international at all, when India SME penetration is still low? Is this board ambition or a real ceiling?', note: 'Challenging the premise is risky — but payroll\'s localization burden makes "why leave India?" the single best first question here.' },
        { speaker: 'interviewer', md: 'Fair challenge. India remains big, but two US-funded competitors are discounting aggressively at home; the board wants a second engine before the home market commoditizes. Budget is $5M over two years.' },
        { speaker: 'candidate', md: 'A hedge, then — with a hard budget. That argues for *one* country done deeply, not a regional spray. I\'ll screen SEA markets on three axes: SME-payroll demand and willingness to pay, regulatory complexity (our moat once built, our cost to build), and competitive whitespace. Then pick build-vs-partner-vs-acquire.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Framed it as a budgeted hedge favouring one country done deeply, screened on SME demand, regulatory complexity, and cost-to-serve.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree screening four Southeast Asian countries with their data — Indonesia 1.2 million SMEs but complex, Philippines 350 thousand SMEs English-friendly whitespace, Vietnam informal, Singapore saturated — then route economics comparing build-first and partner-first budgets, and a Philippines partner-first verdict bar', caption: 'The screen rebuilt with the data in every node — fit-to-budget picks the Philippines, and the budget math picks the route.', svg: `<svg viewBox="0 0 720 425" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="spng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#spng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">WHICH COUNTRY, WHICH ROUTE?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">$5M · 2 years · one bet — screen on fit-to-budget, not headline TAM</text>
  <path d="M360 60 L360 70 M115 70 L605 70 M115 70 L115 80 M278 70 L278 80 M442 70 L442 80 M605 70 L605 80" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="35" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="115" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">INDONESIA</text>
    <text x="115" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">1.2M target SMEs, low</text>
    <text x="115" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">penetration — but Bahasa-only,</text>
    <text x="115" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">fast rules, 2 funded champions</text>
    <text x="115" y="170" font-size="10" font-weight="700" fill="hsl(var(--primary))">biggest ✗</text>
    <text x="115" y="186" font-size="8" fill="hsl(var(--muted-foreground))">every factor multiplies cost</text>
    <rect x="198" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="278" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">PHILIPPINES</text>
    <text x="278" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">350K SMEs · English-friendly ·</text>
    <text x="278" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">US-style payroll culture ·</text>
    <text x="278" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">no dominant SME player</text>
    <text x="278" y="170" font-size="10" font-weight="700" fill="hsl(var(--primary))">$280M TAM ✓</text>
    <text x="278" y="186" font-size="8" fill="hsl(var(--muted-foreground))">350K × $800 ACV — fits the $5M</text>
    <rect x="362" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="442" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">VIETNAM</text>
    <text x="442" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">500K SMEs, moderate rules —</text>
    <text x="442" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">but payroll deeply informal;</text>
    <text x="442" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">the sale is formalization itself</text>
    <text x="442" y="170" font-size="10" font-weight="700" fill="hsl(var(--primary))">different business ✗</text>
    <text x="442" y="186" font-size="8" fill="hsl(var(--muted-foreground))">slower than software sales</text>
    <rect x="525" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="605" y="101" font-size="9" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--foreground))">SINGAPORE</text>
    <text x="605" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">high ACV — but small,</text>
    <text x="605" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">saturated, every global</text>
    <text x="605" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">player already present</text>
    <text x="605" y="170" font-size="10" font-weight="700" fill="hsl(var(--primary))">a flag, not a market ✗</text>
    <text x="605" y="186" font-size="8" fill="hsl(var(--muted-foreground))">prestige ≠ second engine</text>
  </g>
  <path d="M115 202 L115 220 M278 202 L278 220 M442 202 L442 220 M605 202 L605 220 M115 220 L605 220 M215 220 L215 236 M505 220 L505 236" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="238" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="215" y="256" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">BUILD-FIRST</text>
    <text x="215" y="272" font-size="8.5" fill="hsl(var(--muted-foreground))">$2.5M engine (18 mo) + $1.5M GTM</text>
    <text x="215" y="288" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">first revenue ~month 20 ✗</text>
    <rect x="385" y="238" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="256" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">PARTNER-FIRST</text>
    <text x="505" y="272" font-size="8.5" fill="hsl(var(--muted-foreground))">$0.4M integration + $1.8M GTM → 400 × $800</text>
    <text x="505" y="288" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">$320K ARR by month 12 ✓</text>
  </g>
  <path d="M215 296 L215 312 M505 296 L505 312 M215 312 L505 312 M360 312 L360 326" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="328" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="347" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">PHILIPPINES, PARTNER-FIRST — BUY THE MOAT ON PROOF</text>
  <text x="360" y="364" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">reserve $2.5M for the buy-or-build call · kill criteria: &lt;250 logos or &lt;70% retention at month 15</text>
  <text x="360" y="402" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The localization moat cuts both ways: expensive to enter, defensible once in. The biggest market is the costliest place to learn you were wrong.</text>
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
