'use client';

/**
 * WelcomeTour — a lightweight, dismissible first-run product tour.
 *
 * Why this exists: onboarding-form.tsx collects who the user is, but nothing
 * orients them to the PRODUCT. New users were dropped straight onto the (dense)
 * dashboard with no explanation of Learn / Practice / GD Briefs / Leaderboard.
 * This modal gives a 30-second guided intro and ends on a single first action.
 *
 * Behaviour:
 *   - Shows once. A localStorage flag (`mece_welcome_tour_v1`) suppresses it
 *     after the user finishes or skips. No DB column → no backend/contract
 *     change, safe to ship from the frontend.
 *   - Re-openable from anywhere via `window.dispatchEvent(new Event(REPLAY_EVENT))`
 *     (the dashboard "Getting started" checklist wires a "Replay tour" button to it).
 *   - SSR-safe: the localStorage read happens in useEffect, never during render.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Compass,
  BookOpen,
  Brain,
  Trophy,
  ArrowRight,
  Check,
} from 'lucide-react';

const SEEN_KEY = 'mece_welcome_tour_v1';
export const REPLAY_EVENT = 'mece:open-welcome-tour';

interface Step {
  icon: React.FC<any>;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: Compass,
    title: 'Welcome to MECE',
    body: "Here's a 30-second tour of how you go from zero to placement-ready. Four things power your prep — let's walk through them.",
  },
  {
    icon: BookOpen,
    title: 'Learn the method',
    body: 'The Casebook is your free library — frameworks, guesstimates, and fully worked cases. New here? Start with the “Getting Started” section.',
  },
  {
    icon: Brain,
    title: 'Practice & get scored',
    body: 'Solve cases and guesstimates, and every answer is scored on 6 consulting dimensions in about 60 seconds — with written feedback, not just a number.',
  },
  {
    icon: Trophy,
    title: 'Track & compete',
    body: 'Your dashboard shows your readiness and the single best thing to do next. Daily GD Briefs prep you for group discussions, and the leaderboard ranks you nationally.',
  },
];

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* private mode / storage disabled — fail open, tour just shows again */
  }
}

export default function WelcomeTour() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // First-run check (client only).
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === '1';
    } catch {
      seen = false;
    }
    if (!seen) setOpen(true);
  }, []);

  // Allow other components to replay the tour.
  useEffect(() => {
    const reopen = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(REPLAY_EVENT, reopen);
    return () => window.removeEventListener(REPLAY_EVENT, reopen);
  }, []);

  const close = useCallback(() => {
    markSeen();
    setOpen(false);
  }, []);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const Icon = current.icon;

  const finish = () => {
    markSeen();
    setOpen(false);
    router.push('/practice?tab=guesstimates');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      {/* @ts-ignore - JSX inferred types lack children */}
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        {/* Accent header */}
        <div className="bg-navy px-6 pt-6 pb-5 text-navy-foreground">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/15 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium text-navy-foreground/50 tabular-nums">
              {step + 1} / {STEPS.length}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-navy-foreground">
            {current.title}
          </DialogTitle>
        </div>

        <div className="px-6 py-5">
          <DialogDescription className="text-[14px] leading-relaxed text-foreground/80">
            {current.body}
          </DialogDescription>

          {/* Progress dots */}
          <div className="mt-5 flex items-center gap-1.5" aria-hidden>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={close}
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="text-[13px] font-semibold px-3 py-2 rounded-md border border-border text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
            )}
            {!isLast ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                <Check className="h-3.5 w-3.5" /> Solve my first guesstimate
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
