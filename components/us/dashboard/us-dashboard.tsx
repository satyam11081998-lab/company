import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { longDate, greetingFor, shortDate } from '@/components/us/dashboard/format';
import {
  ContinueSessions,
  NextBestAction,
  PlanStatus,
  ProgressChart,
  RecentActivity,
  StatCards,
  Streak,
  TodayPractice,
  TodaySizing,
  TypePerformance,
} from '@/components/us/dashboard/modules';
import SkillMap from '@/components/us/dashboard/skill-map';
import { IconChip, US_CARD, usButton } from '@/components/us/ui';
import type { UsDashboardModel, UsTodayItem } from '@/lib/us-market/dashboard';

export interface UsDashboardProps {
  firstName: string | null;
  tz: string;
  model: UsDashboardModel;
  todayCase: UsTodayItem | null;
  todaySizing: UsTodayItem | null;
  tier: 'free' | 'lite' | 'pro';
  expiresAt: string | null;
  isGuest: boolean;
  streak: number;
}

/**
 * The US dashboard (v2). Reads top to bottom as four questions:
 *   1. What should I do now?       Today's case (loud), plan, streak
 *   2. Where do I stand?           four headline numbers
 *   3. What should I improve?      one recommendation + today's market sizing
 *   4. How am I progressing?       weekly trend, by-type scores, skill map, activity
 */
export default function UsDashboard(p: UsDashboardProps) {
  const focusType = p.model.nextAction?.focusType ?? null;
  const lastPracticed = Object.fromEntries(
    [...p.model.byType, p.model.sizing].map((s) => [s.type, shortDate(s.lastAt, p.tz)]),
  );

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-9">
      {p.isGuest && (
        <div className={`${US_CARD} mb-6 flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="flex items-center gap-3.5">
            <IconChip tone="sky" size="sm"><UserRound /></IconChip>
            <p className="text-[14px] text-foreground">
              <span className="font-semibold">You&apos;re practicing without an account.</span>{' '}
              <span className="text-muted-foreground">Create one to keep your score, history and streak.</span>
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/login?next=/dashboard" className={usButton('ghost', 'sm')}>Log in</Link>
            <Link href="/signup?next=/dashboard" className={usButton('primary', 'sm')}>Sign up free</Link>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[30px] leading-tight text-foreground sm:text-[36px]">
            {greetingFor(p.tz)}
            {p.firstName ? <>, {p.firstName}</> : null}
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground">Let&apos;s make progress toward your goals today.</p>
        </div>
        <p className="text-[13px] text-muted-foreground">{longDate(p.tz)}</p>
      </header>

      {/* 1 — what now */}
      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <TodayPractice item={p.todayCase} className="lg:col-span-8" />
        <div className="grid grid-cols-1 content-start gap-5 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
          <PlanStatus tier={p.tier} expiresAt={p.expiresAt} isGuest={p.isGuest} tz={p.tz} />
          <Streak count={p.streak} timestamps={p.model.recentTimestamps} tz={p.tz} />
        </div>
      </div>

      {/* 2 — where do I stand */}
      <StatCards model={p.model} className="mt-5" />

      {/* 3 — what to improve */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <NextBestAction model={p.model} className="lg:col-span-8" />
        <TodaySizing item={p.todaySizing} className="lg:col-span-4" />
      </div>

      {p.model.inProgress.length > 0 && <ContinueSessions items={p.model.inProgress} tz={p.tz} className="mt-5" />}

      {/* 4 — how am I progressing */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <ProgressChart model={p.model} className="lg:col-span-7" />
        <TypePerformance stats={[...p.model.byType, p.model.sizing]} focusType={focusType} className="lg:col-span-5" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <SkillMap stats={[...p.model.byType, p.model.sizing]} focusType={focusType} lastPracticed={lastPracticed} className="lg:col-span-7" />
        <RecentActivity items={p.model.activity} tz={p.tz} className="lg:col-span-5" />
      </div>
    </div>
  );
}
