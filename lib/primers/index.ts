export interface Primer {
  slug: string;
  title: string;
  no: number;
  sector: string;
  cover?: string;
}

export const PRIMERS: Primer[] = [
  {
    slug: 'aviation',
    title: 'The Aviation Industry',
    no: 21,
    sector: 'Aviation',
  },
  {
    slug: 'cement',
    title: 'The Cement Industry',
    no: 22,
    sector: 'Materials',
  },
  {
    slug: 'fmcg',
    title: 'Fast-Moving Consumer Goods (FMCG)',
    no: 23,
    sector: 'Consumer',
  }
];
