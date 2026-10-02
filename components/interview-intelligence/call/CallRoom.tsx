'use client';

/**
 * The spoken interview: lobby (mic check, voice) -> live call -> done.
 *
 * Nothing here decides what the interviewer says or how an answer is judged. II's orchestrator
 * decides every line; this screen carries the conversation: it speaks the line, listens, knows
 * when the candidate has finished (Conductor) and sends the answer through the same /turns path
 * a typed answer takes, so the report reads exactly the same either way.
 *
 * Cost guard: a break — taken, or forced by 4 minutes of silence or 2 minutes on another tab —
 * hangs the voice line up completely (no audio streams, nothing billed). "Resume" redials.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Captions, CaptionsOff, Coffee, Headphones, Keyboard, Loader2, MessageSquareText, Mic, MicOff,
  PhoneOff, RotateCcw, Send, X,
} from 'lucide-react';
import { ii, IIError, newTurnId } from '@/lib/interview-intelligence/api';
import { clock } from '@/lib/interview-intelligence/format';
import type { IIMe, IIMessage, IIProgress, IISession } from '@/lib/interview-intelligence/types';
import {
  createAudioContext, listMics, meterForStream, openMic, supportsGeminiVoice, supportsLiveVoice,
} from '@/lib/interview-intelligence/voice/audio';
import { Conductor, DEFAULT_OPTIONS, type CallPhase } from '@/lib/interview-intelligence/voice/conductor';
import { GeminiLiveTransport } from '@/lib/interview-intelligence/voice/gemini';
import { RealtimeTransport } from '@/lib/interview-intelligence/voice/realtime';
import { StandardTransport } from '@/lib/interview-intelligence/voice/standard';
import type { SpeakKind, VoiceTransport } from '@/lib/interview-intelligence/voice/types';
import VoiceOrb, { type OrbMode } from './VoiceOrb';

type Stage = 'lobby' | 'connecting' | 'live' | 'ended';
type Engine = 'realtime' | 'gemini' | 'standard';

/** Away from the tab this long (screen locked, another tab) = a break, and the line hangs up. */
const HIDDEN_BREAK_MS = 120_000;
/** A live line that drops more than this often in this window falls back to standard voice. */
const MAX_RECONNECTS = 3;
const RECONNECT_WINDOW_MS = 120_000;

const VOICES = [
  { id: 'marin', label: 'Marin', note: 'Warm and natural', standard: 'coral' },
  { id: 'cedar', label: 'Cedar', note: 'Deep and calm', standard: 'ash' },
  { id: 'alloy', label: 'Alloy', note: 'Neutral and clear', standard: 'alloy' },
] as const;

const PHASE_TEXT: Record<CallPhase, string> = {
  idle: 'Getting ready',
  speaking: 'The interviewer is speaking. Tap the rings or press Space to cut in.',
  listening: 'Your turn. Answer out loud, at your own pace.',
  hearing: 'Listening',
  finishing: 'Keep going if you are not finished.',
  thinking: 'The interviewer is thinking',
  paused: 'Paused. The clock is stopped.',
  ended: 'Interview complete',
  error: 'Your answer did not go through',
};

function remember(key: string, value?: string): string | null {
  try {
    if (value !== undefined) localStorage.setItem(key, value);
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export default function CallRoom({
  me, session, initialMessages, initialProgress, onSwitchToChat,
}: {
  me: IIMe;
  session: IISession;
  initialMessages: IIMessage[];
  initialProgress: IIProgress | null;
  onSwitchToChat: () => void;
}) {
  const router = useRouter();
  const sessionId = session.id;
  const [stage, setStage] = useState<Stage>('lobby');
  const [phase, setPhase] = useState<CallPhase>('idle');
  const [caption, setCaption] = useState<{ text: string; kind: SpeakKind | null } | null>(null);
  const [partial, setPartial] = useState('');
  const [messages, setMessages] = useState<IIMessage[]>(initialMessages);
  const [progress, setProgress] = useState<IIProgress | null>(initialProgress);
  const [elapsed, setElapsed] = useState(initialProgress?.elapsed_s ?? session.active_seconds ?? 0);
  const [muted, setMuted] = useState(false);
  const [cc, setCc] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [failure, setFailure] = useState<{ message: string; retry: () => void } | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [redialing, setRedialing] = useState(false);
  const [voice, setVoice] = useState<string>(() => remember('ii.voice') || 'marin');
  const [mics, setMics] = useState<{ id: string; label: string }[]>([]);
  const [micId, setMicId] = useState<string | null>(() => remember('ii.mic'));
  const [micReady, setMicReady] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [orbSize, setOrbSize] = useState(320);
  const [touch, setTouch] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transportRef = useRef<VoiceTransport | null>(null);
  const conductorRef = useRef<Conductor | null>(null);
  const lobbyMeter = useRef<{ meter: { read: () => number }; dispose: () => void } | null>(null);
  const lobbyCtx = useRef<AudioContext | null>(null);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnects = useRef<number[]>([]);
  const recovering = useRef(false);
  const hiddenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hiddenAt = useRef(0);
  const geminiTier = useRef(0); // the Gemini session config that worked; redials start there
  const recoverRef = useRef<(message: string, code: string) => Promise<void>>(async () => undefined);
  const breakRef = useRef<(reason?: string) => Promise<void>>(async () => undefined);
  const mutedRef = useRef(false);
  const stageRef = useRef<Stage>('lobby');
  stageRef.current = stage;

  const flash = useCallback((msg: string) => {
    setNotice(msg);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 5000);
  }, []);

  // ------------------------------------------------------------------ layout
  useEffect(() => {
    setTouch(!!window.matchMedia?.('(pointer: coarse)').matches);
    const fit = () => setOrbSize(Math.max(200, Math.min(340, window.innerWidth - 64, window.innerHeight * 0.38)));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // ------------------------------------------------------------------ lobby mic check
  const openLobbyMic = useCallback(async (deviceId: string | null) => {
    setMicError(null);
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      lobbyMeter.current?.dispose();
      const stream = await openMic(deviceId);
      streamRef.current = stream;
      if (!lobbyCtx.current) lobbyCtx.current = createAudioContext();
      lobbyMeter.current = meterForStream(lobbyCtx.current, stream, 6);
      setMicReady(true);
      setMics(await listMics());
    } catch (e) {
      setMicReady(false);
      setMicError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    // If the browser already trusts this site with the mic, show the level meter straight away.
    let off = false;
    (async () => {
      try {
        const p = await (navigator as Navigator & { permissions?: { query: (q: { name: string }) => Promise<{ state: string }> } })
          .permissions?.query({ name: 'microphone' });
        if (!off && p?.state === 'granted') await openLobbyMic(micId);
      } catch { /* permissions API not available: wait for the button */ }
    })();
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lobbyLevel = useCallback(() => ({ mic: lobbyMeter.current?.meter.read() ?? 0, out: 0 }), []);
  const callLevels = useCallback(() => transportRef.current?.levels() ?? { mic: 0, out: 0 }, []);

  // ------------------------------------------------------------------ transcript helpers
  const applyMessages = useCallback((incoming: IIMessage[]) => {
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const keep = incoming.some((m) => m.role === 'candidate') ? prev.filter((m) => !m.id.startsWith('local-')) : prev;
      return [...keep, ...incoming.filter((m) => !seen.has(m.id))];
    });
  }, []);

  // ------------------------------------------------------------------ transports
  const makeStandard = useCallback((events: ReturnType<Conductor['events']>) => {
    const std = VOICES.find((v) => v.id === voice)?.standard || 'alloy';
    return new StandardTransport({
      ctx: ctxRef.current!,
      stream: streamRef.current!,
      speak: (text) => ii.speak(text, std),
      transcribe: async (blob) => (await ii.transcribe(blob)).text,
    }, events);
  }, [voice]);

  /** The engine the admin chose, if this browser can run it. */
  const preferredEngine = useCallback((): Engine => {
    const want = me.flags.voice_engine ?? 'realtime';
    if (want === 'realtime' && supportsLiveVoice()) return 'realtime';
    if (want === 'gemini' && supportsGeminiVoice()) return 'gemini';
    return 'standard';
  }, [me.flags.voice_engine]);

  const connect = useCallback(async (conductor: Conductor, want: Engine): Promise<VoiceTransport> => {
    const events = conductor.events({
      onFatal: (message, code) => { void recoverRef.current(message, code); },
      onUsage: (usage, kind) => { ii.liveUsage(sessionId, usage, kind).catch(() => undefined); },
      onWarning: (m) => flash(m),
    });
    if (want !== 'standard') {
      const live: VoiceTransport = want === 'gemini'
        ? new GeminiLiveTransport({
          ctx: ctxRef.current!,
          stream: streamRef.current!,
          mint: (tier) => ii.geminiSession(sessionId, voice, tier),
          startTier: geminiTier.current,
          usage: (secondsIn, secondsOut) => { ii.geminiUsage(sessionId, secondsIn, secondsOut).catch(() => undefined); },
        }, events)
        : new RealtimeTransport({
          ctx: ctxRef.current!,
          stream: streamRef.current!,
          mint: () => ii.liveSession(sessionId, voice),
        }, events);
      try {
        await live.start();
        if (live instanceof GeminiLiveTransport) geminiTier.current = live.tier;
        setEngine(want);
        return live;
      } catch (e) {
        live.stop();
        const code = (e as IIError)?.code;
        if (code !== 'live_off') flash('The live call could not connect, so the interview is using standard voice.');
      }
    }
    const std = makeStandard(events);
    await std.start();
    setEngine('standard');
    return std;
  }, [sessionId, voice, makeStandard, flash]);

  /** Close the voice line completely: nothing streams and nothing is billed until it is redialled. */
  const hangUp = useCallback(() => {
    const t = transportRef.current;
    transportRef.current = null;
    conductorRef.current?.detach();
    t?.stop();
    // release the mic too (the browser's recording indicator goes off during a break)
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }, []);

  const recover = useCallback(async (message: string, code: string) => {
    const conductor = conductorRef.current;
    if (!conductor || stageRef.current !== 'live' || conductor.phase === 'paused' || recovering.current) return;
    if (code === 'mic') {
      void breakRef.current(`${message} Plug it back in, then resume.`); // stops the clock; nothing is lost
      return;
    }
    recovering.current = true;
    const was = transportRef.current?.kind ?? 'standard';
    transportRef.current?.stop();
    conductor.detach();
    transportRef.current = null;
    // Gemini ends a live connection about every 10 minutes and OpenAI after 30: redial the same
    // engine. Only a line that keeps dropping falls back to standard voice.
    const now = Date.now();
    reconnects.current = [...reconnects.current.filter((t) => now - t < RECONNECT_WINDOW_MS), now];
    const want: Engine = was !== 'standard' && reconnects.current.length <= MAX_RECONNECTS ? was : 'standard';
    flash(want === was ? 'Reconnecting the call…' : 'Switching to standard voice…');
    try {
      const t = await connect(conductor, want);
      // a break may have started while redialling (the phase changes across the await)
      if ((conductor.phase as CallPhase) === 'paused' || stageRef.current !== 'live') { t.stop(); return; }
      transportRef.current = t;
      conductor.swap(t);
    } catch {
      setFailure({ message: 'The call dropped and could not reconnect. Your interview is saved.', retry: () => window.location.reload() });
    } finally {
      recovering.current = false;
    }
  }, [connect, flash]);
  recoverRef.current = recover;

  // ------------------------------------------------------------------ start the call
  async function start() {
    setStartError(null);
    // Created inside the click: iOS only allows sound from a context born in a user gesture.
    const ctx = createAudioContext();
    ctxRef.current = ctx;
    setStage('connecting');
    setPhase('idle');
    try {
      if (!streamRef.current) streamRef.current = await openMic(micId);
      lobbyMeter.current?.dispose();
      lobbyMeter.current = null;
      void lobbyCtx.current?.close().catch(() => undefined);
      lobbyCtx.current = null;

      const conductor = new Conductor({
        submit: async (text, answerMs, turnId, kind) => {
          const r = await ii.turn(sessionId, { client_turn_id: turnId, content: text, kind, answer_ms: answerMs });
          applyMessages(r.messages);
          setProgress(r.session);
          if (typeof r.session.elapsed_s === 'number') setElapsed(r.session.elapsed_s);
          return { lines: r.messages.filter((m) => m.role === 'interviewer').map((m) => m.content), status: r.session.status };
        },
        onPhase: setPhase,
        onCaption: (text, kind) => setCaption(text ? { text, kind } : null),
        onPartial: setPartial,
        onCandidateTurn: (text, kind) => setMessages((prev) => [...prev, {
          id: `local-${Date.now()}`, seq: Number.MAX_SAFE_INTEGER, role: 'candidate', content: text, kind,
          created_at: new Date().toISOString() }]),
        onInterviewerTurn: () => undefined,
        onNotice: flash,
        onError: (message, retry) => setFailure({ message, retry: () => { setFailure(null); retry(); } }),
        onEnded: () => finish(),
        onIdle: () => { void breakRef.current('We paused the interview and hung up because we couldn’t hear you for 4 minutes. Nothing is lost — resume when you’re ready.'); },
        newTurnId,
        now: () => performance.now(),
        setTimeout: (fn, ms) => window.setTimeout(fn, ms),
        clearTimeout: (t) => window.clearTimeout(t as number),
      }, DEFAULT_OPTIONS);
      conductorRef.current = conductor;

      const transport = await connect(conductor, preferredEngine());
      transportRef.current = transport;
      conductor.attach(transport);

      // Opening lines: start a ready interview, resume a paused one, or pick up a live one.
      let lines: string[] = [];
      if (session.status === 'ready') {
        const r = await ii.start(sessionId);
        applyMessages(r.messages);
        setProgress(r.session);
        lines = r.messages.filter((m) => m.role === 'interviewer').map((m) => m.content);
      } else if ((progress?.status || session.status) === 'paused') {
        const r = await ii.resume(sessionId);
        applyMessages(r.messages);
        setProgress(r.session);
        lines = r.messages.filter((m) => m.role === 'interviewer').map((m) => m.content);
      } else {
        const last = [...messages].reverse().find((m) => m.role === 'interviewer');
        lines = last ? [`Welcome back. Here is where we were. ${last.content}`] : [];
      }
      setStage('live');
      void keepAwake();
      conductor.begin(lines);
    } catch (e) {
      transportRef.current?.stop();
      transportRef.current = null;
      setStage('lobby');
      setStartError((e as Error).message || 'The call could not start.');
    }
  }

  async function keepAwake() {
    try {
      const wl = await (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } })
        .wakeLock?.request('screen');
      wakeLock.current = wl || null;
    } catch { /* not supported or denied: the call still works */ }
  }

  const teardown = useCallback(() => {
    if (hiddenTimer.current) { clearTimeout(hiddenTimer.current); hiddenTimer.current = null; }
    conductorRef.current?.stop();
    transportRef.current?.stop();
    transportRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    lobbyMeter.current?.dispose();
    void ctxRef.current?.close().catch(() => undefined);
    void lobbyCtx.current?.close().catch(() => undefined);
    void wakeLock.current?.release().catch(() => undefined);
    wakeLock.current = null;
  }, []);

  useEffect(() => () => teardown(), [teardown]);

  function finish() {
    setStage('ended');
    teardown();
    setTimeout(() => router.push(`/interview-intelligence/report/${sessionId}`), 2600);
  }

  // ------------------------------------------------------------------ controls
  function toggleMute() {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    conductorRef.current?.setMuted(next);
  }

  function repeat() {
    conductorRef.current?.repeat();
  }

  async function takeBreak(reason?: string) {
    const c = conductorRef.current;
    if (!c || c.phase === 'paused' || c.phase === 'ended') return;
    c.pause();
    hangUp();
    if (hiddenTimer.current) { clearTimeout(hiddenTimer.current); hiddenTimer.current = null; }
    try {
      const r = await ii.pause(sessionId);
      setProgress(r.session);
    } catch (e) {
      flash((e as IIError).message);
    }
    if (reason) flash(reason);
  }
  breakRef.current = takeBreak;

  async function resumeCall() {
    const c = conductorRef.current;
    if (!c || redialing) return;
    setRedialing(true);
    setFailure(null);
    try {
      // inside the click: lets iOS play sound again after a long break
      void ctxRef.current?.resume().catch(() => undefined);
      if (!streamRef.current) {
        // the chosen mic may have been unplugged during the break: fall back to the default one
        try { streamRef.current = await openMic(micId); } catch { streamRef.current = await openMic(null); }
      }
      if (!transportRef.current) {
        const t = await connect(c, preferredEngine());
        transportRef.current = t;
        c.swap(t);
      }
      const r = await ii.resume(sessionId);
      applyMessages(r.messages);
      setProgress(r.session);
      const lines = r.messages.filter((m) => m.role === 'interviewer').map((m) => m.content);
      const last = [...messages].reverse().find((m) => m.role === 'interviewer');
      c.begin(lines.length ? lines : last ? [last.content] : []);
    } catch (e) {
      flash((e as Error).message || 'Could not resume. Try again.');
    } finally {
      setRedialing(false);
    }
  }

  async function endInterview() {
    setConfirmEnd(false);
    try {
      await ii.end(sessionId);
      finish();
    } catch (e) {
      flash((e as IIError).message);
    }
  }

  function sendTyped() {
    const text = draft.trim();
    if (!text) return;
    conductorRef.current?.submitTyped(text);
    setDraft('');
    setTyping(false);
  }

  function switchToChat() {
    teardown();
    onSwitchToChat();
  }

  // keyboard: Space cuts in, M mutes, R repeats, T types, Esc closes panels
  useEffect(() => {
    if (stage !== 'live') return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') {
        if (e.key === 'Escape') setTyping(false);
        return;
      }
      if (e.code === 'Space') { e.preventDefault(); conductorRef.current?.interrupt(); }
      else if (e.key === 'm' || e.key === 'M') toggleMute();
      else if (e.key === 'r' || e.key === 'R') repeat();
      else if (e.key === 't' || e.key === 'T') { e.preventDefault(); setTyping(true); }
      else if (e.key === 'Escape') { setDrawer(false); setTyping(false); setConfirmEnd(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Another tab / locked screen: stop listening at once, and after 2 minutes take a break and hang
  // up, so a call left open in a background tab never keeps streaming. Back: listen again.
  useEffect(() => {
    if (stage !== 'live') return;
    const onVis = () => {
      const hidden = document.visibilityState === 'hidden';
      conductorRef.current?.setMuted(hidden || mutedRef.current);
      if (hidden) {
        hiddenAt.current = Date.now();
        if (!hiddenTimer.current) {
          hiddenTimer.current = setTimeout(() => {
            hiddenTimer.current = null;
            void breakRef.current('We paused the interview and hung up while you were away from this tab. Nothing is lost.');
          }, HIDDEN_BREAK_MS);
        }
      } else {
        if (hiddenTimer.current) { clearTimeout(hiddenTimer.current); hiddenTimer.current = null; }
        if (!wakeLock.current) void keepAwake();
        const away = hiddenAt.current ? Date.now() - hiddenAt.current : 0;
        if (away > 5000 && conductorRef.current?.phase !== 'paused') flash('Welcome back. The mic was off while you were on another tab.');
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (hiddenTimer.current) { clearTimeout(hiddenTimer.current); hiddenTimer.current = null; }
    };
  }, [stage, flash]);

  // local clock between server updates
  const paused = phase === 'paused' || progress?.status === 'paused';
  useEffect(() => {
    if (stage !== 'live' || paused) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [stage, paused]);

  // ------------------------------------------------------------------ render
  const lastQuestion = useMemo(
    () => [...messages].reverse().find((m) => m.role === 'interviewer')?.content || '',
    [messages],
  );
  const shownLine = caption?.kind === 'line' || caption?.kind === 'nudge' ? caption.text : lastQuestion;
  const duration = progress?.duration_s ?? session.duration_minutes * 60;
  const orbMode: OrbMode = stage === 'connecting' ? 'connecting'
    : stage !== 'live' ? 'idle'
      : muted && (phase === 'listening' || phase === 'hearing') ? 'muted'
        : phase === 'speaking' ? 'speaking'
          : phase === 'hearing' || phase === 'finishing' ? 'hearing'
            : phase === 'listening' ? 'listening'
              : phase === 'thinking' ? 'thinking'
                : phase === 'paused' ? 'paused' : 'idle';

  return (
    // z above every app chrome layer (incl. the 9999 "switch to desktop" banner): a call owns the screen.
    <div className="fixed inset-0 z-[10000] flex flex-col overflow-hidden bg-[#0A1426] text-[#EEF1F6]"
         style={{ backgroundImage: 'radial-gradient(1200px 700px at 50% 38%, rgba(30,52,92,0.55), rgba(10,20,38,0) 70%)' }}>
      {/* top bar */}
      <header className="flex shrink-0 items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-2 sm:px-6">
        <button onClick={stage === 'live' ? () => setConfirmEnd(true) : switchToChat}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#93A1B8] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label={stage === 'live' ? 'Leave the call' : 'Back to the text room'}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{session.role_title || 'Interview'}{session.company_name ? `, ${session.company_name}` : ''}</p>
          <p className="truncate text-xs text-[#93A1B8]">
            {session.mode_label} interview{progress?.section_title ? `. ${progress.section_title}` : ''}
          </p>
        </div>
        {stage === 'live' && (
          <div className="flex items-center gap-2 text-sm tabular-nums text-[#93A1B8]" aria-label="Interview time">
            <span className={`h-2 w-2 rounded-full ${paused ? 'bg-[#93A1B8]' : 'bg-[#E03A52] motion-safe:animate-pulse'}`} aria-hidden />
            <span className="text-[#EEF1F6]">{clock(elapsed)}</span>
            <span>/ {clock(duration)}</span>
          </div>
        )}
        {stage === 'live' && (
          <button onClick={() => setDrawer((d) => !d)} aria-expanded={drawer} aria-label="Conversation so far"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#93A1B8] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
            <MessageSquareText className="h-5 w-5" />
          </button>
        )}
      </header>

      {stage === 'lobby' || stage === 'connecting' ? (
        <Lobby
          session={session}
          resuming={session.status !== 'ready'}
          connecting={stage === 'connecting'}
          orb={<VoiceOrb mode={stage === 'connecting' ? 'connecting' : micReady ? 'listening' : 'idle'}
                          getLevels={lobbyLevel} size={Math.min(orbSize, 260)} label="Microphone level" />}
          micReady={micReady} micError={micError} mics={mics} micId={micId}
          onCheckMic={() => openLobbyMic(micId)}
          onPickMic={(id) => { setMicId(id); remember('ii.mic', id); void openLobbyMic(id); }}
          voice={voice} onPickVoice={(v) => { setVoice(v); remember('ii.voice', v); }}
          onStart={start} startError={startError} onChat={switchToChat}
        />
      ) : stage === 'ended' ? (
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <VoiceOrb mode="thinking" getLevels={() => ({ mic: 0, out: 0 })} size={Math.min(orbSize, 220)} />
          <h1 className="mt-8 text-2xl font-semibold tracking-tight">That’s the end of the interview.</h1>
          <p className="mt-3 max-w-md text-[#93A1B8]">
            We’re analysing your answers, the evidence behind them and how they line up with the role. Your report opens in a moment.
          </p>
        </main>
      ) : (
        <main className="relative flex min-h-0 flex-1 flex-col items-center px-4 sm:px-6">
          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
            <button type="button" onClick={() => conductorRef.current?.interrupt()}
                    className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    aria-label={phase === 'speaking' ? 'Interrupt the interviewer' : 'Interviewer'}>
              <VoiceOrb mode={orbMode} getLevels={callLevels} size={orbSize} />
            </button>

            <div className="mt-4 w-full max-w-2xl text-center" aria-live="polite">
              {cc && shownLine && !paused && (
                <p className={`text-balance font-display text-[22px] leading-snug sm:text-[26px] ${phase === 'speaking' ? 'text-white' : 'text-white/75'}`}>
                  {shownLine}
                </p>
              )}
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-[#93A1B8]">
                {(phase === 'thinking' || stage !== 'live') && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                {muted && phase !== 'paused'
                  ? (touch ? 'Your mic is muted. Tap the mic button to talk.' : 'Your mic is muted. Press M or the mic button to talk.')
                  : phase === 'speaking' && engine !== 'standard' ? 'The interviewer is speaking. Just start talking to cut in.'
                    : phase === 'speaking' && touch ? 'The interviewer is speaking. Tap the rings to cut in.' : PHASE_TEXT[phase]}
              </p>
              {partial && (
                <p className="mx-auto mt-3 max-w-xl text-pretty text-[15px] leading-relaxed text-[#7FD6C2]">{partial}</p>
              )}
            </div>
          </div>

          {paused && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A1426]/80 px-6 text-center backdrop-blur-sm">
              <Coffee className="h-7 w-7 text-[#93A1B8]" aria-hidden />
              <p className="mt-4 text-xl font-medium">You’re on a break.</p>
              <p className="mt-2 text-[#93A1B8]">The clock is stopped and the line is closed. Pick up when you’re ready.</p>
              <button onClick={resumeCall} disabled={redialing}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#EEF1F6] px-6 py-2.5 text-sm font-semibold text-[#0A1426] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-70">
                {redialing ? <><Loader2 className="h-4 w-4 animate-spin" /> Reconnecting…</> : 'Resume the interview'}
              </button>
            </div>
          )}

          {failure && (
            <div role="alert" className="mb-3 flex w-full max-w-xl items-center gap-3 rounded-xl border border-[#E03A52]/40 bg-[#E03A52]/10 px-4 py-3 text-sm">
              <span className="flex-1">{failure.message}</span>
              <button onClick={failure.retry} className="rounded-full bg-white/10 px-3 py-1.5 font-medium hover:bg-white/20">Try again</button>
            </div>
          )}

          {typing && (
            <div className="mb-3 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#121F38] p-3">
              <label htmlFor="ii-call-type" className="sr-only">Type your answer</label>
              <textarea id="ii-call-type" autoFocus rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={12000}
                        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendTyped(); } }}
                        placeholder="Type an answer — useful for numbers, names or code. Ctrl+Enter sends."
                        className="w-full resize-none bg-transparent px-2 py-1 text-[15px] leading-relaxed text-white placeholder:text-[#93A1B8] focus:outline-none" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setTyping(false)} className="rounded-full px-3 py-1.5 text-sm text-[#93A1B8] hover:text-white">Cancel</button>
                <button onClick={sendTyped} disabled={!draft.trim()}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF1F6] px-4 py-1.5 text-sm font-semibold text-[#0A1426] disabled:opacity-40">
                  <Send className="h-3.5 w-3.5" /> Send answer
                </button>
              </div>
            </div>
          )}

          {/* control dock */}
          <nav aria-label="Call controls" className="mb-[max(env(safe-area-inset-bottom),1rem)] flex items-center gap-2 rounded-full border border-white/10 bg-[#121F38]/90 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur sm:gap-3">
            <DockButton label={muted ? 'Unmute (M)' : 'Mute (M)'} onClick={toggleMute} active={muted}>
              {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </DockButton>
            <DockButton label="Repeat the question (R)" onClick={repeat} disabled={phase === 'thinking' || paused}>
              <RotateCcw className="h-5 w-5" />
            </DockButton>
            <DockButton label="Type an answer (T)" onClick={() => setTyping((v) => !v)} active={typing} disabled={phase === 'thinking' || paused}>
              <Keyboard className="h-5 w-5" />
            </DockButton>
            <DockButton label={cc ? 'Hide captions' : 'Show captions'} onClick={() => setCc((v) => !v)} active={!cc}>
              {cc ? <Captions className="h-5 w-5" /> : <CaptionsOff className="h-5 w-5" />}
            </DockButton>
            <DockButton label="Take a break" onClick={() => takeBreak()} disabled={paused || phase === 'thinking'}>
              <Coffee className="h-5 w-5" />
            </DockButton>
            <button onClick={() => setConfirmEnd(true)}
                    className="ml-1 inline-flex h-11 items-center gap-2 rounded-full bg-[#C8102E] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#A50D26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
              <PhoneOff className="h-4 w-4" /> <span className="hidden sm:inline">End interview</span><span className="sm:hidden">End</span>
            </button>
          </nav>
          {engine === 'standard' && me.flags.voice_engine !== 'standard' && (
            <p className="mb-2 text-xs text-[#93A1B8]">Standard voice: {touch ? 'tap the rings' : 'tap the rings or press Space'} to cut in.</p>
          )}
        </main>
      )}

      {notice && (
        <div role="status" className="pointer-events-none absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-full bg-[#121F38] px-4 py-2 text-sm text-[#EEF1F6] shadow-lg ring-1 ring-white/10">
          {notice}
        </div>
      )}

      {confirmEnd && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="ii-end-title">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#121F38] p-5">
            <h2 id="ii-end-title" className="text-lg font-semibold">End the interview now?</h2>
            <p className="mt-2 text-sm text-[#93A1B8]">
              You’ll get your report straight away. Anything not covered yet is reported as not tested, never as a weakness.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <button onClick={endInterview} className="rounded-full bg-[#C8102E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A50D26]">End and see my report</button>
              <button onClick={() => setConfirmEnd(false)} className="rounded-full px-4 py-2 text-sm text-[#EEF1F6] hover:bg-white/5">Keep going</button>
              <button onClick={switchToChat} className="rounded-full px-4 py-2 text-sm text-[#93A1B8] hover:bg-white/5 sm:mr-auto">Continue in chat</button>
            </div>
          </div>
        </div>
      )}

      {drawer && stage === 'live' && (
        <aside className="absolute inset-x-0 bottom-0 z-10 flex max-h-[70vh] flex-col rounded-t-2xl border-t border-white/10 bg-[#0E1A31] sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[380px] sm:rounded-none sm:border-l sm:border-t-0"
               aria-label="Conversation so far">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-sm font-semibold">Conversation so far</h2>
            <button onClick={() => setDrawer(false)} aria-label="Close" className="rounded-full p-2 text-[#93A1B8] hover:bg-white/5 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ol className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
            {messages.map((m) => (
              <li key={m.id} className={m.role === 'candidate' ? 'pl-8' : 'pr-8'}>
                <p className={`text-xs ${m.role === 'candidate' ? 'text-[#7FD6C2]' : 'text-[#E88A98]'}`}>
                  {m.role === 'candidate' ? 'You' : 'Interviewer'}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#DCE2EC]">{m.content}</p>
              </li>
            ))}
          </ol>
        </aside>
      )}
    </div>
  );
}

function DockButton({ label, onClick, children, active, disabled }: {
  label: string; onClick: () => void; children: React.ReactNode; active?: boolean; disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} aria-pressed={active}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-35 ${
              active ? 'bg-[#EEF1F6] text-[#0A1426]' : 'text-[#DCE2EC] hover:bg-white/10'}`}>
      {children}
    </button>
  );
}

function Lobby({
  session, resuming, connecting, orb, micReady, micError, mics, micId, onCheckMic, onPickMic, voice, onPickVoice,
  onStart, startError, onChat,
}: {
  session: IISession; resuming: boolean; connecting: boolean; orb: React.ReactNode;
  micReady: boolean; micError: string | null; mics: { id: string; label: string }[]; micId: string | null;
  onCheckMic: () => void; onPickMic: (id: string) => void; voice: string; onPickVoice: (v: string) => void;
  onStart: () => void; startError: string | null; onChat: () => void;
}) {
  return (
    <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-5 pb-8">
      <div className="mt-2 flex flex-col items-center">{orb}</div>
      <h1 className="mt-4 max-w-xl text-balance text-center font-display text-[28px] leading-tight sm:text-[34px]">
        {resuming ? 'Your interview is waiting for you.' : 'Your interviewer is ready.'}
      </h1>
      <p className="mt-3 max-w-lg text-center text-[15px] leading-relaxed text-[#93A1B8]">
        {session.duration_minutes} minutes, {session.mode_label.toLowerCase()}, {session.difficulty} difficulty.
        Speak naturally and pause when you’re done. The interviewer waits through thinking pauses, and you can cut in at any time.
      </p>

      <div className="mt-7 w-full max-w-md space-y-5">
        <section aria-labelledby="ii-mic">
          <h2 id="ii-mic" className="text-sm font-medium">Microphone</h2>
          {micReady ? (
            <div className="mt-2 flex items-center gap-2">
              <select value={micId || mics[0]?.id || ''} onChange={(e) => onPickMic(e.target.value)} aria-label="Choose a microphone"
                      className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#121F38] px-3 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                {mics.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              <span className="text-xs text-[#7FD6C2]">Working. Say something to see the rings move.</span>
            </div>
          ) : (
            <button onClick={onCheckMic}
                    className="mt-2 inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
              <Mic className="h-4 w-4" /> Check my microphone
            </button>
          )}
          {micError && <p className="mt-2 text-sm text-[#F2A0AC]">{micError}</p>}
        </section>

        <section aria-labelledby="ii-voice">
          <h2 id="ii-voice" className="text-sm font-medium">Interviewer’s voice</h2>
          <div role="radiogroup" aria-labelledby="ii-voice" className="mt-2 grid grid-cols-3 gap-2">
            {VOICES.map((v) => (
              <button key={v.id} role="radio" aria-checked={voice === v.id} onClick={() => onPickVoice(v.id)}
                      className={`rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                        voice === v.id ? 'border-[#E03A52] bg-[#E03A52]/10' : 'border-white/10 hover:bg-white/5'}`}>
                <span className="block text-sm font-medium">{v.label}</span>
                <span className="block text-xs text-[#93A1B8]">{v.note}</span>
              </button>
            ))}
          </div>
        </section>

        <p className="flex items-start gap-2 text-sm text-[#93A1B8]">
          <Headphones className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Headphones and a quiet room work best. The interview is transcribed so your report can quote your answers.
        </p>

        {startError && <p role="alert" className="text-sm text-[#F2A0AC]">{startError}</p>}

        <button onClick={onStart} disabled={connecting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#C8102E] text-[15px] font-semibold text-white transition-colors hover:bg-[#A50D26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-70">
          {connecting ? <><Loader2 className="h-4 w-4 animate-spin" /> Connecting the call…</> : resuming ? 'Rejoin the interview' : 'Start the interview'}
        </button>
        <button onClick={onChat} className="w-full text-center text-sm text-[#93A1B8] underline-offset-4 hover:text-white hover:underline">
          Prefer to type? Take it as a text interview
        </button>
      </div>
    </main>
  );
}
