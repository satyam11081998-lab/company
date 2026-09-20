import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LinkedInFollowPrompt } from '@/components/linkedin-follow-unlock';
import { effectiveTier, canSeeCaseFigures } from '@/lib/tier';
import FirstScorePaywall from '@/components/results/first-score-paywall';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ResultsDeck from '@/components/results/results-deck';
import { getCaseFigures, getCaseFigureKinds } from '@/lib/dashboard/case-figures';
import { createServiceClient } from '@/lib/supabase/service';
import { GUESSTIMATE_WEIGHTS } from '@/lib/scoring/apply-backstop';
import {
  SCORE_DIMENSIONS,
  SCORE_DIMENSION_LABELS,
  SCORE_DIMENSION_MAX,
  GUESSTIMATE_DIMENSION_MAX_LEGACY,
  GUESSTIMATE_DIMENSIONS,
  GUESSTIMATE_DIMENSION_LABELS,
  GUESSTIMATE_DIMENSION_MAX,
  SCORE_DIMENSION_SHORT,
  GUESSTIMATE_DIMENSION_SHORT,
} from '@/lib/constants';
import type { SubmissionRow, BadgeRow, UserRow } from '@/lib/types';
import BadgePill from '@/components/badge-pill';
import TrackPageAction from '@/components/analytics/track-page-action';

export const revalidate = false;

/** Results page — shows score, breakdown bars, strengths, improvements. */
export default async function ResultPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  // Service role, used ONLY to read `case_figures` (0069) after the tier check
  // below. Never used to read anything the user is not already entitled to.
  // Absent in environments without SUPABASE_SERVICE_ROLE_KEY — the page then
  // simply has no figures, which is the safe direction.
  let figuresSvc: ReturnType<typeof createServiceClient> | null = null;
  try { figuresSvc = createServiceClient(); } catch { figuresSvc = null; }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const authUser = user;

  const [submissionRes, userBadgesRes, attemptRes] = await Promise.all([
    // Ownership filter (defense-in-depth alongside RLS): a user may only ever
    // read their OWN submission — prevents IDOR via a guessed/!shared id.
    supabase.from('submissions').select('*').eq('id', params.id).eq('user_id', authUser.id).maybeSingle(),
    supabase.from('user_badges').select('*, badges(*)').eq('trigger_submission_id', params.id),
    // Was this attempt today's daily? Drives the LinkedIn follow-unlock popup.
    supabase.from('case_attempts').select('counted_for_daily').eq('submission_id', params.id).eq('user_id', authUser.id).maybeSingle(),
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
    scale?: number;
    // Additive (2026-09-01) — richer, evidence-based feedback. All optional so
    // older submissions (no such fields) render exactly as before.
    dimension_feedback?: Record<string, { score?: number; evidence?: string; gap?: string; to_improve?: string }>;
    red_flags?: string[];
    model_answer?: string;
    // Additive (2026-09-12) — the 3-approach feedback. Optional; older/guesstimate
    // rows without it render exactly as before.
    approaches?: {
      your_line?: { title?: string; exchanges?: Array<{ you_asked?: string; interviewer_said?: string; stronger_version?: string; why?: string }> };
      top_candidate?: { title?: string; walkthrough?: string; frameworks?: string[]; flow?: Array<{ step?: string; move?: string; framework?: string }> };
      third_angle?: { title?: string; body?: string; insight?: string };
    };
    validity?: { verdict?: string; relevance?: number; effort?: number; reason?: string };
    backstop?: {
      findings?: Array<{ kind: string; label: string; message: string }>;
      summary?: string;
      notChecked?: string;
      arithmeticOverridden?: boolean;
    };
  };
  const breakdown = feedback.breakdown || {};
  const dimensionFeedback = feedback.dimension_feedback || {};
  const strengths = feedback.strengths || [];
  const improvements = feedback.improvements || [];
  const redFlags = feedback.red_flags || [];
  const modelAnswer = feedback.model_answer || '';
  const approaches = feedback.approaches;
  const yourLine = approaches?.your_line;
  const topCandidate = approaches?.top_candidate;
  const thirdAngle = approaches?.third_angle;
  const validity = feedback.validity;
  // Hard gate: gibberish / off-topic submissions score 0 and say why.
  const notScored = validity?.verdict === 'gibberish' || validity?.verdict === 'off_topic';
  const summary = feedback.summary || 'No summary available yet.';
  const isGuesstimate = feedback.rubric === 'guesstimate';
  // Guesstimate dimensions are 0-100 for submissions scored on/after 2026-09-01
  // (feedback.scale === 100); older ones are still 1-5.
  const guessMax = feedback.scale === 100 ? GUESSTIMATE_DIMENSION_MAX : GUESSTIMATE_DIMENSION_MAX_LEGACY;
  const backstop = feedback.backstop;
  const newBadges = (userBadgesRes.data || []) as Array<{ id: string; badges: BadgeRow }>;
  const wasDaily = !!(attemptRes.data as { counted_for_daily?: boolean } | null)?.counted_for_daily;

  const { data: userRow } = await supabase
    .from('users').select('*').eq('id', authUser.id).maybeSingle();
  const tier = effectiveTier(userRow as any);

  let weakDimLabel: string | null = null;
  {
    const dims = isGuesstimate ? GUESSTIMATE_DIMENSIONS : SCORE_DIMENSIONS;
    let worst = Infinity;
    for (const dim of dims) {
      const rawMax = isGuesstimate ? guessMax : (SCORE_DIMENSION_MAX[dim] ?? 100);
      const pct = rawMax ? Number(breakdown[dim] ?? 0) / rawMax : 1;
      if (pct < worst) {
        worst = pct;
        weakDimLabel = isGuesstimate ? GUESSTIMATE_DIMENSION_LABELS[dim] : SCORE_DIMENSION_LABELS[dim];
      }
    }
  }

  // The worked solution lives on the case (shown only after submitting). The
  // title comes along for the deck's header — previously the page never named
  // the case it was scoring, which reads oddly once the score is not the only
  // thing on screen.
  let solution: string | null = null;
  let caseTitle: string | null = null;
  if (submission.case_id) {
    const { data: caseRow } = await supabase
      .from('cases')
      .select('solution, title')
      .eq('id', submission.case_id)
      .maybeSingle();
    solution = (caseRow as { solution?: string | null } | null)?.solution ?? null;
    caseTitle = (caseRow as { title?: string | null } | null)?.title ?? null;
  }

  // ── Shape the scorer's output into the figures the deck draws ──────
  //
  // Case and guesstimate rubrics are scored differently and have to be brought
  // onto ONE scale before anything can be charted honestly:
  //   • case dimensions carry their own maxima (25/20/20/15/10/10) which
  //     already sum to 100, so marks earned and marks available are direct;
  //   • guesstimate dimensions are each 0..100 and the TOTAL is a weighted sum,
  //     so a raw 0..100 dimension score is not a number of marks. Converting it
  //     through the published weights (10/30/25/15/20) is what makes "this gap
  //     cost you 8 marks" true rather than decorative — and it is the only
  //     reason the bridge lands on the real score.
  const dims = isGuesstimate ? GUESSTIMATE_DIMENSIONS : SCORE_DIMENSIONS;
  const dimLabel = (d: string) =>
    isGuesstimate ? GUESSTIMATE_DIMENSION_LABELS[d] ?? d : SCORE_DIMENSION_LABELS[d] ?? d;

  const dimRows = (dims as readonly string[]).map((dim) => {
    const raw = Number(breakdown[dim] ?? 0);
    const available = isGuesstimate
      ? Math.round((GUESSTIMATE_WEIGHTS[dim as keyof typeof GUESSTIMATE_WEIGHTS] ?? 0) * 100)
      : SCORE_DIMENSION_MAX[dim] ?? 0;
    const rawMax = isGuesstimate ? guessMax : available;
    const pct = rawMax > 0 ? Math.max(0, Math.min(1, raw / rawMax)) : 0;
    const earned = available * pct;
    const df = dimensionFeedback[dim] ?? {};
    return {
      key: dim,
      label: dimLabel(dim),
      available,
      earned,
      pct,
      evidence: df.evidence,
      gap: df.gap,
      toImprove: df.to_improve,
    };
  });

  const shortLabel = (d: string) =>
    (isGuesstimate ? GUESSTIMATE_DIMENSION_SHORT[d] : SCORE_DIMENSION_SHORT[d]) ?? dimLabel(d);
  const radar = dimRows.map((r) => ({
    label: r.label,
    short: shortLabel(r.key),
    value: r.pct,
    detail: `${Math.round(r.earned)} of ${r.available} marks`,
  }));
  const bars = dimRows.map((r) => ({ label: r.label, earned: r.earned, available: r.available }));
  const bridge = dimRows.map((r) => ({ label: r.label, lost: Math.max(0, r.available - r.earned), available: r.available }));
  const dimensionNotes = dimRows.map((r) => ({
    label: r.label, evidence: r.evidence, gap: r.gap, toImprove: r.toImprove, pct: r.pct,
  }));

  // ── Case figures: a PRO entitlement, withheld on the server ────────
  //
  // Everything else on this page is free and stays free. These are the CASE's
  // own worked figures — the profit bridge, the 2x2, the driver tree — which is
  // the worked answer, not the user's own result.
  //
  // The withholding happens HERE, not in the deck. ResultsDeck is a client
  // component, so every prop it receives is serialised into the page payload
  // and readable in devtools regardless of what is painted. Rendering the
  // figures behind a `locked` flag would ship the answer to exactly the people
  // it is being withheld from. So a locked user is sent the titles and captions
  // and NOTHING else — enough to know what is behind the lock, useless as an
  // answer.
  //
  // The figures no longer live in feedback_json at all — they are in
  // `case_figures`, which has RLS on and no policy (migration 0069). That is
  // the whole point: withholding them HERE was decorative while the same blob
  // was being shipped to client components by /dashboard, /cases/[id] and
  // /profile, and served directly to the user's own JWT over PostgREST.
  // Now there is nothing to withhold — an unentitled user's page never reads
  // them, and could not read them if it tried.
  const maySeeFigures = canSeeCaseFigures(userRow as UserRow | null);
  const allVisuals = await getCaseFigures(figuresSvc, submission.case_id, maySeeFigures);
  //
  // What a locked user receives is the figure KINDS and nothing else. An
  // earlier version sent titles and captions, which was wrong: those strings
  // are MODEL-WRITTEN, and nothing stops a caption being the answer itself
  // ("Revenue of Rs 1,840cr falls to Rs 132cr operating profit"). `kind` comes
  // from our own six-value enum, so the lock screen can say "a profit bridge"
  // with no possibility of leaking a number.
  const visuals = allVisuals;
  // A locked user's screen gets the figure KINDS and nothing else — see
  // getCaseFigureKinds. The lock is only shown when something is behind it.
  const lockedFigureKinds = maySeeFigures
    ? []
    : await getCaseFigureKinds(figuresSvc, submission.case_id);

  // 0068: the conversation behind this score. `submissions.attempt_id` may be
  // absent on a pre-migration database — the deck just omits the link then.
  const attemptId = (submission as unknown as { attempt_id?: string | null }).attempt_id ?? null;

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-6xl py-10">
        <TrackPageAction action="view_results" category="case" label={`Score: ${score}/100`} value={{ submission_id: params.id, score, is_guesstimate: isGuesstimate, attempt_id: attemptId }} />

        {newBadges.length > 0 && (
          <Card className="mb-6 border-primary/20 bg-primary/[0.03] p-5">
            <p className="text-small font-semibold uppercase tracking-wider text-primary">
              {newBadges.length === 1 ? 'New badge earned' : `${newBadges.length} new badges earned`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {newBadges.map((b) => (
                <BadgePill key={b.id} badge={b.badges as BadgeRow} size="md" />
              ))}
            </div>
          </Card>
        )}

        <ResultsDeck
          score={score}
          scale={100}
          summary={summary}
          caseTitle={caseTitle}
          caseType={isGuesstimate ? 'guesstimate' : 'case'}
          notScored={notScored}
          validityReason={validity?.reason ?? null}
          radar={radar}
          bars={bars}
          bridge={bridge}
          dimensionNotes={dimensionNotes}
          redFlags={redFlags}
          strengths={strengths}
          improvements={improvements}
          visuals={visuals}
          lockedFigureKinds={lockedFigureKinds}
          topCandidate={topCandidate}
          thirdAngle={thirdAngle}
          yourLine={yourLine}
          finalRecommendation={null}
          attemptId={attemptId}
          modelAnswer={modelAnswer || null}
          workedSolution={solution}
          backstop={backstop ?? null}
        />

        {tier === 'free' && <div className="mt-8"><FirstScorePaywall weakDimLabel={weakDimLabel} /></div>}

        {/* GUEST MODE: someone who solved a case before signing up lands HERE
            as their first authenticated page — the score is what they created
            the account for. They have never seen the dashboard, so "Try
            another case" alone leaves them with no route into the product.
            Both options, dashboard first. */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
              Go to your dashboard
            </Button>
          </Link>
          <Link href="/practice?tab=scored">
            <Button variant="outline">Try another case</Button>
          </Link>
        </div>
        <LinkedInFollowPrompt wasDaily={wasDaily} />
      </main>
    </div>
  );
}
