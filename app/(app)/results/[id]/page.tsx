import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LinkedInFollowPrompt } from '@/components/linkedin-follow-unlock';
import { effectiveTier } from '@/lib/tier';
import FirstScorePaywall from '@/components/results/first-score-paywall';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, ArrowRight, AlertTriangle, Lightbulb } from 'lucide-react';
import {
  SCORE_DIMENSIONS,
  SCORE_DIMENSION_LABELS,
  SCORE_DIMENSION_MAX,
  GUESSTIMATE_DIMENSION_MAX_LEGACY,
  GUESSTIMATE_DIMENSIONS,
  GUESSTIMATE_DIMENSION_LABELS,
  GUESSTIMATE_DIMENSION_MAX,
} from '@/lib/constants';
import type { SubmissionRow, BadgeRow } from '@/lib/types';
import BadgePill from '@/components/badge-pill';
import TrackPageAction from '@/components/analytics/track-page-action';

export const revalidate = false;

/** Results page — shows score, breakdown bars, strengths, improvements. */
export default async function ResultPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
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
  const hasApproaches = !!(
    (yourLine?.exchanges && yourLine.exchanges.length > 0) ||
    topCandidate?.walkthrough ||
    (topCandidate?.flow && topCandidate.flow.length > 0) ||
    thirdAngle?.body
  );
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
        <TrackPageAction action="view_results" category="case" label={`Score: ${score}/100`} value={{ submission_id: params.id, score, is_guesstimate: isGuesstimate }} />
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

        {notScored && (
          <Card className="mt-6 p-5 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <div>
                <p className="text-body font-semibold text-foreground">This wasn&apos;t scored as a real attempt</p>
                <p className="mt-1 text-small text-muted-foreground">
                  {validity?.reason || 'It didn’t read as a genuine attempt to solve this case, so it scored 0.'}{' '}
                  Give the case a real try — clarify, structure, quantify, and recommend — and you’ll get a full breakdown.
                </p>
              </div>
            </div>
          </Card>
        )}

        {tier === 'free' && !notScored && (
          <FirstScorePaywall weakDimLabel={weakDimLabel} />
        )}

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
              // Raw stored max for THIS submission's dimension (case dims are
              // weighted 25/20/…; guesstimate dims are 0-100 new, 1-5 legacy).
              const rawMax = isGuesstimate ? guessMax : (SCORE_DIMENSION_MAX[dim] ?? 100);
              const label = isGuesstimate ? GUESSTIMATE_DIMENSION_LABELS[dim] : SCORE_DIMENSION_LABELS[dim];
              const percentage = Math.max(0, Math.min(100, (value / rawMax) * 100));
              // Show every dimension on a single 0-100 scale, regardless of how it is stored.
              const shown = Math.round(percentage);
              const df = dimensionFeedback[dim];
              return (
                <div key={dim}>
                  <div className="flex items-center justify-between text-body">
                    <span className="font-medium text-foreground/80">
                      {label}
                    </span>
                    <span className="font-semibold text-foreground">
                      {shown}
                      <span className="text-muted-foreground/70">/100</span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {df && (df.evidence || df.gap || df.to_improve) && (
                    <div className="mt-2 space-y-1 rounded-lg bg-muted/50 p-3 text-small leading-relaxed">
                      {df.evidence && df.evidence.toLowerCase() !== 'none' && (
                        <p className="text-foreground/70"><span className="font-semibold text-foreground/80">What you did: </span>{df.evidence}</p>
                      )}
                      {df.gap && (
                        <p className="text-foreground/70"><span className="font-semibold text-foreground/80">Gap: </span>{df.gap}</p>
                      )}
                      {df.to_improve && (
                        <p className="text-foreground/70"><span className="font-semibold text-primary">To improve: </span>{df.to_improve}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Red flags — gaming, ethics, or logic problems the evaluator caught */}
        {redFlags.length > 0 && (
          <Card className="mt-6 p-6 border-amber-300/60">
            <h2 className="text-small font-semibold uppercase tracking-wide text-amber-700">
              Red flags
            </h2>
            <ul className="mt-4 space-y-3">
              {redFlags.map((f, idx) => (
                <li key={idx} className="flex gap-2 text-body text-foreground/80">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

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

        {/* Model answer — how a strong candidate would actually approach this case */}
        {modelAnswer && (
          <Card className="mt-6 p-6 border-primary/20 bg-primary/[0.03]">
            <h2 className="flex items-center gap-2 text-small font-semibold uppercase tracking-wide text-primary">
              <Lightbulb className="h-4 w-4" /> How a top candidate would approach this
            </h2>
            <p className="mt-3 whitespace-pre-line text-body leading-relaxed text-foreground/80">
              {modelAnswer}
            </p>
          </Card>
        )}

        {/* Three approaches — (1) your own line tightened, (2) how a top-firm
            candidate runs it with named frameworks, (3) the other road. Additive:
            renders only when the scorer produced `approaches`. */}
        {hasApproaches && (
          <div className="mt-6 space-y-6">
            <h2 className="text-small font-semibold uppercase tracking-wide text-muted-foreground">
              Three ways to run this
            </h2>

            {yourLine?.exchanges && yourLine.exchanges.length > 0 && (
              <Card className="p-6">
                <h3 className="text-small font-semibold uppercase tracking-wide text-foreground/70">
                  {yourLine.title || 'Your line — tightened'}
                </h3>
                <div className="mt-4 space-y-4">
                  {yourLine.exchanges.map((ex, idx) => (
                    <div key={idx} className="space-y-1.5">
                      {ex.you_asked && (
                        <p className="text-small text-muted-foreground"><span className="font-semibold text-foreground/70">You: </span>{ex.you_asked}</p>
                      )}
                      {ex.interviewer_said && ex.interviewer_said !== '—' && (
                        <p className="text-small text-muted-foreground"><span className="font-semibold text-foreground/70">Interviewer: </span>{ex.interviewer_said}</p>
                      )}
                      {ex.stronger_version && (
                        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-small leading-relaxed text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200">
                          <span className="font-semibold">Stronger: </span>{ex.stronger_version}
                        </p>
                      )}
                      {ex.why && <p className="text-micro text-muted-foreground">{ex.why}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {(topCandidate?.walkthrough || (topCandidate?.flow && topCandidate.flow.length > 0)) && (
              <Card className="p-6 border-primary/20 bg-primary/[0.03]">
                <h3 className="text-small font-semibold uppercase tracking-wide text-primary">
                  {topCandidate.title || 'How a top-firm candidate runs this'}
                </h3>
                {/* Step-by-step flow — the vertical spine of the model answer, each
                    stage with its move and the framework it applies. */}
                {topCandidate.flow && topCandidate.flow.length > 0 && (
                  <ol className="mt-4 space-y-3 border-l-2 border-primary/20 pl-4">
                    {topCandidate.flow.map((s, idx) => (
                      <li key={idx} className="relative">
                        <span className="absolute -left-[21px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-primary/70 ring-4 ring-background" />
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          {s.step && <span className="text-micro font-bold uppercase tracking-wide text-primary">{s.step}</span>}
                          {s.framework && <span className="rounded bg-muted px-1.5 py-0.5 text-micro font-medium text-foreground/60">{s.framework}</span>}
                        </div>
                        {s.move && <p className="mt-0.5 text-small leading-relaxed text-foreground/80">{s.move}</p>}
                      </li>
                    ))}
                  </ol>
                )}
                {topCandidate.walkthrough && (
                  <p className="mt-4 whitespace-pre-line text-body leading-relaxed text-foreground/80">
                    {topCandidate.walkthrough}
                  </p>
                )}
                {topCandidate.frameworks && topCandidate.frameworks.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {topCandidate.frameworks.map((f, idx) => (
                      <span key={idx} className="rounded-full bg-muted px-3 py-1 text-micro font-medium text-foreground/70">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {thirdAngle?.body && (
              <Card className="p-6">
                <h3 className="text-small font-semibold uppercase tracking-wide text-foreground/70">
                  {thirdAngle.title || 'The other road'}
                </h3>
                <p className="mt-3 whitespace-pre-line text-body leading-relaxed text-foreground/80">
                  {thirdAngle.body}
                </p>
                {thirdAngle.insight && (
                  <p className="mt-3 border-l-2 border-primary/50 pl-3 text-body font-medium text-foreground/80">
                    {thirdAngle.insight}
                  </p>
                )}
              </Card>
            )}
          </div>
        )}

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