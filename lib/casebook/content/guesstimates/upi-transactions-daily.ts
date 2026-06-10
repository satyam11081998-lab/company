import type { Page } from '@/lib/casebook/types';

export const upiTransactionsDaily: Page = {
  slug: 'guesstimates/upi-transactions-daily',
  title: 'UPI transactions in India per day',
  subtitle: 'Segment-by-intensity — one average user does not exist.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['digital', 'segmentation'] },
  blocks: [
    { type: 'prose', md: 'Estimate daily UPI transactions in India. The trap is assuming one "average user." UPI usage is violently skewed — segment users by intensity before multiplying anything.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Segmented estimation with heavy, regular, and light UPI users at different daily transaction rates', caption: 'Three intensity bands; the heavy band drives the total despite being the smallest share of users.', svg: `<svg viewBox="0 0 640 260" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="upng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="200" y="14" width="240" height="42" rx="11" fill="url(#upng)"/>
  <text x="320" y="33" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">~400M ACTIVE UPI USERS</text>
  <text x="320" y="49" text-anchor="middle" font-size="9" fill="#b9c4d6">segmented by intensity, not averaged</text>
  <path d="M320 56 L320 74 M120 74 L520 74 M120 74 L120 90 M320 74 L320 90 M520 74 L520 90" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="92" width="180" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="120" y="113" font-size="10" font-weight="700" fill="hsl(var(--primary))">HEAVY · 20%</text>
    <text x="120" y="130" font-size="9" fill="hsl(var(--muted-foreground))">merchants, gig workers,</text>
    <text x="120" y="144" font-size="9" fill="hsl(var(--muted-foreground))">urban daily spenders</text>
    <text x="120" y="159" font-size="9" fill="hsl(var(--muted-foreground))">~5 txns/day</text>
    <text x="120" y="176" font-size="10" font-weight="700" fill="hsl(var(--foreground))">80M × 5 = 400M</text>
    <rect x="230" y="92" width="180" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="320" y="113" font-size="10" font-weight="700" fill="hsl(var(--foreground))">REGULAR · 40%</text>
    <text x="320" y="130" font-size="9" fill="hsl(var(--muted-foreground))">salaried urban, weekly</text>
    <text x="320" y="144" font-size="9" fill="hsl(var(--muted-foreground))">shoppers, bill payers</text>
    <text x="320" y="159" font-size="9" fill="hsl(var(--muted-foreground))">~1.5 txns/day</text>
    <text x="320" y="176" font-size="10" font-weight="700" fill="hsl(var(--foreground))">160M × 1.5 = 240M</text>
    <rect x="430" y="92" width="180" height="92" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="520" y="113" font-size="10" font-weight="700" fill="hsl(var(--foreground))">LIGHT · 40%</text>
    <text x="520" y="130" font-size="9" fill="hsl(var(--muted-foreground))">occasional, rural,</text>
    <text x="520" y="144" font-size="9" fill="hsl(var(--muted-foreground))">P2P-only users</text>
    <text x="520" y="159" font-size="9" fill="hsl(var(--muted-foreground))">~0.3 txns/day</text>
    <text x="520" y="176" font-size="10" font-weight="700" fill="hsl(var(--foreground))">160M × 0.3 = 48M</text>
  </g>
  <rect x="170" y="204" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="320" y="229" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 65–70 CRORE TXNS / DAY</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'User base', md: '~750M smartphone users; UPI-active ≈ **400M**.' },
      { title: 'Segment', md: 'Heavy 20% (~5/day: merchants accepting, gig economy, urban daily payments), Regular 40% (~1.5/day), Light 40% (~0.3/day).' },
      { title: 'Sum', md: '400M + 240M + 48M ≈ **~690M ≈ 69 crore transactions/day**.' },
      { title: 'Sanity', md: 'NPCI reports run in the high-50s to 60+ crore/day range — the build lands on top of reality.' },
    ]},
    { type: 'mathBox', md: '80M×5 + 160M×1.5 + 160M×0.3 ≈ **690M/day** (~20B/month)' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Two-sided platforms double-count if you\'re careless: a payment is ONE transaction though it touches two users — segment by **payer**, count once. Also note merchants both pay and receive; that\'s why the heavy band\'s 5/day is plausible.' },
  ],
};
