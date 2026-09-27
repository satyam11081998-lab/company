import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { dayKey, greetingFor, longDate, shortDate } from '@/components/us/dashboard/format';
import {
  ContinueSessions,
  Greeting,
  NextBestAction,
  PlanStatus,
  ProgressChart,
  RecentActivity,
  SkylineBanner,
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
  /** YYYY-MM-DD override for the daily rotation (previews and tests); defaults to today in `tz`. */
  day?: string;
}

/**
 * The US dashboard (v3, 2026-09-27). One scrolling page that reads top to
 * bottom as four questions:
 *   1. What should I do now?       today's case (with its topic photo), plan, streak
 *   2. Where do I stand?           four headline numbers with this week's movement
 *   3. What should I improve?      one recommendation + today's market sizing
 *   4. How am I progressing?       open sessions, weekly trend, scores by type,
 *                                  skill map, recent activity
 *
 * What changes every day, in the viewer's own calendar: the skyline behind the
 * greeting, the line of the day, today's case and today's market sizing (and
 * so their photos). Nothing on the page is invented; every number is the
 * viewer's own.
 */
export default function UsDashboard(p: UsDashboardProps) {
  const focusType = p.model.nextAction?.focusType ?? null;
  const today = p.day ?? dayKey(new Date(), p.tz);
  const lastPracticed = Object.fromEntries(
    [...p.model.byType, p.model.sizing].map((s) => [s.type, shortDate(s.lastAt, p.tz)]),
  );
  const todayHref = p.todayCase && !p.todayCase.done ? `/cases/${p.todayCase.id}` : null;

  return (
    <div className="relative isolate">
      <SkylineBanner dayKey={today} />
      <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-7 sm:px-6 lg:px-8 lg:pt-10">
        {p.isGuest && (
          <div className={`${US_CARD} mb-7 flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}>
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

        <Greeting greeting={greetingFor(p.tz)} firstName={p.firstName} dateLabel={longDate(p.tz)} dayKey={today} />

        {/* 1 — what now */}
        <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-12">
          <TodayPractice item={p.todayCase} className="xl:col-span-8" />
          <div className="grid grid-cols-1 content-start gap-5 sm:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
            <PlanStatus tier={p.tier} expiresAt={p.expiresAt} isGuest={p.isGuest} tz={p.tz} />
            <Streak count={p.streak} timestamps={p.model.recentTimestamps} tz={p.tz} />
          </div>
        </div>

        {/* 2 — where do I stand */}
        <StatCards model={p.model} className="mt-5" />

        {/* 3 — what to improve */}
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
          <NextBestAction model={p.model} todayHref={todayHref} className="xl:col-span-7" />
          <TodaySizing item={p.todaySizing} className="xl:col-span-5" />
        </div>

        {p.model.inProgress.length > 0 && <ContinueSessions items={p.model.inProgress} tz={p.tz} className="mt-5" />}

        {/* 4 — how am I progressing */}
        <div id="analytics" className="mt-5 grid scroll-mt-28 grid-cols-1 gap-5 xl:grid-cols-12">
          <ProgressChart model={p.model} className="xl:col-span-7" />
          <TypePerformance stats={[...p.model.byType, p.model.sizing]} focusType={focusType} className="xl:col-span-5" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
          <SkillMap stats={[...p.model.byType, p.model.sizing]} focusType={focusType} lastPracticed={lastPracticed} className="xl:col-span-7" />
          <RecentActivity items={p.model.activity} tz={p.tz} className="xl:col-span-5" />
        </div>
      </div>
    </div>
  );
}
