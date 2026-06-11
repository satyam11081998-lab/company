import type { Page } from '@/lib/casebook/types';

export const theWinningDeck: Page = {
  slug: 'case-competitions/the-winning-deck',
  title: 'The winning deck — anatomy, slide by slide',
  subtitle: 'Judges give a deck 90 seconds at screening. Design for the skim, reward the read.',
  kind: 'concept',
  meta: { difficulty: 'moderate', readingTimeMin: 11, tags: ['case-competitions', 'deck-design', 'storytelling'] },
  blocks: [
    { type: 'hook', md: 'At screening, a judge with a hundred PDFs gives yours ninety seconds. The test of a winning deck is brutal and simple: **can someone who reads only the slide titles reconstruct your entire argument?** That is the pyramid principle, and it is the whole game.' },
    { type: 'heading', level: 2, text: 'The action-title rule' },
    { type: 'prose', md: 'Every slide title is a full sentence stating the slide\'s one takeaway — not a label. "Market analysis" is a label; "Tier-2 demand is growing 2.4× faster than metros, but the sponsor\'s distribution reaches only 18% of it" is an argument. Stack the titles top to bottom and they should read as a complete, persuasive memo. Judges literally skim exactly this way.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Ten-slide skeleton of a winning case competition deck shown as labelled slide thumbnails in order, from executive summary through situation, insight, options kill, recommendation pillars, financials, roadmap, risks and appendix, with a verdict bar', caption: 'The 10-slide skeleton. Compress to 3 or 5 slides for early rounds by merging neighbours — the order never changes.', svg: `<svg viewBox="0 0 720 520" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="kpdk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#kpdk)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">THE 10-SLIDE SKELETON</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">titles alone must reconstruct the argument — the pyramid principle</text>
  <g text-anchor="middle">
    <rect x="40" y="80" width="200" height="74" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
    <text x="140" y="100" font-size="9" font-weight="700" fill="hsl(var(--primary))">1 · EXECUTIVE SUMMARY</text>
    <text x="140" y="115" font-size="8" fill="hsl(var(--muted-foreground))">recommendation + 3 reasons +</text>
    <text x="140" y="127" font-size="8" fill="hsl(var(--muted-foreground))">impact number — the whole answer;</text>
    <text x="140" y="139" font-size="8" fill="hsl(var(--muted-foreground))">many judges read only this slide</text>
    <rect x="260" y="80" width="200" height="74" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="100" font-size="9" font-weight="700" fill="hsl(var(--foreground))">2 · SITUATION &amp; PROBLEM</text>
    <text x="360" y="115" font-size="8" fill="hsl(var(--muted-foreground))">the ask restated in your words,</text>
    <text x="360" y="127" font-size="8" fill="hsl(var(--muted-foreground))">why it matters now, success</text>
    <text x="360" y="139" font-size="8" fill="hsl(var(--muted-foreground))">criteria — one slide, no history lesson</text>
    <rect x="480" y="80" width="200" height="74" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="580" y="100" font-size="9" font-weight="700" fill="hsl(var(--foreground))">3–4 · THE INSIGHT</text>
    <text x="580" y="115" font-size="8" fill="hsl(var(--muted-foreground))">your 2–3 sharpest findings with</text>
    <text x="580" y="127" font-size="8" fill="hsl(var(--muted-foreground))">evidence (incl. your primary research);</text>
    <text x="580" y="139" font-size="8" fill="hsl(var(--muted-foreground))">one chart per slide, one so-what each</text>
    <rect x="40" y="170" width="200" height="74" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="140" y="190" font-size="9" font-weight="700" fill="hsl(var(--foreground))">5 · OPTIONS CONSIDERED</text>
    <text x="140" y="205" font-size="8" fill="hsl(var(--muted-foreground))">the impact × feasibility matrix:</text>
    <text x="140" y="217" font-size="8" fill="hsl(var(--muted-foreground))">what you rejected and why —</text>
    <text x="140" y="229" font-size="8" fill="hsl(var(--muted-foreground))">visible discipline scores points</text>
    <rect x="260" y="170" width="200" height="74" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
    <text x="360" y="190" font-size="9" font-weight="700" fill="hsl(var(--primary))">6 · RECOMMENDATION</text>
    <text x="360" y="205" font-size="8" fill="hsl(var(--muted-foreground))">the 2–3 pillars on one slide,</text>
    <text x="360" y="217" font-size="8" fill="hsl(var(--muted-foreground))">each with its headline number —</text>
    <text x="360" y="229" font-size="8" fill="hsl(var(--muted-foreground))">decisive, no "options for client"</text>
    <rect x="480" y="170" width="200" height="74" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="580" y="190" font-size="9" font-weight="700" fill="hsl(var(--foreground))">7 · FINANCIALS</text>
    <text x="580" y="205" font-size="8" fill="hsl(var(--muted-foreground))">investment, return, payback,</text>
    <text x="580" y="217" font-size="8" fill="hsl(var(--muted-foreground))">sensitivity — headline numbers here,</text>
    <text x="580" y="229" font-size="8" fill="hsl(var(--muted-foreground))">model workings in appendix</text>
    <rect x="40" y="260" width="200" height="74" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="140" y="280" font-size="9" font-weight="700" fill="hsl(var(--foreground))">8 · ROADMAP</text>
    <text x="140" y="295" font-size="8" fill="hsl(var(--muted-foreground))">30/90/365-day phases with owners,</text>
    <text x="140" y="307" font-size="8" fill="hsl(var(--muted-foreground))">milestones and the KPI each</text>
    <text x="140" y="319" font-size="8" fill="hsl(var(--muted-foreground))">phase moves</text>
    <rect x="260" y="260" width="200" height="74" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="280" font-size="9" font-weight="700" fill="hsl(var(--foreground))">9 · RISKS &amp; MITIGATIONS</text>
    <text x="360" y="295" font-size="8" fill="hsl(var(--muted-foreground))">top 3 risks named before judges</text>
    <text x="360" y="307" font-size="8" fill="hsl(var(--muted-foreground))">name them, each with mitigation</text>
    <text x="360" y="319" font-size="8" fill="hsl(var(--muted-foreground))">and trigger</text>
    <rect x="480" y="260" width="200" height="74" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" stroke-dasharray="5 4"/>
    <text x="580" y="280" font-size="9" font-weight="700" fill="hsl(var(--foreground))">10+ · APPENDIX</text>
    <text x="580" y="295" font-size="8" fill="hsl(var(--muted-foreground))">model workings · survey data ·</text>
    <text x="580" y="307" font-size="8" fill="hsl(var(--muted-foreground))">the pre-written kill-question answer ·</text>
    <text x="580" y="319" font-size="8" fill="hsl(var(--muted-foreground))">your Q&amp;A ammunition lives here</text>
  </g>
  <path d="M140 334 L140 352 M360 334 L360 352 M580 334 L580 352 M140 352 L580 352 M360 352 L360 366" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="368" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="387" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">SKIM TEST: TITLES ALONE TELL THE WHOLE STORY</text>
  <text x="360" y="404" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">3-slide round? merge 2→1, 3–5→1, 6–9→1 · the order and the logic never change</text>
  <text x="360" y="440" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Slide 1 is not an introduction — it is the conclusion. Teams that "build suspense" lose the judge in ninety seconds.</text>
  <text x="360" y="458" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Consulting judges expect the consulting format; meeting it is free marks.</text>
</svg>` },
    { type: 'heading', level: 2, text: 'Design rules that survive screening' },
    { type: 'steps', ordered: false, items: [
      { title: 'One idea per slide', md: 'If a slide needs two takeaways, it is two slides (or one of the ideas dies). The title states the idea; everything below is evidence.' },
      { title: 'Charts over tables, tables over prose', md: 'Every claim wants its proof visualised: a labelled chart with the key data point highlighted beats a table, which beats a paragraph. Always label axes and source every number on-slide.' },
      { title: 'One visual system', md: 'One font family, 2–3 colours (use the sponsor\'s brand colour as your accent — a subtle, effective signal), identical margins and title positions on every slide. Misaligned decks read as careless thinking.' },
      { title: 'Whitespace is confidence', md: 'Walls of 11pt text scream insecurity. If it isn\'t evidence for the title, cut it or move it to the appendix.' },
      { title: 'The appendix is a weapon', md: 'Judges respect a tight main deck with a deep appendix: model workings, survey instrument and raw splits, and answers to the kill questions you pre-wrote. "That\'s in our appendix, slide 14" is the strongest sentence in Q&A.' },
    ]},
    { type: 'callout', variant: 'pitfall', title: 'Format violations bin decks unread', md: 'Slide count, file size, file type, naming convention, anonymity rules (some competitions forbid college names/logos at screening) — re-check the spec one hour before submitting, and submit 6+ hours early. Portals crash at midnight deadlines every single season.' },
    { type: 'callout', variant: 'tip', title: 'Tools', md: 'PowerPoint or Google Slides — judges receive PDF anyway. Use a 16:9 master with locked title/body placeholders so all four members produce identical layouts. Steal layout patterns from published consulting decks; steal *discipline*, not their content.' },
    { type: 'keyTakeaways', title: 'Key takeaways', items: [
      'Action titles: every slide title is a full-sentence takeaway, and the titles alone must reconstruct the argument.',
      'Slide 1 is the conclusion — recommendation, three reasons, impact number. Never build suspense.',
      'One idea per slide, one visual system, sourced numbers, ruthless whitespace — and an appendix built as Q&A ammunition.',
    ]},
  ],
};
