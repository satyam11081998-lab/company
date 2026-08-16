'use client';

/**
 * Talk mode over the OpenAI Realtime API.
 *
 * The pipeline sibling (VoiceInterview.tsx) is kept intact and selectable by
 * flag, because it works and this does not have a browser to prove itself in
 * yet. What changes here is ONLY the transport: audio goes browser-to-OpenAI
 * over WebRTC, so there is no VAD, no MediaRecorder, no /transcribe, no /speak
 * and no TTS queue in this file. Turn detection and barge-in happen at the far
 * end, which is the entire reason it feels like a conversation instead of a
 * request/response cycle.
 *
 * Everything that is NOT transport is deliberately preserved: the 10-minute
 * session cap, the idle guards, the noise guard on incoming transcripts, the
 * tab-hidden stop, and persistence into `attempt_messages` so a spoken attempt
 * is scored on the same document as a typed one.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, Keyboard, X, Square } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import VoiceWave from '@/components/icons/voice-wave';
import type { AttemptMessage } from '@/lib/interview-api';
import { postRealtimeTurn } from '@/lib/interview-api';
import { startRealtimeSession, type RealtimeHandle } from '@/lib/voice/realtime-session';
import { isLikelyNoise } from '@/lib/voice/noise-guard';

const MAX_SESSION_MS = 10 * 60_000;
const SESSION_WARN_BEFORE_MS = 60_000;
const IDLE_WARN_MS = 3 * 60_000;
const IDLE_CLOSE_MS = 5 * 60_000;

type Phase = 'connecting' | 'listening' | 'speaking';

const PHASE_LABEL: Record<Phase, string> = {
  connecting: 'Connecting…',
  listening: 'Listening',
  speaking: 'Interviewer speaking',
};

export interface VoiceInterviewRealtimeProps {
  token: string;
  caseId: string;
  attemptId: string;
  messages: AttemptMessage[];
  /** Called after a turn lands so the parent can refresh the thread. */
  onTurnPersisted: () => void;
  onClose: () => void;
  onSubmitSession: () => void;
}

export default function VoiceInterviewRealtime({
  token,
  caseId,
  attemptId,
  messages,
  onTurnPersisted,
  onClose,
  onSubmitSession,
}: VoiceInterviewRealtimeProps) {
  const [phase, setPhase] = useState<Phase>('connecting');
  const [muted, setMuted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [live, setLive] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);

  const sessionRef = useRef<RealtimeHandle | null>(null);
  const closingRef = useRef(false);
  const mutedRef = useRef(false);
  const sessionStartRef = useRef(performance.now());
  const sessionWarnedRef = useRef(false);
  const lastActivityRef = useRef(performance.now());
  const idleWarnedRef = useRef(false);
  const tailRef = useRef<HTMLDivElement>(null);

  // Usage from `response.done` arrives on its own event, not attached to the
  // transcript. Hold the most recent counts so the next persisted assistant
  // turn can carry them — otherwise spend never reaches the budget guard.
  const pendingUsageRef = useRef<{ input: number; output: number }>({ input: 0, output: 0 });

  // Props read inside callbacks that are created ONCE. A spoken case outlives a
  // Supabase token, so these must not be captured by value.
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const onTurnPersistedRef = useRef(onTurnPersisted);
  onTurnPersistedRef.current = onTurnPersisted;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const closeSession = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    sessionRef.current?.stop();
    sessionRef.current = null;
    onCloseRef.current();
  }, []);

  const persist = useCallback(
    async (role: 'user' | 'assistant', text: string) => {
      // Whisper still hallucinates on silence at the far end, and a realtime
      // session has an open mic for its whole life. Same guard as the pipeline.
      if (!text || isLikelyNoise(text)) return;
      lastActivityRef.current = performance.now();
      idleWarnedRef.current = false;
      setLive((l) => [...l.slice(-12), { role, text }]);
      try {
        const usage = pendingUsageRef.current;
        await postRealtimeTurn(attemptId, tokenRef.current, {
          role,
          content: text,
          ...(role === 'assistant' && (usage.input || usage.output)
            ? { audio_input_tokens: usage.input, audio_output_tokens: usage.output }
            : {}),
        });
        if (role === 'assistant') pendingUsageRef.current = { input: 0, output: 0 };
        onTurnPersistedRef.current();
      } catch (e) {
        // A failed write must not kill a live conversation, but it DOES mean
        // this turn will be missing from the score.
        toast.error(e instanceof Error ? e.message : 'A turn could not be saved');
      }
    },
    [attemptId],
  );

  // --- boot --------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const handle = await startRealtimeSession(
          { caseId, attemptId, token: tokenRef.current },
          {
            onReady: () => !cancelled && setPhase('listening'),
            onSpeakingChange: (s) => !cancelled && setPhase(s ? 'speaking' : 'listening'),
            onListeningChange: () => { lastActivityRef.current = performance.now(); },
            onUserTurn: (t) => void persist('user', t),
            onAssistantTurn: (t) => void persist('assistant', t),
            onUsage: (u: any) => {
              // Shape varies by model revision; read defensively rather than
              // silently booking zero.
              const inTok = u?.input_token_details?.audio_tokens ?? u?.input_tokens ?? 0;
              const outTok = u?.output_token_details?.audio_tokens ?? u?.output_tokens ?? 0;
              pendingUsageRef.current = { input: inTok, output: outTok };
            },
            onError: (m) => toast.error(m),
          },
        );
        if (cancelled) { handle.stop(); return; }
        sessionRef.current = handle;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not start voice mode');
        closeSession();
      }
    })();
    return () => {
      cancelled = true;
      sessionRef.current?.stop();
      sessionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- session cap + idle guards ----------------------------------------
  useEffect(() => {
    const id = window.setInterval(() => {
      const remaining = MAX_SESSION_MS - (performance.now() - sessionStartRef.current);
      if (remaining <= 0) {
        toast.message('Voice session ended', {
          description: 'Sessions run 10 minutes at a time. Everything is saved — tap Talk to carry on.',
        });
        closeSession();
        return;
      }
      setSecondsLeft(remaining <= SESSION_WARN_BEFORE_MS ? Math.ceil(remaining / 1000) : null);
      if (remaining <= SESSION_WARN_BEFORE_MS && !sessionWarnedRef.current) {
        sessionWarnedRef.current = true;
        toast.message('About a minute of voice time left');
      }

      if (mutedRef.current) return;
      const idleFor = performance.now() - lastActivityRef.current;
      if (idleFor >= IDLE_CLOSE_MS) {
        toast.message('Voice session paused', { description: 'Nothing heard for a few minutes. Your session is saved.' });
        closeSession();
        return;
      }
      if (idleFor >= IDLE_WARN_MS && !idleWarnedRef.current) {
        idleWarnedRef.current = true;
        toast.message('Still there?');
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [closeSession]);

  // Tab hidden — an open mic while the candidate is elsewhere is a privacy
  // problem before it is a cost one, and realtime bills every second streamed.
  useEffect(() => {
    function onVis() {
      if (document.visibilityState === 'hidden') sessionRef.current?.mute(true);
      else if (!mutedRef.current) sessionRef.current?.mute(false);
    }
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' && phase === 'speaking') { e.preventDefault(); sessionRef.current?.interrupt(); }
      if (e.key === 'Escape') closeSession();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, closeSession]);

  useEffect(() => { tailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [live.length, messages.length]);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    sessionRef.current?.mute(next);
  }

  const rail = live.length ? live : messages.slice(-8).map((m) => ({ role: m.role as 'user' | 'assistant', text: m.content ?? '' }));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/98 backdrop-blur-sm">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-widest text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${phase === 'speaking' ? 'bg-primary' : phase === 'listening' ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
          <span>Voice interview</span>
          {secondsLeft !== null && (
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 tabular-nums text-primary">
              {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')} left
            </span>
          )}
        </div>
        <button type="button" onClick={closeSession} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Leave voice mode">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 px-6 py-8">
        <div className="relative flex h-44 w-44 items-center justify-center">
          {phase === 'listening' && !muted && (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400/20 animate-ping [animation-delay:700ms]" />
            </>
          )}
          {phase === 'speaking' && <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse" />}
          <div className={`flex h-32 w-32 items-center justify-center rounded-full ${
            phase === 'speaking' ? 'bg-primary/15 text-primary'
              : phase === 'listening' && !muted ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground'}`}>
            {phase === 'connecting' ? <Loader2 className="h-10 w-10 animate-spin" />
              : muted ? <MicOff className="h-10 w-10" />
              : phase === 'speaking' ? <VoiceWave className="h-12 w-12" />
              : <Mic className="h-10 w-10" />}
          </div>
        </div>

        <div className="text-center">
          <p className="text-body font-medium text-foreground">{muted ? 'Mic on hold' : PHASE_LABEL[phase]}</p>
          <p className="mt-1 text-small text-muted-foreground">
            {phase === 'speaking' ? 'Just talk to interrupt — no need to wait'
              : muted ? 'Tap the mic to carry on'
              : phase === 'connecting' ? 'Setting up the line…'
              : 'Speak naturally'}
          </p>
        </div>

        <div className="w-full max-w-2xl flex-1 min-h-0 overflow-y-auto rounded-xl border bg-card/50 p-4">
          <div className="space-y-3">
            {rail.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <span className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">
                  {m.role === 'user' ? 'You' : 'Interviewer'}
                </span>
                <p className="mt-0.5 text-small leading-relaxed text-foreground">{m.text}</p>
              </div>
            ))}
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
          <Button type="button" variant="outline" size="sm" onClick={() => sessionRef.current?.interrupt()} disabled={phase !== 'speaking'} className="h-9">
            <Square className="mr-1.5 h-3.5 w-3.5" fill="currentColor" />
            Interrupt
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={closeSession} className="h-9">
            <Keyboard className="mr-1.5 h-4 w-4" />
            Type instead
          </Button>
          <Button type="button" size="sm" onClick={onSubmitSession} className="h-9 bg-primary text-primary-foreground hover:bg-primary-hover">
            End &amp; submit
          </Button>
        </div>
      </div>
    </div>
  );
}
