import type { Page } from '@/lib/casebook/types';

export const kiranaMonthlyGmv: Page = {
  slug: 'guesstimates/kirana-monthly-gmv',
  title: 'Monthly sales of a neighbourhood kirana store',
  subtitle: 'Catchment-based micro-sizing — small numbers, sharp logic.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 4, tags: ['micro-sizing', 'retail'] },
  blocks: [
    { type: 'prose', md: 'Estimate the monthly sales (GMV) of a typical neighbourhood kirana store in an urban residential area. Micro-guesstimates flip the telescope: instead of starting from India\'s population, start from the store\'s **catchment**.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree from walkable catchment through competing stores to served households, grocery wallet split by category share kept by the kirana, with a counter-side cross-check branch', caption: 'Catchment → competition split → wallet by category → kirana share. The counter view (bills × value) confirms from the other side.', svg: `<svg viewBox="0 0 720 530" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="kgng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#kgng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">KIRANA MONTHLY SALES</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">demand build + counter cross-check</text>
  <path d="M360 60 L360 76 M185 76 L535 76 M185 76 L185 92 M535 76 L535 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="55" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">PATH A · CATCHMENT BUILD</text>
    <text x="185" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">households × wallet × share</text>
    <rect x="405" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--foreground))">PATH B · COUNTER VIEW</text>
    <text x="535" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">bills/day × average bill</text>
  </g>
  <path d="M185 138 L185 154 M100 154 L270 154 M100 154 L100 170 M270 154 L270 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M535 138 L535 154 M450 154 L620 154 M450 154 L450 170 M620 154 L620 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="20" y="172" width="160" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="100" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SERVED HOUSEHOLDS</text>
    <text x="100" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">300m radius ≈ 800 HH</text>
    <text x="100" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">÷ ~3 comparable stores</text>
    <text x="100" y="244" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 250 loyal HH</text>
    <text x="100" y="260" font-size="8" fill="hsl(var(--muted-foreground))">+ ~10% walk-by traffic</text>
    <rect x="190" y="172" width="160" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="270" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">WALLET × SHARE</text>
    <text x="270" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">₹9,000/HH grocery wallet:</text>
    <text x="270" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">staples 60%·₹5.4k → kirana keeps ~55%</text>
    <text x="270" y="237" font-size="8.5" fill="hsl(var(--muted-foreground))">urgent top-ups 15% → ~70% · rest → q-comm/MT</text>
    <text x="270" y="258" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ ₹4,500/HH/mo</text>
    <rect x="370" y="172" width="160" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="450" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">BILLS / DAY</text>
    <text x="450" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">~14 customers/hr peak ×</text>
    <text x="450" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">4 hrs + ~8/hr × 8 hrs</text>
    <text x="450" y="244" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 150 bills/day</text>
    <rect x="540" y="172" width="160" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="620" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">AVERAGE BILL</text>
    <text x="620" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">monthly staples ₹800–1,500 ×</text>
    <text x="620" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">few · top-ups ₹80–150 × many</text>
    <text x="620" y="244" font-size="10" font-weight="700" fill="hsl(var(--primary))">blended ≈ ₹250</text>
  </g>
  <path d="M100 272 L100 290 M270 272 L270 290 M100 290 L270 290 M185 290 L185 308" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M450 272 L450 290 M620 272 L620 290 M450 290 L620 290 M535 290 L535 308" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="75" y="310" width="220" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="329" font-size="10" font-weight="700" fill="hsl(var(--primary))">250 × ₹4,500 × 1.1 ≈ ₹12.4L</text>
    <text x="185" y="344" font-size="8.5" fill="hsl(var(--muted-foreground))">demand-side estimate</text>
    <rect x="425" y="310" width="220" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="329" font-size="10" font-weight="700" fill="hsl(var(--foreground))">150 × ₹250 × 30 ≈ ₹11.3L</text>
    <text x="535" y="344" font-size="8.5" fill="hsl(var(--muted-foreground))">counter-side estimate ✓</text>
  </g>
  <path d="M185 352 L185 374 M535 352 L535 374 M185 374 L535 374 M360 374 L360 390" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="392" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="411" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹11–12 LAKH / MONTH</text>
  <text x="360" y="428" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">at 12–18% gross margin ≈ ₹1.5L/month gross profit</text>
  <text x="360" y="470" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Why kiranas survive: zero rent (often self-owned) + family labour. Why q-commerce hurts: it skims the high-margin urgent top-ups.</text>
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
