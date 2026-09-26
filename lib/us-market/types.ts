/**
 * The US case bank (international market, migration 0070).
 *
 * Authored ONCE here and used twice:
 *   1. supabase/seed-us-market.sql is GENERATED from these files by
 *      scripts/gen-us-seed.mjs — never hand-edit the SQL.
 *   2. The public SEO index pages (/us/case-interview-examples,
 *      /us/market-sizing-questions) render the titles and prompts — never the
 *      solutions, which stay behind the attempt like every other case.
 *
 * Every scenario is invented for practice. Company names are fictional; any
 * resemblance to a real company's figures is coincidental. US anchors used
 * throughout: ~335 million people, ~131 million households.
 */

export type UsCaseType =
  | 'profitability'
  | 'market entry'
  | 'growth'
  | 'pricing'
  | 'm&a'
  | 'operations'
  | 'cost reduction'
  | 'go to market'
  | 'competitive strategy';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Cluster = 'prof' | 'size' | 'ent' | 'pri' | 'ma' | 'ops' | 'soft';

export interface UsCase {
  code: string; // US-C-01 .. US-C-50 (unique, idempotent seed key)
  slug: string; // URL-safe, for the public index anchors
  title: string;
  type: UsCaseType;
  difficulty: Difficulty;
  firm: string; // interview style the case is written in
  format: 'interviewer-led' | 'candidate-led';
  minutes: number;
  cluster: Cluster;
  industry: string;
  situation: string;
  facts: string[]; // the figures the candidate is given up front
  asks: string[];
  hint: string;
  solution: string; // shown only after an attempt is submitted
}

export interface UsGuesstimate {
  code: string; // US-G-01 .. US-G-50
  slug: string;
  title: string;
  difficulty: Difficulty;
  firm: string;
  minutes: number;
  scope: string; // what exactly to estimate (units, geography, period)
  hint: string;
  solution: string;
}
