import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import CasesBrowser from '@/components/cases-browser';
import type { UserRow, CaseRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** Cases list page — grid of all active cases with filters. */
export default async function CasesPage() {
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
    <div className="min-h-screen bg-slate-50">
      <AppNav user={userRow} />
      <main className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cases</h1>
          <p className="mt-1 text-slate-600">Pick a case. Practice. Get scored. Repeat.</p>
        </div>
        <CasesBrowser cases={cases} />
      </main>
    </div>
  );
}
