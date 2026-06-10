import type { Page } from '@/lib/casebook/types';

export const multiplexScreenRevenue: Page = {
  slug: 'guesstimates/multiplex-screen-revenue',
  title: 'Annual revenue of one multiplex screen',
  subtitle: 'A revenue build with three streams — and an occupancy reality check.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['revenue-build', 'entertainment'] },
  blocks: [
    { type: 'prose', md: 'Estimate the annual revenue of a single multiplex screen in an Indian metro. Three streams: tickets, food & beverage, advertising. The number most people get wrong is **occupancy** — full Friday-night shows are the exception, not the average.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Revenue build for one multiplex screen across tickets, food and beverage, and advertising streams', caption: 'Seats × shows × occupancy × price, then F&B and ads ride on the admissions.', svg: `<svg viewBox="0 0 640 260" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="msng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="200" y="14" width="240" height="42" rx="11" fill="url(#msng)"/>
  <text x="320" y="40" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">ONE SCREEN, ONE YEAR</text>
  <path d="M320 56 L320 74 M120 74 L520 74 M120 74 L120 90 M320 74 L320 90 M520 74 L520 90" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="92" width="180" height="86" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="120" y="113" font-size="10" font-weight="700" fill="hsl(var(--primary))">TICKETS</text>
    <text x="120" y="130" font-size="9" fill="hsl(var(--muted-foreground))">220 seats × 4 shows ×</text>
    <text x="120" y="144" font-size="9" fill="hsl(var(--muted-foreground))">30% occ × ₹220 × 365</text>
    <text x="120" y="164" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ ₹2.1 cr</text>
    <rect x="230" y="92" width="180" height="86" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="320" y="113" font-size="10" font-weight="700" fill="hsl(var(--foreground))">F&amp;B</text>
    <text x="320" y="130" font-size="9" fill="hsl(var(--muted-foreground))">~96k admissions × 50%</text>
    <text x="320" y="144" font-size="9" fill="hsl(var(--muted-foreground))">attach × ₹180 spend</text>
    <text x="320" y="164" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ ₹0.9 cr</text>
    <rect x="430" y="92" width="180" height="86" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="520" y="113" font-size="10" font-weight="700" fill="hsl(var(--foreground))">ADS + OTHER</text>
    <text x="520" y="130" font-size="9" fill="hsl(var(--muted-foreground))">on-screen ads, convenience</text>
    <text x="520" y="144" font-size="9" fill="hsl(var(--muted-foreground))">fees ≈ 10–12% of tickets</text>
    <text x="520" y="164" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ ₹0.25 cr</text>
  </g>
  <rect x="170" y="200" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="320" y="225" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ ₹3–3.5 CR / SCREEN / YEAR</text>
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
