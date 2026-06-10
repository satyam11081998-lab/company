import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const vernacularEdtechPlateau: Page = {
  slug: 'cases/growth/vernacular-edtech-plateau',
  title: 'The Edtech App That Stopped Growing',
  subtitle: 'Downloads keep coming. Revenue doesn\'t. Find the broken stage.',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'Growth', readingTimeMin: 9, tags: ['edtech', 'funnel', 'retention'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client runs a vernacular-language exam-prep app (government job exams: SSC, banking, railways) with 8 million downloads and ₹90 crore revenue from a ₹999/year subscription. Revenue has been flat for four quarters despite downloads growing 20% per quarter. Diagnose and fix.' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Downloads up, revenue flat — the leak is between install and renewal. Before structuring: is the ₹999 price unchanged? Any competitor or exam-calendar shifts — fewer notifications released — that would suppress the whole category?' },
        { speaker: 'interviewer', md: 'Price unchanged. Exam calendar is normal. Competitors exist but their pricing hasn\'t moved. The problem is internal.', note: 'External causes ruled out in one pass — now the funnel is the whole case.' },
        { speaker: 'candidate', md: 'Then I\'ll walk the funnel: install → activation (first meaningful study session) → trial-to-paid conversion → renewal. Flat revenue against compounding installs means one of these stages collapsed. I\'d like the stage-wise numbers, this year versus last.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Subscription funnel from installs through activation, conversion, and renewal with year-on-year rates at each stage', caption: 'The funnel, with both years\' rates — one stage carries almost the entire decline.', svg: `<svg viewBox="0 0 720 320" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="vecs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="veng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <marker id="vear" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>
  <g text-anchor="middle">
    <rect x="20" y="60" width="150" height="78" rx="10" fill="url(#veng)" filter="url(#vecs)"/>
    <text x="95" y="84" font-size="10.5" font-weight="700" fill="#ffffff">INSTALLS</text>
    <text x="95" y="102" font-size="9" fill="#b9c4d6">+20% / quarter</text>
    <text x="95" y="118" font-size="9" fill="#b9c4d6">healthy ✓</text>
    <rect x="200" y="60" width="150" height="78" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#vecs)"/>
    <text x="275" y="84" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">ACTIVATION</text>
    <text x="275" y="102" font-size="9" fill="hsl(var(--muted-foreground))">last yr: 38% · now: 24%</text>
    <text x="275" y="118" font-size="9" font-weight="700" fill="hsl(var(--primary))">▼ collapsed</text>
    <rect x="380" y="60" width="150" height="78" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#vecs)"/>
    <text x="455" y="84" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">TRIAL → PAID</text>
    <text x="455" y="102" font-size="9" fill="hsl(var(--muted-foreground))">last yr: 9% · now: 8.5%</text>
    <text x="455" y="118" font-size="9" fill="hsl(var(--muted-foreground))">roughly stable</text>
    <rect x="560" y="60" width="150" height="78" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#vecs)"/>
    <text x="635" y="84" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">RENEWAL</text>
    <text x="635" y="102" font-size="9" fill="hsl(var(--muted-foreground))">last yr: 45% · now: 41%</text>
    <text x="635" y="118" font-size="9" fill="hsl(var(--muted-foreground))">soft, secondary</text>
  </g>
  <path d="M170 99 L196 99" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#vear)"/>
  <path d="M350 99 L376 99" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#vear)"/>
  <path d="M530 99 L556 99" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#vear)"/>
  <rect x="120" y="185" width="480" height="46" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="360" y="204" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">ACTIVATION FELL 38% → 24%: WHO ARE THE NEW INSTALLERS?</text>
  <text x="360" y="221" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">when a top-of-funnel rate collapses while volume grows, suspect the traffic mix</text>
  <text x="360" y="280" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">Multiply the stages: 24% × 8.5% × growing installs ≈ flat paid adds. The math reproduces the symptom.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Activation is your collapsed stage. Dig.' },
        { speaker: 'candidate', md: 'A rate that halves while volume doubles is usually a **mix problem**: the marginal installer differs from the historical one. I\'d split activation by acquisition channel and by language. Hypothesis: growth marketing widened targeting — cheaper installs from users outside the core exam-aspirant profile, or from languages where content is thin.', note: 'Rate collapse + volume growth → always decompose by cohort before blaming the product.' },
        { speaker: 'interviewer', md: 'Sharp. 70% of new installs now come from a viral short-video campaign in Bhojpuri and Marathi — languages where the app has only 15% of its question-bank translated. Those users activate at 9%. Hindi-channel installs still activate at 37%.' },
        { speaker: 'candidate', md: 'So growth bought the wrong audience for the current product — or the right audience for a product that doesn\'t exist yet. Two honest paths: refocus spend on Hindi-belt channels where the product is complete, or treat Bhojpuri/Marathi as the next product investment since the demand signal is real — 70% of installs is not noise. Given flat revenue and a working Hindi engine, I\'d do both sequentially: fix the spend now, build Marathi content next (larger exam population than Bhojpuri), launch properly in two quarters.' },
      ]},
      { type: 'reveal', summary: 'Reveal the cohort math', blocks: [
        { type: 'mathBox', title: 'Blended activation reproduces the 24%', md: '70% installs × 9% + 30% × 37% = 6.3 + 11.1 = **17–24%** range depending on quarter mix ✓\nRefocusing spend to Hindi-belt: blended activation returns to ~35% → paid adds grow ~45% on the same install volume.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend', items: [
        'Immediately re-weight acquisition spend toward channels/languages where the product is complete; stop buying installs the product can\'t serve.',
        'Build the Marathi question bank to 90% coverage in two quarters — the campaign proved demand; meet it before re-opening the spend tap.',
        'Add an activation-by-cohort dashboard as a permanent guardrail: any channel activating <25% gets auto-flagged before budget scales.',
        'Address the renewal softness with exam-cycle-aligned renewal offers (renew before prelims at a discount), but treat it as secondary.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'When a funnel rate collapses while volume grows, the cause is almost always **who\'s arriving**, not what they find. Decompose by cohort first — and recognize that "bad" traffic is sometimes tomorrow\'s product roadmap announcing itself.' },
    ]},
  ],
};
