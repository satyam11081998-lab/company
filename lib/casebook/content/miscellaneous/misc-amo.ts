import type { Page } from "../../types";

/**
 * Miscellaneous Frameworks - AMO Framework
 * Light reference card (Section G). One inline SVG hero to the locked v2 grammar (s9.14).
 */
export const amo: Page = {
  slug: "miscellaneous/amo",
  title: "AMO Framework",
  titleEmphasize: "AMO",
  subtitle: "Why a workforce underperforms: ability, motivation, or opportunity.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 5,
    tags: ["amo", "workforce", "performance", "hr", "people", "miscellaneous"],
    caseType: "organisational analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "the missing one",
      md: "When people aren't performing, the instinct is to blame effort. AMO says performance needs three things at once — people must be **able**, **motivated**, and given the **opportunity** — and they multiply. If any one is near zero, performance collapses no matter how strong the others are. The job is to find **the missing one**.",
    },
    {
      type: "heading",
      level: 2,
      text: "The three drivers",
      emphasize: "they multiply",
    },
    {
      type: "prose",
      md: "**Ability** — can they do it (skills, training, the right hire)? **Motivation** — do they want to (incentives, clear goals, fair appraisal, recognition)? **Opportunity** — are they allowed to (tools, authority, no process blockers)? Because performance is Ability × Motivation × Opportunity, a near-zero in any factor drags the whole product down.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 372" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">AMO - WHY ISN'T THE WORKFORCE PERFORMING?</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">Performance needs all three: people must be able, motivated, and given the chance. The missing one is the lever.</text>

  <!-- equation strip -->
  <rect x="14" y="58" width="732" height="30" rx="8" fill="url(#ng)"/>
  <text x="380" y="78" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="700">PERFORMANCE  =  Ability  x  Motivation  x  Opportunity</text>
  <text x="380" y="104" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9.5" font-style="italic">multiplicative - if any one is near zero, performance collapses no matter how strong the others are</text>

  <!-- 3 pillars -->
  <rect x="34" y="120" width="222" height="150" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="145" y="144" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="700">Ability</text>
  <text x="145" y="161" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">can they do it?</text>
  <circle cx="48" cy="183" r="2.6" fill="hsl(var(--primary))"/><text x="56" y="186" fill="hsl(var(--foreground))" font-size="10">Right hiring and selection</text>
  <circle cx="48" cy="205" r="2.6" fill="hsl(var(--primary))"/><text x="56" y="208" fill="hsl(var(--foreground))" font-size="10">Training and skill-building</text>
  <circle cx="48" cy="227" r="2.6" fill="hsl(var(--primary))"/><text x="56" y="230" fill="hsl(var(--foreground))" font-size="10">Experience and development</text>
  <text x="145" y="256" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">fix with: hire / train</text>

  <rect x="269" y="120" width="222" height="150" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="380" y="144" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="700">Motivation</text>
  <text x="380" y="161" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">do they want to?</text>
  <circle cx="283" cy="183" r="2.6" fill="hsl(var(--primary))"/><text x="291" y="186" fill="hsl(var(--foreground))" font-size="10">Incentives and pay</text>
  <circle cx="283" cy="205" r="2.6" fill="hsl(var(--primary))"/><text x="291" y="208" fill="hsl(var(--foreground))" font-size="10">Clear goals, fair appraisal</text>
  <circle cx="283" cy="227" r="2.6" fill="hsl(var(--primary))"/><text x="291" y="230" fill="hsl(var(--foreground))" font-size="10">Recognition, work-life balance</text>
  <text x="380" y="256" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">fix with: incentives / culture</text>

  <rect x="504" y="120" width="222" height="150" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="615" y="144" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="700">Opportunity</text>
  <text x="615" y="161" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">are they allowed to?</text>
  <circle cx="518" cy="183" r="2.6" fill="hsl(var(--primary))"/><text x="526" y="186" fill="hsl(var(--foreground))" font-size="10">Tools, systems, authority</text>
  <circle cx="518" cy="205" r="2.6" fill="hsl(var(--primary))"/><text x="526" y="208" fill="hsl(var(--foreground))" font-size="10">Career paths, empowerment</text>
  <circle cx="518" cy="227" r="2.6" fill="hsl(var(--primary))"/><text x="526" y="230" fill="hsl(var(--foreground))" font-size="10">No process blockers</text>
  <text x="615" y="256" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">fix with: remove blockers</text>

  <!-- HOW TO USE -->
  <rect x="14" y="282" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="303" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="320" fill="hsl(var(--foreground))" font-size="11.5">For a workforce or salesforce problem, test all three. The weakest of A, M, O is the bottleneck - and it names the fix.</text>
  <text x="28" y="336" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: don't train people who lack motivation, or incentivise people who lack the tools. Match the fix to the gap.</text>
</svg>`,
      caption: "Performance = Ability x Motivation x Opportunity; the weakest is the bottleneck.",
      maxWidth: 760,
      ariaLabel: "The AMO framework: performance equals ability times motivation times opportunity, each with what it covers and how to fix it.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "match the fix to the gap",
    },
    {
      type: "prose",
      md: "For a workforce or salesforce problem, test all three and find the weakest — that's the bottleneck, and it names the fix. The critical discipline is matching the fix to the gap: training people who lack motivation, or incentivising people who lack the tools, wastes money and changes nothing.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Throwing the wrong fix at it",
      md: "Most failed ‘performance' interventions are mismatched: a sales team is incentivised harder when the real problem is a clunky CRM (an opportunity gap), or sent to training when they're simply demotivated. Diagnose which of A, M, O is missing *before* prescribing.",
    },
    {
      type: "dialogue",
      title: "Naming the bottleneck",
      turns: [
        { speaker: "interviewer", md: "A company's sales team is missing targets. Leadership wants to raise the commission rate. How would you check whether that's the right move?" },
        { speaker: "candidate", note: "Tests A, M, O before accepting the fix.", md: "I'd run AMO before touching commissions. Ability: are reps trained on the product and on selling — or are new hires thrown in cold? Motivation: is the current incentive actually weak, or is morale the issue? Opportunity: do they have the tools, leads, and authority to close — or are they blocked by slow approvals and a poor CRM? If the gap is opportunity — say deals stall in a clunky approval process — then raising commission does nothing; reps are already trying. The fix is removing the blocker. Commission only helps if motivation is genuinely the missing factor." },
        { speaker: "narrator", md: "The candidate refused to accept the proposed fix until they'd found which of the three was actually missing — which is the whole point of AMO." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "AMO is the *people* counterpart to **4M** (which diagnoses process problems) and overlaps the ‘Staff' and ‘Skills' elements of **McKinsey 7S**.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Diagnose workforce performance across ability, motivation, and opportunity.",
        "Treat them as multiplicative — the weakest factor caps performance.",
        "Find the missing factor that is the real bottleneck.",
        "Match the fix to the gap instead of defaulting to incentives or training."
      ],
    }
  ],
};

export default amo;
