import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const diagnosticLabExpansion: Page = {
  slug: 'cases/profitability/diagnostic-lab-expansion',
  title: 'The Diagnostic Chain That Expanded Into a Loss',
  subtitle: 'Twice the centres, half the profit. Where did the model break?',
  kind: 'case',
  meta: { difficulty: 'challenging', caseType: 'Profitability', readingTimeMin: 10, tags: ['healthcare', 'expansion', 'channel-mix'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client is a pathology-lab chain that grew from 40 to 85 collection centres in 18 months, all feeding two central processing labs. Revenue grew 60%, but EBITDA halved. The board approved the expansion expecting operating leverage — instead margins collapsed. Why, and what now?' },
    ]},
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Expansion cases usually break in one of three places: the new units underperform, the new units differ structurally from the old, or the centre cannot absorb the added load. So: are the 45 new centres like-for-like with the original 40 — same cities, same customer mix, same test mix?' },
        { speaker: 'interviewer', md: 'Good question — no. The original 40 are walk-in retail centres in two metros. Most new centres are in smaller cities, and many were opened to service **B2B contracts**: hospitals, clinics, and insurance wellness programmes.', note: 'One clarifying question collapses half the hypothesis space. This is what "structure your clarifications" means.' },
        { speaker: 'candidate', md: 'So the expansion changed the business mix, not just the footprint. B2B pathology typically prices 30–50% below retail. I\'ll structure around segment economics — old retail vs new B2B — plus the central-lab and logistics costs that scale with distance.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Found the expansion changed the business *mix* (retail versus lower-priced B2B), framing segment economics plus the central-lab costs that scale with volume.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree explaining halved EBITDA: segment mix with retail 520 rupees at 38 percent versus B2B 290 rupees at 12 percent now 55 percent of volume, distance costs and central lab strain, contribution bridge row from 38 to 24 to 21 percent, and a re-cut B2B verdict bar', caption: 'The rebuilt tree — mix does the damage (38% → 24%), frictions finish it (→ ~21%). On 1.6× revenue, the bridge closes exactly.', svg: `<svg viewBox="0 0 720 490" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="dlng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#dlng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">WHY DID EBITDA HALVE?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">revenue +60%, centres 40 → 85 — the leverage that never arrived</text>
  <path d="M360 60 L360 70 M125 70 L595 70 M125 70 L125 82 M360 70 L360 82 M595 70 L595 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="84" width="190" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="125" y="108" font-size="10" font-weight="700" fill="hsl(var(--primary))">SEGMENT MIX — the wound</text>
    <rect x="265" y="84" width="190" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="108" font-size="10" font-weight="700" fill="hsl(var(--foreground))">DISTANCE COSTS</text>
    <rect x="500" y="84" width="190" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="595" y="108" font-size="10" font-weight="700" fill="hsl(var(--foreground))">LAB STRAIN + CASH</text>
  </g>
  <path d="M125 124 L125 152 M360 124 L360 152 M595 124 L595 152" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="125" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">RETAIL vs B2B</text>
    <text x="125" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">retail ₹520/test @ 38% contribution</text>
    <text x="125" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">B2B ₹290/test @ 12% after logistics</text>
    <text x="125" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">B2B now 55% of volume</text>
    <text x="125" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">−14 pts blended</text>
    <text x="125" y="256" font-size="8" fill="hsl(var(--muted-foreground))">mix alone does most of the damage</text>
    <rect x="265" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LOGISTICS + RE-TESTS</text>
    <text x="360" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">cold chain from small cities,</text>
    <text x="360" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">transit damage → re-tests;</text>
    <text x="360" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">binds beyond ~300 km</text>
    <text x="360" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">−3 pts*</text>
    <text x="360" y="256" font-size="8" fill="hsl(var(--muted-foreground))">*combined with night premium</text>
    <rect x="500" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">STRAIN + WORKING CAPITAL</text>
    <text x="595" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">night shift at +25% wage premium</text>
    <text x="595" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">to hold TAT promises;</text>
    <text x="595" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">B2B pays in 90+ days</text>
    <text x="595" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">90+ day DSO</text>
    <text x="595" y="256" font-size="8" fill="hsl(var(--muted-foreground))">funding hospitals, at 1.6× revenue</text>
  </g>
  <path d="M125 264 L125 282 M360 264 L360 282 M595 264 L595 282 M125 282 L595 282 M135 282 L135 298 M360 282 L360 298 M585 282 L585 298" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="300" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="135" y="318" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">BEFORE</text>
    <text x="135" y="334" font-size="8.5" fill="hsl(var(--muted-foreground))">100% retail × 38%</text>
    <text x="135" y="350" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">38% blended</text>
    <rect x="255" y="300" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="318" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">MIX EFFECT</text>
    <text x="360" y="334" font-size="8.5" fill="hsl(var(--muted-foreground))">45%×38% + 55%×12% = 17.1 + 6.6</text>
    <text x="360" y="350" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">→ ~24%</text>
    <rect x="480" y="300" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="585" y="318" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">+ FRICTIONS</text>
    <text x="585" y="334" font-size="8.5" fill="hsl(var(--muted-foreground))">night premium + re-tests ≈ −3 pts</text>
    <text x="585" y="350" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">→ ~21%</text>
  </g>
  <path d="M135 358 L135 372 M360 358 L360 372 M585 358 L585 372 M135 372 L585 372 M360 372 L360 386" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="388" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="407" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">~21% ON 1.6× REVENUE — EBITDA HALVES. BRIDGE CLOSED ✓</text>
  <text x="360" y="424" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">re-price/exit sub-variable B2B · batch B2B into daytime slack · 45-day terms · third regional lab</text>
  <text x="360" y="462" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Operating leverage assumes the new volume resembles the old. This expansion changed segment, geography, and payment terms at once.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Numbers: retail realizes ₹520/test at 38% contribution. B2B realizes ₹290/test at 12% contribution after logistics. B2B is now 55% of volume. Also, B2B receivables run at 90+ days, and the central labs added a night shift at a 25% wage premium to hold turnaround times.' },
        { speaker: 'candidate', md: 'Let me bridge it. The blended contribution fell from 38% to roughly 23% just from mix. The night-shift premium and transit re-tests push another few points down. And the 90-day receivables mean we\'re funding hospitals\' working capital — at 60% revenue growth, that\'s a cash squeeze on top of the margin squeeze.', note: 'Connects P&L to working capital unprompted — interviewers consistently reward this.' },
        { speaker: 'interviewer', md: 'The CEO says: "B2B is strategic — it fills the labs and the brand needs the hospital relationships." How do you respond?' },
        { speaker: 'candidate', md: 'Partly true: B2B volume *above* the fixed-cost line is fine even at thin margins — but only if it\'s priced above its variable cost including logistics and penalties, paid on time, and scheduled into off-peak lab hours. Today it fails all three tests in the small-city centres. I\'d keep B2B, but re-cut it: re-price or exit contracts below variable-cost-plus, enforce 45-day terms, and batch B2B processing into daytime slack.' },
      ]},
      { type: 'reveal', summary: 'Reveal the contribution bridge', blocks: [
        { type: 'mathBox', title: 'Mix effect alone', md: 'Before: 100% retail × 38% = **38% blended contribution**\nAfter: 45% × 38% + 55% × 12% = 17.1 + 6.6 = **~24%**\nNight premium + re-tests ≈ −3 pts → **~21%** — on 1.6× revenue, EBITDA roughly halves. The bridge closes.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the board', items: [
        'Re-price or exit B2B contracts whose realization sits below variable cost + logistics + penalty risk; target 20%+ contribution on renewals.',
        'Move B2B batch processing to daytime slack capacity; reserve the night shift for retail TAT promises only.',
        'Tighten B2B terms to 45 days with interest clauses; stop being the banker to hospital chains.',
        'For the next expansion wave, add a third regional processing lab — distance costs, not demand, are the binding constraint beyond ~300 km.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: '"Operating leverage" only materializes when new volume resembles old volume. When expansion changes the **mix** — segment, geography, payment terms — model the new cohort\'s economics on its own, and check the cash cycle, not just the P&L.' },
    ]},
  ],
};
