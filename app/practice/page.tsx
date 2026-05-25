import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import PracticeHub from '@/components/practice-hub';
import type { UserRow, CaseRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PracticePage() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const [userRes, casesRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('cases').select('*').eq('is_active', true).order('created_at', { ascending: false }),
  ]);

  const userRow = userRes.data as UserRow | null;
  const cases = (casesRes.data as CaseRow[] | null) || [];

  return (
    <div className="min-h-screen bg-muted">
      <AppNav user={userRow} />
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
