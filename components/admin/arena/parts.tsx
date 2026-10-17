'use client';

/**
 * Shared pieces of the admin interviewer arena (app/(app)/admin/arena):
 * types, the solve-chat bubbles, the diagnostics block, the case picker and the
 * backend fetch helper. Used by both modes -- Current vs New (two deployments) and
 * Prompt snapshots (one deployment, blind).
 *
 * The bubble renderers mirror components/solve/ConversationalSolve.tsx so a pane
 * reads like the real solve chat. Keep them in step if that file's look changes.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { stripSayLabel } from '@/lib/voice/v11-voice';
import { ArrowLeftRight, Cpu, Gauge, HelpCircle, Loader2, MessageSquare, Timer, Wrench, Zap } from 'lucide-react';

/* ------------------------------------------------------------------ backend calls */

/** The live backend. The candidate backend's URL comes from the page. */
export const CURRENT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function authHeader(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** JSON call to `${base}/admin/arena${path}` as the signed-in admin. Throws the
 *  backend's `detail` on an error status. A generous timeout covers a free-tier
 *  service waking from sleep. */
export async function arenaFetch(base: string, path: string, init?: RequestInit, timeoutMs = 90000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const headers = { 'content-type': 'application/json', ...(await authHeader()) };
    const res = await fetch(`${base.replace(/\/+$/, '')}/admin/arena${path}`, {
      cache: 'no-store', ...init, headers, signal: ctrl.signal,
    });
    const text = await res.text();
    let json: unknown = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON error body */ }
    if (!res.ok) {
      const detail = (json as { detail?: string } | null)?.detail;
      const err = new Error(detail || `${res.status} ${res.statusText}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    return json;
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error(`No answer from ${base} within ${Math.round(timeoutMs / 1000)}s`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ case search */

/** Server-side search over the WHOLE library, newest first, a page at a time. A
 *  request counter drops responses that arrive after a newer search was typed. */
export function useCaseSearch(api: (path: string) => Promise<unknown>, enabled: boolean): PickerProps {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string>('all');
  const [market, setMarket] = useState<string>('all');
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketsSupported, setMarketsSupported] = useState(true);
  const [selected, setSelected] = useState<CaseRow | null>(null);
  const req = useRef(0);

  const load = useCallback(async (offset: number) => {
    const n = ++req.current;
    setLoading(true); setError(null);
    const qs = new URLSearchParams({ limit: String(CASE_PAGE), offset: String(offset) });
    if (query.trim()) qs.set('q', query.trim());
    if (type !== 'all') qs.set('case_type', type);
    if (market !== 'all') qs.set('market', market);
    try {
      const page = await api(`/cases?${qs.toString()}`) as CasesPage;
      if (n !== req.current) return;
      setCases((prev) => (offset === 0 ? page.cases : [...prev, ...page.cases]));
      setTotal(page.total);
      setHasMore(page.has_more);
      setMarketsSupported(page.markets_supported !== false);
    } catch (e) {
      if (n !== req.current) return;
      setError(e instanceof Error ? e.message : 'Could not search cases');
    } finally {
      if (n === req.current) setLoading(false);
    }
  }, [api, query, type, market]);

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => { load(0); }, 250);
    return () => clearTimeout(t);
  }, [enabled, load]);

  const types = useMemo(() => {
    const known = new Map(CASE_TYPES);
    for (const c of cases) if (c.type && !known.has(c.type)) known.set(c.type, c.type);
    return Array.from(known.entries());
  }, [cases]);

  return {
    query, setQuery, type, setType, types, market, setMarket, marketsSupported,
    cases, total, hasMore, loading, error, onMore: () => load(cases.length),
    selected, onSelect: setSelected,
  };
}

export type TranscriptTurn = { role: string; content: string; kind?: string };
export type Tier = { id: string; quota: number };
export type TurnClarification = { counted: number; quota: number; used: number; remaining: number; exhausted_this_turn: boolean };

export type Scenario = { id: string; case_type: string; turns: number; new_message: string; transcript: { role: string; content: string }[]; required?: string };

export type CaseRow = {
  id: string; title: string; type: string; difficulty: string | null; market: string | null;
  is_active: boolean | null; unlisted: boolean | null; created_at: string | null;
};
/** One page of the server-side case search (/admin/arena/cases). */
export type CasesPage = {
  cases: CaseRow[]; count: number; total: number; offset: number; limit: number;
  has_more: boolean; markets_supported: boolean;
};

export type Control = {
  mode: string | null; function: string | null; render: string | null; reason: string | null;
  intervention: string | null; materiality: string | null; skill: string | null;
  error_kind: string | null; hint: string | null; fallback: boolean;
};
export type Arm = {
  reply: string; raw_reply: string; silent: boolean; error: string | null;
  prompt_consulted: boolean; enforced: boolean; control: Control; violations: string[];
  metrics: { chars: number; words: number; sentences: number; questions: number };
  latency_ms: number; model: string | null; provider: string | null;
  next_state: Record<string, unknown> | null;
  /** voice path only: what a voice session would do */
  voice?: { lane: string; say: string | null; event: unknown } | null;
  /** present on the labelled Current-vs-New panel; stripped on the blind one */
  variant_id?: string;
};

export type ViewMode = 'candidate' | 'diagnostics';
export const VIEW_KEY = 'mece.arena.view';

// Known case types (the cases.type check constraint). Types found in results are added.
export const CASE_TYPES: [string, string][] = [
  ['guesstimate', 'Guesstimates'], ['profitability', 'Profitability'],
  ['market_sizing', 'Market sizing'], ['growth', 'Growth'],
];
export const MARKETS: [string, string][] = [['IN', 'India'], ['US', 'US & Europe']];
export const CASE_PAGE = 50;

export const VIOLATION_LABEL: Record<string, string> = {
  banned_isnt_specified: "said “isn’t specified”",
  possible_rubber_stamp: 'rubber-stamped',
  too_long: 'too long',
  multiple_questions: 'stacked questions',
  solved_when_declared_continue: 'solved it while claiming to continue',
  revealed_full_solution_in_exam: 'revealed the solution in exam mode',
};

/* ------------------------------------------------------------------ case picker */

export type PickerProps = {
  query: string; setQuery: (v: string) => void;
  type: string; setType: (v: string) => void; types: [string, string][];
  market: string; setMarket: (v: string) => void; marketsSupported: boolean;
  cases: CaseRow[]; total: number | null; hasMore: boolean; loading: boolean; error: string | null;
  onMore: () => void; selected: CaseRow | null; onSelect: (c: CaseRow) => void;
};

export const TYPE_LABEL: Record<string, string> = Object.fromEntries(CASE_TYPES);
export const MARKET_LABEL: Record<string, string> = Object.fromEntries(MARKETS);

export function shortDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function CasePicker(p: PickerProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Case or guesstimate — the whole library
      </span>
      <div className="flex flex-wrap gap-2">
        <input
          value={p.query} onChange={(e) => p.setQuery(e.target.value)}
          placeholder="Search by title, or paste a case ID…"
          aria-label="Search cases"
          className="min-w-[12rem] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <select value={p.type} onChange={(e) => p.setType(e.target.value)} aria-label="Case type"
          className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
          <option value="all">All types</option>
          {p.types.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
        {p.marketsSupported && (
          <select value={p.market} onChange={(e) => p.setMarket(e.target.value)} aria-label="Market"
            className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
            <option value="all">All markets</option>
            {MARKETS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto rounded-lg border border-border" role="listbox" aria-label="Cases">
        {p.error && <p className="px-3 py-3 text-sm text-red-700">{p.error}</p>}
        {!p.error && p.cases.length === 0 && (
          <p className="px-3 py-3 text-sm text-muted-foreground">
            {p.loading ? 'Searching…' : p.query ? <>Nothing matches &ldquo;{p.query}&rdquo;.</> : 'No cases found.'}
          </p>
        )}
        {p.cases.map((c) => {
          const active = p.selected?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => p.onSelect(c)}
              className={`block w-full border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-muted ${active ? 'bg-muted ring-1 ring-inset ring-foreground/30' : ''}`}
            >
              <span className="block truncate text-sm font-medium">{c.title}</span>
              <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>{TYPE_LABEL[c.type] || c.type}</span>
                {c.difficulty && <><span aria-hidden>·</span><span>{c.difficulty}</span></>}
                {c.market && <><span aria-hidden>·</span><span>{MARKET_LABEL[c.market] || c.market}</span></>}
                {c.created_at && <><span aria-hidden>·</span><span>{shortDate(c.created_at)}</span></>}
                {c.unlisted && <Chip tone="warn">unlisted</Chip>}
                {c.is_active === false && <Chip tone="warn">inactive</Chip>}
              </span>
            </button>
          );
        })}
        {p.hasMore && (
          <button type="button" onClick={p.onMore} disabled={p.loading}
            className="block w-full px-3 py-2 text-center text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-50">
            {p.loading ? 'Loading…' : `Load more (${p.cases.length} of ${p.total ?? '?'})`}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {p.total !== null && <>{p.total} match{p.total === 1 ? '' : 'es'} · newest first · </>}
        {p.selected
          ? <>selected: <strong className="text-foreground">{p.selected.title}</strong></>
          : 'pick one to start'}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ pieces */

export function Chip({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'warn' | 'bad' | 'blind' | 'reveal' }) {
  const tones: Record<string, string> = {
    default: 'border-border bg-muted/60 text-muted-foreground',
    warn: 'border-amber-300 bg-amber-50 text-amber-900',
    bad: 'border-red-300 bg-red-50 text-red-700',
    blind: 'border-blue-300 bg-blue-50 text-blue-700',
    reveal: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  };
  return <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

/* The four renderers below mirror components/solve/ConversationalSolve.tsx
   (MessageBubble, renderWithBold, the "thinking" row, ClarificationCounter) so a pane
   reads like the real solve chat. Keep them in step if that file's look changes. */

export function renderWithBold(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
}

export function SystemPill({ text }: { text: string }) {
  let display = text || '';
  if (display.toUpperCase().startsWith('CASE READY:')) {
    const dot = display.indexOf('.');
    if (dot !== -1) display = display.slice(dot + 1).trim();
  }
  if (display) display = display.charAt(0).toUpperCase() + display.slice(1).toLowerCase();
  return (
    <div className="my-3 flex justify-center">
      <p className="rounded-full bg-black/5 px-4 py-1.5 text-center text-micro font-medium text-muted-foreground shadow-sm dark:bg-white/5">
        {display}
      </p>
    </div>
  );
}

export function CandidateBubble({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <div className={`flex justify-end ${muted ? 'opacity-60' : ''}`}>
      <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-body text-primary-foreground">
        {text}
      </div>
    </div>
  );
}

export function InterviewerBubble({ text, muted, note }: { text: string; muted?: boolean; note?: string }) {
  return (
    <div className={`flex justify-start ${muted ? 'opacity-60' : ''}`}>
      <div className="max-w-[85%]">
        <p className="mb-1 text-micro font-semibold uppercase tracking-widest text-muted-foreground">
          Interviewer{note ? ` · ${note}` : ''}
        </p>
        <div className="whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-body text-foreground">
          {renderWithBold(stripSayLabel(text || ''))}
        </div>
      </div>
    </div>
  );
}

export function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        <p className="mb-1 text-micro font-semibold uppercase tracking-widest text-muted-foreground">Interviewer</p>
        <div className="rounded-2xl bg-muted px-4 py-2 text-small text-muted-foreground">
          <Loader2 className="inline h-3 w-3 animate-spin" /> thinking…
        </div>
      </div>
    </div>
  );
}

export function QuestionsLeft({ remaining, quota, tier }: { remaining: number; quota: number; tier: string }) {
  const danger = remaining <= 1;
  return (
    <span
      className={`rounded-full border px-3 py-1 text-micro font-semibold ${danger
        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
        : 'border-border bg-muted text-foreground/80'}`}
      title={`A ${tier} candidate can ask ${quota} clarifying questions in total.`}
    >
      <HelpCircle className="mr-1 inline h-3 w-3" />
      Questions remaining: {remaining} <span className="font-normal text-muted-foreground">({tier})</span>
    </span>
  );
}

export function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  const opts: { id: ViewMode; label: string; icon: React.ReactNode; title: string }[] = [
    { id: 'candidate', label: 'Candidate view', icon: <MessageSquare className="h-3.5 w-3.5" />,
      title: 'Only what the candidate would see, styled like the real solve chat' },
    { id: 'diagnostics', label: 'Diagnostics', icon: <Wrench className="h-3.5 w-3.5" />,
      title: 'Add the decision behind each reply: function, guardrail flags, latency, raw text' },
  ];
  return (
    <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label="Pane view">
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          title={o.title}
          aria-pressed={value === o.id}
          className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${value === o.id
            ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`}
        >
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  );
}

export function InterviewerTurn({ arm, viewMode, showRaw, onToggleRaw }: {
  arm: Arm; viewMode: ViewMode; showRaw: boolean; onToggleRaw: () => void;
}) {
  if (arm.error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide">Arm failed</span>
        {arm.error}
      </div>
    );
  }
  const diagnostics = viewMode === 'diagnostics';
  const body = arm.silent ? (
    // Production writes no row and shows no bubble for a silence.
    <p className="text-center text-[11px] italic text-muted-foreground">
      The interviewer stayed silent here — the candidate sees no reply.
    </p>
  ) : (
    <InterviewerBubble
      text={showRaw ? (arm.raw_reply || arm.reply) : arm.reply}
      note={showRaw ? 'raw model text, before post-processing' : undefined}
    />
  );
  if (!diagnostics) return body;

  return (
    <div className="space-y-1.5">
      {body}
      <div className="flex flex-wrap items-center gap-1.5">
        {!arm.prompt_consulted && <Chip tone="warn"><Zap className="mr-1 inline h-3 w-3" />no prompt used</Chip>}
        {arm.control.function && <Chip>{arm.control.function}</Chip>}
        {arm.control.mode && arm.control.mode !== arm.control.function && <Chip>{arm.control.mode}</Chip>}
        {arm.control.intervention && <Chip>{arm.control.intervention}</Chip>}
        {arm.control.materiality && <Chip>materiality: {arm.control.materiality}</Chip>}
        {arm.control.hint && <Chip>hint {arm.control.hint}</Chip>}
        {arm.control.fallback && <Chip tone="warn">fallback line</Chip>}
        <Chip><Timer className="mr-1 inline h-3 w-3" />{arm.latency_ms} ms</Chip>
        <Chip><Gauge className="mr-1 inline h-3 w-3" />{arm.metrics.words}w · {arm.metrics.questions}?</Chip>
        <Chip><Cpu className="mr-1 inline h-3 w-3" />{arm.model || 'no model call'}</Chip>
        {arm.violations.map((v) => (
          <Chip key={v} tone="bad">{VIOLATION_LABEL[v] || v}</Chip>
        ))}
        {arm.enforced && (
          <button onClick={onToggleRaw} className="rounded-md border border-border px-2 py-0.5 text-[11px] font-medium hover:bg-muted">
            <ArrowLeftRight className="mr-1 inline h-3 w-3" />
            {showRaw ? 'show what the candidate gets' : 'post-processing changed this — show raw'}
          </button>
        )}
      </div>
      {arm.control.reason && (
        <p className="text-[11px] text-muted-foreground">why: {arm.control.reason}</p>
      )}
    </div>
  );
}
