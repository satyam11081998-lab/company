'use client';

/**
 * GettingStartedChecklist — a persistent orientation card for brand-new users.
 *
 * The one-time WelcomeTour modal is easy to miss or dismiss; this card stays on
 * the dashboard until the user has taken their first real actions, so there is
 * always an obvious "what do I do next". Done-state is derived from REAL data
 * (scored-case and guesstimate counts) passed down from the dashboard, plus a
 * localStorage flag for the "read the guide" step (which has no DB signal).
 *
 * Renders nothing once every step is complete or the user dismisses it.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, X, Sparkles, PlayCircle } from 'lucide-react';
import { REPLAY_EVENT } from '@/components/onboarding/welcome-tour';

interface Props {
  scoredSolved: number;
  guesstimateSolved: number;
}

const READ_KEY = 'mece_gs_read_guide';
const DISMISS_KEY = 'mece_gs_checklist_dismissed';

export default function GettingStartedChecklist({ scoredSolved, guesstimateSolved }: Props) {
  const [mounted, setMounted] = useState(false);
  const [readGuide, setReadGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setReadGuide(localStorage.getItem(READ_KEY) === '1');
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      /* storage unavailable — treat as not-read, not-dismissed */
    }
    setMounted(true);
  }, []);

  const steps: {
    id: string;
    label: string;
    href: string;
    cta: string;
    done: boolean;
    onClick?: () => void;
  }[] = [
    {
      id: 'read',
      label: 'Skim the 7-page Getting Started guide',
      href: '/learn/casebook/getting-started/what-it-tests',
      cta: 'Read',
      done: readGuide,
      onClick: () => {
        try { localStorage.setItem(READ_KEY, '1'); } catch {}
        setReadGuide(true);
      },
    },
    {
      id: 'guess',
      label: 'Solve your first guesstimate',
      href: '/practice?tab=guesstimates',
      cta: 'Start',
      done: guesstimateSolved > 0,
    },
    {
      id: 'case',
      label: 'Solve your first scored case',
      href: '/practice?tab=scored',
      cta: 'Start',
      done: scoredSolved > 0,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  // Avoid hydration flash; hide once complete or dismissed.
  if (!mounted || dismissed || allDone) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch {}
    setDismissed(true);
  };

  return (
    <div className="ui-card p-5 relative">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss checklist"
        className="absolute right-3 top-3 text-muted-foreground/60 hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-[15px] font-bold text-foreground">Getting started</h3>
      </div>
      <p className="text-[13px] text-muted-foreground mb-4">
        Three quick steps to your first scored answer — {doneCount} of {steps.length} done.
      </p>

      {/* progress bar */}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <ul className="space-y-2">
        {steps.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5"
          >
            <span
              className={`flex items-center justify-center h-5 w-5 rounded-full shrink-0 ${
                s.done
                  ? 'bg-success text-white'
                  : 'border-2 border-muted-foreground/30'
              }`}
            >
              {s.done && <Check className="h-3 w-3" />}
            </span>
            <span
              className={`flex-1 text-[13.5px] ${
                s.done ? 'text-muted-foreground line-through' : 'text-foreground font-medium'
              }`}
            >
              {s.label}
            </span>
            {!s.done && (
              <Link
                href={s.href}
                onClick={s.onClick}
                className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary hover:underline shrink-0"
              >
                {s.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(REPLAY_EVENT))}
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <PlayCircle className="h-3.5 w-3.5" /> Replay the 30-second tour
      </button>
    </div>
  );
}
