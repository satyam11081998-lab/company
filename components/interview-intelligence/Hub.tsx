'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Repeat2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ii, IIError } from '@/lib/interview-intelligence/api';
import { ACTIVE_STATES, sessionStatusLabel, titleCase } from '@/lib/interview-intelligence/format';
import type { IIDocument, IIMe, IIProgressHistory, IISession } from '@/lib/interview-intelligence/types';
import { AccessGate, ConfidenceChip, ErrorNote, Spinner } from './primitives';

export default function Hub() {
  return <AccessGate>{(me) => <HubInner me={me} />}</AccessGate>;
}

function HubInner({ me }: { me: IIMe }) {
  const [sessions, setSessions] = useState<IISession[] | null>(null);
  const [docs, setDocs] = useState<IIDocument[]>([]);
  const [progress, setProgress] = useState<IIProgressHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [s, d, p] = await Promise.all([ii.sessions(), ii.documents(), ii.progress()]);
      setSessions(s.sessions);
      setDocs(d.documents);
      setProgress(p);
    } catch (e) {
      setError((e as IIError).message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const active = (sessions || []).filter((s) => ACTIVE_STATES.includes(s.status));
  const past = (sessions || []).filter((s) => !ACTIVE_STATES.includes(s.status));
  const atLimit = me.limits.active_count >= me.limits.max_active_sessions;

  async function abandon(id: string) {
    if (!window.confirm('Abandon this interview? It frees the slot and will not be assessed.')) return;
    try { await ii.abandon(id); await load(); } catch (e) { setError((e as IIError).message); }
  }
  async function removeDoc(id: string) {
    if (!window.confirm('Delete this document? Interviews already run with it keep their reports.')) return;
    try { await ii.deleteDocument(id); await load(); } catch (e) { setError((e as IIError).message); }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Interview Intelligence</h1>
          <p className="mt-2 text-muted-foreground">
            An interview built from your CV and the job description, followed by an assessment of what the
            interviewer actually learned about you — every point traced to something you said.
          </p>
        </div>
        <div className="shrink-0">
          {atLimit ? (
            <Button disabled title="Finish or end an active interview first"><Plus /> New interview</Button>
          ) : (
            <Button asChild><Link href="/interview-intelligence/new"><Plus /> New interview</Link></Button>
          )}
        </div>
      </header>

      {atLimit && (
        <p className="mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
          You already have {me.limits.max_active_sessions} active interview sessions. Finish or end one to start another.
        </p>
      )}

      <div className="mt-6"><ErrorNote error={error} onRetry={load} /></div>

      {sessions === null && !error && <div className="py-12"><Spinner label="Loading your interviews…" /></div>}

      {active.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold text-muted-foreground">In progress · {active.length} of {me.limits.max_active_sessions} slots</h2>
          <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
            {active.map((s) => (
              <li key={s.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.role_title || 'Preparing your interview'}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.mode_label} · {titleCase(s.difficulty)} · {sessionStatusLabel(s.status)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant={s.status === 'active' || s.status === 'paused' ? 'default' : 'outline'}>
                    <Link href={s.status === 'active' || s.status === 'paused' || s.status === 'ready'
                      ? `/interview-intelligence/session/${s.id}` : `/interview-intelligence/new?session=${s.id}`}>
                      {s.status === 'ready' ? 'Open' : s.status === 'active' || s.status === 'paused' ? 'Resume' : 'View'}
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => abandon(s.id)}>Abandon</Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {progress && progress.recurring.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold text-muted-foreground">Recurring patterns</h2>
          <ul className="mt-3 space-y-2">
            {progress.recurring.slice(0, 3).map((r) => (
              <li key={r.category} className="rounded-xl border border-viz-warning/30 bg-viz-warning/5 px-5 py-4">
                <p className="font-medium">{titleCase(r.label)}</p>
                <p className="text-sm text-muted-foreground">
                  Came up in {r.occurrences} of your last {r.of_last} interviews.
                  {r.examples[0] ? ` Most recently: “${r.examples[0]}”.` : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold text-muted-foreground">Past interviews</h2>
          <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
            {past.map((s) => (
              <li key={s.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.role_title || 'Interview'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()} · {s.mode_label} · {titleCase(s.difficulty)}
                    {s.source_session_id ? ' · re-attempt' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {s.assessment_confidence && <ConfidenceChip level={s.assessment_confidence} />}
                  {s.status === 'completed' || s.status === 'expired' ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/interview-intelligence/report/${s.id}`}>
                        {s.assessment_status === 'pending' || s.assessment_status === 'processing' ? 'Analysing…' : 'Report'}
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">{sessionStatusLabel(s.status)}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sessions !== null && sessions.length === 0 && (
        <section className="mt-12 rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <Repeat2 className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden />
          <p className="mt-3 font-medium">No interviews yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Upload your CV and the job description. You’ll see what the role needs and which of your claims the
            interviewer will want to test before anything starts.
          </p>
        </section>
      )}

      {docs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold text-muted-foreground">Saved documents</h2>
          <p className="mt-1 text-sm text-muted-foreground">Reuse them for any interview type without uploading again.</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {d.kind === 'cv' ? 'CV' : 'Job description'} v{d.version}
                      {d.file_name ? ` · ${d.file_name}` : d.source === 'paste' ? ' · pasted' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.analysis_status === 'ready' ? 'Analysed' : d.analysis_status === 'unreadable' ? 'Could not be read' :
                        d.analysis_status === 'failed' ? 'Analysis failed' : 'Analysing…'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeDoc(d.id)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Delete ${d.kind === 'cv' ? 'CV' : 'job description'} v${d.version}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
