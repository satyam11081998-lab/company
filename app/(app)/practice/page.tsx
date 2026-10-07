import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCachedUserRow } from '@/lib/supabase/auth-cached';
import { viewerContentMarket } from '@/lib/market-page';
import { marketScoped } from '@/lib/market-db';

import PracticeHub from '@/components/practice-hub';
import { PRACTICE_CASE_COLUMNS, type PracticeCase } from '@/lib/practice-cases';
import LoginToContinueOverlay from '@/components/guest/login-to-continue-overlay';
import { Eyebrow } from '@/components/us/ui';

export const dynamic = 'force-dynamic';

export default async function PracticePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // GUEST MODE (0045, revised 2026-08-10): guests are NOT redirected away.
  // They see the real library, blurred, under a "Log in to continue" overlay —
  // the product sells itself far better than a redirect to somewhere else does.
  // `lib/access.ts` + `services/access_guard.py` remain the actual boundary:
  // a guest still cannot attempt anything beyond today's daily pair.
  //
  // A guest is either shape: no session at all (cold start) or an anonymous
  // one. `!user` alone is not the test.
  const isGuest = !user || user.is_anonymous === true;

  // MARKETS (0070): one bank per market. Signed-in (incl. guests) → the
  // account's locked market; logged-out → the region the middleware detected.
  const userRow = user ? await getCachedUserRow(user.id) : null;
  const content = viewerContentMarket(userRow, !!user);
  // Only the columns the practice cards read (lib/practice-cases.ts).
  // `select('*')` shipped every case's full solution, hints, MCQs and
  // interviewer notes to the browser on each visit (~600 KB of page data,
  // readable in the page source) for a list that shows a title, tags and a
  // two-line preview. 2026-10-07.
  const casesRes = await marketScoped(
    content,
    () => supabase
      .from('cases')
      .select(PRACTICE_CASE_COLUMNS)
      .eq('is_active', true)
      .eq('market', content)
      .order('created_at', { ascending: false }),
    () => supabase
      .from('cases')
      .select(PRACTICE_CASE_COLUMNS)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  );

  let attemptedCaseIds: string[] = [];
  if (user) {
    const attemptsRes = await supabase
      .from('case_attempts')
      .select('case_id')
      .eq('user_id', user.id)
      .eq('is_first_attempt', true);
    attemptedCaseIds = Array.from(new Set((attemptsRes.data || []).map((a) => a.case_id)));
  }

  // A guesstimate card shows no preview, so its text is not sent at all.
  const cases: PracticeCase[] = ((casesRes.data as PracticeCase[] | null) || []).map((c) =>
    c.type === 'guesstimate' ? { ...c, content: '' } : c,
  );

  let initialTab = (searchParams.tab || searchParams.type || 'all') as string;
  if (initialTab === 'guesstimate') initialTab = 'guesstimates';
  if (initialTab === 'case') initialTab = 'scored';

  // US / Europe: the same library, introduced in the US app's editorial style.
  if (content === 'US') {
    return (
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <header className="mb-8">
          <Eyebrow>Practice</Eyebrow>
          <h1 className="mt-4 font-display text-[32px] leading-tight text-foreground sm:text-[38px]">The US case bank<span className="text-primary">.</span></h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {isGuest
              ? 'Browse every case and market sizing question. Open any one to read it; sign in when you’re ready to solve and get scored.'
              : 'Cases and market sizing questions set in US markets, plus a new pair every day. Filter by case type, search, or let the randomizer choose.'}
          </p>
        </header>
        {/* key: the sidebar's Cases / Market sizing links only change ?tab=, which
            keeps this client component mounted — remount so the tab follows. */}
        {isGuest ? (
          <LoginToContinueOverlay
            next="/practice"
            variant="us"
            message="Today’s case and market sizing question are free without an account. The full library, every case and every sizing question, opens when you sign up."
          >
            <PracticeHub key={initialTab} cases={cases} attemptedCaseIds={attemptedCaseIds} initialTab={initialTab} variant="us" />
          </LoginToContinueOverlay>
        ) : (
          <PracticeHub key={initialTab} cases={cases} attemptedCaseIds={attemptedCaseIds} initialTab={initialTab} variant="us" />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-6xl py-8 sm:py-10">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-h1 text-foreground">Practice</h1>
          <p className="mt-2 text-body text-muted-foreground max-w-2xl">
            {isGuest
              ? 'Browse every case and guesstimate. Open any one to read it — sign in when you’re ready to solve and get scored.'
              : 'Active practice across cases, guesstimates, and case studies. Pick a category or hit the randomizer.'}
          </p>
        </div>
        {/* The banner that used to sit here is gone: the overlay says the same
            thing, in the one place a guest cannot miss it, without stealing a
            row from the content it is describing. */}
        {isGuest ? (
          <LoginToContinueOverlay next="/practice">
            <PracticeHub cases={cases} attemptedCaseIds={attemptedCaseIds} initialTab={initialTab} />
          </LoginToContinueOverlay>
        ) : (
          <PracticeHub cases={cases} attemptedCaseIds={attemptedCaseIds} initialTab={initialTab} />
        )}
      </main>
    </div>
  );
}
