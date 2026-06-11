import type { Page } from '@/lib/casebook/types';

export const judgesAndMistakes: Page = {
  slug: 'case-competitions/judges-and-mistakes',
  title: 'How judges actually score — and the ten ways teams die',
  subtitle: 'Reverse-engineer the scorecard, then audit your deck against the kill-list.',
  kind: 'concept',
  meta: { difficulty: 'moderate', readingTimeMin: 9, tags: ['case-competitions', 'judging', 'mistakes'] },
  blocks: [
    { type: 'hook', md: 'A screening judge is a manager at the sponsor, reading deck #67 of 100 at 11pm on a weeknight. Everything about how you win follows from that single image.' },
    { type: 'heading', level: 2, text: 'Who the judges are, round by round' },
    { type: 'table', headers: ['Round', 'Who judges', 'What they reward'], firstColHeader: true, rows: [
      ['Quiz/screening', 'Software + junior managers', 'Format compliance, a skimmable exec summary, no obvious errors'],
      ['Deck rounds', 'Mid-level managers in the function', 'Rigour, sourcing, feasibility — they know the business cold, so realism beats flash'],
      ['Finale', 'CXOs + HR leadership', 'Clarity, decisiveness, poise under grilling — and whether they can imagine hiring you'],
    ]},
    { type: 'svg', maxWidth: 720, ariaLabel: 'Judge scorecard with weighted bars for problem understanding, analysis rigour, innovation, feasibility and presentation, followed by a kill-list panel of the top elimination reasons and a verdict bar', caption: 'A typical rubric, weighted — and the kill-list below it. Most eliminations are self-inflicted, not out-thought.', svg: `<svg viewBox="0 0 720 525" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="kpjd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#kpjd)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">THE SCORECARD + THE KILL-LIST</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">typical rubric weights — allocate deck space and rehearsal time to match</text>
  <g font-size="9" fill="hsl(var(--foreground))">
    <text x="60" y="95" font-weight="700">Problem understanding</text>
    <rect x="240" y="84" width="180" height="14" rx="4" fill="hsl(var(--primary))" opacity="0.85"/>
    <text x="430" y="95" font-weight="700" fill="hsl(var(--primary))">~20%</text>
    <text x="60" y="121" font-weight="700">Analysis &amp; rigour</text>
    <rect x="240" y="110" width="225" height="14" rx="4" fill="hsl(var(--primary))" opacity="0.85"/>
    <text x="475" y="121" font-weight="700" fill="hsl(var(--primary))">~25%</text>
    <text x="60" y="147" font-weight="700">Innovation</text>
    <rect x="240" y="136" width="180" height="14" rx="4" fill="hsl(var(--primary))" opacity="0.7"/>
    <text x="430" y="147" font-weight="700" fill="hsl(var(--primary))">~20%</text>
    <text x="60" y="173" font-weight="700">Feasibility &amp; impact</text>
    <rect x="240" y="162" width="180" height="14" rx="4" fill="hsl(var(--primary))" opacity="0.7"/>
    <text x="430" y="173" font-weight="700" fill="hsl(var(--primary))">~20%</text>
    <text x="60" y="199" font-weight="700">Presentation &amp; Q&amp;A</text>
    <rect x="240" y="188" width="135" height="14" rx="4" fill="hsl(var(--primary))" opacity="0.55"/>
    <text x="385" y="199" font-weight="700" fill="hsl(var(--primary))">~15%</text>
  </g>
  <text x="360" y="225" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">weights vary by competition — when the PS prints its rubric, THAT one overrides this and your deck budget follows it</text>
  <path d="M360 234 L360 248" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g>
    <rect x="50" y="250" width="305" height="160" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="70" y="272" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">DECK-STAGE KILLS</text>
    <text x="70" y="292" font-size="8.5" fill="hsl(var(--muted-foreground))">1 · solved the wrong problem (the #1 cause)</text>
    <text x="70" y="308" font-size="8.5" fill="hsl(var(--muted-foreground))">2 · format violation — binned unread</text>
    <text x="70" y="324" font-size="8.5" fill="hsl(var(--muted-foreground))">3 · no recommendation, only "options to consider"</text>
    <text x="70" y="340" font-size="8.5" fill="hsl(var(--muted-foreground))">4 · zero numbers, or numbers without sources</text>
    <text x="70" y="356" font-size="8.5" fill="hsl(var(--muted-foreground))">5 · generic framework dump — SWOT slides with</text>
    <text x="70" y="370" font-size="8.5" fill="hsl(var(--muted-foreground))">     nothing the sponsor doesn't already know</text>
    <text x="70" y="392" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">fix: layers 1–4 of the PS read + the skim test</text>
    <rect x="365" y="250" width="305" height="160" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="385" y="272" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FINALE-STAGE KILLS</text>
    <text x="385" y="292" font-size="8.5" fill="hsl(var(--muted-foreground))">6 · reading slides aloud to people who can read</text>
    <text x="385" y="308" font-size="8.5" fill="hsl(var(--muted-foreground))">7 · collapsing under the first hostile question</text>
    <text x="385" y="324" font-size="8.5" fill="hsl(var(--muted-foreground))">8 · one member talks, three statues — team score dies</text>
    <text x="385" y="340" font-size="8.5" fill="hsl(var(--muted-foreground))">9 · overtime — organisers cut mics mid-sentence</text>
    <text x="385" y="356" font-size="8.5" fill="hsl(var(--muted-foreground))">10 · bluffing a CXO about their own business —</text>
    <text x="385" y="370" font-size="8.5" fill="hsl(var(--muted-foreground))">       the single fastest way to lose the room</text>
    <text x="385" y="392" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">fix: three rehearsals, one hostile · the ABA loop</text>
  </g>
  <path d="M202 410 L202 426 M517 410 L517 426 M202 426 L517 426 M360 426 L360 440" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="442" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="461" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">MOST TEAMS ARE NOT OUT-THOUGHT — THEY SELF-DESTRUCT</text>
  <text x="360" y="478" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">run the kill-list as a pre-submission audit: ten questions, ten minutes, every single entry</text>
  <text x="360" y="510" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Score yourself against the rubric before the judges do — a team that grades its own deck at 6/10 on feasibility already knows its Q&amp;A.</text>
</svg>` },
    { type: 'heading', level: 2, text: 'Thinking like judge #67' },
    { type: 'steps', ordered: false, items: [
      { title: 'They skim before they read', md: 'Exec summary → slide titles → charts. If that pass doesn\'t deliver the argument, the careful read never happens. This is why the skim test from the deck module is non-negotiable.' },
      { title: 'They pattern-match against their job', md: 'Sponsor-side judges instantly recognise a team that read their annual report — and a team recycling a deck from a different competition with the logo swapped.' },
      { title: 'They are hiring, not grading', md: 'Especially at finales: the unspoken question on every scorecard is "would I want this person on my team next April?" Composure, honesty about limits, and crisp answers are CV signals being scored live.' },
    ]},
    { type: 'callout', variant: 'insight', title: 'What "innovation" means to a judge', md: 'Not novelty — *non-obviousness that survives feasibility*. The winning idea is usually the one a smart insider would call "huh, we could actually do that," not the one requiring three technologies the sponsor doesn\'t own. Calibrate boldness to one pillar (the structural bet) and keep its math honest.' },
    { type: 'heading', level: 2, text: 'The pre-submission audit' },
    { type: 'prose', md: 'One hour before submitting, the whole team runs the kill-list as ten yes/no questions against the deck — does the exec summary carry the full answer, does every number have a source, is the format spec met to the letter, would a hostile reader find a recommendation or a menu. Then score yourselves 1–10 on each rubric line. Anything under 7 either gets fixed or gets a prepared defence in the appendix. Teams that audit honestly stop being surprised by results.' },
    { type: 'callout', variant: 'tip', title: 'After every result: the debrief', md: 'Win or lose, spend 30 minutes: what got asked in Q&A, which slides judges lingered on, what the winning team did that you didn\'t (their decks are often shared or presented publicly — study them). A team that debriefs improves a full round-depth per competition; one that doesn\'t replays the same exit forever.' },
    { type: 'keyTakeaways', title: 'Key takeaways', items: [
      'Judges are tired insiders: design for the skim, source every number, and never recycle a deck they can pattern-match.',
      'The rubric is your deck-space budget; the printed one always overrides the typical weights.',
      'Run the ten-point kill-list audit before every submission, and debrief after every result — that loop is the real coaching.',
    ]},
  ],
};
