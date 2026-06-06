/**
 * /cases/[id] — new conversational solve workspace.
 *
 * Replaces the old SubmissionForm flow. We do the server-side gate
 * (auth, case exists, attempt access, prior attempts visible) and then
 * mount the client `ConversationalSolve` component for the live session.
 *
 * The legacy hint block, attempt history and rating prompt are kept and
 * rendered ABOVE the workspace so users still see prior scores; the
 * workspace itself sits inline as the primary surface.
 */

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import CaseAttemptHistory from '@/components/case-attempt-history';
import CaseRatingPrompt from '@/components/case-rating-prompt';
import ConversationalSolve from '@/components/solve/ConversationalSolve';
import { getAttemptAccess } from '@/lib/access';
import type { CaseRow, CaseAttemptRow, UserRow } from '@/lib/types';
import { ArrowRight, Lock } from 'lucide-react';

// No revalidate — the workspace is fully client-side after first paint.
export const dynamic = 'force-dynamic';

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const authUser = user;

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
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
  ]);

  const caseRow = caseRes.data as CaseRow | null;
  if (!caseRow) notFound();

  const attempts = (attemptsRes.data || []) as Array<
    CaseAttemptRow & {
      submissions?: {
        score: number | null;
        feedback_json: unknown;
        answer_text: string;
        created_at: string;
      } | null;
    }
  >;
  const fullUser = userRes.data as UserRow | null;
  const userRating = (ratingRes.data as { rating: string } | null)?.rating || null;

  const access = await getAttemptAccess(supabase, fullUser, { id: caseRow.id, type: caseRow.type });
  const hasAttempted = attempts.length > 0;

  const historyPanel = hasAttempted ? (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-small font-semibold uppercase tracking-widest text-muted-foreground">
          Your previous attempts
        </h3>
        <CaseAttemptHistory attempts={attempts} />
      </div>
      <div>
        <CaseRatingPrompt
          caseId={caseRow.id}
          userId={authUser.id}
          existingRating={userRating as 'easier' | 'right' | 'harder' | null}
          lastSubmissionId={attempts[0]?.submission_id || null}
        />
      </div>
    </div>
  ) : (
    <div className="space-y-3">
      <h3 className="text-small font-semibold uppercase tracking-widest text-muted-foreground">
        Your previous attempts
      </h3>
      <div className="rounded-md border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
        <p className="text-small text-muted-foreground">
          You haven't attempted this case yet.
          <br />
          All your past solutions and scores will appear here.
        </p>
      </div>
    </div>
  );

  let lockedOverlay = null;

  if (!access.allowed) {
    const lockTitle =
      access.reason === 'free-non-daily'
        ? 'This case is for Lite & Pro'
        : access.reason === 'lite-quota'
        ? `You've used today's extra ${access.bucket === 'guesstimate' ? 'guesstimates' : 'cases'}`
        : "You've already attempted this case";
    const lockBody =
      access.reason === 'free-non-daily'
        ? "Free covers today's daily case and guesstimate. Upgrade to Lite to practise the full bank — plus 2 extra cases and 2 extra guesstimates every day."
        : access.reason === 'lite-quota'
        ? `Lite includes 2 extra ${access.bucket === 'guesstimate' ? 'guesstimates' : 'cases'} per day beyond the daily ones. Upgrade to Pro for unlimited practice.`
        : 'Free tier allows one attempt per case. Upgrade to Lite or Pro for unlimited re-attempts.';
    const lockCta =
      access.reason === 'free-non-daily'
        ? 'Upgrade to Lite'
        : access.reason === 'lite-quota'
        ? 'Upgrade to Pro'
        : 'Upgrade for re-attempts';

    lockedOverlay = (
      <Card className="bg-card p-6 text-center max-w-sm shadow-2xl border-primary/20">
        <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <h2 className="text-h3 mb-2 text-foreground">{lockTitle}</h2>
        <p className="mx-auto mb-5 max-w-md text-body text-muted-foreground">{lockBody}</p>
        <Link
          href="/upgrade"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-body font-semibold text-white transition-colors hover:bg-primary-hover shadow-sm"
        >
          {lockCta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    );
  }

  return (
    <ConversationalSolve 
      caseId={caseRow.id} 
      initialCase={{
        title: caseRow.title,
        content: caseRow.content,
        type: caseRow.type,
        difficulty: caseRow.difficulty,
        hint: caseRow.hint,
      }}
      historyPanel={historyPanel}
      lockedOverlay={lockedOverlay}
    />
  );
}
