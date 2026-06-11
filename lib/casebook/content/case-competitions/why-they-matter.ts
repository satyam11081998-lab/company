import type { Page } from '@/lib/casebook/types';

export const whyTheyMatter: Page = {
  slug: 'case-competitions/why-they-matter',
  title: 'The Landscape — what case competitions are and why they matter',
  subtitle: 'The single highest-leverage activity in an Indian B-school, explained from zero.',
  kind: 'concept',
  meta: { difficulty: 'easy', readingTimeMin: 8, tags: ['case-competitions', 'fundamentals', 'ppi-ppo'] },
  blocks: [
    { type: 'hook', md: 'In two years of an MBA, nothing compounds like case competitions: they are simultaneously interview practice, a CV section, a shot at ₹1–10 lakh in prize money, and the **only legal way to skip a placement shortlist** — because winners and finalists routinely earn PPIs and PPOs directly from the sponsoring company.' },
    { type: 'prose', md: 'A case competition is a structured contest where a company (or a college committee) releases a real or realistic business problem, and student teams compete to produce the best solution — usually as a slide deck, defended live in front of judges. Unlike a case *interview* (one person, one interviewer, 30 minutes), a competition is a team sport played over days or weeks, with a written deliverable and a live pitch.' },
    { type: 'heading', level: 2, text: 'The three species of competition' },
    { type: 'table', headers: ['Type', 'Who runs it', 'What it really is'], firstColHeader: true, rows: [
      ['**Corporate flagship**', 'A company (HUL, Mahindra, Tata, Amazon…) as a branded annual event', 'A talent-scouting funnel dressed as a contest. The real prize is the PPI/PPO; the cash is marketing budget.'],
      ['**College fest competition**', 'A B-school committee (often inside a fest)', 'Reputation games between campuses. Lower stakes, faster cycles — your training ground.'],
      ['**Global challenge**', 'MNCs running worldwide editions (L\'Oréal Brandstorm, P&G CEO Challenge)', 'National rounds feed an international finale — flights, exposure, and elite CV signal.'],
    ]},
    { type: 'svg', maxWidth: 720, ariaLabel: 'Funnel from thousands of registrations through quiz, deck screening, semifinal and national finale, with the four payoffs of competing shown as a payoff row and a verdict bar', caption: 'The standard funnel — and why even losing early rounds pays. Numbers are typical for a flagship corporate competition.', svg: `<svg viewBox="0 0 720 505" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="kpla" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#kpla)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">THE COMPETITION FUNNEL</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">a flagship corporate case competition, registration to podium</text>
  <path d="M360 60 L360 76" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="110" y="78" width="500" height="40" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="95" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">REGISTRATION · 30,000–80,000 students</text>
    <text x="360" y="110" font-size="8.5" fill="hsl(var(--muted-foreground))">teams of 2–4, usually via Unstop — entry costs nothing but a form</text>
    <rect x="150" y="134" width="420" height="40" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="151" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">ONLINE QUIZ / SCREENING · ~10–20% survive</text>
    <text x="360" y="166" font-size="8.5" fill="hsl(var(--muted-foreground))">aptitude + business awareness, 20–30 min — eliminates the unprepared in bulk</text>
    <rect x="190" y="190" width="340" height="40" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="207" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">DECK SUBMISSION · the real filter</text>
    <text x="360" y="222" font-size="8.5" fill="hsl(var(--muted-foreground))">3–8 slides on the problem statement — ~5% of decks clear this round</text>
    <rect x="230" y="246" width="260" height="40" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="263" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SEMIFINAL · 15–30 teams</text>
    <text x="360" y="278" font-size="8.5" fill="hsl(var(--muted-foreground))">expanded deck + first live presentation, often regional</text>
    <rect x="270" y="302" width="180" height="40" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
    <text x="360" y="319" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">NATIONAL FINALE · 5–10 teams</text>
    <text x="360" y="334" font-size="8.5" fill="hsl(var(--muted-foreground))">live pitch to CXOs · campus or HQ</text>
  </g>
  <path d="M360 118 L360 134 M360 174 L360 190 M360 230 L360 246 M360 286 L360 302" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M360 342 L360 356 M95 356 L625 356 M95 356 L95 370 M272 356 L272 370 M448 356 L448 370 M625 356 L625 370" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="372" width="130" height="58" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="95" y="390" font-size="9" font-weight="700" fill="hsl(var(--foreground))">PPI / PPO</text>
    <text x="95" y="404" font-size="8" fill="hsl(var(--muted-foreground))">skip the shortlist —</text>
    <text x="95" y="416" font-size="8" fill="hsl(var(--muted-foreground))">the real prize</text>
    <rect x="207" y="372" width="130" height="58" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="272" y="390" font-size="9" font-weight="700" fill="hsl(var(--foreground))">CASH</text>
    <text x="272" y="404" font-size="8" fill="hsl(var(--muted-foreground))">₹1–10 lakh at</text>
    <text x="272" y="416" font-size="8" fill="hsl(var(--muted-foreground))">flagship finales</text>
    <rect x="383" y="372" width="130" height="58" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="448" y="390" font-size="9" font-weight="700" fill="hsl(var(--foreground))">CV SIGNAL</text>
    <text x="448" y="404" font-size="8" fill="hsl(var(--muted-foreground))">"National finalist" is</text>
    <text x="448" y="416" font-size="8" fill="hsl(var(--muted-foreground))">a shortlisting keyword</text>
    <rect x="560" y="372" width="130" height="58" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="625" y="390" font-size="9" font-weight="700" fill="hsl(var(--foreground))">REPS</text>
    <text x="625" y="404" font-size="8" fill="hsl(var(--muted-foreground))">every round is case-</text>
    <text x="625" y="416" font-size="8" fill="hsl(var(--muted-foreground))">interview practice</text>
  </g>
  <path d="M95 430 L95 444 M272 430 L272 444 M448 430 L448 444 M625 430 L625 444 M95 444 L625 444 M360 444 L360 456" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <text x="360" y="478" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Even a deck that dies in screening earns reps and a teammate you trust — the funnel pays at every stage if you debrief.</text>
</svg>` },
    { type: 'heading', level: 2, text: 'What is actually at stake' },
    { type: 'steps', ordered: false, items: [
      { title: 'PPI / PPO', md: 'A **Pre-Placement Interview** lets you interview with the sponsor without clearing their CV shortlist; a **Pre-Placement Offer** is a job offer before placements even begin. Flagship sponsors hand these to finalists because the competition *was* the assessment. Students have converted multiple PPIs from a single season of competing.' },
      { title: 'CV points that survive scrutiny', md: '"National Finalist, Mahindra War Room (top 9 of 1,500+ teams)" is a quantified, verifiable line that placement committees and interviewers actively probe — which means it also hands you a great interview story.' },
      { title: 'Money', md: 'Flagship prize pools run ₹1–10 lakh for winners, plus runner-up prizes. College fests pay less (₹10k–1L) but run year-round.' },
      { title: 'Compounding skill', md: 'Every competition forces the full consulting loop — structure, research, analysis, deck, pitch, Q&A — under a deadline. Ten competitions ≈ a mini consulting tenure before your summer internship.' },
    ]},
    { type: 'callout', variant: 'insight', title: 'The honest math of effort vs reward', md: 'A serious flagship run costs a team ~40–80 hours. A PPO is worth an entire placement season. No elective, club, or committee post has a better expected value per hour — **if** you compete deliberately instead of spraying entries.' },
    { type: 'heading', level: 2, text: 'How this track works' },
    { type: 'prose', md: 'The modules that follow take you from zero to podium in order: the Indian circuit and its calendar, building the right team, decoding problem statements, research that produces insight, building the solution, the winning deck, the live pitch, how judges actually score — and a 12-month roadmap that ties it to the rest of MECE. Do them in sequence; each assumes the previous.' },
    { type: 'keyTakeaways', title: 'Key takeaways', items: [
      'A case competition is a team-played, deck-delivered, live-defended business problem — corporate flagships are talent funnels where the real prize is the PPI/PPO.',
      'The funnel is brutal at the deck-screening stage (~5% pass): that is where the next modules concentrate your effort.',
      'Treat every entry as paid practice for placements — the skill loop is identical to case interviews, scaled up.',
    ]},
  ],
};
