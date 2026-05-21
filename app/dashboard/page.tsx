import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import type { UserRow, CaseRow, GdBriefRow, SubmissionRow } from '@/lib/types';
import { CASE_TYPE_LABELS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/lib/constants';
import { Card as _Card } from '@/components/ui/card';
import { Trophy, Sparkles, FileText, Newspaper, ArrowRight } from 'lucide-react';
import type React from 'react';

export const dynamic = 'force-dynamic';

// Cast once here — fixes the RefAttributes<any> resolution error regardless of TS/React version
const Card = _Card as React.ComponentType<{ className?: string; children?: React.ReactNode }>;

/** Authenticated dashboard — today's case, today's brief, points, rank, recent activity. */
export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const [userRes, todayCaseRes, todayBriefRes, recentSubsRes, rankRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('cases').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('gd_briefs').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('submissions').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('users').select('id, points').order('points', { ascending: false }),
  ]);

  const userRow = (userRes.data as UserRow | null) || {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || null,
    email: authUser.email || '',
    avatar_url: authUser.user_metadata?.avatar_url || null,
    points: 0,
    created_at: new Date().toISOString(),
  };

  const todayCase = todayCaseRes.data as CaseRow | null;
  const todayBrief = todayBriefRes.data as GdBriefRow | null;
  const recentSubs = (recentSubsRes.data as SubmissionRow[] | null) || [];
  const allUsers = (rankRes.data as { id: string; points: number }[] | null) || [];
  const rank = allUsers.findIndex((u) => u.id === authUser.id);
  const rankDisplay = rank >= 0 ? `#${rank + 1}` : '—';

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav user={userRow} />
      <main className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back{userRow.name ? `, ${userRow.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="mt-1 text-slate-600">Here&apos;s what to work on today.</p>
        </div>

        {/* Top cards row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Your points" value={userRow.points} icon={<Sparkles className="h-5 w-5 text-amber-500" />} />
          <StatCard label="Your rank" value={rankDisplay} icon={<Trophy className="h-5 w-5 text-amber-500" />} />
          <StatCard label="Submissions" value={recentSubs.length} icon={<FileText className="h-5 w-5 text-amber-500" />} sublabel="recent" />
          <StatCard label="GD briefs" value={todayBrief ? '1 new' : '—'} icon={<Newspaper className="h-5 w-5 text-amber-500" />} sublabel="today" />
        </div>

        {/* Featured row */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Today's case */}
          <Card className="flex flex-col p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Today&apos;s case</h2>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Recommended</span>
            </div>
            {todayCase ? (
              <>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{todayCase.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {CASE_TYPE_LABELS[todayCase.type] || todayCase.type}
                  </span>
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[todayCase.difficulty] || ''}`}>
                    {DIFFICULTY_LABELS[todayCase.difficulty] || todayCase.difficulty}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-slate-600">{todayCase.content}</p>
                <Link href={`/cases/${todayCase.id}`} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:underline">
                  Solve this case <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No active cases yet. Check back soon.</p>
            )}
          </Card>

          {/* Today's brief */}
          <Card className="flex flex-col p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Today&apos;s GD brief</h2>
              <Newspaper className="h-4 w-4 text-slate-400" />
            </div>
            {todayBrief ? (
              <>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{todayBrief.topic}</h3>
                <p className="mt-3 line-clamp-4 text-sm text-slate-600">{todayBrief.summary}</p>
                <Link href="/gd-briefs" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:underline">
                  Read full brief <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No briefs yet.</p>
            )}
          </Card>
        </div>

        {/* Recent activity */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent activity</h2>
          <Card className="mt-3 divide-y divide-border">
            {recentSubs.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No submissions yet —{' '}
                <Link href="/cases" className="font-medium text-amber-600 hover:underline">
                  try a case
                </Link>.
              </p>
            ) : (
              recentSubs.map((s) => (
                <Link
                  key={s.id}
                  href={`/results/${s.id}`}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Submission · {new Date(s.created_at).toLocaleString()}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{s.answer_text.slice(0, 120)}…</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-slate-900">
                      {s.score ?? '—'}<span className="text-xs font-normal text-slate-500">/100</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Link>
              ))
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

/** Small KPI tile shown on the dashboard. */
function StatCard({
  label,
  value,
  icon,
  sublabel,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sublabel?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value} {sublabel && <span className="text-sm font-normal text-slate-500">{sublabel}</span>}
      </p>
    </Card>
  );
}