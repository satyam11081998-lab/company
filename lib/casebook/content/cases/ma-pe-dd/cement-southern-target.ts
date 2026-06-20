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
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
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
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Established the deal thesis (capacity entry, not cash flows) and the price benchmark, so each due-diligence finding can be triaged against the right logic.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Due diligence triage matrix of four findings, a quantification tier converting the power gap to about 190 crore off the price and the utilization story to 200 crore of air, and a reprice verdict bar from 3,400 to about 3,000 crore', caption: 'The triage, then the arithmetic — two findings convert to ~₹400 cr of price, one becomes a condition, one an escrow.', svg: `<svg viewBox="0 0 720 520" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="cdng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#cdng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">SEVERITY × FIXABILITY TRIAGE</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">₹3,400 cr ≈ $100/tonne vs $110–130 replacement — which findings move the price?</text>
  <g text-anchor="middle">
    <rect x="50" y="84" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="190" y="106" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">① LIMESTONE LEASE — THESIS RISK</text>
    <text x="190" y="125" font-size="8.5" fill="hsl(var(--muted-foreground))">lease expires in 7 yrs; state auctions, not renews</text>
    <text x="190" y="139" font-size="8.5" fill="hsl(var(--muted-foreground))">not fixable by indemnity — value walks away</text>
    <text x="190" y="162" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">→ CONDITION PRECEDENT or 25% escrow</text>
    <rect x="390" y="84" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="530" y="106" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">② UTILIZATION STORY — VALUATION AIR</text>
    <text x="530" y="125" font-size="8.5" fill="hsl(var(--muted-foreground))">management 7–8% vs analysts 4–5% growth:</text>
    <text x="530" y="139" font-size="8.5" fill="hsl(var(--muted-foreground))">rebuild at 4.5%; the 80% path vanishes</text>
    <text x="530" y="162" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">→ REPRICE (model, not promises)</text>
    <rect x="50" y="204" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="190" y="226" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">③ POWER CONTRACT — QUANTIFIABLE</text>
    <text x="190" y="245" font-size="8.5" fill="hsl(var(--muted-foreground))">below-market captive PPA, 60% of power,</text>
    <text x="190" y="259" font-size="8.5" fill="hsl(var(--muted-foreground))">expires month 14 · gap ₹1.8/unit</text>
    <text x="190" y="282" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">→ REPRICE (clean EBITDA adjustment)</text>
    <rect x="390" y="204" width="280" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="530" y="226" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">④ LITIGATION — CONTRACTABLE</text>
    <text x="530" y="245" font-size="8.5" fill="hsl(var(--muted-foreground))">bounded: ₹90 cr worst case, ₹15 cr provisioned —</text>
    <text x="530" y="259" font-size="8.5" fill="hsl(var(--muted-foreground))">insurable or escrowed from seller proceeds</text>
    <text x="530" y="282" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">→ INDEMNITY + ESCROW (not a price item)</text>
  </g>
  <path d="M360 306 L360 314 M215 314 L505 314 M215 314 L215 328 M505 314 L505 328" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="330" width="240" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="348" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">③ POWER, QUANTIFIED</text>
    <text x="215" y="364" font-size="8.5" fill="hsl(var(--muted-foreground))">2.5 MT × 80 units × 60% = 120M × ₹1.8 ≈ ₹22 cr/yr</text>
    <text x="215" y="384" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">× ~9× ≈ ₹190–200 cr off</text>
    <rect x="385" y="330" width="240" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="348" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">② UTILIZATION, QUANTIFIED</text>
    <text x="505" y="364" font-size="8.5" fill="hsl(var(--muted-foreground))">at 4.5%: ~70% not 80% → ₹55–60 cr less yr-3 EBITDA</text>
    <text x="505" y="384" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹200+ cr of air</text>
  </g>
  <path d="M215 394 L215 410 M505 394 L505 410 M215 410 L505 410 M360 410 L360 424" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="426" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="445" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">REPRICE ₹3,400 → ~₹3,000 CR ≈ $88/TONNE</text>
  <text x="360" y="462" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">limestone = condition precedent or 25% escrow · litigation = indemnity + ₹90 cr escrow · share gain = buyer upside, unpaid-for</text>
  <text x="360" y="500" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Model what is quantifiable, contract what is bounded, condition what is existential — and never pay the seller for value only the buyer can create.</text>
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
