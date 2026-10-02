'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDownRight, ArrowUpRight, ChevronRight, Loader2, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ii, IIError } from '@/lib/interview-intelligence/api';
import { CONFIDENCE_LABEL, STATE, duration, titleCase } from '@/lib/interview-intelligence/format';
import type {
  CompetencyAssessment, DevelopmentArea, IIMessage, IIReport, LearnedItem, QuestionReview, ReportResponse,
} from '@/lib/interview-intelligence/types';
import { waitingProgress } from '@/lib/interview-intelligence/progress';
import { ConfidenceChip, Disclosure, ErrorNote, Spinner, StateChip } from './primitives';
import ProgressCard from './ProgressCard';

export default function ReportView({ sessionId }: { sessionId: string }) {
  const [resp, setResp] = useState<ReportResponse | null>(null);
  const [seenAt, setSeenAt] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      for (let i = 0; i < 200; i++) {
        const r = await ii.report(sessionId);
        setResp(r);
        setSeenAt(performance.now());
        if (r.status !== 'pending' && r.status !== 'processing') return;
        await new Promise((res) => setTimeout(res, 3000));
      }
    } catch (e) {
      setError((e as IIError).message);
    }
  }, [sessionId]);
  useEffect(() => { load(); }, [load]);

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorNote error={error} onRetry={load} /></div>;
  if (!resp || resp.status === 'pending' || resp.status === 'processing') {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
        <h1 className="text-2xl font-semibold tracking-tight">Interview complete.</h1>
        <p className="mt-2 text-muted-foreground">
          Your report is being written from your answers. It usually takes a minute or two, and you can leave this page.
        </p>
        <ProgressCard progress={resp?.progress || waitingProgress('report')} receivedAt={seenAt} className="mt-6 bg-card" />
      </div>
    );
  }
  if (resp.status === 'failed' || !resp.report) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">The report couldn’t be generated</h1>
        <p className="mt-3 text-muted-foreground">{resp.message || 'Your transcript is saved. Please try again later.'}</p>
        <p className="mt-2 text-sm text-muted-foreground">We don’t show estimated results in place of a real assessment.</p>
      </div>
    );
  }
  return <Report report={resp.report} partial={resp.status === 'partial'} sessionId={sessionId} />;
}

/* ====================================================================================== */

function Report({ report: r, partial, sessionId }: { report: IIReport; partial: boolean; sessionId: string }) {
  const byId = useMemo(() => Object.fromEntries(r.competencies.map((c) => [c.competency_id, c])), [r.competencies]);
  const nameOf = (id: string) => byId[id]?.name || titleCase(id);
  const learned = r.interviewer_learned || {};
  const h = r.header;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-10">
      {/* ---------------- layer 1: header + executive assessment */}
      <header>
        <Link href="/interview-intelligence" className="text-sm text-muted-foreground hover:text-foreground">Interview Intelligence</Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{h.role_title || 'Interview report'}</h1>
        <p className="mt-2 text-muted-foreground">
          {[h.company, h.role_family, titleCase(h.mode), titleCase(h.difficulty), duration(h.duration_actual_s),
            new Date(h.date).toLocaleDateString()].filter(Boolean).join(' · ')}
        </p>
      </header>

      {partial && r.partial_sections.length > 0 && (
        <div className="mt-6 rounded-lg border border-viz-warning/40 bg-viz-warning/5 px-4 py-3 text-sm">
          <p className="font-medium">Some sections are incomplete</p>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">{r.partial_sections.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}

      <section className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        <Fact label="Role alignment" value={r.headline.role_alignment} />
        <Fact label="Evidence coverage" value={`${r.headline.coverage.tested} of ${r.headline.coverage.total}`}
              note="competencies sufficiently tested" />
        <Fact label="Development areas" value={String(r.headline.development_areas)} />
        <Fact label="Assessment confidence" value={titleCase(r.headline.assessment_confidence)}
              note={r.headline.confidence_reasons[0]} />
      </section>

      {r.executive_assessment && (
        <p className="mt-8 max-w-[68ch] text-lg leading-relaxed text-foreground">{r.executive_assessment}</p>
      )}

      {/* ---------------- layer 2: strengths and development areas */}
      <section className="mt-12 grid gap-10 md:grid-cols-[2fr_3fr]">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">What you demonstrated</h2>
          {r.strengths.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No strength was backed by enough evidence to state it with confidence.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {r.strengths.map((s) => (
                <li key={s.title} className="border-l-2 border-viz-good pl-4">
                  <p className="font-medium">{s.title}</p>
                  {s.why_it_matters && <p className="mt-1 text-sm text-muted-foreground">{s.why_it_matters}</p>}
                  <Refs refs={s.evidence_refs} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">What to work on</h2>
          {r.development_areas.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No development area met the evidence bar.{r.not_tested.length ? ' Several competencies were not tested — see the competency map.' : ''}
            </p>
          ) : (
            <ol className="mt-4 space-y-6">
              {r.development_areas.map((d, i) => <DevArea key={`${d.title}-${i}`} d={d} />)}
            </ol>
          )}
        </div>
      </section>

      {/* ---------------- layer 3: competencies */}
      <div className="mt-14">
        <Disclosure id="competencies" defaultOpen title="Competency map"
          summary="How each competency the role needs was evidenced. Hollow means it was not sufficiently tested — that is not a weakness.">
          <CompetencyMap report={r} />
        </Disclosure>

        <Disclosure id="alignment" title="Role alignment"
          summary="Each job requirement traced from your CV to the interview to the assessment.">
          <AlignmentTable rows={r.role_alignment} nameOf={nameOf} />
        </Disclosure>

        <Disclosure id="learned" title="What the interviewer learned about you"
          summary="Every item is grounded in something you said, or in what was missing.">
          <div className="grid gap-8 sm:grid-cols-2">
            <LearnedList title="Strong signals" items={learned.strong_signals} tone="good" />
            <LearnedList title="Weak signals" items={learned.weak_signals} tone="warn" />
            <LearnedList title="Claims that stayed unproven" items={learned.unproven_claims} />
            <LearnedList title="Evidence that never appeared" items={learned.missing_evidence} />
            <LearnedList title="What an interviewer might worry about" items={learned.potential_concerns} />
          </div>
        </Disclosure>

        {/* ---------------- layer 4: evidence */}
        <Disclosure id="moments" title="Critical moments"
          summary={`${r.critical_moments.length} moments that shaped the assessment.`}>
          <Moments report={r} nameOf={nameOf} />
        </Disclosure>

        {r.cv_claims.length > 0 && (
          <Disclosure id="claims" title="CV claims investigated"
            summary={`${r.cv_claims.filter((c) => c.status !== 'not_probed').length} of ${r.cv_claims.length} claims were probed.`}>
            <ClaimList claims={r.cv_claims} />
          </Disclosure>
        )}

        <Disclosure id="communication" title="Communication"
          summary="Measured from your answers. Accent, grammar and phrasing are never assessed.">
          <Communication report={r} />
        </Disclosure>

        <Disclosure id="coverage" title="Interview coverage" summary="What the interview actually assessed, section by section.">
          <Coverage rows={r.coverage_map} />
        </Disclosure>

        {/* ---------------- layer 5: question level */}
        <Disclosure id="questions" title="Question by question"
          summary="Why each question was asked, what worked, what was missing and where a stronger answer would go.">
          <Questions items={r.questions} />
        </Disclosure>

        {/* ---------------- layer 6: next */}
        {r.next_questions.length > 0 && (
          <Disclosure id="next" title="What the interviewer would ask next"
            summary="If this were a real interview, these are the follow-ups your answers invite.">
            <ol className="space-y-4">
              {r.next_questions.map((q, i) => (
                <li key={i} className="grid grid-cols-[1.5rem_1fr] gap-2">
                  <span className="text-sm text-muted-foreground">{i + 1}.</span>
                  <div>
                    <p className="font-medium">{q.question}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Because: {q.gap}</p>
                    <Refs refs={q.refs} />
                  </div>
                </li>
              ))}
            </ol>
          </Disclosure>
        )}

        <Disclosure id="plan" defaultOpen title="Your preparation plan"
          summary={r.preparation_plan.headline || 'Built from this interview — practise these before the next one.'}>
          <PrepPlan report={r} nameOf={nameOf} />
        </Disclosure>

        {r.progress && (r.progress.deltas.length > 0 || r.progress.recurring.length > 0) && (
          <Disclosure id="progress" title="Compared with your previous interviews"
            summary="Only comparable assessments are compared: the same competency, scored with at least moderate confidence.">
            <ProgressBlock report={r} />
          </Disclosure>
        )}

        <Disclosure id="reattempt" title="Re-attempt your weak areas" summary="A shorter interview that targets only what you choose.">
          <Reattempt report={r} sessionId={sessionId} />
        </Disclosure>

        <Disclosure id="transcript" title="Full transcript" summary="Supporting material — the assessment above is the product.">
          <Transcript sessionId={sessionId} />
        </Disclosure>
      </div>

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        <p>{r.transparency.note}</p>
        <p className="mt-2">
          Engine versions: {Object.entries(r.transparency.versions || {}).map(([k, v]) => `${k} ${v}`).join(', ')}.
        </p>
        <p className="mt-2">This is preparation feedback, not a hiring decision or a prediction of one.</p>
      </footer>
    </div>
  );
}

/* ====================================================================================== */

function Fact({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-card px-4 py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
      {note && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

function Refs({ refs }: { refs?: string[] }) {
  if (!refs || refs.length === 0) return null;
  return (
    <p className="mt-1.5 text-xs text-muted-foreground">
      Evidence: {refs.map((x, i) => (
        <a key={x} href={`#${x.startsWith('X') ? `q-${x}` : `ev-${x}`}`} className="underline-offset-2 hover:underline">
          {x}{i < refs.length - 1 ? ', ' : ''}
        </a>
      ))}
    </p>
  );
}

function DevArea({ d }: { d: DevelopmentArea }) {
  return (
    <li className="border-l-2 border-viz-warning pl-4">
      <p className="font-medium">{d.title}</p>
      <p className="mt-1 text-sm">{d.observed_problem}</p>
      {d.example_quote && <blockquote className="mt-2 text-sm italic text-muted-foreground">“{d.example_quote}”</blockquote>}
      {d.why_it_matters && <p className="mt-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">Why it matters. </span>{d.why_it_matters}</p>}
      {d.what_to_do && <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">What to do. </span>{d.what_to_do}</p>}
      {d.practice && <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Practice. </span>{d.practice}</p>}
      <Refs refs={d.example_refs} />
    </li>
  );
}

function CompetencyMap({ report }: { report: IIReport }) {
  const [open, setOpen] = useState<string | null>(null);
  const byId = Object.fromEntries(report.competencies.map((c) => [c.competency_id, c]));
  const groups = report.health.length
    ? report.health.map((g) => ({ title: g.category, assessment: g.assessment, items: g.competency_ids.map((id) => byId[id]).filter(Boolean) }))
    : [{ title: 'Competencies', assessment: '', items: report.competencies }];

  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
            <h3 className="font-semibold">{g.title}</h3>
            <span className="text-sm text-muted-foreground">{g.assessment}</span>
          </div>
          <ul className="divide-y divide-border">
            {g.items.map((c) => (
              <li key={c.competency_id}>
                <button
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:grid-cols-[minmax(0,1.4fr)_9rem_8rem_8rem_1rem]"
                  onClick={() => setOpen(open === c.competency_id ? null : c.competency_id)} aria-expanded={open === c.competency_id}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{c.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {titleCase(c.importance)} importance · CV: {c.cv_strength === 'strong' ? 'present' : c.cv_strength === 'partial' ? 'limited' : 'none'}
                    </span>
                  </span>
                  <span className="hidden sm:block"><StateChip state={c.evidence_state} compact /></span>
                  <span className="text-right text-sm sm:text-left">
                    {c.score === null ? (
                      <>
                        <span className="sm:hidden"><StateChip state={c.evidence_state} compact /></span>
                        <span className="hidden text-muted-foreground sm:inline">—</span>
                      </>
                    ) : <><span className="font-medium">{c.band}</span> <span className="text-muted-foreground">{c.score}/10</span></>}
                  </span>
                  <span className="hidden sm:block">
                    {/* Confidence describes an assessment; an untested competency has none to qualify. */}
                    {c.evidence_state === 'not_sufficiently_tested'
                      ? <span className="text-xs text-muted-foreground">Not assessed</span>
                      : <ConfidenceChip level={c.confidence} />}
                  </span>
                  <ChevronRight className={`hidden h-4 w-4 text-muted-foreground transition-transform sm:block ${open === c.competency_id ? 'rotate-90' : ''}`} />
                </button>
                {open === c.competency_id && <EvidenceDrawer c={c} />}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground" aria-label="Legend">
      {(Object.keys(STATE) as (keyof typeof STATE)[]).map((k) => (
        <li key={k} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${STATE[k].dot}`} />{STATE[k].label}</li>
      ))}
    </ul>
  );
}

function EvidenceDrawer({ c }: { c: CompetencyAssessment }) {
  const basis = c.confidence_basis || {};
  return (
    <div className="mb-4 rounded-lg bg-muted/40 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-3 sm:hidden">
        <StateChip state={c.evidence_state} /> <ConfidenceChip level={c.confidence} />
      </div>
      {c.rationale && <p className="mt-2 sm:mt-0">{c.rationale}</p>}
      {c.evidence.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {c.evidence.map((e) => (
            <li key={e.ref} id={`ev-${e.ref}`} className="grid grid-cols-[3.25rem_1fr] gap-2">
              <span className={`text-xs font-medium ${e.polarity === 'positive' ? 'text-viz-good' : e.polarity === 'negative' ? 'text-viz-warning' : 'text-muted-foreground'}`}>
                {e.ref}
              </span>
              <span>
                <span className="italic">“{e.quote}”</span>
                {e.interpretation && <span className="block text-muted-foreground">{e.interpretation}</span>}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-muted-foreground">
          {c.evidence_state === 'not_sufficiently_tested'
            ? 'No assessable evidence for this competency in this interview. It is reported as not tested, not as a weakness.'
            : 'No quotable evidence was attached.'}
        </p>
      )}
      {c.missing_evidence.length > 0 && (
        <p className="mt-3 text-muted-foreground"><span className="font-medium text-foreground">Missing evidence: </span>{c.missing_evidence.join('; ')}</p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        {CONFIDENCE_LABEL[c.confidence]}
        {typeof basis.exchanges_testing === 'number' ? ` — tested in ${basis.exchanges_testing} question${basis.exchanges_testing === 1 ? '' : 's'}` : ''}
        {typeof basis.evidence_items === 'number' ? `, ${basis.evidence_items} evidence item${basis.evidence_items === 1 ? '' : 's'}` : ''}.
      </p>
    </div>
  );
}

function AlignmentTable({ rows, nameOf }: { rows: IIReport['role_alignment']; nameOf: (id: string) => string }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">The job description didn’t list requirements we could trace.</p>;
  const cvTone: Record<string, string> = { present: 'text-foreground', limited: 'text-muted-foreground', none: 'text-muted-foreground', unknown: 'text-muted-foreground' };
  const ivLabel: Record<string, string> = { demonstrated: 'Demonstrated', partial: 'Partly demonstrated', not_demonstrated: 'Not demonstrated', not_tested: 'Not tested', contradicted: 'Contradicted' };
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr className="border-b border-border">
            <th className="py-2 pr-4 font-medium">JD requirement</th>
            <th className="py-2 pr-4 font-medium">CV evidence</th>
            <th className="py-2 pr-4 font-medium">Interview evidence</th>
            <th className="py-2 font-medium">Assessment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.requirement_id} className="align-top">
              <td className="py-3 pr-4">
                <span className="block">{r.text}</span>
                <span className="text-xs text-muted-foreground">
                  {r.importance === 'must' ? 'Must have' : 'Should have'}
                  {r.competency_ids.length ? ` · ${r.competency_ids.map(nameOf).join(', ')}` : ''}
                </span>
              </td>
              <td className={`py-3 pr-4 ${cvTone[r.cv_evidence] || ''}`}>{titleCase(r.cv_evidence)}</td>
              <td className="py-3 pr-4">{ivLabel[r.interview_evidence] || titleCase(r.interview_evidence)}</td>
              <td className="py-3">{r.assessment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LearnedList({ title, items, tone }: { title: string; items?: LearnedItem[]; tone?: 'good' | 'warn' }) {
  const bar = tone === 'good' ? 'border-viz-good' : tone === 'warn' ? 'border-viz-warning' : 'border-border-strong';
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {!items || items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">None recorded.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((it, i) => (
            <li key={i} className={`border-l-2 pl-3 text-sm ${bar}`}>
              {it.text}
              <Refs refs={it.refs} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Moments({ report, nameOf }: { report: IIReport; nameOf: (id: string) => string }) {
  const order = (ref?: string) => Number((ref || 'X999').slice(1)) || 999;
  const items = [...report.critical_moments].sort((a, b) => order(a.exchange_ref) - order(b.exchange_ref));
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No single moment stood out.</p>;
  const label = { strong_evidence: 'Strong evidence', gap: 'Gap exposed', contradiction: 'Clarification needed' } as const;
  const dot = { strong_evidence: 'bg-viz-good', gap: 'bg-viz-warning', contradiction: 'bg-viz-critical' } as const;
  return (
    <ol className="relative ml-1 space-y-6 border-l border-border pl-6">
      {items.map((m, i) => (
        <li key={i} className="relative">
          <span className={`absolute -left-[1.85rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background ${dot[m.type]}`} aria-hidden />
          <p className="text-xs text-muted-foreground">
            {label[m.type]}{m.exchange_ref ? ` · ${m.exchange_ref}` : ''}{m.competency_id ? ` · ${nameOf(m.competency_id)}` : ''}
          </p>
          {m.question && <p className="mt-1 text-sm text-muted-foreground">{m.question}</p>}
          {m.quote && <p className="mt-1 italic">“{m.quote}”</p>}
          {m.note && <p className="mt-1 text-sm text-muted-foreground">{m.note}</p>}
        </li>
      ))}
    </ol>
  );
}

function ClaimList({ claims }: { claims: IIReport['cv_claims'] }) {
  const tone: Record<string, string> = {
    supported: 'text-viz-good', partially_supported: 'text-foreground', unsupported: 'text-viz-warning',
    contradicted: 'text-viz-critical', not_probed: 'text-muted-foreground', pending: 'text-muted-foreground',
  };
  return (
    <ul className="divide-y divide-border">
      {claims.map((c) => (
        <li key={c.claim_id} className="grid gap-1 py-3 sm:grid-cols-[1fr_11rem] sm:gap-4">
          <span className="text-sm">“{c.text}”</span>
          <span className={`text-sm font-medium ${tone[c.status] || ''}`}>
            {c.status === 'not_probed' ? 'Not probed' : titleCase(c.status)}
            {c.exchange_refs.length ? <span className="font-normal text-muted-foreground"> · {c.exchange_refs.join(', ')}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Communication({ report }: { report: IIReport }) {
  const c = report.communication;
  return (
    <div>
      {c.assessment && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <StateChip state={c.assessment.evidence_state} />
          {c.assessment.score !== null && <span className="text-sm">{c.assessment.band}</span>}
          <ConfidenceChip level={c.assessment.confidence} />
        </div>
      )}
      {c.metrics.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {c.metrics.map((m) => (
            <div key={m.id}>
              <dt className="text-xs text-muted-foreground">{m.label}</dt>
              <dd className="font-medium tabular-nums">{m.id === 'M.first_person_share' ? `${Math.round(m.value * 100)}% I/my` : m.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {c.observations.length > 0 && <ol className="mt-6 space-y-6">{c.observations.map((d, i) => <DevArea key={i} d={d} />)}</ol>}
    </div>
  );
}

function Coverage({ rows }: { rows: IIReport['coverage_map'] }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No coverage data.</p>;
  const max = Math.max(...rows.map((r) => Math.max(r.planned_s, r.actual_s)), 1);
  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.section} className="grid gap-2 sm:grid-cols-[10rem_1fr_9rem] sm:items-center">
          <span className="text-sm font-medium">{r.title}</span>
          <div className="relative h-2.5 rounded-full bg-muted" aria-hidden>
            <div className="absolute inset-y-0 left-0 rounded-full border border-dashed border-muted-foreground/50" style={{ width: `${(r.planned_s / max) * 100}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-navy-soft" style={{ width: `${(r.actual_s / max) * 100}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">
            {r.questions_asked}/{r.questions_planned} asked · {r.competencies_sufficient}/{r.competencies_total} tested
          </span>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">Filled bar: time spent. Dashed outline: time planned.</p>
    </div>
  );
}

function Questions({ items }: { items: QuestionReview[] }) {
  const [open, setOpen] = useState<string | null>(items.find((q) => q.importance === 'high')?.exchange_id || null);
  return (
    <ol className="divide-y divide-border">
      {items.map((q) => (
        <li key={q.exchange_id} id={`q-${q.ref}`} className="scroll-mt-24">
          <button className="grid w-full grid-cols-[2.5rem_1fr_1rem] items-start gap-2 py-4 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onClick={() => setOpen(open === q.exchange_id ? null : q.exchange_id)} aria-expanded={open === q.exchange_id}>
            <span className="text-sm text-muted-foreground">{q.ref}</span>
            <span>
              <span className="block font-medium">{q.question}</span>
              <span className="block text-xs text-muted-foreground">
                {q.competencies.join(', ')}{q.probes ? ` · ${q.probes} follow-up${q.probes === 1 ? '' : 's'}` : ''}
                {q.status === 'skipped' || q.evidence_status === 'skipped' ? ' · skipped' : ''}
              </span>
            </span>
            <ChevronRight className={`mt-1 h-4 w-4 text-muted-foreground transition-transform ${open === q.exchange_id ? 'rotate-90' : ''}`} />
          </button>
          {open === q.exchange_id && (
            <div className="mb-5 ml-10 space-y-3 text-sm">
              <p className="rounded-lg bg-muted/40 p-3"><span className="font-medium">Why was I asked this? </span>{q.why_asked}</p>
              {Object.keys(q.response_summary).length > 0 && (
                <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[7rem_1fr]">
                  {Object.entries(q.response_summary).map(([k, v]) => (
                    <div key={k} className="contents"><dt className="text-muted-foreground">{titleCase(k)}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
              )}
              <Pair title="What worked" items={q.what_worked} />
              <Pair title="What was missing" items={q.what_was_missing} />
              {q.looking_for && <p><span className="font-medium">The interviewer was looking for: </span>{q.looking_for}</p>}
              {q.better_direction && <p><span className="font-medium">A stronger answer would: </span>{q.better_direction}</p>}
              {q.exposing_follow_up && <p><span className="font-medium">The follow-up that exposed the gap: </span>“{q.exposing_follow_up}”</p>}
              {Object.keys(q.dimensions).length > 0 && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {Object.entries(q.dimensions).filter(([, v]) => typeof v?.rating === 'number').map(([k, v]) => (
                    <li key={k}>{titleCase(k)} <span className="font-medium text-foreground">{v.rating}/5</span></li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function Pair({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="font-medium">{title}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}

function PrepPlan({ report, nameOf }: { report: IIReport; nameOf: (id: string) => string }) {
  const p = report.preparation_plan;
  const items = p.items || [];
  if (items.length === 0 && !(p.topics_to_revise || []).length) {
    return <p className="text-sm text-muted-foreground">There wasn’t enough evidence to build a specific plan. A longer interview will give you one.</p>;
  }
  return (
    <div>
      <ol className="space-y-4">
        {items.map((it, i) => (
          <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs">{i + 1}</span>
            <div>
              <p className="font-medium">{it.action}{it.count > 1 ? ` (${it.count}×)` : ''}</p>
              {it.how && <p className="mt-0.5 text-sm text-muted-foreground">{it.how}</p>}
              {it.competency_ids.length > 0 && <p className="mt-0.5 text-xs text-muted-foreground">{it.competency_ids.map(nameOf).join(', ')}</p>}
            </div>
          </li>
        ))}
      </ol>
      {(p.topics_to_revise || []).length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold">Topics to revise</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {(p.topics_to_revise || []).map((t) => <li key={t} className="rounded-full border border-border px-3 py-1 text-sm">{t}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function ProgressBlock({ report }: { report: IIReport }) {
  const pr = report.progress!;
  return (
    <div className="space-y-8">
      {pr.deltas.length > 0 && (
        <ul className="divide-y divide-border">
          {pr.deltas.map((d) => (
            <li key={d.competency_id} className="flex items-center justify-between py-2.5 text-sm">
              <span>{d.name}</span>
              <span className="flex items-center gap-2 tabular-nums">
                <span className="text-muted-foreground">{d.previous} → {d.current}</span>
                {d.delta > 0 ? <ArrowUpRight className="h-4 w-4 text-viz-good" aria-label="improved" /> :
                  d.delta < 0 ? <ArrowDownRight className="h-4 w-4 text-viz-warning" aria-label="declined" /> :
                    <Minus className="h-4 w-4 text-muted-foreground" aria-label="unchanged" />}
              </span>
            </li>
          ))}
        </ul>
      )}
      {pr.recurring.length > 0 && (
        <div>
          <p className="text-sm font-semibold">Recurring patterns</p>
          <ul className="mt-2 space-y-2">
            {pr.recurring.map((r) => (
              <li key={r.category} className="border-l-2 border-viz-warning pl-3 text-sm">
                <span className="font-medium">{titleCase(r.label)}</span>
                <span className="text-muted-foreground"> — in {r.occurrences} of your last {r.of_last} interviews.</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Reattempt({ report, sessionId }: { report: IIReport; sessionId: string }) {
  const router = useRouter();
  const suggested = new Set(report.reattempt.suggested_competencies);
  const candidates = report.competencies.filter((c) =>
    suggested.has(c.competency_id) || c.evidence_state === 'weak' || c.evidence_state === 'not_sufficiently_tested' ||
    c.evidence_state === 'contradictory' || (c.score !== null && c.score <= 5));
  const [picked, setPicked] = useState<Set<string>>(new Set(report.reattempt.suggested_competencies.slice(0, 4)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id); else if (next.size < 4) next.add(id);
    setPicked(next);
  }
  async function go() {
    setBusy(true); setError(null);
    try {
      const s = await ii.reattempt(sessionId, Array.from(picked));
      router.push(`/interview-intelligence/new?session=${s.id}`);
    } catch (e) {
      setError((e as IIError).message);
    } finally {
      setBusy(false);
    }
  }
  if (candidates.length === 0) return <p className="text-sm text-muted-foreground">Nothing in this interview needs a targeted re-attempt.</p>;
  return (
    <div>
      <p className="text-sm text-muted-foreground">Choose up to four. The new interview plans its questions around them.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {candidates.map((c) => (
          <button key={c.competency_id} type="button" onClick={() => toggle(c.competency_id)} aria-pressed={picked.has(c.competency_id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
              picked.has(c.competency_id) ? 'border-navy bg-navy text-navy-foreground' : 'border-border hover:border-border-strong'}`}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="mt-4"><ErrorNote error={error} /></div>
      <Button className="mt-4" onClick={go} disabled={busy || picked.size === 0}>
        {busy && <Loader2 className="animate-spin" />} Re-attempt these areas
      </Button>
    </div>
  );
}

function Transcript({ sessionId }: { sessionId: string }) {
  const [msgs, setMsgs] = useState<IIMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    ii.transcript(sessionId).then((r) => setMsgs(r.messages)).catch((e) => setError((e as IIError).message));
  }, [sessionId]);
  if (error) return <ErrorNote error={error} />;
  if (!msgs) return <Spinner label="Loading transcript…" />;
  return (
    <ol className="space-y-4 text-sm">
      {msgs.map((m) => (
        <li key={m.id} className={m.role === 'candidate' ? 'pl-6' : ''}>
          <span className="block text-xs text-muted-foreground">
            {m.role === 'interviewer' ? 'Interviewer' : 'You'}{m.exchange_ref ? ` · ${m.exchange_ref}` : ''}
          </span>
          <span className={m.role === 'candidate' ? 'text-muted-foreground' : ''}>{m.content}</span>
        </li>
      ))}
    </ol>
  );
}

