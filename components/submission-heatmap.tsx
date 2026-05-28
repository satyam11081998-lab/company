'use client';
  
import { Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { SubmissionRow } from '@/lib/types';

interface Props {
  submissions: SubmissionRow[];
  weeks?: number;   // default 12
  title?: string;
  showStreak?: boolean;
}

/**
 * GitHub-style activity heatmap.
 * Each cell = one day. Color intensity = number of submissions that day.
 * Cardinal red palette only (no rainbow).
 */
export default function SubmissionHeatmap({ 
  submissions, 
  weeks = 12, 
  title = 'Submission activity',
  showStreak = true,
}: Props) {
  // Build a date → count map
  const dailyCounts = new Map<string, number>();
  submissions.forEach((s) => {
    const day = s.created_at.slice(0, 10); // YYYY-MM-DD
    dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
  });

  // Build 12 weeks × 7 days grid (today is bottom-right of last column)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = weeks * 7;
  const cells: { date: string; count: number; isToday: boolean }[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    cells.push({
      date: iso,
      count: dailyCounts.get(iso) || 0,
      isToday: i === 0,
    });
  }

  // Compute current streak (consecutive days with at least 1 submission, ending today)
  let streak = 0;
  for (let i = cells.length - 1; i >= 0; i--) {
    if (cells[i].count > 0) streak++;
    else break;
  }

  // Compute total submissions in window
  const totalSubs = submissions.filter(
    (s) => new Date(s.created_at) >= new Date(today.getTime() - totalDays * 86400000)
  ).length;

  function intensityClass(count: number): string {
    if (count === 0) return 'bg-muted border-border';
    if (count === 1) return 'bg-primary/20 border-primary/30';
    if (count <= 3) return 'bg-primary/50 border-primary/60';
    return 'bg-primary border-primary';
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-small font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>
          <p className="text-micro text-muted-foreground/70 mt-0.5">
            Last {weeks} weeks · {totalSubs} submissions
          </p>
        </div>
        {showStreak && streak > 0 && (
          <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span className="text-small font-semibold text-primary">
              {streak}-day streak
            </span>
          </div>
        )}
      </div>

      {/* Grid: organize cells into 7 rows × N columns */}
      <div className="overflow-x-auto pb-4 table-scroll-mobile relative">
        <div className="flex gap-[3px] min-w-max pr-4">
          {Array.from({ length: weeks }).map((_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const cellIdx = weekIdx * 7 + dayIdx;
                const cell = cells[cellIdx];
                if (!cell) return <div key={dayIdx} className="h-3 w-3" />;
                return (
                  <div
                    key={dayIdx}
                    className={`h-3 w-3 rounded-sm border transition-transform hover:scale-125 ${intensityClass(cell.count)} ${cell.isToday ? 'ring-1 ring-primary ring-offset-1 ring-offset-card' : ''}`}
                    title={`${cell.date}: ${cell.count} submission${cell.count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-card to-transparent pointer-events-none md:hidden" />
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-1.5">
        <span className="text-micro text-muted-foreground">Less</span>
        <div className="h-2.5 w-2.5 rounded-sm border border-border bg-muted" />
        <div className="h-2.5 w-2.5 rounded-sm border border-primary/30 bg-primary/20" />
        <div className="h-2.5 w-2.5 rounded-sm border border-primary/60 bg-primary/50" />
        <div className="h-2.5 w-2.5 rounded-sm border border-primary bg-primary" />
        <span className="text-micro text-muted-foreground">More</span>
      </div>
    </Card>
  );
}
