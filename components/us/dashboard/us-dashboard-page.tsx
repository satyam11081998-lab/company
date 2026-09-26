import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { effectiveTier } from '@/lib/tier-core';
import { TZ_COOKIE } from '@/lib/market';
import type { DailyContentResponse } from '@/lib/api';
import type { UserRow } from '@/lib/types';
import {
  buildToday,
  buildUsDashboard,
  type UsActiveAttemptRow,
  type UsSubmissionRow,
  type UsTodayInput,
} from '@/lib/us-market/dashboard';
import UsDashboard from '@/components/us/dashboard/us-dashboard';
import { safeTz } from '@/components/us/dashboard/format';
import FeedbackPrompt from '@/components/feedback-prompt';

/**
 * Data loader for the US dashboard (market 'US' — US and Europe accounts).
 * Called from app/(app)/dashboard/page.tsx BEFORE any India query runs, so
 * the India dashboard's code path is untouched.
 *
 * Three reads, all the user's own rows under RLS (no service role needed):
 *   - submissions (+ the case's title/type/difficulty, and only the
 *     breakdown/rubric keys of feedback_json — not the whole feedback blob)
 *   - open (unsubmitted) attempts, for "pick up where you left off"
 *   - interview_meta of today's two items (minutes, points, industry)
 * Every read degrades to an empty list; the page always renders.
 */
export default async function UsDashboardPage({
  authUser,
  userRow,
  daily,
}: {
  authUser: User;
  userRow: UserRow | null;
  daily: DailyContentResponse;
}) {
  const supabase = createClient();
  const todayIds = [daily.case?.id, daily.guesstimate?.id].filter(Boolean) as string[];

  const [subsRes, activeRes, metaRes] = await Promise.all([
    supabase
      .from('submissions')
      .select('id, case_id, score, created_at, breakdown:feedback_json->breakdown, rubric:feedback_json->>rubric, cases(title, type, difficulty)')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(400),
    supabase
      .from('attempts')
      .select('id, case_id, created_at, cases(title, type), attempt_messages(count)')
      .eq('user_id', authUser.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12),
    todayIds.length
      ? supabase.from('cases').select('id, interview_meta').in('id', todayIds)
      : Promise.resolve({ data: [] as { id: string; interview_meta: unknown }[], error: null }),
  ]);

  if (subsRes.error) console.error('[us-dashboard] submissions read failed:', subsRes.error.message);
  if (activeRes.error) console.error('[us-dashboard] attempts read failed (continue module hidden):', activeRes.error.message);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const subs: UsSubmissionRow[] = ((subsRes.data ?? []) as any[]).map((r) => {
    const c = Array.isArray(r.cases) ? r.cases[0] : r.cases;
    const bd = r.breakdown && typeof r.breakdown === 'object' && !Array.isArray(r.breakdown) ? (r.breakdown as Record<string, number>) : null;
    return {
      id: r.id,
      case_id: r.case_id ?? null,
      score: typeof r.score === 'number' ? r.score : r.score == null ? null : Number(r.score),
      created_at: r.created_at,
      type: c?.type ?? null,
      title: c?.title ?? null,
      difficulty: c?.difficulty ?? null,
      breakdown: bd,
      rubric: typeof r.rubric === 'string' ? r.rubric : null,
    };
  });

  const active: UsActiveAttemptRow[] = activeRes.error
    ? []
    : ((activeRes.data ?? []) as any[]).map((a) => {
        const c = Array.isArray(a.cases) ? a.cases[0] : a.cases;
        const m = Array.isArray(a.attempt_messages) ? a.attempt_messages[0] : a.attempt_messages;
        return {
          id: a.id,
          case_id: a.case_id,
          created_at: a.created_at,
          title: c?.title ?? null,
          type: c?.type ?? null,
          messages: typeof m?.count === 'number' ? m.count : null,
        };
      });

  const metaById = new Map<string, UsTodayInput['interview_meta']>(
    ((metaRes.data ?? []) as any[]).map((r) => [r.id, r.interview_meta && typeof r.interview_meta === 'object' ? r.interview_meta : null]),
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const toInput = (c: DailyContentResponse['case']): UsTodayInput | null =>
    c ? { id: c.id, title: c.title, type: c.type, difficulty: c.difficulty, interview_meta: metaById.get(c.id) ?? null } : null;

  const model = buildUsDashboard(subs, active);
  const tz = safeTz(cookies().get(TZ_COOKIE)?.value ? decodeURIComponent(cookies().get(TZ_COOKIE)!.value) : null);
  const firstName = (userRow?.name || authUser.user_metadata?.full_name || '').trim().split(/\s+/)[0] || null;
  const isGuest = authUser.is_anonymous === true || userRow?.is_guest === true;

  return (
    <>
      <UsDashboard
        firstName={isGuest ? null : firstName}
        tz={tz}
        model={model}
        todayCase={buildToday(toInput(daily.case), subs)}
        todaySizing={buildToday(toInput(daily.guesstimate), subs)}
        tier={effectiveTier(userRow)}
        expiresAt={userRow?.subscription_expires_at ?? null}
        isGuest={isGuest}
        streak={userRow?.streak_count ?? 0}
      />
      <FeedbackPrompt completedCount={subs.length} />
    </>
  );
}
