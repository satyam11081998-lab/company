import type { Page } from "../../types";

/**
 * Miscellaneous Frameworks - Sources of Sustainable Advantage
 * Light reference card (Section G). One inline SVG hero to the locked v2 grammar (s9.14).
 */
export const moats: Page = {
  slug: "miscellaneous/sustainable-advantage",
  title: "Sources of Sustainable Advantage",
  titleEmphasize: "Sustainable Advantage",
  subtitle: "A checklist of the durable moats that protect a business.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 6,
    tags: ["moat", "competitive advantage", "defensibility", "strategy", "miscellaneous"],
    caseType: "competitive analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "stops a rival",
      md: "‘Sustainable competitive advantage' is less a framework than a handy checklist of the things that actually keep competitors out. The question behind all of them is the same: what genuinely **stops a rival** — even a well-funded one — from copying you? These are the eight moats.",
    },
    {
      type: "heading",
      level: 2,
      text: "The eight moats",
      emphasize: "durable defences",
    },
    {
      type: "prose",
      md: "**Network effects** (each user adds value for the next), **scale economies** (lower unit cost as you grow), **switching costs** (painful to leave), **brand loyalty** (trust that resists cheaper rivals), **intellectual property** (patents and secrets), **innovation** (staying ahead faster than rivals catch up), **locked-in supply** (exclusive access to a scarce input), and **distribution control** (owning the channel or prime locations).",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 412" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">SOURCES OF SUSTAINABLE ADVANTAGE - THE EIGHT MOATS</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">Not a framework so much as a checklist of durable moats. The more a firm holds, and the deeper, the stronger its defence.</text>

  <!-- 8 moat cards in a 4x2 grid -->
  <!-- row 1 -->
  <rect x="14" y="58" width="178" height="74" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="28" y="80" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Network effects</text>
  <text x="28" y="98" fill="hsl(var(--muted-foreground))" font-size="9">each user makes it more</text>
  <text x="28" y="111" fill="hsl(var(--muted-foreground))" font-size="9">valuable for the next</text>
  <text x="28" y="126" fill="hsl(var(--primary))" font-size="8" font-style="italic">e.g. a marketplace</text>

  <rect x="200" y="58" width="178" height="74" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="214" y="80" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Scale economies</text>
  <text x="214" y="98" fill="hsl(var(--muted-foreground))" font-size="9">lower unit cost as you</text>
  <text x="214" y="111" fill="hsl(var(--muted-foreground))" font-size="9">grow; an entry barrier</text>
  <text x="214" y="126" fill="hsl(var(--primary))" font-size="8" font-style="italic">e.g. a large retailer</text>

  <rect x="386" y="58" width="178" height="74" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="400" y="80" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Switching cost</text>
  <text x="400" y="98" fill="hsl(var(--muted-foreground))" font-size="9">painful to leave - data,</text>
  <text x="400" y="111" fill="hsl(var(--muted-foreground))" font-size="9">integration, habit</text>
  <text x="400" y="126" fill="hsl(var(--primary))" font-size="8" font-style="italic">e.g. core banking software</text>

  <rect x="572" y="58" width="174" height="74" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="586" y="80" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Brand loyalty</text>
  <text x="586" y="98" fill="hsl(var(--muted-foreground))" font-size="9">trust and preference</text>
  <text x="586" y="111" fill="hsl(var(--muted-foreground))" font-size="9">that resists cheaper rivals</text>
  <text x="586" y="126" fill="hsl(var(--primary))" font-size="8" font-style="italic">e.g. a premium FMCG name</text>

  <!-- row 2 -->
  <rect x="14" y="142" width="178" height="74" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="28" y="164" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Intellectual property</text>
  <text x="28" y="182" fill="hsl(var(--muted-foreground))" font-size="9">patents, copyrights and</text>
  <text x="28" y="195" fill="hsl(var(--muted-foreground))" font-size="9">trade secrets rivals can't use</text>
  <text x="28" y="210" fill="hsl(var(--primary))" font-size="8" font-style="italic">e.g. a drug patent</text>

  <rect x="200" y="142" width="178" height="74" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="214" y="164" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Innovation</text>
  <text x="214" y="182" fill="hsl(var(--muted-foreground))" font-size="9">staying ahead faster than</text>
  <text x="214" y="195" fill="hsl(var(--muted-foreground))" font-size="9">rivals can catch up</text>
  <text x="214" y="210" fill="hsl(var(--primary))" font-size="8" font-style="italic">e.g. a chip designer</text>

  <rect x="386" y="142" width="178" height="74" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="400" y="164" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Locked-in supply</text>
  <text x="400" y="182" fill="hsl(var(--muted-foreground))" font-size="9">exclusive access to a scarce</text>
  <text x="400" y="195" fill="hsl(var(--muted-foreground))" font-size="9">input or resource</text>
  <text x="400" y="210" fill="hsl(var(--primary))" font-size="8" font-style="italic">e.g. a mining lease</text>

  <rect x="572" y="142" width="174" height="74" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="586" y="164" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Distribution control</text>
  <text x="586" y="182" fill="hsl(var(--muted-foreground))" font-size="9">owning the channel or</text>
  <text x="586" y="195" fill="hsl(var(--muted-foreground))" font-size="9">prime locations</text>
  <text x="586" y="210" fill="hsl(var(--primary))" font-size="8" font-style="italic">e.g. a dense dealer network</text>

  <!-- depth bar -->
  <rect x="14" y="226" width="732" height="28" rx="8" fill="url(#ng)"/>
  <text x="380" y="245" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">MORE moats, held DEEPER  =  a wider, more durable competitive defence</text>

  <!-- HOW TO USE -->
  <rect x="14" y="266" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="287" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="304" fill="hsl(var(--foreground))" font-size="11.5">Check a firm against the eight moats: which does it hold, how deep, and how durable? That is the real strength of its position.</text>
  <text x="28" y="320" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: a head start or a hot product isn't a moat. Ask what actually stops a well-funded rival from copying it.</text>
</svg>`,
      caption: "Eight sources of a durable competitive moat.",
      maxWidth: 760,
      ariaLabel: "Eight moats: network effects, scale economies, switching cost, brand loyalty, intellectual property, innovation, locked-in supply, and distribution control.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "how deep, how durable",
    },
    {
      type: "prose",
      md: "Check a firm against the eight: which moats does it actually hold, how deep are they, and how durable? The more moats, and the deeper, the stronger the defence. It's the natural complement to VRIO — the moats name the *sources* of advantage; VRIO tests whether a given one is real.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Mistaking a head start for a moat",
      md: "Being first, or having a hot product right now, is not a moat — a well-funded rival can catch up. A true moat is a structural reason they *can't* easily copy you. Always ask what actually does the stopping.",
    },
    {
      type: "dialogue",
      title: "How wide is the moat?",
      turns: [
        { speaker: "interviewer", md: "A food-delivery app is the market leader and tells investors it has a strong competitive moat. How would you assess that?" },
        { speaker: "candidate", note: "Checks against the moat list.", md: "I'd run them against the moat sources. Network effects: yes — more restaurants attract more diners and vice versa, a genuine two-sided moat. Scale economies: partially — denser delivery lowers cost per order. Switching cost: weak — both diners and restaurants happily multi-home across apps, so loyalty is thin. Brand: moderate. So the moat is real but narrower than claimed — it rests mostly on network effects and density, and is vulnerable precisely where switching costs are low. A well-funded rival buying its way to density is the real threat." },
        { speaker: "narrator", md: "Rather than accept ‘strong moat', the candidate named which moats existed, how deep, and where the defence was thin — which is the honest read investors actually need." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "This checklist sits right beside **VRIO** (which tests any single moat) and informs the threat-of-entrants force in **Porter's Five Forces** — strong moats are exactly what keep new entrants out.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Recall the eight common sources of a durable competitive moat.",
        "Assess which moats a firm holds, how deep, and how durable.",
        "Distinguish a structural moat from a mere head start or hot product.",
        "Combine it with VRIO to test whether a claimed advantage is real.",
        "Use it to read the threat of new entrants in an industry."
      ],
    }
  ],
};

export default moats;
