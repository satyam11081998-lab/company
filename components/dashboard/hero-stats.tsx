'use client';
/**
 * Three honest, internally-consistent numbers as the dashboard hero:
 *   Latest  ·  Personal best  ·  Streak
 *
 * Replaces the old "Avg Score / Day Streak / Cases Solved / Points" tile row.
 * No "average" anywhere — fixes the small-sample unfairness without statistics.
 */
import { Flame, Trophy, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { HeroStats } from '@/lib/personal-stats';

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

export default function HeroStatsRow({ hero }: { hero: HeroStats }) {
  const latest = hero.latest;
  const best = hero.personalBest;
  const streak = hero.streak;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Latest */}
      <Card className="flex flex-col p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <p className="text-label text-muted-foreground">LATEST CASE</p>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-[34px] leading-none font-mono-data font-bold tabular-nums text-foreground">
            {latest ?? '—'}
          </span>
          {latest != null && <span className="text-small text-muted-foreground">/ 100</span>}
        </div>
        <p className="mt-1 text-small text-muted-foreground">
          {latest != null ? `Scored ${fmtDate(hero.latestAt)}` : 'No case submitted yet'}
        </p>
      </Card>

      {/* Personal best */}
      <Card className="flex flex-col p-5">
        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-warning" />
          <p className="text-label text-muted-foreground">PERSONAL BEST</p>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-[34px] leading-none font-mono-data font-bold tabular-nums text-foreground">
            {best ?? '—'}
          </span>
          {best != null && <span className="text-small text-muted-foreground">/ 100</span>}
        </div>
        <p className="mt-1 text-small text-muted-foreground">
          {best != null ? `Set ${fmtDate(hero.personalBestAt)}` : 'Crack your first case to set it'}
        </p>
      </Card>

      {/* Streak */}
      <Card className="flex flex-col p-5">
        <div className="flex items-center gap-2">
          <Flame className={cn('h-3.5 w-3.5 text-primary', streak > 0 && 'ambient-flame')} />
          <p className="text-label text-muted-foreground">CURRENT STREAK</p>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-[34px] leading-none font-mono-data font-bold tabular-nums text-foreground">
            {streak}
          </span>
          <span className="text-small text-muted-foreground">{streak === 1 ? 'day' : 'days'}</span>
        </div>
        <p className="mt-1 text-small text-muted-foreground">
          {streak >= 7 ? 'On fire — keep it alive' :
           streak >= 3 ? 'Building a real habit' :
           streak >= 1 ? 'Come back tomorrow' :
           'Start today, every day counts'}
        </p>
      </Card>
    </div>
  );
}
