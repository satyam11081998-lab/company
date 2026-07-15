import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

import PracticeHub from '@/components/practice-hub';
import type { CaseRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PracticePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Logged-out visitors may BROWSE the full library (cases are public-readable
  // under RLS). Opening one lands on the read-only case preview where the solve
  // workspace is gated. No attempted-state for guests.
  const isGuest = !user; // drives the guest banner + read-only browse

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
          {isGuest && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.05] px-4 py-3">
              <p className="text-[13px] text-foreground/80">
                You&apos;re browsing as a guest. Create an account to solve cases and track your progress.
              </p>
              <Link
                href="/signup?next=/practice"
                className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
              >
                Sign up <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
        <PracticeHub cases={cases} attemptedCaseIds={attemptedCaseIds} initialTab={initialTab} />
      </main>
    </div>
  );
}
