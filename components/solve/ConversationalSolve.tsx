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
import { Loader2, Send, Paperclip, Mic, Square, FileText, ArrowLeft, Award, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import DictationButton from '@/components/dictation-button';
import EngagingLoader from '@/components/engaging-loader';
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
import { MESSAGE_MAX_CHARS, RECOMMENDATION_MAX_CHARS } from '@/lib/limits';

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

export default function ConversationalSolve({ caseId, initialCase, historyPanel, lockedOverlay }: Props) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(!lockedOverlay);
  const [attempt, setAttempt] = useState<AttemptSummary | null>(null);
  const [caseDetail, setCaseDetail] = useState<AttemptDetail['case'] | typeof initialCase>(initialCase);
  const [messages, setMessages] = useState<AttemptMessage[]>([]);
  const [draftAssistant, setDraftAssistant] = useState<DraftAssistant | null>(null);
  const [composer, setComposer] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState<'idle' | 'recording' | 'transcribing'>('idle');
  const [submitOpen, setSubmitOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [finalRec, setFinalRec] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const threadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

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
    return () => { cancelled = true; };
  }, [caseId, router]);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, draftAssistant?.text]);

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
            setAttempt((a) => a ? { ...a, clarification_remaining: meta.clarification_remaining, clarification_used: a.clarification_quota - meta.clarification_remaining } : a);
          },
          onToken: (chunk) => {
            setDraftAssistant((d) => (d ? { ...d, text: d.text + chunk } : d));
          },
          onError: (err) => toast.error(err),
        },
      );
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
      setMessages((m) => m.filter((x) => x.id !== optimisticUser.id));
    } finally {
      setSending(false);
      setDraftAssistant(null);
    }
  }

  async function toggleMic() {
    if (recording === 'recording') { mediaRecorderRef.current?.stop(); return; }
    if (recording === 'transcribing' || sending) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (blob.size === 0) { setRecording('idle'); return; }
        setRecording('transcribing');
        try {
          const { text } = await transcribeAudio(blob);
          if (text) await send('voice', text);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Transcription failed');
        } finally { setRecording('idle'); }
      };
      mr.start();
      setRecording('recording');
    } catch { toast.error('Microphone permission denied'); }
  }

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

  // No full-screen blocker: the case prompt (initialCase) renders immediately on
  // the left while the live session boots — the engaging loader fills the chat.
  const remaining = attempt?.clarification_remaining || 0;
  const quotaExhausted = attempt ? remaining <= 0 : false;

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
               <ClarificationCounter remaining={remaining} quota={attempt.clarification_quota} />
               <Button size="sm" onClick={() => setSubmitOpen(true)} className="h-8 bg-primary text-primary-foreground hover:bg-primary-hover">
                 Submit
               </Button>
             </div>
           )}
        </div>

        {/* Chat Thread */}
        <div ref={threadRef} className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 pb-32">
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
          <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] bg-gradient-to-t from-muted/50 via-muted/30 to-transparent">
            <div className="mx-auto max-w-3xl">
              {quotaExhausted && (
                <p className="mb-3 rounded-lg border bg-card px-4 py-2 text-small text-foreground/80 shadow-sm text-center">
                  You&rsquo;ve used all your clarification questions. Hit <span className="font-semibold text-primary cursor-pointer hover:underline" onClick={() => setSubmitOpen(true)}>Submit</span> when ready.
                </p>
              )}
              
              <div className="flex items-end gap-2 rounded-[24px] border bg-card p-1.5 pl-3 shadow-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 rounded-full p-2 mb-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" aria-label="Attach a file">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf,.doc,.docx,.txt" onChange={handleFile} />
                
                <textarea
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send('text'); } }}
                  placeholder={quotaExhausted ? 'Add notes or assumptions…' : 'Ask a clarification or share your structure…'}
                  className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2.5 px-1 text-[15px] outline-none placeholder:text-muted-foreground leading-tight"
                  rows={1}
                  maxLength={MESSAGE_MAX_CHARS}
                />
                
                <div className="flex items-center gap-1.5 pr-1 mb-0.5">
                  <button type="button" onClick={toggleMic} disabled={recording === 'transcribing'} className={`shrink-0 rounded-full p-2 transition-colors ${recording === 'recording' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 animate-pulse' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} aria-label="Voice input">
                    {recording === 'transcribing' ? <Loader2 className="h-5 w-5 animate-spin" /> : recording === 'recording' ? <Square className="h-4 w-4" fill="currentColor" /> : <Mic className="h-5 w-5" />}
                  </button>
                  <Button type="button" onClick={() => send('text')} disabled={!composer.trim() || sending || !attempt} size="icon" className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm">
                    <Send className="h-4 w-4 ml-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
  onConfirm: () => void;
  onFileAttach: () => void;
}) {
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
          <Button onClick={onConfirm} disabled={submitting || finalRec.trim().length < 20} className="bg-primary text-primary-foreground hover:bg-primary-hover">
            {submitting ? (<><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Scoring…</>) : 'Submit session'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
