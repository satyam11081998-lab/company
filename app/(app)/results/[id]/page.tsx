import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, ArrowRight } from 'lucide-react';
import {
  SCORE_DIMENSIONS,
  SCORE_DIMENSION_LABELS,
  SCORE_DIMENSION_MAX,
  GUESSTIMATE_DIMENSIONS,
  GUESSTIMATE_DIMENSION_LABELS,
  GUESSTIMATE_DIMENSION_MAX,
} from '@/lib/constants';
import type { SubmissionRow, BadgeRow } from '@/lib/types';
import BadgePill from '@/components/badge-pill';

export const revalidate = false;

/** Results page — shows score, breakdown bars, strengths, improvements. */
export default async function ResultPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const authUser = user;

  const [submissionRes, userBadgesRes] = await Promise.all([
    supabase.from('submissions').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('user_badges').select('*, badges(*)').eq('trigger_submission_id', params.id),
  ]);
  const submission = submissionRes.data as SubmissionRow | null;
  if (!submission) notFound();

  const score = submission.score ?? 0;
  const feedback = (submission.feedback_json || {}) as {
    breakdown?: Record<string, number>;
    strengths?: string[];
    improvements?: string[];
    summary?: string;
    rubric?: string;
    backstop?: {
      findings?: Array<{ kind: string; label: string; message: string }>;
      summary?: string;
      notChecked?: string;
      arithmeticOverridden?: boolean;
    };
  };
  const breakdown = feedback.breakdown || {};
  const strengths = feedback.strengths || [];
  const improvements = feedback.improvements || [];
  const summary = feedback.summary || 'No summary available yet.';
  const isGuesstimate = feedback.rubric === 'guesstimate';
  const backstop = feedback.backstop;
  const newBadges = (userBadgesRes.data || []) as Array<{ id: string; badges: BadgeRow }>;

  // The worked solution lives on the case (shown only after submitting).
  let solution: string | null = null;
  if (submission.case_id) {
    const { data: caseRow } = await supabase
      .from('cases')
      .select('solution')
      .eq('id', submission.case_id)
      .maybeSingle();
    solution = (caseRow as { solution?: string | null } | null)?.solution ?? null;
  }

  return (
    <div className="min-h-screen bg-muted">

      <main className="container max-w-4xl py-10">
        {/* Big score */}
        <Card className="flex flex-col items-center p-10 text-center">
          <p className="text-small font-semibold uppercase tracking-wide text-muted-foreground">Your score</p>
          <div className="score-ring score-ring-lg" style={{ '--progress': score } as React.CSSProperties}>
            <p className="mt-3 text-7xl font-bold text-primary">
              {score}
              <span className="text-small font-normal text-muted-foreground/70">/100</span>
            </p>
          </div>
          <p className="mt-4 max-w-xl text-body leading-relaxed text-muted-foreground">{summary}</p>
        </Card>

        {newBadges.length > 0 && (
          <Card className="p-5 mt-6 mb-6 bg-primary/[0.03] border-primary/20">
            <p className="text-small font-semibold uppercase tracking-wider text-primary mb-3">
              🎉 New badges earned!
            </p>
            <div className="flex flex-wrap gap-2">
              {newBadges.map((b) => (
                <BadgePill key={b.id} badge={b.badges as BadgeRow} size="md" />
              ))}
            </div>
          </Card>
        )}

        {/* Breakdown */}
        <Card className="mt-6 p-6">
          <h2 className="text-small font-semibold uppercase tracking-wide text-muted-foreground">Breakdown</h2>
          <div className="mt-4 space-y-4">
            {(isGuesstimate ? GUESSTIMATE_DIMENSIONS : SCORE_DIMENSIONS).map((dim) => {
              const value = Number(breakdown[dim] ?? 0);
              const max = isGuesstimate ? GUESSTIMATE_DIMENSION_MAX : (SCORE_DIMENSION_MAX[dim] ?? 100);
              const label = isGuesstimate ? GUESSTIMATE_DIMENSION_LABELS[dim] : SCORE_DIMENSION_LABELS[dim];
              const percentage = Math.max(0, Math.min(100, (value / max) * 100));
              return (
                <div key={dim}>
                  <div className="flex items-center justify-between text-body">
                    <span className="font-medium text-foreground/80">
                      {label}
                    </span>
                    <span className="font-semibold text-foreground">
                      {value}
                      <span className="text-muted-foreground/70">/{max}</span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Arithmetic backstop (guesstimates only) — deterministic recompute verdict */}
        {isGuesstimate && backstop && (
          <Card className="mt-6 p-6">
            <h2 className="text-small font-semibold uppercase tracking-wide text-muted-foreground">
              Arithmetic check
            </h2>
            <p className="mt-3 text-body text-foreground/80">{backstop.summary}</p>
            {backstop.findings && backstop.findings.length > 0 && (
              <ul className="mt-4 space-y-3">
                {backstop.findings.map((f, idx) => (
                  <li key={idx} className="flex gap-2 text-body text-foreground/80">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                    <span>{f.message}</span>
                  </li>
                ))}
              </ul>
            )}
            {backstop.notChecked && (
              <p className="mt-4 text-small text-muted-foreground">{backstop.notChecked}</p>
            )}
          </Card>
        )}

        {/* Worked solution — revealed after submitting */}
        {solution && (
          <Card className="mt-6 p-6">
            <h2 className="text-small font-semibold uppercase tracking-wide text-muted-foreground">
              Worked solution
            </h2>
            <p className="mt-3 whitespace-pre-line text-body leading-relaxed text-foreground/80">
              {solution}
            </p>
          </Card>
        )}

        {/* Strengths / Improvements */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-small font-semibold uppercase tracking-wide text-emerald-700">
              What you did well
            </h3>
            <ul className="mt-4 space-y-3">
              {strengths.length === 0 ? (
                <li className="text-body text-muted-foreground">No highlights yet.</li>
              ) : (
                strengths.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-body text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))
              )}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="text-small font-semibold uppercase tracking-wide text-primary">
              Where you can improve
            </h3>
            <ul className="mt-4 space-y-3">
              {improvements.length === 0 ? (
                <li className="text-body text-muted-foreground">No suggestions yet.</li>
              ) : (
                improvements.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-body text-foreground/80">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/practice?tab=scored">
            <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">Try another case</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}