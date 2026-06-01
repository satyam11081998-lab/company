import type { Page } from "../../types";

/**
 * Toolkit - McKinsey 7S Framework
 * Reference card (Section C). Two inline SVGs (hero + how-to-deploy) to the locked v2 grammar (s9.14).
 */
export const mckinsey7s: Page = {
  slug: "toolkit/mckinsey-7s",
  title: "McKinsey 7S Framework",
  titleEmphasize: "7S",
  subtitle: "Seven interdependent elements that must align for a strategy to work.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 10,
    tags: ["mckinsey 7s", "organisation", "alignment", "change", "toolkit"],
    caseType: "organisational analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "everything else must move",
      md: "Most strategies don't fail on the whiteboard — they fail in the organisation that has to deliver them. McKinsey's 7S explains why: seven elements of a company are interdependent, so when you change one, **everything else must move** with it. A brilliant new strategy stalls when the structure, skills, or culture around it stay the same.",
    },
    {
      type: "heading",
      level: 2,
      text: "The seven elements",
      emphasize: "hard and soft",
    },
    {
      type: "prose",
      md: "The seven sit in two groups around a shared centre. The *hard* S's are tangible and quick to change on paper: **strategy** (the plan to win), **structure** (the org chart), and **systems** (the daily processes). The *soft* S's are intangible and slow to shift: **skills** (capabilities), **style** (how leaders lead), **staff** (the people), and **shared values** (the core beliefs everything orbits).",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 408" xmlns="http://www.w3.org/2000/svg" role="img">
<defs>
  <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="hsl(214 64% 19%)"/>
    <stop offset="1" stop-color="hsl(214 74% 11%)"/>
  </linearGradient>
  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="hsl(var(--card))"/>
    <stop offset="1" stop-color="hsl(var(--muted))"/>
  </linearGradient>
  <filter id="cs" x="-20%" y="-20%" width="140%" height="150%">
    <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#0b1220" flood-opacity="0.14"/>
  </filter>
  <filter id="rs" x="-30%" y="-30%" width="160%" height="170%">
    <feDropShadow dx="0" dy="5" stdDeviation="8" flood-color="#06101f" flood-opacity="0.34"/>
  </filter>
  <marker id="ar" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0.5,0.8 L9,5 L0.5,9.2" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
  <text x="24" y="26" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">McKINSEY 7S - SEVEN THINGS THAT MUST FIT EACH OTHER</text>
  <text x="24" y="42" fill="hsl(var(--muted-foreground))" font-size="10.5">Change one element and the rest must move with it. A strategy fails when the other six are not aligned behind it.</text>

  <!-- spokes behind nodes; center at (250,176) -->
  <g fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.3">
    <line x1="250" y1="176" x2="120" y2="92"/>
    <line x1="250" y1="176" x2="250" y2="74"/>
    <line x1="250" y1="176" x2="380" y2="92"/>
    <line x1="250" y1="176" x2="120" y2="260"/>
    <line x1="250" y1="176" x2="250" y2="278"/>
    <line x1="250" y1="176" x2="380" y2="260"/>
  </g>

  <!-- center -->
  <circle cx="250" cy="176" r="46" fill="url(#ng)" filter="url(#rs)"/>
  <text x="250" y="172" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="700">Shared</text>
  <text x="250" y="187" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="700">Values</text>
  <text x="250" y="203" text-anchor="middle" fill="#b9c4d6" font-size="7.5">the core</text>

  <!-- hard S's (navy ring) -->
  <circle cx="120" cy="92" r="36" fill="url(#cg)" stroke="hsl(var(--muted-foreground))" stroke-width="2"/>
  <text x="120" y="90" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10.5" font-weight="700">Strategy</text>
  <text x="120" y="104" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="7.5">plan to win</text>
  <circle cx="250" cy="74" r="36" fill="url(#cg)" stroke="hsl(var(--muted-foreground))" stroke-width="2"/>
  <text x="250" y="72" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10.5" font-weight="700">Structure</text>
  <text x="250" y="86" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="7.5">org chart</text>
  <circle cx="380" cy="92" r="36" fill="url(#cg)" stroke="hsl(var(--muted-foreground))" stroke-width="2"/>
  <text x="380" y="90" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10.5" font-weight="700">Systems</text>
  <text x="380" y="104" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="7.5">daily process</text>
  <!-- soft S's (red ring) -->
  <circle cx="120" cy="260" r="36" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="2"/>
  <text x="120" y="258" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10.5" font-weight="700">Staff</text>
  <text x="120" y="272" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="7.5">the people</text>
  <circle cx="250" cy="278" r="36" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="2"/>
  <text x="250" y="276" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10.5" font-weight="700">Style</text>
  <text x="250" y="290" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="7.5">leadership</text>
  <circle cx="380" cy="260" r="36" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="2"/>
  <text x="380" y="258" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10.5" font-weight="700">Skills</text>
  <text x="380" y="272" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="7.5">capabilities</text>

  <!-- right column: legend + insight -->
  <rect x="470" y="62" width="276" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <circle cx="488" cy="86" r="6" fill="none" stroke="hsl(var(--foreground))" stroke-width="2"/>
  <text x="502" y="89" fill="hsl(var(--foreground))" font-size="10.5" font-weight="700">Hard S's</text>
  <text x="502" y="104" fill="hsl(var(--muted-foreground))" font-size="9">strategy, structure, systems -</text>
  <text x="502" y="117" fill="hsl(var(--muted-foreground))" font-size="9">tangible, quick to change on paper</text>
  <circle cx="488" cy="140" r="6" fill="none" stroke="hsl(var(--primary))" stroke-width="2"/>
  <text x="502" y="143" fill="hsl(var(--foreground))" font-size="10.5" font-weight="700">Soft S's</text>
  <text x="502" y="158" fill="hsl(var(--muted-foreground))" font-size="9">skills, style, staff, shared values -</text>
  <text x="502" y="171" fill="hsl(var(--muted-foreground))" font-size="9">intangible, slow, where change dies</text>

  <rect x="470" y="194" width="276" height="106" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="484" y="214" fill="hsl(var(--primary))" font-size="9.5" font-weight="700" letter-spacing="0.05em">THE INSIGHT</text>
  <text x="484" y="232" fill="hsl(var(--foreground))" font-size="9.5">All seven are interdependent and orbit</text>
  <text x="484" y="246" fill="hsl(var(--foreground))" font-size="9.5">shared values. The hard S's change on</text>
  <text x="484" y="260" fill="hsl(var(--foreground))" font-size="9.5">paper fast; the soft S's are slow - and</text>
  <text x="484" y="274" fill="hsl(var(--foreground))" font-size="9.5">that gap is where most change stalls.</text>

  <!-- HOW TO USE (full width, clear of nodes) -->
  <rect x="14" y="328" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="349" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="366" fill="hsl(var(--foreground))" font-size="11.5">Map the seven as they are vs. what the strategy needs, then fix the S's that clash.</text>
  <text x="28" y="382" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: the soft S's - skills, style, staff, values - are slow to shift and are where most change quietly fails.</text>
</svg>`,
      caption: "Seven interdependent elements orbiting shared values — hard and soft.",
      maxWidth: 760,
      ariaLabel: "The McKinsey 7S model: shared values at the centre, surrounded by the hard S's (strategy, structure, systems) and the soft S's (skills, style, staff), all interconnected, with hard S's quick to change and soft S's slow.",
    },
    {
      type: "prose",
      md: "The key idea is interdependence: there is no hierarchy, and a change in any one S ripples to the others. You can redraw the structure or rewrite the strategy overnight — the hard S's bend easily. But if the skills, leadership style, and culture don't move with them, the change never really lands. That mismatch is where transformations quietly die.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "find the misalignment",
    },
    {
      type: "prose",
      md: "Map the seven as they are today, then as the new strategy needs them to be, and look for the S's that clash. The diagnosis is almost always a *misalignment* — usually a lagging soft S — rather than a flawed strategy. Then realign the laggards together, because a single stranded S will stall the whole change.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 470" xmlns="http://www.w3.org/2000/svg" role="img">
<defs>
  <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="hsl(214 64% 19%)"/>
    <stop offset="1" stop-color="hsl(214 74% 11%)"/>
  </linearGradient>
  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="hsl(var(--card))"/>
    <stop offset="1" stop-color="hsl(var(--muted))"/>
  </linearGradient>
  <filter id="cs" x="-20%" y="-20%" width="140%" height="150%">
    <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#0b1220" flood-opacity="0.14"/>
  </filter>
  <filter id="rs" x="-30%" y="-30%" width="160%" height="170%">
    <feDropShadow dx="0" dy="5" stdDeviation="8" flood-color="#06101f" flood-opacity="0.34"/>
  </filter>
  <marker id="ar" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0.5,0.8 L9,5 L0.5,9.2" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
  <text x="24" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">USING McKINSEY 7S - FOUR MOVES</text>
  <text x="474" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">SAY IT OUT LOUD</text>
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6">
    <path d="M239,108 L239,122" marker-end="url(#ar)"/>
    <path d="M239,190 L239,204" marker-end="url(#ar)"/>
    <path d="M239,272 L239,286" marker-end="url(#ar)"/>
  </g>
  <rect x="24" y="50" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="65" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="84" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">1</text>
  <text x="80" y="75" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Map the current seven S’s</text>
  <text x="80" y="93" fill="hsl(var(--muted-foreground))" font-size="11">describe each as it really is today, anchored on shared values</text>
  <text x="474" y="75" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Let me capture how strategy, structure</text>
  <text x="474" y="91" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">and the rest actually look right now.”</text>
  <rect x="24" y="132" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="147" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="166" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">2</text>
  <text x="80" y="157" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Map the target state</text>
  <text x="80" y="175" fill="hsl(var(--muted-foreground))" font-size="11">what must each S become for the new strategy to work?</text>
  <text x="474" y="157" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“The new strategy needs different skills</text>
  <text x="474" y="173" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">and a different leadership style.”</text>
  <rect x="24" y="214" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="229" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="248" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">3</text>
  <text x="80" y="239" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Find the misaligned S’s</text>
  <text x="80" y="257" fill="hsl(var(--muted-foreground))" font-size="11">where do today and target clash? usually a soft S lags</text>
  <text x="474" y="239" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Structure changed, but staff skills and</text>
  <text x="474" y="255" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">culture never caught up - that’s the gap.”</text>
  <rect x="24" y="296" width="430" height="58" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <rect x="38" y="311" width="28" height="28" rx="7" fill="hsl(var(--primary))"/><text x="52" y="330" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">4</text>
  <text x="80" y="321" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Realign every S together</text>
  <text x="80" y="339" fill="hsl(var(--muted-foreground))" font-size="11">move the laggards; a single stranded S stalls the whole change</text>
  <text x="474" y="321" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“So we fix skills and style alongside</text>
  <text x="474" y="337" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">structure, not after it - all at once.”</text>
  <rect x="24" y="372" width="712" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="393" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="410" fill="hsl(var(--foreground))" font-size="11.5">7S diagnoses why a strategy or change is stalling: it’s almost always an unaligned S, usually a soft one, dragging the rest.</text>
  <text x="38" y="426" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: the hard S’s change on paper overnight; the soft S’s - skills, style, staff, values - are where change really lives or dies.</text>
</svg>`,
      caption: "Four moves that turn 7S into a diagnosis of why change is stalling.",
      maxWidth: 620,
      ariaLabel: "A four-step flow for using McKinsey 7S: map the current seven S's, map the target state, find the misaligned S's, and realign every S together, with a spoken script beside each step.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Changing the hard S's and stopping",
      md: "The common failure is to announce a new strategy and redraw the structure — the two easy, visible S's — and assume the job is done. The soft S's (skills, style, staff, values) don't move on a memo's timeline. If they're left behind, the new structure runs on the old culture, and nothing actually changes.",
    },
    {
      type: "heading",
      level: 2,
      text: "Worked example: a bank's digital pivot stalls",
      emphasize: "a bank's digital pivot",
    },
    {
      type: "prose",
      md: "A traditional bank announced a bold digital-first strategy a year ago, but adoption is flat and staff have quietly reverted to old ways. 7S diagnoses why.",
    },
    {
      type: "dialogue",
      title: "Why the change didn't stick",
      turns: [
        { speaker: "interviewer", md: "A traditional bank launched a digital-first strategy a year ago — new app, new digital targets — but usage is flat and branch staff have drifted back to old processes. Leadership is baffled. How would you diagnose it?" },
        { speaker: "candidate", note: "Maps current vs target across the seven.", md: "I'd run a 7S diagnosis, current versus target. Strategy — they changed it: digital-first, clear. Structure — they set up a digital unit, so that moved too. Systems — partially; the app exists but branch incentives still reward the old products. Now the soft S's, which is where I'd bet the problem is. Skills: did frontline staff actually get trained to sell and support digital? Style: are leaders modelling and rewarding digital, or still celebrating old metrics? Staff and shared values: do people believe this, or see it as a fad to wait out?" },
        { speaker: "interviewer", md: "So what's your read?" },
        { speaker: "candidate", note: "Names the misalignment, prescribes realignment.", md: "The hard S's moved — strategy and structure — but the soft S's didn't follow. Skills weren't built, the incentive systems still pay for old behaviour, and leadership style still prizes the old metrics, so staff rationally reverted. The strategy isn't wrong; it's stranded. The fix isn't a new strategy — it's realigning the lagging S's together: retrain skills, change the incentives, and have leaders visibly reward digital, so all seven point the same way. Change one without the others and it stalls again." },
        { speaker: "narrator", md: "The candidate resisted the obvious ‘the strategy must be wrong’ and instead found the real culprit — hard S's that moved while soft S's lagged. Diagnosing misalignment, not re-strategising, is exactly what 7S is for." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "7S is an *organisational* lens, so it's the natural follow-on to any strategy decision — **Growth**, **Market Entry**, or post-deal integration in **M&A**, where two companies' seven S's must be merged. Where most frameworks ask ‘what should we do?’, 7S asks ‘can this organisation actually deliver it?’",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Use 7S to test whether an organisation can actually deliver a strategy, not just whether the strategy is sound.",
        "Separate the hard S's (strategy, structure, systems) from the soft S's (skills, style, staff, shared values).",
        "Recognise that all seven are interdependent — a change in one demands changes in the rest.",
        "Diagnose stalled change as misalignment, usually a lagging soft S, rather than a flawed strategy.",
        "Realign the lagging S's together, since one stranded element stalls the whole change."
      ],
    }
  ],
};

export default mckinsey7s;
