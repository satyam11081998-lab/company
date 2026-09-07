'use client';

/**
 * Prep Copilot — the Pro-only, per-user agentic-AI coach.
 *
 * An ORCHESTRATOR plans a personalised prep mission for THIS candidate and
 * deploys a team of domain specialists (diagnostics, career intelligence,
 * curation, business context, real-world exemplars, roadmap design), reading
 * each result before choosing the next move. It unlocks only after the user has
 * completed enough scored attempts. Calls the FastAPI backend's /coach endpoints;
 * gated by the backend (Pro + eligibility) with this page mirroring the UX.
 *
 * The step trace is revealed one move at a time so the user literally watches
 * the copilot plan → deploy a specialist → observe → synthesize a plan.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/user-context';
import {
  Bot, Brain, Loader2, Play, Stethoscope, Target, BookOpen, Newspaper,
  Library, Map as MapIcon, CheckCircle2, CircleDot, Sparkles, Lock, Crown,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Specialist = { name: string; label: string; domain: string };
type Info = {
  eligible: boolean;
  completed: number;
  required: number;
  specialists: Specialist[];
  live_available: boolean;
  prefill: { goal: string; placement_focus: string; weekly_hours: number };
};

type Step = {
  index: number;
  phase: 'plan' | 'observe' | 'synthesize' | string;
  agent: string | null;
  rationale: string | null;
  output: Record<string, unknown> | null;
};

type RunResult = {
  goal: string;
  mode: string;
  summary: string;
  steps: Step[];
  agents_used: string[];
  stopped_reason: string;
  ok: boolean;
  model?: string | null;
  note?: string;
  target_company?: string;
  domain?: string;
};

const AGENT_ICON: Record<string, React.FC<{ className?: string }>> = {
  diagnostician: Stethoscope,
  target_strategist: Target,
  case_curator: BookOpen,
  news_analyst: Newspaper,
  exemplar_scout: Library,
  roadmap_architect: MapIcon,
};

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}
function asArr(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => asStr(x)) : [];
}
function asObj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

type RecCase = { id?: string; title?: string; type?: string; difficulty?: string };

/** Pull a specialist's observe output out of the trace by agent name. */
function observeData(result: RunResult | null, agent: string): Record<string, unknown> {
  if (!result) return {};
  const step = result.steps.find((s) => s.phase === 'observe' && s.agent === agent);
  return asObj(asObj(step?.output).data);
}

export default function CoachPage() {
  const { hasTierAccess } = useUser();
  const isPro = hasTierAccess('pro');

  const [info, setInfo] = useState<Info | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [goal, setGoal] = useState('');
  const [company, setCompany] = useState('');
  const [domain, setDomain] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [revealed, setRevealed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const authHeader = useCallback(async (): Promise<Record<string, string>> => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    if (!isPro) {
      setLoadingInfo(false);
      return;
    }
    (async () => {
      try {
        const headers = await authHeader();
        const res = await fetch(`${API_URL}/coach/info`, { headers, cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const json: Info = await res.json();
        setInfo(json);
        if (json.prefill?.goal) setGoal(json.prefill.goal);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load your copilot');
      } finally {
        setLoadingInfo(false);
      }
    })();
  }, [authHeader, isPro]);

  // Reveal steps one at a time for the "watch it think" effect.
  useEffect(() => {
    if (!result) return;
    if (timer.current) clearInterval(timer.current);
    setRevealed(0);
    timer.current = setInterval(() => {
      setRevealed((n) => {
        if (n >= result.steps.length) {
          if (timer.current) clearInterval(timer.current);
          return n;
        }
        return n + 1;
      });
    }, 650);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [result]);

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
      const res = await fetch(`${API_URL}/coach/run`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ goal: goal.trim(), target_company: company.trim(), domain: domain.trim(), mode: 'live' }),
      });
      if (!res.ok) {
        let detail = res.statusText;
        try {
          const j = await res.json();
          if (typeof j.detail === 'string') detail = j.detail;
        } catch {
          /* not json */
        }
        throw new Error(detail || `Run failed (${res.status})`);
      }
      const json: RunResult = await res.json();
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Run failed');
    } finally {
      setRunning(false);
    }
  }, [authHeader, goal, company, domain]);

  // ── Gate 1: not Pro ───────────────────────────────────────────────────
  if (!isPro) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Crown className="h-6 w-6 text-navy" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Prep Copilot is a Pro feature</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Your personal agentic coach reads your graded history, understands where you want to go, and builds a
          weekly, targeted prep plan — with curated cases, a live business-news angle and real-world exemplars.
        </p>
        <Link
          href="/upgrade"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Upgrade to Pro
        </Link>
      </div>
    );
  }

  if (loadingInfo) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your copilot…
      </div>
    );
  }

  // ── Gate 2: Pro but not yet eligible ──────────────────────────────────
  if (info && !info.eligible) {
    const pct = Math.min(100, Math.round((info.completed / Math.max(1, info.required)) * 100));
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-navy" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Warm up your copilot first</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          The copilot plans from your real performance. Complete{' '}
          <strong>{info.required}</strong> scored cases or guesstimates and it unlocks — you&apos;ve done{' '}
          <strong>{info.completed}</strong>.
        </p>
        <div className="mx-auto mt-5 h-2 w-64 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-navy transition-all" style={{ width: `${pct}%` }} />
        </div>
        <Link
          href="/practice"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Play className="h-4 w-4" /> Practice a case
        </Link>
      </div>
    );
  }

  const shownSteps = result ? result.steps.slice(0, revealed) : [];
  const finished = result ? revealed >= result.steps.length : false;

  const curator = observeData(result, 'case_curator');
  const recCases = (Array.isArray(curator.recommended_cases) ? curator.recommended_cases : []) as RecCase[];
  const stretch = asObj(curator.stretch_case);
  const roadmap = observeData(result, 'roadmap_architect');
  const plan = (Array.isArray(roadmap.plan) ? roadmap.plan : []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Bot className="h-6 w-6" /> Prep Copilot
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Your personal agentic coach. Tell it where you want to go — it reads your graded history, decides which
          specialists to deploy, and builds a weekly plan. Watch it think below.
        </p>
      </div>

      {/* Specialist roster */}
      {info && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {info.specialists.map((s) => {
            const Icon = AGENT_ICON[s.name] || Sparkles;
            return (
              <div key={s.name} className="rounded-xl border border-border bg-card p-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.domain}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Intake */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Where do you want to go?</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">Target company (optional)</span>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. McKinsey, BCG, a product role…"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">Domain / role (optional)</span>
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. consulting, finance, product"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </div>
        <label className="mt-3 block text-sm">
          <span className="text-xs text-muted-foreground">Your goal in a sentence</span>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={2}
            placeholder="e.g. Crack MBB — my answers ramble, I need to lead with the point."
            className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={run}
            disabled={running || !goal.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Building your plan…' : 'Build my plan'}
          </button>
          <span className="text-xs text-muted-foreground">
            The copilot reads your real attempts and plans across six specialists.
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {result?.note && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {result.note}
        </div>
      )}

      {/* Trace — watch it think */}
      {result && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">mode: {result.mode}</span>
            {result.model && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">model: {result.model}</span>
            )}
            <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
              specialists: {result.agents_used.join(', ') || 'none'}
            </span>
          </div>

          <div className="space-y-2">
            {shownSteps.map((step) => {
              if (step.phase === 'plan') {
                const Icon = step.agent ? AGENT_ICON[step.agent] || Brain : Brain;
                return (
                  <div key={step.index} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
                    <Brain className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        Planner → deploy{' '}
                        <span className="inline-flex items-center gap-1">
                          <Icon className="h-3.5 w-3.5" />
                          {step.agent}
                        </span>
                      </p>
                      {step.rationale && <p className="text-xs text-muted-foreground">{step.rationale}</p>}
                    </div>
                  </div>
                );
              }
              if (step.phase === 'observe') {
                const out = asObj(step.output);
                return (
                  <div key={step.index} className="ml-6 rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">{asStr(out.headline)}</p>
                    <ul className="mt-1 space-y-0.5">
                      {asArr(out.findings).map((f, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {f}</li>
                      ))}
                    </ul>
                    {asArr(out.recommended_actions).length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {asArr(out.recommended_actions).map((a, i) => (
                          <p key={i} className="text-xs font-medium text-navy">→ {a}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              const summary = asStr(asObj(step.output).summary);
              return (
                <div key={step.index} className="rounded-xl border-2 border-navy/20 bg-navy/5 px-4 py-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-navy">
                    <CheckCircle2 className="h-4 w-4" /> Your plan
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-foreground">{summary}</pre>
                </div>
              );
            })}

            {!finished && (
              <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
                <CircleDot className="h-3.5 w-3.5 animate-pulse" /> thinking…
              </div>
            )}
          </div>

          {/* Actionable extras once the reveal finishes */}
          {finished && (recCases.length > 0 || plan.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              {recCases.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <BookOpen className="h-4 w-4" /> Practice these next
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {recCases.map((c, i) => (
                      <li key={c.id ?? i}>
                        {c.id ? (
                          <Link href={`/cases/${c.id}`} className="text-sm font-medium text-navy hover:underline">
                            {c.title}
                          </Link>
                        ) : (
                          <span className="text-sm text-foreground">{c.title}</span>
                        )}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {c.type} · {c.difficulty}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {asStr(stretch.title) && (
                    <div className="mt-3 rounded-lg border border-dashed border-border p-3">
                      <p className="text-xs font-semibold text-foreground">{asStr(stretch.title)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{asStr(stretch.prompt)}</p>
                    </div>
                  )}
                </div>
              )}

              {plan.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <MapIcon className="h-4 w-4" /> Your 1-week path
                  </p>
                  <ol className="mt-2 space-y-2">
                    {plan.map((m, i) => (
                      <li key={i} className="rounded-lg border border-border bg-muted/20 p-2.5">
                        <p className="text-sm font-semibold text-foreground">{asStr(m.title)}</p>
                        <ul className="mt-1 space-y-0.5">
                          {asArr(m.items).map((it, j) => (
                            <li key={j} className="text-xs text-muted-foreground">• {it}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
