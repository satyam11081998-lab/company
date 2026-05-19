import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import LearnReader from '@/components/learn-reader';
import type { UserRow, LearnContentRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** Learn page — explainers per case type, rendered from learn_content table. */
export default async function LearnPage() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const [userRes, learnRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('learn_content').select('*').order('display_order', { ascending: true }),
  ]);

  const userRow = userRes.data as UserRow | null;
  const entries = (learnRes.data as LearnContentRow[] | null) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav user={userRow} />
      <main className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Learn</h1>
          <p className="mt-1 text-slate-600">Frameworks and mental models for each case type.</p>
        </div>
        <LearnReader entries={entries} />
      </main>
    </div>
  );
}
