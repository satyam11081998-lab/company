import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Real leaderboard + rivalry data. Everything here is computed from live rows
 * (users / submissions / case_attempts) via the SERVICE-ROLE client — never
 * mocked. users is owner-scoped under RLS, so the cookie client can't read
 * cross-user rows; these functions must be called from a server component with
 * the service client.
 *
 * No PII (email) ever leaves this module — only name / avatar / points.
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface LbRow {
  id: string;
  name: string;
  avatar_url: string | null;
  points: number;
  rank: number;
  submissions: number;
  college: string | null;
  linkedinUrl: string | null;   // null = not shown (no URL or opted out)
  isYou: boolean;
}

export interface Rival {
  name: string;
  points: number;
  gap: number;            // absolute points difference vs. you
  weeklyGain: number;     // real points they earned in the last 7 days
  etaDays: number | null; // days for them to close `gap` at their pace; null if they've been idle
}

export interface YouSummary {
  rank: number;
  points: number;
  total: number;
  percentile: number | null; // top X% (1 = top 1%)
  ahead: Rival | null;       // the person directly above you — your target
  behind: Rival | null;      // the person directly below you — chasing you
  weeklyGain: number;        // your own real 7-day points
}

export interface LeaderboardView {
  rows: LbRow[];
  you: YouSummary | null;
  total: number;
  scopeLabel: string;        // e.g. "All India" or "IIM Ahmedabad"
}

/** Real 7-day points (sum of first-attempt submission scores) for a set of users. */
async function weeklyGainByUser(
  svc: SupabaseClient,
  userIds: string[],
): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  if (!userIds.length) return out;
  const since = new Date(Date.now() - WEEK_MS).toISOString();
  try {
    const { data } = await svc
      .from('case_attempts')
      .select('user_id, submissions(score)')
      .in('user_id', userIds)
      .eq('is_first_attempt', true)
      .gte('created_at', since);
    for (const r of (data as any[]) || []) {
      const score = r?.submissions?.score ?? 0;
      out[r.user_id] = (out[r.user_id] || 0) + (typeof score === 'number' ? score : 0);
    }
  } catch {
    /* keep zeros — honest "idle" rather than a fabricated rate */
  }
  return out;
}

function etaDays(gap: number, weeklyGain: number): number | null {
  if (weeklyGain <= 0 || gap <= 0) return null;
  return Math.max(1, Math.ceil(gap / (weeklyGain / 7)));
}

/**
 * Build a leaderboard from an ordered (points desc) set of user rows + the
 * viewer's true global rank. `rankBase` is how many users sit strictly above
 * the first row in `rows` (0 for an all-scope board that starts at #1).
 */
/**
 * Estimate solves from points for restored/legacy users with no submission rows.
 * Each first-attempt solve awards its 0-100 score to points; an engaged user
 * averages ~62/solve, so solves ≈ points / 62. Only used as a fallback when the
 * real submission count is 0 (real users always keep their true counts).
 */
const AVG_SCORE_PER_SOLVE = 62;
function estimateSolvesFromPoints(points: number): number {
  return points > 0 ? Math.max(1, Math.round(points / AVG_SCORE_PER_SOLVE)) : 0;
}

/**
 * A user is only RANKED (shown on the board / counted as a rival) once they have
 * solved at least this many questions. Keeps brand-new accounts with 0-2 solves
 * off the public board.
 */
export const MIN_SOLVES_TO_RANK = 3;

/**
 * Effective solves used for both the display count and the ranking gate: the real
 * submission count when present, else estimated from points for seeded/restored
 * users (who carry points but no submission rows). Matches the `submissions`
 * value shown on each row, so the gate and the displayed count never disagree.
 */
function effectiveSolves(realCount: number, points: number): number {
  return realCount > 0 ? realCount : estimateSolvesFromPoints(points);
}

/**
 * Drop users below the solve gate, then keep the top `limit` by points. Rows are
 * already points-desc, so slicing after the filter preserves rank order.
 */
function gateAndSlice<T extends { id: string; points: number }>(
  rows: T[],
  subCounts: Record<string, number>,
  limit: number,
): T[] {
  return rows
    .filter((u) => effectiveSolves(subCounts[u.id] || 0, u.points ?? 0) >= MIN_SOLVES_TO_RANK)
    .slice(0, limit);
}

async function buildView(
  svc: SupabaseClient,
  rows: Array<{ id: string; name: string | null; avatar_url: string | null; points: number; college_id?: string | null; college_other?: string | null; linkedin_url?: string | null; show_linkedin?: boolean | null }>,
  userId: string,
  myRank: number,
  myPoints: number,
  total: number,
  scopeLabel: string,
  subCounts: Record<string, number>,
  collegeNames: Record<string, string>,
): Promise<LeaderboardView> {
  const lbRows: LbRow[] = rows.map((u, i) => ({
    id: u.id,
    name: u.name || 'Aspirant',
    avatar_url: u.avatar_url,
    points: u.points ?? 0,
    rank: i + 1,
    // Real submission count when present; for restored users (points but no
    // submission rows) estimate from points using the real marking rule (~62/solve).
    submissions: effectiveSolves(subCounts[u.id] || 0, u.points ?? 0),
    college: (u.college_id && collegeNames[u.college_id]) || u.college_other || null,
    // Default-visible (opt-out): only hidden when explicitly false or no URL.
    linkedinUrl: (u.show_linkedin !== false && u.linkedin_url) ? u.linkedin_url : null,
    isYou: u.id === userId,
  }));

  // Neighbours for the rivalry strip: smallest points strictly above me, and
  // the largest strictly below me — within this scope.
  let ahead: { id: string; name: string | null; points: number } | null = null;
  let behind: { id: string; name: string | null; points: number } | null = null;
  for (const u of rows) {
    if (u.id === userId) continue;
    const p = u.points ?? 0;
    if (p > myPoints) { if (!ahead || p < ahead.points) ahead = u; }
    else if (p < myPoints) { if (!behind || p > behind.points) behind = u; }
  }

  const gains = await weeklyGainByUser(
    svc,
    [userId, ahead?.id, behind?.id].filter(Boolean) as string[],
  );

  const mkRival = (u: { id: string; name: string | null; points: number } | null): Rival | null => {
    if (!u) return null;
    const gap = Math.abs((u.points ?? 0) - myPoints);
    const wk = gains[u.id] || 0;
    return { name: u.name || 'Aspirant', points: u.points ?? 0, gap, weeklyGain: wk, etaDays: etaDays(gap, wk) };
  };

  const you: YouSummary = {
    rank: myRank,
    points: myPoints,
    total,
    percentile: total > 1 ? Math.max(1, Math.round((myRank / total) * 100)) : null,
    ahead: mkRival(ahead),
    behind: mkRival(behind),
    weeklyGain: gains[userId] || 0,
  };

  return { rows: lbRows, you, total, scopeLabel };
}

/** Submission counts for a set of users (real). */
async function subCountsFor(svc: SupabaseClient, ids: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  if (!ids.length) return out;
  try {
    const { data } = await svc.from('submissions').select('user_id').in('user_id', ids);
    for (const r of (data as any[]) || []) out[r.user_id] = (out[r.user_id] || 0) + 1;
  } catch { /* counts are nice-to-have */ }
  return out;
}

/** Resolve college display names for a set of college ids (short_name preferred). */
async function collegeNamesFor(svc: SupabaseClient, ids: Array<string | null | undefined>): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const uniq = Array.from(new Set(ids.filter(Boolean) as string[]));
  if (!uniq.length) return out;
  try {
    const { data } = await svc.from('colleges').select('id, short_name, name').in('id', uniq);
    for (const c of (data as any[]) || []) out[c.id] = c.short_name || c.name;
  } catch { /* names are nice-to-have */ }
  return out;
}

/** ALL-INDIA leaderboard (top `limit`) + the viewer's true global rank. */
export async function getAllTimeLeaderboard(
  svc: SupabaseClient,
  userId: string,
  limit = 50,
): Promise<LeaderboardView> {
  // Over-fetch: the solve gate drops users below it, so pull a generous pool and
  // gate/slice down to `limit` qualifying rows (gated-out users sit at the tail).
  const poolSize = Math.max(limit * 4, 200);
  const [{ data: poolRows }, meRes, totalRes] = await Promise.all([
    svc.from('users').select('id, name, avatar_url, points, college_id, college_other, linkedin_url, show_linkedin').order('points', { ascending: false }).limit(poolSize),
    svc.from('users').select('points').eq('id', userId).maybeSingle(),
    svc.from('users').select('id', { count: 'exact', head: true }),
  ]);
  const pool = (poolRows as any[]) || [];
  const poolSubCounts = await subCountsFor(svc, pool.map((r) => r.id));
  const rows = gateAndSlice(pool, poolSubCounts, limit);
  const myPoints = (meRes.data as any)?.points ?? 0;
  const { count: aboveCount } = await svc
    .from('users').select('id', { count: 'exact', head: true }).gt('points', myPoints);
  const myRank = (aboveCount ?? 0) + 1;
  const total = totalRes.count ?? rows.length;
  const collegeNames = await collegeNamesFor(svc, rows.map((r) => r.college_id));
  return buildView(svc, rows, userId, myRank, myPoints, total, 'All India', poolSubCounts, collegeNames);
}

/** COHORT leaderboard — everyone at the viewer's college. */
export async function getCohortLeaderboard(
  svc: SupabaseClient,
  userId: string,
  limit = 50,
): Promise<{ view: LeaderboardView | null; collegeName: string | null }> {
  const { data: me } = await svc
    .from('users').select('points, college_id').eq('id', userId).maybeSingle();
  const collegeId = (me as any)?.college_id;
  if (!collegeId) return { view: null, collegeName: null };

  let collegeName: string | null = null;
  try {
    const { data: c } = await svc.from('colleges').select('short_name, name').eq('id', collegeId).maybeSingle();
    collegeName = (c as any)?.short_name || (c as any)?.name || null;
  } catch { /* label only */ }

  const poolSize = Math.max(limit * 4, 200);
  const [{ data: poolRows }, totalRes] = await Promise.all([
    svc.from('users').select('id, name, avatar_url, points, college_id, college_other, linkedin_url, show_linkedin').eq('college_id', collegeId)
      .order('points', { ascending: false }).limit(poolSize),
    svc.from('users').select('id', { count: 'exact', head: true }).eq('college_id', collegeId),
  ]);
  const pool = (poolRows as any[]) || [];
  const poolSubCounts = await subCountsFor(svc, pool.map((r) => r.id));
  const rows = gateAndSlice(pool, poolSubCounts, limit);
  const myPoints = (me as any)?.points ?? 0;
  const { count: aboveCount } = await svc
    .from('users').select('id', { count: 'exact', head: true }).eq('college_id', collegeId).gt('points', myPoints);
  const myRank = (aboveCount ?? 0) + 1;
  const total = totalRes.count ?? rows.length;
  const collegeNames = await collegeNamesFor(svc, rows.map((r) => r.college_id));
  const view = await buildView(svc, rows, userId, myRank, myPoints, total, collegeName || 'Your college', poolSubCounts, collegeNames);
  return { view, collegeName };
}
