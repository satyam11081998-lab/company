'use client';

/**
 * The conversational case-interview workspace.
 *
 * Three vertical zones, all visible at once on a single viewport:
 *   1. FIXED problem-statement header  - case prompt is ALWAYS shown
 *      (only the hint is collapsed behind a button). Prompt body caps
 *      at ~30vh and scrolls internally if very long.
 *   2. Scrolling conversation thread (the ONLY auto-scrolling region).
 *   3. FIXED messenger-style composer (text + mic + upload + send).
 *
 * The session is the submission. No separate answer field. The
 * persistent Submit button opens the final-recommendation dialog;
 * that text becomes the closing message and is weighted heavily by
 * the scorer.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Send, Paperclip, Mic, FileText, ArrowLeft, Award, Menu, Check, X, Lock } from 'lucide-react';
import VoiceWave from '@/components/icons/voice-wave';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import DictationButton, { type DictationHandle } from '@/components/dictation-button';
import MicWaveform from '@/components/mic-waveform';
import VoiceInterview from '@/components/solve/VoiceInterview';
import VoiceInterviewRealtime from '@/components/solve/VoiceInterviewRealtime';
import RealtimeMinutes from '@/components/solve/realtime-minutes';
import { primeAudioPlayback } from '@/lib/voice/tts-queue';
import { Vad } from '@/lib/voice/vad';

/** Voice mode (realtime speech-to-speech vs the cheaper pipeline) is an ADMIN
 *  toggle now, read live from the backend's /public-config at mount. The env var
 *  is only the initial fallback shown until that fetch returns. */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const REALTIME_ENV_DEFAULT = process.env.NEXT_PUBLIC_VOICE_REALTIME === '1';

/**
 * Continuous dictation is endpointed by the VAD (voice-activity detector): the
 * mic stays open the whole time and each PHRASE is flushed to Whisper the moment
 * you pause, so text streams into the box phrase by phrase without the mic ever
 * stopping. These tune the endpointing for dictation (snappier than talk mode):
 *  - VAD_SILENCE_MS: a pause this long ends the phrase and sends it.
 *  - VAD_MIN_UTTERANCE_MS: shorter blips (a breath, a click) never send.
 *  - VAD_MAX_UTTERANCE_MS: a run-on with no pause is force-flushed by here so a
 *    long monologue still appears and never trips /transcribe's size cap.
 */
const VAD_SILENCE_MS = 850;
const VAD_MIN_UTTERANCE_MS = 500;
const VAD_MAX_UTTERANCE_MS = 15000;
/**
 * While the mic is open but NOBODY is speaking, the rolling recorder is recycled
 * this often so a long think is not uploaded as dead air (billed + risks the
 * size cap). Recycling keeps a clean container header — see the flush helpers.
 */
const IDLE_RECYCLE_MS = 4000;
/** Auto-grow ceiling for the composer before it starts scrolling internally. */
const COMPOSER_MAX_PX = 240;
import EngagingLoader from '@/components/engaging-loader';
import GuestSaveWall from '@/components/guest/guest-save-wall';
import { createClient } from '@/lib/supabase/client';
import { CASE_TYPE_LABELS, DIFFICULTY_LABELS, VOICE_INTERVIEW_ENABLED } from '@/lib/constants';
import {
  startAttempt,
  getAttempt,
  postMessageStream,
  uploadAttemptFile,
  submitAttempt,
  type AttemptDetail,
  type AttemptMessage,
  type AttemptSummary,
} from '@/lib/interview-api';
import { transcribeAudio, fetchAiQuota, type AiQuota } from '@/lib/api';
import { MESSAGE_MAX_CHARS, RECOMMENDATION_MAX_CHARS } from '@/lib/limits';
import { useTrackAction } from '@/hooks/use-track-action';

interface Props {
  caseId: string;
  initialCase: {
    title: string;
    content: string;
    type: string;
    difficulty: string;
    hint: string | null;
  };
  historyPanel?: React.ReactNode;
  lockedOverlay?: React.ReactNode;
}

interface DraftAssistant {
  id: 'draft';
  role: 'assistant';
  text: string;
}

/**
 * Where a guest's finished recommendation is parked across an OAuth redirect.
 * Per-case so two open tabs cannot clobber each other.
 */
const PENDING_REC_KEY = (caseId: string) => `mece:pending-rec:${caseId}`;

export default function ConversationalSolve({ caseId, initialCase, historyPanel, lockedOverlay }: Props) {
  const router = useRouter();
  const trackAction = useTrackAction();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(!lockedOverlay);
  const [attempt, setAttempt] = useState<AttemptSummary | null>(null);
  const [caseDetail, setCaseDetail] = useState<AttemptDetail['case'] | typeof initialCase>(initialCase);
  const [messages, setMessages] = useState<AttemptMessage[]>([]);
  const [draftAssistant, setDraftAssistant] = useState<DraftAssistant | null>(null);
  const [composer, setComposer] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState<'idle' | 'recording' | 'transcribing'>('idle');
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  // Talk mode. The sinks let the overlay subscribe to the SAME token stream the
  // on-screen draft renders from, so audio starts before the reply finishes
  // without forking send().
  const [talkMode, setTalkMode] = useState(false);
  const tokenSinkRef = useRef<((chunk: string) => void) | null>(null);
  const doneSinkRef = useRef<(() => void) | null>(null);
  // VoiceInterview boots once and holds its callbacks for the whole session, so
  // anything it captures directly is frozen at mount. A spoken case runs 20-40
  // minutes — longer than a Supabase access token lives — so a captured `send`
  // would keep posting with a JWT that expired mid-interview. Routing through a
  // ref means the overlay always calls the CURRENT send, with the current token.
  const sendRef = useRef<(kind: 'text' | 'voice', content?: string) => Promise<boolean>>();
  const [quota, setQuota] = useState<AiQuota | null>(null);
  // Voice mode is admin-controlled at runtime (Admin -> AI providers). Read it
  // once on mount; keep the env default until it resolves. Never throws.
  const [useRealtime, setUseRealtime] = useState(REALTIME_ENV_DEFAULT);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/public-config`, { cache: 'no-store' });
        if (!res.ok) return;
        const j = await res.json();
        if (alive && (j.voice_mode === 'realtime' || j.voice_mode === 'pipeline')) {
          setUseRealtime(j.voice_mode === 'realtime');
        }
      } catch { /* keep env default */ }
    })();
    return () => { alive = false; };
  }, []);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [finalRec, setFinalRec] = useState('');
  // GUEST MODE (0045). `isGuest` is derived from the live Supabase session, not
  // from a prop: an anonymous user can convert mid-session, and the component
  // must stop gating the moment they do.
  const [isGuest, setIsGuest] = useState(false);
  const [saveWallOpen, setSaveWallOpen] = useState(false);
  // The recommendation is held here across the conversion. See handleSubmit.
  const [pendingRec, setPendingRec] = useState('');
  // Set when we come back from an OAuth conversion with a parked answer; the
  // effect below submits it once the attempt has finished loading.
  const [resumeRec, setResumeRec] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const threadRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  // Measured height of the composer block. The composer is absolutely
  // positioned OVER the thread, so the thread needs bottom padding equal to it
  // or the last messages sit underneath and cannot be scrolled into view. This
  // used to be a hard-coded `pb-32` (128px), which broke the moment the
  // composer grew — the clarification-quota banner, the voice-allowance line
  // and a multi-line textarea each add height and hid the newest turn.
  const [composerH, setComposerH] = useState(128);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ── Continuous dictation (VAD-endpointed) ───────────────────────────────
  // The mic stays open the entire time. A rolling MediaRecorder always runs, and
  // a voice-activity detector (Vad) watches the same stream: when you PAUSE, the
  // current phrase's recorder is stopped and sent to Whisper while a fresh one
  // starts immediately, so listening never breaks and text lands phrase by
  // phrase. Each recorder owns its OWN chunk array (chunksMapRef) so starting the
  // next recorder can never clobber the one still being finalised.
  const micStreamRef = useRef<MediaStream | null>(null);        // kept open across phrases
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);  // the rolling recorder
  const chunksMapRef = useRef<WeakMap<MediaRecorder, BlobPart[]>>(new WeakMap()); // per-recorder audio
  const vadRef = useRef<Vad | null>(null);
  const recycleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recStartedAtRef = useRef(0);        // when the rolling recorder began (for idle recycle)
  const utteringRef = useRef(false);        // true between speech-start and speech-end
  const keepRecordingRef = useRef(false);   // user still wants to dictate (drives the loop)
  const micCancelledRef = useRef(false);    // discard in-flight audio (cancel / unmount)
  const transcribeChainRef = useRef<Promise<void>>(Promise.resolve()); // serialise → keep order
  const composerVoiceRef = useRef(false);   // did dictation contribute to the current draft?
  const composerTextRef = useRef<HTMLTextAreaElement>(null);    // for auto-grow
  const recordingRef = useRef<'idle' | 'recording' | 'transcribing'>('idle');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (lockedOverlay) return; // Do not fetch or start attempt if locked
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const tok = session.access_token;
      if (cancelled) return;
      setToken(tok);
      // GUEST MODE (0045): read it off the live session rather than a prop, so
      // a mid-session conversion is picked up without a remount.
      const anon = session.user?.is_anonymous === true;
      setIsGuest(anon);

      // Returning from a Google / LinkedIn conversion: the account is now
      // permanent and a parked recommendation is waiting. They already pressed
      // "See my score" before being redirected away, so finish that action
      // rather than dropping them back on a case with no explanation.
      if (!anon) {
        let parked: string | null = null;
        try {
          parked = sessionStorage.getItem(PENDING_REC_KEY(caseId));
        } catch {
          /* storage unavailable */
        }
        if (parked && parked.trim().length >= 20) {
          try {
            sessionStorage.removeItem(PENDING_REC_KEY(caseId));
          } catch {
            /* ignore */
          }
          setFinalRec(parked);
          // Defer so the attempt below is loaded before we submit against it.
          setResumeRec(parked);
        }
      }
      try {
        const summary = await startAttempt(caseId, tok);
        if (cancelled) return;
        setAttempt(summary);
        trackAction('start_case', 'case', initialCase.title, { case_id: caseId, type: initialCase.type, difficulty: initialCase.difficulty });
        const detail = await getAttempt(summary.attempt_id, tok);
        if (cancelled) return;
        setCaseDetail(detail.case);
        setMessages(detail.messages);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to start session');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [caseId, router]);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, draftAssistant?.text, composerH]);

  // Track the composer's real height so the thread's bottom padding always
  // clears it. ResizeObserver catches every cause of growth: the quota banner
  // appearing, the textarea wrapping to a second line, the mic waveform
  // swapping in, and mobile viewport changes.
  useEffect(() => {
    const el = composerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry?.contentRect?.height ?? el.offsetHeight;
      // +24px breathing room so the last bubble never kisses the composer.
      setComposerH(Math.ceil(h) + 24);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [lockedOverlay]);

  // Load today's voice/scan allowance once we have a token, so the composer can
  // show "≈X min voice left" and disable the mic gracefully at 0.
  useEffect(() => {
    if (!token) return;
    let alive = true;
    fetchAiQuota(token).then((q) => { if (alive && q) setQuota(q); });
    return () => { alive = false; };
  }, [token]);

  // Keep a synchronous mirror of `recording` for the timers/handlers that run
  // outside React's render (segment rotation, the window Enter listener).
  useEffect(() => { recordingRef.current = recording; }, [recording]);

  // Auto-grow the composer so a long transcript is readable instead of trapped
  // in a 40px slot. Grows with the text up to COMPOSER_MAX_PX, then scrolls.
  // Runs whenever the value changes — typed OR appended by dictation.
  useEffect(() => {
    const el = composerTextRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, COMPOSER_MAX_PX)}px`;
  }, [composer, recording]);

  // While recording the textarea may not hold focus (you are talking, not
  // typing), so Enter is caught at the window: first Enter stops the mic and
  // flushes the transcript into the box; a second Enter (now idle) sends it.
  useEffect(() => {
    if (recording !== 'recording') return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        finalizeMic();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [recording]);

  // Clean the mic up if the component unmounts mid-recording (navigation away)
  // so the microphone light does not stay on.
  useEffect(() => () => { hardStopMic(); }, []);

  /**
   * A CURRENT, non-expired access token. The component captured `token` once at
   * mount; a case interview easily outlives a Supabase access token, and the old
   * code kept posting the stale one — which is exactly the "invalid token" the
   * mic and Send started throwing part-way through a long session. getSession()
   * returns the live token and refreshes it when it is at/near expiry; we also
   * push the fresh value back into state so subsequent reads are current.
   */
  async function freshToken(): Promise<string | null> {
    try {
      const supabase = createClient();
      let { data: { session } } = await supabase.auth.getSession();
      const now = Math.floor(Date.now() / 1000);
      if (session?.expires_at && session.expires_at - now < 60) {
        const { data } = await supabase.auth.refreshSession();
        if (data.session) session = data.session;
      }
      if (session?.access_token) {
        if (session.access_token !== token) setToken(session.access_token);
        return session.access_token;
      }
    } catch {
      /* fall back to whatever we last held */
    }
    return token;
  }

  // Refreshed on every render — see sendRef above.
  sendRef.current = send;

  /**
   * Returns whether the turn actually landed. Talk mode needs to know: it drives
   * itself in a loop, and a turn that fails for a NON-transient reason (the
   * attempt hit MAX_MESSAGES_PER_ATTEMPT, the token expired, the tier lapsed)
   * would otherwise be retried forever, paying for a Whisper transcription on
   * every pass. Typed callers ignore the value and are unaffected.
   */
  async function send(kind: 'text' | 'voice' = 'text', content?: string): Promise<boolean> {
    const text = (content ?? composer).trim();
    if (!text || !attempt || sending) return false;
    // Always post with a live token — a long interview outlives the one we
    // captured at mount (see freshToken).
    const authTok = await freshToken();
    if (!authTok) return false;

    const optimisticUser: AttemptMessage = {
      id: `tmp-${Date.now()}`,
      role: 'user',
      kind,
      content: text,
      is_clarification: false,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimisticUser]);
    trackAction('send_message', 'case', kind === 'voice' ? 'Voice message' : 'Text message', { case_id: caseId });
    setComposer('');
    composerVoiceRef.current = false; // draft is spent — next draft starts fresh
    setSending(true);
    setDraftAssistant({ id: 'draft', role: 'assistant', text: '' });

    try {
      const result = await postMessageStream(
        attempt.attempt_id,
        authTok,
        { content: text, kind },
        {
          onMeta: (meta) => {
            setAttempt((a) => a ? { ...a, clarification_remaining: meta.clarification_remaining, clarification_used: a.clarification_quota - meta.clarification_remaining } : a);
          },
          onToken: (chunk) => {
            setDraftAssistant((d) => (d ? { ...d, text: d.text + chunk } : d));
            // Talk mode listens here. No-op when the overlay is closed.
            tokenSinkRef.current?.(chunk);
          },
          onDone: () => {
            doneSinkRef.current?.();
          },
          onError: (err) => toast.error(err),
        },
      );
      const detail = await getAttempt(attempt.attempt_id, authTok);
      setMessages(detail.messages);
      setAttempt(detail.attempt);
      // Fire ONLY when the backend actually declined this turn's clarification.
      // The old condition (`quotaRemaining === 0 && assistantText === ''`) also
      // fired when a free user asked their FIRST question (quota was 0 by
      // design) and whenever a stream errored out on the last question — which
      // is how a brand-new user got "Clarification quota used up" before they
      // had asked anything.
      if (result.clarificationsSpent) {
        toast.message(
          attempt.clarification_quota
            ? `You've used all ${attempt.clarification_quota} clarification questions`
            : "You've used all your clarification questions",
          { description: 'The interviewer will keep responding — state your assumption and walk through your structure.' },
        );
      }
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Send failed');
      setMessages((m) => m.filter((x) => x.id !== optimisticUser.id));
      return false;
    } finally {
      setSending(false);
      setDraftAssistant(null);
    }
  }

  // ── Dictation (continuous, VAD-endpointed) ───────────────────────────────
  // The mic OPENS and STAYS OPEN. A rolling MediaRecorder always runs; the Vad
  // watches the same stream and, on each pause, the current phrase's recorder is
  // stopped + sent to Whisper while the next one starts at once — so listening
  // never breaks and text lands phrase by phrase. Enter / ✓ finishes (flush +
  // review); ✗ cancels (already-transcribed text stays). Send is disabled while
  // recording so speech is reviewed first; a second Enter, once idle, sends it.
  //
  // Every recorder owns its OWN chunk array (chunksMapRef) so starting the next
  // one can never clobber the one still being finalised. Nothing here throws:
  // getUserMedia, MediaRecorder construction/start and every stop() are guarded,
  // and stop() always reaches idle via BOTH the drain callback and an 8s safety
  // timeout, so a dead track can never strand the UI at "transcribing".

  /** Set the recording state AND its synchronous mirror (timers/handlers read the ref). */
  function setRec(s: 'idle' | 'recording' | 'transcribing') {
    recordingRef.current = s;
    setRecording(s);
  }

  function appendToComposer(text: string) {
    const clean = text.trim();
    if (!clean) return;
    composerVoiceRef.current = true; // this draft carries dictated speech
    setComposer((prev) => {
      const base = prev.trimEnd();
      return base ? `${base} ${clean}` : clean;
    });
  }

  /** Transcribe ONE phrase. Chained so phrases land in the order they were spoken. */
  function enqueuePhrase(blob: Blob) {
    if (blob.size === 0) return;
    transcribeChainRef.current = transcribeChainRef.current
      .catch(() => {}) // a failed phrase must never stall the ones behind it
      .then(async () => {
        try {
          const tok = await freshToken(); // long takes outlive the mount token
          const { text, quota: q } = await transcribeAudio(blob, tok || undefined);
          if (q) setQuota(q); // keep "minutes left" exact from the server
          if (text) appendToComposer(text);
          if (q && !q.voice.unlimited && q.voice.remaining_min <= 0 && keepRecordingRef.current) {
            toast.error('Daily voice limit reached — what you said is saved; you can keep typing.');
            stopMic(); // flush what is open + go idle
          }
        } catch (e) {
          // Keep every phrase already in the box; only THIS one is lost.
          toast.error(e instanceof Error ? e.message : 'Part of that could not be transcribed — please re-record it.');
        }
      });
  }

  /** Start a fresh rolling recorder on the open stream. Each recorder is given
   *  its OWN chunk array (registered in chunksMapRef) so finalising one can never
   *  race the next. */
  function startCapture() {
    const stream = micStreamRef.current;
    if (!stream || !keepRecordingRef.current) return;
    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(stream);
    } catch {
      return; // stream ended between checks — release paths handle the state
    }
    const chunks: BlobPart[] = [];
    chunksMapRef.current.set(mr, chunks);
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    mediaRecorderRef.current = mr;
    recStartedAtRef.current = performance.now();
    try { mr.start(); } catch { /* dead track — release paths recover */ }
  }

  /** Stop this recorder and SEND its audio to Whisper (a real, spoken phrase).
   *  `final` = this is the closing flush after a stop: release the mic and go
   *  idle, but only once the blob is captured. */
  function transcribeRecorder(mr: MediaRecorder, final = false) {
    mr.onstop = () => {
      const chunks = chunksMapRef.current.get(mr) ?? [];
      chunksMapRef.current.delete(mr);
      // The recorder's OWN mime type — Safari records audio/mp4, not webm.
      const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
      if (!micCancelledRef.current) enqueuePhrase(blob);
      if (final) {
        // Release the mic only NOW — stopping the track any earlier can truncate
        // this recorder's final dataavailable and clip the last phrase.
        micStreamRef.current?.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
        setMicStream(null);
        transcribeChainRef.current = transcribeChainRef.current.then(() => {
          if (recordingRef.current === 'transcribing') setRec('idle');
        });
      }
    };
    try { mr.stop(); } catch { /* already stopping */ }
  }

  /** Stop this recorder and THROW ITS AUDIO AWAY (silence between phrases). */
  function discardRecorder(mr: MediaRecorder) {
    mr.onstop = () => { chunksMapRef.current.delete(mr); };
    try { mr.stop(); } catch { /* already stopping */ }
  }

  /** VAD says the phrase ended: flush it to Whisper and immediately roll a fresh
   *  recorder so the next phrase is never clipped. */
  function flushUtterance() {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === 'recording') transcribeRecorder(mr);
    if (keepRecordingRef.current) startCapture();
  }

  /** Between phrases the rolling recorder is only capturing silence; recycle it
   *  periodically so a long think is not uploaded as dead air. Never fires while
   *  a phrase is in progress. */
  function recycleIfIdle() {
    if (!keepRecordingRef.current || recordingRef.current !== 'recording') return;
    if (utteringRef.current) return;
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state !== 'recording') return;
    if (performance.now() - recStartedAtRef.current < IDLE_RECYCLE_MS) return;
    discardRecorder(mr);
    startCapture();
  }

  /** Tear down the VAD, recycle timer and stream. Never touches React state. */
  function teardownMic() {
    vadRef.current?.stop();
    vadRef.current = null;
    if (recycleTimerRef.current) { clearInterval(recycleTimerRef.current); recycleTimerRef.current = null; }
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    setMicStream(null);
  }

  async function startMic() {
    // Guard on the REF, not the state: `recording` state stays 'idle' during the
    // getUserMedia await, so a second tap in that window would otherwise open a
    // second mic. Claim synchronously; keepRecordingRef lets a cancel/unmount
    // during the await revoke the claim so we release the just-granted stream.
    if (recordingRef.current !== 'idle' || sending) return;
    recordingRef.current = 'recording';
    keepRecordingRef.current = true;
    micCancelledRef.current = false;
    utteringRef.current = false;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      recordingRef.current = 'idle';
      keepRecordingRef.current = false;
      toast.error('Microphone permission denied');
      return;
    }
    if (!keepRecordingRef.current) {
      // Cancelled or unmounted while permission was pending → let the mic go.
      stream.getTracks().forEach((t) => t.stop());
      recordingRef.current = 'idle';
      return;
    }
    micStreamRef.current = stream;
    setMicStream(stream); // drive the live waveform
    // The mic can vanish mid-take (unplugged, grabbed by another app, permission
    // revoked). Without this the UI would sit at "Listening" against a dead track.
    stream.getAudioTracks().forEach((t) =>
      t.addEventListener('ended', () => {
        if (recordingRef.current === 'recording') {
          toast.error('Microphone disconnected — what was transcribed is saved.');
          stopMic();
        }
      }),
    );
    startCapture();
    const vad = new Vad(
      stream,
      {
        onSpeechStart: () => { utteringRef.current = true; },
        // A too-short blip drops back to silent WITHOUT onSpeechEnd; clear the
        // guard so recycleIfIdle can reclaim it.
        onStateChange: (s) => { if (s === 'silent') utteringRef.current = false; },
        onSpeechEnd: () => {
          utteringRef.current = false;
          if (keepRecordingRef.current) flushUtterance();
        },
      },
      { silenceMs: VAD_SILENCE_MS, minUtteranceMs: VAD_MIN_UTTERANCE_MS, maxUtteranceMs: VAD_MAX_UTTERANCE_MS },
    );
    vadRef.current = vad;
    try {
      vad.start();
    } catch {
      // Web Audio unavailable — fall back is impossible, so end cleanly.
      toast.error('Voice input is not available in this browser.');
      keepRecordingRef.current = false;
      teardownMic();
      setRec('idle');
      return;
    }
    recycleTimerRef.current = setInterval(recycleIfIdle, 1000);
    setRec('recording');
  }

  /** Hard stop, no transcription — unmount cleanup so the OS mic light dies. */
  function hardStopMic() {
    keepRecordingRef.current = false;
    micCancelledRef.current = true;
    const mr = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (mr && mr.state === 'recording') { try { mr.stop(); } catch { /* already stopped */ } }
    teardownMic();
  }

  /** STOP + keep: flush the phrase in progress, then land as idle once every
   *  queued phrase has drained. Idle is reached via the drain callback AND an 8s
   *  safety timeout, so a recorder whose onstop never fires cannot strand us. */
  function stopMic() {
    if (recordingRef.current !== 'recording') return;
    keepRecordingRef.current = false;
    utteringRef.current = false;
    setRec('transcribing');
    // Stop the VAD + recycle timer FIRST so nothing opens a new capture.
    vadRef.current?.stop();
    vadRef.current = null;
    if (recycleTimerRef.current) { clearInterval(recycleTimerRef.current); recycleTimerRef.current = null; }
    const mr = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (mr && mr.state === 'recording' && !micCancelledRef.current) {
      transcribeRecorder(mr, true); // flush final phrase; releases the mic in onstop
    } else {
      // Nothing open to flush → release the mic now, idle when the queue drains.
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      setMicStream(null);
      transcribeChainRef.current = transcribeChainRef.current.then(() => {
        if (recordingRef.current === 'transcribing') setRec('idle');
      });
    }
    // Fail-safe: never hang on "transcribing" AND never leave the mic open, in the
    // unlikely event a stop's onstop never fires (e.g. a track killed by the OS).
    setTimeout(() => {
      if (recordingRef.current === 'transcribing') {
        micStreamRef.current?.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
        setMicStream(null);
        setRec('idle');
      }
    }, 8000);
  }

  /** CANCEL: stop and discard only the in-flight audio — anything already
   *  transcribed into the box stays (nothing said is silently thrown away). */
  function cancelMic() {
    keepRecordingRef.current = false;
    micCancelledRef.current = true;
    utteringRef.current = false;
    vadRef.current?.stop();
    vadRef.current = null;
    if (recycleTimerRef.current) { clearInterval(recycleTimerRef.current); recycleTimerRef.current = null; }
    const mr = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (mr && mr.state === 'recording') discardRecorder(mr);
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    setMicStream(null);
    setRec('idle');
  }

  /** Check button / Enter while recording: stop + flush the transcript. */
  function finalizeMic() {
    if (recordingRef.current === 'recording') stopMic();
  }

  function micButtonClick() {
    if (recording === 'recording') { cancelMic(); return; }
    if (recording === 'idle') {
      if (voiceOut) {
        toast.error(`Daily voice limit reached (${quota?.voice.limit_min} min). Resets at midnight IST — you can still type.`);
        return;
      }
      startMic();
    }
  }

  // Composer Send. Disabled while recording (finalise first, then send), so
  // speech is always reviewed before the interviewer sees it. Content dictated
  // this cycle posts as 'voice' to preserve the existing turn-counting.
  function handleComposerSend() {
    if (recording !== 'idle') return;
    send(composerVoiceRef.current ? 'voice' : 'text');
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !attempt || !token) return;
    e.target.value = '';
    toast.message('Uploading…');
    try {
      const res = await uploadAttemptFile(attempt.attempt_id, token, file);
      setMessages((m) => [...m, res.message]);
      trackAction('upload_image', 'case', file.name, { case_id: caseId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  // Finish an OAuth-interrupted submit. Waits for `attempt` + `token` so it
  // never fires against a half-loaded session, and clears `resumeRec` first so
  // a re-render cannot double-submit and score the same answer twice.
  useEffect(() => {
    if (!resumeRec || !attempt || !token || isGuest || submitting) return;
    const rec = resumeRec;
    setResumeRec(null);
    void (async () => {
      setSubmitting(true);
      try {
        const res = await submitAttempt(attempt.attempt_id, token, rec);
        const resultsPath = `/results/${res.submission_id}`;
        try {
          sessionStorage.setItem('mece:after-onboarding', resultsPath);
        } catch {
          /* ignore */
        }
        router.push(resultsPath);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Submit failed');
        setSubmitting(false);
      }
    })();
  }, [resumeRec, attempt, token, isGuest, submitting, router]);

  async function handleSubmit(overrideText?: string) {
    if (!attempt || !token || submitting) return;
    const rec = (overrideText ?? finalRec).trim();
    if (rec.length < 20) {
      toast.error('Your recommendation should be at least a couple of sentences.');
      return;
    }

    // ── GUEST MODE (0045): the wall lives HERE, at submit ──────────────
    // A guest works the whole case — clarifications, structure, arithmetic,
    // recommendation — with no account. The account is asked for at the single
    // moment it is worth something to them: the score.
    //
    // This is only defensible because anonymous auth means conversion keeps the
    // SAME auth.users row. The attempt, every message in it and the draft
    // recommendation already belong to this user; signing up attaches an
    // identity to the account rather than creating a new one. Nothing they
    // typed is copied, re-parented or lost — which is exactly why a wall this
    // late is safe to put here at all.
    //
    // We stash the recommendation first: the wall unmounts the composer, and
    // losing 15 minutes of work to a state reset at the conversion moment would
    // be the single worst bug in this feature.
    if (isGuest) {
      setPendingRec(rec);
      // ALSO persist it. The Google / LinkedIn path is a full-page redirect to
      // the provider and back, which destroys every piece of React state on
      // this screen — including the recommendation the user just spent the
      // session writing. React state alone is only safe for the email path.
      // Keyed by case so two tabs on different cases cannot overwrite each
      // other's draft.
      try {
        sessionStorage.setItem(PENDING_REC_KEY(caseId), rec);
        // Park the RETURN PATH too, for the OAuth route specifically.
        // Google/LinkedIn come back to /cases/<id>, but the user is by then a
        // real, not-yet-onboarded account — so middleware's onboarding gate
        // redirects them to /onboarding BEFORE this component can mount and
        // resume the submit. Without this line the onboarding form has no idea
        // where they came from and drops them on the dashboard, leaving a
        // finished answer stranded in sessionStorage and never scored.
        // The email path never needs this (it converts in-page, no redirect),
        // and it is overwritten with the real /results/<id> path the moment a
        // submit succeeds.
        sessionStorage.setItem('mece:after-onboarding', `/cases/${caseId}`);
      } catch {
        /* private mode — the email path still works from React state */
      }
      setSaveWallOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitAttempt(attempt.attempt_id, token, rec);
      trackAction('submit_case', 'case', initialCase.title, { case_id: caseId, attempt_id: attempt.attempt_id });
      router.push(`/results/${res.submission_id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submit failed');
      setSubmitting(false);
    }
  }

  /**
   * Called by GuestSaveWall once an identity is attached. The Supabase session
   * is the same one — only `is_anonymous` changed — but the ACCESS TOKEN in
   * `token` is now stale (it still carries `is_anonymous: true`, which the
   * backend reads). Refresh it before submitting or the server sees a guest and
   * refuses the very submit the user just signed up to make.
   */
  async function handleConverted() {
    setSaveWallOpen(false);
    setIsGuest(false);
    const supabase = createClient();
    const { data } = await supabase.auth.refreshSession();
    const convertedTok = data.session?.access_token ?? token;
    setToken(convertedTok ?? null);

    const rec = pendingRec;
    setPendingRec('');
    if (!attempt || !convertedTok || !rec) return;

    setSubmitting(true);
    try {
      const res = await submitAttempt(attempt.attempt_id, convertedTok, rec);
      const resultsPath = `/results/${res.submission_id}`;
      // A just-converted guest has no onboarding row, so middleware will bounce
      // them from the results page straight to /onboarding — and the gate
      // strips query params, so `?next=` cannot survive it. Park the
      // destination here and let the onboarding form pick it up, otherwise
      // they finish onboarding on the dashboard and their analysis — the whole
      // reason they signed up — is left behind a link they were never shown.
      try {
        sessionStorage.setItem('mece:after-onboarding', resultsPath);
      } catch {
        /* private mode / storage disabled — they land on the dashboard, which
           still lists the submission. Never let this break the redirect. */
      }
      router.push(resultsPath);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submit failed');
      setSubmitting(false);
    }
  }

  // No full-screen blocker: the case prompt (initialCase) renders immediately on
  // the left while the live session boots — the engaging loader fills the chat.
  // Every tier now carries a real per-attempt clarification quota (free 7 /
  // lite 12 / pro 20 — see backend CLARIFICATION_QUOTA + TIER_LIMITS), so the
  // counter renders for everyone. The 2026-06-20 fix hid it whenever the quota
  // was 0 to avoid an alarming red "Questions remaining: 0"; that was the right
  // call then but it left free users with NO signal at all. The guard stays
  // only for legacy in-flight attempts that still carry a 0 quota baked in at
  // tier_at_start (migration 0043 backfills those).
  const hasClarifications = (attempt?.clarification_quota ?? 0) > 0;
  const remaining = attempt?.clarification_remaining || 0;
  const quotaExhausted = hasClarifications && remaining <= 0;

  // Voice-input allowance (per-tier, resets midnight IST). null while still loading.
  const voiceUnlimited = quota?.voice.unlimited === true;   // Pro pipeline = unlimited
  const voiceLeft = quota?.voice.remaining_min ?? null;
  const voiceOut = !voiceUnlimited && voiceLeft !== null && voiceLeft <= 0;

  // Talk mode (Pro). This is the UI gate ONLY — routes/speak.py enforces the
  // tier server-side, because a client flag is a suggestion. Guests are blocked
  // at the API too.
  //
  // The `speak` quota block only exists on a backend that has the /speak route,
  // so its ABSENCE is the deploy-order signal: requiring it means a frontend
  // shipped ahead of its backend simply does not offer talk mode, rather than
  // offering a button that 404s the moment the interviewer tries to speak.
  const speakQuota = quota?.speak ?? null;
  const speakOut = speakQuota !== null && !speakQuota.unlimited && speakQuota.remaining_min <= 0;
  const isPro = attempt?.tier === 'pro';

  /**
   * ONE state, not three booleans.
   *
   * The first version of this vanished the button for a Pro user whose daily
   * minutes were spent, or whose backend predated /speak — which is exactly the
   * failure that took an hour to diagnose in production ("I can't see the voice
   * button"), except aimed at the paying tier. A feature that silently
   * disappears is indistinguishable from a broken one.
   *
   *   active      — Pro, in credit: go
   *   unavailable — Pro, but out of minutes or the backend lacks /speak. SHOW it
   *                 and say why; never just remove it.
   *   locked      — Free/Lite: show it, name the tier, link to upgrade.
   *   hidden      — guests only. They have no tier to upgrade from; the
   *                 save-wall is the right ask.
   */
  const talkState: 'active' | 'unavailable' | 'locked' | 'hidden' =
    !VOICE_INTERVIEW_ENABLED ? 'hidden'          // owner decision: not ROI positive
      : isGuest || !attempt ? 'hidden'
      : !isPro ? 'locked'
      : voiceOut || speakOut ? 'unavailable'
      : speakQuota === null ? 'unavailable'
      : 'active';

  const talkUnavailableReason =
    voiceOut || speakOut
      ? 'Daily voice limit reached — resets at midnight IST'
      : 'Voice interview is not available right now';

  // Case prompt + hint + previous attempts. Rendered as the desktop sidebar AND
  // inside the mobile drawer (opened from the chat bar) so the phone is chat-first.
  const caseContext = (
    <div className="flex h-full flex-col overflow-y-auto bg-card">
      <header className="shrink-0 border-b bg-card px-5 py-4">
        <Link href="/practice" className="mb-3 inline-flex items-center gap-1 text-micro text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Practice
        </Link>
        <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-widest text-muted-foreground">
          <span>{CASE_TYPE_LABELS[caseDetail.type] || caseDetail.type}</span>
          <span>·</span>
          <span>{DIFFICULTY_LABELS[caseDetail.difficulty] || caseDetail.difficulty}</span>
        </div>
        <h1 className="mt-1 text-h4 font-semibold leading-tight text-foreground">{caseDetail.title}</h1>
      </header>
      <div className="p-5 flex-1 space-y-8">
        <div>
          {caseDetail.type !== 'guesstimate' && (
            <div className="text-small leading-relaxed text-foreground whitespace-pre-wrap">
              {renderWithBold(caseDetail.content)}
            </div>
          )}
          {(caseDetail.hint || caseDetail.type === 'guesstimate') && (
            <details className="group mt-4">
              <summary className="cursor-pointer select-none text-small font-medium text-primary hover:underline">
                <span className="group-open:hidden">Show hint</span>
                <span className="hidden group-open:inline">Hide hint</span>
              </summary>
              <div className="mt-2 rounded bg-accent px-3 py-2 text-small leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {caseDetail.type === 'guesstimate' && (
                  <div className={caseDetail.hint ? 'mb-3 pb-3 border-b border-border/50' : ''}>
                    <span className="font-semibold text-foreground uppercase tracking-widest text-micro mb-1 block">Framework / Context</span>
                    {renderWithBold(caseDetail.content)}
                  </div>
                )}
                {caseDetail.hint && (
                  <div>
                    {caseDetail.type === 'guesstimate' && <span className="font-semibold text-foreground uppercase tracking-widest text-micro mb-1 block">Hint</span>}
                    {renderWithBold(caseDetail.hint)}
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
        {historyPanel && <div className="pt-6 border-t">{historyPanel}</div>}
      </div>
    </div>
  );

  return (
    <div className="fixed top-0 xl:top-16 left-0 right-0 bottom-0 flex flex-col lg:flex-row bg-background overflow-hidden z-30 shadow-2xl">
      
      {/* --------------------------------------------------------- */}
      {/* 1. LEFT PANEL: Case Context & History                      */}
      {/* --------------------------------------------------------- */}
      <div className="hidden w-full lg:flex lg:w-[35%] xl:w-[30%] flex-col border-r bg-card lg:h-full overflow-y-auto">
        <header className="shrink-0 border-b bg-card px-5 py-4">
          <Link href="/practice" className="mb-3 inline-flex items-center gap-1 text-micro text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Practice
          </Link>
          <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-widest text-muted-foreground">
            <span>{CASE_TYPE_LABELS[caseDetail.type] || caseDetail.type}</span>
            <span>·</span>
            <span>{DIFFICULTY_LABELS[caseDetail.difficulty] || caseDetail.difficulty}</span>
          </div>
          <h1 className="mt-1 text-h4 font-semibold leading-tight text-foreground">
            {caseDetail.title}
          </h1>
        </header>
        
        <div className="p-5 flex-1 space-y-8">
          <div>
            {caseDetail.type !== 'guesstimate' && (
              <div className="text-small leading-relaxed text-foreground whitespace-pre-wrap">
                {renderWithBold(caseDetail.content)}
              </div>
            )}
            {(caseDetail.hint || caseDetail.type === 'guesstimate') && (
              <details className="group mt-4">
                <summary className="cursor-pointer select-none text-small font-medium text-primary hover:underline">
                  <span className="group-open:hidden">Show hint</span>
                  <span className="hidden group-open:inline">Hide hint</span>
                </summary>
                <div className="mt-2 rounded bg-accent px-3 py-2 text-small leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {caseDetail.type === 'guesstimate' && (
                    <div className={caseDetail.hint ? "mb-3 pb-3 border-b border-border/50" : ""}>
                      <span className="font-semibold text-foreground uppercase tracking-widest text-micro mb-1 block">Framework / Context</span>
                      {renderWithBold(caseDetail.content)}
                    </div>
                  )}
                  {caseDetail.hint && (
                    <div>
                      {caseDetail.type === 'guesstimate' && <span className="font-semibold text-foreground uppercase tracking-widest text-micro mb-1 block">Hint</span>}
                      {renderWithBold(caseDetail.hint)}
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
          
          {historyPanel && (
            <div className="pt-6 border-t">
              {historyPanel}
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 2. RIGHT PANEL: Chat Window                                */}
      {/* --------------------------------------------------------- */}
      <div 
        className="flex flex-1 flex-col relative h-full bg-muted/20"
        style={{
          backgroundImage: 'radial-gradient(circle at center, hsl(var(--foreground)/0.03) 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Top bar for right panel */}
        <div className="shrink-0 border-b bg-card/50 backdrop-blur-sm px-5 py-3 flex justify-between items-center z-10 shadow-sm">
           <div className="text-small font-semibold text-foreground/80 flex items-center gap-2">
             <Link href="/practice" aria-label="Back to Practice" className="lg:hidden -ml-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition">
               <ArrowLeft className="h-5 w-5" />
             </Link>
             <Sheet open={contextOpen} onOpenChange={setContextOpen}>
               <SheetTrigger
                 className="lg:hidden -ml-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                 aria-label="Case details & previous attempts"
               >
                 <Menu className="h-5 w-5" />
               </SheetTrigger>
               <SheetContent side="left" className="w-[88%] max-w-sm p-0">
                 {caseContext}
               </SheetContent>
             </Sheet>
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
             Live Case Session
           </div>
           {!lockedOverlay && attempt && (
             <div className="flex items-center gap-3">
               {hasClarifications && (
                 <ClarificationCounter remaining={remaining} quota={attempt.clarification_quota} />
               )}
               <Button size="sm" onClick={() => setSubmitOpen(true)} className="h-8 bg-primary text-primary-foreground hover:bg-primary-hover">
                 Submit
               </Button>
             </div>
           )}
        </div>

        {/* Chat Thread */}
        <div
          ref={threadRef}
          className="flex-1 overflow-y-auto px-4 lg:px-8 py-6"
          style={{ paddingBottom: composerH }}
        >
          <div className="mx-auto max-w-3xl space-y-4">
            {lockedOverlay ? (
              <div className="space-y-4 opacity-40 blur-[2px] pointer-events-none select-none">
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-body">
                    Welcome to the case interview. I'll be your interviewer today. Let me know when you're ready to begin structuring your thoughts.
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2 text-body">
                    I'm ready. Can I take a minute to structure my approach?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-body">
                    Of course. Take your time. Let me know what you want to look at first.
                  </div>
                </div>
              </div>
            ) : loading ? (
              <EngagingLoader variant="inline" label="Connecting you to your interviewer…" />
            ) : (
              <>
                {messages.map((m) => (<MessageBubble key={m.id} message={m} />))}
                {draftAssistant && draftAssistant.text && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%]">
                      <p className="mb-1 text-micro font-semibold uppercase tracking-widest text-muted-foreground">Interviewer</p>
                      <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-body text-foreground">
                        {draftAssistant.text}
                        <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-foreground/40 align-middle" />
                      </div>
                    </div>
                  </div>
                )}
                {sending && !draftAssistant?.text && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%]">
                      <p className="mb-1 text-micro font-semibold uppercase tracking-widest text-muted-foreground">Interviewer</p>
                      <div className="rounded-2xl bg-muted px-4 py-2 text-small text-muted-foreground">
                        <Loader2 className="inline h-3 w-3 animate-spin" /> thinking…
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Locked Overlay Block */}
        {lockedOverlay && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/5 backdrop-blur-[2px] p-4">
             {lockedOverlay}
          </div>
        )}

        {/* ------------------------- */}
        {/* 3. Composer                */}
        {/* ------------------------- */}
        {!lockedOverlay && (
          <div ref={composerRef} className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] bg-gradient-to-t from-muted/50 via-muted/30 to-transparent">
            <div className="mx-auto max-w-3xl">
              {quotaExhausted && (
                <p className="mb-3 rounded-lg border bg-card px-4 py-2 text-small text-foreground/80 shadow-sm text-center">
                  You&rsquo;ve used all {attempt?.clarification_quota} clarification questions. Keep sharing your
                  structure and calculations &mdash; the interviewer still responds. Hit <span className="font-semibold text-primary cursor-pointer hover:underline" onClick={() => setSubmitOpen(true)}>Submit</span> when ready.
                </p>
              )}
              
              {voiceLeft !== null && (
                <div className="mb-2 flex items-center justify-end gap-1.5 px-2 text-micro text-muted-foreground">
                  <Mic className="h-3 w-3" />
                  {voiceUnlimited
                    ? <span>Voice included — unlimited</span>
                    : voiceOut
                    ? <span className="text-rose-600 dark:text-rose-400">Daily voice limit reached — type your answer</span>
                    : <span>≈{voiceLeft} min voice left today</span>}
                </div>
              )}
              {useRealtime && isPro && (
                <div className="mb-2 flex justify-end px-2">
                  <RealtimeMinutes />
                </div>
              )}

              {/* Live waveform sits ABOVE the box (not in place of it), so the
                  textarea stays visible and the transcript is readable as it
                  streams in segment by segment. */}
              {recording !== 'idle' && (
                <div className="mb-2 flex items-center gap-3 rounded-2xl bg-primary/5 px-3 py-2">
                  <MicWaveform stream={micStream} className="h-6 flex-1 text-primary" />
                  <span className="shrink-0 text-micro font-medium text-primary/80">
                    {recording === 'transcribing' ? 'Finishing up…' : 'Listening — keep talking, pause to add · Enter or ✓ to finish'}
                  </span>
                </div>
              )}

              <div className="flex items-end gap-2 rounded-[24px] border bg-card p-1.5 pl-3 shadow-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 rounded-full p-2 mb-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" aria-label="Attach a file">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf,.doc,.docx,.txt" onChange={handleFile} />

                <textarea
                  ref={composerTextRef}
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      // Enter while recording is caught at the window (stop +
                      // flush). Here we only handle the idle case: send. Either
                      // way we swallow the newline.
                      e.preventDefault();
                      if (recording === 'idle') handleComposerSend();
                    }
                  }}
                  placeholder={recording !== 'idle'
                    ? 'Listening… your words appear here — edit before sending'
                    : !hasClarifications ? 'Share your structure and analysis…' : quotaExhausted ? 'Share your structure, notes or calculations…' : 'Ask a clarification or share your structure…'}
                  className="min-h-[40px] max-h-[240px] flex-1 resize-y overflow-y-auto bg-transparent py-2.5 px-1 text-[15px] outline-none placeholder:text-muted-foreground leading-tight"
                  rows={1}
                  maxLength={MESSAGE_MAX_CHARS}
                />

                <div className="flex items-center gap-1.5 pr-1 mb-0.5">
                  {/* TALK MODE — a distinct MODE, not another mic. Deliberately
                      styled as a filled pill with a headphones icon so it can
                      never be mistaken for the dictation mic sitting beside it:
                      one dictates text, the other starts a spoken interview. */}
                  {talkState === 'active' && recording === 'idle' && (
                    <button
                      type="button"
                      onClick={() => { primeAudioPlayback(); setTalkMode(true); }}
                      disabled={sending}
                      className="relative shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-2 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Start voice interview"
                      title="Voice interview — speak with the interviewer and hear them reply"
                    >
                      <VoiceWave className="h-5 w-5" />
                      <span className="hidden sm:inline text-micro font-semibold uppercase tracking-wide">Talk</span>
                    </button>
                  )}

                  {/* Pro, but temporarily unavailable. Present and explained,
                      never silently removed — a missing button is read as a
                      broken product. */}
                  {talkState === 'unavailable' && recording === 'idle' && (
                    <button
                      type="button"
                      onClick={() => toast.message('Voice interview unavailable', { description: talkUnavailableReason })}
                      className="relative shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-muted-foreground/60 transition-colors hover:bg-muted"
                      aria-label={talkUnavailableReason}
                      title={talkUnavailableReason}
                    >
                      <VoiceWave className="h-5 w-5" />
                      <span className="hidden sm:inline text-micro font-semibold uppercase tracking-wide">Talk</span>
                    </button>
                  )}

                  {/* LOCKED for Free and Lite — visible, named, and one tap from
                      the upgrade page. Muted rather than disabled so it reads as
                      "available on Pro", not "broken". */}
                  {talkState === 'locked' && recording === 'idle' && (
                    <button
                      type="button"
                      onClick={() => router.push('/upgrade?from=voice')}
                      className="relative shrink-0 inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-3 py-2 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary"
                      aria-label="Voice interview is a Pro feature — upgrade"
                      title="Voice interview is a Pro feature — tap to upgrade"
                    >
                      <VoiceWave className="h-5 w-5" />
                      <Lock className="h-3 w-3" />
                      <span className="hidden sm:inline text-micro font-semibold uppercase tracking-wide">Talk · Pro</span>
                    </button>
                  )}

                  {/* RECORDING: tick commits the transcription into the composer
                      so it can be edited; cross discards. Send stays disabled
                      until the tick, so speech is never posted un-reviewed. */}
                  {recording === 'recording' ? (
                    <>
                      {/* Both brand red. Hierarchy comes from WEIGHT, not hue:
                          discard is a ghost outline, confirm is solid. Green/red
                          would have read as a system prompt rather than as part
                          of the product. */}
                      <button
                        type="button"
                        onClick={cancelMic}
                        className="shrink-0 rounded-full border border-primary/40 p-2 text-primary transition-colors hover:bg-primary/10"
                        aria-label="Discard recording"
                        title="Discard"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={finalizeMic}
                        className="relative shrink-0 rounded-full bg-primary p-2 text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
                        aria-label="Stop and transcribe into the message box"
                        title="Stop — transcribe the rest, then edit before sending (or press Enter)"
                      >
                        <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" />
                        <Check className="relative h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={micButtonClick} disabled={recording === 'transcribing' || voiceOut} className="relative shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Voice input" title={voiceOut ? 'Daily voice limit reached' : 'Dictate a message'}>
                      {recording === 'transcribing' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
                    </button>
                  )}

                  <Button type="button" onClick={handleComposerSend} disabled={sending || !attempt || recording !== 'idle' || !composer.trim()} size="icon" className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm">
                    <Send className="h-4 w-4 ml-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Realtime is the default: the pipeline below it is ~3.5s per turn
          because it makes two round trips through our backend per exchange,
          and no amount of tuning removes those. Set
          NEXT_PUBLIC_VOICE_REALTIME=0 to fall straight back to the pipeline —
          it still works, so a regression is a config change, not a redeploy. */}
      {talkMode && token && attempt && useRealtime && (
        <VoiceInterviewRealtime
          token={token}
          caseId={caseId}
          attemptId={attempt.attempt_id}
          messages={messages}
          onTurnPersisted={async () => {
            try {
              const detail = await getAttempt(attempt.attempt_id, token);
              setMessages(detail.messages);
              setAttempt(detail.attempt);
            } catch { /* the rail already shows the turn locally */ }
          }}
          onClose={() => setTalkMode(false)}
          onSubmitSession={() => { setTalkMode(false); setSubmitOpen(true); }}
        />
      )}

      {talkMode && token && !useRealtime && (
        <VoiceInterview
          token={token}
          onSend={(text) => sendRef.current!('voice', text)}
          registerTokenSink={(sink) => { tokenSinkRef.current = sink; }}
          registerDoneSink={(sink) => { doneSinkRef.current = sink; }}
          messages={messages}
          voiceOut={voiceOut}
          onQuotaUpdate={setQuota}
          onClose={() => setTalkMode(false)}
          onSubmitSession={() => { setTalkMode(false); setSubmitOpen(true); }}
        />
      )}

      {submitOpen && (
        <SubmitDialog
          finalRec={finalRec}
          setFinalRec={setFinalRec}
          submitting={submitting}
          onClose={() => setSubmitOpen(false)}
          onConfirm={handleSubmit}
          onFileAttach={() => fileInputRef.current?.click()}
        />
      )}

      {/* GUEST MODE (0045): the single conversion moment. Deliberately NOT
          dismissable by clicking away — the user has a finished answer held in
          `pendingRec` and an accidental backdrop click would read as "my work
          vanished". The explicit "keep working" button restores the composer
          with everything intact. */}
      {saveWallOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm">
            <GuestSaveWall
              next={`/cases/${caseId}`}
              onConverted={handleConverted}
              title="Your answer is ready"
              message="Create a free account to see your score across all six dimensions, with written feedback on each. Everything you just wrote is already saved."
            />
            <button
              onClick={() => setSaveWallOpen(false)}
              className="mx-auto mt-3 block text-[12px] font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Not yet — keep working on my answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClarificationCounter({ remaining, quota }: { remaining: number; quota: number }) {
  const danger = remaining <= 1;
  return (
    <div
      className={`hidden shrink-0 rounded-full border px-3 py-1 text-micro font-semibold sm:block ${danger ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300' : 'border-border bg-muted text-foreground/80'}`}
      title={`You can ask ${quota} clarification questions in total.`}
    >
      Questions remaining: {remaining}
    </div>
  );
}

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

function MessageBubble({ message }: { message: AttemptMessage }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    let displayContent = message.content || '';
    if (displayContent.toUpperCase().startsWith('CASE READY:')) {
      const dotIndex = displayContent.indexOf('.');
      if (dotIndex !== -1) {
        displayContent = displayContent.slice(dotIndex + 1).trim();
      }
    }
    
    // Make it sentence case so it doesn't shout
    if (displayContent) {
      displayContent = displayContent.charAt(0).toUpperCase() + displayContent.slice(1).toLowerCase();
    }

    return (
      <div className="flex justify-center my-6">
        <p className="text-micro font-medium text-muted-foreground bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full shadow-sm text-center">
          {displayContent}
        </p>
      </div>
    );
  }

  if (message.kind === 'image' || message.kind === 'file') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-body text-primary-foreground">
          <div className="flex items-center gap-2 text-small font-medium">
            <FileText className="h-4 w-4" />
            <span>{message.content || 'Attachment'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'recommendation') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[90%] rounded-2xl rounded-br-sm border-2 border-primary/30 bg-primary/5 px-4 py-3 text-body text-foreground">
          <div className="mb-1 flex items-center gap-1 text-micro font-semibold uppercase tracking-widest text-primary">
            <Award className="h-3 w-3" /> Final recommendation
          </div>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[85%]">
        {!isUser && (
          <p className="mb-1 text-micro font-semibold uppercase tracking-widest text-muted-foreground">Interviewer</p>
        )}
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2 text-body ${isUser ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted text-foreground'}`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

function SubmitDialog({
  finalRec, setFinalRec, submitting, onClose, onConfirm, onFileAttach
}: {
  finalRec: string;
  setFinalRec: (v: string) => void;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (text?: string) => void;
  onFileAttach: () => void;
}) {
  const dictRef = useRef<DictationHandle>(null);
  const [recording, setRecording] = useState(false);

  // While recording, Send finalizes (transcribe) and submits in one tap.
  async function handleConfirm() {
    let rec = finalRec;
    if (dictRef.current?.isRecording()) {
      const t = await dictRef.current.finalize();
      if (t) { rec = finalRec ? finalRec + ' ' + t : t; setFinalRec(rec); }
    }
    onConfirm(rec);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
      <Card className="w-full max-w-xl p-5">
        <h2 className="text-h4 font-semibold text-foreground">Your final recommendation</h2>
        <p className="mt-1 text-small text-muted-foreground">
          State your conclusion top-down — the recommendation first, then 2-3 reasons. The scorer weights this heavily for synthesis &amp; communication.
        </p>
        <Textarea
          autoFocus
          value={finalRec}
          onChange={(e) => setFinalRec(e.target.value)}
          placeholder="My recommendation is to… because (1)… (2)… (3)… Risks to watch: …"
          className="mt-3 min-h-[160px] resize-none text-base"
          maxLength={RECOMMENDATION_MAX_CHARS}
        />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DictationButton
              ref={dictRef}
              onRecordingChange={setRecording}
              onTranscriptionCompleted={(text) => setFinalRec(finalRec ? finalRec + ' ' + text : text)}
              disabled={submitting}
            />
            <button
              type="button"
              onClick={onFileAttach}
              disabled={submitting}
              title="Attach a file to your transcript before submitting"
              className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>
          <p className="text-small text-muted-foreground">{finalRec.trim().length} / {RECOMMENDATION_MAX_CHARS} characters</p>
        </div>
        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={submitting || (finalRec.trim().length < 20 && !recording)} className="bg-primary text-primary-foreground hover:bg-primary-hover">
            {submitting ? (<><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Scoring…</>) : 'Submit session'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
