import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import LearnReader from '@/components/learn-reader';
import type { LearnContentRow } from '@/lib/types';

// Revalidate learn content every hour — rarely changes, no need to hit DB every visit
export const revalidate = 3600;

/** Learn page — explainers per case type, rendered from learn_content table. */
export default async function LearnPage() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const learnRes = await supabase
    .from('learn_content')
    .select('*')
    .order('display_order', { ascending: true });

  const entries = (learnRes.data as LearnContentRow[] | null) || [];

  return (
    <div className="min-h-screen bg-muted">
      <AppNav />
      <main className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Learn</h1>
          <p className="mt-1 text-muted-foreground">Frameworks and mental models for each case type.</p>
        </div>
        <LearnReader entries={entries} />
      </main>
    </div>
  );
}
