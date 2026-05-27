import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import type { UserRow, SubmissionRow, BadgeRow } from '@/lib/types';
import BadgePill from '@/components/badge-pill';
import { ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

/** Profile page — user info, totals, recent submissions. */
export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');
  const authUser = session.user;

  const [userRes, submissionsRes, badgesRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('submissions').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('user_badges').select('*, badges(*)').eq('user_id', authUser.id).order('earned_at', { ascending: false }),
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
  const userBadges = (badgesRes.data || []) as Array<{ id: string; earned_at: string; badges: BadgeRow }>;

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-5xl py-10">
        <Card className="flex flex-col items-center p-8 text-center border-l-4 border-l-navy">
          <Avatar className="h-20 w-20 border border-border">
            {userRow.avatar_url && <AvatarImage src={userRow.avatar_url} alt={userRow.name || ''} />}
            <AvatarFallback className="bg-navy text-navy-foreground text-2xl font-semibold">
              {userRow.name?.charAt(0).toUpperCase() || userRow.email.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">{userRow.name || userRow.email.split('@')[0]}</h1>
          <p className="text-small text-muted-foreground">{userRow.email}</p>
          <div className="mt-6 flex gap-8">
            <Stat label="Points" value={userRow.points} />
            <Stat label="Submissions" value={submissions.length} />
          </div>
        </Card>

        {userBadges.length > 0 && (
          <Card className="p-6 mt-6">
            <h2 className="text-small font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Badges earned ({userBadges.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {userBadges.map((ub) => (
                <BadgePill key={ub.id} badge={ub.badges} size="md" />
              ))}
            </div>
          </Card>
        )}

        <div className="mt-8">
          <h2 className="text-small font-semibold uppercase tracking-wide text-muted-foreground">Recent submissions</h2>
          <Card className="mt-3 divide-y divide-border">
            {submissions.length === 0 ? (
              <p className="p-6 text-body text-muted-foreground">No submissions yet — <Link href="/cases" className="font-medium text-primary hover:underline">try a case</Link>.</p>
            ) : (
              submissions.map((s) => (
                <Link key={s.id} href={`/results/${s.id}`} className="flex items-center justify-between p-4 transition-colors hover:bg-muted">
                  <div>
                    <p className="text-small font-medium text-foreground">{new Date(s.created_at).toLocaleString()}</p>
                    <p className="mt-0.5 line-clamp-1 text-small text-muted-foreground">{s.answer_text.slice(0, 140)}…</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-foreground">{s.score ?? '—'}<span className="text-small font-normal text-muted-foreground">/100</span></span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/70" />
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
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-micro font-medium uppercase text-muted-foreground">{label}</p>
    </div>
  );
}
