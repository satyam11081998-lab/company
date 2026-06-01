import type { Page } from "../../types";

/**
 * Miscellaneous Frameworks - The 4 M's Framework
 * Light reference card (Section G). One inline SVG hero to the locked v2 grammar (s9.14).
 */
export const fourm: Page = {
  slug: "miscellaneous/4-ms",
  title: "The 4 M's Framework",
  titleEmphasize: "4 M's",
  subtitle: "Root-cause a process problem: man, machine, material, method.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 5,
    tags: ["4ms", "root cause", "operations", "process", "manufacturing", "miscellaneous"],
    caseType: "operations analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "one of four buckets",
      md: "When a process is producing defects, delays, or inconsistency, the cause almost always sits in **one of four buckets**: man, machine, material, or method. The 4 M's give you a fast, MECE way to hunt the root cause instead of guessing — the operations cousin of a fishbone diagram.",
    },
    {
      type: "heading",
      level: 2,
      text: "The four buckets",
      emphasize: "man, machine, material, method",
    },
    {
      type: "prose",
      md: "**Man** — the people (skill, training, availability, fatigue). **Machine** — equipment and tech (uptime, capacity, maintenance, automation). **Material** — input resources (quality, consistency, lead time, sourcing). **Method** — process and workflow (SOPs, sequencing, compliance, best-practice adherence). Between them they cover the contributors to almost any process variation.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 376" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">THE 4 M's - ROOT-CAUSE OF A PROCESS PROBLEM</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">When output is variable or defective, the cause sits in one of four buckets. A MECE way to hunt the root.</text>

  <!-- central problem node -->
  <rect x="300" y="62" width="160" height="42" rx="10" fill="url(#ng)" filter="url(#rs)"/>
  <text x="380" y="80" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="700">Process variation</text>
  <text x="380" y="96" text-anchor="middle" fill="#b9c4d6" font-size="8.5">defects, delays, inconsistency</text>

  <!-- 4 contributing buckets feeding up -->
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.5">
    <path d="M130,150 C200,150 250,120 298,98" marker-end="url(#ar)"/>
    <path d="M300,150 C320,140 350,120 366,106" marker-end="url(#ar)"/>
    <path d="M460,150 C440,140 410,120 394,106" marker-end="url(#ar)"/>
    <path d="M630,150 C560,150 510,120 462,98" marker-end="url(#ar)"/>
  </g>

  <rect x="14" y="158" width="172" height="112" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="100" y="182" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Man</text>
  <text x="100" y="198" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">the people</text>
  <circle cx="28" cy="220" r="2.6" fill="hsl(var(--primary))"/><text x="36" y="223" fill="hsl(var(--foreground))" font-size="9.5">Skill, training</text>
  <circle cx="28" cy="240" r="2.6" fill="hsl(var(--primary))"/><text x="36" y="243" fill="hsl(var(--foreground))" font-size="9.5">Availability, fatigue</text>
  <circle cx="28" cy="260" r="2.6" fill="hsl(var(--primary))"/><text x="36" y="263" fill="hsl(var(--foreground))" font-size="9.5">Workforce efficiency</text>

  <rect x="200" y="158" width="172" height="112" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="286" y="182" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Machine</text>
  <text x="286" y="198" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">equipment and tech</text>
  <circle cx="214" cy="220" r="2.6" fill="hsl(var(--primary))"/><text x="222" y="223" fill="hsl(var(--foreground))" font-size="9.5">Uptime, reliability</text>
  <circle cx="214" cy="240" r="2.6" fill="hsl(var(--primary))"/><text x="222" y="243" fill="hsl(var(--foreground))" font-size="9.5">Capacity, maintenance</text>
  <circle cx="214" cy="260" r="2.6" fill="hsl(var(--primary))"/><text x="222" y="263" fill="hsl(var(--foreground))" font-size="9.5">Automation level</text>

  <rect x="386" y="158" width="172" height="112" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="472" y="182" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Material</text>
  <text x="472" y="198" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">input resources</text>
  <circle cx="400" cy="220" r="2.6" fill="hsl(var(--primary))"/><text x="408" y="223" fill="hsl(var(--foreground))" font-size="9.5">Quality, consistency</text>
  <circle cx="400" cy="240" r="2.6" fill="hsl(var(--primary))"/><text x="408" y="243" fill="hsl(var(--foreground))" font-size="9.5">Availability, lead time</text>
  <circle cx="400" cy="260" r="2.6" fill="hsl(var(--primary))"/><text x="408" y="263" fill="hsl(var(--foreground))" font-size="9.5">Inventory, sourcing</text>

  <rect x="572" y="158" width="174" height="112" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="659" y="182" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Method</text>
  <text x="659" y="198" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">process and workflow</text>
  <circle cx="586" cy="220" r="2.6" fill="hsl(var(--primary))"/><text x="594" y="223" fill="hsl(var(--foreground))" font-size="9.5">SOPs, sequencing</text>
  <circle cx="586" cy="240" r="2.6" fill="hsl(var(--primary))"/><text x="594" y="243" fill="hsl(var(--foreground))" font-size="9.5">Compliance, controls</text>
  <circle cx="586" cy="260" r="2.6" fill="hsl(var(--primary))"/><text x="594" y="263" fill="hsl(var(--foreground))" font-size="9.5">Best-practice adherence</text>

  <!-- HOW TO USE -->
  <rect x="14" y="282" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="303" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="320" fill="hsl(var(--foreground))" font-size="11.5">For an operations or quality problem, test each M in turn to isolate the root cause before jumping to a fix.</text>
  <text x="28" y="336" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: it's for process / manufacturing issues. For people-performance, AMO is the sharper lens.</text>
</svg>`,
      caption: "Four buckets feeding process variation — a root-cause structure.",
      maxWidth: 760,
      ariaLabel: "The 4 M's — man, machine, material, method — as four buckets feeding into process variation, used to find a root cause.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "isolate before fixing",
    },
    {
      type: "prose",
      md: "For an operations or quality problem, test each M in turn to isolate the root cause before jumping to a fix. It's built for process and manufacturing issues — when the problem is people-performance rather than process, **AMO** is the sharper lens.",
    },
    {
      type: "callout",
      variant: "insight",
      title: "Why MECE matters here",
      md: "The strength of the 4 M's is coverage: walk all four and you're unlikely to miss a contributing cause. Skipping a bucket — say, assuming it's ‘the workers' (Man) without checking Material quality — is how teams fix the wrong thing and watch the defect return.",
    },
    {
      type: "dialogue",
      title: "Hunting the root cause",
      turns: [
        { speaker: "interviewer", md: "A packaging line's defect rate has crept up over three months. The plant manager wants to retrain the operators. How would you approach it?" },
        { speaker: "candidate", note: "Walks all four buckets before accepting 'retrain'.", md: "Before retraining anyone, I'd walk the 4 M's. Man: did anything change — new hires, more overtime, fatigue? Machine: is a packaging machine overdue for maintenance, running hot, losing calibration? Material: did they switch to a cheaper film or supplier three months ago — the timing is suspicious? Method: did an SOP or line speed change? The fact that it crept up over exactly three months points me at Material or Machine — a supplier switch or a degrading machine — more than at operators who've been there for years. I'd check those before spending on retraining." },
        { speaker: "narrator", md: "The candidate used the four buckets to challenge the assumed cause and follow the timing to a likelier root — which is exactly what the 4 M's are for." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "4M is the process counterpart to **AMO** (people performance) and feeds the cost-and-operations side of **Profitability** when defects or inefficiency are driving cost up.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Structure a process or quality problem into man, machine, material, and method.",
        "Walk all four buckets to avoid missing a contributing cause.",
        "Isolate the likely root cause before prescribing a fix.",
        "Use timing and changes to point toward the binding bucket.",
        "Reach for AMO instead when the problem is people-performance, not process."
      ],
    }
  ],
};

export default fourm;
