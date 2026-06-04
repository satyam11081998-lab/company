'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { fetchHeadlines, generateBrief } from '@/lib/api';
import type { NewsHeadline } from '@/lib/types';
import { Newspaper, Sparkles, ArrowRight, ExternalLink, Loader2, AlertCircle, Lock } from 'lucide-react';
import { useUser } from '@/components/user-context';
import { createClient } from '@/lib/supabase/client';

export default function GdBriefsPage() {
  const router = useRouter();
  const [headlines, setHeadlines] = useState<NewsHeadline[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const { hasTierAccess } = useUser();
  const locked = !hasTierAccess('lite');

  useEffect(() => {
    let mounted = true;
    if (locked) { setLoading(false); return; }
    fetchHeadlines()
      .then((data) => {
        if (!mounted) return;
        setHeadlines(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Could not load headlines');
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [locked]);

  async function handleGenerate(headlineId: string) {
    setGeneratingId(headlineId);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      await generateBrief(headlineId, session?.access_token);
      router.push('/gd-briefs/' + headlineId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate brief');
      setGeneratingId(null);
    }
  }

  const star = headlines ? headlines.find((h) => h.is_star) || null : null;
  const regulars = headlines ? headlines.filter((h) => !h.is_star).slice(0, 9) : [];

  if (locked) {
    return (
      <div className="min-h-screen bg-muted">
        <main className="container max-w-3xl py-16">
          <div className="bg-card rounded-xl border border-border shadow-sm p-10 text-center">
            <Lock className="h-10 w-10 text-muted-foreground/60 mx-auto" />
            <h1 className="mt-4 text-h2 text-foreground">GD Briefs is a Lite feature</h1>
            <p className="mt-2 text-body text-muted-foreground max-w-md mx-auto">
              Daily GD prep — sharp angles, likely questions, opening and closing lines on the day&apos;s biggest debates — is included with Lite and Pro.
            </p>
            <Link href="/upgrade" className="mt-6 inline-flex items-center gap-1.5 bg-primary text-white text-body font-semibold px-5 py-2.5 rounded-md hover:bg-primary-hover transition-colors">
              Upgrade to unlock GD Briefs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-6xl py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">GD Briefs</h1>
          <p className="mt-1 text-muted-foreground">
            Sharp takes on the day&apos;s most debate-worthy stories. Click any headline to generate a full GD brief.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard tall />
            <div className="grid gap-4 md:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : error ? (
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Could not load headlines</h3>
                <p className="mt-1 text-base text-muted-foreground">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-base font-medium text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : headlines && headlines.length === 0 ? (
          <div className="bg-card rounded-xl border border-border shadow-sm p-10 text-center">
            <Newspaper className="h-10 w-10 text-muted-foreground/50 mx-auto" />
            <h3 className="mt-4 font-semibold text-foreground">No headlines yet</h3>
            <p className="mt-1 text-base text-muted-foreground">
              Fresh headlines arrive daily. Check back tomorrow.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {star ? (
              <StarHeadlineCard
                headline={star}
                generating={generatingId === star.id}
                onGenerate={() => handleGenerate(star.id)}
              />
            ) : null}
            {regulars.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3 stagger">
                {regulars.map((h) => (
                  <HeadlineCard
                    key={h.id}
                    headline={h}
                    generating={generatingId === h.id}
                    onGenerate={() => handleGenerate(h.id)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

interface CardProps {
  headline: NewsHeadline;
  generating: boolean;
  onGenerate: () => void;
}

function StarHeadlineCard(props: CardProps) {
  const { headline, generating, onGenerate } = props;
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-slide-up">
      <div className="grid md:grid-cols-[2fr_3fr]">
        <div className="relative aspect-video md:aspect-auto md:min-h-[240px] bg-navy">
          {headline.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={headline.thumbnail_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-navy-foreground/30">
              <Newspaper className="h-16 w-16" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-base font-semibold text-primary-foreground shadow">
            <Sparkles className="h-3 w-3" />
            Most GD-worthy today
          </div>
        </div>
        <div className="flex flex-col p-6">
          <div className="flex items-center gap-2 text-base text-muted-foreground">
            <span className="font-medium">{headline.source_name}</span>
            <span>·</span>
            <span>{formatRelativeTime(headline.published_at)}</span>
          </div>
          <a
            href={headline.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xl font-bold leading-tight text-foreground hover:text-primary transition-colors group"
          >
            {headline.title}
            <ExternalLink className="ml-1 inline h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          {headline.description ? (
            <p className="mt-2 line-clamp-3 text-base text-muted-foreground">{headline.description}</p>
          ) : null}
          {headline.keywords.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {headline.keywords.slice(0, 4).map((kw) => (
                <span
                  key={kw}
                  className="rounded-md bg-accent text-accent-foreground px-2 py-0.5 text-base font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-auto pt-4">
            {headline.has_brief ? (
              <Link
                href={'/gd-briefs/' + headline.id}
                className="btn-primary inline-flex items-center gap-1.5"
              >
                View brief
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={onGenerate}
                disabled={generating}
                className="btn-primary inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating brief...
                  </>
                ) : (
                  <>
                    Generate GD brief
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeadlineCard(props: CardProps) {
  const { headline, generating, onGenerate } = props;
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-video bg-navy">
        {headline.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={headline.thumbnail_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-navy-foreground/30">
            <Newspaper className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium">{headline.source_name}</span>
          <span>·</span>
          <span>{formatRelativeTime(headline.published_at)}</span>
        </div>
        <a
          href={headline.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 line-clamp-3 text-sm font-semibold leading-snug text-foreground hover:text-primary transition-colors"
        >
          {headline.title}
        </a>
        {headline.keywords.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {headline.keywords.slice(0, 3).map((kw) => (
              <span
                key={kw}
                className="rounded bg-accent text-accent-foreground px-1.5 py-0.5 text-[10px] font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-auto pt-2">
          {headline.has_brief ? (
            <Link
              href={'/gd-briefs/' + headline.id}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View brief
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <button
              onClick={onGenerate}
              disabled={generating}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate brief
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard(props: { tall?: boolean }) {
  const tallClass = props.tall ? 'h-48 md:h-60' : 'aspect-video';
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-pulse">
      <div className={'bg-muted ' + tallClass} />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
      </div>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return diffMin + 'm ago';
    if (diffHr < 24) return diffHr + 'h ago';
    if (diffDay < 7) return diffDay + 'd ago';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}