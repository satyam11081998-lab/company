/**
 * Bayesian shrinkage helper for small-sample fairness.
 *
 * Problem: a user with one submission scoring 85 shouldn't display the same
 * "average" as a veteran averaging 72 over 50 cases. With n=1 a high score is
 * basically noise; the dashboard should reflect that uncertainty.
 *
 * Fix: shrink the user's sample mean toward a prior mean (the cohort mean, or
 * a fixed anchor when no cohort exists). Smoothing weight k controls how fast
 * the user's own data takes over.
 *
 *      displayed = (n * sample_mean + k * prior_mean) / (n + k)
 *
 *   k = 5  → at n=1 ~83% of the prior shows; at n=5 the user and prior weigh
 *            equally; at n=20 the user's mean dominates (>80%).
 *
 * This matches the provisional-rating pattern used by Chess.com / Goodreads /
 * IMDB top-250 — well-known fix for the new-user-looks-elite problem.
 */

export const SHRINKAGE_K = 5;

/** Anchor when no cohort mean is available (rubric mid-band between mediocre & good). */
export const DEFAULT_PRIOR_SCORE = 65;

/**
 * Shrink a sample mean toward a prior mean.
 *  - At n=0 returns the prior (no user data).
 *  - At very large n returns approximately the sample mean.
 *  - k=5 is the default smoothing weight.
 */
export function shrinkMean(
  sampleMean: number,
  n: number,
  priorMean: number,
  k: number = SHRINKAGE_K,
): number {
  if (!Number.isFinite(sampleMean)) return priorMean;
  if (n <= 0) return priorMean;
  return (n * sampleMean + k * priorMean) / (n + k);
}

/**
 * Convenience copy of the same formula — kept as a separate name purely so call
 * sites read clearly ("shrink dimension earned" vs "shrink overall mean").
 */
export const shrinkDimensionEarned = shrinkMean;
