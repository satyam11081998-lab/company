/* ================================================================
   Supplementary Curriculum Data – Domains D13-D18 + Sections 4-13
   Auto-extracted from consulting_platform_architecture.md
   ================================================================ */

import type {
  Domain,
  Module,
  Lesson,
  CaseEntry,
  CompanyProfile,
  LearningPath,
  PlatformStats,
  QuizType,
  FlashcardDeck,
  VisualizationItem,
  ContentGap,
} from './types';

// ─── HELPERS ─────────────────────────────────────────────────────
const mod = (id: string, title: string, lessons: Lesson[]): Module => ({
  id,
  title,
  lessons,
});

const lsn = (id: string, title: string, description: string, children?: Lesson[]): Lesson => ({
  id,
  title,
  description,
  ...(children ? { children } : {}),
});

// ─── D13 | GROUP DISCUSSION PREPARATION ─────────────────────────
const d13Modules: Module[] = [
  mod('D13.1', 'GD Fundamentals', [
    lsn('D13.1.1', 'Types of GD: Case-based, Abstract, Gamified', "Case-based GDs involve solving a business problem collaboratively using frameworks. Abstract GDs require interpreting a metaphorical topic and connecting it to real-world scenarios. Gamified GDs test teamwork and logic through puzzle-like scenarios where participants piece together clues."),
    lsn('D13.1.2', 'What evaluators measure: content, communication, collaboration', "Evaluators look for substantive content that advances the discussion, rather than just speaking time. Communication skills are assessed based on clarity, structure, and active listening. Collaboration is measured by how well you build on others' ideas and facilitate consensus without dominating."),
    lsn('D13.1.3', 'Structure: Introduction → Discussion → Conclusion (time allocation)', "A structured GD starts with a brief introduction defining the context and framework (10-15%). The core discussion phase (70-80%) should explore multiple dimensions and debate trade-offs. The conclusion (10%) must synthesize the group's insights into actionable recommendations."),
  ]),
  mod('D13.2', 'Case-Based GD (Mahindra/Corporate style)', [
    lsn('D13.2.1', 'Opening as Chairman: framework + context setting', "Opening as Chairman establishes leadership by setting the agenda and outlining a clear framework for the discussion. It involves briefly defining the problem statement and proposing a structured path forward. This proactive approach anchors the group and prevents early derailment."),
    lsn('D13.2.2', 'Contributing substance: use consulting frameworks', "Substantive contributions should be grounded in structured business thinking, utilizing frameworks like 3Cs, 4Ps, or PESTEL. Avoid vague opinions; instead, provide data-driven hypotheses or logical deductions. This elevates the discussion from a general debate to a strategic problem-solving session."),
    lsn('D13.2.3', "Building on others' points professionally", "Professional collaboration requires acknowledging a peer's point before introducing your own perspective or counter-argument. Phrases like 'Building on what X said...' or 'While I agree with Y, we must also consider...' demonstrate active listening and teamwork. It shows evaluators you value collective output over individual spotlighting."),
    lsn('D13.2.4', 'Closing with synthesis and action items', "Closing a GD effectively means summarizing the key themes discussed, rather than just repeating your own points. A strong synthesis highlights areas of consensus and acknowledges unresolved trade-offs. Ending with clear, actionable recommendations demonstrates decisive leadership and business acumen."),
  ]),
  mod('D13.3', 'TAS (Tata) GD Format', [
    lsn('D13.3.1', 'Structure: Chairman (1 min) → Discussion (6 min) → Conclusion (1 min)', "The TAS GD format is highly structured, typically starting with a 1-minute Chairman introduction to set the direction. This is followed by a 6-minute open discussion to explore the nuances of the case. Finally, a 1-minute conclusion is expected to summarize findings and deliver a unified recommendation."),
    lsn('D13.3.2', 'Rotating Chairman role: everyone gets one turn', "The rotating Chairman model ensures every participant gets an opportunity to lead the discussion for a specific segment. It tests adaptive leadership, as you must smoothly transition between being a facilitator and a contributor. Evaluators assess how well you manage time and group dynamics when it is your turn to lead."),
    lsn('D13.3.3', "TAS-specific Do's and Don'ts", "In TAS GDs, do focus on ethical leadership, long-term stakeholder value, and structured thinking aligned with Tata's core values. Do not be overly aggressive, interrupt others, or prioritize short-term profits over ethical considerations. Collaborative problem-solving is prioritized over cutthroat competition."),
    lsn('D13.3.4', 'How to prepare for TAS ethics cases', "Preparing for TAS ethics cases requires a deep understanding of the Tata Code of Conduct and its core values like integrity and responsibility. Practice navigating scenarios that present a conflict between profitability and ethics, always prioritizing the latter. Formulate frameworks to evaluate the impact of decisions on all stakeholders, including employees, community, and the environment."),
    lsn('D13.3.5', 'TAS previous topics (25 ethical scenarios)', "Past TAS topics often involve complex ethical dilemmas, such as whistleblower situations, vendor kickbacks, or environmental concerns. Analyzing these 25 historical scenarios helps identify recurring themes and the expected ethical baseline. Practice developing structured responses that balance immediate crisis management with long-term reputational integrity."),
  ]),
  mod('D13.4', 'Abstract GD Approach', [
    lsn('D13.4.1', 'Decode the metaphor (literal, philosophical, business, social, tech)', "Abstract topics must be decoded by exploring multiple interpretations across different dimensions: literal, philosophical, business, social, and technological. This multi-faceted approach prevents the discussion from becoming one-dimensional. Generating diverse interpretations early provides a rich foundation for the group to explore."),
    lsn('D13.4.2', 'Open with multiple interpretations', "Opening an abstract GD involves presenting a few distinct interpretations of the topic to guide the group's initial thinking. By offering a broad canvas, you invite others to build upon your ideas and find a shared direction. It demonstrates creativity and the ability to think beyond the obvious."),
    lsn('D13.4.3', 'Connect abstract to real-world business/social examples', "The key to succeeding in an abstract GD is rapidly anchoring the metaphorical topic to tangible real-world examples. Connecting the abstract concept to business strategies, current events, or social issues makes the discussion actionable and relevant. This transitions the group from philosophical debate to practical analysis."),
  ]),
  mod('D13.5', 'Gamified GD Approach', [
    lsn('D13.5.1', 'Reading and using your chit effectively', "In gamified GDs, each participant usually receives unique information or 'chits' that must be shared to solve the overall puzzle. Effective reading means quickly identifying the most critical data points in your clue. Using the chit effectively involves communicating your information clearly without overwhelming the group."),
    lsn('D13.5.2', 'Finding connectors across clues', "Success in a gamified GD depends on identifying the hidden connections between the disparate clues held by different members. This requires active listening and the ability to map out the information logically, often building a timeline or matrix. Identifying these connectors is crucial for unlocking the next step in the problem-solving process."),
    lsn('D13.5.3', 'Building toward consensus conclusion', "Gamified GDs culminate in a shared goal, requiring the group to build toward a consensus conclusion. It involves synthesizing all the shared clues, eliminating incorrect paths, and agreeing on the final solution. Demonstrating the ability to guide the group to this consensus without being domineering is a key evaluation metric."),
  ]),
];

const d13: Domain = {
  code: 'D13',
  slug: 'group-discussion',
  title: 'Group Discussion Preparation',
  fullTitle: 'D13 | GROUP DISCUSSION PREPARATION',
  level: 'Intermediate',
  prereqs: 'D12',
  tags: ['GD', 'group-discussion', 'communication', 'leadership', 'TAS', 'Mahindra'],
  modules: d13Modules,
  gdTopics: {
    caseBased: [
      'Agricultural equipment manufacturer + bad monsoon',
      'EV company entering the sector',
      'Flight delay + brand reputation',
      'Declining motorcycle sales',
      'Ski resort staffing issue',
      'Startup technology conflict',
      'Mergers & Acquisitions: pre & post considerations',
      'Transitioning to green energy: wind vs. solar',
    ],
    tasEthics: [
      'Regional sales manager missed target: report or advance promotions?',
      'Religious prayer at company assembly: how to proceed?',
      'Employee receiving vendor kickbacks: action plan?',
      'Employee working for a competitor simultaneously',
      'Senior manager vs. junior manager favoritism conflict',
      'Female employee molested before major event',
      'Airline losses + flood cancellations: what steps to take?',
      'Gram panchayat budget: school vs. toilets vs. community hall?',
      'Trustee asks to employ nephew via backdoor',
      'Sunscreen with 7 complaints of skin issues',
      'AI company choosing best investment from 3 deals',
      'Textile company expansion into Southeast Asia (labor ethics)',
      'AI automation displacing warehouse workers',
      'High-performing manager using unethical retail incentives',
      'Post-merger cultural integration (US + Japan IT company)',
      'Pharmaceutical packaging flaw: recall or not?',
      'Middle-East expansion: political instability risk',
      'Apparel brand supplier using child labor',
      'Gram panchayat: chemical factory vs. river pollution',
      'Multi-specialty hospital: surgeon negligence accusation',
      'School principal: teacher sexual misconduct allegation',
      'Elite school: STEM vs. holistic curriculum',
      'Private school fee hike: parent protest',
      'Factory veg-only food policy',
      'Intergenerational cooperation in organizations',
    ],
    abstract: [
      '"A Journey Without a Destination"',
      '"Black or White?"',
    ],
  },
};

// ─── D14 | COMPANY INTELLIGENCE & RESEARCH ──────────────────────
const d14Companies: CompanyProfile[] = [
  {
    name: 'Adani Group',
    founded: '1988',
    revenue: '$36B',
    sectors: 'Ports, Green Energy, FMCG, Media, Cement',
    vision: 'World-class leader in infrastructure',
    values: ['Trust', 'Commitment', 'Courage'],
    csr: ['Adani Foundation', 'Adani Vidya Mandir', 'Mobile health units'],
  },
  {
    name: 'Aditya Birla Group',
    founded: '1857',
    revenue: '$66B',
    presence: '40 countries',
    mission: 'Premium global conglomerate with focus in each business',
    values: ['Integrity', 'Commitment', 'Passion', 'Seamlessness', 'Speed'],
    subsidiaries: 'UltraTech Cement, Hindalco, Aditya Birla Fashion, Grasim',
  },
  {
    name: 'Airtel',
    founded: '1995',
    revenue: '$19B',
    presence: '490M+ customers across 17 countries',
    vision: 'Enrich the lives of customers; win customers for life',
    values: ['Alive', 'Inclusive', 'Respectful'],
    keyProducts: 'Airtel Thanks App, Airtel Payments Bank, Xstream',
  },
  {
    name: 'Capgemini',
    founded: '1967',
    revenue: '€22B',
    employees: '340,000',
    presence: '50+ countries',
    purpose: 'Unleashing human energy through technology for inclusive future',
    values: ['Honesty', 'Boldness', 'Trust', 'Freedom', 'Team Spirit'],
  },
  {
    name: 'CK Birla Group',
    founded: '1857',
    revenue: '$3B',
    presence: '30+ countries',
    employees: '40,000',
    sectors: 'Technology (Birlasoft), Automotive (NEI, AVTEC), Healthcare (CK Birla Hospitals)',
    values: ['Integrity', 'Customer-Centricity', 'Innovation', 'Sustainability', 'People-First'],
  },
  {
    name: "Dr. Reddy's Laboratories",
    founded: '1984',
    revenue: '$3.35B',
    extra: 'Listed: NSE/BSE/NYSE',
    purpose: 'Accelerate access to affordable and innovative medicines',
    values: ['Safety', 'Quality', 'Productivity', 'Respect', 'Collaboration', 'Sustainability'],
    keyProducts: 'Generic drugs, biosimilars, Oncology, Cardiology',
  },
  {
    name: 'IndiGo Airlines',
    founded: '2006',
    revenue: '€9.9B',
    extra: 'Fleet: 360+ aircraft | Market share: 60%+ | 85+ domestic + 30+ international destinations',
    purpose: 'Giving wings to the nation by connecting people and aspirations',
    values: [
      'Always Safe',
      'Passionately Consistent',
      'Service from the Heart',
      'Humility with Pride',
      'Power of We',
    ],
  },
  {
    name: 'JSW Group',
    founded: '1982',
    revenue: '$24B',
    sectors: 'Steel, Energy, Infrastructure, Cement, Paints, EVs, Defence',
    vision: 'Bring positive transformation to every life we touch',
    values: ['Commitment', 'Courage', 'Agility', 'Collaboration', 'Compassion'],
  },
  {
    name: 'Mahindra Group',
    founded: '1945',
    revenue: '$19B',
    extra: '100+ subsidiaries | 20+ industries',
    chairman: 'Anand Mahindra | CEO: Dr. Anish Shah',
    purpose: 'Drive positive change in communities; enable others to rise',
    values: [
      'Good Corporate Citizenship',
      'Professionalism',
      'Customer First',
      'Quality Focus',
      'Dignity of Individual',
    ],
    sectors:
      'Automotive, Farm Equipment, Tech Services (Tech Mahindra), Financial Services, Hospitality, Renewable Energy, Logistics',
  },
  {
    name: 'Reliance Industries',
    founded: '1973',
    revenue: '$128B',
    marketCap: '$225B',
    extra: 'Rank 88 on Fortune 500',
    subsidiaries: 'Jio, Reliance Retail, Jio Cinema, Network18, TV18',
    values: [
      'Customer Value',
      'Ownership Mindset',
      'Respect',
      'Integrity',
      'One Team',
      'Excellence',
    ],
    csr: [
      'Project Jagruti (dyslexia)',
      'Dhirubhai Ambani Protsahan Scheme',
      'Vantara (animal rescue)',
    ],
  },
  {
    name: 'ReNew Power',
    founded: '2011',
    revenue: '$1.28B',
    extra: 'Listed: NASDAQ | Asset base: 18.5 GW across 9 states',
    vision: 'Global leader of the clean energy transition',
    values: ['Pioneer', 'Responsible', 'Excellence', 'Partner'],
    csr: [
      'Project Surya (1000+ women salt pan workers trained as solar technicians)',
      'Water Positivity',
    ],
  },
  {
    name: 'Tata Administrative Services (TAS) / Tata Group',
    founded: '1868',
    revenue: '$180B',
    marketCap: '$446B',
    extra: '26 listed companies',
    mission: 'Improve quality of life globally through long-term stakeholder value creation',
    values: ['Integrity', 'Excellence', 'Unity', 'Responsibility', 'Pioneering'],
    sectors: 'IT, Steel, Automotive, Financial Services, Retail, Aerospace',
  },
];

const d14Modules: Module[] = [
  mod('D14.1', 'Research Framework for Companies', [
    lsn('D14.1.1', 'Business model, revenue streams, value chain', "Analyzing a company's business model involves understanding how it creates, delivers, and captures value. This includes identifying its primary revenue streams, cost structures, and key customer segments. Mapping the value chain highlights the company's core competencies and areas for potential optimization."),
    lsn('D14.1.2', 'Financial health: revenue, margins, M.Cap', "Assessing financial health requires examining key metrics like revenue growth, profit margins, and market capitalization. These indicators reveal the company's operational efficiency, market position, and overall stability. Understanding these financials is crucial for diagnosing business problems and evaluating strategic initiatives."),
    lsn('D14.1.3', 'Core values and mission statement', "A company's core values and mission statement define its culture, purpose, and long-term strategic direction. They provide the guiding principles for decision-making and influence how the company interacts with stakeholders. Aligning your case recommendations with these foundational elements demonstrates deep company understanding."),
    lsn('D14.1.4', 'Recent news, strategic initiatives, CSR', "Researching recent news and strategic initiatives provides context for a company's current challenges and future trajectory. This includes understanding their M&A activity, product launches, and Corporate Social Responsibility (CSR) efforts. Integrating this recent context into your analysis shows proactive research and commercial awareness."),
  ]),
  mod('D14.2', 'Company Compendium (14 Firms)', []),
  mod('D14.3', 'Sector Research Methodology', [
    lsn('D14.3.1', 'Technology & Innovation research', "Technology and innovation research involves tracking emerging trends, patent filings, and R&D investments within a sector. This helps identify potential disruptions, shifts in consumer behavior, and new market opportunities. Understanding the technological landscape is essential for advising companies on digital transformation and future-proofing."),
    lsn('D14.3.2', 'Regulatory & Policy research', "Regulatory and policy research examines the legal frameworks, government initiatives, and compliance requirements affecting an industry. Changes in policy can significantly alter market dynamics, creating new barriers to entry or opening up subsidies. Anticipating regulatory shifts is a critical component of risk management and strategic planning."),
    lsn('D14.3.3', 'Competitor benchmarking research', "Competitor benchmarking involves analyzing rival companies across key dimensions such as market share, product offerings, and financial performance. This identifies industry best practices, relative strengths and weaknesses, and potential areas for differentiation. A robust benchmarking exercise informs competitive strategy and positioning."),
    lsn('D14.3.4', 'Customer segmentation research', "Customer segmentation research divides the broader market into distinct groups based on demographics, psychographics, and purchasing behavior. This allows for targeted marketing, tailored product development, and optimized pricing strategies. Understanding the specific needs and pain points of each segment is vital for driving growth and customer loyalty."),
    lsn('D14.3.5', 'Financial performance research', "Financial performance research across a sector involves comparing key ratios like profitability, liquidity, and leverage among industry players. This reveals the overall health of the sector, average margins, and capital intensity. Sector-level financial analysis provides a baseline for evaluating individual company performance and identifying outliers."),
  ]),
  mod('D14.4', 'Resource Repository for Research', [
    lsn('D14.4.1', 'Research papers: ResearchGate', "Platforms like ResearchGate provide access to peer-reviewed academic papers and scientific studies. These resources are invaluable for deep-dive research into technical subjects, emerging technologies, or rigorous economic analyses. Leveraging academic research adds a layer of depth and credibility to complex consulting projects."),
    lsn('D14.4.2', 'Industry reports: McKinsey, Gartner, EY, PwC', "Industry reports from top-tier firms (McKinsey, Gartner, EY, PwC) offer synthesized market intelligence, trend analysis, and strategic frameworks. These reports are essential for quickly getting up to speed on a new sector, understanding macroeconomic drivers, and identifying industry consensus. They provide the 'consulting perspective' on complex market dynamics."),
    lsn('D14.4.3', 'Financial tools: Cube Software, Forecastr', "Financial tools like Cube Software and Forecastr facilitate advanced financial modeling, scenario planning, and data integration. These platforms streamline the analysis of complex financial data, improving accuracy and efficiency. Proficiency with such tools is increasingly important for data-driven strategic planning and valuation."),
    lsn('D14.4.4', 'Design: Flaticon, Iconscout, Slidesgo, Slide Geeks', "Design resources (Flaticon, Iconscout, Slidesgo, Slide Geeks) provide high-quality visual assets essential for creating impactful consulting presentations. Professional, consistent design enhances the clarity and persuasiveness of your communication. Leveraging these tools helps translate complex data into easily digestible visual narratives."),
    lsn('D14.4.5', 'Presentation frameworks: Benjamin Ball Presentations', "Presentation frameworks, such as those from Benjamin Ball, offer structured methodologies for crafting compelling business narratives. These frameworks guide the flow of information, ensuring the core message is delivered clearly and persuasively. Mastering presentation structure is as critical as the underlying analysis in management consulting."),
  ]),
];

const d14: Domain = {
  code: 'D14',
  slug: 'company-intelligence',
  title: 'Company Intelligence & Research',
  fullTitle: 'D14 | COMPANY INTELLIGENCE & RESEARCH',
  level: 'Intermediate',
  prereqs: 'D1',
  tags: ['company-research', 'industry', 'CSR', 'values', 'placement-prep'],
  modules: d14Modules,
  companies: d14Companies,
  resources: [
    { category: 'Research papers', items: ['ResearchGate'] },
    { category: 'Industry reports', items: ['McKinsey', 'Gartner', 'EY', 'PwC'] },
    { category: 'Financial tools', items: ['Cube Software', 'Forecastr'] },
    { category: 'Design', items: ['Flaticon', 'Iconscout', 'Slidesgo', 'Slide Geeks'] },
    { category: 'Presentation frameworks', items: ['Benjamin Ball Presentations'] },
  ],
};

// ─── D15 | BUSINESS & FINANCIAL FUNDAMENTALS ────────────────────
const d15Modules: Module[] = [
  mod('D15.1', 'Business Economics Fundamentals', [
    lsn('D15.1.1', 'Supply and demand curves; equilibrium', "The interaction of supply and demand curves determines the market equilibrium, setting the baseline price and quantity. Shifts in these curves, driven by factors like consumer preferences or input costs, cause the equilibrium to move. Understanding this dynamic is fundamental to analyzing market sizing, pricing strategies, and competitive responses."),
    lsn('D15.1.2', 'Price elasticity (formula + types)', "Price elasticity measures how sensitive the quantity demanded or supplied is to a change in price. It is calculated as the percentage change in quantity divided by the percentage change in price. Understanding whether a product is elastic (sensitive) or inelastic (insensitive) is crucial for optimizing pricing and maximizing revenue."),
    lsn('D15.1.3', 'Market structures: Perfect competition, Monopoly, Oligopoly, Monopolistic', "Market structures range from perfect competition (many players, identical products) to monopoly (single player, high barriers). Oligopolies feature a few dominant firms, while monopolistic competition involves differentiated products. Identifying the market structure dictates the appropriate competitive strategy, pricing power, and barriers to entry."),
    lsn('D15.1.4', 'Price discrimination: 1st, 2nd, 3rd degree', "Price discrimination involves charging different prices to different customers for the same product to capture more consumer surplus. 1st degree charges the maximum each is willing to pay; 2nd degree offers volume discounts; 3rd degree segments the market (e.g., student vs. adult tickets). This is a powerful tool for maximizing profitability in segmented markets."),
  ]),
  mod('D15.2', 'Accounting Fundamentals', [
    lsn('D15.2.1', 'Key income statement line items: Revenue, COGS, EBITDA, Net Profit', "The income statement tracks a company's financial performance over a specific period, detailing revenues, expenses, and profits. Key items include Revenue (top line), COGS (direct costs), EBITDA (operating proxy), and Net Profit (bottom line). Analyzing these line items helps identify margin compression, cost inefficiencies, and overall profitability trends."),
    lsn('D15.2.2', "Balance sheet: Assets = Liabilities + Shareholder's Equity", "The balance sheet provides a snapshot of a company's financial position at a specific point in time, based on the equation: Assets = Liabilities + Shareholder's Equity. It details what the company owns, what it owes, and the residual value for owners. This statement is critical for assessing liquidity, solvency, and capital structure."),
    lsn('D15.2.3', 'Current vs. non-current assets and liabilities', "Assets and liabilities are classified as current (short-term, <1 year) or non-current (long-term, >1 year). Current items relate to daily operations and working capital, while non-current items involve long-term investments and debt. This distinction is vital for analyzing a company's ability to meet its short-term obligations and fund long-term growth."),
    lsn('D15.2.4', 'Working capital and operating leverage', "Working capital (Current Assets - Current Liabilities) measures a company's short-term liquidity and operational efficiency. Operating leverage refers to the proportion of fixed vs. variable costs; high operating leverage means profits are highly sensitive to sales volume changes. Managing both is crucial for cash flow stability and scaling operations profitably."),
  ]),
  mod('D15.3', 'Financial Ratios & Metrics', [
    lsn('D15.3.1', 'Profitability: Profit Margin, ROE, ROCE', "Profitability ratios assess a company's ability to generate earnings relative to its revenue, assets, or equity. Key metrics include Profit Margin (Net Income/Revenue), ROE (Net Income/Shareholder's Equity), and ROCE (EBIT/Capital Employed). These ratios are fundamental for comparing operational efficiency and investment returns across different firms."),
    lsn('D15.3.2', 'Liquidity: Quick Ratio, Working Capital Ratio', "Liquidity ratios evaluate a company's capacity to pay off its short-term debt obligations without raising external capital. The Quick Ratio (Current Assets - Inventory / Current Liabilities) and Working Capital Ratio provide insights into immediate financial health. Low liquidity can signal impending cash flow crises, even in profitable companies."),
    lsn('D15.3.3', 'Leverage: Debt-to-Equity Ratio', "Leverage ratios, such as the Debt-to-Equity Ratio, measure the extent to which a company is financing its operations through debt versus shareholder funds. High leverage amplifies returns during good times but increases insolvency risk during downturns. Assessing leverage is critical when evaluating a company's risk profile and capital structure optimization."),
    lsn('D15.3.4', 'Valuation: P/E Ratio, EPS, P/B Ratio', "Valuation metrics help determine whether a company's stock is overvalued or undervalued relative to its peers or historical performance. Key ratios include the Price-to-Earnings (P/E) Ratio, Earnings Per Share (EPS), and Price-to-Book (P/B) Ratio. These metrics are heavily used in M&A due diligence and investment analysis to determine fair acquisition prices."),
    lsn('D15.3.5', 'Growth: CAGR, Revenue Growth Rate', "Growth metrics track a company's historical or projected expansion over time. The Compound Annual Growth Rate (CAGR) provides a smoothed annualized return, while the Revenue Growth Rate measures top-line momentum. Consistent, high growth is a primary driver of premium valuations in many sectors, particularly technology."),
  ]),
  mod('D15.4', 'Finance Concepts', [
    lsn('D15.4.1', 'Time Value of Money: PV, FV, NPV, IRR', "The Time Value of Money principle states that a dollar today is worth more than a dollar tomorrow due to its potential earning capacity. Core concepts include Present Value (PV), Future Value (FV), Net Present Value (NPV), and Internal Rate of Return (IRR). These are the foundational calculations for evaluating long-term investments and project viability."),
    lsn('D15.4.2', 'Annuity and Perpetuity', "An annuity is a series of equal payments made at regular intervals over a fixed period, commonly seen in loan repayments or retirement payouts. A perpetuity is a type of annuity that lasts forever, often used to value preferred stock or steady dividend streams. Understanding these cash flow structures is essential for complex financial modeling."),
    lsn('D15.4.3', 'Capital budgeting: NPV, IRR, Payback Period', "Capital budgeting is the process a business uses to evaluate potential major projects or investments. Techniques like NPV (discounting cash flows to present value), IRR (finding the break-even discount rate), and Payback Period (time to recover initial investment) are used. These methods ensure capital is allocated to the most value-accretive opportunities."),
    lsn('D15.4.4', 'Break-even: Fixed Costs / Contribution Margin', "Break-even analysis determines the sales volume required to cover all fixed and variable costs, resulting in zero profit. The formula is Fixed Costs divided by the Contribution Margin per unit (Price - Variable Cost). This is a critical threshold metric used to assess the risk and feasibility of new product launches or pricing changes."),
  ]),
  mod('D15.5', 'Marketing Fundamentals', [
    lsn('D15.5.1', 'Segmentation, Targeting, Positioning (STP)', "STP is a core marketing framework: Segmentation divides the market into distinct groups; Targeting selects the most attractive groups; Positioning defines how the product is perceived relative to competitors. This structured approach ensures marketing efforts are focused, relevant, and differentiated. It forms the basis of any go-to-market strategy."),
    lsn('D15.5.2', 'Bundling, Cross-selling, Upselling', "Bundling combines multiple products for a single price to increase perceived value and average order size. Cross-selling encourages customers to buy related or complementary items. Upselling persuades customers to purchase a more expensive, upgraded version of their chosen item, directly boosting revenue per user."),
    lsn('D15.5.3', 'Customer lifetime value and acquisition cost', "Customer Lifetime Value (CLTV) estimates the total net profit a company can expect from a single customer relationship. Customer Acquisition Cost (CAC) is the total expense incurred to acquire a new customer. A sustainable business model requires that CLTV significantly exceeds CAC, typically by a ratio of 3:1 or higher."),
  ]),
  mod('D15.6', 'Valuation Analysis (Applied)', [
    lsn('D15.6.1', 'Book Value = Assets - Liabilities (Tata Motors FY24 example)', "Book Value represents the net asset value of a company, calculated as Total Assets minus Total Liabilities (and intangible assets). It provides a conservative estimate of what shareholders would receive if the company were liquidated. Comparing Book Value to Market Value highlights how much premium the market places on the company's future growth potential."),
    lsn('D15.6.2', 'Market Cap = Share Price × Outstanding Shares (Tata Motors example)', "Market Capitalization is the total market value of a company's outstanding shares of stock, calculated as Current Share Price multiplied by Total Outstanding Shares. It represents the public market's consensus on the company's overall equity value. MCap is a primary metric used to categorize companies by size (large-cap, mid-cap, small-cap)."),
    lsn('D15.6.3', 'Enterprise Value = MCap + Debt + Minority Interest - Cash', "Enterprise Value (EV) is a comprehensive measure of a company's total value, often viewed as the theoretical takeover price. It is calculated as Market Cap plus Total Debt and Minority Interest, minus Cash and Cash Equivalents. EV is preferred over MCap for valuation multiples (like EV/EBITDA) because it accounts for the company's capital structure."),
  ]),
  mod('D15.7', 'ROIC Tree (Return on Invested Capital)', [
    lsn('D15.7.1', 'ROIC = NOPAT / Investment', "Return on Invested Capital (ROIC) measures how efficiently a company allocates its capital to generate profitable returns. It is calculated as Net Operating Profit After Tax (NOPAT) divided by Invested Capital. A high ROIC indicates a strong competitive advantage and efficient capital utilization, making it a critical metric for long-term value creation."),
    lsn('D15.7.2', 'Decomposition: NOPAT Margin × Capital Turnover', "The ROIC tree decomposes the metric into two main drivers: NOPAT Margin (profitability) and Capital Turnover (asset efficiency). This decomposition allows analysts to pinpoint exactly why ROIC is changing. A company can improve ROIC either by increasing its profit margins or by generating more sales per dollar of invested capital."),
    lsn('D15.7.3', 'Identifying profitability vs. asset efficiency issues', "By breaking down ROIC, consultants can diagnose whether a company's underperformance is a profitability issue (low margins due to high costs or low prices) or an asset efficiency issue (bloated inventory or underutilized fixed assets). This directs the focus of operational improvements. It is the cornerstone of financial diagnostic trees."),
  ]),
  mod('D15.8', 'Competitive Profile Matrix', [
    lsn('D15.8.1', 'Scoring competitors on critical success factors with weighted ratings', "The Competitive Profile Matrix (CPM) is a strategic tool that compares a firm and its rivals across Critical Success Factors (CSFs). Each CSF is assigned a weight based on industry importance, and competitors are rated on their performance. This provides a quantifiable, visual representation of competitive strengths and weaknesses."),
  ]),
  mod('D15.9', 'The 40 Elements of Value to a B2B Business', [
    lsn('D15.9.1', 'Value pyramid: functional → ease → individual → inspirational elements', "The B2B Elements of Value pyramid categorizes value propositions into four levels: functional (meeting basic needs), ease of doing business (saving time/effort), individual (career advancement), and inspirational (purpose/vision). Products that deliver on multiple, higher-level elements command greater loyalty and pricing power. It provides a framework for differentiating commoditized B2B offerings."),
  ]),
];

const d15: Domain = {
  code: 'D15',
  slug: 'business-financial-fundamentals',
  title: 'Business & Financial Fundamentals',
  fullTitle: 'D15 | BUSINESS & FINANCIAL FUNDAMENTALS',
  level: 'Beginner to Intermediate',
  prereqs: 'None',
  tags: ['finance', 'accounting', 'economics', 'fundamentals', 'basics'],
  modules: d15Modules,
};

// ─── D16 | PRODUCT STRATEGY & SAAS ECONOMICS ────────────────────
const d16Modules: Module[] = [
  mod('D16.1', 'Product Management Fundamentals', [
    lsn('D16.1.1', 'Role of a PM vs. consultant vs. engineer', "A Product Manager focuses on discovering the 'what' and 'why' of a product to maximize user value and business viability. While engineers handle the 'how' (execution) and consultants advise on broader strategic shifts, the PM owns the product's daily trajectory and cross-functional alignment. This role requires balancing user empathy with hard business metrics."),
    lsn('D16.1.2', 'Product lifecycle: Discovery, Delivery, Growth, Decline', "The product lifecycle consists of Discovery (identifying the right problem), Delivery (building the solution efficiently), Growth (scaling adoption), and Decline (managing obsolescence). Strategies and key metrics change drastically across these phases. Recognizing the current phase is essential for applying the correct management frameworks and resource allocation."),
    lsn('D16.1.3', 'Opportunity Solution Tree: mapping needs to experiments', "The Opportunity Solution Tree is a visual framework designed by Teresa Torres to map out the path from a desired business outcome to actionable experiments. It connects a high-level goal to specific user opportunities, potential solutions, and the tests needed to validate them. This ensures product teams build features that directly drive strategic objectives."),
  ]),
  mod('D16.2', 'Feature Prioritization Frameworks', [
    lsn('D16.2.1', 'RICE: Reach × Impact × Confidence / Effort', "RICE is a prioritization framework that scores features based on Reach (how many users affected), Impact (degree of benefit), Confidence (certainty of estimates), divided by Effort (time/resources required). It provides a quantifiable score to compare disparate product ideas objectively. RICE helps teams focus on high-impact, low-effort features while accounting for uncertainty."),
    lsn('D16.2.2', 'WSJF: (User Value + Time Criticality + Risk Reduction) / Job Size', "Weighted Shortest Job First (WSJF) is an agile prioritization model used to sequence work for maximum economic benefit. It is calculated by dividing the Cost of Delay (User Value + Time Criticality + Risk Reduction) by the Job Size (duration). WSJF ensures teams tackle the most critical, highest-value tasks that can be delivered quickly."),
    lsn('D16.2.3', 'Kano Model: Must-haves, Performance, Delighters', "The Kano Model categorizes product features based on how they impact customer satisfaction: Must-haves (basic expectations), Performance (linear satisfaction), and Delighters (unexpected bonuses). Over time, Delighters become Must-haves as user expectations evolve. This framework helps balance building foundational features with investing in innovation."),
    lsn('D16.2.4', "MoSCoW: Must/Should/Could/Won't have", "MoSCoW is a simple categorization technique for requirements: Must have (non-negotiable), Should have (important but not vital), Could have (nice to have), and Won't have (out of scope for now). It is highly effective for managing stakeholder expectations and defining the Minimum Viable Product (MVP). It prevents scope creep during critical delivery phases."),
    lsn('D16.2.5', 'Impact vs. Effort Matrix: quick wins vs. major projects', "The Impact vs. Effort Matrix is a 2x2 grid that plots potential initiatives based on their expected value and the resources required. It quickly categorizes tasks into 'Quick Wins' (high impact, low effort), 'Major Projects', 'Fill-ins', and 'Thankless Tasks'. This visual tool is excellent for rapid, high-level strategic alignment during workshops."),
  ]),
  mod('D16.3', 'SaaS Unit Economics', [
    lsn('D16.3.1', 'Customer Acquisition Cost (CAC): formula and benchmarks', "Customer Acquisition Cost (CAC) is the total marketing and sales expenditure divided by the number of new customers acquired over a given period. It is a fundamental metric for evaluating the efficiency of growth strategies. Industry benchmarks vary wildly by sector, but a rising CAC often indicates market saturation or inefficient spend."),
    lsn('D16.3.2', 'Lifetime Value (LTV): gross margin × average lifespan', "Lifetime Value (LTV) estimates the total gross margin a company will generate from a single customer over the duration of their relationship. It relies on average order value, purchase frequency, and churn rate. Accurate LTV forecasting is essential for determining how much a company can afford to spend on acquisition."),
    lsn('D16.3.3', 'LTV:CAC Ratio: healthy = 3:1 (but fragile; use CAC Payback instead)', "The LTV:CAC Ratio evaluates the long-term sustainability of the business model, with 3:1 generally considered a healthy benchmark for SaaS. However, LTV is often based on fragile future assumptions, making this ratio easily manipulated. Investors increasingly look at CAC Payback alongside this ratio for a grounded reality check."),
    lsn('D16.3.4', 'CAC Payback Period: months to recover acquisition cost', "The CAC Payback Period calculates the number of months required for a customer's gross margin contributions to cover their acquisition cost. A shorter payback period (typically under 12 months for SMBs) means the company recovers cash faster, reducing the need for external funding to fuel growth. It is a critical measure of capital efficiency."),
    lsn('D16.3.5', 'Annual and Monthly Churn (by SaaS vertical)', "Annual and Monthly Churn measure the percentage of customers (or revenue) lost during a specific period. Churn rates vary significantly by SaaS vertical; mission-critical infrastructure has low churn, while commoditized tools see higher turnover. Managing churn is often more impactful on long-term growth than accelerating new customer acquisition."),
    lsn('D16.3.6', 'Net Revenue Retention (NRR): >100% = negative churn', "Net Revenue Retention (NRR) measures the percentage of recurring revenue retained from existing customers, factoring in upgrades, downgrades, and churn. An NRR above 100% means the company's revenue from its current base is growing faster than it is losing revenue to churn. High NRR is the hallmark of top-tier SaaS companies, indicating strong product-market fit."),
  ]),
  mod('D16.4', 'SaaS Benchmarks 2025-2026', []),
  mod('D16.5', 'Digital Business Models', [
    lsn('D16.5.1', 'Freemium vs. Premium vs. Usage-based vs. Flat-rate', "Digital business models define how a company monetizes its software. Freemium offers basic features for free to build a user base; Premium relies on high-value paid tiers; Usage-based charges per transaction or API call; Flat-rate offers all-you-can-eat access. Selecting the right model depends on the product's value metric and marginal costs."),
    lsn('D16.5.2', 'Product-Led Growth (PLG) vs. Sales-Led Growth', "Product-Led Growth (PLG) relies on the product itself as the primary driver of acquisition, retention, and expansion, typically utilizing self-serve free trials. Sales-Led Growth relies on human sales teams to navigate complex enterprise procurement processes. Many successful companies eventually adopt a hybrid model, using PLG for SMBs and enterprise sales for larger accounts."),
    lsn('D16.5.3', 'Two-sided platforms and network effects', "Two-sided platforms connect distinct user groups (e.g., buyers and sellers), creating value through interactions. They rely heavily on network effects, where the platform becomes more valuable as more users join on either side. Overcoming the 'chicken-and-egg' problem to achieve critical mass is the primary strategic challenge for these businesses."),
    lsn('D16.5.4', 'Aggregator vs. Platform vs. Direct B2C models', "Aggregators (like Google or Zillow) control demand by organizing vast amounts of third-party supply and owning the user relationship. Platforms (like Shopify) provide the underlying infrastructure for others to operate, while Direct B2C models sell proprietary products directly to consumers. Each model has distinct margin profiles, defensibility traits, and scaling challenges."),
  ]),
  mod('D16.6', 'Tech Industry Overviews', [
    lsn('D16.6.1', 'AI/ML: market size, use cases, government initiatives (India)', "The AI/ML sector is experiencing explosive growth, expanding from niche applications to broad horizontal use cases across all industries. In India, government initiatives like 'IndiaAI' aim to foster local capabilities and datasets. Understanding this landscape involves tracking computing costs, foundational model developments, and sector-specific AI adoption rates."),
    lsn('D16.6.2', 'Google business model (hidden revenue, Maps API, Payments)', "Google's business model is primarily an advertising ecosystem fueled by user data, but it has diversified significantly. Hidden revenue streams include enterprise cloud services, app store fees, Maps API licensing, and hardware. Analyzing Google requires understanding how these disparate parts create a highly defensible, interconnected moat."),
    lsn('D16.6.3', 'Global Cloud: AWS vs. Azure vs. GCP; pricing models; IaaS/PaaS/SaaS', "The global cloud computing market is dominated by AWS, Microsoft Azure, and Google Cloud Platform (GCP). They offer services across Infrastructure (IaaS), Platform (PaaS), and Software (SaaS), with complex, usage-based pricing models. Competition centers on enterprise lock-in, data sovereignty features, and specialized AI/ML tooling."),
  ]),
];

const d16: Domain = {
  code: 'D16',
  slug: 'product-strategy-saas',
  title: 'Product Strategy & SaaS Economics',
  fullTitle: 'D16 | PRODUCT STRATEGY & SAAS ECONOMICS',
  level: 'Advanced',
  prereqs: 'D15',
  tags: ['product', 'saas', 'startup', 'digital', 'unit-economics'],
  modules: d16Modules,
  saasBenchmarks: [
    'Infrastructure/DevOps: 1.8% monthly churn (highest stickiness)',
    'CRM Platforms: 2.4% monthly churn',
    'Collaboration: 4.1% monthly churn',
    'Email/Communication: 8.1% monthly churn (most commoditized)',
    'Pre-PMF startups: 67.8% annual churn → compresses to 21% post-$50M ARR',
    'Usage-based pricing: 22.9% annual churn (more resilient)',
    'Flat-rate pricing: 52.1% annual churn',
    'Trial conversion: Self-serve = 4.6%; Sales-assisted PLG = 17.4%',
  ],
};

// ─── D17 | INDIA MACRO BENCHMARKS ───────────────────────────────
const d17Modules: Module[] = [
  mod('D17.1', 'Population & Demographics', []),
  mod('D17.2', 'Age Distribution', []),
  mod('D17.3', 'Income Segments', []),
  mod('D17.4', 'Key City Populations', []),
  mod('D17.5', 'Digital Infrastructure', []),
  mod('D17.6', 'Economic Indicators', []),
  mod('D17.7', 'Employment & Occupation', []),
  mod('D17.8', 'FMCG Distribution Benchmarks', []),
  mod('D17.9', 'Vehicle Ownership', []),
  mod('D17.10', 'Religion & Social', []),
];

const d17: Domain = {
  code: 'D17',
  slug: 'india-macro-benchmarks',
  title: 'India Macro Benchmarks',
  fullTitle: 'D17 | INDIA MACRO BENCHMARKS',
  level: 'Beginner (reference module)',
  prereqs: 'None',
  tags: ['india', 'demographics', 'benchmarks', 'macro', 'statistics'],
  modules: d17Modules,
  benchmarkSections: [
    {
      title: 'Population & Demographics',
      stats: [
        'Total: 1.4 Billion | Median Age: 28 | Life Expectancy: 70.4',
        'Urban: 40% (560M) | Rural: 60% (840M)',
        'Gender: Male 52%, Female 48%',
        'Household size: Urban = 4 | Rural = 5 | Total households = 31 Crore',
      ],
    },
    {
      title: 'Age Distribution',
      stats: [
        '0-14 years: 26% (364M)',
        '15-24 years: 18% (252M)',
        '25-34 years: 17% (238M)',
        '35-44 years: 14% (196M)',
        '45-54 years: 10% (140M)',
        '55+: 15% (210M)',
      ],
    },
    {
      title: 'Income Segments',
      stats: [
        'Destitute/Strugglers: 15-25% | < Rs 1.25L/year | Subsidy-dependent',
        'Aspirers (Lower Middle): 30-50% | Rs 1.25L – 5L | Mass-market FMCG',
        'Middle Class/Affluent: 20-30% | Rs 5L – 30L | Premiumization core',
        'Rich/Elite: 5-15% | > Rs 30L | Luxury, Premium SaaS',
      ],
    },
    {
      title: 'Key City Populations',
      stats: [
        'Delhi: 3.3 Crore | Mumbai: 2.1 Crore | Bengaluru: 1.4-1.5 Crore',
        'Kolkata: 1.55 Crore | Hyderabad: 1.1 Crore | Chennai: 1.2 Crore',
        'Ahmedabad: 0.87 Crore | Surat: 0.81 Crore',
      ],
    },
    {
      title: 'Digital Infrastructure',
      stats: [
        'Internet: 50% | Smartphone: 70% | Social Media: 460M | OTT: 100M subscribers',
      ],
    },
    {
      title: 'Economic Indicators',
      stats: [
        'GDP: ~$3.4 Trillion | Growth: ~7% | Inflation target: ~4%',
        'Sector split: Agriculture 20%, Industry 26%, Services 54%',
        'E-commerce: $150B+ | CAGR: 15%',
      ],
    },
    {
      title: 'Employment & Occupation',
      stats: [
        'Working age: 50% of population',
        'Blue collar: 75% of working | White collar: 25%',
        'Unorganised sector: 70% | Organised sector: 30%',
        'Agriculture: 40% | Industry: 25% | Services: 35%',
      ],
    },
    {
      title: 'FMCG Distribution Benchmarks',
      stats: [
        'Packaged staples: 3-6% gross, 1-3% net',
        'Personal/Home care: 4-8% gross, 2-4% net',
        'Snacks/Namkeen: 5-10% gross, 2-5% net',
        'Beverages: 6-12% gross, 2.5-5% net',
        'Health/Wellness: 8-12% gross, 4-6% net',
        'Dairy/Frozen: 8-16% gross, 3-6% net (highest spoilage risk)',
        'Hidden costs: Working capital interest (Rs 8-15K/month); spoilage (0.5-2%); scheme leakage (1-3%)',
      ],
    },
    {
      title: 'Vehicle Ownership',
      stats: [
        '2-wheelers: 185 per 1000 people | 4-wheelers: 34 per 1000 people',
        'Commercially owned: 12% | Private: 88%',
      ],
    },
    {
      title: 'Religion & Social',
      stats: [
        'Hindu: 80% | Muslim: 13% | Christian: 2.3% | Others: 4.7%',
        'Married: 55% | Unmarried: 45%',
        'Vegetarian: ~260M | Non-vegetarian: ~1.14B',
      ],
    },
  ],
};

// ─── D18 | PRACTICE CASE LIBRARY (FULL INDEX) ───────────────────
const d18CustomerSatCases: CaseEntry[] = [
  {
    code: 'CS-01',
    title: 'Light Bulb Company (DSM Sales Team)',
    sector: 'FMCG',
    source: 'BCG',
    problem: 'DSM sales reps making 5 productive calls/week vs. 8 industry average',
    framework: 'Total calls × Conversion rate = Productive calls',
    rootCause: "Beat plan not optimized to retailer's replenishment cycle",
    resolution: 'Optimize visit frequency; incentivize retailers; digital route optimization',
  },
  {
    code: 'CS-02',
    title: 'Bottling Plant (Cola)',
    sector: 'FMCG/Manufacturing',
    source: 'Kearney',
    problem: 'Excess inventory + delayed delivery complaints',
    rootCause:
      'Summer demand jumped from 6000 to 10000 bottles/day; bottling capacity (8000/day) is bottleneck',
    resolution: 'New bottling line (capex); shift QA before bottleneck; outsource seasonally',
  },
  {
    code: 'CS-03',
    title: 'Telecom Provider (Kenya)',
    sector: 'Telecom',
    source: 'Kearney',
    problem: 'Dip in customer satisfaction levels; complaint resolution poor',
    rootCause:
      'Complaints not getting through to CC staff due to high Q&R call volume clogging IVR',
    resolution: 'Customer education on digital self-service; AI-powered IVR; optimize IVR menu',
  },
];

const d18CompetitionSummaries: CaseEntry[] = [
  {
    code: 'WIN-01',
    title: 'SAPA Initiative (SRCC Case 180 - Management)',
    sector: 'Public Policy',
    source: 'SRCC',
    problem: '200M+ Indians physically inactive; sports infrastructure gap',
    resolution:
      '4-phase strategy (Laying Foundation → Community Activation → Inclusive Access → Sustainable Culture)',
    keyInsight: 'Olympic Seed Academies; AI-powered mass sports festivals',
  },
  {
    code: 'WIN-02',
    title: 'ODOP Go-To-Market (Case Crack - Hindu)',
    sector: 'GTM Strategy',
    problem: 'One District One Product initiative struggling with market access and scaling',
    resolution: 'Online + offline distribution; ethical sourcing; influencer marketing',
  },
  {
    code: 'WIN-03',
    title: 'EV Startup GTM (Eunoia - SRCC)',
    sector: 'Market Entry',
    problem: 'New Indian EV 4-wheeler startup with no brand recognition',
    resolution:
      '"VOLT-ERA" brand targeting fleet + corporate + government; AARRR model; 3-phase launch',
  },
  {
    code: 'WIN-04',
    title: 'AI-powered Supply Chain Biomaterials (Smart Tank - FLAME)',
    sector: 'Growth Strategy',
    problem: 'Phool.co scaling temple waste biomaterials startup',
    resolution: 'Local hub to global licensing; AI-powered sorting; blockchain tracking',
  },
  {
    code: 'WIN-05',
    title: 'RapidKart Quick Commerce Turnaround (Case Closed - Hansraj)',
    sector: 'Finance/Profitability',
    problem: 'Rs 80 Crore monthly burn; -Rs 90 per order economics',
    resolution:
      'Rationalize dark stores; reset delivery times; subscription model; private label',
  },
];

const d18Modules: Module[] = [
  mod('D18.1', 'Searchable Case Index', [
    lsn('D18.1.1', 'Filter by: Case Type, Difficulty, Sector, Source, Duration', "The Searchable Case Index allows users to efficiently navigate the extensive practice library to target specific skill gaps. Cases can be filtered by type (e.g., profitability, market entry), difficulty level, industry sector, and origin source. This organized approach ensures candidates can systematically build their case-solving repertoire."),
  ]),
  mod('D18.2', 'Profitability (26 cases) → D4.4', []),
  mod('D18.3', 'Market Entry (10 cases) → D5.5', []),
  mod('D18.4', 'Growth (9 cases) → D6.2', []),
  mod('D18.5', 'Pricing (5 cases) → D7.2', []),
  mod('D18.6', 'Operations (3 cases) → D8.3', []),
  mod('D18.7', 'M&A (3 cases) → D9.3', []),
  mod('D18.8', 'Due Diligence (2 cases) → D9.4', []),
  mod('D18.9', 'Unconventional (15 cases) → D10.2', []),
  mod('D18.10', 'Customer Satisfaction (3 cases)', []),
  mod('D18.11', 'Industry Overview Cases → D14', []),
  mod('D18.12', 'Case Competition Quick Summaries (from 180DC and FMS books)', []),
];

const d18: Domain = {
  code: 'D18',
  slug: 'practice-case-library',
  title: 'Practice Case Library (Full Index)',
  fullTitle: 'D18 | PRACTICE CASE LIBRARY (FULL INDEX)',
  level: 'All levels',
  prereqs: 'None',
  tags: ['practice', 'case-library', 'index', 'searchable'],
  modules: d18Modules,
  customerSatCases: d18CustomerSatCases,
  competitionSummaries: d18CompetitionSummaries,
  notes:
    'Searchable Case Index — Filter by: [Case Type] [Difficulty] [Sector] [Source] [Duration]. Additional 45+ case competition entries available as condensed cards in the platform.',
};

// ═══════════════════════════════════════════════════════════════════
// EXPORTED CONSTANTS
// ═══════════════════════════════════════════════════════════════════

/** Domains D13 – D18 */
export const DOMAINS_SUPPLEMENTARY: Domain[] = [d13, d14, d15, d16, d17, d18];

/** Section 7 — Five guided learning paths (A-E) */
export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'A',
    title: 'Consulting Foundations',
    duration: '6 weeks',
    weeks: [
      { week: '1', content: 'D1 (Consulting overview) + D15 (Business fundamentals)' },
      { week: '2', content: 'D2 (Case methodology) + D3.1-D3.4 (Core frameworks)' },
      { week: '3', content: 'D4 (Profitability, easy cases) + D11.1-D11.4 (Guesstimate basics)' },
      { week: '4', content: 'D11.5 G-01 to G-25 (Guesstimate practice)' },
      { week: '5', content: 'D5 (Market entry, easy-moderate) + D6 (Growth, easy-moderate)' },
      { week: '6', content: 'D12 (HR/Behavioral) + D13 (GD preparation)' },
    ],
    milestone: '10 solved guesstimates + 5 full cases + 1 mock GD',
  },
  {
    id: 'B',
    title: 'Case Interview Intensive',
    duration: '4 weeks',
    weeks: [
      { week: '1', content: 'D2 + D3 (full framework mastery)' },
      { week: '2', content: 'D4 all 26 cases + D7 pricing cases' },
      { week: '3', content: 'D5 all 10 market entry cases + D6 all 9 growth cases' },
      { week: '4', content: 'D8, D9, D10 + D18 full case library' },
    ],
    milestone: '50+ cases solved; clear articulation of 8 case types',
  },
  {
    id: 'C',
    title: 'Guesstimate Mastery',
    duration: '2 weeks',
    weeks: [
      { week: '1', content: 'D11.1-D11.4 (theory) + G-01 to G-35 (practice)' },
      { week: '2', content: 'G-36 to G-69 + custom estimation drills' },
    ],
    milestone: 'Solve any guesstimate in under 15 minutes with validation',
  },
  {
    id: 'D',
    title: 'General Management',
    duration: '8 weeks',
    weeks: [
      { week: '1-2', content: 'D1 + D14 (Company profiles) + D13 (GD deep-dive)' },
      { week: '3-4', content: 'D12 (HR comprehensive) + D15 (Business fundamentals)' },
      { week: '5-6', content: 'D4 + D5 (Profitability + Market Entry for GM context)' },
      {
        week: '7-8',
        content: 'Company-specific prep (TAS, Mahindra, Reliance, CK Birla)',
      },
    ],
    milestone: '5 GD mock sessions + complete HR question bank + company intel',
  },
  {
    id: 'E',
    title: 'Advanced Strategist',
    duration: 'Ongoing',
    weeks: [
      {
        week: 'Ongoing',
        content:
          'D9 (M&A) + D16 (Product/SaaS) + D17 (India macro depth) + Industry deep-dives (all 18 sectors) + Case competition submissions',
      },
    ],
    milestone: 'Ready for BCG/McKinsey/Bain R2 interviews',
  },
];

/** Section 1 — Platform-wide statistics */
export const PLATFORM_STATS: PlatformStats = {
  totalModules: 18,
  totalLessons: '~240 distinct learning units',
  caseLibrary: '75+ structured practice cases',
  guesstimatBank: '60+ solved guesstimates',
  frameworkLibrary: '35 frameworks with visual maps',
  interviewBank: '20+ real company interview transcripts',
  gdBank: '25+ Group Discussion scenarios',
  companyIntel: '14 company profiles',
};

/** Section 4 — 18 industry deep-dive sectors */
export const INDUSTRY_SECTORS: string[] = [
  'Automotive',
  'Aviation',
  'Banking',
  'Cement',
  'Defense Manufacturing',
  'E-Commerce',
  'EdTech',
  'Electric Vehicles',
  'FMCG',
  'Food Delivery',
  'Healthcare',
  'Hospitality',
  'IT Services',
  'Logistics',
  'Media & Entertainment',
  'NBFC',
  'Oil & Gas',
  'Pharma, Power, Telecom',
];

/** Section 8 — 7 quiz question types */
export const QUIZ_TYPES: QuizType[] = [
  {
    code: 'Q-TYPE-01',
    name: 'Concept Check (Multiple Choice)',
    example:
      'Which framework would you use first to diagnose a 30% profit decline?',
    answer: 'B',
    explanation: 'Profitability cases start with Revenue vs. Cost decomposition',
  },
  {
    code: 'Q-TYPE-02',
    name: 'Framework Identification (Match)',
    example: 'Match case symptom to root framework — Symptoms ↔ Frameworks: 10 pairs',
  },
  {
    code: 'Q-TYPE-03',
    name: 'Calculation Drills (Numeric)',
    example:
      'Contribution margin = Rs 200, Fixed costs = Rs 10 Lakh. Breakeven quantity = ?',
    answer: '5,000 units',
  },
  {
    code: 'Q-TYPE-04',
    name: 'Case Analysis (Scenario-based)',
    example:
      'Client is an airline with declining revenue. Revenue per passenger is stable. What do you investigate next?',
    answer: 'Number of passengers → then segment by route, cabin class, season',
  },
  {
    code: 'Q-TYPE-05',
    name: 'Guesstimate Steps (Open-ended)',
    example: 'Walk through estimating the number of Swiggy drivers in Mumbai',
    explanation:
      'Scored on: Approach, segmentation, reasonable assumptions, math accuracy, sanity check',
  },
  {
    code: 'Q-TYPE-06',
    name: 'Anti-Pattern Identification',
    example:
      'Which of the following is NOT a valid clarifying question at the start of a case?',
    answer: 'B (the candidate should discover this through analysis, not be told upfront)',
  },
  {
    code: 'Q-TYPE-07',
    name: 'Drag-and-Drop (Framework building)',
    example:
      "Arrange these nodes into a MECE issue tree for a biscuit manufacturer's declining profits — Nodes: Revenue | Cost | Volume | Price | Fixed Cost | Variable Cost | Manufacturing | Distribution...",
  },
];

/** Section 8 — 8 flashcard decks (spaced repetition) */
export const FLASHCARD_DECKS: FlashcardDeck[] = [
  { name: '35 Frameworks (name → components + when to use)', cardCount: '35' },
  { name: 'India Demographic Benchmarks', cardCount: '60' },
  { name: 'Case Root Causes (case → root cause pairs)', cardCount: '75' },
  { name: 'Financial Formulas', cardCount: '25' },
  { name: 'SaaS/Digital Benchmarks', cardCount: '20' },
  { name: 'FMCG Margin Benchmarks', cardCount: '15' },
  { name: 'Amazon Leadership Principles', cardCount: '16' },
  { name: 'Framework Application Triggers', cardCount: '35' },
];

/** Section 9 — 35 visualisation / diagram items */
export const VISUALIZATION_INVENTORY: VisualizationItem[] = [
  { code: 'VIZ-01', name: 'Consulting Firm Hierarchy Pyramid' },
  { code: 'VIZ-02', name: 'Case Interview Process Flow (8-step linear)' },
  { code: 'VIZ-03', name: 'Competency Radar Chart (6 dimensions)' },
  { code: 'VIZ-04', name: 'Profitability Tree (interactive, expandable)' },
  { code: 'VIZ-05', name: 'MECE Issue Tree Builder (drag-and-drop)' },
  { code: 'VIZ-06', name: '3Cs Framework Triangle' },
  { code: 'VIZ-07', name: '4Ps Grid' },
  { code: 'VIZ-08', name: "Porter's Five Forces Spider" },
  { code: 'VIZ-09', name: 'BCG Matrix (with Apple example overlay)' },
  { code: 'VIZ-10', name: 'Ansoff Matrix (with Coca-Cola example)' },
  { code: 'VIZ-11', name: 'McKinsey 7S Web Diagram' },
  { code: 'VIZ-12', name: 'Value Chain (Primary + Support activities)' },
  { code: 'VIZ-13', name: 'PESTEL Hexagon' },
  { code: 'VIZ-14', name: 'TAM-SAM-SOM Nested Circles' },
  { code: 'VIZ-15', name: 'Pyramid Principle Inverted Triangle' },
  { code: 'VIZ-16', name: 'SCQA Narrative Flow' },
  { code: 'VIZ-17', name: 'Hypothesis Testing Loop (iterative cycle)' },
  { code: 'VIZ-18', name: 'Backward Induction Reverse Arrow' },
  { code: 'VIZ-19', name: 'Theory of Constraints Pipeline (with bottleneck highlighted)' },
  { code: 'VIZ-20', name: 'Guesstimate Top-Down vs. Bottom-Up Split Decision Tree' },
  { code: 'VIZ-21', name: 'India Income Pyramid (4 segments)' },
  { code: 'VIZ-22', name: 'India Age Distribution Bar Chart' },
  { code: 'VIZ-23', name: 'Urban/Rural Split Circle' },
  { code: 'VIZ-24', name: 'SaaS Churn by Vertical Bar Chart' },
  { code: 'VIZ-25', name: 'SaaS Unit Economics Waterfall (CAC → LTV → NRR)' },
  { code: 'VIZ-26', name: 'FMCG Distribution Channel Flow' },
  { code: 'VIZ-27', name: 'FMCG Margin Waterfall (Gross → Net → Hidden Costs)' },
  { code: 'VIZ-28', name: 'Framework Applicability Matrix (case type × framework)' },
  { code: 'VIZ-29', name: 'Learning Path Timeline (4 paths)' },
  { code: 'VIZ-30', name: 'Company Ecosystem Map (TAS, Mahindra, Reliance sector overlays)' },
  { code: 'VIZ-31', name: 'Stakeholder Heat Map (2×2 power/interest)' },
  { code: 'VIZ-32', name: 'VRIO Decision Tree' },
  { code: 'VIZ-33', name: 'RICE Scoring Bar Chart' },
  { code: 'VIZ-34', name: 'Kano Model Curve' },
  { code: 'VIZ-35', name: 'Impact vs. Effort Quadrant' },
];

/** Section 10 — 10 identified content gaps */
export const CONTENT_GAPS: ContentGap[] = [
  {
    code: 'GAP-01',
    title: 'Emerging Market Entry Case Library',
    missing: 'Africa, Southeast Asia, MENA market entry cases',
    priority: 'HIGH',
  },
  {
    code: 'GAP-02',
    title: 'Technology Sector Case Bank',
    existing: 'Only 2-3 tech cases (Swiggy, Dunzo, fantasy app)',
    missing: 'Deep cases for SaaS companies, platform businesses, AI firms',
    priority: 'HIGH',
  },
  {
    code: 'GAP-03',
    title: 'ESG / Sustainability Case Bank',
    existing: '2 sustainability cases (Phool.co, green airline)',
    missing: 'Carbon pricing, supply chain ESG, ESG reporting, climate risk',
    priority: 'HIGH',
  },
  {
    code: 'GAP-04',
    title: 'Healthcare / Pharma Case Depth',
    existing: '2 pharma cases (Hepatitis-B drug, vaccine)',
    missing: 'Hospital operations, diagnostic chains, medtech, telemedicine',
    priority: 'MEDIUM',
  },
  {
    code: 'GAP-05',
    title: 'Private Equity / VC Frameworks',
    existing: 'PE case (Mongolia goldmine, cosmetic chain, fantasy sports)',
    missing: 'Formal PE/VC framework; LBO modeling; term sheets; cap table',
    priority: 'MEDIUM',
  },
  {
    code: 'GAP-06',
    title: 'HR Transformation / People Analytics Cases',
    missing: 'Org restructuring, DEI strategy, workforce planning cases',
    priority: 'MEDIUM',
  },
  {
    code: 'GAP-07',
    title: 'Fintech / Financial Services Depth',
    existing: '1-2 NBFC/bank cases',
    missing: 'Payments, lending, WealthTech, InsurTech cases',
    priority: 'MEDIUM',
  },
  {
    code: 'GAP-08',
    title: 'Supply Chain & Logistics Cases',
    existing: 'Only mention in operations context',
    missing: '3PL strategy, last-mile cases, procurement optimization',
    priority: 'MEDIUM',
  },
  {
    code: 'GAP-09',
    title: 'Video Script Library',
    missing: '10-15 min explainer videos for each framework',
    priority: 'HIGH',
  },
  {
    code: 'GAP-10',
    title: 'AI Tutor Prompt Bank',
    missing: 'Structured prompts for AI feedback on user case attempts',
    priority: 'HIGH',
  },
];
