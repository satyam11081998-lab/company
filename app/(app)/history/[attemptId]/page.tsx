import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Bot, User as UserIcon, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

/**
 * /history/[attemptId] — the full transcript of one conversation.
 *
 * Ownership is enforced by RLS: "attempts: owner read" and
 * "attempt_messages: owner read" (0002) mean a wrong/guessed id returns no
 * rows rather than someone else's conversation. The explicit user check below
 * is defence in depth, not the boundary.
 */

interface Msg {
  id: string;
  role: string;
  kind: string;
  content: string | null;
  is_clarification: boolean;
  created_at: string;
}

/** The interviewer emits **bold** in otherwise plain text. Rendering it raw
 *  shows literal asterisks, which is how it used to look in the transcript. */
function withBold(text: string) {
  if (!text) return null;
  return (
    <>
      {text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') && part.length >= 4
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : part,
      )}
    </>
  );
}

export default async function TranscriptPage({ params }: { params: { attemptId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/history/${params.attemptId}`);

  const [attemptRes, messagesRes] = await Promise.all([
    supabase
      .from('attempt_history')
      .select('*')
      .eq('attempt_id', params.attemptId)
      .maybeSingle(),
    supabase
      .from('attempt_messages')
      .select('id, role, kind, content, is_clarification, created_at')
      .eq('attempt_id', params.attemptId)
      .order('created_at', { ascending: true }),
  ]);

  const attempt = attemptRes.data as {
    attempt_id: string;
    user_id: string;
    case_title: string;
    case_type: string | null;
    difficulty: string | null;
    status: string;
    created_at: string;
    score: number | null;
    submission_id: string | null;
    final_recommendation: string | null;
    claimed_from_user_id: string | null;
  } | null;

  if (!attempt || attempt.user_id !== user.id) notFound();

  const messages = ((messagesRes.data ?? []) as Msg[]).filter((m) => m.content);
  // The closing recommendation is rendered as its own block below, not as the
  // last chat bubble — it is a deliverable, not a turn in the conversation.
  const turns = messages.filter((m) => m.kind !== 'recommendation');
  const recommendation =
    attempt.final_recommendation ??
    messages.find((m) => m.kind === 'recommendation')?.content ??
    null;

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-3xl py-10">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-small font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All conversations
        </Link>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{attempt.case_title}</h1>
            {attempt.claimed_from_user_id && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                <Sparkles className="h-3 w-3" /> carried over from guest practice
              </span>
            )}
          </div>
          <p className="mt-1.5 text-small text-muted-foreground">
            {[attempt.case_type, attempt.difficulty, new Date(attempt.created_at).toLocaleString()]
              .filter(Boolean)
              .join(' · ')}
            {attempt.status === 'active' && ' · never submitted'}
          </p>
        </header>

        {attempt.score != null && attempt.submission_id && (
          <Link href={`/results/${attempt.submission_id}`} className="mt-5 block group">
            <Card className="flex items-center justify-between p-4 transition-colors group-hover:border-primary/40">
              <div>
                <p className="text-small font-semibold text-foreground">Scored {attempt.score}/100</p>
                <p className="text-[12px] text-muted-foreground">Open the full breakdown and model approaches</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Card>
          </Link>
        )}

        <section className="mt-6 space-y-3" aria-label="Conversation">
          {turns.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-body text-muted-foreground">
                This session was opened but no messages were exchanged.
              </p>
            </Card>
          )}
          {turns.map((m) => {
            const isUser = m.role === 'user';
            const isSystem = m.role === 'system';
            if (isSystem) {
              return (
                <p key={m.id} className="px-2 text-center text-[12px] italic text-muted-foreground">
                  {m.content}
                </p>
              );
            }
            return (
              <div key={m.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    isUser ? 'bg-primary/10 text-primary' : 'bg-navy/10 text-navy dark:bg-navy-mid dark:text-navy-foreground'
                  }`}
                >
                  {isUser ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-body leading-relaxed ${
                    isUser
                      ? 'bg-primary text-white'
                      : 'border border-border bg-card text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{withBold(m.content || '')}</p>
                  {m.is_clarification && (
                    <span
                      className={`mt-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        isUser ? 'bg-white/20 text-white/90' : 'bg-warning/15 text-warning-foreground'
                      }`}
                    >
                      clarification
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {recommendation && (
          <Card className="mt-6 border-primary/20 bg-primary/[0.03] p-6">
            <h2 className="text-small font-semibold uppercase tracking-wide text-primary">
              Your final recommendation
            </h2>
            <p className="mt-3 whitespace-pre-line text-body leading-relaxed text-foreground/80">
              {recommendation}
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
