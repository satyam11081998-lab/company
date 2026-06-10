import type { Page } from '@/lib/casebook/types';

export const atmsTier1City: Page = {
  slug: 'guesstimates/atms-tier1-city',
  title: 'ATMs in a tier-1 city',
  subtitle: 'Transaction demand ÷ machine capacity, with a digital-payments twist.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['infrastructure', 'demand-capacity'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of ATMs in an 8-million-person tier-1 city. Build cash-withdrawal demand, divide by per-machine capacity — and address the elephant: UPI has eaten most small transactions, but cash demand hasn\'t vanished.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree from city population to adults with cards, split into salaried digital-heavy and cash-economy segments with different withdrawal frequencies, summed to daily transactions and divided by machine viability', caption: 'Population → card-holding adults → two cash-behaviour segments → transactions → ÷ machine economics. UPI lives inside the frequency split.', svg: `<svg viewBox="0 0 720 530" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="atng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#atng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">ATMs IN AN 8M TIER-1 CITY</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">withdrawal demand ÷ machine viability</text>
  <path d="M360 60 L360 78" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="80" width="300" height="52" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="100" font-size="10" font-weight="700" fill="hsl(var(--foreground))">CARD-HOLDING ADULTS</text>
    <text x="360" y="117" font-size="9" fill="hsl(var(--muted-foreground))">8M → ~5.5M adults × ~80% banked with cards ≈ <tspan font-weight="700" fill="hsl(var(--primary))">4.4M users</tspan></text>
  </g>
  <path d="M360 132 L360 148 M185 148 L535 148 M185 148 L185 164 M535 148 L535 164" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="65" y="166" width="240" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="185" y="186" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SALARIED / DIGITAL ≈ 60%</text>
    <text x="185" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">2.6M people · UPI for daily spend</text>
    <text x="185" y="217" font-size="8.5" fill="hsl(var(--muted-foreground))">cash only for help, rent top-ups</text>
    <text x="185" y="231" font-size="8.5" fill="hsl(var(--muted-foreground))">~1.2 withdrawals/month</text>
    <text x="185" y="250" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 105k txns/day</text>
    <rect x="415" y="166" width="240" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="535" y="186" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">CASH-ECONOMY ≈ 40%</text>
    <text x="535" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">1.8M people · gig, trade, informal</text>
    <text x="535" y="217" font-size="8.5" fill="hsl(var(--muted-foreground))">wages arrive digital, spent in cash</text>
    <text x="535" y="231" font-size="8.5" fill="hsl(var(--muted-foreground))">~3 withdrawals/month</text>
    <text x="535" y="250" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 180k txns/day</text>
  </g>
  <path d="M185 262 L185 280 M535 262 L535 280 M185 280 L535 280 M360 280 L360 296" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="210" y="298" width="300" height="40" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="323" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">TOTAL ≈ 285K WITHDRAWALS / DAY</text>
  </g>
  <path d="M360 338 L360 354 M215 354 L505 354 M215 354 L215 370 M505 354 L505 370" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="372" width="240" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="215" y="392" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">MACHINE ECONOMICS</text>
    <text x="215" y="408" font-size="8.5" fill="hsl(var(--muted-foreground))">interchange ~₹17/txn vs rent + cash</text>
    <text x="215" y="422" font-size="8.5" fill="hsl(var(--muted-foreground))">logistics + maintenance ≈ ₹45k/mo</text>
    <rect x="385" y="372" width="240" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="505" y="392" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">VIABILITY THRESHOLD</text>
    <text x="505" y="410" font-size="10" font-weight="700" fill="hsl(var(--foreground))">break-even ≈ 90 txns/day</text>
    <text x="505" y="425" font-size="8.5" fill="hsl(var(--muted-foreground))">below this, machines get pulled</text>
  </g>
  <path d="M215 436 L215 454 M505 436 L505 454 M215 454 L505 454 M360 454 L360 466" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="468" width="340" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="493" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">285K ÷ 90 ≈ 3,200 ATMs — and shrinking 3–5%/yr</text>
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
