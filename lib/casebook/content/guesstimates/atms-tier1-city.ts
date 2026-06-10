import type { Page } from '@/lib/casebook/types';

export const atmsTier1City: Page = {
  slug: 'guesstimates/atms-tier1-city',
  title: 'ATMs in a tier-1 city',
  subtitle: 'Transaction demand ÷ machine capacity, with a digital-payments twist.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['infrastructure', 'demand-capacity'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of ATMs in an 8-million-person tier-1 city. Build cash-withdrawal demand, divide by per-machine capacity — and address the elephant: UPI has eaten most small transactions, but cash demand hasn\'t vanished.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Estimation tree from adults using ATMs through monthly withdrawal frequency to transactions per day divided by machine capacity', caption: 'Users → withdrawal frequency → daily transactions ÷ machine throughput.', svg: `<svg viewBox="0 0 640 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="atng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="25" y="26" width="180" height="70" rx="10" fill="url(#atng)"/>
    <text x="115" y="50" font-size="10" font-weight="700" fill="#ffffff">ATM USERS</text>
    <text x="115" y="67" font-size="9" fill="#b9c4d6">8M → ~5.5M adults →</text>
    <text x="115" y="81" font-size="9" fill="#b9c4d6">~80% use ATMs ≈ 4.4M</text>
    <rect x="245" y="26" width="170" height="70" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="330" y="50" font-size="10" font-weight="700" fill="hsl(var(--foreground))">FREQUENCY</text>
    <text x="330" y="67" font-size="9" fill="hsl(var(--muted-foreground))">post-UPI: ~2 withdrawals/</text>
    <text x="330" y="81" font-size="9" fill="hsl(var(--muted-foreground))">month → ~290k txns/day</text>
    <rect x="455" y="26" width="165" height="70" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="537" y="50" font-size="10" font-weight="700" fill="hsl(var(--primary))">MACHINE CAPACITY</text>
    <text x="537" y="67" font-size="9" fill="hsl(var(--muted-foreground))">viable load ≈ 80–100</text>
    <text x="537" y="81" font-size="9" fill="hsl(var(--muted-foreground))">txns/day</text>
  </g>
  <path d="M205 61 L241 61 M415 61 L451 61" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M330 96 L330 124 M537 96 L537 124 M330 124 L537 124 M433 124 L433 146" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="283" y="150" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="433" y="175" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 3,000–3,500 ATMs</text>
  <text x="320" y="222" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">State the trend: this number is *shrinking* ~3–5%/yr as UPI deepens — a static answer misses the story.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Users', md: '8M population → ~5.5M adults; ~80% have bank accounts with cards and occasionally withdraw → **4.4M** users.' },
      { title: 'Frequency', md: 'Pre-UPI this was 4–6 withdrawals/month; today salaried users pull cash ~1–2×/month, cash-economy workers more → blended **~2/month** → 8.8M/month ≈ **290K transactions/day**.' },
      { title: 'Capacity', md: 'An ATM is economically viable at ~80–100 transactions/day (interchange fees vs rent + cash logistics + maintenance).' },
      { title: 'Count', md: '290K ÷ 90 ≈ **~3,200 ATMs**.' },
    ]},
    { type: 'mathBox', md: '4.4M users × 2/mo ÷ 30 ÷ 90 txns/machine ≈ **3,250 ATMs**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Acknowledge UPI explicitly and put it **in the frequency assumption**, not as a vague caveat. If pushed on "is the count rising or falling," reason from machine economics: falling transactions per machine push marginal ATMs below viability → consolidation.' },
  ],
};
