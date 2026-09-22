'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useUser } from '@/components/user-context';
import { AddToCheatSheetButton } from '@/components/cheat-sheet/add-to-cheat-sheet-button';
import { getTopic, TRUST_COPY, type GdTopic, type TrailEntry, type GdQuiz } from '@/lib/gd-topics';
import { domainMeta } from '@/lib/cheat-domains';
import {
  ArrowLeft, ArrowRight, Lock, Flame, Pin, CalendarClock, Sparkles,
  CircleHelp, EarOff, Link2, CheckCircle2, AlertTriangle, Quote, BarChart3,
  Users, Lightbulb, MessageSquare, ListChecks, Mic,
} from 'lucide-react';

const TABS = [
  { id: 'read',   label: 'The 60-second read' },
  { id: 'moved',  label: 'What’s moved' },
  { id: 'facts',  label: 'The numbers' },
  { id: 'who',    label: 'Who pays' },
  { id: 'sides',  label: 'Both sides' },
  { id: 'think',  label: 'How to think about it' },
  { id: 'say',    label: 'What to say' },
  { id: 'test',   label: 'Test yourself' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function TopicBriefPage() {
  const params = useParams();
  const slug = params.slug as string;
  const topic = useMemo(() => getTopic(slug), [slug]);
  const { hasTierAccess } = useUser();
  const locked = !hasTierAccess('lite');
  const [tab, setTab] = useState<TabId>('read');

  if (!topic || !topic.dossier) {
    return (
      <div className="min-h-screen bg-muted">
        <main className="container max-w-3xl py-16">
          <Card className="p-10 text-center">
            <CircleHelp className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <h1 className="mt-4 text-h3 text-foreground">This brief isn&apos;t open yet</h1>
            <p className="mx-auto mt-2 max-w-md text-body text-muted-foreground">
              We open a brief once both sides have been argued on the record by someone we can name. Until then the
              topic stays on the radar so you know it is coming.
            </p>
            <Link
              href="/gd-briefs/radar"
              className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-body font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Topic Radar
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-6xl py-8">

        <Link
          href="/gd-briefs/radar"
          className="inline-flex items-center gap-1 text-small font-medium text-muted-foreground hover:text-foreground mb-5"
        >
          <ArrowLeft className="h-4 w-4" />
          Topic Radar
        </Link>

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="animate-fade-in">
          <div className="flex flex-wrap items-center gap-1.5">
            {topic.live ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                <Flame className="h-3 w-3" /> Moving now
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning">
                Comes up every season
              </span>
            )}
            {topic.domains.map((id) => {
              const m = domainMeta(id);
              return (
                <span key={id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.accent }} aria-hidden="true" />
                  {m.label}
                </span>
              );
            })}
          </div>

          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground">
            {topic.proposition}
          </h1>
          <p className="mt-3 text-body leading-relaxed text-muted-foreground">
            {topic.standfirst}
          </p>
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div className="sticky top-14 z-10 -mx-6 mt-6 border-b border-border bg-muted px-6 md:top-16">
          <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Brief sections">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'whitespace-nowrap border-b-2 px-3 py-3 text-small font-medium transition-colors',
                  tab === t.id
                    ? 'border-primary font-semibold text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                <span className="mr-1.5 text-micro opacity-60 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="py-6">
          {tab === 'read' && <ReadPanel topic={topic} />}

          {tab !== 'read' && locked ? (
            <UpgradeWall />
          ) : (
            <>
              {tab === 'moved' && <MovedPanel topic={topic} />}
              {tab === 'facts' && <FactsPanel topic={topic} />}
              {tab === 'who'   && <WhoPanel topic={topic} />}
              {tab === 'sides' && <SidesPanel topic={topic} />}
              {tab === 'think' && <ThinkPanel topic={topic} />}
              {tab === 'say'   && <SayPanel topic={topic} />}
              {tab === 'test'  && <TestPanel topic={topic} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ───────────────────────── shared bits ───────────────────────── */

function SectionLabel(props: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-label text-muted-foreground">
      <span className="text-primary">{props.icon}</span>
      {props.children}
    </h2>
  );
}

function UpgradeWall() {
  return (
    <Card className="p-10 text-center">
      <Lock className="mx-auto h-10 w-10 text-muted-foreground/60" />
      <h3 className="mt-4 text-h3 text-foreground">The rest of this brief is on Lite and Pro</h3>
      <p className="mx-auto mt-2 max-w-md text-body text-muted-foreground">
        The month of updates, every number with where it came from, both sides argued at full strength, and the
        lines to open with. The sixty-second read stays free on every topic.
      </p>
      <Link
        href="/upgrade"
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-body font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Upgrade <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

/* ───────────────────────── 01 the read ───────────────────────── */

function ReadPanel({ topic }: { topic: GdTopic }) {
  const d = topic.dossier!;
  return (
    <div className="space-y-5">
      <Card className="p-6 animate-slide-up">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
          <div className="shrink-0">
            {d.hook.map((h) => (
              <div key={h.label} className="mb-3">
                <div className="text-3xl font-bold tracking-tightest text-navy tabular-nums dark:text-foreground">
                  {h.value}
                </div>
                <div className="text-small text-muted-foreground">{h.label}</div>
              </div>
            ))}
            <p className=" text-small text-muted-foreground">{d.hookCaption}</p>
          </div>
          <div>
            <SectionLabel icon={<MessageSquare className="h-4 w-4" />}>If you have sixty seconds</SectionLabel>
            <p className="mt-3 text-strong leading-relaxed text-foreground/90">{d.read}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 animate-slide-up">
        <SectionLabel icon={<Lightbulb className="h-4 w-4" />}>The tension in one line</SectionLabel>
        <p className="mt-3 text-strong leading-relaxed text-foreground/90">{d.tension}</p>
      </Card>

      <Card className="p-6 animate-slide-up">
        <SectionLabel icon={<Quote className="h-4 w-4" />}>Three ways a panel will frame it</SectionLabel>
        <ul className="mt-4 space-y-2.5">
          {d.framings.map((f, i) => (
            <li key={i} className="flex gap-3 text-body text-foreground/90">
              <span className="shrink-0 font-semibold text-primary tabular-nums">{i + 1}.</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ───────────────────────── 02 what's moved ───────────────────────── */

function MovedPanel({ topic }: { topic: GdTopic }) {
  const d = topic.dossier!;
  return (
    <div className="space-y-5">

      {/* since you last looked */}
      <Card className="border-primary/40 bg-accent p-6 animate-slide-up">
        <SectionLabel icon={<Sparkles className="h-4 w-4" />}>Since you last opened this</SectionLabel>
        <ul className="mt-4 space-y-3.5">
          {d.changed.map((c, i) => (
            <li key={i} className="flex flex-col gap-1.5 sm:flex-row sm:gap-3">
              <span className="inline-flex h-fit w-fit shrink-0 items-center rounded-full bg-card px-2.5 py-0.5 text-xs font-semibold text-primary">
                {c.tag}
              </span>
              <span className="text-body leading-relaxed text-foreground/90">{c.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* the trail */}
      <Card className="p-6">
        <SectionLabel icon={<CalendarClock className="h-4 w-4" />}>Everything that moved this argument</SectionLabel>
        <p className="mt-2 text-small text-muted-foreground">
          A month of reporting, newest first, with a few older entries pinned because the argument makes no sense
          without them. Each one says what it <em>did</em> to the debate — and what you can now quote.
        </p>
        <div className="mt-5">
          {d.trail.map((e, i) => (
            <TrailRow key={i} entry={e} first={i === 0} />
          ))}
        </div>
      </Card>

      {/* open questions */}
      <Card className="p-6">
        <SectionLabel icon={<CircleHelp className="h-4 w-4" />}>Still unanswered</SectionLabel>
        <p className="mt-2 text-small text-muted-foreground">
          Naming a question nobody has answered is worth more in a discussion than guessing at it. When one does get
          answered, we tell you at the top of this page and rewrite the line that depended on it.
        </p>
        <ul className="mt-4 space-y-3">
          {d.openQuestions.map((q, i) => (
            <li key={i} className="flex gap-3">
              {q.answered ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : (
                <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              )}
              <div>
                <p className={q.answered ? 'text-body text-muted-foreground line-through decoration-success/60' : 'text-body text-foreground/90'}>
                  {q.q}
                </p>
                {q.answered ? (
                  <p className="mt-2 rounded-md bg-success-soft p-3 text-small text-foreground/90">{q.answered}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* who hasn't spoken */}
      <Card className="p-6">
        <SectionLabel icon={<EarOff className="h-4 w-4" />}>Who hasn&apos;t spoken — and why that helps you</SectionLabel>
        <p className="mt-2 text-small text-muted-foreground">
          A gap you can name is worth more than a fact eight other people also read.
        </p>
        <ul className="mt-4 space-y-3">
          {d.silent.map((s, i) => (
            <li key={i} className="flex gap-3 text-body text-foreground/90">
              <span className="mt-0.5 shrink-0 font-semibold text-primary">—</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* bridges */}
      <Card className="p-6">
        <SectionLabel icon={<Link2 className="h-4 w-4" />}>This connects to other topics you are preparing</SectionLabel>
        <p className="mt-2 text-small text-muted-foreground">
          Connecting two topics sounds two years more senior than knowing both separately. These are the live
          bridges this week — each comes with the sentence that makes the link.
        </p>
        <div className="mt-4 space-y-3">
          {d.bridges.map((b) => (
            <Link
              key={b.slug}
              href={`/gd-briefs/radar/${b.slug}`}
              className="block rounded-lg border border-border p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-2 text-body font-semibold text-foreground">
                {b.title}
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="mt-1.5 text-small text-muted-foreground">{b.line}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TrailRow({ entry, first }: { entry: TrailEntry; first: boolean }) {
  return (
    <article
      className={[
        'grid gap-3 py-4 sm:grid-cols-[6.5rem_1fr] sm:gap-4',
        first ? '' : 'border-t border-border',
        entry.anchor ? 'bg-warning-soft/40 -mx-3 rounded-md px-3' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-1.5 pt-0.5">
        <span className={['text-small tabular-nums', entry.ahead ? 'text-warning font-medium' : 'text-muted-foreground'].join(' ')}>
          {entry.when}
        </span>
        {entry.anchor ? <Pin className="mt-0.5 h-3 w-3 shrink-0 text-warning" aria-label="pinned" /> : null}
      </div>
      <div className="min-w-0">
        <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {entry.label}
        </span>
        <p className="mt-2 text-body font-medium leading-relaxed text-foreground/90">{entry.note}</p>
        {entry.adds ? (
          <p className="mt-2.5 rounded-md bg-muted p-3 text-small text-foreground/90">
            <span className="font-semibold text-foreground">You can now quote: </span>
            {entry.adds}
          </p>
        ) : null}
        <p className="mt-2 text-small text-muted-foreground">{entry.source}</p>
      </div>
    </article>
  );
}

/* ───────────────────────── 03 the numbers ───────────────────────── */

function FactsPanel({ topic }: { topic: GdTopic }) {
  const d = topic.dossier!;
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <SectionLabel icon={<BarChart3 className="h-4 w-4" />}>Every number, with where it came from</SectionLabel>
        <p className="mt-2 text-small text-muted-foreground">
          Nothing here was written by a machine — each figure comes from the reporting, and each one tells you how
          safely you can say it out loud. Tap the star to keep a point on your cheat sheet, attribution and all.
        </p>

        <div className="mt-5 -mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[42rem] border-collapse">
            <thead>
              <tr>
                {['Figure', 'What it is', 'How safely can you say it', 'Reported by', ''].map((h) => (
                  <th key={h} className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.facts.map((f, i) => {
                const t = TRUST_COPY[f.trust];
                const tone =
                  f.trust === 'safe' ? 'bg-success-soft text-success'
                  : f.trust === 'single' ? 'bg-warning-soft text-warning'
                  : 'bg-accent text-accent-foreground';
                return (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="whitespace-nowrap px-3 py-3 align-top font-mono-data text-body font-medium text-navy dark:text-foreground">
                      {f.figure}
                    </td>
                    <td className="px-3 py-3 align-top text-body text-foreground/90">{f.what}</td>
                    <td className="px-3 py-3 align-top">
                      <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
                        {t.label}
                      </span>
                      <p className="mt-1 text-micro text-muted-foreground">{t.hint}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 align-top text-small text-muted-foreground">{f.source}</td>
                    <td className="px-3 py-3 align-top">
                      <AddToCheatSheetButton content={f.quote} sourceTopic={topic.proposition} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel icon={<AlertTriangle className="h-4 w-4" />}>What is missing — and we will not invent it</SectionLabel>
        <ul className="mt-4 space-y-3">
          {d.missing.map((m, i) => (
            <li key={i} className="flex gap-3 text-body text-foreground/90">
              <span className="mt-0.5 shrink-0 font-semibold text-primary">×</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ───────────────────────── 04 who pays ───────────────────────── */

function WhoPanel({ topic }: { topic: GdTopic }) {
  const d = topic.dossier!;
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <SectionLabel icon={<Users className="h-4 w-4" />}>Who pays, who gains, who decides</SectionLabel>
        <p className="mt-2 text-small text-muted-foreground">
          Most people argue whether it is fair. Better candidates say who it lands on, and where the cost goes next.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {d.stakeholders.map((s) => (
            <div key={s.who} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                <h3 className="text-body font-semibold text-foreground">{s.who}</h3>
                <span className="flex shrink-0 items-center gap-1.5">
                  {s.side ? (
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {s.side === 'gain' ? 'Gains' : s.side === 'cost' ? 'Pays' : 'Decides'}
                    </span>
                  ) : null}
                  {s.badge ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {s.badge}
                    </span>
                  ) : null}
                </span>
              </div>
              <p className="mt-2 text-body text-foreground/90">{s.want}</p>
              <p className="mt-2.5 border-t border-border pt-2.5 text-small text-muted-foreground">{s.lever}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel icon={<ArrowRight className="h-4 w-4" />}>What happens next, and after that</SectionLabel>
        <p className="mt-2 text-small text-muted-foreground">
          The first consequence is where everybody stops. Two steps further is where the marks are.
        </p>
        <ul className="mt-5 space-y-3">
          {d.chain.map((c, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {c.step}
              </span>
              <span className="text-body text-foreground/90">{c.text}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ───────────────────────── 05 both sides ───────────────────────── */

function SidesPanel({ topic }: { topic: GdTopic }) {
  const d = topic.dossier!;
  return (
    <Card className="p-6">
      <SectionLabel icon={<Users className="h-4 w-4" />}>Both sides, argued at full strength</SectionLabel>
      <p className="mt-2 text-small text-muted-foreground">
        Every position here belongs to someone who is actually arguing it, put at its strongest, with its weak point
        named underneath. You are not looking for the right answer — you are looking for the argument you will have
        to survive.
      </p>
      <div className="mt-5 space-y-3">
        {d.positions.map((p, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border">
            <div className="flex flex-wrap items-baseline justify-between gap-2 bg-muted px-4 py-3">
              <h3 className="text-body font-semibold text-foreground">{p.who}</h3>
              <span className="text-small text-muted-foreground">{p.attrib}</span>
            </div>
            <div className="space-y-3 px-4 py-4">
              <p className="text-body leading-relaxed text-foreground/90">{p.argument}</p>
              <p className="rounded-md bg-accent p-3 text-small text-foreground/90">
                <span className="font-semibold text-accent-foreground">Weakest link: </span>
                {p.weak}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ───────────────────────── 06 how to think ───────────────────────── */

function ThinkPanel({ topic }: { topic: GdTopic }) {
  const d = topic.dossier!;
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <SectionLabel icon={<Lightbulb className="h-4 w-4" />}>Three ways to think about it that most people won&apos;t</SectionLabel>
        <p className="mt-2 text-small text-muted-foreground">
          Naming a framework earns nothing. Using one to say something a newspaper reader could not is the whole
          trick — so each of these comes with the sentence you can actually say.
        </p>
        <div className="mt-5 divide-y divide-border">
          {d.frameworks.map((f, i) => (
            <div key={i} className={i === 0 ? 'pb-5' : 'py-5 last:pb-0'}>
              <h3 className="text-h3 text-foreground">{f.name}</h3>
              <p className="mt-1.5 text-small italic text-muted-foreground">{f.idea}</p>
              <p className="mt-3 text-body leading-relaxed text-foreground/90">{f.applied}</p>
              <div className="mt-3 rounded-md bg-muted p-4">
                <div className="text-label text-muted-foreground">Say it like this</div>
                <p className="mt-1.5 text-strong leading-relaxed text-foreground/90">{f.say}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel icon={<ListChecks className="h-4 w-4" />}>Comparisons worth reaching for</SectionLabel>
        <ul className="mt-4 space-y-3">
          {d.precedents.map((p, i) => (
            <li key={i} className="flex gap-3 text-body text-foreground/90">
              <span className="mt-0.5 shrink-0 font-semibold text-primary">→</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-small text-muted-foreground">
          One well-chosen comparison beats three extra arguments.
        </p>
      </Card>
    </div>
  );
}

/* ───────────────────────── 07 what to say ───────────────────────── */

function SayPanel({ topic }: { topic: GdTopic }) {
  const d = topic.dossier!;
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <SectionLabel icon={<Quote className="h-4 w-4" />}>Openings, for the situation you actually land in</SectionLabel>
        <p className="mt-2 text-small text-muted-foreground">
          One opening line is useless, because you rarely speak first.
        </p>
        <div className="mt-5 space-y-3">
          {d.lines.map((l, i) => (
            <div
              key={i}
              className={[
                'rounded-lg border p-4',
                l.trap ? 'border-warning/35 bg-warning-soft' : 'border-border',
              ].join(' ')}
            >
              <div className={['text-label', l.trap ? 'text-warning' : 'text-primary'].join(' ')}>{l.when}</div>
              <p className="mt-2.5 text-strong leading-relaxed text-foreground/90">{l.say}</p>
              <p className="mt-2.5 text-small text-muted-foreground">{l.why}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel icon={<ListChecks className="h-4 w-4" />}>Your thirty-second structure</SectionLabel>
        <ul className="mt-4 space-y-3">
          {d.structure.map((s, i) => (
            <li key={i} className="flex gap-3 text-body text-foreground/90">
              <span className="shrink-0 font-semibold text-success tabular-nums">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <SectionLabel icon={<MessageSquare className="h-4 w-4" />}>If it becomes a personal-interview question</SectionLabel>
        <ul className="mt-4 space-y-3">
          {d.pi.map((p, i) => (
            <li key={i} className="flex gap-3 text-body text-foreground/90">
              <span className="mt-0.5 shrink-0 font-semibold text-primary">→</span>
              <span><b className="font-semibold">{p.profile}:</b> {p.ask}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ───────────────────────── 08 test yourself ───────────────────────── */

function TestPanel({ topic }: { topic: GdTopic }) {
  const d = topic.dossier!;
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <SectionLabel icon={<ListChecks className="h-4 w-4" />}>Check you actually have it</SectionLabel>
        <p className="mt-2 text-small text-muted-foreground">
          The wrong answers are the mistakes people genuinely make in the room.
        </p>
        <div className="mt-5 space-y-3">
          {d.quiz.map((q, i) => (
            <QuizCard key={i} index={i} q={q} />
          ))}
        </div>
      </Card>

      <RehearseCard topic={topic} />

      <Card className="p-6">
        <SectionLabel icon={<CircleHelp className="h-4 w-4" />}>Jargon, defined once</SectionLabel>
        <div className="mt-3 divide-y divide-border">
          {d.glossary.map((g) => (
            <details key={g.term} className="py-3">
              <summary className="cursor-pointer list-none text-body font-semibold text-foreground marker:content-['']">
                <span className="mr-1 text-primary">+</span>
                {g.term}
              </summary>
              <p className="mt-2 text-body text-muted-foreground">{g.def}</p>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}

/**
 * The spoken drill. A sixty-second countdown, the points a strong answer uses as
 * a checklist you tick while you speak, and a model answer revealed only after
 * the attempt — showing it earlier just gives you something to read aloud.
 */
function RehearseCard({ topic }: { topic: GdTopic }) {
  const d = topic.dossier!;
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [hit, setHit] = useState<Set<number>>(new Set());
  const [showModel, setShowModel] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          setRunning(false);
          setDone(true);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [running]);

  const reset = () => { setLeft(60); setRunning(false); setDone(false); setHit(new Set()); setShowModel(false); };
  const toggle = (i: number) =>
    setHit((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <Card className="border-0 bg-navy p-6 text-navy-foreground">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-h3">
            <Mic className="h-5 w-5" /> Now say it out loud
          </h3>
          <p className="mt-2 text-body text-navy-foreground/85">
            Reading a brief is not practice. Sixty seconds, spoken, with the points a strong answer uses in front of
            you — tick them as you land them.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={['font-mono-data text-3xl font-bold tabular-nums', left <= 10 && left > 0 ? 'text-warning' : ''].join(' ')}>
            {mm}:{ss}
          </span>
          <div className="flex gap-2">
            {!running && !done ? (
              <button
                onClick={() => setRunning(true)}
                className="rounded-full bg-white px-4 py-1.5 text-small font-semibold text-navy transition-opacity hover:opacity-90"
              >
                Start
              </button>
            ) : null}
            {running ? (
              <button
                onClick={() => { setRunning(false); setDone(true); }}
                className="rounded-full border border-navy-soft/60 px-4 py-1.5 text-small font-semibold transition-colors hover:bg-navy-mid"
              >
                Stop
              </button>
            ) : null}
            {(done || left < 60) && !running ? (
              <button
                onClick={reset}
                className="rounded-full border border-navy-soft/60 px-4 py-1.5 text-small font-medium transition-colors hover:bg-navy-mid"
              >
                Again
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-md border border-navy-soft/50 bg-navy-mid p-4 text-strong leading-relaxed">
        &ldquo;{d.rehearse}&rdquo;
      </p>

      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-label text-navy-foreground/70">What a strong sixty seconds uses</span>
          <span className="font-mono-data text-small tabular-nums text-navy-foreground/70">
            {hit.size} of {d.rehearseChecklist.length}
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {d.rehearseChecklist.map((c, i) => {
            const on = hit.has(i);
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                aria-pressed={on}
                className={[
                  'flex items-start gap-2.5 rounded-md border px-3 py-2 text-left text-small transition-colors',
                  on
                    ? 'border-white/40 bg-navy-mid text-navy-foreground'
                    : 'border-navy-soft/40 text-navy-foreground/75 hover:bg-navy-mid',
                ].join(' ')}
              >
                <span
                  className={[
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold',
                    on ? 'border-white bg-white text-navy' : 'border-navy-soft/70',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {on ? '✓' : ''}
                </span>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {done ? (
        <div className="mt-5 border-t border-navy-soft/40 pt-4">
          {!showModel ? (
            <button
              onClick={() => setShowModel(true)}
              className="rounded-full bg-white px-4 py-2 text-small font-semibold text-navy transition-opacity hover:opacity-90"
            >
              Show me a strong answer
            </button>
          ) : (
            <>
              <div className="text-label text-navy-foreground/70">One strong sixty seconds</div>
              <p className="mt-2 text-body leading-relaxed text-navy-foreground/90">{d.rehearseModel}</p>
              <p className="mt-3 text-small text-navy-foreground/60">
                Not the only good answer — the opposite position, argued as tightly, scores the same. What it shows is
                the shape: a fact early, who pays, the reframe, one conceded objection, and the cost of your own view.
              </p>
            </>
          )}
        </div>
      ) : null}
    </Card>
  );
}

function QuizCard({ q, index }: { q: GdQuiz; index: number }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex gap-3">
        <span className="shrink-0 text-small text-muted-foreground tabular-nums">Q{index + 1}</span>
        <p className="text-body font-semibold text-foreground">{q.q}</p>
      </div>
      <div className="mt-3 grid gap-2">
        {q.options.map((o, i) => {
          const state =
            !answered ? 'idle'
            : i === q.right ? 'right'
            : i === picked ? 'wrong'
            : 'idle';
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setPicked(i)}
              className={[
                'grid grid-cols-[auto_1fr] items-baseline gap-2.5 rounded-md border px-3 py-2.5 text-left text-body transition-colors',
                state === 'right' ? 'border-success bg-success-soft'
                : state === 'wrong' ? 'border-primary bg-accent'
                : 'border-border bg-card hover:border-border-strong',
              ].join(' ')}
            >
              <span className="text-small text-muted-foreground">{String.fromCharCode(65 + i)}</span>
              <span className="text-foreground/90">{o}</span>
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className="mt-3 rounded-md bg-muted p-3 text-small text-muted-foreground">{q.why}</p>
      ) : null}
    </div>
  );
}
