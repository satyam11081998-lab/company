import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAllTimeLeaderboard, getCohortLeaderboard } from '@/lib/dashboard/leaderboards';
import LeaderboardClient from '@/components/leaderboard/leaderboard-client';
import GuestLeaderboardPreview from '@/components/guest/guest-leaderboard-preview';
import TrackPageAction from '@/components/analytics/track-page-action';
import { getCachedUserRow } from '@/lib/supabase/auth-cached';
import { contentMarketOf } from '@/lib/market';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Guests can open the leaderboard, but the live rankings require an account.
  if (!user) return <GuestLeaderboardPreview />;

  // All cross-user reads run via the service role (users/submissions are
  // owner-scoped under RLS). Only public display fields (name/avatar/points)
  // and aggregate ranks reach the client — never email.
  const svc = createServiceClient();
  // MARKETS (0070): each market ranks among its own accounts.
  const market = contentMarketOf((await getCachedUserRow(user.id))?.market);
  const [allTime, cohortRes] = await Promise.all([
    getAllTimeLeaderboard(svc, user.id, 50, market),
    market === 'US'
      ? Promise.resolve({ view: null, collegeName: null })
      : getCohortLeaderboard(svc, user.id, 50),
  ]);

  const tabParam = searchParams?.tab;
  const initialTab =
    tabParam === 'today' || tabParam === 'daily' ? 'daily'
    : tabParam === 'cohort' ? 'cohort'
    : 'all';

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-5xl py-10">
        <TrackPageAction action="view_leaderboard" category="engagement" />
        <LeaderboardClient
          userId={user.id}
          allTime={allTime}
          cohort={cohortRes.view}
          cohortName={cohortRes.collegeName}
          initialTab={initialTab}
          market={market}
        />
      </main>
    </div>
  );
}
