import type { Page } from '@/lib/casebook/types';

export const zeroToPodiumRoadmap: Page = {
  slug: 'case-competitions/zero-to-podium-roadmap',
  title: 'Zero to podium — the 12-month roadmap',
  subtitle: 'The capstone: everything in this track, sequenced into one competition season.',
  kind: 'concept',
  meta: { difficulty: 'easy', readingTimeMin: 9, tags: ['case-competitions', 'roadmap', 'capstone'] },
  blocks: [
    { type: 'hook', md: 'Nobody podiums their first flagship. The teams on stage in December formed in June, lost cheaply in August, debriefed in September, and peaked exactly when it counted. This module is that sequence, made explicit.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Twelve month roadmap in four phases: foundation in months one and two, training league in months three and four, flagship season in months five to seven, and finale craft plus conversion in months eight to twelve, each phase with actions and an exit criterion, ending in a verdict bar', caption: 'Four phases, each with an exit test. If a phase\'s test fails, repeat the phase — skipping ahead just makes flagship losses expensive.', svg: `<svg viewBox="0 0 720 545" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="kprm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#kprm)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">ZERO → PODIUM IN FOUR PHASES</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">each phase has an exit test — fail it, repeat the phase</text>
  <path d="M360 60 L360 76" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g>
    <rect x="60" y="78" width="600" height="88" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="80" y="100" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PHASE 1 · FOUNDATION — months 1–2</text>
    <text x="80" y="117" font-size="8.5" fill="hsl(var(--muted-foreground))">form the four-role team and agree the contract · drill structure daily: casebook getting-started + core frameworks +</text>
    <text x="80" y="131" font-size="8.5" fill="hsl(var(--muted-foreground))">2 guesstimates/week on MECE · build the deck template once, properly · start the weekly Unstop scan habit</text>
    <text x="80" y="152" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">exit test: any member can structure a cold prompt into a MECE tree in 10 minutes, unaided</text>
    <rect x="60" y="178" width="600" height="88" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="80" y="200" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PHASE 2 · TRAINING LEAGUE — months 3–4</text>
    <text x="80" y="217" font-size="8.5" fill="hsl(var(--muted-foreground))">enter 3–4 college/fest competitions back-to-back · run the full loop each time: PS decode → research sprint →</text>
    <text x="80" y="231" font-size="8.5" fill="hsl(var(--muted-foreground))">solution → deck → pitch · 30-minute debrief after every result, win or lose · rotate who presents</text>
    <text x="80" y="252" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">exit test: one top-10 finish AND a two-week sprint that needed no all-nighter</text>
    <rect x="60" y="278" width="600" height="88" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
    <text x="80" y="300" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">PHASE 3 · FLAGSHIP SEASON — months 5–7</text>
    <text x="80" y="317" font-size="8.5" fill="hsl(var(--muted-foreground))">commit to 3–4 flagships chosen by career fit + PPI record · go deep: tier-4 primary research every time,</text>
    <text x="80" y="331" font-size="8.5" fill="hsl(var(--muted-foreground))">sponsor annual reports read cover to cover · kill-list audit before every submission · expect to clear deck rounds</text>
    <text x="80" y="352" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">exit test: at least one semifinal — your deck now survives professional judges</text>
    <rect x="60" y="378" width="600" height="88" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="80" y="400" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PHASE 4 · FINALE CRAFT &amp; CONVERSION — months 8–12</text>
    <text x="80" y="417" font-size="8.5" fill="hsl(var(--muted-foreground))">three-rehearsal protocol with hostile mocks for every live round · global comps (Brandstorm/CEO Challenge) if eligible ·</text>
    <text x="80" y="431" font-size="8.5" fill="hsl(var(--muted-foreground))">convert: CV lines quantified, finale stories rehearsed for interviews, PPIs followed up within a week</text>
    <text x="80" y="452" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">exit test: a finale appearance — and a competition story you can defend for 20 interview minutes</text>
  </g>
  <path d="M360 466 L360 480" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="482" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="501" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">LOSE CHEAPLY EARLY · PEAK WHEN IT COUNTS</text>
  <text x="360" y="518" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">the December podium is built in June — start the roadmap the week you read this</text>
</svg>` },
    { type: 'heading', level: 2, text: 'The weekly operating system' },
    { type: 'steps', ordered: false, items: [
      { title: 'Sunday · 15 min', md: 'Unstop scan: new listings, deadlines into the shared calendar, eligibility checked against your portfolio rules.' },
      { title: 'Twice a week · 45 min', md: 'Skill reps on MECE: one [guesstimate](/learn/casebook/guesstimates/pain-and-promise) and one framework or [worked case](/learn/casebook/getting-started/six-case-types) — competitions are won on fundamentals practised between competitions.' },
      { title: 'During a sprint', md: 'The two-week rhythm from the team module: decode together, research days 2–5, solution days 6–9, deck days 8–12, freeze and rehearse days 13–14. Submit 6+ hours early, always.' },
      { title: 'After every result · 30 min', md: 'The debrief from the judging module: what was asked, what the winners did, one thing to change next sprint. Write it down — memory flatters.' },
    ]},
    { type: 'heading', level: 2, text: 'Converting wins into careers' },
    { type: 'steps', ordered: true, items: [
      { title: 'Write CV lines that survive interviews', md: '"National Finalist (top 8 / 2,400+ teams), [Competition], [Sponsor] — recommended ₹X cr strategy to CXO panel." Quantified, verifiable, and a ready-made interview story you can defend at depth.' },
      { title: 'Chase the PPI like a deadline', md: 'PPIs are promised on stage and lost in inboxes. Within a week: thank-you note to the organising team, LinkedIn connects with judges who engaged, and a polite nudge through HR if the process stalls.' },
      { title: 'Bank the artefacts', md: 'Keep every deck, model, and survey in a team drive. Sanitised versions become portfolio pieces; the models become templates that cut your next sprint in half.' },
      { title: 'Pay it forward, strategically', md: 'Second-years who coach junior teams stay sharp for placement season and build the campus network that feeds them competition intel. Teaching the kill-list is the best revision of it.' },
    ]},
    { type: 'callout', variant: 'insight', title: 'The compounding loop', md: 'Casebook fundamentals → cheap college reps → flagship depth → finale poise → PPIs and stories → placement interviews that feel easy. Every module in this track feeds the next; every competition feeds your interviews. That is why this lives inside MECE and not beside it.' },
    { type: 'keyTakeaways', title: 'Key takeaways', items: [
      'Four phases with exit tests: foundation, training league, flagship season, finale craft — repeat any phase whose test you fail.',
      'The weekly OS is small and relentless: Sunday scan, two skill reps, sprint rhythm, written debriefs.',
      'Convert deliberately: quantified CV lines, PPIs chased within a week, artefacts banked, juniors coached.',
    ]},
  ],
};
