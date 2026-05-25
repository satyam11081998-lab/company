import type { Domain, Module, Lesson, CaseEntry, GuessEntry } from './types';

/* ================================================================
   DOMAINS D7 – D12  (Advanced / Specialized)
   Auto-generated from consulting_platform_architecture.md lines 670-1340
   ================================================================ */

// ─────────────────────────────────────────────
// D7 | CASE TYPE: PRICING STRATEGY
// ─────────────────────────────────────────────

const d7Modules: Module[] = [
  {
    id: 'D7.1',
    title: 'Pricing Strategy Foundations',
    lessons: [
      { id: 'D7.1.1', title: 'Three pricing approaches: Cost-Plus, Competitive, Value-Based' },
      { id: 'D7.1.2', title: 'Price elasticity and demand curves' },
      { id: 'D7.1.3', title: 'Price discrimination: 1st, 2nd, 3rd degree' },
      { id: 'D7.1.4', title: 'Penetration vs. premium pricing logic' },
    ],
  },
  {
    id: 'D7.2',
    title: 'Pricing Case Practice Bank (5 Cases)',
    lessons: [],
  },
];

const d7Cases: CaseEntry[] = [
  {
    code: 'PR-01',
    title: 'Golf Course (Delhi)',
    sector: 'Golf/Leisure',
    source: 'McKinsey',
    problem: 'Value-based (no competitor data; short coffee-meeting scenario)',
    approach: 'Value-based',
    keyInsight: 'Movie ticket = Rs 500 for 3hr engagement; add 50% premium for elite experience',
    result: 'Rs 750/session; on-demand model (not membership) to reduce hesitation',
  },
  {
    code: 'PR-02',
    title: 'Long-Lasting Paint',
    sector: 'Paints/Chemicals',
    source: 'Kearney',
    problem: 'Value-based; calculate savings from fewer repaint cycles',
    approach: 'Value-based',
    math: 'Normal cost over 9 yrs = Rs 450K; New paint once = (p×100)+100K = Rs 450K → p = Rs 3500/ltr',
    result: 'Rs 3500/liter (vs. Rs 500 for standard)',
  },
  {
    code: 'PR-03',
    title: 'On-Demand Truck Platform',
    sector: 'Logistics/Transport',
    source: 'BCG',
    problem: 'Cost-plus; cost categories: fuel, driver, tolls, depreciation, maintenance',
    approach: 'Cost-plus',
    hiddenCost: 'Driver stealing via inflated fuel bills → tie-up with petrol pumps',
    result: 'Fixed quarterly pricing; RFID tracking; route optimization penalties',
  },
  {
    code: 'PR-04',
    title: 'Hepatitis-B Drug (US)',
    sector: 'Pharma',
    source: 'McKinsey',
    problem: 'Value-based + competitive benchmarking',
    approach: 'Value-based + competitive benchmarking',
    keyInsight: 'Existing: Generic=$1000 (80%), Niche=$10,000 (20%)',
    valuePricing: '20% risk of liver transplant at $300,000 → value = $60,000',
    result: 'Price range = $61,000–$70,000; government spend = $5.875B at 50% adoption',
  },
  {
    code: 'PR-05',
    title: 'Helicopter Cab (India)',
    sector: 'Aviation/Transport',
    source: 'Kearney',
    problem: 'Value-based relative to taxi and train',
    approach: 'Value-based',
    keyInsight: 'Routes: Delhi–Indore; non-major flight routes; inter-city. Benchmarks: Train = Rs 1000; Flight = Rs 4500; Helicopter target = Rs 3000',
    result: 'Rs 3000 for mid-income; premium for corporates; avoid major flight routes',
  },
];

const d7: Domain = {
  code: 'D7',
  slug: 'pricing-strategy',
  title: 'Pricing Strategy',
  fullTitle: 'D7 | CASE TYPE: PRICING STRATEGY',
  level: 'Intermediate to Advanced',
  prereqs: 'D2, D3.1, D3.2',
  tags: ['pricing', 'strategy', 'value', 'competitive', 'cost-plus'],
  modules: d7Modules,
  cases: d7Cases,
};

// ─────────────────────────────────────────────
// D8 | CASE TYPE: OPERATIONS & EFFICIENCY
// ─────────────────────────────────────────────

const d8Modules: Module[] = [
  {
    id: 'D8.1',
    title: 'Operations Case Anatomy',
    lessons: [
      { id: 'D8.1.1', title: 'IPO (Input-Process-Output) model' },
      { id: 'D8.1.2', title: 'Value Stream Mapping' },
      { id: 'D8.1.3', title: 'Throughput, utilization, and bottleneck identification' },
      { id: 'D8.1.4', title: 'Man / Machine / Method / Material root cause drill' },
    ],
  },
  {
    id: 'D8.2',
    title: 'Operations Practice Cases',
    lessons: [
      {
        id: 'D8.2.1',
        title: 'Cross-reference: Profitability cases with operational root causes: P-04 Garbage Co., P-12 Fast Food Packaging, P-19 Power Plant Coal, P-22 Biscuit Warehouse, P-23 IT Firm Utilization',
      },
    ],
  },
  {
    id: 'D8.3',
    title: 'Standalone Operations Cases',
    lessons: [],
  },
];

const d8Cases: CaseEntry[] = [
  {
    code: 'O-01',
    title: 'Logistics Efficiency (Ministry of Road Transport)',
    sector: 'Government/Logistics',
    source: 'Kearney',
    problem: 'Reduce CO2 from road transport; improve logistics efficiency',
    framework: 'Road capacity → Road quality → Stoppage time → Distance → Permits',
    keyInsight: 'Toll booth: # booths × lanes × processing time (RFID, FASTag)',
    resolution: 'Freight corridors; route optimization; e-permit system; RFID',
  },
  {
    code: 'O-02',
    title: 'Mining Efficiency (South Africa)',
    sector: 'Mining',
    source: 'BCG',
    problem: '13 hours to produce X units vs. 12 hours historically',
    rootCause: 'Lunch break extended from 1hr to 1hr 40min; TV + AC installed',
    framework: 'Man → Lunch → Entertainment/Comfort factor',
    resolution: 'Incentive-based program; productivity challenge; flexible hours',
  },
  {
    code: 'O-03',
    title: 'Low Cost Airline Turnaround',
    sector: 'Aviation',
    source: 'McKinsey',
    problem: 'Turnaround time increased from 30 to 45 minutes at Mumbai airport',
    rootCause: 'New boarding gate moved closer to runway (saved 5 min) BUT fueling trucks now travel 1km extra at 3km/hr = +20 min',
    keyInsight: 'Net impact: +15 minutes total',
    resolution: 'Move fueling tanks; route optimization for ground vehicles',
  },
];

const d8: Domain = {
  code: 'D8',
  slug: 'operations-efficiency',
  title: 'Operations & Efficiency',
  fullTitle: 'D8 | CASE TYPE: OPERATIONS & EFFICIENCY',
  level: 'Intermediate to Advanced',
  prereqs: 'D3.5',
  tags: ['operations', 'supply-chain', 'efficiency', 'bottleneck', 'process'],
  modules: d8Modules,
  cases: d8Cases,
};

// ─────────────────────────────────────────────
// D9 | CASE TYPE: M&A & DUE DILIGENCE
// ─────────────────────────────────────────────

const d9Modules: Module[] = [
  {
    id: 'D9.1',
    title: 'M&A Framework',
    lessons: [
      { id: 'D9.1.1', title: 'Strategic rationale: why merge or acquire?' },
      { id: 'D9.1.2', title: 'Hard fit: financial analysis, valuation, synergies' },
      { id: 'D9.1.3', title: 'Soft fit: cultural alignment, management quality' },
      { id: 'D9.1.4', title: 'Due diligence: commercial, operational, legal, financial' },
      { id: 'D9.1.5', title: 'Deal structure: equity, debt, earn-out' },
      { id: 'D9.1.6', title: 'Exit strategies: IPO, secondary sale, strategic acquisition' },
    ],
  },
  {
    id: 'D9.2',
    title: 'Valuation Fundamentals',
    lessons: [
      { id: 'D9.2.1', title: 'Book value, market capitalization, enterprise value' },
      { id: 'D9.2.2', title: 'DCF (Discounted Cash Flow) and NPV' },
      { id: 'D9.2.3', title: 'EV/EBITDA multiples and P/E ratios' },
      { id: 'D9.2.4', title: 'Tata Motors worked example (from FY2023-24 annual report)' },
    ],
  },
  {
    id: 'D9.3',
    title: 'M&A Practice Cases',
    lessons: [],
  },
  {
    id: 'D9.4',
    title: 'Due Diligence Cases',
    lessons: [],
  },
];

const d9Cases: CaseEntry[] = [
  {
    code: 'MA-01',
    title: 'Airline Acquisition',
    sector: 'Aviation',
    source: 'McKinsey',
    problem: 'Which airline should a dominant carrier acquire to grow revenue?',
    framework: 'Market share overlap matrix vs. revenue of each player',
    keyInsight: 'Revenue vs. Overlap plot → choose lowest overlap + highest revenue',
    resolution: 'Acquire Competitor B (east/central operations; low overlap)',
  },
  {
    code: 'MA-02',
    title: 'PE Cosmetic Chain (Australia)',
    sector: 'PE/Beauty',
    source: 'BCG',
    problem: 'Should PE firm invest in chain of cosmetic stores?',
    math: '1.2M target women × 10% interested × 60% = 72K customers. Revenue Math: 36K (50% share) × $1000 × 30% margin = $11M profit',
    risks: 'Cannibalization of Korean Botox drug; price perception; competitive entry',
    resolution: 'Buy; diversify into laser hair removal; explore drug launch globally',
  },
  {
    code: 'MA-03',
    title: 'Metro Investment (Dubai)',
    sector: 'Infrastructure PE',
    source: 'Independent',
    problem: 'Should US PE firm bid on Dubai metro (airport to city)?',
    math: '576 flights/day × 300 seats × 90% occ → 140K pax/day → 26K metro users/day. Deal Analysis: 5yr deal → ticket = $26; 20yr deal → ticket = $10 (vs. taxi $20)',
    resolution: '20-year deal is better; steeper discount vs. taxi drives higher adoption',
  },
  {
    code: 'DD-01',
    title: 'Coffee Shop (Delhi)',
    sector: 'F&B/Retail',
    source: 'BCG',
    problem: 'Should you buy a friend\'s coffee shop for Rs 10L?',
    math: 'Revenue: Rs 36,400/week; Cost: Rs 30,970/week; PBT: Rs 2,928/week',
    breakEven: 'Rs 10L / Rs 2,928 = 341 weeks = 6.5 years',
    keyInsight: 'Long payback + COVID risk + new competition → risky buy',
    resolution: 'Home delivery; loyalty; extended product range to reduce payback',
  },
  {
    code: 'DD-02',
    title: 'Fantasy Sports App',
    sector: 'VC/Technology',
    source: 'Kearney',
    problem: 'Should VC invest in fantasy sports app?',
    analysis: 'Industry growth (12Cr users), regulatory risk (gambling question), portfolio fit',
    keyInsight: 'Profit Levers: Free-to-paid conversion; viral features; loyalty rewards; chatbot support',
    resolution: 'Invest; manage regulatory risk; top 3 recs: promotions, conversion, costs',
  },
];

const d9: Domain = {
  code: 'D9',
  slug: 'mergers-acquisitions',
  title: 'M&A & Due Diligence',
  fullTitle: 'D9 | CASE TYPE: M&A & DUE DILIGENCE',
  level: 'Advanced',
  prereqs: 'D2, D3, D15',
  tags: ['mergers', 'acquisitions', 'due-diligence', 'PE', 'valuation'],
  modules: d9Modules,
  cases: d9Cases,
};

// ─────────────────────────────────────────────
// D10 | CASE TYPE: UNCONVENTIONAL & SOCIAL IMPACT
// ─────────────────────────────────────────────

const d10Modules: Module[] = [
  {
    id: 'D10.1',
    title: 'Unconventional Case Anatomy',
    lessons: [
      { id: 'D10.1.1', title: 'What makes a case "unconventional"' },
      { id: 'D10.1.2', title: 'Social impact vs. profit: different success metrics' },
      { id: 'D10.1.3', title: 'Government/policy cases: stakeholder complexity' },
    ],
  },
  {
    id: 'D10.2',
    title: 'Unconventional Practice Cases',
    lessons: [],
  },
];

const d10Cases: CaseEntry[] = [
  {
    code: 'U-01',
    title: 'Land Utilization (North Delhi)',
    sector: 'Real Estate',
    source: 'EYP',
    problem: 'What to do with FMS-sized land in North Delhi campus area?',
    framework: 'Monetize (Sell/Rent/Develop) vs. Non-monetize (Parks, CSR, Incubators)',
    resolution: 'Hybrid residential + commercial rental; start with website + phased rollout',
  },
  {
    code: 'U-02',
    title: 'Chatbot Development (Myntra proxy)',
    sector: 'E-commerce/Tech',
    source: 'Accenture Strategy',
    problem: 'Launch an AI chatbot for shopping experience',
    framework: 'Development → Testing → Launch → Communication',
    features: 'AR try-on; behavior-based recommendations; demographic tone adjustment',
    resolution: 'Build customer DB first; AR app; e-commerce integration from store inventory',
  },
  {
    code: 'U-03',
    title: 'IT Transformation (Home Decor)',
    sector: 'Technology',
    source: 'Accenture Strategy',
    problem: 'Digital transformation for offline-only home decor company',
    framework: 'Business Model → Channels → Operations → Execution',
    resolution: 'Own website first; mobile app; phased launch; promote on social media',
  },
  {
    code: 'U-04',
    title: 'Manufacturing Efficiency (South Africa)',
    sector: 'Mining',
    source: 'BCG',
    problem: '[See D8 - O-02 above for full case details]',
    resolution: 'See D8 O-02',
  },
  {
    code: 'U-05',
    title: 'B-School Time Management',
    sector: 'Education',
    source: 'McKinsey',
    problem: 'How should an FMS student best use their 2 years?',
    framework: 'Goals (Personal/Professional) × What B-school Offers (Academic/Placements/ECA/Networking)',
    resolution: 'Matrix of goals vs. offerings; prioritize by overlap',
  },
  {
    code: 'U-06',
    title: 'CO2 Emissions (India Road Transport)',
    sector: 'Government/Sustainability',
    source: 'Kearney',
    problem: 'Reduce CO2 emissions from India road transport',
    framework: 'Vehicular (passenger + freight) + Construction activities',
    keyInsight: 'Levers: Vehicle improvements; alternative fuels; traffic management; toll optimization',
    resolution: 'Multi-pronged policy; RFID tolls; EV transition incentives; sustainable road construction',
  },
  {
    code: 'U-07',
    title: 'Unborn Baby (India vs. US)',
    sector: 'Life Decision',
    source: 'Kearney',
    problem: 'Where should an unborn baby be born — India or US?',
    framework: 'Healthcare × Education × Economic × Cultural × Family (weighted scoring)',
    math: 'Primary (weight 2) vs. Secondary (weight 1) → weighted average scoring',
    resolution: 'India wins (3.6 vs. 3.3); proximity to family and cultural heritage',
  },
  {
    code: 'U-08',
    title: 'Green Airline Launch',
    sector: 'Aviation/Sustainability',
    source: 'Bain & Co.',
    problem: 'How to make an airline genuinely "green"',
    framework: 'Value chain audit → Sourcing → Pre-flight → In-flight → Outbound → Corporate offices',
    keyInsight: 'Key Metrics: CO2 per passenger per km; fuel/passenger ratio',
    resolution: 'Biodiesel mix; e-boarding; electric ground vehicles; aerobridges; ESG reporting',
  },
  {
    code: 'U-09',
    title: 'Client Stranded on Galapagos Island',
    sector: 'Creative',
    source: 'McKinsey',
    problem: 'Client stranded on Galapagos Island — what to do?',
    framework: 'Survival (60%) → Food/Water/Shelter/Fire; Escape (40%) → Internal/External',
    keyInsight: 'Structured thinking applied to non-business extreme scenario',
    resolution: 'Fire sticks + notebook for signaling; search for boats; build shelter',
  },
  {
    code: 'U-10',
    title: 'Increase in Road Accidents (UPSRTC)',
    sector: 'Government/Transport',
    source: 'McKinsey',
    problem: '30% increase in road accidents at state transport corp',
    rootCause: 'No speed governors on old buses; 13m vs 11m buses untrained drivers; intrastate load factor 125%; no signs on new roads',
    resolution: 'Speed limiters retrofit; annual training program; route optimization; intrastate load monitoring',
  },
  {
    code: 'U-11',
    title: 'Swedish Government (Left to Right driving)',
    sector: 'Policy',
    source: 'McKinsey',
    problem: 'Switch Sweden from left-hand to right-hand driving',
    framework: 'Infrastructure change + Systems/Processes + People (Awareness/Acceptance/Training)',
    risks: 'Political opposition; elderly driver retraining; first-time attempt',
    resolution: 'Phased 2-year rollout; mass media; learn from European precedents',
  },
  {
    code: 'U-12',
    title: 'Money Heist (Shop Selection)',
    sector: 'Creative/Logic',
    source: 'McKinsey',
    problem: 'Which shop to rob? (Logic puzzle)',
    framework: 'Cash assessment × Security × Police Presence → weighted decision',
    math: 'Cash Math: Chai=4500/day, Gift Shop=7500/day, Furniture=24000/day',
    resolution: 'Solo → Chai shop (safest); with tech-partner → Furniture store',
  },
  {
    code: 'U-13',
    title: 'Organizing Event (Coldplay Mumbai)',
    sector: 'Events/Pricing',
    source: 'BCG',
    problem: 'Organize and price a Coldplay concert in Mumbai',
    math: 'Revenue = Audience × Ticket Price; Costs = Production + Artists (Rs 5Cr) + Logistics. Audience Math: Mumbai 20–35 age × middle/upper → 78,125 people. Ticket Pricing: Value-based; break-even = Rs 531; 10x premium for Coldplay = Rs 3,000',
    resolution: 'Rs 3,000 ticket; Rs 3Cr sponsorships to offset; total profit = significant',
  },
  {
    code: 'U-14',
    title: 'Footfall of Church',
    sector: 'Nonprofit/Social',
    source: 'Bain & Co.',
    problem: 'Church attendance declining 20-30% over 1 month',
    rootCause: 'Confessional issue (clergyman trust); worn benches causing discomfort',
    resolution: 'Internal investigation; sensitization program; replace benches with durable material',
  },
  {
    code: 'U-15',
    title: 'Low Cost Airline Turnaround',
    sector: 'Aviation',
    source: 'McKinsey',
    problem: '[See D8 - O-03]',
    resolution: 'See D8 O-03',
  },
];

const d10: Domain = {
  code: 'D10',
  slug: 'unconventional-social-impact',
  title: 'Unconventional & Social Impact',
  fullTitle: 'D10 | CASE TYPE: UNCONVENTIONAL & SOCIAL IMPACT',
  level: 'Intermediate to Advanced',
  prereqs: 'D2, D3',
  tags: ['unconventional', 'social-impact', 'creative', 'government', 'nonprofit'],
  modules: d10Modules,
  cases: d10Cases,
};

// ─────────────────────────────────────────────
// D11 | GUESSTIMATES & MARKET SIZING
// ─────────────────────────────────────────────

const d11Modules: Module[] = [
  {
    id: 'D11.1',
    title: 'Guesstimate Fundamentals',
    lessons: [
      { id: 'D11.1.1', title: 'What are guesstimates and why they matter' },
      { id: 'D11.1.2', title: 'The 5-step approach: Clarify → Strategy → Segment → Estimate → Validate' },
      { id: 'D11.1.3', title: 'Top-Down vs. Bottom-Up approach' },
      { id: 'D11.1.4', title: 'Supply-Side vs. Demand-Side approach' },
      { id: 'D11.1.5', title: 'TAM-SAM-SOM framework for market sizing' },
    ],
  },
  {
    id: 'D11.2',
    title: 'Key Techniques and Tricks',
    lessons: [
      { id: 'D11.2.1', title: 'Geometric mean vs. arithmetic mean for estimation' },
      { id: 'D11.2.2', title: 'Proxy variables: "This for That" technique' },
      { id: 'D11.2.3', title: 'Fractions trick: % of time = % of population at any moment' },
      { id: 'D11.2.4', title: 'Simplicity: round numbers, work with percentages' },
    ],
  },
  {
    id: 'D11.3',
    title: 'India Demographics Cheat Sheet',
    lessons: [
      { id: 'D11.3.1', title: 'Population anchors: India (140Cr), Delhi (3.3Cr), Mumbai (2.1Cr)' },
      { id: 'D11.3.2', title: 'Urban/Rural split: 30/70 (India), 40/60 (general)' },
      { id: 'D11.3.3', title: 'Age distribution: 0-14(26%), 15-24(18%), 25-34(17%), 35+(39%)' },
      { id: 'D11.3.4', title: 'Income segments: Destitute/Aspirer/Middle/Elite' },
      { id: 'D11.3.5', title: 'Household size: Urban=4, Rural=5, USA=2.5' },
      { id: 'D11.3.6', title: 'Internet penetration: 50% | Smartphone: 70%' },
      { id: 'D11.3.7', title: 'Literacy: 80% national, 90%+ Tier-1 cities' },
    ],
  },
  {
    id: 'D11.4',
    title: 'Guesstimate Cheat Sheet (Key Stats)',
    lessons: [
      { id: 'D11.4.1', title: 'Birth rate: 16/1000 | Death rate: 7/1000' },
      { id: 'D11.4.2', title: 'Vehicle ownership: 185 two-wheelers + 34 four-wheelers per 1000 people' },
      { id: 'D11.4.3', title: 'Global population: 8B | USA: 330M | UK: 68M' },
      { id: 'D11.4.4', title: 'GDP India: ~$3.4 Trillion | Growth rate: ~7%' },
      { id: 'D11.4.5', title: 'Sector split: Agriculture 20%, Industry 26%, Services 54%' },
      { id: 'D11.4.6', title: 'Gender split: 48% female, 52% male' },
      { id: 'D11.4.7', title: 'Religion: Hindu 80%, Muslim 13%, Others 7%' },
    ],
  },
  {
    id: 'D11.5',
    title: 'Guesstimate Practice Bank (60+ Cases)',
    lessons: [],
  },
];

const d11Guesstimates: GuessEntry[] = [
  // --- MARKET SIZING (PRODUCTS & SERVICES) ---
  {
    code: 'G-01',
    title: 'Market size of healthy biscuit industry (India)',
    approach: 'Demand-side | Population → Urban → 40+ age → income filter',
    keyDetail: 'Rs 25/biscuit; 180 biscuits/year for target segment',
    result: 'Rs 231 Billion market',
  },
  {
    code: 'G-02',
    title: 'Number of Ola/Uber cabs in Delhi NCR',
    approach: 'Demand-side | Income → vehicle penetration → cab preference',
    result: '71,800 cabs running daily',
  },
  {
    code: 'G-03',
    title: 'Number of flights taking off from Delhi in a week',
    approach: 'Supply-side | Terminal × runways × capacity × hours',
    result: '5,880 take-offs per week',
  },
  {
    code: 'G-04',
    title: 'Cups of tea consumed in Delhi daily',
    approach: 'Demand-side | Age-wise consumption habits',
    result: '6.33 Crore cups/day',
  },
  {
    code: 'G-05',
    title: 'Size of chewing gum market (India)',
    approach: 'Demand-side | Age × income × frequency × price',
    result: '~Rs 8,000 Crore/year',
  },
  {
    code: 'G-06',
    title: 'Number of ATMs in Delhi',
    approach: 'Demand-side | Household → income → ATM cards → ATM per cards',
    result: '~4,200 ATMs',
  },
  {
    code: 'G-07',
    title: 'Noodle packets at a college campus monthly',
    approach: 'Demand-side | Student + faculty segmentation by frequency',
    result: '~65,000 packets/month',
  },
  {
    code: 'G-08',
    title: 'Hotel mini-shampoo bottles sold globally per year',
    approach: 'Supply-side | Global cities × hotels × occupancy × room type',
    result: '~30 Crore bottles/year',
  },
  {
    code: 'G-09',
    title: 'Mazda dealers in USA',
    approach: 'Demand-side | Cars owned × Mazda share → sales/year → dealers needed',
    result: '~550 dealers',
  },
  {
    code: 'G-10',
    title: 'Change on floor of an average mall (per day)',
    approach: 'Supply-side | Footfall × cash payers × coin-dropper rate × avg coin',
    result: 'Rs 750/day',
  },
  {
    code: 'G-11',
    title: 'Words in an average daily newspaper',
    approach: 'Supply-side | Page dimensions → usable area → word density',
    result: '~50,000 words',
  },
  {
    code: 'G-12',
    title: 'Number of aeroplanes flying in India right now',
    approach: 'Supply-side | Airports × runways × capacity × avg flight duration',
    result: '~400 flights in the air at any moment',
  },
  {
    code: 'G-13',
    title: 'Estimating revenue of a salon (India)',
    approach: 'Supply-side | Chairs × occupancy × avg ticket × hours',
    result: 'Rs 3.55 Crore/year',
  },
  {
    code: 'G-14',
    title: 'Market size of fantasy sports (India)',
    approach: 'Demand-side | Male → 18-25 age → mobile → internet → sports → users',
    result: '22.4 Million users',
  },
  {
    code: 'G-15',
    title: 'Swiggy orders in Delhi daily',
    approach: 'Demand-side | Delhi income → smartphone → internet → adoption → Swiggy share',
    result: '24.83 Lakh orders/day',
  },
  {
    code: 'G-16',
    title: 'Delhi-Gurgaon toll plaza daily revenue',
    approach: 'Supply-side | Booths × hours × vehicle type × fare',
    result: 'Rs 28.45 Lakh/day',
  },
  {
    code: 'G-17',
    title: 'Credit cards in India',
    approach: 'Demand-side | Income → employment → willingness → cards per person',
    result: '160 Million credit cards',
  },
  {
    code: 'G-18',
    title: 'Paint required to paint a car',
    approach: 'Surface area calculation | Two cuboids (lower body + upper body)',
    result: '~20 gallons (207 litres with 3 coats)',
  },
  {
    code: 'G-19',
    title: 'Bollywood movies released annually',
    approach: 'Supply-side | Fridays × budget tiers × national holiday releases',
    result: '~340 films/year',
  },
  {
    code: 'G-20',
    title: 'Tyre market size in India',
    approach: 'Demand-side | Rural/urban households → 4-wheeler penetration → tyres',
    result: 'Rs 413 Billion revenue',
  },
  {
    code: 'G-21',
    title: 'Outstanding education loans in India',
    approach: 'Demand-side | 18-25 population → income → institution type → loan-taking',
    result: '~46.76 Million loans',
  },
  {
    code: 'G-22',
    title: 'Revenue of a dentist in Delhi per day',
    approach: 'Supply-side | Operating hours → patients → procedure complexity → fee',
    result: 'Rs 10,993/day',
  },
  {
    code: 'G-23',
    title: 'Annual revenue of a laundry service in Delhi',
    approach: 'Supply-side | Revenue streams × items per day × price × operating hours',
    result: 'Rs 3.37 Lakh/year',
  },
  {
    code: 'G-24',
    title: 'Weekly revenue from food court stalls in a Delhi mall',
    approach: 'Supply-side | 30 restaurants × footfall × occupancy × avg order value',
    result: 'Rs 1.56 Lakh/week',
  },
  {
    code: 'G-25',
    title: 'Books read by an Indian in a lifetime',
    approach: 'Demand-side | Age groups × frequency × literacy rate',
    result: '~127 books over lifetime',
  },
  {
    code: 'G-26',
    title: 'Weekly commute time for office-goers in Delhi',
    approach: 'Demand-side | Workforce segments × commute distance × frequency × WFO days',
    result: '~4.97 Crore hours/week',
  },
  {
    code: 'G-27',
    title: 'Lok Sabha 2024 election expenditure',
    approach: 'Projection | Historical growth + voter base growth + adjustments',
    result: '~Rs 12,180 Crore',
  },
  {
    code: 'G-28',
    title: 'Market size for Alco-beverages in Mumbai',
    approach: 'Demand-side | Urban → slum exclusion → age → income → interest',
    result: '2.5 Million potential consumers',
  },
  {
    code: 'G-29',
    title: 'Red cars in Delhi',
    approach: 'Demand-side | Households → car ownership → red color share (15%)',
    result: '~4.33 Lakh red cars',
  },
  {
    code: 'G-30',
    title: 'Chairs in Delhi households',
    approach: 'Demand-side | Population → households → income → chairs per household',
    result: '28.4 Million chairs',
  },
  {
    code: 'G-31',
    title: 'SRCC students traveling by metro daily',
    approach: 'Demand-side | Students → income → non-hostel → metro preference',
    result: '~504 students/day',
  },
  {
    code: 'G-32',
    title: 'Wine bottles sold in India annually',
    approach: 'Demand-side | Drinkers × wine preference × consumption × non-bottle adjustment',
    result: '3.13 Billion bottles/year',
  },
  {
    code: 'G-33',
    title: 'India Gate daily visitors',
    approach: 'Demand-side | Delhi population + tourists → leisure propensity → India Gate share',
    result: '~1.16 Lakh visitors/day',
  },
  {
    code: 'G-34',
    title: 'North Campus DU students using metro',
    approach: 'Demand-side | 10 colleges × 5000 students → day scholars → income → metro preference',
    result: '10,540 students/day',
  },
  {
    code: 'G-35',
    title: 'Flights at Delhi airport in a day',
    approach: 'Supply-side | 3 terminals × 2 runways × peak/non-peak pattern',
    result: '~576 flights landing/day',
  },
  {
    code: 'G-36',
    title: 'Monthly revenue of Sarvana Bhavana',
    approach: 'Supply-side | Seating × occupancy × weekday/weekend × avg ticket',
    result: 'Rs 58.14 Lakh/month',
  },
  {
    code: 'G-37',
    title: 'Quick commerce market size in India',
    approach: 'Demand-side | Urban → metro/tier1 → age groups → adoption',
    result: '111.2 Million users',
  },
  {
    code: 'G-38',
    title: 'Advertising market on digital platforms (India)',
    approach: 'Supply-side | Internet users × platforms × ads per hour × time spent × CPM',
    result: 'Rs 25,225 Billion+ market',
  },
  {
    code: 'G-39',
    title: 'Animation/VFX market size (India)',
    approach: 'Demand-side | Urban/rural × age groups × content type consumption',
    result: '4.18 Billion consumers across categories',
  },
  {
    code: 'G-40',
    title: 'Paint required to paint an Airbus',
    approach: 'Surface area | Cylindrical body + wings/tail; layered coating',
    result: '~207 litres (3 layers)',
  },
  {
    code: 'G-41',
    title: 'Milk required by a Connaught Place coffee shop daily',
    approach: 'Supply-side | Hourly coffees × coffee type × milk per cup × weighted average',
    result: '9.56 litres/day',
  },
  {
    code: 'G-42',
    title: 'Pens bought in India daily',
    approach: 'Demand-side | Population → age groups → active buyers → frequency',
    result: '6.44 Crore pens/day',
  },
  {
    code: 'G-43',
    title: 'Spotify Premium subscribers in India',
    approach: 'Demand-side | Internet users → age → music listeners → Spotify → premium',
    result: '~20 Million premium subscribers',
  },
  {
    code: 'G-44',
    title: 'Monthly electricity consumption (urban India)',
    approach: 'Demand-side | Households → income → monthly units consumed',
    result: '116,550 Million units/month',
  },
  {
    code: 'G-45',
    title: 'Umbrellas sold in Mumbai annually',
    approach: 'Demand-side | Households → income → umbrellas owned → useful life',
    result: '~22.29 Lakh umbrellas/year',
  },
  {
    code: 'G-46',
    title: 'Smart Watch market size (India)',
    approach: 'Demand-side | Urban/rural → income → age → penetration rate',
    result: 'Rs 10,000 Crore market',
  },
  {
    code: 'G-47',
    title: 'Smokers in India',
    approach: 'Demand-side | Age × locality × income × gender × smoking probability',
    result: '~68.35 Million smokers',
  },
  {
    code: 'G-48',
    title: 'Cheese Burst Pizzas sold by Domino\'s daily (India)',
    approach: 'Supply-side | Delhi outlets × capacity × occupancy × 40% cheese burst share',
    result: '~34,160 cheese burst pizzas/day nationally',
  },
  {
    code: 'G-49',
    title: 'Petrol pumps in Delhi (Approach 1: Area-based)',
    approach: 'Supply-side | Area per zone → density classification',
    result: '~221 petrol pumps',
  },
  {
    code: 'G-50',
    title: 'Petrol pumps in India (Approach 2: Demand-based)',
    approach: 'Demand-side | Total vehicles → daily consumption → pump capacity',
    result: '~51,500 pumps',
  },
  {
    code: 'G-51',
    title: 'Petrol pumps in India (Approach 3: Household-based)',
    approach: 'Demand-side | Households → vehicles → refueling frequency → pump serving capacity',
    result: '~30,000 petrol stations = 120,000 pumps',
  },
  {
    code: 'G-52',
    title: 'Amazon India daily orders',
    approach: 'Demand-side | Mobile internet × location × income → frequency × Amazon share',
    result: '~10 Lakh orders/day (35% of 30 Lakh e-commerce orders)',
  },
  {
    code: 'G-53',
    title: 'Daily revenue of an airport',
    approach: 'Supply-side | Airlines + Shops + Parking + Advertisements',
    result: '~Rs 61.5 Lakh/day',
  },
  {
    code: 'G-54',
    title: 'Automobile tyre market size (2020)',
    approach: 'Demand-side | Rural/urban households → 4-wheeler ownership → tyres per vehicle',
    result: '~155 Million total tyres (50M new + 105M replacement)',
  },
  {
    code: 'G-55',
    title: 'Wine bottles consumed in India weekly',
    approach: 'Demand-side | Alcohol drinkers → wine preference → glasses per week → bottles',
    result: '~1.3 Million bottles/week',
  },
  {
    code: 'G-56',
    title: 'Bisleri 1L bottle user base (Delhi)',
    approach: 'Demand-side | Tourists + restaurants as segments',
    result: '5.1M tourist users + 7,650 restaurants',
  },
  {
    code: 'G-57',
    title: 'Sanitizer demand in Delhi monthly',
    approach: 'Demand-side | Income segments → penetration → usage per household',
    result: '2.51 Crore litres/month',
  },
  {
    code: 'G-58',
    title: 'BCom(H) admissions in DU annually',
    approach: 'Supply-side | 56 colleges → tier split → seats per tier → fill rate',
    result: '~12,720 students admitted',
  },
  {
    code: 'G-59',
    title: 'Credit cards issued in Delhi per year',
    approach: 'Demand-side | Households → income → penetration → replacement rate',
    result: '~687,500 cards/year',
  },
  {
    code: 'G-60',
    title: 'Dream11 first-year revenue (2018 India)',
    approach: 'Demand-side | Population → cricket fans → fantasy users × frequency × fee',
    result: 'Rs 8,090 Crore potential market; Dream11 capture = portion',
  },
  {
    code: 'G-61',
    title: 'Daily distance travelled by Zepto drivers in Delhi',
    approach: 'Demand-side | Households → quick commerce users → orders → Zepto share × distance',
    result: '0.45 Lakh km/day by Zepto fleet',
  },
  {
    code: 'G-62',
    title: 'Mutual fund market size in India',
    approach: 'Demand-side | Households → income → savings % → portfolio allocation to equities',
    result: 'Rs 64.5 Trillion AUM potential',
  },
  {
    code: 'G-63',
    title: 'Car tyres in Delhi',
    approach: 'Demand-side | Income → household car ownership → private + commercial tyres',
    result: '~(derived from car count × 5 tyres each)',
  },
  {
    code: 'G-64',
    title: 'ATM withdrawals in Tier-2 city monthly',
    approach: 'Demand-side | Population → age → banked → ATM users → frequency',
    result: '16.6 Lakh withdrawals/month',
  },
  {
    code: 'G-65',
    title: 'Dog food consumed in India',
    approach: 'Demand-side | Income → dog ownership → dog size distribution → food per dog',
    result: '120 Crore kg of dog food',
  },
  {
    code: 'G-66',
    title: 'Daily milk production in Odisha',
    approach: 'Supply-side | Rural → farming families → cattle ownership → lactating cows × yield',
    result: '65.52 Lakh litres/day',
  },
  {
    code: 'G-67',
    title: 'Hotel rooms booked in Goa (peak season)',
    approach: 'Demand-side | 8M tourists × 40% peak → income → stay duration → sharing',
    result: '6.3 Million room nights during peak season',
  },
  {
    code: 'G-68',
    title: 'Slow-moving vehicles in an airport',
    approach: 'Supply-side | Passengers + Baggage + Cargo + Miscellaneous',
    result: '~233 total slow-moving vehicles (with 10% maintenance buffer)',
  },
  {
    code: 'G-69',
    title: 'LED bulbs sold in Kerala',
    approach: 'Demand-side | Households → rooms per tier + commercial establishments → replacement rate + new sales',
    result: '~43.85 Million bulbs sold annually',
  },
];

const d11: Domain = {
  code: 'D11',
  slug: 'guesstimates-market-sizing',
  title: 'Guesstimates & Market Sizing',
  fullTitle: 'D11 | GUESSTIMATES & MARKET SIZING',
  level: 'Beginner to Advanced (tiered)',
  prereqs: 'D3.4 (MECE), basic math',
  tags: ['guesstimate', 'market-sizing', 'estimation', 'quantitative'],
  modules: d11Modules,
  guesstimates: d11Guesstimates,
  quizOpportunities: 'Approach identification quiz (demand vs. supply); estimate matching; math drill',
  flashcardOpportunities: 'Key demographic numbers; city populations; benchmark stats',
};

// ─────────────────────────────────────────────
// D12 | BEHAVIORAL / HR PREPARATION
// ─────────────────────────────────────────────

const d12Modules: Module[] = [
  {
    id: 'D12.1',
    title: 'Behavioral Interview Fundamentals',
    lessons: [
      { id: 'D12.1.1', title: 'Why firms run behavioral interviews' },
      { id: 'D12.1.2', title: 'What they are actually evaluating (leadership, growth, values)' },
      { id: 'D12.1.3', title: 'The Fit Interview: your story, their values, your future' },
    ],
  },
  {
    id: 'D12.2',
    title: 'Structured Answer Frameworks',
    lessons: [
      { id: 'D12.2.1', title: 'STAR-L: Situation, Task, Action, Result, Learning' },
      { id: 'D12.2.2', title: 'PARADE: Problem, Anticipated Consequence, Role, Action, Decision-Making, Valuable Result' },
      { id: 'D12.2.3', title: 'COIN: Context, Observation, Impact, Next Steps' },
      { id: 'D12.2.4', title: 'Rule of Three: always have three supporting examples' },
    ],
  },
  {
    id: 'D12.3',
    title: 'Question Bank by Category',
    lessons: [],
  },
  {
    id: 'D12.4',
    title: 'Asking Questions to the Interviewer',
    lessons: [
      { id: 'D12.4.1', title: 'Questions about the role and expectations' },
      { id: 'D12.4.2', title: 'Questions about team culture and dynamics' },
      { id: 'D12.4.3', title: 'Questions about growth trajectory' },
      { id: 'D12.4.4', title: 'Questions that show research on the firm' },
    ],
  },
  {
    id: 'D12.5',
    title: 'Non-Verbal Communication in HR Interviews',
    lessons: [
      { id: 'D12.5.1', title: '[See D2.8]' },
    ],
  },
  {
    id: 'D12.6',
    title: 'Amazon Leadership Principles (Special Module)',
    lessons: [
      { id: 'D12.6.1', title: 'Key mapping: one strong STAR story per principle' },
      { id: 'D12.6.2', title: 'Most-tested: Invent & Simplify; Bias for Action; Dive Deep' },
    ],
  },
];

const d12QuestionBank: { category: string; questions: string[] }[] = [
  {
    category: 'Behavioral Questions',
    questions: [
      'Tell me about a time you overcame a significant challenge',
      'Describe a time you worked under pressure to meet a deadline',
      'Give an example of managing multiple competing priorities',
      'Tell me about a mistake you made and how you handled it',
      'Describe a conflict within a team and how you resolved it',
      'Tell me about a time you showed leadership',
      'Share an example of receiving critical feedback and responding to it',
      'Tell me about going above and beyond what was expected',
    ],
  },
  {
    category: 'Motivational Questions',
    questions: [
      'Why MBA? Why consulting?',
      'Why this specific firm?',
      'What are your short-term and long-term career goals?',
      'Why this role is right for you?',
      'What drives you when facing tough situations?',
    ],
  },
  {
    category: 'Strengths & Weaknesses',
    questions: [
      'What is your greatest strength? (map to role requirements)',
      'What is your biggest weakness? (with active improvement)',
      'How has your MBA shaped you?',
    ],
  },
  {
    category: 'Situational Questions',
    questions: [
      'How would you handle a team not meeting deadlines?',
      'How do you manage projects with tight deadlines and limited resources?',
      'How would you handle conflict between two team members?',
      'What if you disagree with your manager\'s strategy?',
    ],
  },
  {
    category: 'Leadership Questions',
    questions: [
      'Describe leading a team through a challenging situation',
      'How do you motivate a team during difficult times?',
      'How do you delegate effectively?',
      'How has your leadership style evolved?',
    ],
  },
  {
    category: 'Abstract / Philosophical',
    questions: [
      'If you could change one thing about the world?',
      'How do you define leadership?',
      'Do you believe people can truly change?',
    ],
  },
];

const d12AmazonLPs: string[] = [
  'Customer Obsession',
  'Ownership',
  'Invent and Simplify',
  'Are Right, A Lot',
  'Learn and Be Curious',
  'Hire and Develop the Best',
  'Insist on Highest Standards',
  'Think Big',
  'Bias for Action',
  'Frugality',
  'Earn Trust',
  'Dive Deep',
  'Have Backbone/Disagree and Commit',
  'Deliver Results',
  'Strive to Be Earth\'s Best Employer',
];

const d12: Domain = {
  code: 'D12',
  slug: 'behavioral-hr-preparation',
  title: 'Behavioral / HR Preparation',
  fullTitle: 'D12 | BEHAVIORAL / HR PREPARATION',
  level: 'Intermediate',
  prereqs: 'D1',
  tags: ['behavioral', 'HR', 'STAR', 'self-presentation', 'fit'],
  modules: d12Modules,
  questionBank: d12QuestionBank,
  amazonLPs: d12AmazonLPs,
  quizOpportunities: 'Identify the best framework per question type; score a sample answer',
  flashcardOpportunities: '16 Amazon LPs; question archetypes; framework triggers',
};

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

export const DOMAINS_ADVANCED: Domain[] = [d7, d8, d9, d10, d11, d12];
