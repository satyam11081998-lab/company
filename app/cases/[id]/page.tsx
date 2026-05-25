import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import SubmissionForm from '@/components/submission-form';
import HintToggle from '@/components/hint-toggle';
import type { UserRow, CaseRow } from '@/lib/types';
import { CASE_TYPE_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';

export const revalidate = 300;

/** Case detail page — full content, hint, and answer submission form. */
export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const [userRes, caseRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('cases').select('*').eq('id', params.id).maybeSingle(),
  ]);

  const userRow = userRes.data as UserRow | null;
  const caseRow = caseRes.data as CaseRow | null;
  if (!caseRow) notFound();

  return (
    <div className="min-h-screen bg-muted">
      <AppNav user={userRow} />
      <main className="container max-w-4xl py-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-border bg-card px-2 py-0.5 text-base font-medium text-foreground/80">{CASE_TYPE_LABELS[caseRow.type] || caseRow.type}</span>
          <span className={`rounded-md border px-2 py-0.5 text-base font-medium ${DIFFICULTY_COLORS[caseRow.difficulty] || ''}`}>{DIFFICULTY_LABELS[caseRow.difficulty] || caseRow.difficulty}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{caseRow.title}</h1>

        <div className="mt-6 rounded-lg border border-border border-l-4 border-l-primary bg-card p-6 shadow-sm">
          <p className="whitespace-pre-line text-base leading-relaxed text-foreground/80">{caseRow.content}</p>
        </div>

        {caseRow.hint && (
          <div className="mt-4">
            <HintToggle hint={caseRow.hint} />
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">Your answer</h2>
          <div className="mt-3">
            <SubmissionForm userId={authUser.id} caseId={caseRow.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
