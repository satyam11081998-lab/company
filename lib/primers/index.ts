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
  }
];
