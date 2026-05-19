import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import type { UserRow, SubmissionRow } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

/** Profile page — user info, totals, recent submissions. */
export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const [userRes, submissionsRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('submissions').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(20),
  ]);

  const userRow = (userRes.data as UserRow | null) || {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || null,
    email: authUser.email || '',
    avatar_url: authUser.user_metadata?.avatar_url || null,
    points: 0,
    created_at: new Date().toISOString(),
  };
  const submissions = (submissionsRes.data as SubmissionRow[] | null) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav user={userRow} />
      <main className="container max-w-3xl py-10">
        <Card className="flex flex-col items-center p-8 text-center">
          <Avatar className="h-20 w-20 border border-border">
            {userRow.avatar_url && <AvatarImage src={userRow.avatar_url} alt={userRow.name || ''} />}
            <AvatarFallback className="bg-amber-100 text-2xl font-semibold text-amber-800">
              {userRow.name?.charAt(0).toUpperCase() || userRow.email.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">{userRow.name || userRow.email.split('@')[0]}</h1>
          <p className="text-sm text-slate-500">{userRow.email}</p>
          <div className="mt-6 flex gap-8">
            <Stat label="Points" value={userRow.points} />
            <Stat label="Submissions" value={submissions.length} />
          </div>
        </Card>

        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent submissions</h2>
          <Card className="mt-3 divide-y divide-border">
            {submissions.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No submissions yet — <Link href="/cases" className="font-medium text-amber-600 hover:underline">try a case</Link>.</p>
            ) : (
              submissions.map((s) => (
                <Link key={s.id} href={`/results/${s.id}`} className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{new Date(s.created_at).toLocaleString()}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{s.answer_text.slice(0, 140)}…</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-slate-900">{s.score ?? '—'}<span className="text-xs font-normal text-slate-500">/100</span></span>
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

/** Small stat tile on profile page. */
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
    </div>
  );
}
