import type { Page } from '@/lib/casebook/types';

export const cricketBatsIndia: Page = {
  slug: 'guesstimates/cricket-bats-india',
  title: 'Cricket bats sold in India per year',
  subtitle: 'Segment by player seriousness — one market, three replacement cycles.',
  kind: 'guesstimate',
  meta: { difficulty: 'challenging', readingTimeMin: 5, tags: ['segmentation', 'replacement-cycle'] },
  blocks: [
    { type: 'prose', md: 'Estimate annual cricket bat sales in India. The naive route ("X% of Indians play cricket") collapses because a gully player\'s ₹400 bat lives five years while an academy kid replaces a ₹4,000 bat yearly. **Segment by seriousness**, give each segment its own ownership and replacement logic.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Cricket bat market split into casual, regular, and serious player segments each with ownership and replacement assumptions', caption: 'Three player types, three economics. Sales = players ÷ replacement years, segment by segment.', svg: `<svg viewBox="0 0 640 260" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="cbng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="195" y="14" width="250" height="42" rx="11" fill="url(#cbng)"/>
  <text x="320" y="33" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">~95M PEOPLE WHO PLAY AT ALL</text>
  <text x="320" y="49" text-anchor="middle" font-size="9" fill="#b9c4d6">mostly male 8–35; bat shared within groups</text>
  <g text-anchor="middle">
    <rect x="40" y="86" width="180" height="96" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="130" y="107" font-size="10" font-weight="700" fill="hsl(var(--foreground))">CASUAL · ~80M</text>
    <text x="130" y="124" font-size="9" fill="hsl(var(--muted-foreground))">gully cricket · 1 bat per</text>
    <text x="130" y="138" font-size="9" fill="hsl(var(--muted-foreground))">~6 players · ~4-yr life</text>
    <text x="130" y="155" font-size="9" fill="hsl(var(--muted-foreground))">13M bats ÷ 4</text>
    <text x="130" y="172" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 3.3M/yr</text>
    <rect x="240" y="86" width="180" height="96" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="330" y="107" font-size="10" font-weight="700" fill="hsl(var(--foreground))">REGULAR · ~14M</text>
    <text x="330" y="124" font-size="9" fill="hsl(var(--muted-foreground))">weekend leagues, school</text>
    <text x="330" y="138" font-size="9" fill="hsl(var(--muted-foreground))">teams · own bat · ~3-yr life</text>
    <text x="330" y="155" font-size="9" fill="hsl(var(--muted-foreground))">14M ÷ 3</text>
    <text x="330" y="172" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 4.7M/yr</text>
    <rect x="440" y="86" width="180" height="96" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="530" y="107" font-size="10" font-weight="700" fill="hsl(var(--primary))">SERIOUS · ~1M</text>
    <text x="530" y="124" font-size="9" fill="hsl(var(--muted-foreground))">academies, club/state</text>
    <text x="530" y="138" font-size="9" fill="hsl(var(--muted-foreground))">players · 1–2 bats/yr</text>
    <text x="530" y="155" font-size="9" fill="hsl(var(--muted-foreground))">1M × 1.5</text>
    <text x="530" y="172" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 1.5M/yr</text>
  </g>
  <rect x="170" y="200" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="320" y="225" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 9–10 MILLION BATS / YEAR</text>
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
