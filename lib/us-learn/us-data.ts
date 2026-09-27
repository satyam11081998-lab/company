/**
 * US anchor numbers for market sizing, each with its primary source.
 *
 * Every figure below was read off the linked page on 2026-09-27. When a new
 * release lands (Census Vintage estimates each winter, CPS households each
 * November/December, median income each September, BLS monthly), update the
 * value, the `asOf`, and bump the Learn page's `modified` date.
 *
 * `derived: true` rows are arithmetic on the sourced rows, labelled as such
 * on the page. They are rules of thumb, not statistics.
 */

export interface UsAnchor {
  id: string;
  label: string;
  value: string;
  /** Shorter form for spoken math ("~342M"). */
  round: string;
  asOf: string;
  source: string;
  url: string;
  derived?: boolean;
}

export const US_ANCHORS: UsAnchor[] = [
  {
    id: 'population',
    label: 'US resident population',
    value: '341.8 million',
    round: '~340 million',
    asOf: 'July 1, 2025',
    source: 'US Census Bureau, Vintage 2025 estimates (released Jan 27, 2026)',
    url: 'https://www.census.gov/newsroom/press-releases/2026/population-growth-slows.html',
  },
  {
    id: 'households',
    label: 'Households',
    value: '134.8 million',
    round: '~135 million',
    asOf: '2025',
    source: 'US Census Bureau, Current Population Survey (via FRED series TTLHH)',
    url: 'https://fred.stlouisfed.org/series/TTLHH',
  },
  {
    id: 'one-person',
    label: 'One-person households',
    value: '39.7 million (29% of households)',
    round: '~30% live alone',
    asOf: '2025',
    source: 'US Census Bureau, Families and Living Arrangements release (Dec 2, 2025)',
    url: 'https://www.census.gov/newsroom/press-releases/2025/families-and-living-arrangements.html',
  },
  {
    id: 'household-size',
    label: 'People per household',
    value: 'about 2.5',
    round: '2.5',
    asOf: 'derived',
    source: 'Derived: population ÷ households (slightly overstates, since ~2% of people live in group quarters)',
    url: 'https://www.census.gov/newsroom/press-releases/2026/population-growth-slows.html',
    derived: true,
  },
  {
    id: 'under-18',
    label: 'Children under 18',
    value: '73.1 million',
    round: '~73 million',
    asOf: 'July 1, 2024',
    source: 'US Census Bureau, Vintage 2024 estimates by age',
    url: 'https://www.census.gov/newsroom/press-releases/2025/older-adults-outnumber-children.html',
  },
  {
    id: 'over-65',
    label: 'Adults 65 and older',
    value: '61.2 million',
    round: '~61 million',
    asOf: 'July 1, 2024',
    source: 'US Census Bureau, Vintage 2024 estimates by age',
    url: 'https://www.census.gov/newsroom/press-releases/2025/older-adults-outnumber-children.html',
  },
  {
    id: 'median-age',
    label: 'Median age',
    value: '39.1 years',
    round: '~39',
    asOf: 'July 1, 2024',
    source: 'US Census Bureau, Vintage 2024 estimates by age',
    url: 'https://www.census.gov/newsroom/press-releases/2025/older-adults-outnumber-children.html',
  },
  {
    id: 'births',
    label: 'Births per year',
    value: '3.61 million',
    round: '~3.6 million',
    asOf: '2025 (provisional)',
    source: 'CDC National Center for Health Statistics (Apr 9, 2026)',
    url: 'https://www.cdc.gov/nchs/pressroom/releases/20260409.html',
  },
  {
    id: 'labor-force',
    label: 'Civilian labor force',
    value: '169.8 million (162.7 million employed)',
    round: '~170 million',
    asOf: 'August 2026, seasonally adjusted',
    source: 'US Bureau of Labor Statistics, Employment Situation, Table A-1',
    url: 'https://www.bls.gov/news.release/empsit.t01.htm',
  },
  {
    id: 'median-income',
    label: 'Median household income',
    value: '$87,460',
    round: '~$87,000',
    asOf: '2025',
    source: 'US Census Bureau, Income in the United States: 2025 (Sep 15, 2026)',
    url: 'https://www.census.gov/library/publications/2026/demo/p60-289.html',
  },
  {
    id: 'gdp',
    label: 'Gross domestic product (current dollars)',
    value: '$30.8 trillion',
    round: '~$31 trillion',
    asOf: '2025',
    source: 'US Bureau of Economic Analysis (via FRED series GDPA)',
    url: 'https://fred.stlouisfed.org/series/GDPA',
  },
  {
    id: 'drivers',
    label: 'Licensed drivers',
    value: '240 million',
    round: '~240 million',
    asOf: '2024',
    source: "Federal Highway Administration, Our Nation's Highways 2026",
    url: 'https://www.fhwa.dot.gov/policyinformation/pubs/our_nations_highways_2026/drivers.cfm',
  },
  {
    id: 'vehicles',
    label: 'Registered motor vehicles',
    value: '298 million',
    round: '~300 million',
    asOf: '2024',
    source: "Federal Highway Administration, Our Nation's Highways 2026",
    url: 'https://www.fhwa.dot.gov/policyinformation/pubs/our_nations_highways_2026/vehicles.cfm',
  },
  {
    id: 'smartphones',
    label: 'Adults who own a smartphone',
    value: '91%',
    round: '~9 in 10',
    asOf: '2025 survey',
    source: 'Pew Research Center, Mobile Fact Sheet',
    url: 'https://www.pewresearch.org/internet/fact-sheet/mobile/',
  },
  {
    id: 'homeownership',
    label: 'Homeownership rate',
    value: '65.0%',
    round: '~2 in 3 households own',
    asOf: 'Q2 2026',
    source: 'US Census Bureau, Housing Vacancies and Homeownership',
    url: 'https://www.census.gov/housing/hvs/current/index.html',
  },
  {
    id: 'small-businesses',
    label: 'Small businesses',
    value: '36.2 million (6.4 million with employees)',
    round: '~36 million',
    asOf: '2022 data',
    source: 'SBA Office of Advocacy, Frequently Asked Questions (2026 edition)',
    url: 'https://advocacy.sba.gov/wp-content/uploads/2026/02/FINAL_FAQsAboutSmallBusiness_2026_012826.pdf',
  },
];
