import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import SubmissionForm from '@/components/submission-form';
import HintToggle from '@/components/hint-toggle';
import CaseAttemptHistory from '@/components/case-attempt-history';
import CaseRatingPrompt from '@/components/case-rating-prompt';
import type { CaseRow, SubmissionRow, CaseAttemptRow } from '@/lib/types';
import { CASE_TYPE_LABELS, DIFFICULTY_LABELS } from '@/lib/constants';
import { ArrowRight, Lock, Award } from 'lucide-react';

export const revalidate = 300;

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const authUser = user;

  // Parallel fetches
  const [caseRes, attemptsRes, ratingRes, userRes] = await Promise.all([
    supabase.from('cases').select('*').eq('id', params.id).maybeSingle(),
    supabase
      .from('case_attempts')
      .select('*, submissions(score, feedback_json, answer_text, created_at)')
      .eq('user_id', authUser.id)
      .eq('case_id', params.id)
      .order('attempt_number', { ascending: false })
      .limit(5),
    supabase
      .from('case_ratings')
      .select('rating')
      .eq('user_id', authUser.id)
      .eq('case_id', params.id)
      .maybeSingle(),
    supabase.from('users').select('subscription_tier').eq('id', authUser.id).maybeSingle(),
  ]);

  const caseRow = caseRes.data as CaseRow | null;
  if (!caseRow) notFound();

  const attempts = (attemptsRes.data || []) as Array<CaseAttemptRow & { submissions?: { score: number | null; feedback_json: unknown; answer_text: string; created_at: string } | null }>;
  const userTier = (userRes.data as { subscription_tier?: string } | null)?.subscription_tier || 'free';
  const userRating = (ratingRes.data as { rating: string } | null)?.rating || null;

  const hasAttempted = attempts.length > 0;
  const canReattempt = userTier === 'lite' || userTier === 'pro';
  const showForm = !hasAttempted || canReattempt;

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-4xl py-10">
        <Link 
          href="/practice"
          className="inline-flex items-center gap-1 text-small text-muted-foreground hover:text-foreground mb-4"
        >
          ← Back to Practice
        </Link>

        {/* Case header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            <span>{CASE_TYPE_LABELS[caseRow.type] || caseRow.type}</span>
            <span>·</span>
            <span>{DIFFICULTY_LABELS[caseRow.difficulty] || caseRow.difficulty}</span>
          </div>
          <h1 className="text-h2 text-foreground mb-4">{caseRow.title}</h1>
          <div className="mt-6">
            <HintToggle hint={caseRow.hint ? `${caseRow.content}\n\n---\n\n${caseRow.hint}` : caseRow.content} />
          </div>
        </Card>

        {/* Previous attempts (always show if exists) */}
        {hasAttempted && (
          <div className="mb-6">
            <CaseAttemptHistory attempts={attempts} />
          </div>
        )}

        {/* Submission form or upgrade prompt */}
        {showForm ? (
          <Card className="p-6">
            <h2 className="text-h3 text-foreground mb-1">
              {hasAttempted ? 'Try again' : 'Submit your answer'}
            </h2>
            <p className="text-small text-muted-foreground mb-4">
              {hasAttempted 
                ? 'Your re-attempt will not change leaderboard position, but the score helps track improvement.'
                : 'Spend 20-30 minutes structuring your response. Your first attempt counts for the leaderboard.'}
            </p>
            <SubmissionForm caseId={caseRow.id} userId={authUser.id} />
          </Card>
        ) : (
          <Card className="p-6 text-center bg-card">
            <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-h3 text-foreground mb-2">
              You've already attempted this case
            </h2>
            <p className="text-body text-muted-foreground mb-4 max-w-md mx-auto">
              Free tier allows one attempt per case. Upgrade to Lite or Pro for unlimited re-attempts.
            </p>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-1.5 bg-primary text-white text-body font-semibold px-5 py-2.5 rounded-md hover:bg-primary-hover transition-colors"
            >
              Upgrade for re-attempts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        )}

        {/* Difficulty rating prompt (only if attempted at least once) */}
        {hasAttempted && (
          <div className="mt-6">
            <CaseRatingPrompt 
              caseId={caseRow.id} 
              userId={authUser.id}
              existingRating={userRating as 'easier' | 'right' | 'harder' | null}
              lastSubmissionId={attempts[0]?.submission_id || null}
            />
          </div>
        )}
      </main>
    </div>
  );
}
