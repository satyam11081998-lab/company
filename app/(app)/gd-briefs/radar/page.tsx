'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useUser } from '@/components/user-context';
import { GD_TOPICS, type GdTopic } from '@/lib/gd-topics';
import { CHEAT_DOMAINS, domainMeta, type CheatDomainId } from '@/lib/cheat-domains';
import {
  Radar, ArrowRight, ArrowLeft, Lock, Flame, RefreshCw, CalendarClock,
  Users, Sparkles, Newspaper,
} from 'lucide-react';

/**
 * Topic Radar — the propositions a placement or SIP panel is likely to put in
 * front of you, each tracked across a month of news.
 *
 * Sits between News briefs (today's headlines) and Abstract GD (no-facts
 * topics). Nothing about how topics are chosen or ranked is shown to the
 * reader: they see the list, why each one is worth their evening, and what
 * moved this week.
 */
export default function TopicRadarPage() {
  const { hasTierAccess } = useUser();
  const locked = !hasTierAccess('lite');
  const [domain, setDomain] = useState<CheatDomainId | 'all'>('all');

  const shown = useMemo(
    () => (domain === 'all' ? GD_TOPICS : GD_TOPICS.filter((t) => t.domains.includes(domain))),
    [domain],
  );

  const movingNow = GD_TOPICS.filter((t) => t.live).length;
  const updatesToday = GD_TOPICS.reduce((n, t) => n + (t.updated === '22 Sep 2026' ? t.updates : 0), 0);

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-6xl py-8">

        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <Link
            href="/gd-briefs"
            className="inline-flex items-center gap-1 text-small font-medium text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Today&apos;s news briefs
          </Link>

          <div className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Radar className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Topic Radar</h1>
              <p className="mt-1 text-muted-foreground">
                The discussions a panel is actually likely to put in front of you this season — each one
                tracked across a month of news, so you walk in current rather than merely informed.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-small text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-card border border-border px-2.5 py-1">
              <Flame className="h-3.5 w-3.5 text-primary" />
              {movingNow} moving in the news right now
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-card border border-border px-2.5 py-1">
              <RefreshCw className="h-3.5 w-3.5 text-primary" />
              {updatesToday} updates added today
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-card border border-border px-2.5 py-1">
              <CalendarClock className="h-3.5 w-3.5 text-primary" />
              Summer-internship season
            </span>
          </div>
        </div>

        {/* Domain filter */}
        <div className="mb-5 flex flex-wrap gap-2">
          <FilterChip active={domain === 'all'} onClick={() => setDomain('all')} label="All domains" />
          {CHEAT_DOMAINS.filter((d) => d.id !== 'general').map((d) => (
            <FilterChip
              key={d.id}
              active={domain === d.id}
              onClick={() => setDomain(d.id)}
              label={d.label}
              accent={d.accent}
            />
          ))}
        </div>

        {locked && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-small text-muted-foreground">
                The radar is free to browse — you can always see what is coming up and why.{' '}
                <span className="font-medium text-foreground">Full briefs</span>, with the month of updates,
                the numbers and what to say, are included with Lite and Pro.
              </p>
            </div>
            <Link
              href="/upgrade"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-small font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Upgrade <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* The board */}
        <div className="space-y-3 stagger">
          {shown.map((t, i) => (
            <TopicRow key={t.slug} topic={t} rank={i + 1} locked={locked} />
          ))}
        </div>

        {shown.length === 0 && (
          <Card className="p-8 text-center">
            <Newspaper className="mx-auto h-9 w-9 text-muted-foreground/50" />
            <h3 className="mt-3 font-semibold text-foreground">Nothing sitting mainly in that domain today</h3>
            <p className="mx-auto mt-1 max-w-md text-body text-muted-foreground">
              Widen the filter. A strong candidate brings a topic across from a neighbouring domain and makes the
              connection themselves — that is usually the best contribution in the room.
            </p>
          </Card>
        )}

        {/* Where to go next */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/gd-briefs"
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
          >
            <div className="flex items-center gap-2 text-small font-semibold text-primary">
              <Newspaper className="h-4 w-4" /> Today&apos;s news briefs
            </div>
            <p className="mt-1.5 text-body text-muted-foreground">
              The day&apos;s headlines, one brief each. Use the radar for what will be discussed; use the briefs to
              keep up day to day.
            </p>
          </Link>
          <Link
            href="/gd-briefs/abstract"
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
          >
            <div className="flex items-center gap-2 text-small font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> Abstract GD
            </div>
            <p className="mt-1.5 text-body text-muted-foreground">
              Topics with no facts to cite at all — &ldquo;Black or White&rdquo;, &ldquo;Is failure necessary&rdquo;.
              A different muscle, and the one most candidates never train.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}

function FilterChip(props: { active: boolean; onClick: () => void; label: string; accent?: string }) {
  const { active, onClick, label, accent } = props;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-small font-medium transition-colors',
        active
          ? 'border-primary/40 bg-primary/5 text-primary'
          : 'border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground',
      ].join(' ')}
    >
      {accent ? (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} aria-hidden="true" />
      ) : null}
      {label}
    </button>
  );
}

function TopicRow(props: { topic: GdTopic; rank: number; locked: boolean }) {
  const { topic, rank, locked } = props;
  const ready = Boolean(topic.dossier);
  const href = `/gd-briefs/radar/${topic.slug}`;

  const body = (
    <div className="grid grid-cols-[auto_1fr] gap-4 sm:grid-cols-[3rem_1fr_auto] sm:gap-5">
      {/* rank */}
      <div className="pt-0.5 text-2xl font-bold tracking-tightest text-primary/70 tabular-nums">
        {String(rank).padStart(2, '0')}
      </div>

      <div className="min-w-0">
        <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground">
          {topic.proposition}
        </h2>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {topic.live ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
              <Flame className="h-3 w-3" /> Moving now
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning">
              Comes up every season
            </span>
          )}
          {topic.domains.map((d) => {
            const m = domainMeta(d);
            return (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.accent }} aria-hidden="true" />
                {m.label}
              </span>
            );
          })}
        </div>

        <p className="mt-2.5 text-body text-muted-foreground">{topic.whyHere}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {topic.askedBy}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            {topic.updates} {topic.updates === 1 ? 'update' : 'updates'} this week · last {topic.updated}
          </span>
        </div>
      </div>

      {/* action */}
      <div className="col-start-2 sm:col-start-3 sm:self-center">
        {ready ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-small font-semibold text-white transition-colors group-hover:bg-primary-hover">
            {locked ? <Lock className="h-3.5 w-3.5" /> : null}
            Open brief
            <ArrowRight className="h-4 w-4" />
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md border border-border px-3 py-2 text-small font-medium text-muted-foreground">
            Brief in preparation
          </span>
        )}
      </div>
    </div>
  );

  if (!ready) {
    return (
      <Card className="p-5 opacity-80" aria-label={topic.proposition}>
        {body}
        <p className="mt-3 border-t border-border pt-3 text-small text-muted-foreground">
          We open a brief once both sides have been argued on the record by someone we can name. Until then this
          one stays on the radar so you know it is coming.
        </p>
      </Card>
    );
  }

  return (
    <Link href={href} className="group block">
      <Card className="p-5 transition-colors hover:border-primary/40">{body}</Card>
    </Link>
  );
}
