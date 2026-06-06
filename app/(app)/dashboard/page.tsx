import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { computeReadiness, type ReadinessSubmission } from '@/lib/readiness';
import { nextAction, computeFreeQuota } from '@/lib/next-action';
import { SCORE_DIMENSIONS, type ScoreDimension } from '@/lib/constants';
import { GUESSTIMATE_DIMENSIONS, type GuesstimateDimension } from '@/lib/constants';
import type { UserRow } from '@/lib/types';
import DashboardClient from '@/components/dashboard-client';
import { getDailyTodayServerSide } from '@/lib/daily-server';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient(); // real client is synchronous (Phase 1)

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  // Parallel fetches for performance
  const [userRes, rawSubsRes, attemptsRes, benchmarkRes, dailyToday] = await Promise.all([
    supabase
      .from('users')
      .select('id, name, points, subscription_tier, streak_count, streak_last_date, created_at')
      .eq('id', authUser.id)
      .single<UserRow>(),
    supabase
      .from('submissions')
      .select('id, user_id, case_id, answer_text, score, feedback_json, created_at, cases(type, difficulty)')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('case_attempts')
      .select('submission_id, is_first_attempt')
      .eq('user_id', authUser.id),
    supabase
      .from('submissions')
      .select('feedback_json')
      .not('feedback_json', 'is', null)
      .limit(100),
    // Daily picks read straight from Supabase (instant; no Render round-trip)
    getDailyTodayServerSide(),
  ]);

  const userRow = userRes.data;
  const rawSubs = rawSubsRes.data;
  const attempts = attemptsRes.data;

  const firstByesSub = new Map<string, boolean>(
    (attempts ?? []).map((a: any) => [a.submission_id, a.is_first_attempt])
  );

  const submissions: ReadinessSubmission[] = (rawSubs ?? []).map((s: any) => ({
    id: s.id,
    user_id: s.user_id,
    case_id: s.case_id,
    answer_text: s.answer_text,
    score: s.score,
    feedback_json: s.feedback_json,
    created_at: s.created_at,
    case_type: s.cases?.type ?? null,
    case_difficulty: s.cases?.difficulty ?? null,
    is_first_attempt: firstByesSub.get(s.id) ?? true,
  }));

  const tier = userRow?.subscription_tier ?? 'free';
  const streak = userRow?.streak_count ?? 0;
  const points = userRow?.points ?? 0;
  const userName = (userRow?.name ?? authUser.email ?? 'there').split(' ')[0];

  // --- peer comparison (O(1) rank, restored from the original dashboard) ---
  const [rankCountRes, totalCountRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).gt('points', points),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ]);
  const rankNum = (rankCountRes.count ?? 0) + 1;
  const totalUsers = totalCountRes.count ?? 0;
  const percentile = totalUsers > 1 ? Math.round(((totalUsers - rankNum) / (totalUsers - 1)) * 100) : null;
  const scored = submissions.filter((s) => s.score != null && s.case_type !== 'guesstimate');
  const avgScore = scored.length ? Math.round(scored.reduce((a, s) => a + (s.score as number), 0) / scored.length) : null;

  // --- (readiness/action/quota built below, after the benchmark) ---

  // Reconciled global cohort benchmark
  const benchmarkAgg: Record<string, { sum: number; count: number }> = {};
  (benchmarkRes.data || []).forEach((sub) => {
    // Guesstimates use a different 5-dim rubric (1..5) — keep them out of the 6-dim
    // case benchmark so their `structure` (1..5) doesn't pollute case `structure` (0..25).
    if ((sub.feedback_json as { rubric?: string })?.rubric === 'guesstimate') return;
    const breakdown = (sub.feedback_json as { breakdown?: Record<string, number> })?.breakdown;
    if (breakdown) {
      Object.entries(breakdown).forEach(([dim, val]) => {
        if (typeof val === 'number') {
          if (!benchmarkAgg[dim]) benchmarkAgg[dim] = { sum: 0, count: 0 };
          benchmarkAgg[dim].sum += val;
          benchmarkAgg[dim].count++;
        }
      });
    }
  });
  
  const benchmark: Partial<Record<ScoreDimension, number>> = {};
  Object.entries(benchmarkAgg).forEach(([dim, { sum, count }]) => {
    if (count > 0) benchmark[dim as ScoreDimension] = Math.round(sum / count);
  });

  // --- pure, verified pipeline ---
  const readiness = computeReadiness({ submissions, streak });
  const action = nextAction(readiness, tier);
  const quota = computeFreeQuota(tier, submissions);

  const trajectory = submissions
    .filter((s) => s.score != null && (s.is_first_attempt ?? true) && s.case_type !== 'guesstimate')
    .map((s) => s.score as number);

  // --- Guesstimate skills (separate 5-dim chart; guesstimates only) ---
  const guesstimateSubs = submissions.filter(
    (s) => s.case_type === 'guesstimate' && s.score != null
  );
  const gAgg: Record<string, { sum: number; count: number }> = {};
  guesstimateSubs.forEach((s) => {
    const bd = (s.feedback_json as { breakdown?: Record<string, number> })?.breakdown;
    if (!bd) return;
    GUESSTIMATE_DIMENSIONS.forEach((dim) => {
      const v = bd[dim];
      if (typeof v === 'number') {
        if (!gAgg[dim]) gAgg[dim] = { sum: 0, count: 0 };
        gAgg[dim].sum += v;
        gAgg[dim].count++;
      }
    });
  });
  const guesstimateSkills: Partial<Record<GuesstimateDimension, number>> = {};
  GUESSTIMATE_DIMENSIONS.forEach((dim) => {
    if (gAgg[dim]?.count) guesstimateSkills[dim] = gAgg[dim].sum / gAgg[dim].count;
  });
  const guesstimateCount = guesstimateSubs.length;

  return (
    <div className="container max-w-6xl py-10">
      <DashboardClient
        userName={userName}
        points={points}
        readiness={readiness}
        action={action}
        quota={quota}
        benchmark={benchmark}
        trajectory={trajectory}
        submissions={submissions}
        rankNum={rankNum}
        totalUsers={totalUsers}
        percentile={percentile}
        avgScore={avgScore}
        streak={streak}
        initialDaily={dailyToday}
        guesstimateSkills={guesstimateSkills}
        guesstimateCount={guesstimateCount}
      />
    </div>
  );
}
