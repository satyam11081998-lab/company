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
  {
    slug: 'industry-primers/banking',
    folder: 'banking',
    no: 3,
    title: 'Banking',
    sector: 'Financial Services',
    sources: [
      { label: 'IBEF — Banking in India',         url: 'https://www.ibef.org/industry/banking-india' },
      { label: 'Reserve Bank of India (RBI)',     url: 'https://www.rbi.org.in' },
      { label: 'NPCI — UPI data',                 url: 'https://www.npci.org.in/what-we-do/upi/product-statistics' },
      { label: 'BCG — Financial Institutions',    url: 'https://www.bcg.com/industries/financial-institutions/overview' },
      { label: 'PwC India — Financial Services',  url: 'https://www.pwc.in/industries/financial-services.html' },
    ],
  },
  {
    slug: 'industry-primers/defence',
    folder: 'defence',
    no: 4,
    title: 'Defence',
    sector: 'Aerospace & Defence',
    sources: [
      { label: 'IBEF — Defence Manufacturing',    url: 'https://www.ibef.org/industry/defence-manufacturing' },
      { label: 'Ministry of Defence (PIB)',       url: 'https://pib.gov.in/PressReleseDetail.aspx?PRID=2114042' },
      { label: 'Dept. of Defence Production',      url: 'https://ddpmod.gov.in' },
      { label: 'SIDM',                            url: 'https://www.sidm.in' },
      { label: 'iDEX (Innovations for Defence)',  url: 'https://idex.gov.in' },
      { label: 'SIPRI — Arms Transfers',          url: 'https://www.sipri.org/databases/armstransfers' },
    ],
  },
  {
    slug: 'industry-primers/ecommerce',
    folder: 'ecommerce',
    no: 5,
    title: 'E-Commerce',
    sector: 'Internet & Retail',
    sources: [
      { label: 'IBEF — E-Commerce',               url: 'https://www.ibef.org/industry/ecommerce' },
      { label: 'Bain & Co — How India Shops Online', url: 'https://www.bain.com/insights/how-india-shops-online-2026/' },
      { label: 'ONDC',                            url: 'https://ondc.org' },
      { label: 'Invest India — Retail & E-Comm',  url: 'https://www.investindia.gov.in/sector/retail-e-commerce' },
      { label: 'Statista — India E-Commerce',     url: 'https://www.statista.com/markets/413/topic/457/e-commerce/' },
    ],
  },
];

export function getPrimerBySlug(slug: string): Primer | null {
  return PRIMERS.find((p) => p.slug === slug) ?? null;
}
