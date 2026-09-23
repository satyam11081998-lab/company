import type { AtlasSection } from '../../atlas-types';

/* ============================================================================
   The Guesstimate Data Atlas — every number on this page was pulled from a
   named primary source in September 2026 and carries its vintage.

   AUTHORING RULES (keep these if you edit):
   1. No number without `asOf` + `source`. If you cannot name the source, it
      does not go on the sheet.
   2. `grade` is honest, not flattering:
        measured  — a census / survey / administrative COUNT
        official  — a government or UN estimate, including provisional ones
        derived   — our arithmetic on two of the above; the working is shown
        industry  — a trade estimate; no primary count exists
   3. Round to what a candidate can defend out loud. ₹346.36 lakh crore is
      stored as "₹346 lakh crore" with the precise figure in `detail`.
   4. Every headline number should say what it UNLOCKS and — the part that
      actually wins rooms — what independently CROSS-CHECKS it.
   ============================================================================ */

export const ATLAS_CORE: AtlasSection[] = [
    /* ------------------------------------------------------------ anchors */
    {
      id: 'anchors',
      nav: 'Start here',
      title: 'The six anchors',
      kicker:
        'Nine out of ten guesstimates hang off one of these. Get the anchor right, then round everything downstream without guilt.',
      aha: 'An interviewer forgives a 20% rounding error all day. A 10× anchor error ends the case in the first minute.',
      headline: [
        {
          id: 'population',
          label: 'Population',
          value: '1.48 bn',
          alt: '≈148 crore',
          detail:
            '1,476.63 million for 2026 — about one in five people alive. India passed China in 2023.',
          asOf: '2026',
          source: 'UN World Population Prospects 2024 revision, medium variant',
          grade: 'official',
          unlocks: 'Anything national. Start here, then cut by age, income or geography.',
          crossCheck:
            'Births ~23 mn a year against deaths ~9.9 mn means the base grows ~13 mn a year — a Mumbai every ten months.',
          keywords: ['people', 'india population', '140 crore', 'demography', 'how many indians'],
        },
        {
          id: 'households',
          label: 'Households',
          value: '~320 mn',
          alt: '≈32 crore',
          detail:
            'Census 2011 counted 248.8 mn at an average size of 4.87. Holding that size gives ~303 mn today; a size of 4.4 gives ~336 mn. Quote the band and say which size you assumed.',
          asOf: '2026 (derived from Census 2011)',
          source: 'Derived: Census of India 2011 household count × UN WPP 2026 population',
          grade: 'derived',
          unlocks:
            'Anything bought once per home — TVs, fridges, cars, broadband, LPG cylinders, paint, insurance.',
          crossCheck:
            'Never multiply a per-household rate by the population. That single slip is the most common 4× error on this page.',
          keywords: ['homes', 'family', 'hh', 'household size', 'families'],
        },
        {
          id: 'urban-share',
          label: 'Urban share',
          value: '36.9%',
          alt: '≈545 mn urban · ≈930 mn rural',
          detail: 'Still a majority-rural country, but urbanising fast. Census 2011 had it at 31.1%.',
          asOf: '2024',
          source: 'World Bank, World Development Indicators',
          grade: 'official',
          unlocks: 'Any product that is urban-first — quick commerce, cabs, multiplexes, gyms, cafés.',
          crossCheck:
            'Urban tele-density is 152% against rural 61%. The consumption gap is wider than the population split alone suggests.',
          keywords: ['urbanisation', 'cities', 'rural', 'town', 'metro share'],
        },
        {
          id: 'workers',
          label: 'People who work',
          value: '~645 mn',
          alt: '≈64 crore',
          detail:
            'Derived: ~1,120 mn people aged 15+ × a worker-population ratio of 57.4%. Not the same as the 1.02 bn "working-age" population — roughly four in ten adults sit outside the workforce, overwhelmingly women.',
          asOf: 'Jan–Dec 2025',
          source: 'Derived: PLFS 2025 worker-population ratio × UN WPP age structure',
          grade: 'derived',
          unlocks: 'Salaries, commuting, workwear, lunch, payroll software, any B2E product.',
          crossCheck:
            'Female participation is 45.9% rural against 27.6% urban — the one demographic reversal most candidates state backwards.',
          keywords: ['workforce', 'employed', 'labour force', 'jobs', 'earning population'],
        },
        {
          id: 'gdp',
          label: 'GDP (nominal)',
          value: '₹346 lakh crore',
          alt: '≈ $4.15 trillion',
          detail:
            '₹346.36 lakh crore at current prices; real GDP grew 7.7%. The series was rebased to 2022-23 in 2026, so older comparisons need care.',
          asOf: 'FY2025-26 (Provisional Estimates)',
          source: 'MoSPI, Provisional Estimates of Annual GDP 2025-26',
          grade: 'official',
          unlocks: "Top-down sizing: take a sector's share of GDP and work down.",
          crossCheck:
            'Private consumption is 61.5% of GDP ≈ ₹213 lakh crore. If your consumer-market number exceeds that, something upstream is broken.',
          keywords: ['economy', 'gdp', 'output', 'trillion', 'lakh crore', 'national income'],
        },
        {
          id: 'gdp-per-capita',
          label: 'GDP per person',
          value: '₹2.35 lakh / yr',
          alt: '≈₹19,500 a month · ≈$2,810',
          detail:
            'Derived: ₹346.36 lakh crore ÷ 1,476.63 mn. This is output per head — not income in hand, and emphatically not spending.',
          asOf: 'FY2025-26',
          source: 'Derived: MoSPI GDP ÷ UN WPP population',
          grade: 'derived',
          unlocks: 'A ceiling check on any per-person spend assumption.',
          crossCheck:
            'Measured spending is far lower — ₹4,122 rural and ₹6,996 urban per person per month. Output ≠ wallet.',
          keywords: ['per capita', 'income', 'gdp per capita', 'average income'],
        },
      ],
      facts: [],
    },

    /* ------------------------------------------------------------- people */
    {
      id: 'people',
      nav: 'People',
      title: 'The shape of 1.48 billion',
      kicker: 'Age decides who can buy what. Cut the population before you multiply by it.',
      aha:
        "India's fertility rate is 1.93 — already below the 2.1 replacement line. The young country is a stock, not a flow: the cohorts coming behind are smaller.",
      visual: {
        kind: 'stack',
        unitNote: 'Share of 1.48 bn people, 2026',
        segments: [
          { label: 'Children 0–14', pct: 24, display: '≈354 mn' },
          { label: 'Working age 15–64', pct: 69, display: '≈1.02 bn' },
          { label: 'Seniors 65+', pct: 7, display: '≈103 mn' },
        ],
      },
      facts: [
        {
          id: 'age-split',
          label: 'Age split',
          value: '24 / 69 / 7',
          detail:
            'Children 0–14, working age 15–64, seniors 65+. UN revisions move each by up to a percentage point, so round and move on.',
          asOf: '2026',
          source: 'UN World Population Prospects 2024 revision',
          grade: 'official',
          unlocks: 'Schools, toys, tuition, insurance, elder care, anything age-gated.',
          keywords: ['children', 'elderly', 'dependency ratio', 'age structure'],
        },
        {
          id: 'median-age',
          label: 'Median age',
          value: '≈29 years',
          detail:
            'Sources put it between 29 and 30 depending on the revision. Say "about 29" — nobody will argue, and precision here buys nothing.',
          asOf: '2026',
          source: 'UN World Population Prospects 2024 revision',
          grade: 'official',
          unlocks: 'Positioning arguments: half the country is under 30.',
          keywords: ['median age', 'young country', 'demographic dividend'],
        },
        {
          id: 'births',
          label: 'Births per year',
          value: '≈23.0 mn',
          detail:
            'A birth rate of 15.6 per 1,000. This is the cohort entering school in six years and the workforce in twenty.',
          asOf: '2026',
          source: 'UN World Population Prospects 2024 revision',
          grade: 'official',
          unlocks: 'Diapers, formula, vaccines, maternity care, primary-school capacity.',
          keywords: ['birth rate', 'newborn', 'babies', 'natality'],
        },
        {
          id: 'deaths',
          label: 'Deaths per year',
          value: '≈9.9 mn',
          detail: 'A death rate of 6.7 per 1,000. Net growth is therefore about +13 mn people a year.',
          asOf: '2026',
          source: 'UN World Population Prospects 2024 revision',
          grade: 'official',
          unlocks: 'Life insurance claims, funeral services, estate and succession products.',
          keywords: ['death rate', 'mortality'],
        },
        {
          id: 'tfr',
          label: 'Fertility rate',
          value: '1.93 children',
          detail:
            'Below the 2.1 replacement level. Population still grows because the childbearing cohort is large, not because families are.',
          asOf: '2026',
          source: 'UN World Population Prospects 2024 revision',
          grade: 'official',
          unlocks: 'Any long-horizon argument — pensions, schools, housing demand after 2040.',
          crossCheck:
            'Reconcile this with "India is young": both are true. Age structure lags fertility by a generation.',
          keywords: ['tfr', 'fertility', 'replacement rate', 'family size', 'birth rate'],
        },
        {
          id: 'life-expectancy',
          label: 'Life expectancy',
          value: '≈72.7 years',
          asOf: '2026',
          source: 'UN World Population Prospects 2024 revision',
          grade: 'official',
          unlocks: 'Annuities, retirement products, lifetime-value calculations.',
          keywords: ['longevity', 'life span', 'life expectancy'],
        },
        {
          id: 'sex-ratio',
          label: 'Sex ratio',
          value: '≈940 women per 1,000 men',
          detail: 'About 45 mn more men than women — the largest such gap in the world.',
          asOf: '2026',
          source: 'UN WPP 2024 revision; Census 2011 measured 943',
          grade: 'official',
          keywords: ['gender ratio', 'male female', 'sex ratio'],
        },
        {
          id: 'literacy',
          label: 'Literacy (age 7+)',
          value: '80.9%',
          detail:
            'Census 2011 measured 74.0%. Urban and male rates run roughly 8–13 points above the national figure.',
          asOf: '2023-24',
          source: 'NSO, Periodic Labour Force Survey 2023-24',
          grade: 'measured',
          unlocks: 'Anything text-dependent — app onboarding, forms, print, instruction manuals.',
          crossCheck:
            'Literacy 80.9% against 1.07 bn broadband connections: much of India goes online voice-and-video first by necessity, not preference.',
          keywords: ['literacy', 'education', 'reading', 'literate'],
        },
      ],
    },

    /* -------------------------------------------------------------- money */
    {
      id: 'money',
      nav: 'Money',
      title: 'What a household actually spends',
      kicker:
        'The most expensive assumption in any guesstimate is that the average Indian is middle class.',
      aha:
        'The average Indian household spends about ₹18,500 a month in a village and ₹31,000 in a city — everything, for everyone in it. Price against that, not against your own bill.',
      headline: [
        {
          id: 'mpce-rural',
          label: 'Rural spend per person',
          value: '₹4,122 / month',
          alt: '₹4,247 including free welfare items',
          detail:
            'Measured, not modelled: average monthly per-capita consumption expenditure across 1.54 lakh rural households surveyed Aug 2023 – Jul 2024.',
          asOf: '2023-24',
          source: 'MoSPI, Household Consumption Expenditure Survey 2023-24',
          grade: 'measured',
          unlocks: 'Any rural affordability or price-point argument.',
          keywords: ['mpce', 'rural spending', 'consumption', 'village', 'affordability'],
        },
        {
          id: 'mpce-urban',
          label: 'Urban spend per person',
          value: '₹6,996 / month',
          alt: '₹7,078 including free welfare items',
          detail:
            'The rural–urban gap has narrowed to 70%, from 71% a year earlier and much wider a decade ago.',
          asOf: '2023-24',
          source: 'MoSPI, Household Consumption Expenditure Survey 2023-24',
          grade: 'measured',
          unlocks: 'Urban price points, QSR ticket sizes, subscription pricing.',
          keywords: ['mpce', 'urban spending', 'city', 'consumption', 'price point'],
        },
      ],
      visual: {
        kind: 'pyramid',
        unitNote:
          'Household monthly spend, derived from HCES 2023-24 at an assumed household size of 4.5',
        tiers: [
          { label: 'Top of the urban distribution', band: 'well above ₹31,000', pct: 10 },
          { label: 'Average urban household', band: '≈₹31,000 a month', pct: 20 },
          { label: 'Average rural household', band: '≈₹18,500 a month', pct: 30 },
          { label: 'Below the rural average', band: 'under ₹18,500 a month', pct: 40 },
        ],
      },
      facts: [
        {
          id: 'hh-spend-rural',
          label: 'Rural household, total monthly spend',
          value: '≈₹18,500',
          detail: 'Derived: ₹4,122 × 4.5 people. Food is roughly 47% of it.',
          asOf: '2023-24',
          source: 'Derived: HCES 2023-24 MPCE × assumed household size 4.5',
          grade: 'derived',
          unlocks: 'Any "would a household buy this" test.',
          keywords: ['household spend', 'rural budget', 'family budget'],
        },
        {
          id: 'hh-spend-urban',
          label: 'Urban household, total monthly spend',
          value: '≈₹31,000',
          detail:
            'Derived: ₹6,996 × 4.5 people. Food is roughly 40%, so about ₹19,000 covers everything else — rent, school, fuel, phone, health, aspiration.',
          asOf: '2023-24',
          source: 'Derived: HCES 2023-24 MPCE × assumed household size 4.5',
          grade: 'derived',
          keywords: ['household spend', 'urban budget', 'family budget'],
        },
        {
          id: 'food-share',
          label: 'Food share of spending',
          value: '≈47% rural · ≈40% urban',
          detail:
            "Non-food is 53% rural and 60% urban. Food's share falling is the standard signal of rising incomes — Engel's law, and a good line to have ready.",
          asOf: '2023-24',
          source: 'MoSPI, HCES 2023-24',
          grade: 'measured',
          keywords: ['food share', 'engel', 'grocery', 'kirana', 'food basket'],
        },
        {
          id: 'pfce',
          label: 'Private consumption',
          value: '61.5% of GDP',
          alt: '≈₹213 lakh crore',
          detail:
            'The highest share since FY12. This is the true ceiling for every consumer-market number you will ever build.',
          asOf: 'FY2025-26',
          source: 'MoSPI / PIB, GDP estimates FY2025-26',
          grade: 'official',
          unlocks: 'A top-down bound on any consumer TAM.',
          crossCheck:
            'Survey-measured consumption adds to roughly ₹92 lakh crore — about 43% of this. Surveys and national accounts disagree by design; say which basis you are on.',
          keywords: ['pfce', 'consumption', 'tam', 'consumer spending', 'market size'],
        },
        {
          id: 'gfcf',
          label: 'Investment (gross fixed capital formation)',
          value: '≈30% of GDP',
          detail: 'Stable at about 30% for three years running.',
          asOf: 'FY2025-26',
          source: 'MoSPI / PIB, GDP estimates FY2025-26',
          grade: 'official',
          unlocks: 'Infrastructure, capital goods, cement and steel sizing.',
          keywords: ['gfcf', 'investment', 'capex', 'capital formation'],
        },
      ],
    },

    /* --------------------------------------------------------------- work */
    {
      id: 'work',
      nav: 'Work',
      title: 'Who actually earns',
      kicker: 'Working-age is not working. Confusing the two inflates consumer numbers by about 60%.',
      aha:
        'Agriculture is 43% of the jobs and 18% of the output. That one sentence is worth more in a group discussion than any other statistic on this page.',
      visual: {
        kind: 'bars',
        unitNote: 'Share of all workers, Jan–Dec 2025',
        items: [
          { label: 'Agriculture', value: 43.0, display: '43.0%' },
          { label: 'Trade, transport & the rest', value: 19.8, display: '≈19.8%', muted: true },
          { label: 'Other services', value: 13.1, display: '13.1%' },
          { label: 'Manufacturing', value: 12.1, display: '12.1%' },
          { label: 'Construction', value: 12.0, display: '12.0%' },
        ],
      },
      facts: [
        {
          id: 'lfpr',
          label: 'Labour force participation (15+)',
          value: '59.3%',
          detail: 'The share of adults working or looking for work.',
          asOf: 'Jan–Dec 2025',
          source: 'MoSPI, Periodic Labour Force Survey Annual Report 2025',
          grade: 'measured',
          keywords: ['lfpr', 'participation', 'labour force'],
        },
        {
          id: 'wpr',
          label: 'Worker-population ratio (15+)',
          value: '57.4%',
          detail:
            'The share of adults actually working. Multiply this by the 15+ population — never by the whole 1.48 bn.',
          asOf: 'Jan–Dec 2025',
          source: 'MoSPI, PLFS Annual Report 2025',
          grade: 'measured',
          unlocks: 'Workforce counts, payroll, commuting, corporate catering.',
          keywords: ['wpr', 'employment rate', 'workers', 'employed'],
        },
        {
          id: 'unemployment',
          label: 'Unemployment rate (15+)',
          value: '3.1%',
          detail:
            'Rural 2.4%, urban 4.8%. Urban female unemployment is 6.4% — the highest cell in the table.',
          asOf: 'Jan–Dec 2025',
          source: 'MoSPI, PLFS Annual Report 2025',
          grade: 'measured',
          keywords: ['unemployment', 'jobless', 'ur', 'joblessness'],
        },
        {
          id: 'female-lfpr',
          label: 'Female participation',
          value: '45.9% rural · 27.6% urban',
          detail:
            'Rural is higher, largely because unpaid and own-account farm work counts. The urban figure is the one that binds consumer-income estimates.',
          asOf: '2024–2025',
          source: 'MoSPI, PLFS',
          grade: 'measured',
          keywords: ['women workforce', 'female labour', 'flfpr', 'gender'],
        },
        {
          id: 'agri-jobs',
          label: 'Agriculture — jobs against output',
          value: '43% of workers · 18% of GVA',
          detail:
            'Output per farm worker is therefore about 40% of the national average (17.9 ÷ 43.0). This is the structural story behind almost every rural-demand argument.',
          asOf: '2025 (jobs) · 2024-25 (output)',
          source: 'MoSPI: PLFS 2025 and National Accounts',
          grade: 'measured',
          unlocks: 'Rural incomes, farm mechanisation, migration, any "why is India poor at this income" question.',
          keywords: ['agriculture', 'farming', 'productivity', 'disguised unemployment', 'farmers'],
        },
        {
          id: 'school-system',
          label: 'The school system',
          value: '24.8 crore students',
          alt: '14.72 lakh schools · 98 lakh teachers',
          detail:
            'A pupil-teacher ratio of about 25. Government schools are 69% of institutions but take 50% of enrolment.',
          asOf: '2023-24',
          source: 'UDISE+ 2023-24, via Economic Survey 2024-25',
          grade: 'measured',
          unlocks: 'Edtech, uniforms, stationery, mid-day meals, school buses, tuition.',
          keywords: ['schools', 'students', 'teachers', 'education', 'udise'],
        },
      ],
    },
  ];
