import { Card } from '@/components/ui/card';
import { Crown, Gem, Trophy, Award, Star, Sparkles, ArrowUp } from 'lucide-react';

import { CAREER_TIERS, currentTier, nextTier, tierProgress, pointsToNextTier } from '@/lib/career-tiers';

const ICONS: Record<string, React.ElementType> = {
  'Summer Legend': Crown,
  'PPO Chaser': Gem,
  'Fundae Machine': Trophy,
  'Deck Polisher': Award,
  'MECE Believer': Star,
  'Casebook Collector': Sparkles,
  'Day 0 Dreamer': Sparkles,
};

interface Props {
  points: number;
}

/**
 * Career ladder — flipped bottom-to-top.
 * Lowest tier (Day 0 Dreamer) at the bottom, highest (Summer Legend) at top.
 * Current tier highlighted with primary accent + progress bar to next.
 */
export default function CareerLadder({ points }: Props) {
  const current = currentTier(points);
  const nxt = nextTier(points);
  const ptsToNext = pointsToNextTier(points);
  const progressPct = Math.round(tierProgress(points) * 100);

  // Highest at top (index 0), lowest at bottom
  const displayed = [...CAREER_TIERS].reverse();

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[12.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          Career Ladder
        </h3>
        {nxt && (
          <span className="text-[12.5px] font-semibold text-primary">
            {ptsToNext} pts to go
          </span>
        )}
      </div>

      <div className="space-y-1 mt-auto">
        {displayed.map((tier) => {
          const Icon = ICONS[tier.name] || Star;
          const isCurrent = tier.name === current.name;
          const isAchieved = points >= tier.threshold;

          return (
            <div key={tier.name}>
              {/* Progress bar BEFORE the current tier (toward next, which is physically above it in the DOM) */}
              {isCurrent && nxt && (
                <div className="mb-2 px-3">
                  <div className="flex items-center justify-between text-[11px] mb-[3px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ArrowUp className="h-[10px] w-[10px]" />
                      Next: {nxt.name}
                    </span>
                    <span className="text-primary font-semibold tabular-nums">{progressPct}%</span>
                  </div>
                  <div className="h-[4px] bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              <div
                className={`flex items-center gap-3 px-2.5 py-[8px] rounded-md transition-all ${
                  isCurrent
                    ? 'bg-primary/5 border-l-2 border-l-primary'
                    : isAchieved
                    ? 'opacity-100'
                    : 'opacity-40'
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isAchieved
                      ? 'bg-navy/10 text-navy'
                      : 'bg-muted text-muted-foreground/60'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[12.5px] font-semibold leading-tight ${
                      isCurrent ? 'text-primary' : isAchieved ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {tier.name}
                  </p>
                  <p className="text-[10.5px] text-muted-foreground italic truncate">
                    {tier.tagline}
                  </p>
                </div>
                <span
                  className={`text-[11.5px] font-mono-data tabular-nums ${
                    isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {tier.threshold.toLocaleString()} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
