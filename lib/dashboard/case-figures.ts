import { parseVisuals, type CaseVisual } from '@/lib/results/visuals';

/**
 * The ONLY way to read the paywalled case figures.
 *
 * `public.case_figures` (migration 0069) has RLS enabled and no policy, so it
 * is unreachable with a browser JWT by construction — there is no grant to
 * forget and no policy to get subtly wrong. Reading it requires the service
 * role, which means it can only happen on the server, which means the
 * entitlement check cannot be skipped by accident.
 *
 * The figures used to live in `submissions.feedback_json`. That was
 * unenforceable: the submission row belongs to the user, `submissions_select_own`
 * (0006) lets them read it over PostgREST directly, and three server pages
 * already ship whole feedback_json blobs into client components. See
 * services/case_figures.py and 0069 for the full account.
 *
 * The `server-only` package is not a dependency of this project, so the guard
 * below stands in for it: importing this module from a client component makes
 * the page throw loudly on hydration instead of quietly shipping a
 * service-role read into the browser bundle.
 */

// Module-scope, so it fires on import rather than on first call.
if (typeof window !== 'undefined') {
  throw new Error(
    'lib/dashboard/case-figures.ts is server-only — it reads a service-role ' +
      'table holding paywalled content. Do not import it from a client component.',
  );
}

/** Minimal shape of a service-role Supabase client. */
interface Svc {
  from: (table: string) => any;
}

/**
 * Figures for one case. Returns [] when the caller is not entitled, when the
 * case has none, or when the table does not exist yet (pre-0069).
 *
 * @param entitled  the caller's resolved entitlement. Passed IN rather than
 *                  computed here so the decision stays with the page that
 *                  knows the user, and so this function cannot be called in a
 *                  way that quietly assumes access.
 */
export async function getCaseFigures(
  svc: Svc | null,
  caseId: string | null | undefined,
  entitled: boolean,
): Promise<CaseVisual[]> {
  if (!svc || !entitled || !caseId) return [];
  try {
    const { data } = await svc
      .from('case_figures')
      .select('figures')
      .eq('case_id', caseId)
      .maybeSingle();
    return parseVisuals((data as { figures?: unknown } | null)?.figures);
  } catch {
    return [];
  }
}

/**
 * Figures for several cases at once — one query, not one per case.
 *
 * Only the ids in `unlockedCaseIds` are fetched. The caller has already
 * applied BOTH locks (entitlement and has-attempted) to produce that list, so
 * a figure the user may not see is never read out of the database at all.
 */
export async function getCaseFiguresBulk(
  svc: Svc | null,
  unlockedCaseIds: string[],
): Promise<Map<string, CaseVisual[]>> {
  const out = new Map<string, CaseVisual[]>();
  if (!svc || !unlockedCaseIds.length) return out;
  try {
    const { data } = await svc
      .from('case_figures')
      .select('case_id, figures')
      .in('case_id', unlockedCaseIds);
    for (const row of (data ?? []) as Array<{ case_id: string; figures: unknown }>) {
      const v = parseVisuals(row.figures);
      if (v.length) out.set(row.case_id, v);
    }
  } catch {
    /* pre-0069 database — no figures anywhere, which is a correct answer */
  }
  return out;
}

/**
 * Which of these cases have figures AT ALL — ids only, no figure data.
 *
 * This is what the lock screen needs: it must only offer the Pro upsell when
 * there is genuinely something behind the lock. The previous implementation
 * counted SCORED SUBMISSIONS instead, so any case scored before figures
 * existed reported "figures available", a free user was shown the upsell,
 * upgraded, and found nothing there. Asking the figures table directly is
 * both exact and cheaper.
 */
export async function getCasesWithFigures(
  svc: Svc | null,
  caseIds: string[],
): Promise<Set<string>> {
  const out = new Set<string>();
  if (!svc || !caseIds.length) return out;
  try {
    const { data } = await svc.from('case_figures').select('case_id').in('case_id', caseIds);
    for (const row of (data ?? []) as Array<{ case_id: string }>) out.add(row.case_id);
  } catch {
    /* pre-0069 — nothing has figures */
  }
  return out;
}

/**
 * The KINDS of figure a case has — nothing else.
 *
 * This is what a LOCKED user's screen is allowed to know. It reads the figures
 * server-side and immediately throws away everything except `kind`, which
 * comes from our own six-value enum (`parseVisuals` guarantees it), so no
 * model-written string and no number from the case can reach the response.
 *
 * Titles and captions are deliberately NOT returned: those are generated from
 * the case and a caption can perfectly well be the answer
 * ("Revenue of Rs 1,840cr falls to Rs 132cr operating profit"). The lock
 * screen uses FIGURE_KIND_LABEL in results-deck.tsx instead — six strings
 * written in the repo that can never leak anything.
 */
export async function getCaseFigureKinds(
  svc: Svc | null,
  caseId: string | null | undefined,
): Promise<CaseVisual['kind'][]> {
  if (!svc || !caseId) return [];
  try {
    const { data } = await svc
      .from('case_figures')
      .select('figures')
      .eq('case_id', caseId)
      .maybeSingle();
    return parseVisuals((data as { figures?: unknown } | null)?.figures).map((v) => v.kind);
  } catch {
    return [];
  }
}
