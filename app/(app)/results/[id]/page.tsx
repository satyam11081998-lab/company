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
} from '@/lib/constants';
import type { SubmissionRow } from '@/lib/types';

export const revalidate = false;

/** Results page — shows score, breakdown bars, strengths, improvements. */
export default async function ResultPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');
  const authUser = session.user;

  const submissionRes = await supabase.from('submissions').select('*').eq('id', params.id).maybeSingle();
  const submission = submissionRes.data as SubmissionRow | null;
  if (!submission) notFound();

  const score = submission.score ?? 0;
  const feedback = (submission.feedback_json || {}) as {
    breakdown?: Record<string, number>;
    strengths?: string[];
    improvements?: string[];
    summary?: string;
  };
  const breakdown = feedback.breakdown || {};
  const strengths = feedback.strengths || [];
  const improvements = feedback.improvements || [];
  const summary = feedback.summary || 'No summary available yet.';

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

        {/* Breakdown */}
        <Card className="mt-6 p-6">
          <h2 className="text-small font-semibold uppercase tracking-wide text-muted-foreground">Breakdown</h2>
          <div className="mt-4 space-y-4">
            {SCORE_DIMENSIONS.map((dim) => {
              const value = Number(breakdown[dim] ?? 0);
              const max = SCORE_DIMENSION_MAX[dim] ?? 100;
              const percentage = Math.max(0, Math.min(100, (value / max) * 100));
              return (
                <div key={dim}>
                  <div className="flex items-center justify-between text-body">
                    <span className="font-medium text-foreground/80">
                      {SCORE_DIMENSION_LABELS[dim]}
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

        {/* Strengths / Improvements */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="p-6 border-l-4 border-l-success">
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
          <Card className="p-6 border-l-4 border-l-primary">
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
          <Link href="/cases">
            <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">Try another case</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}