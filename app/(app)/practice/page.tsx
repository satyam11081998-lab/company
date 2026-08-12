import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

import PracticeHub from '@/components/practice-hub';
import LoginToContinueOverlay from '@/components/guest/login-to-continue-overlay';
import type { CaseRow } from '@/lib/types';

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

  const casesRes = await supabase
    .from('cases')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  let attemptedCaseIds: string[] = [];
  if (user) {
    const attemptsRes = await supabase
      .from('case_attempts')
      .select('case_id')
      .eq('user_id', user.id)
      .eq('is_first_attempt', true);
    attemptedCaseIds = Array.from(new Set((attemptsRes.data || []).map((a) => a.case_id)));
  }

  const cases = (casesRes.data as CaseRow[] | null) || [];

  let initialTab = (searchParams.tab || searchParams.type || 'all') as string;
  if (initialTab === 'guesstimate') initialTab = 'guesstimates';
  if (initialTab === 'case') initialTab = 'scored';

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
