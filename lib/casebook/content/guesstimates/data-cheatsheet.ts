import type { Page } from "../../types";
import { DATA_ATLAS } from "./atlas-data";

/**
 * Guesstimate Data Cheatsheet — rebuilt September 2026 as a searchable Data Atlas.
 *
 * What changed, and why, so the next editor does not undo it:
 *
 * 1. EVERY NUMBER IS SOURCED AND DATED. The old sheet carried a block of
 *    round figures with a general "cross-checked across UN/IMF/NPCI" note.
 *    Several had drifted (population 1.46 bn, median age 29 with no band,
 *    GDP ₹340 lakh crore, UPI ~700 mn/day, workforce "430 mn employed",
 *    agriculture at 45% of jobs). Each datum now carries asOf + source +
 *    an honest grade, and the September 2026 verification pass corrected
 *    all of the above against MoSPI, TRAI, NPCI, PLFS, HCES, CEA, CPCB,
 *    PPAC, SIAM, MoRTH, UDISE+ and UN WPP.
 *
 * 2. IT IS SEARCHABLE. ~60 numbers is past the point where scrolling works.
 *    The atlas block has a search box (and "/" to focus it) plus jump chips,
 *    so a candidate revising at 11pm reaches "milk" or "UPI" in two seconds.
 *
 * 3. THE AHA IS THE CROSS-CHECK, NOT THE LIST. Anyone can publish a list of
 *    Indian statistics. The thing that wins a room is building the number
 *    twice from unrelated directions and saying whether they agree — so the
 *    sheet ends on a chain section that does exactly that, and individual
 *    numbers carry their own cross-check partner.
 *
 * Content lives in atlas-core.ts + atlas-systems.ts. Keep the authoring rules
 * written at the top of those files.
 */
export const dataCheatsheet: Page = {
  slug: "guesstimates/data-cheatsheet",
  title: "The India Data Atlas",
  titleEmphasize: "Data",
  subtitle:
    "Around sixty anchor numbers for sizing almost anything — each one sourced, dated, and paired with the number that checks it. Search it; don't scroll it.",
  kind: "framework",
  meta: {
    readingTimeMin: 14,
    tags: [
      "guesstimate",
      "market-sizing",
      "data",
      "india",
      "reference",
      "statistics",
      "anchors",
    ],
    caseType: "guesstimate",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "how old it is",
      md: "Every guesstimate is a chain of multiplications hanging off one or two **anchor numbers**. Most candidates memorise a list of them and get caught out by the same three things: the anchor has drifted, they multiplied a per-household rate by the population, or they could not say where the number came from. So this sheet does the opposite of a list. Every figure carries **where it came from and how old it is**, every big one names **what it unlocks** and **what independently checks it** — and there is a search box, because sixty numbers is past the point where scrolling helps.",
    },

    { type: "heading", level: 2, text: "How to use it in thirty seconds", emphasize: "thirty seconds" },
    {
      type: "steps",
      ordered: true,
      items: [
        {
          title: "Pick the anchor, not the answer",
          md: "People, households, workers, or GDP. Say which one out loud and why. Almost every question funnels from one of the six in **Start here**.",
        },
        {
          title: "Cut before you multiply",
          md: "Age, urban or rural, income. An urban rate applied to 1.48 bn people is the single most common way a good structure produces a wrong answer.",
        },
        {
          title: "Round hard, in powers of ten",
          md: "Work in crores and exponents. ₹1 lakh crore is 10¹². Nobody has ever lost a case for rounding; plenty have for a misplaced zero.",
        },
        {
          title: "Close the loop",
          md: "Rebuild the answer from a different anchor and say whether the two agree. If they land within about 2×, say so — that sentence is worth more than the estimate itself.",
        },
      ],
    },

    { type: "heading", level: 2, text: "The atlas", emphasize: "atlas" },
    { type: "dataAtlas", atlas: DATA_ATLAS },

    { type: "heading", level: 2, text: "Practise reaching for the right one", emphasize: "right one" },
    {
      type: "drill",
      title: "Which anchor, and what would you say out loud?",
      instructions:
        "Do not compute anything. For each prompt, name the anchor you would start from, the one cut you would make first, and the assumption you would state aloud. Then check yourself.",
      revealLabel: "Show the reasoning",
      items: [
        {
          prompt: "How many refrigerators are sold in India in a year?",
          answer:
            "**Anchor: households (~320 mn), not people.** Cut to households that can afford one — the urban average household spends about ₹31,000 a month in total, so a fridge is a multi-month decision even there. Then it is a stock-and-flow question: penetrated stock ÷ replacement cycle (~8–10 years) plus first-time buyers. Say the household count and the cycle aloud; those are the two numbers your answer is most sensitive to.",
        },
        {
          prompt: "What is the annual revenue of all petrol pumps in India?",
          answer:
            "**Anchor: fuel consumed, not pumps.** Petrol 42.7 mt and diesel 93.9 mt a year, but only part of diesel goes through retail pumps — bulk buyers, railways and industry are supplied directly. Convert tonnes to litres, price it, then sanity-check per pump against the 1,00,266 outlets. Building it from 'pumps × litres per day' first is the trap: you would be guessing the number you could have looked up.",
        },
        {
          prompt: "How many people in India actually use a smartphone?",
          answer:
            "**Not 1,289 mn.** That is connections. Active connections are 1,194 mn, urban tele-density is 152% because of second SIMs, and feature phones are still in the base. Build it instead from shipments: ~152 mn a year × a 4.5-year replacement cycle ≈ 680 mn. Quote that, name both routes, and explain why you rejected the bigger one.",
        },
        {
          prompt: "Size the market for packaged milk in a tier-1 city.",
          answer:
            "**Anchor: per-capita availability, 471 g a day** — then cut hard. That is national availability including what is consumed on the farm; the packaged, branded share of a city's milk is a fraction of it. Multiply by the city population you have named (say which definition — municipal, agglomeration or region, they differ by up to 2×), then apply a packaged share and state it as an assumption.",
        },
        {
          prompt: "How much municipal waste does a metro generate in a day?",
          answer:
            "**Anchor: 0.35 kg per urban person per day nationally — but metros run 0.5–0.7 kg.** Say that you are using the higher figure and why (income drives waste per head). Cross-check the total against the national 1.70 lakh tonnes a day: a city of 20 mn at 0.6 kg is 12,000 tonnes, about 7% of the country's municipal waste. Mind the denominator: CPCB's 1.70 lakh tonnes is urban-only, so compare against the ~545 mn urban population, not 1.48 bn. 4% of urban India producing 7% of the waste is exactly what 0.6 kg against a 0.35 kg urban average should give you.",
        },
        {
          prompt: "How many UPI transactions does one person do in a day?",
          answer:
            "**791 mn transactions a day ÷ ~1,120 mn adults ≈ 0.7.** But that averages users with non-users. Say the average, then immediately say why it understates the user: only a minority of adults transact on UPI, so per active user it is nearer 2 a day. Giving the average and the correction in one breath is the whole skill.",
        },
      ],
    },

    {
      type: "callout",
      variant: "warning",
      title: "Read the vintage before you quote the number",
      md: "India's last full census was **2011**. Every household, village, town and city figure here is either fifteen years old or estimated forward from something that is; the **2027 census will move several of them**. Three more things to keep straight: **(a)** GDP was rebased to 2022-23 in 2026, so pre-2026 write-ups are on a different series — do not mix them in one argument; **(b)** consumption surveys and national accounts disagree by roughly 2×, by design, so name which basis you are on; **(c)** registered vehicles overstate vehicles running, because scrapped ones are rarely de-registered. Saying any of these in a room marks you out faster than a correct number does.",
    },

    {
      type: "keyTakeaways",
      title: "The spine, in one breath",
      items: [
        "**1.48 bn people · ~320 mn households · ~645 mn workers · GDP ₹346 lakh crore.** Almost everything funnels from one of these four.",
        "**37% urban. Median age about 29. Fertility 1.93 — already below replacement.** Young is a stock, not a flow.",
        "**Average spend is ₹4,122 rural and ₹6,996 urban per person per month.** Not ₹19,500 — that is output per head, and it is not in anyone's pocket.",
        "**Agriculture: 43% of the jobs, 18% of the output.** Output share and employment share are different questions.",
        "**Connections are not people.** 1,289 mn mobile connections, 1,194 mn active, ~680 mn smartphone users, urban tele-density 152%.",
        "**Annual sales × life ≈ stock.** It closes for two-wheelers and cars to within a few per cent. Learn the move, not the numbers.",
        "Round in powers of ten, name every assumption, and always build the answer a second way.",
      ],
    },

    {
      type: "callout",
      variant: "insight",
      title: "Going deeper → the Industry Primers",
      md: "These are **national anchors** for fast sizing, not sector depth. When a guesstimate is really about one industry, open its **Industry Primer** for ARPU, GMV, penetration, capacity and sales-mix rather than reinventing them here: [Telecom](/learn/casebook/industry-primers/telecom), [Payments](/learn/casebook/industry-primers/payments), [E-Commerce](/learn/casebook/industry-primers/ecommerce), [Food Delivery](/learn/casebook/industry-primers/food-delivery), [Automobile](/learn/casebook/industry-primers/automobile), [Electric Vehicles](/learn/casebook/industry-primers/ev), [FMCG](/learn/casebook/industry-primers/fmcg), [Retail](/learn/casebook/industry-primers/retail), [Banking](/learn/casebook/industry-primers/banking), [Healthcare](/learn/casebook/industry-primers/healthcare), [Power](/learn/casebook/industry-primers/power), [Oil & Gas](/learn/casebook/industry-primers/oil-gas) — plus around fifteen more under **Industry Primers** in the sidebar.",
    },
  ],
};
