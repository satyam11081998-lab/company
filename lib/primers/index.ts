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
  {
    slug: 'industry-primers/education',
    folder: 'education',
    no: 6,
    title: 'Education',
    sector: 'Education & Skilling',
    sources: [
      { label: 'IBEF — Education & Training',      url: 'https://www.ibef.org/industry/education-sector-india' },
      { label: 'Invest India — Education',         url: 'https://www.investindia.gov.in/sector/education' },
      { label: 'Ministry of Education (UDISE+)',   url: 'https://www.education.gov.in/statistics-new' },
      { label: 'AISHE — Higher Education Survey',  url: 'https://aishe.gov.in' },
      { label: 'NEP 2020',                        url: 'https://www.education.gov.in/nep/about-nep' },
      { label: 'UGC',                             url: 'https://www.ugc.gov.in' },
    ],
  },
  {
    slug: 'industry-primers/ev',
    folder: 'ev',
    no: 7,
    title: 'Electric Vehicles',
    sector: 'Mobility & Clean-tech',
    sources: [
      { label: 'IBEF — Electric Vehicle',         url: 'https://www.ibef.org/industry/electric-vehicle' },
      { label: 'NITI Aayog — E-Mobility',         url: 'https://www.niti.gov.in/e-mobility' },
      { label: 'Ministry of Heavy Industries (PM E-DRIVE)', url: 'https://heavyindustries.gov.in' },
      { label: 'FADA — Vehicle Retail Data',      url: 'https://fada.in/fada-vehicle-registration-data.php' },
      { label: 'EV Reporter',                     url: 'https://evreporter.com' },
      { label: 'Vahan Dashboard',                 url: 'https://vahan.parivahan.gov.in/vahan4dashboard/' },
    ],
  },
  {
    slug: 'industry-primers/food-delivery',
    folder: 'food-delivery',
    no: 8,
    title: 'Food Delivery',
    sector: 'Internet & Food-tech',
    sources: [
      { label: 'Inc42 — Food-tech',               url: 'https://inc42.com/tag/food-delivery/' },
      { label: 'Redseer — Foodtech',              url: 'https://redseer.com/sectors/foodtech/' },
      { label: 'Bain & Co — India',               url: 'https://www.bain.com/region/india/' },
      { label: 'Eternal (Zomato) Investors',      url: 'https://www.eternal.com/investor-relations/' },
      { label: 'Swiggy Investor Relations',       url: 'https://www.swiggy.com/investor-relations' },
      { label: 'ONDC',                            url: 'https://ondc.org' },
    ],
  },
  {
    slug: 'industry-primers/food-processing',
    folder: 'food-processing',
    no: 9,
    title: 'Food Processing',
    sector: 'Agri & FMCG',
    sources: [
      { label: 'IBEF — Food Processing',          url: 'https://www.ibef.org/industry/food-processing' },
      { label: 'MoFPI',                           url: 'https://www.mofpi.gov.in' },
      { label: 'Invest India — Food Processing',  url: 'https://www.investindia.gov.in/sector/food-processing' },
      { label: 'APEDA',                           url: 'https://apeda.gov.in' },
      { label: 'FSSAI',                           url: 'https://www.fssai.gov.in' },
      { label: 'PLISFPI (PLI scheme)',            url: 'https://www.mofpi.gov.in/Schemes/production-linked-incentive-scheme' },
    ],
  },
  {
    slug: 'industry-primers/fmcg',
    folder: 'fmcg',
    no: 10,
    title: 'FMCG',
    sector: 'Consumer Staples',
    sources: [
      { label: 'IBEF — FMCG',                     url: 'https://www.ibef.org/industry/fmcg' },
      { label: 'NielsenIQ — India',               url: 'https://nielseniq.com/global/en/locations/india/' },
      { label: 'McKinsey — Consumer (India)',     url: 'https://www.mckinsey.com/industries/consumer-packaged-goods/our-insights' },
      { label: 'Invest India — Consumer',         url: 'https://www.investindia.gov.in/sector/retail-e-commerce' },
      { label: 'Bain — India Consumer',           url: 'https://www.bain.com/region/india/' },
    ],
  },
  {
    slug: 'industry-primers/healthcare',
    folder: 'healthcare',
    no: 11,
    title: 'Healthcare',
    sector: 'Healthcare',
    sources: [
      { label: 'IBEF — Healthcare',               url: 'https://www.ibef.org/industry/healthcare-india' },
      { label: 'MoHFW',                           url: 'https://mohfw.gov.in/' },
      { label: 'NHA',                             url: 'https://nha.gov.in/' },
      { label: 'NITI Aayog — Healthcare',         url: 'https://www.niti.gov.in/index.php/health-and-nutrition' },
      { label: 'EY — Healthcare',                 url: 'https://www.ey.com/en_in/health' },
      { label: 'Invest India — Healthcare',       url: 'https://www.investindia.gov.in/sector/healthcare' },
    ],
  },
  {
    slug: 'industry-primers/automobile',
    folder: 'automobile',
    no: 12,
    title: 'Automobile',
    sector: 'Automotive & Mobility',
    sources: [
      { label: 'IBEF — Automobiles',              url: 'https://www.ibef.org/industry/india-automobiles' },
      { label: 'SIAM',                            url: 'https://www.siam.in/' },
      { label: 'MHI',                             url: 'https://heavyindustries.gov.in/' },
      { label: 'FADA',                            url: 'https://fada.in/' },
      { label: 'ACMA',                            url: 'https://www.acma.in/' },
      { label: 'Invest India — Automobile',       url: 'https://www.investindia.gov.in/sector/automobile' },
    ],
  },
  {
    slug: 'industry-primers/cement',
    folder: 'cement',
    no: 13,
    title: 'Cement',
    sector: 'Infrastructure & Real Estate',
    sources: [
      { label: 'IBEF — Cement',                   url: 'https://www.ibef.org/industry/cement-india' },
      { label: 'CMA (Cement Manufacturers)',      url: 'https://www.cmaindia.org/' },
      { label: 'Invest India — Cement',           url: 'https://www.investindia.gov.in/sector/cement' },
      { label: 'CRISIL — Ratings',                url: 'https://www.crisil.com/' },
      { label: 'Statista — Cement Industry',      url: 'https://www.statista.com/markets/415/topic/467/construction/' },
    ],
  },
  {
    slug: 'industry-primers/hospitality',
    folder: 'hospitality',
    no: 14,
    title: 'Hospitality',
    sector: 'Travel & Hospitality',
    sources: [
      { label: 'IBEF — Tourism & Hospitality',    url: 'https://www.ibef.org/industry/tourism-hospitality-india' },
      { label: 'Ministry of Tourism',             url: 'https://tourism.gov.in/' },
      { label: 'HVS — India Hotel Market',        url: 'https://hvs.com/' },
      { label: 'Hotelivate',                      url: 'https://hotelivate.com/' },
      { label: 'Mordor Intelligence',             url: 'https://www.mordorintelligence.com/industry-reports/india-hospitality-industry' },
      { label: 'FHRAI',                           url: 'https://www.fhrai.com/' },
    ],
  },
  {
    slug: 'industry-primers/insurance',
    folder: 'insurance',
    no: 15,
    title: 'Insurance',
    sector: 'Financial Services',
    sources: [
      { label: 'IRDAI',                           url: 'https://irdai.gov.in/' },
      { label: 'IBEF — Insurance',                url: 'https://www.ibef.org/industry/insurance-sector-india' },
      { label: 'Life Insurance Council',          url: 'https://www.lifeinscouncil.org/' },
      { label: 'General Insurance Council',       url: 'https://www.gicouncil.in/' },
      { label: 'Swiss Re — Sigma Reports',        url: 'https://www.swissre.com/institute/research/sigma-research.html' },
      { label: 'McKinsey — Insurance',            url: 'https://www.mckinsey.com/industries/financial-services/our-insights/insurance' },
    ],
  },
  {
    slug: 'industry-primers/iron-steel',
    folder: 'iron-steel',
    no: 16,
    title: 'Iron & Steel',
    sector: 'Manufacturing & Heavy Industry',
    sources: [
      { label: 'IBEF — Iron and Steel',           url: 'https://www.ibef.org/industry/steel' },
      { label: 'Ministry of Steel',               url: 'https://steel.gov.in/' },
      { label: 'worldsteel (WSA)',                url: 'https://worldsteel.org/' },
      { label: 'Joint Plant Committee (JPC)',     url: 'https://jpcindiansteel.nic.in/' },
      { label: 'Indian Steel Association (ISA)',  url: 'https://indsteel.org/' },
    ],
  },
  {
    slug: 'industry-primers/it-ites',
    folder: 'it-ites',
    no: 17,
    title: 'IT & ITeS',
    sector: 'Technology & Services',
    sources: [
      { label: 'NASSCOM',                         url: 'https://nasscom.in/' },
      { label: 'IBEF — IT & ITeS',                url: 'https://www.ibef.org/industry/information-technology-india' },
      { label: 'MeitY',                           url: 'https://www.meity.gov.in/' },
      { label: 'Invest India — IT & BPM',         url: 'https://www.investindia.gov.in/sector/it-bpm' },
      { label: 'Statista — IT in India',          url: 'https://www.statista.com/markets/418/topic/486/technology/' },
      { label: 'Gartner — IT Spending',           url: 'https://www.gartner.com/en/newsroom' },
    ],
  },
  {
    slug: 'industry-primers/logistics',
    folder: 'logistics',
    no: 18,
    title: 'Logistics',
    sector: 'Transport & Supply Chain',
    sources: [
      { label: 'IBEF — Logistics',                url: 'https://www.ibef.org/industry/logistics-india' },
      { label: 'PIB',                             url: 'https://pib.gov.in' },
      { label: 'KPMG — Logistics',                url: 'https://kpmg.com/in' },
      { label: 'DPIIT / NCAER — Logistics Cost',  url: 'https://www.dpiit.gov.in' },
      { label: 'Horizon Research',                url: 'https://www.grandviewresearch.com/horizon' },
      { label: 'Statista',                        url: 'https://www.statista.com' },
    ],
  },
  {
    slug: 'industry-primers/oil-gas',
    folder: 'oil-gas',
    no: 19,
    title: 'Oil & Gas',
    sector: 'Energy & Resources',
    sources: [
      { label: 'IBEF — Oil & Gas',                url: 'https://www.ibef.org/industry/oil-gas-india' },
      { label: 'PPAC',                            url: 'https://www.ppac.gov.in' },
      { label: 'MoPNG',                           url: 'https://mopng.gov.in' },
      { label: 'PIB — MoPNG',                     url: 'https://pib.gov.in' },
      { label: 'Invest India — Oil & Gas',        url: 'https://www.investindia.gov.in/sector/oil-gas' },
      { label: 'Statista',                        url: 'https://www.statista.com' },
    ],
  },
  {
    slug: 'industry-primers/ott',
    folder: 'ott',
    no: 20,
    title: 'OTT',
    sector: 'Media & Entertainment',
    sources: [
      { label: 'IBEF — Media & Entertainment',    url: 'https://www.ibef.org/industry/media-entertainment-india' },
      { label: 'FICCI-EY M&E Report',             url: 'https://www.ficci.in/sector/media-entertainment' },
      { label: 'Ormax Media',                     url: 'https://www.ormaxmedia.com' },
      { label: 'KPMG India',                      url: 'https://kpmg.com/in' },
      { label: 'MIB',                             url: 'https://mib.gov.in' },
      { label: 'Statista',                        url: 'https://www.statista.com' },
    ],
  },
  {
    slug: 'industry-primers/payments',
    folder: 'payments',
    no: 21,
    title: 'Payments',
    sector: 'Financial Technology',
    sources: [
      { label: 'NPCI',                            url: 'https://www.npci.org.in' },
      { label: 'RBI — Annual Report',             url: 'https://www.rbi.org.in' },
      { label: 'PwC India Payments Handbook',     url: 'https://www.pwc.in' },
      { label: 'Worldline India',                 url: 'https://worldline.com/en-in' },
      { label: 'IBEF — Fintech',                  url: 'https://www.ibef.org/industry/fintech-india' },
    ],
  },
];

export function getPrimerBySlug(slug: string): Primer | null {
  return PRIMERS.find((p) => p.slug === slug) ?? null;
}
