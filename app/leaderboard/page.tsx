import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Star } from 'lucide-react';
import type { UserRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface LeaderRow {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  points: number;
}

export default async function LeaderboardPage() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const [userRes, usersRes, subCountsRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('users').select('id, name, email, avatar_url, points').order('points', { ascending: false }).limit(50),
    supabase.from('submissions').select('user_id'),
  ]);

  const userRow = userRes.data as UserRow | null;
  const users = (usersRes.data as LeaderRow[] | null) || [];
  const subRows = (subCountsRes.data as { user_id: string }[] | null) || [];
  const subCountByUser: Record<string, number> = {};
  for (const row of subRows) {
    subCountByUser[row.user_id] = (subCountByUser[row.user_id] || 0) + 1;
  }

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  const getName = (u: LeaderRow) => u.name || u.email.split('@')[0];
  const getInitial = (u: LeaderRow) => (u.name || u.email).charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-muted">
      <AppNav user={userRow} />
      <main className="container max-w-5xl py-10">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="mb-2 animate-fade-in">
          <span className="badge-pill mb-3">
            <Trophy className="h-3.5 w-3.5" />
            Top 50 · India
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Leaderboard</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">The top case-crackers across MBA aspirants in India.</p>
        </div>

        {/* ── Top 3 Podium — quarter-circle arc arrangement ─────── */}
        {top3.length >= 1 && (
          <div className="ui-card-floating overflow-hidden mb-6 animate-slide-up">
            {/* Geometric background decorations */}
            <div className="relative" style={{ height: 280 }}>
              {/* Decorative concentric circles — top left */}
              <svg className="absolute -top-20 -left-20 pointer-events-none" width="300" height="300" aria-hidden>
                {[60, 90, 120, 150].map(r => (
                  <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="1"
                    className="text-border" opacity={0.5 - r * 0.002} />
                ))}
              </svg>
              {/* Decorative concentric circles — top right */}
              <svg className="absolute -top-20 -right-20 pointer-events-none" width="300" height="300" aria-hidden>
                {[60, 90, 120, 150].map(r => (
                  <circle key={r} cx="240" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="1"
                    className="text-border" opacity={0.5 - r * 0.002} />
                ))}
              </svg>
              {/* Diagonal geo lines bottom-right */}
              <svg className="absolute bottom-0 right-0 pointer-events-none" width="200" height="160" aria-hidden>
                {[0,1,2,3].map(i => (
                  <line key={i} x1={200 - i*28} y1={0} x2={200} y2={160 - i*28}
                    stroke="currentColor" strokeWidth="1" className="text-border" opacity="0.4" />
                ))}
              </svg>

              {/* Quarter-circle arc podium:
                  2nd (left, medium, slightly lower)
                  1st (center, largest, highest)
                  3rd (right, smallest, lowest) */}
              <div className="absolute inset-0 flex items-end justify-center pb-8" style={{ paddingLeft: 40, paddingRight: 40 }}>

                {/* 2nd place */}
                {top3[1] && (
                  <div className="absolute flex flex-col items-center" style={{ left: '18%', bottom: 40 }}>
                    <div className="relative">
                      <div className="absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full bg-card border-2 border-border flex items-center justify-center">
                        <Medal className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="w-24 h-24 rounded-full border-4 border-border bg-muted overflow-hidden">
                        <Avatar className="w-full h-full">
                          {top3[1].avatar_url && <AvatarImage src={top3[1].avatar_url} alt={getName(top3[1])} />}
                          <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white text-2xl font-bold w-full h-full flex items-center justify-center rounded-none">
                            {getInitial(top3[1])}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm font-semibold text-foreground">{getName(top3[1])}</p>
                      <p className="text-xs text-muted-foreground font-mono">{top3[1].points} pts</p>
                    </div>
                    <div className="mt-1.5 flex flex-col items-center">
                      <div className="bg-muted border border-border w-16 rounded-t-md" style={{ height: 40 }} />
                      <div className="text-[11px] font-bold text-muted-foreground bg-muted border border-t-0 border-border w-16 text-center py-0.5 rounded-b-sm">2nd</div>
                    </div>
                  </div>
                )}

                {/* 1st place — center, largest, highest */}
                {top3[0] && (
                  <div className="absolute flex flex-col items-center" style={{ left: '50%', transform: 'translateX(-50%)', bottom: 72 }}>
                    <div className="relative">
                      <div className="absolute -top-4 -right-4 z-10 w-9 h-9 rounded-full bg-amber-400 border-4 border-card flex items-center justify-center shadow-md">
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                      {/* Glowing ring behind avatar */}
                      <div className="absolute inset-0 rounded-full" style={{
                        boxShadow: '0 0 0 6px rgba(200,16,46,0.12), 0 0 0 12px rgba(200,16,46,0.06)'
                      }} />
                      <div className="w-32 h-32 rounded-full border-4 border-primary bg-muted overflow-hidden relative z-10">
                        <Avatar className="w-full h-full">
                          {top3[0].avatar_url && <AvatarImage src={top3[0].avatar_url} alt={getName(top3[0])} />}
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-hover text-white text-3xl font-bold w-full h-full flex items-center justify-center rounded-none">
                            {getInitial(top3[0])}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-base font-bold text-foreground">{getName(top3[0])}</p>
                      <p className="text-sm text-primary font-mono font-bold">{top3[0].points} pts</p>
                    </div>
                    <div className="mt-1.5 flex flex-col items-center">
                      <div className="bg-primary/10 border border-primary/20 w-20 rounded-t-md" style={{ height: 60 }} />
                      <div className="text-[12px] font-bold text-primary bg-primary/10 border border-t-0 border-primary/20 w-20 text-center py-0.5 rounded-b-sm">1st</div>
                    </div>
                  </div>
                )}

                {/* 3rd place */}
                {top3[2] && (
                  <div className="absolute flex flex-col items-center" style={{ right: '18%', bottom: 16 }}>
                    <div className="relative">
                      <div className="absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full bg-card border-2 border-border flex items-center justify-center">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <div className="w-20 h-20 rounded-full border-4 border-border bg-muted overflow-hidden">
                        <Avatar className="w-full h-full">
                          {top3[2].avatar_url && <AvatarImage src={top3[2].avatar_url} alt={getName(top3[2])} />}
                          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-700 text-white text-xl font-bold w-full h-full flex items-center justify-center rounded-none">
                            {getInitial(top3[2])}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm font-semibold text-foreground">{getName(top3[2])}</p>
                      <p className="text-xs text-muted-foreground font-mono">{top3[2].points} pts</p>
                    </div>
                    <div className="mt-1.5 flex flex-col items-center">
                      <div className="bg-muted border border-border w-14 rounded-t-md" style={{ height: 24 }} />
                      <div className="text-[11px] font-bold text-muted-foreground bg-muted border border-t-0 border-border w-14 text-center py-0.5 rounded-b-sm">3rd</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submissions strip under podium */}
            <div className="border-t border-border px-6 py-3 flex items-center justify-around bg-muted/30">
              {top3.map((u, i) => (
                <div key={u.id} className="text-center">
                  <p className="text-xs text-muted-foreground">{subCountByUser[u.id] || 0} submissions</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Ranks 4-50 table ──────────────────────────────────── */}
        {rest.length > 0 && (
          <div className="ui-card overflow-hidden animate-slide-up" style={{ animationDelay: '120ms' }}>
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-muted/30">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Ranks 4 – 50</span>
              <span className="text-xs text-muted-foreground">{rest.length} contenders</span>
            </div>
            <div className="divide-y divide-border">
              {rest.map((u, idx) => {
                const isCurrentUser = u.id === authUser.id;
                const rank = idx + 4;
                return (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between gap-4 px-5 py-3.5 transition-colors ${
                      isCurrentUser ? 'bg-primary/5 ring-1 ring-inset ring-primary/15' : 'hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 text-center font-mono text-sm font-semibold text-muted-foreground/60">
                        #{rank}
                      </span>
                      <Avatar className="h-9 w-9 border border-border">
                        {u.avatar_url && <AvatarImage src={u.avatar_url} alt={getName(u)} />}
                        <AvatarFallback className="bg-navy text-navy-foreground text-sm font-semibold">
                          {getInitial(u)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`text-sm font-semibold ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                          {getName(u)}{isCurrentUser && <span className="ml-1.5 text-xs font-medium text-primary/70">(you)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{subCountByUser[u.id] || 0} submissions</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-base font-bold text-foreground">{u.points}</span>
                      <span className="text-xs text-muted-foreground">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Decorative bottom fill */}
            <div className="relative h-20 bg-gradient-to-b from-transparent to-muted/40 overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" aria-hidden>
                {[0,1,2,3,4,5,6].map(i => (
                  <line key={i}
                    x1={i * 80} y1="0" x2={i * 80 + 60} y2="80"
                    stroke="currentColor" strokeWidth="1"
                    className="text-border" opacity="0.5"
                  />
                ))}
              </svg>
              <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/40 font-medium">
                Top 50 · Updated live
              </p>
            </div>
          </div>
        )}

        {users.length === 0 && (
          <div className="ui-card p-12 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
            <p className="text-muted-foreground">No rankings yet. Be the first!</p>
          </div>
        )}
      </main>
    </div>
  );
}
