'use client';

/**
 * The conversational case-interview workspace.
 *
 * Three vertical zones:
 *   1. Sticky problem-statement header (case prompt + difficulty + counter)
 *   2. Scrolling conversation thread (chronological messages)
 *   3. Messenger-style composer (text + mic + upload + send)
 *
 * The session is the submission. No separate answer field. A persistent
 * "Submit" button opens the final-recommendation dialog; that text becomes
 * the closing message and is weighted heavily by the scorer.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Send, Paperclip, Mic, Square, FileText, ArrowLeft, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { CASE_TYPE_LABELS, DIFFICULTY_LABELS } from '@/lib/constants';
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
import { transcribeAudio } from '@/lib/api';

interface Props {
  caseId: string;
}

interface DraftAssistant {
  id: 'draft';
  role: 'assistant';
  text: string;
}

export default function ConversationalSolve({ caseId }: Props) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<AttemptSummary | null>(null);
  const [caseDetail, setCaseDetail] = useState<AttemptDetail['case'] | null>(null);
  const [messages, setMessages] = useState<AttemptMessage[]>([]);
  const [draftAssistant, setDraftAssistant] = useState<DraftAssistant | null>(null);
  const [composer, setComposer] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState<'idle' | 'recording' | 'transcribing'>('idle');
  const [submitOpen, setSubmitOpen] = useState(false);
  const [finalRec, setFinalRec] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const threadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // ---------- Boot: get session token, start/resume attempt, load history ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const tok = session.access_token;
      if (cancelled) return;
      setToken(tok);
      try {
        const summary = await startAttempt(caseId, tok);
        if (cancelled) return;
        setAttempt(summary);
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
    return () => {
      cancelled = true;
    };
  }, [caseId, router]);

  // ---------- Auto-scroll thread to bottom on new message ----------
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, draftAssistant?.text]);

  // ---------- Send a text message + stream the interviewer's reply ----------
  async function send(kind: 'text' | 'voice' = 'text', content?: string) {
    const text = (content ?? composer).trim();
    if (!text || !attempt || !token || sending) return;

    const optimisticUser: AttemptMessage = {
      id: `tmp-${Date.now()}`,
      role: 'user',
      kind,
      content: text,
      is_clarification: false,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimisticUser]);
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
            setAttempt((a) =>
              a
                ? { ...a, clarification_remaining: meta.clarification_remaining, clarification_used: a.clarification_quota - meta.clarification_remaining }
                : a,
            );
          },
          onToken: (chunk) => {
            setDraftAssistant((d) => (d ? { ...d, text: d.text + chunk } : d));
          },
          onError: (err) => toast.error(err),
        },
      );
      // Re-fetch authoritative state so message IDs and quota match the server.
      const detail = await getAttempt(attempt.attempt_id, token);
      setMessages(detail.messages);
      setAttempt(detail.attempt);
      if (result.quotaRemaining === 0 && result.assistantText === '') {
        toast.message('Clarification quota used up', {
          description: 'You can keep building notes; submit when you have a recommendation.',
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Send failed');
      // Roll back optimistic message on hard failure.
      setMessages((m) => m.filter((x) => x.id !== optimisticUser.id));
    } finally {
      setSending(false);
      setDraftAssistant(null);
    }
  }

  // ---------- Voice input ----------
  async function toggleMic() {
    if (recording === 'recording') {
      mediaRecorderRef.current?.stop();
      return;
    }
    if (recording === 'transcribing' || sending) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (blob.size === 0) {
          setRecording('idle');
          return;
        }
        setRecording('transcribing');
        try {
          const { text } = await transcribeAudio(blob);
          if (text) await send('voice', text);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Transcription failed');
        } finally {
          setRecording('idle');
        }
      };
      mr.start();
      setRecording('recording');
    } catch {
      toast.error('Microphone permission denied');
    }
  }

  // ---------- File upload ----------
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !attempt || !token) return;
    e.target.value = '';
    toast.message('Uploading…');
    try {
      const res = await uploadAttemptFile(attempt.attempt_id, token, file);
      setMessages((m) => [...m, res.message]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  // ---------- Submit ----------
  async function handleSubmit() {
    if (!attempt || !token || submitting) return;
    if (finalRec.trim().length < 20) {
      toast.error('Your recommendation should be at least a couple of sentences.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitAttempt(attempt.attempt_id, token, finalRec.trim());
      router.push(`/results/${res.submission_id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submit failed');
      setSubmitting(false);
    }
  }

  // ---------- Render states ----------
  if (loading || !attempt || !caseDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const remaining = attempt.clarification_remaining;
  const quotaExhausted = remaining <= 0;

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* ----------------------------------- */}
      {/* 1. Sticky problem-statement header  */}
      {/* ----------------------------------- */}
      <header className="sticky top-0 z-20 border-b bg-card">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <Link
            href="/practice"
            className="mb-2 inline-flex items-center gap-1 text-micro text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Practice
          </Link>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-widest text-muted-foreground">
                <span>{CASE_TYPE_LABELS[caseDetail.type] || caseDetail.type}</span>
                <span>·</span>
                <span>{DIFFICULTY_LABELS[caseDetail.difficulty] || caseDetail.difficulty}</span>
              </div>
              <h1 className="mt-1 text-h4 font-semibold leading-tight text-foreground">
                {caseDetail.title}
              </h1>
            </div>
            <ClarificationCounter remaining={remaining} quota={attempt.clarification_quota} />
            <Button
              size="sm"
              onClick={() => setSubmitOpen(true)}
              className="shrink-0 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              Submit
            </Button>
          </div>
          {/* Collapsible prompt body — always accessible. */}
          <details className="group mt-3">
            <summary className="cursor-pointer text-small font-medium text-primary group-open:text-foreground">
              Show full prompt
            </summary>
            <p className="mt-2 whitespace-pre-wrap text-small leading-relaxed text-foreground/80">
              {caseDetail.content}
            </p>
            {caseDetail.hint && (
              <p className="mt-2 rounded bg-accent px-3 py-2 text-small text-foreground/80">
                <span className="font-semibold">Hint: </span>
                {caseDetail.hint}
              </p>
            )}
          </details>
        </div>
      </header>

      {/* ------------------------------- */}
      {/* 2. Conversation thread          */}
      {/* ------------------------------- */}
      <div ref={threadRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-6">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {draftAssistant && draftAssistant.text && (
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <p className="mb-1 text-micro font-semibold uppercase tracking-widest text-muted-foreground">
                  Interviewer
                </p>
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
                <p className="mb-1 text-micro font-semibold uppercase tracking-widest text-muted-foreground">
                  Interviewer
                </p>
                <div className="rounded-2xl bg-muted px-4 py-2 text-small text-muted-foreground">
                  <Loader2 className="inline h-3 w-3 animate-spin" /> thinking…
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------- */}
      {/* 3. Composer               */}
      {/* ------------------------- */}
      <div className="border-t bg-card">
        <div className="mx-auto max-w-3xl px-3 py-3">
          {quotaExhausted && (
            <p className="mb-2 rounded bg-accent px-3 py-2 text-small text-foreground/80">
              You&rsquo;ve used all your clarification questions. Keep working in the thread — notes,
              calculations, and uploads still count. Hit <span className="font-semibold">Submit</span>{' '}
              when ready.
            </p>
          )}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Attach a file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.txt"
              onChange={handleFile}
            />
            <Textarea
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send('text');
                }
              }}
              placeholder={
                quotaExhausted
                  ? 'Add notes, calculations, or assumptions…'
                  : 'Ask a clarification, share your structure, or work through the math…'
              }
              className="max-h-40 min-h-[44px] flex-1 resize-none rounded-2xl bg-muted text-base"
            />
            <button
              type="button"
              onClick={toggleMic}
              disabled={recording === 'transcribing'}
              className={`shrink-0 rounded-full p-2 transition-colors ${
                recording === 'recording'
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              aria-label="Voice input"
            >
              {recording === 'transcribing' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : recording === 'recording' ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
            <Button
              type="button"
              onClick={() => send('text')}
              disabled={!composer.trim() || sending}
              size="icon"
              className="shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ------------------------- */}
      {/* Submit dialog              */}
      {/* ------------------------- */}
      {submitOpen && (
        <SubmitDialog
          finalRec={finalRec}
          setFinalRec={setFinalRec}
          submitting={submitting}
          onClose={() => setSubmitOpen(false)}
          onConfirm={handleSubmit}
        />
      )}
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function ClarificationCounter({ remaining, quota }: { remaining: number; quota: number }) {
  const danger = remaining <= 1;
  return (
    <div
      className={`hidden shrink-0 rounded-full border px-3 py-1 text-micro font-semibold sm:block ${
        danger
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-border bg-muted text-foreground/80'
      }`}
      title={`You can ask ${quota} clarification questions in total.`}
    >
      Questions remaining: {remaining}
    </div>
  );
}

function MessageBubble({ message }: { message: AttemptMessage }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <p className="text-micro uppercase tracking-widest text-muted-foreground">
          {message.content}
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
          <p className="mb-1 text-micro font-semibold uppercase tracking-widest text-muted-foreground">
            Interviewer
          </p>
        )}
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2 text-body ${
            isUser
              ? 'rounded-br-sm bg-primary text-primary-foreground'
              : 'rounded-bl-sm bg-muted text-foreground'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

function SubmitDialog({
  finalRec,
  setFinalRec,
  submitting,
  onClose,
  onConfirm,
}: {
  finalRec: string;
  setFinalRec: (v: string) => void;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
      <Card className="w-full max-w-xl p-5">
        <h2 className="text-h4 font-semibold text-foreground">Your final recommendation</h2>
        <p className="mt-1 text-small text-muted-foreground">
          State your conclusion top-down — the recommendation first, then 2-3 reasons. The scorer
          weights this heavily for synthesis &amp; communication.
        </p>
        <Textarea
          autoFocus
          value={finalRec}
          onChange={(e) => setFinalRec(e.target.value)}
          placeholder="My recommendation is to… because (1)… (2)… (3)… Risks to watch: …"
          className="mt-3 min-h-[160px] resize-none text-base"
        />
        <div className="mt-4 flex items-center justify-between">
          <p className="text-small text-muted-foreground">{finalRec.trim().length} characters</p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={submitting || finalRec.trim().length < 20}
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Scoring…
                </>
              ) : (
                'Submit session'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
