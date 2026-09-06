'use client';

/**
 * Real-time voice interviewer over Gemini Live — same overlay UX as the OpenAI
 * realtime mode (chat-column overlay, animated listening mic, live transcript),
 * so the only difference the candidate feels is the interviewer itself.
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
import { postRealtimeTurn } from '@/lib/interview-api';

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
  const asstDraftRef = useRef('');
  const userDraftRef = useRef('');
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

  const cleanup = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
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

          if (sc.interrupted) stopPlayback();
          for (const p of (sc.modelTurn?.parts || [])) {
            const inline = p.inlineData;
            if (inline?.data && (inline.mimeType || '').includes('audio')) enqueueAudio(base64ToInt16(inline.data));
          }
          if (sc.outputTranscription?.text) {
            asstDraftRef.current += sc.outputTranscription.text;
            setDrafts((d) => ({ ...d, interviewer: asstDraftRef.current }));
          }
          if (sc.inputTranscription?.text) {
            userDraftRef.current += sc.inputTranscription.text;
            setDrafts((d) => ({ ...d, you: userDraftRef.current }));
          }
          if (sc.turnComplete) {
            const a = asstDraftRef.current.trim();
            const u = userDraftRef.current.trim();
            asstDraftRef.current = '';
            userDraftRef.current = '';
            if (u || a) {
              setTranscript((t) => [
                ...t.slice(-12),
                ...(u ? [{ who: 'you' as const, text: u }] : []),
                ...(a ? [{ who: 'interviewer' as const, text: a }] : []),
              ]);
            }
            if (u) void persistTurn('user', u);
            if (a) void persistTurn('assistant', a);
            setDrafts({ you: '', interviewer: '' });
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
