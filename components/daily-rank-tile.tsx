'use client';
  
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, ArrowRight } from 'lucide-react';
import { useUser } from '@/components/user-context';
import { fetchDailyLeaderboard, type DailyLeaderboardResponse } from '@/lib/api';

export default function DailyRankTile() {
  const { user } = useUser();
  const [data, setData] = useState<DailyLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchDailyLeaderboard()
      .then((d) => {
        if (mounted) { setData(d); setLoading(false); }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const myEntry = data?.entries.find((e) => e.user_id === user?.id);
  const totalAttempts = data?.total_attempts || 0;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-small font-semibold uppercase tracking-wider text-muted-foreground">
          Today's Daily Rank
        </h3>
        <span className="text-micro font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          Live
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
          <div className="h-3 w-32 bg-muted rounded animate-pulse" />
        </div>
      ) : myEntry ? (
        <>
          <div className="flex items-baseline gap-2">
            <p className="font-mono text-[36px] leading-none font-bold tabular-nums text-foreground">
              #{myEntry.rank}
            </p>
            <p className="text-small text-muted-foreground">
              of {totalAttempts} attempts
            </p>
          </div>
          <p className="mt-2 text-small text-muted-foreground">
            Your score: <span className="text-foreground font-semibold">{myEntry.score}/100</span>
          </p>
          <Link
            href="/leaderboard?tab=today"
            className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-primary hover:underline"
          >
            See full daily leaderboard
            <ArrowRight className="h-3 w-3" />
          </Link>
        </>
      ) : (
        <>
          <p className="text-body text-foreground">
            You haven't attempted today's case.
          </p>
          <Link
            href="/home"
            className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-primary hover:underline"
          >
            Today's case is waiting
            <ArrowRight className="h-3 w-3" />
          </Link>
        </>
      )}
    </Card>
  );
}
