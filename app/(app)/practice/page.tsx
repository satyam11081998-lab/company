import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

import PracticeHub from '@/components/practice-hub';
import type { CaseRow } from '@/lib/types';

export const revalidate = 60;

export default async function PracticePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');
  const authUser = session.user;

  const casesRes = await supabase.from('cases').select('*').eq('is_active', true).order('created_at', { ascending: false });

  const cases = (casesRes.data as CaseRow[] | null) || [];

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-6xl py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-h1 text-foreground">Practice</h1>
          <p className="mt-2 text-body text-muted-foreground max-w-2xl">
            Active practice across cases, guesstimates, and case studies. Pick a category or hit the randomizer.
          </p>
        </div>
        <PracticeHub cases={cases} />
      </main>
    </div>
  );
}
