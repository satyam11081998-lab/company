'use client';

/**
 * Admin · Interviewer arena.
 *
 * Blind side-by-side of two interviewer PROMPT VARIANTS on the same real case and
 * the same candidate turn. Pick a case or guesstimate, drive one conversation, and
 * both arms answer it independently; vote, then the pairing is revealed.
 *
 * Reads and writes the FastAPI backend's /admin/arena endpoints, which hold the
 * blinding: the browser is never told which side is which until a vote is cast,
 * because knowing which arm is "the new one" is enough to decide the vote.
 *
 * The admin gate is the parent layout (server-side is_admin) PLUS each backend
 * route's own _require_admin -- this page is just the surface.
 *
 * Reading the result honestly (both enforced by the backend, surfaced here):
 *  - V11 answers MANY turns in a deterministic lane. No prompt is built, both arms
 *    say the same thing, and the turn is marked NOT COMPARABLE. Those turns say
 *    nothing about the prompts.
 *  - enforce_mode can rewrite a reply outright, so each reply can be flipped to the
 *    raw model text. A difference in the shipped text can be the enforcer's doing.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  AlertTriangle, ArrowLeftRight, BarChart3, Check, ChevronDown, ChevronRight,
  Eye, Flame, Gauge, Loader2, Play, RotateCcw, Send, Swords, Timer, Zap,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Variant = { id: string; label: string; description: string; origin: string; frozen: boolean; sha256: string | null };
type Scenario = { id: string; case_type: string; turns: number; new_message: string; transcript: { role: string; content: string }[] };
type CaseRow = { id: string; title: string; type: string; difficulty: string | null; market: string | null; content_chars: number };
type Config = {
  variants: Variant[]; default_arm_a: string; default_arm_b: string;
  model_modes: { id: string; label: string }[]; default_model_mode: string;
  teaching_policies: string[]; seed_scenarios: Scenario[];
  votes_persisted: boolean; persistence_note: string;
  limits: { max_transcript_turns: number; max_message_chars: number };
};
type Control = {
  mode: string | null; function: string | null; render: string | null; reason: string | null;
  intervention: string | null; materiality: string | null; skill: string | null;
  error_kind: string | null; hint: string | null; fallback: boolean;
};
type Arm = {
  reply: string; raw_reply: string; silent: boolean; error: string | null;
  prompt_consulted: boolean; enforced: boolean; control: Control; violations: string[];
  metrics: { chars: number; words: number; sentences: number; questions: number };
  latency_ms: number; model: string | null; provider: string | null;
  next_state: Record<string, unknown> | null;
};
type Reveal = { left: { variant_id: string; label: string; origin: string; frozen: boolean };
                right: { variant_id: string; label: string; origin: string; frozen: boolean };
                chosen_variant: string | null };
type TurnRow = {
  index: number; message: string; left: Arm; right: Arm;
  comparable: boolean; not_comparable_reason: string | null; replies_identical: boolean;
  vote?: string; reveal?: Reveal; persisted?: boolean; persistDetail?: string; smallN?: string | null;
};
type Session = {
  session_id: string;
  case: { id: string; title: string; type: string; difficulty: string | null; content: string };
  teaching_policy: string; model_mode: string; blinded: boolean; self_noise_run: boolean;
};

const SIDES = ['left', 'right'] as const;
const SIDE_LABEL: Record<string, string> = { left: 'A', right: 'B' };

const VIOLATION_LABEL: Record<string, string> = {
  banned_isnt_specified: "said “isn’t specified”",
  possible_rubber_stamp: 'rubber-stamped',
  too_long: 'too long',
  multiple_questions: 'stacked questions',
  solved_when_declared_continue: 'solved it while claiming to continue',
  revealed_full_solution_in_exam: 'revealed the solution in exam mode',
};

export default function ArenaPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [caseQuery, setCaseQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [caseId, setCaseId] = useState('');
  const [variantA, setVariantA] = useState('');
  const [variantB, setVariantB] = useState('');
  const [modelMode, setModelMode] = useState('');
  const [policy, setPolicy] = useState('coached');
  const [seedId, setSeedId] = useState('');

  const [session, setSession] = useState<Session | null>(null);
  const [turns, setTurns] = useState<TurnRow[]>([]);
  const [armState, setArmState] = useState<Record<string, { transcript: { role: string; content: string }[]; prior_state: Record<string, unknown> | null }>>({
    left: { transcript: [], prior_state: null }, right: { transcript: [], prior_state: null },
  });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState<Record<string, boolean>>({});
  const [briefOpen, setBriefOpen] = useState(true);
  const endRef = useRef<HTMLDivElement | null>(null);

  const authHeader = useCallback(async (): Promise<Record<string, string>> => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const api = useCallback(async (path: string, init?: RequestInit) => {
    const headers = { 'content-type': 'application/json', ...(await authHeader()) };
    const res = await fetch(`${API_URL}/admin/arena${path}`, { cache: 'no-store', ...init, headers });
    const text = await res.text();
    let json: unknown = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON error body */ }
    if (!res.ok) {
      const detail = (json as { detail?: string } | null)?.detail;
      throw new Error(detail || `${res.status} ${res.statusText}`);
    }
    return json;
  }, [authHeader]);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await api('/config') as Config;
        setConfig(cfg);
        setVariantA(cfg.default_arm_a);
        setVariantB(cfg.default_arm_b);
        setModelMode(cfg.default_model_mode);
        const cs = await api('/cases?limit=200') as { cases: CaseRow[] };
        setCases(cs.cases || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load the arena');
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns.length]);

  const filteredCases = useMemo(() => cases.filter((c) => {
    if (typeFilter !== 'all' && (c.type || '').toLowerCase() !== typeFilter) return false;
    if (caseQuery && !(c.title || '').toLowerCase().includes(caseQuery.toLowerCase())) return false;
    return true;
  }), [cases, caseQuery, typeFilter]);

  const caseTypes = useMemo(
    () => Array.from(new Set(cases.map((c) => (c.type || '').toLowerCase()).filter(Boolean))).sort(),
    [cases],
  );

  const seed = useMemo(
    () => config?.seed_scenarios.find((s) => s.id === seedId) || null,
    [config, seedId],
  );

  // The first vote reveals the pairing, and there is no un-knowing it: every LATER
  // turn in this session is judged by someone who now knows which arm is which.
  // Pretending otherwise would quietly contaminate the data, so it is stated and
  // those turns are marked.
  const revealedPairing = useMemo(
    () => turns.find((t) => t.reveal)?.reveal ?? null,
    [turns],
  );
  const firstRevealedTurn = useMemo(
    () => turns.find((t) => t.reveal)?.index ?? null,
    [turns],
  );

  const start = async () => {
    setError(null); setBusy(true);
    try {
      const s = await api('/session', {
        method: 'POST',
        body: JSON.stringify({ case_id: caseId, variant_a: variantA, variant_b: variantB, model_mode: modelMode, teaching_policy: policy }),
      }) as Session;
      setSession(s);
      setTurns([]);
      // A seeded scenario starts BOTH arms from the identical prior conversation, so
      // the first compared turn is the hard moment rather than turn one of small talk.
      const pre = seed ? seed.transcript.map((t) => ({ role: t.role, content: t.content })) : [];
      setArmState({ left: { transcript: [...pre], prior_state: null }, right: { transcript: [...pre], prior_state: null } });
      setMessage(seed?.new_message || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the session');
    } finally { setBusy(false); }
  };

  const send = async () => {
    if (!session || !message.trim() || busy) return;
    const msg = message.trim();
    setError(null); setBusy(true);
    try {
      const res = await api('/turn', {
        method: 'POST',
        body: JSON.stringify({
          session_id: session.session_id,
          message: msg,
          left: armState.left,
          right: armState.right,
        }),
      }) as { turn_index: number; left: Arm; right: Arm; comparable: boolean; not_comparable_reason: string | null; replies_identical: boolean };
      setTurns((t) => [...t, {
        index: res.turn_index, message: msg, left: res.left, right: res.right,
        comparable: res.comparable, not_comparable_reason: res.not_comparable_reason,
        replies_identical: res.replies_identical,
      }]);
      // The arms DIVERGE from here: each keeps its own transcript and its own state.
      setArmState((prev) => {
        const next = { ...prev };
        for (const side of SIDES) {
          const arm = res[side];
          const t = [...prev[side].transcript, { role: 'user', content: msg }];
          if (arm.reply && !arm.silent) t.push({ role: 'assistant', content: arm.reply });
          next[side] = { transcript: t, prior_state: arm.next_state ?? prev[side].prior_state };
        }
        return next;
      });
      setMessage('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Turn failed');
    } finally { setBusy(false); }
  };

  const vote = async (turnIndex: number, choice: string) => {
    if (!session) return;
    const row = turns.find((t) => t.index === turnIndex);
    try {
      const res = await api('/vote', {
        method: 'POST',
        body: JSON.stringify({
          session_id: session.session_id, turn_index: turnIndex, choice,
          candidate_message: row?.message || '',
        }),
      }) as { persisted: boolean; detail: string; reveal: Reveal; small_n_warning: string | null };
      setTurns((ts) => ts.map((t) => t.index === turnIndex
        ? { ...t, vote: choice, reveal: res.reveal, persisted: res.persisted, persistDetail: res.detail, smallN: res.small_n_warning }
        : t));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not record the vote');
    }
  };

  const reset = () => { setSession(null); setTurns([]); setMessage(''); setError(null); };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading the arena…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Swords className="h-6 w-6" /> Interviewer arena
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Two prompt variants, one case, the same candidate turn. You will not be told which
          side is which until you vote — knowing which one is “the new build” is enough to
          decide the answer.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {config && !config.votes_persisted && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{config.persistence_note}</span>
        </div>
      )}

      {!session ? (
        <SetupCard
          config={config}
          cases={filteredCases}
          caseTypes={caseTypes}
          caseQuery={caseQuery} setCaseQuery={setCaseQuery}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          caseId={caseId} setCaseId={setCaseId}
          variantA={variantA} setVariantA={setVariantA}
          variantB={variantB} setVariantB={setVariantB}
          modelMode={modelMode} setModelMode={setModelMode}
          policy={policy} setPolicy={setPolicy}
          seedId={seedId} setSeedId={setSeedId}
          seed={seed}
          busy={busy}
          onStart={start}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4">
            <span className="text-sm font-medium">{session.case.title}</span>
            <Chip>{session.case.type}</Chip>
            {session.case.difficulty && <Chip>{session.case.difficulty}</Chip>}
            <Chip>{session.teaching_policy}</Chip>
            <Chip>{session.model_mode}</Chip>
            <Chip tone="blind"><Eye className="mr-1 inline h-3 w-3" />blinded</Chip>
            {session.self_noise_run && (
              <Chip tone="warn"><Flame className="mr-1 inline h-3 w-3" />self-noise run — same variant both sides</Chip>
            )}
            <button onClick={reset} className="ml-auto flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
              <RotateCcw className="h-3.5 w-3.5" /> New session
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <button onClick={() => setBriefOpen((o) => !o)} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium">
              {briefOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              The brief the candidate sees
            </button>
            {briefOpen && (
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap border-t border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                {session.case.content}
              </pre>
            )}
          </div>

          {session.self_noise_run && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <Flame className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Both sides are running the <strong>same</strong> variant. Any preference you feel here is
                your own noise floor, not a difference between prompts — which is exactly what makes this
                worth doing once before you trust a close result.
              </span>
            </div>
          )}

          {revealedPairing && (
            <div className="flex items-start gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <Eye className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                This session is <strong>no longer blind</strong> — you saw the pairing at turn{' '}
                {firstRevealedTurn}. Votes from here carry your expectations with them. For clean
                data, start a new session rather than continuing this one.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {SIDES.map((side) => (
              <div key={side} className="rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
                    {SIDE_LABEL[side]}
                  </span>
                  <span className="text-sm font-medium">Interviewer {SIDE_LABEL[side]}</span>
                  {revealedPairing && (
                    <Chip tone="reveal">{revealedPairing[side].label}</Chip>
                  )}
                </div>
                <div className="max-h-[32rem] space-y-3 overflow-auto p-4">
                  {armState[side].transcript.length === 0 && turns.length === 0 && (
                    <p className="text-xs text-muted-foreground">No turns yet. Send a candidate message below.</p>
                  )}
                  {seed && turns.length === 0 && armState[side].transcript.map((t, i) => (
                    <Bubble key={`seed-${i}`} role={t.role} text={t.content} muted />
                  ))}
                  {turns.map((turn) => (
                    <div key={`${side}-${turn.index}`} className="space-y-2">
                      <Bubble role="user" text={turn.message} />
                      <ReplyBlock
                        arm={turn[side]}
                        showRaw={!!showRaw[`${side}-${turn.index}`]}
                        onToggleRaw={() => setShowRaw((s) => ({ ...s, [`${side}-${turn.index}`]: !s[`${side}-${turn.index}`] }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {turns.map((turn) => (
            <VerdictBar
              key={`v-${turn.index}`}
              turn={turn}
              onVote={vote}
              afterReveal={firstRevealedTurn !== null && turn.index > firstRevealedTurn}
            />
          ))}

          <div ref={endRef} />

          <div className="sticky bottom-4 rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
                rows={2}
                maxLength={config?.limits.max_message_chars ?? 4000}
                placeholder="Type the candidate's turn — both interviewers answer it independently. ⌘/Ctrl+Enter to send."
                className="min-h-[3rem] w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={send}
                disabled={busy || !message.trim()}
                className="flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send to both
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ setup */

function SetupCard(p: {
  config: Config | null; cases: CaseRow[]; caseTypes: string[];
  caseQuery: string; setCaseQuery: (v: string) => void;
  typeFilter: string; setTypeFilter: (v: string) => void;
  caseId: string; setCaseId: (v: string) => void;
  variantA: string; setVariantA: (v: string) => void;
  variantB: string; setVariantB: (v: string) => void;
  modelMode: string; setModelMode: (v: string) => void;
  policy: string; setPolicy: (v: string) => void;
  seedId: string; setSeedId: (v: string) => void;
  seed: Scenario | null; busy: boolean; onStart: () => void;
}) {
  const { config } = p;
  if (!config) return null;
  const sameVariant = p.variantA === p.variantB;
  const variantMeta = (id: string) => config.variants.find((v) => v.id === id);

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="space-y-1.5 md:col-span-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case or guesstimate</span>
          <div className="flex gap-2">
            <input
              value={p.caseQuery} onChange={(e) => p.setCaseQuery(e.target.value)}
              placeholder="Search by title…"
              className="w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <select value={p.typeFilter} onChange={(e) => p.setTypeFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="all">All types</option>
              {p.caseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={p.caseId} onChange={(e) => p.setCaseId(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="">Pick a case ({p.cases.length} shown)</option>
              {p.cases.map((c) => (
                <option key={c.id} value={c.id}>{c.title} · {c.type}{c.difficulty ? ` · ${c.difficulty}` : ''}</option>
              ))}
            </select>
          </div>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Model (both arms)</span>
          <select value={p.modelMode} onChange={(e) => p.setModelMode(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm">
            {config.model_modes.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {([['A', p.variantA, p.setVariantA], ['B', p.variantB, p.setVariantB]] as const).map(([name, value, set]) => (
          <label key={name} className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Arm {name}</span>
            <select value={value} onChange={(e) => set(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm">
              {config.variants.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
            <span className="block text-xs text-muted-foreground">
              {variantMeta(value)?.description}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {variantMeta(value)?.frozen
                ? <>frozen · {variantMeta(value)?.origin} · {variantMeta(value)?.sha256}</>
                : <><AlertTriangle className="mr-1 inline h-3 w-3" />not frozen — results from this arm are not reproducible later</>}
            </span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Teaching policy</span>
          <select value={p.policy} onChange={(e) => p.setPolicy(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm">
            {config.teaching_policies.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Start from a hard moment (optional)
          </span>
          <select value={p.seedId} onChange={(e) => p.setSeedId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm">
            <option value="">Start from turn one</option>
            {config.seed_scenarios.map((s) => (
              <option key={s.id} value={s.id}>{s.id} · {s.case_type} · {s.turns} prior turns</option>
            ))}
          </select>
          <span className="block text-xs text-muted-foreground">
            The 50 adversarial situations from the behavioural eval. Left to invent your own turns you
            will drift to the happy path — and the happy path is where the prompt never runs.
          </span>
        </label>
      </div>

      {p.seed && (
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
          <p className="mb-1 font-medium">Both arms will start from these {p.seed.turns} turns, then answer:</p>
          <p className="italic text-muted-foreground">“{p.seed.new_message}”</p>
        </div>
      )}

      {sameVariant && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Both arms are the same variant. That is a <strong>self-noise check</strong> — it measures how
            often you “prefer” one of two identical systems. Worth doing once; never read it as a result.
          </span>
        </div>
      )}

      <button
        onClick={p.onStart}
        disabled={!p.caseId || p.busy}
        className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {p.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Start blind session
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ pieces */

function Chip({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'warn' | 'bad' | 'blind' | 'reveal' }) {
  const tones: Record<string, string> = {
    default: 'border-border bg-muted/60 text-muted-foreground',
    warn: 'border-amber-300 bg-amber-50 text-amber-900',
    bad: 'border-red-300 bg-red-50 text-red-700',
    blind: 'border-blue-300 bg-blue-50 text-blue-700',
    reveal: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  };
  return <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

function Bubble({ role, text, muted }: { role: string; text: string; muted?: boolean }) {
  const isUser = role === 'user';
  return (
    <div className={`rounded-lg px-3 py-2 text-sm ${
      isUser ? 'bg-muted/70' : 'border border-border bg-background'
    } ${muted ? 'opacity-60' : ''}`}>
      <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {isUser ? 'Candidate' : 'Interviewer'}{muted ? ' · seeded' : ''}
      </span>
      <span className="whitespace-pre-wrap">{text}</span>
    </div>
  );
}

function ReplyBlock({ arm, showRaw, onToggleRaw }: { arm: Arm; showRaw: boolean; onToggleRaw: () => void }) {
  if (arm.error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide">Arm failed</span>
        {arm.error}
      </div>
    );
  }
  const body = arm.silent
    ? <em className="text-muted-foreground">(chose to say nothing — a deliberate silence, not an error)</em>
    : <span className="whitespace-pre-wrap">{showRaw ? (arm.raw_reply || arm.reply) : arm.reply}</span>;

  return (
    <div className="space-y-1.5">
      <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Interviewer{showRaw ? ' · raw model text, before enforcement' : ''}
        </span>
        {body}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {!arm.prompt_consulted && <Chip tone="warn"><Zap className="mr-1 inline h-3 w-3" />no prompt used</Chip>}
        {arm.control.mode && <Chip>{arm.control.mode}</Chip>}
        {arm.control.intervention && <Chip>{arm.control.intervention}</Chip>}
        {arm.control.materiality && <Chip>materiality: {arm.control.materiality}</Chip>}
        {arm.control.hint && <Chip>hint {arm.control.hint}</Chip>}
        <Chip><Timer className="mr-1 inline h-3 w-3" />{arm.latency_ms} ms</Chip>
        <Chip><Gauge className="mr-1 inline h-3 w-3" />{arm.metrics.words}w · {arm.metrics.questions}?</Chip>
        {arm.violations.map((v) => (
          <Chip key={v} tone="bad">{VIOLATION_LABEL[v] || v}</Chip>
        ))}
        {arm.enforced && (
          <button onClick={onToggleRaw} className="rounded-md border border-border px-2 py-0.5 text-[11px] font-medium hover:bg-muted">
            <ArrowLeftRight className="mr-1 inline h-3 w-3" />
            {showRaw ? 'show shipped' : 'enforcer rewrote this — show raw'}
          </button>
        )}
      </div>
    </div>
  );
}

function VerdictBar({ turn, onVote, afterReveal }: {
  turn: TurnRow; onVote: (i: number, c: string) => void; afterReveal?: boolean;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Turn {turn.index}
        </span>
        <span className="truncate text-xs italic text-muted-foreground">“{turn.message}”</span>
        {afterReveal && <Chip tone="warn">judged after the reveal — not blind</Chip>}
      </div>

      {!turn.comparable && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{turn.not_comparable_reason} Don’t vote on this one.</span>
        </div>
      )}
      {turn.comparable && turn.replies_identical && (
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Both arms produced identical text on a turn that did use the prompts — a genuine tie.
        </div>
      )}

      {turn.vote ? (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>
              You chose <strong>{turn.vote === 'left' ? 'A' : turn.vote === 'right' ? 'B' : turn.vote}</strong>.
            </span>
            <Chip tone="reveal">A = {turn.reveal?.left.label}</Chip>
            <Chip tone="reveal">B = {turn.reveal?.right.label}</Chip>
            {turn.persisted === false && <Chip tone="warn">not saved</Chip>}
          </div>
          {turn.persisted === false && (
            <p className="text-xs text-amber-900">{turn.persistDetail}</p>
          )}
          {turn.smallN && (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <BarChart3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />{turn.smallN}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Which handled this better?</span>
          {([['left', 'A'], ['right', 'B'], ['tie', 'Tie'], ['both_bad', 'Both bad']] as const).map(([choice, label]) => (
            <button
              key={choice}
              onClick={() => onVote(turn.index, choice)}
              disabled={!turn.comparable}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-40"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
