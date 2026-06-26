'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/user-context';
import { generateAbstractBrief } from '@/lib/api';
import { ABSTRACT_PRIMER, TOPIC_CATEGORIES, type AbstractBrief } from '@/lib/abstract-gd';
import {
  Brain, Sparkles, Lightbulb, Compass, Scale, Quote, AlertTriangle,
  Loader2, ArrowLeft, Lock, ListChecks,
} from 'lucide-react';

export default function AbstractGdPage() {
  const router = useRouter();
  const { hasTierAccess } = useUser();
  const locked = !hasTierAccess('lite');

  const [topic, setTopic] = useState('');
  const [brief, setBrief] = useState<AbstractBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(t: string) {
    const clean = t.trim();
    if (!clean) return;
    if (locked) { router.push('/upgrade'); return; }
    setLoading(true);
    setError(null);
    setBrief(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const data = await generateAbstractBrief(clean, session?.access_token);
      setBrief(data);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate brief');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-5xl py-8">
        <Link href="/gd-briefs" className="mb-4 inline-flex items-center gap-1.5 text-small text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> GD Briefs
        </Link>

        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Brain className="h-7 w-7 text-primary" /> GD Topics
          </h1>
          <p className="mt-1 text-muted-foreground">
            Practice GD on Abstract prompts and every domain — HR, business, tech, economy, society.
            (Today&apos;s news topics are in the live GD Briefs feed.) Learn the method below, then drill it on any topic.
            {locked && ' Browse the method free; generating a brief is a Lite/Pro feature.'}
          </p>
          <p className="mt-1 text-micro text-muted-foreground">Coming next: timed practice with AI scoring, and live mock GDs.</p>
        </div>

        {/* Generate-for-any-topic */}
        <Card className="mb-8 border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Crack any abstract topic</h2>
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

          {/* Topic bank — by category */}
          <div className="mt-5 space-y-4">
            {TOPIC_CATEGORIES.map((cat) => (
              <div key={cat.category}>
                <p className="text-micro font-semibold uppercase tracking-wide text-primary">{cat.category}</p>
                <p className="mb-2 text-micro text-muted-foreground">{cat.blurb}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.topics.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTopic(t); generate(t); }}
                      disabled={loading}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-muted disabled:opacity-50"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        {/* Generated brief */}
        {brief && (
          <div className="mb-10 space-y-5">
            <h2 className="text-2xl font-bold text-foreground">&ldquo;{brief.topic}&rdquo;</h2>
            <BriefBlock icon={Compass} title="Interpretations — pick your door" items={brief.interpretations} />
            <BriefBlock icon={Lightbulb} title="Idea pool (brainstorm wide first)" items={brief.idea_pool} />
            <BriefBlock icon={ListChecks} title="Lenses for instant structure" items={brief.lenses} />
            <div className="grid gap-5 md:grid-cols-2">
              <BriefBlock icon={Scale} title="Strongest points — one side" items={brief.balanced_for} />
              <BriefBlock icon={Scale} title="Strongest points — other side" items={brief.balanced_against} />
            </div>
            <BriefBlock icon={Quote} title="Analogies & examples to cite" items={brief.analogies} />
            <BriefBlock icon={ListChecks} title="A model structure" items={brief.sample_structure} ordered />
            <BriefBlock icon={AlertTriangle} title="Pitfalls to avoid" items={brief.pitfalls} />
            <div className="grid gap-5 md:grid-cols-2">
              <BriefBlock icon={Quote} title="Opening lines" items={brief.opening_lines} />
              <BriefBlock icon={Quote} title="Closing lines" items={brief.closing_lines} />
            </div>
          </div>
        )}

        {/* The method primer */}
        <div className="mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">The method — learn this once, crack any GD topic</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {ABSTRACT_PRIMER.map((step) => (
            <Card key={step.title} className="border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-foreground">
                <span className="font-semibold">Drill:</span> {step.drill}
              </p>
            </Card>
          ))}
        </div>
      </main>
    </div>
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
    <Card className="border-border bg-card p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" /> {title}
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
