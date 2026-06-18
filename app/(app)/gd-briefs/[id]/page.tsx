'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { fetchBrief, generateBrief } from '@/lib/api';
import type { GeneratedBriefData } from '@/lib/types';
import { ArrowLeft, ArrowRight, ExternalLink, AlertCircle, Loader2, MessageSquare, Lightbulb, BarChart3, Quote, AlertTriangle, CheckCircle2, Lock, Star } from 'lucide-react';
import { useUser } from '@/components/user-context';
import { AddToCheatSheetButton } from '@/components/cheat-sheet/add-to-cheat-sheet-button';
import EngagingLoader from '@/components/engaging-loader';
import { createClient } from '@/lib/supabase/client';

export default function BriefDetailPage() {
  const params = useParams();
  const headlineId = params.id as string;

  const [brief, setBrief] = useState<GeneratedBriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hasTierAccess } = useUser();
  const locked = !hasTierAccess('lite');

  useEffect(() => {
    let mounted = true;
    if (locked) { setLoading(false); return; }

    // Two-step fetch: try the cached GET first (fast), and if the backend
    // returns 404 because no brief has been generated yet, transparently
    // trigger generation via POST. This was previously showing
    // "Could not load brief — brief not generated yet" on first visit.
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      try {
        const cached = await fetchBrief(headlineId, token);
        if (mounted) {
          setBrief(cached);
          setLoading(false);
        }
        return;
      } catch (err: any) {
        const msg = String(err?.message || '');
        const is404 = msg.includes('(404)') || msg.toLowerCase().includes('not generated');
        if (!is404) {
          if (mounted) {
            setError(msg || 'Could not load brief');
            setLoading(false);
          }
          return;
        }
      }

      // First-visit path — generate then render. Generation is a slower
      // OpenAI call (~5-10s); we keep the loading skeleton up until it returns.
      try {
        const fresh = await generateBrief(headlineId, token);
        if (mounted) {
          setBrief(fresh);
          setLoading(false);
        }
      } catch (genErr: any) {
        if (mounted) {
          setError(genErr?.message || 'Could not generate brief');
          setLoading(false);
        }
      }
    };

    load();
    return () => { mounted = false; };
  }, [headlineId, locked]);

  if (locked) {
    return (
      <div className="min-h-screen bg-muted">
        <main className="container max-w-3xl py-16">
          <Card className="p-10 text-center">
            <Lock className="h-10 w-10 text-muted-foreground/60 mx-auto" />
            <h1 className="mt-4 text-h2 text-foreground">GD Briefs is a Lite feature</h1>
            <p className="mt-2 text-body text-muted-foreground max-w-md mx-auto">
              Upgrade to Lite or Pro to read full GD briefs.
            </p>
            <Link href="/upgrade" className="mt-6 inline-flex items-center gap-1.5 bg-primary text-white text-body font-semibold px-5 py-2.5 rounded-md hover:bg-primary-hover transition-colors">
              Upgrade now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-4xl py-10">
        <Link
          href="/gd-briefs"
          className="inline-flex items-center gap-1 text-small font-medium text-muted-foreground hover:text-foreground mb-6 animate-fade-in"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all briefs
        </Link>

        {loading ? (
          <div className="space-y-6">
            <EngagingLoader variant="inline" label="Preparing your GD brief…" />
            <BriefSkeleton />
          </div>
        ) : error ? (
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Could not load brief</h3>
                <p className="mt-1 text-body text-muted-foreground">{error}</p>
              </div>
            </div>
          </Card>
        ) : brief ? (
          <BriefContent brief={brief} />
        ) : null}
      </main>
    </div>
  );
}

function BriefContent(props: { brief: GeneratedBriefData }) {
  const b = props.brief;
  return (
    <article className="space-y-6">
      {/* Header — headline title + source link */}
      <Card className="overflow-hidden animate-slide-up">
        {b.headline_thumbnail_url ? (
          <div className="relative aspect-[3/1] bg-navy overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.headline_thumbnail_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ) : null}
        <div className="p-6">
          <div className="flex items-center gap-2 text-small text-muted-foreground mb-2">
            <span className="rounded-md bg-accent text-accent-foreground px-2 py-0.5 font-medium">
              {b.gd_type}
            </span>
            <span>·</span>
            <span className="font-medium">{b.headline_source_name}</span>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-foreground">
            {b.headline_title}
          </h1>
          
          <a
            href={b.headline_source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-small font-medium text-primary hover:underline"
          >
            Read original article
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 animate-slide-up" style={{ animationDelay: '60ms' }}>
        <SectionHeading icon={<MessageSquare className="h-4 w-4" />}>
          Summary
        </SectionHeading>
        <p className="mt-3 text-body leading-relaxed text-foreground/90">{b.summary}</p>
      </Card>

      {/* Likely Questions */}
      {b.likely_questions.length > 0 ? (
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '120ms' }}>
          <SectionHeading icon={<Quote className="h-4 w-4" />}>
            Likely GD questions
          </SectionHeading>
          <ul className="mt-3 space-y-2">
            {b.likely_questions.map((q, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-primary font-semibold shrink-0">{i + 1}.</span>
                <span className="text-foreground/90">{q}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Smart Angles */}
      {b.smart_angles.length > 0 ? (
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '180ms' }}>
          <SectionHeading icon={<Lightbulb className="h-4 w-4" />}>
            Smart angles
          </SectionHeading>
          <p className="text-small text-muted-foreground mt-1">
            Non-obvious perspectives that make you stand out
          </p>
          <ul className="mt-4 space-y-3">
            {b.smart_angles.map((angle, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/90">{angle}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Data Points */}
      {b.data_points.length > 0 ? (
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '240ms' }}>
          <SectionHeading icon={<BarChart3 className="h-4 w-4" />}>
            Data points to cite
          </SectionHeading>
          <p className="text-small text-muted-foreground mt-1">
            Concrete numbers with attribution — drop these to sound credible.
            <span className="text-foreground/70"> Tap the <Star className="inline h-3 w-3 -mt-0.5 fill-primary text-primary" aria-hidden="true" /> on any point to save it to your cheat sheet.</span>
          </p>
          <ul className="mt-4 space-y-3">
            {b.data_points.map((dp, i) => (
              <li key={i} className="rounded-md bg-muted p-3 text-body text-foreground/90 flex items-start justify-between gap-2">
                <span>{dp}</span>
                <AddToCheatSheetButton
                  content={dp}
                  sourceTopic={b.headline_title}
                  sourceHeadlineId={b.headline_id}
                />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Opening Lines */}
      {b.opening_lines.length > 0 ? (
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <SectionHeading icon={<Quote className="h-4 w-4" />}>
            Opening lines
          </SectionHeading>
          <p className="text-small text-muted-foreground mt-1">
            How to start the discussion with authority
          </p>
          <ul className="mt-4 space-y-3">
            {b.opening_lines.map((line, i) => (
              <li key={i} className="rounded-md bg-accent/30 p-3 text-body italic text-foreground/90">
                &quot;{line}&quot;
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Counter Arguments */}
      {b.counter_arguments.length > 0 ? (
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '360ms' }}>
          <SectionHeading icon={<AlertTriangle className="h-4 w-4" />}>
            Counter-arguments
          </SectionHeading>
          <p className="text-small text-muted-foreground mt-1">
            What the other side will say — prepare your response
          </p>
          <ul className="mt-4 space-y-3">
            {b.counter_arguments.map((arg, i) => (
              <li key={i} className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <span className="text-foreground/90">{arg}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Closing Lines */}
      {b.closing_lines.length > 0 ? (
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '420ms' }}>
          <SectionHeading icon={<Quote className="h-4 w-4" />}>
            Closing lines
          </SectionHeading>
          <p className="text-small text-muted-foreground mt-1">
            How to wrap with a memorable takeaway
          </p>
          <ul className="mt-4 space-y-3">
            {b.closing_lines.map((line, i) => (
              <li key={i} className="rounded-md bg-accent/30 p-3 text-body italic text-foreground/90">
                &quot;{line}&quot;
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </article>
  );
}

function SectionHeading(props: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="text-small font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
      <span className="text-primary">{props.icon}</span>
      {props.children}
    </h2>
  );
}

function BriefSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Card className="overflow-hidden">
        <div className="aspect-[3/1] bg-muted" />
        <div className="p-6 space-y-3">
          <div className="h-3 w-1/4 bg-muted rounded" />
          <div className="h-6 w-3/4 bg-muted rounded" />
        </div>
      </Card>
      <Card className="p-6 space-y-3">
        <div className="h-3 w-1/3 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
      </Card>
      <Card className="p-6 space-y-3">
        <div className="h-3 w-1/3 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-5/6 bg-muted rounded" />
        <div className="h-4 w-4/6 bg-muted rounded" />
      </Card>
    </div>
  );
}