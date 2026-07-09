import type { CaseRow, UserRow } from '@/lib/types';
import { effectiveTier, TIER_LIMITS } from '@/lib/tier';

function todayIst(): string {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export type AttemptReason = 'ok' | 'free-non-daily' | 'free-extra-used' | 'free-reattempt' | 'lite-quota';

export interface AttemptAccess {
  allowed: boolean;
  reason: AttemptReason;
  bucket: 'case' | 'guesstimate';
  remaining: number | null; // null = unlimited / not applicable
}

/**
 * Mirrors backend services/access_guard.py for UX (form vs lock).
 * The backend /submit is the authoritative gate — keep the two in sync.
 */
export async function getAttemptAccess(
  supabase: any, // server Supabase client (typed loosely to avoid generic-variance friction)
  user: UserRow | null,
  caseRow: Pick<CaseRow, 'id' | 'type' | 'code'>,
): Promise<AttemptAccess> {
  const bucket: 'case' | 'guesstimate' = caseRow.type === 'guesstimate' ? 'guesstimate' : 'case';
  const tier = effectiveTier(user);
  if (tier === 'pro') return { allowed: true, reason: 'ok', bucket, remaining: null };

  const today = todayIst();
  // Most recent schedule on/before today — NOT an exact-date match. Before the
  // morning cron writes today's row, the dashboard (lib/daily-server.ts, same
  // fallback) shows yesterday's dailies; this gate must treat those as the
  // dailies too, or a free user clicking the tile would burn their one-time
  // bank credit / hit a lock. Keep both call sites in sync.
  const { data: schedRows } = await supabase
    .from('daily_schedule')
    .select('case_id, guesstimate_code, scheduled_date')
    .lte('scheduled_date', today)
    .order('scheduled_date', { ascending: false })
    .limit(1);
  const sched = schedRows?.[0] as { case_id?: string; guesstimate_code?: string } | undefined;
  // guesstimate_code may hold a UUID id OR a short code — match either so the
  // daily guesstimate is correctly recognised (otherwise free users get locked).
  const dailyRefs = new Set<string>(
    [sched?.case_id, sched?.guesstimate_code].filter(Boolean) as string[],
  );
  const isDaily =
    dailyRefs.has(caseRow.id) || (caseRow.code != null && dailyRefs.has(caseRow.code));

  const uid = user?.id ?? '';
  const { data: priorRows } = await supabase
    .from('case_attempts')
    .select('id')
    .eq('user_id', uid)
    .eq('case_id', caseRow.id)
    .limit(1);
  const isFirst = !(priorRows && priorRows.length);

  if (isDaily) {
    if (tier === 'free' && !isFirst) return { allowed: false, reason: 'free-reattempt', bucket, remaining: 0 };
    return { allowed: true, reason: 'ok', bucket, remaining: null };
  }

  if (tier === 'free') {
    // Free-tier rework (2026-07): ONE-TIME extras — a free account can attempt
    // ONE non-daily case and ONE non-daily guesstimate EVER (on top of the
    // dailies). Mirrors backend services/access_guard.py — keep in sync.
    if (!user) return { allowed: false, reason: 'free-non-daily', bucket, remaining: 0 };
    const { data: firstRows } = await supabase
      .from('case_attempts')
      .select('case_id, counted_for_daily')
      .eq('user_id', uid)
      .eq('is_first_attempt', true);
    const candidateIds = (firstRows || [])
      .filter((r: any) => !r.counted_for_daily && !dailyRefs.has(r.case_id))
      .map((r: any) => r.case_id);
    let used = 0;
    if (candidateIds.length) {
      const { data: types } = await supabase.from('cases').select('id, type').in('id', candidateIds);
      used = (types || []).filter(
        (t: any) => (t.type === 'guesstimate' ? 'guesstimate' : 'case') === bucket,
      ).length;
    }
    const cap = bucket === 'guesstimate'
      ? (TIER_LIMITS.free.lifetimeExtraGuesstimates as number)
      : (TIER_LIMITS.free.lifetimeExtraCases as number);
    return used >= cap
      ? { allowed: false, reason: 'free-extra-used', bucket, remaining: 0 }
      : { allowed: true, reason: 'ok', bucket, remaining: cap - used };
  }

  // lite, non-daily
  if (!isFirst) return { allowed: true, reason: 'ok', bucket, remaining: null };
  const startIso = `${today}T00:00:00+05:30`;
  const { data: todayRows } = await supabase
    .from('case_attempts')
    .select('case_id, counted_for_daily, created_at')
    .eq('user_id', uid)
    .eq('is_first_attempt', true)
    .gte('created_at', startIso);
  const candidateIds = (todayRows || [])
    .filter((r: any) => !r.counted_for_daily && !dailyRefs.has(r.case_id))
    .map((r: any) => r.case_id);
  let used = 0;
  if (candidateIds.length) {
    const { data: types } = await supabase.from('cases').select('id, type').in('id', candidateIds);
    used = (types || []).filter(
      (t: any) => (t.type === 'guesstimate' ? 'guesstimate' : 'case') === bucket,
    ).length;
  }
  const cap = bucket === 'guesstimate'
    ? (TIER_LIMITS.lite.dailyExtraGuesstimates as number)
    : (TIER_LIMITS.lite.dailyExtraCases as number);
  return used >= cap
    ? { allowed: false, reason: 'lite-quota', bucket, remaining: 0 }
    : { allowed: true, reason: 'ok', bucket, remaining: cap - used };
}
