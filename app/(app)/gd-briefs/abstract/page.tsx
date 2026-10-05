'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/user-context';
import { generateAbstractBrief } from '@/lib/api';
import {
  ABSTRACT_PRIMER, TOPIC_CATEGORIES, topicKey,
  type AbstractBrief, type AbstractPerspective,
} from '@/lib/abstract-gd';
import {
  Brain, Sparkles, Lightbulb, Compass, Scale, Quote, AlertTriangle,
  Loader2, ArrowLeft, Lock, ListChecks, Check, ChevronDown, Library, Newspaper,
} from 'lucide-react';

interface LibraryItem {
  topic_key: string;
  topic: string;
  created_at: string;
}

export default function AbstractGdPage() {
  const router = useRouter();
  const { hasTierAccess } = useUser();
  const locked = !hasTierAccess('lite');

  const [topic, setTopic] = useState('');
  const [brief, setBrief] = useState<AbstractBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTopic, setLoadingTopic] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Shared library: every brief ANY user has generated (abstract_briefs cache).
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [libOpenMobile, setLibOpenMobile] = useState(false);

  // Topic-bank categories: collapsed by default (first one open) — kills the
  // mobile clutter and makes the page scannable.
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(
    () => (TOPIC_CATEGORIES[0] ? { [TOPIC_CATEGORIES[0].category]: true } : {}),
  );

  const viewerRef = useRef<HTMLDivElement>(null);
  const readyKeys = useMemo(() => new Set(library.map((b) => b.topic_key)), [library]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/abstract-briefs', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && Array.isArray(data.briefs)) setLibrary(data.briefs);
      } catch { /* library is progressive enhancement — page works without it */ }
    })();
    return () => { mounted = false; };
  }, []);

  function scrollToViewer() {
    // The brief renders directly under the generator — scroll THERE, not to the
    // page top (the old behaviour that made results invisible below the fold).
    requestAnimationFrame(() => viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  /** Open an already-generated brief straight from the shared cache — zero tokens. */
  async function openFromLibrary(key: string, title: string) {
    if (locked) { router.push('/upgrade'); return; }
    setLoading(true);
    setLoadingTopic(title);
    setError(null);
    setBrief(null);
    setActiveKey(key);
    scrollToViewer();
    try {
      const res = await fetch(`/api/abstract-briefs?key=${encodeURIComponent(key)}`, { cache: 'no-store' });
      if (res.status === 403) { router.push('/upgrade'); return; }
      if (!res.ok) throw new Error('Could not load this brief');
      const data = await res.json();
      setBrief({ topic: data.topic, ...(data.brief as Omit<AbstractBrief, 'topic'>) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this brief');
    } finally {
      setLoading(false);
    }
  }

  async function generate(t: string) {
    const clean = t.trim();
    if (!clean) return;
    if (locked) { router.push('/upgrade'); return; }

    const key = topicKey(clean);
    // Already in the shared library? Open it instead of re-billing tokens.
    if (readyKeys.has(key)) {
      const item = library.find((b) => b.topic_key === key);
      await openFromLibrary(key, item?.topic ?? clean);
      return;
    }

    setLoading(true);
    setLoadingTopic(clean);
    setError(null);
    setBrief(null);
    setActiveKey(key);
    scrollToViewer();
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const data = await generateAbstractBrief(clean, session?.access_token);
      setBrief(data);
      // It's now cached for everyone — add to the library optimistically.
      setLibrary((prev) => prev.some((b) => b.topic_key === key)
        ? prev
        : [{ topic_key: key, topic: data.topic || clean, created_at: new Date().toISOString() }, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate brief');
    } finally {
      setLoading(false);
    }
  }

  const librarySidebar = (
    <nav className="space-y-1">
      {library.length === 0 ? (
        <p className="px-2 py-3 text-xs text-muted-foreground">
          No briefs yet — generate the first one and it appears here for everyone.
        </p>
      ) : (
        library.map((b) => (
          <button
            key={b.topic_key}
            onClick={() => { setLibOpenMobile(false); openFromLibrary(b.topic_key, b.topic); }}
            className={`flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
              activeKey === b.topic_key
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
            }`}
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="line-clamp-2">{b.topic}</span>
          </button>
        ))
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-6xl py-6 sm:py-8">
        <Link href="/gd-briefs" className="mb-4 inline-flex items-center gap-1.5 text-small text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> GD Briefs
        </Link>

        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            <Brain className="h-7 w-7 shrink-0 text-primary" /> GD Topics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Practice GD on Abstract prompts and every domain — HR, business, tech, economy, society.
            {locked && ' Browse the method and library free; viewing or generating a brief is Lite/Pro.'}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-6">
          {/* Left rail — the shared library (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-3">
              <p className="mb-2 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Library className="h-3.5 w-3.5" /> Generated briefs · {library.length}
              </p>
              <div className="max-h-[70vh] overflow-y-auto">{librarySidebar}</div>
            </div>
          </aside>

          <div className="min-w-0">
            {/* Mobile: library as a collapsible card */}
            <div className="mb-4 lg:hidden">
              <button
                onClick={() => setLibOpenMobile((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Library className="h-4 w-4 text-primary" /> Generated briefs
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{library.length}</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${libOpenMobile ? 'rotate-180' : ''}`} />
              </button>
              {libOpenMobile && (
                <div className="mt-1 max-h-72 overflow-y-auto rounded-xl border border-border bg-card p-2">{librarySidebar}</div>
              )}
            </div>

            {/* Generator */}
            <Card className="border-border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 shrink-0 text-primary" />
                <h2 className="text-base font-semibold text-foreground sm:text-lg">Crack any abstract topic</h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') generate(topic); }}
                  placeholder='e.g. "Black or White", "Zero", "Less is more"'
                  className="h-11 flex-1 rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={() => generate(topic)}
                  disabled={loading || !topic.trim()}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : locked ? <Lock className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  {loading ? 'Generating…' : 'Generate brief'}
                </button>
              </div>
              <p className="mt-2 text-micro text-muted-foreground">
                Topics with a <Check className="inline h-3 w-3 text-primary" /> are already generated — they open instantly, no tokens spent.
              </p>
            </Card>

            {/* ── THE VIEWER — always right here, directly under the generator ── */}
            <div ref={viewerRef} className="scroll-mt-24">
              {loading && (
                <Card className="mt-4 border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Preparing &ldquo;{loadingTopic}&rdquo;</p>
                      <p className="text-xs text-muted-foreground">Your brief will appear right here — 5–15 s for a fresh topic, instant for cached ones.</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                  </div>
                </Card>
              )}

              {error && !loading && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="text-sm">{error}</div>
                </div>
              )}

              {brief && !loading && (
                <div className="mt-5 space-y-4 sm:space-y-5">
                  <h2 className="text-xl font-bold text-foreground sm:text-2xl">&ldquo;{brief.topic}&rdquo;</h2>

                  {brief.perspectives && brief.perspectives.length > 0 && (
                    <section>
                      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                        <Newspaper className="h-4 w-4 text-primary" /> How the editorials would argue it
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {brief.perspectives.map((p, i) => <PerspectiveCard key={i} p={p} />)}
                      </div>
                    </section>
                  )}

                  <BriefBlock icon={Compass} title="Interpretations — pick your door" items={brief.interpretations} />
                  <BriefBlock icon={Lightbulb} title="Idea pool (brainstorm wide first)" items={brief.idea_pool} />
                  <BriefBlock icon={ListChecks} title="Lenses for instant structure" items={brief.lenses} />
                  <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                    <BriefBlock icon={Scale} title="Strongest points — one side" items={brief.balanced_for} />
                    <BriefBlock icon={Scale} title="Strongest points — other side" items={brief.balanced_against} />
                  </div>
                  <BriefBlock icon={Quote} title="Analogies & examples to cite" items={brief.analogies} />
                  <BriefBlock icon={ListChecks} title="A model structure" items={brief.sample_structure} ordered />
                  <BriefBlock icon={AlertTriangle} title="Pitfalls to avoid" items={brief.pitfalls} />
                  <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                    <BriefBlock icon={Quote} title="Opening lines" items={brief.opening_lines} />
                    <BriefBlock icon={Quote} title="Closing lines" items={brief.closing_lines} />
                  </div>
                </div>
              )}
            </div>

            {/* Topic bank — collapsible categories (first open, rest collapsed) */}
            <Card className="mt-6 border-border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="mb-3 text-base font-semibold text-foreground sm:text-lg">Topic bank</h2>
              <div className="space-y-2">
                {TOPIC_CATEGORIES.map((cat) => {
                  const open = !!openCats[cat.category];
                  return (
                    <div key={cat.category} className="rounded-lg border border-border">
                      <button
                        onClick={() => setOpenCats((prev) => ({ ...prev, [cat.category]: !prev[cat.category] }))}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                      >
                        <span>
                          <span className="text-sm font-semibold text-foreground">{cat.category}</span>
                          <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">{cat.blurb}</span>
                        </span>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                      </button>
                      {open && (
                        <div className="flex flex-wrap gap-2 px-3 pb-3">
                          {cat.topics.map((t) => {
                            const ready = readyKeys.has(topicKey(t));
                            return (
                              <button
                                key={t}
                                onClick={() => { setTopic(t); generate(t); }}
                                disabled={loading}
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                                  ready
                                    ? 'border-primary/40 bg-primary/5 font-medium text-primary hover:bg-primary/10'
                                    : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted'
                                }`}
                              >
                                {ready && <Check className="h-3 w-3" />}
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* The method primer */}
            <div className="mb-4 mt-8 flex items-center gap-2">
              <Brain className="h-5 w-5 shrink-0 text-primary" />
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">The method — learn this once, crack any GD topic</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {ABSTRACT_PRIMER.map((step) => (
                <Card key={step.title} className="border-border bg-card p-4 shadow-sm sm:p-5">
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-foreground">
                    <span className="font-semibold">Drill:</span> {step.drill}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PerspectiveCard({ p }: { p: AbstractPerspective }) {
  return (
    <Card className="border-border bg-card p-4 shadow-sm sm:p-5">
      <p className="text-micro font-bold uppercase tracking-widest text-primary">{p.title}</p>
      <p className="mt-1 text-sm font-semibold italic text-foreground">{p.stance}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{p.argument}</p>
      {p.data_points && p.data_points.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
          {p.data_points.map((d, i) => (
            <li key={i} className="flex gap-2 text-xs text-muted-foreground">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function BriefBlock({
  icon: Icon, title, items, ordered = false,
}: {
  icon: React.FC<{ className?: string }>;
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  if (!items || items.length === 0) return null;
  return (
    <Card className="border-border bg-card p-4 shadow-sm sm:p-5">
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
        <Icon className="h-4 w-4 shrink-0 text-primary" /> {title}
      </h3>
      {ordered ? (
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground">
          {items.map((it, i) => <li key={i}>{it}</li>)}
        </ol>
      ) : (
        <ul className="space-y-2 text-sm leading-relaxed text-foreground">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
