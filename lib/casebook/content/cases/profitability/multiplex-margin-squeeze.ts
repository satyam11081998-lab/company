import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case. (v2)
export const multiplexMarginSqueeze: Page = {
  slug: 'cases/profitability/multiplex-margin-squeeze',
  title: 'The Multiplex Selling More Tickets, Earning Less',
  subtitle: 'Footfall is at an all-time high. Profit is at a three-year low.',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'Profitability', readingTimeMin: 10, tags: ['mix-shift', 'entertainment'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client operates 40 multiplex screens across six Indian cities. Ticket admissions grew 12% last year — the best in its history — yet operating profit fell 18%. The CEO wants to know what is going on and what to do about it.' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Before I structure this, three quick clarifications. First, when we say profit fell 18% — is that absolute operating profit, or margin? Second, is the decline uniform across the 40 screens or concentrated in some cities? Third, has the revenue model changed — any shift in how we earn per visitor?', note: 'Three sharp questions, each testable. Note the third one — it anticipates the answer.' },
        { speaker: 'interviewer', md: 'Absolute operating profit. The decline is broad-based across cities. And I\'ll let you discover the revenue model part yourself.' },
        { speaker: 'candidate', md: 'Understood. One more: any one-off items — a renovation, new leases, an acquisition — that would distort the year-on-year comparison?' },
        { speaker: 'interviewer', md: 'No one-offs. Same 40 screens both years.' },
      ]},
      { type: 'callout', variant: 'tip', md: 'Admissions **up** + profit **down** with no one-offs means the problem lives in **revenue per visitor** or **cost per visitor**. Say this out loud before drawing the tree — it shows hypothesis-led thinking.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'prose', md: 'Decompose profit per visitor. A multiplex earns through three streams per admission — ticket, food & beverage (F&B), and advertising — and carries a largely fixed cost base. Volume is up, so chase the per-visitor economics first.' },
      { type: 'svg', maxWidth: 720, ariaLabel: 'Issue tree decomposing multiplex profit into revenue per visitor across ticket, food and beverage, and advertising, and cost per visitor across fixed and variable', caption: 'The case-specific tree — profit per visitor, not total profit, because volume is already known to be up.', svg: `<svg viewBox="0 0 720 400" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="mmcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="mmng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="mmcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
  </defs>
  <rect x="240" y="18" width="240" height="50" rx="12" fill="url(#mmng)" filter="url(#mmcs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="#ffffff">PROFIT = VISITORS ×</text>
  <text x="360" y="56" text-anchor="middle" font-size="11" fill="#b9c4d6">(revenue/visitor − cost/visitor)</text>
  <path d="M360 68 L360 84 M180 84 L540 84 M180 84 L180 100 M540 84 L540 100" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <rect x="60" y="102" width="240" height="44" rx="10" fill="url(#mmcg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#mmcs)"/>
  <text x="180" y="121" text-anchor="middle" font-size="12" font-weight="700" fill="hsl(var(--foreground))">REVENUE / VISITOR</text>
  <text x="180" y="137" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">the suspect — admissions grew, profit didn't</text>
  <rect x="420" y="102" width="240" height="44" rx="10" fill="url(#mmcg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#mmcs)"/>
  <text x="540" y="121" text-anchor="middle" font-size="12" font-weight="700" fill="hsl(var(--foreground))">COST / VISITOR</text>
  <text x="540" y="137" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">mostly fixed — should FALL as volume rises</text>
  <path d="M180 146 L180 162 M70 162 L290 162 M70 162 L70 178 M180 162 L180 178 M290 162 L290 178" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <rect x="20" y="180" width="100" height="56" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="70" y="201" text-anchor="middle" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">TICKET</text>
  <text x="70" y="216" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">ATP · discounting</text>
  <text x="70" y="228" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">· channel fees</text>
  <rect x="130" y="180" width="100" height="56" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="180" y="201" text-anchor="middle" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">F&amp;B</text>
  <text x="180" y="216" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">attach rate ·</text>
  <text x="180" y="228" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">spend per buyer</text>
  <rect x="240" y="180" width="100" height="56" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <text x="290" y="201" text-anchor="middle" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">AD / OTHER</text>
  <text x="290" y="216" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">on-screen ads ·</text>
  <text x="290" y="228" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">convenience fees</text>
  <path d="M540 146 L540 162 M460 162 L620 162 M460 162 L460 178 M620 162 L620 178" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <rect x="410" y="180" width="100" height="56" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <text x="460" y="201" text-anchor="middle" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">FIXED</text>
  <text x="460" y="216" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">rent · payroll ·</text>
  <text x="460" y="228" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">energy base</text>
  <rect x="570" y="180" width="100" height="56" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <text x="620" y="201" text-anchor="middle" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">VARIABLE</text>
  <text x="620" y="216" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">F&amp;B COGS ·</text>
  <text x="620" y="228" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">distributor share</text>
  <rect x="120" y="270" width="480" height="48" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="360" y="290" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">HYPOTHESIS: TICKET AND F&amp;B PER-VISITOR ECONOMICS ERODED</text>
  <text x="360" y="307" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">volume growth that is *bought* with discounts shows up exactly like this</text>
  <text x="360" y="360" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">Lead with the highlighted branches; park advertising and fixed cost unless the data points there.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Good tree. Here\'s the data: average ticket price fell from ₹240 to ₹205. F&B attach rate fell from 55% to 44%, though spend per F&B buyer is flat at ₹180. Costs per visitor are unchanged.' },
        { speaker: 'candidate', md: 'So both suspect branches confirm. Let me size them. Ticket: we lost ₹35 per admission. F&B: at roughly 65% gross margin, an 11-point attach drop costs about ₹13 of margin per admission. Ticket is the bigger wound — roughly 2.5× the F&B effect. What drove the price drop — is it discounting, or a mix shift toward cheaper shows or cities?', note: 'Sizes both branches before diving in, and immediately decomposes price into discount vs mix.' },
        { speaker: 'interviewer', md: 'The client signed aggressive deals with two ticketing apps — flat ₹70-off vouchers funded 60% by the client. Around 45% of tickets now come through these vouchers. The F&B attach drop is concentrated in voucher customers.' },
        { speaker: 'candidate', md: 'That ties the whole case together. The vouchers bought 12% more admissions, but each voucher admission carries a ₹42 client-funded discount *and* attaches F&B at a much lower rate — these are deal-seekers, not movie-goers we would have gotten anyway. Some of the 45% are cannibalized full-price customers too.' },
      ]},
      { type: 'reveal', summary: 'Reveal the worked economics', blocks: [
        { type: 'mathBox', title: 'Per-visitor P&L bridge (approx.)', md: 'Last year: ₹240 ticket + 0.55 × ₹180 × 65% F&B margin ≈ ₹240 + ₹64 = **₹304 contribution/visitor**\nThis year: ₹205 + 0.44 × ₹180 × 65% ≈ ₹205 + ₹51 = **₹256/visitor** (−16%)\nVolume effect: +12% × ₹256 ≈ +₹31 … Price/mix effect: −₹48 on the full base.\nNet: the discount-led volume does **not** pay for itself.' },
        { type: 'prose', md: 'The strategic error: treating admissions as the KPI. The vouchers converted a high-margin audience into a subsidized one. Volume rose, *quality of volume* collapsed.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the CEO', items: [
        'Restructure the app deals: cap voucher-eligible shows (weekday matinees, low-occupancy slots) so discounts fill empty seats instead of repricing full ones.',
        'Shift discount funding toward F&B bundles (ticket + combo) — protects ticket realization and rebuilds attach rate.',
        'Track **contribution per visitor**, not admissions, as the board KPI; segment it voucher vs non-voucher.',
        'Renegotiate the 60/40 funding split — the apps gained exclusive traffic; they should fund a larger share.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'When volume rises and profit falls, decompose **per-unit economics** immediately — and always ask whether growth was *bought*. Discount-led volume is the most common trap behind "record sales, falling profit."' },
    ]},
  ],
};
