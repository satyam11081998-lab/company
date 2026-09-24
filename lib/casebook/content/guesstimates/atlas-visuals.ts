import type { AtlasVisual } from '../../atlas-types';

/* ============================================================================
   The charts, keyed by section id, plus the source chips each slide carries.

   Kept apart from the numbers in atlas-core.ts / atlas-systems.ts so a chart
   can be re-cut without touching a sourced datum, and so the dataset stays
   readable.

   CHART RULES (enforced here and in the renderer):
   • One axis of meaning per chart. A dumbbell's two ends are the same unit on
     the same scale; that is why the jobs-vs-output chart is legal and a
     dual-axis version of it would not be.
   • Ordered things — age bands, funnel stages, nested city definitions,
     powers of ten — take the SEQUENTIAL ramp. Categorical hues are only for
     true identities (jobs vs output), assigned in fixed order.
   • --primary is reserved for emphasis: the single mark that is the point.
   • Mixed units never share an axis. The per-person rates are tiles, not bars,
     for exactly that reason — 135 litres and 3.8 kWh cannot share a scale.
   ============================================================================ */

export const ATLAS_VISUALS: Record<
  string,
  {
    sources?: string[];
    /**
     * Datum ids already shown by this section's charts. The slide hides these
     * from its "more numbers" strip so nothing appears twice — they stay fully
     * searchable, which is where their detail belongs.
     */
    covers?: string[];
    visuals: AtlasVisual[];
  }
> = {
  /* ------------------------------------------------------------- anchors */
  anchors: {
    sources: ['UN WPP 2024', 'MoSPI FY2025-26', 'PLFS 2025', 'World Bank'],
    visuals: [
      {
        kind: 'funnel',
        title: 'Everything funnels from the top',
        note: 'Four cuts of the same population. Pick the one your question actually needs — using "1.48 bn" where you meant "644 mn" is a 2.3× error before you have multiplied anything.',
        stages: [
          { label: 'All people', value: 1477, display: '1,477 mn' },
          { label: 'Aged 15 and over', value: 1122, display: '1,122 mn' },
          { label: 'In the labour force', value: 665, display: '665 mn' },
          { label: 'Actually working', value: 644, display: '644 mn', emphasis: true },
        ],
      },
    ],
  },

  /* -------------------------------------------------------------- people */
  people: {
    covers: ['age-split', 'median-age', 'births', 'deaths', 'tfr', 'life-expectancy', 'sex-ratio', 'literacy'],
    sources: ['UN WPP 2024', 'PLFS 2023-24'],
    visuals: [
      {
        kind: 'waffle',
        title: 'If India were 100 people',
        bands: [
          { label: '0–14', count: 24, display: '≈354 mn' },
          { label: '15–64', count: 69, display: '≈1.02 bn' },
          { label: '65+', count: 7, display: '≈103 mn' },
        ],
      },
      {
        kind: 'meter',
        title: 'Fertility rate',
        value: 1.93,
        display: '1.93',
        min: 0,
        max: 3,
        threshold: { at: 2.1, label: '2.1' },
        note: 'The rule marks replacement level. India is already under it — the cohorts behind today’s young population are smaller.',
      },
      {
        kind: 'equation',
        title: 'Cohort flow each year',
        rows: [
          {
            goal: 'Net population growth',
            op: '\u2212',
            terms: [
              { label: 'births', value: '23.0 mn' },
              { label: 'less deaths', value: '9.9 mn' },
            ],
            result: '+13.1 mn',
            check: 'A Mumbai every ten months — and still decelerating, because fertility is below replacement.',
            verdict: 'holds',
          },
        ],
      },
      {
        kind: 'tiles',
        tiles: [
          { value: '29', label: 'median age, years' },
          { value: '72.7', label: 'life expectancy, years' },
          { value: '80.9', unit: '%', label: 'literacy, age 7+' },
          { value: '940', label: 'women per 1,000 men' },
        ],
      },
    ],
  },

  /* --------------------------------------------------------------- money */
  money: {
    covers: ['hh-spend-rural', 'hh-spend-urban', 'food-share', 'pfce', 'gfcf'],
    sources: ['HCES 2023-24', 'MoSPI FY2025-26'],
    visuals: [
      {
        kind: 'bars',
        title: 'Output per head against what people actually spend',
        note: 'Both are rupees per person per month. GDP per capita is what the economy produces per head; MPCE is what a surveyed household actually spends. Quoting the first as though it were the second is the most expensive slip on this page.',
        items: [
          { label: 'GDP per person', value: 19546, display: '₹19,546' },
          { label: 'Measured spending', value: 5183, display: '₹5,183', emphasis: true },
        ],
      },
      {
        kind: 'dumbbell',
        title: 'Rural against urban',
        max: 35000,
        unit: '₹ a month',
        seriesA: 'Rural',
        seriesB: 'Urban',
        rows: [
          { label: 'Per person', a: 4122, b: 6996, gap: 'urban 70% higher' },
          { label: 'Per household (×4.5)', a: 18549, b: 31482, gap: 'the whole family budget' },
        ],
        note: 'The household figures are ours: MPCE × an assumed household size of 4.5. Say the assumption aloud and nobody argues.',
      },
      {
        kind: 'tiles',
        tiles: [
          { value: '47', unit: '%', label: 'food share of rural spend' },
          { value: '40', unit: '%', label: 'food share of urban spend' },
          { value: '61.5', unit: '%', label: 'private consumption, share of GDP' },
          { value: '30', unit: '%', label: 'investment, share of GDP' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- work */
  work: {
    covers: ['lfpr', 'wpr', 'unemployment', 'female-lfpr', 'agri-jobs'],
    sources: ['PLFS 2025', 'MoSPI NAS 2024-25'],
    visuals: [
      {
        kind: 'dumbbell',
        title: 'Where the jobs are, and where the output is',
        max: 60,
        unit: '%',
        seriesA: 'Share of all jobs',
        seriesB: 'Share of output (GVA)',
        rows: [
          { label: 'Agriculture & allied', a: 43.0, b: 17.9, gap: '−25.1 pts' },
          { label: 'Industry', a: 24.1, b: 27.1, gap: '+3.0 pts' },
          { label: 'Services', a: 32.9, b: 54.9, gap: '+22.0 pts' },
        ],
        note: 'Job shares are PLFS 2025 (industry = manufacturing + construction; services = the remainder). Output shares are national accounts at current prices.',
      },
      {
        kind: 'tiles',
        tiles: [
          { value: '59.3', unit: '%', label: 'in the labour force, 15+' },
          { value: '57.4', unit: '%', label: 'actually working, 15+' },
          { value: '3.1', unit: '%', label: 'unemployed · urban women 6.4%' },
          { value: '45.9 / 27.6', unit: '%', label: 'female participation, rural / urban' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- economy */
  economy: {
    covers: ['gva-split', 'real-growth', 'base-year', 'foodgrain', 'milk-production', 'eggs'],
    sources: ['MoSPI NAS 2024-25', 'Min. of Agriculture', 'DAHD'],
    visuals: [
      {
        kind: 'stack',
        title: 'Gross value added by sector',
        note: 'At current prices, 2024-25. At constant prices agriculture is smaller again, nearer 14%.',
        segments: [
          { label: 'Services', pct: 54.9, display: '₹190 lakh cr' },
          { label: 'Industry', pct: 27.1, display: '₹94 lakh cr' },
          { label: 'Agriculture & allied', pct: 17.9, display: '₹62 lakh cr' },
        ],
      },
      {
        kind: 'tiles',
        tiles: [
          { value: '7.7', unit: '%', label: 'real GDP growth, FY2025-26' },
          { value: '8.9', unit: '%', label: 'nominal GDP growth' },
          { value: '357.7', unit: ' mt', label: 'foodgrain production' },
          { value: '239.3', unit: ' mt', label: 'milk production' },
          { value: '142.8', unit: ' bn', label: 'eggs produced' },
          { value: '2022-23', label: 'GDP base year — rebased in 2026' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- digital */
  digital: {
    covers: ['teledensity', 'upi-year', 'upi-ticket', 'smartphone-shipments'],
    sources: ['TRAI Apr 2026', 'NPCI Aug 2026', 'IDC 2025'],
    visuals: [
      {
        kind: 'funnel',
        title: 'From SIMs down to humans',
        note: 'The top bar is the number everyone quotes. The bottom one is the number to use.',
        stages: [
          { label: 'Telephone subscribers', value: 1338, display: '1,338 mn' },
          { label: 'Wireless connections', value: 1289, display: '1,289 mn' },
          { label: 'Active on the network', value: 1194, display: '1,194 mn' },
          { label: 'Broadband connections', value: 1073, display: '1,073 mn' },
          { label: 'People using a smartphone', value: 680, display: '≈680 mn', emphasis: true },
        ],
      },
      {
        kind: 'bars',
        title: 'Tele-density',
        reference: { at: 100, label: '100% — one connection per person' },
        note: 'Urban India is past one connection per person. Any model that treats connections as users is 30–50% too high there.',
        items: [
          { label: 'Urban', value: 152.1, display: '152.1%' },
          { label: 'All India', value: 90.3, display: '90.3%' },
          { label: 'Rural', value: 60.7, display: '60.7%' },
        ],
      },
      {
        kind: 'tiles',
        tiles: [
          { value: '791', unit: ' mn', label: 'UPI transactions a day, Aug 2026' },
          { value: '₹1,217', label: 'average UPI ticket' },
          { value: '₹314', unit: ' lakh cr', label: 'UPI value, FY2025-26' },
          { value: '152', unit: ' mn', label: 'smartphones shipped a year' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------ mobility */
  mobility: {
    covers: ['two-wheelers', 'cars', 'vehicle-sales', 'railways', 'petrol-pumps', 'fuel'],
    sources: ['MoRTH AR 2025-26', 'SIAM FY2025-26', 'PPAC', 'Indian Railways'],
    visuals: [
      {
        kind: 'ratio',
        title: 'What India actually drives',
        aLabel: 'Two-wheelers',
        aValue: 260,
        aDisplay: '≈260 mn',
        bLabel: 'Cars',
        bValue: 50,
        bDisplay: '≈50 mn',
        note: 'Roughly five two-wheelers for every car — about 185 against 35 per 1,000 people. More than 60% of households own a two-wheeler; under 10% own a car.',
      },
      {
        kind: 'equation',
        title: 'Stock from flow — the move worth learning',
        rows: [
          {
            goal: 'Two-wheelers on the road',
            terms: [
              { label: 'sold a year', value: '2.17 cr' },
              { label: 'times life', value: '12 yrs' },
            ],
            result: '≈260 mn',
            check: 'Registered stock (MoRTH): ≈260 mn — closes to within 1%.',
            verdict: 'holds',
          },
          {
            goal: 'Cars on the road',
            terms: [
              { label: 'sold a year', value: '46.4 lakh' },
              { label: 'times life', value: '11 yrs' },
            ],
            result: '≈51 mn',
            check: 'Registered stock (MoRTH): ≈50 mn.',
            verdict: 'holds',
          },
        ],
      },
      {
        kind: 'tiles',
        tiles: [
          { value: '2.83', unit: ' cr', label: 'vehicles sold, FY2025-26' },
          { value: '2.0', unit: ' cr', label: 'railway passengers a day' },
          { value: '1,00,266', label: 'petrol pumps' },
          { value: '93.9 / 42.7', unit: ' mt', label: 'diesel / petrol a year' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------- per capita */
  'per-capita': {
    covers: ['electricity', 'water', 'waste', 'milk-pc', 'foodgrain-pc', 'fuel-pc', 'mobile-data'],
    sources: ['CEA', 'CPHEEO', 'CPCB', 'DAHD', 'PPAC'],
    visuals: [
      {
        kind: 'tiles',
        title: 'Per person — each on its own scale',
        note: 'Deliberately tiles, not one bar chart: 135 litres and 3.8 kWh do not share an axis, and a chart that pretends they do is lying about the comparison. The discipline that matters here is picking the right population to multiply by — national, urban, or one named city.',
        tiles: [
          { value: '135', unit: ' L/day', label: 'water — urban design norm (metros 150–200)' },
          { value: '1,395', unit: ' kWh/yr', label: 'electricity, ≈3.8 a day' },
          { value: '471', unit: ' g/day', label: 'milk availability' },
          { value: '242', unit: ' kg/yr', label: 'foodgrain, as produced' },
          { value: '0.35', unit: ' kg/day', label: 'municipal waste, urban average' },
          { value: '92', unit: ' kg/yr', label: 'road fuel' },
          { value: '103', unit: '/yr', label: 'eggs' },
          { value: '25–30', unit: ' GB/mo', label: 'mobile data per user' },
        ],
      },
    ],
  },

  /* -------------------------------------------------------- denominators */
  denominators: {
    covers: ['districts', 'villages', 'census-households', 'schools-count', 'kirana'],
    sources: ['Census 2011', 'UDISE+ 2023-24', 'PPAC'],
    visuals: [
      {
        kind: 'bars',
        title: 'One city, three populations',
        ordered: true,
        note: 'Mumbai, Census 2011. The widest and narrowest definitions differ by 1.9× — enough to swing a city guesstimate on its own. Name the one you are using before you multiply.',
        items: [
          { label: 'Metropolitan region', value: 23.6, display: '23.6 mn' },
          { label: 'Urban agglomeration', value: 18.4, display: '18.4 mn' },
          { label: 'The municipal city', value: 12.4, display: '12.4 mn' },
        ],
      },
      {
        kind: 'tiles',
        title: 'Counts worth knowing cold',
        tiles: [
          { value: '640', label: 'districts in 2011 — nearer 800 today' },
          { value: '6.4', unit: ' lakh', label: 'villages' },
          { value: '7,935', label: 'towns' },
          { value: '248.8', unit: ' mn', label: 'households, last hard count' },
          { value: '14.72', unit: ' lakh', label: 'schools · 24.8 cr students' },
          { value: '≈13', unit: ' mn', label: 'kirana stores — estimate, never counted' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------- arithmetic */
  arithmetic: {
    covers: ['lakh', 'crore', 'hundred-crore', 'lakh-crore', 'minutes', 'hours-year', 'working-days', 'weeks'],
    sources: ['Indian numbering system'],
    visuals: [
      {
        kind: 'ladder',
        title: 'The zero ladder — where guesstimates quietly die',
        note: 'Work in exponents, not words. Writing the power of ten down is the single cheapest error-check available to you.',
        rungs: [
          { exp: '10⁵', label: '1 lakh', alt: '100,000 · 0.1 million' },
          { exp: '10⁷', label: '1 crore', alt: '10,000,000 · 10 million' },
          { exp: '10⁹', label: '100 crore', alt: '1,000,000,000 · 1 billion' },
          { exp: '10¹²', label: '₹1 lakh crore', alt: '₹1 trillion ≈ $12 bn', emphasis: true },
        ],
      },
      {
        kind: 'tiles',
        title: 'Time constants',
        tiles: [
          { value: '1,440', label: 'minutes a day · ≈1,000 waking' },
          { value: '8,760', label: 'hours a year · round to 8,000' },
          { value: '250 / 300', label: 'working days — five-day / six-day' },
          { value: '4.3', label: 'weeks a month, not 4' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------ defaults */
  defaults: {
    covers: ['hh-size', 'adults-share', 'smartphone-pen', 'cycle-phone', 'cycle-vehicle', 'cycle-durables', 'eating-out'],
    sources: ['Census 2011', 'IDC', 'SIAM', 'planning convention'],
    visuals: [
      {
        kind: 'tiles',
        title: 'The defaults, and what they are worth',
        note: 'None of these are measurements. They are the numbers that make other numbers reconcile — the vehicle lives, for instance, are simply what makes annual sales agree with registered stock.',
        tiles: [
          { value: '4.5', label: 'household size · urban 4.2, rural 4.8' },
          { value: '76', unit: '%', label: 'of people are 15 or over' },
          { value: '≈680', unit: ' mn', label: 'smartphone users — not a billion' },
          { value: '3.5–4.5', unit: ' yrs', label: 'phone replacement cycle' },
          { value: '12 / 11', unit: ' yrs', label: 'two-wheeler / car life' },
          { value: '8–10', unit: ' yrs', label: 'TV and fridge replacement' },
          { value: '4–6', unit: '/week', label: 'paid meals out, urban' },
          { value: '≈25', label: 'pupils per teacher' },
        ],
      },
    ],
  },

  /* -------------------------------------------------------- cross-checks */
  'cross-checks': {
    sources: ['built from the numbers above'],
    visuals: [
      {
        kind: 'equation',
        title: 'Build it twice, from unrelated directions',
        note: 'Three of these close. Two do not — and saying why is worth more than the estimate itself.',
        rows: [
          {
            goal: 'Two-wheelers on Indian roads',
            terms: [
              { label: 'sold a year', value: '2.17 cr' },
              { label: 'times life', value: '12 yrs' },
            ],
            result: '≈260 mn',
            check: 'Registered stock (MoRTH): ≈260 mn.',
            verdict: 'holds',
          },
          {
            goal: 'Cars on Indian roads',
            terms: [
              { label: 'sold a year', value: '46.4 lakh' },
              { label: 'times life', value: '11 yrs' },
            ],
            result: '≈51 mn',
            check: 'Registered stock (MoRTH): ≈50 mn.',
            verdict: 'holds',
          },
          {
            goal: 'People who actually use a smartphone',
            terms: [
              { label: 'shipped a year', value: '152 mn' },
              { label: 'times cycle', value: '4.5 yrs' },
            ],
            result: '≈680 mn',
            check: 'Sits well inside the 1,194 mn active connections, which still include feature phones and second SIMs.',
            verdict: 'holds',
          },
          {
            goal: 'What Indian households spend in a year',
            terms: [
              { label: 'per person a month', value: '₹5,183' },
              { label: 'months × people', value: '12 × 1.48 bn' },
            ],
            result: '≈₹92 lakh cr',
            check: 'National accounts put private consumption at ₹213 lakh crore. Surveys capture about 43% — by design, not by error. Say which basis you are on.',
            verdict: 'watch',
          },
          {
            goal: 'UPI transactions per adult per day',
            op: '\u00f7',
            terms: [
              { label: 'transactions a day', value: '791 mn' },
              { label: 'adults 15+', value: '1,120 mn' },
            ],
            result: '≈0.7 a day',
            check: 'Averages users with non-users. Only a minority of adults transact on UPI, so per active user it is nearer 2 a day. Give the average and the correction in one breath.',
            verdict: 'watch',
          },
        ],
      },
    ],
  },
};
