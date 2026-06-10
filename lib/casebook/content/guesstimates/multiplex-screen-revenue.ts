import type { Page } from '@/lib/casebook/types';

export const multiplexScreenRevenue: Page = {
  slug: 'guesstimates/multiplex-screen-revenue',
  title: 'Annual revenue of one multiplex screen',
  subtitle: 'A revenue build with three streams — and an occupancy reality check.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['revenue-build', 'entertainment'] },
  blocks: [
    { type: 'prose', md: 'Estimate the annual revenue of a single multiplex screen in an Indian metro. Three streams: tickets, food & beverage, advertising. The number most people get wrong is **occupancy** — full Friday-night shows are the exception, not the average.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier revenue tree for one multiplex screen: admissions built from seats, shows and weekday-weekend occupancy, then three revenue streams riding on admissions, summed to annual revenue', caption: 'Admissions get built first (with the weekday/weekend occupancy split), then all three streams ride on that number.', svg: `<svg viewBox="0 0 720 530" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="msng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#msng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">ONE SCREEN, ONE YEAR</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">step 1: admissions · step 2: three streams</text>
  <path d="M360 60 L360 78" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="80" width="300" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="105" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">STEP 1 · ADMISSIONS ENGINE</text>
  </g>
  <path d="M360 120 L360 136 M150 136 L570 136 M150 136 L150 152 M360 136 L360 152 M570 136 L570 152" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="55" y="154" width="190" height="84" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="150" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">CAPACITY</text>
    <text x="150" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">220 seats × 4 shows/day</text>
    <text x="150" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">= 880 seat-shows daily</text>
    <text x="150" y="226" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 321k seats/yr</text>
    <rect x="265" y="154" width="190" height="84" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">OCCUPANCY (the trap)</text>
    <text x="360" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">weekends ~65% × 40% of shows</text>
    <text x="360" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">weekdays ~15% × 60% of shows</text>
    <text x="360" y="226" font-size="10" font-weight="700" fill="hsl(var(--primary))">blended ≈ 30%</text>
    <rect x="475" y="154" width="190" height="84" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="570" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">ADMISSIONS</text>
    <text x="570" y="194" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">321k × 30%</text>
    <text x="570" y="214" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ 96k/year</text>
    <text x="570" y="230" font-size="8.5" fill="hsl(var(--muted-foreground))">~264 people/day</text>
  </g>
  <path d="M360 238 L360 256 M125 256 L595 256 M125 256 L125 272 M360 256 L360 272 M595 256 L595 272" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="274" width="190" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="125" y="294" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">① TICKETS</text>
    <text x="125" y="311" font-size="8.5" fill="hsl(var(--muted-foreground))">96k × ₹220 realized</text>
    <text x="125" y="325" font-size="8.5" fill="hsl(var(--muted-foreground))">(post-discount average)</text>
    <text x="125" y="347" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ ₹2.1 cr</text>
    <rect x="265" y="274" width="190" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="294" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">② F&amp;B</text>
    <text x="360" y="311" font-size="8.5" fill="hsl(var(--muted-foreground))">50% attach × ₹180/buyer</text>
    <text x="360" y="325" font-size="8.5" fill="hsl(var(--muted-foreground))">≈ ₹90/admission · 70% margin</text>
    <text x="360" y="347" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ ₹0.9 cr</text>
    <rect x="500" y="274" width="190" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="294" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">③ ADS + OTHER</text>
    <text x="595" y="311" font-size="8.5" fill="hsl(var(--muted-foreground))">on-screen ads, convenience</text>
    <text x="595" y="325" font-size="8.5" fill="hsl(var(--muted-foreground))">fees ≈ 10–12% of ticket line</text>
    <text x="595" y="347" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ ₹0.25 cr</text>
  </g>
  <path d="M125 370 L125 392 M360 370 L360 392 M595 370 L595 392 M125 392 L595 392 M360 392 L360 408" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="410" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="429" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹3–3.5 CR / SCREEN / YEAR</text>
  <text x="360" y="446" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">F&amp;B is ~28% of revenue but ~45%+ of profit at 70% margin</text>
  <text x="360" y="490" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Sensitivity: ±5 pts of occupancy ≈ ±₹0.5 cr — one hit film month makes the year.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Admissions', md: '220 seats × 4 shows/day × **30% blended occupancy** (weekday mornings near-empty, weekend evenings full) ≈ 264/day → **~96K/year**.' },
      { title: 'Ticket revenue', md: '96K × ₹220 average (post-discount realized) ≈ **₹2.1 crore**.' },
      { title: 'F&B', md: '~50% of admissions buy, spending ~₹180 → **~₹0.9 crore** (and at ~70% gross margin, F&B drives profit disproportionately).' },
      { title: 'Ads & other', md: 'On-screen advertising + convenience fees ≈ **₹0.2–0.3 crore**.' },
      { title: 'Total', md: '**≈ ₹3–3.5 crore per screen per year.**' },
    ]},
    { type: 'mathBox', md: '96k admits × (₹220 + 0.5×₹180) + ads ≈ 96k × ₹310 + 0.25cr ≈ **₹3.2 cr/yr**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Occupancy is the assumption that gets attacked — defend 30% as a weighted average (weekends ~65%, weekdays ~15%, and 60% of shows are weekday shows). Bonus: note that a 5-point occupancy swing moves revenue ~₹0.5 crore — i.e., one hit film month makes the year.' },
  ],
};
