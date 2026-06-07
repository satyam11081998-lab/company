'use client';

import Link from 'next/link';
import { Flame, Play } from 'lucide-react';
import type { ReadinessResult } from '@/lib/readiness';
import type { DailyContentResponse } from '@/lib/api'; // Or wherever DailyContentResponse is
import type { ReadinessSubmission } from '@/lib/readiness';

interface FocusHeroProps {
  userName: string;
  submissions: ReadinessSubmission[];
  streak: number;
  readiness: ReadinessResult;
  dailyToday?: any; // we will type this properly if possible, assume { case: CaseRow | null }
}

function HeroShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-[14px] border border-border"
      style={{
        background: 'linear-gradient(180deg, #FAF9F6 0%, #F3EFE5 100%)',
        padding: 'var(--hero-pad, 22px 28px)',
      }}
    >
      <div
        className="absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(200,16,46,0.10) 0%, rgba(200,16,46,0) 70%)',
        }}
      />
      <div
        className="absolute -bottom-24 -left-16 h-[240px] w-[240px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(15,28,51,0.07) 0%, rgba(15,28,51,0) 70%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function StreakMonument({ streak, bestStreak, big = true }: { streak: number; bestStreak: number; big?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 px-2 pl-5 ${
        big ? 'border-l border-border' : ''
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Flame className="h-4 w-4 text-primary" />
        <span className="text-label text-muted-foreground">Streak</span>
      </div>
      <div
        className="text-foreground"
        style={{
          fontSize: big ? 'clamp(56px, 5.5vw, 80px)' : 56,
          lineHeight: 0.95,
          fontWeight: 700,
          letterSpacing: '-0.03em',
        }}
      >
        {streak}
      </div>
      <div className="max-w-[170px] text-center text-[11px] leading-relaxed text-muted-foreground">
        {streak >= bestStreak && streak > 0 ? (
          <b className="text-primary">Personal best.</b>
        ) : (
          <>
            <b className="text-foreground">{Math.max(0, bestStreak - streak)} days</b> from your record
          </>
        )}
      </div>
      <div className="mt-1 flex gap-1">
        {Array.from({ length: 7 }).map((_, i) => {
          const filled = i < Math.min(streak, 7);
          return (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-full"
              style={{
                background: filled ? 'hsl(var(--primary))' : 'transparent',
                border: filled ? 'none' : '1.5px dashed hsl(var(--primary))',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function FocusHero({ userName, submissions, streak, readiness, dailyToday }: FocusHeroProps) {
  const casesSolved = submissions.filter((s) => s.score != null).length;
  const newcomer = casesSolved < 5;
  const todayCase = dailyToday?.case;

  // We need to calculate bestStreak, typically we'd track this in DB,
  // but since we only have `streak_count`, we assume bestStreak = streak for now,
  // or we can calculate from submissions history if we wanted.
  // For simplicity, we just use streak as best if we don't have best_streak.
  const bestStreak = streak; 

  const greeting = `${new Date().toLocaleDateString('en-US', { weekday: 'long' })}, ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}`;

  return (
    <HeroShell>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
            <span className="badge-pill badge-pill-red uppercase tracking-widest text-[10px]">
              {newcomer ? 'YOUR FIRST FOCUS CASE' : 'TODAY · FOCUS ROUND'}
            </span>
            <span className="text-[11.5px] text-muted-foreground">{greeting}</span>
          </div>
          
          <h1
            className="text-foreground max-w-[620px]"
            style={{
              fontSize: 'clamp(22px, 2.4vw, 30px)',
              lineHeight: 1.18,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            {newcomer
              ? "Start with profitability. It's where most aspirants find their footing."
              : todayCase?.title || "Ready for today's challenge?"}
          </h1>
          
          <p className="mt-2 max-w-[540px] text-[13px] leading-[1.55] text-muted-foreground">
            {newcomer ? (
              <>A gentle intro. 20 minutes. No score pressure on your first three cases.</>
            ) : (
              <>
                In your strongest domain. Crack it under <b className="text-foreground">25 min</b> and your streak hits <b className="text-primary">{streak + 1}</b>.
              </>
            )}
          </p>
          
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {todayCase ? (
              <Link href={`/cases/${todayCase.id}`} className="btn-primary animate-pulse-soft">
                <Play className="h-4 w-4" /> Start the case
              </Link>
            ) : (
              <Link href="/practice" className="btn-primary animate-pulse-soft">
                <Play className="h-4 w-4" /> Go to Practice
              </Link>
            )}
            <Link href="/practice" className="btn-ghost text-[12.5px] text-muted-foreground">
              {newcomer ? 'Tour first' : '10-min drill instead'}
            </Link>
          </div>
          
          <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-border pt-2.5">
            <span className="inline-flex items-baseline gap-1 text-[11.5px] text-muted-foreground">
              <b className="font-mono-data text-[13px] text-foreground">25</b> min
            </span>
            <span className="h-[14px] w-[1px] bg-border" />
            <span className="inline-flex items-baseline gap-1 text-[11.5px] text-muted-foreground">
              <b className="font-mono-data text-[13px] text-foreground">+85</b> pts{' '}
              <b className="ml-1 text-primary">+25 streak</b>
            </span>
            <span className="h-[14px] w-[1px] bg-border" />
            <span className="text-[11.5px] text-muted-foreground">
              {todayCase?.type || 'Profitability'} · {todayCase?.difficulty || 'Medium'}
            </span>
          </div>
        </div>
        
        <div className="hidden md:block">
          <StreakMonument streak={streak} bestStreak={bestStreak} big={true} />
        </div>
      </div>
    </HeroShell>
  );
}
