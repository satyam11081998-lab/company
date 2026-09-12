'use client';

import { useCallback, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { SeoPage } from '@/lib/seo-pages';
import { setSeoStatus } from './actions';
import {
  Rocket, Loader2, CheckCircle2, XCircle, ExternalLink, RotateCcw, Send, AlertTriangle,
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
                /insights/{p.slug} · {sections} sections · {steps} steps · {takeaways} takeaways
                {p.model ? ` · ${p.model}` : ''}
              </p>

              {p.quality_notes && (
                <p className="mt-1.5 text-xs text-muted-foreground"><span className="font-medium text-foreground">QA note:</span> {p.quality_notes}</p>
              )}

              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium text-navy">Preview content</summary>
                <div className="mt-2 space-y-2 border-l-2 border-border pl-3 text-small text-muted-foreground">
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
