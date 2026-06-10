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
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree decomposing multiplex profit per visitor: ticket price 240 to 205 rupees, food and beverage attach 55 to 44 percent, cost per visitor unchanged, with contribution bridge row from 304 to 256 rupees and bought-volume verdict bar', caption: 'The full per-visitor tree — every branch carries its number. The contribution bridge ₹304 → ₹256 is the case in one row.', svg: `<svg viewBox="0 0 720 490" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="mmng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#mmng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">PROFIT = VISITORS × (REV − COST)/VISITOR</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">admissions +12%, profit −18% — chase per-visitor economics</text>
  <path d="M360 60 L360 70 M242 70 L595 70 M242 70 L242 80 M595 70 L595 80" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="112" y="82" width="260" height="42" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="242" y="99" font-size="10" font-weight="700" fill="hsl(var(--primary))">REVENUE / VISITOR — the suspect</text>
    <text x="242" y="115" font-size="8.5" fill="hsl(var(--muted-foreground))">admissions grew, profit did not</text>
    <rect x="465" y="82" width="260" height="42" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="595" y="99" font-size="10" font-weight="700" fill="hsl(var(--foreground))">COST / VISITOR</text>
    <text x="595" y="115" font-size="8.5" fill="hsl(var(--muted-foreground))">mostly fixed — should fall as volume rises</text>
  </g>
  <path d="M242 124 L242 138 M125 138 L360 138 M125 138 L125 152 M360 138 L360 152 M595 124 L595 152" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="125" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">TICKET (the bigger wound)</text>
    <text x="125" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">45% of tickets via app vouchers:</text>
    <text x="125" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">₹70-off, 60% client-funded</text>
    <text x="125" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">= ₹42 discount per voucher seat</text>
    <text x="125" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">₹240 → ₹205 (−₹35)</text>
    <text x="125" y="256" font-size="8" fill="hsl(var(--muted-foreground))">~2.5× the F&amp;B effect</text>
    <rect x="265" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">F&amp;B ATTACH</text>
    <text x="360" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">spend/buyer flat at ₹180,</text>
    <text x="360" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">65% gross margin — drop is</text>
    <text x="360" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">concentrated in voucher buyers</text>
    <text x="360" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">55% → 44% (−₹13)</text>
    <text x="360" y="256" font-size="8" fill="hsl(var(--muted-foreground))">deal-seekers, not movie-goers</text>
    <rect x="500" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">COST / VISITOR</text>
    <text x="595" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">rent · payroll · energy base</text>
    <text x="595" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">+ F&amp;B COGS · distributor share</text>
    <text x="595" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">same 40 screens both years</text>
    <text x="595" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">unchanged ✓</text>
    <text x="595" y="256" font-size="8" fill="hsl(var(--muted-foreground))">branch eliminated</text>
  </g>
  <path d="M125 264 L125 282 M360 264 L360 282 M595 264 L595 282 M125 282 L595 282 M215 282 L215 298 M505 282 L505 298" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="300" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="215" y="320" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LAST YEAR</text>
    <text x="215" y="338" font-size="10" font-weight="700" fill="hsl(var(--foreground))">₹240 + 0.55×₹180×65% ≈ ₹304</text>
    <text x="215" y="352" font-size="8.5" fill="hsl(var(--muted-foreground))">contribution per visitor</text>
    <rect x="385" y="300" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="320" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">THIS YEAR</text>
    <text x="505" y="338" font-size="10" font-weight="700" fill="hsl(var(--primary))">₹205 + 0.44×₹180×65% ≈ ₹256</text>
    <text x="505" y="352" font-size="8.5" fill="hsl(var(--muted-foreground))">−16% per visitor</text>
  </g>
  <path d="M215 358 L215 376 M505 358 L505 376 M215 376 L505 376 M360 376 L360 390" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="170" y="392" width="380" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="411" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">VOLUME +₹31 &lt; PRICE/MIX −₹48 — GROWTH WAS BOUGHT</text>
  <text x="360" y="428" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">cap vouchers to empty slots · fund F&amp;B bundles instead · KPI = contribution/visitor</text>
  <text x="360" y="468" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The vouchers converted a high-margin audience into a subsidized one. Volume rose; quality of volume collapsed.</text>
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
