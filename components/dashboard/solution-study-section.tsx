import { createServiceClient } from '@/lib/supabase/service';
import type { ContentMarket } from '@/lib/market';
import { marketScoped } from '@/lib/market-db';
import { getAttemptAccess, type AttemptReason } from '@/lib/access';
import { getCaseInsights } from '@/lib/dashboard/case-insights';
import SolutionStudy, { type GateInfo } from './solution-study';
import type { CaseRow, UserRow } from '@/lib/types';

/**
 * Server half of the dashboard's "Study a solution" panel.
 *
 * Picks the cases worth putting in front of THIS user — the ones they have
 * actually attempted first (their own decompositions are the most useful thing
 * to re-read), topped up with recent active cases — then resolves two
 * independent permissions for each: whether the figures may be shown (the
 * spoiler rule, in getCaseInsights) and whether the case may be attempted
 * (tier + daily rotation, via lib/access.ts).
 *
 * Both are advisory. `services/access_guard.py` on submit is the real boundary;
 * this exists so the UI tells the truth about it rather than letting someone
 * click into a case they will be refused at the end of.
 *
 * Renders nothing when there is nothing to show, so the dashboard does not grow
 * an empty section for a brand-new account.
 */
export default async function SolutionStudySection({
  user,
  userId,
  market = 'IN',
}: {
  user: UserRow | null;
  userId: string | null;
  /** MARKETS (0070): top-up cases come from the viewer's own bank only. */
  market?: ContentMarket;
}) {
  if (!userId) return null;

  let svc;
  try {
    svc = createServiceClient();
  } catch {
    // No service-role key in this environment — the panel is a nice-to-have,
    // never a reason to fail the dashboard.
    return null;
  }

  // Cases the user has actually been scored on, most recent first.
  const { data: mine } = await svc
    .from('submissions')
    .select('case_id, created_at')
    .eq('user_id', userId)
    .not('score', 'is', null)
    .order('created_at', { ascending: false })
    .limit(30);

  const attemptedIds: string[] = [];
  for (const row of (mine ?? []) as Array<{ case_id: string }>) {
    if (row.case_id && !attemptedIds.includes(row.case_id)) attemptedIds.push(row.case_id);
    if (attemptedIds.length >= 4) break;
  }

  // Top up with recent active cases so a new account still has something here.
  const { data: recent } = await marketScoped(
    market,
    () => svc
      .from('cases')
      .select('id, type, code, unlisted, market')
      .eq('is_active', true)
      .eq('market', market)
      .or('unlisted.is.null,unlisted.eq.false')
      .order('created_at', { ascending: false })
      .limit(12),
    () => svc
      .from('cases')
      .select('id, type, code, unlisted')
      .eq('is_active', true)
      .or('unlisted.is.null,unlisted.eq.false')
      .order('created_at', { ascending: false })
      .limit(12),
  );

  const recentRows = (recent ?? []) as Array<Pick<CaseRow, 'id' | 'type' | 'code' | 'unlisted' | 'market'>>;
  const ids = [...attemptedIds];
  for (const r of recentRows) {
    if (ids.length >= 6) break;
    if (!ids.includes(r.id)) ids.push(r.id);
  }
  if (!ids.length) return null;

  const insights = await getCaseInsights(svc, ids, userId, user);
  if (!insights.length) return null;

  // Resolve the attempt gate per case. getAttemptAccess mirrors the backend
  // rules; running them in parallel keeps this off the critical path length.
  const rowById = new Map(recentRows.map((r) => [r.id, r]));
  const gates: GateInfo[] = await Promise.all(
    insights.map(async (i) => {
      const row = rowById.get(i.caseId) ?? {
        id: i.caseId,
        type: (i.type ?? 'case') as CaseRow['type'],
        code: null as unknown as CaseRow['code'],
        unlisted: false as unknown as CaseRow['unlisted'],
        // Attempted cases (not in the top-up list) are the user's own history,
        // which can only be in their own market's bank.
        market: market as CaseRow['market'],
      };
      try {
        const access = await getAttemptAccess(svc, user, row);
        return {
          caseId: i.caseId,
          allowed: access.allowed,
          reason: access.reason,
          message: gateMessage(access.reason, access.bucket),
        };
      } catch {
        // FAIL OPEN, deliberately — and the comment here used to say the exact
        // opposite of what the code does, which is worse than either choice.
        //
        // This gate is advisory. `services/access_guard.py` on submit is the
        // real boundary and /cases/[id] re-runs the same check on open, so a
        // false "open" costs the user one extra click and a clear message,
        // while a false "locked" hides a case they have paid for behind an
        // error they cannot act on. Fail toward the cheaper mistake.
        return { caseId: i.caseId, allowed: true, reason: 'ok', message: '' };
      }
    }),
  );

  return <SolutionStudy insights={insights} gates={gates} />;
}

/** The lock, in the user's words rather than the enum's. */
function gateMessage(reason: AttemptReason, bucket: 'case' | 'guesstimate'): string {
  const thing = bucket === 'guesstimate' ? 'guesstimate' : 'case';
  switch (reason) {
    case 'free-non-daily':
      return `On the free plan you get today's ${thing} plus one extra, ever. This one is outside that — you can still study the breakdown above.`;
    case 'free-extra-used':
      return `You've used your one free extra ${thing}. Today's rotation is still open to you.`;
    case 'free-reattempt':
      return `Free accounts get one attempt per ${thing}. Re-attempts need a paid plan.`;
    case 'lite-quota':
      return `You've used this month's Lite quota. It resets on your renewal date.`;
    case 'guest-non-daily':
      return `Create a free account to attempt beyond today's ${thing}.`;
    default:
      return `This ${thing} isn't available to attempt on your plan right now.`;
  }
}
