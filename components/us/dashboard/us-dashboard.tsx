import Link from 'next/link';
import { longDate, greetingFor, shortDate } from '@/components/us/dashboard/format';
import {
  ContinueSessions,
  NextBestAction,
  PlanStatus,
  ProgressSection,
  RecentActivity,
  Streak,
  TodayPractice,
  TodaySizing,
} from '@/components/us/dashboard/modules';
import SkillMap from '@/components/us/dashboard/skill-map';
import { usButton } from '@/components/us/ui';
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
 * The US dashboard. Four levels, in this order and at these volumes:
 *   1. What should I do now?       Today's case (loud), today's sizing, streak
 *   2. What should I improve?      one recommendation from real results
 *   3. How am I progressing?       metrics, weekly practice, by-type scores, skill map
 *   4. What have I done?           recent activity
 */
export default function UsDashboard(p: UsDashboardProps) {
  const focusType = p.model.nextAction?.focusType ?? null;
  const lastPracticed = Object.fromEntries(
    [...p.model.byType, p.model.sizing].map((s) => [s.type, shortDate(s.lastAt, p.tz)]),
  );

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      {p.isGuest && (
        <div className="mb-6 flex flex-col gap-3 rounded-[12px] border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] text-foreground">
            <span className="font-semibold">You&apos;re practicing without an account.</span>{' '}
            <span className="text-muted-foreground">Create one to keep your score, history and streak.</span>
          </p>
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
            {p.firstName ? <>, {p.firstName}</> : null}.
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground">Let&apos;s make progress toward your goals today.</p>
        </div>
        <p className="text-[13px] text-muted-foreground">{longDate(p.tz)}</p>
      </header>

      {/* LEVEL 1 — what now */}
      <div className="mt-7 grid gap-5 lg:grid-cols-12">
        <TodayPractice item={p.todayCase} className="lg:col-span-8" />
        <div className="grid content-start gap-5 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
          <TodaySizing item={p.todaySizing} />
          <Streak count={p.streak} timestamps={p.model.recentTimestamps} tz={p.tz} />
        </div>
      </div>

      {p.model.inProgress.length > 0 && <ContinueSessions items={p.model.inProgress} tz={p.tz} className="mt-5" />}

      {/* LEVEL 2 — what to improve */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <NextBestAction model={p.model} className="lg:col-span-8" />
        <PlanStatus tier={p.tier} expiresAt={p.expiresAt} isGuest={p.isGuest} tz={p.tz} className="lg:col-span-4" />
      </div>

      {/* LEVEL 3 — how am I doing */}
      <ProgressSection model={p.model} focusType={focusType} className="mt-10" />

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <SkillMap stats={[...p.model.byType, p.model.sizing]} focusType={focusType} lastPracticed={lastPracticed} className="lg:col-span-7" />
        {/* LEVEL 4 — what have I done */}
        <RecentActivity items={p.model.activity} tz={p.tz} className="lg:col-span-5" />
      </div>
    </div>
  );
}
