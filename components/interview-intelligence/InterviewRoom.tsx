'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Mic, Pause, Play, RotateCcw, Square, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ii, IIError, newTurnId } from '@/lib/interview-intelligence/api';
import { clock } from '@/lib/interview-intelligence/format';
import type { IIMe, IIMessage, IIProgress, IISession } from '@/lib/interview-intelligence/types';
import { AccessGate, ErrorNote, Spinner } from './primitives';

/**
 * The interview room (spec §78): one interviewer line, one answer box, nothing else.
 * No scores, no "good answer", no progress-by-competency — evaluation signals change how
 * people answer, so none are shown (and the API never sends any during the interview).
 */
export default function InterviewRoom({ sessionId }: { sessionId: string }) {
  return <AccessGate>{(me) => <Room me={me} sessionId={sessionId} />}</AccessGate>;
}

type Pending = { id: string; content: string; kind: 'text' | 'voice'; answer_ms?: number; skip?: boolean };

function Room({ me, sessionId }: { me: IIMe; sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<IISession | null>(null);
  const [messages, setMessages] = useState<IIMessage[]>([]);
  const [progress, setProgress] = useState<IIProgress | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [showConversation, setShowConversation] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);

  const voiceAvailable = me.flags.voice && typeof window !== 'undefined' && 'MediaRecorder' in window;
  const [voiceOn, setVoiceOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const audio = useRef<HTMLAudioElement | null>(null);
  const shownAt = useRef<number>(Date.now());
  const recordedText = useRef<string>('');

  const interviewerLines = messages.filter((m) => m.role === 'interviewer');
  const current = interviewerLines[interviewerLines.length - 1];
  const status = progress?.status || session?.status;

  const apply = useCallback((msgs: IIMessage[], p: IIProgress, replace = false) => {
    setMessages((prev) => {
      if (replace) return msgs;
      const seen = new Set(prev.map((m) => m.id));
      return [...prev, ...msgs.filter((m) => !seen.has(m.id))];
    });
    setProgress(p);
    if (typeof p.elapsed_s === 'number') setElapsed(p.elapsed_s);
    if (p.status === 'completed') setFinished(true);
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await ii.room(sessionId);
      setSession(r.session);
      if (r.session.status === 'completed' || r.session.status === 'expired') {
        router.replace(`/interview-intelligence/report/${sessionId}`);
        return;
      }
      if (r.session.status === 'ready') {
        const s = await ii.start(sessionId);
        apply(s.messages, s.session, true);
      } else {
        apply(r.messages, r.progress, true);
      }
    } catch (e) {
      setError((e as IIError).message);
    }
  }, [sessionId, apply, router]);

  useEffect(() => { load(); }, [load]);

  // Local clock between server updates (server time is authoritative on every turn).
  useEffect(() => {
    if (status !== 'active') return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  // Mark when the current question appeared, for answer timing.
  useEffect(() => { shownAt.current = Date.now(); }, [current?.id]);

  // Speak new interviewer lines when voice is on; any failure falls back to text silently.
  useEffect(() => {
    if (!voiceOn || !current || status !== 'active') return;
    let url: string | null = null;
    let cancelled = false;
    ii.speak(current.content).then((blob) => {
      if (cancelled) return;
      url = URL.createObjectURL(blob);
      if (!audio.current) audio.current = new Audio();
      audio.current.src = url;
      audio.current.play().catch(() => undefined);
    }).catch(() => setVoiceOn(false));
    return () => { cancelled = true; audio.current?.pause(); if (url) URL.revokeObjectURL(url); };
  }, [current?.id, voiceOn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn before closing while an answer is in flight.
  useEffect(() => {
    if (!sending) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [sending]);

  useEffect(() => {
    if (!finished) return;
    const t = setTimeout(() => router.push(`/interview-intelligence/report/${sessionId}`), 2500);
    return () => clearTimeout(t);
  }, [finished, router, sessionId]);

  async function send(p: Pending) {
    setSending(true); setError(null); setPending(p);
    // Show the candidate's words immediately; the server copy replaces it.
    const local: IIMessage = { id: `local-${p.id}`, seq: Number.MAX_SAFE_INTEGER, role: 'candidate',
      content: p.skip ? '[skipped]' : p.content, kind: p.kind, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev.filter((m) => m.id !== local.id), local]);
    try {
      const r = await ii.turn(sessionId, { client_turn_id: p.id, content: p.content, kind: p.kind,
        answer_ms: p.answer_ms, skip: p.skip });
      setMessages((prev) => prev.filter((m) => m.id !== local.id));
      apply(r.messages, r.session);
      setPending(null);
      setDraft('');
    } catch (e) {
      // Keep the answer; retrying re-sends the SAME turn id, so it can never be counted twice.
      setMessages((prev) => prev.filter((m) => m.id !== local.id));
      setError((e as IIError).message);
    } finally {
      setSending(false);
    }
  }

  function submit() {
    const text = draft.trim();
    if (!text || sending) return;
    send({ id: newTurnId(), content: text, kind: recordedText.current === text ? 'voice' : 'text',
      answer_ms: Date.now() - shownAt.current });
  }

  async function pause() {
    try { const r = await ii.pause(sessionId); setProgress(r.session); } catch (e) { setError((e as IIError).message); }
  }
  async function resume() {
    try { const r = await ii.resume(sessionId); apply(r.messages, r.session); } catch (e) { setError((e as IIError).message); }
  }
  async function end() {
    if (!window.confirm('End the interview now? Anything not covered yet will be reported as not tested — never as a weakness.')) return;
    try { await ii.end(sessionId); setFinished(true); } catch (e) { setError((e as IIError).message); }
  }

  async function toggleRecording() {
    if (recording) { recorder.current?.stop(); return; }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (ev) => { if (ev.data.size) chunks.current.push(ev.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setTranscribing(true);
        try {
          const { text } = await ii.transcribe(new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' }));
          if (!text) { setError('We didn’t catch that. Try again or type your answer.'); return; }
          recordedText.current = (draft ? `${draft} ${text}` : text).trim();
          setDraft(recordedText.current);
        } catch (e) {
          setError(`${(e as IIError).message} You can type your answer instead.`);
        } finally {
          setTranscribing(false);
        }
      };
      recorder.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      setError('Microphone access was blocked. You can type your answer instead.');
    }
  }

  function repeat() {
    if (voiceOn && audio.current?.src) { audio.current.currentTime = 0; audio.current.play().catch(() => undefined); return; }
    shownAt.current = Date.now();
    document.getElementById('ii-question')?.focus();
  }

  if (!session && !error) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner label="Opening the interview room…" /></div>;

  if (finished) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Interview complete.</h1>
        <p className="mt-3 max-w-md text-muted-foreground">We’re analysing your responses, the evidence behind them and how they line up with the role.</p>
        <Loader2 className="mt-6 h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const remaining = progress?.remaining_s;
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-6">
      <header className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span className="truncate">
          {session?.role_title || 'Interview'}{session?.company_name ? ` · ${session.company_name}` : ''} · {session?.mode_label}
        </span>
        <span className="tabular-nums" aria-label="Elapsed time">{clock(elapsed)}</span>
      </header>

      <main className="flex flex-1 flex-col justify-center py-10">
        {status === 'paused' ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Interview paused</p>
            <p className="mt-3 text-xl">Take your time. The clock is stopped.</p>
            <Button className="mt-6" onClick={resume}><Play /> Resume</Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Interviewer</p>
            <p id="ii-question" tabIndex={-1} aria-live="polite"
               className="mt-3 text-balance text-2xl font-medium leading-snug tracking-tight text-foreground focus:outline-none sm:text-[28px]">
              {current?.content || '…'}
            </p>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
              {sending ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Interviewer is thinking</>) :
                recording ? (<><span className="h-2 w-2 animate-pulse rounded-full bg-viz-critical" /> Recording</>) :
                  transcribing ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Transcribing</>) :
                    (<><span className="h-2 w-2 rounded-full bg-viz-good" /> Listening</>)}
              {typeof remaining === 'number' && remaining < 300 && remaining > 0 && (
                <span className="ml-auto">About {Math.ceil(remaining / 60)} min left</span>
              )}
            </p>
          </>
        )}
      </main>

      {status !== 'paused' && (
        <div className="sticky bottom-0 bg-background pb-4">
          <ErrorNote error={error} onRetry={pending ? () => send(pending) : load} />
          <label htmlFor="ii-answer" className="sr-only">Your answer</label>
          <textarea
            id="ii-answer" value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} maxLength={12000}
            disabled={sending || status !== 'active'}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); } }}
            placeholder={voiceAvailable ? 'Type your answer, or record it with the mic' : 'Type your answer'}
            className="mt-3 w-full resize-y rounded-xl border border-input bg-card p-4 text-base leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button onClick={submit} disabled={!draft.trim() || sending || status !== 'active'}>Send answer</Button>
            {voiceAvailable && (
              <Button variant="outline" onClick={toggleRecording} disabled={sending || transcribing}
                      aria-pressed={recording} aria-label={recording ? 'Stop recording' : 'Record answer'}>
                {recording ? <Square /> : <Mic />} {recording ? 'Stop' : 'Mic'}
              </Button>
            )}
            <Button variant="ghost" onClick={repeat} disabled={sending}><RotateCcw /> Repeat</Button>
            {voiceAvailable && (
              <Button variant="ghost" onClick={() => setVoiceOn((v) => !v)} aria-pressed={voiceOn}>
                {voiceOn ? <Volume2 /> : <VolumeX />} {voiceOn ? 'Voice on' : 'Voice off'}
              </Button>
            )}
            <span className="flex-1" />
            <Button variant="ghost" onClick={() => send({ id: newTurnId(), content: '', kind: 'text', skip: true })}
                    disabled={sending || status !== 'active'}>
              Skip question
            </Button>
            <Button variant="ghost" onClick={pause} disabled={sending || status !== 'active'}><Pause /> Pause</Button>
            <Button variant="outline" onClick={end} disabled={sending}>End</Button>
          </div>

          {messages.length > 1 && (
            <div className="mt-4">
              <button className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                      onClick={() => setShowConversation((v) => !v)} aria-expanded={showConversation}>
                {showConversation ? 'Hide conversation' : 'Show conversation so far'}
              </button>
              {showConversation && (
                <ol className="mt-3 max-h-72 space-y-3 overflow-y-auto rounded-xl border border-border p-4 text-sm">
                  {messages.map((m) => (
                    <li key={m.id} className={m.role === 'candidate' ? 'pl-6 text-muted-foreground' : ''}>
                      <span className="block text-xs text-muted-foreground">{m.role === 'interviewer' ? 'Interviewer' : 'You'}</span>
                      {m.content}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Press Ctrl+Enter to send. You can ask the interviewer to repeat or clarify a question, or say you need a moment.
            {' '}<Link href="/interview-intelligence" className="underline underline-offset-2">Leave the room</Link> — your interview stays open.
          </p>
        </div>
      )}
    </div>
  );
}
