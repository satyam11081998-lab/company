import type { Page } from '@/lib/casebook/types';

export const teamFormation: Page = {
  slug: 'case-competitions/team-formation',
  title: 'Building the team — roles, chemistry, and operating rhythm',
  subtitle: 'Most teams are friend groups. Winning teams are skill portfolios.',
  kind: 'concept',
  meta: { difficulty: 'easy', readingTimeMin: 8, tags: ['case-competitions', 'teamwork'] },
  blocks: [
    { type: 'hook', md: 'The most common team in any competition is three friends from the same section with the same skills and the same blind spots. The judges never see the team — but they see its gaps on every slide.' },
    { type: 'heading', level: 2, text: 'The four-role architecture' },
    { type: 'prose', md: 'A competition deliverable needs four distinct kinds of work. In a team of 3, people double up; in a team of 4, each owns one. What matters is that every role has a *named owner* — unowned roles are where decks fail.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Team architecture showing four roles — analyst, researcher, designer, storyteller — each with responsibilities and the failure mode if missing, a captain overlay row, and a verdict bar about complementary skills', caption: 'The four roles, each with its failure mode. The captain is a hat, not a person — usually worn by the storyteller.', svg: `<svg viewBox="0 0 720 460" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="kptm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#kptm)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">ONE TEAM, FOUR JOBS</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">every job needs a named owner — unowned jobs surface as deck gaps</text>
  <path d="M360 60 L360 70 M115 70 L605 70 M115 70 L115 80 M278 70 L278 80 M442 70 L442 80 M605 70 L605 80" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="35" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="115" y="101" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">THE ANALYST</text>
    <text x="115" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">structures the problem,</text>
    <text x="115" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">owns the model: sizing,</text>
    <text x="115" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">unit economics, sensitivity</text>
    <text x="115" y="170" font-size="9" font-weight="700" fill="hsl(var(--primary))">missing → pretty deck,</text>
    <text x="115" y="184" font-size="9" font-weight="700" fill="hsl(var(--primary))">no numbers, dies in Q&amp;A</text>
    <rect x="198" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="278" y="101" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">THE RESEARCHER</text>
    <text x="278" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">mines reports, filings,</text>
    <text x="278" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">ground truth; turns data</text>
    <text x="278" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">into evidence for claims</text>
    <text x="278" y="170" font-size="9" font-weight="700" fill="hsl(var(--primary))">missing → generic gyaan</text>
    <text x="278" y="184" font-size="9" font-weight="700" fill="hsl(var(--primary))">any team could have written</text>
    <rect x="362" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="442" y="101" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">THE DESIGNER</text>
    <text x="442" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">owns the deck system:</text>
    <text x="442" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">layout, hierarchy, charts,</text>
    <text x="442" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">one visual language</text>
    <text x="442" y="170" font-size="9" font-weight="700" fill="hsl(var(--primary))">missing → great thinking</text>
    <text x="442" y="184" font-size="9" font-weight="700" fill="hsl(var(--primary))">invisible at screening</text>
    <rect x="525" y="82" width="160" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="605" y="101" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">THE STORYTELLER</text>
    <text x="605" y="118" font-size="8.5" fill="hsl(var(--muted-foreground))">owns the narrative arc</text>
    <text x="605" y="132" font-size="8.5" fill="hsl(var(--muted-foreground))">and the live pitch; turns</text>
    <text x="605" y="146" font-size="8.5" fill="hsl(var(--muted-foreground))">analysis into an argument</text>
    <text x="605" y="170" font-size="9" font-weight="700" fill="hsl(var(--primary))">missing → 40 slides of</text>
    <text x="605" y="184" font-size="9" font-weight="700" fill="hsl(var(--primary))">facts, no recommendation</text>
  </g>
  <path d="M115 202 L115 218 M278 202 L278 218 M442 202 L442 218 M605 202 L605 218 M115 218 L605 218 M360 218 L360 232" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="160" y="234" width="400" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="254" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">+ THE CAPTAIN (a hat, not a person)</text>
    <text x="360" y="270" font-size="8.5" fill="hsl(var(--muted-foreground))">owns the calendar, makes tie-breaking calls, talks to organisers,</text>
    <text x="360" y="284" font-size="8.5" fill="hsl(var(--muted-foreground))">and cuts scope when the deadline closes in — usually the storyteller</text>
  </g>
  <path d="M360 298 L360 312" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="314" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="333" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">RECRUIT FOR GAPS, NOT FOR FRIENDSHIP</text>
  <text x="360" y="350" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">audit your own role first · then find the two or three people who cover what you are not</text>
  <text x="360" y="388" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The strongest teams pair complementary skills with one shared trait: nobody needs to be chased.</text>
  <text x="360" y="406" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Chemistry is built in low-stakes college comps, then spent at flagships.</text>
</svg>` },
    { type: 'heading', level: 2, text: 'Recruiting in practice' },
    { type: 'steps', ordered: true, items: [
      { title: 'Audit yourself first', md: 'Which of the four roles are *you*, honestly? Most people overrate their storytelling and underrate design. Ask someone who has seen your work.' },
      { title: 'Recruit across sections and skills', md: 'An engineer-CA-designer-debater team beats four finance majors. Look in classes, clubs, and last year\'s competition shortlists — past finalists are public on Unstop and LinkedIn.' },
      { title: 'Consider a senior–junior mix', md: 'Where rules allow cross-batch teams, one senior who has seen a finale changes everything: they know what judges punish. In exchange, juniors carry more execution hours.' },
      { title: 'Agree on the contract before the first deadline', md: 'Three questions settle 90% of future fights: how many competitions this season, how many hours per week, and who decides when we disagree. Say the answers out loud.' },
    ]},
    { type: 'heading', level: 2, text: 'The operating rhythm of a two-week sprint' },
    { type: 'table', headers: ['Phase', 'Days', 'Who is on point'], firstColHeader: true, rows: [
      ['Decode the problem statement together', 'Day 1', 'Whole team — never split before alignment'],
      ['Research sprint + structure the issue tree', 'Days 2–5', 'Researcher + Analyst'],
      ['Solution build + financials', 'Days 6–9', 'Analyst leads, all contribute options'],
      ['Deck build', 'Days 8–12 (overlaps)', 'Designer leads; storyteller writes headlines'],
      ['Freeze, rehearse, stress-test Q&A', 'Days 13–14', 'Storyteller leads; everyone defends'],
    ]},
    { type: 'callout', variant: 'pitfall', title: 'The classic failure', md: 'Splitting slides on day 1 ("you take slides 1–3, I take 4–6") produces four mini-decks stapled together. Split *workstreams*, not slides — the deck is assembled by one designer from everyone\'s inputs, in one visual language.' },
    { type: 'callout', variant: 'tip', title: 'Name the team like a brand', md: 'You will register dozens of times. A short, memorable, professional team name ("Team Meridian" beats "Case Crushers 69") becomes your scoreboard identity across seasons — finalist lists are public, and recruiters do notice repeat names.' },
    { type: 'keyTakeaways', title: 'Key takeaways', items: [
      'Four jobs — analyst, researcher, designer, storyteller — each with a named owner; the captain is a hat the storyteller usually wears.',
      'Recruit for your gaps across sections and batches; agree hours, season load, and the tie-breaker rule before the first deadline.',
      'Split workstreams, never slides; one designer assembles one deck in one visual language.',
    ]},
  ],
};
