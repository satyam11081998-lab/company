'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, ArrowRight, Trophy, Lock } from 'lucide-react';
import type { CaseAttemptRow } from '@/lib/types';

type AttemptWithSubmission = CaseAttemptRow & {
  submissions?: {
    score: number | null;
    feedback_json: unknown;
    answer_text: string;
    created_at: string;
  } | null;
};

interface Props {
  attempts: AttemptWithSubmission[];
}

export default function CaseAttemptHistory({ attempts }: Props) {
  const [expanded, setExpanded] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('expanded_attempt');
      if (saved !== null) return saved;
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (expanded) sessionStorage.setItem('expanded_attempt', expanded);
      else sessionStorage.removeItem('expanded_attempt');
    }
  }, [expanded]);

  if (!attempts.length) return null;

  // Sort newest first
  const sorted = [...attempts].sort((a, b) => b.attempt_number - a.attempt_number);
  const firstAttempt = sorted.find((a) => a.is_first_attempt);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-small font-semibold uppercase tracking-wider text-muted-foreground">
          Your attempts ({attempts.length})
        </h3>
        {firstAttempt && firstAttempt.counted_for_daily && (
          <span className="flex items-center gap-1.5 text-micro font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
            <Trophy className="h-3 w-3" />
            Counted for daily
          </span>
        )}
      </div>

      <div className="space-y-2">
        {sorted.map((a) => {
          const isOpen = expanded === a.id;
          const score = a.submissions?.score ?? null;
          return (
            <div key={a.id} className="border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : a.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-small font-semibold text-foreground tabular-nums">
                    Attempt {a.attempt_number}
                  </span>
                  {a.is_first_attempt ? (
                    <span className="text-micro font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      First (counted)
                    </span>
                  ) : (
                    <span className="text-micro font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Re-attempt
                    </span>
                  )}
                  <span className="text-small text-foreground">
                    {a.submissions?.created_at && new Date(a.submissions.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {score !== null && (
                    <span className={`text-body font-mono font-semibold tabular-nums ${scoreColor(score)}`}>
                      {score}<span className="text-micro text-muted-foreground font-normal">/100</span>
                    </span>
                  )}
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              {isOpen && a.submissions && (
                <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/20">
                  <p className="text-small text-muted-foreground mb-2 uppercase tracking-wider font-semibold mt-2">
                    Your answer
                  </p>
                  <div className="max-h-[35vh] overflow-y-auto pr-2 mb-3">
                    <p className="text-small text-foreground whitespace-pre-wrap leading-relaxed">
                      {a.submissions.answer_text}
                    </p>
                  </div>
                  <Link
                    href={`/results/${a.submission_id}`}
                    className="inline-flex items-center gap-1 text-small font-medium text-primary hover:underline"
                  >
                    View full feedback
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-primary';
}
