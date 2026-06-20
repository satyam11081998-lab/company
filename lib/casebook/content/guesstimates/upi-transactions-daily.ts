import type { Page } from '@/lib/casebook/types';

export const upiTransactionsDaily: Page = {
  slug: 'guesstimates/upi-transactions-daily',
  title: 'UPI transactions in India per day',
  subtitle: 'Segment-by-intensity — one average user does not exist.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['digital', 'segmentation'] },
  blocks: [
    { type: 'prose', md: 'Estimate daily UPI transactions in India. The trap is assuming one "average user." UPI usage is violently skewed — segment users by intensity before multiplying anything.' },
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', title: 'Clarifying questions before building the tree', turns: [
        { speaker: 'candidate', md: 'Scope: the *count* of UPI transactions per day across India — not value — including both person-to-person and person-to-merchant?', note: 'Count-not-value and P2P+P2M decide what we’re even multiplying.' },
        { speaker: 'interviewer', md: 'Yes — count/day, P2P and P2M.' },
        { speaker: 'candidate', md: 'A typical day?' },
        { speaker: 'interviewer', md: 'Yes.' },
        { speaker: 'candidate', md: 'The trap is one ‘average user’, so I’ll segment by intensity — power users many times a day, light users a few times a month — before summing.', note: 'UPI usage is violently skewed; a single average misreads both the head and the tail.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Count (not value), P2P+P2M scope, and an intensity-segmented build instead of one average user.' },
    ]},
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree from smartphone base to active UPI payers, segmented into heavy, regular and light intensity bands each with population and rate, with each band split into its use-case drivers, summed and sanity-checked', caption: 'Base → three intensity bands → each band\'s use-case drivers → sum → NPCI sanity check. The heavy 20% drives 58% of volume.', svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="upng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#upng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">UPI TRANSACTIONS / DAY</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">segment by intensity — there is no average user</text>
  <path d="M360 60 L360 76" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="78" width="300" height="42" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="95" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PAYER BASE: 750M smartphones × ~55% UPI-active</text>
    <text x="360" y="111" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">≈ 400M payers — count each txn once, by payer</text>
  </g>
  <path d="M360 120 L360 136 M125 136 L595 136 M125 136 L125 152 M360 136 L360 152 M595 136 L595 152" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="154" width="190" height="120" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="125" y="174" font-size="10" font-weight="700" fill="hsl(var(--primary))">HEAVY · 20% = 80M</text>
    <text x="125" y="192" font-size="8.5" fill="hsl(var(--muted-foreground))">merchant counter-payments ~2/day</text>
    <text x="125" y="206" font-size="8.5" fill="hsl(var(--muted-foreground))">+ gig payouts/transfers ~1.5</text>
    <text x="125" y="220" font-size="8.5" fill="hsl(var(--muted-foreground))">+ food/commerce/recharge ~1.5</text>
    <text x="125" y="238" font-size="9" font-weight="600" fill="hsl(var(--foreground))">≈ 5 txns/day</text>
    <text x="125" y="258" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">80M × 5 = 400M</text>
    <rect x="265" y="154" width="190" height="120" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="174" font-size="10" font-weight="700" fill="hsl(var(--foreground))">REGULAR · 40% = 160M</text>
    <text x="360" y="192" font-size="8.5" fill="hsl(var(--muted-foreground))">daily commute/chai ~0.7</text>
    <text x="360" y="206" font-size="8.5" fill="hsl(var(--muted-foreground))">+ weekly shopping ~0.4</text>
    <text x="360" y="220" font-size="8.5" fill="hsl(var(--muted-foreground))">+ bills & transfers ~0.4</text>
    <text x="360" y="238" font-size="9" font-weight="600" fill="hsl(var(--foreground))">≈ 1.5 txns/day</text>
    <text x="360" y="258" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">160M × 1.5 = 240M</text>
    <rect x="500" y="154" width="190" height="120" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="595" y="174" font-size="10" font-weight="700" fill="hsl(var(--foreground))">LIGHT · 40% = 160M</text>
    <text x="595" y="192" font-size="8.5" fill="hsl(var(--muted-foreground))">P2P remittances ~2/week</text>
    <text x="595" y="206" font-size="8.5" fill="hsl(var(--muted-foreground))">+ occasional recharge</text>
    <text x="595" y="220" font-size="8.5" fill="hsl(var(--muted-foreground))">rural + low-trust users</text>
    <text x="595" y="238" font-size="9" font-weight="600" fill="hsl(var(--foreground))">≈ 0.3 txns/day</text>
    <text x="595" y="258" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">160M × 0.3 = 48M</text>
  </g>
  <path d="M125 274 L125 296 M360 274 L360 296 M595 274 L595 296 M125 296 L595 296 M360 296 L360 312" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="314" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="333" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 690M ≈ 65–70 CRORE TXNS / DAY</text>
  <text x="360" y="350" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">heavy band = 20% of users, 58% of transactions</text>
  <path d="M360 358 L360 374" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="160" y="376" width="400" height="52" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="396" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SANITY CHECK vs NPCI</text>
    <text x="360" y="413" font-size="8.5" fill="hsl(var(--muted-foreground))">reported ≈ 55–65 crore/day (~20B/month) — the build lands on top of reality</text>
  </g>
  <text x="360" y="470" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">If you had averaged (400M × ~1.7), you'd get the same number but couldn't defend any component. Segments are the defense.</text>
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
