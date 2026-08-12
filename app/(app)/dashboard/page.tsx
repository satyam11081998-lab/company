import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getCachedAuthUser, getCachedUserRow } from '@/lib/supabase/auth-cached';
import { computeReadiness, type ReadinessSubmission } from '@/lib/readiness';
import { nextAction, computeFreeQuota } from '@/lib/next-action';
import { SCORE_DIMENSIONS, type ScoreDimension } from '@/lib/constants';
import { GUESSTIMATE_DIMENSIONS, type GuesstimateDimension } from '@/lib/constants';
import type { UserRow } from '@/lib/types';
import DashboardClient from '@/components/dashboard-client';
import { DeckVaultPopup } from '@/components/deck-vault/deck-vault-promo';
import GuestPreviewFrame from '@/components/guest/guest-preview-frame';
import GuestPracticeActions from '@/components/guest/guest-practice-actions';
import GuestStartButton from '@/components/guest/guest-start-button';
// NOTE: lib/dashboard/guest-sample.ts is now unreferenced. Left on disk rather
// than deleted so the diff stays reviewable; safe to remove in a follow-up.
import { getDailyTodayServerSide } from '@/lib/daily-server';
import { getHeatmap } from '@/lib/dashboard/heatmap';
import { getGrowthDeltas } from '@/lib/dashboard/growth-deltas';
import { getActivityFeed as getRecent } from '@/lib/dashboard/recent';
import { getCohortActivity } from '@/lib/dashboard/activity-feed';
import { getPeerProximity } from '@/lib/dashboard/peer-proximity';
import { getProofRail } from '@/lib/dashboard/proof-rail';
import { getSkillGraph } from '@/lib/dashboard/skill-graph';
import { getDemoUserIdsCached, notInList } from '@/lib/dashboard/demo-users';
import { getNodeOpenTargets } from '@/lib/dashboard/node-to-case';
import { getTodayMeta } from '@/lib/dashboard/today-meta';
import { getDailyProgress } from '@/lib/dashboard/daily-progress';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Cached: layout already called this — React.cache() returns the prior
  // result with zero extra Supabase calls.
  const authUser = await getCachedAuthUser();
  // ── Guest preview ────────────────────────────────────────────────────
  // Logged-out visitors get a fully alive SAMPLE dashboard (no DB reads) so the
  // product looks intriguing, wrapped in an inert frame where every action is
  // gated behind "Sign in to continue". MUST return BEFORE any Supabase client
  // is created — createServiceClient() needs SUPABASE_SERVICE_ROLE_KEY, which
  // guests (and some local envs) don't have, so building it would throw.
  // GUEST MODE (0045, revised 2026-08-10 to the owner spec). This branch is
  // the COLD START only — a visitor with no session at all, before they have
  // clicked anything.
  //
  // A guest WITH an anonymous session falls through to the real dashboard
  // below, deliberately. That is the spec: after Explore MECE they see the
  // actual product, with every case and guesstimate visible, gated by the
  // submit wall rather than hidden behind a lesser page. Safe to hand them
  // because a just-onboarded real user has zero history too and already runs
  // this exact path — the aggregates all tolerate an empty account.
  // Their own data is genuinely empty, and `is_guest` keeps them out of
  // leaderboards, the activity feed, peer proximity and the proof rail.
  if (!authUser) {
    // GUEST MODE (0045): this branch is now the COLD START only — a visitor
    // whose first server request carried no cookie, because anonymous sessions
    // are minted on a click, never on mount (crawler safety). Once they click
    // Start they have a real anon session and fall through to the live path
    // below with their OWN data, so the sample numbers are never shown to
    // someone who has actually practised.
    //
    // The old chrome is gone deliberately: no "you're exploring a live demo"
    // banner, no sticky login bar, and nothing is `pointer-events-none`. The
    // product decision was that this must not read as a demo or nag for a
    // login — it offers the one action that matters and gets out of the way.
    // Today's real pair — the same case a signed-in user sees, and the same
    // one the landing page advertises. Guests must not be shown a different
    // case from the one they were promised on "/".
    // 'static' = the anon-key client, exactly what the landing page uses and
    // known to work for a visitor with no session. The default 'session' client
    // is cookie-backed, and a cold-start guest has no cookie — any hiccup there
    // is swallowed by getDailyTodayServerSide's catch and returns all-nulls,
    // which made the whole actions block silently render nothing.
    const guestDaily = await getDailyTodayServerSide('static');
    // The synthetic dashboard is GONE. It was a picture of someone else's
    // progress — 24 invented submissions, a fake streak, CTAs wired to
    // /practice and `demo-case-N` ids. Every complaint about this page traced
    // back to it: taps that went nowhere, a redirect to /practice, and real
    // buttons lost among fake ones. A visitor with no history is not helped by
    // being shown a stranger's.
    //
    // What replaces it is the only thing that was ever true here: today's
    // three real actions, and one honest line about what an account adds.
    return (
      <GuestPreviewFrame next="/dashboard">
        {/* ONE action. Reached only by typing /dashboard directly with no
            session — Explore MECE now mints the session and hard-navigates, so
            it never lands here. Deliberately not a mini-dashboard: the previous
            version offered "browse the library", which sent people to
            /practice, into the login overlay, and back again. That detour is
            what the owner asked to remove. Start, and you are on the real
            dashboard. */}
        <div className="container flex min-h-[60vh] max-w-md flex-col items-center justify-center py-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Practise a real case, right now
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Today&apos;s case and guesstimate are open to everyone — no account, no email. You only sign up when you
            want your score.
          </p>
          <div className="mt-7 w-full max-w-xs">
            <GuestStartButton label="Start practising" />
          </div>
        </div>
      </GuestPreviewFrame>
    );
  }

  const supabase = createClient(); // real client is synchronous (Phase 1)
  // Service-role client for cross-user aggregates (cohort benchmark, peer
  // proximity, proof rail, global rank). users/submissions are owner-scoped
  // under RLS, so the cookie client cannot read other users' rows. These run
  // server-side only and never expose raw rows/PII to the client.
  const svc = createServiceClient();

  // Same — layout already fetched this. We still type-coerce locally.
  const layoutUserRow = await getCachedUserRow(authUser.id);

  // Demo/showcase account ids — excluded from every cross-user aggregate
  // below (rank, headcount, cohort benchmark). Cheap (0-2 rows) and fails
  // open to [] if migration 0044 hasn't run yet.
  const demoIds = await getDemoUserIdsCached();
  const exclDemo = notInList(demoIds);

  // Fetch daily content first since other queries (proof rail) depend on it
  const dailyToday = await getDailyTodayServerSide();

  // Parallel fetches for performance. The users query is removed from this
  // Promise.all — replaced by the cached layoutUserRow above. One fewer DB
  // round-trip per dashboard render.
  const [rawSubsRes, attemptsRes, benchmarkRes, heatmap, growthDeltas, activityFeed, peerProximity, cohortActivity, proofRail, skillGraph] = await Promise.all([
    supabase
      .from('submissions')
      .select('id, user_id, case_id, answer_text, score, feedback_json, created_at, cases(type, difficulty)')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('case_attempts')
      .select('submission_id, is_first_attempt')
      .eq('user_id', authUser.id),
    (() => {
      // Cohort benchmark — the per-dimension averages every user is compared
      // against on the radar. Demo submissions are excluded so a seeded
      // account cannot move the bar for real users.
      const q = svc
        .from('submissions')
        .select('feedback_json')
        .not('feedback_json', 'is', null)
        .limit(100);
      return exclDemo ? q.not('user_id', 'in', exclDemo) : q;
    })(),
    getHeatmap(supabase, authUser.id),
    getGrowthDeltas(supabase, authUser.id),
    getRecent(supabase, authUser.id),
    getPeerProximity(svc, authUser.id),
    getCohortActivity(svc),
    getProofRail(svc, dailyToday.case?.id ?? null),
    getSkillGraph(supabase, authUser.id),
  ]);

  const [nodeTargets, todayMeta] = await Promise.all([
    getNodeOpenTargets(supabase, authUser.id, skillGraph.nodes as any),
    getTodayMeta(svc, dailyToday.case?.id ?? null)
  ]);

  // userRow comes from the cached layout call, NOT a fresh query.
  const userRow = layoutUserRow;
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

  // Has today's daily case / guesstimate already been done? Derived from the
  // submissions we just mapped — no extra query. Drives the "Attempted · 85"
  // state on the dashboard cards instead of inviting a re-start the free tier
  // isn't even allowed to make.
  const dailyProgress = getDailyProgress(
    submissions,
    dailyToday.case?.id ?? null,
    dailyToday.guesstimate?.id ?? null,
  );

  const tier = userRow?.subscription_tier ?? 'free';
  const streak = userRow?.streak_count ?? 0;
  const points = userRow?.points ?? 0;
  const userName = (userRow?.name ?? authUser.email ?? 'there').split(' ')[0];

  // --- peer comparison (O(1) rank, restored from the original dashboard) ---
  // Demo/showcase accounts are excluded so a seeded Pro history cannot push
  // every real user down a rank or dilute the percentile (demoIds resolved above).
  const rankQ = svc.from('users').select('id', { count: 'exact', head: true }).gt('points', points);
  const totalQ = svc.from('users').select('id', { count: 'exact', head: true });
  const [rankCountRes, totalCountRes] = await Promise.all([
    exclDemo ? rankQ.not('id', 'in', exclDemo) : rankQ,
    exclDemo ? totalQ.not('id', 'in', exclDemo) : totalQ,
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

  // Width math: max-w-6xl (1152px) → max-w-7xl (1280px) is a 128px bump.
  // Constellation map width = container - inner padding (72px) - side panel
  // (320px). Old: 1152 - 72 - 320 = 760px wide × 520 minHeight → aspect 1.46.
  // New: 1280 - 72 - 320 = 888px wide. To preserve the ~1.46 ratio we bumped
  // the constellation's minHeight to 600 inside
  // components/dashboard/constellation.tsx (888 / 600 ≈ 1.48). All other
  // grids on the dashboard are fractional (1fr / 1.5fr) so they scale
  // proportionally without further tuning.
  // GUEST MODE: a guest now sees the real dashboard, so it must say plainly
  // that this is not yet an account. Sits at the very top of the page rather
  // than in a sticky bar so it is part of the content, not chrome to dismiss.
  const isGuestSession = authUser.is_anonymous === true;

  return (
    <div className="container max-w-7xl py-10">
      {isGuestSession && (
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-primary/25 bg-primary/[0.06] px-5 py-4">
          <div className="min-w-[15rem] flex-1">
            <p className="text-[14px] font-semibold text-foreground">
              You&apos;re practising without an account
            </p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
              Today&apos;s case and guesstimate are open. Create an account to get your score, keep your history and
              unlock the full library.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login?next=/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              Log in
            </Link>
            <Link
              href="/signup?next=/dashboard"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Sign up free
            </Link>
          </div>
        </div>
      )}
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
        heatmap={heatmap}
        growthDeltas={growthDeltas}
        activityFeed={activityFeed}
        peerProximity={peerProximity}
        cohortActivity={cohortActivity}
        proofRail={proofRail}
        skillGraph={skillGraph}
        nodeTargets={nodeTargets}
        todayMeta={todayMeta}
        dailyProgress={dailyProgress}
      />
      {/* Deck Vault Rewards — one-time nudge (client component, localStorage-gated,
          renders nothing for Pro users or after first view). */}
      <DeckVaultPopup surface="dashboard" />
    </div>
  );
}
