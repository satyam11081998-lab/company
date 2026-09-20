import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { MessageSquare, ArrowRight, Sparkles, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

/**
 * /history — every conversation this user has had, theirs to re-read.
 *
 * Before this page a past attempt was only ever visible as a SCORE: /results
 * shows the scorecard and the flattened `answer_text`, and the conversation
 * itself — the part people actually want to revisit, because it is where the
 * thinking happened — was reachable by nobody except an admin.
 *
 * Reads `attempt_history` (migration 0068 §6), a security_invoker view, so RLS
 * does the ownership check rather than a hand-written filter that could be
 * forgotten. Guest-claimed conversations appear here too: that is the point of
 * claiming them.
 */

interface HistoryRow {
  attempt_id: string;
  case_id: string;
  status: string;
  created_at: string;
  submitted_at: string | null;
  submission_id: string | null;
  claimed_from_user_id: string | null;
  case_title: string;
  case_type: string | null;
  difficulty: string | null;
  score: number | null;
  message_count: number;
  last_message_at: string | null;
}

function when(iso: string): string {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function HistoryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/history');

  const { data, error } = await supabase
    .from('attempt_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  // A missing view means migration 0068 has not been run. Say that plainly
  // rather than rendering an empty state that reads as "you have no history".
  if (error) {
    return (
      <div className="min-h-screen bg-muted">
        <main className="container max-w-3xl py-10">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Your conversations</h1>
          <Card className="mt-6 p-6">
            <p className="text-body text-muted-foreground">
              History is not available yet. If you are the operator: run migration{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-[13px]">0068_conversation_continuity.sql</code>.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  const rows = (data ?? []) as HistoryRow[];
  const scored = rows.filter((r) => r.score != null).length;
  const claimed = rows.filter((r) => r.claimed_from_user_id).length;

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-3xl py-10">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Your conversations</h1>
          <p className="mt-2 text-body text-muted-foreground">
            Every case you have worked through, with the full back-and-forth — not just the score.
          </p>
          {rows.length > 0 && (
            <p className="mt-3 text-small text-muted-foreground">
              {rows.length} conversation{rows.length === 1 ? '' : 's'} · {scored} scored
              {claimed > 0 && ` · ${claimed} carried over from guest practice`}
            </p>
          )}
        </header>

        {rows.length === 0 ? (
          <Card className="mt-8 flex flex-col items-center p-10 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-4 text-body font-medium text-foreground">No conversations yet</p>
            <p className="mt-1 max-w-sm text-small text-muted-foreground">
              Solve a case and the whole conversation is kept here for you to re-read.
            </p>
            <Link
              href="/practice"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Find a case <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        ) : (
          <ul className="mt-8 space-y-3">
            {rows.map((r) => (
              <li key={r.attempt_id}>
                <Link href={`/history/${r.attempt_id}`} className="block group">
                  <Card className="p-5 transition-colors group-hover:border-primary/40">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-body font-semibold text-foreground">{r.case_title}</h2>
                          {r.case_type && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              {r.case_type}
                            </span>
                          )}
                          {r.claimed_from_user_id && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                              <Sparkles className="h-3 w-3" /> carried over
                            </span>
                          )}
                          {r.status === 'active' && (
                            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning-foreground">
                              unfinished
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {when(r.created_at)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {r.message_count} message{r.message_count === 1 ? '' : 's'}
                          </span>
                        </p>
                      </div>

                      {r.score != null ? (
                        <div className="shrink-0 text-right">
                          <p className="text-2xl font-bold leading-none text-primary">{r.score}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">/100</p>
                        </div>
                      ) : (
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                      )}
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
