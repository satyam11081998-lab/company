import type { Page } from '@/lib/casebook/types';

export const theFinalePitch: Page = {
  slug: 'case-competitions/the-finale-pitch',
  title: 'The finale — pitching live and surviving the grilling',
  subtitle: 'Strong teams lose to weaker analysis on Q&A alone. Prepare for it like a round of its own.',
  kind: 'concept',
  meta: { difficulty: 'challenging', readingTimeMin: 10, tags: ['case-competitions', 'presentation', 'q-and-a'] },
  blocks: [
    { type: 'hook', md: 'By the finale, every surviving deck is good. Judges now score the ten minutes they can\'t read in advance: how you present, and — far more heavily than teams expect — **how you behave under attack.**' },
    { type: 'heading', level: 2, text: 'Budgeting the pitch clock' },
    { type: 'prose', md: 'Most finales give 8–15 minutes to present and 5–10 of Q&A. The discipline is the same at any length: open with the answer, spend the middle on your two or three strongest pieces of evidence, and land on the plan. Never narrate slides ("as you can see on this slide…") — present the *argument* while the slides prove it behind you.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Pitch clock showing time allocation across a ten minute presentation as a segmented bar, speaker assignments, and below it a four-step flow for handling hostile questions: listen, acknowledge, bridge, answer with evidence, ending in a verdict bar', caption: 'A 10-minute finale, budgeted — and the ABA loop that turns a grilling into your best minutes.', svg: `<svg viewBox="0 0 720 510" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="kppq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#kppq)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">THE PITCH CLOCK + THE GRILLING</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">a 10-minute finale, minute by minute — then the ABA loop for Q&amp;A</text>
  <text x="70" y="92" font-size="9" font-weight="700" fill="hsl(var(--muted-foreground))">PRESENTATION · 10:00</text>
  <g>
    <rect x="60" y="100" width="120" height="46" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
    <text x="120" y="118" text-anchor="middle" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">0:00–1:30 · ANSWER</text>
    <text x="120" y="133" text-anchor="middle" font-size="8" fill="hsl(var(--muted-foreground))">recommendation + impact</text>
    <rect x="184" y="100" width="100" height="46" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="234" y="118" text-anchor="middle" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">1:30–3:00 · PROBLEM</text>
    <text x="234" y="133" text-anchor="middle" font-size="8" fill="hsl(var(--muted-foreground))">the ask + why now</text>
    <rect x="288" y="100" width="160" height="46" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="368" y="118" text-anchor="middle" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">3:00–6:00 · EVIDENCE</text>
    <text x="368" y="133" text-anchor="middle" font-size="8" fill="hsl(var(--muted-foreground))">2–3 insights + the matrix + financials</text>
    <rect x="452" y="100" width="120" height="46" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="512" y="118" text-anchor="middle" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">6:00–8:30 · PLAN</text>
    <text x="512" y="133" text-anchor="middle" font-size="8" fill="hsl(var(--muted-foreground))">pillars · roadmap · risks</text>
    <rect x="576" y="100" width="84" height="46" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
    <text x="618" y="118" text-anchor="middle" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">8:30–10 · CLOSE</text>
    <text x="618" y="133" text-anchor="middle" font-size="8" fill="hsl(var(--muted-foreground))">restate + the one line</text>
  </g>
  <text x="360" y="172" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">2–3 speakers max · handovers scripted ("Priya will take you through the math") · one member drives slides + watches the clock</text>
  <path d="M360 182 L360 198" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <text x="70" y="216" font-size="9" font-weight="700" fill="hsl(var(--muted-foreground))">THE GRILLING · the ABA LOOP</text>
  <g text-anchor="middle">
    <rect x="40" y="226" width="150" height="84" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="115" y="246" font-size="9" font-weight="700" fill="hsl(var(--foreground))">1 · LISTEN FULLY</text>
    <text x="115" y="262" font-size="8" fill="hsl(var(--muted-foreground))">never interrupt; 2 seconds</text>
    <text x="115" y="275" font-size="8" fill="hsl(var(--muted-foreground))">of silence reads as</text>
    <text x="115" y="288" font-size="8" fill="hsl(var(--muted-foreground))">thought, not weakness</text>
    <rect x="215" y="226" width="150" height="84" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="290" y="246" font-size="9" font-weight="700" fill="hsl(var(--foreground))">2 · ACKNOWLEDGE</text>
    <text x="290" y="262" font-size="8" fill="hsl(var(--muted-foreground))">"fair challenge — adoption</text>
    <text x="290" y="275" font-size="8" fill="hsl(var(--muted-foreground))">is our biggest assumption"</text>
    <text x="290" y="288" font-size="8" fill="hsl(var(--muted-foreground))">— defuses, never concedes</text>
    <rect x="390" y="226" width="150" height="84" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="465" y="246" font-size="9" font-weight="700" fill="hsl(var(--foreground))">3 · BRIDGE</text>
    <text x="465" y="262" font-size="8" fill="hsl(var(--muted-foreground))">"which is why we stress-</text>
    <text x="465" y="275" font-size="8" fill="hsl(var(--muted-foreground))">tested it at half the rate…"</text>
    <text x="465" y="288" font-size="8" fill="hsl(var(--muted-foreground))">— steer to prepared ground</text>
    <rect x="565" y="226" width="125" height="84" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
    <text x="627" y="246" font-size="9" font-weight="700" fill="hsl(var(--primary))">4 · ANSWER + PROOF</text>
    <text x="627" y="262" font-size="8" fill="hsl(var(--muted-foreground))">one number, one source,</text>
    <text x="627" y="275" font-size="8" fill="hsl(var(--muted-foreground))">"appendix slide 14" —</text>
    <text x="627" y="288" font-size="8" fill="hsl(var(--muted-foreground))">then STOP talking</text>
  </g>
  <path d="M115 310 L115 326 M290 310 L290 326 M465 310 L465 326 M627 310 L627 326 M115 326 L627 326 M360 326 L360 340" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="110" y="342" width="500" height="60" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="362" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SPECIAL CASES</text>
    <text x="360" y="378" font-size="8.5" fill="hsl(var(--muted-foreground))">don't know? say so + how you'd find out — never bluff a CXO on their own business ·</text>
    <text x="360" y="392" font-size="8.5" fill="hsl(var(--muted-foreground))">judge is flat wrong? "our data shows X — happy to compare sources" · one teammate answers, others add ONLY if new</text>
  </g>
  <path d="M360 402 L360 416" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="418" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="437" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">Q&amp;A IS A SCORED ROUND — REHEARSE IT LIKE ONE</text>
  <text x="360" y="454" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">3 full mock runs minimum, with seniors playing hostile judges · time every answer under 60 seconds</text>
  <text x="360" y="490" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Judges often grill hardest the teams they like — pressure is a buying signal. Smile, breathe, answer.</text>
</svg>` },
    { type: 'heading', level: 2, text: 'Rehearsal protocol' },
    { type: 'steps', ordered: true, items: [
      { title: 'Run 1 — content (T-3 days)', md: 'Full pitch, no audience, recorded on a phone. Watch it. Cut everything that made you cringe; you will be 20% over time — cut content, never speed up delivery.' },
      { title: 'Run 2 — hostile mock (T-2 days)', md: 'Seniors or faculty play judges with one brief: break the team. Collect every question asked, write one-line answers with evidence pointers, and rank the five most dangerous.' },
      { title: 'Run 3 — dress rehearsal (T-1 day)', md: 'Real clock, real clicker, scripted handovers, backup plan for tech failure (PDF on two laptops + a phone). Decide who opens, who closes, who fields finance questions, who fields ops.' },
      { title: 'Day of', md: 'Arrive early, test the room, watch other teams if allowed (their grilling previews yours). The closer restates the recommendation in the final 15 seconds — the last sentence of the pitch is what judges write down.' },
    ]},
    { type: 'callout', variant: 'pitfall', title: 'The three finale killers', md: 'Reading slides aloud (judges read faster than you speak), one teammate answering every question while three sit frozen (judges score the *team*), and answering a 10-second question with a 3-minute speech. Sixty seconds, then stop.' },
    { type: 'callout', variant: 'insight', title: 'Video-pitch rounds', md: 'Many competitions now use a recorded video round before the live finale. Same structure, two changes: the first 10 seconds must state the recommendation (judges scrub), and audio quality matters more than video — record in a quiet room, phone mic close, slides screen-recorded with voiceover.' },
    { type: 'keyTakeaways', title: 'Key takeaways', items: [
      'Open with the answer, budget the clock to the minute, script the handovers, and let the closer restate the recommendation last.',
      'Run the ABA loop under fire: listen, acknowledge, bridge, answer with one number and one source — then stop talking.',
      'Q&A is a scored round: three rehearsals with hostile mock judges is the minimum, and the kill-question answers live in your appendix.',
    ]},
  ],
};
