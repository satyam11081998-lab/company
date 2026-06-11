import type { NavNode } from './types';

export const CASEBOOK_TREE: NavNode[] = [
  {
    title: 'A · Getting Started',
    kind: 'section',
    icon: 'Compass',
    defaultOpen: true,
    children: [
      { title: 'What a case interview tests', kind: 'page', slug: 'getting-started/what-it-tests' },
      { title: 'The six case types at a glance', kind: 'page', slug: 'getting-started/six-case-types' },
      { title: 'Navigating tricky & blended cases', kind: 'page', slug: 'getting-started/navigating-blended-cases' },
      { title: 'A repeatable solving method', kind: 'page', slug: 'getting-started/repeatable-method' },
      { title: 'Math under pressure', kind: 'page', slug: 'getting-started/math-under-pressure' },
      { title: 'Communication under pressure', kind: 'page', slug: 'getting-started/communication-under-pressure' },
      { title: 'Your diagnostic & a 14-day plan', kind: 'page', slug: 'getting-started/diagnostic-and-plan' },
    ],
  },
  {
    title: 'B · Guesstimates',
    kind: 'section',
    icon: 'Calculator',
    defaultOpen: true,
    children: [
      { title: 'The Pain & The Promise', kind: 'page', slug: 'guesstimates/pain-and-promise' },
      { title: 'Public EV charging points in a metro', kind: 'page', slug: 'guesstimates/ev-charging-points-metro', meta: { difficulty: 'moderate' } },
      {
        title: 'Population & Consumption',
        kind: 'group',
        children: [
          { title: 'Smartphones sold in India', kind: 'page', slug: 'guesstimates/smartphones-sold-india', meta: { difficulty: 'easy' } },
          { title: 'Biryani plates in a metro', kind: 'page', slug: 'guesstimates/biryani-plates-metro', meta: { difficulty: 'easy' } },
          { title: 'School uniform sets per year', kind: 'page', slug: 'guesstimates/school-uniforms-india', meta: { difficulty: 'easy' } },
          { title: 'Weddings in India per year', kind: 'page', slug: 'guesstimates/weddings-india-annual', meta: { difficulty: 'moderate' } },
          { title: 'Toothpaste tubes per year', kind: 'page', slug: 'guesstimates/toothpaste-tubes-india', meta: { difficulty: 'easy' } },
        ],
      },
      {
        title: 'Infrastructure & Assets',
        kind: 'group',
        children: [
          { title: 'Petrol pumps in India', kind: 'page', slug: 'guesstimates/petrol-pumps-india', meta: { difficulty: 'moderate' } },
          { title: 'Hospital beds in a metro', kind: 'page', slug: 'guesstimates/hospital-beds-metro', meta: { difficulty: 'moderate' } },
          { title: 'ATMs in a tier-1 city', kind: 'page', slug: 'guesstimates/atms-tier1-city', meta: { difficulty: 'moderate' } },
          { title: 'Food-delivery riders in a metro', kind: 'page', slug: 'guesstimates/delivery-riders-metro', meta: { difficulty: 'moderate' } },
          { title: 'Mobile towers in India', kind: 'page', slug: 'guesstimates/mobile-towers-india', meta: { difficulty: 'challenging' } },
        ],
      },
      {
        title: 'Business & Revenue',
        kind: 'group',
        children: [
          { title: 'Revenue of one multiplex screen', kind: 'page', slug: 'guesstimates/multiplex-screen-revenue', meta: { difficulty: 'moderate' } },
          { title: 'Daily revenue of a city metro', kind: 'page', slug: 'guesstimates/metro-daily-revenue', meta: { difficulty: 'moderate' } },
          { title: 'Revenue of an IPL franchise', kind: 'page', slug: 'guesstimates/ipl-franchise-revenue', meta: { difficulty: 'challenging' } },
          { title: 'Daily toll plaza collection', kind: 'page', slug: 'guesstimates/toll-plaza-collection', meta: { difficulty: 'easy' } },
          { title: 'Monthly sales of a kirana store', kind: 'page', slug: 'guesstimates/kirana-monthly-gmv', meta: { difficulty: 'easy' } },
        ],
      },
      {
        title: 'Habits & Time',
        kind: 'group',
        children: [
          { title: 'UPI transactions per day', kind: 'page', slug: 'guesstimates/upi-transactions-daily', meta: { difficulty: 'moderate' } },
          { title: 'Chai at a railway station', kind: 'page', slug: 'guesstimates/chai-railway-station', meta: { difficulty: 'easy' } },
          { title: 'Elevator trips in an office tower', kind: 'page', slug: 'guesstimates/office-elevator-trips', meta: { difficulty: 'challenging' } },
          { title: 'OTT hours streamed per day', kind: 'page', slug: 'guesstimates/ott-watch-hours', meta: { difficulty: 'moderate' } },
          { title: 'App-cab rides in a metro', kind: 'page', slug: 'guesstimates/cab-rides-metro', meta: { difficulty: 'moderate' } },
        ],
      },
      {
        title: 'Curveballs',
        kind: 'group',
        children: [
          { title: 'Daily garbage of a metro city', kind: 'page', slug: 'guesstimates/city-garbage-daily', meta: { difficulty: 'moderate' } },
          { title: 'Cricket bats sold per year', kind: 'page', slug: 'guesstimates/cricket-bats-india', meta: { difficulty: 'challenging' } },
          { title: 'Paint consumed in India', kind: 'page', slug: 'guesstimates/paint-consumption-india', meta: { difficulty: 'challenging' } },
          { title: 'Water tankers in a metro summer', kind: 'page', slug: 'guesstimates/water-tankers-summer', meta: { difficulty: 'challenging' } },
          { title: 'Streetlights in a metro', kind: 'page', slug: 'guesstimates/streetlights-metro', meta: { difficulty: 'moderate' } },
        ],
      },
    ],
  },
  {
    title: 'C · Core Frameworks',
    kind: 'section',
    icon: 'Layers',
    defaultOpen: true,
    children: [
      { title: 'Structuring fundamentals', kind: 'page', slug: 'core-frameworks/structuring-fundamentals' },
      { title: 'Profitability', kind: 'page', slug: 'core-frameworks/profitability', meta: { difficulty: 'easy' } },
      { title: 'Market Entry', kind: 'page', slug: 'core-frameworks/market-entry' },
      { title: 'Growth', kind: 'page', slug: 'core-frameworks/growth' },
      { 
        title: 'M&A', 
        kind: 'page', 
        slug: 'core-frameworks/m-and-a',
        children: [
          { title: 'Value & Synergies', kind: 'page', slug: 'core-frameworks/m-and-a/value-and-synergies' },
          { title: 'Due Diligence', kind: 'page', slug: 'core-frameworks/m-and-a/due-diligence' },
          { title: 'Private Equity', kind: 'page', slug: 'core-frameworks/m-and-a/private-equity' }
        ]
      },
      { title: 'Pricing', kind: 'page', slug: 'core-frameworks/pricing' },
    ],
  },
  {
    title: 'D · Misc. Frameworks',
    kind: 'section',
    icon: 'Shapes',
    children: [
      {
        title: 'Marketing & Customer',
        kind: 'group',
        children: [
          { title: 'STP', kind: 'page', slug: 'miscellaneous/stp' },
          { title: 'The 4 A\'s', kind: 'page', slug: 'miscellaneous/4-as' },
          { title: 'Five Senses', kind: 'page', slug: 'miscellaneous/five-senses' },
        ],
      },
      {
        title: 'Competitive Advantage',
        kind: 'group',
        children: [
          { title: 'VRIO', kind: 'page', slug: 'miscellaneous/vrio' },
          { title: 'Sustainable Advantage', kind: 'page', slug: 'miscellaneous/sustainable-advantage' },
        ],
      },
      {
        title: 'People & Operations',
        kind: 'group',
        children: [
          { title: 'AMO', kind: 'page', slug: 'miscellaneous/amo' },
          { title: 'The 4 M\'s', kind: 'page', slug: 'miscellaneous/4-ms' },
        ],
      },
      {
        title: 'Data',
        kind: 'group',
        children: [
          { title: 'The 4 V\'s of Data', kind: 'page', slug: 'miscellaneous/4-vs-data' },
        ],
      },
      {
        title: 'Market Sizing',
        kind: 'group',
        children: [
          { title: 'TAM, SAM & SOM', kind: 'page', slug: 'miscellaneous/tam-sam-som' },
        ],
      },
    ],
  },
  {
    title: 'E · Toolkit',
    kind: 'section',
    icon: 'Wrench',
    children: [
      { title: 'Porter\'s Five Forces', kind: 'page', slug: 'toolkit/porters-five-forces' },
      { title: 'SWOT', kind: 'page', slug: 'toolkit/swot' },
      { title: 'PESTEL', kind: 'page', slug: 'toolkit/pestel' },
      { title: '4 P\'s', kind: 'page', slug: 'toolkit/4-ps' },
      { title: 'The 5 C\'s of Marketing', kind: 'page', slug: 'toolkit/5-cs' },
      { title: 'BCG Growth–Share Matrix', kind: 'page', slug: 'toolkit/bcg-matrix' },
      { title: 'Value Chain', kind: 'page', slug: 'toolkit/value-chain' },
      { title: 'Ansoff Matrix', kind: 'page', slug: 'toolkit/ansoff-matrix' },
      { title: 'Customer / Purchase Journey', kind: 'page', slug: 'toolkit/customer-journey' },
      { title: 'McKinsey 7S', kind: 'page', slug: 'toolkit/mckinsey-7s' },
    ],
  },
  {
    title: 'F · Cases',
    kind: 'section',
    icon: 'Briefcase',
    children: [
      {
        title: 'Profitability',
        kind: 'group',
        children: [
          { title: 'The Regional Dairy Cooperative', kind: 'page', slug: 'cases/profitability/regional-dairy-cooperative', meta: { difficulty: 'moderate' } },
          { title: 'The Pump Maker\'s Vanishing Margin', kind: 'page', slug: 'cases/profitability/agri-pump-warranty', meta: { difficulty: 'easy' } },
          { title: 'More Tickets, Less Profit', kind: 'page', slug: 'cases/profitability/multiplex-margin-squeeze', meta: { difficulty: 'moderate' } },
          { title: 'The Cloud Kitchen That Bleeds', kind: 'page', slug: 'cases/profitability/cloud-kitchen-burn', meta: { difficulty: 'moderate' } },
          { title: 'The Budget Hotel\'s Weekend Problem', kind: 'page', slug: 'cases/profitability/budget-hotel-revpar', meta: { difficulty: 'challenging' } },
          { title: 'The Diagnostic Chain\'s Bad Expansion', kind: 'page', slug: 'cases/profitability/diagnostic-lab-expansion', meta: { difficulty: 'challenging' } },
        ],
      },
      {
        title: 'Market Entry',
        kind: 'group',
        children: [
          { title: 'D2C Skincare Goes Offline', kind: 'page', slug: 'cases/market-entry/d2c-skincare-offline', meta: { difficulty: 'easy' } },
          { title: 'Japanese Stationery Eyes India', kind: 'page', slug: 'cases/market-entry/japanese-stationery-india', meta: { difficulty: 'moderate' } },
          { title: 'Electric Scooters Beyond Metros', kind: 'page', slug: 'cases/market-entry/ev-two-wheeler-tier2', meta: { difficulty: 'moderate' } },
          { title: 'Indian SaaS Goes to Southeast Asia', kind: 'page', slug: 'cases/market-entry/saas-payroll-sea', meta: { difficulty: 'challenging' } },
        ],
      },
      {
        title: 'Growth',
        kind: 'group',
        children: [
          { title: 'Doubling a Regional Snack Brand', kind: 'page', slug: 'cases/growth/regional-snack-brand', meta: { difficulty: 'easy' } },
          { title: 'The Edtech App That Stopped Growing', kind: 'page', slug: 'cases/growth/vernacular-edtech-plateau', meta: { difficulty: 'moderate' } },
          { title: 'The Gym Chain at a Crossroads', kind: 'page', slug: 'cases/growth/tier2-gym-chain', meta: { difficulty: 'challenging' } },
        ],
      },
      {
        title: 'Pricing',
        kind: 'group',
        children: [
          { title: 'Pricing the Airport Lounge', kind: 'page', slug: 'cases/pricing/airport-lounge-access', meta: { difficulty: 'moderate' } },
          { title: 'Should the Sleeper Bus Surge-Price?', kind: 'page', slug: 'cases/pricing/intercity-bus-dynamic', meta: { difficulty: 'moderate' } },
          { title: 'Pricing the Breakdown Predictor', kind: 'page', slug: 'cases/pricing/b2b-iot-sensor', meta: { difficulty: 'challenging' } },
        ],
      },
      {
        title: 'M&A / PE / Due Diligence',
        kind: 'group',
        children: [
          { title: 'The Parcel Giant Buys a Cold Chain', kind: 'page', slug: 'cases/ma-pe-dd/cold-chain-acquisition', meta: { difficulty: 'moderate' } },
          { title: 'DD on a Southern Cement Target', kind: 'page', slug: 'cases/ma-pe-dd/cement-southern-target', meta: { difficulty: 'moderate' } },
          { title: 'The PE Fund and the Eye Hospitals', kind: 'page', slug: 'cases/ma-pe-dd/pe-eyecare-chain', meta: { difficulty: 'challenging' } },
        ],
      },
      {
        title: 'Unconventional',
        kind: 'group',
        children: [
          { title: 'The Stadium That Works 20 Days', kind: 'page', slug: 'cases/unconventional/stadium-non-matchday', meta: { difficulty: 'easy' } },
          { title: 'Decongest the Railway Terminus', kind: 'page', slug: 'cases/unconventional/railway-platform-crowding', meta: { difficulty: 'moderate' } },
          { title: 'Double the State\'s Blood Donations', kind: 'page', slug: 'cases/unconventional/blood-donation-supply', meta: { difficulty: 'moderate' } },
        ],
      },
      {
        title: 'Signature Cases',
        kind: 'group',
        children: [
          { title: 'The Airline\'s Bleeding Regional Network', kind: 'page', slug: 'cases/signature/airline-regional-routes', meta: { difficulty: 'challenging' } },
          { title: 'Should the Flash Sale Be Smaller?', kind: 'page', slug: 'cases/signature/festival-flash-sale', meta: { difficulty: 'challenging' } },
          { title: 'The PE Clock and the Biryani Chain', kind: 'page', slug: 'cases/signature/qsr-pe-rollout', meta: { difficulty: 'challenging' } },
          { title: 'Bid or No-Bid: The Solar Tender', kind: 'page', slug: 'cases/signature/solar-epc-bid', meta: { difficulty: 'challenging' } },
        ],
      },
    ],
  },
  {
    title: 'G · Industry Primers',
    kind: 'section',
    icon: 'Building2',
    children: [
      { title: '1 · Asset Management', kind: 'page', slug: 'industry-primers/asset-management' },
      { title: '2 · Aviation', kind: 'page', slug: 'industry-primers/aviation' },
      { title: '3 · Banking', kind: 'page', slug: 'industry-primers/banking' },
      { title: '4 · Defence', kind: 'page', slug: 'industry-primers/defence' },
      { title: '5 · E-Commerce', kind: 'page', slug: 'industry-primers/ecommerce' },
      { title: '6 · Education', kind: 'page', slug: 'industry-primers/education' },
      { title: '7 · Electric Vehicles', kind: 'page', slug: 'industry-primers/ev' },
      { title: '8 · Food Delivery', kind: 'page', slug: 'industry-primers/food-delivery' },
      { title: '9 · Food Processing', kind: 'page', slug: 'industry-primers/food-processing' },
      { title: '10 · FMCG', kind: 'page', slug: 'industry-primers/fmcg' },
    ],
  },
  {
    title: 'H · Case Competitions',
    kind: 'section',
    icon: 'Trophy',
    defaultOpen: true,
    children: [
      { title: '1 · Why competitions matter', kind: 'page', slug: 'case-competitions/why-they-matter', meta: { difficulty: 'easy' } },
      { title: '2 · The Indian circuit', kind: 'page', slug: 'case-competitions/india-circuit', meta: { difficulty: 'easy' } },
      { title: '3 · Building the team', kind: 'page', slug: 'case-competitions/team-formation', meta: { difficulty: 'easy' } },
      { title: '4 · Decoding the problem statement', kind: 'page', slug: 'case-competitions/decoding-the-problem', meta: { difficulty: 'moderate' } },
      { title: '5 · Research that wins', kind: 'page', slug: 'case-competitions/research-and-insight', meta: { difficulty: 'moderate' } },
      { title: '6 · Building the solution', kind: 'page', slug: 'case-competitions/building-the-solution', meta: { difficulty: 'moderate' } },
      { title: '7 · The winning deck', kind: 'page', slug: 'case-competitions/the-winning-deck', meta: { difficulty: 'moderate' } },
      { title: '8 · The finale pitch & Q&A', kind: 'page', slug: 'case-competitions/the-finale-pitch', meta: { difficulty: 'challenging' } },
      { title: '9 · Judges & the kill-list', kind: 'page', slug: 'case-competitions/judges-and-mistakes', meta: { difficulty: 'moderate' } },
      { title: '10 · Zero to podium roadmap', kind: 'page', slug: 'case-competitions/zero-to-podium-roadmap', meta: { difficulty: 'easy' } },
    ],
  },
];
