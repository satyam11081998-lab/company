// Industry Primers registry.
// Primers are self-contained, fact-checked static pages living under
// /public/primers/<folder>/index.html and embedded inside the Casebook reader
// (Learn → Casebook → "G · Industry Primers"). They are NOT typed Block pages.
//
// A primer is matched to a Casebook tree leaf by `slug` (e.g.
// "industry-primers/asset-management"). The Casebook reader renders kind:'primer'
// pages via <PrimerEmbed/> (iframe + a horizontal source strip below it).

export interface PrimerSource {
  label: string;
  url: string;
}

export interface Primer {
  /** full Casebook slug, no leading slash */
  slug: string;
  /** folder under /public/primers/<folder>/index.html */
  folder: string;
  /** display number in the section (e.g. "1 · Asset Management") */
  no: number;
  title: string;
  sector: string;
  /** authoritative places the data is drawn from — rendered as a horizontal strip */
  sources: PrimerSource[];
}

export const PRIMERS: Primer[] = [
  {
    slug: 'industry-primers/asset-management',
    folder: 'asset-management',
    no: 1,
    title: 'Asset Management',
    sector: 'Financial Services',
    sources: [
      { label: 'AMFI — India MF data',            url: 'https://www.amfiindia.com' },
      { label: 'IBEF — Mutual Funds (India)',     url: 'https://www.ibef.org/industry/mutual-funds-india' },
      { label: 'BCG — Global Asset Management Report', url: 'https://www.bcg.com/industries/financial-institutions/asset-wealth-management' },
      { label: 'Bain — Global Private Markets',   url: 'https://www.bain.com/insights/topics/global-private-equity-report/' },
      { label: 'McKinsey — Asset & Wealth Mgmt',  url: 'https://www.mckinsey.com/industries/financial-services/our-insights' },
      { label: 'EY — Wealth & Asset Management',  url: 'https://www.ey.com/en_in/industries/wealth-and-asset-management' },
      { label: 'SEBI',                            url: 'https://www.sebi.gov.in' },
    ],
  },
  {
    slug: 'industry-primers/aviation',
    folder: 'aviation',
    no: 2,
    title: 'Aviation',
    sector: 'Aviation',
    sources: [
      { label: 'IBEF — Indian Aviation',          url: 'https://www.ibef.org/industry/indian-aviation' },
      { label: 'Invest India — Aviation',         url: 'https://www.investindia.gov.in/sector/aviation' },
      { label: 'Ministry of Civil Aviation',      url: 'https://www.civilaviation.gov.in' },
      { label: 'DGCA',                            url: 'https://www.dgca.gov.in' },
      { label: 'Airports Authority of India',     url: 'https://www.aai.aero' },
      { label: 'IATA',                            url: 'https://www.iata.org' },
    ],
  },
];

export function getPrimerBySlug(slug: string): Primer | null {
  return PRIMERS.find((p) => p.slug === slug) ?? null;
}
