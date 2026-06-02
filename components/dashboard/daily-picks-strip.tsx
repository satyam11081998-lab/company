'use client';
// DELIVERABLE — the "doing layer" lifted from /home into the merged dashboard.
// Three daily picks (case / guesstimate / GD brief), client-fetched. Sits ABOVE the
// analytics so the daily-return reason is the first thing a logged-in user sees.
// Reuses the EXISTING DailyPickTile + fetchDailyToday — no new data layer.
import { useEffect, useState } from 'react';
import { Target, Zap, MessageSquare } from 'lucide-react';
import DailyPickTile from '@/components/daily-pick-tile';
import SectionHeader from '@/components/section-header';
import { fetchDailyToday, type DailyContentResponse } from '@/lib/api';

export function DailyPicksStrip() {
  const [daily, setDaily] = useState<DailyContentResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchDailyToday()
      .then((d) => { if (mounted) { setDaily(d); setLoading(false); } })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <section>
      <SectionHeader label="TODAY'S PICKS" subtitle="Three picks updated daily at midnight IST" />
      <div className="grid gap-4 md:grid-cols-3">
        <DailyPickTile
          icon={<Target className="h-4 w-4" />}
          label={daily?.case ? `CASE · ${daily.case.type.replace('_', ' ').toUpperCase()} · ${daily.case.difficulty.toUpperCase()}` : 'CASE'}
          title={daily?.case?.title || "Loading today's case…"}
          difficultyDots={daily?.case?.difficulty === 'hard' ? 3 : daily?.case?.difficulty === 'medium' ? 2 : 1}
          href={daily?.case ? `/cases/${daily.case.id}?daily=1` : '/practice'}
          cta={daily?.case ? "Attempt today's case" : 'Browse cases'}
          loading={loading}
        />
        <DailyPickTile
          icon={<Zap className="h-4 w-4" />}
          label={daily?.guesstimate ? `GUESSTIMATE · ${daily.guesstimate.difficulty.toUpperCase()}` : 'GUESSTIMATE'}
          title={daily?.guesstimate?.title || "Loading today's guesstimate…"}
          difficultyDots={daily?.guesstimate?.difficulty === 'hard' ? 3 : daily?.guesstimate?.difficulty === 'medium' ? 2 : 1}
          href={daily?.guesstimate ? `/cases/${daily.guesstimate.id}?daily=1` : '/practice?tab=guesstimates'}
          cta={daily?.guesstimate ? "Solve today's guesstimate" : 'Browse guesstimates'}
          loading={loading}
        />
        <DailyPickTile
          icon={<MessageSquare className="h-4 w-4" />}
          label={daily?.brief ? `GD BRIEF · ${daily.brief.source_name.toUpperCase()}` : 'GD BRIEF'}
          title={daily?.brief?.title || "Today's headlines"}
          href={daily?.brief ? `/gd-briefs/${daily.brief.id}` : '/gd-briefs'}
          cta={daily?.brief ? "Read today's brief" : 'Browse briefs'}
          loading={loading}
        />
      </div>
    </section>
  );
}

export default DailyPicksStrip;
