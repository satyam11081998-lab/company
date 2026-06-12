export interface GlossaryTerm {
  slug: string;
  term: string;
  definition: string;
  explanation: string;
  category: 'consulting' | 'finance' | 'marketing' | 'operations' | 'product' | 'strategy';
  relatedTerms: string[];
  relatedCasebookPages?: string[];
  example?: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // ─────────────────────────────────────────────
  // CONSULTING (13)
  // ─────────────────────────────────────────────
  {
    slug: 'mece',
    term: 'MECE',
    definition:
      'MECE stands for Mutually Exclusive, Collectively Exhaustive. It is a structuring principle used in consulting to break complex problems into distinct, non-overlapping categories that together cover every possible aspect of the issue being analyzed.',
    explanation:
      'MECE is the foundational thinking framework at every top consulting firm. When you structure an analysis as MECE, each bucket you create must be independent of the others (mutually exclusive) and all buckets together must account for every possibility (collectively exhaustive). This prevents double-counting and ensures nothing is missed.\n\nIn a case interview, a MECE structure signals disciplined, logical thinking. For example, if asked why profits declined, a MECE breakdown might split the problem into Revenue and Costs. Revenue can further split into Price and Volume, while Costs split into Fixed and Variable. Each sub-bucket is distinct and together they capture the full picture.\n\nPracticing MECE thinking helps you move beyond surface-level brainstorming to structured problem-solving. Interviewers look for candidates who can instinctively organize information this way, because it mirrors how consultants deliver clear, actionable recommendations to clients.',
    category: 'consulting',
    relatedTerms: ['issue-tree', 'hypothesis-driven-approach', 'profitability-framework'],
    relatedCasebookPages: ['profitability-framework', 'market-entry'],
    example:
      'McKinsey consultants analyzing a retailer\'s declining sales structured the problem MECE: (1) Store-level factors (foot traffic, conversion, basket size) vs. (2) External factors (competition, macro trends). This ensured no driver was double-counted or overlooked.',
  },
  {
    slug: 'issue-tree',
    term: 'Issue Tree',
    definition:
      'An issue tree is a hierarchical, visual breakdown of a business problem into its component parts. It starts with a core question at the top and branches into sub-questions, each level adding specificity until you reach testable hypotheses or actionable drivers.',
    explanation:
      'Issue trees are the primary tool consultants use to decompose complex, ambiguous problems into manageable pieces. Unlike mind maps, issue trees follow strict MECE logic at every level of branching, ensuring completeness and clarity. The root node states the central question, and each branch represents a distinct avenue of investigation.\n\nIn case interviews, drawing an issue tree on paper demonstrates your ability to think before you calculate. A well-constructed tree guides your analysis, helps you prioritize which branches to explore first, and provides a roadmap you can share with your interviewer. It also prevents you from going down rabbit holes.\n\nExperienced consultants build issue trees collaboratively with clients to align on the scope of an engagement. The tree becomes the project plan itself—each branch maps to a workstream, and each leaf maps to a specific analysis or data request.',
    category: 'consulting',
    relatedTerms: ['mece', 'hypothesis-driven-approach', 'profitability-framework'],
    relatedCasebookPages: ['profitability-framework'],
    example:
      'A Bain team investigating why a hospital chain was losing money built an issue tree with branches for Revenue (patient volume × revenue per patient), Costs (staff, supplies, facilities), and Payer Mix (insurance reimbursement rates). Each branch led to targeted data requests.',
  },
  {
    slug: 'hypothesis-driven-approach',
    term: 'Hypothesis-Driven Approach',
    definition:
      'A hypothesis-driven approach starts with an educated initial answer to a business question, then systematically tests that answer through data and analysis. It prioritizes efficiency by focusing investigation on proving or disproving the hypothesis rather than boiling the ocean.',
    explanation:
      'In consulting, time is the scarcest resource. Rather than analyzing everything and hoping the answer emerges, the hypothesis-driven approach flips the process: you form a point of view early, identify the analyses needed to validate it, and iterate based on findings. If the data disproves your hypothesis, you pivot to the next most likely answer.\n\nDuring case interviews, this approach is critical. When given a case, you should quickly form an initial hypothesis (e.g., "I believe the profit decline is driven by rising raw material costs") and then ask targeted questions to test it. This demonstrates executive presence and efficient problem-solving.\n\nThe approach originated from the scientific method but has been adapted for business contexts where perfect data rarely exists. Senior partners at firms like McKinsey expect associates to come to meetings with a hypothesis and supporting evidence, not open-ended explorations.',
    category: 'consulting',
    relatedTerms: ['mece', 'issue-tree', 'due-diligence'],
    relatedCasebookPages: ['profitability-framework', 'market-entry'],
    example:
      'A BCG team hypothesized that a telecom\'s churn was driven by poor network quality in suburban areas. They tested this by overlaying churn data with network coverage maps, confirming the hypothesis within two weeks instead of a three-month comprehensive study.',
  },
  {
    slug: 'profitability-framework',
    term: 'Profitability Framework',
    definition:
      'The profitability framework is a structured approach to diagnosing why a company is not making enough money. It breaks profit into Revenue (Price × Volume) and Costs (Fixed + Variable), then systematically investigates each component to identify the root cause of underperformance.',
    explanation:
      'The profitability framework is arguably the most common case type in consulting interviews. At its core, Profit = Revenue − Costs. Revenue is decomposed into Price and Volume (or number of customers × revenue per customer), while Costs are split into Fixed Costs (rent, salaries, depreciation) and Variable Costs (raw materials, commissions, shipping).\n\nWhen applying this framework, you should compare each component against historical trends, competitors, and industry benchmarks. A decline in volume might signal a marketing or product problem, while rising variable costs could point to supply chain inefficiencies. The key is to isolate which lever is driving the issue.\n\nAdvanced applications layer in additional dimensions such as product mix, customer segmentation, and channel profitability. A company might be profitable overall but losing money on a specific product line or customer segment. The framework\'s power lies in its simplicity and adaptability to virtually any business.',
    category: 'consulting',
    relatedTerms: ['mece', 'issue-tree', 'ebitda', 'unit-economics'],
    relatedCasebookPages: ['profitability-framework'],
    example:
      'An airline discovered through the profitability framework that while ticket revenue was stable, ancillary revenue (baggage, upgrades) had dropped 30% after a policy change. Reversing the policy restored $200M in annual profit.',
  },
  {
    slug: 'market-entry-framework',
    term: 'Market Entry Framework',
    definition:
      'The market entry framework provides a structured approach for evaluating whether a company should enter a new market. It assesses market attractiveness, competitive landscape, company capabilities, and financial viability to determine the optimal entry strategy and timing.',
    explanation:
      'Market entry cases are among the most frequent in consulting interviews. The framework typically evaluates four dimensions: (1) Market Attractiveness—size, growth rate, profitability, and trends; (2) Competitive Landscape—number and strength of competitors, barriers to entry, and substitutes; (3) Company Fit—whether the firm has the capabilities, brand, and resources to compete; and (4) Financial Analysis—expected revenues, costs, investment required, and payback period.\n\nBeyond the go/no-go decision, the framework also addresses how to enter: organic growth, acquisition, joint venture, licensing, or franchising. Each mode carries different risk, speed, and capital profiles. A tech company entering India might choose a joint venture for local expertise, while a luxury brand might prefer wholly-owned stores to control the customer experience.\n\nIn interviews, strong candidates tailor this framework to the specific industry context rather than applying it mechanically. They consider regulatory barriers, cultural differences, and channel dynamics unique to the target market.',
    category: 'consulting',
    relatedTerms: ['tam-sam-som', 'competitive-advantage', 'go-to-market-strategy', 'porters-five-forces'],
    relatedCasebookPages: ['market-entry', 'pricing-strategy'],
    example:
      'When Starbucks evaluated entering China, the market entry framework revealed high market attractiveness (growing middle class, tea-drinking culture shifting) but required adapting the menu, store format, and partnering with local developers for real estate.',
  },
  {
    slug: 'growth-strategy',
    term: 'Growth Strategy',
    definition:
      'A growth strategy is a plan for increasing a company\'s revenue, market share, or profitability over time. It encompasses organic growth levers such as new products, new markets, and pricing optimization, as well as inorganic options like mergers, acquisitions, and strategic partnerships.',
    explanation:
      'Growth strategy cases require you to think about where growth will come from and how realistic each option is. The Ansoff Matrix is a useful starting point: grow through market penetration (sell more of what you have to existing customers), product development (new products to existing customers), market development (existing products to new markets), or diversification (new products in new markets).\n\nEach growth lever carries different risk and investment profiles. Market penetration is lowest risk but may have limited upside in mature markets. Diversification offers the highest potential but also the highest failure rate. Strong candidates quantify the opportunity for each lever and prioritize based on feasibility and impact.\n\nIn practice, companies often pursue multiple growth levers simultaneously. Amazon\'s growth strategy combined market penetration (expanding product selection), market development (international expansion), product development (AWS, Kindle), and acquisitions (Whole Foods, MGM). The key is ensuring the growth strategy aligns with the company\'s core capabilities and competitive advantages.',
    category: 'consulting',
    relatedTerms: ['ansoff-matrix', 'market-entry-framework', 'ma-mergers-and-acquisitions', 'competitive-advantage'],
    relatedCasebookPages: ['market-entry', 'pricing-strategy'],
    example:
      'PepsiCo pursued a dual growth strategy: organic growth through healthier product lines (acquiring SodaStream, launching Bubly) and geographic expansion into emerging markets where per-capita consumption was still low.',
  },
  {
    slug: 'ma-mergers-and-acquisitions',
    term: 'M&A (Mergers & Acquisitions)',
    definition:
      'Mergers and Acquisitions refers to the consolidation of companies through various financial transactions. A merger combines two firms into one entity, while an acquisition involves one company purchasing another. M&A is used to achieve growth, gain market share, acquire capabilities, or realize cost synergies.',
    explanation:
      'M&A is a critical topic in both consulting and investment banking interviews. When evaluating an acquisition, you should assess: strategic rationale (why this target?), valuation (what is a fair price?), synergies (what value can be created post-deal?), integration risks (cultural fit, systems compatibility), and financing (how will the deal be funded?).\n\nThe strategic rationale typically falls into categories: horizontal M&A (acquiring a competitor for scale), vertical M&A (acquiring a supplier or distributor for control), and conglomerate M&A (diversifying into unrelated businesses). Each type has different synergy profiles and antitrust implications.\n\nPost-merger integration is where most M&A value is won or lost. Studies consistently show that 50-70% of mergers fail to deliver expected synergies, often due to cultural clashes, customer attrition, or key talent departures. In case interviews, demonstrating awareness of integration challenges shows maturity beyond just the deal rationale.',
    category: 'consulting',
    relatedTerms: ['due-diligence', 'synergies', 'dcf-discounted-cash-flow', 'growth-strategy'],
    relatedCasebookPages: ['market-entry'],
    example:
      'Disney\'s acquisition of 21st Century Fox for $71.3B was driven by content library expansion for Disney+ and gaining a controlling stake in Hulu. The deal exemplified horizontal M&A with clear content synergies.',
  },
  {
    slug: 'due-diligence',
    term: 'Due Diligence',
    definition:
      'Due diligence is the comprehensive investigation and analysis conducted before a major business transaction, typically an acquisition, investment, or partnership. It evaluates financial health, legal risks, operational capabilities, market position, and strategic fit to inform the go/no-go decision and valuation.',
    explanation:
      'Due diligence is one of the most common consulting engagement types, particularly for private equity firms evaluating potential acquisitions. Commercial due diligence focuses on market dynamics, competitive positioning, and revenue sustainability. Financial due diligence examines historical financials, quality of earnings, and working capital requirements. Operational due diligence assesses processes, technology, and organizational capability.\n\nIn a case interview context, due diligence questions often present a private equity firm considering acquiring a company. You need to evaluate whether the target is a good investment by assessing market attractiveness, the company\'s competitive position, growth potential, risks, and ultimately whether the asking price is justified.\n\nThe depth of due diligence varies by transaction size and complexity. A small acquisition might involve weeks of analysis, while a mega-merger could require months of work by multiple consulting firms, law firms, and accounting firms working in parallel.',
    category: 'consulting',
    relatedTerms: ['ma-mergers-and-acquisitions', 'synergies', 'npv-net-present-value', 'dcf-discounted-cash-flow'],
    example:
      'When Microsoft acquired LinkedIn for $26.2B, due diligence revealed strong user engagement metrics and enterprise cross-sell opportunities, but also flagged slowing international growth and integration complexity with existing Microsoft products.',
  },
  {
    slug: 'synergies',
    term: 'Synergies',
    definition:
      'Synergies are the additional value created when two companies combine that neither could achieve independently. Revenue synergies come from cross-selling, expanded distribution, or pricing power. Cost synergies arise from eliminating redundancies, economies of scale, and shared infrastructure.',
    explanation:
      'Synergies are the primary justification for most M&A transactions. Cost synergies are generally more predictable and achievable—they include consolidating headquarters, eliminating duplicate functions (HR, finance, IT), and leveraging combined purchasing power. Revenue synergies, while often larger in potential, are harder to realize because they depend on customer behavior and market dynamics.\n\nWhen analyzing synergies in a case, quantify them where possible. For example, if two companies each spend $100M on IT and estimate they can run on one platform, the cost synergy might be $60-80M annually (not the full $100M, because integration itself has costs). Apply a realization timeline—most synergies take 2-3 years to fully capture.\n\nA common pitfall is overestimating synergies to justify a high acquisition price. The acquiring company\'s shareholders often pay a premium based on projected synergies that never materialize. Wise analysts discount synergy estimates by 20-40% to account for execution risk and integration friction.',
    category: 'consulting',
    relatedTerms: ['ma-mergers-and-acquisitions', 'due-diligence', 'value-chain', 'lean-manufacturing'],
    example:
      'When Kraft merged with Heinz (backed by 3G Capital), they projected $1.5B in cost synergies from consolidating manufacturing plants, cutting corporate overhead, and zero-based budgeting. They achieved these targets within two years.',
  },
  {
    slug: 'benchmarking',
    term: 'Benchmarking',
    definition:
      'Benchmarking is the process of comparing a company\'s performance metrics, processes, or practices against industry leaders or best-in-class organizations. It identifies performance gaps, sets improvement targets, and provides actionable insights for achieving operational excellence and competitive parity.',
    explanation:
      'Benchmarking is a fundamental consulting tool used in nearly every engagement. Internal benchmarking compares performance across a company\'s own divisions or locations. Competitive benchmarking measures against direct rivals. Functional benchmarking looks at best practices from any industry for a specific function (e.g., studying Amazon\'s supply chain even if you\'re in healthcare).\n\nEffective benchmarking requires apples-to-apples comparisons. You must normalize for differences in scale, geography, product mix, and business model. Simply comparing raw metrics can be misleading—a company with higher costs per unit might actually be more efficient when you account for its premium product positioning.\n\nIn case interviews, benchmarking data often appears as exhibits showing competitor comparisons. The key is to identify which metrics are meaningful, what gaps exist, and what is driving those gaps. Strong candidates go beyond identifying the gap to recommending specific actions to close it.',
    category: 'consulting',
    relatedTerms: ['value-chain', 'competitive-advantage', 'six-sigma', 'balanced-scorecard'],
    example:
      'A regional bank benchmarked its cost-to-income ratio (72%) against top-quartile peers (55%) and identified branch network density, manual processing, and IT legacy systems as the primary drivers of the 17-point gap.',
  },
  {
    slug: 'value-proposition',
    term: 'Value Proposition',
    definition:
      'A value proposition is a clear statement of the tangible and intangible benefits a company delivers to its customers that differentiate it from competitors. It answers why a customer should choose this product or service over alternatives, articulating the unique combination of features, price, and experience.',
    explanation:
      'A strong value proposition sits at the intersection of what customers need, what your company does well, and what competitors cannot easily replicate. It goes beyond listing features—it communicates the outcome or transformation the customer can expect. The best value propositions are specific, measurable, and resonate emotionally.\n\nIn consulting, understanding a client\'s value proposition is essential for any strategy engagement. If a company\'s value proposition is unclear or undifferentiated, it often explains pricing pressure, customer churn, and market share loss. Consultants help clients sharpen their value proposition through customer research, competitive analysis, and positioning workshops.\n\nIn case interviews, you should always consider the value proposition when evaluating market entry, new product launches, or competitive strategy questions. Ask yourself: What is the customer\'s pain point? How does this offering solve it uniquely? Is the differentiation sustainable? Companies with strong value propositions command premium pricing and enjoy higher customer loyalty.',
    category: 'consulting',
    relatedTerms: ['brand-positioning', 'competitive-advantage', 'product-market-fit', 'customer-journey'],
    example:
      'Slack\'s value proposition—"Be more productive at work with less effort"—clearly articulated how it reduced email overload and centralized team communication, differentiating it from generic email and clunky enterprise tools.',
  },
  {
    slug: 'stakeholder-analysis',
    term: 'Stakeholder Analysis',
    definition:
      'Stakeholder analysis is the systematic identification and assessment of all individuals, groups, or organizations that can affect or be affected by a business decision. It maps each stakeholder\'s interest, influence, and likely position to develop engagement strategies that build support and manage resistance.',
    explanation:
      'Every major business decision has multiple stakeholders with different—and often conflicting—interests. Stakeholder analysis uses a power-interest matrix to categorize stakeholders: high power/high interest (manage closely), high power/low interest (keep satisfied), low power/high interest (keep informed), and low power/low interest (monitor).\n\nIn consulting engagements, stakeholder analysis is critical for change management and implementation success. A brilliant strategy that ignores key stakeholders will fail in execution. For example, a cost reduction plan that doesn\'t consider union leaders, middle management, or key customers is likely to face insurmountable resistance.\n\nIn case interviews, demonstrating stakeholder awareness shows business maturity. When recommending a strategy, briefly consider who benefits, who loses, and how you would manage the change. This is especially important for cases involving restructuring, market entry into regulated industries, or public sector engagements.',
    category: 'consulting',
    relatedTerms: ['change-management', 'value-proposition', 'swot-analysis'],
    example:
      'When a pharmaceutical company planned to close a manufacturing plant, stakeholder analysis identified the local government, union representatives, affected employees, and nearby suppliers as critical stakeholders requiring tailored communication and transition support plans.',
  },
  {
    slug: 'change-management',
    term: 'Change Management',
    definition:
      'Change management is the structured approach to transitioning individuals, teams, and organizations from a current state to a desired future state. It encompasses communication, training, stakeholder engagement, and organizational redesign to ensure strategic initiatives are adopted successfully and sustainably.',
    explanation:
      'Most consulting recommendations fail not because the strategy is wrong, but because the organization cannot execute the change. Change management addresses the human side of transformation. Models like Kotter\'s 8-Step Process and ADKAR provide structured approaches: create urgency, build a coalition, communicate the vision, empower action, generate quick wins, sustain momentum, and anchor changes in culture.\n\nThe biggest change management failures occur when leaders underestimate resistance. People resist change for rational reasons: fear of job loss, skill obsolescence, disrupted relationships, or simply comfort with the status quo. Effective change management acknowledges these concerns, provides support structures, and creates incentives for adoption.\n\nIn case interviews, change management comes up in implementation-focused cases. If your recommendation involves significant organizational change (new technology, restructuring, culture shift), mention the change management considerations. This demonstrates practical thinking beyond just the analytical framework.',
    category: 'consulting',
    relatedTerms: ['stakeholder-analysis', 'balanced-scorecard', 'six-sigma'],
    example:
      'When a global insurance company implemented Salesforce across 15,000 agents, they invested 40% of the project budget in change management—training programs, change champions in each office, and a feedback loop that reduced the typical 18-month adoption timeline to 9 months.',
  },

  // ─────────────────────────────────────────────
  // FINANCE (13)
  // ─────────────────────────────────────────────
  {
    slug: 'ebitda',
    term: 'EBITDA',
    definition:
      'EBITDA stands for Earnings Before Interest, Taxes, Depreciation, and Amortization. It is a widely used financial metric that approximates a company\'s operating cash flow by removing the effects of financing decisions, tax environments, and non-cash accounting charges from the earnings calculation.',
    explanation:
      'EBITDA is the most commonly referenced profitability metric in consulting and private equity. It strips out interest (a function of capital structure), taxes (varying by jurisdiction), and depreciation/amortization (non-cash charges) to provide a cleaner view of operational performance. This makes it useful for comparing companies across different capital structures, tax regimes, and asset bases.\n\nEnterprise Value / EBITDA (EV/EBITDA) is one of the most popular valuation multiples. A company trading at 8x EBITDA means its enterprise value is eight times its annual EBITDA. Industry-specific multiples vary widely—software companies might trade at 20-30x while industrial companies trade at 6-10x.\n\nHowever, EBITDA has limitations. It ignores capital expenditure requirements—a capital-intensive business might have strong EBITDA but little free cash flow after maintaining its assets. Warren Buffett has criticized EBITDA as misleading because depreciation represents real economic costs. In interviews, showing awareness of EBITDA\'s limitations demonstrates financial sophistication.',
    category: 'finance',
    relatedTerms: ['dcf-discounted-cash-flow', 'profitability-framework', 'npv-net-present-value', 'pe-ratio'],
    example:
      'When private equity firm KKR evaluated acquiring Walgreens Boots Alliance, EBITDA was the primary metric for valuation. At roughly $7B EBITDA and a 10x multiple, this implied an enterprise value of approximately $70B.',
  },
  {
    slug: 'cagr',
    term: 'CAGR',
    definition:
      'CAGR (Compound Annual Growth Rate) represents the smoothed annualized rate of growth between two points in time, assuming profits are reinvested each year. It eliminates year-to-year volatility to show what the steady-state growth rate would need to be to go from beginning value to ending value.',
    explanation:
      'CAGR is the go-to metric for communicating growth in a standardized way. The formula is: CAGR = (End Value / Start Value)^(1/n) − 1, where n is the number of years. Unlike simple averages of annual growth rates, CAGR accounts for compounding effects and is not distorted by volatile year-over-year swings.\n\nIn case interviews, CAGR frequently appears in market sizing and growth estimation. If told a market was $10B five years ago and is $16B today, you can calculate the CAGR as (16/10)^(1/5) − 1 ≈ 10%. This is more useful than saying the market "grew by 60%" because it normalizes for the time period and enables comparisons.\n\nCAGR is widely used in consulting decks, investor presentations, and market reports. However, it can mask underlying patterns—a company that grew 50% in year one and contracted in subsequent years might still show a positive CAGR. Always look at the underlying trajectory, not just the CAGR.',
    category: 'finance',
    relatedTerms: ['tam-sam-som', 'market-share', 'npv-net-present-value'],
    example:
      'Netflix subscriber growth from 2012 (30M) to 2022 (230M) represents a CAGR of approximately 23%, though the actual year-over-year growth decelerated significantly as the base expanded.',
  },
  {
    slug: 'npv-net-present-value',
    term: 'NPV (Net Present Value)',
    definition:
      'Net Present Value is the difference between the present value of cash inflows and cash outflows over a period of time. It discounts future cash flows back to today using a required rate of return, providing a single dollar figure that represents the total value an investment creates or destroys.',
    explanation:
      'NPV is the gold standard for investment decision-making. A positive NPV means the investment generates returns above the required rate (typically the company\'s weighted average cost of capital, or WACC), creating shareholder value. A negative NPV means the project destroys value and should generally be rejected.\n\nThe formula sums discounted cash flows: NPV = Σ [CF_t / (1+r)^t] − Initial Investment, where CF_t is the cash flow in period t and r is the discount rate. The discount rate reflects both the time value of money and the risk of the investment. Higher-risk projects warrant higher discount rates.\n\nIn case interviews, NPV analysis appears in investment decisions, project evaluations, and M&A cases. You might be asked whether a company should build a new factory, launch a new product, or acquire a competitor. The key inputs to focus on are: projected cash flows (and their assumptions), the appropriate discount rate, and the time horizon. Even a rough NPV calculation demonstrates strong financial acumen.',
    category: 'finance',
    relatedTerms: ['irr-internal-rate-of-return', 'dcf-discounted-cash-flow', 'roi-return-on-investment', 'ebitda'],
    example:
      'A mining company evaluated opening a new copper mine: $500M upfront investment, projected cash flows of $80M/year for 15 years, discounted at 10% WACC. The NPV of +$108M justified proceeding with the investment.',
  },
  {
    slug: 'irr-internal-rate-of-return',
    term: 'IRR (Internal Rate of Return)',
    definition:
      'The Internal Rate of Return is the discount rate at which the Net Present Value of all cash flows from a project equals zero. It represents the annualized effective compounded return rate that an investment is expected to generate, making it useful for comparing projects of different sizes and durations.',
    explanation:
      'IRR answers the question: "What annual return does this investment generate?" If a project\'s IRR exceeds the company\'s cost of capital (hurdle rate), the project creates value. Private equity firms typically target IRRs of 20-30%, while corporate projects might have hurdle rates of 10-15%.\n\nIRR is particularly popular in private equity because it captures both the magnitude and timing of returns. A deal that doubles money in three years has a higher IRR than one that doubles money in five years, even though both have the same total return (2x). PE firms are compensated on IRR-like metrics, which incentivizes quick value creation and exit.\n\nHowever, IRR has known limitations. It assumes interim cash flows are reinvested at the IRR itself, which may be unrealistic for high-IRR projects. It can also produce multiple solutions for projects with unconventional cash flow patterns. In interviews, mentioning that you\'d look at both NPV and IRR together shows nuanced financial thinking.',
    category: 'finance',
    relatedTerms: ['npv-net-present-value', 'roi-return-on-investment', 'dcf-discounted-cash-flow'],
    example:
      'A private equity firm acquired a specialty chemical company for $400M, improved operations, and sold it for $1.2B four years later. The 3x return translated to an IRR of approximately 32%, well above their 20% hurdle rate.',
  },
  {
    slug: 'roi-return-on-investment',
    term: 'ROI (Return on Investment)',
    definition:
      'Return on Investment measures the gain or loss generated on an investment relative to its cost, expressed as a percentage. Calculated as (Net Profit / Cost of Investment) × 100, ROI provides a straightforward way to evaluate the efficiency and profitability of an investment or compare multiple investment alternatives.',
    explanation:
      'ROI is the most intuitive and widely used return metric in business. Its simplicity makes it accessible to all stakeholders—from the C-suite to frontline managers. An ROI of 150% means you earned $1.50 for every $1.00 invested. This makes it easy to compare vastly different types of investments: a marketing campaign, a factory expansion, or an IT upgrade.\n\nHowever, ROI\'s simplicity is also its weakness. It does not account for the time value of money—an ROI of 100% over one year is far more attractive than 100% over ten years, but basic ROI treats them the same. It also doesn\'t capture risk, opportunity cost, or the scale of the investment. A project with 200% ROI on a $10K investment might be less impactful than one with 50% ROI on a $10M investment.\n\nIn case interviews, ROI calculations are common for evaluating marketing spend, capital investments, and strategic initiatives. The key is defining what counts as "investment" and "return" clearly, and acknowledging the metric\'s limitations when relevant.',
    category: 'finance',
    relatedTerms: ['irr-internal-rate-of-return', 'npv-net-present-value', 'unit-economics', 'cac-customer-acquisition-cost'],
    example:
      'Google\'s early investment of $25M in YouTube (2006 acquisition for $1.65B) generated an ROI exceeding 6,000% based on YouTube\'s estimated value of over $180B by 2022.',
  },
  {
    slug: 'pe-ratio',
    term: 'P/E Ratio',
    definition:
      'The Price-to-Earnings ratio compares a company\'s current share price to its earnings per share (EPS). It indicates how much investors are willing to pay per dollar of earnings, reflecting market expectations about future growth, profitability, and risk. Higher P/E ratios suggest higher growth expectations.',
    explanation:
      'P/E ratio is one of the most commonly cited valuation metrics in public markets. A P/E of 25 means investors pay $25 for every $1 of current earnings. The ratio can be calculated using trailing earnings (last 12 months) or forward earnings (analyst estimates for the next 12 months). Forward P/E is generally more useful because markets price in future expectations.\n\nP/E ratios vary dramatically by industry and growth stage. High-growth technology companies might trade at 40-100x earnings because investors expect rapid earnings growth. Mature utilities might trade at 12-18x because growth is limited but stable. Comparing P/E ratios across industries is misleading—always compare within the same sector.\n\nIn case interviews, P/E ratios help with quick company valuations. If a company earns $500M and the industry average P/E is 15x, you can estimate the equity value at $7.5B. This is a useful sanity check alongside DCF analysis. Be aware that P/E doesn\'t work for companies with negative earnings.',
    category: 'finance',
    relatedTerms: ['ebitda', 'dcf-discounted-cash-flow', 'roi-return-on-investment'],
    example:
      'In 2021, Tesla traded at a P/E ratio exceeding 300x while Ford traded at roughly 13x. This massive gap reflected the market\'s belief in Tesla\'s future growth in EVs, energy, and autonomous driving versus Ford\'s mature business.',
  },
  {
    slug: 'dcf-discounted-cash-flow',
    term: 'DCF (Discounted Cash Flow)',
    definition:
      'Discounted Cash Flow is an intrinsic valuation method that estimates the present value of an investment based on its expected future cash flows. By discounting projected free cash flows and a terminal value back to today at an appropriate rate, DCF determines what an asset is fundamentally worth.',
    explanation:
      'DCF is considered the most theoretically sound valuation methodology because it values a company based on the actual cash it will generate, not on market sentiment or comparable transactions. The process involves projecting free cash flows for 5-10 years, estimating a terminal value (the value of all cash flows beyond the projection period), and discounting everything back to present value using the weighted average cost of capital (WACC).\n\nThe terminal value typically accounts for 60-80% of total DCF value, making its assumptions critically important. Two common approaches are the perpetuity growth method (assumes cash flows grow at a constant rate forever) and the exit multiple method (applies an EBITDA multiple at the end of the projection period).\n\nDCF\'s biggest challenge is sensitivity to assumptions. Small changes in the discount rate, growth rate, or margin assumptions can dramatically shift the output. In interviews, acknowledge this by presenting a range of values rather than a single point estimate, and identify which assumptions have the greatest impact on the result.',
    category: 'finance',
    relatedTerms: ['npv-net-present-value', 'ebitda', 'irr-internal-rate-of-return', 'pe-ratio'],
    example:
      'Investment analysts valuing Spotify in 2018 used DCF models projecting 15% subscriber growth, improving margins from -5% to +15% over ten years, and a 9% WACC. Different terminal growth assumptions (2% vs 4%) swung the valuation by over $15B.',
  },
  {
    slug: 'working-capital',
    term: 'Working Capital',
    definition:
      'Working capital is the difference between a company\'s current assets (cash, inventory, accounts receivable) and current liabilities (accounts payable, short-term debt, accrued expenses). It measures short-term liquidity and operational efficiency, indicating whether a company can meet its near-term obligations.',
    explanation:
      'Working capital management is critical for business health. Too little working capital creates liquidity crises—a profitable company can go bankrupt if it cannot pay suppliers on time. Too much working capital means cash is tied up in inventory or receivables instead of being invested productively.\n\nThe three key levers of working capital are: Days Sales Outstanding (DSO)—how quickly customers pay; Days Inventory Outstanding (DIO)—how long inventory sits before being sold; and Days Payable Outstanding (DPO)—how long the company takes to pay suppliers. The Cash Conversion Cycle (CCC = DSO + DIO − DPO) measures the total days between paying for inputs and collecting from customers.\n\nIn case interviews, working capital often appears in operations and profitability cases. A company with deteriorating working capital might be experiencing slowing collections, inventory buildup, or pressure from suppliers demanding faster payment. Optimizing working capital can free up significant cash without any revenue growth—making it a quick win in turnaround situations.',
    category: 'finance',
    relatedTerms: ['burn-rate', 'inventory-turnover', 'supply-chain-management'],
    example:
      'Amazon operates with negative working capital: it collects payment from customers immediately but pays suppliers on 60-90 day terms. This means suppliers effectively finance Amazon\'s operations, freeing billions in cash for investment.',
  },
  {
    slug: 'arpu',
    term: 'ARPU',
    definition:
      'Average Revenue Per User (ARPU) measures the average revenue generated per user or customer over a specific period, typically monthly or annually. It is a key metric for subscription-based businesses and telecoms, providing insight into monetization effectiveness and pricing power across the customer base.',
    explanation:
      'ARPU is calculated by dividing total revenue by the number of active users in a given period. It\'s one of the most important metrics for SaaS, telecom, media, and gaming companies because it directly captures how well the company monetizes its user base. Rising ARPU indicates successful upselling, better pricing, or a shift toward higher-value customers.\n\nARPU can be analyzed along multiple dimensions: by customer segment (enterprise vs. SMB), by geography (developed vs. emerging markets), by product tier (basic vs. premium), or by cohort (new vs. existing customers). These breakdowns reveal important trends that aggregate ARPU might mask.\n\nIn case interviews, ARPU is essential for revenue estimation and market sizing. If you know a telecom has 50M subscribers at $45 ARPU, annual revenue is approximately $27B. When evaluating growth strategies, consider whether ARPU can be increased through premium features, bundling, or reduced discounting—sometimes growing ARPU is more profitable than acquiring new users.',
    category: 'finance',
    relatedTerms: ['unit-economics', 'ltv-lifetime-value', 'churn-rate', 'freemium-model'],
    example:
      'Spotify\'s ARPU differs dramatically between ad-supported users (~$1.50/month) and premium subscribers (~$4.50/month after family plan averaging). This drove the company\'s strategic focus on premium conversion.',
  },
  {
    slug: 'burn-rate',
    term: 'Burn Rate',
    definition:
      'Burn rate is the pace at which a company spends its cash reserves before generating positive cash flow from operations. Gross burn rate is total monthly cash outflow, while net burn rate subtracts any revenue. Combined with cash on hand, it determines the company\'s runway—how many months until funding runs out.',
    explanation:
      'Burn rate is the vital sign of any pre-profitable startup. Investors and board members monitor it closely because it directly determines how much time a company has to reach profitability or secure additional funding. Runway = Cash on Hand / Net Monthly Burn Rate. A company with $10M in the bank burning $500K/month has 20 months of runway.\n\nBurn rate management involves balancing growth investment against survival. Burning too slowly might mean losing market share to faster-moving competitors. Burning too fast might mean running out of cash before achieving product-market fit. The optimal burn rate depends on the company\'s stage, market opportunity, and fundraising environment.\n\nIn case interviews, burn rate questions often appear in startup strategy cases. You might be asked how a startup should allocate a new funding round, when it should cut costs, or whether it should pivot its strategy based on remaining runway. Understanding the relationship between burn rate, revenue growth, and path to profitability is essential.',
    category: 'finance',
    relatedTerms: ['working-capital', 'unit-economics', 'cac-customer-acquisition-cost', 'mvp-minimum-viable-product'],
    example:
      'WeWork was burning approximately $700M per quarter in 2019, with only $2.5B in cash reserves, giving it less than a year of runway. This unsustainable burn rate was a key factor in its failed IPO attempt.',
  },
  {
    slug: 'unit-economics',
    term: 'Unit Economics',
    definition:
      'Unit economics analyzes the direct revenues and costs associated with a single unit of a business model—typically one customer, one transaction, or one product. Positive unit economics mean each incremental unit generates profit, providing the foundation for sustainable scaling.',
    explanation:
      'Unit economics answers the fundamental question: "Does this business make money on each transaction?" If unit economics are positive, scaling the business should increase profits. If negative, scaling only accelerates losses. The "unit" varies by business model: for SaaS it\'s usually a customer (LTV vs. CAC), for e-commerce it\'s an order (revenue minus COGS, shipping, and returns), for marketplaces it\'s a transaction (take rate minus variable costs).\n\nThe LTV:CAC ratio is the most common unit economics metric for subscription businesses. A ratio above 3:1 is generally considered healthy—each dollar spent acquiring a customer generates at least three dollars in lifetime value. The payback period (how many months until CAC is recovered) is equally important, especially for capital-constrained startups.\n\nIn case interviews, unit economics analysis is crucial for evaluating startups, new product launches, and scaling decisions. Many startups have strong top-line growth but terrible unit economics—they lose money on every customer and try to make it up on volume, which never works. Always check unit economics before recommending scale.',
    category: 'finance',
    relatedTerms: ['ltv-lifetime-value', 'cac-customer-acquisition-cost', 'burn-rate', 'profitability-framework'],
    example:
      'DoorDash\'s early unit economics showed a loss of $2-4 per delivery after accounting for driver pay, promotions, and customer support. Profitability required increasing order values, reducing delivery costs through route optimization, and introducing DashPass subscriptions.',
  },
  {
    slug: 'ltv-lifetime-value',
    term: 'LTV (Lifetime Value)',
    definition:
      'Lifetime Value represents the total net revenue a business can expect from a single customer account throughout their entire relationship. It factors in average purchase value, purchase frequency, customer lifespan, and contribution margin to quantify how much each customer relationship is worth.',
    explanation:
      'LTV is calculated in several ways depending on the business model. For subscription businesses: LTV = ARPU × Gross Margin × (1 / Churn Rate). For transactional businesses: LTV = Average Order Value × Purchase Frequency × Average Customer Lifespan × Contribution Margin. The key is capturing the full economic value of a customer, including repeat purchases, upsells, and referrals.\n\nLTV is most powerful when paired with Customer Acquisition Cost (CAC). The LTV:CAC ratio tells you whether your customer relationships generate sufficient value to justify the investment in acquiring them. Venture capitalists closely scrutinize this ratio—a ratio below 1:1 means you\'re destroying value with every customer you acquire.\n\nImproving LTV involves extending customer lifespans (reducing churn), increasing purchase frequency (engagement and loyalty programs), raising average order values (upselling and cross-selling), and improving margins (operational efficiency). In case interviews, understanding the levers for improving LTV demonstrates a holistic view of customer economics.',
    category: 'finance',
    relatedTerms: ['cac-customer-acquisition-cost', 'churn-rate', 'arpu', 'unit-economics'],
    example:
      'Starbucks estimates its average customer LTV at approximately $14,099 over 20 years. This high LTV justifies significant investment in loyalty programs, mobile app development, and premium store experiences.',
  },
  {
    slug: 'cac-customer-acquisition-cost',
    term: 'CAC (Customer Acquisition Cost)',
    definition:
      'Customer Acquisition Cost is the total cost of acquiring a new customer, calculated by dividing all sales and marketing expenses by the number of new customers acquired in a given period. It includes advertising spend, sales team costs, marketing technology, content creation, and related overhead.',
    explanation:
      'CAC is one of the most critical metrics for growth-stage companies. A rising CAC often signals market saturation, increased competition, or inefficient marketing channels. Blended CAC includes all customers (organic and paid), while paid CAC isolates only those acquired through paid channels—the distinction matters because organic acquisition is essentially free.\n\nCAC varies dramatically by industry and acquisition channel. Enterprise SaaS companies might spend $10,000-50,000 per customer due to long sales cycles and dedicated account executives. Consumer apps might spend $1-20 per user through digital advertising. The key is whether the CAC is recoverable through customer revenue within a reasonable payback period.\n\nIn case interviews, CAC analysis appears frequently in marketing strategy and startup evaluation cases. If a company\'s CAC is rising faster than LTV, the business model is deteriorating. Solutions might include optimizing channel mix, improving conversion funnels, investing in organic growth (content marketing, referrals), or focusing on higher-value customer segments.',
    category: 'finance',
    relatedTerms: ['ltv-lifetime-value', 'unit-economics', 'marketing-funnel', 'roi-return-on-investment'],
    example:
      'HubSpot reduced its CAC by 60% over five years by shifting from outbound sales (cold calling, trade shows) to inbound marketing (blog content, free tools, SEO), demonstrating how channel strategy directly impacts acquisition efficiency.',
  },

  // ─────────────────────────────────────────────
  // MARKETING (12)
  // ─────────────────────────────────────────────
  {
    slug: 'stp-segmentation-targeting-positioning',
    term: 'STP (Segmentation, Targeting, Positioning)',
    definition:
      'STP is a three-step marketing framework: Segmentation divides the market into distinct groups with common needs; Targeting selects which segments to serve; and Positioning defines how the brand will be perceived by the target segments relative to competitors. It is the foundation of focused marketing strategy.',
    explanation:
      'STP is one of the most fundamental marketing frameworks taught in every MBA program. Segmentation can be based on demographics (age, income), psychographics (lifestyle, values), behavioral patterns (usage frequency, brand loyalty), or geographic factors. The goal is to identify segments with distinct needs that justify different marketing approaches.\n\nTargeting involves evaluating each segment\'s attractiveness (size, growth, profitability, accessibility) and selecting which segments to pursue. Companies can use mass marketing (one approach for all), differentiated marketing (different approaches for different segments), concentrated marketing (focus on one niche), or micromarketing (customized for individuals).\n\nPositioning is how you want customers to think about your brand relative to alternatives. A positioning statement typically follows: "For [target segment] who [need], [brand] is the [category] that [unique benefit] because [reason to believe]." The positioning should be distinctive, credible, and sustainable. In case interviews, STP analysis is essential for any marketing or market entry case.',
    category: 'marketing',
    relatedTerms: ['brand-positioning', 'market-share', 'tam-sam-som', 'value-proposition'],
    example:
      'Nike uses STP masterfully: segmenting by sport (running, basketball, soccer), targeting serious athletes and aspirational consumers, and positioning as a premium performance brand with the emotional appeal of "Just Do It."',
  },
  {
    slug: '4ps-of-marketing',
    term: "4P's of Marketing",
    definition:
      'The 4P\'s of Marketing—Product, Price, Place, and Promotion—comprise the marketing mix framework that companies use to develop and execute their marketing strategy. Each element must be aligned with the target market\'s needs and the overall positioning to create a coherent and effective go-to-market approach.',
    explanation:
      'Product refers to what you\'re selling—features, quality, design, branding, and packaging. Price encompasses the pricing strategy—premium, penetration, skimming, competitive, or value-based. Place (distribution) covers how the product reaches the customer—direct sales, retail, online, wholesale, or omnichannel. Promotion includes all communication activities—advertising, PR, social media, sales promotions, and personal selling.\n\nThe power of the 4P\'s lies in their interconnectedness. A luxury product demands premium pricing, selective distribution, and aspirational promotion. A mass-market product requires competitive pricing, broad distribution, and awareness-focused promotion. Misalignment between any two P\'s creates confusion and inefficiency.\n\nIn case interviews, the 4P\'s framework is useful for product launch, pricing, and general marketing strategy cases. When analyzing a new product launch, systematically walk through each P and ensure they tell a consistent story. Modern extensions include the 7P\'s (adding People, Process, and Physical Evidence) for service businesses.',
    category: 'marketing',
    relatedTerms: ['go-to-market-strategy', 'brand-positioning', 'market-penetration', 'stp-segmentation-targeting-positioning'],
    example:
      'Apple\'s iPhone marketing mix is perfectly aligned: premium Product (design, ecosystem), premium Price ($999+), selective Place (Apple Stores, carrier partnerships), and aspiration-driven Promotion (minimalist advertising, product launch events).',
  },
  {
    slug: 'tam-sam-som',
    term: 'TAM SAM SOM',
    definition:
      'TAM (Total Addressable Market) is the total market demand for a product. SAM (Serviceable Addressable Market) is the portion of TAM reachable by your business model and geography. SOM (Serviceable Obtainable Market) is the realistic share you can capture in the near term given competition and resources.',
    explanation:
      'TAM-SAM-SOM is the standard framework for market sizing in consulting interviews and startup pitches. TAM represents the theoretical ceiling—if you captured 100% of the market with no competition. SAM narrows this to segments you can actually serve with your current product and business model. SOM is your realistic near-term target based on competitive dynamics and go-to-market capabilities.\n\nTwo approaches exist for calculating TAM: top-down (starting with industry reports and narrowing) and bottom-up (starting with unit economics and scaling). Bottom-up is generally more credible because it forces you to articulate specific assumptions about customer counts, pricing, and adoption rates. In interviews, showing both approaches and triangulating builds confidence in your estimate.\n\nInvestors care most about SOM because it drives near-term revenue projections, but they also want large TAM/SAM to ensure the company has room to grow. A startup with a $100B TAM but $5M SOM needs a clear path to expand from SOM toward SAM. In case interviews, clearly distinguishing between these three levels shows analytical precision.',
    category: 'marketing',
    relatedTerms: ['market-entry-framework', 'market-share', 'market-penetration', 'cagr'],
    example:
      'For an electric scooter startup in India: TAM = entire two-wheeler market ($12B), SAM = urban commuters willing to go electric ($3B), SOM = customers in target cities reachable in year one ($150M).',
  },
  {
    slug: 'brand-equity',
    term: 'Brand Equity',
    definition:
      'Brand equity is the commercial value that derives from consumer perception of a brand name rather than from the product or service itself. It encompasses brand awareness, perceived quality, brand associations, and brand loyalty—collectively determining the premium a brand can command over generic alternatives.',
    explanation:
      'Brand equity is built over years through consistent quality, marketing investment, and customer experiences, but can be destroyed quickly by scandals or quality failures. Keller\'s Brand Equity Model outlines four levels: brand identity (awareness), brand meaning (performance and imagery), brand responses (judgments and feelings), and brand resonance (loyalty and community).\n\nStrong brand equity provides tangible financial benefits: premium pricing (consumers pay more for branded vs. generic), lower customer acquisition costs (brand recognition reduces the need for persuasion), greater channel leverage (retailers want to stock strong brands), and platform for extensions (a trusted brand can stretch into adjacent categories more easily).\n\nIn case interviews, brand equity matters for pricing strategy, market entry, and M&A cases. When evaluating an acquisition, the target\'s brand equity may be a significant portion of its value—and it\'s also fragile and hard to maintain post-acquisition. When advising on pricing, consider how brand equity supports or limits pricing power.',
    category: 'marketing',
    relatedTerms: ['brand-positioning', 'value-proposition', 'market-share', 'competitive-advantage'],
    example:
      'Coca-Cola\'s brand equity is estimated at over $80B by Interbrand. Despite identical blind taste test results with store brands, consumers consistently pay a 50-100% price premium for the Coca-Cola brand.',
  },
  {
    slug: 'market-share',
    term: 'Market Share',
    definition:
      'Market share is the percentage of total industry sales captured by a specific company within a defined market over a given period. It is calculated by dividing the company\'s revenue (or units sold) by the total market revenue (or units), serving as a key indicator of competitive position and relative strength.',
    explanation:
      'Market share is one of the first metrics consultants examine when assessing a company\'s competitive position. It can be measured in revenue terms (value share) or volume terms (unit share)—the distinction matters because a premium player might have high value share but low volume share, and vice versa.\n\nMarket share trends over time tell a powerful story. Gaining share indicates improving competitiveness, while losing share signals strategic or operational problems. However, the definition of the "market" matters enormously. A company might have 50% share of "premium organic yogurt" but only 5% of "all yogurt"—the framing changes the strategic implications entirely.\n\nIn case interviews, market share data often appears in exhibits. Look for relative share (your share vs. the largest competitor\'s share) as well as absolute share. A company with 30% share in a fragmented market of 20 competitors is in a very different position than one with 30% share against a competitor with 40%. BCG Matrix analysis uses relative market share as a key dimension.',
    category: 'marketing',
    relatedTerms: ['tam-sam-som', 'competitive-advantage', 'bcg-matrix', 'market-penetration'],
    example:
      'In the global smartphone market (2023), Samsung held approximately 20% share, Apple 21%, and Chinese brands (Xiaomi, Oppo, Vivo) collectively held about 30%. The remaining 29% was split among dozens of smaller players.',
  },
  {
    slug: 'customer-journey',
    term: 'Customer Journey',
    definition:
      'The customer journey maps every interaction and touchpoint a customer has with a brand, from initial awareness through consideration, purchase, post-purchase experience, and advocacy. It identifies pain points, moments of delight, and opportunities to improve the overall customer experience across all channels.',
    explanation:
      'Customer journey mapping has become a core consulting deliverable, especially for digital transformation engagements. The journey typically follows stages: Awareness (how customers first learn about you), Consideration (evaluating your offering vs. alternatives), Purchase (the transaction experience), Retention (ongoing usage and support), and Advocacy (recommending to others).\n\nModern customer journeys are rarely linear. A customer might see a social media ad, research on a review site, visit a physical store, abandon an online cart, receive a retargeting email, and finally purchase through a mobile app. Mapping these omnichannel paths reveals where customers drop off and where the experience can be improved.\n\nIn case interviews, customer journey analysis is relevant for marketing optimization, customer experience, and digital transformation cases. If a company has low conversion rates or high churn, mapping the customer journey often reveals specific friction points—a confusing website, slow customer service, or a poor onboarding experience—that can be fixed with targeted interventions.',
    category: 'marketing',
    relatedTerms: ['marketing-funnel', 'nps-net-promoter-score', 'cac-customer-acquisition-cost', 'retention-rate'],
    example:
      'IKEA redesigned its customer journey after mapping revealed that 60% of customers found the in-store experience overwhelming. They introduced room-planning tools, a simplified mobile app, and click-and-collect to create multiple easy entry points.',
  },
  {
    slug: 'marketing-funnel',
    term: 'Marketing Funnel',
    definition:
      'The marketing funnel visualizes the customer\'s path from first brand awareness to final purchase, typically structured as Awareness → Interest → Consideration → Intent → Purchase. Each stage narrows as prospects drop off, and analyzing conversion rates between stages reveals where marketing efforts should be focused.',
    explanation:
      'The funnel metaphor captures a fundamental truth: you lose potential customers at every stage. If 10,000 people see your ad, maybe 1,000 click through (10% awareness-to-interest), 200 visit your product page (20% interest-to-consideration), 50 add to cart (25% consideration-to-intent), and 20 purchase (40% intent-to-purchase). Understanding these conversion rates helps allocate marketing spend effectively.\n\nTop-of-funnel (ToFu) activities focus on awareness and reach—brand advertising, social media, PR, and content marketing. Middle-of-funnel (MoFu) activities nurture interest—email campaigns, webinars, case studies, and comparison guides. Bottom-of-funnel (BoFu) activities drive conversion—free trials, demos, discounts, and retargeting ads.\n\nIn case interviews, funnel analysis is powerful for diagnosing marketing problems. If a company has strong awareness but weak conversion, the issue is likely in product positioning or pricing. If awareness is low but conversion is high, the opportunity is in scaling marketing spend. Always quantify the funnel when data is available.',
    category: 'marketing',
    relatedTerms: ['customer-journey', 'cac-customer-acquisition-cost', 'go-to-market-strategy', 'ab-testing'],
    example:
      'Dropbox famously optimized its funnel by introducing a referral program that turned existing users into top-of-funnel generators. This single change reduced CAC by 60% and increased signups by 3,900% over 15 months.',
  },
  {
    slug: 'go-to-market-strategy',
    term: 'Go-to-Market Strategy',
    definition:
      'A go-to-market (GTM) strategy is the plan for launching a product or entering a new market, encompassing target customer identification, value proposition, distribution channels, pricing model, sales approach, and marketing tactics. It translates product strategy into actionable steps for reaching and converting customers.',
    explanation:
      'A GTM strategy bridges the gap between product development and revenue generation. It answers critical questions: Who are we selling to? What problem are we solving for them? How will they discover us? How much will they pay? Through what channels will they buy? What sales model will we use (self-serve, inside sales, enterprise sales)?\n\nThe GTM strategy must align with the product\'s stage and market maturity. A B2B SaaS startup might begin with a product-led growth (PLG) strategy—offering a free tier to drive adoption, then converting users to paid plans. An enterprise software company might invest in a direct sales force targeting CIOs. A consumer product might focus on retail distribution partnerships and brand advertising.\n\nIn case interviews, GTM strategy cases test your ability to think holistically about commercialization. Strong candidates consider not just how to acquire initial customers but how to scale acquisition efficiently, when to expand into adjacent segments, and how to build defensible advantages through network effects or switching costs.',
    category: 'marketing',
    relatedTerms: ['market-entry-framework', '4ps-of-marketing', 'product-market-fit', 'marketing-funnel'],
    relatedCasebookPages: ['market-entry', 'pricing-strategy'],
    example:
      'Zoom\'s GTM strategy combined product-led growth (free tier for meetings under 40 minutes), viral adoption (every meeting participant experienced the product), and enterprise sales for large organizations, enabling hyper-growth even before the pandemic.',
  },
  {
    slug: 'product-market-fit',
    term: 'Product-Market Fit',
    definition:
      'Product-market fit describes the degree to which a product satisfies strong market demand. Achieved when customers enthusiastically adopt, use, and recommend a product without heavy persuasion, it is the milestone after which scaling becomes viable. Without it, growth efforts are premature and unsustainable.',
    explanation:
      'Marc Andreessen described product-market fit as "being in a good market with a product that can satisfy that market." You know you have it when customers are pulling the product from you rather than you pushing it. Quantitative signals include strong retention curves that flatten (not decline to zero), high Net Promoter Scores, organic growth through word-of-mouth, and decreasing CAC over time.\n\nSean Ellis proposed a simple survey: ask users "How would you feel if you could no longer use this product?" If 40%+ answer "very disappointed," you likely have product-market fit. Below that threshold, the product needs iteration before scaling.\n\nIn case interviews, product-market fit is critical for evaluating startup strategies and new product launches. Recommending aggressive marketing spend before achieving product-market fit is a red flag—you\'re essentially pouring fuel on a fire that hasn\'t started. The correct sequence is: find product-market fit first (through rapid iteration and customer feedback), then scale aggressively.',
    category: 'marketing',
    relatedTerms: ['value-proposition', 'mvp-minimum-viable-product', 'go-to-market-strategy', 'nps-net-promoter-score'],
    example:
      'Airbnb iterated for two years before finding product-market fit. The breakthrough came when founders personally visited hosts in New York to improve listing photos, which dramatically increased bookings and proved the concept.',
  },
  {
    slug: 'nps-net-promoter-score',
    term: 'NPS (Net Promoter Score)',
    definition:
      'Net Promoter Score measures customer loyalty by asking "How likely are you to recommend this product/service to a friend?" on a 0-10 scale. Respondents are classified as Promoters (9-10), Passives (7-8), or Detractors (0-6). NPS equals the percentage of Promoters minus the percentage of Detractors.',
    explanation:
      'NPS has become the standard metric for customer satisfaction and loyalty across industries. Scores range from -100 (all detractors) to +100 (all promoters). A score above 0 is acceptable, above 30 is good, above 50 is excellent, and above 70 is world-class. However, benchmarks vary significantly by industry—SaaS companies average 30-40, while airlines average 20-30.\n\nThe power of NPS lies in its simplicity and predictive value. Research by Bain & Company (which created NPS) shows strong correlation between NPS and revenue growth—companies with the highest NPS in their industry tend to grow at 2-3x the industry average. The follow-up question "Why?" provides qualitative insights for improvement.\n\nIn case interviews, NPS data might appear in customer analytics exhibits. A declining NPS signals deteriorating customer satisfaction and predicts future churn. When advising on customer experience improvements, NPS provides a single metric to track progress. However, be aware of NPS limitations—it\'s a lagging indicator and doesn\'t capture the full customer experience.',
    category: 'marketing',
    relatedTerms: ['customer-journey', 'churn-rate', 'retention-rate', 'product-market-fit'],
    example:
      'Tesla consistently achieves NPS scores above 95—nearly every customer is a promoter. This extraordinary score drives organic referrals and has historically allowed Tesla to spend $0 on traditional advertising.',
  },
  {
    slug: 'market-penetration',
    term: 'Market Penetration',
    definition:
      'Market penetration measures the percentage of a target market that a company has captured, or refers to the strategy of increasing market share within existing markets. As a metric, it is current customers divided by total potential customers. As a strategy, it involves selling more of current products to current market segments.',
    explanation:
      'Market penetration is the lowest-risk growth strategy in the Ansoff Matrix because it leverages existing products and markets. Tactics include competitive pricing, increased marketing spend, loyalty programs, improved distribution, and product improvements. The goal is to grow share within the current market before venturing into new products or markets.\n\nPenetration rate is a crucial metric for understanding growth potential. If a product category has 30% penetration, there\'s significant room for growth within the existing market. If penetration is 90%, growth must come from taking competitor share, increasing usage frequency, or entering new markets.\n\nIn case interviews, distinguishing between growth through penetration versus growth through expansion is important. If a company hasn\'t fully penetrated its core market, recommending expansion into new markets may be premature. Strong candidates calculate the remaining penetration opportunity and compare it to expansion alternatives based on ROI and risk.',
    category: 'marketing',
    relatedTerms: ['market-share', 'ansoff-matrix', 'growth-strategy', 'tam-sam-som'],
    example:
      'India\'s smartphone penetration grew from 25% in 2016 to over 60% by 2023, representing a massive market expansion opportunity that Xiaomi captured by offering feature-rich phones at aggressive price points.',
  },
  {
    slug: 'brand-positioning',
    term: 'Brand Positioning',
    definition:
      'Brand positioning is the strategic process of establishing a distinct and valued place for a brand in the target customer\'s mind relative to competitors. It defines what the brand stands for, how it differs from alternatives, and why the target audience should choose it, guiding all marketing and product decisions.',
    explanation:
      'A positioning statement typically follows the format: "For [target audience], [brand] is the [frame of reference] that [point of difference] because [reasons to believe]." The positioning must be relevant to customers, differentiated from competitors, and credible based on the company\'s actual capabilities.\n\nPositioning exists on a spectrum from functional (based on product attributes and performance) to emotional (based on feelings and self-expression). Volvo owns "safety," BMW owns "driving pleasure," and Tesla owns "sustainable innovation." These positions were built deliberately through consistent product decisions, marketing communications, and customer experiences.\n\nIn case interviews, brand positioning is relevant for market entry, product launch, and competitive strategy cases. When recommending a positioning, consider: Is the position available (not already owned by a competitor)? Is it meaningful to customers? Can the company credibly deliver on the promise? Is it sustainable as the market evolves? A position that fails any of these tests will not succeed.',
    category: 'marketing',
    relatedTerms: ['stp-segmentation-targeting-positioning', 'brand-equity', 'value-proposition', 'competitive-advantage'],
    example:
      'Dollar Shave Club positioned itself as the anti-Gillette: affordable, convenient, and no-nonsense. This positioning attracted price-conscious consumers tired of expensive razor blades, ultimately leading to Unilever\'s $1B acquisition.',
  },

  // ─────────────────────────────────────────────
  // OPERATIONS (12)
  // ─────────────────────────────────────────────
  {
    slug: 'value-chain',
    term: 'Value Chain',
    definition:
      'The value chain, developed by Michael Porter, describes the full range of activities a company performs to bring a product from conception to delivery and beyond. Primary activities include inbound logistics, operations, outbound logistics, marketing/sales, and service. Support activities include procurement, technology, HR, and infrastructure.',
    explanation:
      'Value chain analysis helps identify where a company creates value and where inefficiencies exist. By mapping costs and margins at each stage, you can pinpoint activities where the company has a competitive advantage and those where it might be better to outsource or restructure.\n\nIn consulting, value chain analysis is used for cost reduction, competitive benchmarking, and strategic positioning. If a competitor achieves lower costs at the same quality level, comparing value chains reveals where the difference lies—perhaps in procurement (better supplier relationships), operations (more efficient manufacturing), or distribution (direct-to-consumer vs. wholesale).\n\nModern value chain analysis extends beyond a single company to the entire industry value chain. Understanding how value is distributed among suppliers, manufacturers, distributors, and retailers reveals margin pools and strategic opportunities. In case interviews, asking "Where in the value chain does the company operate?" is often a strong opening move.',
    category: 'operations',
    relatedTerms: ['supply-chain-management', 'lean-manufacturing', 'outsourcing', 'competitive-advantage'],
    example:
      'Zara\'s value chain is vertically integrated: it designs, manufactures, and retails its own clothing. This integration enables a 2-3 week design-to-shelf cycle versus 6-9 months for competitors, creating a powerful fast-fashion advantage.',
  },
  {
    slug: 'supply-chain-management',
    term: 'Supply Chain Management',
    definition:
      'Supply chain management (SCM) encompasses the planning, execution, and optimization of all activities involved in sourcing, procurement, manufacturing, and delivery of products from raw materials to end consumers. It coordinates flows of materials, information, and finances across the entire network of suppliers, factories, and distribution centers.',
    explanation:
      'Effective SCM balances three competing objectives: cost efficiency (minimizing total supply chain costs), responsiveness (meeting customer demand quickly), and resilience (maintaining operations during disruptions). The optimal balance depends on the product and market—fashion products require responsiveness, commodity products require cost efficiency, and critical components require resilience.\n\nModern supply chain management leverages technology extensively: demand forecasting using AI/ML, real-time inventory visibility through IoT sensors, blockchain for traceability, and digital twins for simulation and optimization. The COVID-19 pandemic exposed vulnerabilities in global supply chains and accelerated investment in diversification and nearshoring.\n\nIn case interviews, supply chain questions often involve optimizing distribution networks, reducing inventory costs, improving delivery times, or managing supplier risk. Key metrics include total cost to serve, order fulfillment rate, inventory days on hand, and on-time delivery percentage. Strong candidates consider trade-offs between efficiency and resilience.',
    category: 'operations',
    relatedTerms: ['value-chain', 'lean-manufacturing', 'just-in-time', 'outsourcing'],
    example:
      'Toyota\'s supply chain management approach emphasizes long-term supplier partnerships, just-in-time delivery, and continuous improvement. However, the 2011 Fukushima earthquake revealed concentration risks, prompting Toyota to diversify its supplier base across multiple regions.',
  },
  {
    slug: 'lean-manufacturing',
    term: 'Lean Manufacturing',
    definition:
      'Lean manufacturing is a production methodology focused on minimizing waste within a manufacturing system while simultaneously maximizing productivity. Originating from Toyota\'s Production System, it identifies and eliminates seven types of waste: overproduction, waiting, transportation, over-processing, inventory, motion, and defects.',
    explanation:
      'Lean manufacturing\'s core principle is that any activity not directly creating value for the customer is waste and should be eliminated. The seven wastes (muda in Japanese) provide a systematic checklist for identifying inefficiencies. Beyond waste elimination, lean also addresses unevenness (mura) and overburdening (muri) to create smooth, sustainable production flows.\n\nKey lean tools include value stream mapping (visualizing the entire production process), 5S (Sort, Set in order, Shine, Standardize, Sustain for workplace organization), kanban (visual signals for production and inventory management), kaizen (continuous small improvements), and poka-yoke (mistake-proofing).\n\nLean principles have expanded far beyond manufacturing into services, healthcare, software development, and government. In case interviews, lean thinking is relevant for any operations optimization case. The mindset of questioning every step—"Does this add value for the customer?"—helps you identify improvement opportunities quickly.',
    category: 'operations',
    relatedTerms: ['six-sigma', 'just-in-time', 'bottleneck-analysis', 'total-quality-management'],
    example:
      'Virginia Mason Medical Center in Seattle applied lean manufacturing principles to healthcare, reducing patient wait times by 50%, inventory costs by $1M annually, and walking distance for nurses by 60% through redesigned floor layouts.',
  },
  {
    slug: 'six-sigma',
    term: 'Six Sigma',
    definition:
      'Six Sigma is a data-driven quality management methodology that aims to reduce process variation and defects to near-perfection—3.4 defects per million opportunities. It uses the DMAIC framework (Define, Measure, Analyze, Improve, Control) to systematically identify root causes of quality problems and implement sustainable solutions.',
    explanation:
      'Six Sigma was pioneered by Motorola in the 1980s and popularized by GE under Jack Welch. The methodology is grounded in statistical analysis—"sigma" refers to standard deviations from the mean, and six sigma represents a process that is 99.99966% defect-free. Practitioners are certified in a belt system: Yellow Belt (basics), Green Belt (project team member), Black Belt (project leader), and Master Black Belt (program leader).\n\nThe DMAIC framework provides a structured approach: Define the problem and customer requirements; Measure current performance and collect data; Analyze data to identify root causes; Improve the process by implementing solutions; Control the improved process to sustain gains. Each phase has specific tools—from voice of the customer in Define to statistical process control charts in Control.\n\nIn case interviews, Six Sigma concepts are relevant for quality improvement and operational efficiency cases. While you won\'t be expected to perform statistical analysis, understanding the DMAIC framework and the concept of reducing variation demonstrates operational acumen. Six Sigma is often combined with lean manufacturing in "Lean Six Sigma."',
    category: 'operations',
    relatedTerms: ['lean-manufacturing', 'total-quality-management', 'bottleneck-analysis', 'benchmarking'],
    example:
      'GE saved over $12B in the first five years of its Six Sigma program. One notable project reduced aircraft engine blade defects from 25,000 per million to under 4 per million, dramatically improving reliability and reducing warranty costs.',
  },
  {
    slug: 'bottleneck-analysis',
    term: 'Bottleneck Analysis',
    definition:
      'Bottleneck analysis identifies the constraining step in a process that limits overall throughput and capacity. Based on the Theory of Constraints, it recognizes that a system can only produce at the rate of its slowest component, making bottleneck identification and resolution the highest-leverage improvement opportunity.',
    explanation:
      'Every process has a bottleneck—the step that takes the longest or has the least capacity. Improving any step that is not the bottleneck will not increase overall throughput. This counterintuitive principle is why many improvement efforts fail: they optimize non-bottleneck steps while the true constraint remains unchanged.\n\nThe Theory of Constraints (developed by Eli Goldratt) provides a five-step approach: (1) Identify the bottleneck, (2) Exploit it (maximize its throughput with existing resources), (3) Subordinate everything else to it (align all other steps to feed the bottleneck optimally), (4) Elevate the bottleneck (invest in expanding its capacity), (5) Repeat (find the new bottleneck).\n\nIn case interviews, bottleneck analysis appears in manufacturing, service operations, and process improvement cases. If a factory can produce 1,000 units/day but only ships 700, finding the bottleneck tells you exactly where to focus. Common bottlenecks include machine capacity, labor availability, quality inspection, or approval processes.',
    category: 'operations',
    relatedTerms: ['throughput', 'capacity-utilization', 'lean-manufacturing', 'six-sigma'],
    example:
      'A hospital emergency department found that the bottleneck was not doctors (who had idle time) but the CT scanner (90% utilization with long queues). Adding a second scanner increased patient throughput by 35% without hiring additional physicians.',
  },
  {
    slug: 'capacity-utilization',
    term: 'Capacity Utilization',
    definition:
      'Capacity utilization measures the extent to which a company uses its installed productive capacity, expressed as a percentage of maximum output. Calculated as (Actual Output / Maximum Possible Output) × 100, it indicates whether a company has room to grow production without additional capital investment or is constrained.',
    explanation:
      'Optimal capacity utilization typically ranges from 80-90%. Below 80%, fixed costs are spread over too few units, raising per-unit costs and hurting margins. Above 90%, the system has little buffer for demand spikes, maintenance, or disruptions, leading to quality issues and employee burnout.\n\nCapacity utilization varies across industries and has strategic implications. Airlines aim for high load factors (85%+) because empty seats are perishable revenue. Hotels target 70-80% occupancy to maintain service quality. Manufacturing plants might target 85% to allow for maintenance windows and demand variability.\n\nIn case interviews, capacity utilization is critical for investment decisions. Before recommending that a company build a new factory, check whether existing capacity is fully utilized. If a plant is running at 65% utilization, the better recommendation might be demand generation or production consolidation rather than capacity expansion.',
    category: 'operations',
    relatedTerms: ['bottleneck-analysis', 'throughput', 'lean-manufacturing', 'profitability-framework'],
    example:
      'During the 2020 pandemic, US airline capacity utilization dropped from 87% to below 30%. Airlines that quickly reduced capacity (parking planes, cutting routes) preserved cash better than those that maintained schedules hoping for demand recovery.',
  },
  {
    slug: 'inventory-turnover',
    term: 'Inventory Turnover',
    definition:
      'Inventory turnover measures how many times a company sells and replaces its inventory within a given period. Calculated as Cost of Goods Sold divided by Average Inventory, a higher ratio indicates efficient inventory management with products moving quickly from shelf to customer, minimizing carrying costs and obsolescence risk.',
    explanation:
      'Inventory turnover varies dramatically by industry. Grocery stores might turn inventory 15-20 times per year (perishable goods move quickly), while jewelers might turn inventory 1-2 times (high-value items sell slowly). Comparing turnover within an industry reveals operational efficiency differences between competitors.\n\nLow inventory turnover signals potential problems: excess stock, obsolete products, weak demand, or poor purchasing decisions. The costs of holding inventory include warehousing, insurance, capital tied up, spoilage, and obsolescence. These carrying costs typically run 20-30% of inventory value annually.\n\nIn case interviews, inventory turnover is relevant for retail, manufacturing, and supply chain cases. If a retailer\'s inventory turnover has declined from 8x to 5x, investigate why: has assortment expanded too broadly? Are markdowns being delayed? Is the buying team over-ordering? Each root cause has a different solution. Days Inventory Outstanding (365 / Inventory Turnover) converts the ratio to a more intuitive metric.',
    category: 'operations',
    relatedTerms: ['working-capital', 'supply-chain-management', 'just-in-time', 'lean-manufacturing'],
    example:
      'Costco achieves inventory turnover of approximately 12x annually—merchandise sits on the floor for only about 30 days. This rapid turnover is possible because Costco carries only 3,800 SKUs versus 30,000+ at a typical supermarket.',
  },
  {
    slug: 'lead-time',
    term: 'Lead Time',
    definition:
      'Lead time is the total elapsed time from when a process begins until it is completed, or more specifically, from when a customer places an order until they receive the product. It encompasses processing time, waiting time, inspection time, and transportation time across the entire fulfillment chain.',
    explanation:
      'Lead time is a critical competitive differentiator in many industries. Amazon\'s dominance in e-commerce is built significantly on short lead times—Prime delivery in one or two days set a new standard that competitors struggle to match. In B2B contexts, shorter lead times mean customers can hold less safety stock, reducing their costs.\n\nLead time consists of multiple components, and reducing it requires analyzing each one. Order processing time (how long to confirm and initiate the order), manufacturing time (production and assembly), quality inspection time, packaging and shipping time, and delivery time all contribute. Often the majority of lead time is waiting, not processing.\n\nIn case interviews, lead time reduction cases are common. Key strategies include parallel processing (doing steps simultaneously rather than sequentially), eliminating non-value-added steps, pre-positioning inventory closer to customers, improving demand forecasting, and investing in automation. The goal is to compress the total time without sacrificing quality.',
    category: 'operations',
    relatedTerms: ['throughput', 'just-in-time', 'supply-chain-management', 'bottleneck-analysis'],
    example:
      'Domino\'s Pizza reduced its lead time from 45 minutes to under 25 minutes by redesigning kitchen layouts, pre-preparing dough, and optimizing delivery routes with GPS tracking, directly increasing customer satisfaction and repeat orders.',
  },
  {
    slug: 'throughput',
    term: 'Throughput',
    definition:
      'Throughput is the rate at which a system produces its output over a specific period of time. In manufacturing, it is units produced per hour or day. In services, it might be customers served per hour or transactions processed per minute. It is the primary measure of a system\'s productive capacity.',
    explanation:
      'Throughput is determined by the system\'s bottleneck—the slowest step in the process. No matter how fast other steps operate, total throughput cannot exceed the capacity of the bottleneck. This is why the Theory of Constraints focuses exclusively on identifying and improving the bottleneck to increase overall throughput.\n\nThroughput should be distinguished from capacity (maximum possible output) and output (actual production including defective units). Effective throughput accounts for quality—if a machine produces 100 units per hour but 10% are defective, effective throughput is only 90 good units per hour.\n\nIn case interviews, throughput analysis is essential for operations cases. You might be asked to increase a factory\'s throughput by 20% or to evaluate whether a process redesign will improve throughput enough to justify the investment. Understanding Little\'s Law (Throughput = Work in Progress / Lead Time) provides a powerful analytical tool for relating throughput, inventory, and cycle time.',
    category: 'operations',
    relatedTerms: ['bottleneck-analysis', 'capacity-utilization', 'lead-time', 'lean-manufacturing'],
    example:
      'Tesla\'s Fremont factory increased Model 3 throughput from 2,000 to 5,000 cars per week in 2018 by identifying and resolving bottlenecks in body welding, paint shop flow, and battery module assembly.',
  },
  {
    slug: 'outsourcing',
    term: 'Outsourcing',
    definition:
      'Outsourcing is the business practice of contracting an external organization to perform functions or produce goods that were previously handled internally. Companies outsource to reduce costs, access specialized expertise, increase flexibility, or focus internal resources on core competencies that drive competitive advantage.',
    explanation:
      'The outsourcing decision should be guided by strategic importance and competitive advantage. Activities that are core to the company\'s value proposition should generally be kept in-house. Non-core activities that can be performed more efficiently by specialists are candidates for outsourcing. For example, most companies outsource payroll processing but keep product development internal.\n\nOutsourcing comes with risks: loss of control over quality, dependency on vendors, potential IP leakage, communication challenges, and hidden transition costs. Total cost analysis should include not just the vendor\'s price but also management overhead, quality monitoring, transition costs, and the cost of potential service failures.\n\nIn case interviews, outsourcing decisions require a balanced analysis of cost savings versus strategic risks. Consider using a make-vs-buy framework: compare the total cost of internal provision versus external procurement, then layer in strategic factors like quality control, flexibility, knowledge retention, and vendor dependency. The trend toward nearshoring (outsourcing to nearby countries) reflects growing emphasis on supply chain resilience.',
    category: 'operations',
    relatedTerms: ['value-chain', 'supply-chain-management', 'lean-manufacturing', 'competitive-advantage'],
    example:
      'Apple outsources 100% of iPhone manufacturing to Foxconn and other contract manufacturers while keeping chip design (A-series processors), software (iOS), and retail experience in-house. This allows Apple to focus on design and ecosystem while leveraging manufacturing scale it couldn\'t build alone.',
  },
  {
    slug: 'just-in-time',
    term: 'Just-in-Time',
    definition:
      'Just-in-Time (JIT) is an inventory management strategy that aligns raw material orders with production schedules so materials arrive exactly when needed in the manufacturing process. By minimizing inventory on hand, JIT reduces carrying costs, waste, and capital tied up in stock, but requires highly reliable suppliers.',
    explanation:
      'JIT was developed as part of Toyota\'s Production System and revolutionized manufacturing worldwide. Instead of maintaining large safety stocks, JIT relies on precise demand forecasting, reliable suppliers, short lead times, and smooth production flows. The ideal state is zero inventory—every component arrives just as it is needed on the production line.\n\nThe benefits of JIT are significant: reduced warehousing costs, less capital tied up in inventory, fewer obsolete goods, quicker identification of quality defects (since there is no buffer stock masking problems), and more factory floor space. However, JIT assumes a stable, predictable environment and highly reliable suppliers.\n\nThe COVID-19 pandemic exposed JIT\'s vulnerability to supply chain disruptions. When semiconductor suppliers halted production, automakers using JIT had no buffer stock and had to idle factories for months. This has led many companies to adopt "Just-in-Case" strategies—maintaining strategic safety stocks for critical components while keeping JIT for others.',
    category: 'operations',
    relatedTerms: ['lean-manufacturing', 'supply-chain-management', 'inventory-turnover', 'lead-time'],
    example:
      'Toyota\'s JIT system kept only 2-4 hours of parts inventory at assembly plants. When the 2011 tsunami disrupted suppliers, Toyota lost an estimated $1.2B in production. They subsequently adopted a hybrid approach with strategic buffers for critical components.',
  },
  {
    slug: 'total-quality-management',
    term: 'Total Quality Management',
    definition:
      'Total Quality Management (TQM) is an organization-wide approach to continuous quality improvement in all processes, products, and services. It engages every employee from top management to frontline workers in a culture of quality, using data-driven methods to meet or exceed customer expectations consistently.',
    explanation:
      'TQM is built on several core principles: customer focus (quality is defined by the customer), total employee involvement (everyone is responsible for quality), process-centered thinking (focus on the process, not just outcomes), integrated system approach (all functions contribute to quality), strategic and systematic planning, continual improvement, fact-based decision making, and effective communication.\n\nTQM tools include statistical process control (SPC), Pareto analysis (80/20 rule for prioritizing quality issues), fishbone diagrams (root cause analysis), quality function deployment (translating customer needs into product specifications), and plan-do-check-act (PDCA) cycles. These tools provide systematic methods for identifying, analyzing, and resolving quality problems.\n\nIn case interviews, TQM concepts are relevant when discussing quality improvement, cost reduction (poor quality has direct costs like rework and indirect costs like customer churn), and cultural transformation. Companies known for TQM excellence—Toyota, Samsung, Motorola—demonstrate that quality and profitability are mutually reinforcing, not trade-offs.',
    category: 'operations',
    relatedTerms: ['six-sigma', 'lean-manufacturing', 'benchmarking', 'balanced-scorecard'],
    example:
      'Samsung\'s TQM transformation in the late 1990s shifted the brand from cheap electronics to premium quality. CEO Lee Kun-hee famously burned $50M worth of defective products in front of employees, signaling that quality was non-negotiable.',
  },

  // ─────────────────────────────────────────────
  // PRODUCT (12)
  // ─────────────────────────────────────────────
  {
    slug: 'product-roadmap',
    term: 'Product Roadmap',
    definition:
      'A product roadmap is a strategic document that communicates the vision, direction, and planned evolution of a product over time. It outlines key features, milestones, and timelines, aligning stakeholders around priorities and providing a high-level view of how the product will develop to meet business and customer goals.',
    explanation:
      'Product roadmaps serve different audiences and come in multiple formats. An executive roadmap focuses on strategic themes and business outcomes. A development roadmap details features, technical requirements, and sprint timelines. A customer-facing roadmap highlights upcoming capabilities to drive engagement and retention.\n\nEffective roadmaps are living documents that balance certainty with flexibility. Near-term items (current quarter) should be well-defined with specific features and delivery dates. Medium-term items (next two quarters) should be directional themes with rough timing. Long-term items (6-12 months) should be strategic goals without specific feature commitments.\n\nIn case interviews, product roadmap discussions test prioritization skills. Given limited engineering resources, which features should be built first? Strong candidates use frameworks like RICE (Reach, Impact, Confidence, Effort) or ICE (Impact, Confidence, Ease) to systematically evaluate and rank options, balancing customer value, business impact, and technical feasibility.',
    category: 'product',
    relatedTerms: ['feature-prioritization', 'sprint-planning', 'mvp-minimum-viable-product', 'agile-methodology'],
    example:
      'Notion\'s product roadmap balanced user demands (offline mode, API access) with strategic bets (AI integration, enterprise features). By transparently sharing their roadmap, they maintained community enthusiasm during longer development cycles.',
  },
  {
    slug: 'mvp-minimum-viable-product',
    term: 'MVP (Minimum Viable Product)',
    definition:
      'A Minimum Viable Product is the simplest version of a product that delivers enough core value to attract early adopters and validate key business hypotheses. It contains only essential features needed to test product-market fit, enabling rapid learning through real user feedback while minimizing development time and cost.',
    explanation:
      'The MVP concept, popularized by Eric Ries in The Lean Startup, challenges the traditional approach of building full-featured products before launching. Instead, an MVP strips the product to its core value proposition. The goal is not to build a small product but to maximize learning with minimum effort. An MVP might be a landing page, a concierge service, or a basic working prototype.\n\nThe key is defining "viable" correctly. An MVP must deliver enough value that early adopters will use it and provide meaningful feedback. A product that is too minimal won\'t attract users or generate useful data. A product that is too polished wastes time and resources on features users might not want.\n\nIn case interviews, MVP thinking is relevant for product launch, startup strategy, and innovation cases. Recommending an MVP approach demonstrates practical business sense—test assumptions before committing major resources. Strong candidates can articulate what the MVP would include and exclude, what hypotheses it would test, and what success metrics would trigger further investment.',
    category: 'product',
    relatedTerms: ['product-market-fit', 'agile-methodology', 'ab-testing', 'product-lifecycle'],
    example:
      'Zappos founder Nick Swinmurn tested the MVP concept by posting photos of shoes from local stores online. When orders came in, he bought the shoes at retail price and shipped them. This validated demand for online shoe buying before investing in inventory.',
  },
  {
    slug: 'agile-methodology',
    term: 'Agile Methodology',
    definition:
      'Agile methodology is an iterative approach to project management and software development that emphasizes flexibility, collaboration, and continuous delivery of working increments. It breaks projects into short cycles called sprints, enabling teams to adapt to changing requirements and deliver value to users incrementally.',
    explanation:
      'Agile emerged as a response to traditional "waterfall" development, where requirements were fully defined upfront, and the entire product was built before any testing with users. Agile reverses this: define a small scope, build it quickly (in 1-4 week sprints), test with real users, learn, and repeat. The Agile Manifesto prioritizes individuals and interactions, working software, customer collaboration, and responding to change.\n\nCommon Agile frameworks include Scrum (with roles like Product Owner, Scrum Master, and structured ceremonies like sprint planning, daily standups, and retrospectives), Kanban (continuous flow with visual work-in-progress limits), and SAFe (Scaled Agile Framework for large organizations). Each has specific practices suited to different team sizes and contexts.\n\nIn case interviews, Agile concepts appear in technology, product development, and organizational transformation cases. Understanding Agile is important because many companies undergo Agile transformations—shifting from waterfall to iterative development affects team structure, budgeting, vendor management, and performance measurement.',
    category: 'product',
    relatedTerms: ['sprint-planning', 'mvp-minimum-viable-product', 'user-story', 'product-roadmap'],
    example:
      'ING Bank\'s Agile transformation reorganized 3,500 employees from functional silos into 350 cross-functional "squads" of 9 people. Time-to-market for new features dropped from months to weeks, and employee engagement scores increased by 20%.',
  },
  {
    slug: 'ab-testing',
    term: 'A/B Testing',
    definition:
      'A/B testing is a controlled experiment that compares two variants (A and B) of a webpage, feature, or marketing element to determine which performs better on a specific metric. By randomly splitting users between variants and measuring outcomes, it provides statistically rigorous evidence for product and marketing decisions.',
    explanation:
      'A/B testing removes guesswork from product and marketing decisions. Instead of debating whether a blue or green button converts better, you test both with real users and let data decide. The process involves forming a hypothesis, designing variants, determining sample size for statistical significance, running the experiment, and analyzing results.\n\nStatistical rigor is critical. Common mistakes include stopping tests too early (reaching false conclusions from insufficient data), testing too many variables simultaneously without proper multivariate design, ignoring novelty effects (users might engage with a new design simply because it\'s different), and not accounting for seasonal or time-of-day effects.\n\nIn case interviews, A/B testing demonstrates data-driven decision-making. If a company wants to improve its website conversion rate, recommending an A/B testing program shows practical thinking. Companies like Google, Netflix, and Amazon run thousands of A/B tests simultaneously—every change is tested rather than assumed to be better.',
    category: 'product',
    relatedTerms: ['marketing-funnel', 'churn-rate', 'product-market-fit', 'feature-prioritization'],
    example:
      'Obama\'s 2008 presidential campaign used A/B testing on donation page designs. The winning variant (a family photo instead of a video, and "Learn More" instead of "Sign Up") increased donation conversions by 40%, generating an additional $60M in contributions.',
  },
  {
    slug: 'churn-rate',
    term: 'Churn Rate',
    definition:
      'Churn rate measures the percentage of customers who stop using a product or service during a given time period. Calculated as (Customers Lost / Total Customers at Start) × 100, it is the inverse of retention and a critical health metric for subscription businesses where recurring revenue depends on keeping existing customers.',
    explanation:
      'Churn rate directly impacts growth and valuation. If a SaaS company acquires 100 new customers per month but churns 80, net growth is only 20. Reducing churn from 5% monthly to 3% monthly has a far greater impact on long-term revenue than most acquisition strategies. This is why investors scrutinize churn rates—a company with 2% monthly churn loses 22% of its customer base annually.\n\nChurn analysis should distinguish between voluntary churn (customers actively canceling) and involuntary churn (failed payments, expired cards). It should also examine churn by cohort—if newer cohorts churn faster than older ones, the product might be attracting the wrong customers or quality is declining. Logo churn (number of customers lost) and revenue churn (revenue from lost customers) can tell different stories.\n\nIn case interviews, churn analysis is essential for subscription business cases. If a company has high churn, investigate root causes through customer surveys, usage data, and cohort analysis. Common solutions include improving onboarding, adding engagement features, implementing customer success programs, adjusting pricing, and building switching costs.',
    category: 'product',
    relatedTerms: ['retention-rate', 'ltv-lifetime-value', 'nps-net-promoter-score', 'arpu'],
    example:
      'Netflix maintains monthly churn below 2.5% in the US—remarkably low for a subscription service. They achieve this through personalized content recommendations, continuous original content investment, and a seamless user experience.',
  },
  {
    slug: 'retention-rate',
    term: 'Retention Rate',
    definition:
      'Retention rate measures the percentage of customers who continue using a product or service over a given period. It is the complement of churn rate (Retention = 1 − Churn) and indicates product stickiness, customer satisfaction, and the sustainability of a business\'s revenue base over time.',
    explanation:
      'Retention is often more important than acquisition for long-term business success. Research shows acquiring a new customer costs 5-25x more than retaining an existing one, and increasing retention by just 5% can boost profits by 25-95% (Harvard Business Review). This is why retention rate is considered the most fundamental product health metric.\n\nRetention curves show the percentage of a cohort that remains active over time. A healthy product shows a retention curve that flattens (indicating a core group of loyal users), while an unhealthy product shows a curve that continues declining toward zero. The shape of this curve reveals whether the product has achieved genuine product-market fit.\n\nIn case interviews, analyze retention across dimensions: by customer segment, acquisition channel, product tier, and time cohort. This reveals whether certain types of customers are better fits and whether retention is improving or deteriorating over time. Strategies to improve retention include enhancing onboarding, creating habit loops, building community, personalizing experiences, and implementing loyalty programs.',
    category: 'product',
    relatedTerms: ['churn-rate', 'ltv-lifetime-value', 'nps-net-promoter-score', 'product-market-fit'],
    example:
      'Duolingo achieves 55% Day-1 retention and approximately 12% Day-30 retention through gamification elements—streaks, leaderboards, hearts, and push notifications—that create daily habits and social accountability.',
  },
  {
    slug: 'freemium-model',
    term: 'Freemium Model',
    definition:
      'The freemium model offers a basic version of a product for free while charging for premium features, capacity, or functionality. It aims to attract a large user base with the free tier and convert a percentage to paying customers, using the product itself as the primary marketing and sales channel.',
    explanation:
      'Freemium economics depend on three critical metrics: free-to-paid conversion rate, cost of serving free users, and premium ARPU. Typical conversion rates range from 2-5% for consumer products to 10-25% for B2B tools. The free tier must deliver enough value to attract and retain users while creating clear motivation to upgrade—through usage limits, feature gates, or capacity restrictions.\n\nThe strategic advantage of freemium is product-led growth (PLG): users experience value before making a purchase decision, reducing sales friction and CAC. Free users also serve as brand advocates, driving organic growth through word-of-mouth and network effects. The strategic risk is that free users consume resources without converting, creating a cost burden that can overwhelm the business.\n\nIn case interviews, freemium model questions test your understanding of conversion economics and pricing strategy. Key decisions include: What goes in the free tier vs. premium? Where is the conversion trigger? How do you minimize serving costs for free users? When should you introduce pricing? Strong candidates quantify the unit economics of both tiers.',
    category: 'product',
    relatedTerms: ['arpu', 'unit-economics', 'product-market-fit', 'marketing-funnel'],
    example:
      'Spotify\'s freemium model maintains approximately 60% free users (ad-supported) and 40% premium subscribers. The free tier acts as a massive top-of-funnel, and the ad experience is deliberately limited to motivate upgrades to the premium ad-free experience.',
  },
  {
    slug: 'feature-prioritization',
    term: 'Feature Prioritization',
    definition:
      'Feature prioritization is the disciplined process of evaluating and ranking potential product features to determine build order, given limited engineering resources. It uses frameworks like RICE, MoSCoW, or Kano to balance customer value, business impact, development effort, and strategic alignment in deciding what to build next.',
    explanation:
      'Every product team faces the same challenge: a backlog of 100+ feature requests and resources to build 10. Feature prioritization frameworks bring objectivity to this inherently subjective decision. RICE scores features on Reach (how many users affected), Impact (how much it affects them), Confidence (certainty of estimates), divided by Effort (engineering time). MoSCoW categorizes features as Must-have, Should-have, Could-have, or Won\'t-have.\n\nThe Kano model provides a different lens: distinguishing between basic expectations (features that customers notice only when missing), performance features (more is better, linearly), and delight features (unexpected capabilities that create disproportionate satisfaction). This helps balance foundational improvements with innovative features.\n\nIn case interviews, feature prioritization tests strategic thinking under constraints. If a product manager has one quarter of engineering time, what should they build? Avoid the trap of recommending every feature—demonstrate selectivity by evaluating trade-offs. Consider which features drive the most important business metric (e.g., retention vs. acquisition) and which align with the company\'s competitive strategy.',
    category: 'product',
    relatedTerms: ['product-roadmap', 'sprint-planning', 'agile-methodology', 'user-story'],
    example:
      'When Slack prioritized features for enterprise customers, they used a RICE framework that heavily weighted "Reach" toward Fortune 500 accounts. This led to prioritizing SSO, compliance features, and admin controls over consumer-oriented features, driving enterprise revenue growth.',
  },
  {
    slug: 'sprint-planning',
    term: 'Sprint Planning',
    definition:
      'Sprint planning is the Agile ceremony at the start of each sprint where the team selects work items from the product backlog, defines sprint goals, and commits to delivering a set of features within the sprint timeframe. It translates product priorities into actionable development tasks with clear ownership and estimates.',
    explanation:
      'Sprint planning typically involves the entire cross-functional team: product owner (defines priorities), scrum master (facilitates the process), and developers (estimate effort and commit to deliverables). The meeting addresses two questions: "What can we deliver this sprint?" and "How will we do the work?"\n\nEffective sprint planning requires a well-groomed backlog with clearly defined user stories, acceptance criteria, and effort estimates (often in story points). The team\'s velocity—average story points completed per sprint—guides how much work to commit to. Overcommitting leads to unfinished work and team burnout; undercommitting wastes capacity.\n\nIn case interviews, sprint planning concepts demonstrate practical product management knowledge. Understanding how development capacity translates into feature delivery helps you make realistic recommendations. If you recommend building a complex feature, acknowledging that it might require two sprints (four weeks) rather than being available immediately shows operational awareness.',
    category: 'product',
    relatedTerms: ['agile-methodology', 'user-story', 'product-roadmap', 'feature-prioritization'],
    example:
      'Atlassian (makers of Jira) practices what they preach: their sprint planning includes "20% time" for innovation projects and technical debt reduction, ensuring the team balances feature delivery with long-term platform health.',
  },
  {
    slug: 'user-story',
    term: 'User Story',
    definition:
      'A user story is a concise description of a feature from the end user\'s perspective, following the format: "As a [type of user], I want [goal] so that [benefit]." It captures the what and why of a requirement without specifying the how, enabling development teams to focus on delivering user value rather than implementing specifications.',
    explanation:
      'User stories replace traditional requirements documents with lightweight, user-centered descriptions. Each story should be Independent (self-contained), Negotiable (details can be discussed), Valuable (delivers user value), Estimable (team can size the effort), Small (completable within a sprint), and Testable (clear acceptance criteria). This INVEST criteria helps teams write effective stories.\n\nAcceptance criteria define the conditions that must be met for a story to be considered complete. They provide clarity on scope and quality expectations. For example: "Given I am on the checkout page, when I enter an invalid credit card number, then the system should display an error message specifying the issue."\n\nIn case interviews, user story thinking helps structure product recommendations. Instead of vaguely suggesting "improve the user experience," translate your recommendation into specific user stories that the development team could act on. This demonstrates the bridge between strategy and execution that differentiates strong product thinkers.',
    category: 'product',
    relatedTerms: ['agile-methodology', 'sprint-planning', 'feature-prioritization', 'product-roadmap'],
  },
  {
    slug: 'technical-debt',
    term: 'Technical Debt',
    definition:
      'Technical debt is the implied cost of future rework caused by choosing quick, expedient solutions in software development instead of more thorough, well-architected approaches. Like financial debt, it accumulates interest over time—making future changes increasingly difficult, slow, and error-prone if not addressed.',
    explanation:
      'Technical debt is an inevitable byproduct of software development, especially in fast-moving startups. Some debt is strategic—deliberately taking shortcuts to ship faster and validate market demand. Other debt is accidental—resulting from poor practices, inadequate testing, or evolving requirements that outgrow the original architecture.\n\nThe consequences of unmanaged technical debt compound over time: new features take longer to build, bugs become more frequent, developer productivity declines, and system stability suffers. Eventually, the debt becomes so burdensome that the system requires a major rewrite or replacement—the equivalent of bankruptcy in financial terms.\n\nIn case interviews, technical debt awareness is valuable for technology and product cases. If a company\'s development velocity is slowing, technical debt might be the root cause. The solution involves allocating a portion of each sprint (typically 15-25%) to debt reduction, prioritizing high-impact debt items, and establishing coding standards to prevent new debt accumulation. Balancing speed-to-market with code quality is a fundamental product management trade-off.',
    category: 'product',
    relatedTerms: ['agile-methodology', 'sprint-planning', 'mvp-minimum-viable-product', 'product-lifecycle'],
    example:
      'Twitter\'s "fail whale" era (2008-2013) was caused by massive technical debt from rapid early growth. The original Ruby on Rails architecture couldn\'t handle the load, requiring a multi-year rewrite to a JVM-based architecture—a $100M+ investment to address accumulated debt.',
  },
  {
    slug: 'product-lifecycle',
    term: 'Product Lifecycle',
    definition:
      'The product lifecycle describes the stages a product goes through from introduction to decline: Introduction (launch, low sales, high costs), Growth (rapid adoption, increasing profits), Maturity (peak sales, market saturation, margin pressure), and Decline (falling demand, potential phase-out). Each stage requires different strategies.',
    explanation:
      'Understanding where a product sits in its lifecycle is essential for making appropriate strategic decisions. In the Introduction stage, the focus is on building awareness and achieving product-market fit—pricing might be penetration-based to drive adoption or skimming-based to recover R&D costs. Marketing emphasizes education and early adopter acquisition.\n\nDuring Growth, the focus shifts to scaling distribution, building brand preference, and capturing market share before competitors respond. Profitability improves as scale economies kick in and unit costs decline. This is typically when companies invest most aggressively in marketing and capacity expansion.\n\nMaturity brings intense competition, commoditization, and margin compression. Strategies include product differentiation, cost optimization, market segmentation, and extension into adjacent categories. The Decline stage requires decisions about whether to harvest (extract remaining profits while minimizing investment), divest, or revitalize the product through innovation.',
    category: 'product',
    relatedTerms: ['bcg-matrix', 'growth-strategy', 'product-roadmap', 'ansoff-matrix'],
    example:
      'The iPod followed a textbook product lifecycle: Introduction (2001-2003), explosive Growth (2004-2008, peaking at 54M units), Maturity (2009-2012), and Decline (2013-2022 discontinuation) as smartphone music capabilities cannibalized the market.',
  },

  // ─────────────────────────────────────────────
  // STRATEGY (13)
  // ─────────────────────────────────────────────
  {
    slug: 'porters-five-forces',
    term: "Porter's Five Forces",
    definition:
      'Porter\'s Five Forces is a framework for analyzing the competitive intensity and attractiveness of an industry. The five forces are: threat of new entrants, bargaining power of suppliers, bargaining power of buyers, threat of substitutes, and rivalry among existing competitors. Together they determine industry profitability.',
    explanation:
      'Developed by Michael Porter at Harvard Business School, this framework explains why some industries are inherently more profitable than others. The pharmaceutical industry, for example, enjoys high barriers to entry (patents, regulation), low buyer power (patients don\'t choose which drug to take), and limited substitutes—resulting in consistently high margins. Airlines, by contrast, face low barriers to entry, high buyer price sensitivity, and intense rivalry—resulting in chronically low margins.\n\nEach force should be evaluated as high, medium, or low, with supporting evidence. Threat of new entrants depends on barriers like capital requirements, regulatory hurdles, and brand loyalty. Supplier power depends on concentration, switching costs, and availability of substitutes. Buyer power depends on price sensitivity, information availability, and switching costs.\n\nIn case interviews, Five Forces analysis is essential for any market entry or industry assessment case. It tells you whether the industry is attractive enough to enter and where competitive pressure is greatest. Strong candidates go beyond identifying the forces to explaining how the company can position itself to mitigate unfavorable forces.',
    category: 'strategy',
    relatedTerms: ['competitive-advantage', 'economic-moat', 'market-entry-framework', 'swot-analysis'],
    relatedCasebookPages: ['market-entry', 'profitability-framework'],
    example:
      'Porter\'s Five Forces analysis of the streaming video industry reveals intense rivalry (Netflix, Disney+, Amazon), low switching costs (high buyer power), moderate substitutes (gaming, social media), but high barriers to entry (content investment of $10B+), explaining industry consolidation.',
  },
  {
    slug: 'swot-analysis',
    term: 'SWOT Analysis',
    definition:
      'SWOT Analysis evaluates a company\'s strategic position by examining internal Strengths (advantages over competitors), Weaknesses (areas of disadvantage), external Opportunities (favorable trends to exploit), and Threats (unfavorable trends to defend against). It provides a structured snapshot of where a company stands and what it faces.',
    explanation:
      'SWOT is one of the most widely known strategic tools, used from MBA classrooms to Fortune 500 boardrooms. Strengths and Weaknesses are internal factors within the company\'s control—brand reputation, talent, technology, financial resources, operational efficiency. Opportunities and Threats are external factors driven by market dynamics, competition, regulation, technology trends, and macroeconomics.\n\nThe real value of SWOT comes from translating the analysis into strategy: leveraging Strengths to capture Opportunities (aggressive strategy), using Strengths to mitigate Threats (defensive strategy), addressing Weaknesses to capitalize on Opportunities (developmental strategy), and minimizing Weaknesses to avoid Threats (survival strategy).\n\nIn case interviews, SWOT is useful as a quick initial assessment but should not be the primary framework for most cases. It\'s better suited as a supplementary tool alongside more specific frameworks like Five Forces or profitability analysis. The main criticism of SWOT is that it\'s descriptive rather than prescriptive—it tells you what the situation is but doesn\'t directly tell you what to do.',
    category: 'strategy',
    relatedTerms: ['porters-five-forces', 'pestel-analysis', 'vrio-framework', 'competitive-advantage'],
    relatedCasebookPages: ['market-entry'],
    example:
      'A SWOT analysis of Tesla in 2023: Strengths (brand, battery technology, Supercharger network), Weaknesses (quality control, production bottlenecks), Opportunities (expanding EV market, energy storage), Threats (legacy automaker EV launches, Chinese competition).',
  },
  {
    slug: 'pestel-analysis',
    term: 'PESTEL Analysis',
    definition:
      'PESTEL Analysis examines six macro-environmental factors that affect every industry: Political (government policy, trade regulations), Economic (growth, interest rates, inflation), Social (demographics, cultural trends), Technological (innovation, automation), Environmental (sustainability, climate), and Legal (regulations, compliance). It scans the external landscape for opportunities and threats.',
    explanation:
      'PESTEL provides a systematic way to scan the macro-environment that shapes industry dynamics. Each factor can create opportunities or threats that affect all players in an industry. For example, an aging population (Social) creates opportunities in healthcare but threatens industries dependent on younger demographics. Rising interest rates (Economic) increase the cost of capital, favoring cash-rich companies over highly leveraged ones.\n\nThe framework is particularly useful for market entry into new geographies, where the macro-environment can be dramatically different. Entering India requires understanding GST tax policy (Political/Legal), GDP growth rates (Economic), urbanization trends (Social), mobile internet adoption (Technological), pollution regulations (Environmental), and data privacy laws (Legal).\n\nIn case interviews, PESTEL is most valuable when the case involves cross-border strategy, regulatory disruption, or long-term planning. Use it to identify external factors that could make or break a strategy. However, avoid listing every possible PESTEL factor—focus on the 2-3 factors most relevant to the specific case.',
    category: 'strategy',
    relatedTerms: ['swot-analysis', 'porters-five-forces', 'market-entry-framework'],
    relatedCasebookPages: ['market-entry'],
    example:
      'When Uber entered Southeast Asia, PESTEL analysis highlighted: Political (regulatory hostility in many countries), Economic (low per-capita income favoring shared rides), Social (smartphone adoption among youth), and Legal (taxi licensing complexities). These factors shaped their localized strategy before ultimately selling to Grab.',
  },
  {
    slug: 'bcg-matrix',
    term: 'BCG Matrix',
    definition:
      'The BCG Matrix (Boston Consulting Group Growth-Share Matrix) categorizes a company\'s business units or products into four quadrants based on market growth rate and relative market share: Stars (high growth, high share), Cash Cows (low growth, high share), Question Marks (high growth, low share), and Dogs (low growth, low share).',
    explanation:
      'The BCG Matrix was one of the first portfolio management tools in strategy, developed in 1970 by BCG founder Bruce Henderson. It helps diversified companies allocate resources across their portfolio. Cash Cows generate excess cash with minimal investment needs—this cash should be reinvested into Stars and promising Question Marks. Stars require investment to maintain their position as the market grows. Question Marks are strategic gambles—invest to become Stars or divest. Dogs should generally be divested or harvested.\n\nThe underlying logic is the experience curve: companies with higher market share have lower costs due to accumulated experience and scale economies. Combined with the product lifecycle (high-growth markets eventually mature), the matrix suggests a lifecycle where products move from Question Mark → Star → Cash Cow → Dog.\n\nIn case interviews, the BCG Matrix is useful for portfolio strategy and investment prioritization cases. However, recognize its limitations: market share doesn\'t always equal profitability (niche players can be highly profitable), growth rate isn\'t the only measure of attractiveness, and the four-quadrant simplification can be misleading.',
    category: 'strategy',
    relatedTerms: ['ansoff-matrix', 'product-lifecycle', 'market-share', 'growth-strategy'],
    example:
      'Applying the BCG Matrix to Alphabet/Google: Search Advertising is a Cash Cow (dominant share, mature market), YouTube is a Star (high growth, strong share), Waymo is a Question Mark (high growth potential, unclear market position), and Google+ was a Dog (discontinued).',
  },
  {
    slug: 'ansoff-matrix',
    term: 'Ansoff Matrix',
    definition:
      'The Ansoff Matrix is a strategic framework that maps four growth strategies based on whether products are existing or new, and whether markets are existing or new: Market Penetration (existing products, existing markets), Product Development (new products, existing markets), Market Development (existing products, new markets), and Diversification (new products, new markets).',
    explanation:
      'The Ansoff Matrix, developed by Igor Ansoff in 1957, remains one of the most practical frameworks for growth strategy. Each quadrant carries increasing risk: Market Penetration is lowest risk because you\'re working with known products and known customers. Product Development adds the risk of creating something new. Market Development adds the risk of entering unfamiliar territory. Diversification combines both risks and has the highest failure rate.\n\nThe framework forces strategic clarity. Instead of vaguely saying "we need to grow," it demands specificity: Are we growing by selling more of what we have to current customers, or by creating new offerings, or by entering new markets? Each path requires different capabilities, investments, and timelines.\n\nIn case interviews, the Ansoff Matrix is excellent for structuring growth strategy cases. Start by evaluating the penetration opportunity in the core business—many companies pursue risky diversification when significant headroom remains in their core market. Then evaluate adjacent moves (new products or new markets) before considering full diversification. Quantify the opportunity in each quadrant to support prioritization.',
    category: 'strategy',
    relatedTerms: ['growth-strategy', 'bcg-matrix', 'market-penetration', 'market-entry-framework'],
    relatedCasebookPages: ['market-entry'],
    example:
      'Amazon\'s growth maps perfectly onto the Ansoff Matrix: Market Penetration (expanding book selection), Market Development (international expansion), Product Development (AWS, Kindle, Echo), and Diversification (Whole Foods acquisition, healthcare ventures).',
  },
  {
    slug: 'vrio-framework',
    term: 'VRIO Framework',
    definition:
      'The VRIO Framework evaluates whether a company\'s resources and capabilities provide a sustainable competitive advantage by testing four criteria: Valuable (does it enable exploiting opportunities or neutralizing threats?), Rare (do few competitors possess it?), Inimitable (is it costly to replicate?), and Organized (is the company structured to exploit it?).',
    explanation:
      'VRIO, developed by Jay Barney, is rooted in the Resource-Based View (RBV) of strategy, which argues that competitive advantage comes from owning unique, hard-to-replicate resources. A resource that is Valuable but not Rare provides only competitive parity. One that is Valuable and Rare provides a temporary advantage. Only resources that are Valuable, Rare, and Inimitable provide a sustained competitive advantage—provided the organization is structured to exploit them.\n\nResources can be tangible (patents, equipment, real estate) or intangible (brand reputation, organizational culture, proprietary knowledge, relationships). Intangible resources are generally harder to imitate, making them more likely sources of sustained advantage. Inimitability arises from path dependence (built over time), causal ambiguity (competitors can\'t identify what creates the advantage), or social complexity (embedded in organizational relationships).\n\nIn case interviews, VRIO is useful for assessing competitive sustainability. When asked "Can this company maintain its advantage?", systematically evaluate its key resources through the VRIO lens. If a resource fails any criterion, the advantage is vulnerable.',
    category: 'strategy',
    relatedTerms: ['competitive-advantage', 'economic-moat', 'porters-five-forces', 'swot-analysis'],
    example:
      'Apple\'s ecosystem passes VRIO: Valuable (seamless cross-device experience), Rare (no competitor has comparable integration), Inimitable (requires hardware + software + services, built over 20 years), Organized (Apple\'s vertically integrated structure exploits it fully).',
  },
  {
    slug: 'competitive-advantage',
    term: 'Competitive Advantage',
    definition:
      'Competitive advantage is a set of attributes or capabilities that allows a company to outperform its rivals consistently. Porter identified two fundamental types: cost leadership (producing at lower cost than competitors) and differentiation (offering unique value that commands premium pricing). A sustainable advantage is one competitors cannot easily replicate.',
    explanation:
      'Competitive advantage is the central concept in business strategy. Without it, a company is condemned to average profitability at best. Porter argued that trying to be both the lowest-cost and the most differentiated leads to being "stuck in the middle"—though some modern companies (like IKEA and Toyota) have found ways to achieve both.\n\nSources of competitive advantage include economies of scale, network effects, switching costs, proprietary technology, brand loyalty, unique culture, regulatory advantages, and access to scarce resources. The key is sustainability—advantages based on patents eventually expire, cost advantages based on cheap labor can be replicated, and technology advantages can be leapfrogged.\n\nIn case interviews, always identify the source of competitive advantage when analyzing a company. Is it cost-based or differentiation-based? Is it sustainable or eroding? When recommending a strategy, ensure it either leverages an existing advantage or builds a new one. A strategy without a clear competitive advantage is just activity without strategic purpose.',
    category: 'strategy',
    relatedTerms: ['economic-moat', 'vrio-framework', 'porters-five-forces', 'value-proposition'],
    relatedCasebookPages: ['profitability-framework', 'market-entry'],
    example:
      'Walmart\'s competitive advantage stems from cost leadership built on massive scale (>$600B revenue), sophisticated logistics (one of the world\'s largest private truck fleets), and supplier bargaining power. This allows everyday low pricing that smaller competitors cannot match.',
  },
  {
    slug: 'economic-moat',
    term: 'Economic Moat',
    definition:
      'An economic moat, a term coined by Warren Buffett, describes a company\'s durable competitive advantage that protects its market share and profitability from competitors over the long term—like a castle\'s moat deters invaders. Wider moats indicate stronger, more sustainable competitive positions that are harder for rivals to breach.',
    explanation:
      'Morningstar identifies five sources of economic moats: Network Effects (the product becomes more valuable as more people use it—Facebook, Visa), Intangible Assets (brands, patents, regulatory licenses—Coca-Cola, Pfizer), Cost Advantages (structural cost advantages from scale, process, or location—Walmart, GEICO), Switching Costs (high cost or inconvenience of switching—SAP, Oracle), and Efficient Scale (natural monopolies where the market supports only one or few players—regulated utilities).\n\nThe moat concept is particularly useful for long-term investment analysis and strategic planning. Companies with wide moats can sustain above-average returns on invested capital for extended periods. Companies without moats see their excess returns competed away quickly.\n\nIn case interviews, the moat concept helps evaluate the sustainability of a company\'s position. When asked whether a company should enter a new market, assess the existing players\' moats—entering a market where incumbents have wide moats is extremely difficult. When evaluating an acquisition target, assess whether the moat will survive the acquisition or be damaged by integration.',
    category: 'strategy',
    relatedTerms: ['competitive-advantage', 'porters-five-forces', 'vrio-framework', 'first-mover-advantage'],
    example:
      'Visa\'s economic moat has multiple layers: network effects (accepted by 80M+ merchants globally), switching costs (embedded in payment infrastructure), intangible assets (brand trust), and scale advantages (processing 65,000 transactions per second). This multi-layered moat explains Visa\'s 50%+ operating margins.',
  },
  {
    slug: 'first-mover-advantage',
    term: 'First-Mover Advantage',
    definition:
      'First-mover advantage refers to the competitive benefit gained by being the first company to enter a market or introduce a product category. Potential advantages include capturing market share before competitors arrive, establishing brand recognition, securing partnerships, and creating switching costs that lock in early customers.',
    explanation:
      'First-mover advantage is real but often overstated. True first-mover advantages arise from network effects (early user base creates value that attracts more users), preemptive resource acquisition (securing the best locations, suppliers, or talent), learning curve benefits (accumulated experience that reduces costs), and technological lock-in (setting industry standards).\n\nHowever, first movers also face disadvantages: they bear the cost of educating the market, make mistakes that later entrants learn from, invest in technology that may become obsolete, and often face the "free rider" problem where followers copy their innovations. Research shows that "fast followers"—companies that enter shortly after the pioneer—often capture more long-term value than the first mover.\n\nIn case interviews, don\'t assume first-mover advantage is always beneficial. Evaluate whether the specific market conditions support first-mover benefits. Markets with strong network effects (social media, marketplaces) heavily favor first movers. Markets with rapid technology change (consumer electronics) often favor fast followers who can leapfrog with better technology.',
    category: 'strategy',
    relatedTerms: ['competitive-advantage', 'economic-moat', 'blue-ocean-strategy', 'market-entry-framework'],
    example:
      'Google was not the first search engine (Yahoo, AltaVista, Ask Jeeves preceded it), yet it dominated through superior technology. Meanwhile, eBay\'s first-mover advantage in online auctions created network effects that no competitor has successfully challenged.',
  },
  {
    slug: 'blue-ocean-strategy',
    term: 'Blue Ocean Strategy',
    definition:
      'Blue Ocean Strategy, developed by W. Chan Kim and Renée Mauborgne, advocates creating uncontested market space (blue oceans) rather than competing in crowded, bloody markets (red oceans). Companies do this by simultaneously pursuing differentiation and low cost, making competition irrelevant by redefining the value proposition.',
    explanation:
      'The core tool of Blue Ocean Strategy is the Strategy Canvas, which maps the competitive factors in an industry and shows how different players invest across them. A blue ocean move involves eliminating factors the industry takes for granted, reducing factors below the industry standard, raising factors above the industry standard, and creating factors the industry has never offered.\n\nClassic blue ocean examples include Cirque du Soleil (eliminated animal acts and star performers, added artistic theater elements to circus), Southwest Airlines (eliminated assigned seating and meals, added frequent departures and fun culture to air travel), and Nintendo Wii (eliminated graphics power, added motion controls to gaming).\n\nIn case interviews, Blue Ocean Strategy is relevant when a company faces intense competition and price pressure. Instead of recommending that they compete harder in the existing market, suggest redefining the competitive landscape entirely. The key insight is that most industries compete on the same dimensions—the opportunity lies in changing which dimensions matter.',
    category: 'strategy',
    relatedTerms: ['competitive-advantage', 'disruption', 'value-proposition', 'first-mover-advantage'],
    example:
      'Yellow Tail wine created a blue ocean by eliminating wine complexity (aging, tannins, vineyard prestige), adding simplicity and fun, and pricing between budget and premium wines. It became the #1 imported wine in the US within two years.',
  },
  {
    slug: 'disruption',
    term: 'Disruption',
    definition:
      'Disruption, as defined by Clayton Christensen, occurs when a smaller company with fewer resources successfully challenges established incumbents by initially targeting overlooked segments with simpler, cheaper products, then gradually moving upmarket to capture mainstream customers as the product improves over time.',
    explanation:
      'Christensen\'s theory of disruptive innovation explains why great companies fail. Incumbents focus on their most profitable customers and continuously improve their products along traditional performance dimensions. Disruptors enter at the low end or in a new market with a product that is initially inferior on traditional metrics but superior on accessibility, simplicity, or price.\n\nThe key dynamic is that disruptors improve faster than customer needs evolve. As the disruptive product gets "good enough" for mainstream customers, it captures the market at much lower prices. By the time incumbents respond, the disruptors have built scale, learning, and brand loyalty that are hard to overcome.\n\nIn case interviews, disruption analysis is powerful for both offensive and defensive strategy. On offense: Is there an underserved market segment we can enter with a simpler offering? On defense: Are there disruptors emerging in our market, and how should we respond? Note that not every new technology is disruptive—sustaining innovations improve existing products along traditional dimensions and typically favor incumbents.',
    category: 'strategy',
    relatedTerms: ['blue-ocean-strategy', 'first-mover-advantage', 'competitive-advantage', 'pivot'],
    example:
      'Netflix disrupted Blockbuster through classic disruptive innovation: starting with DVD-by-mail (inferior selection, no instant gratification) targeting convenience-seekers, then streaming (initially limited content) gradually becoming the dominant entertainment platform while Blockbuster went bankrupt.',
  },
  {
    slug: 'pivot',
    term: 'Pivot',
    definition:
      'A pivot is a fundamental change in a company\'s business strategy, product, target market, or business model based on learning that the current approach is not working. It preserves the core vision or technology while changing direction to find a more viable path to product-market fit and sustainable growth.',
    explanation:
      'The concept of pivoting, popularized by Eric Ries in The Lean Startup, acknowledges that initial business plans are often wrong. Successful pivots retain what\'s working while changing what isn\'t. Types of pivots include: customer segment pivot (same product, different customers), problem pivot (same customers, different problem), platform pivot (changing from application to platform), business model pivot (changing revenue model), and technology pivot (same solution, different technology).\n\nThe decision to pivot requires balancing persistence with adaptability. Pivoting too quickly means abandoning strategies before giving them a fair chance. Pivoting too slowly wastes time and resources on a failing approach. Key signals that a pivot is needed: consistently missing targets, customer feedback contradicting assumptions, competitors capturing the intended market, or discovering a more attractive adjacent opportunity.\n\nIn case interviews, the pivot concept is relevant for startup strategy cases and turnaround situations. If a company\'s current strategy isn\'t working, recommend a pivot rather than doubling down. Articulate specifically what would change and what would stay the same, and how the pivot addresses the root cause of underperformance.',
    category: 'strategy',
    relatedTerms: ['product-market-fit', 'mvp-minimum-viable-product', 'disruption', 'growth-strategy'],
    example:
      'Slack pivoted from a failed gaming company (Tiny Speck/Glitch) to enterprise messaging. The internal communication tool they built for their game development team turned out to be more valuable than the game itself, leading to a $27.7B acquisition by Salesforce.',
  },
  {
    slug: 'balanced-scorecard',
    term: 'Balanced Scorecard',
    definition:
      'The Balanced Scorecard is a strategic management framework that measures organizational performance across four perspectives: Financial (profitability and shareholder value), Customer (satisfaction and market position), Internal Processes (operational efficiency and quality), and Learning & Growth (employee capabilities and innovation). It ensures strategy execution across all dimensions.',
    explanation:
      'Developed by Robert Kaplan and David Norton, the Balanced Scorecard addresses a critical limitation of traditional management: overreliance on financial metrics. Financial results are lagging indicators—they tell you what already happened. The Balanced Scorecard adds leading indicators across three additional perspectives that predict future financial performance.\n\nEach perspective includes objectives, measures, targets, and initiatives. For example: Financial perspective (increase revenue by 15%), Customer perspective (achieve NPS of 50+), Internal Process perspective (reduce order fulfillment time by 20%), Learning & Growth perspective (complete leadership training for 100% of managers). Strategy maps connect these objectives to show cause-and-effect relationships.\n\nIn case interviews, the Balanced Scorecard is relevant for strategy implementation and performance management cases. When recommending a strategy, identify KPIs across all four perspectives to ensure balanced execution. A company that optimizes only financial metrics might cut costs that damage customer satisfaction, employee morale, and long-term innovation capability.',
    category: 'strategy',
    relatedTerms: ['benchmarking', 'change-management', 'competitive-advantage', 'total-quality-management'],
    example:
      'Hilton Hotels implemented a Balanced Scorecard that linked employee training hours (Learning) to customer satisfaction scores (Customer) to occupancy rates (Internal Process) to RevPAR growth (Financial), creating a clear line of sight from frontline actions to shareholder value.',
  },
];
