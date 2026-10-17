'use client';

/**
 * Admin · Interviewer arena. Two modes:
 *
 *  CURRENT vs NEW (default; components/admin/arena/builds-arena.tsx) -- the same case
 *  in two labelled panes, answered by two DEPLOYMENTS: the live backend (main, what
 *  users get) and the candidate backend (the `candidate` branch). Each side runs its
 *  own code end to end, so code fixes are testable before they reach users.
 *
 *  PROMPT SNAPSHOTS (this file, SnapshotArena) -- blind side-by-side of two frozen
 *  prompt-layer VARIANTS inside ONE deployment. Pick a case or guesstimate, drive one
 *  conversation, and both arms answer it independently; vote, then the pairing is
 *  revealed.
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
import {
  AlertTriangle, ArrowLeftRight, BarChart3, Check, ChevronDown, ChevronRight,
  Eye, Flame, Gauge, GitCompare, Loader2, Play, RotateCcw, Send, Swords,
} from 'lucide-react';
import {
  type Arm, type Scenario, type Tier, type TranscriptTurn, type TurnClarification, type ViewMode,
  VIEW_KEY, VIOLATION_LABEL, CandidateBubble, CasePicker, Chip, InterviewerBubble, InterviewerTurn,
  type PickerProps, QuestionsLeft, SystemPill, ThinkingBubble, ViewToggle, useCaseSearch,
} from '@/components/admin/arena/parts';
import BuildsArena from '@/components/admin/arena/builds-arena';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Variant = { id: string; label: string; description: string; origin: string; frozen: boolean; sha256: string | null };
/** One conversation row as the engine reads it. `kind` matters: the opening note is a system_note. */
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

const SIDES = ['left', 'right'] as const;
const SIDE_LABEL: Record<string, string> = { left: 'A', right: 'B' };

type ArenaMode = 'builds' | 'snapshots';
const MODE_KEY = 'mece.arena.mode';

export default function ArenaPage() {
  const [mode, setMode] = useState<ArenaMode>('builds');
  useEffect(() => {
    try {
      const m = window.localStorage.getItem(MODE_KEY);
      if (m === 'builds' || m === 'snapshots') setMode(m);
    } catch { /* storage unavailable: default mode */ }
  }, []);
  const choose = (m: ArenaMode) => {
    setMode(m);
    try { window.localStorage.setItem(MODE_KEY, m); } catch { /* non-critical */ }
  };
  const tabs: { id: ArenaMode; label: string; icon: React.ReactNode }[] = [
    { id: 'builds', label: 'Current vs New', icon: <GitCompare className="h-4 w-4" /> },
    { id: 'snapshots', label: 'Prompt snapshots (blind)', icon: <Eye className="h-4 w-4" /> },
  ];
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Swords className="h-6 w-6" /> Interviewer arena
        </h1>
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1" role="tablist" aria-label="Arena mode">
          {tabs.map((t) => (
            <button
              key={t.id} role="tab" aria-selected={mode === t.id} onClick={() => choose(t.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${mode === t.id
                ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {mode === 'builds' ? (
            <>The same case in two panes: <strong>Current</strong> is the live backend on <code className="font-mono">main</code> (what
            users get), <strong>New</strong> is the candidate backend. Each side runs its own code end to end, so a fix can be
            tested here before it reaches anyone. Send a turn to both, or to one side only.</>
          ) : (
            <>Two frozen prompt layers inside the live backend, blind: you are not told which side is which until you
            vote. Use it to settle a prompt-only question without deploying anything.</>
          )}
        </p>
      </header>
      {mode === 'builds' ? <BuildsArena /> : <SnapshotArena />}
    </div>
  );
}

function SnapshotArena() {
  const [config, setConfig] = useState<Config | null>(null);
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

  // Case picker: the WHOLE library, searched server-side (shared with Current vs New).
  const picker = useCaseSearch(api, !!config && !session);

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
        body: JSON.stringify({ case_id: picker.selected?.id, variant_a: variantA, variant_b: variantB, model_mode: modelMode, teaching_policy: policy, tier }),
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
          picker={picker}
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
