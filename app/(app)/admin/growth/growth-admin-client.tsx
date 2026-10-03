'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { SeoPage } from '@/lib/seo-pages';
import { setSeoStatus } from './actions';
import {
  Rocket, Loader2, CheckCircle2, XCircle, ExternalLink, RotateCcw, Send, AlertTriangle, CalendarClock, Eye,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Filter = 'all' | 'draft' | 'published' | 'rejected';

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  approved: 'bg-navy/10 text-navy',
  published: 'bg-green-500/10 text-green-600',
  rejected: 'bg-red-500/10 text-red-600',
  archived: 'bg-muted text-muted-foreground',
};

function scoreClass(s: number | null | undefined): string {
  if (s == null) return 'bg-muted text-muted-foreground';
  if (s >= 70) return 'bg-green-500/10 text-green-600';
  if (s >= 40) return 'bg-amber-500/10 text-amber-600';
  return 'bg-red-500/10 text-red-600';
}

export function GrowthAdminClient({ initialPages }: { initialPages: SeoPage[] }) {
  const router = useRouter();
  const [pages, setPages] = useState<SeoPage[]>(initialPages);
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [pending, startTransition] = useTransition();

  const authHeader = useCallback(async (): Promise<Record<string, string>> => {
    const { data } = await createClient().auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const generate = useCallback(async () => {
    setGenerating(true); setGenError(null);
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
      const res = await fetch(`${API_URL}/seo/generate`, {
        method: 'POST', headers,
        body: JSON.stringify({ topic: topic.trim() || undefined }),
      });
      if (!res.ok) {
        let detail = res.statusText;
        try { const j = await res.json(); if (typeof j.detail === 'string') detail = j.detail; } catch { /* */ }
        throw new Error(detail || `Generation failed (${res.status})`);
      }
      const draft = (await res.json()) as SeoPage;
      setPages((prev) => [draft, ...prev]);
      setTopic('');
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }, [authHeader, topic]);

  const act = useCallback((p: SeoPage, status: 'published' | 'rejected' | 'draft') => {
    setActionErr(null);
    startTransition(async () => {
      const res = await setSeoStatus(p.id, p.slug, status);
      if (res.success) {
        setPages((prev) => prev.map((x) => x.id === p.id
          ? { ...x, status, published_at: status === 'published' ? new Date().toISOString() : null }
          : x));
      } else {
        setActionErr(res.error || 'Action failed');
      }
      router.refresh();
    });
  }, [router]);

  const shown = pages.filter((p) => filter === 'all' ? true : p.status === filter);
  const counts = {
    draft: pages.filter((p) => p.status === 'draft').length,
    published: pages.filter((p) => p.status === 'published').length,
    rejected: pages.filter((p) => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-5">
      <DailyPanel authHeader={authHeader} onCreated={(p) => { setPages((prev) => [p, ...prev]); router.refresh(); }} />

      {/* Generate panel */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="text-xs text-muted-foreground">Topic (optional — leave blank to use the freshest GD-worthy news)</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. quick-commerce unit economics"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            onClick={generate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            {generating ? 'Writing…' : 'Generate a draft'}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Each run makes one grounded draft and self-scores it. It never publishes — you approve below.
        </p>
        {genError && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600"><AlertTriangle className="h-3.5 w-3.5" />{genError}</p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(['all', 'draft', 'published', 'rejected'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === f ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && <span className="ml-1 opacity-60">{counts[f]}</span>}
          </button>
        ))}
      </div>

      {actionErr && (
        <p className="flex items-center gap-1.5 text-xs text-red-600"><AlertTriangle className="h-3.5 w-3.5" />{actionErr}</p>
      )}

      {/* List */}
      <div className="space-y-3">
        {shown.length === 0 && (
          <p className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            No drafts yet — generate one above.
          </p>
        )}
        {shown.map((p) => {
          const c = p.content || {};
          const sections = c.sections?.length ?? 0;
          const steps = c.framework?.steps?.length ?? 0;
          const takeaways = c.takeaways?.length ?? 0;
          return (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-strong font-semibold text-foreground">{p.title}</p>
                  {p.dek && <p className="mt-0.5 text-small text-muted-foreground">{p.dek}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${scoreClass(p.quality_score)}`}>
                    QA {p.quality_score ?? '—'}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[p.status] || 'bg-muted text-muted-foreground'}`}>
                    {p.status}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-muted-foreground">
                {p.kind === 'daily' && <span className="mr-1 rounded bg-navy/10 px-1.5 py-0.5 font-semibold text-navy">Daily</span>}
                /insights/{p.slug} · {sections} sections · {steps} steps · {takeaways} takeaways
                {c.sources?.length ? ` · ${c.sources.length} sources` : ''}{c.words ? ` · ${c.words} words` : ''}
                {p.model ? ` · ${p.model}` : ''}
              </p>

              {p.quality_notes && (
                <p className="mt-1.5 text-xs text-muted-foreground"><span className="font-medium text-foreground">QA note:</span> {p.quality_notes}</p>
              )}

              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium text-navy">Preview content</summary>
                <div className="mt-2 space-y-2 border-l-2 border-border pl-3 text-small text-muted-foreground">
                  {c.summary && <p className="text-foreground">{c.summary}</p>}
                  {c.intro && <p>{c.intro}</p>}
                  {c.framework?.steps?.length ? (
                    <div>
                      <p className="font-medium text-foreground">{c.framework.heading || 'How to structure it'}</p>
                      <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                        {c.framework.steps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                    </div>
                  ) : null}
                  {(c.sections || []).map((s, i) => (
                    <div key={i}>
                      {s.heading && <p className="font-medium text-foreground">{s.heading}</p>}
                      {(s.paragraphs || []).map((x, j) => <p key={j}>{x}</p>)}
                    </div>
                  ))}
                  {c.takeaways?.length ? (
                    <ul className="list-disc space-y-0.5 pl-4">
                      {c.takeaways.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  ) : null}
                  {c.practice_prompt && <p><span className="font-medium text-foreground">Practice:</span> {c.practice_prompt}</p>}
                </div>
              </details>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {p.status !== 'published' && (
                  <button
                    onClick={() => act(p, 'published')}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" /> Publish
                  </button>
                )}
                {p.status === 'published' && (
                  <>
                    <Link
                      href={`/insights/${p.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/40"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View live
                    </Link>
                    <button
                      onClick={() => act(p, 'draft')}
                      disabled={pending}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Unpublish
                    </button>
                  </>
                )}
                {p.status !== 'rejected' ? (
                  <button
                    onClick={() => act(p, 'rejected')}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-red-600 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                ) : (
                  <button
                    onClick={() => act(p, 'draft')}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </button>
                )}
                {p.status === 'published' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ the daily blog */
interface DailyStatus {
  config: { enabled: boolean; autopublish: boolean; min_score: number; research_available: boolean };
  today: { id: string; slug: string; title: string; status: string; quality_score: number | null } | null;
  candidates: { title: string; score: number; reasons: string[]; domain: string }[];
}
interface DailyRun {
  status: 'published' | 'draft' | 'exists' | 'skipped' | 'preview';
  reason: string;
  page?: SeoPage & { quality_notes?: string };
  trace?: { first_draft_problems?: string[]; research?: { angle: string; facts: number; error?: string }[] };
}

/**
 * The daily post (services/growth/daily_blog.py): what it is set to do, what it would write
 * about right now, and a way to try it before it runs on its own at 07:00 IST.
 */
function DailyPanel({ authHeader, onCreated }: {
  authHeader: () => Promise<Record<string, string>>; onCreated: (p: SeoPage) => void;
}) {
  const [st, setSt] = useState<DailyStatus | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<'preview' | 'draft' | null>(null);
  const [run, setRun] = useState<DailyRun | null>(null);

  const call = useCallback(async (path: string, body?: unknown) => {
    const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
    const res = await fetch(`${API_URL}${path}`, body === undefined ? { headers } : { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) {
      let detail = res.statusText;
      try { const j = await res.json(); if (typeof j.detail === 'string') detail = j.detail; } catch { /* */ }
      throw new Error(detail || `Request failed (${res.status})`);
    }
    return res.json();
  }, [authHeader]);

  const load = useCallback(() => {
    setErr(null);
    call('/seo/daily/status').then(setSt).catch((e) => setErr(e instanceof Error ? e.message : 'Could not load'));
  }, [call]);
  useEffect(() => { load(); }, [load]);

  async function go(kind: 'preview' | 'draft') {
    setBusy(kind); setErr(null); setRun(null);
    try {
      const r = (await call('/seo/daily/run', { dry_run: kind === 'preview', force: Boolean(st?.today) })) as DailyRun;
      setRun(r);
      if (r.status === 'draft' || r.status === 'published') { if (r.page) onCreated(r.page); load(); }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Run failed');
    } finally {
      setBusy(null);
    }
  }

  const on = (b: boolean | undefined) => (b ? 'On' : 'Off');
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 font-semibold text-foreground"><CalendarClock className="h-4 w-4" /> Daily post</p>
          <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
            Every day at 07:00 IST: picks a non-political business story (or an evergreen topic), researches sourced
            facts, writes about 900 words with an interview angle and a related case, checks every number against
            its sources, and scores it. Live by 08:00 when it publishes.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => go('preview')} disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/40 disabled:opacity-50">
            {busy === 'preview' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />} Preview (not saved)
          </button>
          <button onClick={() => go('draft')} disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {busy === 'draft' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
            {st?.today ? 'Write another as a draft' : 'Write today’s post as a draft'}
          </button>
        </div>
      </div>
      {busy && <p className="mt-2 text-xs text-muted-foreground">Researching and writing — this takes a minute or two.</p>}
      {err && <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600"><AlertTriangle className="h-3.5 w-3.5" />{err}</p>}

      {st && (
        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
          <div><dt className="text-muted-foreground">Runs every morning</dt><dd className="font-medium">{on(st.config.enabled)} <span className="font-normal text-muted-foreground">(DAILY_BLOG_ENABLED)</span></dd></div>
          <div><dt className="text-muted-foreground">Publishes on its own</dt><dd className="font-medium">{on(st.config.autopublish)} <span className="font-normal text-muted-foreground">(DAILY_BLOG_AUTOPUBLISH)</span></dd></div>
          <div><dt className="text-muted-foreground">Score needed to publish</dt><dd className="font-medium">{st.config.min_score}</dd></div>
          <div><dt className="text-muted-foreground">Web research</dt><dd className="font-medium">{st.config.research_available ? 'Ready' : 'Missing GEMINI_API_KEY'}</dd></div>
        </dl>
      )}
      {st?.today && (
        <p className="mt-3 text-xs">
          <span className="text-muted-foreground">Today:</span> <span className="font-medium">{st.today.title}</span>{' '}
          <span className="text-muted-foreground">({st.today.status}, QA {st.today.quality_score ?? '—'})</span>
        </p>
      )}
      {st && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-navy">Topics it would pick right now ({st.candidates.length})</summary>
          {st.candidates.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">No fresh story qualifies; it would write an evergreen topic.</p>
          ) : (
            <ol className="mt-2 space-y-1.5 text-xs">
              {st.candidates.map((c, i) => (
                <li key={i}>
                  <span className="font-medium text-foreground">{c.title}</span>{' '}
                  <span className="text-muted-foreground">· {c.score} · {c.reasons.join('; ')}</span>
                </li>
              ))}
            </ol>
          )}
        </details>
      )}

      {run && (
        <div className="mt-3 rounded-lg border border-border bg-background p-3 text-xs">
          <p><span className="font-semibold">{run.status}</span> <span className="text-muted-foreground">· {run.reason}</span></p>
          {run.page && (
            <div className="mt-2 space-y-1">
              <p className="text-sm font-semibold text-foreground">{run.page.title}</p>
              {run.page.content?.summary && <p className="text-muted-foreground">{run.page.content.summary}</p>}
              <p className="text-muted-foreground">QA {run.page.quality_score ?? '—'} · {run.page.content?.words ?? '?'} words ·{' '}
                {run.page.content?.sources?.length ?? 0} sources</p>
              {run.page.quality_notes && <p className="text-muted-foreground"><span className="font-medium text-foreground">Checks and critic:</span> {run.page.quality_notes}</p>}
            </div>
          )}
          {run.trace?.research?.length ? (
            <p className="mt-2 text-muted-foreground">Research: {run.trace.research.map((r) => `${r.angle} (${r.facts} sourced facts${r.error ? `, ${r.error}` : ''})`).join(' → ')}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
