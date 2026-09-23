'use client';

/**
 * Prep Copilot v2 — the USER experience, fully isolated.
 *
 * Imports only app-wide UI primitives, the user context, and lib/copilot/*.
 * It shares NO code with the case-solve flow or the scorer: this is a
 * purpose-built conversation + debrief, wired to the isolated /copilot/*
 * backend. Role/company in -> grounded pack -> graded practice out.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Loader2, Send, ArrowRight, ArrowLeft, Target, BookOpen, ListChecks,
  ShieldCheck, RotateCcw, Lock, Bot, ExternalLink, Sparkles, Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/components/user-context';
import {
  getCopilotStatus, buildPack, startPractice, sendPracticeMessage, submitPractice,
} from '@/lib/copilot/api';
import type { CopilotPack, CopilotScenario, CopilotFeedback, CopilotMessage } from '@/lib/copilot/types';

type Step = 'intake' | 'pack' | 'interview' | 'debrief';

const CONF_STYLE: Record<string, string> = {
  high: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  low: 'bg-muted text-muted-foreground',
};

function ConfidenceBadge({ c }: { c: string }) {
  const label = c === 'high' ? 'Well-grounded' : c === 'medium' ? 'Partly grounded' : 'Role-typical (unverified)';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-micro font-semibold ${CONF_STYLE[c] || CONF_STYLE.low}`}>
      {label}
    </span>
  );
}

export default function CopilotClient() {
  const { isPro } = useUser();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>('intake');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [pack, setPack] = useState<CopilotPack | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [runId, setRunId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<CopilotScenario | null>(null);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const [feedback, setFeedback] = useState<CopilotFeedback | null>(null);
  const [solution, setSolution] = useState('');

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, sending]);

  useEffect(() => {
    let cancelled = false;
    if (!isPro) { setEnabled(false); return; }
    getCopilotStatus()
      .then((s) => { if (!cancelled) setEnabled(!!s.enabled); })
      .catch(() => { if (!cancelled) setEnabled(false); });
    return () => { cancelled = true; };
  }, [isPro]);

  async function onBuildPack() {
    const r = role.trim();
    if (!r && !company.trim()) { setError('Tell me the role or company you’re targeting.'); return; }
    setBusy(true); setError(null);
    try {
      const { pack: p } = await buildPack(r, company.trim());
      setPack(p); setStep('pack');
    } catch (e: any) { setError(e?.message || 'Could not build your prep pack.'); }
    finally { setBusy(false); }
  }

  async function onStart(focus = '') {
    if (!pack) return;
    setBusy(true); setError(null);
    try {
      const { run_id, scenario: sc, pack: p } = await startPractice(pack.display_role, pack.display_company || '', focus);
      setPack(p); setRunId(run_id); setScenario(sc);
      setMessages([]); setInput(''); setFeedback(null); setSolution('');
      setStep('interview');
    } catch (e: any) { setError(e?.message || 'Could not start the practice.'); }
    finally { setBusy(false); }
  }

  async function onSend() {
    const content = input.trim();
    if (!content || !runId || sending) return;
    setSending(true); setError(null);
    setMessages((m) => [...m, { role: 'candidate', content }]);
    setInput('');
    try {
      const { reply } = await sendPracticeMessage(runId, content);
      setMessages((m) => [...m, { role: 'interviewer', content: reply }]);
    } catch (e: any) {
      setError(e?.message || 'The interviewer is unavailable right now.');
      setMessages((m) => [...m, { role: 'interviewer', content: '(Could not reach the interviewer — try again.)' }]);
    } finally { setSending(false); }
  }

  async function onSubmit() {
    if (!runId) return;
    setBusy(true); setError(null);
    try {
      const { feedback: fb, solution_outline } = await submitPractice(runId);
      setFeedback(fb); setSolution(solution_outline || ''); setStep('debrief');
    } catch (e: any) { setError(e?.message || 'Could not score this practice.'); }
    finally { setBusy(false); }
  }

  function resetToIntake() {
    setStep('intake'); setPack(null); setRunId(null); setScenario(null);
    setMessages([]); setFeedback(null); setSolution(''); setError(null);
  }

  // ---- gates ---------------------------------------------------------------
  if (!isPro) {
    return (
      <Shell>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-navy" />
          <h1 className="mt-4 text-h2 text-foreground">Prep Copilot is a Pro feature</h1>
          <p className="mt-2 text-body text-muted-foreground">
            Prep for the exact role and company you’re targeting — graded like a domain expert would.
          </p>
          <Link href="/upgrade" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-small font-semibold text-white transition-opacity hover:opacity-90">
            Upgrade to Pro <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Shell>
    );
  }
  if (enabled === null) {
    return <Shell><div className="flex items-center justify-center py-24 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your Prep Copilot…</div></Shell>;
  }
  if (enabled === false) {
    return (
      <Shell>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-navy" />
          <h1 className="mt-4 text-h2 text-foreground">Prep Copilot is being set up</h1>
          <p className="mt-2 text-body text-muted-foreground">We’re putting the finishing touches on the new role-aware Copilot. Check back shortly.</p>
        </div>
      </Shell>
    );
  }

  // ---- flow ----------------------------------------------------------------
  return (
    <Shell>
      <div className="mb-6 flex items-center gap-2">
        <Bot className="h-6 w-6 text-navy" />
        <h1 className="text-h2 text-foreground">Prep Copilot</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-small text-red-600 dark:text-red-400">{error}</div>
      )}

      {step === 'intake' && (
        <div className="mx-auto max-w-xl">
          <p className="text-body text-muted-foreground">
            Tell me the role — and company, if you have one. I’ll research what they actually assess, build a
            domain-expert scorecard, and run you a graded practice. Consulting, sales, brand, ops, finance, product — anything.
          </p>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-micro font-medium text-muted-foreground">Target role</span>
              <input value={role} onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Area Sales Manager, Brand Manager, Asset Management, Operations"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-body text-foreground outline-none focus:border-navy" />
            </label>
            <label className="block">
              <span className="text-micro font-medium text-muted-foreground">Target company (optional)</span>
              <input value={company} onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. HUL, P&G, BNY Mellon, McKinsey"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-body text-foreground outline-none focus:border-navy" />
            </label>
            <Button onClick={onBuildPack} disabled={busy} className="w-full bg-navy text-white hover:opacity-90">
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Researching…</> : <><Sparkles className="mr-2 h-4 w-4" /> Build my prep</>}
            </Button>
          </div>
        </div>
      )}

      {step === 'pack' && pack && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-h3 text-foreground">{pack.display_role}{pack.display_company ? <span className="text-muted-foreground"> · {pack.display_company}</span> : null}</h2>
              <div className="mt-1"><ConfidenceBadge c={pack.confidence} /></div>
            </div>
            <Button variant="outline" onClick={resetToIntake}><ArrowLeft className="mr-1.5 h-4 w-4" /> Change target</Button>
          </div>

          {pack.assessment?.what_they_test?.length ? (
            <Section icon={<Target className="h-4 w-4" />} title="What they assess">
              <div className="flex flex-wrap gap-2">
                {pack.assessment.what_they_test.map((t, i) => (
                  <span key={i} className="rounded-full bg-muted px-3 py-1 text-small text-foreground">{t}</span>
                ))}
                {pack.assessment.numericals_expected && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-navy/10 px-3 py-1 text-small font-medium text-navy"><Calculator className="h-3.5 w-3.5" /> Numbers expected</span>
                )}
              </div>
              {pack.assessment.notes && <p className="mt-3 text-small text-muted-foreground">{pack.assessment.notes}</p>}
            </Section>
          ) : null}

          <Section icon={<ListChecks className="h-4 w-4" />} title="How you’ll be graded">
            <div className="space-y-2">
              {pack.rubric.dimensions.map((d) => (
                <div key={d.key} className="flex items-center gap-3">
                  <div className="w-44 shrink-0 text-small text-foreground">{d.label}</div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-navy" style={{ width: `${Math.min(100, d.max)}%` }} />
                  </div>
                  <div className="w-10 shrink-0 text-right text-micro text-muted-foreground">{d.max}</div>
                </div>
              ))}
            </div>
          </Section>

          {pack.frameworks?.length ? (
            <Section icon={<BookOpen className="h-4 w-4" />} title="Frameworks a strong hire applies">
              <ul className="space-y-2">
                {pack.frameworks.map((f, i) => (
                  <li key={i} className="text-small"><span className="font-semibold text-foreground">{f.name}.</span> <span className="text-muted-foreground">{f.summary}</span></li>
                ))}
              </ul>
            </Section>
          ) : null}

          {pack.sources?.length ? (
            <Section icon={<ShieldCheck className="h-4 w-4" />} title="Grounded in">
              <ul className="space-y-1">
                {pack.sources.slice(0, 8).map((s, i) => (
                  <li key={i} className="text-small">
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-navy hover:underline">
                        {s.title || s.url} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : <span className="text-muted-foreground">{s.title}</span>}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Button onClick={() => onStart()} disabled={busy} className="w-full bg-navy text-white hover:opacity-90">
            {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up…</> : <>Start a graded practice <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
        </div>
      )}

      {step === 'interview' && scenario && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-micro font-semibold uppercase tracking-wider text-muted-foreground">Your scenario · {scenario.title}</div>
            <p className="mt-2 whitespace-pre-wrap text-body text-foreground">{scenario.prompt}</p>
            {scenario.numerical_ask && <p className="mt-2 text-small text-navy"><Calculator className="mr-1 inline h-3.5 w-3.5" />{scenario.numerical_ask}</p>}
          </div>

          <div ref={scrollRef} className="max-h-[46vh] space-y-3 overflow-y-auto rounded-xl border border-border bg-background p-4">
            {messages.length === 0 && <p className="text-small text-muted-foreground">Open with how you’d structure this. The interviewer will probe from there.</p>}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'candidate' ? 'text-right' : 'text-left'}>
                <div className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-small ${m.role === 'candidate' ? 'bg-navy text-white' : 'bg-muted text-foreground'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && <div className="text-left"><div className="inline-flex items-center gap-2 rounded-2xl bg-muted px-3.5 py-2 text-small text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> thinking…</div></div>}
          </div>

          <div className="flex items-end gap-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              rows={2} placeholder="Type your answer…"
              className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-body text-foreground outline-none focus:border-navy" />
            <Button onClick={onSend} disabled={sending || !input.trim()} className="bg-navy text-white hover:opacity-90"><Send className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep('pack')}><ArrowLeft className="mr-1.5 h-4 w-4" /> Back</Button>
            <Button onClick={onSubmit} disabled={busy || messages.filter((m) => m.role === 'candidate').length === 0}>
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scoring…</> : <>Submit for scoring <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </div>
        </div>
      )}

      {step === 'debrief' && feedback && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-micro font-semibold uppercase tracking-wider text-muted-foreground">Your score</div>
              <div className="text-h1 text-foreground">{feedback.score}<span className="text-h3 text-muted-foreground">/100</span></div>
            </div>
            <Button variant="outline" onClick={() => setStep('pack')}><RotateCcw className="mr-1.5 h-4 w-4" /> Practice another</Button>
          </div>

          {feedback.summary && <p className="rounded-xl border border-border bg-card p-4 text-body text-foreground">{feedback.summary}</p>}

          <Section icon={<ListChecks className="h-4 w-4" />} title="By competency">
            <div className="space-y-3">
              {feedback.rubric.dimensions.map((d) => {
                const sc = feedback.breakdown[d.key] ?? 0;
                const fb = feedback.dimension_feedback[d.key];
                return (
                  <div key={d.key}>
                    <div className="flex items-center gap-3">
                      <div className="w-44 shrink-0 text-small text-foreground">{d.label}</div>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-navy" style={{ width: `${d.max ? Math.round((sc / d.max) * 100) : 0}%` }} />
                      </div>
                      <div className="w-12 shrink-0 text-right text-micro text-muted-foreground">{sc}/{d.max}</div>
                    </div>
                    {fb?.to_improve && <p className="ml-0 mt-1 pl-44 text-micro text-muted-foreground">{fb.to_improve}</p>}
                  </div>
                );
              })}
            </div>
          </Section>

          {feedback.improvements?.length ? (
            <Section icon={<Target className="h-4 w-4" />} title="Fix these next">
              <ul className="list-disc space-y-1 pl-5 text-small text-foreground">{feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </Section>
          ) : null}

          {feedback.red_flags?.length ? (
            <Section icon={<ShieldCheck className="h-4 w-4" />} title="Red flags">
              <ul className="list-disc space-y-1 pl-5 text-small text-red-600 dark:text-red-400">{feedback.red_flags.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </Section>
          ) : null}

          {feedback.model_answer && (
            <Section icon={<BookOpen className="h-4 w-4" />} title="How a strong hire works it">
              <p className="whitespace-pre-wrap text-small text-foreground">{feedback.model_answer}</p>
            </Section>
          )}
          {solution && (
            <Section icon={<Sparkles className="h-4 w-4" />} title="Worked solution">
              <p className="whitespace-pre-wrap text-small text-muted-foreground">{solution}</p>
            </Section>
          )}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-4xl py-10">{children}</main>
    </div>
  );
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-small font-semibold text-foreground">{icon}{title}</div>
      {children}
    </section>
  );
}
