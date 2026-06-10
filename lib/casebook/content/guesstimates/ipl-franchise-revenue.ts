import type { Page } from '@/lib/casebook/types';

export const iplFranchiseRevenue: Page = {
  slug: 'guesstimates/ipl-franchise-revenue',
  title: 'Annual revenue of an IPL franchise',
  subtitle: 'A components build — when the "units" are revenue streams, not people.',
  kind: 'guesstimate',
  meta: { difficulty: 'challenging', readingTimeMin: 6, tags: ['revenue-build', 'sports-business'] },
  blocks: [
    { type: 'prose', md: 'Estimate the annual revenue of a typical IPL franchise. No population tree helps here — the skill tested is **knowing the revenue architecture** of a sports business: central pool share, sponsorship, matchday, and licensing.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Revenue components of an IPL franchise: central media pool share, sponsorships, matchday and licensing', caption: 'Four streams, one dominant: the central media-rights pool dwarfs everything a franchise does locally.', svg: `<svg viewBox="0 0 640 260" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="ipng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="200" y="14" width="240" height="42" rx="11" fill="url(#ipng)"/>
  <text x="320" y="40" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">FRANCHISE REVENUE STACK</text>
  <g text-anchor="middle">
    <rect x="30" y="80" width="280" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
    <text x="170" y="102" font-size="10" font-weight="700" fill="hsl(var(--primary))">① CENTRAL POOL SHARE</text>
    <text x="170" y="120" font-size="9" fill="hsl(var(--muted-foreground))">media rights ≈ ₹10–12k cr/yr league-wide;</text>
    <text x="170" y="134" font-size="9" fill="hsl(var(--muted-foreground))">~45–50% to 10 teams, near-equal split</text>
    <text x="170" y="149" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ ₹450–500 cr</text>
    <rect x="330" y="80" width="280" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="470" y="102" font-size="10" font-weight="700" fill="hsl(var(--foreground))">② TEAM SPONSORSHIP</text>
    <text x="470" y="120" font-size="9" fill="hsl(var(--muted-foreground))">jersey front/back, sleeve, ~15–20 partners,</text>
    <text x="470" y="134" font-size="9" fill="hsl(var(--muted-foreground))">big brands pay ₹25–60 cr for marquee slots</text>
    <text x="470" y="149" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ ₹100–150 cr</text>
    <rect x="30" y="170" width="280" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="170" y="192" font-size="10" font-weight="700" fill="hsl(var(--foreground))">③ MATCHDAY</text>
    <text x="170" y="209" font-size="9" fill="hsl(var(--muted-foreground))">7 home games × 35k paid × ₹2,500 avg</text>
    <text x="170" y="225" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ ₹60–70 cr (incl. hospitality boxes)</text>
    <rect x="330" y="170" width="280" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="470" y="192" font-size="10" font-weight="700" fill="hsl(var(--foreground))">④ LICENSING + OTHER</text>
    <text x="470" y="209" font-size="9" fill="hsl(var(--muted-foreground))">merchandise, fan clubs, prize money</text>
    <text x="470" y="225" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ ₹15–25 cr</text>
  </g>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Central pool', md: 'IPL media rights ≈ ₹10–12K crore/year league-wide; roughly half flows to the 10 franchises near-equally → **₹450–500 crore each**. This single stream is ~70% of revenue.' },
      { title: 'Sponsorship', md: 'Jersey real estate + 15–20 partners → **₹100–150 crore** for a strong brand, less for newer teams.' },
      { title: 'Matchday', md: '7 league home games × ~35K paid attendance × ~₹2,500 blended (GA to hospitality) ≈ **₹60–70 crore**.' },
      { title: 'Licensing & other', md: 'Merchandise (small in India), prize money, academies → **₹15–25 crore**.' },
      { title: 'Total', md: '**≈ ₹650–750 crore a year** for an established franchise.' },
    ]},
    { type: 'mathBox', md: '₹475 (central) + ₹125 (sponsor) + ₹65 (matchday) + ₹20 (other) ≈ **₹685 cr/yr**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Lead with the structure ("four streams, one dominant"), not the numbers. The strategic footnote that impresses: because ~70% of revenue is centralized and equal, IPL franchises are **profit-similar regardless of on-field performance** — winning buys brand value, not this year\'s P&L.' },
  ],
};
