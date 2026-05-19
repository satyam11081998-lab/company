import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, ArrowRight } from 'lucide-react';
import { SCORE_DIMENSIONS, SCORE_DIMENSION_LABELS } from '@/lib/constants';
import type { UserRow, SubmissionRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** Results page — shows score, breakdown bars, strengths, improvements. */
export default async function ResultPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const [userRes, submissionRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('submissions').select('*').eq('id', params.id).maybeSingle(),
  ]);

  const userRow = userRes.data as UserRow | null;
  const submission = submissionRes.data as SubmissionRow | null;
  if (!submission) notFound();

  const score = submission.score ?? 0;
  const feedback = submission.feedback_json || {};
  const breakdown = feedback.breakdown || {};
  const didWell = feedback.did_well || [];
  const improve = feedback.improve || [];
  const summary = feedback.summary || 'No summary available yet.';

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav user={userRow} />
      <main className="container max-w-3xl py-10">
        {/* Big score */}
        <Card className="flex flex-col items-center p-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Your score</p>
          <p className="mt-3 text-7xl font-bold text-amber-500">
            {score}
            <span className="text-3xl font-normal text-slate-400">/100</span>
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">{summary}</p>
        </Card>

        {/* Breakdown */}
        <Card className="mt-6 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Breakdown</h2>
          <div className="mt-4 space-y-4">
            {SCORE_DIMENSIONS.map((dim) => {
              const value = Math.max(0, Math.min(100, Number(breakdown[dim] ?? 0)));
              return (
                <div key={dim}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{SCORE_DIMENSION_LABELS[dim]}</span>
                    <span className="font-semibold text-slate-900">{value}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${value}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Strengths / Improvements */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">What you did well</h3>
            <ul className="mt-4 space-y-3">
              {didWell.length === 0 ? (
                <li className="text-sm text-slate-500">No highlights yet.</li>
              ) : (
                didWell.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))
              )}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-700">Where you can improve</h3>
            <ul className="mt-4 space-y-3">
              {improve.length === 0 ? (
                <li className="text-sm text-slate-500">No suggestions yet.</li>
              ) : (
                improve.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-700">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                    <span>{item}</span>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/cases">
            <Button className="bg-amber-500 text-white hover:bg-amber-600">Try another case</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
