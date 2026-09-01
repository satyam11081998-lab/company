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
import { primeAudioPlayback } from '@/lib/voice/tts-queue';

/** Realtime transport unless explicitly switched off. See the mount below. */
const USE_REALTIME = process.env.NEXT_PUBLIC_VOICE_REALTIME !== '0';
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const micCancelledRef = useRef(false);
  const micResolveRef = useRef<((t: string | null) => void) | null>(null);

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
    if (!text || !attempt || !token || sending) return false;

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
    setSending(true);
    setDraftAssistant({ id: 'draft', role: 'assistant', text: '' });

    try {
      const result = await postMessageStream(
        attempt.attempt_id,
        token,
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
      const detail = await getAttempt(attempt.attempt_id, token);
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

  // Mic flow: tap mic -> record; tap square -> CANCEL (discard); the Send button
  // commits by calling finalizeMic() (stop + transcribe) and then send('voice').
  async function startMic() {
    if (recording === 'transcribing' || sending) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream); // drive the live waveform
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      micCancelledRef.current = false;
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setMicStream(null);
        const resolve = micResolveRef.current;
        micResolveRef.current = null;
        if (micCancelledRef.current) { audioChunksRef.current = []; setRecording('idle'); resolve?.(null); return; }
        // The recorder's OWN type, not an assumption — Safari records audio/mp4.
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' });
        if (blob.size === 0) { setRecording('idle'); resolve?.(null); return; }
        setRecording('transcribing');
        try {
          const { text, quota: q } = await transcribeAudio(blob, token || undefined);
          if (q) setQuota(q); // refresh "minutes left" from the server's exact count
          setRecording('idle');
          resolve?.(text || null);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Transcription failed');
          setRecording('idle');
          resolve?.(null);
        }
      };
      mr.start();
      setRecording('recording');
    } catch { toast.error('Microphone permission denied'); }
  }

  function cancelMic() {
    micCancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
    else setRecording('idle');
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

  /**
   * Tick = transcribe INTO the composer. Does not send.
   *
   * Reverses the 2026-06-30 decision that Send should finalize and post in one
   * tap. Owner asked for a review step (2026-08-16): dictation is a drafting
   * tool, and a spoken sentence that Whisper mishears should be fixable before
   * the interviewer sees it — not after, when it is already scored transcript.
   *
   * Appends rather than replaces, so dictating on top of typed text adds to it.
   */
  async function confirmMic() {
    const text = await finalizeMic();
    if (!text) return;
    setComposer((prev) => {
      const base = prev.trimEnd();
      return base ? `${base} ${text}` : text;
    });
  }

  function finalizeMic(): Promise<string | null> {
    return new Promise((resolve) => {
      if (recording !== 'recording' || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') { resolve(null); return; }
      micCancelledRef.current = false;
      micResolveRef.current = resolve;
      mediaRecorderRef.current.stop();
    });
  }

  // Composer Send. While RECORDING the tick owns the transcribe step, so Send is
  // disabled rather than silently posting un-reviewed speech (see confirmMic).
  async function handleComposerSend() {
    if (recording === 'recording') {
      const t = await finalizeMic();
      if (t) await send('voice', t);
      return;
    }
    if (recording === 'transcribing') return;
    send('text');
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
    const freshToken = data.session?.access_token ?? token;
    setToken(freshToken ?? null);

    const rec = pendingRec;
    setPendingRec('');
    if (!attempt || !freshToken || !rec) return;

    setSubmitting(true);
    try {
      const res = await submitAttempt(attempt.attempt_id, freshToken, rec);
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
  const voiceLeft = quota?.voice.remaining_min ?? null;
  const voiceOut = voiceLeft !== null && voiceLeft <= 0;

  // Talk mode (Pro). This is the UI gate ONLY — routes/speak.py enforces the
  // tier server-side, because a client flag is a suggestion. Guests are blocked
  // at the API too.
  //
  // The `speak` quota block only exists on a backend that has the /speak route,
  // so its ABSENCE is the deploy-order signal: requiring it means a frontend
  // shipped ahead of its backend simply does not offer talk mode, rather than
  // offering a button that 404s the moment the interviewer tries to speak.
  const speakQuota = quota?.speak ?? null;
  const speakOut = speakQuota !== null && speakQuota.remaining_min <= 0;
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
                  {voiceOut
                    ? <span className="text-rose-600 dark:text-rose-400">Daily voice limit reached — type your answer</span>
                    : <span>≈{voiceLeft} min voice left today</span>}
                </div>
              )}

              <div className="flex items-end gap-2 rounded-[24px] border bg-card p-1.5 pl-3 shadow-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 rounded-full p-2 mb-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" aria-label="Attach a file">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf,.doc,.docx,.txt" onChange={handleFile} />

                {recording === 'recording' ? (
                  // Live waveform replaces the text field while recording (ChatGPT-style).
                  <div className="flex flex-1 items-center gap-3 py-2 px-1">
                    <MicWaveform stream={micStream} className="h-8 flex-1 text-primary" />
                    <span className="shrink-0 text-small font-medium text-primary/80">Listening…</span>
                  </div>
                ) : (
                  <textarea
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send('text'); } }}
                    placeholder={!hasClarifications ? 'Share your structure and analysis…' : quotaExhausted ? 'Share your structure, notes or calculations…' : 'Ask a clarification or share your structure…'}
                    className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2.5 px-1 text-[15px] outline-none placeholder:text-muted-foreground leading-tight"
                    rows={1}
                    maxLength={MESSAGE_MAX_CHARS}
                  />
                )}

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
                        onClick={confirmMic}
                        className="relative shrink-0 rounded-full bg-primary p-2 text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
                        aria-label="Transcribe into the message box"
                        title="Transcribe — you can edit before sending"
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
      {talkMode && token && attempt && USE_REALTIME && (
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

      {talkMode && token && !USE_REALTIME && (
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
