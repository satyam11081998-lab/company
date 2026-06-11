import type { Page } from '@/lib/casebook/types';

export const researchAndInsight: Page = {
  slug: 'case-competitions/research-and-insight',
  title: 'Research that wins — from Google to ground truth',
  subtitle: 'Information is free; insight is scarce. Build the stack that produces insight.',
  kind: 'concept',
  meta: { difficulty: 'moderate', readingTimeMin: 10, tags: ['case-competitions', 'research', 'india-data'] },
  blocks: [
    { type: 'hook', md: 'Every team in the competition has the same Google. The decks that survive screening are the ones whose claims trace to sources the judges trust — and whose one or two *original* data points no other team has.' },
    { type: 'heading', level: 2, text: 'The research stack, bottom to top' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Research pyramid with four tiers from company sources through industry and government data to primary field research, each tier listing Indian sources, topped by a synthesis bar and an insight verdict', caption: 'The stack — every claim in your deck should cite a tier, and at least one claim should come from tier 4, which no rival can copy.', svg: `<svg viewBox="0 0 720 500" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="kprs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#kprs)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">THE RESEARCH STACK</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">cite a tier for every claim — earn at least one tier-4 original</text>
  <path d="M360 60 L360 76" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g>
    <rect x="60" y="78" width="600" height="62" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="80" y="100" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">TIER 1 · THE SPONSOR ITSELF</text>
    <text x="80" y="116" font-size="8.5" fill="hsl(var(--muted-foreground))">annual report + investor presentations + earnings-call transcripts + careers pages + recent press</text>
    <text x="80" y="130" font-size="8.5" fill="hsl(var(--muted-foreground))">judges FROM the sponsor notice instantly whether you did this — quote their own numbers back at them</text>
    <rect x="60" y="150" width="600" height="62" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="80" y="172" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">TIER 2 · INDUSTRY &amp; MARKET</text>
    <text x="80" y="188" font-size="8.5" fill="hsl(var(--muted-foreground))">IBEF sector reports · CRISIL/ICRA rating rationales · listed-competitor filings · consulting-firm public reports</text>
    <text x="80" y="202" font-size="8.5" fill="hsl(var(--muted-foreground))">(McKinsey/Bain/BCG/Redseer publish free India studies) · trade press: ET, Mint, Moneycontrol archives</text>
    <rect x="60" y="222" width="600" height="62" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="80" y="244" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">TIER 3 · GOVERNMENT &amp; HARD DATA</text>
    <text x="80" y="260" font-size="8.5" fill="hsl(var(--muted-foreground))">RBI bulletins · Census/NSSO/NFHS · MoSPI · TRAI subscriber data · ministry dashboards · data.gov.in</text>
    <text x="80" y="274" font-size="8.5" fill="hsl(var(--muted-foreground))">slowest to mine, highest credibility per citation — one RBI number outweighs five blog statistics</text>
    <rect x="60" y="294" width="600" height="62" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
    <text x="80" y="316" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">TIER 4 · PRIMARY — WHAT NO RIVAL HAS</text>
    <text x="80" y="332" font-size="8.5" fill="hsl(var(--muted-foreground))">a 50-response Google-Form survey · 5 store/dealer visits with photos · 3 calls with alumni working in the sector ·</text>
    <text x="80" y="346" font-size="8.5" fill="hsl(var(--muted-foreground))">mystery-shopping the sponsor and rivals — costs a weekend, instantly differentiates the deck</text>
  </g>
  <path d="M360 356 L360 370" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="160" y="372" width="400" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="389" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">SYNTHESIS: SO WHAT → NOW WHAT</text>
    <text x="360" y="404" font-size="8.5" fill="hsl(var(--muted-foreground))">every finding rewritten as "fact → implication → action" before it may enter the deck</text>
  </g>
  <path d="M360 414 L360 428" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="430" width="400" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="455" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">INSIGHT = FACT + SO-WHAT NOBODY ELSE SAID</text>
  <text x="360" y="490" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">A statistic is information. "Therefore the sponsor should…" is insight. Judges score only the second.</text>
</svg>` },
    { type: 'heading', level: 2, text: 'The 5-day research sprint' },
    { type: 'steps', ordered: true, items: [
      { title: 'Day 1 — frame before you search', md: 'From your issue tree, write the 8–12 questions the deck must answer. Research without questions is doom-scrolling with a spreadsheet open.' },
      { title: 'Days 2–3 — secondary sweep (tiers 1–3)', md: 'Divide tiers among the team. Everything goes into one shared sheet: claim, number, source, link, year. A claim without a source row does not exist.' },
      { title: 'Day 3 — launch primary in parallel', md: 'Surveys need 3–4 days to collect responses, so the Google Form ships on day 3, not day 8. Recruit respondents through batch groups, family WhatsApp, and the target segment — and report n honestly.' },
      { title: 'Days 4–5 — field and expert pass', md: 'Store visits with photos (photos go in the deck — instant credibility), 2–3 alumni calls (15 minutes each; people love being asked), mystery-shop the sponsor\'s own product and its rivals.' },
      { title: 'Day 5 — synthesis gate', md: 'Each researcher presents findings as **fact → so-what → now-what** triplets. Anything that can\'t complete the triplet is cut, however interesting.' },
    ]},
    { type: 'heading', level: 2, text: 'Sizing the market without faking it' },
    { type: 'prose', md: 'Almost every PS needs a market size or an impact estimate, and this is exactly the guesstimate skill the rest of MECE drills. Build it bottom-up (units × frequency × price), sanity-check it top-down against a published figure, and show both in the deck — the cross-check is worth more marks than the number. The [guesstimates section](/learn/casebook/guesstimates/pain-and-promise) is your training ground; competition decks are where it cashes out.' },
    { type: 'callout', variant: 'warning', title: 'Citation hygiene', md: 'Footnote every number on the slide where it appears (source, year). Two failure modes get teams quietly binned: numbers with no source, and numbers from a rival\'s sponsored blog. When sources conflict, show the range and say which you used and why — judges read that as maturity, not weakness.' },
    { type: 'callout', variant: 'tip', title: 'AI tools, used like a professional', md: 'LLMs are excellent at summarising annual reports, drafting survey questions, and listing sources to check — and terrible as a primary source. Rule: AI may point, only tiers 1–4 may be cited. Competitions increasingly ask teams to declare AI use; declare it plainly.' },
    { type: 'keyTakeaways', title: 'Key takeaways', items: [
      'Work the stack: sponsor filings → industry reports → government data → primary research; cite a tier for every claim.',
      'Tier-4 primary research (survey, store visits, alumni calls) is the cheapest differentiation available — ship the survey by day 3.',
      'Nothing enters the deck until it completes fact → so-what → now-what; statistics are not insight.',
    ]},
  ],
};
