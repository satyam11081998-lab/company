import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import type { UserRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface LeaderRow {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  points: number;
}

/** Leaderboard page with current user highlighted and medals for top 3. */
export default async function LeaderboardPage() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const [userRes, usersRes, subCountsRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('users').select('id, name, email, avatar_url, points').order('points', { ascending: false }).limit(100),
    supabase.from('submissions').select('user_id'),
  ]);

  const userRow = userRes.data as UserRow | null;
  const users = (usersRes.data as LeaderRow[] | null) || [];
  const subRows = (subCountsRes.data as { user_id: string }[] | null) || [];
  const subCountByUser: Record<string, number> = {};
  for (const row of subRows) {
    subCountByUser[row.user_id] = (subCountByUser[row.user_id] || 0) + 1;
  }

  const medalTints = ['bg-yellow-50 border-yellow-200', 'bg-slate-50 border-slate-200', 'bg-orange-50 border-orange-200'];
  const medalText = ['text-yellow-700', 'text-slate-700', 'text-orange-700'];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav user={userRow} />
      <main className="container max-w-3xl py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leaderboard</h1>
          <p className="mt-1 text-slate-600">Top case-crackers across India.</p>
        </div>

        <Card className="divide-y divide-border overflow-hidden">
          {users.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No rankings yet.</p>
          ) : (
            users.map((u, idx) => {
              const isCurrentUser = u.id === authUser.id;
              const isMedal = idx < 3;
              return (
                <div
                  key={u.id}
                  className={`flex items-center justify-between gap-4 px-5 py-4 ${
                    isCurrentUser
                      ? 'bg-amber-50 ring-1 ring-inset ring-amber-200'
                      : isMedal
                      ? medalTints[idx]
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 text-center text-lg font-bold ${isMedal ? medalText[idx] : 'text-slate-400'}`}>
                      {idx + 1}
                    </span>
                    <Avatar className="h-10 w-10 border border-border">
                      {u.avatar_url && <AvatarImage src={u.avatar_url} alt={u.name || ''} />}
                      <AvatarFallback className="bg-amber-100 text-sm font-medium text-amber-800">
                        {u.name?.charAt(0).toUpperCase() || u.email.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">
                        {u.name || u.email.split('@')[0]} {isCurrentUser && <span className="ml-1 text-xs font-semibold text-amber-700">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-500">{subCountByUser[u.id] || 0} submissions</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{u.points} <span className="text-xs font-normal text-slate-500">pts</span></p>
                </div>
              );
            })
          )}
        </Card>
      </main>
    </div>
  );
}
