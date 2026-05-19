/**
 * Magic strings & app-wide constants.
 */

export const CASE_TYPES = ['guesstimate', 'profitability', 'market_sizing', 'growth'] as const;
export type CaseType = (typeof CASE_TYPES)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const CASE_TYPE_LABELS: Record<string, string> = {
  guesstimate: 'Guesstimate',
  profitability: 'Profitability',
  market_sizing: 'Market Sizing',
  growth: 'Growth',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  hard: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const SCORE_DIMENSIONS = ['structure', 'logic', 'data_usage', 'communication', 'creativity'] as const;
export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

export const SCORE_DIMENSION_LABELS: Record<string, string> = {
  structure: 'Structure',
  logic: 'Logic',
  data_usage: 'Data Usage',
  communication: 'Communication',
  creativity: 'Creativity',
};

export const MIN_ANSWER_CHARS = 200;

/** Routes that are accessible without authentication. */
export const PUBLIC_ROUTES: string[] = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
];

/** Auth pages — if logged in, user gets redirected away from these. */
export const AUTH_ROUTES: string[] = ['/login', '/signup'];
