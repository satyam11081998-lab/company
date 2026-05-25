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
    title: 'Profitability Case Anatomy',
    lessons: [
      { id: 'D4.1.1', title: 'Recognizing a profitability prompt', description: 'Usually triggered by declining margins or a mandate to increase bottom-line growth. Requires rigorous mathematical decomposition before jumping to strategic solutions.' },
      { id: 'D4.1.2', title: 'Company-specific vs. industry-wide decline', description: 'Determining if the decline is isolated or industry-wide is a critical early diagnostic. Splits the case into internal operational issues versus external macro threats.' },
      { id: 'D4.1.3', title: 'Timeline and quantum of decline: critical clarifying questions', description: 'Establishing when the decline started isolates the trigger event. Sudden drops imply external shocks, while gradual declines suggest structural industry shifts.' },
      { id: 'D4.1.4', title: 'Standard opening framework structure', description: 'The universal opening is the Profit Tree branching into Volume × Price and Fixed + Variable Costs. Guarantees isolation of the specific mathematical driver.' },
    ],
  },
  {
    id: 'D4.2',
    title: 'Revenue-Side Analysis',
    lessons: [
      { id: 'D4.2.1', title: 'Disaggregating revenue: volume vs. price', description: 'Determines if the company is selling fewer units or charging less per unit. Dictates investigating market demand factors versus pricing strategy.' },
      { id: 'D4.2.2', title: 'Customer segment analysis', description: 'Segmenting customers reveals granular behavioral shifts that aggregate totals hide. Crucial when overall revenue is flat but core demographics decline.' },
      { id: 'D4.2.3', title: 'Product mix shifts and revenue per customer', description: 'Analyzing the product mix uncovers consumers substituting premium products for lower-margin alternatives. Crucial for understanding cannibalization.' },
      { id: 'D4.2.4', title: 'Channel and geography breakdowns', description: 'Revenue declines often concentrate in specific channels or regions. Isolating this focuses analysis on localized operational failures or regional competition.' },
      { id: 'D4.2.5', title: 'Demand-side root causes: awareness, accessibility, affordability, acceptability', description: 'The 4A framework systematically diagnoses why customers stop buying. Cleanly structures the qualitative investigation of a volume decline.' },
    ],
  },
  {
    id: 'D4.3',
    title: 'Cost-Side Analysis',
    lessons: [
      { id: 'D4.3.1', title: 'Value chain cost mapping: step by step', description: 'Mapping a product\'s physical journey uncovers hidden inefficiencies or vendor price hikes. The most reliable way to scrutinize sequential cost spikes.' },
      { id: 'D4.3.2', title: 'Fixed vs. variable cost disaggregation', description: 'Identifying which cost type has increased directs you toward capacity utilization issues versus raw material inflation. Crucial for understanding operating leverage.' },
      { id: 'D4.3.3', title: 'COGS, SG&A, operating cost, financing cost', description: 'Categorizing costs through a P&L format ensures you don\'t overlook non-operational drivers. Profit dips can be driven by financing costs, not just operations.' },
      { id: 'D4.3.4', title: 'Hidden cost leakages: packaging, logistics, maintenance', description: 'Extreme margin pressure is frequently traced to overlooked operational nuances. Candidates must scrutinize packaging dimensions, return rates, and machine downtime.' },
    ],
  },
  {
    id: 'D4.4',
    title: 'Profitability Case Practice Bank (26 Cases)',
    lessons: [],
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
