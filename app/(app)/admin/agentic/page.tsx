'use client';

/**
 * Admin · Agentic AI (demo + live runner).
 *
 * This page showcases MECE's agentic-AI layer: an ORCHESTRATOR that plans and
 * deploys a team of domain specialists (growth analytics, content strategy,
 * curriculum design, FinOps cost control, deck retrieval), reads their results,
 * and synthesises an answer. It calls the FastAPI backend's /admin/agentic
 * endpoints. Admin-gated by the parent layout (server is_admin) PLUS the backend
 * route's own _require_admin.
 *
 * Two modes:
 *   • Simulation — deterministic, zero-cost, ALWAYS works (show this to people).
 *   • Live       — real, model-driven orchestration over live data; the backend
 *                  transparently falls back to a simulation if anything is missing,
 *                  so the demo can never error on stage.
 *
 * The step trace is revealed one move at a time so you literally watch the
 * orchestrator plan → delegate → observe → synthesize.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Bot, Brain, Loader2, Play, TrendingUp, Newspaper, BookOpen,
  Wallet, Library, CheckCircle2, CircleDot, Sparkles,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Specialist = { name: string; label: string; domain: string };
type Preset = { id: string; label: string; mission: string };
type Info = { specialists: Specialist[]; missions: Preset[]; live_available: boolean };

type Step = {
  index: number;
  phase: 'plan' | 'observe' | 'synthesize' | string;
  agent: string | null;
  rationale: string | null;
  output: Record<string, unknown> | null;
};

type RunResult = {
  mission: string;
  mode: string;
  summary: string;
  steps: Step[];
  agents_used: string[];
  stopped_reason: string;
  ok: boolean;
  error?: string | null;
  model?: string | null;
  note?: string;
};

const AGENT_ICON: Record<string, React.FC<{ className?: string }>> = {
  growth_analyst: TrendingUp,
  content_strategist: Newspaper,
  curriculum_designer: BookOpen,
  cost_optimizer: Wallet,
  deck_librarian: Library,
};

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}
function asArr(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => asStr(x)) : [];
}

export default function AgenticPage() {
  const [info, setInfo] = useState<Info | null>(null);
  const [mission, setMission] = useState('');
  const [mode, setMode] = useState<'sim' | 'live'>('sim');
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
    (async () => {
      try {
        const headers = await authHeader();
        const res = await fetch(`${API_URL}/admin/agentic/info`, { headers, cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const json: Info = await res.json();
        setInfo(json);
        if (json.missions?.length) setMission(json.missions[0].mission);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load agentic info');
      }
    })();
  }, [authHeader]);

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
      const res = await fetch(`${API_URL}/admin/agentic/run`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ mission: mission.trim(), mode }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Run failed (${res.status}): ${text || res.statusText}`);
      }
      const json: RunResult = await res.json();
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Run failed');
    } finally {
      setRunning(false);
    }
  }, [authHeader, mission, mode]);

  const liveOn = info?.live_available ?? false;
  const shownSteps = result ? result.steps.slice(0, revealed) : [];
  const finished = result ? revealed >= result.steps.length : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Bot className="h-6 w-6" /> Agentic AI
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          An <strong>orchestrator</strong> that plans a mission, deploys a team of domain
          specialists, reads what they return, and synthesises an executive answer. The path it
          takes is decided at runtime from what it learns — different missions send in different
          teams. Watch it think below.
        </p>
      </div>

      {/* Specialist roster */}
      {info && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
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

      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mission</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {info?.missions.map((m) => (
            <button
              key={m.id}
              onClick={() => setMission(m.mission)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                mission === m.mission
                  ? 'border-transparent bg-muted font-semibold text-navy'
                  : 'border-border text-muted-foreground hover:bg-muted/40'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <textarea
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          rows={2}
          className="mt-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          placeholder="Describe a mission for the orchestrator…"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-border p-0.5">
            <button
              onClick={() => setMode('sim')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'sim' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              }`}
            >
              Simulation
            </button>
            <button
              onClick={() => liveOn && setMode('live')}
              disabled={!liveOn}
              title={liveOn ? '' : 'Live needs the OpenAI key configured on the backend'}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'live' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              } ${liveOn ? '' : 'cursor-not-allowed opacity-40'}`}
            >
              Live (model-driven)
            </button>
          </div>

          <button
            onClick={run}
            disabled={running || !mission.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Orchestrating…' : 'Run orchestrator'}
          </button>

          <span className="text-xs text-muted-foreground">
            {mode === 'sim'
              ? 'Deterministic demo — zero cost, always works.'
              : 'Real model orchestration; falls back to a simulation if unavailable.'}
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

      {/* Trace */}
      {result && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">
              mode: {result.mode}
            </span>
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
                        Planner → deploy <span className="inline-flex items-center gap-1"><Icon className="h-3.5 w-3.5" />{step.agent}</span>
                      </p>
                      {step.rationale && <p className="text-xs text-muted-foreground">{step.rationale}</p>}
                    </div>
                  </div>
                );
              }
              if (step.phase === 'observe') {
                const out = step.output || {};
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
              // synthesize
              const summary = asStr((step.output || {}).summary);
              return (
                <div key={step.index} className="rounded-xl border-2 border-navy/20 bg-navy/5 px-4 py-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-navy">
                    <CheckCircle2 className="h-4 w-4" /> Synthesis
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
        </div>
      )}
    </div>
  );
}
