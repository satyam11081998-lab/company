'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUp, Loader2, Mic, Pause, Phone, Play, SkipForward, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ii, IIError, newTurnId } from '@/lib/interview-intelligence/api';
import { clock } from '@/lib/interview-intelligence/format';
import type { IIMe, IIMessage, IIProgress, IISession } from '@/lib/interview-intelligence/types';
import { supportsLiveVoice, supportsStandardVoice } from '@/lib/interview-intelligence/voice/audio';
import CallRoom from './call/CallRoom';
import { AccessGate, ErrorNote, Spinner } from './primitives';

/**
 * The interview room (spec §78). Voice call by default (a spoken conversation with the
 * interviewer), a text conversation one tap away. Either way there are no scores, no "good
 * answer" and no per-competency progress during the interview — evaluation signals change how
 * people answer, so none are shown (and the API never sends any).
 */
export default function InterviewRoom({ sessionId }: { sessionId: string }) {
  return <AccessGate>{(me) => <Room me={me} sessionId={sessionId} />}</AccessGate>;
}

type Mode = 'voice' | 'chat';

function rememberMode(m?: Mode): Mode | null {
  try {
    if (m) localStorage.setItem('ii.mode', m);
    const v = localStorage.getItem('ii.mode');
    return v === 'voice' || v === 'chat' ? v : null;
  } catch {
    return null;
  }
}

function Room({ me, sessionId }: { me: IIMe; sessionId: string }) {
  const router = useRouter();
  const [data, setData] = useState<{ session: IISession; messages: IIMessage[]; progress: IIProgress | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const voicePossible = me.flags.voice && typeof window !== 'undefined' && (supportsLiveVoice() || supportsStandardVoice());

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await ii.room(sessionId);
      if (r.session.status === 'completed' || r.session.status === 'expired') {
        router.replace(`/interview-intelligence/report/${sessionId}`);
        return;
      }
      setData({ session: r.session, messages: r.messages, progress: r.progress ?? null });
    } catch (e) {
      setError((e as IIError).message);
    }
  }, [sessionId, router]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (mode !== null) return;
    setMode(voicePossible && rememberMode() !== 'chat' ? 'voice' : 'chat');
  }, [mode, voicePossible]);

  if (error) return <div className="mx-auto max-w-xl px-4 py-20"><ErrorNote error={error} onRetry={load} /></div>;
  if (!data || !mode) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner label="Opening the interview room…" /></div>;

  if (mode === 'voice' && voicePossible) {
    return (
      <CallRoom
        me={me}
        session={data.session}
        initialMessages={data.messages}
        initialProgress={data.progress}
        onSwitchToChat={() => { rememberMode('chat'); setData(null); setMode('chat'); void load(); }}
      />
    );
  }
  return (
    <ChatRoom
      sessionId={sessionId}
      voicePossible={!!voicePossible}
      onSwitchToVoice={() => { rememberMode('voice'); setData(null); setMode('voice'); void load(); }}
    />
  );
}

/* ================================================================== text interview */

type Pending = { id: string; content: string; kind: 'text' | 'voice'; answer_ms?: number; skip?: boolean };

function ChatRoom({ sessionId, voicePossible, onSwitchToVoice }: {
  sessionId: string; voicePossible: boolean; onSwitchToVoice: () => void;
}) {
  const router = useRouter();
  const [session, setSession] = useState<IISession | null>(null);
  const [messages, setMessages] = useState<IIMessage[]>([]);
  const [progress, setProgress] = useState<IIProgress | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const shownAt = useRef<number>(Date.now());
  const dictated = useRef<string>('');
  const tail = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  const status = progress?.status || session?.status;
  const lastInterviewer = [...messages].reverse().find((m) => m.role === 'interviewer');

  const apply = useCallback((msgs: IIMessage[], p: IIProgress, replace = false) => {
    setMessages((prev) => {
      if (replace) return msgs;
      const seen = new Set(prev.map((m) => m.id));
      return [...prev.filter((m) => !m.id.startsWith('local-')), ...msgs.filter((m) => !seen.has(m.id))];
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

  useEffect(() => {
    if (status !== 'active') return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => { shownAt.current = Date.now(); }, [lastInterviewer?.id]);
  useEffect(() => { tail.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages.length, sending]);

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

  // auto-grow the composer
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [draft]);

  async function send(p: Pending) {
    setSending(true); setError(null); setPending(p);
    const local: IIMessage = { id: `local-${p.id}`, seq: Number.MAX_SAFE_INTEGER, role: 'candidate',
      content: p.skip ? 'Skipped this question.' : p.content, kind: p.kind, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev.filter((m) => m.id !== local.id), local]);
    setDraft('');
    try {
      const r = await ii.turn(sessionId, { client_turn_id: p.id, content: p.content, kind: p.kind,
        answer_ms: p.answer_ms, skip: p.skip });
      apply(r.messages, r.session);
      setPending(null);
    } catch (e) {
      // Keep the answer; retrying re-sends the SAME turn id, so it can never be counted twice.
      setMessages((prev) => prev.filter((m) => m.id !== local.id));
      if (!p.skip) setDraft(p.content);
      setError((e as IIError).message);
    } finally {
      setSending(false);
    }
  }

  function submit() {
    const text = draft.trim();
    if (!text || sending) return;
    send({ id: newTurnId(), content: text, kind: dictated.current && text.includes(dictated.current) ? 'voice' : 'text',
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

  async function toggleDictation() {
    if (recording) { recorder.current?.stop(); return; }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
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
          dictated.current = text;
          setDraft((d) => (d ? `${d} ${text}` : text).trim());
          box.current?.focus();
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

  if (!session && !error) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner label="Opening the interview room…" /></div>;

  if (finished) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">That’s the end of the interview.</h1>
        <p className="mt-3 max-w-md text-muted-foreground">We’re analysing your answers, the evidence behind them and how they line up with the role.</p>
        <Loader2 className="mt-6 h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const remaining = progress?.remaining_s;
  const paused = status === 'paused';
  const canAnswer = status === 'active' && !sending;

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-3xl flex-col px-0 sm:px-4">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {session?.role_title || 'Interview'}{session?.company_name ? `, ${session.company_name}` : ''}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {session?.mode_label} interview
          </p>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground" aria-label="Elapsed time">{clock(elapsed)}</span>
        {voicePossible && (
          <Button size="sm" onClick={onSwitchToVoice} className="gap-1.5 rounded-full">
            <Phone className="h-3.5 w-3.5" /> Voice call
          </Button>
        )}
      </header>

      <ol className="flex-1 space-y-5 overflow-y-auto px-4 py-6" aria-live="polite">
        {messages.map((m) => (
          <li key={m.id} className={`flex gap-3 ${m.role === 'candidate' ? 'justify-end' : ''}`}>
            {m.role === 'interviewer' && <InterviewerMark />}
            <div className={m.role === 'candidate'
              ? 'max-w-[85%] rounded-2xl rounded-br-md bg-navy px-4 py-2.5 text-[15px] leading-relaxed text-navy-foreground sm:max-w-[75%]'
              : 'max-w-[90%] pt-0.5 text-[16px] leading-relaxed text-foreground sm:max-w-[85%]'}>
              {m.content}
            </div>
          </li>
        ))}
        {sending && (
          <li className="flex gap-3">
            <InterviewerMark />
            <span className="inline-flex items-center gap-1 pt-2" aria-label="The interviewer is typing">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
          </li>
        )}
        <div ref={tail} />
      </ol>

      <div className="border-t border-border bg-background px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3">
        {paused ? (
          <div className="flex items-center justify-between gap-3 py-2">
            <p className="text-sm text-muted-foreground">You’re on a break. The clock is stopped.</p>
            <Button onClick={resume} className="gap-1.5"><Play className="h-4 w-4" /> Resume</Button>
          </div>
        ) : (
          <>
            <ErrorNote error={error} onRetry={pending ? () => send(pending) : load} />
            <div className="flex items-end gap-2 rounded-2xl border border-input bg-card p-2 focus-within:ring-1 focus-within:ring-ring">
              <label htmlFor="ii-answer" className="sr-only">Your answer</label>
              <textarea
                id="ii-answer" ref={box} value={draft} onChange={(e) => setDraft(e.target.value)} rows={1} maxLength={12000}
                disabled={!canAnswer}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
                placeholder={recording ? 'Listening… tap stop when you’re done' : 'Type your answer'}
                className="max-h-60 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none disabled:opacity-60"
              />
              <button type="button" onClick={toggleDictation} disabled={!canAnswer || transcribing}
                      aria-pressed={recording} aria-label={recording ? 'Stop dictating' : 'Dictate your answer'}
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                        recording ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                {transcribing ? <Loader2 className="h-4 w-4 animate-spin" /> : recording ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
              </button>
              <button type="button" onClick={submit} disabled={!draft.trim() || !canAnswer} aria-label="Send answer"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-25">
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1 text-sm">
              <Button variant="ghost" size="sm" onClick={() => send({ id: newTurnId(), content: '', kind: 'text', skip: true })}
                      disabled={!canAnswer} className="gap-1.5 text-muted-foreground"><SkipForward className="h-4 w-4" /> Skip question</Button>
              <Button variant="ghost" size="sm" onClick={pause} disabled={!canAnswer} className="gap-1.5 text-muted-foreground"><Pause className="h-4 w-4" /> Take a break</Button>
              <span className="flex-1" />
              {typeof remaining === 'number' && remaining < 300 && remaining > 0 && (
                <span className="text-xs text-muted-foreground">About {Math.ceil(remaining / 60)} min left</span>
              )}
              <Button variant="outline" size="sm" onClick={end} disabled={sending}>End interview</Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Enter sends, Shift+Enter adds a line. You can ask the interviewer to repeat or clarify, or say you need a moment.{' '}
              <Link href="/interview-intelligence" className="underline underline-offset-2">Leave the room</Link>. Your interview stays open.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/** Small static echo of the call's voiceprint rings, so text and voice feel like one interviewer. */
function InterviewerMark() {
  return (
    <svg viewBox="0 0 32 32" className="mt-0.5 h-8 w-8 shrink-0" aria-hidden>
      {[5, 8.5, 12, 15].map((r, i) => (
        <circle key={r} cx="16" cy="16" r={r} fill="none" stroke="hsl(var(--primary))" strokeOpacity={0.9 - i * 0.22} strokeWidth={i === 0 ? 1.6 : 1} />
      ))}
    </svg>
  );
}
