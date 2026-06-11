import type { Page } from '@/lib/casebook/types';

export const decodingTheProblem: Page = {
  slug: 'case-competitions/decoding-the-problem',
  title: 'Decoding the problem statement',
  subtitle: 'The #1 elimination reason is solving the wrong problem. Slow down here.',
  kind: 'concept',
  meta: { difficulty: 'moderate', readingTimeMin: 9, tags: ['case-competitions', 'problem-solving'] },
  blocks: [
    { type: 'hook', md: 'Screening judges read a hundred decks in an evening. The fastest way to be eliminated is also the most common: a beautiful answer to a question that was never asked.' },
    { type: 'prose', md: 'A competition problem statement (PS) is a dense little document — typically one to three pages with a company background, a situation, a question, deliverable specs, and evaluation criteria. Teams skim it once and start "solutioning." Winners interrogate it like a legal contract, because every sentence was written deliberately by someone at the sponsor.' },
    { type: 'heading', level: 2, text: 'The five-layer read' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Problem statement deconstruction tree with five layers: the real ask, deliverable spec, constraints, evaluation rubric, and the sponsor agenda, each with the question to ask and an example, ending in an alignment verdict bar', caption: 'Five layers, one pass each. The fifth layer — why the sponsor is running this competition at all — is where differentiation hides.', svg: `<svg viewBox="0 0 720 520" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="kpps" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#kpps)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">READ THE PS FIVE TIMES</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">once per layer — an hour here saves a wasted fortnight</text>
  <path d="M360 60 L360 76" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g>
    <rect x="60" y="78" width="600" height="58" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="80" y="100" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">1 · THE REAL ASK</text>
    <text x="80" y="116" font-size="8.5" fill="hsl(var(--muted-foreground))">Underline the verbs. "Recommend a GTM strategy" ≠ "evaluate whether to enter" ≠ "design a campaign."</text>
    <text x="80" y="128" font-size="8.5" fill="hsl(var(--muted-foreground))">Rewrite the ask in one sentence of your own words — if the team writes three different sentences, stop and reconcile.</text>
    <rect x="60" y="146" width="600" height="58" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="80" y="168" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">2 · THE DELIVERABLE SPEC</text>
    <text x="80" y="184" font-size="8.5" fill="hsl(var(--muted-foreground))">"3 slides excluding cover and appendix, PDF under 10MB, 12-min video" — these are pass/fail gates, not suggestions.</text>
    <text x="80" y="196" font-size="8.5" fill="hsl(var(--muted-foreground))">Decks get binned unread for violating format. Put every spec into a submission checklist on day 1.</text>
    <rect x="60" y="214" width="600" height="58" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="80" y="236" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">3 · THE CONSTRAINTS</text>
    <text x="80" y="252" font-size="8.5" fill="hsl(var(--muted-foreground))">Budget caps, timeline ("results in 12 months"), geography ("tier-2 India"), do-not-touch areas ("without price cuts").</text>
    <text x="80" y="264" font-size="8.5" fill="hsl(var(--muted-foreground))">Every constraint is a grading checkbox — violate one and the best analysis in the pool still loses.</text>
    <rect x="60" y="282" width="600" height="58" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="80" y="304" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">4 · THE EVALUATION RUBRIC</text>
    <text x="80" y="320" font-size="8.5" fill="hsl(var(--muted-foreground))">Many PSs print it: "Innovation 30% · Feasibility 30% · Analysis 25% · Presentation 15%." That is the answer key.</text>
    <text x="80" y="332" font-size="8.5" fill="hsl(var(--muted-foreground))">Allocate deck space in proportion to the weights. No rubric printed? Infer one from the sponsor and the ask.</text>
    <rect x="60" y="350" width="600" height="58" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="80" y="372" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">5 · THE SPONSOR AGENDA</text>
    <text x="80" y="388" font-size="8.5" fill="hsl(var(--muted-foreground))">Why is THIS company asking THIS question THIS year? A PS on rural distribution means the sponsor is stuck on it.</text>
    <text x="80" y="400" font-size="8.5" fill="hsl(var(--muted-foreground))">Read their last annual report and recent news — decks that connect to the sponsor’s live strategy feel eerily senior.</text>
  </g>
  <path d="M360 408 L360 422" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="424" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="443" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">ONE SENTENCE, AGREED BY ALL, PINNED ON TOP</text>
  <text x="360" y="460" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">"We are recommending ___ for ___ so that ___, within ___" — every slide must serve this sentence</text>
  <text x="360" y="496" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Judges eliminate wrong-problem decks in the first 30 seconds — no amount of polish survives layer-1 failure.</text>
</svg>` },
    { type: 'heading', level: 2, text: 'Using the organiser Q&A window' },
    { type: 'prose', md: 'Most competitions open a clarification channel — a Q&A webinar, a Discord/WhatsApp group, or an email window. Most teams ignore it. Use it twice: once to resolve genuine ambiguity ("does the budget cap include marketing spend?"), and once to listen — **the questions other teams ask reveal how they\'re interpreting the PS**, and organiser answers often narrow the field of acceptable solutions. Take notes on every answer, not just yours.' },
    { type: 'heading', level: 2, text: 'From PS to workplan in one sitting' },
    { type: 'steps', ordered: true, items: [
      { title: 'Individual read (20 min)', md: 'Everyone reads all five layers alone and writes their one-sentence version of the ask. No discussion yet — this surfaces divergent readings before they hide.' },
      { title: 'Reconcile (30 min)', md: 'Compare sentences. Where they differ, return to the PS text and resolve from evidence. The agreed sentence goes at the top of the team doc and, later, on the title slide.' },
      { title: 'Extract the checklist', md: 'Deliverable specs, constraints, rubric weights, dates — into a single submission checklist with an owner. This document is checked again one hour before submission.' },
      { title: 'Draft the issue tree', md: 'Break the ask MECE-style into 3–4 workstreams (the next two modules cover research and solution). Assign owners and deadlines the same evening.' },
    ]},
    { type: 'callout', variant: 'pitfall', title: 'The "scope creep flex"', md: 'Teams love answering more than was asked — adding an app, an ESG angle, and a global expansion to a pricing question. Judges read it as inability to prioritise. Answer the ask completely; park adjacent ideas on one appendix slide titled "Beyond the brief."' },
    { type: 'keyTakeaways', title: 'Key takeaways', items: [
      'Read the PS five times — ask, deliverable spec, constraints, rubric, sponsor agenda — and reconcile the team to one sentence before any work begins.',
      'The printed evaluation rubric is the answer key: budget deck space proportional to its weights.',
      'Format violations kill decks unread; maintain a submission checklist from day one and re-check it an hour before the deadline.',
    ]},
  ],
};
