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

export const SCORE_DIMENSIONS = [
  'structure',
  'quantitative',
  'synthesis',
  'business_judgment',
  'creativity',
  'presence',
] as const;

export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

export const SCORE_DIMENSION_LABELS: Record<string, string> = {
  structure: 'Structure',
  quantitative: 'Quantitative Skills',
  synthesis: 'Synthesis & Communication',
  business_judgment: 'Business Judgment',
  creativity: 'Creativity',
  presence: 'Professional Tone',
};
export const SCORE_DIMENSION_MAX: Record<string, number> = {
  structure: 25,
  quantitative: 20,
  synthesis: 20,
  business_judgment: 15,
  creativity: 10,
  presence: 10,
};

// --- Guesstimate rubric (5 dimensions, each scored 1..5) ---
// Mirrors backend services/guesstimate_backstop.py + lib/scoring/apply-backstop.ts.
export const GUESSTIMATE_DIMENSIONS = [
  'scoping',
  'structure',
  'segmentation',
  'arithmetic',
  'sanity',
] as const;

export type GuesstimateDimension = (typeof GUESSTIMATE_DIMENSIONS)[number];

export const GUESSTIMATE_DIMENSION_LABELS: Record<string, string> = {
  scoping: 'Scoping & Clarification',
  structure: 'Structure (MECE tree)',
  segmentation: 'Segmentation & Assumptions',
  arithmetic: 'Arithmetic & Units',
  sanity: 'Sanity Check',
};
// each guesstimate dimension is on a 1..5 scale
export const GUESSTIMATE_DIMENSION_MAX = 5;

export const MIN_ANSWER_CHARS = 200;

/** One-time price of the Deck Skeleton Library, in INR. */
export const SKELETON_LIBRARY_PRICE_INR = 500;

/** Routes that are accessible without authentication. */
export const PUBLIC_ROUTES: string[] = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/api/unsubscribe', // one-click email unsubscribe — must work logged-out
  '/methodology',
  '/about',
  '/privacy',
  '/terms',
  '/refund',
  '/pricing',
  '/glossary',
  '/learn',
  // SEO/crawler surfaces — extensionless URLs the middleware matcher doesn't
  // skip, so they must be explicitly public or link previews break.
  '/og', // dynamic Open Graph image generator
  '/opengraph-image',
  '/twitter-image',
  '/manifest.webmanifest',
];

/** Auth pages — if logged in, user gets redirected away from these. */
export const AUTH_ROUTES: string[] = ['/login', '/signup'];
