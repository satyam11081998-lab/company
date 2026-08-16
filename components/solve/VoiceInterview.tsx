'use client';

/**
 * Talk mode — the full-screen voice interview overlay.
 *
 * This component owns NO attempt state. It drives the mic, the VAD and the TTS
 * queue, then hands the transcribed text to the parent's existing `send()`.
 * Everything downstream (optimistic messages, clarification quota, scoring,
 * persistence) is the exact same path a typed session takes. That is the whole
 * design: talk mode is a way to reach the turn loop, not a second turn loop.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, Keyboard, X, Square } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { transcribeAudio, type AiQuota } from '@/lib/api';
import type { AttemptMessage } from '@/lib/interview-api';
import { Vad } from '@/lib/voice/vad';
import { TtsQueue } from '@/lib/voice/tts-queue';
import { isLikelyNoise } from '@/lib/voice/noise-guard';

/** The state machine. Every visible affordance is derived from this. */
type Phase = 'idle' | 'listening' | 'capturing' | 'transcribing' | 'thinking' | 'speaking';

/**
 * Recycle the recorder if it has been rolling this long without speech.
 *
 * The mic is open the whole time the candidate is thinking. A 90-second pause
 * before answering would otherwise be uploaded as 90 seconds of audio — billed
 * against their daily Whisper minutes and, on a long enough think, rejected
 * outright by /transcribe's 6 MB cap, losing the answer that followed.
 *
 * We recycle rather than trim because MediaRecorder puts the container header in
 * the FIRST chunk: dropping early chunks to save bytes produces a file Whisper
 * cannot decode. Restarting gives a clean container every time, and because the
 * recorder is always running we never clip the first word (which is what
 * starting on speech onset would cost).
 */
const IDLE_RECYCLE_MS = 3000;

/**
 * Abandoned-session guards.
 *
 * Talk mode holds the mic open, so "the candidate walked away" is not a neutral
 * state: the VAD keeps listening to the room, and anything that trips it costs a
 * Whisper call, an interviewer call and a TTS call. A television in the
 * background could take turns by itself until the daily quota is gone — and the
 * transcript those turns land in is the one the scorer reads afterwards.
 *
 * So the session warns, then closes itself. Closing is safe: the attempt stays
 * ACTIVE and everything said so far is already persisted, so the candidate picks
 * up exactly where they left off, in the chat or by reopening talk mode.
 */
const IDLE_WARN_MS = 3 * 60_000;
const IDLE_CLOSE_MS = 5 * 60_000;

/**
 * Hard ceiling on ONE voice session (owner decision, 2026-08-16). Reopening is
 * one tap, so the cost of this is trivial; the cost of NOT having it is a mic
 * left open on a desk.
 *
 * The idle guards above only fire on SILENCE. A session left running in a noisy
 * room, or one where the candidate genuinely keeps talking, has no upper bound
 * without this — and voice billing is per second of audio streamed, silence
 * included. This is the one guard that bounds the worst case rather than the
 * typical case.
 */
const MAX_SESSION_MS = 10 * 60_000;
/** Start warning the candidate this long before the cap, so it is never a surprise. */
const SESSION_WARN_BEFORE_MS = 60_000;

/** Consecutive transcription failures before we stop retrying and back out. */
const MAX_FAILURE_STREAK = 3;

const PHASE_LABEL: Record<Phase, string> = {
  idle: 'Starting…',
  listening: 'Listening',
  capturing: 'Listening',
  transcribing: 'Getting that down…',
  thinking: 'Thinking…',
  speaking: 'Interviewer speaking',
};

export interface VoiceInterviewProps {
  token: string;
  /**
   * The parent's send(). Resolves when the interviewer's reply has finished
   * streaming, with whether the turn actually landed — talk mode drives itself
   * in a loop and must not retry a turn that failed for a permanent reason.
   */
  onSend: (text: string) => Promise<boolean>;
  /** Subscribe to the reply token stream so audio can start before the reply ends. */
  registerTokenSink: (sink: ((chunk: string) => void) | null) => void;
  /** Called when the reply stream completes, so the queue can flush its tail. */
  registerDoneSink: (sink: (() => void) | null) => void;
  messages: AttemptMessage[];
  onClose: () => void;
  onSubmitSession: () => void;
  onQuotaUpdate?: (q: AiQuota) => void;
  /** Remaining Whisper minutes; talk mode cannot start without them. */
  voiceOut: boolean;
}

export default function VoiceInterview({
  token,
  onSend,
  registerTokenSink,
  registerDoneSink,
  messages,
  onClose,
  onSubmitSession,
  onQuotaUpdate,
  voiceOut,
}: VoiceInterviewProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [level, setLevel] = useState(0);
  const [muted, setMuted] = useState(false);
  const [degraded, setDegraded] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const vadRef = useRef<Vad | null>(null);
  const ttsRef = useRef<TtsQueue | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const phaseRef = useRef<Phase>('idle');
  const busyRef = useRef(false);
  const tailRef = useRef<HTMLDivElement>(null);
  const recStartedAtRef = useRef(0);
  const utteringRef = useRef(false);
  // The boot effect runs ONCE and its callbacks live for the whole session, so
  // every value they close over is frozen at mount. A spoken case runs 20-40
  // minutes — longer than a Supabase access token lives — so a captured `token`
  // would start 401ing mid-interview. Same trap for `muted`, which is read by
  // the TTS callback long after the user has toggled it.
  const tokenRef = useRef(token);
  const mutedRef = useRef(false);
  tokenRef.current = token;
  const lastActivityRef = useRef(performance.now());
  const idleWarnedRef = useRef(false);
  const sessionStartRef = useRef(performance.now());
  const sessionWarnedRef = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const failureStreakRef = useRef(0);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  // A ref, not the `degraded` state: the boot effect runs once, so a state value
  // read inside its callbacks is frozen at `false` forever and the "voice output
  // unavailable" toast would fire on every failed clip instead of once.
  const degradedRef = useRef(false);

  const setPhaseSafe = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  // --- teardown ----------------------------------------------------------
  const teardown = useCallback(() => {
    try {
      recorderRef.current?.state === 'recording' && recorderRef.current.stop();
    } catch {
      /* already stopped */
    }
    vadRef.current?.stop();
    vadRef.current = null;
    ttsRef.current?.destroy();
    ttsRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    registerTokenSink(null);
    registerDoneSink(null);
  }, [registerTokenSink, registerDoneSink]);

  /** Close talk mode exactly once, from any code path. */
  const closeSession = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    teardown();
    onCloseRef.current();
  }, [teardown]);

  // --- one spoken turn ---------------------------------------------------
  const finishTurn = useCallback(async () => {
    const rec = recorderRef.current;
    if (!rec || rec.state !== 'recording') return;

    const blob: Blob = await new Promise((resolve) => {
      // Use the recorder's OWN mime type. Safari records audio/mp4, not webm —
      // labelling an mp4 as webm hands Whisper a container that does not match
      // its bytes.
      const type = rec.mimeType || 'audio/webm';
      rec.onstop = () => resolve(new Blob(chunksRef.current, { type }));
      rec.stop();
    });
    chunksRef.current = [];
    utteringRef.current = false;

    if (blob.size === 0) {
      setPhaseSafe('listening');
      busyRef.current = false;
      startCapture();
      return;
    }

    setPhaseSafe('transcribing');
    let text: string | null = null;
    try {
      const res = await transcribeAudio(blob, tokenRef.current);
      if (res.quota) onQuotaUpdate?.(res.quota);
      text = (res.text || '').trim();
      failureStreakRef.current = 0;
    } catch (e) {
      // 429 (out of minutes) or a network blip. Do NOT end the session on the
      // first failure — the attempt is alive and one dropped packet should not
      // cost the candidate their flow. But do not retry forever either: with the
      // network down, every utterance fails and the loop would burn the session.
      failureStreakRef.current += 1;
      toast.error(e instanceof Error ? e.message : 'Could not hear that');
      if (failureStreakRef.current >= MAX_FAILURE_STREAK) {
        toast.message('Switching back to chat', {
          description: 'Voice input keeps failing. Your session is saved — carry on typing.',
        });
        closeSession();
        return;
      }
      setPhaseSafe('listening');
      busyRef.current = false;
      startCapture();
      return;
    }

    // Whisper does not return silence for silence — it returns "Thank you." and
    // friends. Posting that would make the interviewer reply to a turn the
    // candidate never took, and the scorer reads the result.
    if (!text || isLikelyNoise(text)) {
      setPhaseSafe('listening');
      busyRef.current = false;
      startCapture();
      return;
    }

    // A real turn — the session is demonstrably attended.
    lastActivityRef.current = performance.now();
    idleWarnedRef.current = false;

    setPhaseSafe('thinking');
    ttsRef.current?.reset();
    let landed = false;
    try {
      landed = await onSend(text);
    } catch {
      /* the parent surfaces its own toast */
    }

    // The turn did not land. Transient causes (a dropped packet) deserve another
    // go; permanent ones do not — the attempt's 200-message cap, an expired
    // token and a lapsed tier all fail identically and forever, and each retry
    // costs another Whisper transcription. Back out after a short streak.
    if (!landed) {
      failureStreakRef.current += 1;
      if (failureStreakRef.current >= MAX_FAILURE_STREAK) {
        toast.message('Switching back to chat', {
          description: 'That turn could not be sent. Your session is saved — carry on typing.',
        });
        closeSession();
        return;
      }
    } else {
      failureStreakRef.current = 0;
    }

    // Reopen the mic ONLY if the queue has nothing playing AND nothing on its
    // way. `isSpeaking` alone is a trap here: when the reply finishes streaming
    // the clips are usually still being fetched, so it reads false for a few
    // hundred ms — long enough to reopen the mic just before playback starts,
    // record the interviewer's own voice, and post it back as the candidate's
    // next turn. The session would talk to itself.
    if (!ttsRef.current?.hasWork) {
      setPhaseSafe('listening');
      busyRef.current = false;
      startCapture();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, onSend, onQuotaUpdate, setPhaseSafe]);

  const startCapture = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || busyRef.current) return;
    if (recorderRef.current?.state === 'recording') return;
    try {
      const mr = new MediaRecorder(stream);
      recorderRef.current = mr;
      chunksRef.current = [];
      recStartedAtRef.current = performance.now();
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.start();
    } catch {
      toast.error('Could not start recording');
    }
  }, []);

  /** Drop accumulated silence without losing the container header — see IDLE_RECYCLE_MS. */
  const recycleIfIdle = useCallback(() => {
    if (busyRef.current || utteringRef.current) return;
    if (phaseRef.current !== 'listening') return;
    const rec = recorderRef.current;
    if (!rec || rec.state !== 'recording') return;
    if (performance.now() - recStartedAtRef.current < IDLE_RECYCLE_MS) return;
    rec.onstop = null;
    try {
      rec.stop();
    } catch {
      /* already stopping */
    }
    recorderRef.current = null;
    chunksRef.current = [];
    startCapture();
  }, [startCapture]);

  // --- boot --------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (voiceOut) {
        toast.error('Daily voice limit reached — you can carry on in the chat.');
        onClose();
        return;
      }
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      } catch {
        toast.error('Microphone permission denied');
        onClose();
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;

      // The mic can disappear mid-interview: headphones unplugged, another app
      // grabs the device, permission revoked from the browser's site settings.
      // Without this the UI sits at "Listening" forever against a dead track.
      stream.getAudioTracks().forEach((t) => {
        t.addEventListener('ended', () => {
          toast.error('Microphone disconnected — your session is saved.');
          closeSession();
        });
      });

      // TTS queue. onSpeakingChange is what closes the loop: when the
      // interviewer stops talking, the mic reopens.
      const tts = new TtsQueue(() => tokenRef.current, {
        onSpeakingChange: (speaking) => {
          if (speaking) {
            setPhaseSafe('speaking');
            return;
          }
          busyRef.current = false;
          // Respect a mute toggled DURING the interviewer's reply. Without this
          // the mic reopens the moment playback ends, and the candidate who
          // deliberately put the session on hold is being recorded again.
          if (mutedRef.current) {
            setPhaseSafe('idle');
            return;
          }
          setPhaseSafe('listening');
          startCapture();
        },
        onError: (msg) => {
          // Voice output failed — degrade to reading the reply on screen rather
          // than killing the interview. Ref-guarded so this fires once, not
          // once per failed clip.
          if (!degradedRef.current) {
            degradedRef.current = true;
            setDegraded(true);
            toast.message('Voice output unavailable', { description: msg });
          }
        },
      });
      ttsRef.current = tts;
      registerTokenSink((chunk) => tts.push(chunk));
      registerDoneSink(() => tts.flush());

      const vad = new Vad(
        stream,
        {
          onLevel: setLevel,
          onStateChange: (s) => {
            if (s !== 'silent') return;
            // The VAD drops back to silent WITHOUT an onSpeechEnd when an
            // utterance was too short to be a turn (a cough, a chair creak).
            // Without this reset, utteringRef and the 'capturing' phase would
            // both stick, permanently blocking recycleIfIdle — and the silence
            // this fix exists to bound would start piling up again.
            utteringRef.current = false;
            if (!busyRef.current && phaseRef.current === 'capturing') setPhaseSafe('listening');
          },
          onSpeechStart: () => {
            // Marks the recording as worth keeping — recycleIfIdle must not
            // pull the rug out from under an utterance in progress.
            utteringRef.current = true;
            // Somebody is talking. Not proof it is the candidate (that is what
            // the noise guard is for) but enough to defer the idle warning.
            lastActivityRef.current = performance.now();
            idleWarnedRef.current = false;
            if (phaseRef.current === 'listening') setPhaseSafe('capturing');
          },
          onSpeechEnd: ({ forced }) => {
            if (busyRef.current) return;
            busyRef.current = true;
            if (forced) toast.message('That was a long answer — sending it now.');
            void finishTurn();
          },
        },
      );
      vadRef.current = vad;
      vad.start();

      setPhaseSafe('listening');
      startCapture();
    })();

    return () => {
      cancelled = true;
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bound the silence sitting in the open recording, and bound the session
  // itself. Cheap poll — a couple of ref reads unless something is actually due.
  useEffect(() => {
    const id = window.setInterval(() => {
      recycleIfIdle();

      // HARD SESSION CAP — checked before the idle guards and regardless of
      // mute or busy, because this is the bound that must always hold.
      const elapsed = performance.now() - sessionStartRef.current;
      const remaining = MAX_SESSION_MS - elapsed;
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
        toast.message('About a minute of voice time left', {
          description: 'It will pause itself shortly. Tap Talk to start a fresh session.',
        });
      }

      // Abandoned-session guard. Muting is an explicit "I am still here, hold
      // on", so it does not count as idleness.
      if (mutedRef.current || busyRef.current) return;
      const idleFor = performance.now() - lastActivityRef.current;

      if (idleFor >= IDLE_CLOSE_MS) {
        toast.message('Voice interview paused', {
          description: 'Nothing heard for a few minutes. Your session is saved — reopen talk mode or carry on typing.',
        });
        closeSession();
        return;
      }
      if (idleFor >= IDLE_WARN_MS && !idleWarnedRef.current) {
        idleWarnedRef.current = true;
        toast.message('Still there?', {
          description: 'Talk mode will pause itself shortly if it does not hear anything.',
        });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [recycleIfIdle, closeSession]);

  // Tab hidden, screen locked, app switched — stop listening to the room. The
  // mic staying live while the candidate is somewhere else is both a privacy
  // problem and the cost leak the idle guard exists to close.
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'hidden') {
        vadRef.current?.pause();
        ttsRef.current?.cancel();
        if (recorderRef.current?.state === 'recording') {
          recorderRef.current.onstop = null;
          try { recorderRef.current.stop(); } catch { /* already stopping */ }
          recorderRef.current = null;
        }
        chunksRef.current = [];
        busyRef.current = false;
        setPhaseSafe('idle');
        return;
      }
      // Back in view. A manual hold outranks the automatic one.
      if (mutedRef.current) return;
      ttsRef.current?.reset();
      vadRef.current?.resume();
      lastActivityRef.current = performance.now();
      idleWarnedRef.current = false;
      setPhaseSafe('listening');
      startCapture();
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [setPhaseSafe, startCapture]);

  // Keep the transcript rail pinned to the newest turn.
  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, phase]);

  // --- controls ----------------------------------------------------------
  function interrupt() {
    // Cutting the interviewer off mid-sentence is a legitimate interview move,
    // and aborting the in-flight /speak calls stops us paying for audio nobody
    // will hear.
    ttsRef.current?.reset();
    busyRef.current = false;
    setPhaseSafe('listening');
    startCapture();
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    if (next) {
      vadRef.current?.pause();
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      chunksRef.current = [];
      setPhaseSafe('idle');
    } else {
      vadRef.current?.resume();
      setPhaseSafe('listening');
      startCapture();
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' && phaseRef.current === 'speaking') {
        e.preventDefault();
        interrupt();
      }
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  const active = phase === 'capturing' || phase === 'listening';
  const orbScale = active ? 1 + Math.min(0.35, level * 0.5) : phase === 'speaking' ? 1.08 : 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/98 backdrop-blur-sm">
      {/* header */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-widest text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${phase === 'speaking' ? 'bg-primary' : active ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
          <span>Voice interview</span>
          {secondsLeft !== null && (
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 tabular-nums text-primary">
              {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')} left
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Leave voice mode"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 px-6 py-8">
        {/* orb */}
        <div className="relative flex h-44 w-44 items-center justify-center">
          {active && (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400/20 animate-ping [animation-delay:700ms]" />
            </>
          )}
          {phase === 'speaking' && (
            <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse" />
          )}
          <div
            className={`flex h-32 w-32 items-center justify-center rounded-full transition-transform duration-100 ${
              phase === 'speaking'
                ? 'bg-primary/15 text-primary'
                : active
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
            }`}
            style={{ transform: `scale(${orbScale})` }}
          >
            {phase === 'transcribing' || phase === 'thinking' ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : muted ? (
              <MicOff className="h-10 w-10" />
            ) : (
              <Mic className="h-10 w-10" />
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-body font-medium text-foreground">{muted ? 'Mic on hold' : PHASE_LABEL[phase]}</p>
          <p className="mt-1 text-small text-muted-foreground">
            {phase === 'speaking'
              ? 'Tap interrupt or press space to jump in'
              : muted
                ? 'Tap the mic to carry on'
                : 'Just talk — pause when you are done'}
          </p>
          {degraded && (
            <p className="mt-2 text-micro text-amber-600 dark:text-amber-400">
              Voice output is off — the interviewer&apos;s replies are on screen below.
            </p>
          )}
        </div>

        {/* transcript rail */}
        <div className="w-full max-w-2xl flex-1 min-h-0 overflow-y-auto rounded-xl border bg-card/50 p-4">
          <div className="space-y-3">
            {messages.slice(-8).map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <span className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">
                  {m.role === 'user' ? 'You' : 'Interviewer'}
                </span>
                <p className="mt-0.5 text-small leading-relaxed text-foreground">{m.content}</p>
              </div>
            ))}
            <div ref={tailRef} />
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="shrink-0 border-t px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={toggleMute} className="h-9">
            {muted ? <Mic className="mr-1.5 h-4 w-4" /> : <MicOff className="mr-1.5 h-4 w-4" />}
            {muted ? 'Resume' : 'Hold'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={interrupt}
            disabled={phase !== 'speaking'}
            className="h-9"
          >
            <Square className="mr-1.5 h-3.5 w-3.5" fill="currentColor" />
            Interrupt
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9">
            <Keyboard className="mr-1.5 h-4 w-4" />
            Type instead
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSubmitSession}
            className="h-9 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            End &amp; submit
          </Button>
        </div>
      </div>
    </div>
  );
}
