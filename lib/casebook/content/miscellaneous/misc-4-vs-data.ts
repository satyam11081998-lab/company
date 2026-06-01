import type { Page } from "../../types";

/**
 * Miscellaneous Frameworks - The 4 V's of Data
 * Light reference card (Section G). One inline SVG hero to the locked v2 grammar (s9.14).
 */
export const fourv: Page = {
  slug: "miscellaneous/4-vs-data",
  title: "The 4 V's of Data",
  titleEmphasize: "4 V's",
  subtitle: "Size up a data problem - and remember veracity decides the rest.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 5,
    tags: ["4vs", "data", "big data", "analytics", "miscellaneous"],
    caseType: "data analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "is it worth acting on",
      md: "Faced with a data or analytics problem, the 4 V's — volume, velocity, variety, veracity — give you a quick way to size it up and ask the question that matters: **is it worth acting on**? Three of the V's describe the data; the fourth decides whether the other three mean anything.",
    },
    {
      type: "heading",
      level: 2,
      text: "The four V's",
      emphasize: "three describe, one decides",
    },
    {
      type: "prose",
      md: "**Volume** — how much data is being generated (enough to matter, or too much to handle)? **Velocity** — how fast does it arrive and need processing (real-time, or overnight batch)? **Variety** — how many forms and sources (neat tables, or a mix of text, images, logs)? **Veracity** — how accurate and trustworthy is it? Vast, fast, varied data is worthless if it can't be trusted.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">THE 4 V's OF DATA - IS THIS DATA WORTH ACTING ON?</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">Four lenses for sizing up a data problem - and a reminder that the last V decides whether the other three matter.</text>

  <!-- 4 rows -->
  <rect x="14" y="58" width="732" height="50" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
  <rect x="14" y="58" width="150" height="50" rx="9" fill="url(#ng)"/>
  <text x="89" y="80" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">Volume</text>
  <text x="89" y="96" text-anchor="middle" fill="#b9c4d6" font-size="8.5">how much?</text>
  <text x="180" y="80" fill="hsl(var(--foreground))" font-size="10.5">The scale or size of the data being generated -</text>
  <text x="180" y="96" fill="hsl(var(--muted-foreground))" font-size="9.5">enough to be meaningful, or too much to store and process?</text>

  <rect x="14" y="116" width="732" height="50" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
  <rect x="14" y="116" width="150" height="50" rx="9" fill="url(#ng)"/>
  <text x="89" y="138" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">Velocity</text>
  <text x="89" y="154" text-anchor="middle" fill="#b9c4d6" font-size="8.5">how fast?</text>
  <text x="180" y="138" fill="hsl(var(--foreground))" font-size="10.5">The speed at which it arrives and must be processed -</text>
  <text x="180" y="154" fill="hsl(var(--muted-foreground))" font-size="9.5">real-time streaming, or batch you can handle overnight?</text>

  <rect x="14" y="174" width="732" height="50" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
  <rect x="14" y="174" width="150" height="50" rx="9" fill="url(#ng)"/>
  <text x="89" y="196" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">Variety</text>
  <text x="89" y="212" text-anchor="middle" fill="#b9c4d6" font-size="8.5">how many forms?</text>
  <text x="180" y="196" fill="hsl(var(--foreground))" font-size="10.5">The range of types and sources -</text>
  <text x="180" y="212" fill="hsl(var(--muted-foreground))" font-size="9.5">neat tables, or a mix of text, images, logs and feeds?</text>

  <!-- Veracity highlighted -->
  <rect x="14" y="232" width="732" height="50" rx="9" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.8"/>
  <rect x="14" y="232" width="150" height="50" rx="9" fill="hsl(var(--primary))"/>
  <text x="89" y="254" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">Veracity</text>
  <text x="89" y="270" text-anchor="middle" fill="#ffffff" font-size="8.5">how trustworthy?</text>
  <text x="180" y="254" fill="hsl(var(--foreground))" font-size="10.5">The accuracy and reliability of the data -</text>
  <text x="180" y="270" fill="hsl(var(--muted-foreground))" font-size="9.5">the one that decides whether the other three are worth anything.</text>

  <!-- HOW TO USE -->
  <rect x="14" y="292" width="732" height="56" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="312" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="329" fill="hsl(var(--foreground))" font-size="11.5">Size up a data problem on all four V's - but check veracity first; vast, fast, varied data is worthless if it can't be trusted.</text>
  <text x="28" y="344" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: a niche lens for data-and-analytics cases, not a general business framework.</text>
</svg>`,
      caption: "Four lenses on a data problem; veracity gates the other three.",
      maxWidth: 760,
      ariaLabel: "The 4 V's of data: volume, velocity, variety, and veracity, with veracity highlighted as the one that decides whether the others matter.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "check veracity first",
    },
    {
      type: "prose",
      md: "Size up the data problem across all four V's — but check veracity first. There's no point engineering for huge volume and real-time velocity if the underlying data is wrong; you'll just make bad decisions faster. It's a niche lens for data-and-analytics cases, not a general business framework.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Optimising the wrong three V's",
      md: "Teams love to build for scale and speed — volume and velocity — because they're tangible engineering goals. But if veracity is poor, that investment amplifies bad data. Confirm the data can be trusted before scaling how much and how fast you process it.",
    },
    {
      type: "dialogue",
      title: "Worth acting on?",
      turns: [
        { speaker: "interviewer", md: "A retailer wants to build a real-time recommendation engine off its customer data and is excited about the volume it has. How would you frame the data question?" },
        { speaker: "candidate", note: "Puts veracity ahead of volume.", md: "I'd size it on the 4 V's but lead with veracity. Volume — they have plenty, good. Velocity — real-time is ambitious but doable. Variety — transactions, browsing, maybe support logs, manageable. But veracity is the question I'd press: how clean is the customer data — duplicate accounts, stale profiles, mis-tagged purchases? If veracity is poor, a real-time engine just recommends confidently off bad data, which erodes trust faster than no engine at all. So before investing in the volume-and-velocity build, I'd fix data quality. Veracity decides whether the rest is worth it." },
        { speaker: "narrator", md: "The candidate reordered the excitement — putting trustworthiness ahead of scale and speed — which is exactly the discipline the fourth V enforces." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "It's a specialised lens for data and analytics cases — a structuring aid that sits alongside the broader tools in **Structuring Fundamentals** when the subject matter is data.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Size up a data problem across volume, velocity, variety, and veracity.",
        "Treat veracity as the gate — untrustworthy data makes the other three worthless.",
        "Avoid over-investing in scale and speed before confirming data quality.",
        "Keep it as a niche lens for data-and-analytics cases."
      ],
    }
  ],
};

export default fourv;
