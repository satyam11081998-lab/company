/**
 * Where a brand-new account goes after onboarding (2026-10-07).
 *
 * A guest who solves a case is asked to sign up at the moment they want their
 * score. The onboarding gate (lib/supabase/middleware.ts) then sends the new,
 * not-yet-onboarded account to /onboarding before it can reach that score.
 * Only two destinations are worth carrying through that detour:
 *   /results/<id>  the score they signed up to see;
 *   /cases/<id>    the case whose finished answer is waiting to be scored.
 * Anything else (the dashboard, "/") keeps the usual post-onboarding landing.
 *
 * Pure and dependency-free so the Edge middleware, the onboarding page and the
 * onboarding form all apply the SAME rule. Strict on purpose: a single path
 * segment of id characters, no query string, so it can never be bent into an
 * open redirect.
 */
export function isReturnDestination(path: string | null | undefined): path is string {
  return typeof path === 'string' && /^\/(results|cases)\/[A-Za-z0-9_-]{1,80}$/.test(path);
}

/** sessionStorage key the solve screen parks the return path under. */
export const AFTER_ONBOARDING_KEY = 'mece:after-onboarding';
