'use client';

/**
 * Real-time voice interviewer over Gemini Live — same overlay UX as the OpenAI
 * realtime mode (chat-column overlay, animated listening mic, live transcript),
 * so the only difference the candidate feels is the interviewer itself.
 *
 * MECE Interviewer V11 decides every interviewer turn; Gemini is only the voice.
 * Each final candidate transcript goes to /attempts/{id}/voice-decision and
 * Gemini is asked to "SAY:" exactly V11's line (nothing for V11 SILENCE).
 * Gemini also answers candidate audio on its own and cannot be told not to, so
 * GeminiTurnGate discards that unprompted answer: it is never played or saved.
 *
 * Transport: ephemeral-token WebSocket straight to Google (minted by the backend
 * at POST /realtime-gemini/session). Mic is captured as 16 kHz PCM; Gemini streams
 * 24 kHz PCM back. Each completed turn is persisted to attempt_messages (like
 * realtime) so it is saved behind the overlay and reaches the scorer. Credit is
 * metered by elapsed seconds via /realtime-gemini/usage.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, X, Loader2, Keyboard } from 'lucide-react';
import { postRealtimeTurn, postVoiceDecision, postVoiceFold, type VoiceDecision } from '@/lib/interview-api';
import VoiceBetaNotice from '@/components/solve/VoiceBetaNotice';
import {
  CandidateTurnLedger, GeminiTurnGate, SaveQueue, geminiSayTurn, isEchoOfLine, voiceLine, type GateAction,
} from '@/lib/voice/v11-voice';

// Ending a candidate turn (unchanged): SETTLE_MS after Gemini closes its own
// (discarded) turn, so late transcript chunks land in the same turn; if Gemini
// never closes one, IDLE_FLUSH_MS of transcript silence ends it.
// SPEED: EARLY_SETTLE_MS after Gemini STARTS that answer, the words so far go to
// V11 as an early turn, so V11 thinks while Gemini is still talking to itself.
// The early decision is used only if the words are unchanged when the turn ends
// as above; otherwise V11 decides the full turn (see GeminiTurnGate).
// RESUME_CHECK_MS: after something cuts Gemini's answer off, how long to wait for
// the candidate's words before treating it as noise and keeping the early turn.
const EARLY_SETTLE_MS = 300;
const SETTLE_MS = 600;
const RESUME_CHECK_MS = 1000;
const IDLE_FLUSH_MS = 2500;
// Before V11 decides a turn, earlier turns should be in the saved history. Saves
// run in the background and take ~0.3 s, so this wait is normally zero; it is
// capped so a slow save can never hold up the interviewer.
const SAVE_WAIT_MS = 1500;
// A SAY that produces no audio at all within this window is released, so the
// gate can never stay stuck waiting for a voice that did not answer.
const SAY_WATCHDOG_MS = 8000;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Phase = 'connecting' | 'listening' | 'speaking' | 'error' | 'closed';

function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const buf = new ArrayBuffer(input.length * 2);
  const view = new DataView(buf);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buf;
}
function abToBase64(buf: ArrayBuffer): string {
  let bin = '';
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as number[]);
  }
  return btoa(bin);
}
function base64ToInt16(b64: string): Int16Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

export default function VoiceInterviewGemini({
  token, caseId, attemptId, onClose, onSubmitSession, onTurnPersisted,
}: {
  token: string;
  caseId: string;
  attemptId?: string;
  onClose: () => void;
  onSubmitSession?: () => void;
  onTurnPersisted?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<{ who: 'you' | 'interviewer'; text: string }[]>([]);
  const [drafts, setDrafts] = useState<{ you: string; interviewer: string }>({ you: '', interviewer: '' });

  const wsRef = useRef<WebSocket | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const playCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const playHeadRef = useRef(0);
  const liveSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const startedAtRef = useRef<number>(0);
  const reportedRef = useRef<number>(0);
  const closedRef = useRef(false);
  const mutedRef = useRef(false);
  const gateRef = useRef(new GeminiTurnGate());
  // Speak first, save after: candidate turns are saved in speaking order once V11
  // has decided them; every save runs in the background, one after another.
  const ledgerRef = useRef(new CandidateTurnLedger());
  const savesRef = useRef(new SaveQueue());
  const lastLineRef = useRef<{ text: string; at: number } | null>(null);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sayWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { tailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [transcript.length, drafts]);

  const reportUsage = useCallback(async (final = false) => {
    try {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const delta = Math.max(0, elapsed - reportedRef.current);
      if (delta < 1 && !final) return;
      reportedRef.current = elapsed;
      const res = await fetch(`${API_URL}/realtime-gemini/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ seconds: delta }),
        keepalive: final,
      });
      if (res.ok) {
        const j = await res.json();
        if (j?.credits && typeof j.credits.total_remaining === 'number') setCreditsLeft(j.credits.total_remaining);
      }
    } catch { /* metering is best-effort */ }
  }, [token]);

  const stopPlayback = useCallback(() => {
    liveSourcesRef.current.forEach((s) => { try { s.stop(); } catch { /* stopped */ } });
    liveSourcesRef.current = [];
    playHeadRef.current = playCtxRef.current?.currentTime ?? 0;
    if (!closedRef.current) setPhase(mutedRef.current ? 'listening' : 'listening');
  }, []);

  const enqueueAudio = useCallback((pcm: Int16Array) => {
    const ctx = playCtxRef.current;
    if (!ctx) return;
    const f32 = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) f32[i] = pcm[i] / 0x8000;
    const buf = ctx.createBuffer(1, f32.length, 24000);
    buf.getChannelData(0).set(f32);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    const startAt = Math.max(ctx.currentTime, playHeadRef.current);
    src.start(startAt);
    playHeadRef.current = startAt + buf.duration;
    if (!closedRef.current) setPhase('speaking');
    liveSourcesRef.current.push(src);
    src.onended = () => {
      liveSourcesRef.current = liveSourcesRef.current.filter((s) => s !== src);
      if (liveSourcesRef.current.length === 0 && !closedRef.current) setPhase('listening');
    };
  }, []);

  const persistTurn = useCallback(async (role: 'user' | 'assistant', content: string) => {
    if (!attemptId || !content.trim()) return;
    try {
      // No audio tokens -> saves the text without double-charging credit
      // (credit is metered by seconds via /realtime-gemini/usage).
      await postRealtimeTurn(attemptId, token, { role, content: content.trim() });
      onTurnPersisted?.();
    } catch { /* a missed save must not break a live interview */ }
  }, [attemptId, token, onTurnPersisted]);

  const queueSave = useCallback((role: 'user' | 'assistant', content: string) => {
    savesRef.current.push(() => persistTurn(role, content));
  }, [persistTurn]);

  // Early decisions voided since the last decision request: their folds are
  // dropped server-side (also sent in the background, see voidEarlyTurn).
  const voidedTurnIdsRef = useRef<string[]>([]);
  // Words of the open early turn, shown in the transcript once it is confirmed.
  const earlyTextRef = useRef('');

  const drainCandidateSaves = useCallback(() => {
    for (const t of ledgerRef.current.drain()) {
      if (t.commitTurnId && attemptId) {
        const id = t.commitTurnId;
        savesRef.current.push(() => postVoiceFold(attemptId, token, id, true).catch(() => {}));
      }
      queueSave('user', t.text);
    }
  }, [queueSave, attemptId, token]);

  const voidEarlyTurn = useCallback(() => {
    const id = ledgerRef.current.void();
    if (!id) return;
    voidedTurnIdsRef.current.push(id);
    if (attemptId) savesRef.current.push(() => postVoiceFold(attemptId, token, id, false).catch(() => {}));
    drainCandidateSaves();
  }, [attemptId, token, drainCandidateSaves]);

  // One FINAL candidate turn: V11 decides, Gemini speaks exactly V11's line --
  // or nothing for SILENCE (no SAY, no audio, no assistant row) -- and the
  // candidate turn is saved in the background, never in front of the reply.
  // Hand ONE V11 line to Gemini to speak. Released by the watchdog if Gemini
  // never starts speaking it.
  const sendSay = useCallback((line: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || closedRef.current) {
      console.warn('[gemini][v11] SAY not sent: voice connection is not open');
      return;
    }
    ws.send(JSON.stringify(geminiSayTurn(line)));
    gateRef.current.markSaySent(line);
    console.log('[gemini][v11] SAY sent:', line);
    if (sayWatchdogRef.current) clearTimeout(sayWatchdogRef.current);
    sayWatchdogRef.current = setTimeout(() => {
      if (gateRef.current.cancelSayIfSilent()) {
        console.warn(`[gemini][v11] voice did not speak the line within ${SAY_WATCHDOG_MS}ms; released`);
      }
    }, SAY_WATCHDOG_MS);
  }, []);

  const handleCandidateTurn = useCallback(async (u: string, sealed: boolean) => {
    if (isEchoOfLine(u, lastLineRef.current, Date.now())) {
      console.log('[gemini][v11] ignored echo of the interviewer line:', u);
      return;
    }
    if (sealed) setTranscript((t) => [...t.slice(-12), { who: 'you' as const, text: u }]);
    const { seq, turnId } = ledgerRef.current.open(u, !sealed);
    const t0 = performance.now();
    let decision: VoiceDecision | null = null;
    if (attemptId) {
      await savesRef.current.settled(SAVE_WAIT_MS);
      const discardTurnIds = voidedTurnIdsRef.current.splice(0);
      try {
        decision = await postVoiceDecision(attemptId, token, u, { turnId, deferFold: !sealed, discardTurnIds });
        console.log(`[gemini][v11] ${sealed ? '' : '(early) '}"${u}" -> ${decision.lane} ${decision.mode} (${decision.reason}) in ${Math.round(performance.now() - t0)}ms`);
      } catch (e: any) {
        console.warn('[gemini][v11] voice-decision failed:', e?.message || e);
      }
    }
    // Saved in the background once its text is final -- after V11 has read the
    // history, so V11 never sees this turn twice.
    ledgerRef.current.decided(seq);
    drainCandidateSaves();
    const line = voiceLine(decision);
    if (!line) return;  // V11 SILENCE: nothing is said
    // The candidate has already finished another turn, or this early turn was
    // voided (their words changed): V11 decides on that instead.
    if (seq !== ledgerRef.current.latest || !ledgerRef.current.isLive(seq)) {
      console.log('[gemini][v11] line superseded by a newer candidate turn');
      return;
    }
    const now = gateRef.current.requestSay(line);
    if (now) sendSay(now);
    else console.log('[gemini][v11] line held until Gemini finishes its own turn');
  }, [attemptId, token, drainCandidateSaves, sendSay]);

  const applyGate = useCallback((actions: GateAction[]) => {
    for (const a of actions) {
      if (a.type === 'play') {
        if (sayWatchdogRef.current) { clearTimeout(sayWatchdogRef.current); sayWatchdogRef.current = null; }
        enqueueAudio(base64ToInt16(a.data));
      } else if (a.type === 'stopPlayback') stopPlayback();
      else if (a.type === 'sendSay') sendSay(a.line);
      else if (a.type === 'dropSay') console.log('[gemini][v11] held line dropped: the candidate kept talking');
      else if (a.type === 'candidateDraft') setDrafts((d) => ({ ...d, you: a.text }));
      else if (a.type === 'interviewerDraft') setDrafts((d) => ({ ...d, interviewer: a.text }));
      else if (a.type === 'interviewerTurn') {
        lastLineRef.current = { text: a.text, at: Date.now() };
        setTranscript((t) => [...t.slice(-12), { who: 'interviewer' as const, text: a.text }]);
        setDrafts((d) => ({ ...d, interviewer: '' }));
        queueSave('assistant', a.text);
      } else if (a.type === 'candidateTurn') {
        if (a.sealed) setDrafts((d) => ({ ...d, you: '' }));
        else earlyTextRef.current = a.text;
        void handleCandidateTurn(a.text, a.sealed);
      } else if (a.type === 'candidateConfirmed') {
        // The early turn was the whole turn: show it, save it, commit its fold.
        const text = earlyTextRef.current.trim();
        earlyTextRef.current = '';
        setDrafts((d) => ({ ...d, you: '' }));
        if (text && !isEchoOfLine(text, lastLineRef.current, Date.now())) {
          setTranscript((t) => [...t.slice(-12), { who: 'you' as const, text }]);
        }
        ledgerRef.current.confirm();
        drainCandidateSaves();
      } else if (a.type === 'candidateRedo') {
        earlyTextRef.current = '';
        voidEarlyTurn();                   // V11 decides the full turn instead
      }
    }
  }, [enqueueAudio, stopPlayback, queueSave, handleCandidateTurn, drainCandidateSaves, voidEarlyTurn, sendSay]);

  const cleanup = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    if (sayWatchdogRef.current) clearTimeout(sayWatchdogRef.current);
    reportUsage(true);
    try { procRef.current?.disconnect(); } catch { /* noop */ }
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* noop */ }
    try { wsRef.current?.close(); } catch { /* noop */ }
    try { micCtxRef.current?.close(); } catch { /* noop */ }
    try { playCtxRef.current?.close(); } catch { /* noop */ }
  }, [reportUsage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/realtime-gemini/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ case_id: caseId, attempt_id: attemptId }),
        });
        if (!res.ok) {
          const t = await res.json().catch(() => ({}));
          throw new Error(t.detail || `Could not start voice session (${res.status})`);
        }
        const data = await res.json();
        if (data?.credits?.total_remaining != null) setCreditsLeft(data.credits.total_remaining);
        if (cancelled) return;

        const AC: typeof AudioContext = (window.AudioContext || (window as any).webkitAudioContext);
        const micCtx = new AC({ sampleRate: 16000 });
        micCtxRef.current = micCtx;
        const playCtx = new AC();
        playCtxRef.current = playCtx;
        playHeadRef.current = playCtx.currentTime;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
        });
        streamRef.current = stream;
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        const ws = new WebSocket(data.ws_url);
        wsRef.current = ws;

        const startMic = () => {
          if (procRef.current) return;
          const source = micCtx.createMediaStreamSource(stream);
          const proc = micCtx.createScriptProcessor(2048, 1, 1); // ~128ms — snappier upstream
          procRef.current = proc;
          proc.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN || mutedRef.current) return;
            const b64 = abToBase64(floatTo16BitPCM(e.inputBuffer.getChannelData(0)));
            ws.send(JSON.stringify({ realtimeInput: { audio: { data: b64, mimeType: 'audio/pcm;rate=16000' } } }));
          };
          source.connect(proc);
          // Route to a MUTED gain node (not destination) so the candidate never
          // hears their own mic echoed while keeping the processor alive.
          const sink = micCtx.createGain();
          sink.gain.value = 0;
          proc.connect(sink);
          sink.connect(micCtx.destination);
          startedAtRef.current = Date.now();
          reportedRef.current = 0;
          if (!cancelled) setPhase('listening');
        };

        ws.onopen = () => {
          ws.send(JSON.stringify({ setup: data.setup || { model: data.model } }));
        };

        // The end-of-turn timer. While the gate is still waiting on Gemini (an
        // early turn, a held line, Gemini's own answer) it keeps ticking, so a
        // lost server event can never leave the interview stuck.
        const armEndOfTurn = (ms: number) => {
          if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
          flushTimerRef.current = setTimeout(() => {
            flushTimerRef.current = null;
            if (closedRef.current) return;
            applyGate(gateRef.current.settle());
            if (!flushTimerRef.current && gateRef.current.waiting) armEndOfTurn(SETTLE_MS);
          }, ms);
        };

        ws.onmessage = async (ev) => {
          let text: string;
          if (typeof ev.data === 'string') text = ev.data;
          else if (ev.data instanceof Blob) text = await ev.data.text();
          else text = new TextDecoder().decode(ev.data);
          let msg: any;
          try { msg = JSON.parse(text); } catch { return; }

          if (msg.setupComplete) { startMic(); return; }
          const sc = msg.serverContent;
          if (!sc) return;

          // Everything Gemini sends goes through the V11 gate: only the reply to
          // our SAY is played; its own answers are discarded.
          const actions = gateRef.current.handle(sc);
          applyGate(actions);
          if (sc.inputTranscription?.text || sc.turnComplete || sc.interrupted
              || actions.some((a) => a.type === 'speechEnded')) {
            // (Re)arm the end-of-turn timer: short once Gemini has decided the
            // candidate stopped, long while the candidate may still be mid-thought.
            const g = gateRef.current;
            armEndOfTurn(g.candidateTurnEnded ? SETTLE_MS
              : g.resumeChecking ? RESUME_CHECK_MS
              : g.candidateSpeechEnded ? EARLY_SETTLE_MS
              : IDLE_FLUSH_MS);
          }
        };

        ws.onerror = (e) => { console.log('[gemini] ws error', e); if (!cancelled) { setError('Voice connection error.'); setPhase('error'); } };
        ws.onclose = (evt) => {
          console.log('[gemini] ws closed', evt.code, evt.reason);
          if (!cancelled && !closedRef.current) {
            if (evt.reason && evt.code !== 1000) setError(evt.reason);
            setPhase('closed');
          }
        };
      } catch (e: any) {
        if (!cancelled) { setError(e?.message || 'Could not start the voice session.'); setPhase('error'); }
      }
    })();

    const usageTimer = setInterval(() => reportUsage(false), 15000);
    return () => { cancelled = true; clearInterval(usageTimer); cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, caseId, attemptId]);

  function toggleMute() {
    setMuted((m) => { mutedRef.current = !m; return !m; });
  }

  const listening = phase === 'listening' && !muted;
  const speaking = phase === 'speaking';

  return (
    <div className="fixed top-0 xl:top-16 bottom-0 right-0 left-0 lg:left-[35%] xl:left-[30%] z-40 flex flex-col bg-background/98 backdrop-blur-sm">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-widest text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${speaking ? 'bg-primary' : listening ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
          <span>Voice interview</span>
          {creditsLeft !== null && (
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 tabular-nums text-primary">{Math.round(creditsLeft)} min left</span>
          )}
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Leave voice mode">
          <X className="h-5 w-5" />
        </button>
      </div>

      <VoiceBetaNotice onSwitchToChat={onClose} />

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 px-6 py-8">
        <div className="relative flex h-44 w-44 items-center justify-center">
          {listening && (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400/20 animate-ping [animation-delay:700ms]" />
            </>
          )}
          {speaking && <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse" />}
          <div className={`flex h-32 w-32 items-center justify-center rounded-full transition-colors ${
            speaking ? 'bg-primary/15 text-primary'
              : listening ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground'}`}>
            {phase === 'connecting' ? <Loader2 className="h-10 w-10 animate-spin" />
              : muted ? <MicOff className="h-10 w-10" />
              : <Mic className="h-10 w-10" />}
          </div>
        </div>

        <div className="text-center">
          <p className="text-body font-medium text-foreground">
            {phase === 'connecting' ? 'Setting up the line…'
              : phase === 'error' ? 'Connection issue'
              : phase === 'closed' ? 'Session ended'
              : muted ? 'Mic on hold'
              : speaking ? 'Interviewer speaking' : 'Listening'}
          </p>
          <p className="mt-1 text-small text-muted-foreground">
            {phase === 'error' ? (error || 'Please try again.')
              : speaking ? 'Just talk to interrupt — no need to wait'
              : muted ? 'Tap Resume to carry on'
              : phase === 'connecting' ? 'One moment' : 'Speak naturally'}
          </p>
        </div>

        <div className="w-full max-w-2xl flex-1 min-h-0 overflow-y-auto rounded-xl border bg-card/50 p-4">
          <div className="space-y-3">
            {transcript.map((m, i) => (
              <div key={i} className={m.who === 'you' ? 'text-right' : 'text-left'}>
                <span className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">{m.who === 'you' ? 'You' : 'Interviewer'}</span>
                <p className="mt-0.5 text-small leading-relaxed text-foreground">{m.text}</p>
              </div>
            ))}
            {drafts.you && (
              <div className="text-right opacity-70">
                <span className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">You</span>
                <p className="mt-0.5 text-small leading-relaxed text-foreground">{drafts.you}</p>
              </div>
            )}
            {drafts.interviewer && (
              <div className="text-left opacity-70">
                <span className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">Interviewer</span>
                <p className="mt-0.5 text-small leading-relaxed text-foreground">{drafts.interviewer}</p>
              </div>
            )}
            <div ref={tailRef} />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={toggleMute} className="h-9">
            {muted ? <Mic className="mr-1.5 h-4 w-4" /> : <MicOff className="mr-1.5 h-4 w-4" />}
            {muted ? 'Resume' : 'Hold'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9">
            <Keyboard className="mr-1.5 h-4 w-4" />
            Type instead
          </Button>
          {onSubmitSession && (
            <Button type="button" size="sm" onClick={onSubmitSession} className="h-9 bg-primary text-primary-foreground hover:bg-primary-hover">
              End &amp; submit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
