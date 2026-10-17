'use client';

/**
 * Admin · Interviewer arena · CURRENT vs NEW.
 *
 * One case, two labelled panes, two DEPLOYMENTS: Current is the live backend (main --
 * what users get), New is the candidate backend (the `candidate` branch, a second
 * Render service). Each pane calls /admin/arena/arm-turn on its OWN backend, so each
 * side runs its own code end to end -- prompts, signals, decision logic, voice path.
 *
 * Each pane is its own conversation: "Send to both" gives both the same turn; the box
 * under a pane talks to that side only. The page holds each pane's transcript,
 * learner state and question count (the endpoint is stateless), so a sleeping
 * free-tier service waking up loses nothing.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, ClipboardCopy, Loader2, Play,
  RefreshCw, RotateCcw, Send, ServerCog,
} from 'lucide-react';
import {
  type Arm, type Scenario, type Tier, type TranscriptTurn, type TurnClarification, type ViewMode,
  CURRENT_API_URL, VIEW_KEY, VIOLATION_LABEL, arenaFetch, CandidateBubble, CasePicker, Chip,
  InterviewerBubble, InterviewerTurn, QuestionsLeft, SystemPill, ThinkingBubble, ViewToggle, useCaseSearch,
} from './parts';
import AdversarialCheck from './adversarial-check';

export type Build = {
  commit: string; branch: string; service: string; role: string;
  prompt_layer: string | null; started_at: string;
};
type BuildStatus = { state: 'idle' | 'waking' | 'ok' | 'error'; build?: Build; error?: string; ms?: number };
type Config = {
  model_modes: { id: string; label: string }[]; default_model_mode: string;
  teaching_policies: string[]; tiers: Tier[]; default_tier: string;
  seed_scenarios: Scenario[]; build: Build; candidate_url: string | null;
  limits: { max_transcript_turns: number; max_message_chars: number };
};
type CaseDetail = { id: string; title: string; type: string; difficulty: string | null; content: string };
export type Side = 'current' | 'new';
type Channel = 'text' | 'voice';
type PaneItem =
  | { kind: 'candidate'; text: string; to: 'both' | 'one' }
  | { kind: 'reply'; arm: Arm; build: Build; clar: TurnClarification; channel: string; id: number }
  | { kind: 'error'; text: string };
type Pane = {
  items: PaneItem[]; transcript: TranscriptTurn[]; prior: Record<string, unknown> | null;
  clarUsed: number; pending: boolean;
};
type Session = {
  caseDetail: CaseDetail; channel: Channel; tier: string; quota: number;
  modelMode: string; policy: string; seed: Scenario | null;
};

const SIDES: Side[] = ['current', 'new'];
const SIDE_TITLE: Record<Side, string> = { current: 'Current', new: 'New' };
const SIDE_SUB: Record<Side, string> = { current: 'live backend · what users get', new: 'candidate build' };
const CAND_KEY = 'mece.arena.candidateUrl';
const ENV_CANDIDATE = process.env.NEXT_PUBLIC_ARENA_CANDIDATE_URL || '';
let replySeq = 0;

const emptyPane = (pre: TranscriptTurn[]): Pane => ({ items: [], transcript: [...pre], prior: null, clarUsed: 0, pending: false });
const clean = (u: string) => u.trim().replace(/\/+$/, '');

export default function BuildsArena() {
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [candUrl, setCandUrl] = useState('');
  const [candDraft, setCandDraft] = useState('');
  const [status, setStatus] = useState<Record<Side, BuildStatus>>({ current: { state: 'idle' }, new: { state: 'idle' } });

  const [modelMode, setModelMode] = useState('');
  const [policy, setPolicy] = useState('coached');
  const [tier, setTier] = useState('free');
  const [channel, setChannel] = useState<Channel>('text');
  const [seedId, setSeedId] = useState('');
  const [starting, setStarting] = useState(false);

  const [session, setSession] = useState<Session | null>(null);
  const [prefix, setPrefix] = useState<{ turn: TranscriptTurn; seeded: boolean }[]>([]);
  const [panes, setPanes] = useState<Record<Side, Pane>>({ current: emptyPane([]), new: emptyPane([]) });
  const panesRef = useRef(panes);
  useEffect(() => { panesRef.current = panes; }, [panes]);
  const [message, setMessage] = useState('');
  const [solo, setSolo] = useState<Record<Side, string>>({ current: '', new: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('candidate');
  const [showRaw, setShowRaw] = useState<Record<string, boolean>>({});
  const [briefOpen, setBriefOpen] = useState(true);
  const [copyText, setCopyText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const urlOf = useCallback((side: Side) => (side === 'current' ? CURRENT_API_URL : candUrl), [candUrl]);
  const currentApi = useCallback((path: string, init?: RequestInit) => arenaFetch(CURRENT_API_URL, path, init), []);
  const picker = useCaseSearch(currentApi, !!config && !session);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(VIEW_KEY);
      if (v === 'candidate' || v === 'diagnostics') setViewMode(v);
    } catch { /* default view */ }
  }, []);
  const chooseView = (v: ViewMode) => {
    setViewMode(v);
    try { window.localStorage.setItem(VIEW_KEY, v); } catch { /* non-critical */ }
  };

  const checkBuild = useCallback(async (side: Side, url: string) => {
    if (!url) { setStatus((s) => ({ ...s, [side]: { state: 'error', error: 'No address set for this build yet.' } })); return; }
    setStatus((s) => ({ ...s, [side]: { state: 'waking' } }));
    const t0 = performance.now();
    try {
      // /health is public and wakes a sleeping free-tier service (can take about a minute).
      await fetch(`${clean(url)}/health`, { cache: 'no-store' }).catch(() => undefined);
      const r = await arenaFetch(url, '/build', undefined, 100000) as { build: Build };
      setStatus((s) => ({ ...s, [side]: { state: 'ok', build: r.build, ms: Math.round(performance.now() - t0) } }));
    } catch (e) {
      const err = e as Error & { status?: number };
      const msg = err.status === 404
        ? 'This backend answers but has no arena endpoints: it is running older code. Push or redeploy it.'
        : err.status === 401 || err.status === 403
          ? 'This backend refused the admin sign-in. It must use the same Supabase project as the live site.'
          : err.message;
      setStatus((s) => ({ ...s, [side]: { state: 'error', error: msg } }));
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await currentApi('/config') as Config;
        setConfig(cfg);
        setModelMode(cfg.default_model_mode);
        if (cfg.default_tier) setTier(cfg.default_tier);
        let saved = '';
        try { saved = window.localStorage.getItem(CAND_KEY) || ''; } catch { /* none */ }
        const initial = clean(saved || ENV_CANDIDATE || cfg.candidate_url || '');
        setCandUrl(initial); setCandDraft(initial);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load the arena from the live backend');
      }
    })();
    checkBuild('current', CURRENT_API_URL);
  }, [currentApi, checkBuild]);

  useEffect(() => { if (candUrl) checkBuild('new', candUrl); }, [candUrl, checkBuild]);

  const saveCandidate = () => {
    const u = clean(candDraft);
    try { window.localStorage.setItem(CAND_KEY, u); } catch { /* per-browser convenience only */ }
    if (u === candUrl) checkBuild('new', u); else setCandUrl(u);
  };

  const seed = useMemo(() => config?.seed_scenarios.find((s) => s.id === seedId) || null, [config, seedId]);
  const sameCommit = status.current.build && status.new.build && status.current.build.commit === status.new.build.commit;
  const bothReady = status.current.state === 'ok' && status.new.state === 'ok';

  const start = async () => {
    const c = picker.selected;
    if (!c || !config) return;
    setStarting(true); setError(null);
    try {
      const r = await currentApi(`/case?case_id=${encodeURIComponent(c.id)}`) as { case: CaseDetail; opening_transcript: TranscriptTurn[] };
      const opening = (r.opening_transcript || []).map((t) => ({ ...t }));
      const seeded: TranscriptTurn[] = seed ? seed.transcript.map((t) => ({ role: t.role, content: t.content, kind: 'text' })) : [];
      const pre = [...opening, ...seeded];
      setPrefix([...opening.map((turn) => ({ turn, seeded: false })), ...seeded.map((turn) => ({ turn, seeded: true }))]);
      setPanes({ current: emptyPane(pre), new: emptyPane(pre) });
      const quota = config.tiers.find((t) => t.id === tier)?.quota ?? 7;
      setSession({ caseDetail: r.case, channel, tier, quota, modelMode, policy, seed });
      setMessage(seed?.new_message || '');
      setSolo({ current: '', new: '' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open the case');
    } finally { setStarting(false); }
  };

  const runSide = async (side: Side, msg: string, s: Session) => {
    const pane = panesRef.current[side];
    const body = {
      message: msg, case_id: s.caseDetail.id, transcript: pane.transcript, prior_state: pane.prior,
      model_mode: s.modelMode, teaching_policy: s.policy, channel: s.channel, tier: s.tier, clar_used: pane.clarUsed,
    };
    try {
      const r = await arenaFetch(urlOf(side), '/arm-turn', { method: 'POST', body: JSON.stringify(body) }, 150000) as {
        build: Build; arm: Arm; clarification: TurnClarification; channel: string;
      };
      setPanes((p) => {
        const cur = p[side];
        // Same rule as production: the candidate's turn is stored; a silence writes no reply row.
        const t: TranscriptTurn[] = [...cur.transcript, { role: 'user', content: msg, kind: s.channel === 'voice' ? 'voice' : 'text' }];
        if (r.arm.reply && !r.arm.silent) t.push({ role: 'assistant', content: r.arm.reply, kind: 'text' });
        return {
          ...p,
          [side]: {
            ...cur,
            items: [...cur.items, { kind: 'reply', arm: r.arm, build: r.build, clar: r.clarification, channel: r.channel, id: ++replySeq }],
            transcript: t,
            prior: r.arm.next_state ?? cur.prior,
            clarUsed: r.clarification.used,
            pending: false,
          },
        };
      });
    } catch (e) {
      setPanes((p) => ({
        ...p,
        [side]: { ...p[side], items: [...p[side].items, { kind: 'error', text: (e as Error).message }], pending: false },
      }));
    }
  };

  const sendTo = (sides: Side[], text: string) => {
    const msg = text.trim();
    if (!msg || !session) return;
    const to = sides.length === 2 ? 'both' : 'one';
    setPanes((p) => {
      const next = { ...p };
      for (const side of sides) {
        next[side] = { ...p[side], items: [...p[side].items, { kind: 'candidate', text: msg, to }], pending: true };
      }
      return next;
    });
    for (const side of sides) void runSide(side, msg, session);
  };

  const sendBoth = () => { if (canSend(SIDES)) { sendTo(SIDES, message); setMessage(''); } };
  const sendSolo = (side: Side) => { if (canSend([side])) { sendTo([side], solo[side]); setSolo((s) => ({ ...s, [side]: '' })); } };
  function canSend(sides: Side[]) { return !!session && sides.every((s) => !panes[s].pending && !!urlOf(s)); }

  const reset = () => {
    setSession(null); setPrefix([]); setPanes({ current: emptyPane([]), new: emptyPane([]) });
    setMessage(''); setSolo({ current: '', new: '' }); setError(null);
  };

  const transcriptForClaude = () => {
    if (!session) return '';
    const b = (side: Side) => {
      const x = status[side].build;
      return x ? `${x.branch} @ ${x.commit} (${x.service})` : urlOf(side) || '(not set)';
    };
    const out: string[] = [
      `ARENA — ${session.caseDetail.title} (${session.caseDetail.type})`,
      `channel: ${session.channel === 'voice' ? 'voice path' : 'chat'} · plan: ${session.tier} · model: ${session.modelMode} · policy: ${session.policy}`,
      `Current: ${b('current')}`, `New: ${b('new')}`,
    ];
    for (const side of SIDES) {
      out.push('', `===== ${SIDE_TITLE[side].toUpperCase()} =====`);
      for (const p of prefix) out.push(`[${p.seeded ? 'seeded ' : ''}${p.turn.role}] ${p.turn.content}`);
      for (const it of panes[side].items) {
        if (it.kind === 'candidate') out.push(`CANDIDATE${it.to === 'one' ? ' (this side only)' : ''}: ${it.text}`);
        else if (it.kind === 'error') out.push(`ERROR: ${it.text}`);
        else {
          const a = it.arm;
          const said = a.error ? `[arm failed: ${a.error}]` : a.silent ? '[silent — no reply shown]' : a.reply;
          const meta = [a.control.function, a.voice?.lane, ...a.violations.map((v) => `FLAG ${VIOLATION_LABEL[v] || v}`),
            it.clar.exhausted_this_turn ? 'out of questions' : null, `${a.latency_ms}ms`].filter(Boolean).join(' · ');
          out.push(`INTERVIEWER: ${said}`, `   (${meta})`);
          if (a.enforced && a.raw_reply) out.push(`   raw model text: ${a.raw_reply}`);
        }
      }
    }
    return out.join('\n');
  };

  const copyForClaude = async () => {
    const text = transcriptForClaude();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyText(text);  // clipboard blocked: show it to copy by hand
    }
  };

  if (!config && !error) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="space-y-5">
      {error && <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <BuildsCard
        status={status} currentUrl={CURRENT_API_URL} candUrl={candUrl} candDraft={candDraft}
        setCandDraft={setCandDraft} onSave={saveCandidate} onRecheck={(side) => checkBuild(side, urlOf(side))}
        sameCommit={!!sameCommit}
      />

      {!session ? (
        <div className="space-y-5 rounded-xl border border-border bg-card p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2"><CasePicker {...picker} /></div>
            <div className="space-y-4">
              <Field label="Talk to them by">
                <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label="Channel">
                  {([['text', 'Chat'], ['voice', 'Voice path']] as const).map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setChannel(id)} aria-pressed={channel === id}
                      className={`flex-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${channel === id ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <span className="block text-xs text-muted-foreground">
                  {channel === 'voice'
                    ? 'You type; each build answers through its voice route, so you read what a voice session would say.'
                    : 'Exactly what the live chat sends.'}
                </span>
              </Field>
              <Field label="Model (both)">
                <select value={modelMode} onChange={(e) => setModelMode(e.target.value)} className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm">
                  {config?.model_modes.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </Field>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Teaching policy">
              <select value={policy} onChange={(e) => setPolicy(e.target.value)} className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm">
                {config?.teaching_policies.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Candidate's plan">
              <select value={tier} onChange={(e) => setTier(e.target.value)} className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm">
                {config?.tiers.map((t) => <option key={t.id} value={t.id}>{t.id} · {t.quota} clarifying questions</option>)}
              </select>
            </Field>
            <Field label="Start from a hard moment (optional)">
              <select value={seedId} onChange={(e) => setSeedId(e.target.value)} className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm">
                <option value="">Start from turn one</option>
                {config?.seed_scenarios.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.case_type}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={start} disabled={!picker.selected || starting}
              className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50">
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Open in both
            </button>
            {!bothReady && (
              <span className="text-xs text-muted-foreground">
                {status.new.state !== 'ok' ? 'The New build is not reachable yet — you can still open the case and use Current.' : ''}
              </span>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4">
            <span className="text-sm font-medium">{session.caseDetail.title}</span>
            <Chip>{session.caseDetail.type}</Chip>
            {session.caseDetail.difficulty && <Chip>{session.caseDetail.difficulty}</Chip>}
            <Chip>{session.channel === 'voice' ? 'voice path' : 'chat'}</Chip>
            <Chip>{session.policy}</Chip>
            <Chip>{session.modelMode}</Chip>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <ViewToggle value={viewMode} onChange={chooseView} />
              <button onClick={copyForClaude} title="Copy both conversations, with what each build decided, to paste to Claude"
                className="flex items-center gap-1 whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy for Claude'}</span>
              </button>
              <button onClick={reset} aria-label="New session" title="New session"
                className="flex items-center gap-1 whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
                <RotateCcw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">New session</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <button onClick={() => setBriefOpen((o) => !o)} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium">
              {briefOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />} The brief the candidate sees
            </button>
            {briefOpen && (
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap border-t border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                {session.caseDetail.content}
              </pre>
            )}
          </div>

          {sameCommit && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Both panes are running the same commit ({status.current.build?.commit}). Any difference you see is the model&rsquo;s randomness, not a change.</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {SIDES.map((side) => (
              <div key={side} className="flex flex-col rounded-xl border border-border bg-card">
                <PaneHeader side={side} status={status[side]} quota={session.quota} used={panes[side].clarUsed} tier={session.tier} />
                <PaneThread
                  side={side} prefix={prefix} pane={panes[side]} viewMode={viewMode}
                  showRaw={showRaw} onToggleRaw={(k) => setShowRaw((s) => ({ ...s, [k]: !s[k] }))}
                />
                <div className="flex items-center gap-2 border-t border-border p-2">
                  <input
                    value={solo[side]} onChange={(e) => setSolo((s) => ({ ...s, [side]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendSolo(side); } }}
                    placeholder={`Message ${SIDE_TITLE[side]} only…`} aria-label={`Message ${SIDE_TITLE[side]} only`}
                    maxLength={config?.limits.max_message_chars ?? 4000}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                  />
                  <button onClick={() => sendSolo(side)} disabled={!solo[side].trim() || !canSend([side])}
                    className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40">
                    <Send className="h-3.5 w-3.5" /> {SIDE_TITLE[side]} only
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-4 rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="flex items-end gap-2">
              <textarea
                value={message} onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendBoth(); } }}
                rows={2} maxLength={config?.limits.max_message_chars ?? 4000}
                placeholder="The candidate's turn, sent to both builds. ⌘/Ctrl+Enter to send."
                className="min-h-[3rem] w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <button onClick={sendBoth} disabled={!message.trim() || !canSend(SIDES)}
                className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-foreground px-4 text-sm font-medium text-background disabled:opacity-50">
                {SIDES.some((s) => panes[s].pending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send to both
              </button>
            </div>
          </div>
        </>
      )}

      {config && (
        <AdversarialCheck
          currentUrl={CURRENT_API_URL} newUrl={candUrl} seeds={config.seed_scenarios}
          modelModes={config.model_modes} defaultModelMode={config.default_model_mode}
          builds={{ current: status.current.build, new: status.new.build }}
          ready={bothReady}
        />
      )}

      {copyText !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setCopyText(null)}>
          <div className="w-full max-w-2xl space-y-2 rounded-xl bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium">Copy this and paste it to Claude</p>
            <textarea readOnly value={copyText} rows={16} className="w-full rounded-lg border border-border bg-background p-2 font-mono text-xs"
              onFocus={(e) => e.currentTarget.select()} autoFocus />
            <button onClick={() => setCopyText(null)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ pieces */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function BuildBadge({ s }: { s: BuildStatus }) {
  if (s.state === 'ok' && s.build) {
    return (
      <span className="inline-flex items-center gap-1 text-xs">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        <code className="font-mono">{s.build.branch} @ {s.build.commit.slice(0, 7)}</code>
        <span className="text-muted-foreground">· {s.build.service}</span>
      </span>
    );
  }
  if (s.state === 'waking') {
    return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> waking up (a sleeping service takes up to a minute)…</span>;
  }
  if (s.state === 'error') {
    return <span className="inline-flex items-start gap-1 text-xs text-red-700"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {s.error}</span>;
  }
  return <span className="text-xs text-muted-foreground">not checked</span>;
}

function BuildsCard({ status, currentUrl, candUrl, candDraft, setCandDraft, onSave, onRecheck, sameCommit }: {
  status: Record<Side, BuildStatus>; currentUrl: string; candUrl: string; candDraft: string;
  setCandDraft: (v: string) => void; onSave: () => void; onRecheck: (side: Side) => void; sameCommit: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="space-y-1.5 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <ServerCog className="h-4 w-4" /><span className="text-sm font-semibold">Current</span>
          <span className="text-xs text-muted-foreground">live backend · what users get</span>
          <button onClick={() => onRecheck('current')} title="Check again" className="ml-auto rounded p-1 hover:bg-muted"><RefreshCw className="h-3.5 w-3.5" /></button>
        </div>
        <p className="truncate font-mono text-[11px] text-muted-foreground">{currentUrl}</p>
        <BuildBadge s={status.current} />
      </div>
      <div className="space-y-1.5 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <ServerCog className="h-4 w-4" /><span className="text-sm font-semibold">New</span>
          <span className="text-xs text-muted-foreground">candidate build</span>
          {candUrl && <button onClick={() => onRecheck('new')} title="Check again" className="ml-auto rounded p-1 hover:bg-muted"><RefreshCw className="h-3.5 w-3.5" /></button>}
        </div>
        <div className="flex gap-2">
          <input value={candDraft} onChange={(e) => setCandDraft(e.target.value)} placeholder="https://consilio-backend-candidate.onrender.com"
            aria-label="New build address" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1 font-mono text-[11px]"
            onKeyDown={(e) => { if (e.key === 'Enter') onSave(); }} />
          <button onClick={onSave} className="shrink-0 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-muted">Save &amp; check</button>
        </div>
        {candUrl ? <BuildBadge s={status.new} /> : (
          <p className="text-xs text-muted-foreground">
            No address set yet. Paste the candidate service&rsquo;s URL (Render → the candidate service → its
            .onrender.com address) and press Save &amp; check. It is remembered in this browser.
          </p>
        )}
        {sameCommit && <p className="text-[11px] text-amber-800">Same commit as Current: nothing new to compare yet.</p>}
      </div>
    </div>
  );
}

function PaneHeader({ side, status, quota, used, tier }: {
  side: Side; status: BuildStatus; quota: number; used: number; tier: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${side === 'current' ? 'bg-foreground text-background' : 'bg-emerald-700 text-white'}`}>
        {SIDE_TITLE[side]}
      </span>
      <span className="text-xs text-muted-foreground">{SIDE_SUB[side]}</span>
      {status.build && <code className="font-mono text-[11px] text-muted-foreground">{status.build.branch} @ {status.build.commit.slice(0, 7)}</code>}
      <span className="ml-auto"><QuestionsLeft remaining={Math.max(0, quota - used)} quota={quota} tier={tier} /></span>
    </div>
  );
}

function PaneThread({ side, prefix, pane, viewMode, showRaw, onToggleRaw }: {
  side: Side; prefix: { turn: TranscriptTurn; seeded: boolean }[]; pane: Pane; viewMode: ViewMode;
  showRaw: Record<string, boolean>; onToggleRaw: (key: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => { const el = ref.current; if (el) el.scrollTop = el.scrollHeight; }, [pane.items.length, pane.pending, viewMode]);
  const firstSeeded = prefix.findIndex((p) => p.seeded);
  return (
    <div ref={ref} className="h-[34rem] space-y-4 overflow-y-auto px-4 py-4">
      {prefix.map(({ turn, seeded }, i) => (
        <div key={`pre-${i}`} className="space-y-2">
          {i === firstSeeded && <p className="text-center text-[11px] uppercase tracking-wide text-muted-foreground">Seeded conversation · both start here</p>}
          {turn.role === 'system' ? <SystemPill text={turn.content} />
            : turn.role === 'user' ? <CandidateBubble text={turn.content} muted={seeded} />
              : <InterviewerBubble text={turn.content} muted={seeded} />}
        </div>
      ))}
      {pane.items.length === 0 && !pane.pending && (
        <p className="text-center text-xs text-muted-foreground">Send the candidate&rsquo;s first turn below.</p>
      )}
      {pane.items.map((it, i) => {
        if (it.kind === 'candidate') {
          return (
            <div key={`${side}-c-${i}`} className="space-y-1">
              <CandidateBubble text={it.text} />
              {it.to === 'one' && viewMode === 'diagnostics' && <p className="text-right text-[10px] text-muted-foreground">sent to {SIDE_TITLE[side]} only</p>}
            </div>
          );
        }
        if (it.kind === 'error') {
          return <div key={`${side}-e-${i}`} className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{it.text}</div>;
        }
        const key = `${side}-${it.id}`;
        return (
          <div key={key} className="space-y-1">
            <InterviewerTurn arm={it.arm} viewMode={viewMode} showRaw={!!showRaw[key]} onToggleRaw={() => onToggleRaw(key)} />
            {viewMode === 'diagnostics' && (
              <div className="flex flex-wrap gap-1.5">
                {it.arm.voice && <Chip>voice · {it.arm.voice.lane}</Chip>}
                {it.clar.counted > 0 && !it.clar.exhausted_this_turn && <Chip>used {it.clar.counted} question{it.clar.counted > 1 ? 's' : ''}</Chip>}
                {it.clar.exhausted_this_turn && <Chip tone="warn">out of questions — told to decline</Chip>}
                <Chip>{it.build.branch} @ {it.build.commit.slice(0, 7)}</Chip>
              </div>
            )}
          </div>
        );
      })}
      {pane.pending && <ThinkingBubble />}
    </div>
  );
}
