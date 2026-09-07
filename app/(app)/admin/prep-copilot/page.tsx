'use client';

/**
 * Admin · Prep Copilot (stage demo).
 *
 * Runs the REAL per-user orchestrator loop against a chosen SAMPLE candidate via
 * the backend's /coach/demo endpoint — no key, no budget, no DB rows required,
 * so it always works in front of an audience. Pick a candidate and watch the
 * copilot plan → deploy specialists → observe → synthesize. Different candidates
 * take visibly different paths (e.g. one with no graded attempts short-circuits),
 * which is the point: the control flow is chosen from the data, not scripted.
 *
 * Admin-gated by the parent layout (server is_admin) PLUS the backend route.
 */

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Bot, Brain, Loader2, Play, Stethoscope, Target, BookOpen, Newspaper,
  Library, Map as MapIcon, CheckCircle2, CircleDot, Sparkles,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Candidate = { key: string; name: string; goal: string; target_company: string; domain: string };
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
  target_company?: string;
  domain?: string;
  candidate?: { key: string; name: string };
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

export default function AdminPrepCopilotPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [revealed, setRevealed] = useState(0);

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
        const res = await fetch(`${API_URL}/coach/demo/candidates`, { headers, cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const json: { candidates: Candidate[] } = await res.json();
        setCandidates(json.candidates || []);
        if (json.candidates?.length) setSelected(json.candidates[0].key);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load demo candidates');
      }
    })();
  }, [authHeader]);

  useEffect(() => {
    if (!result) return;
    setRevealed(0);
    const t = setInterval(() => {
      setRevealed((n) => {
        if (n >= result.steps.length) {
          clearInterval(t);
          return n;
        }
        return n + 1;
      });
    }, 650);
    return () => clearInterval(t);
  }, [result]);

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
      const res = await fetch(`${API_URL}/coach/demo`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ candidate: selected }),
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
  }, [authHeader, selected]);

  const shownSteps = result ? result.steps.slice(0, revealed) : [];
  const finished = result ? revealed >= result.steps.length : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Bot className="h-6 w-6" /> Prep Copilot — demo
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          The per-user agentic coach every Pro user gets. This runs the real orchestrator loop against a sample
          candidate — no key or budget needed — so you can show it live. Pick a candidate and watch it plan, deploy
          specialists, and synthesize a plan. Different candidates take different paths.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sample candidate</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {candidates.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelected(c.key)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                selected === c.key
                  ? 'border-transparent bg-muted font-semibold text-navy'
                  : 'border-border text-muted-foreground hover:bg-muted/40'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={run}
            disabled={running || !selected}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Orchestrating…' : 'Run copilot'}
          </button>
          <span className="text-xs text-muted-foreground">Deterministic demo — zero cost, always works.</span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">mode: {result.mode}</span>
            {result.candidate && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{result.candidate.name}</span>
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
