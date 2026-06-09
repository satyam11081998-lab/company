'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy, Medal, Crown, Flame, Copy, Check, ArrowUp, ArrowDown,
  Sparkles, Users, Globe2, GraduationCap, Zap, Linkedin,
} from 'lucide-react';
import { fetchDailyLeaderboard, type DailyLeaderboardResponse } from '@/lib/api';
import type { LeaderboardView, LbRow } from '@/lib/dashboard/leaderboards';

type Tab = 'all' | 'daily' | 'cohort';

interface Props {
  userId: string;
  allTime: LeaderboardView;
  cohort: LeaderboardView | null;
  cohortName: string | null;
  initialTab?: Tab;
}

const SITE = 'https://www.mece.in';

function seedAvatar(id: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(id)}`;
}
function initial(name: string) {
  return (name || 'A').trim().charAt(0).toUpperCase();
}
function etaLabel(days: number | null) {
  if (days == null) return null;
  if (days <= 1) return 'within a day';
  if (days < 14) return `in ~${days} days`;
  if (days < 60) return `in ~${Math.round(days / 7)} weeks`;
  return 'eventually';
}

export default function LeaderboardClient({ userId, allTime, cohort, cohortName, initialTab = 'all' }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [daily, setDaily] = useState<DailyLeaderboardResponse | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (tab === 'daily' && !daily && !dailyLoading) {
      setDailyLoading(true);
      fetchDailyLeaderboard().then(setDaily).catch(() => {}).finally(() => setDailyLoading(false));
    }
  }, [tab, daily, dailyLoading]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All India', icon: <Globe2 className="h-4 w-4" /> },
    { id: 'daily', label: "Today's Daily", icon: <Zap className="h-4 w-4" /> },
    { id: 'cohort', label: cohortName || 'My Cohort', icon: <GraduationCap className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-fade-in">
        <div>
          <span className="badge-pill mb-3"><Trophy className="h-3.5 w-3.5" /> Leaderboards</span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Where do you stand?</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            All-India, today&apos;s daily case, and your own college cohort — live, and updated as people solve.
          </p>
        </div>
      </div>

      {/* Segmented tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-small font-semibold transition-all ${
              tab === t.id ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'all' && <BoardView view={allTime} userId={userId} unit="pts" />}
      {tab === 'cohort' && (
        cohort ? <BoardView view={cohort} userId={userId} unit="pts" /> : <CohortLocked />
      )}
      {tab === 'daily' && (
        <DailyView
          data={daily}
          loading={dailyLoading}
          userId={userId}
          copied={copied}
          onCopy={(text) => {
            navigator.clipboard?.writeText(text).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────── Standing (FOMO) card ─────────────────────────── */

function StandingCard({ view, unit }: { view: LeaderboardView; unit: string }) {
  const you = view.you;
  if (!you) return null;
  const ahead = you.ahead;
  const behind = you.behind;
  return (
    <div className="ui-card-floating overflow-hidden">
      <div className="bg-gradient-to-r from-primary/[0.06] to-transparent p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">Your standing · {view.scopeLabel}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-4xl font-bold tabular-nums text-foreground">#{you.rank}</span>
              <span className="text-small text-muted-foreground">of {you.total.toLocaleString()}</span>
              {you.percentile != null && (
                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-micro font-bold uppercase tracking-widest text-primary">
                  Top {you.percentile}%
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-bold tabular-nums text-foreground">{you.points.toLocaleString()}</p>
            <p className="text-micro uppercase tracking-widest text-muted-foreground">{unit}</p>
            {you.weeklyGain > 0 && (
              <p className="mt-0.5 text-micro font-semibold text-success">+{you.weeklyGain} this week</p>
            )}
          </div>
        </div>

        {/* Real rivalry lines */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {ahead ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-small">
              <ArrowUp className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-foreground/90">
                <b className="font-mono tabular-nums">{ahead.gap}</b> {unit} to overtake <b>{ahead.name}</b>
                {ahead.weeklyGain > 0 && <span className="text-muted-foreground"> (they&apos;re +{ahead.weeklyGain}/wk)</span>}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-small text-amber-800">
              <Crown className="h-4 w-4 shrink-0" /> You&apos;re #1 in {view.scopeLabel}. Defend it.
            </div>
          )}
          {behind ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-small">
              <ArrowDown className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="text-foreground/90">
                <b>{behind.name}</b> is <b className="font-mono tabular-nums">{behind.gap}</b> {unit} behind
                {behind.etaDays != null
                  ? <span className="text-amber-600 font-medium"> — passes you {etaLabel(behind.etaDays)} if you skip</span>
                  : <span className="text-muted-foreground"> (quiet this week)</span>}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-small text-muted-foreground">
              <Sparkles className="h-4 w-4 shrink-0" /> Climb higher — solve today&apos;s case to gain points.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Board (all-time / cohort) ─────────────────────────── */

function BoardView({ view, userId, unit }: { view: LeaderboardView; userId: string; unit: string }) {
  const top3 = view.rows.slice(0, 3);
  const rest = view.rows.slice(3);
  const youInList = view.rows.some((r) => r.isYou);

  return (
    <div className="space-y-6 animate-slide-up">
      <StandingCard view={view} unit={unit} />
      {top3.length > 0 && <Podium top3={top3} unit={unit} />}

      {rest.length > 0 && (
        <div className="ui-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Ranks 4 – {view.rows.length}
            </span>
            <span className="text-xs text-muted-foreground">{view.scopeLabel}</span>
          </div>
          <div className="divide-y divide-border">
            {rest.map((u) => <Row key={u.id} u={u} unit={unit} />)}
          </div>
        </div>
      )}

      {!youInList && view.you && (
        <p className="text-center text-small text-muted-foreground">
          You&apos;re <b className="text-foreground">#{view.you.rank}</b> — keep solving to break into the top {view.rows.length}.
        </p>
      )}
    </div>
  );
}

function Row({ u, unit }: { u: LbRow; unit: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-5 py-3.5 transition-colors ${
      u.isYou ? 'bg-primary/5 ring-1 ring-inset ring-primary/15' : 'hover:bg-muted/30'
    }`}>
      <div className="flex items-center gap-4 min-w-0">
        <span className="w-8 text-center font-mono text-sm font-semibold text-muted-foreground/60">#{u.rank}</span>
        <Avatar className="h-9 w-9 border border-border">
          <AvatarImage src={u.avatar_url || seedAvatar(u.id)} alt={u.name} />
          <AvatarFallback className="bg-navy text-navy-foreground text-sm font-semibold">{initial(u.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${u.isYou ? 'text-primary' : 'text-foreground'}`}>
            {u.name}{u.isYou && <span className="ml-1.5 text-xs font-medium text-primary/70">(you)</span>}
          </p>
          <p className="text-xs text-muted-foreground">{u.submissions} {u.submissions === 1 ? 'solve' : 'solves'}</p>
        </div>
      </div>
      <div className="flex items-baseline gap-1 shrink-0">
        <span className="font-mono text-base font-bold tabular-nums text-foreground">{u.points.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function Podium({ top3, unit }: { top3: LbRow[]; unit: string }) {
  const order = [top3[1], top3[0], top3[2]].filter(Boolean) as LbRow[]; // 2nd, 1st, 3rd
  const ringFor = (rank: number) =>
    rank === 1 ? 'border-primary' : rank === 2 ? 'border-slate-300' : 'border-amber-400';
  const sizeFor = (rank: number) =>
    rank === 1 ? 'h-24 w-24 md:h-28 md:w-28' : 'h-16 w-16 md:h-20 md:w-20';
  const iconFor = (rank: number) =>
    rank === 1 ? <Crown className="h-4 w-4 text-white" /> : rank === 2 ? <Medal className="h-4 w-4 text-slate-500" /> : <Trophy className="h-4 w-4 text-amber-500" />;
  const badgeBg = (rank: number) => (rank === 1 ? 'bg-primary' : 'bg-card border border-border');

  return (
    <div className="ui-card-floating p-6">
      <div className="flex items-end justify-center gap-4 sm:gap-10">
        {order.map((u) => (
          <div key={u.id} className={`flex flex-col items-center ${u.rank === 1 ? '-mt-4' : ''}`}>
            <div className="relative">
              <div className={`absolute -top-3 -right-2 z-10 grid h-7 w-7 place-items-center rounded-full ${badgeBg(u.rank)} shadow-sm`}>
                {iconFor(u.rank)}
              </div>
              {u.rank === 1 && (
                <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 0 6px rgba(200,16,46,0.12), 0 0 0 12px rgba(200,16,46,0.05)' }} />
              )}
              <Avatar className={`${sizeFor(u.rank)} border-4 ${ringFor(u.rank)} bg-muted`}>
                <AvatarImage src={u.avatar_url || seedAvatar(u.id)} alt={u.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-hover text-white text-2xl font-bold">{initial(u.name)}</AvatarFallback>
              </Avatar>
            </div>
            <p className={`mt-2 max-w-[10ch] truncate text-center font-semibold ${u.rank === 1 ? 'text-base text-foreground' : 'text-sm text-foreground'} ${u.isYou ? 'text-primary' : ''}`}>
              {u.name}{u.isYou && ' (you)'}
            </p>
            <p className="font-mono text-sm font-bold tabular-nums text-primary">{u.points.toLocaleString()} {unit}</p>
            <div className={`mt-1.5 w-16 rounded-t-md ${u.rank === 1 ? 'h-12 bg-primary/15' : u.rank === 2 ? 'h-8 bg-muted' : 'h-5 bg-muted'} border border-border`} />
            <div className="w-16 rounded-b-sm border border-t-0 border-border bg-muted/60 py-0.5 text-center text-[11px] font-bold text-muted-foreground">
              {u.rank === 1 ? '1st' : u.rank === 2 ? '2nd' : '3rd'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Daily view (shareable) ─────────────────────────── */

function DailyView({
  data, loading, userId, copied, onCopy,
}: {
  data: DailyLeaderboardResponse | null;
  loading: boolean;
  userId: string;
  copied: boolean;
  onCopy: (text: string) => void;
}) {
  if (loading || !data) {
    return <div className="ui-card p-10 text-center text-muted-foreground">Loading today&apos;s leaderboard…</div>;
  }
  if (!data.case_id) {
    return (
      <div className="ui-card p-10 text-center">
        <Zap className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 font-semibold text-foreground">No daily case scheduled yet today.</p>
        <p className="mt-1 text-small text-muted-foreground">Check back once today&apos;s case goes live.</p>
      </div>
    );
  }

  const me = data.entries.find((e) => e.user_id === userId) || null;
  const top3 = data.entries.slice(0, 3);
  const rest = data.entries.slice(3);

  const caption = me
    ? `I ranked #${me.rank} of ${data.total_attempts} on today's MECE daily case "${data.case_title}" with ${me.score}/100. Think you can beat me? ${SITE}`
    : `Today's MECE daily case: "${data.case_title}". ${data.total_attempts} aspirants have taken it so far. ${SITE}`;
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE)}`;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Your daily result + share */}
      <div className="ui-card-floating overflow-hidden">
        <div className="bg-gradient-to-r from-primary/[0.07] to-transparent p-5 sm:p-6">
          <p className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">Today&apos;s daily · {data.case_title}</p>
          {me ? (
            <>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-4xl font-bold tabular-nums text-foreground">#{me.rank}</span>
                <span className="text-small text-muted-foreground">of {data.total_attempts} today</span>
                <span className="ml-1 rounded-full bg-success/10 px-2 py-0.5 text-micro font-bold uppercase tracking-widest text-success">{me.score}/100</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href={liUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-[#0A66C2] px-4 py-2 text-small font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Linkedin className="h-4 w-4" /> Share on LinkedIn
                </a>
                <button
                  onClick={() => onCopy(caption)}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-small font-semibold text-foreground hover:bg-muted"
                >
                  {copied ? <><Check className="h-4 w-4 text-success" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy result</>}
                </button>
                <span className="text-micro text-muted-foreground">Paste the copied line into your LinkedIn post.</span>
              </div>
            </>
          ) : (
            <div className="mt-2">
              <p className="text-body text-foreground">You haven&apos;t attempted today&apos;s case yet.</p>
              <Link href="/dashboard" className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-small font-semibold text-white hover:bg-primary-hover">
                <Flame className="h-4 w-4" /> Take today&apos;s case
              </Link>
            </div>
          )}
        </div>
      </div>

      {top3.length > 0 ? (
        <>
          <Podium top3={top3.map((e, i) => ({ id: e.user_id, name: e.name || 'Aspirant', avatar_url: e.avatar_url, points: e.score, rank: e.rank, submissions: 0, isYou: e.user_id === userId }))} unit="/100" />
          {rest.length > 0 && (
            <div className="ui-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Ranks 4 – {data.entries.length}</span>
                <span className="text-xs text-muted-foreground">{data.total_attempts} attempts today</span>
              </div>
              <div className="divide-y divide-border">
                {rest.map((e) => (
                  <Row key={e.user_id} unit="/100" u={{ id: e.user_id, name: e.name || 'Aspirant', avatar_url: e.avatar_url, points: e.score, rank: e.rank, submissions: 0, isYou: e.user_id === userId }} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="ui-card p-10 text-center">
          <Flame className="mx-auto h-10 w-10 text-primary/40" />
          <p className="mt-3 font-semibold text-foreground">No one has solved today&apos;s case yet.</p>
          <p className="mt-1 text-small text-muted-foreground">Be the first on the board.</p>
        </div>
      )}
    </div>
  );
}

function CohortLocked() {
  return (
    <div className="ui-card p-10 text-center animate-slide-up">
      <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/40" />
      <p className="mt-3 font-semibold text-foreground">See how you rank within your college</p>
      <p className="mt-1 text-small text-muted-foreground max-w-sm mx-auto">
        Add your college in your profile to unlock the cohort leaderboard and see who&apos;s ahead of you on campus.
      </p>
      <Link href="/profile" className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-white hover:bg-primary-hover">
        <Users className="h-4 w-4" /> Set your college
      </Link>
    </div>
  );
}
