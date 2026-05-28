import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from '@/components/dashboard-client';
import type { UserRow, SubmissionRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');
  const authUser = session.user;

  // Parallel fetches
  const [userRes, recentSubsRes, benchmarkRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase
      .from('submissions')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(40),
    supabase
      .from('submissions')
      .select('feedback_json')
      .not('feedback_json', 'is', null)
      .limit(100),
  ]);

  const userRow: UserRow = (userRes.data as UserRow | null) || {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || null,
    email: authUser.email || '',
    avatar_url: null,
    points: 0,
    created_at: new Date().toISOString(),
    subscription_tier: 'free',
    subscription_started_at: null,
    subscription_expires_at: null,
    streak_count: 0,
    streak_last_date: null,
  };
  const recentSubs = (recentSubsRes.data as SubmissionRow[] | null) || [];

  // O(1) rank computation
  const [rankCountRes, totalCountRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).gt('points', userRow.points),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ]);
  const rankNum = (rankCountRes.count ?? 0) + 1;
  const totalUsers = totalCountRes.count ?? 0;
  const percentile = totalUsers > 1
    ? Math.round(((totalUsers - rankNum) / (totalUsers - 1)) * 100)
    : null;

  // Compute avg score
  const scoredSubs = recentSubs.filter((s) => s.score !== null);
  const avgScore = scoredSubs.length > 0
    ? Math.round(scoredSubs.reduce((a, s) => a + (s.score || 0), 0) / scoredSubs.length)
    : null;

  // Compute benchmark for radar
  const benchmarkAgg: Record<string, { sum: number; count: number }> = {};
  (benchmarkRes.data || []).forEach((sub) => {
    const breakdown = (sub.feedback_json as { breakdown?: Record<string, number> })?.breakdown;
    if (breakdown) {
      Object.entries(breakdown).forEach(([dim, val]) => {
        if (typeof val === 'number') {
          if (!benchmarkAgg[dim]) benchmarkAgg[dim] = { sum: 0, count: 0 };
          benchmarkAgg[dim].sum += val;
          benchmarkAgg[dim].count++;
        }
      });
    }
  });
  const benchmark: Record<string, number> = {};
  Object.entries(benchmarkAgg).forEach(([dim, { sum, count }]) => {
    benchmark[dim] = count > 0 ? Math.round(sum / count) : 0;
  });

  return (
    <div className="min-h-screen pb-10">
      <DashboardClient
        user={userRow}
        submissions={recentSubs}
        rankNum={rankNum}
        totalUsers={totalUsers}
        percentile={percentile}
        avgScore={avgScore}
        benchmark={benchmark}
      />
    </div>
  );
}
