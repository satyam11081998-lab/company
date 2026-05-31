import type { Page } from "../../types";

/**
 * Core Frameworks - Structuring Fundamentals
 * The meta-framework: how to build a custom structure for any case.
 * Six inline SVG diagrams authored to the locked v2 visual grammar (s9.14).
 */
export const structuringFundamentals: Page = {
  slug: "core-frameworks/structuring-fundamentals",
  title: "Structuring fundamentals",
  titleEmphasize: "Structuring",
  subtitle: "How to build a custom structure for any case - instead of forcing the problem into a framework you half-remember.",
  kind: "framework",
  meta: {
    readingTimeMin: 16,
    tags: ["structuring", "mece", "issue tree", "hypothesis-driven", "foundations"],
    caseType: "structuring",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "build a structure on the spot",
      md: "Most candidates lose the case in the first ninety seconds — not because they can't do the maths, but because they reach for a framework they half-remember and bend the problem to fit it. The strongest candidates do the opposite: they build a structure on the spot, custom to the question in front of them. That is the whole skill. Every framework you have been taught — profitability, market entry, growth — is just a structure someone already built for one kind of problem. Learn how the building works and no case can catch you empty-handed, because you will make your own framework in real time.",
    },
    {
      type: "heading",
      level: 2,
      text: "Structure is the whole game",
      emphasize: "the whole game",
    },
    {
      type: "prose",
      md: "A case interview is not a quiz with the answer hiding at the back. It is a test of how you think when you do not know the answer yet. The interviewer hands you a messy, open question and watches how you carve it into something you can attack. Carve it well and the analysis almost does itself; carve it badly and no amount of clever arithmetic saves you. This is why structuring is weighted more heavily than any single calculation — it is the part that shows whether you can be trusted in front of a client.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 426" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <!-- LEFT RAIL: the four layers -->
  <g font-family="Inter" >
    <text x="14" y="50" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">① THE QUESTION</text>
    <text x="14" y="66" fill="hsl(var(--muted-foreground))" font-size="10">name the real objective</text>
    <text x="14" y="150" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">② MECE SPLIT</text>
    <text x="14" y="166" fill="hsl(var(--muted-foreground))" font-size="10">3–4 exclusive buckets</text>
    <text x="14" y="214" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">③ DRIVERS</text>
    <text x="14" y="230" fill="hsl(var(--muted-foreground))" font-size="10">drill what moves it</text>
    <text x="14" y="296" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">④ SO-WHAT</text>
    <text x="14" y="312" fill="hsl(var(--muted-foreground))" font-size="10">the recommendation</text>
  </g>

  <!-- connectors root -> buckets -->
  <g fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.6">
    <path d="M445,82 C445,104 259,100 259,122"/>
    <path d="M445,82 L445,122"/>
    <path d="M445,82 C445,104 631,100 631,122"/>
  </g>
  <!-- bucket -> drivers (only middle) and buckets -> gate -->
  <g fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.6">
    <path d="M445,172 L445,196"/>
    <path d="M445,260 L445,288"/>
    <path d="M259,172 C259,232 445,232 445,288" opacity="0.55"/>
    <path d="M631,172 C631,232 445,232 445,288" opacity="0.55"/>
  </g>

  <!-- ROOT -->
  <rect x="320" y="22" width="250" height="60" rx="12" fill="url(#ng)" filter="url(#rs)"/>
  <text x="445" y="48" text-anchor="middle" fill="#ffffff" font-size="14.5" font-weight="700">The question</text>
  <text x="445" y="67" text-anchor="middle" fill="#b9c4d6" font-size="11">“Should X do Y?” — restate it in one line</text>

  <!-- BUCKETS -->
  <g>
    <rect x="171" y="122" width="176" height="50" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
    <text x="259" y="143" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">Bucket A</text>
    <text x="259" y="159" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10.5">no overlap with B or C</text>

    <rect x="357" y="122" width="176" height="50" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
    <text x="445" y="143" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">Bucket B</text>
    <text x="445" y="159" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10.5">the branch that matters</text>

    <rect x="543" y="122" width="176" height="50" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
    <text x="631" y="143" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">Bucket C</text>
    <text x="631" y="159" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10.5">collectively exhaustive</text>
  </g>

  <!-- DRIVERS under B -->
  <g>
    <circle cx="372" cy="208" r="3.4" fill="hsl(var(--primary))"/>
    <text x="384" y="212" fill="hsl(var(--foreground))" font-size="11.5">First-order driver</text>
    <circle cx="372" cy="232" r="3.4" fill="hsl(var(--primary))"/>
    <text x="384" y="236" fill="hsl(var(--foreground))" font-size="11.5">…broken one level deeper</text>
    <text x="560" y="226" fill="hsl(var(--primary))" font-size="10.5" font-style="italic">← drill only what swings the answer</text>
  </g>

  <!-- GATE -->
  <rect x="320" y="288" width="250" height="54" rx="12" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="445" y="311" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">So what?</text>
  <text x="445" y="328" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10.5">the answer the tree now points to</text>

  <!-- HOW TO USE THIS panel -->
  <rect x="14" y="356" width="732" height="58" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="377" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="394" fill="hsl(var(--foreground))" font-size="11.5">Read it top-down: a question becomes MECE buckets → drivers → a recommendation. It is built, not memorised.</text>
  <text x="28" y="409" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: if your buckets don’t roll back up to answer the top question, you’ve built a list, not a structure.</text>
</svg>`,
      caption: "The anatomy every structure shares: question → MECE buckets → drivers → so-what.",
      maxWidth: 760,
      ariaLabel: "Diagram of the four layers of a structure: the question at top, three MECE buckets, drivers under the bucket that matters, and a so-what recommendation at the bottom.",
    },
    {
      type: "prose",
      md: "Every good structure has the same four layers. At the top sits the real question, restated in one clean line so you are sure you are solving the right problem. Below it, you split that question into three or four buckets that do not overlap and leave nothing out. Inside the bucket that matters most, you go one level deeper into the drivers you can actually move. At the bottom, everything rolls back up into a *so-what* — the recommendation the tree was built to produce. If your buckets do not add back up to answer the question on top, you have made a list, not a structure.",
    },
    {
      type: "heading",
      level: 2,
      text: "MECE: the one rule that matters",
      emphasize: "MECE",
    },
    {
      type: "prose",
      md: "MECE — mutually exclusive, collectively exhaustive — sounds like jargon until you see what it buys you. *Mutually exclusive* means no item can sit in two buckets, so you never count the same thing twice or argue with yourself about where it belongs. *Collectively exhaustive* means the buckets cover the whole problem, so you cannot be ambushed by a factor you forgot. Together they are a quiet promise to the interviewer: I will not double-count, and I will not miss anything.",
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
  <!-- ============ CARD 1: MECE (good) ============ -->
  <rect x="14" y="16" width="230" height="256" rx="12" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
  <circle cx="33" cy="42" r="5" fill="hsl(var(--success))"/>
  <text x="46" y="46" fill="hsl(var(--success))" font-size="11.5" font-weight="700" letter-spacing="0.05em">MECE — DO THIS</text>
  <text x="29" y="66" fill="hsl(var(--muted-foreground))" font-size="10.5">covers the whole, no double-count</text>
  <!-- whole track -->
  <rect x="29" y="104" width="200" height="46" rx="8" fill="hsl(var(--muted))"/>
  <!-- 3 flush tiles -->
  <rect x="31" y="106" width="64" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="63" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">A</text>
  <rect x="97" y="106" width="64" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="129" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">B</text>
  <rect x="163" y="106" width="64" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="195" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">C</text>
  <text x="29" y="190" fill="hsl(var(--foreground))" font-size="11.5" font-weight="600">Every part fits one bucket.</text>
  <text x="29" y="208" fill="hsl(var(--muted-foreground))" font-size="11">The pieces tile the whole with</text>
  <text x="29" y="224" fill="hsl(var(--muted-foreground))" font-size="11">no seams and no leftovers.</text>

  <!-- ============ CARD 2: not mutually exclusive ============ -->
  <rect x="257" y="16" width="230" height="256" rx="12" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
  <circle cx="276" cy="42" r="5" fill="hsl(var(--primary))"/>
  <text x="289" y="46" fill="hsl(var(--primary))" font-size="11.5" font-weight="700" letter-spacing="0.05em">NOT EXCLUSIVE</text>
  <text x="272" y="66" fill="hsl(var(--muted-foreground))" font-size="10.5">buckets overlap → double-counting</text>
  <rect x="272" y="104" width="200" height="46" rx="8" fill="hsl(var(--muted))"/>
  <rect x="278" y="106" width="118" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="319" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">A</text>
  <rect x="350" y="106" width="118" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="429" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">B</text>
  <!-- overlap zone -->
  <rect x="350" y="106" width="46" height="42" fill="hsl(var(--primary))" fill-opacity="0.20"/>
  <line x1="373" y1="100" x2="373" y2="158" stroke="hsl(var(--primary))" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="373" y="172" text-anchor="middle" fill="hsl(var(--primary))" font-size="10" font-weight="600">counted twice</text>
  <text x="272" y="200" fill="hsl(var(--foreground))" font-size="11.5" font-weight="600">“New vs lapsed customers”</text>
  <text x="272" y="217" fill="hsl(var(--muted-foreground))" font-size="11">— a reactivated user lands in</text>
  <text x="272" y="233" fill="hsl(var(--muted-foreground))" font-size="11">both. Pick one definition.</text>

  <!-- ============ CARD 3: not collectively exhaustive ============ -->
  <rect x="500" y="16" width="230" height="256" rx="12" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
  <circle cx="519" cy="42" r="5" fill="hsl(var(--primary))"/>
  <text x="532" y="46" fill="hsl(var(--primary))" font-size="11.5" font-weight="700" letter-spacing="0.05em">NOT EXHAUSTIVE</text>
  <text x="515" y="66" fill="hsl(var(--muted-foreground))" font-size="10.5">a bucket is missing → blind spot</text>
  <rect x="515" y="104" width="200" height="46" rx="8" fill="hsl(var(--muted))"/>
  <rect x="521" y="106" width="62" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="552" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">A</text>
  <!-- gap -->
  <rect x="587" y="106" width="62" height="42" rx="6" fill="none" stroke="hsl(var(--primary))" stroke-width="1.4" stroke-dasharray="4 3"/>
  <text x="618" y="132" text-anchor="middle" fill="hsl(var(--primary))" font-size="15" font-weight="700">?</text>
  <rect x="653" y="106" width="56" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="681" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">C</text>
  <text x="515" y="200" fill="hsl(var(--foreground))" font-size="11.5" font-weight="600">Splitting cost into “fixed +</text>
  <text x="515" y="217" fill="hsl(var(--muted-foreground))" font-size="11">labour” forgets variable input</text>
  <text x="515" y="233" fill="hsl(var(--muted-foreground))" font-size="11">cost. Add the missing branch.</text>

  <!-- HOW TO USE THIS panel -->
  <rect x="14" y="292" width="716" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="313" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="330" fill="hsl(var(--foreground))" font-size="11.5">Pressure-test every split: can an item sit in two buckets (overlap)? Anything missing (gap)? Fix both, then drill.</text>
  <text x="28" y="346" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: perfect MECE on paper can still be useless — buckets must also be worth analysing, not just clean.</text>
</svg>`,
      caption: "One clean split, and the two ways a split fails — overlap and gap.",
      maxWidth: 760,
      ariaLabel: "Three panels contrasting a clean MECE split with a not-mutually-exclusive split that overlaps and a not-collectively-exhaustive split with a missing bucket.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "The three ways a split goes wrong",
      md: "**Overlap** — splitting customers into *new* and *lapsed* breaks the moment a lapsed customer returns: now they are both. **Gap** — splitting cost into *fixed* and *labour* quietly forgets variable inputs like raw material. And a third, sneakier one: a split can be perfectly MECE and still useless if the buckets are not worth analysing. Clean is necessary, not sufficient.",
    },
    {
      type: "heading",
      level: 2,
      text: "The toolkit: five ways to break anything down",
      emphasize: "five ways",
    },
    {
      type: "prose",
      md: "Here is the secret the frameworks do not advertise: there are only a handful of ways to split a problem, and every named framework is just one of them applied to one situation. Master the five lenses below and you stop memorising frameworks altogether — you reach for the lens that fits and build the structure yourself.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 452" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="14" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">THE TOOLKIT — FIVE WAYS TO BREAK ANYTHING DOWN</text>
  <text x="14" y="46" fill="hsl(var(--muted-foreground))" font-size="11">Every framework you know is just one of these lenses, pre-applied. Learn the lenses and you can build the framework yourself.</text>

  <!-- generator for 5 rows -->
  <!-- ROW 1: equation -->
  <g>
    <rect x="14" y="64" width="732" height="52" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
    <rect x="26" y="76" width="28" height="28" rx="7" fill="hsl(var(--navy))"/>
    <text x="40" y="95" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">1</text>
    <text x="68" y="86" fill="hsl(var(--foreground))" font-size="13" font-weight="600">Equation</text>
    <text x="68" y="103" fill="hsl(var(--muted-foreground))" font-size="10.5">split by a maths identity</text>
    <text x="360" y="95" fill="hsl(var(--foreground))" font-size="13" font-weight="600" font-family="ui-monospace,monospace">π = Revenue − Cost</text>
    <rect x="585" y="76" width="150" height="28" rx="14" fill="none" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="660" y="94" text-anchor="middle" fill="hsl(var(--primary))" font-size="11" font-weight="600">→ Profitability</text>
  </g>
  <!-- ROW 2: process -->
  <g>
    <rect x="14" y="122" width="732" height="52" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
    <rect x="26" y="134" width="28" height="28" rx="7" fill="hsl(var(--navy))"/>
    <text x="40" y="153" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">2</text>
    <text x="68" y="144" fill="hsl(var(--foreground))" font-size="13" font-weight="600">Process / chain</text>
    <text x="68" y="161" fill="hsl(var(--muted-foreground))" font-size="10.5">split by sequential stages</text>
    <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.5">
      <path d="M360,148 h150" marker-end="url(#ar)"/>
    </g>
    <text x="360" y="143" fill="hsl(var(--muted-foreground))" font-size="10">Source</text>
    <text x="412" y="143" fill="hsl(var(--muted-foreground))" font-size="10">Make</text>
    <text x="452" y="143" fill="hsl(var(--muted-foreground))" font-size="10">Sell</text>
    <text x="486" y="143" fill="hsl(var(--muted-foreground))" font-size="10">Serve</text>
    <rect x="585" y="134" width="150" height="28" rx="14" fill="none" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="660" y="152" text-anchor="middle" fill="hsl(var(--primary))" font-size="11" font-weight="600">→ Due diligence</text>
  </g>
  <!-- ROW 3: segmentation -->
  <g>
    <rect x="14" y="180" width="732" height="52" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
    <rect x="26" y="192" width="28" height="28" rx="7" fill="hsl(var(--navy))"/>
    <text x="40" y="211" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">3</text>
    <text x="68" y="202" fill="hsl(var(--foreground))" font-size="13" font-weight="600">Segmentation</text>
    <text x="68" y="219" fill="hsl(var(--muted-foreground))" font-size="10.5">split by who / what / where</text>
    <g>
      <rect x="360" y="197" width="56" height="18" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
      <text x="388" y="210" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9.5">Customer</text>
      <rect x="420" y="197" width="50" height="18" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
      <text x="445" y="210" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9.5">Product</text>
      <rect x="474" y="197" width="56" height="18" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
      <text x="502" y="210" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9.5">Geography</text>
    </g>
    <rect x="585" y="192" width="150" height="28" rx="14" fill="none" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="660" y="210" text-anchor="middle" fill="hsl(var(--primary))" font-size="11" font-weight="600">→ Growth</text>
  </g>
  <!-- ROW 4: conceptual -->
  <g>
    <rect x="14" y="238" width="732" height="52" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
    <rect x="26" y="250" width="28" height="28" rx="7" fill="hsl(var(--navy))"/>
    <text x="40" y="269" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">4</text>
    <text x="68" y="260" fill="hsl(var(--foreground))" font-size="13" font-weight="600">Conceptual buckets</text>
    <text x="68" y="277" fill="hsl(var(--muted-foreground))" font-size="10.5">split by a clean either / or frame</text>
    <g>
      <rect x="360" y="255" width="74" height="18" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
      <text x="397" y="268" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9.5">Attractive?</text>
      <text x="444" y="268" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10" font-style="italic">vs</text>
      <rect x="456" y="255" width="78" height="18" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
      <text x="495" y="268" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9.5">Right to win?</text>
    </g>
    <rect x="585" y="250" width="150" height="28" rx="14" fill="none" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="660" y="268" text-anchor="middle" fill="hsl(var(--primary))" font-size="11" font-weight="600">→ Market entry</text>
  </g>
  <!-- ROW 5: stakeholder -->
  <g>
    <rect x="14" y="296" width="732" height="52" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
    <rect x="26" y="308" width="28" height="28" rx="7" fill="hsl(var(--navy))"/>
    <text x="40" y="327" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">5</text>
    <text x="68" y="318" fill="hsl(var(--foreground))" font-size="13" font-weight="600">Stakeholder</text>
    <text x="68" y="335" fill="hsl(var(--muted-foreground))" font-size="10.5">split by whose interests are at stake</text>
    <g fill="hsl(var(--primary))">
      <circle cx="368" cy="322" r="6"/><circle cx="400" cy="322" r="6"/><circle cx="432" cy="322" r="6"/><circle cx="464" cy="322" r="6"/>
    </g>
    <text x="416" y="343" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9.5">customer · firm · rival · regulator</text>
    <rect x="585" y="308" width="150" height="28" rx="14" fill="none" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="660" y="326" text-anchor="middle" fill="hsl(var(--primary))" font-size="11" font-weight="600">→ Any open case</text>
  </g>

  <!-- HOW TO USE THIS -->
  <rect x="14" y="366" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="387" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="404" fill="hsl(var(--foreground))" font-size="11.5">Faced with a blank page, run the menu and pick the lens that carves the problem cleanest. Often you combine two.</text>
  <text x="28" y="420" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: don’t force the equation lens on everything — “should we?” cases need a conceptual or stakeholder split.</text>
</svg>`,
      caption: "Five lenses for breaking down any problem — and the framework each one becomes.",
      maxWidth: 760,
      ariaLabel: "A five-row toolkit listing the equation, process, segmentation, conceptual-bucket and stakeholder lenses, each mapped to the framework it becomes.",
    },
    {
      type: "callout",
      variant: "insight",
      title: "Every framework is a pre-built structure",
      md: "Look closely and you will recognise old friends. **Profitability** is the equation lens — profit = revenue − cost. **Market entry** is the conceptual-buckets lens — is the market attractive, and can we win? **Growth** is the segmentation lens — which customers, products, geographies? **Due diligence** walks the process lens end to end. None of them are magic; they are structures someone built once and gave a name. You can build the same thing live.",
    },
    {
      type: "heading",
      level: 2,
      text: "There is no single right structure",
      emphasize: "no single right",
    },
    {
      type: "prose",
      md: "Beginners freeze because they are hunting for *the* correct tree, as if one exists. It does not. The same problem can be structured several valid ways, and a strong candidate picks the lens that isolates the answer fastest — then says out loud why they chose it. Watch one problem split three different ways.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 396" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <!-- connectors root -> 3 lenses -->
  <g fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.6">
    <path d="M380,78 C380,96 130,90 130,104"/>
    <path d="M380,78 L380,104"/>
    <path d="M380,78 C380,96 630,90 630,104"/>
  </g>

  <!-- ROOT -->
  <rect x="240" y="20" width="280" height="58" rx="12" fill="url(#ng)" filter="url(#rs)"/>
  <text x="380" y="45" text-anchor="middle" fill="#ffffff" font-size="14.5" font-weight="700">One problem</text>
  <text x="380" y="64" text-anchor="middle" fill="#b9c4d6" font-size="11">₹900 cr bus operator is bleeding cash — fix it</text>

  <!-- COLUMN 1: equation -->
  <rect x="14" y="104" width="232" height="44" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="26" y="123" fill="hsl(var(--primary))" font-size="10" font-weight="700" letter-spacing="0.06em">① EQUATION LENS</text>
  <text x="26" y="139" fill="hsl(var(--foreground))" font-size="11.5" font-weight="600">break the P&amp;L into maths</text>
  <g>
    <rect x="26" y="160" width="208" height="30" rx="7" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <circle cx="42" cy="175" r="3.2" fill="hsl(var(--primary))"/><text x="52" y="179" fill="hsl(var(--foreground))" font-size="11">Trips run</text>
    <rect x="26" y="196" width="208" height="30" rx="7" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <circle cx="42" cy="211" r="3.2" fill="hsl(var(--primary))"/><text x="52" y="215" fill="hsl(var(--foreground))" font-size="11">Fare × occupancy</text>
    <rect x="26" y="232" width="208" height="30" rx="7" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <circle cx="42" cy="247" r="3.2" fill="hsl(var(--primary))"/><text x="52" y="251" fill="hsl(var(--foreground))" font-size="11">Cost per km</text>
  </g>
  <text x="26" y="284" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">best when the maths is the bottleneck</text>

  <!-- COLUMN 2: segmentation -->
  <rect x="264" y="104" width="232" height="44" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="276" y="123" fill="hsl(var(--primary))" font-size="10" font-weight="700" letter-spacing="0.06em">② SEGMENT LENS</text>
  <text x="276" y="139" fill="hsl(var(--foreground))" font-size="11.5" font-weight="600">which slice loses money?</text>
  <g>
    <rect x="276" y="160" width="208" height="30" rx="7" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <circle cx="292" cy="175" r="3.2" fill="hsl(var(--primary))"/><text x="302" y="179" fill="hsl(var(--foreground))" font-size="11">Intercity routes</text>
    <rect x="276" y="196" width="208" height="30" rx="7" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <circle cx="292" cy="211" r="3.2" fill="hsl(var(--primary))"/><text x="302" y="215" fill="hsl(var(--foreground))" font-size="11">City routes</text>
    <rect x="276" y="232" width="208" height="30" rx="7" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <circle cx="292" cy="247" r="3.2" fill="hsl(var(--primary))"/><text x="302" y="251" fill="hsl(var(--foreground))" font-size="11">Contract / charter</text>
  </g>
  <text x="276" y="284" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">best when one slice hides the loss</text>

  <!-- COLUMN 3: journey -->
  <rect x="514" y="104" width="232" height="44" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="526" y="123" fill="hsl(var(--primary))" font-size="10" font-weight="700" letter-spacing="0.06em">③ JOURNEY LENS</text>
  <text x="526" y="139" fill="hsl(var(--foreground))" font-size="11.5" font-weight="600">where do we lose riders?</text>
  <g>
    <rect x="526" y="160" width="208" height="30" rx="7" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <circle cx="542" cy="175" r="3.2" fill="hsl(var(--primary))"/><text x="552" y="179" fill="hsl(var(--foreground))" font-size="11">Get the booking</text>
    <rect x="526" y="196" width="208" height="30" rx="7" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <circle cx="542" cy="211" r="3.2" fill="hsl(var(--primary))"/><text x="552" y="215" fill="hsl(var(--foreground))" font-size="11">Run the trip well</text>
    <rect x="526" y="232" width="208" height="30" rx="7" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <circle cx="542" cy="247" r="3.2" fill="hsl(var(--primary))"/><text x="552" y="251" fill="hsl(var(--foreground))" font-size="11">Win the repeat</text>
  </g>
  <text x="526" y="284" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">best when leakage is in the funnel</text>

  <!-- HOW TO USE THIS -->
  <rect x="14" y="300" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="321" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="338" fill="hsl(var(--foreground))" font-size="11.5">No single tree is correct. Sketch two lenses, pick the one that isolates the answer fastest, then say why you chose it.</text>
  <text x="28" y="354" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: the interviewer is testing the choice, not the cleverness — a plain split you can actually drive beats a fancy one you can’t.</text>
</svg>`,
      caption: "The same ₹900 crore problem, structured three equally valid ways.",
      maxWidth: 760,
      ariaLabel: "One business problem shown split three ways — by equation, by segment, and by customer journey.",
    },
    {
      type: "prose",
      md: "All three are MECE. All three are defensible. The equation lens is best when the maths is the bottleneck; the segment lens when one slice is quietly dragging the rest down; the journey lens when you are losing people somewhere in a funnel. The skill is not finding the one true tree — it is choosing deliberately and being able to defend the choice in a single sentence.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to build one live",
      emphasize: "live",
    },
    {
      type: "prose",
      md: "Knowing the lenses is not enough; you have to perform the structuring out loud, under pressure, without freezing. Here is the sequence that works — six moves, the first three done silently in your opening minute, the rest narrated as you draw.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 580" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="40" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">BUILD IT LIVE — SIX MOVES</text>
  <text x="474" y="40" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">SAY IT OUT LOUD</text>

  <!-- arrows between steps -->
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6">
    <path d="M239,116 L239,130" marker-end="url(#ar)"/>
    <path d="M239,190 L239,204" marker-end="url(#ar)"/>
    <path d="M239,264 L239,278" marker-end="url(#ar)"/>
    <path d="M239,338 L239,352" marker-end="url(#ar)"/>
    <path d="M239,412 L239,426" marker-end="url(#ar)"/>
  </g>

  <!-- STEP 1 -->
  <rect x="24" y="58" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="73" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="92" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">1</text>
  <text x="80" y="83" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Clarify the objective</text>
  <text x="80" y="101" fill="hsl(var(--muted-foreground))" font-size="11">pin the metric and the timeframe, in one line</text>
  <text x="474" y="83" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“So we’re solving for X by next year</text>
  <text x="474" y="99" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">— is that the real goal?”</text>

  <!-- STEP 2 -->
  <rect x="24" y="132" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="147" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="166" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">2</text>
  <text x="80" y="157" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Pick the lens</text>
  <text x="80" y="175" fill="hsl(var(--muted-foreground))" font-size="11">choose the split that isolates the answer fastest</text>
  <text x="474" y="157" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“I’ll break this by segment, because</text>
  <text x="474" y="173" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">that’s where the loss is hiding.”</text>

  <!-- STEP 3 -->
  <rect x="24" y="206" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="221" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="240" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">3</text>
  <text x="80" y="231" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Draw level 1, MECE</text>
  <text x="80" y="249" fill="hsl(var(--muted-foreground))" font-size="11">three or four buckets — name them before you go deep</text>
  <text x="474" y="231" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Three buckets — A, B, C.</text>
  <text x="474" y="247" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">May I sketch the structure?”</text>

  <!-- STEP 4 -->
  <rect x="24" y="280" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="295" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="314" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">4</text>
  <text x="80" y="305" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Pressure-test it</text>
  <text x="80" y="323" fill="hsl(var(--muted-foreground))" font-size="11">overlaps? gaps? is each bucket worth analysing?</text>
  <text x="474" y="305" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“These don’t overlap, and together</text>
  <text x="474" y="321" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">they cover the whole problem.”</text>

  <!-- STEP 5 -->
  <rect x="24" y="354" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="369" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="388" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">5</text>
  <text x="80" y="379" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Drill what matters</text>
  <text x="80" y="397" fill="hsl(var(--muted-foreground))" font-size="11">go one level deeper only where the answer lives</text>
  <text x="474" y="379" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Bucket B looks biggest, so I’ll</text>
  <text x="474" y="395" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">open that one up first.”</text>

  <!-- STEP 6 (hypothesis = red gate) -->
  <rect x="24" y="428" width="430" height="58" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <rect x="38" y="443" width="28" height="28" rx="7" fill="hsl(var(--primary))"/><text x="52" y="462" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">6</text>
  <text x="80" y="453" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Lead with a hypothesis</text>
  <text x="80" y="471" fill="hsl(var(--muted-foreground))" font-size="11">state your hunch so the structure has direction</text>
  <text x="474" y="453" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“My hypothesis is Z — here is</text>
  <text x="474" y="469" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">exactly how I would test it.”</text>

  <!-- HOW TO USE THIS -->
  <rect x="24" y="502" width="712" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="523" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="540" fill="hsl(var(--foreground))" font-size="11.5">Run moves 1–3 silently in your first minute, then narrate. The right column is the script — they score what they hear.</text>
  <text x="38" y="556" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: never skip move 1. A beautiful structure for the wrong objective is the fastest way to lose the case.</text>
</svg>`,
      caption: "Six moves for building a structure live — with the words to say at each step.",
      maxWidth: 620,
      ariaLabel: "A six-step vertical flow for building a structure live, with a spoken script beside each step.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Buy yourself a structure with silence",
      md: "Resist the urge to start talking immediately. Take a visible pause — twenty to thirty seconds of silence while you run moves one to three in your head. Interviewers read that pause as composure, not as being stuck. Then turn your paper around, walk them through the structure, and ask permission before you dive into a branch. The silence is what buys you a structure worth presenting.",
    },
    {
      type: "heading",
      level: 2,
      text: "Worked example: a case with no obvious framework",
      emphasize: "no obvious framework",
    },
    {
      type: "prose",
      md: "Most of what you will face will not map to a textbook framework — and that is exactly where structuring earns its marks. Take this one. **Anandam Dairy**, a ₹1,200 crore cooperative in Gujarat, is losing suppliers: roughly twelve per cent of its eighty thousand farmer-members have started selling to private milk buyers in the last year. There is no *farmer-retention framework* to recall. You have to build one — and the move that scores is refusing to treat it as a profitability case.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 488" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <!-- connectors root -> buckets -->
  <g fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.6">
    <path d="M380,80 C380,98 130,96 130,112"/>
    <path d="M380,80 L380,99"/>
    <path d="M380,80 C380,98 630,96 630,112"/>
  </g>

  <!-- ROOT -->
  <rect x="170" y="20" width="420" height="60" rx="12" fill="url(#ng)" filter="url(#rs)"/>
  <text x="380" y="46" text-anchor="middle" fill="#ffffff" font-size="14.5" font-weight="700">Why are Anandam’s farmer-suppliers leaving?</text>
  <text x="380" y="65" text-anchor="middle" fill="#b9c4d6" font-size="11">₹1,200 cr Gujarat dairy co-op · 12% of 80,000 farmers gone this year</text>

  <!-- BUCKET A -->
  <rect x="14" y="112" width="232" height="46" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="130" y="132" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">What we give them</text>
  <text x="130" y="148" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10">the farmer’s view of our deal</text>
  <!-- BUCKET B (the drilled branch) -->
  <rect x="264" y="112" width="232" height="46" rx="10" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.8" filter="url(#cs)"/>
  <text x="380" y="132" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">What rivals offer</text>
  <text x="380" y="148" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10">the alternative they’re defecting to</text>
  <text x="380" y="108" text-anchor="middle" fill="hsl(var(--primary))" font-size="9.5" font-weight="700">↓ we drill this branch</text>
  <!-- BUCKET C -->
  <rect x="514" y="112" width="232" height="46" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="630" y="132" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">Friction to switch</text>
  <text x="630" y="148" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10">what should keep them loyal</text>

  <!-- DRIVERS A -->
  <g>
    <rect x="14" y="174" width="232" height="26" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/><circle cx="30" cy="187" r="3" fill="hsl(var(--primary))"/><text x="40" y="191" fill="hsl(var(--foreground))" font-size="10.5">Procurement price per litre</text>
    <rect x="14" y="204" width="232" height="26" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/><circle cx="30" cy="217" r="3" fill="hsl(var(--primary))"/><text x="40" y="221" fill="hsl(var(--foreground))" font-size="10.5">How fast we pay</text>
    <rect x="14" y="234" width="232" height="26" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/><circle cx="30" cy="247" r="3" fill="hsl(var(--primary))"/><text x="40" y="251" fill="hsl(var(--foreground))" font-size="10.5">Feed · vet · cattle insurance</text>
  </g>
  <!-- DRIVERS B -->
  <g>
    <rect x="264" y="174" width="232" height="26" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-opacity="0.55"/><circle cx="280" cy="187" r="3" fill="hsl(var(--primary))"/><text x="290" y="191" fill="hsl(var(--foreground))" font-size="10.5">Spot price ~8% higher</text>
    <rect x="264" y="204" width="232" height="26" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-opacity="0.55"/><circle cx="280" cy="217" r="3" fill="hsl(var(--primary))"/><text x="290" y="221" fill="hsl(var(--foreground))" font-size="10.5">Same-day cash, no wait</text>
    <rect x="264" y="234" width="232" height="26" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-opacity="0.55"/><circle cx="280" cy="247" r="3" fill="hsl(var(--primary))"/><text x="290" y="251" fill="hsl(var(--foreground))" font-size="10.5">Doorstep milk pickup</text>
  </g>
  <!-- DRIVERS C -->
  <g>
    <rect x="514" y="174" width="232" height="26" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/><circle cx="530" cy="187" r="3" fill="hsl(var(--primary))"/><text x="540" y="191" fill="hsl(var(--foreground))" font-size="10.5">Co-op equity / patronage payout</text>
    <rect x="514" y="204" width="232" height="26" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/><circle cx="530" cy="217" r="3" fill="hsl(var(--primary))"/><text x="540" y="221" fill="hsl(var(--foreground))" font-size="10.5">Village social / loyalty ties</text>
    <rect x="514" y="234" width="232" height="26" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/><circle cx="530" cy="247" r="3" fill="hsl(var(--primary))"/><text x="540" y="251" fill="hsl(var(--foreground))" font-size="10.5">Distance to collection centre</text>
  </g>

  <!-- HYPOTHESIS strip -->
  <rect x="14" y="278" width="732" height="46" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4" stroke-dasharray="5 4"/>
  <text x="28" y="298" fill="hsl(var(--primary))" font-size="10" font-weight="700" letter-spacing="0.06em">HYPOTHESIS (state it, then test)</text>
  <text x="28" y="315" fill="hsl(var(--foreground))" font-size="11">Rivals win on visible cash — ~8% more, same day. Our feed/vet/insurance is worth more, but the farmer can’t see it.</text>

  <!-- SO WHAT gate -->
  <rect x="150" y="338" width="460" height="50" rx="12" fill="url(#ng)" filter="url(#rs)"/>
  <text x="380" y="360" text-anchor="middle" fill="#ffffff" font-size="12.5" font-weight="700">So what → make the service value visible + match cash velocity</text>
  <text x="380" y="378" text-anchor="middle" fill="#b9c4d6" font-size="10.5">pilot on the worst-hit routes, then scale — don’t blanket-raise price</text>

  <!-- HOW TO USE THIS -->
  <rect x="14" y="404" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="425" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="442" fill="hsl(var(--foreground))" font-size="11.5">Built from the farmer’s decision, not a stock framework: three MECE buckets, then drill the one that swings the answer.</text>
  <text x="28" y="458" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: a retention case isn’t a profitability case — structuring from our P&amp;L would miss the real driver.</text>
</svg>`,
      caption: "A custom issue tree built from the farmer's decision, not the company's P&L.",
      maxWidth: 760,
      ariaLabel: "A worked issue tree for Anandam Dairy: the root question, three MECE buckets from the farmer's decision, a drilled rivals branch, a hypothesis, and a so-what recommendation.",
    },
    {
      type: "prose",
      md: "Notice what the structure does *not* do: it does not start from Anandam's P&L. It starts from the only decision that matters — the farmer's. Why would a farmer stay or leave? Because of what we give them, what a rival offers instead, and how hard it is to switch. Three buckets, mutually exclusive and exhaustive from the farmer's point of view. Then you drill the one that is actually pulling them away, and you commit to a hypothesis before you drown in data.",
    },
    {
      type: "dialogue",
      title: "Anandam Dairy, live",
      turns: [
        { speaker: "interviewer", md: "Anandam Dairy is a ₹1,200 crore cooperative in Gujarat. Over the last year, about 12% of its 80,000 farmer-suppliers have started selling to private buyers instead. The board wants to know why, and what to do about it. How would you approach this?" },
        { speaker: "candidate", note: "Clarifies the objective before structuring — move 1.", md: "Before I structure, let me make sure I have the goal right. We are trying to stop — ideally reverse — farmers leaving for private buyers, and protect Anandam's milk volumes. Is that the objective, or are we also worried about the price we pay them eating into margin?" },
        { speaker: "interviewer", md: "Stopping the defection is the priority. Treat margin as a constraint, not the goal." },
        { speaker: "candidate", note: "Picks the lens — and explicitly rejects the profitability tree.", md: "Then I will not treat this as a profitability problem, because the decision being made is not ours — it is the farmer's. So I will structure it from the farmer's choice. A farmer stays or leaves based on three things: what we give them, what a rival offers instead, and the friction of switching. Those three are mutually exclusive and, from the farmer's point of view, cover the whole decision. May I take a moment to lay it out?" },
        { speaker: "interviewer", md: "Go ahead." },
        { speaker: "candidate", note: "Draws level 1, pressure-tests, then drills the branch that matters — moves 3 to 5.", md: "Bucket one, what we give: our procurement price per litre, how fast we pay, and the services bundled in — subsidised feed, veterinary visits, cattle insurance. Bucket two, what rivals offer: I would expect a higher spot price, faster cash, perhaps doorstep pickup. Bucket three, switching friction: the farmer's equity in the co-op, social and loyalty ties in the village, distance to our collection centre. The buckets do not overlap and nothing is missing. The branch most likely driving the defection is bucket two, so I would open that one first." },
        { speaker: "candidate", note: "Leads with a hypothesis — move 6.", md: "My hypothesis: rivals are winning on *visible* cash — paying maybe eight per cent more, in hand the same day — while our real edge, the feed and vet care and insurance, is worth more to the farmer over a year but is invisible at the moment of sale. If that is true, we are losing on perception, not on value. I would test it by comparing total annual farmer economics, ours versus a private buyer, and by asking defected farmers what actually tipped them." },
        { speaker: "interviewer", md: "Suppose your hypothesis holds. What do you recommend?" },
        { speaker: "candidate", md: "Two moves, piloted on the routes losing the most farmers before any blanket change. First, make the invisible visible: put the annual rupee value of feed, vet care and insurance on every payment slip, so the farmer sees the full deal and not just the per-litre price. Second, close the cash-velocity gap with same-day or next-day payment, since that is the lever rivals are actually pulling. I would avoid simply matching their price across the board — it hits the margin constraint and rewards the wrong behaviour." },
        { speaker: "narrator", md: "The candidate scored the moment they refused the profitability tree and built the structure from the farmer's decision instead. The arithmetic came later and barely mattered — the marks were won in the choice of lens." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "The rest of this section is just worked structures",
      md: "Once you can build structures, the other pages read differently. **Profitability**, **Market entry**, **Growth**, **Pricing** and the **M&A** cluster are not separate things to memorise — they are worked structures you can now take apart, see the lens inside, and rebuild for any variant an interviewer throws at you.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Restate the real question in one line before you split anything — solving the wrong problem cleanly still loses the case.",
        "Make every level MECE: no overlaps, no gaps, and no buckets that are clean but not worth analysing.",
        "Carry five lenses instead of a stack of frameworks — equation, process, segmentation, conceptual buckets, and stakeholder.",
        "Choose your structure deliberately and defend the choice in a sentence; there is no single correct tree.",
        "Drill only the branch that swings the answer, and lead with a hypothesis so the structure has direction.",
        "When a case has no obvious framework, build one from the decision being made — that is where the marks are."
      ],
    }
  ],
};

export default structuringFundamentals;
