/**
 * FAQ data for MECE casebook content clusters.
 *
 * Each cluster gets 8–12 FAQs with 30–60 word answers.
 * Used for:
 *   1. FAQ accordion UI on cluster landing pages
 *   2. FAQPage structured data (schema.org)
 *   3. AEO — answer-first content for AI extraction
 *
 * Rules:
 *   - Answers are factual, based on actual page content
 *   - No duplicates across clusters
 *   - No hallucinated information
 *   - Answer relevance verified against MECE content
 */

export interface FAQ {
  question: string;
  answer: string;
}

export interface ClusterFAQs {
  clusterId: string;
  clusterTitle: string;
  faqs: FAQ[];
}

export const CLUSTER_FAQS: ClusterFAQs[] = [
  {
    clusterId: 'getting-started',
    clusterTitle: 'Getting Started with Case Interviews',
    faqs: [
      {
        question: 'What does a case interview test?',
        answer: 'A case interview tests your structured problem-solving ability, quantitative reasoning, business judgment, communication skills, and creativity. Interviewers evaluate how you break down ambiguous business problems into logical frameworks and arrive at actionable recommendations under time pressure.',
      },
      {
        question: 'What are the six main types of case interviews?',
        answer: 'The six main case types are profitability, market entry, growth strategy, pricing, M&A (mergers and acquisitions), and unconventional/operations cases. Each type has a distinct framework structure, though many real interviews blend elements from multiple types.',
      },
      {
        question: 'How should I structure a case interview answer?',
        answer: 'Use the CSAC method: Clarify the problem and scope, Structure your framework using MECE principles, Analyze each branch with data and hypotheses, then Conclude with a top-down recommendation. Always lead with your conclusion, not your analysis.',
      },
      {
        question: 'What is the MECE principle in consulting?',
        answer: 'MECE stands for Mutually Exclusive, Collectively Exhaustive. It means your framework categories should have no overlaps (mutually exclusive) and cover every possibility (collectively exhaustive). This principle, popularized by McKinsey, is the gold standard for structured business analysis.',
      },
      {
        question: 'How do I handle math in a case interview?',
        answer: 'Practice mental math daily, round numbers sensibly, state assumptions clearly, and always sanity-check your final answer against real-world benchmarks. Interviewers care more about your approach and reasonableness than perfect arithmetic accuracy.',
      },
      {
        question: 'How long should I prepare for case interviews?',
        answer: 'MECE recommends a structured 14-day preparation plan for fundamentals, followed by consistent daily practice. Most successful candidates practice 2–3 cases per day for 4–8 weeks before placement season, combining casebook study with timed mock interviews.',
      },
      {
        question: 'What is a hypothesis-driven approach?',
        answer: 'A hypothesis-driven approach means forming a testable initial answer before diving into analysis. Instead of exploring every branch equally, you prioritize the most likely explanation, test it against data, and pivot if disproven. BCG and Bain particularly value this approach.',
      },
      {
        question: 'How does MECE score my case interview practice?',
        answer: 'MECE evaluates every submission across six dimensions — Structure (25 pts), Quantitative Skills (20), Synthesis & Communication (20), Business Judgment (15), Creativity (10), and Professional Tone (10) — totaling 100 points with specific rubric criteria for each dimension.',
      },
    ],
  },
  {
    clusterId: 'guesstimates',
    clusterTitle: 'Guesstimates & Market Sizing',
    faqs: [
      {
        question: 'What is a guesstimate in MBA interviews?',
        answer: 'A guesstimate is a structured estimation question where you estimate a quantity — like "How many smartphones are sold in India annually?" — using logical segmentation, reasonable assumptions, and basic arithmetic. It tests your ability to structure ambiguity and think quantitatively.',
      },
      {
        question: 'How do I approach a market sizing question?',
        answer: 'Start by clarifying the scope (geography, time period, product definition). Choose a segmentation approach — population-based (top-down) or unit-economics-based (bottom-up). Break the problem into 3–5 segments, assign assumptions to each, calculate, and sanity-check against known benchmarks.',
      },
      {
        question: 'What is the difference between top-down and bottom-up estimation?',
        answer: 'Top-down starts from a large known number (e.g., India population) and narrows down through filters. Bottom-up starts from a single unit (e.g., one store\'s daily sales) and scales up. Strong candidates use both methods to cross-validate their final estimate.',
      },
      {
        question: 'How accurate does a guesstimate need to be?',
        answer: 'Interviewers expect your answer to be within 2–3x of the actual number. The process matters more than precision — clear segmentation, explicit assumptions, clean arithmetic, and a sanity check demonstrate the structured thinking firms actually hire for.',
      },
      {
        question: 'What are common guesstimate mistakes?',
        answer: 'The most common mistakes are: not clarifying scope before solving, using overlapping segments (violating MECE), making assumptions without stating them, arithmetic errors from unnecessary complexity, and skipping the sanity check. Always compare your final number to a known reference point.',
      },
      {
        question: 'How many guesstimates should I practice?',
        answer: 'Practice at least 25–30 guesstimates covering different categories: population-based, revenue estimation, infrastructure counting, and time-based calculations. MECE offers worked examples across five categories with increasing difficulty levels from easy to challenging.',
      },
      {
        question: 'What is a sanity check in a guesstimate?',
        answer: 'A sanity check is the final step where you validate your estimate against a known benchmark. For example, if you estimate India\'s annual smartphone sales, compare it to known industry reports or per-capita figures. This catches order-of-magnitude errors and builds interviewer confidence.',
      },
      {
        question: 'Can I use a calculator in a guesstimate interview?',
        answer: 'No — guesstimates are designed to test mental math ability. Practice rounding numbers to make calculation easier (e.g., use 1.4B instead of 1.42B for India\'s population). Interviewers want to see you handle quantitative pressure without tools.',
      },
    ],
  },
  {
    clusterId: 'core-frameworks',
    clusterTitle: 'Core Consulting Frameworks',
    faqs: [
      {
        question: 'What is a profitability framework?',
        answer: 'The profitability framework decomposes profit into Revenue (Price × Volume) minus Costs (Fixed + Variable). You systematically investigate each branch to identify the root cause of declining profits. This is the most common case type in MBA placement interviews.',
      },
      {
        question: 'How do I approach a market entry case?',
        answer: 'Evaluate four dimensions: Market attractiveness (size, growth, competition), Company capability (resources, expertise, brand fit), Entry mode (organic build, acquisition, partnership, franchise), and Financial viability (investment required, payback period, ROI). Always assess both "should we enter?" and "how?"',
      },
      {
        question: 'What is a growth strategy framework?',
        answer: 'A growth framework examines four pathways: increasing revenue from existing customers (cross-sell, upsell, retention), acquiring new customers in existing markets, expanding to new markets or geographies, and launching new products or services. Prioritize by effort vs. impact.',
      },
      {
        question: 'When should I use a custom framework versus a standard one?',
        answer: 'Always build a custom framework tailored to the specific problem. Standard frameworks (profitability, market entry) provide useful starting structures, but interviewers want to see you adapt — adding industry-specific branches and dropping irrelevant ones shows genuine business acumen.',
      },
      {
        question: 'What is the pricing framework for case interviews?',
        answer: 'The pricing framework evaluates three dimensions: cost-based pricing (cost-plus margin), value-based pricing (willingness to pay), and competition-based pricing (market benchmarks). Then assess implementation factors: customer segments, price elasticity, channel dynamics, and regulatory constraints.',
      },
      {
        question: 'How do I structure an M&A case?',
        answer: 'Evaluate M&A cases across three phases: strategic rationale (why acquire?), valuation and synergies (what is it worth?), and integration risks (can we execute?). Key areas include revenue synergies, cost synergies, cultural fit, regulatory approval, and the standalone vs. combined valuation.',
      },
      {
        question: 'What does MECE mean in framework building?',
        answer: 'In framework building, MECE means your categories should be mutually exclusive (no overlapping branches) and collectively exhaustive (no gaps). For example, costs split into "fixed" and "variable" is MECE — every cost falls into exactly one category with nothing left uncovered.',
      },
      {
        question: 'How many frameworks should I memorize?',
        answer: 'Memorize the core structures for 6 case types (profitability, market entry, growth, pricing, M&A, operations) and 10 toolkit frameworks (Porter\'s, SWOT, etc.). But in interviews, always customize — demonstrating adaptability matters more than perfect recall.',
      },
    ],
  },
  {
    clusterId: 'toolkit',
    clusterTitle: 'Business Analysis Toolkit',
    faqs: [
      {
        question: 'What are Porter\'s Five Forces?',
        answer: 'Porter\'s Five Forces analyze industry attractiveness through: threat of new entrants, bargaining power of suppliers, bargaining power of buyers, threat of substitutes, and competitive rivalry. Higher forces mean lower industry profitability. Use this to assess whether entering or staying in a market makes strategic sense.',
      },
      {
        question: 'When should I use SWOT analysis?',
        answer: 'Use SWOT (Strengths, Weaknesses, Opportunities, Threats) for company-level strategic assessment. Strengths and Weaknesses are internal factors; Opportunities and Threats are external. In case interviews, SWOT works best as a preliminary framing tool before diving into a more specific framework.',
      },
      {
        question: 'What is the BCG Growth-Share Matrix?',
        answer: 'The BCG Matrix classifies business units into four quadrants based on market growth rate and relative market share: Stars (high/high), Cash Cows (low growth/high share), Question Marks (high growth/low share), and Dogs (low/low). It guides portfolio investment decisions and resource allocation.',
      },
      {
        question: 'What is a value chain analysis?',
        answer: 'Value chain analysis, created by Michael Porter, breaks a company\'s activities into primary activities (inbound logistics, operations, outbound logistics, marketing & sales, service) and support activities (infrastructure, HR, technology, procurement). It identifies where the company creates or destroys value.',
      },
      {
        question: 'What is the Ansoff Matrix?',
        answer: 'The Ansoff Matrix maps four growth strategies based on product-market combinations: Market Penetration (existing product, existing market), Product Development (new product, existing market), Market Development (existing product, new market), and Diversification (new product, new market). Risk increases diagonally.',
      },
      {
        question: 'How do the 4 P\'s apply to case interviews?',
        answer: 'The 4 P\'s — Product, Price, Place, and Promotion — are the marketing mix framework. In case interviews, they\'re useful for go-to-market strategy, brand launch, and marketing spend optimization cases. Modern variations add People, Process, and Physical Evidence for services.',
      },
      {
        question: 'What is PESTEL analysis?',
        answer: 'PESTEL examines six macro-environmental factors: Political, Economic, Social, Technological, Environmental, and Legal. Use it in market entry and strategy cases to assess external forces that could impact business viability. Focus on the 2–3 factors most relevant to the specific case.',
      },
      {
        question: 'What is the McKinsey 7S framework?',
        answer: 'McKinsey 7S examines organizational effectiveness through seven interconnected elements: Strategy, Structure, Systems (hard elements) and Shared Values, Skills, Staff, Style (soft elements). It\'s particularly useful in post-merger integration and organizational transformation cases.',
      },
    ],
  },
  {
    clusterId: 'cases',
    clusterTitle: 'Worked Case Interviews',
    faqs: [
      {
        question: 'How should I practice with worked case examples?',
        answer: 'First attempt the case yourself with a timer (15–20 minutes). Write a full structured answer. Then compare your approach against MECE\'s worked solution — check if your framework was MECE, your math was accurate, and your conclusion was actionable. Focus on gaps, not just the final answer.',
      },
      {
        question: 'What makes a good case interview recommendation?',
        answer: 'A strong recommendation follows the Pyramid Principle: lead with the answer, support with 2–3 key reasons in descending order of importance, acknowledge risks and mitigations, and propose concrete next steps. Never end with "it depends" — interviewers want a decisive, defensible position.',
      },
      {
        question: 'How do I handle a case type I\'ve never seen before?',
        answer: 'Apply first principles: clarify the objective, identify the key decision, break it into 3–4 MECE buckets based on the specific problem (not a memorized template), and systematically analyze each. Unconventional cases reward creative structuring and genuine business intuition over template application.',
      },
      {
        question: 'What industries appear most frequently in MBA case interviews?',
        answer: 'The most common industries are FMCG/CPG, technology/SaaS, banking and financial services, healthcare, retail, and e-commerce. MECE covers 20 industry primers from asset management to OTT to help you build sector-specific knowledge quickly.',
      },
      {
        question: 'How many cases should I solve before placement season?',
        answer: 'Aim for 50–80 cases across all six case types. Focus on quality over quantity — deeply analyzing 5 cases teaches more than rushing through 20. Track your scores across MECE\'s six dimensions to identify and target your weakest areas systematically.',
      },
      {
        question: 'What is the difference between an easy and challenging case?',
        answer: 'Easy cases have clear frameworks and single objectives. Challenging cases involve multiple competing objectives, ambiguous data, industry-specific nuances, multi-step quantitative analysis, or unconventional problem types that resist template application. MECE rates each case from easy to challenging.',
      },
      {
        question: 'Should I use Indian examples in my case answers?',
        answer: 'Yes — especially for IIM and top B-school placements. Indian examples (Jio disruption, Swiggy/Zomato unit economics, FMCG distribution in rural India) demonstrate contextual awareness. MECE\'s cases and guesstimates are specifically set in Indian business contexts for this reason.',
      },
      {
        question: 'What is a signature case?',
        answer: 'Signature cases are MECE\'s most complex problems that blend multiple case types — for example, combining PE valuation with operational turnaround, or integrating pricing strategy with competitive dynamics. They simulate real final-round interview difficulty and require synthesis across frameworks.',
      },
    ],
  },
  {
    clusterId: 'industry-primers',
    clusterTitle: 'Industry Primers',
    faqs: [
      {
        question: 'Why do I need industry knowledge for case interviews?',
        answer: 'Industry knowledge provides the real-world anchors that transform generic frameworks into credible, specific recommendations. Knowing that Indian FMCG distribution has 10M+ kirana stores, or that airline yield management uses 26 fare buckets, signals commercial maturity to interviewers.',
      },
      {
        question: 'How many industries should I prepare?',
        answer: 'Prepare 5–6 industries deeply and 10+ at a surface level. Focus on industries relevant to your target firms and your background. MECE offers 20 industry primers covering India-specific market sizing, competitive landscapes, regulatory contexts, and key financial metrics.',
      },
      {
        question: 'What should an industry primer cover?',
        answer: 'Each primer should cover: market size and growth rate, key players and market share, industry value chain, regulatory environment, key financial metrics and benchmarks, recent trends and disruptions, and India-specific dynamics. MECE primers follow this exact structure consistently.',
      },
      {
        question: 'Which industries are most tested at IIMs?',
        answer: 'At IIM placements, FMCG, banking, e-commerce, IT services, and healthcare are the most frequently tested industries. For consulting roles, you may additionally face aviation, telecom, energy, and manufacturing cases. Industry focus varies by recruiting firm and campus.',
      },
      {
        question: 'How do I use industry primers during a case interview?',
        answer: 'Reference industry benchmarks naturally — e.g., "FMCG gross margins in India typically range 40–60%, so this figure seems low." Use primer knowledge to formulate sharper hypotheses, validate assumptions, and propose industry-specific solutions rather than generic recommendations.',
      },
      {
        question: 'What are MECE industry primers?',
        answer: 'MECE industry primers are comprehensive, interview-focused guides covering 20 key Indian industries. Each primer includes market sizing data, competitive landscape analysis, value chain breakdown, regulatory context, key financial benchmarks, and actionable interview talking points.',
      },
      {
        question: 'Should I memorize industry numbers?',
        answer: 'Memorize 3–5 anchor numbers per industry (market size, growth rate, top player market share, average margin, key ratio). You don\'t need exact figures — knowing that India\'s FMCG market is ~$100B growing at 10–12% CAGR is more useful than memorizing $97.3B.',
      },
      {
        question: 'How current are the industry primers?',
        answer: 'MECE primers use FY2024–2025 data with India-specific anchors. Markets evolve, so treat numbers as order-of-magnitude references. The frameworks and competitive dynamics are more durable than exact figures — focus on understanding the "why" behind industry structure.',
      },
    ],
  },
];

/** Get FAQs for a specific cluster by its ID. */
export function getClusterFAQs(clusterId: string): FAQ[] {
  return CLUSTER_FAQS.find((c) => c.clusterId === clusterId)?.faqs ?? [];
}

/** Get all FAQs across all clusters (for site-wide FAQ schema on homepage). */
export function getAllFAQs(): FAQ[] {
  return CLUSTER_FAQS.flatMap((c) => c.faqs);
}
