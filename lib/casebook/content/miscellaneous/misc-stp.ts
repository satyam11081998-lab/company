import type { Page } from "../../types";

/**
 * Miscellaneous Frameworks - STP - Segmentation, Targeting, Positioning
 * Light reference card (Section G). One inline SVG hero to the locked v2 grammar (s9.14).
 */
export const stp: Page = {
  slug: "miscellaneous/stp",
  title: "STP - Segmentation, Targeting, Positioning",
  titleEmphasize: "STP",
  subtitle: "Narrow a whole market down to one customer you can win and speak to.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 6,
    tags: ["stp", "segmentation", "targeting", "positioning", "marketing", "miscellaneous"],
    caseType: "marketing",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "one sharp message",
      md: "You cannot be everything to everyone, and trying is how marketing budgets die. STP is the discipline of narrowing: take a broad market, cut it into groups, pick the group you can actually win, and craft **one sharp message** for them. Three steps, strictly in order.",
    },
    {
      type: "heading",
      level: 2,
      text: "The three steps",
      emphasize: "in order",
    },
    {
      type: "prose",
      md: "**Segmentation** splits the market into distinct groups by need, behaviour, demographics, or geography. **Targeting** picks the segment (or few) worth serving — judged on size, growth, fit, and how hard it is to win. **Positioning** decides the one place you want to own in that segment's mind: the offer and message built for them, and no one else.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 392" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">STP - FROM A WHOLE MARKET TO ONE SHARP MESSAGE</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">Three steps that narrow a broad market into the specific customer you build and speak for.</text>

  <!-- funnel: 3 stacked trapezoids narrowing -->
  <!-- S -->
  <path d="M96,64 H664 L596,128 H164 Z" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
  <text x="380" y="92" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="700">1 - Segmentation</text>
  <text x="380" y="110" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9.5">split the market into distinct groups - by need, behaviour, demographics, geography</text>
  <!-- T -->
  <path d="M168,140 H592 L520,204 H240 Z" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
  <text x="380" y="168" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="700">2 - Targeting</text>
  <text x="380" y="186" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9.5">pick the segment(s) worth serving - size, growth, fit, how hard to win</text>
  <!-- P (highlighted) -->
  <path d="M264,216 H496 L460,280 H300 Z" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.8"/>
  <text x="380" y="244" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="700">3 - Positioning</text>
  <text x="380" y="262" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9.5">own one place in their mind - the offer + message for that segment</text>

  <!-- right rail: the narrowing question at each step -->
  <text x="660" y="96" text-anchor="middle" fill="hsl(var(--primary))" font-size="9" font-style="italic">who is</text>
  <text x="660" y="108" text-anchor="middle" fill="hsl(var(--primary))" font-size="9" font-style="italic">out there?</text>
  <text x="660" y="172" text-anchor="middle" fill="hsl(var(--primary))" font-size="9" font-style="italic">who do we</text>
  <text x="660" y="184" text-anchor="middle" fill="hsl(var(--primary))" font-size="9" font-style="italic">serve?</text>
  <text x="660" y="248" text-anchor="middle" fill="hsl(var(--primary))" font-size="9" font-style="italic">why us,</text>
  <text x="660" y="260" text-anchor="middle" fill="hsl(var(--primary))" font-size="9" font-style="italic">for them?</text>

  <!-- HOW TO USE -->
  <rect x="14" y="300" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="321" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="338" fill="hsl(var(--foreground))" font-size="11.5">Segment honestly, target the segment you can win, then position for it - each step narrows the one before.</text>
  <text x="28" y="354" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: positioning without targeting is a slogan with no audience. The funnel only works top-down.</text>
</svg>`,
      caption: "A funnel: segment the whole market, target the winnable slice, position for it.",
      maxWidth: 700,
      ariaLabel: "An STP funnel narrowing from segmentation (split the market) to targeting (pick the segment) to positioning (own one place in their mind).",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "top-down, no skipping",
    },
    {
      type: "prose",
      md: "Work it strictly top-down. The most common error is jumping to positioning — a clever slogan — without having chosen a segment, leaving a message with no audience. Segment honestly, target where you can genuinely win, then position for exactly that group.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Positioning without targeting",
      md: "A brand that skips straight to ‘we're the premium, youthful, affordable, trusted choice’ has positioned for everyone, which means no one. Positioning only has force once you've named the specific segment it's aimed at.",
    },
    {
      type: "dialogue",
      title: "STP in one pass",
      turns: [
        { speaker: "interviewer", md: "A new oat-milk brand wants to enter the crowded Indian dairy-alternative market. Where would you start on their marketing?" },
        { speaker: "candidate", note: "Runs the three steps in order.", md: "With STP. Segment the market: by need — lactose-intolerant, fitness-led, vegan/ethical, and curious mainstream switchers. Target: I wouldn't chase mainstream switchers first — too big, too price-sensitive, dominated by dairy. The winnable slice is the fitness-and-wellness urban segment: smaller, but higher willingness to pay and already seeking alternatives. Position: for that segment, own ‘clean, high-protein, everyday performance fuel’ — not ‘cheaper than milk', which is a fight they'd lose." },
        { speaker: "narrator", md: "The candidate narrowed deliberately — a defined segment, then a position built only for it — instead of pitching a vague message at the whole market." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "STP is the front end of the **4 P's**: once you've positioned, the marketing mix executes it. Its segmentation step is the same muscle used in **Guesstimates** and the ‘Customers' lens of the **5 C's**.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Split a market into meaningful segments by need, behaviour, demographics, or geography.",
        "Target the segment you can realistically win — not just the biggest one.",
        "Position with one sharp message built for that segment alone.",
        "Work strictly top-down, never positioning before you've targeted.",
        "Hand the position to the 4 P's to execute."
      ],
    }
  ],
};

export default stp;
