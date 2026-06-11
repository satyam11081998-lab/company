import type { Page } from '@/lib/casebook/types';

export const indiaCircuit: Page = {
  slug: 'case-competitions/india-circuit',
  title: 'The Indian circuit — every competition worth your hours',
  subtitle: 'The flagship directory, the college-fest circuit, and the season calendar.',
  kind: 'concept',
  meta: { difficulty: 'easy', readingTimeMin: 10, tags: ['case-competitions', 'directory', 'india'] },
  blocks: [
    { type: 'prose', md: 'India runs one of the densest case-competition circuits in the world, and almost all of it is discovered in one place: **Unstop** (formerly Dare2Compete). The circuit has a rhythm — corporate flagships launch as the academic year opens, finals cluster before placement season, and college fests fill the gaps. Learn the map before you spend a single hour competing.' },
    { type: 'heading', level: 2, text: 'The corporate flagships' },
    { type: 'prose', md: 'These are the competitions whose names placement committees recognise on sight. Editions, formats, and even names shift year to year — treat this as the map, and verify the live edition on Unstop before planning a season.' },
    { type: 'table', headers: ['Competition', 'Sponsor · domain', 'Why it matters'], firstColHeader: true, rows: [
      ['**L.I.M.E.**', 'HUL · marketing', 'The most famous of them all — winners have gone to Unilever\'s global Future Leaders\' League; historically televised. Marketing-career gold.'],
      ['**War Room**', 'Mahindra · strategy', 'Real strategy problems from actual Mahindra businesses; multi-month, gruelling, and the strongest "I did real work" signal on a CV.'],
      ['**E.P.I.C.**', 'TVS Credit · BFSI/strategy', 'NBFC-flavoured business problems; strong PPI pipeline.'],
      ['**Steel-a-thon**', 'Tata Steel · ops/strategy', 'The annual business challenge for premier B-schools; manufacturing and B2B exposure that most MBAs never get.'],
      ['**Canvas**', 'Asian Paints · marketing', 'Brand-building problems from a marketing-obsessed company.'],
      ['**Interrobang**', 'ITC · general management', 'Multi-business conglomerate cases; known for open-ended statements.'],
      ['**Stratos**', 'Aditya Birla Group · strategy simulation', 'A business *simulation*, not a deck contest — teams run a virtual company and the stock price is the scoreboard.'],
      ['**Stratethon**', 'Optum/UHG · healthcare', 'Healthcare + tech strategy; one of the few windows into the sector.'],
      ['**ACE Challenge**', 'Amazon · ops/product', 'Customer-excellence problems; e-commerce scale thinking.'],
      ['**WiRED**', 'Flipkart · e-commerce', 'Product and supply-chain problems at Indian-internet scale.'],
      ['**Brandstorm**', 'L\'Oréal · innovation (global)', 'National winners fly to an international finale — the classic global-exposure play.'],
      ['**CEO Challenge**', 'P&G · general management (global)', 'Same structure: India round feeds Asia/global finals.'],
      ['**CAFTA Case Championship**', 'EY · treasury/finance', 'The finance-specialist flagship; rare and valuable for finance CVs.'],
      ['**Maverick**', 'Deloitte · consulting', 'Consulting-style problems judged by consultants — closest to interview conditions.'],
      ['**Campus Challenge**', 'Hero MotoCorp · strategy/marketing', 'Long-running multi-round national challenge.'],
    ]},
    { type: 'callout', variant: 'note', md: 'Names rotate (sponsors rebrand, seasons skip years) and eligibility varies — some are first-year-only, some open to all, a few invite specific campuses. The discovery loop is non-negotiable: a weekly 15-minute scan of Unstop\'s competition listings, every week of the season.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Season calendar showing the Indian case competition year across three bands: flagship launch wave July to September, finals season October to December, and fest plus global season January to March, with a preparation row underneath', caption: 'The season at a glance — flagships launch as the academic year opens and conclude before placements. Plan backwards from this.', svg: `<svg viewBox="0 0 720 440" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="kpdr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#kpdr)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">THE COMPETITION YEAR</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">Indian B-school circuit — plan the season, not the event</text>
  <g font-size="8.5" fill="hsl(var(--muted-foreground))" text-anchor="middle">
    <text x="105" y="92">JUN–JUL</text>
    <text x="255" y="92">AUG–SEP</text>
    <text x="425" y="92">OCT–DEC</text>
    <text x="610" y="92">JAN–MAR</text>
  </g>
  <path d="M40 98 L690 98" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="40" y="112" width="150" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="115" y="132" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">ORIENTATION WAVE</text>
    <text x="115" y="148" font-size="8" fill="hsl(var(--muted-foreground))">MBA year begins · committees</text>
    <text x="115" y="161" font-size="8" fill="hsl(var(--muted-foreground))">form · seniors recruit juniors</text>
    <rect x="200" y="112" width="170" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="285" y="132" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">FLAGSHIP LAUNCHES</text>
    <text x="285" y="148" font-size="8" fill="hsl(var(--muted-foreground))">L.I.M.E. · War Room · Interrobang ·</text>
    <text x="285" y="161" font-size="8" fill="hsl(var(--muted-foreground))">Canvas · ACE — registrations open</text>
    <rect x="380" y="112" width="160" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="460" y="132" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">FINALS SEASON</text>
    <text x="460" y="148" font-size="8" fill="hsl(var(--muted-foreground))">semis + national finales stack up;</text>
    <text x="460" y="161" font-size="8" fill="hsl(var(--muted-foreground))">PPIs land before summer placements</text>
    <rect x="550" y="112" width="140" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="620" y="132" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FEST + GLOBAL SEASON</text>
    <text x="620" y="148" font-size="8" fill="hsl(var(--muted-foreground))">college fests · Brandstorm/CEO</text>
    <text x="620" y="161" font-size="8" fill="hsl(var(--muted-foreground))">Challenge global rounds</text>
  </g>
  <path d="M115 176 L115 196 M285 176 L285 196 M460 176 L460 196 M620 176 L620 196 M115 196 L620 196 M360 196 L360 210" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="212" width="240" height="74" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="232" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">YOUR PREP CALENDAR</text>
    <text x="215" y="248" font-size="8.5" fill="hsl(var(--muted-foreground))">Jun–Jul: form the team, drill the basics</text>
    <text x="215" y="262" font-size="8.5" fill="hsl(var(--muted-foreground))">Aug: 2–3 college comps as warm-ups</text>
    <text x="215" y="276" font-size="8.5" fill="hsl(var(--muted-foreground))">Sep onward: pick 3–4 flagships, go deep</text>
    <rect x="385" y="212" width="240" height="74" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="232" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">THE SELECTION RULE</text>
    <text x="505" y="248" font-size="8.5" fill="hsl(var(--muted-foreground))">3–4 deep runs beat 15 spray entries:</text>
    <text x="505" y="262" font-size="8.5" fill="hsl(var(--muted-foreground))">pick by career fit (marketing → L.I.M.E.),</text>
    <text x="505" y="276" font-size="8.5" fill="hsl(var(--muted-foreground))">PPI record, and calendar conflicts</text>
  </g>
  <path d="M215 286 L215 302 M505 286 L505 302 M215 302 L505 302 M360 302 L360 316" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="318" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="337" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">SCAN UNSTOP WEEKLY · COMMIT TO 3–4 · GO DEEP</text>
  <text x="360" y="354" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">15 minutes every Sunday: new listings, deadlines into the team calendar, eligibility checked</text>
  <text x="360" y="392" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Editions and dates drift every year — the calendar above is the pattern, Unstop is the truth.</text>
  <text x="360" y="410" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The teams that win flagships in October formed in June.</text>
</svg>` },
    { type: 'heading', level: 2, text: 'The college-fest circuit — your training league' },
    { type: 'prose', md: 'Every major B-school and many engineering colleges run case competitions through their fests and clubs — IIT consulting clubs, IIM fest events, DU and NIT circuits, and hundreds of standalone events on Unstop year-round. Prize money is smaller and judging is less polished, but the cycle is fast: register this week, submit next week, present the week after. **This is where you make your mistakes cheaply.** A team should clear 4–6 college competitions before its first flagship deep-run.' },
    { type: 'heading', level: 2, text: 'Choosing your portfolio' },
    { type: 'steps', ordered: true, items: [
      { title: 'Career fit first', md: 'Marketing aspirants prioritise L.I.M.E./Canvas/Brandstorm; strategy and consulting → War Room/Interrobang/Maverick; finance → CAFTA; ops/product → ACE/WiRED/Steel-a-thon. A win in your target domain is worth three elsewhere.' },
      { title: 'Check the PPI record', md: 'Seniors and the competition\'s past Unstop pages tell you whether finalists actually received PPIs. A flagship with a real PPI pipeline outranks a bigger cash prize.' },
      { title: 'Map deadline collisions', md: 'Flagship submission deadlines cluster in Sep–Oct, on top of mid-terms. Put every deadline in a shared team calendar on day one, and drop conflicts *before* you start, not mid-run.' },
      { title: 'Balance the portfolio', md: 'A sane first season: 2 college warm-ups + 3 flagships (one stretch, two realistic) + 1 global if eligible. More than that and every entry becomes shallow.' },
    ]},
    { type: 'keyTakeaways', title: 'Key takeaways', items: [
      'Unstop is the discovery engine; a 15-minute weekly scan is the minimum professional habit.',
      'Flagships launch Aug–Sep and conclude Oct–Dec — teams that form in June own the season.',
      'Pick 3–4 competitions by career fit and PPI record and go deep; spraying 15 entries produces 15 screening-round exits.',
    ]},
  ],
};
