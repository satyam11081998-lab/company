'use client';

/**
 * Prep Copilot — the Pro-only, per-user agentic-AI coach.
 *
 * An ORCHESTRATOR plans a personalised prep mission for THIS candidate and
 * deploys a team of six domain specialists (diagnostics, target intelligence,
 * curation, business context, real-world exemplars, roadmap design), reading
 * each result before choosing the next move, then synthesising a weekly plan.
 *
 * The backend returns a full plan -> deploy -> observe -> synthesize trace; this
 * page renders that trace as a live orchestration (each specialist transitions
 * queued -> running -> done) and turns each observation into a purpose-built
 * panel rather than a bullet dump. Backend contract (/coach/info, /coach/run)
 * is unchanged.
 *
 * DESIGN CONTRACT (docs/CASEBOOK_DESIGN_CONTRACT.md + PROJECT_BRAIN §4):
 *   - Palette locked: Cardinal Red (--primary), Navy (--navy), warm neutrals.
 *     Semantic tokens only, no raw hex, NO rainbow. Progress/mastery scales are
 *     monochromatic --primary. Specialists are distinguished by icon + label,
 *     never by colour.
 *   - NO left-accent borders on any card/callout.
 *   - Typography strictly on the globals.css scale: text-h1/h2/h3, text-strong,
 *     text-body, text-small, text-micro (no ad-hoc font sizes).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/user-context';
import {
  Bot, Brain, Loader2, Play, Stethoscope, Target, BookOpen, Newspaper,
  Library, Map as MapIcon, CheckCircle2, Check, Sparkles, Lock, Crown, ArrowRight,
  TrendingDown, TrendingUp, Minus, RefreshCw, Copy, Zap, ChevronRight,
  Compass, Flag, GraduationCap,
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
type RecCase = { id?: string; title?: string; type?: string; difficulty?: string };

// ── helpers ───────────────────────────────────────────────────────────────
function cx(...p: (string | false | null | undefined)[]): string {
  return p.filter(Boolean).join(' ');
}
function asStr(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}
function asNum(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}
function asArr(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => asStr(x)) : [];
}
function asObj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}
function observeStep(result: RunResult | null, agent: string): Step | undefined {
  return result?.steps.find((s) => s.phase === 'observe' && s.agent === agent);
}
function observeData(result: RunResult | null, agent: string): Record<string, unknown> {
  return asObj(asObj(observeStep(result, agent)?.output).data);
}

// Mirror of the backend DIM_LABEL so raw dimension keys read as human skills.
const DIM_LABEL: Record<string, string> = {
  structure: 'Structuring / MECE issue trees',
  quantitative: 'Quant & estimation',
  synthesis: 'Synthesis (answer-first)',
  business_judgment: 'Business judgement',
  creativity: 'Creativity / hypotheses',
  presence: 'Communication & presence',
};
function prettifySkill(key: string): string {
  if (DIM_LABEL[key]) return DIM_LABEL[key];
  const s = key.replace(/_/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Specialists differ by ICON + LABEL only — never by colour (brand rule: no rainbow).
type AgentMeta = { label: string; role: string; Icon: React.FC<{ className?: string }> };
const AGENTS: Record<string, AgentMeta> = {
  diagnostician:     { label: 'Diagnostician',     role: 'Performance analytics',  Icon: Stethoscope },
  target_strategist: { label: 'Target Strategist', role: 'Career intelligence',    Icon: Target },
  case_curator:      { label: 'Case Curator',      role: 'Curation & retrieval',   Icon: BookOpen },
  news_analyst:      { label: 'News Analyst',       role: 'Business context',       Icon: Newspaper },
  exemplar_scout:    { label: 'Exemplar Scout',     role: 'Real-world grounding',   Icon: Library },
  roadmap_architect: { label: 'Roadmap Architect',  role: 'Instructional design',   Icon: MapIcon },
};
function agentOf(name: string | null | undefined): AgentMeta {
  return (name && AGENTS[name]) || { label: name || 'Planner', role: '', Icon: Brain };
}

// ── inline markdown (bold) + narrative renderer — kills the raw ** blob ────
function inlineBold(text: string, keyBase: string): React.ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((chunk, i) =>
    i % 2 === 1
      ? <strong key={`${keyBase}-${i}`} className="font-semibold text-foreground">{chunk}</strong>
      : <span key={`${keyBase}-${i}`}>{chunk}</span>,
  );
}
function Narrative({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n');
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  let k = 0;
  const flush = () => {
    if (bullets.length) {
      out.push(
        <ul key={`ul-${k++}`} className="my-2 space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-body text-muted-foreground">
              <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{inlineBold(b, `b${k}-${i}`)}</span>
            </li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const bullet = line.match(/^(?:[-*•]|\d+\.)\s+(.*)$/);
    if (bullet) { bullets.push(bullet[1]); continue; }
    flush();
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    if (heading) {
      out.push(<h4 key={`h-${k++}`} className="mt-4 text-strong text-foreground">{inlineBold(heading[1], `h${k}`)}</h4>);
      continue;
    }
    out.push(<p key={`p-${k++}`} className="my-1.5 text-body text-muted-foreground">{inlineBold(line, `p${k}`)}</p>);
  }
  flush();
  return <div>{out}</div>;
}

// ── shared bits ─────────────────────────────────────────────────────────
function Ring({ value }: { value: number }) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div className="relative h-[68px] w-[68px] shrink-0">
      <svg viewBox="0 0 68 68" className="h-full w-full -rotate-90">
        <circle cx="34" cy="34" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <circle cx="34" cy="34" r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.7,.3,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-strong font-bold leading-none text-foreground tabular-nums">{Math.round(value)}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">avg</span>
      </div>
    </div>
  );
}
function Chip({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'navy' | 'primary' }) {
  const c = tone === 'navy' ? 'bg-navy/10 text-navy' : tone === 'primary' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground';
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-micro font-medium', c)}>{children}</span>;
}
function AgentBadge({ Icon }: { Icon: React.FC<{ className?: string }> }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-navy">
      <Icon className="h-4 w-4" />
    </span>
  );
}

// ── specialist observation panels ─────────────────────────────────────────
function SkillXray({ out }: { out: Record<string, unknown> }) {
  const data = asObj(out.data);
  const mastery = asObj(data.mastery);
  const rows = Object.entries(mastery)
    .map(([key, v]) => ({ key, label: prettifySkill(key), score: asNum(v) ?? 0 }))
    .sort((a, b) => a.score - b.score);
  const avg = asNum(data.avg_score) ?? (rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0);
  const trend = asStr(data.trend).toLowerCase();
  const n = asNum(data.n);
  const priorityKey = rows[0]?.key;
  const TrendIcon = trend.includes('declin') ? TrendingDown : trend.includes('improv') ? TrendingUp : Minus;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <Ring value={avg} />
        <div className="flex flex-wrap items-center gap-2">
          {n != null && <Chip tone="navy"><Compass className="h-3 w-3" /> {n} graded attempts</Chip>}
          {trend && <Chip><TrendIcon className="h-3 w-3" /> {trend} trend</Chip>}
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        {rows.map((r, i) => {
          const isPriority = r.key === priorityKey;
          return (
            <div key={r.key}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className={cx('truncate text-small', isPriority ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                  {r.label}
                  {isPriority && <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">Priority</span>}
                </span>
                <span className="shrink-0 text-small font-bold tabular-nums text-foreground">{r.score}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="coach-bar-fill h-full rounded-full bg-primary" style={{ width: `${r.score}%`, opacity: isPriority ? 1 : 0.55, animationDelay: `${i * 55}ms` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TargetPanel({ out }: { out: Record<string, unknown> }) {
  const data = asObj(out.data);
  const firm = asStr(data.firm_label) || asStr(data.target);
  const emphasised = Array.isArray(data.emphasised_dimensions) ? (data.emphasised_dimensions as unknown[]).map((d) => prettifySkill(asStr(d))) : [];
  const priority = Array.isArray(data.priority_dimensions) ? (data.priority_dimensions as unknown[]).map((d) => prettifySkill(asStr(d))) : [];
  const note = asArr(out.findings)[0];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="navy"><Flag className="h-3 w-3" /> {firm}</Chip>
        {note && <span className="text-small text-muted-foreground">{note}</span>}
      </div>
      {emphasised.length > 0 && (
        <div>
          <p className="mb-1.5 text-micro font-semibold uppercase tracking-wider text-muted-foreground">Make-or-break skills here</p>
          <div className="flex flex-wrap gap-1.5">{emphasised.map((e) => <Chip key={e}>{e}</Chip>)}</div>
        </div>
      )}
      {priority.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-small text-foreground">
            <span className="font-semibold">Where {firm}&apos;s bar meets your gap:</span>{' '}
            <span className="font-semibold text-primary">{priority.join(', ')}</span> — aim your reps here first.
          </p>
        </div>
      )}
    </div>
  );
}

function CuratorPanel({ out }: { out: Record<string, unknown> }) {
  const data = asObj(out.data);
  const recs = (Array.isArray(data.recommended_cases) ? data.recommended_cases : []) as RecCase[];
  const stretch = asObj(data.stretch_case);
  return (
    <div className="space-y-3">
      {recs.length > 0 ? (
        <ul className="space-y-1.5">
          {recs.map((c, i) => (
            <li key={c.id ?? i} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2">
              {c.id
                ? <Link href={`/cases/${c.id}`} className="text-small font-medium text-navy hover:text-primary hover:underline">{c.title}</Link>
                : <span className="text-small text-foreground">{c.title}</span>}
              <span className="shrink-0 text-micro text-muted-foreground">{[c.type, c.difficulty].filter(Boolean).join(' · ')}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-small text-muted-foreground">No unattempted match in the bank right now — a bespoke stretch case was drafted for you.</p>
      )}
      {asStr(stretch.title) && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="flex items-center gap-1.5 text-micro font-bold uppercase tracking-wider text-primary"><Sparkles className="h-3.5 w-3.5" /> Bespoke stretch case</p>
          <p className="mt-1 text-strong text-foreground">{asStr(stretch.title)}</p>
          <p className="mt-1 text-small text-muted-foreground">{asStr(stretch.prompt)}</p>
        </div>
      )}
    </div>
  );
}

function NewsPanel({ out }: { out: Record<string, unknown> }) {
  const data = asObj(out.data);
  const topic = asStr(data.topic);
  const score = asNum(data.score);
  const angle = asStr(data.case_angle);
  const others = asArr(out.findings).slice(1);
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-strong text-foreground">{topic}</p>
          {score != null && <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-micro font-bold text-primary">GD {score}</span>}
        </div>
        {angle && <p className="mt-2 text-small text-muted-foreground">{angle}</p>}
      </div>
      {others.length > 0 && (
        <ul className="space-y-1">
          {others.map((h, i) => <li key={i} className="flex gap-2 text-micro text-muted-foreground"><Newspaper className="mt-0.5 h-3 w-3 shrink-0" />{h}</li>)}
        </ul>
      )}
    </div>
  );
}

function ExemplarPanel({ out }: { out: Record<string, unknown> }) {
  const data = asObj(out.data);
  const examples = asArr(data.examples).length ? asArr(data.examples) : asArr(out.findings);
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {examples.map((e, i) => (
        <div key={i} className="flex gap-2 rounded-lg border border-border bg-background p-3">
          <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
          <p className="text-small text-foreground">{e}</p>
        </div>
      ))}
    </div>
  );
}

function RoadmapPanel({ out }: { out: Record<string, unknown> }) {
  const data = asObj(out.data);
  const plan = (Array.isArray(data.plan) ? data.plan : []) as Record<string, unknown>[];
  return (
    <ol className="relative space-y-4 pl-6">
      <span className="absolute left-[7px] top-1 bottom-1 w-px bg-border-strong" aria-hidden />
      {plan.map((m, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-6 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-navy bg-card" />
          <p className="text-strong text-foreground">{asStr(m.title)}</p>
          <ul className="mt-1 space-y-0.5">
            {asArr(m.items).map((it, j) => <li key={j} className="text-small text-muted-foreground">• {it}</li>)}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function GenericPanel({ out }: { out: Record<string, unknown> }) {
  const findings = asArr(out.findings);
  const actions = asArr(out.recommended_actions);
  return (
    <div className="space-y-2">
      {findings.length > 0 && <ul className="space-y-1">{findings.map((f, i) => <li key={i} className="text-small text-muted-foreground">• {f}</li>)}</ul>}
      {actions.map((a, i) => <p key={i} className="flex items-start gap-1.5 text-small font-medium text-primary"><ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />{a}</p>)}
    </div>
  );
}

const PANELS: Record<string, React.FC<{ out: Record<string, unknown> }>> = {
  diagnostician: SkillXray,
  target_strategist: TargetPanel,
  case_curator: CuratorPanel,
  news_analyst: NewsPanel,
  exemplar_scout: ExemplarPanel,
  roadmap_architect: RoadmapPanel,
};

// ── page ──────────────────────────────────────────────────────────────────
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
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const authHeader = useCallback(async (): Promise<Record<string, string>> => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    if (!isPro) { setLoadingInfo(false); return; }
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

  // Reveal the trace one move at a time — the orchestration plays out live.
  useEffect(() => {
    if (!result) return;
    if (timer.current) clearInterval(timer.current);
    setRevealed(0);
    timer.current = setInterval(() => {
      setRevealed((n) => {
        if (n >= result.steps.length) { if (timer.current) clearInterval(timer.current); return n; }
        return n + 1;
      });
    }, 700);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [result]);

  const run = useCallback(async () => {
    setRunning(true); setError(null); setResult(null); setCopied(false);
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
      const res = await fetch(`${API_URL}/coach/run`, {
        method: 'POST', headers,
        body: JSON.stringify({ goal: goal.trim(), target_company: company.trim(), domain: domain.trim(), mode: 'live' }),
      });
      if (!res.ok) {
        let detail = res.statusText;
        try { const j = await res.json(); if (typeof j.detail === 'string') detail = j.detail; } catch { /* not json */ }
        throw new Error(detail || `Run failed (${res.status})`);
      }
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Run failed');
    } finally {
      setRunning(false);
    }
  }, [authHeader, goal, company, domain]);

  const copyPlan = useCallback(() => {
    if (!result?.summary) return;
    navigator.clipboard?.writeText(result.summary).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [result]);

  // Per-agent live status from the reveal cursor.
  const agentStatus = useMemo(() => {
    const map: Record<string, 'queued' | 'running' | 'done'> = {};
    if (!result) return map;
    for (const step of result.steps) {
      if (!step.agent) continue;
      if (step.phase === 'plan' && step.index < revealed) map[step.agent] = 'running';
      if (step.phase === 'observe' && step.index < revealed) map[step.agent] = 'done';
    }
    return map;
  }, [result, revealed]);

  // ── Gate 1: not Pro ──────────────────────────────────────────────────
  if (!isPro) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Crown className="h-6 w-6 text-navy" /></div>
        <h1 className="mt-4 text-h2 text-foreground">Prep Copilot is a Pro feature</h1>
        <p className="mx-auto mt-2 max-w-md text-body text-muted-foreground">
          Your personal agentic coach reads your graded history, understands where you want to go, and orchestrates six
          specialists into a weekly, targeted prep plan — curated cases, a live business-news angle and real-world exemplars.
        </p>
        <Link href="/upgrade" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-small font-semibold text-white transition-opacity hover:opacity-90">
          <Sparkles className="h-4 w-4" /> Upgrade to Pro
        </Link>
      </div>
    );
  }
  if (loadingInfo) {
    return <div className="flex items-center gap-2 py-16 text-small text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading your copilot…</div>;
  }
  // ── Gate 2: Pro but not yet eligible ─────────────────────────────────
  if (info && !info.eligible) {
    const pct = Math.min(100, Math.round((info.completed / Math.max(1, info.required)) * 100));
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Lock className="h-6 w-6 text-navy" /></div>
        <h1 className="mt-4 text-h2 text-foreground">Warm up your copilot first</h1>
        <p className="mx-auto mt-2 max-w-md text-body text-muted-foreground">
          The copilot plans from your real performance. Complete <strong className="text-foreground">{info.required}</strong> scored
          cases or guesstimates and it unlocks — you&apos;ve done <strong className="text-foreground">{info.completed}</strong>.
        </p>
        <div className="mx-auto mt-5 h-2 w-64 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
        <Link href="/practice" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-small font-semibold text-white transition-opacity hover:opacity-90"><Play className="h-4 w-4" /> Practice a case</Link>
      </div>
    );
  }

  const traceSteps = result ? result.steps : [];
  const shown = traceSteps.slice(0, revealed).filter((s) => s.phase === 'plan' || s.phase === 'observe');
  const finished = result ? revealed >= traceSteps.length : false;
  const curator = observeData(result, 'case_curator');
  const recCases = (Array.isArray(curator.recommended_cases) ? curator.recommended_cases : []) as RecCase[];
  const firstCaseHref = recCases.find((c) => c.id)?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wider text-primary"><Compass className="h-3.5 w-3.5" /> Agentic prep orchestration · Pro</p>
        <h1 className="mt-1 flex items-center gap-2 text-h2 text-foreground"><Bot className="h-6 w-6 text-navy" /> Prep Copilot</h1>
        <p className="mt-1 max-w-2xl text-body text-muted-foreground">
          Tell it where you want to go. An orchestrator reads your graded history, decides which specialists to deploy,
          reads each result, and synthesises a personalised weekly plan — you watch every move it makes.
        </p>
      </div>

      {/* Specialist roster */}
      {info && (
        <div>
          <p className="mb-2 text-micro font-semibold uppercase tracking-wider text-muted-foreground">The specialist team</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {info.specialists.map((s) => {
              const meta = agentOf(s.name);
              const st = agentStatus[s.name] || 'queued';
              const Icon = meta.Icon;
              return (
                <div key={s.name} className={cx('rounded-xl border bg-card p-3 transition', st === 'running' ? 'border-primary ring-1 ring-primary' : 'border-border')}>
                  <div className="flex items-center justify-between">
                    <AgentBadge Icon={Icon} />
                    {st === 'done' && <Check className="h-4 w-4 text-navy" />}
                    {st === 'running' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  </div>
                  <p className="mt-2 text-small font-semibold leading-tight text-foreground">{s.label}</p>
                  <p className="text-micro leading-tight text-muted-foreground">{s.domain}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Intake */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <p className="text-micro font-semibold uppercase tracking-wider text-muted-foreground">Where do you want to go?</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-micro text-muted-foreground">Target company (optional)</span>
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. McKinsey, BCG, a product role…"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-small text-foreground outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <label className="block">
            <span className="text-micro text-muted-foreground">Domain / role (optional)</span>
            <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. consulting, finance, product"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-small text-foreground outline-none focus:ring-2 focus:ring-ring" />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="text-micro text-muted-foreground">Your goal in a sentence</span>
          <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={2} placeholder="e.g. Crack MBB — my answers ramble, I need to lead with the point."
            className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-small text-foreground outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={run} disabled={running || !goal.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-small font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Orchestrating…' : result ? 'Re-plan' : 'Build my plan'}
          </button>
          <span className="text-micro text-muted-foreground">The copilot reads your real attempts and plans across six specialists.</span>
        </div>
      </div>

      {error && <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-small text-primary">{error}</div>}
      {result?.note && <div className="rounded-lg border border-warning/40 bg-warning-soft px-4 py-3 text-small text-warning">{result.note}</div>}

      {/* Booting state before the trace arrives */}
      {running && !result && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 text-small text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="coach-pulse">Orchestrator is reading your graded history and planning the mission…</span>
        </div>
      )}

      {/* Trace — the orchestration plays out */}
      {result && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="navy">mode · {result.mode}</Chip>
            {result.model && <Chip>model · {result.model}</Chip>}
            <Chip>{result.agents_used.length} specialists deployed</Chip>
          </div>

          <div className="space-y-2.5">
            {shown.map((step) => {
              const meta = agentOf(step.agent);
              const Icon = meta.Icon;
              if (step.phase === 'plan') {
                return (
                  <div key={step.index} className="coach-up flex items-start gap-3 px-1">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted"><Brain className="h-3.5 w-3.5 text-navy" /></span>
                    <p className="text-small text-muted-foreground">
                      <span className="font-semibold text-foreground">Orchestrator</span> deploys{' '}
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground"><Icon className="h-3.5 w-3.5 text-navy" />{meta.label}</span>
                      {step.rationale && <span> — {step.rationale}</span>}
                    </p>
                  </div>
                );
              }
              const out = asObj(step.output);
              const Panel = (step.agent && PANELS[step.agent]) || GenericPanel;
              return (
                <div key={step.index} className="coach-up ml-4 rounded-xl border border-border bg-card p-4">
                  <div className="mb-2.5 flex items-center gap-2">
                    <AgentBadge Icon={Icon} />
                    <span className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">{meta.label}</span>
                  </div>
                  {asStr(out.headline) && <p className="mb-2.5 text-strong text-foreground">{asStr(out.headline)}</p>}
                  <Panel out={out} />
                </div>
              );
            })}
            {!finished && (
              <div className="flex items-center gap-2 px-2 py-1 text-micro text-muted-foreground">
                <span className="coach-pulse inline-flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> thinking…</span>
              </div>
            )}
          </div>

          {/* Final synthesis — the mission briefing */}
          {finished && (
            <div className="coach-up overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-3">
                <p className="flex items-center gap-2 text-strong text-foreground"><CheckCircle2 className="h-4 w-4 text-navy" /> Your mission briefing</p>
                <div className="flex items-center gap-2">
                  <button onClick={copyPlan} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-micro font-medium text-muted-foreground transition-colors hover:text-foreground">
                    {copied ? <><Check className="h-3.5 w-3.5 text-navy" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                  </button>
                  <button onClick={run} disabled={running} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-micro font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50">
                    <RefreshCw className={cx('h-3.5 w-3.5', running && 'animate-spin')} /> Re-plan
                  </button>
                </div>
              </div>
              <div className="px-5 py-4">
                <Narrative text={result.summary} />
                {(firstCaseHref || recCases.length > 0) && (
                  <Link href={firstCaseHref ? `/cases/${firstCaseHref}` : '/practice'}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-small font-semibold text-white transition-opacity hover:opacity-90">
                    <Play className="h-4 w-4" /> Start your priority case <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes coachUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .coach-up { animation: coachUp .5s cubic-bezier(.2,.7,.3,1) both; }
        @keyframes coachBar { from { width: 0 !important; } }
        .coach-bar-fill { animation: coachBar .9s cubic-bezier(.2,.7,.3,1) both; }
        @keyframes coachPulse { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
        .coach-pulse { animation: coachPulse 1.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .coach-up,.coach-bar-fill,.coach-pulse { animation: none !important; } }
      `}</style>
    </div>
  );
}
