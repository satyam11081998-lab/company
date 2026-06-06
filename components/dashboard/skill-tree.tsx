'use client';
/**
 * Skill tree — a visual map of your progress across the 4 case domains.
 * Status per node:
 *   • mastered  -> best >= 75 over >= 2 attempts (green)
 *   • building  -> at least 1 attempt          (amber)
 *   • untouched -> no attempts yet             (grey, "explore")
 *
 * Duolingo-style progress panel: makes "what to do next" obvious without using
 * a numerical readiness score. Sits next to the hero stats.
 */
import Link from 'next/link';
import { CheckCircle2, Circle, Lock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SkillNode } from '@/lib/personal-stats';
import { MASTERY_SCORE_THRESHOLD, MASTERY_REPS_THRESHOLD } from '@/lib/personal-stats';

const STATUS_STYLE = {
  mastered: {
    chip: 'bg-success-soft text-success',
    icon: CheckCircle2,
    label: 'Mastered',
  },
  building: {
    chip: 'bg-warning-soft text-warning',
    icon: Circle,
    label: 'Building',
  },
  untouched: {
    chip: 'bg-muted text-muted-foreground',
    icon: Lock,
    label: 'Explore',
  },
} as const;

export default function SkillTree({ nodes }: { nodes: SkillNode[] }) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <p className="text-label text-muted-foreground">YOUR DOMAINS</p>
          <p className="mt-0.5 text-small text-muted-foreground">
            Practice all four to be interview-ready. Mastery = best ≥ {MASTERY_SCORE_THRESHOLD} over ≥ {MASTERY_REPS_THRESHOLD} attempts.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {nodes.map((n) => {
          const style = STATUS_STYLE[n.status];
          const Icon = style.icon;
          return (
            <Link
              key={n.caseType}
              href={`/practice?type=${n.caseType}`}
              className={cn(
                'group flex items-center justify-between rounded-lg border bg-card p-4 transition-colors',
                n.status === 'mastered' && 'border-success/20 hover:border-success/40',
                n.status === 'building' && 'border-warning/20 hover:border-warning/40',
                n.status === 'untouched' && 'border-border hover:border-foreground/30',
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Icon className={cn('h-4 w-4 shrink-0', style.chip.split(' ').find(c => c.startsWith('text-')))} />
                  <span className="truncate font-medium text-foreground">{n.label}</span>
                </div>
                <p className="mt-1 text-small text-muted-foreground">
                  {n.attempts === 0
                    ? 'Not started'
                    : `${n.attempts} attempt${n.attempts === 1 ? '' : 's'}${n.best != null ? ` · best ${n.best}` : ''}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full px-2 py-0.5 text-micro font-medium', style.chip)}>
                  {style.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
