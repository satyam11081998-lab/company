/* ================================================================
   Data: Domains D1–D6 — Consulting Foundations through Growth Strategy
   Auto-generated from consulting_platform_architecture.md and
   supplementary source documents.
   ================================================================ */

import type { Domain, Module, Lesson, CaseEntry } from './types';

// ─── D1 | CONSULTING FOUNDATIONS ────────────────────────────────────────────

const D1_MODULES: Module[] = [
  {
    id: 'D1.1',
    title: 'What Is Management Consulting',
    lessons: [
      { id: 'D1.1.1', title: 'Definition and scope of consulting work', description: 'Management consulting is the practice of advising organizations on strategic, operational, and organizational problems to drive performance. Consultants act as objective analysts who bring industry best practices and rigorous frameworks to complex corporate challenges.' },
      { id: 'D1.1.2', title: 'Types of consulting (strategy, ops, IT, HR, sustainability)', description: 'The industry is segmented into strategy (corporate direction), operations (supply chain optimization), and specialized fields like IT and ESG. Top-tier firms increasingly blend these to offer end-to-end transformation, from high-level design to execution.' },
      { id: 'D1.1.3', title: 'Consulting vs. industry roles: key differences', description: 'Consulting offers rapid exposure to diverse industries, high-stakes problems, and accelerated learning curves compared to traditional corporate roles. While industry roles focus on long-term execution, consulting emphasizes structural problem-solving and executive communication.' },
      { id: 'D1.1.4', title: 'How consulting firms create value for clients', description: 'Firms deliver value by providing external objectivity, specialized expertise, and dedicated analytical bandwidth that clients lack internally. They synthesize vast data into actionable insights, helping organizations mitigate risk and capitalize on opportunities.' },
    ],
  },
  {
    id: 'D1.2',
    title: 'The Consulting Ecosystem',
    lessons: [
      { id: 'D1.2.1', title: 'MBB (McKinsey, BCG, Bain): positioning and culture', description: 'MBB firms represent the pinnacle of premium strategy consulting, advising Fortune 500 C-suites on their most critical decisions. Each has a distinct culture: McKinsey focuses on structural rigor, BCG on customized innovation, and Bain on private equity prowess.' },
      { id: 'D1.2.2', title: 'Big 4 (Deloitte, EY, PwC, KPMG): strategy arms', description: 'The Big 4 have aggressive strategy divisions that combine high-level strategic advisory with massive implementation capabilities. They leverage their parent networks to win large-scale operational and digital transformation engagements.' },
      { id: 'D1.2.3', title: 'Mid-tier and boutique firms (Kearney, L.E.K., Oliver Wyman)', description: 'Mid-tier and boutique firms specialize in specific sectors or functional areas, often matching MBB in their specialized domains. For example, Kearney excels in operations, L.E.K. in life sciences, and Oliver Wyman in financial services.' },
      { id: 'D1.2.4', title: 'Indian consulting landscape and General Management firms', description: 'The Indian market features a blend of global giants, localized boutiques, and prestigious General Management programs like TAS. These roles offer uniquely localized strategic challenges in a high-growth emerging economy.' },
    ],
  },
  {
    id: 'D1.3',
    title: 'The Consulting Career Path',
    lessons: [
      { id: 'D1.3.1', title: 'Hierarchy: Analyst → Consultant → Manager → Principal → Partner', description: 'The consulting ladder moves from data-driven analysis to team management, and ultimately to client relationship and firm leadership. Promotions require mastering specific competencies, shifting from execution to strategic advisory.' },
      { id: 'D1.3.2', title: 'Up-or-out culture and performance expectations', description: 'Top firms employ a strict up-or-out model where consultants must achieve promotion within a set timeframe or transition out. This ensures a high-performance environment and constant upward mobility.' },
      { id: 'D1.3.3', title: 'Campus vs. experienced hire recruitment', description: 'Campus hires are evaluated heavily on raw intellectual horsepower and cultural fit via case interviews. Experienced hires must demonstrate these traits alongside deep industry expertise and translation of past experience into firm methodology.' },
      { id: 'D1.3.4', title: 'Internship to PPO conversion: what firms look for', description: 'Securing a Pre-Placement Offer requires flawless execution of assigned tasks, proactive problem-solving, and seamless integration into team culture. Firms assess if interns can handle client pressures and deliver structured insights.' },
    ],
  },
  {
    id: 'D1.4',
    title: 'How to Find Competitions and Opportunities',
    lessons: [
      { id: 'D1.4.1', title: 'Platforms: Unstop, LinkedIn, institutional pages', description: 'Platforms like Unstop aggregate a vast array of case competitions essential for building a consulting resume. Active networking on LinkedIn is critical for uncovering exclusive masterclasses.' },
      { id: 'D1.4.2', title: 'Competition formats: quiz rounds, case submissions, finals', description: 'Competitions typically filter thousands of applicants through rigorous online quizzes before proceeding to slide-deck submissions. The grand finals require live presentations to senior partners, testing executive presence.' },
      { id: 'D1.4.3', title: 'Corporate competitions: EY, Bain, PwC, Accenture', description: 'Competitions sponsored by top firms act as direct funnels for recruitment, offering accelerated interview processes for winners. They demand adherence to the specific firm\'s structural methodologies.' },
      { id: 'D1.4.4', title: 'International competitions: CBS, Harvard GCCH, TUBC', description: 'Global competitions provide exposure to diverse problem sets and international benchmarking against top-tier talent. Success signals elite adaptability, cross-cultural teamwork, and world-class structural thinking.' },
    ],
  },
  {
    id: 'D1.5',
    title: 'General Management vs. Consulting',
    lessons: [
      { id: 'D1.5.1', title: 'What is General Management (Gen Man)?', description: 'General Management programs rotate talent across business functions to groom future P&L leaders. Unlike consulting, which remains advisory, GM roles mandate direct execution and operational ownership.' },
      { id: 'D1.5.2', title: 'Core GM responsibilities: strategy, cross-function, execution', description: 'A GM professional must bridge high-level corporate strategy with day-to-day operational realities across distinct departments. This requires exceptional stakeholder management and cross-functional empathy.' },
      { id: 'D1.5.3', title: 'Key firms: TAS, Mahindra, Aditya Birla, Reliance, JSW', description: 'India\'s premier conglomerates run elite GM programs highly coveted by top MBA graduates. These programs offer unparalleled scale, placing young leaders in charge of massive operational units early.' },
      { id: 'D1.5.4', title: 'GM interview structure vs. consulting interview structure', description: 'While consulting interviews obsess over structured cases, GM interviews focus heavily on situational leadership and operational pragmatism. Expect deep dives into implementation challenges and stakeholder conflict.' },
    ],
  },
];

// ─── D2 | CASE INTERVIEW METHODOLOGY ───────────────────────────────────────

const D2_MODULES: Module[] = [
  {
    id: 'D2.1',
    title: 'The Case Interview: What and Why',
    lessons: [
      { id: 'D2.1.1', title: 'Purpose: simulating real client engagements', description: 'Case interviews mimic the ambiguity, pressure, and analytical rigor of a real consulting project. They test how a candidate structures unknown problems and communicates under executive scrutiny.' },
      { id: 'D2.1.2', title: 'What interviewers are actually measuring', description: 'Beyond just getting the right answer, interviewers assess logic, coachability, and commercial acumen. They evaluate if they would trust the candidate to represent the firm independently.' },
      { id: 'D2.1.3', title: 'Candidate-led vs. interviewer-led formats (BCG vs. McKinsey)', description: 'Candidate-led cases require you to drive the entire problem-solving process from framing to data requests. Interviewer-led cases are more modular, steering you through discrete quantitative and qualitative hurdles.' },
      { id: 'D2.1.4', title: 'Round 1 vs. Round 2 expectations (Junior vs. Partner)', description: 'First-round interviews index heavily on raw math accuracy, strict MECE structures, and flawless fundamentals. Partner rounds focus more on business judgment, creativity, and executive presence.' },
    ],
  },
  {
    id: 'D2.2',
    title: 'The Six Competency Dimensions (Evaluation Rubric)',
    lessons: [
      { id: 'D2.2.1', title: 'Problem Structuring and Logical Thinking (MECE)', description: 'Evaluates your ability to break complex problems into mutually exclusive and collectively exhaustive components. A strong structure ensures no root causes are missed.' },
      { id: 'D2.2.2', title: 'Quantitative and Analytical Skills', description: 'Interviewers look for fast, accurate mental math and the ability to translate business concepts into financial equations. You must also perform sanity checks and extract immediate business insights.' },
      { id: 'D2.2.3', title: 'Business Acumen and Commercial Judgment', description: 'Measures your understanding of how companies actually operate and make money. Tests your ability to identify realistic drivers and propose pragmatic, implementable solutions.' },
      { id: 'D2.2.4', title: 'Communication and Executive Presence', description: 'Top candidates speak with top-down clarity, using the Pyramid Principle. This dimension also tracks posture, eye contact, and the ability to project calm confidence under pressure.' },
      { id: 'D2.2.5', title: 'Creativity and Adaptability', description: 'Tests your capacity to brainstorm novel solutions and pivot seamlessly when hypotheses are proven wrong. Interviewers introduce constraints to see if you can think flexibly.' },
      { id: 'D2.2.6', title: 'Conclusion Synthesis and Risk Awareness', description: 'A strong synthesis is a concise, action-oriented summary that directly answers the core question. It must proactively identify potential risks of the recommendation.' },
    ],
  },
  {
    id: 'D2.3',
    title: 'The Standard Case Interview Flow',
    lessons: [
      { id: 'D2.3.1', title: 'Stage 1: Receiving and repeating the problem statement', description: 'Actively listen and concisely play back the prompt to ensure absolute alignment on the objective. This critical first step prevents solving the wrong problem.' },
      { id: 'D2.3.2', title: 'Stage 2: Clarifying questions (what to ask, what not to ask)', description: 'Ask targeted questions to define the business model, scope, and exact timeline for the objective. Avoid asking broad questions that you should hypothesize yourself.' },
      { id: 'D2.3.3', title: 'Stage 3: Taking time to structure (the 60-second rule)', description: 'Request 60-90 seconds of silence to organize your thoughts and build a tailored issue tree. Use this time to lay out a visual blueprint for the case.' },
      { id: 'D2.3.4', title: 'Stage 4: Presenting the framework', description: 'Turn your paper to the interviewer and walk them through your structure using signposting. Explain not just what you are analyzing, but why it is critical.' },
      { id: 'D2.3.5', title: 'Stage 5: Guiding the analysis with questions', description: 'Proactively drive the case by formulating hypotheses and asking for specific data points to prove them. Methodically move to the next branch if a path leads nowhere.' },
      { id: 'D2.3.6', title: 'Stage 6: Crunching numbers and exhibits', description: 'State your initial observations before diving into computations when presented with data. Keep your scratchpad organized and tie the final number back to the business problem.' },
      { id: 'D2.3.7', title: 'Stage 7: Synthesizing insights', description: 'Summarize your findings at the end of each major branch to ensure alignment. This continuous synthesis prevents getting lost in the weeds.' },
      { id: 'D2.3.8', title: 'Stage 8: Delivering the final recommendation', description: 'Conclude with a definitive recommendation using the format: Recommendation, three supporting reasons, and next steps/risks. Deliver this with absolute conviction.' },
    ],
  },
  {
    id: 'D2.4',
    title: 'Approaching the Problem Statement',
    lessons: [
      { id: 'D2.4.1', title: 'Reading techniques: color-coding objectives, constraints, data', description: 'Systematically highlight the prompt to distinguish the ultimate goal from constraints. This visual triage anchors all subsequent analysis to the metrics that matter.' },
      { id: 'D2.4.2', title: 'Identifying the core ask: what is really being asked?', description: 'Look beyond the surface question to identify the underlying strategic imperative. Reframe the prompt in your own words to confirm you grasp the true economic driver.' },
      { id: 'D2.4.3', title: 'Forming an initial hypothesis before diving in', description: 'Generate a strong, educated guess about the root cause based on context and intuition. This hypothesis acts as an internal compass to prioritize analysis.' },
      { id: 'D2.4.4', title: 'Common traps: solving the wrong problem', description: 'Failing to define the timeline or exact product scope leads down irrelevant rabbit holes. Always validate your understanding of the core problem first.' },
    ],
  },
  {
    id: 'D2.5',
    title: 'Structuring a Presentation (for Competitions)',
    lessons: [
      { id: 'D2.5.1', title: 'Slide economy: one insight per slide', description: 'Maximize impact by ensuring every slide communicates a single, powerful message in the action title. Cluttering slides dilutes the narrative.' },
      { id: 'D2.5.2', title: 'Top-down storytelling: Pyramid Principle application', description: 'Structure your deck so the overarching recommendation is stated upfront, supported by pillars of argument. Ensure judges grasp the logical arc immediately.' },
      { id: 'D2.5.3', title: 'Visual frameworks: 2x2s, trees, value chains, timelines', description: 'Replace dense bullet points with classic consulting visual architectures. A well-crafted matrix or value chain demonstrates sophisticated synthesis.' },
      { id: 'D2.5.4', title: 'Aesthetic standards: fonts, color themes, whitespace', description: 'Maintain visual discipline using a cohesive color palette and ample whitespace. Professional aesthetics signal high attention to detail.' },
      { id: 'D2.5.5', title: 'Appendix strategy: depth buffer for Q&A', description: 'Use the appendix to house detailed financial models and granular research. Keep the core presentation sleek while proving rigorous depth during defense.' },
    ],
  },
  {
    id: 'D2.6',
    title: 'The Q&A and Defense Round',
    lessons: [
      { id: 'D2.6.1', title: 'Active listening during questions', description: 'Listen intently to identify the specific nuance the judge is attacking. Paraphrasing the question back buys time and ensures you address their actual concern.' },
      { id: 'D2.6.2', title: 'Maintaining composure under challenge', description: 'Treat pushback as a collaborative pressure-test of your logic. Maintain an objective tone and concede points gracefully rather than stubbornly defending flaws.' },
      { id: 'D2.6.3', title: 'Handing off questions to teammates cleanly', description: 'Establish clear areas of ownership beforehand so questions are seamlessly routed to experts. Smooth handoffs project a cohesive team dynamic.' },
      { id: 'D2.6.4', title: 'Linking answers back to the core recommendation', description: 'Use Q&A to reinforce your primary strategic narrative. This demonstrates narrative discipline and ensures your final message resonates strongly.' },
    ],
  },
  {
    id: 'D2.7',
    title: 'Common Failure Patterns (Anti-Patterns)',
    lessons: [
      { id: 'D2.7.1', title: 'Rote framework application without customization', description: 'Blindly forcing a standard framework onto a nuanced problem signals a lack of critical thinking. Elite candidates adapt frameworks to match specific constraints.' },
      { id: 'D2.7.2', title: 'Jumping to conclusions without structuring', description: 'Offering premature solutions before thoroughly mapping the problem space leads to un-MECE analysis. Interviewers value the disciplined journey of ruling out possibilities.' },
      { id: 'D2.7.3', title: 'Defending a hypothesis when contradicted', description: 'Clinging to an initial thesis despite conflicting data shows a lack of objectivity. Demonstrate the flexibility to rapidly update beliefs when facts change.' },
      { id: 'D2.7.4', title: 'Internalizing the thought process (not speaking out loud)', description: 'Solving math in total silence deprives the interviewer of evaluating your logic. Continuous verbalization is mandatory for a collaborative experience.' },
      { id: 'D2.7.5', title: 'MBA Gap: academic exploration vs. decisive prioritization', description: 'Over-intellectualizing minor academic details wastes precious time. Consulting requires strict 80/20 prioritization, focusing only on levers that move the needle.' },
      { id: 'D2.7.6', title: 'Mathematically correct but commercially unrealistic solutions', description: 'Proposing a solution that works on paper but ignores industry dynamics fails the commercial acumen test. Every answer must pass a stringent real-world sanity check.' },
    ],
  },
  {
    id: 'D2.8',
    title: 'Non-Verbal Communication',
    lessons: [
      { id: 'D2.8.1', title: 'Posture, eye contact, and composure', description: 'Your physical presence dictates the interviewer\'s confidence in you. Lean in, maintain steady eye contact, and project relaxed authority under stress.' },
      { id: 'D2.8.2', title: 'Avoiding fidgeting and distraction signals', description: 'Nervous habits like pen-clicking or foot-tapping undermine your executive gravitas. Practice stillness to ensure focus remains entirely on your insights.' },
      { id: 'D2.8.3', title: 'Practice methods: mirror, recording, peer feedback', description: 'Record mock cases to identify unconscious verbal ticks or defensive body language. Brutally honest peer feedback bridges the gap between perception and reality.' },
      { id: 'D2.8.4', title: 'Signposting: verbally forecasting the structure', description: 'Use strong verbal transitions to make your logic undeniably clear. This anchors the interviewer in your framework and prevents them from getting lost.' },
    ],
  },
];

// ─── D3 | FRAMEWORKS & MENTAL MODELS ───────────────────────────────────────

const D3_MODULES: Module[] = [
  {
    id: 'D3.1',
    title: 'Core Profitability Frameworks',
    lessons: [
      { id: 'D3.1.1', title: 'Revenue tree: Volume × Price disaggregation', description: 'Revenue is fundamentally decomposed into units sold and price per unit. This tree is further segmented by product line or demographic to isolate declines.' },
      { id: 'D3.1.2', title: 'Cost tree: Fixed vs. Variable, Value Chain approach', description: 'Costs are split into Fixed and Variable to analyze operating leverage. Mapping these sequentially across the value chain pinpoints operational inefficiencies.' },
      { id: 'D3.1.3', title: 'Contribution margin and breakeven analysis', description: 'Contribution margin determines how much each unit contributes to fixed costs. Breakeven analysis calculates the volume needed to reach profitability.' },
      { id: 'D3.1.4', title: 'EBITDA, gross margin, net profit waterfall', description: 'Understanding the P&L cascade from Gross Margin to EBITDA is crucial. A waterfall chart visually isolates which specific cost layer is eroding the bottom line.' },
    ],
  },
  {
    id: 'D3.2',
    title: 'Market Analysis Frameworks',
    lessons: [
      { id: 'D3.2.1', title: '3Cs: Company, Customer, Competition', description: 'A foundational diagnostic tool assessing internal capabilities, unmet customer needs, and competitive positioning. The ultimate starting point for unstructured strategy prompts.' },
      { id: 'D3.2.2', title: '4Ps: Product, Price, Place, Promotion', description: 'Evaluates a company\'s go-to-market strategy by analyzing features, pricing, channels, and tactics. Highly effective for market entry and product launches.' },
      { id: 'D3.2.3', title: '7Ps: Extended marketing mix (People, Process, Physical Evidence)', description: 'Extends the traditional framework for service-based industries. Scrutinizes staff training, service delivery, and the tangible environment.' },
      { id: 'D3.2.4', title: "Porter's Five Forces: structural attractiveness analysis", description: 'Assesses industry profitability by evaluating supplier/buyer power, rivalry, substitutes, and entry barriers. Essential for determining market attractiveness.' },
      { id: 'D3.2.5', title: 'TAM-SAM-SOM: addressable market sizing', description: 'Models market potential: Total Addressable, Serviceable Available, and Serviceable Obtainable markets. The backbone of revenue projections in growth cases.' },
      { id: 'D3.2.6', title: 'PESTEL: macro-environment scanning', description: 'Systematically evaluates macro-risks: Political, Economic, Social, Technological, Environmental, Legal. Deployed to understand external shocks or regulatory hurdles.' },
    ],
  },
  {
    id: 'D3.3',
    title: 'Strategic Positioning Frameworks',
    lessons: [
      { id: 'D3.3.1', title: 'BCG Matrix: Stars, Question Marks, Cash Cows, Dogs', description: 'Classifies a portfolio based on market growth and relative share. Dictates capital allocation: milk Cash Cows, invest in Stars, divest Dogs.' },
      { id: 'D3.3.2', title: 'Ansoff Matrix: Market Penetration, Development, Diversification', description: 'A MECE grid for growth strategies aligning risk appetite with ambitions. Evaluates selling existing or new products to existing or new markets.' },
      { id: 'D3.3.3', title: 'McKinsey 7S: internal alignment model', description: 'Evaluates organizational health by aligning hard elements with soft elements. Crucial for M&A integration and internal turnaround cases.' },
      { id: 'D3.3.4', title: 'VRIO Framework: competitive advantage assessment', description: 'Determines if a resource is Valuable, Rare, Inimitable, and Organized. Assesses whether a company possesses sustainable competitive advantage.' },
      { id: 'D3.3.5', title: 'Blue Ocean vs. Red Ocean strategy', description: 'Red Oceans represent highly contested legacy markets. Blue Ocean strategy creates uncontested market space by pursuing differentiation and low cost.' },
    ],
  },
  {
    id: 'D3.4',
    title: 'Structural Thinking Tools',
    lessons: [
      { id: 'D3.4.1', title: 'MECE: Mutually Exclusive, Collectively Exhaustive', description: 'The holy grail of consulting logic ensuring categories do not overlap and cover all options. Prevents double-counting and missing root causes.' },
      { id: 'D3.4.2', title: 'Issue Trees: building MECE problem breakdowns', description: 'Decomposes massive core questions into granular, testable sub-questions. Transforms ambiguity into a systematic checklist of analytical tasks.' },
      { id: 'D3.4.3', title: 'Pyramid Principle: answer first, then support', description: 'A communication philosophy demanding the ultimate conclusion first, followed by supporting pillars. Respects executive time and ensures the core message lands.' },
      { id: 'D3.4.4', title: 'SCQA: Situation, Complication, Question, Answer', description: 'A narrative tool that establishes the current state and trigger event to frame the core problem. Tees up your strategic recommendation perfectly.' },
      { id: 'D3.4.5', title: 'Hypothesis Testing: iterative proof-and-falsify cycle', description: 'Formulating an educated guess and seeking data to prove or disprove it. Accelerates problem-solving by focusing on the most probable drivers.' },
    ],
  },
  {
    id: 'D3.5',
    title: 'Operational Frameworks',
    lessons: [
      { id: 'D3.5.1', title: "Value Chain Analysis: Porter's primary and support activities", description: 'Maps a firm\'s activities from inbound logistics to after-sales service. Isolates where value is created and where operational inefficiencies reside.' },
      { id: 'D3.5.2', title: 'Cost-Based Value Chain: step-by-step cost mapping', description: 'Assigns specific dollar amounts to each value chain step to identify disproportionate cost centers. The primary engine for internal cost spike cases.' },
      { id: 'D3.5.3', title: 'Theory of Constraints: bottleneck identification', description: 'Posits that a system\'s throughput is strictly limited by its slowest process. Requires finding this constraint and subordinating all other processes to it.' },
      { id: 'D3.5.4', title: 'Process Flow / Customer Journey Mapping', description: 'Visualizes sequential touchpoints a customer has with a brand. Highly effective for identifying UX friction, drop-off points, and service failures.' },
      { id: 'D3.5.5', title: '5 Senses Framework: customer experience audit', description: 'Audits the physical customer experience across sight, sound, smell, touch, and taste. Uncovers non-obvious environmental factors driving away footfall.' },
    ],
  },
  {
    id: 'D3.6',
    title: 'People & Behavioral Frameworks',
    lessons: [
      { id: 'D3.6.1', title: 'AMO Framework: Ability, Motivation, Opportunity', description: 'Diagnoses employee performance by evaluating skills, incentives, and resources. Essential for HR, change management, and post-merger integration.' },
      { id: 'D3.6.2', title: 'Stakeholder Heat Map: Power vs. Interest matrix', description: 'Prioritizes stakeholders based on influence and interest in a project\'s outcome. Guides communication strategy to prevent project sabotage.' },
      { id: 'D3.6.3', title: 'Competitive Profile Matrix: weighted scoring model', description: 'Quantifies positioning by assigning weights to key success factors and scoring competitors. Converts qualitative industry dynamics into hard data.' },
    ],
  },
  {
    id: 'D3.7',
    title: 'Storytelling Frameworks',
    lessons: [
      { id: 'D3.7.1', title: 'Backward Induction: reverse from failure to solution', description: 'Involves imagining a catastrophic future failure and working backward to identify causes. A powerful tool for developing robust mitigation plans.' },
      { id: 'D3.7.2', title: 'Pyramid Principle: top-down executive communication', description: 'Ensures presentations are persuasive by grouping logical arguments under a single unifying thesis. Forces synthesis rather than just summarization.' },
      { id: 'D3.7.3', title: 'SCQA for narrative structuring', description: 'Creates emotional resonance by structuring a presentation like a story with a dramatic complication. Captures stakeholder attention and builds momentum.' },
    ],
  },
  {
    id: 'D3.8',
    title: 'Custom Framework Design',
    lessons: [
      { id: 'D3.8.1', title: 'When to customize vs. use standard frameworks', description: 'Standard frameworks provide a safety net, but highly complex cases require bespoke structures. Customizing shows deep understanding of specific business models.' },
      { id: 'D3.8.2', title: 'How to deconstruct a problem into custom pillars', description: 'Build custom pillars by combining elements of standard frameworks based on core economic drivers. Ensure these bespoke pillars remain strictly MECE.' },
      { id: 'D3.8.3', title: 'Naming frameworks for memorability', description: 'Assigning a catchy thematic acronym demonstrates creativity and makes presentations memorable. Projects thought leadership akin to branded methodologies.' },
      {
        id: 'D3.8.4',
        title: 'Custom framework examples',
        children: [
          { id: 'D3.8.4a', title: 'Example: "PROB Framework" for cultural transformation', description: 'A custom mnemonic breaking down People, Resources, Organization, and Behaviors. Structures deeply subjective organizational design problems.' },
          { id: 'D3.8.4b', title: 'Example: "Service Portfolio Evaluation Matrix" for logistics', description: 'A bespoke 2x2 matrix evaluating services based on margin attractiveness versus operational complexity. A customized BCG matrix for B2B services.' },
          { id: 'D3.8.4c', title: 'Example: "3R Model" for crisis management', description: 'A timeline-based framework focusing on Respond, Recover, and Reinvent. Elegantly structures chaotic PR or operational disaster scenarios.' },
          { id: 'D3.8.4d', title: 'Example: "Badlav Ki Goonj" for political consulting', description: 'A highly localized framework designed for Indian political strategy campaigns. Emphasizes grassroots sentiment and cultural fluency in niche engagements.' },
        ],
      },
    ],
  },
  {
    id: 'D3.9',
    title: 'Framework Application Cheat Sheet',
    lessons: [
      { id: 'D3.9.1', title: 'Framework-to-case-type mapping table', description: 'A quick-reference matrix matching common case prompts to optimal starting frameworks. Prevents freezing during the critical first 60 seconds of structuring.' },
      { id: 'D3.9.2', title: '"When Nothing Works" fallback: value chain + process flow', description: 'Tracing the physical product or customer journey step-by-step never fails for unfamiliar prompts. Naturally exposes bottlenecks without specialized knowledge.' },
    ],
  },
];

// ─── D4 | CASE TYPE: PROFITABILITY ─────────────────────────────────────────

const D4_MODULES: Module[] = [
  {
    id: 'D4.1',
    title: "MASTER FRAMEWORK ARCHITECTURE",
    lessons: [
      { id: 'D4.1.1', title: "The Governing Equation", description: `**Profit = Revenue − Cost**

But this is a starting point, not a framework. The framework is the complete decomposition of every lever on both sides, mapped to its root-cause diagnostic, India-specific distortion, and industry variant. What follows is that complete map.

---` },
      { id: 'D4.1.2', title: "LAYER 1: THE REVENUE TREE (Full Decomposition)", description: `### Revenue = Price × Volume × Product Mix

Each of these three multipliers has its own sub-architecture.

---

### 1A. PRICE

Price is not a single number. It has a supply floor, a demand ceiling, and a competitive band between them.

**Price Floor (Cost-Plus Baseline)**
Minimum viable price = Total Unit Cost + Target Margin
- Total Unit Cost = Direct Material Cost + Direct Labour + Variable Overhead + Fixed Overhead Allocation
- The floor is not static — it shifts with input cost inflation, capacity utilization changes, and currency movements (critical for import-heavy industries)

**Price Ceiling (Value-Based)**
Maximum extractable price = Customer's Willingness to Pay (WTP)
- WTP is calculated as: Economic Value of Next-Best Alternative + Perceived Incremental Value Premium − Switching Cost
- Tools to measure WTP: Conjoint Analysis, Van Westendorp Price Sensitivity Meter, Gabor-Granger ladder
- In India, WTP is segmented acutely: metro premium segment, Tier 1 aspiring class, Tier 2/3 affordability-constrained segment

**Competitive Price Band**
The actual price lives between floor and ceiling, positioned by:
- Direct competitor pricing (benchmarked per comparable SKU)
- Substitute pricing (e.g., for packaged atta, the substitute is loose-weight atta from the kirana)
- Price-to-quality signaling (premium positioning requires price above the category average)

**Price Realisation Gap (India-Specific)**
Stated price ≠ Realised price. In India, the gap is created by:
- Trade discounts to distributors (typically 8–15% for FMCG)
- Retailer margins demanded by kirana networks (typically 12–20%)
- Promotional spending (buy-one-get-one, cashback on UPI)
- GST slab differences between product categories affecting net realisation
- Regional pricing differences (MRP is uniform; but effective net price after channel cost varies by geography)

---

### 1B. VOLUME

**Volume = Number of Customers × Average Order Size × Purchase Frequency**

#### Number of Customers

**Market Size Calculation:**
Total Addressable Market (TAM) = Total Target Population × Penetration Rate × Per-Capita Consumption

**Customer Funnel (Revenue-Side Diagnostic):**
This is the most powerful diagnostic tool when volume is declining. Map every potential customer through five sequential gates:

**Gate 1 — NEED**
Does the customer have a problem this product solves?
- Sub-drivers: Demographic shift, lifestyle change, substitute emergence, problem awareness
- India Distortion: "Latent need" is massive in India (e.g., health insurance need exists but is not felt as urgent until a medical event; toothpaste need in rural India was historically low until oral hygiene campaigns)

**Gate 2 — AWARENESS**
Does the customer know this product exists?
- Sub-drivers: Advertising spend, channel reach, word-of-mouth density, digital vs offline mix
- India Distortion: Rural India awareness is dominated by cable TV, haat/mela activation, and word-of-mouth from SHGs (Self-Help Groups), not digital ads. A product with 90% urban awareness can have 20% rural awareness.

**Gate 3 — ACCESSIBILITY**
Can the customer physically access this product?
- Sub-drivers: Distribution depth (# retail touchpoints), last-mile logistics, e-commerce pin-code coverage, pharmacy/clinic proximity for healthcare
- India Distortion: India has 12–14 million kirana stores. A product "available in India" may actually be available in only 1.2 million outlets — less than 10% distribution depth. This is the single most common volume gap in Indian FMCG.

**Gate 4 — AFFORDABILITY**
Is the price within the customer's budget?
- Sub-drivers: Unit price, pack size options, credit availability, EMI/BNPL options
- India Distortion: India is a sachet economy. The ₹1 shampoo sachet, the ₹5 chai, the ₹10 biscuit pack are not marketing gimmicks — they are structural responses to weekly wage cycles among low-income consumers. Products that only come in ₹200 packs are categorically inaccessible to this segment regardless of awareness.

**Gate 5 — EXPERIENCE & AFTER-SALES**
Once purchased, does the product deliver enough value to drive repeat purchase?
- Sub-drivers: Product quality, service responsiveness, complaint resolution, loyalty program, word-of-mouth generation
- India Distortion: NPS (Net Promoter Score) dynamics in India are extreme — hyper-vocal negative WOM travels fast in dense community networks (WhatsApp groups, colony networks, panchayat conversations)

#### Average Order Size
- Driven by: Basket composition, upsell/cross-sell effectiveness, pack size architecture
- India lever: "Premiumisation within affordability" — Indian consumers upgrading from ₹5 to ₹10 packs, or from loose to branded, drives average order size without increasing purchase frequency

#### Purchase Frequency
- Driven by: Category consumption rate, subscription models, loyalty programs, occasion marketing
- India lever: Festival cycles (Diwali, Eid, Onam, harvest seasons) create massive frequency spikes; brands that miss these windows suffer disproportionately

---

### 1C. PRODUCT MIX

This is the most commonly underanalysed revenue lever. Two companies with identical total revenue can have completely different profitability if their product mix differs.

**Mix Analysis Framework:**
Step 1: Map all SKUs on a Revenue vs. Margin matrix
Step 2: Apply 80/20 Pareto — identify which 20% of SKUs drive 80% of revenue
Step 3: Identify "margin bleeders" — high-volume, low-margin SKUs (often legacy products maintained for brand equity or distribution reasons)
Step 4: Identify "margin champions" — lower volume but high-margin SKUs (often premium variants, new launches)
Step 5: Calculate a Weighted Average Margin (WAM) across the mix
Step 6: Diagnose if WAM decline is due to (a) margin compression within SKUs, or (b) volume shifting toward lower-margin SKUs

**India Mix Distortion:**
India's distribution system creates a perverse mix effect. Kirana stores prefer high-turnover, low-margin SKUs (they stock what moves fastest). Premium SKUs often sit unsold. This means the actual sold mix at the retailer level is more low-margin than the company's intended mix — a systemic India-specific problem called "phantom premiumisation."

---` },
      { id: 'D4.1.3', title: "LAYER 2: THE COST TREE (Full Value Chain Decomposition)", description: `### Cost Architecture: Two Valid Entry Points

**Entry Point A — Fixed vs. Variable**
Use this when the case involves scale decisions, breakeven analysis, or operational leverage
- Fixed Costs: Factory rent, machinery depreciation, corporate overheads, management salaries, brand spend, insurance, loan interest (do not move with volume)
- Variable Costs: Raw materials, packaging, fuel, commission, logistics per unit (move directly with volume)
- Semi-Variable Costs (often missed): Utility costs, contract labour (move with volume in steps, not linearly)
- Contribution Margin = Revenue − Variable Costs
- Breakeven Volume = Fixed Costs ÷ Contribution Margin per Unit

**Entry Point B — Value Chain (Superior for Root-Cause Diagnosis)**
Use this when you need to find exactly where cost is spiking. Map every node:

### NODE 1: R&D / INNOVATION
Sub-drivers:
- Research scientist salaries and lab infrastructure
- Equipment and technology licensing
- Patent filing, maintenance, and IP protection costs
- Clinical trial costs (pharma), product testing costs (FMCG), regulatory approval fees
- India Note: India has among the lowest R&D spend as % of revenue in global FMCG benchmarks; most Indian companies license technology rather than develop it, making licensing fees a hidden R&D cost

### NODE 2: RAW MATERIAL PROCUREMENT
Sub-drivers:
- Commodity price (domestic market rate or imported CIF price)
- Supplier contract terms (spot vs. long-term; hedged vs. unhedged)
- Number of active suppliers (concentration risk)
- Wastage ratio and use efficiency
- Quality rejection rate
- India Note: India's agri-commodity prices are subject to government MSP interventions, export bans, and monsoon-driven volatility. A sugar company's procurement cost can swing 30–40% year-on-year based on state government policy.

### NODE 3: INBOUND LOGISTICS
Sub-drivers:
- Transport mode (rail vs. road; rail is ~40% cheaper per tonne-km in India but requires proximity to rail lines)
- Fuel costs (ATF for air, diesel for road — both subject to Indian government pricing policy and global crude)
- Number of intermediaries in the inbound chain
- Lead time and its impact on working capital (longer lead time = more inventory = more cash locked up)
- India Note: India's logistics cost as % of GDP (~13–14%) is nearly double the global benchmark (~8%). This is structural — fragmented trucking industry, poor road quality in Tier 3+ geographies, toll taxes, and state-border delays (pre-GST were worse, but issues remain)

### NODE 4: PRODUCTION / MANUFACTURING
Sub-drivers:
- Machinery: Capital cost amortisation, maintenance expense (MTBF — Mean Time Between Failures), upgrade investment
- Factory rent: Owned vs. leased; lease escalation clauses
- Electricity: Cost per unit, power availability (India-specific: scheduled power cuts in several states still impact production capacity)
- Labour: Wages (statutory minimum + actual), overtime, contractor vs. permanent labour ratio
- Capacity Utilisation (OEE — Overall Equipment Effectiveness): The most important production cost ratio. OEE = Availability × Performance × Quality. At 60% OEE, fixed costs per unit are 40% higher than at 100% OEE.
- Material Wastage: Defect rate, rework cost, scrap value
- India Note: India's industrial electricity tariff varies enormously by state (₹4/unit in Gujarat; ₹8+/unit in Maharashtra industrial zones). A manufacturing company's location is therefore a structural cost decision, not just a logistics one.

### NODE 5: STORAGE & WAREHOUSING
Sub-drivers:
- Warehouse rent (own vs. 3PL vs. dark store model)
- Electricity for storage (cold chain is 3–5× more expensive than ambient)
- Inventory holding cost (includes capital cost of locked-up goods, insurance, obsolescence risk)
- Inventory days outstanding (IDO): Lower is better; high IDO = cash trap
- Shrinkage rate (theft, damage, expiry)
- India Note: India's cold chain capacity is critically underdeveloped. Only ~10% of perishables in India are transported through temperature-controlled supply chains, vs. 90%+ in developed markets. This creates enormous food wastage (~30% of fruit/vegetables) AND forces companies to absorb spoilage costs.

### NODE 6: OUTBOUND LOGISTICS / DISTRIBUTION
Sub-drivers:
- Transport mode to distributor/retailer (primary distribution — typically owned fleet or large 3PL)
- Last-mile delivery cost (secondary distribution — typically local transporters, highly fragmented)
- Distributor count, territory coverage, order frequency
- Vehicle routing efficiency (route optimisation is a significant cost lever — 10–15% cost reduction achievable)
- India Note: India's primary distribution typically works through a C&F (Carrying and Forwarding) agent model: Company → C&F Agent → Distributor → Sub-Distributor → Retailer → Consumer. Each layer demands margin. The total trade margin stack in India is typically 20–35% of consumer price for FMCG. This is structurally higher than most developed markets.

### NODE 7: MARKETING & SALES
Sub-drivers:
- Above-the-line (ATL): TV, print, digital advertising; celebrity endorsements; media buying efficiency
- Below-the-line (BTL): In-store promotions, kirana activation, trade marketing, point-of-sale material
- Digital marketing: Cost per click, cost per acquisition, ROAS (Return on Ad Spend)
- Sales force: Salesperson headcount, salary + variable pay + travel + distributor management cost
- Trade promotions: Discounts, schemes, and incentives offered to distributors and retailers (often 5–8% of revenue in India, often understated in P&Ls)
- India Note: In India, BTL typically delivers 3–4× better ROI than ATL for rural market penetration. A company spending 80% of its marketing budget on ATL TV ads while trying to penetrate Tier 3 is structurally misallocating spend.

### NODE 8: AFTER-SALES SERVICE
Sub-drivers:
- Warranty claim rate and average claim cost
- Service centre network (own vs. franchised vs. outsourced)
- Spare parts inventory and supply chain
- Customer complaint handling (call centre, field service, digital)
- Returns processing (reverse logistics) cost
- Net Promoter Score impact on future revenue (after-sales quality directly affects repeat purchase rate)

---` },
      { id: 'D4.1.4', title: "LAYER 3: MACRO LEVERS (External Forces Impacting Profitability)", description: `### PESTEL for India (India-Native Version)

**P — Political**
- Government pricing controls: NPPA (National Pharma Pricing Authority) caps drug prices; SEBI caps financial product commissions; state governments intervene in electricity, fuel, and food prices
- FDI policy: Sector-specific caps (multi-brand retail still restricted in India) affecting competitive entry
- State-level industrial policies: Capex subsidies, electricity rebates, land allocation (vary dramatically by state)
- PLI (Production Linked Incentive) schemes: Transform manufacturing economics for electronics, pharma, textiles

**E — Economic**
- GDP growth rate and its composition (rural consumption growth vs. urban investment-driven)
- Interest rate cycle (RBI repo rate): Directly impacts cost of capital for capex-heavy industries and NBFC funding costs
- Inflation: CPI (consumer price inflation affecting demand) vs. WPI (wholesale price inflation affecting input costs) — the gap between these two is a critical profitability signal
- Exchange rate: INR/USD depreciation increases import costs (electronics, edible oil, crude derivatives)
- Rural income: Monsoon performance, MSP announcements, MGNREGA spending — all drive rural consumption volumes

**S — Social**
- Urbanisation rate: Driving premiumisation and shift from loose to branded products
- Health consciousness: Driving growth of health/wellness categories at the expense of traditional FMCG
- Demographic dividend: India's median age of ~28 creates a consumption-heavy working-age majority
- Female workforce participation: Rising in urban areas; creating demand for convenience products, packaged foods, financial services

**T — Technological**
- UPI and digital payments: Eliminated loose-change transactions (direct blow to ₹1–2 impulse SKUs); enabled data capture on consumer behaviour
- E-commerce penetration: Disrupting traditional distribution economics; enabling D2C models that bypass the distributor-kirana stack
- AI/ML in manufacturing: Predictive maintenance reducing equipment downtime; computer vision in quality control
- India Stack (Aadhaar, ONDC, GeM): Enabling new B2G and D2C models

**E — Environmental**
- ESG pressure on supply chains: Large FMCG companies facing scrutiny on plastics (single-use plastic ban), palm oil sourcing, water usage
- Climate impact on agri-commodities: Irregular monsoons creating year-on-year input cost volatility
- Carbon pricing (emerging): Will impact energy-intensive manufacturing costs

**L — Legal**
- GST: Standardised but complex; HSN code disputes, ITC (Input Tax Credit) reconciliation create cash flow stress
- Labour laws: Contract Labour Act, Industrial Disputes Act — create rigidity in workforce management
- Competition Commission of India (CCI): Increasingly active; price-fixing scrutiny in pharma, telecom, cement
- Consumer Protection Act 2019: Strengthens product liability; increases after-sales service obligations
- DPDP Act (Digital Personal Data Protection): Creates compliance costs for data-driven business models

### Porter's Five Forces — India Calibration

**Supplier Power**
High in: Speciality chemicals (dominated by Chinese suppliers), semiconductor components, rare earth metals, aviation fuel (single supplier — IOC/BPCL/HPCL cartel)
Low in: Agri-commodities (fragmented farmers), generic labour, standard packaging

**Buyer Power**
High in: B2B segments (large organised retailers — Reliance, DMart negotiating with FMCG companies); Government procurement (GeM platform drives price transparency)
Low in: B2C consumer markets (fragmented demand; no single consumer has bargaining power)

**Threat of New Entrants**
High in: SaaS, D2C consumer brands, fintech (low capital, regulatory barriers easing)
Low in: Telecom (spectrum scarcity), aviation (aircraft scarcity + DGCA regulation), banking (RBI licensing)

**Threat of Substitutes**
India-specific substitution patterns: Branded vs. unbranded (loose atta substitutes packaged atta), organised vs. informal (local dhaba substitutes QSR), traditional vs. modern medicine

**Competitive Rivalry**
Intense in: Telecom (Jio-Airtel-Vi), FMCG (HUL-ITC-P&G), EdTech, Fintech
Moderate in: Cement (regional oligopolies), Pharma (fragmented but consolidating)
Low in: Defence manufacturing (PSU dominance)

---` },
    ],
  },
  {
    id: 'D4.2',
    title: "COMPLETE DIAGNOSTIC QUESTION SET",
    lessons: [
      { id: 'D4.2.1', title: "Phase 0: Context Clarification (Ask Before Structuring)", description: `These questions are asked before you lay out your framework. Asking them demonstrates commercial maturity.

1. "When you say profitability has declined, could you confirm — are we talking about absolute profit (rupees), profit margin (%), EBITDA margin, or net margin? The levers differ significantly."
2. "Over what time period has this decline occurred — one quarter, one financial year, or multi-year? This determines whether we're looking at a structural problem or a seasonal/cyclical one."
3. "Is this a company-wide decline or is it concentrated in a specific geography, business unit, or product line?"
4. "Has this decline been flagged as an exception or is it consistent with industry trends? In other words — are competitors also hurting?"
5. "What is the company's position in the value chain — manufacturer, distributor, retailer, or integrated? This defines which cost nodes we own."

---` },
      { id: 'D4.2.2', title: "Phase 1: Revenue Diagnostics", description: `### On Price
6. "Has the average selling price (ASP) per unit changed over the period? Is this a price-led decline or a volume-led decline?"
7. "If price has declined — was this a deliberate pricing action (competitive response, penetration strategy) or an effective price decline due to higher trade discounts or channel mix shift?"
8. "What is the price realisation gap — the difference between MRP and the net price the company actually receives after all trade discounts, schemes, and returns?"
9. "Has the input cost structure changed in a way that has compressed margins without a corresponding price increase? What is the lag between input cost increases and price pass-through?"

### On Volume
10. "At which stage of the customer funnel is the drop-off occurring — at awareness, accessibility, affordability, or at repeat purchase/experience?"
11. "Has the total addressable market grown or shrunk? If it has grown but our volume has declined, the issue is market share loss. If the market itself has shrunk, the problem is structural."
12. "Has distribution depth changed — are we present in more or fewer outlets than 12 months ago? What is the active-outlet count and its trend?"
13. "Has there been any change in consumer demographics — urban/rural mix, income bracket distribution, age cohort?"

### On Product Mix
14. "Has the revenue mix across SKUs/product lines changed? Specifically — have premium SKUs lost volume share to economy SKUs, or vice versa?"
15. "What is the margin profile of each major product line? Where exactly in the portfolio is the margin compression concentrated?"
16. "Has any new product launch cannibalised an existing high-margin product without delivering equivalent margin?"

---` },
      { id: 'D4.2.3', title: "Phase 2: Cost Diagnostics", description: `### On Raw Material
17. "What is the primary raw material, and what is its price trend over the past 12–24 months? Is the company hedged against commodity price movements?"
18. "Has the supplier concentration changed — are we more or less dependent on a single supplier than before?"
19. "Has material wastage or rejection rate changed? Is there a quality issue in the input supply chain?"

### On Production
20. "What is the current capacity utilisation rate? If it is below 70%, fixed costs per unit are likely elevated significantly."
21. "Has there been any unplanned downtime — machine breakdowns, power outages, labour strikes? What was the revenue loss from this downtime?"
22. "Has the labour cost per unit changed? Is this due to wage inflation, a shift in permanent-to-contract labour ratio, or productivity decline?"

### On Logistics
23. "Has the logistics cost per unit or as a percentage of revenue changed? If yes, is this driven by fuel prices, a change in delivery mode, or a change in order size (smaller average orders = higher per-unit delivery cost)?"
24. "Have we changed our distribution model — for example, moved from direct distribution to a 3PL model, or vice versa? What was the cost impact?"

### On Overheads
25. "Has there been any increase in fixed overheads — new corporate office leases, management headcount expansion, IT infrastructure investment? These will show as margin compression if revenue hasn't grown proportionally."

---` },
      { id: 'D4.2.4', title: "Phase 3: Macro & Competitive Diagnostics", description: `26. "Has any significant regulatory change impacted either our cost base (e.g., GST rate change on our product, import duty hike on key inputs) or our revenue (e.g., NPPA price cap, state-level pricing restriction)?"
27. "Have competitors changed their pricing strategy in the past 12 months? Is there a price war underway, or has a new entrant disrupted the market?"
28. "Is there a macroeconomic factor — rising inflation, rural income stress, slowdown in urban consumption — that could explain a broad-based volume decline across the industry?"

---` },
    ],
  },
  {
    id: 'D4.3',
    title: "INDIA-SPECIFIC PROFITABILITY FRAMEWORK",
    lessons: [
      { id: 'D4.3.1', title: "The Six India Distortions That Break Standard Frameworks", description: `Every standard profitability framework is built on developed-market assumptions. These six structural realities of India require specific adjustments.

### DISTORTION 1: The Trade Margin Stack Problem
**What it is:** India's route-to-market has up to 5 layers between manufacturer and consumer. Each layer demands margin, and together they consume 20–40% of consumer price in FMCG.
**The Framework Adjustment:** When analysing revenue, always calculate Net Revenue Realisation (NRR) = Gross Revenue − (Distributor Margin + Sub-Distributor Margin + Retailer Margin + Trade Promotions + Returns). A product with ₹100 MRP may yield only ₹60–65 to the manufacturer.
**The Lever:** Direct-to-consumer (D2C) or modern trade (MT) can improve NRR by 10–15 percentage points by eliminating intermediary layers.

### DISTORTION 2: The GST Complexity Problem
**What it is:** India's GST has multiple slabs (0%, 5%, 12%, 18%, 28%) and a complex ITC (Input Tax Credit) system. Products can be classified differently at different processing stages, creating tax cascades that impact effective margins.
**The Framework Adjustment:** Always ask for the "GST-adjusted contribution margin" — not the headline margin. A pharma company selling a drug under NPPA price control on a 12% GST slab while buying API inputs at 18% GST has a structurally compressed ITC position.
**The Lever:** HSN code optimisation, ITC reconciliation efficiency, and state-level GST incentive structures.

### DISTORTION 3: The Working Capital Trap
**What it is:** India's credit culture means distributors expect 30–60 day payment terms. Simultaneously, suppliers may demand faster payment for commodities. This creates a structural working capital gap that consumes cash even in profitable businesses.
**The Framework Adjustment:** Profitability analysis must include Cash Conversion Cycle (CCC) = Inventory Days + Receivable Days − Payable Days. A business with 10% EBITDA margin but a 90-day CCC may have negative free cash flow.
**The Lever:** Channel financing programs (banks financing distributor payables), factoring, dynamic discounting.

### DISTORTION 4: The Rural-Urban Demand Bifurcation
**What it is:** Urban India and rural India are effectively two different markets with different price sensitivities, distribution economics, and consumer behaviour. Many profitability models implicitly assume urban dynamics and misread the rural segment.
**The Framework Adjustment:** Segment the P&L into Urban and Rural components. The margin structures are genuinely different — rural has higher logistics costs but can have lower marketing costs (BTL is cheaper than ATL). A company losing money in rural operations while being profitable in urban is a common India P&L pattern.
**The Lever:** Rural-specific pack sizes, rural-specific distribution models (van sales vs. hub-and-spoke), and targeted BTL activation.

### DISTORTION 5: The Commodity Input Volatility Problem
**What it is:** India is uniquely exposed to agricultural commodity volatility due to policy interventions — MSP changes, export bans, state-level procurement, and monsoon sensitivity. Input cost models that assume stable raw material pricing will be structurally wrong.
**The Framework Adjustment:** Build a "Commodity Sensitivity Analysis" — for a 10% increase in primary input cost, what is the EBITDA margin impact before and after price pass-through? This reveals the company's pricing power relative to input volatility.
**The Lever:** Long-term supply contracts, commodity hedging (where permitted — agri-commodity hedging on MCX), portfolio diversification across input sources.

### DISTORTION 6: The UPI-Driven Impulse Purchase Elimination
**What it is:** Pre-UPI, Indian consumers made small, impulse purchases using loose change. A ₹2 toffee, a ₹5 sachet, a ₹10 biscuit — purchased because exact change happened to be available. UPI has eliminated this dynamic. Consumers pay exactly what they intend to pay, and small-denomination impulse purchases have declined structurally.
**The Framework Adjustment:** For sub-₹20 SKUs, include an "impulse purchase index" in the demand analysis. This should track the correlation between digital payment penetration in a geography and sales volume of sub-₹20 SKUs.
**The Lever:** Bundle pricing (turn the ₹2 toffee into a ₹10 five-pack), subscription models, or accept the structural volume decline and reposition toward higher-denomination SKUs.

---` },
    ],
  },
  {
    id: 'D4.4',
    title: "WEAK VS. STRONG ANSWER COMPARISON",
    lessons: [
      { id: 'D4.4.1', title: "The India Case Scenario", description: `**Case Prompt (as an MBB interviewer would deliver it):**

"Our client is Surya Biscuits, a mid-sized Indian FMCG company . They manufacture glucose biscuits and cream biscuits across 8 SKUs, with annual revenue of approximately ₹1,800 crore. Their EBITDA margin has declined from 14% to 9% over the past two financial years. The CEO has called us in. Where would you start?"

---` },
      { id: 'D4.4.2', title: "THE WEAK ANSWER", description: `**Candidate Response:**

"Thank you. I would approach this using the profitability framework. Profitability equals revenue minus costs. On the revenue side, I would look at price, volume, and product mix. On the cost side, I would look at fixed and variable costs. I would also check if this is a company-specific problem or an industry-wide issue.

For revenue, I'd want to know if prices have changed or if volume has fallen. For costs, I'd check if raw material costs have gone up, maybe wheat flour since this is a biscuit company. I'd also look at logistics and labour costs. Additionally, I'd do a PESTEL analysis to understand the external environment.

My hypothesis is that it could be a raw material cost issue — wheat prices have been volatile. I'd recommend they look at hedging or finding cheaper suppliers. I'd also suggest a marketing campaign to increase volume."

---

**Why This Is Weak — The Annotated Critique:**

1. **Generic structure, no business judgment:** The candidate lists the framework's nodes mechanically without demonstrating any commercial intuition about a ₹1,800 crore Indian FMCG biscuit company.
2. **No clarification questions:** A 500 basis point EBITDA decline is enormous. The candidate should have asked — is this revenue-driven, cost-driven, or both? Over which quarters? Is Parle-G or Britannia also seeing margin pressure?
3. **Ignores India-specific realities:** No mention of wheat MSP volatility, kirana distribution margin pressure, the Parle dominance in glucose segment, trade scheme inflation, or the fact that glucose biscuits are a near-commodity category.
4. **Premature hypothesis:** Jumping to "wheat price" and "marketing campaign" without data is a structural error. It closes off exploration of what could be a distribution or mix problem.
5. **No quantification:** A strong candidate would frame the ₹90 crore EBITDA decline (5% of ₹1,800 crore) and ask what quantum comes from revenue vs. cost before recommending anything.
6. **Product mix blindness:** No mention of glucose vs. cream biscuit margin differential — which is likely the core issue.

---` },
      { id: 'D4.4.3', title: "THE STRONG ANSWER", description: `**Candidate Response:**

"Before I structure my approach, I'd like to ask two clarifying questions. First — when you say EBITDA margin has declined from 14% to 9%, are we talking about a consolidated decline, or is it concentrated in a specific product line or geography? Second — is this a Surya-specific phenomenon, or are peers like Priyagold or Dukes also under margin pressure?

Assuming you tell me it's company-specific and broadly spread — here's how I'd structure the investigation.

The 500 basis point decline on ₹1,800 crore revenue represents approximately ₹90 crore of lost EBITDA. I'd want to decompose that ₹90 crore into revenue-side loss versus cost-side loss before going deeper.

**On the Revenue side**, I have three hypotheses, and I'd want to test them in order of likely impact.

First — Product Mix shift. Surya sells both glucose biscuits, which are a near-commodity category competing directly with Parle-G on price, and cream biscuits, which have a structurally higher margin. If volume has shifted toward glucose and away from cream — perhaps because of a competitor cream biscuit promotion or a premiumisation failure — the weighted average margin falls even without any change in unit economics. I'd want the SKU-level revenue and margin data to test this.

Second — Net Revenue Realisation. The glucose biscuit category in India is deeply penetrated into kirana stores, and kirana margins have been under pressure — they've been demanding higher trade schemes. If Surya has been running higher trade promotions to protect shelf space, the gross-to-net gap has widened. I'd check if the net realisation per case has changed even if MRP is unchanged.

Third — Volume and Distribution. Has distribution depth changed? Are they present in the same number of outlets, or has a competitor improved their beat coverage in Surya's core territories in Gujarat and Maharashtra?

**On the Cost side**, I have two priority hypotheses.

First — Wheat flour procurement cost. Wheat is 40–45% of a glucose biscuit's COGS. Wheat procurement prices in India have been volatile due to MSP hikes and export restrictions. If Surya is not hedged and is on spot procurement, a 15–20% wheat price increase would compress EBITDA by approximately 200–250 basis points alone. I'd want the input cost trend vs. their price pass-through lag.

Second — Logistics and distribution cost increase. If Surya has expanded distribution reach into lower-tier markets over this period — which is a common growth move — the per-case logistics cost would have increased, as Tier 3 and rural distribution is structurally more expensive per unit.

Based on this structure, my priority data requests are: SKU-level P&L for FY before and after the decline; net realisation per case by product line; wheat procurement cost trend; and distribution reach metrics by outlet count and geography.

My initial hypothesis, pending data, is that this is a product mix and trade cost problem more than a pure input cost problem — because if wheat were the primary driver, it would show up in a cost per unit increase that maps cleanly to the 500bps decline, and the CEO would likely already know that. The fact that it's described as a mystery suggests a revenue-side or mix issue that the company's internal MIS isn't capturing cleanly."

---

**Why This Is Strong — The Annotated Praise:**

1. **Clarifying questions that reveal commercial maturity:** Distinguishes between consolidated vs. segmented decline; checks industry context.
2. **Quantification upfront:** Converts "500 bps decline" into "₹90 crore problem" — grounds the analysis in a real number.
3. **Hypothesis-driven, not framework-driven:** Lists specific hypotheses and explains why each matters before asking for data.
4. **India-specific knowledge applied naturally:** Mentions Parle-G competitive dynamics, kirana trade scheme pressure, wheat MSP mechanics — not as name-dropping, but as diagnostic logic.
5. **Separates gross margin from EBITDA levers:** Understands that net realisation is different from MRP.
6. **Prioritises hypotheses by likely impact:** Tests mix first because it's more diagnostic than pure input cost.
7. **Strong closing hypothesis with reasoning:** Doesn't just say "need data." Offers a directional view while remaining open to revision.

---` },
    ],
  },
  {
    id: 'D4.5',
    title: "THREE MBB CURVEBALL QUESTIONS",
    lessons: [
      { id: 'D4.5.1', title: "CURVEBALL 1: The Pricing Power Test", description: `**Interviewer:** "You've identified that wheat costs have risen approximately 18% over two years. But when we looked at Surya's pricing history, they have only taken two price increases — totalling 7% — over the same period. Why would a company not pass through input costs fully? And what would you advise?"

**What the interviewer is testing:** The candidate's understanding of pricing power, price elasticity, competitive dynamics in commodity categories, and the India-specific market realities.

**The Trap:** Many candidates say "they should have raised prices more" — which misses the point entirely. In a near-commodity category like glucose biscuits where Parle-G has not raised prices, Surya simply cannot.

**Strong Answer Direction:**
- In commodity FMCG categories, pricing power is a function of brand equity premium and competitive position. Surya is not the category leader in glucose (Parle-G is). Raising price above Parle-G is structural suicide — the consumer will simply switch.
- The real question is not "should they raise prices?" but "should they still be in the glucose biscuit category at all?" If they cannot price for inflation, the category is structurally unattractive for a non-leader.
- The strategic advice is: reduce glucose biscuit SKUs to minimum viable distribution, and redirect capital and shelf space to cream biscuits where there is genuine brand differentiation and pricing power.
- Reference the Pricing Power Index logic: Surya's PPI for glucose biscuits is close to 0 (cannot pass through costs). Their PPI for cream biscuits may be 0.6–0.8 (can pass through 60–80% of cost increases). Capital allocation should follow PPI.

---` },
      { id: 'D4.5.2', title: "CURVEBALL 2: The Distribution Economics Trap", description: `**Interviewer:** "Our analysis shows that Surya's distribution cost has increased from 8% to 11% of revenue over two years. Their sales team says this is because they've expanded into 40,000 new kirana stores in Tier 3 towns. The head of sales considers this a growth investment. The CFO calls it a cost problem. Who is right?"

**What the interviewer is testing:** The candidate's ability to distinguish between a good cost and a bad cost, and to use unit economics to adjudicate between competing narratives.

**The Trap:** Saying one of them is clearly right without asking for data.

**Strong Answer Direction:**
- The right answer requires a payback analysis: what is the revenue per outlet per year in these new Tier 3 stores, and what is the cost to serve each outlet?
- If average revenue per Tier 3 outlet per year is ₹12,000 and the cost to serve (logistics + sales rep beat + trade promotions) is ₹9,000 — the contribution is thin and may not recover fixed overhead allocation.
- Compare to Tier 1/Tier 2 economics: if Tier 1 outlets deliver ₹40,000 revenue per outlet at ₹8,000 cost to serve, the Tier 3 expansion is genuinely dilutive.
- The diagnostic question: what is the vintage analysis? Outlets opened 18 months ago — are they maturing toward Tier 1 economics, or flatlining?
- The nuanced answer: The CFO and Head of Sales are both partially right. The expansion was strategically sound (Tier 3 is the growth market in India) but was executed without a minimum viable order size filter, including marginal outlets that will never be economically viable.

---` },
      { id: 'D4.5.3', title: "CURVEBALL 3: The Structural Decline Test", description: `**Interviewer:** "Let's say our analysis confirms that the glucose biscuit category — which is 60% of Surya's revenue — is in structural decline for the reasons you described: commodity economics, competition from Parle, UPI killing impulse purchases. What do you do with a business where your biggest segment is fundamentally broken?"

**What the interviewer is testing:** Turnaround and portfolio strategy thinking; whether the candidate defaults to optimistic incremental fixes or can make hard strategic calls.

**The Trap:** Recommending more marketing, better distribution, or product innovation within the glucose segment — all incremental responses to a structural problem.

**Strong Answer Direction:**
This is a portfolio restructuring question, not a profitability optimisation question. Three paths:
1. **Managed Decline + Capital Reallocation:** Consciously reduce investment in glucose biscuits (cut SKUs, minimise promotional spend, maintain distribution only in profitable outlets) and free up capital for cream biscuits, cookies, and adjacent categories where Surya can compete on brand rather than price.
2. **Category Exit + B2B Pivot:** Sell the glucose biscuit manufacturing assets or repurpose them for contract manufacturing for other brands. Surya keeps the manufacturing margin without the brand investment cost.
3. **Premiumisation Architecture:** Launch a "fortified glucose biscuit" positioned as a health product (iron-fortified, Vitamin D, positioned for children's nutrition) — attempts to escape the commodity trap by adding a functional claim that enables price premium and targets institutional buyers (mid-day meal schemes, anganwadis). This requires regulatory approval (FSSAI) and government relationship management.
- A critical point: whatever path is chosen, the decision must be made within 18 months. Structural declines compound — each year of delay means more cash destroyed.

---` },
    ],
  },
  {
    id: 'D4.6',
    title: "THE PRICING POWER INDEX (GAP SOLUTION)",
    lessons: [
      { id: 'D4.6.1', title: "The Problem This Solves", description: `Standard profitability frameworks identify that input costs have risen. They do not tell you how much of that cost increase can be passed through to consumers before volume collapses. This gap causes the single most common strategic error in Indian FMCG consulting: recommending a price increase that triggers a volume collapse that more than offsets the margin benefit.

The Pricing Power Index (PPI) fills this gap.

---` },
      { id: 'D4.6.2', title: "Definition", description: `**Pricing Power Index (PPI) = Percentage of Input Cost Increase That Can Be Passed Through Without Triggering Significant Volume Loss**

PPI = 1.0 means the company can pass through 100% of cost increases (full pricing power — luxury brands, monopoly utilities)
PPI = 0 means the company cannot raise prices at all without volume collapse (pure commodity, price taker)
PPI = 0.6 means the company can pass through 60% of cost increases and must absorb 40% as margin compression

---` },
      { id: 'D4.6.3', title: "How to Calculate PPI", description: `### Step 1: Establish Price Elasticity of Demand (PED)
PED = % Change in Volume ÷ % Change in Price

For Indian biscuits (benchmark data):
- Glucose biscuits (commodity): PED typically −2.0 to −3.0 (highly elastic — a 10% price rise causes 20–30% volume decline)
- Premium cream biscuits: PED typically −0.8 to −1.2 (moderately elastic)
- Specialty/health biscuits: PED typically −0.4 to −0.7 (inelastic — consumers willing to pay for perceived health benefit)

### Step 2: Establish the "Acceptable Volume Loss Threshold"
The company defines the maximum volume decline it can absorb before EBITDA impact from volume loss exceeds EBITDA gain from price increase.

**The Break-Even Price Increase Formula:**
Let:
- p = current price
- v = current volume
- c = variable cost per unit
- Δp = proposed price increase (%)
- PED = price elasticity

Volume after price increase = v × (1 + PED × Δp)
EBITDA after price increase = (p × Δp + p − c) × v × (1 + PED × Δp)

The price increase is EBITDA-positive only if:
**(Δp) > (−1/PED) × (c/p)**

This gives the minimum required contribution margin ratio for a price increase to be viable.

### Step 3: Calculate PPI

**PPI = (Maximum EBITDA-Positive Price Increase) ÷ (Input Cost Increase Required to Maintain Margin)**

**Worked Example — Surya Glucose Biscuits:**
- Current ASP: ₹8 per 100g pack
- Variable cost per pack: ₹5.80
- Contribution margin: ₹2.20 (27.5%)
- Wheat cost increase over 2 years: 18%
- Wheat as % of variable cost: 42%
- Required price increase to maintain current margin: 18% × 42% = 7.6% (i.e., ₹0.61 per pack)
- PED for glucose biscuits: −2.5
- Maximum EBITDA-positive price increase (using formula above): 10.9%
- But: if Parle-G does not match the price increase, effective PED becomes steeper (−3.5 or worse due to brand switching)
- Adjusted Maximum EBITDA-Positive Price Increase: 7.5%

**PPI = 7.5% ÷ 7.6% = 0.99**

**Interpretation:** This looks like high pricing power — but it is illusory. The 7.5% is the theoretical maximum only if Parle-G matches the price increase. If Parle-G does not raise prices, the effective PPI drops to approximately 0.3.

**Strategic Implication:** The glucose biscuit PPI is conditionally near-1 (if industry co-moves) and effectively near-0 (if industry does not co-move). This is the correct diagnosis for a category where you are not the leader — you have pricing power only on the leader's terms.

### Step 4: Build the PPI Dashboard by Product Line

| SKU / Category | PED | Max EBITDA+ Price Δ | Required Price Δ | PPI | Strategic Signal |
|---|---|---|---|---|---|
| Glucose Biscuit (leader match) | −2.5 | 7.5% | 7.6% | 0.99 | Fragile — depends on Parle |
| Glucose Biscuit (leader no-match) | −3.5 | 5.4% | 7.6% | 0.71 → effective 0.3 | Structurally weak |
| Cream Biscuit | −1.1 | 17.1% | 5.2% | 1.0+ (headroom) | Strong pricing power |
| Specialty Cookie | −0.6 | 31.3% | 5.2% | 1.0+ (significant headroom) | Excellent pricing power |

**Capital Allocation Rule Derived from PPI:**
Invest marketing, distribution, and innovation budgets in proportion to PPI. A PPI below 0.5 is a red flag for long-term category viability — the company is a price taker, and its margin is hostage to commodity cycle.

---` },
      { id: 'D4.6.4', title: "The Hyper-Inflation Adjustment (The Previously Unaddressed Gap)", description: `Standard profitability frameworks have no protocol for environments where both input costs and consumer prices move simultaneously, rapidly, and non-linearly — as occurred in India in 2022 during the edible oil supply shock.

**The Dual-Movement Problem:**
When input costs rise 30%+ in a short window AND consumer inflation simultaneously erodes real purchasing power, the standard PPI calculation breaks down because:
1. WTP itself declines (consumers' real income falls)
2. The substitute landscape shifts rapidly (cheaper alternatives emerge)
3. PED becomes non-linear (at certain absolute price points, consumers switch permanently, not temporarily)

**The Hyper-Inflation Profitability Protocol:**
In hyper-inflation environments, run a three-scenario stress test:

**Scenario A — Full Pass-Through:** Pass 100% of cost increase to price. Modelled volume impact using stressed PED (apply 1.5× normal PED to reflect income-eroded consumer sensitivity). Calculate EBITDA.

**Scenario B — Partial Pass-Through (50%):** Raise price by 50% of cost increase; absorb remainder as margin compression. Calculate volume at normal PED. Calculate EBITDA.

**Scenario C — Shrinkflation (No Price Increase):** Maintain MRP. Reduce pack weight/quantity by 10–15% to absorb cost increase. Consumer unit volume is maintained; consumer value received decreases. Calculate EBITDA.

**Decision Rule:**
Choose the scenario with the highest NPV of EBITDA over a 3-year horizon, not just the highest immediate-year EBITDA. Shrinkflation often wins in Year 1 but creates a consumer trust deficit that damages repeat purchase in Years 2–3.

**India-Specific Note on Shrinkflation:**
India has extensive media and social media coverage of shrinkflation. A ₹5 biscuit pack that went from 80g to 65g over 3 years has been covered by major Indian news outlets. The reputational cost must be included in the NPV calculation.

---` },
    ],
  },
  {
    id: 'D4.7',
    title: "VISUAL SPECIFICATIONS & DIAGRAM PROMPTS",
    lessons: [
      { id: 'D4.7.1', title: "DIAGRAM 1: THE MASTER PROFITABILITY TREE", description: `**Visual Prompt:**

> Create a top-down hierarchical tree diagram titled "Profit = Revenue − Cost." The root node at the top is "Profit" in a dark box. It branches into two Level 1 nodes: "Revenue" (left, in blue) and "Cost" (right, in red/crimson).
>
> Revenue node branches into three Level 2 nodes: "Price," "Volume," and "Product Mix."
>
> Price branches into three Level 3 nodes: "Cost Floor (Value Chain)," "Competitive Band," and "Value Ceiling (WTP)." Each has a small annotation: Cost Floor shows "= Total Unit Cost + Margin Target"; Value Ceiling shows "= Customer WTP − Switching Cost."
>
> Volume branches into two Level 3 nodes: "# Customers" and "Avg Order Size × Frequency." # Customers further branches into a Level 4 funnel showing five gates in sequence: "Need → Awareness → Accessibility → Affordability → Experience."
>
> Product Mix branches into two Level 3 nodes: "SKU Revenue Share" and "SKU Margin Profile," with an annotation reading "Apply 80/20 Pareto."
>
> Cost node branches into two Level 2 branches: "By Type (Fixed/Variable)" and "By Value Chain Node." The Value Chain Node branch shows 8 sequential nodes in a horizontal chain: "R&D → Procurement → Inbound Logistics → Production → Storage → Outbound Logistics → Marketing → After-Sales." Each node has a small sub-bullet showing its primary cost driver.
>
> Style: Clean corporate, white background, minimal lines, hierarchical spacing, India brand colors (deep navy + crimson accent). All text in sentence case. No drop shadows.

---` },
      { id: 'D4.7.2', title: "DIAGRAM 2: THE CUSTOMER FUNNEL (REVENUE-SIDE)", description: `**Visual Prompt:**

> Create a vertical inverted funnel with 5 tiers, each progressively narrower from top to bottom. The funnel is titled "Customer Volume Diagnostic — The 5 Gates."
>
> Tier 1 (widest): "Need" — annotation: "Does the problem exist for the target consumer?"
> Tier 2: "Awareness" — annotation: "Does the consumer know this solution exists?"
> Tier 3: "Accessibility" — annotation: "Can the consumer physically reach the product?"
> Tier 4: "Affordability" — annotation: "Is the price within the consumer's budget?"
> Tier 5 (narrowest): "Experience & Repeat" — annotation: "Does post-purchase experience drive loyalty?"
>
> On the right side of the funnel, for each tier, show an "India Distortion" callout box:
> - Need: "Latent needs are vast in rural India — healthcare, insurance, nutrition"
> - Awareness: "Rural India awareness through cable TV + SHG word-of-mouth, not digital"
> - Accessibility: "Only 10% of India's 14M kiranas actively stock any given FMCG brand"
> - Affordability: "Sachet economy: ₹1–₹10 pack architecture is structural, not tactical"
> - Experience: "Hyper-dense WhatsApp community WOM makes negative experience catastrophic"
>
> On the left side, show the "Diagnostic Question" for each tier.
>
> Style: Clean funnel with gradient fill from light blue at top to deep navy at bottom. Right callout boxes in amber/gold. Left questions in light gray. India map watermark faintly in background.

---` },
      { id: 'D4.7.3', title: "DIAGRAM 3: THE VALUE CHAIN COST MAP", description: `**Visual Prompt:**

> Create a horizontal value chain flow diagram with 8 nodes connected by arrows, flowing left to right. Each node is a rounded rectangle. The diagram is titled "Cost Architecture — Value Chain Decomposition."
>
> Nodes in order: R&D / Innovation → Raw Material Procurement → Inbound Logistics → Production / Manufacturing → Storage & Warehousing → Outbound Logistics → Marketing & Sales → After-Sales Service
>
> Below each node, show 3–4 bullet points listing the specific cost sub-drivers for that node (drawn from the content above).
>
> Above each node, show a small "India Alert" icon with a brief India-specific risk flag. For example:
> - Procurement: "Wheat/sugar MSP volatility; export bans"
> - Inbound Logistics: "India logistics cost = 13–14% GDP vs 8% global benchmark"
> - Production: "Electricity tariffs vary ₹4–₹8/unit by state"
> - Outbound: "C&F Agent → Distributor → Sub-Dist → Retailer = 4-layer margin stack"
>
> At the bottom of the diagram, show two horizontal bars:
> - Bar 1: "Fixed Cost Distribution across nodes" (approximate % breakdown)
> - Bar 2: "Variable Cost Distribution across nodes"
>
> Style: Dark navy nodes with white text. Arrows in crimson. India Alert icons in amber. Clean, structured, no clutter.

---` },
      { id: 'D4.7.4', title: "DIAGRAM 4: THE PRICING POWER INDEX DASHBOARD", description: `**Visual Prompt:**

> Create a 2-panel dashboard visual titled "Pricing Power Index (PPI) Dashboard."
>
> Panel 1 (left): A vertical "thermometer" or gauge visual showing the PPI scale from 0.0 to 1.0+. Mark three zones: Red zone (0–0.4) labeled "Price Taker — Cannot Pass Through Costs"; Amber zone (0.4–0.7) labeled "Conditional Power — Partial Pass-Through"; Green zone (0.7–1.0+) labeled "Price Maker — Full Cost Recovery." Add a pointer or indicator needle for each product line, labeled with the product name and PPI value.
>
> Panel 2 (right): A 2×2 matrix with axes: X-axis = "Pricing Power (PPI)" from Low (left) to High (right); Y-axis = "Revenue Share" from Low (bottom) to High (top). Plot 4 product bubbles: Glucose Biscuit (top-left quadrant — high revenue share, low PPI — labeled "Strategic Risk"), Cream Biscuit (top-right — high revenue share, moderate PPI — labeled "Core Investment"), Specialty Cookie (bottom-right — lower revenue share, high PPI — labeled "Growth Bet"), Institutional/B2B (bottom-left — low revenue share, low PPI — labeled "Exit Candidate"). Bubble size represents absolute EBITDA contribution.
>
> Below both panels, show the formula: PPI = Maximum EBITDA-Positive Price Increase ÷ Input Cost Increase Required to Maintain Margin. Show the Surya worked example in a callout box.
>
> Style: Dashboard aesthetic, dark background, data-forward. Gauge in Panel 1 uses red-amber-green gradient. Matrix in Panel 2 uses light grid lines. Clean, no decorative elements.

---` },
      { id: 'D4.7.5', title: "DIAGRAM 5: THE WEAK VS. STRONG ANSWER COMPARISON", description: `**Visual Prompt:**

> Create a split-screen comparison visual titled "Same Case, Different Depth."
>
> Left panel header: "Weak Answer" (in red). Right panel header: "Strong Answer" (in green).
>
> In each panel, show the same 5 evaluation criteria as rows:
> 1. Opening move
> 2. Quantification
> 3. India-specific insight
> 4. Hypothesis quality
> 5. Data prioritisation
>
> For the Weak Answer column, show the weak response for each criterion in short form. For the Strong Answer column, show the strong response.
>
> At the bottom, show a "Signal Score" bar for each: Weak Answer = 2/10; Strong Answer = 9/10. Do not show this as a grade — show it as a visual progress bar.
>
> Below the comparison, add a text box: "The gap is not knowledge of the framework. The gap is the ability to apply commercial judgment to a specific India industry context."
>
> Style: Two-column table aesthetic with very clean lines. Red accent for weak, green accent for strong. Neutral gray background.

---` },
      { id: 'D4.7.6', title: "DIAGRAM 6: THE THREE CURVEBALL ZONES", description: `**Visual Prompt:**

> Create a visual titled "The MBB Curveball Architecture — What They're Really Testing."
>
> Show three "trap door" cards, each looking like a trapdoor opening beneath the candidate's feet:
>
> Card 1: "The Pricing Power Trap"
> Test: Can you think beyond 'raise prices'?
> Trap: Recommending price increase in a category where you're not the leader
> Signal: Understanding of PPI and competitive pricing dynamics
>
> Card 2: "The Good Cost vs. Bad Cost Trap"
> Test: Can you adjudicate competing internal narratives with unit economics?
> Trap: Siding with CFO or Sales Head without data
> Signal: Payback analysis, vintage analysis, cost-to-serve per outlet
>
> Card 3: "The Structural vs. Cyclical Trap"
> Test: Can you recognise when a problem cannot be fixed by optimisation?
> Trap: Recommending operational fixes to a structural market decline
> Signal: Portfolio strategy thinking — managed decline, exit, or pivot
>
> Style: Three cards in a row, each with a dark background and a trapdoor visual element at the bottom. Crimson for trap warnings. White for signal text. Subtle shadow under each card for depth.

---` },
    ],
  },
  {
    id: 'D4.8',
    title: "INDUSTRY VARIANT QUICK CARDS",
    lessons: [
      { id: 'D4.8.1', title: "AIRLINES (Indigo, Air India, Vistara context)", description: `**Profit Equation:** Profit = RASK − CASK (Revenue per Available Seat Kilometre minus Cost per Available Seat Kilometre)

**Revenue Levers:**
- Load Factor (% seats filled) × Yield (average fare per km) = RASK
- Ancillary revenue: Excess baggage, seat upgrades, cargo, advertising, loyalty miles monetisation
- Route mix: High-yield business routes vs. high-load holiday routes
- Dynamic pricing algorithm efficiency (yield management)

**Cost Levers:**
- ATF (Aviation Turbine Fuel): 35–40% of total cost; entirely INR-denominated but indexed to global crude + government levy. India has one of the highest ATF taxes globally (25–30% on base price), structurally disadvantaging Indian carriers vs. international peers.
- Aircraft lease cost: Operating lease vs. finance lease. For budget carriers, lease cost is the #2 cost item.
- Airport charges: Landing, parking, ground handling. DIAL (Delhi) and MIAL (Mumbai) charges are significantly higher than secondary airports.
- MRO (Maintenance, Repair, Overhaul): India has underdeveloped MRO infrastructure; most airlines send aircraft abroad for heavy maintenance, incurring forex and turnaround time costs.
- Crew cost: Pilots (especially captains) are globally scarce; Indian pilot salaries have increased 30%+ post-COVID due to demand surge.

**India-Specific Pressures:**
- Bilateral air services agreements limit international expansion
- IndiGo's dominance (60%+ domestic market share) means pricing discipline on domestic routes follows IndiGo, not market equilibrium
- GoFirst bankruptcy and SpiceJet distress have concentrated market, giving survivors pricing relief in specific corridors

---` },
      { id: 'D4.8.2', title: "BANKING / NBFC", description: `**Profit Equation:** NIM (Net Interest Margin) × Asset Base − Credit Costs − Operating Costs = PAT

**NIM = Interest Income Rate − Cost of Funds Rate**

**Revenue Levers:**
- Yield on advances: Loan book composition (retail vs. corporate vs. SME; secured vs. unsecured)
- Fee income: Processing fees, forex income, distribution of insurance/mutual funds, credit card fees
- Treasury income: Mark-to-market gains/losses on bond portfolio

**Cost Levers:**
- Cost of funds: CASA ratio (Current Account + Savings Account as % of total deposits). Higher CASA = lower cost of funds. CASA of 40%+ is considered strong.
- Credit cost: NPA (Non-Performing Asset) formation rate × provisioning requirement. India's banking sector has historically struggled with PSB NPAs from infrastructure and real estate loans.
- Operating cost: Cost-to-Income ratio (OpEx as % of Net Revenue). Digital-native NBFCs can achieve 30–35%; PSBs often at 50–55%.

**India-Specific:**
- RBI repo rate changes pass through to loan rates quickly but to deposit rates slowly — this creates a temporary NIM expansion during rate hike cycles and NIM compression during rate cut cycles.
- Priority sector lending mandates (40% of advances must go to agriculture, MSMEs, weaker sections) constrain yield optimisation.

---` },
      { id: 'D4.8.3', title: "MANUFACTURING / ELECTRONICS", description: `**Profit Equation:** Revenue − (COGS + Logistics + Marketing + Overheads) = EBITDA

**Key Metric:** Contribution Margin per unit = ASP − Variable Manufacturing Cost per unit

**India-Specific Manufacturing Levers:**
- PLI scheme benefits: 4–6% incentive on incremental production for eligible categories (mobile phones, white goods, AC, LED lighting)
- SEZ (Special Economic Zone) vs. DTA (Domestic Tariff Area) production economics: SEZ offers duty exemptions on imports but limits domestic sales
- BCD (Basic Customs Duty): Import duty on finished goods is a significant moat for domestic manufacturers (e.g., 20% BCD on finished TVs protects domestic assemblers)
- Electricity cost as a % of variable cost: High for energy-intensive processes (aluminium smelting, glass manufacturing)

**Capacity Utilisation Impact:**
At 50% utilisation: Fixed cost per unit = 2× optimum
At 70% utilisation: Fixed cost per unit = 1.4× optimum
At 90% utilisation: Fixed cost per unit ≈ optimum
Recommendation: A manufacturing EBITDA analysis that doesn't include utilisation rate is incomplete.

---

# APPENDIX: INDIA DATA BENCHMARKS FOR PROFITABILITY CASES

*Use these to calibrate your estimates in cases. Citing approximate benchmarks demonstrates India market knowledge.*

| Metric | Benchmark | Context |
|---|---|---|
| FMCG Trade Margin Stack | 22–35% of MRP | Distributor 5–8%, Sub-distributor 3–5%, Retailer 12–20% |
| India Logistics Cost % GDP | 13–14% | vs. global benchmark of 8% |
| FMCG EBITDA Margin (Large Player) | 18–22% | HUL ~23%; Dabur ~18–20% |
| FMCG EBITDA Margin (Mid-Size) | 10–15% | Smaller branded players |
| Indian Bank CASA Ratio (Good) | 40%+ | HDFC ~44%; Kotak ~53% |
| Indian Bank NIM (Good) | 3.5–4.5% | Private banks; PSBs typically lower |
| Airline CASK (IndiGo) | ₹4.5–5.5/ASKM | Among lowest globally |
| ATF as % of Airline Cost | 35–40% | Varies with crude |
| India Cold Chain Penetration | ~10% of perishables | vs. 90%+ in developed markets |
| UPI Transaction Volume | 13+ billion/month (2024) | Highest digital payment volume globally |
| India Kirana Store Count | 12–14 million | Only top FMCG players reach 1M+ outlets |
| Rural India Consumer Share | ~45% of total FMCG consumption | Disproportionately glucose biscuit, soap, hair oil |` },
    ],
  },
];

const D4_CASES: CaseEntry[] = [
  { code: 'P-01', title: 'Apple Orchard Farmer', sector: 'Agriculture', source: 'Bain & Co.', problem: 'Revenue declining due to reduced demand in beverage segment', rootCause: 'False rumors about alcohol content in apple beverages', keyInsight: 'Demand-side, acceptability failure; external factor', framework: 'Revenue tree → Demand decomposition (4A model)', resolution: 'Explore alternate markets; publish test results; cold storage' },
  { code: 'P-02', title: 'Retail Chain (24Seven proxy)', sector: 'Retail', source: 'Bain & Co.', problem: 'Flat profitability after opening new stores', rootCause: 'Revenue per store declined as customers redistributed across new stores', keyInsight: 'No new customers added; cannibalization of footfall', framework: 'Revenue → Volume/Price → Customer journey timing analysis', resolution: 'Position as day store; home delivery; loyalty programs' },
  { code: 'P-03', title: 'E-Commerce Platform', sector: 'E-Commerce', source: 'BCG', problem: 'New entrant missing revenue targets by 40-50%', rootCause: 'App UI bug - product page scrolls to top when browsing', keyInsight: 'Demand-side failure in purchase phase; UI/UX friction', framework: 'Customer journey mapping → UI audit', resolution: 'Hire product managers; continuous consumer feedback loop' },
  { code: 'P-04', title: 'Garbage Collecting Company', sector: 'Waste Management', source: 'Accenture Strategy', problem: 'Profit decline over 3 months', rootCause: 'Door-to-door collection method increased employee hours', keyInsight: 'Variable cost → labour hours increased due to method change', framework: 'Value chain → Man/Equipment/Method (Process analysis)', resolution: 'Centralized bin collection; separate wet/dry bins' },
  { code: 'P-05', title: 'Biscuit Manufacturer', sector: 'FMCG', source: 'McKinsey & Co.', problem: 'Profit margin declined from 25% to 18% over 6 months', rootCause: 'New packaging regulation mandated thicker material (250 microns)', keyInsight: 'Regulatory-driven external cost increase; packaging as % of COGS', framework: 'Value chain → Manufacturing → Process → Material', resolution: 'Bulk supplier contracts; sustainability premium positioning' },
  { code: 'P-06', title: 'Automobile Company Sales', sector: 'Automotive', source: 'Bain & Co.', problem: '20% sales decline over short period', rootCause: 'Government announced upcoming BS-VI regulations; consumers waiting', keyInsight: 'External regulatory factor suppressing demand', framework: 'Revenue → Volume → Demand → External factors', resolution: 'Export push; advance billing strategy' },
  { code: 'P-07', title: 'Auto Dealership (Skoda/Audi)', sector: 'Automotive (Premium)', source: 'BCG', problem: 'Flat sales at one Delhi NCR dealership despite strong brand', rootCause: 'Poor post-sales service; bad smell/ambience at store', keyInsight: 'Customer experience issue in purchase/post-purchase phase', framework: 'Customer journey → 5 Senses → Internal audit', resolution: 'Air fresheners; NDMC engagement; possible relocation' },
  { code: 'P-08', title: 'Kids TV Channel', sector: 'Media & Entertainment', source: 'Kearney', problem: 'Distributor fee revenue declining for 2+ years', rootCause: 'Competitor launched on-demand video service; subscriber loss', keyInsight: 'Revenue stream-specific decline; OTT disruption', framework: 'Revenue streams → Distribution fee → Subscriber count', resolution: 'Launch own OTT service; explore merchandising; pricing' },
  { code: 'P-09', title: 'Apparel Company (Middle East)', sector: 'Fashion/Retail', source: 'Kearney', problem: 'High costs post oil crisis; need to reduce prices', rootCause: 'Raw material (cotton) = 60% of procurement cost', keyInsight: 'Cost-reduction case; supply chain optimization', framework: 'Value chain cost decomposition → Raw material analysis', resolution: 'Lower GSM fabric; simpler designs; sourcing nearby' },
  { code: 'P-10', title: 'Quick Service Restaurant', sector: 'Food & Beverages', source: 'Kearney', problem: 'High manpower operating costs', rootCause: 'Entry of food aggregators forced shift to fixed + variable pay', keyInsight: 'Variable cost shift due to external competitive disruption', framework: 'Manpower cost tree → Fixed/Variable → Pay structure', resolution: 'Outsource delivery; loyalty bonuses; delivery charge pass-through' },
  { code: 'P-11', title: 'Steel Manufacturer (BCG)', sector: 'Manufacturing/Steel', source: 'BCG', problem: '30% profit decline; industry only down 10%', rootCause: 'Iran sanctions raised fuel costs; defaulted on supplier payments; shifted to advance basis', keyInsight: 'Supply chain confidence collapse creating cascading cost increases', framework: 'Macro (PESTEL) → Revenue/Cost → Value Chain → Working Capital', resolution: 'Supplier relationship repair; fuel hedging; route optimization' },
  { code: 'P-12', title: 'Fast Food Delivery', sector: 'Food Delivery', problem: 'Return rate spike in food delivery boxes', rootCause: 'Packaging material thickness cut from 4" to 2.5" by seller for cost savings', keyInsight: 'Vendor cost-cutting eroding product integrity', framework: 'Value chain → Packaging stage → Man/Equipment/Method/Material', resolution: 'Mandate client packaging; offer warehouse services to sellers' },
  { code: 'P-13', title: 'PG Rental Accommodation', sector: 'Real Estate', problem: '25% occupancy decline over 4 months at one property', rootCause: 'Municipal garbage dump opened 100m away 6 months prior', keyInsight: 'External environmental factor; 5 Senses (smell) failure', framework: 'Revenue → Occupancy → Demand → External → Environmental', resolution: 'Air purifiers; municipal lobbying; target short-stay clients' },
  { code: 'P-14', title: 'Pet Grooming Chain', sector: 'Services', problem: '10-15% profit decline at Delhi branch over 3 months', rootCause: 'Staff inexperienced → repetitive rinsing → excess water/electricity use', keyInsight: 'Labour efficiency issue driving variable utility cost', framework: 'Value chain → Operations → Utilities → Labour analysis', resolution: 'Staff training; performance benchmarks; water recycling' },
  { code: 'P-15', title: 'Toy Manufacturer', sector: 'Retail', problem: 'Declining revenue from a single store in Delhi', rootCause: 'Bad odour from adjacent toilet affecting store experience', keyInsight: '5 Senses (smell) → Purchase phase → Store experience', framework: 'Revenue → Customers → Internal → Store experience → 5 Senses', resolution: 'Air fresheners; seal openings; NDMC contact; long-term relocation' },
  { code: 'P-16', title: 'Airlines', sector: 'Aviation', source: 'BCG', problem: '15% profit decline despite new route revenue growth', rootCause: 'FX rate increase (Malaysian bank creditor) raised financing costs', keyInsight: 'Financing cost → International debt → Currency risk', framework: 'Profitability → Operating/Financing/Investing → Currency analysis', resolution: 'Currency hedging instruments; reduce foreign-denominated debt' },
  { code: 'P-17', title: 'Insurance Company', sector: 'BFSI', source: 'Kearney', problem: 'Revenue declining 10% over 5-6 quarters (premiums sold)', rootCause: 'Outsourced vendor code bug causing incorrect premium calculation', keyInsight: 'Process failure in underwriting → risk mispricing → loss of trust', framework: 'Revenue → # premiums → Customer journey → Underwriting process', resolution: 'Replace vendor; build in-house underwriting team' },
  { code: 'P-18', title: 'Pharmaceutical Analysis', sector: 'Pharma', source: 'Kearney', problem: 'CEO wants to increase absolute profit; $5M → $13M target', rootCause: 'Analytical exercise; identify cost reduction vs. revenue increase', keyInsight: 'Variable cost increase = proportional to revenue growth; pure math', framework: 'Profit equation → Revenue/Cost decomposition → Break-even math', resolution: 'Sales force optimization (retargeting, resizing, realignment)' },
  { code: 'P-19', title: 'Power Plant (Coal Gasification)', sector: 'Energy', source: 'BCG', problem: '3-month profit dip from increased raw material cost', rootCause: 'Switching from LIFO to FIFO in coal storage → crushing at lower stack', keyInsight: 'Inventory management method change causing physical waste', framework: 'Value chain → Operations → Storage → Inventory method', resolution: 'Revert to LIFO; separate bunches; optimize daily orders; sell crushed coal to thermal plants' },
  { code: 'P-20', title: 'Airline Profitability (Loyalty Program)', sector: 'Aviation', source: 'BCG', problem: '15% profit decline; revenue from baggage services down', rootCause: 'New loyalty program allows extra baggage without charge → less revenue + more fuel cost from heavier flights', keyInsight: 'Policy change creating dual revenue and cost impact', framework: 'Revenue streams → Baggage → Loyalty program analysis', resolution: 'Revise loyalty program; move to discounts over baggage allowance; service bundling' },
  { code: 'P-21', title: 'Shopping Mall (South Delhi)', sector: 'Real Estate/Media', source: 'BCG', problem: 'Want to increase ad revenue (currently 8% of total)', rootCause: 'Optimization opportunity, not decline', keyInsight: 'Growth case framed as profitability; allotted space × revenue/space × utilization', framework: 'Ad revenue = Space × Price/Unit × Utilization%', resolution: 'New spaces (elevators, rooftops); digital boards; event activations; client portals' },
  { code: 'P-22', title: 'Food Manufacturer (Biscuit/Parle proxy)', sector: 'FMCG', source: 'BCG', problem: 'Declining profits at PAN-India biscuit company', rootCause: 'FIFO adoption in warehouse → higher expiry/waste due to product age', keyInsight: 'Inventory management causing perishable waste', framework: 'Value chain → Warehousing → Inventory method → LIFO vs FIFO', resolution: 'Revert to FIFO with warehouse redesign; reopen exit door' },
  { code: 'P-23', title: 'IT Services Firm', sector: 'IT/Consulting', source: 'Kearney', problem: 'Bottom-line improvement needed in India region', rootCause: 'Delhi office at 75% utilization vs. New York at 85% → overstaffed', keyInsight: 'Resource utilization gap → effective cost per project is higher', framework: 'Employee Cost = # employees × utilization × wage rate', resolution: 'Lay off ~588 employees; benchmark against New York office', math: 'Delhi utilization 75% vs NY 85%; overstaffing calculation → ~588 excess employees' },
  { code: 'P-24', title: 'Steel Manufacturer (Truck costs)', sector: 'Manufacturing', source: 'BCG', problem: 'CEO suspects transportation costs are too high', rootCause: 'Using 3rd-party trucks at Rs 25/km → Rs 7.5L/year vs. owning at Rs 13.3L/year', keyInsight: 'Benchmarking shows 3rd-party is actually cheaper', framework: 'Value chain → Outbound logistics → Cost benchmarking', resolution: 'Negotiate with vendor; full truck load optimization; rail for bulk', math: '3rd-party: Rs 25/km → Rs 7.5L/year; Owning: Rs 13.3L/year' },
  { code: 'P-25', title: 'Women Apparel Chain (US)', sector: 'Retail', source: 'Bain & Co.', problem: 'High costs in retail side; identify root cause', rootCause: '6 staff per store vs. competitor\'s 5 → inefficiency or poor training', keyInsight: 'Labour cost benchmarking reveals overstaffing', framework: 'Cost → Fixed → Salary → Staffing layers → Competitor benchmark', resolution: 'Investigate why 6 needed; retrain; link bonuses to survey scores' },
  { code: 'P-26', title: '2024 Olympics TV Rights', sector: 'Media', source: 'McKinsey & Co.', problem: 'How much should a TV network bid for Olympic rights?', rootCause: 'Financial modelling exercise (NPV of future profit streams)', keyInsight: 'Must account for TVM (bid in 2019, profits in 2024)', framework: 'Ad Revenue calculation → Cost breakdown → NPV discounting', resolution: 'Final bid = $190M', math: '576 flights/day analog; ~1L passengers; ad slots; final bid = $190M' },
];

// ─── D5 | CASE TYPE: MARKET ENTRY ──────────────────────────────────────────

const D5_MODULES: Module[] = [
  {
    id: 'D5.1',
    title: 'Market Entry Case Anatomy',
    lessons: [
      { id: 'D5.1.1', title: 'Types: Geographic, New Segment, New Product, New Channel', description: 'Encompasses launching new products, targeting new demographics, or opening novel distribution channels. Each type requires a different analytical lens regarding brand transferability.' },
      { id: 'D5.1.2', title: 'Key clarifying questions: objective, timeline, constraints', description: 'Before sizing a market, establish the primary goal and timeline for breakeven. Understanding capital constraints eliminates unviable entry modes early.' },
      { id: 'D5.1.3', title: 'Entry mode options: Organic, JV, Acquisition, Licensing', description: 'Firms can build from scratch, partner for expertise, buy an existing player, or license their brand. The choice balances control, capital risk, and speed to market.' },
      { id: 'D5.1.4', title: 'Decision framework: Should they enter? How? With what?', description: 'Evaluates market attractiveness, financial viability, and operational feasibility. Answers whether the opportunity is lucrative and if the client has the right to win.' },
    ],
  },
  {
    id: 'D5.2',
    title: 'Market Attractiveness Assessment',
    lessons: [
      { id: 'D5.2.1', title: 'Market size (TAM/SAM/SOM) calculation', description: 'Estimating market size is the quantitative core testing logical assumptions. If the addressable market is too small to move the needle, it is a quick no-go.' },
      { id: 'D5.2.2', title: 'Growth rate (CAGR) and lifecycle stage', description: 'Assessing the lifecycle stage determines if you are entering a fierce red ocean or growing blue ocean. A large but declining market might be a value trap.' },
      { id: 'D5.2.3', title: "Competitive density: Porter's Five Forces", description: 'Evaluating monopolies and entry barriers ensures you understand competitive friction. Massive markets are unattractive if incumbents will crush new entrants.' },
      { id: 'D5.2.4', title: 'Regulatory, ESG, and macro environment (PESTEL)', description: 'Regulatory roadblocks or trade tariffs can destroy an otherwise brilliant entry thesis. Explicitly evaluate government stability and compliance in emerging markets.' },
    ],
  },
  {
    id: 'D5.3',
    title: 'Financial Viability Assessment',
    lessons: [
      { id: 'D5.3.1', title: 'Investment required vs. available capital', description: 'Map out the total CapEx and OpEx required to launch. Validates whether the client has the financial stamina to sustain initial cash burn.' },
      { id: 'D5.3.2', title: 'Break-even analysis: units and timeline', description: 'Calculating the volume needed to cover fixed costs provides a tangible risk metric. A breakeven timeline extending beyond strategic horizons signals high risk.' },
      { id: 'D5.3.3', title: 'ROI target setting and payback period', description: 'Corporate clients mandate strict hurdle rates for investments. Calculate ROI and compare it against the opportunity cost of deploying capital elsewhere.' },
      { id: 'D5.3.4', title: 'Synergy identification: cost and revenue', description: 'Synergies are bonus value created when entering adjacent markets, such as utilizing idle capacity. Strong synergies dramatically lower the risk profile of entry.' },
    ],
  },
  {
    id: 'D5.4',
    title: 'Operational Feasibility',
    lessons: [
      { id: 'D5.4.1', title: 'Value chain setup: make vs. buy vs. partner', description: 'Deciding whether to manufacture in-house or outsource defines operational risk. Hinges on the client\'s core competencies and quality control requirements.' },
      { id: 'D5.4.2', title: 'Distribution channel design', description: 'A great product fails without a localized distribution strategy. Assess whether to rely on e-commerce, third-party retail, or proprietary storefronts.' },
      { id: 'D5.4.3', title: 'Workforce and capability requirements', description: 'Entering new markets reveals capability gaps in local leadership or cultural fluency. Evaluating the ease of recruiting local staff is critical for sustainability.' },
      { id: 'D5.4.4', title: 'Risk identification and mitigation', description: 'Proactively addressing implementation risks demonstrates mature business judgment. Present concrete mitigation strategies for supply chain disruptions or competitive retaliation.' },
    ],
  },
  {
    id: 'D5.5',
    title: 'Market Entry Practice Bank (10 Cases)',
    lessons: [],
  },
];

const D5_CASES: CaseEntry[] = [
  { code: 'ME-01', title: 'Home Insurance (India)', sector: 'Insurance', source: 'BCG', problem: 'Multinational into Indian home insurance market', keyInsight: 'First-mover; no significant competition; market development needed', resolution: 'Leverage existing agents; partner with banks for home loan cross-sell', risks: 'Price-sensitive market; educating masses educates competitors too' },
  { code: 'ME-02', title: 'Fabrication Plant (Semiconductor)', sector: 'Manufacturing', source: 'BCG', problem: 'East Asian semiconductor firm entering India', keyInsight: "Go/No-Go for fab plant; India's growing electronics + EV demand", resolution: 'GO; cluster near ports for imported raw materials; leverage SEZs', risks: 'Skilled labour gap; import dependency for lithium/cobalt' },
  { code: 'ME-03', title: 'Sports Bike (US Market)', sector: 'Automotive', source: 'McKinsey', problem: 'European sports bike manufacturer entering US', keyInsight: 'Market sizing (young upper-class); breakeven at 240 bikes/year', breakEven: 'FC=20Cr + VC=50% of 1Cr → Profit=Q-0.5Q-20 → Q=240', resolution: 'Enter; target urban 20-35 demographics; premium positioning', math: 'FC=20Cr + VC=50% of 1Cr → Profit=Q-0.5Q-20 → Q=240' },
  { code: 'ME-04', title: 'Home Automation (India)', sector: 'Technology', source: 'McKinsey', problem: 'European smart home company entering India', keyInsight: 'First-mover advantage; limited competition (Philips, Havells)', analysis: 'Market Size: 1.4B × 30% urban × 20% upper class × 5000 target = 1.5Bn market', resolution: 'Partner with Tata/RIL; exclusive Amazon/Flipkart deals; bundle with Alexa', math: '1.4B × 30% urban × 20% upper class × 5000 target = 1.5Bn market' },
  { code: 'ME-05', title: 'Gold Mine (Mongolia)', sector: 'Private Equity', source: 'McKinsey', problem: 'Goldman Sachs investing in operational gold mine', keyInsight: 'ROI calculation; 5-year vs. 20-year comparison', resolution: 'Buy; ROI far exceeds 25% target; expansion option also viable', math: 'Revenue=120K×1800=21.6Cr; Costs=9.6Cr+2.5Cr; ROI=57.63% in Year 1' },
  { code: 'ME-06', title: 'Skin Care / Sunscreen (India)', sector: 'FMCG/Beauty', source: 'Kearney', problem: 'Established skin care firm entering sunscreen segment', keyInsight: 'No regulatory barriers; natural ingredients USP; premium price', resolution: 'ENTER under own brand; leverage existing distribution; celebrity endorsement', risks: 'Perfectly competitive market; price-driven consumer' },
  { code: 'ME-07', title: 'Smartphone Market (India)', sector: 'Technology', source: 'Bain & Co.', problem: 'US oil & gas company into Indian smartphone/app ecosystem', keyInsight: 'Not hardware; focus on OTT entertainment (streaming)', analysis: 'Market sizing → OTT penetration → subscriber revenue model', resolution: 'Enter entertainment OTT category; compete with Hotstar/Prime' },
  { code: 'ME-08', title: 'South African PE (Indian IT)', sector: 'Private Equity', source: 'Kearney', problem: 'PE firm investing in Indian IT/tech consultancy', keyInsight: 'Sales, financials, management, future growth pipeline; EV/EBITDA', exitOptions: 'IPO, secondary sale, strategic acquisition', resolution: 'Viable; exit in 8-10 years; assess utilization and growth trajectory' },
  { code: 'ME-09', title: '5G Launch (India)', sector: 'Telecom', source: 'Bain & Co.', problem: 'First-mover 5G launch in India', keyInsight: 'Adoption curve; 9.36M users/year; Break-even price = Rs 75/month', valuePricing: '5GB vs 1.5GB → 1.5-4.5x premium → price at Rs 165/month', resolution: 'ENTER; price at Rs 165 initially; dominate before competition arrives', math: 'Adoption curve; 9.36M users/year; Break-even price = Rs 75/month; Value pricing at Rs 165/month' },
  { code: 'ME-10', title: 'Coffee Capsule Machine (India)', sector: 'FMCG/Beverage', source: 'GEP', problem: 'Swiss F&B company (Nespresso proxy) entering India with capsule machines', keyInsight: '140Cr × 20% urban upper class × 60% drinkers × 40% frequent → 1.34Cr target', resolution: 'Enter via DTC and Tata/RIL; own website; Rs 100/capsule; machine at Rs 13K', math: 'Key Sizing: 140Cr × 20% urban upper class × 60% drinkers × 40% frequent → 1.34Cr target; Cost method = Rs 75; Value method = Rs 8000/3 months = Rs 2700/month' },
];

// ─── D6 | CASE TYPE: GROWTH STRATEGY ───────────────────────────────────────

const D6_MODULES: Module[] = [
  {
    id: 'D6.1',
    title: 'Growth Case Anatomy',
    lessons: [
      { id: 'D6.1.1', title: 'Organic vs. Inorganic growth', description: 'Organic growth relies on internal capabilities to increase sales, while inorganic growth utilizes M&A to acquire market share. Evaluates the fastest path to the client\'s target.' },
      { id: 'D6.1.2', title: 'Ansoff Matrix application: the four growth quadrants', description: 'Structures growth options systematically: pushing existing products, expanding geographies, inventing new lines, or diversification. Maps the risk-reward spectrum of a growth mandate.' },
      { id: 'D6.1.3', title: 'Revenue lever: # customers vs. revenue per customer', description: 'Topline growth requires acquiring new customers or extracting more value from existing ones through upselling. Forces prioritization between acquisition costs and retention.' },
      { id: 'D6.1.4', title: 'Growth target framing: absolute vs. percentage', description: 'Clarifying whether the goal is an absolute dollar amount or a percentage alters strategy. Percentage growth for mature giants requires massive acquisitions, while startups can use organic expansion.' },
    ],
  },
  {
    id: 'D6.2',
    title: 'Growth Strategy Practice Bank (9 Cases)',
    lessons: [],
  },
];

const D6_CASES: CaseEntry[] = [
  { code: 'G-01', title: 'Appliance Distribution Company (US)', sector: 'Distribution', source: 'BCG', problem: 'PE firm needs $300M more profit from investment in ABC Ltd.', keyInsight: 'Existing retailers give only 30% of revenue to main distributor vs. 70% at competitors', framework: 'Geographic expansion; product diversification; market penetration', resolution: 'Increase wallet share; upsell; product categories; geographic expansion' },
  { code: 'G-02', title: 'Apparel Business (US)', sector: 'Fashion', source: 'BCG', problem: 'Grow topline by 25%; low-income adult jeans brand', keyInsight: 'Frequency → cross-selling partnerships; new geographies; new segments (kids)', risks: 'China entry: price sensitivity, regulation, local competition', resolution: 'Departmental store tie-ups; e-commerce discounts; loyalty programs' },
  { code: 'G-03', title: 'Book Publishing (Legal)', sector: 'Publishing', source: 'Kearney', problem: 'PE evaluating acquisition; assess growth potential', targetSegments: 'Law students, lawyers, CAs, consultants, libraries', channels: 'University bookstores, e-commerce, legal conferences, coaching centers', resolution: 'Multi-channel expansion; subscription models; D2C website' },
  { code: 'G-04', title: 'Pediatric Vaccine', sector: 'Pharma', source: 'Bain & Co.', problem: 'Hepatitis B vaccine; grow from 10-15% penetration toward 75% market share', keyInsight: 'Rising disposable income → track premium baby product spend as proxy', framework: 'Awareness (offline + digital); accessibility; affordability (rising incomes)', resolution: 'Target upper-middle class; train doctors; social media campaigns' },
  { code: 'G-05', title: 'Truck Manufacturer', sector: 'Manufacturing', source: 'BCG', problem: 'Grow 20% in 3 years; currently in B2B trucking (50%+ market share)', keyInsight: 'New industries (refrigerated for frozen food); electric trucks; fleet services; exports', framework: 'Services: Maintenance, driver training, telematics, GPS-based fleet management', resolution: 'New product lines (EVs); new geographies; adjacent services' },
  { code: 'G-06', title: 'Fashion Retail + AI/ML', sector: 'Retail/Tech', source: 'Deloitte USI', problem: 'Improve customer experience and marketing via AI/ML', keyInsight: 'Customer ID system; AR try-on app; personalized recommendations; birthday deals', framework: 'Tech Stack: AWS/Azure; ML recommendation engine; mobile app; e-commerce enablement', resolution: 'Build customer database; AR app; e-commerce from store inventory' },
  { code: 'G-07', title: 'Spare Part Manufacturer', sector: 'Manufacturing', source: 'BCG', problem: 'Client growing at 6% vs. industry at 9%; 2-wheeler parts dominant', keyInsight: '4-wheeler growth at 4% vs. industry 9% → biggest opportunity', framework: 'Existing market (B2B platforms, retailer incentives); New products (rear headlights, EV parts); Exports', resolution: 'Target new geographies; new adjacent products in current channels', analysis: 'Top 2 Recs: South/East India expansion + complementary product launch' },
  { code: 'G-08', title: 'Water Treatment Equipment', sector: 'Industrial B2B', source: 'McKinsey', problem: '4th in market at 15% share; leader at 30%; grow position', keyInsight: 'Leader sells 75% direct; client sells 60% via 3rd-party → weak control', framework: 'Product bundling; service-based revenue (maintenance, training, warranties); distribution shift (40% → more direct)', resolution: 'Shift toward direct sales; AI integration in products; exclusive distributor contracts' },
  { code: 'G-09', title: 'Vacation Rental (Vacasa/Oregon)', sector: 'Hospitality', source: 'Bain & Co.', problem: 'Scale from 5,000 to 10,000 houses in 10-18 months; current 6% growth', math: '83,000 leads total → 7,000/month at 6% conversion; churn = 8%', channels: 'Social media geo-targeting; real estate ads; physical offices; conferences', resolution: '3-step funnel (Awareness → Leads → Convert); target homeowner conferences' },
];

// ─── ASSEMBLE DOMAINS ──────────────────────────────────────────────────────

export const DOMAINS_FOUNDATIONS: Domain[] = [
  // ── D1 ─────────────────────────────────────────────────────────────────
  {
    code: 'D1',
    slug: 'consulting-foundations',
    title: 'Consulting Foundations',
    fullTitle: 'D1 | CONSULTING FOUNDATIONS',
    level: 'Beginner',
    prereqs: 'None',
    tags: ['foundations', 'overview', 'industry', 'career'],
    modules: D1_MODULES,
    quizOpportunities: 'D1.1, D1.2, D1.3',
    diagramOpportunity: 'Consulting firm hierarchy visual; career path timeline',
  },

  // ── D2 ─────────────────────────────────────────────────────────────────
  {
    code: 'D2',
    slug: 'case-interview-methodology',
    title: 'Case Interview Methodology',
    fullTitle: 'D2 | CASE INTERVIEW METHODOLOGY',
    level: 'Beginner to Intermediate',
    prereqs: 'D1',
    tags: ['case-interview', 'methodology', 'structure', 'process'],
    modules: D2_MODULES,
    quizOpportunities: 'D2.2 (competency scoring), D2.7 (identify the anti-pattern)',
    diagramOpportunity: 'Case flow timeline; competency radar chart; P2P practice protocol',
  },

  // ── D3 ─────────────────────────────────────────────────────────────────
  {
    code: 'D3',
    slug: 'frameworks-mental-models',
    title: 'Frameworks & Mental Models',
    fullTitle: 'D3 | FRAMEWORKS & MENTAL MODELS',
    level: 'Intermediate',
    prereqs: 'D2',
    tags: ['frameworks', 'mental-models', 'structure', 'tools'],
    modules: D3_MODULES,
    quizOpportunities: 'D3.1 (match framework to case), D3.4 (MECE classification drill)',
    diagramOpportunity:
      "Every framework gets a dedicated visual card; BCG Matrix example with Apple products; Ansoff with Coca-Cola; Porter's 5 Forces spider chart",
  },

  // ── D4 ─────────────────────────────────────────────────────────────────
  {
    code: 'D4',
    slug: 'profitability',
    title: 'Profitability',
    fullTitle: 'D4 | CASE TYPE: PROFITABILITY',
    level: 'Intermediate',
    prereqs: 'D2, D3.1, D3.5',
    tags: ['profitability', 'revenue', 'cost', 'margins', 'case-practice'],
    modules: D4_MODULES,
    cases: D4_CASES,
    flashcardOpportunities: 'Root cause per case; framework applied; key math formula',
    quizOpportunities: 'Match root cause to case; identify the right framework',
  },

  // ── D5 ─────────────────────────────────────────────────────────────────
  {
    code: 'D5',
    slug: 'market-entry',
    title: 'Market Entry',
    fullTitle: 'D5 | CASE TYPE: MARKET ENTRY',
    level: 'Intermediate to Advanced',
    prereqs: 'D2, D3.2, D3.3',
    tags: ['market-entry', 'go-to-market', 'international', 'feasibility'],
    modules: D5_MODULES,
    cases: D5_CASES,
  },

  // ── D6 ─────────────────────────────────────────────────────────────────
  {
    code: 'D6',
    slug: 'growth-strategy',
    title: 'Growth Strategy',
    fullTitle: 'D6 | CASE TYPE: GROWTH STRATEGY',
    level: 'Intermediate to Advanced',
    prereqs: 'D2, D3.3, D3.5',
    tags: ['growth', 'strategy', 'revenue', 'expansion', 'ansoff'],
    modules: D6_MODULES,
    cases: D6_CASES,
  },
];
