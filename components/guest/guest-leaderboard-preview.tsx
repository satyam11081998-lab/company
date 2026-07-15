import { Trophy, Medal, Lock } from 'lucide-react';
import SignInWall from '@/components/guest/sign-in-wall';

/**
 * Leaderboard teaser for logged-out visitors. Per product decision they may
 * OPEN the leaderboard, but the actual rankings require an account — so the
 * standings render blurred/inert behind a sign-in wall. No real user data is
 * fetched or exposed to anon here.
 */
const SAMPLE_ROWS = [
  { rank: 4, name: 'Aarav M.', college: 'IIM Ahmedabad', pts: 9840 },
  { rank: 5, name: 'Diya R.', college: 'FMS Delhi', pts: 9210 },
  { rank: 6, name: 'Kabir S.', college: 'XLRI', pts: 8730 },
  { rank: 7, name: 'Ananya P.', college: 'IIM Bangalore', pts: 8410 },
  { rank: 8, name: 'Vivaan K.', college: 'SPJIMR', pts: 8050 },
  { rank: 9, name: 'Ishaan T.', college: 'IIM Calcutta', pts: 7720 },
];

const PODIUM = [
  { rank: 2, name: 'Sana', pts: 11240, h: 'h-20' },
  { rank: 1, name: 'Rehan', pts: 12980, h: 'h-28' },
  { rank: 3, name: 'Meera', pts: 10510, h: 'h-16' },
];

export default function GuestLeaderboardPreview() {
  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-5xl py-8 sm:py-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-primary" /> Leaderboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">See where you rank across India</h1>
          <p className="mx-auto mt-2 max-w-md text-[14px] text-muted-foreground">
            Every scored case and guesstimate earns points. Sign in to reveal the live standings and your place on them.
          </p>
        </div>

        <div className="relative">
          {/* Blurred sample standings behind the wall */}
          <div aria-hidden className="pointer-events-none select-none blur-[5px]">
            {/* Podium */}
            <div className="mb-6 flex items-end justify-center gap-3 sm:gap-5">
              {PODIUM.map((p) => (
                <div key={p.rank} className="flex flex-col items-center">
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-navy/20 text-sm font-bold text-foreground">
                    {p.name.charAt(0)}
                  </div>
                  <div className="text-[12px] font-semibold text-foreground">{p.name}</div>
                  <div className="font-mono text-[12px] text-muted-foreground">{p.pts.toLocaleString()}</div>
                  <div
                    className={`mt-2 w-16 sm:w-24 ${p.h} rounded-t-lg border border-b-0 border-border ${
                      p.rank === 1 ? 'bg-primary/20' : 'bg-card'
                    } flex items-start justify-center pt-2`}
                  >
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-foreground">
                      {p.rank === 1 ? <Trophy className="h-3.5 w-3.5 text-primary" /> : <Medal className="h-3.5 w-3.5 text-muted-foreground" />}
                      {p.rank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {SAMPLE_ROWS.map((r, i) => (
                <div
                  key={r.rank}
                  className={`flex items-center gap-3 px-4 py-3 ${i % 2 ? 'bg-muted/30' : ''}`}
                >
                  <span className="w-6 font-mono text-[13px] font-semibold text-muted-foreground">{r.rank}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[12px] font-semibold text-foreground">
                    {r.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-foreground">{r.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{r.college}</div>
                  </div>
                  <span className="font-mono text-[13px] font-semibold text-primary">{r.pts.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-in wall */}
          <div className="absolute inset-0 flex items-start justify-center px-3 pt-10 sm:pt-16">
            <SignInWall
              title="Sign in to see the rankings"
              message="The live leaderboard — and your rank on it — unlocks with an account."
              next="/leaderboard"
            />
          </div>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-muted-foreground/70">
          <Lock className="h-3 w-3" /> Standings shown are illustrative until you sign in.
        </p>
      </main>
    </div>
  );
}
