'use client';

/**
 * Gemini Live real-time interviewer (speech-to-speech).
 *
 * Transport is a WebSocket straight to Google (lowest latency), authorised by a
 * short-lived ephemeral token minted by our backend (POST /realtime-gemini/session).
 * We capture mic audio as 16 kHz 16-bit PCM and stream it up; Gemini streams 24 kHz
 * PCM back, which we schedule for gapless playback. Barge-in: on `interrupted` we
 * flush the playback queue so the interviewer stops the instant the candidate speaks.
 *
 * Credit is metered by ELAPSED seconds, reported to /realtime-gemini/usage
 * periodically and on close (Gemini Live is priced per minute of audio).
 *
 * NON-DEFAULT: only mounted when the admin sets voice_mode = "gemini".
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, X, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Phase = 'connecting' | 'live' | 'error' | 'closed';

function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const buf = new ArrayBuffer(input.length * 2);
  const view = new DataView(buf);
  for (let i = 0; i < input.length; i++) {
    let s = Math.max(-1, Math.min(1, input[i]));
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
  token, caseId, attemptId, onClose,
}: {
  token: string;
  caseId: string;
  attemptId?: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<{ who: 'you' | 'interviewer'; text: string }[]>([]);

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
  const asstDraftRef = useRef('');
  const userDraftRef = useRef('');
  const [drafts, setDrafts] = useState<{ you: string; interviewer: string }>({ you: '', interviewer: '' });

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
    liveSourcesRef.current.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } });
    liveSourcesRef.current = [];
    playHeadRef.current = playCtxRef.current?.currentTime ?? 0;
    setSpeaking(false);
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
    const now = ctx.currentTime;
    const startAt = Math.max(now, playHeadRef.current);
    src.start(startAt);
    playHeadRef.current = startAt + buf.duration;
    setSpeaking(true);
    liveSourcesRef.current.push(src);
    src.onended = () => {
      liveSourcesRef.current = liveSourcesRef.current.filter((s) => s !== src);
      if (liveSourcesRef.current.length === 0) setSpeaking(false);
    };
  }, []);

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
        // 1) mint the session (ephemeral token + ws url) from our backend
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

        // 2) audio contexts
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

        // 3) websocket
        const ws = new WebSocket(data.ws_url);
        wsRef.current = ws;

        // Start streaming mic audio ONLY after Gemini acks setup (setupComplete).
        // Sending realtimeInput before that makes Gemini close the socket.
        const startMic = () => {
          if (procRef.current) return;
          const source = micCtx.createMediaStreamSource(stream);
          const proc = micCtx.createScriptProcessor(4096, 1, 1);
          procRef.current = proc;
          proc.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return;
            const input = e.inputBuffer.getChannelData(0);
            const b64 = abToBase64(floatTo16BitPCM(input));
            ws.send(JSON.stringify({ realtimeInput: { audio: { data: b64, mimeType: 'audio/pcm;rate=16000' } } }));
          };
          source.connect(proc);
          proc.connect(micCtx.destination); // keep the node alive (silent)
          startedAtRef.current = Date.now();
          reportedRef.current = 0;
          setPhase('live');
        };

        ws.onopen = () => {
          // Setup FIRST; wait for setupComplete before sending any audio.
          ws.send(JSON.stringify({
            setup: {
              model: data.model,
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: data.voice } } },
              },
              systemInstruction: { parts: [{ text: data.instructions }] },
              inputAudioTranscription: {},
              outputAudioTranscription: {},
            },
          }));
        };

        ws.onmessage = async (ev) => {
          let text: string;
          if (typeof ev.data === 'string') text = ev.data;
          else if (ev.data instanceof Blob) text = await ev.data.text();
          else text = new TextDecoder().decode(ev.data);
          let msg: any;
          try { msg = JSON.parse(text); } catch { return; }

          if (msg.setupComplete) { startMic(); return; }
          if (!msg.serverContent) { console.log('[gemini] msg', text.slice(0, 400)); }

          const sc = msg.serverContent;
          if (sc) {
            if (sc.interrupted) stopPlayback();
            const parts = sc.modelTurn?.parts || [];
            for (const p of parts) {
              const inline = p.inlineData;
              if (inline?.data && (inline.mimeType || '').includes('audio')) {
                enqueueAudio(base64ToInt16(inline.data));
              }
            }
            // Transcriptions arrive incrementally — accumulate into a live draft,
            // then commit the whole turn on turnComplete (so it reads as one line,
            // not a stream of fragments).
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
              setTranscript((t) => [
                ...t.slice(-8),
                ...(u ? [{ who: 'you' as const, text: u }] : []),
                ...(a ? [{ who: 'interviewer' as const, text: a }] : []),
              ]);
              setDrafts({ you: '', interviewer: '' });
            }
          }
        };

        ws.onerror = (e) => { console.log('[gemini] ws error', e); if (!cancelled) { setError('Voice connection error.'); setPhase('error'); } };
        ws.onclose = (ev) => {
          console.log('[gemini] ws closed', ev.code, ev.reason);
          if (!cancelled && !closedRef.current) {
            if (ev.reason) setError(`Gemini closed the connection: ${ev.reason}`);
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur">
      <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted" aria-label="Close">
        <X className="h-5 w-5" />
      </button>

      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" /> Gemini Live
        {creditsLeft !== null && <span>· {creditsLeft} real-time min left</span>}
      </div>

      <div className={`flex h-40 w-40 items-center justify-center rounded-full transition-colors ${speaking ? 'bg-primary/15' : 'bg-emerald-500/10'}`}>
        {phase === 'connecting'
          ? <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          : <Mic className={`h-12 w-12 ${speaking ? 'text-primary' : 'text-emerald-600'}`} />}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {phase === 'connecting' && 'Connecting…'}
        {phase === 'live' && (speaking ? 'Interviewer speaking…' : 'Listening — just talk')}
        {phase === 'error' && <span className="text-destructive">{error}</span>}
        {phase === 'closed' && 'Session ended.'}
      </p>

      <div className="mt-6 w-full max-w-lg space-y-2 px-4">
        {transcript.slice(-6).map((m, i) => (
          <div key={i} className={m.who === 'you' ? 'text-right' : 'text-left'}>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {m.who === 'you' ? 'You' : 'Interviewer'}
            </span>
            <p className="text-sm text-foreground">{m.text}</p>
          </div>
        ))}
        {drafts.you && (
          <div className="text-right opacity-70">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">You</span>
            <p className="text-sm text-foreground">{drafts.you}</p>
          </div>
        )}
        {drafts.interviewer && (
          <div className="text-left opacity-70">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Interviewer</span>
            <p className="text-sm text-foreground">{drafts.interviewer}</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-2">
        <Button variant="outline" onClick={onClose}>End interview</Button>
      </div>
    </div>
  );
}
