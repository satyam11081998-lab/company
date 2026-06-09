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
async function buildView(
  svc: SupabaseClient,
  rows: Array<{ id: string; name: string | null; avatar_url: string | null; points: number }>,
  userId: string,
  myRank: number,
  myPoints: number,
  total: number,
  scopeLabel: string,
  subCounts: Record<string, number>,
): Promise<LeaderboardView> {
  const lbRows: LbRow[] = rows.map((u, i) => ({
    id: u.id,
    name: u.name || 'Aspirant',
    avatar_url: u.avatar_url,
    points: u.points ?? 0,
    rank: i + 1,
    submissions: subCounts[u.id] || 0,
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

/** ALL-INDIA leaderboard (top `limit`) + the viewer's true global rank. */
export async function getAllTimeLeaderboard(
  svc: SupabaseClient,
  userId: string,
  limit = 50,
): Promise<LeaderboardView> {
  const [{ data: topRows }, meRes, totalRes] = await Promise.all([
    svc.from('users').select('id, name, avatar_url, points').order('points', { ascending: false }).limit(limit),
    svc.from('users').select('points').eq('id', userId).maybeSingle(),
    svc.from('users').select('id', { count: 'exact', head: true }),
  ]);
  const rows = (topRows as any[]) || [];
  const myPoints = (meRes.data as any)?.points ?? 0;
  const { count: aboveCount } = await svc
    .from('users').select('id', { count: 'exact', head: true }).gt('points', myPoints);
  const myRank = (aboveCount ?? 0) + 1;
  const total = totalRes.count ?? rows.length;
  const subCounts = await subCountsFor(svc, rows.map((r) => r.id));
  return buildView(svc, rows, userId, myRank, myPoints, total, 'All India', subCounts);
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

  const [{ data: topRows }, totalRes] = await Promise.all([
    svc.from('users').select('id, name, avatar_url, points').eq('college_id', collegeId)
      .order('points', { ascending: false }).limit(limit),
    svc.from('users').select('id', { count: 'exact', head: true }).eq('college_id', collegeId),
  ]);
  const rows = (topRows as any[]) || [];
  const myPoints = (me as any)?.points ?? 0;
  const { count: aboveCount } = await svc
    .from('users').select('id', { count: 'exact', head: true }).eq('college_id', collegeId).gt('points', myPoints);
  const myRank = (aboveCount ?? 0) + 1;
  const total = totalRes.count ?? rows.length;
  const subCounts = await subCountsFor(svc, rows.map((r) => r.id));
  const view = await buildView(svc, rows, userId, myRank, myPoints, total, collegeName || 'Your college', subCounts);
  return { view, collegeName };
}
