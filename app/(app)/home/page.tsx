import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import HomeContent from '@/components/home-content';
import type { SubmissionRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');
  const authUser = session.user;

  // Fetch user's full submission history (last 90 days) for heatmap
  const submissionsRes = await supabase
    .from('submissions')
    .select('id, score, created_at, feedback_json')
    .eq('user_id', authUser.id)
    .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  const submissions = (submissionsRes.data as SubmissionRow[] | null) || [];

  return (
    <div className="min-h-screen bg-muted">
      <HomeContent submissions={submissions} />
    </div>
  );
}
