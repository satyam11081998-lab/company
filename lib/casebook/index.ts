/* ============================================================================
   lib/casebook/index.ts
   The MECE Casebook — a single merged index. The rule: whatever one framework
   covers and another misses, the merged index keeps. This is the spine of the 
   /learn experience.

   Each framework has a `status`:
     'live'    — full branded page built (e.g. growth-strategy, market-entry)
     'draft'   — stub page, content coming
   Add a framework here and it appears in the sidebar + overview automatically.
   ============================================================================ */

export type FrameworkStatus = "live" | "draft";

export interface Framework {
  slug: string; // url segment, e.g. "growth-strategy"
  title: string; // "Growth Strategy"
  blurb: string; // one-line description for cards
  status: FrameworkStatus;
  est?: string; // "~25 min"
}

export interface Domain {
  slug: string; // "growth"
  title: string; // "Growth"
  icon: string; // lucide icon name (string) — wire to your icon map
  summary: string; // short domain description
  frameworks: Framework[];
}

export const CASEBOOK: Domain[] = [
  {
    slug: "fundamentals",
    title: "Fundamentals",
    icon: "GitMerge",
    summary: "The thinking tools every case rests on. Master these before the case types.",
    frameworks: [
      { slug: "mece-principle", title: "The MECE Principle", blurb: "Mutually exclusive, collectively exhaustive — the core discipline.", status: "draft", est: "~10 min" },
      { slug: "issue-trees", title: "Issue Trees", blurb: "Break any problem into a structured, drillable tree.", status: "draft", est: "~12 min" },
      { slug: "hypothesis-driven", title: "Hypothesis-Driven Approach", blurb: "Lead with an answer, then test it — the consultant's default.", status: "draft", est: "~12 min" },
      { slug: "minto-pyramid", title: "The Minto Pyramid", blurb: "Communicate top-down: answer first, support below.", status: "draft", est: "~10 min" },
    ],
  },
  {
    slug: "growth",
    title: "Growth",
    icon: "TrendingUp",
    summary: "How a firm grows value — organically, inorganically, or by monetising what it already owns.",
    frameworks: [
      { slug: "growth-strategy", title: "Growth Strategy", blurb: "The full growth tree: organic, inorganic & non-core levers.", status: "live", est: "~25 min" },
      { slug: "ansoff-matrix", title: "Ansoff Matrix", blurb: "Markets × products, ranked by execution risk.", status: "draft", est: "~12 min" },
      { slug: "new-product-launch", title: "New Product Launch", blurb: "Go / no-go and the launch playbook.", status: "draft", est: "~22 min" },
    ],
  },
  {
    slug: "profitability",
    title: "Profitability",
    icon: "DollarSign",
    summary: "The most common case type. Profit = Revenue − Cost, decomposed all the way down.",
    frameworks: [
      { slug: "profitability-framework", title: "Profitability Framework", blurb: "Diagnose declining profit: revenue side vs cost side.", status: "draft", est: "~25 min" },
      { slug: "cost-reduction", title: "Cost Reduction", blurb: "Fixed vs variable, value-chain analysis, make-vs-buy.", status: "draft", est: "~20 min" },
      { slug: "turnaround", title: "Turnaround", blurb: "Stabilise, then rebuild a struggling business.", status: "draft", est: "~25 min" },
    ],
  },
  {
    slug: "market",
    title: "Market",
    icon: "Building2",
    summary: "Entering, sizing and defending position in a market.",
    frameworks: [
      { slug: "market-entry", title: "Market Entry", blurb: "Should we enter, and if so — how?", status: "live", est: "~25 min" },
      { slug: "market-sizing", title: "Market Sizing & Guesstimates", blurb: "Top-down vs bottom-up estimation under pressure.", status: "draft", est: "~15 min" },
      { slug: "competitive-response", title: "Competitive Response", blurb: "A rival just moved — how do we react?", status: "draft", est: "~20 min" },
    ],
  },
  {
    slug: "pricing",
    title: "Pricing",
    icon: "Calculator",
    summary: "Setting and changing price — cost-plus, value-based and competitor-based.",
    frameworks: [
      { slug: "pricing-strategy", title: "Pricing Strategy", blurb: "The three pricing approaches and when to use each.", status: "draft", est: "~20 min" },
      { slug: "price-elasticity", title: "Price & Elasticity", blurb: "Read demand before you move the price.", status: "draft", est: "~12 min" },
    ],
  },
  {
    slug: "ma",
    title: "M&A",
    icon: "GitMerge",
    summary: "Buying, merging and partnering for growth — and the integration risk that follows.",
    frameworks: [
      { slug: "mergers-acquisitions", title: "Mergers & Acquisitions", blurb: "Should we buy? Synergies, valuation, integration.", status: "draft", est: "~25 min" },
      { slug: "joint-ventures", title: "Joint Ventures", blurb: "Share the risk to enter a new space.", status: "draft", est: "~15 min" },
    ],
  },
];

/* --------------------------- lookup helpers --------------------------- */
export function getDomain(slug: string): Domain | undefined {
  return CASEBOOK.find((d) => d.slug === slug);
}

export function getFramework(domainSlug: string, fwSlug: string) {
  const domain = getDomain(domainSlug);
  const framework = domain?.frameworks.find((f) => f.slug === fwSlug);
  return { domain, framework };
}

export function allFrameworkParams() {
  return CASEBOOK.flatMap((d) =>
    d.frameworks.map((f) => ({ domain: d.slug, framework: f.slug }))
  );
}

export function liveCount() {
  return CASEBOOK.reduce(
    (acc, d) => acc + d.frameworks.filter((f) => f.status === "live").length,
    0
  );
}
