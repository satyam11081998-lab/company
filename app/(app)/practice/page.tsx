import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

import PracticeHub from '@/components/practice-hub';
import type { CaseRow } from '@/lib/types';

export const revalidate = 60;

export default async function PracticePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const authUser = user;

  const [casesRes, attemptsRes] = await Promise.all([
    supabase.from('cases').select('*').eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('case_attempts').select('case_id').eq('user_id', authUser.id).eq('is_first_attempt', true),
  ]);

  const cases = (casesRes.data as CaseRow[] | null) || [];
  const attemptedCaseIds = Array.from(new Set((attemptsRes.data || []).map((a) => a.case_id)));

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-6xl py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-h1 text-foreground">Practice</h1>
          <p className="mt-2 text-body text-muted-foreground max-w-2xl">
            Active practice across cases, guesstimates, and case studies. Pick a category or hit the randomizer.
          </p>
        </div>
        <PracticeHub cases={cases} attemptedCaseIds={attemptedCaseIds} />
      </main>
    </div>
  );
}
