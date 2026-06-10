import type { Page } from '@/lib/casebook/types';

export const kiranaMonthlyGmv: Page = {
  slug: 'guesstimates/kirana-monthly-gmv',
  title: 'Monthly sales of a neighbourhood kirana store',
  subtitle: 'Catchment-based micro-sizing — small numbers, sharp logic.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 4, tags: ['micro-sizing', 'retail'] },
  blocks: [
    { type: 'prose', md: 'Estimate the monthly sales (GMV) of a typical neighbourhood kirana store in an urban residential area. Micro-guesstimates flip the telescope: instead of starting from India\'s population, start from the store\'s **catchment**.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Catchment-based estimation from households served through share of grocery wallet captured by the kirana', caption: 'Catchment households × grocery wallet × the kirana\'s share of it.', svg: `<svg viewBox="0 0 640 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="kgng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="30" y="26" width="180" height="74" rx="10" fill="url(#kgng)"/>
    <text x="120" y="50" font-size="10" font-weight="700" fill="#ffffff">CATCHMENT</text>
    <text x="120" y="67" font-size="9" fill="#b9c4d6">~300m radius · ~800 HH ·</text>
    <text x="120" y="81" font-size="9" fill="#b9c4d6">~3 competing stores → ~250 HH</text>
    <rect x="250" y="26" width="170" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="335" y="50" font-size="10" font-weight="700" fill="hsl(var(--foreground))">GROCERY WALLET</text>
    <text x="335" y="67" font-size="9" fill="hsl(var(--muted-foreground))">~₹9,000/HH/month on</text>
    <text x="335" y="81" font-size="9" fill="hsl(var(--muted-foreground))">groceries &amp; essentials</text>
    <rect x="460" y="26" width="160" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="540" y="50" font-size="10" font-weight="700" fill="hsl(var(--primary))">KIRANA SHARE</text>
    <text x="540" y="67" font-size="9" fill="hsl(var(--muted-foreground))">~50% (rest: q-comm,</text>
    <text x="540" y="81" font-size="9" fill="hsl(var(--muted-foreground))">modern trade, D2C)</text>
  </g>
  <path d="M210 63 L246 63 M420 63 L456 63" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M335 100 L335 128 M540 100 L540 128 M335 128 L540 128 M437 128 L437 150" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="287" y="154" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="437" y="179" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ ₹11–12 LAKH / MONTH</text>
  <text x="320" y="222" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Cross-check from the counter: ~150 bills/day × ₹250 avg ≈ ₹11 lakh/month ✓</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Catchment', md: 'Walkable radius ~300m in a dense residential area ≈ 800 households; ~3 comparable stores split it → **~250 loyal-ish households**.' },
      { title: 'Wallet', md: 'Urban middle-class grocery + essentials spend ≈ **₹9,000/HH/month**.' },
      { title: 'Share', md: 'Quick-commerce and supermarkets take half; the kirana keeps **~50%** — top-ups, credit (khata), urgency → ₹4,500/HH.' },
      { title: 'GMV', md: '250 × ₹4,500 ≈ **₹11.2 lakh/month**, plus walk-by traffic ~10%.' },
      { title: 'Cross-check', md: 'Counter view: ~150 bills/day × ₹250 ≈ ₹11 lakh ✓ — the two views converging is your proof.' },
    ]},
    { type: 'mathBox', md: '250 HH × ₹9,000 × 50% ≈ ₹11.2L · supply check: 150 bills × ₹250 × 30 ≈ ₹11.3L ✓' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Margins make a good extension answer: kiranas run 12–18% gross margin, so this store earns ~₹1.5 lakh/month gross — explaining both why kiranas survive (zero rent if self-owned, family labour) and why q-commerce hurts (it skims the high-margin urgent top-ups).' },
  ],
};
