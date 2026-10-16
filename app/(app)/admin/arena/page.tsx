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
 * What each pane shows is what a candidate would receive: the backend runs every arm
 * through the SAME streaming function the live chat uses, opens each session with the
 * same "Case ready" note a real attempt starts with, and spends the clarifying-question
 * quota of the chosen plan the way production does. "User view" renders the panes
 * like the real solve chat; "Diagnostics" adds the decision behind each reply.
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
import { stripSayLabel } from '@/lib/voice/v11-voice';
import {
  AlertTriangle, ArrowLeftRight, BarChart3, Check, ChevronDown, ChevronRight, Cpu,
  Eye, Flame, Gauge, HelpCircle, Loader2, MessageSquare, Play, RotateCcw, Send, Swords,
  Timer, Wrench, Zap,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Variant = { id: string; label: string; description: string; origin: string; frozen: boolean; sha256: string | null };
/** One conversation row as the engine reads it. `kind` matters: the opening note is a system_note. */
type TranscriptTurn = { role: string; content: string; kind?: string };
type Tier = { id: string; quota: number };
type TurnClarification = { counted: number; quota: number; used: number; remaining: number; exhausted_this_turn: boolean };
type Scenario = { id: string; case_type: string; turns: number; new_message: string; transcript: { role: string; content: string }[] };
type CaseRow = {
  id: string; title: string; type: string; difficulty: string | null; market: string | null;
  is_active: boolean | null; unlisted: boolean | null; created_at: string | null;
};
/** One page of the server-side case search (/admin/arena/cases). */
type CasesPage = {
  cases: CaseRow[]; count: number; total: number; offset: number; limit: number;
  has_more: boolean; markets_supported: boolean;
};
type Config = {
  variants: Variant[];
  /** which frozen snapshot the DEPLOYED prompt tree equals, or null mid-edit */
  live_matches: string | null;
  default_arm_a: string; default_arm_b: string;
  model_modes: { id: string; label: string }[]; default_model_mode: string;
  teaching_policies: string[]; seed_scenarios: Scenario[];
  /** the plan the simulated candidate is on: sets the clarifying-question quota (C9) */
  tiers: Tier[]; default_tier: string;
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
  clarification?: TurnClarification;
  vote?: string; reveal?: Reveal; persisted?: boolean; persistDetail?: string; smallN?: string | null;
};
type ResultPair = {
  variants: { id: string; fingerprint: string; wins: number }[];
  votes: number; ties: number; both_bad: number; decided_votes: number;
  verdict: string | null; by_case_type: Record<string, number>;
};
type Results = {
  available: boolean; note: string | null; total_votes: number;
  min_n_for_a_verdict?: number; pairs: ResultPair[];
  self_noise: { votes: number; left: number; right: number; tie: number; both_bad: number; note?: string } | null;
  position: { left: number; right: number; tie: number; both_bad: number; note: string | null } | null;
};
type Session = {
  session_id: string;
  case: { id: string; title: string; type: string; difficulty: string | null; content: string };
  teaching_policy: string; model_mode: string; blinded: boolean; self_noise_run: boolean;
  /** what every real attempt starts with: the "Case ready" system note */
  opening_transcript: TranscriptTurn[];
  clarification: { tier: string; quota: number; used: number; remaining: number };
};

type ViewMode = 'candidate' | 'diagnostics';
const VIEW_KEY = 'mece.arena.view';

// Known case types (the cases.type check constraint). Types found in results are added.
const CASE_TYPES: [string, string][] = [
  ['guesstimate', 'Guesstimates'], ['profitability', 'Profitability'],
  ['market_sizing', 'Market sizing'], ['growth', 'Growth'],
];
const MARKETS: [string, string][] = [['IN', 'India'], ['US', 'US & Europe']];
const CASE_PAGE = 50;

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
  // Case picker: searches the WHOLE library server-side (every case and guesstimate,
  // active or not, listed or unlisted, both markets), newest first, a page at a time.
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [caseQuery, setCaseQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [caseTotal, setCaseTotal] = useState<number | null>(null);
  const [caseHasMore, setCaseHasMore] = useState(false);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [marketsSupported, setMarketsSupported] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseRow | null>(null);
  const caseReq = useRef(0);
  const [variantA, setVariantA] = useState('');
  const [variantB, setVariantB] = useState('');
  const [modelMode, setModelMode] = useState('');
  const [policy, setPolicy] = useState('coached');
  const [seedId, setSeedId] = useState('');
  const [tier, setTier] = useState('free');

  const [session, setSession] = useState<Session | null>(null);
  const [turns, setTurns] = useState<TurnRow[]>([]);
  const [armState, setArmState] = useState<Record<string, { transcript: TranscriptTurn[]; prior_state: Record<string, unknown> | null }>>({
    left: { transcript: [], prior_state: null }, right: { transcript: [], prior_state: null },
  });
  // The conversation both arms START from (opening note + any seeded scenario).
  // Rendered on every turn, not only before the first one.
  const [prefix, setPrefix] = useState<{ turn: TranscriptTurn; seeded: boolean }[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [clar, setClar] = useState<{ quota: number; remaining: number; tier: string } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('candidate');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState<Record<string, boolean>>({});
  const [briefOpen, setBriefOpen] = useState(true);
  const [results, setResults] = useState<Results | null>(null);
  const [resultsOpen, setResultsOpen] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  // A per-viewer convenience only: which view you last used.
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(VIEW_KEY);
      if (v === 'candidate' || v === 'diagnostics') setViewMode(v);
    } catch { /* storage unavailable: default view */ }
  }, []);
  const chooseView = (v: ViewMode) => {
    setViewMode(v);
    try { window.localStorage.setItem(VIEW_KEY, v); } catch { /* non-critical */ }
  };

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
        if (cfg.default_tier) setTier(cfg.default_tier);
        setResults(await api('/results') as Results);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load the arena');
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns.length]);

  // One page of the server-side search. A request counter drops responses that come
  // back after a newer search was typed, so the list never shows a stale query.
  const loadCases = useCallback(async (offset: number) => {
    const req = ++caseReq.current;
    setCasesLoading(true); setCasesError(null);
    const qs = new URLSearchParams({ limit: String(CASE_PAGE), offset: String(offset) });
    if (caseQuery.trim()) qs.set('q', caseQuery.trim());
    if (typeFilter !== 'all') qs.set('case_type', typeFilter);
    if (marketFilter !== 'all') qs.set('market', marketFilter);
    try {
      const page = await api(`/cases?${qs.toString()}`) as CasesPage;
      if (req !== caseReq.current) return;
      setCases((prev) => (offset === 0 ? page.cases : [...prev, ...page.cases]));
      setCaseTotal(page.total);
      setCaseHasMore(page.has_more);
      setMarketsSupported(page.markets_supported !== false);
    } catch (e) {
      if (req !== caseReq.current) return;
      setCasesError(e instanceof Error ? e.message : 'Could not search cases');
    } finally {
      if (req === caseReq.current) setCasesLoading(false);
    }
  }, [api, caseQuery, typeFilter, marketFilter]);

  useEffect(() => {
    if (!config || session) return;
    const t = setTimeout(() => { loadCases(0); }, 250);
    return () => clearTimeout(t);
  }, [config, session, loadCases]);

  const caseTypes = useMemo(() => {
    const known = new Map(CASE_TYPES);
    for (const c of cases) if (c.type && !known.has(c.type)) known.set(c.type, c.type);
    return Array.from(known.entries());
  }, [cases]);

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
        body: JSON.stringify({ case_id: selectedCase?.id, variant_a: variantA, variant_b: variantB, model_mode: modelMode, teaching_policy: policy, tier }),
      }) as Session;
      setSession(s);
      setTurns([]);
      // Every real attempt opens with the "Case ready" system note, and the engine
      // reads it on every turn -- so both arms start with it. A seeded scenario then
      // adds the identical prior conversation, so the first compared turn is the hard
      // moment rather than turn one of small talk.
      const opening = (s.opening_transcript || []).map((t) => ({ ...t }));
      const seeded: TranscriptTurn[] = seed
        ? seed.transcript.map((t) => ({ role: t.role, content: t.content, kind: 'text' }))
        : [];
      const pre = [...opening, ...seeded];
      setPrefix([
        ...opening.map((turn) => ({ turn, seeded: false })),
        ...seeded.map((turn) => ({ turn, seeded: true })),
      ]);
      setArmState({ left: { transcript: [...pre], prior_state: null }, right: { transcript: [...pre], prior_state: null } });
      setClar(s.clarification ? { quota: s.clarification.quota, remaining: s.clarification.remaining, tier: s.clarification.tier } : null);
      setMessage(seed?.new_message || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the session');
    } finally { setBusy(false); }
  };

  const send = async () => {
    if (!session || !message.trim() || busy) return;
    const msg = message.trim();
    setError(null); setBusy(true);
    // Show the candidate's turn straight away, the way the real chat does, while
    // both interviewers think.
    setPending(msg);
    setMessage('');
    try {
      const res = await api('/turn', {
        method: 'POST',
        body: JSON.stringify({
          session_id: session.session_id,
          message: msg,
          left: armState.left,
          right: armState.right,
        }),
      }) as { turn_index: number; left: Arm; right: Arm; comparable: boolean; not_comparable_reason: string | null; replies_identical: boolean; clarification?: TurnClarification };
      setTurns((t) => [...t, {
        index: res.turn_index, message: msg, left: res.left, right: res.right,
        comparable: res.comparable, not_comparable_reason: res.not_comparable_reason,
        replies_identical: res.replies_identical, clarification: res.clarification,
      }]);
      if (res.clarification) {
        setClar((c) => ({ quota: res.clarification!.quota, remaining: res.clarification!.remaining, tier: c?.tier || tier }));
      }
      // The arms DIVERGE from here: each keeps its own transcript and its own state.
      setArmState((prev) => {
        const next = { ...prev };
        for (const side of SIDES) {
          const arm = res[side];
          const t: TranscriptTurn[] = [...prev[side].transcript, { role: 'user', content: msg, kind: 'text' }];
          // Same rule as production: a silence writes no assistant row.
          if (arm.reply && !arm.silent) t.push({ role: 'assistant', content: arm.reply, kind: 'text' });
          next[side] = { transcript: t, prior_state: arm.next_state ?? prev[side].prior_state };
        }
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Turn failed');
      setMessage(msg);  // give the turn back so it can be resent
    } finally { setBusy(false); setPending(null); }
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
      try { setResults(await api('/results') as Results); } catch { /* tally is non-critical */ }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not record the vote');
    }
  };

  const reset = () => {
    setSession(null); setTurns([]); setMessage(''); setError(null);
    setPrefix([]); setPending(null); setClar(null);
  };

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
          Pick any case or guesstimate and put the interviewer on <code className="font-mono">main</code> next
          to a branch build, turn by turn. Each pane shows exactly what a candidate would receive from that
          build. You will not be told which side is which until you vote — knowing which one is “the new
          build” is enough to decide the answer.
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

      {results && <ResultsPanel results={results} open={resultsOpen} onToggle={() => setResultsOpen((o) => !o)} />}

      {!session ? (
        <SetupCard
          config={config}
          picker={{
            query: caseQuery, setQuery: setCaseQuery,
            type: typeFilter, setType: setTypeFilter, types: caseTypes,
            market: marketFilter, setMarket: setMarketFilter, marketsSupported,
            cases, total: caseTotal, hasMore: caseHasMore, loading: casesLoading, error: casesError,
            onMore: () => loadCases(cases.length),
            selected: selectedCase, onSelect: setSelectedCase,
          }}
          variantA={variantA} setVariantA={setVariantA}
          variantB={variantB} setVariantB={setVariantB}
          modelMode={modelMode} setModelMode={setModelMode}
          policy={policy} setPolicy={setPolicy}
          seedId={seedId} setSeedId={setSeedId}
          tier={tier} setTier={setTier}
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
            {clar && <QuestionsLeft remaining={clar.remaining} quota={clar.quota} tier={clar.tier} />}
            <div className="ml-auto flex items-center gap-2">
              <ViewToggle value={viewMode} onChange={chooseView} />
              <button onClick={reset} aria-label="New session" title="New session"
                className="flex items-center gap-1 whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
                <RotateCcw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">New session</span>
              </button>
            </div>
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
                <ArmThread
                  side={side}
                  prefix={prefix}
                  turns={turns}
                  pending={pending}
                  viewMode={viewMode}
                  showRaw={showRaw}
                  onToggleRaw={(key) => setShowRaw((s) => ({ ...s, [key]: !s[key] }))}
                />
              </div>
            ))}
          </div>

          {turns.map((turn) => (
            <VerdictBar
              key={`v-${turn.index}`}
              turn={turn}
              onVote={vote}
              afterReveal={firstRevealedTurn !== null && turn.index > firstRevealedTurn}
              clarQuota={clar?.quota ?? null}
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
                className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-foreground px-4 text-sm font-medium text-background disabled:opacity-50"
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
  config: Config | null;
  picker: PickerProps;
  variantA: string; setVariantA: (v: string) => void;
  variantB: string; setVariantB: (v: string) => void;
  modelMode: string; setModelMode: (v: string) => void;
  policy: string; setPolicy: (v: string) => void;
  seedId: string; setSeedId: (v: string) => void;
  tier: string; setTier: (v: string) => void;
  seed: Scenario | null; busy: boolean; onStart: () => void;
}) {
  const { config } = p;
  if (!config) return null;
  const sameVariant = p.variantA === p.variantB;
  const variantMeta = (id: string) => config.variants.find((v) => v.id === id);
  const liveLabel = config.live_matches
    ? variantMeta(config.live_matches)?.label ?? config.live_matches
    : null;

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      {/* Which arm is production. Without this you can spend an evening comparing
          two candidates and never notice neither of them is what users get. */}
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
        <Gauge className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {liveLabel ? (
          <span>
            On this deployment the interviewer your users get right now is{' '}
            <strong>{liveLabel}</strong> (<code className="font-mono">{config.live_matches}</code>).
            Put it on one arm and you are measuring a candidate against production.
          </span>
        ) : (
          <span>
            The deployed prompt tree does not match any frozen snapshot — it is mid-edit, or a
            stack nobody has snapshotted. Neither arm is production, so treat the result as
            candidate-vs-candidate only.
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <CasePicker {...p.picker} />
        </div>

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Teaching policy</span>
          <select value={p.policy} onChange={(e) => p.setPolicy(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm">
            {config.teaching_policies.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Candidate&rsquo;s plan</span>
          <select value={p.tier} onChange={(e) => p.setTier(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm">
            {(config.tiers || []).map((t) => (
              <option key={t.id} value={t.id}>{t.id} · {t.quota} clarifying questions</option>
            ))}
          </select>
          <span className="block text-xs text-muted-foreground">
            Spent the way the live chat spends it. Once it runs out the interviewer is told to
            decline further questions — worth testing on purpose.
          </span>
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
        disabled={!p.picker.selected || p.busy}
        className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {p.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Start blind session
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ case picker */

type PickerProps = {
  query: string; setQuery: (v: string) => void;
  type: string; setType: (v: string) => void; types: [string, string][];
  market: string; setMarket: (v: string) => void; marketsSupported: boolean;
  cases: CaseRow[]; total: number | null; hasMore: boolean; loading: boolean; error: string | null;
  onMore: () => void; selected: CaseRow | null; onSelect: (c: CaseRow) => void;
};

const TYPE_LABEL: Record<string, string> = Object.fromEntries(CASE_TYPES);
const MARKET_LABEL: Record<string, string> = Object.fromEntries(MARKETS);

function shortDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CasePicker(p: PickerProps) {
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

/* The four renderers below mirror components/solve/ConversationalSolve.tsx
   (MessageBubble, renderWithBold, the "thinking" row, ClarificationCounter) so a pane
   reads like the real solve chat. Keep them in step if that file's look changes. */

function renderWithBold(text: string) {
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

function SystemPill({ text }: { text: string }) {
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

function CandidateBubble({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <div className={`flex justify-end ${muted ? 'opacity-60' : ''}`}>
      <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-body text-primary-foreground">
        {text}
      </div>
    </div>
  );
}

function InterviewerBubble({ text, muted, note }: { text: string; muted?: boolean; note?: string }) {
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

function ThinkingBubble() {
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

function QuestionsLeft({ remaining, quota, tier }: { remaining: number; quota: number; tier: string }) {
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

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
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

function ArmThread({ side, prefix, turns, pending, viewMode, showRaw, onToggleRaw }: {
  side: 'left' | 'right';
  prefix: { turn: TranscriptTurn; seeded: boolean }[];
  turns: TurnRow[];
  pending: string | null;
  viewMode: ViewMode;
  showRaw: Record<string, boolean>;
  onToggleRaw: (key: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns.length, pending, viewMode]);
  const firstSeeded = prefix.findIndex((p) => p.seeded);

  return (
    <div ref={scrollRef} className="h-[34rem] space-y-4 overflow-y-auto px-4 py-4">
      {prefix.map(({ turn, seeded }, i) => (
        <div key={`pre-${i}`} className="space-y-2">
          {i === firstSeeded && (
            <p className="text-center text-[11px] uppercase tracking-wide text-muted-foreground">
              Seeded conversation · both arms start here
            </p>
          )}
          {turn.role === 'system'
            ? <SystemPill text={turn.content} />
            : turn.role === 'user'
              ? <CandidateBubble text={turn.content} muted={seeded} />
              : <InterviewerBubble text={turn.content} muted={seeded} />}
        </div>
      ))}

      {turns.length === 0 && !pending && (
        <p className="text-center text-xs text-muted-foreground">Send the candidate&rsquo;s first turn below.</p>
      )}

      {turns.map((turn) => {
        const key = `${side}-${turn.index}`;
        return (
          <div key={key} className="space-y-3">
            <CandidateBubble text={turn.message} />
            <InterviewerTurn
              arm={turn[side]}
              viewMode={viewMode}
              showRaw={!!showRaw[key]}
              onToggleRaw={() => onToggleRaw(key)}
            />
          </div>
        );
      })}

      {pending && (
        <div className="space-y-3">
          <CandidateBubble text={pending} />
          <ThinkingBubble />
        </div>
      )}
    </div>
  );
}

function InterviewerTurn({ arm, viewMode, showRaw, onToggleRaw }: {
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

function VerdictBar({ turn, onVote, afterReveal, clarQuota }: {
  turn: TurnRow; onVote: (i: number, c: string) => void; afterReveal?: boolean; clarQuota?: number | null;
}) {
  const flags = (arm: Arm) => (arm.error ? ['arm failed'] : arm.violations.map((v) => VIOLATION_LABEL[v] || v));
  const c = turn.clarification;
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Turn {turn.index}
        </span>
        <span className="truncate text-xs italic text-muted-foreground">“{turn.message}”</span>
        {afterReveal && <Chip tone="warn">judged after the reveal — not blind</Chip>}
        {c && c.counted > 0 && !c.exhausted_this_turn && (
          <Chip>used {c.counted} of {clarQuota ?? c.quota} questions · {c.remaining} left</Chip>
        )}
        {c?.exhausted_this_turn && (
          <Chip tone="warn">out of questions — both interviewers were told to decline</Chip>
        )}
      </div>

      {(flags(turn.left).length > 0 || flags(turn.right).length > 0) && (
        <p className="text-xs text-muted-foreground">
          Guardrail flags — A: {flags(turn.left).join(', ') || 'none'} · B: {flags(turn.right).join(', ') || 'none'}
        </p>
      )}

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

function ResultsPanel({ results, open, onToggle }: { results: Results; open: boolean; onToggle: () => void }) {
  if (!results.available) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        <BarChart3 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{results.note}</span>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-card">
      <button onClick={onToggle} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium">
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <BarChart3 className="h-4 w-4" />
        Recorded votes
        <Chip>{results.total_votes} total</Chip>
        {results.pairs.length > 0 && <Chip>{results.pairs.length} pairing{results.pairs.length > 1 ? 's' : ''}</Chip>}
      </button>

      {open && (
        <div className="space-y-4 border-t border-border px-4 py-4">
          {results.pairs.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No head-to-head votes yet. (Self-noise runs are tracked separately and never counted as wins.)
            </p>
          )}

          {results.pairs.map((pair, i) => {
            const total = Math.max(1, pair.decided_votes);
            return (
              <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                <div className="space-y-1.5">
                  {pair.variants.map((v) => (
                    <div key={v.id + v.fingerprint} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium">{v.id}</span>
                        <span className="text-muted-foreground">
                          {v.wins} win{v.wins === 1 ? '' : 's'} · <span className="font-mono">{v.fingerprint}</span>
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-foreground" style={{ width: `${(v.wins / total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Chip>{pair.decided_votes} decided</Chip>
                  {pair.ties > 0 && <Chip>{pair.ties} tie{pair.ties > 1 ? 's' : ''}</Chip>}
                  {pair.both_bad > 0 && <Chip>{pair.both_bad} both-bad</Chip>}
                  {Object.entries(pair.by_case_type).map(([ct, n]) => <Chip key={ct}>{ct}: {n}</Chip>)}
                </div>
                {pair.verdict && (
                  <p className={`text-xs ${pair.verdict.includes('Too few') || pair.verdict.includes('noise floor')
                    ? 'text-amber-900' : 'text-foreground'}`}>
                    {pair.verdict}
                  </p>
                )}
              </div>
            );
          })}

          {results.self_noise && results.self_noise.votes > 0 && (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
              <p className="mb-1 flex items-center gap-1.5 font-medium">
                <Flame className="h-3.5 w-3.5" /> Your noise floor
              </p>
              <p className="text-muted-foreground">
                {results.self_noise.votes} vote(s) on identical arms — {results.self_noise.left} left,{' '}
                {results.self_noise.right} right, {results.self_noise.tie} tie, {results.self_noise.both_bad} both-bad.
                These are never counted as wins.
              </p>
              {results.self_noise.note && <p className="mt-1">{results.self_noise.note}</p>}
            </div>
          )}

          {results.position?.note && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <ArrowLeftRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{results.position.note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
