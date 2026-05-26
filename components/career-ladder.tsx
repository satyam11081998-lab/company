import { Card } from '@/components/ui/card';
import { Crown, Gem, Trophy, Award, Star, Sparkles, ArrowUp } from 'lucide-react';

interface TierDef {
  name: string;
  threshold: number;
  icon: React.ElementType;
  tagline: string;
}

// Sorted highest → lowest internally for logic.
// Display order is reversed in the render (lowest at bottom of visual).
const TIERS: TierDef[] = [
  { name: 'Summer Legend', threshold: 2000, icon: Crown, tagline: 'Top 1% of MECE users' },
  { name: 'PPO Chaser',    threshold: 1000, icon: Gem, tagline: 'Deep prep, real results' },
  { name: 'Fundae Machine',threshold: 500,  icon: Trophy, tagline: 'You know your frameworks' },
  { name: 'Deck Polisher', threshold: 250,  icon: Award, tagline: 'Pixel-perfect slides at 2am' },
  { name: 'MECE Believer', threshold: 100,  icon: Star, tagline: 'Uses MECE in casual conversation' },
  { name: 'Casebook Collector', threshold: 50, icon: Sparkles, tagline: 'Downloaded 12 casebooks, read 1' },
  { name: 'Day 0 Dreamer', threshold: 0,    icon: Sparkles, tagline: 'Just showed up. Bold move.' },
];

interface Props {
  points: number;
}

/**
 * Career ladder — flipped bottom-to-top.
 * Lowest tier (Day 0 Dreamer) at the bottom, highest (Summer Legend) at top.
 * Current tier highlighted with primary accent + progress bar to next.
 */
export default function CareerLadder({ points }: Props) {
  // Find current tier index in the TIERS array (high → low order)
  const currentIdx = TIERS.findIndex((t) => points >= t.threshold);
  const current = currentIdx >= 0 ? TIERS[currentIdx] : TIERS[TIERS.length - 1];
  const nextTier = currentIdx > 0 ? TIERS[currentIdx - 1] : null;
  
  const ptsToNext = nextTier ? nextTier.threshold - points : 0;
  const progressPct = nextTier
    ? Math.round(((points - current.threshold) / (nextTier.threshold - current.threshold)) * 100)
    : 100;

  // Reversed for display (bottom-up climb)
  const displayed = [...TIERS].reverse();

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-small font-semibold uppercase tracking-wider text-muted-foreground">
          Career Ladder
        </h3>
        {nextTier && (
          <span className="text-small font-semibold text-primary">
            {ptsToNext} pts to go
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {displayed.map((tier) => {
          const Icon = tier.icon;
          const isCurrent = tier.name === current.name;
          const isAchieved = points >= tier.threshold;
          const isLocked = !isAchieved;

          return (
            <div key={tier.name}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                  isCurrent
                    ? 'bg-primary/5 border-l-2 border-l-primary'
                    : isAchieved
                    ? 'opacity-100'
                    : 'opacity-40'
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                    isCurrent
                      ? 'bg-primary text-white'
                      : isAchieved
                      ? 'bg-muted text-foreground'
                      : 'bg-muted text-muted-foreground/50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-small font-semibold ${
                      isCurrent ? 'text-primary' : isAchieved ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {tier.name}
                  </p>
                  <p className="text-micro text-muted-foreground italic">
                    {tier.tagline}
                  </p>
                </div>
                <span
                  className={`text-small font-mono tabular-nums ${
                    isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {tier.threshold}
                </span>
              </div>

              {/* Progress bar AFTER the current tier (toward next, which is the one above in display) */}
              {isCurrent && nextTier && (
                <div className="mt-2 mb-2 px-3">
                  <div className="flex items-center justify-between text-micro mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" />
                      Next: {nextTier.name}
                    </span>
                    <span className="text-primary font-semibold tabular-nums">{progressPct}%</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
