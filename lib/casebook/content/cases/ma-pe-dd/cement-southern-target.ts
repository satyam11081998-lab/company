import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const cementSouthernTarget: Page = {
  slug: 'cases/ma-pe-dd/cement-southern-target',
  title: 'Due Diligence on a Southern Cement Target',
  subtitle: 'Three weeks of DD found four red flags. Which ones kill the deal?',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'M&A / Due Diligence', readingTimeMin: 9, tags: ['due-diligence', 'industrials'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client, a North-India cement major, has signed a non-binding term sheet to acquire a southern producer: 4 MTPA capacity across two plants, ₹1,900 crore revenue, running at 62% utilization in a region with chronic overcapacity. Commercial due diligence has surfaced four findings. The client asks: which findings reprice the deal, which kill it, and which are noise?' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'The four findings', blocks: [
      { type: 'steps', ordered: true, items: [
        { title: 'Limestone reserves', md: 'The primary quarry\'s mining lease expires in 7 years; renewal is "expected" but the state has lately auctioned rather than renewed leases.' },
        { title: 'Utilization claim', md: 'Management\'s deck claims a path from 62% to 80% utilization in 3 years on regional demand growth of 7–8%; industry analysts forecast 4–5%.' },
        { title: 'Power contract', md: 'A below-market captive power agreement supplying 60% of plant power expires in 14 months; market tariffs are ~₹1.8/unit higher.' },
        { title: 'Pending litigation', md: 'A ₹90 crore competition-commission matter from a 2019 regional price cartel investigation, provisioned at ₹15 crore.' },
      ]},
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Before triaging: what\'s the deal logic — is the client buying the *capacity* to enter the South, or buying *current cash flows*? The same finding can be fatal to one logic and tolerable to the other.', note: 'DD findings only mean something relative to the deal thesis. State the thesis first; triage second.' },
        { speaker: 'interviewer', md: 'Capacity-entry logic: the client wants a southern footprint it can feed with its own brand and distribution strength. Price on the table: ₹3,400 crore — about $100/tonne of capacity, versus $110–130 replacement cost.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 700, ariaLabel: 'Due diligence triage matrix mapping four findings by severity and fixability into reprice, condition, or noise outcomes', caption: 'Triage every finding on two axes: how bad, and what can a contract do about it.', svg: `<svg viewBox="0 0 700 330" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cdcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="cdng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="215" y="12" width="270" height="40" rx="11" fill="url(#cdng)" filter="url(#cdcs)"/>
  <text x="350" y="37" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">SEVERITY × FIXABILITY TRIAGE</text>
  <g text-anchor="middle">
    <rect x="55" y="75" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.75" filter="url(#cdcs)"/>
    <text x="195" y="97" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">① LIMESTONE LEASE — THESIS RISK</text>
    <text x="195" y="116" font-size="9" fill="hsl(var(--muted-foreground))">no limestone = no plant; auction risk is real</text>
    <text x="195" y="131" font-size="9" fill="hsl(var(--muted-foreground))">not fixable by indemnity — value walks away</text>
    <text x="195" y="153" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">→ CONDITION PRECEDENT or restructure</text>
    <rect x="365" y="75" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cdcs)"/>
    <text x="505" y="97" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">② UTILIZATION STORY — VALUATION AIR</text>
    <text x="505" y="116" font-size="9" fill="hsl(var(--muted-foreground))">management 7–8% vs market 4–5% growth:</text>
    <text x="505" y="131" font-size="9" fill="hsl(var(--muted-foreground))">rebuild model at 4.5%; the 80% path vanishes</text>
    <text x="505" y="153" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">→ REPRICE (model, not promises)</text>
    <rect x="55" y="195" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cdcs)"/>
    <text x="195" y="217" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">③ POWER CONTRACT — QUANTIFIABLE</text>
    <text x="195" y="236" font-size="9" fill="hsl(var(--muted-foreground))">known expiry, known tariff gap →</text>
    <text x="195" y="251" font-size="9" fill="hsl(var(--muted-foreground))">a clean EBITDA adjustment, nothing more</text>
    <text x="195" y="273" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">→ REPRICE (≈ −₹65 cr EBITDA/yr)</text>
    <rect x="365" y="195" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cdcs)"/>
    <text x="505" y="217" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">④ LITIGATION — CONTRACTABLE</text>
    <text x="505" y="236" font-size="9" fill="hsl(var(--muted-foreground))">bounded (₹90 cr worst case), insurable or</text>
    <text x="505" y="251" font-size="9" fill="hsl(var(--muted-foreground))">indemnifiable via escrow from seller proceeds</text>
    <text x="505" y="273" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">→ INDEMNITY + ESCROW (not a price item)</text>
  </g>
  <text x="350" y="318" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">Rule: model what's quantifiable, contract what's bounded, condition what's existential — and never pay for management's growth slide.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Quantify the power and utilization items on the price.' },
        { speaker: 'candidate', md: 'Power: 4 MTPA at ~62% = 2.5 MT production; cement needs ~80 units/tonne, so ~200M units a year, 60% captive = 120M units × ₹1.8 = **~₹22 crore** annual EBITDA hit from month 14 — wait, let me redo: 120M × 1.8 = ₹21.6 crore, call it ₹22 crore, growing with utilization. Capitalized at the deal\'s ~9× EBITDA multiple ≈ **₹190–200 crore off the price**. Utilization: at 4.5% regional growth with no share gain, the model gets to ~70%, not 80% — that\'s roughly ₹55–60 crore less EBITDA in year 3 than management\'s case; capitalized, another **₹200+ crore of air** in the ask. Though here the client\'s own thesis matters: their brand and distribution may legitimately drive share gain beyond market growth — that upside belongs to the *buyer\'s* plan, and we shouldn\'t pay the seller for it.', note: 'Corrects his own arithmetic mid-answer — far better than carrying an error forward. And the last point is the DD golden rule.' },
        { speaker: 'interviewer', md: 'And if the limestone lease can\'t be conditioned?' },
        { speaker: 'candidate', md: 'Then structure around it: hold back 20–25% of consideration in escrow releasable on renewal/re-auction win, or price the deal on 7 years of cash flows plus an option — not 25 years of plant life. If the seller refuses both, walk; a cement plant without secured limestone is a stranded asset with a chimney.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend', items: [
        'Reprice from ₹3,400 crore to ~₹3,000 crore: −₹200 cr power adjustment, −₹200 cr utilization air; the entry then sits at ~$88/tonne, comfortably below replacement cost.',
        'Make limestone-lease security a condition precedent or a 25% escrow — this is the only finding that can kill the deal.',
        'Cover the cartel litigation with a specific indemnity + ₹90 crore escrow from seller proceeds; do not haggle it into the headline price.',
        'Underwrite share gain from the client\'s own distribution as buyer upside — explicitly excluded from what we pay the seller for.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'DD findings sort into four buckets: **model it** (quantifiable cost), **contract it** (bounded risk → indemnity/escrow), **condition it** (existential risk), **ignore it** (noise). And the golden rule of diligence pricing: never pay the seller for value only the buyer can create.' },
    ]},
  ],
};
