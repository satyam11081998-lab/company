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
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Expansion cases usually break in one of three places: the new units underperform, the new units differ structurally from the old, or the centre cannot absorb the added load. So: are the 45 new centres like-for-like with the original 40 — same cities, same customer mix, same test mix?' },
        { speaker: 'interviewer', md: 'Good question — no. The original 40 are walk-in retail centres in two metros. Most new centres are in smaller cities, and many were opened to service **B2B contracts**: hospitals, clinics, and insurance wellness programmes.', note: 'One clarifying question collapses half the hypothesis space. This is what "structure your clarifications" means.' },
        { speaker: 'candidate', md: 'So the expansion changed the business mix, not just the footprint. B2B pathology typically prices 30–50% below retail. I\'ll structure around segment economics — old retail vs new B2B — plus the central-lab and logistics costs that scale with distance.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Tree comparing retail and B2B segment economics and central operations strain for a diagnostics chain', caption: 'Three places an expansion breaks: the new segment\'s economics, the distance costs, and the centre\'s capacity.', svg: `<svg viewBox="0 0 720 330" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="dlcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="dlng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="240" y="16" width="240" height="46" rx="12" fill="url(#dlng)" filter="url(#dlcs)"/>
  <text x="360" y="36" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">WHY DID EBITDA HALVE?</text>
  <text x="360" y="52" text-anchor="middle" font-size="9.5" fill="#b9c4d6">while revenue grew 60%</text>
  <path d="M360 62 L360 80 M120 80 L600 80 M120 80 L120 96 M360 80 L360 96 M600 80 L600 96" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <rect x="20" y="98" width="200" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#dlcs)"/>
  <text x="120" y="118" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">SEGMENT MIX</text>
  <text x="120" y="134" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">retail vs B2B realization</text>
  <text x="120" y="148" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">per test · payment terms</text>
  <rect x="260" y="98" width="200" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#dlcs)"/>
  <text x="360" y="118" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">DISTANCE COSTS</text>
  <text x="360" y="134" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">sample logistics · cold chain</text>
  <text x="360" y="148" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">re-tests from transit damage</text>
  <rect x="500" y="98" width="200" height="64" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#dlcs)"/>
  <text x="600" y="118" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--foreground))">CENTRAL LAB STRAIN</text>
  <text x="600" y="134" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">capacity · night-shift premium</text>
  <text x="600" y="148" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">TAT misses → penalties</text>
  <rect x="120" y="210" width="480" height="46" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="360" y="229" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">TEST EACH BRANCH WITH ONE NUMBER PER CENTRE COHORT</text>
  <text x="360" y="246" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">contribution per test: old-retail vs new-retail vs B2B</text>
  <text x="360" y="295" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">Operating leverage assumes the new volume resembles the old volume. Here it doesn't.</text>
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
