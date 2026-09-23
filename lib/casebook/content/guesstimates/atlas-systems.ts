import type { AtlasSection } from '../../atlas-types';

/* ============================================================================
   Data Atlas, part two — the economy, the systems that run on top of it, the
   per-person rates, the denominators, and the arithmetic.

   Same authoring rules as atlas-core.ts: no number without a named source and
   an honest grade.
   ============================================================================ */

export const ATLAS_SYSTEMS: AtlasSection[] = [
  /* ------------------------------------------------------------- economy */
  {
    id: 'economy',
    nav: 'Economy',
    title: 'What the economy is made of',
    kicker: 'Sector shares give you a top-down route into almost any industry question.',
    aha:
      'Services are 55% of output. Industry is 27%. Agriculture is 18% — and employs more than twice its output share. Output and jobs are different questions.',
    visual: {
      kind: 'stack',
      unitNote: 'Share of gross value added at current prices, 2024-25',
      segments: [
        { label: 'Services', pct: 54.9, display: '54.9%' },
        { label: 'Industry', pct: 27.1, display: '27.1%' },
        { label: 'Agriculture & allied', pct: 17.9, display: '17.9%' },
      ],
    },
    facts: [
      {
        id: 'gva-split',
        label: 'GVA by sector',
        value: '55 / 27 / 18',
        detail:
          'Services 54.93%, industry 27.13%, agriculture 17.94% at current prices. At constant prices agriculture is smaller still, around 14%.',
        asOf: '2024-25',
        source: 'MoSPI, National Accounts Statistics',
        grade: 'official',
        unlocks: 'Any "how big is this sector" question, worked down from GDP.',
        keywords: ['gva', 'sector', 'services', 'industry', 'agriculture', 'sectoral share'],
      },
      {
        id: 'real-growth',
        label: 'Real GDP growth',
        value: '7.7%',
        detail: 'Up from 7.1% the year before. Nominal growth was 8.9%, so the deflator is running near 1.2%.',
        asOf: 'FY2025-26',
        source: 'MoSPI, Provisional Estimates',
        grade: 'official',
        unlocks: 'Any forward projection. Compound at 7–8% real, 9–11% nominal.',
        keywords: ['growth rate', 'gdp growth', 'real growth', 'inflation deflator'],
      },
      {
        id: 'base-year',
        label: 'GDP base year',
        value: '2022-23',
        detail:
          'The national accounts series was rebased in 2026, replacing 2011-12. Pre-2026 write-ups quote the old series — do not mix them in the same argument.',
        asOf: '2026',
        source: 'MoSPI, new GDP series announcement',
        grade: 'official',
        keywords: ['base year', 'rebasing', 'series', 'national accounts'],
      },
      {
        id: 'foodgrain',
        label: 'Foodgrain production',
        value: '357.7 mn tonnes',
        alt: '≈242 kg per person per year',
        detail:
          'Record output: rice 150.2 mt, wheat 118.0 mt, maize 43.4 mt, pulses 25.7 mt. Sugarcane adds another 454.6 mt on top.',
        asOf: '2024-25',
        source: 'Ministry of Agriculture & Farmers Welfare',
        grade: 'official',
        unlocks: 'Staples, PDS, storage, milling, food processing, packaging.',
        crossCheck:
          'Production is not consumption — seed, feed, wastage and exports come off the top before anyone eats.',
        keywords: ['foodgrain', 'rice', 'wheat', 'agriculture output', 'crop', 'harvest'],
      },
      {
        id: 'milk-production',
        label: 'Milk production',
        value: '239.3 mn tonnes',
        alt: '471 g per person per day',
        detail: 'The largest in the world, growing at a 5.6% compound rate over the last decade.',
        asOf: '2023-24',
        source: 'Department of Animal Husbandry & Dairying',
        grade: 'official',
        unlocks: 'Dairy, cold chain, packaging, cattle feed, milk-based FMCG.',
        keywords: ['milk', 'dairy', 'amul', 'cattle', 'per capita milk'],
      },
      {
        id: 'eggs',
        label: 'Egg production',
        value: '142.8 billion',
        alt: '103 eggs per person per year',
        detail: 'Up from 62 per person a decade ago — one of the fastest per-capita shifts in the food basket.',
        asOf: '2023-24',
        source: 'Department of Animal Husbandry & Dairying',
        grade: 'official',
        keywords: ['eggs', 'poultry', 'protein'],
      },
    ],
  },

  /* ------------------------------------------------------------- digital */
  {
    id: 'digital',
    nav: 'Digital',
    title: 'Connections are not people',
    kicker: 'The most over-quoted numbers in Indian guesstimates. Almost all of them count SIMs, not humans.',
    aha:
      'Urban tele-density is 152%. There are more mobile connections in Indian cities than there are urban Indians — so any estimate built on "connections = users" is already 30–50% too high.',
    headline: [
      {
        id: 'mobile-connections',
        label: 'Mobile connections',
        value: '1,289 mn',
        alt: '≈129 crore',
        detail:
          'Total telephone subscribers are 1,337.54 mn, of which wireless is 1,288.96 mn and wireline 48.58 mn.',
        asOf: 'April 2026',
        source: 'TRAI, monthly telecom subscription data',
        grade: 'measured',
        unlocks: 'Telecom, towers, recharge, handset replacement.',
        crossCheck:
          'Only 1,193.57 mn of these are active on the network (VLR) — 93.8%. Unique human users are lower again.',
        keywords: ['mobile', 'sim', 'telecom', 'subscribers', 'connections', 'trai'],
      },
      {
        id: 'broadband',
        label: 'Broadband connections',
        value: '1,073 mn',
        alt: 'wireless 1,026.6 mn · wired 46.8 mn',
        detail:
          'Fixed broadband is under 5% of the total. India is a mobile-internet country with a rounding error of fibre.',
        asOf: 'April 2026',
        source: 'TRAI, monthly telecom subscription data',
        grade: 'measured',
        unlocks: 'Streaming, e-commerce, edtech, fintech reach — but use it as a ceiling, not a user count.',
        keywords: ['internet', 'broadband', 'online', 'data', 'fibre', 'jio'],
      },
      {
        id: 'upi-daily',
        label: 'UPI transactions a day',
        value: '791 mn',
        alt: '≈79 crore a day',
        detail:
          '24.51 bn transactions worth ₹29.82 lakh crore in August 2026 — a record month, up 22% on the year. The FY2025-26 daily average was lower, at 66 crore.',
        asOf: 'August 2026',
        source: 'NPCI, monthly UPI product statistics',
        grade: 'measured',
        unlocks: 'Payments, merchant acquiring, fintech, any digital-adoption argument.',
        crossCheck:
          'Average ticket size is ₹1,217. If your payments estimate implies ₹5,000 a transaction, you are modelling a different India.',
        keywords: ['upi', 'payments', 'npci', 'digital payments', 'gpay', 'phonepe', 'transactions'],
      },
    ],
    facts: [
      {
        id: 'teledensity',
        label: 'Tele-density',
        value: '90.3% overall',
        alt: 'urban 152.1% · rural 60.7%',
        detail:
          'Above 100% simply means multiple connections per person. It is the cleanest single illustration of why connection counts overstate reach.',
        asOf: 'April 2026',
        source: 'TRAI',
        grade: 'measured',
        keywords: ['teledensity', 'penetration', 'multi-sim', 'dual sim'],
      },
      {
        id: 'upi-year',
        label: 'UPI, full year',
        value: '24,162 crore transactions',
        alt: '₹314 lakh crore in value',
        detail:
          'A daily average of 66 crore transactions worth ₹0.86 lakh crore, across 703 banks. UPI is about 85% of India’s digital payments and roughly half of all real-time payments worldwide.',
        asOf: 'FY2025-26',
        source: 'NPCI, via PIB',
        grade: 'measured',
        unlocks: 'Any full-year payments number. Use this, not a peak month extrapolated ×12.',
        keywords: ['upi annual', 'digital payments', 'real time payments', 'npci'],
      },
      {
        id: 'upi-ticket',
        label: 'Average UPI ticket',
        value: '≈₹1,217',
        detail:
          'Derived: ₹29.82 lakh crore ÷ 24.51 bn transactions for August 2026. The full-year average is close, at about ₹1,300.',
        asOf: 'August 2026',
        source: 'Derived: NPCI value ÷ NPCI volume',
        grade: 'derived',
        unlocks: 'Merchant-level revenue, MDR debates, interchange arguments.',
        keywords: ['ticket size', 'average transaction', 'upi value', 'mdr'],
      },
      {
        id: 'smartphone-shipments',
        label: 'Smartphones shipped a year',
        value: '≈152 mn units',
        detail:
          'Effectively flat on 2024’s 151 mn. Volume has stopped growing; value has not, as the mix shifts premium.',
        asOf: 'Calendar 2025',
        source: 'IDC India Quarterly Mobile Phone Tracker',
        grade: 'industry',
        unlocks: 'Handset market, accessories, retail, trade-in and refurb.',
        crossCheck:
          'Shipments × replacement cycle should land near the active base. 152 mn × 4.5 years ≈ 680 mn — which is the number to use, not "a billion smartphones".',
        keywords: ['smartphone', 'phone sales', 'handset', 'mobile phone', 'idc'],
      },
    ],
  },

  /* ------------------------------------------------------------ mobility */
  {
    id: 'mobility',
    nav: 'Mobility',
    title: 'Stock and flow on the road',
    kicker: 'Vehicles are the cleanest place to learn the stock-and-flow move, because both numbers are published.',
    aha:
      'Annual sales × vehicle life ≈ the vehicles on the road. Two-wheelers: 2.17 crore a year × 12 years ≈ 260 mn — which is exactly the registered stock. When a chain closes like that, you can say so out loud, and the room notices.',
    visual: {
      kind: 'ratio',
      unitNote: 'Registered vehicles, 2022',
      pairs: [
        {
          aLabel: 'Two-wheelers',
          aValue: 260,
          aDisplay: '≈260 mn',
          bLabel: 'Cars',
          bValue: 50,
          bDisplay: '≈50 mn',
          note: 'Roughly five two-wheelers for every car — about 185 against 35 per 1,000 people',
        },
      ],
    },
    facts: [
      {
        id: 'two-wheelers',
        label: 'Two-wheelers on the road',
        value: '≈260 mn',
        alt: '≈185 per 1,000 people',
        detail:
          'More than 60% of Indian households own one. The source quotes 190 per 1,000, which implies a slightly smaller population base than the headline count — another reason to say "about 185" and move on. Registered stock also overstates vehicles actually running, because scrapped ones are rarely de-registered.',
        asOf: '2022',
        source: 'MoRTH Annual Report 2025-26; ownership share from HCES 2023-24',
        grade: 'official',
        unlocks: 'Fuel, tyres, servicing, insurance, helmets, delivery fleets, EV conversion.',
        keywords: ['two wheeler', 'bike', 'scooter', 'motorcycle', 'vehicles'],
      },
      {
        id: 'cars',
        label: 'Cars on the road',
        value: '≈50 mn',
        alt: '35 per 1,000 people',
        detail:
          'Fewer than 10% of households own a car or jeep. India ranks 99th of 115 countries on cars per person, but 11th of 111 on two-wheelers.',
        asOf: '2022',
        source: 'MoRTH Annual Report 2025-26; ownership share from HCES 2023-24',
        grade: 'official',
        unlocks: 'Parking, fuel, tolls, car washes, insurance, used-car markets.',
        keywords: ['cars', 'four wheeler', 'passenger vehicle', 'automobile'],
      },
      {
        id: 'vehicle-sales',
        label: 'Vehicles sold a year',
        value: '2.83 crore',
        alt: '2W 2.17 cr · PV 46.4 lakh · CV 10.8 lakh · 3W 8.4 lakh',
        detail:
          'A record year, up 10.4%. Exports added another 66.5 lakh units. Scooters grew 18.5% against motorcycles at 6.6%.',
        asOf: 'FY2025-26',
        source: 'SIAM (Society of Indian Automobile Manufacturers)',
        grade: 'measured',
        unlocks: 'Flow questions: annual demand, dealer throughput, finance volumes.',
        crossCheck: 'Multiply by vehicle life to get stock, and check against the registered numbers above.',
        keywords: ['car sales', 'auto sales', 'siam', 'two wheeler sales', 'automobile sales'],
      },
      {
        id: 'railways',
        label: 'Railway passengers',
        value: '741 crore a year',
        alt: '≈2.0 crore a day',
        detail:
          'Passenger revenue ₹80,000 crore; freight 1,670 mn tonnes earning ₹1,77,754 crore. Freight, not passengers, pays for the railway.',
        asOf: 'FY2025-26',
        source: 'Ministry of Railways, via PIB',
        grade: 'measured',
        unlocks: 'Station footfall, catering, platform retail, ticketing, station chai.',
        crossCheck:
          'About 20 mn passengers a day across 7,000-odd stations averages roughly 2,800 a station — but the top 100 stations carry a wildly disproportionate share.',
        keywords: ['railways', 'train', 'passengers', 'irctc', 'station footfall'],
      },
      {
        id: 'petrol-pumps',
        label: 'Petrol pumps',
        value: '1,00,266',
        detail:
          'Public-sector oil companies run about 91%: Indian Oil 41,664, BPCL 24,605, HPCL 24,418. Private players hold roughly 9%.',
        asOf: 'November 2025',
        source: 'Petroleum Planning & Analysis Cell (PPAC)',
        grade: 'measured',
        unlocks: 'The classic "how many petrol pumps" guesstimate — and the retail-network questions built on it.',
        keywords: ['petrol pump', 'fuel station', 'retail outlets', 'ppac', 'petrol bunk'],
      },
      {
        id: 'fuel',
        label: 'Fuel consumed a year',
        value: 'diesel 93.9 mt · petrol 42.7 mt',
        alt: 'LPG 32.8 mt · jet fuel 9.9 mt',
        detail:
          'Diesel is more than twice petrol, because freight and agriculture run on it. Together that is about 92 kg of road fuel per person per year.',
        asOf: 'FY2025-26',
        source: 'Petroleum Planning & Analysis Cell (PPAC)',
        grade: 'official',
        unlocks: 'Fuel demand, pump throughput, refining, EV displacement arguments.',
        keywords: ['diesel', 'petrol', 'fuel', 'lpg', 'consumption', 'oil'],
      },
    ],
  },

  /* ----------------------------------------------------------- per capita */
  {
    id: 'per-capita',
    nav: 'Per person',
    title: 'Per person, per day',
    kicker:
      'These are the multipliers. The discipline is choosing the right population to multiply — national, urban, or one city.',
    aha:
      'Almost every wrong guesstimate applies an urban rate to the whole country. Water at 135 litres a day is a design norm for a piped city, not what 1.48 bn people receive.',
    visual: {
      kind: 'bars',
      unitNote: 'Per person per day, where a daily figure is meaningful',
      items: [
        { label: 'Water (urban design norm)', value: 135, display: '135 litres' },
        { label: 'Electricity', value: 3.8, display: '3.8 kWh' },
        { label: 'Foodgrain', value: 0.66, display: '660 g' },
        { label: 'Milk', value: 0.47, display: '471 g' },
        { label: 'Municipal waste (urban)', value: 0.35, display: '350 g' },
      ],
    },
    facts: [
      {
        id: 'electricity',
        label: 'Electricity',
        value: '1,395 kWh a year',
        alt: '≈3.8 kWh a day',
        detail:
          'FY2023-24 actual; FY2024-25 was estimated near 1,538 kWh. CEA’s per-capita figure includes captive generation, so it runs above utility sales alone.',
        asOf: 'FY2023-24',
        source: 'Central Electricity Authority (CEA)',
        grade: 'official',
        unlocks: 'Power demand, grid sizing, solar rooftop, appliance loads.',
        keywords: ['electricity', 'power', 'kwh', 'energy', 'cea', 'units'],
      },
      {
        id: 'water',
        label: 'Water (urban)',
        value: '135 litres a day',
        alt: 'metros 150–200 · rural target 55',
        detail:
          'A CPHEEO design norm, not measured delivery. Add 15% for leakage in a new network and 30–40% in an old one. Jal Jeevan Mission raised the rural target from 40 to 55 lpcd.',
        asOf: 'CPHEEO manual, current',
        source: 'CPHEEO Manual on Water Supply and Treatment; Jal Jeevan Mission',
        grade: 'official',
        unlocks: 'Tankers, pumping, RO, sewerage, any city water-balance question.',
        keywords: ['water', 'lpcd', 'supply', 'tanker', 'cpheeo', 'drinking water'],
      },
      {
        id: 'waste',
        label: 'Municipal solid waste',
        value: '1.70 lakh tonnes a day',
        alt: '≈0.35 kg per urban person per day',
        detail:
          '92% is collected, 54% processed, 24% landfilled — about 22% is unaccounted for. Metros run well above the average, at 0.5–0.7 kg.',
        asOf: '2021-22',
        source: 'Central Pollution Control Board (CPCB), Annual Report on SWM',
        grade: 'measured',
        unlocks: 'Garbage trucks, landfill, recycling, composting, waste-to-energy.',
        keywords: ['waste', 'garbage', 'msw', 'landfill', 'cpcb', 'trash', 'sanitation'],
      },
      {
        id: 'milk-pc',
        label: 'Milk',
        value: '471 g a day',
        detail: 'Up sharply over the decade, tracking the 5.6% compound growth in production.',
        asOf: '2023-24',
        source: 'Department of Animal Husbandry & Dairying',
        grade: 'official',
        unlocks: 'Dairy demand, cold chain, packaging, curd and paneer categories.',
        keywords: ['milk', 'dairy', 'per capita milk', 'litres'],
      },
      {
        id: 'foodgrain-pc',
        label: 'Foodgrain',
        value: '≈242 kg a year',
        alt: '≈660 g a day, as produced',
        detail:
          'Derived from production, not intake. Net availability after seed, feed, wastage and exports is materially lower — use roughly 180–200 kg for consumption.',
        asOf: '2024-25',
        source: 'Derived: Ministry of Agriculture production ÷ UN WPP population',
        grade: 'derived',
        keywords: ['foodgrain', 'cereal', 'rice wheat', 'per capita food'],
      },
      {
        id: 'fuel-pc',
        label: 'Road fuel',
        value: '≈92 kg a year',
        detail: 'Derived: petrol plus diesel divided by population. Heavily skewed to freight and to cities.',
        asOf: 'FY2025-26',
        source: 'Derived: PPAC consumption ÷ UN WPP population',
        grade: 'derived',
        keywords: ['fuel per capita', 'petrol', 'diesel', 'energy'],
      },
      {
        id: 'mobile-data',
        label: 'Mobile data',
        value: '≈25–30 GB a month per user',
        detail:
          'Among the highest in the world and among the cheapest. Treat the exact number as a planning range; operators and regulators report it differently.',
        asOf: '2024–2026',
        source: 'TRAI and operator disclosures; range, not a point estimate',
        grade: 'industry',
        unlocks: 'Tower capacity, spectrum, CDN, streaming bandwidth.',
        keywords: ['data usage', 'gb', 'mobile data', 'internet usage', 'arpu'],
      },
    ],
  },

  /* --------------------------------------------------------- denominators */
  {
    id: 'denominators',
    nav: 'How many',
    title: 'How many of everything there are',
    kicker: 'When the question is "how many X in India", one of these is usually the denominator you need.',
    aha:
      'A city has three different populations depending on whether you mean the municipal corporation, the urban agglomeration or the metropolitan region — and they can differ by two times. Say which one you are using before you multiply.',
    facts: [
      {
        id: 'districts',
        label: 'Districts',
        value: '640',
        detail:
          'The Census 2011 count. States have created many more since, so the working number today is nearer 780–800 — cite 640 only as the census figure.',
        asOf: '2011',
        source: 'Census of India 2011',
        grade: 'measured',
        keywords: ['districts', 'administrative units', 'zilla'],
      },
      {
        id: 'villages',
        label: 'Villages',
        value: '≈6.4 lakh',
        detail: 'Against 7,935 towns. Rural India is a distribution problem before it is a demand problem.',
        asOf: '2011',
        source: 'Census of India 2011',
        grade: 'measured',
        unlocks: 'Rural distribution, last-mile logistics, banking correspondents, telecom coverage.',
        keywords: ['villages', 'gaon', 'rural', 'panchayat', 'towns'],
      },
      {
        id: 'census-households',
        label: 'Households (measured)',
        value: '248.8 mn',
        detail:
          'The last hard count, at an average size of 4.87. The 2027 census will reset this and several other numbers on this page.',
        asOf: '2011',
        source: 'Census of India 2011',
        grade: 'measured',
        keywords: ['households', 'census', 'homes'],
      },
      {
        id: 'schools-count',
        label: 'Schools',
        value: '14.72 lakh',
        detail: '24.8 crore students and 98 lakh teachers. About 1 lakh are single-teacher schools.',
        asOf: '2023-24',
        source: 'UDISE+ 2023-24',
        grade: 'measured',
        keywords: ['schools', 'education', 'udise', 'students'],
      },
      {
        id: 'kirana',
        label: 'Kirana and neighbourhood stores',
        value: '≈13 mn',
        detail:
          'The most-quoted number in Indian retail and the least measured — there is no register of them. Treat it as an order of magnitude: tens of millions, not millions.',
        asOf: 'Industry estimate, current',
        source: 'Invest India and industry bodies; no primary count exists',
        grade: 'industry',
        unlocks: 'FMCG distribution, quick commerce, B2B supply, POS terminals.',
        crossCheck:
          '13 mn stores against 320 mn households is roughly one store per 25 households — plausible, which is why the figure survives.',
        keywords: ['kirana', 'retail', 'shops', 'stores', 'fmcg', 'general trade'],
      },
      {
        id: 'cities',
        label: 'The biggest cities',
        value: 'Delhi NCR ≈58 mn · Mumbai ≈24 mn',
        alt: 'Kolkata ≈16 mn · Chennai ≈12 mn · Bengaluru ≈11.5 mn',
        detail:
          'These are Census 2011 metropolitan-region figures. Municipal-corporation populations are far smaller — Mumbai city is about 12 mn against 24 mn for the region. Pick one definition and name it.',
        asOf: '2011 (metropolitan regions)',
        source: 'Census of India 2011',
        grade: 'measured',
        unlocks: 'Every city-level guesstimate.',
        crossCheck:
          'A 2026 estimate runs roughly 1.3–1.5× the 2011 figure. If precision matters, say you are scaling and by how much.',
        keywords: ['delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'city population', 'metro'],
      },
    ],
  },

  /* ---------------------------------------------------------- arithmetic */
  {
    id: 'arithmetic',
    nav: 'Arithmetic',
    title: 'Lakh, crore, and time',
    kicker: 'Mis-converting crore is the quietest way to be wrong by a factor of ten.',
    aha:
      'Work in powers of ten, not in words. 1 crore is 10⁷. ₹1 lakh crore is 10¹² — a trillion rupees, roughly $12 bn. Write the exponent down and the conversion stops being a risk.',
    facts: [
      {
        id: 'lakh',
        label: '1 lakh',
        value: '100,000 = 10⁵',
        alt: '0.1 million',
        asOf: 'Definition',
        source: 'Indian numbering system',
        grade: 'measured',
        keywords: ['lakh', 'conversion', 'numbering'],
      },
      {
        id: 'crore',
        label: '1 crore',
        value: '10,000,000 = 10⁷',
        alt: '10 million = 100 lakh',
        asOf: 'Definition',
        source: 'Indian numbering system',
        grade: 'measured',
        keywords: ['crore', 'conversion', 'numbering', 'million'],
      },
      {
        id: 'hundred-crore',
        label: '100 crore',
        value: '1,000,000,000 = 10⁹',
        alt: '1 billion',
        asOf: 'Definition',
        source: 'Indian numbering system',
        grade: 'measured',
        keywords: ['billion', 'crore', 'conversion'],
      },
      {
        id: 'lakh-crore',
        label: '₹1 lakh crore',
        value: '₹1 trillion = 10¹²',
        alt: '≈ $12 billion at ₹83/$',
        detail: 'The unit Indian budget and market numbers are quoted in. Learn this one cold.',
        asOf: 'Definition; USD at ≈₹83',
        source: 'Indian numbering system; rate implied by MoSPI and IMF 2026 figures',
        grade: 'derived',
        keywords: ['lakh crore', 'trillion', 'billion dollars', 'conversion', 'usd'],
      },
      {
        id: 'minutes',
        label: 'Minutes in a day',
        value: '1,440',
        alt: '≈1,000 waking minutes',
        detail: 'The waking figure is the useful one for attention, screen time and queueing questions.',
        asOf: 'Definition',
        source: 'Arithmetic',
        grade: 'measured',
        keywords: ['minutes', 'day', 'time', 'hours'],
      },
      {
        id: 'hours-year',
        label: 'Hours in a year',
        value: '8,760',
        alt: 'round to 8,000',
        detail: 'Capacity questions live here: machine hours, seat hours, screen hours.',
        asOf: 'Definition',
        source: 'Arithmetic',
        grade: 'measured',
        keywords: ['hours', 'year', 'capacity', 'utilisation'],
      },
      {
        id: 'working-days',
        label: 'Working days a year',
        value: '≈250 on five days · ≈300 on six',
        alt: 'retail and footfall: 300–360',
        detail: 'State which you are using. It moves an annual answer by 20% on its own.',
        asOf: 'Convention',
        source: 'Standard planning convention',
        grade: 'industry',
        keywords: ['working days', 'business days', 'operating days', 'annual'],
      },
      {
        id: 'weeks',
        label: 'Weeks in a month',
        value: '≈4.3',
        detail: 'Not 4. Using 4 loses you 7% on every weekly-to-monthly conversion.',
        asOf: 'Definition',
        source: 'Arithmetic',
        grade: 'measured',
        keywords: ['weeks', 'month', 'conversion'],
      },
    ],
  },

  /* ------------------------------------------------------------ defaults */
  {
    id: 'defaults',
    nav: 'Defaults',
    title: 'When you have nothing to go on',
    kicker: 'State one of these out loud, then proceed. A named assumption is a strength; a silent one is a trap.',
    aha:
      'Interviewers are not testing whether you know the number. They are testing whether you notice you needed one — and whether you said so.',
    facts: [
      {
        id: 'hh-size',
        label: 'Household size',
        value: '4.5',
        alt: 'urban ≈4.2 · rural ≈4.8',
        detail:
          'Census 2011 measured 4.87 and it has been falling. Anything from 4.2 to 4.9 is defensible; say which you picked.',
        asOf: 'Census 2011, trended',
        source: 'Census of India 2011, with a declining trend applied',
        grade: 'derived',
        keywords: ['household size', 'family size', 'people per home'],
      },
      {
        id: 'adults-share',
        label: 'Adults (15+)',
        value: '≈76% of people',
        detail: 'Derived from the age split. Use this before applying any adult rate.',
        asOf: '2026',
        source: 'Derived: UN WPP 2024 revision age structure',
        grade: 'derived',
        keywords: ['adults', 'voters', 'over 18', 'grown ups'],
      },
      {
        id: 'smartphone-pen',
        label: 'Smartphone users',
        value: '≈650–700 mn',
        detail:
          'Derived from shipments × replacement cycle, and consistent with active connections. Resist the "1 billion smartphones" line — that counts devices and dormant SIMs, not users.',
        asOf: '2025-26',
        source: 'Derived: IDC shipments × 4.5-year cycle, checked against TRAI active connections',
        grade: 'derived',
        unlocks: 'App TAM, digital-payments reach, streaming subscribers.',
        keywords: ['smartphone users', 'penetration', 'app users', 'mobile users'],
      },
      {
        id: 'cycle-phone',
        label: 'Replacement cycle — phone',
        value: '≈3.5–4.5 years',
        detail: 'Lengthening. Shipments have gone flat while the base has not shrunk, which is what a longer cycle looks like.',
        asOf: '2025-26',
        source: 'Inferred from IDC shipments against active connections',
        grade: 'derived',
        keywords: ['replacement cycle', 'upgrade', 'phone life'],
      },
      {
        id: 'cycle-vehicle',
        label: 'Replacement cycle — vehicles',
        value: 'two-wheeler ≈12 yrs · car ≈11 yrs',
        detail:
          'Not a convention — these are the cycle lengths that make annual sales reconcile with registered stock. See the cross-checks section.',
        asOf: 'FY2025-26',
        source: 'Derived: SIAM sales reconciled against MoRTH registered stock',
        grade: 'derived',
        keywords: ['vehicle life', 'scrappage', 'replacement', 'car life'],
      },
      {
        id: 'cycle-durables',
        label: 'Replacement cycle — TV, fridge',
        value: '≈8–10 years',
        asOf: 'Convention',
        source: 'Standard consumer-durables planning convention',
        grade: 'industry',
        keywords: ['durables', 'appliance', 'tv', 'fridge', 'replacement'],
      },
      {
        id: 'eating-out',
        label: 'Eating out (urban)',
        value: '≈4–6 paid meals a week',
        detail:
          'A planning band, not a measurement. Anchor it to the urban food budget — about ₹12,000 a month for a household covers everything eaten.',
        asOf: 'Convention',
        source: 'Planning convention; anchor against HCES 2023-24 urban food share',
        grade: 'industry',
        unlocks: 'QSR, delivery, restaurants, cloud kitchens.',
        keywords: ['eating out', 'restaurants', 'qsr', 'food delivery', 'swiggy', 'zomato'],
      },
    ],
  },

  /* -------------------------------------------------------- cross-checks */
  {
    id: 'cross-checks',
    nav: 'Cross-checks',
    title: 'Close the loop',
    kicker:
      'The move that separates a good answer from a memorised one: build the number twice, from two unrelated directions, and say whether they agree.',
    aha:
      'You do not need to be right. You need to be able to show you would have noticed if you were wrong.',
    visual: {
      kind: 'chain',
      unitNote: 'Each chain is built from numbers on this page, then tested against an independent figure',
      chains: [
        {
          goal: 'Two-wheelers on Indian roads',
          steps: [
            { md: 'Two-wheelers sold in a year', value: '2.17 crore' },
            { md: 'Average life before scrappage', value: '× 12 years' },
          ],
          result: '≈260 mn',
          check: 'Registered stock (MoRTH): ≈260 mn',
          verdict: 'holds',
        },
        {
          goal: 'Cars on Indian roads',
          steps: [
            { md: 'Passenger vehicles sold in a year', value: '46.4 lakh' },
            { md: 'Average life', value: '× 11 years' },
          ],
          result: '≈51 mn',
          check: 'Registered stock (MoRTH): ≈50 mn',
          verdict: 'holds',
        },
        {
          goal: 'People who actually use a smartphone',
          steps: [
            { md: 'Smartphones shipped a year', value: '152 mn' },
            { md: 'Replacement cycle', value: '× 4.5 years' },
          ],
          result: '≈680 mn',
          check: 'Active mobile connections 1,194 mn, of which a large share are feature phones and second SIMs',
          verdict: 'holds',
        },
        {
          goal: 'What Indian households spend in a year',
          steps: [
            { md: 'Average spend per person per month', value: '≈₹5,183' },
            { md: 'Twelve months, 1.48 bn people', value: '× 12 × 1.48 bn' },
          ],
          result: '≈₹92 lakh crore',
          check: 'National accounts put private consumption at ₹213 lakh crore',
          verdict: 'watch',
        },
        {
          goal: 'UPI transactions per adult per day',
          steps: [
            { md: 'UPI transactions a day', value: '791 mn' },
            { md: 'Adults aged 15+', value: '÷ 1,120 mn' },
          ],
          result: '≈0.7 a day',
          check: 'Only a minority of adults transact on UPI at all, so per active user it is nearer 2 a day',
          verdict: 'watch',
        },
      ],
    },
    facts: [
      {
        id: 'survey-vs-accounts',
        label: 'Surveys against national accounts',
        value: 'Surveys capture ≈43%',
        detail:
          'Consumption surveys and national accounts have diverged for decades, worldwide. Neither is wrong; they measure different things. State which basis you are on and the objection disappears.',
        asOf: '2023-24 survey against FY2025-26 accounts',
        source: 'Derived: HCES 2023-24 against MoSPI PFCE',
        grade: 'derived',
        unlocks: 'Defending any consumer-market number against a sceptical panel.',
        keywords: ['survey gap', 'national accounts', 'hces', 'pfce', 'divergence'],
      },
      {
        id: 'registered-vs-running',
        label: 'Registered against running',
        value: 'Registered overstates',
        detail:
          'Vehicle registrations are rarely cancelled when a vehicle is scrapped, so registered stock drifts above vehicles actually on the road. Flag it; do not pretend the number is clean.',
        asOf: 'Current',
        source: 'MoRTH / VAHAN methodology',
        grade: 'official',
        keywords: ['vahan', 'registered vehicles', 'scrappage', 'overstatement'],
      },
      {
        id: 'census-vintage',
        label: 'The census gap',
        value: 'Last full count: 2011',
        detail:
          'Every household, village, town and city number on this page is fifteen years old or estimated forward from something that is. The 2027 census will move several of them. Knowing that is itself an answer.',
        asOf: '2011; next census 2027',
        source: 'Census of India',
        grade: 'measured',
        unlocks: 'The honest caveat that makes the rest of your numbers credible.',
        keywords: ['census', 'vintage', '2027', 'data quality', 'stale data'],
      },
    ],
  },
];
