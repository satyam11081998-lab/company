import type { Page } from '@/lib/casebook/types';

export const biryaniPlatesMetro: Page = {
  slug: 'guesstimates/biryani-plates-metro',
  title: 'Biryani plates sold daily in a metro',
  subtitle: 'Demand-side build with an occasion-frequency twist.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 5, tags: ['consumption', 'frequency'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of biryani plates sold per day in a 10-million-person metro (restaurants + delivery + street, *commercially sold* only — home cooking excluded). The key structuring move: estimate **eating-out occasions first**, then biryani\'s share of them.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Estimation tree from metro population through commercial meal occasions to biryani share and plates per day', caption: 'Population → commercial meal occasions → biryani\'s share of plates.', svg: `<svg viewBox="0 0 640 260" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="bpng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="20" y="30" width="180" height="64" rx="10" fill="url(#bpng)"/>
    <text x="110" y="55" font-size="10" font-weight="700" fill="#ffffff">POPULATION 10M</text>
    <text x="110" y="72" font-size="9" fill="#b9c4d6">eaters of commercial food ~60%</text>
    <rect x="230" y="30" width="180" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="320" y="50" font-size="10" font-weight="700" fill="hsl(var(--foreground))">OCCASIONS / DAY</text>
    <text x="320" y="67" font-size="9" fill="hsl(var(--muted-foreground))">6M × ~0.5 commercial</text>
    <text x="320" y="81" font-size="9" fill="hsl(var(--muted-foreground))">meals/day ≈ 3M meals</text>
    <rect x="440" y="30" width="180" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="530" y="50" font-size="10" font-weight="700" fill="hsl(var(--primary))">BIRYANI SHARE</text>
    <text x="530" y="67" font-size="9" fill="hsl(var(--muted-foreground))">top-3 ordered dish ≈</text>
    <text x="530" y="81" font-size="9" fill="hsl(var(--muted-foreground))">8–10% of meals</text>
  </g>
  <path d="M200 62 L226 62 M410 62 L436 62" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M530 94 L530 120 M320 94 L320 120 M320 120 L530 120 M425 120 L425 142" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="275" y="146" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="425" y="171" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 2.5–3 LAKH PLATES / DAY</text>
  <text x="320" y="225" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Cross-check from supply: ~15,000 outlets serving biryani × ~20 plates/day average ≈ 3 lakh ✓</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Who eats commercially', md: '10M people; exclude very young children and strictly-home eaters → ~**6M** people in the commercial-food market.' },
      { title: 'Occasions', md: 'Office lunches, dinners out, delivery — averages to ~**0.5 commercial meals/person/day** (heavy for office-goers, light for homemakers/elderly) → **3M meals/day**.' },
      { title: 'Biryani\'s share', md: 'Consistently a top-ordered dish; weight delivery higher → **8–10%** of commercial meals → **~2.7 lakh plates**.' },
      { title: 'Sanity check (supply side)', md: '~15,000 biryani-serving outlets × ~20 plates/day ≈ **3 lakh** — the two sides agree.' },
    ]},
    { type: 'mathBox', md: '6M eaters × 0.5 meals × 9% biryani ≈ **2.7 lakh plates/day** (≈ ₹6–8 cr/day at ₹250/plate)' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The interviewer will attack the **0.5 meals/day**. Defend it as a weighted average: ~3M office-goers at ~0.8 (lunch + frequent delivery) and ~3M others at ~0.2. Always be ready to decompose any blended rate you state.' },
  ],
};
