import type { Page } from '@/lib/casebook/types';

export const cricketBatsIndia: Page = {
  slug: 'guesstimates/cricket-bats-india',
  title: 'Cricket bats sold in India per year',
  subtitle: 'Segment by player seriousness — one market, three replacement cycles.',
  kind: 'guesstimate',
  meta: { difficulty: 'challenging', readingTimeMin: 5, tags: ['segmentation', 'replacement-cycle'] },
  blocks: [
    { type: 'prose', md: 'Estimate annual cricket bat sales in India. The naive route ("X% of Indians play cricket") collapses because a gully player\'s ₹400 bat lives five years while an academy kid replaces a ₹4,000 bat yearly. **Segment by seriousness**, give each segment its own ownership and replacement logic.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Four-tier tree from male population to player base, split into casual, regular and serious segments each with sharing, ownership and replacement-cycle assumptions, summed with volume and value shares', caption: 'Base → segments → sharing & cycle logic per segment → sum. Each box carries its volume AND value share — they invert.', svg: `<svg viewBox="0 0 640 410" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="cbng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="195" y="14" width="250" height="46" rx="11" fill="url(#cbng)"/>
  <text x="320" y="33" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">CRICKET BATS SOLD / YEAR</text>
  <text x="320" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">players → segments → sharing & cycles → sum</text>
  <path d="M320 60 L320 74" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="170" y="76" width="300" height="40" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <text x="320" y="92" text-anchor="middle" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PLAYER BASE: males 8–35 ≈ 280M × ~⅓ play at all</text>
  <text x="320" y="108" text-anchor="middle" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">≈ 95M players</text>
  <path d="M320 116 L320 130 M120 130 L520 130 M120 130 L120 144 M320 130 L320 144 M520 130 L520 144" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="146" width="180" height="124" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="120" y="166" font-size="10" font-weight="700" fill="hsl(var(--foreground))">CASUAL · ~80M</text>
    <text x="120" y="183" font-size="8.5" fill="hsl(var(--muted-foreground))">gully cricket · tennis ball</text>
    <text x="120" y="197" font-size="8.5" fill="hsl(var(--muted-foreground))">SHARING: 1 bat / ~6 players</text>
    <text x="120" y="211" font-size="8.5" fill="hsl(var(--muted-foreground))">→ 13M bats in circulation</text>
    <text x="120" y="225" font-size="8.5" fill="hsl(var(--muted-foreground))">CYCLE: ~4-yr life (₹400–800)</text>
    <text x="120" y="245" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">13M ÷ 4 ≈ 3.3M/yr</text>
    <text x="120" y="260" font-size="8" fill="hsl(var(--muted-foreground))">35% of volume · ~20% of value</text>
    <rect x="230" y="146" width="180" height="124" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="320" y="166" font-size="10" font-weight="700" fill="hsl(var(--foreground))">REGULAR · ~14M</text>
    <text x="320" y="183" font-size="8.5" fill="hsl(var(--muted-foreground))">school/college teams,</text>
    <text x="320" y="197" font-size="8.5" fill="hsl(var(--muted-foreground))">weekend leagues</text>
    <text x="320" y="211" font-size="8.5" fill="hsl(var(--muted-foreground))">OWNERSHIP: own bat (₹1–2.5k)</text>
    <text x="320" y="225" font-size="8.5" fill="hsl(var(--muted-foreground))">CYCLE: ~3-yr life</text>
    <text x="320" y="245" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">14M ÷ 3 ≈ 4.7M/yr</text>
    <text x="320" y="260" font-size="8" fill="hsl(var(--muted-foreground))">49% of volume · ~35% of value</text>
    <rect x="430" y="146" width="180" height="124" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="520" y="166" font-size="10" font-weight="700" fill="hsl(var(--primary))">SERIOUS · ~1M</text>
    <text x="520" y="183" font-size="8.5" fill="hsl(var(--muted-foreground))">academies, club/district/</text>
    <text x="520" y="197" font-size="8.5" fill="hsl(var(--muted-foreground))">state players</text>
    <text x="520" y="211" font-size="8.5" fill="hsl(var(--muted-foreground))">OWNERSHIP: 2+ bats (₹3–15k)</text>
    <text x="520" y="225" font-size="8.5" fill="hsl(var(--muted-foreground))">CYCLE: 1–2 new bats/yr</text>
    <text x="520" y="245" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">1M × 1.5 ≈ 1.5M/yr</text>
    <text x="520" y="260" font-size="8" fill="hsl(var(--muted-foreground))">16% of volume · ~45% of value</text>
  </g>
  <path d="M120 270 L120 292 M320 270 L320 292 M520 270 L520 292 M120 292 L520 292 M320 292 L320 308" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="310" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="320" y="329" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 9–10 MILLION BATS / YEAR</text>
  <text x="320" y="346" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">market ≈ ₹700–900 cr — and the smallest segment carries the most money</text>
  <text x="320" y="384" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Two structural moves: SHARING (casual bats serve groups) and SEGMENT CYCLES. The volume-value inversion is the so-what.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Player base', md: 'Males 8–35 ≈ 280M; ~⅓ play cricket at least occasionally → **~95M players**.' },
      { title: 'Casual (~80M)', md: 'Gully cricket shares equipment: ~1 bat per 6 players = 13M bats in circulation, replaced every ~4 years → **3.3M/yr**.' },
      { title: 'Regular (~14M)', md: 'School/college/weekend players own a bat, ~3-year life → **4.7M/yr**.' },
      { title: 'Serious (~1M)', md: 'Academy and club players: 1–2 quality bats a year → **1.5M/yr**.' },
      { title: 'Total', md: '**≈ 9.5M bats a year** — with the value skew inverted: the 1.5M serious-segment bats (~₹3,000+) carry as much revenue as the 8M cheap ones.' },
    ]},
    { type: 'mathBox', md: '3.3M + 4.7M + 1.5M ≈ **9.5M bats/yr** · value ≈ ₹700–900 cr with serious segment ≈ 45% of it' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Two structural moves carry this answer: **sharing** (casual bats serve groups, not individuals) and **segment-specific replacement cycles**. Volunteer the volume-vs-value inversion at the end — it\'s the kind of so-what that turns a sizing into a market-entry insight.' },
  ],
};
