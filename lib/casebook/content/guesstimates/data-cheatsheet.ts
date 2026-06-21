import type { Page } from "../../types";

/**
 * Guesstimate Data Cheatsheet — the anchor numbers every market-sizing / guesstimate
 * leans on, as a dense visual infographic. Macro + micro India figures, planning-grade.
 *
 * Sourcing note (be adversarial): figures are mid-2026 PLANNING ANCHORS, cross-checked
 * across UN/Worldometer, IMF WEO Oct-2025, NPCI, MoRTH/VAHAN, IAMAI-Kantar. India's last
 * full census was 2011 (2027 census pending), so household/urban splits are estimates —
 * cite as "≈" and round hard. Use the number you can DEFEND, not the precise one.
 */
export const dataCheatsheet: Page = {
  slug: "guesstimates/data-cheatsheet",
  title: "Guesstimate Data Cheatsheet",
  titleEmphasize: "Data",
  subtitle: "The macro + micro anchors to size almost anything — memorise the spine, round hard, always sanity-check.",
  kind: "framework",
  meta: {
    readingTimeMin: 9,
    tags: ["guesstimate", "market-sizing", "data", "india", "reference"],
    caseType: "guesstimate",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "round everything else",
      md: "Every guesstimate is a chain of multiplications hanging off one or two **anchor numbers** — India's population, its households, its GDP. Get the anchor right and round everything else; an interviewer forgives ₹-rounding, never a 10× anchor error. This is the spine: macro on top, the segments and per-capita rates below. Memorise the bold ones.",
    },

    { type: "heading", level: 2, text: "The anchor numbers", emphasize: "anchor" },
    {
      type: "svg",
      maxWidth: 760,
      ariaLabel: "Grid of six anchor statistics for India mid-2026: population 1.46 billion, households about 300 million, urban share about 35 percent, workforce about 600 million, GDP 4.1 trillion dollars, GDP per capita about 2,800 dollars.",
      caption: "Six numbers behind 90% of guesstimates. Everything else is a ratio off these.",
      svg: `<svg viewBox="0 0 760 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="dcAnchor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g>
    <rect x="8" y="8" width="240" height="110" rx="11" fill="url(#dcAnchor)"/>
    <text x="22" y="34" font-size="10" font-weight="700" fill="#b9c4d6" letter-spacing="0.06em">POPULATION</text>
    <text x="22" y="72" font-size="30" font-weight="800" fill="#ffffff">1.46<tspan font-size="14" font-weight="700"> bn</tspan></text>
    <text x="22" y="96" font-size="9.5" fill="#b9c4d6">≈146 crore · ~1/5 of humanity</text>
    <rect x="260" y="8" width="240" height="110" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.2"/>
    <text x="274" y="34" font-size="10" font-weight="700" fill="hsl(var(--muted-foreground))" letter-spacing="0.06em">HOUSEHOLDS</text>
    <text x="274" y="72" font-size="30" font-weight="800" fill="hsl(var(--primary))">~300<tspan font-size="14" font-weight="700" fill="hsl(var(--foreground))"> mn</tspan></text>
    <text x="274" y="96" font-size="9.5" fill="hsl(var(--muted-foreground))">avg size ≈ 4.8 (range 250–310 mn)</text>
    <rect x="512" y="8" width="240" height="110" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.2"/>
    <text x="526" y="34" font-size="10" font-weight="700" fill="hsl(var(--muted-foreground))" letter-spacing="0.06em">URBAN SHARE</text>
    <text x="526" y="72" font-size="30" font-weight="800" fill="hsl(var(--foreground))">~35<tspan font-size="14" font-weight="700"> %</tspan></text>
    <text x="526" y="96" font-size="9.5" fill="hsl(var(--muted-foreground))">~1/3 urban · 65% rural</text>
    <rect x="8" y="130" width="240" height="110" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.2"/>
    <text x="22" y="156" font-size="10" font-weight="700" fill="hsl(var(--muted-foreground))" letter-spacing="0.06em">WORKFORCE (15–64)</text>
    <text x="22" y="194" font-size="30" font-weight="800" fill="hsl(var(--foreground))">~990<tspan font-size="14" font-weight="700"> mn</tspan></text>
    <text x="22" y="218" font-size="9.5" fill="hsl(var(--muted-foreground))">~68% of people; ~430 mn employed</text>
    <rect x="260" y="130" width="240" height="110" rx="11" fill="url(#dcAnchor)"/>
    <text x="274" y="156" font-size="10" font-weight="700" fill="#b9c4d6" letter-spacing="0.06em">GDP (NOMINAL)</text>
    <text x="274" y="194" font-size="30" font-weight="800" fill="#ffffff">$4.1<tspan font-size="14" font-weight="700"> tn</tspan></text>
    <text x="274" y="218" font-size="9.5" fill="#b9c4d6">≈ ₹340 lakh crore</text>
    <rect x="512" y="130" width="240" height="110" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.2"/>
    <text x="526" y="156" font-size="10" font-weight="700" fill="hsl(var(--muted-foreground))" letter-spacing="0.06em">GDP PER CAPITA</text>
    <text x="526" y="194" font-size="30" font-weight="800" fill="hsl(var(--primary))">~$2.8<tspan font-size="14" font-weight="700" fill="hsl(var(--foreground))">k</tspan></text>
    <text x="526" y="218" font-size="9.5" fill="hsl(var(--muted-foreground))">≈ ₹2.3 lakh/yr · ₹19k/mo</text>
  </g>
</svg>`,
    },

    { type: "heading", level: 2, text: "Who they are: people structure", emphasize: "people" },
    {
      type: "svg",
      maxWidth: 760,
      ariaLabel: "India age structure: children 0-14 about 25 percent, working age 15-64 about 68 percent, seniors 65 plus about 7 percent; median age 29; about 24 million births and 10 million deaths a year.",
      caption: "Median age 29 — a young country. Cohort flows: ~24 mn born, ~10 mn die each year.",
      svg: `<svg viewBox="0 0 760 220" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <text x="8" y="22" font-size="11" font-weight="700" fill="hsl(var(--foreground))">AGE SPLIT (share of 1.46 bn)</text>
  <g font-size="9.5">
    <text x="8" y="52" fill="hsl(var(--muted-foreground))">0–14 yrs</text>
    <rect x="120" y="42" width="135" height="16" rx="3" fill="hsl(var(--primary))" opacity="0.55"/>
    <text x="262" y="55" font-size="10" font-weight="700" fill="hsl(var(--foreground))">~25% · ~365 mn</text>
    <text x="8" y="82" fill="hsl(var(--muted-foreground))">15–64 yrs</text>
    <rect x="120" y="72" width="368" height="16" rx="3" fill="hsl(var(--primary))"/>
    <text x="495" y="85" font-size="10" font-weight="700" fill="hsl(var(--foreground))">~68% · ~990 mn</text>
    <text x="8" y="112" fill="hsl(var(--muted-foreground))">65+ yrs</text>
    <rect x="120" y="102" width="38" height="16" rx="3" fill="hsl(var(--muted-foreground))"/>
    <text x="165" y="115" font-size="10" font-weight="700" fill="hsl(var(--foreground))">~7% · ~105 mn</text>
  </g>
  <line x1="8" y1="134" x2="752" y2="134" stroke="hsl(var(--border))" stroke-width="1"/>
  <g>
    <rect x="8" y="146" width="180" height="62" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="20" y="168" font-size="9.5" font-weight="700" fill="hsl(var(--muted-foreground))">MEDIAN AGE</text>
    <text x="20" y="196" font-size="22" font-weight="800" fill="hsl(var(--primary))">29 yrs</text>
    <rect x="200" y="146" width="180" height="62" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <text x="212" y="168" font-size="9.5" font-weight="700" fill="hsl(var(--muted-foreground))">BIRTHS / YR</text>
    <text x="212" y="196" font-size="22" font-weight="800" fill="hsl(var(--foreground))">~24 mn</text>
    <rect x="392" y="146" width="180" height="62" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <text x="404" y="168" font-size="9.5" font-weight="700" fill="hsl(var(--muted-foreground))">DEATHS / YR</text>
    <text x="404" y="196" font-size="22" font-weight="800" fill="hsl(var(--foreground))">~10 mn</text>
    <rect x="584" y="146" width="168" height="62" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <text x="596" y="168" font-size="9.5" font-weight="700" fill="hsl(var(--muted-foreground))">LIFE EXPECTANCY</text>
    <text x="596" y="196" font-size="22" font-weight="800" fill="hsl(var(--foreground))">~70 yrs</text>
  </g>
</svg>`,
    },

    { type: "heading", level: 2, text: "What they earn: the income pyramid", emphasize: "income" },
    {
      type: "svg",
      maxWidth: 760,
      ariaLabel: "India household income pyramid: a tiny rich top, a small middle class, a large aspirer band, and a broad base of low-income households.",
      caption: "Most guesstimates die by assuming everyone is middle-class. Segment by this pyramid.",
      svg: `<svg viewBox="0 0 760 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <g text-anchor="middle">
    <polygon points="350,10 410,10 380,54 " fill="hsl(var(--primary))"/>
    <polygon points="320,56 440,56 410,108 350,108" fill="hsl(var(--primary))" opacity="0.78"/>
    <polygon points="300,110 460,110 440,162 320,162" fill="hsl(var(--primary))" opacity="0.55"/>
    <polygon points="250,164 510,164 460,216 300,216" fill="hsl(var(--muted-foreground))" opacity="0.85"/>
  </g>
  <g font-size="9.5" fill="hsl(var(--foreground))">
    <text x="470" y="30" font-weight="700">Rich · ~3% of HH</text>
    <text x="470" y="44" fill="hsl(var(--muted-foreground))">&gt; ₹1 lakh/mo</text>
    <text x="470" y="86" font-weight="700">Middle class · ~12%</text>
    <text x="470" y="100" fill="hsl(var(--muted-foreground))">₹40k–1 lakh/mo</text>
    <text x="470" y="140" font-weight="700">Aspirers · ~30%</text>
    <text x="470" y="154" fill="hsl(var(--muted-foreground))">₹15k–40k/mo</text>
    <text x="248" y="240" font-weight="700" text-anchor="start">Strugglers / base · ~55% of households</text>
    <text x="248" y="254" fill="hsl(var(--muted-foreground))" text-anchor="start">&lt; ₹15k/mo — rural + urban poor</text>
  </g>
  <text x="8" y="22" font-size="11" font-weight="700" fill="hsl(var(--foreground))">HOUSEHOLD INCOME BANDS</text>
  <text x="8" y="208" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">Bands are planning-grade; the</text>
  <text x="8" y="220" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">consuming class (top ~15%) drives</text>
  <text x="8" y="232" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">most premium-product demand.</text>
</svg>`,
    },

    { type: "heading", level: 2, text: "The economy + digital + mobility", emphasize: "economy" },
    {
      type: "svg",
      maxWidth: 760,
      ariaLabel: "GDP split services 55 percent, industry 25 percent, agriculture 18 percent; digital: 900 million internet users, about 800 million smartphones, about 700 million UPI transactions a day; mobility: about 300 million two-wheelers and about 55 million cars.",
      caption: "Services-led economy; a billion-scale digital base; two-wheelers outnumber cars ~6:1.",
      svg: `<svg viewBox="0 0 760 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <text x="8" y="20" font-size="11" font-weight="700" fill="hsl(var(--foreground))">GDP BY SECTOR</text>
  <rect x="8" y="30" width="412" height="22" rx="4" fill="hsl(var(--muted))"/>
  <rect x="8" y="30" width="227" height="22" rx="4" fill="hsl(var(--primary))"/>
  <rect x="235" y="30" width="103" height="22" fill="hsl(var(--primary))" opacity="0.6"/>
  <rect x="338" y="30" width="82" height="22" rx="4" fill="hsl(var(--muted-foreground))" opacity="0.7"/>
  <text x="14" y="45" font-size="9.5" font-weight="700" fill="#ffffff">Services 55%</text>
  <text x="241" y="45" font-size="9" font-weight="700" fill="#ffffff">Industry 25%</text>
  <text x="344" y="45" font-size="9" font-weight="700" fill="#ffffff">Agri 18%</text>
  <text x="8" y="74" font-size="8.5" fill="hsl(var(--muted-foreground))">…but agriculture still employs ~45% of the workforce — output share ≠ jobs share.</text>

  <text x="8" y="104" font-size="11" font-weight="700" fill="hsl(var(--foreground))">DIGITAL INDIA</text>
  <g>
    <rect x="8" y="114" width="170" height="50" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <text x="20" y="134" font-size="9" font-weight="700" fill="hsl(var(--muted-foreground))">INTERNET USERS</text>
    <text x="20" y="156" font-size="18" font-weight="800" fill="hsl(var(--primary))">~900 mn</text>
    <rect x="186" y="114" width="170" height="50" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <text x="198" y="134" font-size="9" font-weight="700" fill="hsl(var(--muted-foreground))">SMARTPHONES</text>
    <text x="198" y="156" font-size="18" font-weight="800" fill="hsl(var(--foreground))">~750–900 mn</text>
    <rect x="364" y="114" width="170" height="50" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <text x="376" y="134" font-size="9" font-weight="700" fill="hsl(var(--muted-foreground))">UPI TXNS / DAY</text>
    <text x="376" y="156" font-size="18" font-weight="800" fill="hsl(var(--primary))">~700 mn</text>
  </g>

  <text x="8" y="194" font-size="11" font-weight="700" fill="hsl(var(--foreground))">ON THE ROAD</text>
  <g>
    <rect x="8" y="204" width="240" height="40" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.2"/>
    <text x="20" y="221" font-size="9" font-weight="700" fill="hsl(var(--muted-foreground))">TWO-WHEELERS</text>
    <text x="20" y="238" font-size="15" font-weight="800" fill="hsl(var(--foreground))">~300 mn <tspan font-size="9" font-weight="600" fill="hsl(var(--muted-foreground))">(~190 / 1,000 people)</tspan></text>
    <rect x="256" y="204" width="240" height="40" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <text x="268" y="221" font-size="9" font-weight="700" fill="hsl(var(--muted-foreground))">CARS</text>
    <text x="268" y="238" font-size="15" font-weight="800" fill="hsl(var(--foreground))">~55 mn <tspan font-size="9" font-weight="600" fill="hsl(var(--muted-foreground))">(~35 / 1,000 people)</tspan></text>
    <rect x="504" y="204" width="248" height="40" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
    <text x="516" y="221" font-size="9" font-weight="700" fill="hsl(var(--muted-foreground))">ALL VEHICLES</text>
    <text x="516" y="238" font-size="15" font-weight="800" fill="hsl(var(--foreground))">~350 mn registered</text>
  </g>
</svg>`,
    },

    {
      type: "callout",
      variant: "insight",
      title: "Going deeper → use the Industry Primers",
      md: "The digital, mobility and sector figures above are quick **national anchors** for fast sizing — not sector depth. When a guesstimate is really about one industry, open its **Industry Primer** for ARPU, GMV, penetration, capacity and sales-mix numbers instead of reinventing them here: [Telecom](/learn/casebook/industry-primers/telecom), [Payments](/learn/casebook/industry-primers/payments), [E-Commerce](/learn/casebook/industry-primers/ecommerce), [Food Delivery](/learn/casebook/industry-primers/food-delivery), [Automobile](/learn/casebook/industry-primers/automobile), [Electric Vehicles](/learn/casebook/industry-primers/ev), [FMCG](/learn/casebook/industry-primers/fmcg), [Retail](/learn/casebook/industry-primers/retail), [Banking](/learn/casebook/industry-primers/banking), [Healthcare](/learn/casebook/industry-primers/healthcare), [Power](/learn/casebook/industry-primers/power), [Oil & Gas](/learn/casebook/industry-primers/oil-gas) — plus ~15 more under **Industry Primers** in the sidebar.",
    },
    { type: "heading", level: 2, text: "Conversions & time constants", emphasize: "Conversions" },
    {
      type: "table",
      caption: "The arithmetic scaffolding. Mis-converting lakh/crore is the #1 silent guesstimate error.",
      firstColHeader: true,
      headers: ["Quantity", "Value", "Handy form"],
      rows: [
        ["1 lakh", "100,000 = 10⁵", "0.1 million"],
        ["1 crore", "10,000,000 = 10⁷", "10 million = 100 lakh"],
        ["100 crore", "1,000,000,000", "1 billion"],
        ["₹1 lakh crore", "₹1 trillion", "≈ $12 billion"],
        ["Minutes / day", "1,440", "≈ 1,000 waking minutes"],
        ["Hours / year", "8,760", "≈ 8,000 (round)"],
        ["Working days / yr", "~250 (5-day) · ~300 (6-day)", "retail/footfall: ~300–360"],
        ["Weeks / year", "52", "~4.3 weeks/month"],
      ],
    },

    { type: "heading", level: 2, text: "Per-capita consumption rates", emphasize: "Per-capita" },
    {
      type: "table",
      caption: "Multiply by the right population (national vs urban vs a city) — never the whole 1.46 bn blindly.",
      firstColHeader: true,
      headers: ["Item", "Rate (planning anchor)", "Use it for"],
      rows: [
        ["Electricity", "~1,300 kWh / person / yr", "power demand, grid sizing"],
        ["Water (urban domestic)", "~135–150 L / person / day", "tankers, supply, RO demand"],
        ["Municipal solid waste (urban)", "~0.45 kg / person / day", "garbage trucks, landfills"],
        ["Petrol+diesel", "~100 kg fuel / person / yr (national avg)", "fuel demand, petrol pumps"],
        ["Cereal/food grain", "~180 kg / person / yr", "FMCG staples, PDS"],
        ["Milk", "~440 g / person / day", "dairy, cold chain"],
        ["Mobile data", "~25–30 GB / user / month", "telecom, towers"],
      ],
    },

    { type: "heading", level: 2, text: "Default planning assumptions", emphasize: "Default" },
    {
      type: "table",
      caption: "When you have no data, state one of these out loud, then proceed. Defensible beats precise.",
      firstColHeader: true,
      headers: ["Assumption", "Default", "Why / nuance"],
      rows: [
        ["Avg household size", "~4.8 (urban ~4.2, rural ~5.2)", "people ÷ this = households"],
        ["Adults (15+) share", "~70% of population", "earners, voters, phone owners"],
        ["Literacy rate", "~78%", "any text/app-dependent product"],
        ["Smartphone penetration", "~55–65% of people", "rising fast; urban much higher"],
        ["Replacement cycle — phone", "~3 years", "stock ÷ cycle = annual sales"],
        ["Replacement cycle — car", "~10–12 years", "stock-and-flow sizing"],
        ["Replacement cycle — TV/fridge", "~8–10 years", "consumer durables"],
        ["Metro size (tier-1)", "Delhi-NCR ~32 mn · Mumbai ~21 mn · Kolkata/Bengaluru ~13 mn", "city-level builds"],
        ["Eating-out frequency (urban)", "~4–6 paid meals / week", "QSR, delivery, restaurants"],
      ],
    },

    {
      type: "callout",
      variant: "tip",
      title: "How to use this in 30 seconds",
      md: "1) **Pick the anchor** closest to your question (people, households, workforce, GDP). 2) **Funnel** with one ratio at a time from the pyramid/rates above, saying each assumption aloud. 3) **Round hard** — work in crores and powers of ten. 4) **Sanity-check** the answer against a *different* anchor (e.g., a per-capita-spend cross-check on a population-built number). If the two agree within ~2×, you're safe.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Read the data honestly (adversarial note)",
      md: "These are **mid-2026 planning anchors**, deliberately rounded — cite them as \"≈\". Three to keep straight: **(a)** household *count* varies by source (~250 mn registered vs ~300 mn implied at size 4.8) — state which you use; **(b)** smartphone figures range widely (~750 mn primary users vs >1 bn devices) — pick a lane; **(c)** sector GDP share (agri ~18%) ≠ employment share (agri ~45%). For anything high-stakes, re-verify against the primary source (MoSPI, RBI, NPCI, IMF) — India's 2027 census will reset several of these.",
    },
    {
      type: "keyTakeaways",
      title: "Memorise this spine",
      items: [
        "**People ~1.46 bn · Households ~300 mn · Workforce ~990 mn** — almost everything funnels from one of these.",
        "**~1/3 urban, 2/3 rural; median age 29** — never assume an urban, middle-class default.",
        "**GDP ~$4.1 tn (~₹340 lakh cr) · per-capita ~₹19k/month** — the size and spend anchors.",
        "**Digital: ~900 mn online, ~700 mn UPI txns/day; Mobility: ~300 mn two-wheelers vs ~55 mn cars.**",
        "Round to powers of ten, segment with the income pyramid, and always cross-check against a second anchor.",
      ],
    },
  ],
};
