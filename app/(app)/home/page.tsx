import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import HomeContent from '@/components/home-content';
import type { UserRow, SubmissionRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');
  const authUser = session.user;

  // Fetch the user's recent submissions to compute light personalization
  const recentSubsRes = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const recentSubs = (recentSubsRes.data as SubmissionRow[] | null) || [];

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-6xl py-8">
        <HomeContent recentSubmissions={recentSubs} />
      </main>
    </div>
  );
}
