import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import GdBriefCard from '@/components/gd-brief-card';
import type { UserRow, GdBriefRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** GD briefs page — expandable cards for each curated debate topic. */
export default async function GdBriefsPage() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const [userRes, briefsRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('gd_briefs').select('*').order('created_at', { ascending: false }),
  ]);

  const userRow = userRes.data as UserRow | null;
  const briefs = (briefsRes.data as GdBriefRow[] | null) || [];

  return (
    <div className="min-h-screen bg-muted">
      <AppNav user={userRow} />
      <main className="container max-w-4xl py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">GD Briefs</h1>
          <p className="mt-1 text-muted-foreground">Sharp takes on the day&apos;s most debate-worthy stories.</p>
        </div>
        {briefs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No briefs yet. Check back soon.</p>
        ) : (
          <div className="space-y-4">
            {briefs.map((brief) => (
              <GdBriefCard key={brief.id} brief={brief} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
