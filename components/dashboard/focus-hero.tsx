'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeImage from '@/components/home/photo';
import { Flame, Play } from './icons';
import { ProofRail, PeerProximity, StreakExpiry } from './fomo';
import { DailyCaseCta, DailyDoneBadge, type UserVariant } from './hero';
import { dashHand } from './hand-font';
import type { DailyItemProgress } from '@/lib/dashboard/daily-progress';
import type { DashPhoto } from '@/lib/dashboard/photos';

/**
 * The India dashboard's focus card (2026-09-30, owner mockup) — one card that
 * answers "what do I do now?":
 *
 *   left   today's focus case, why it is worth doing, Start, and the
 *          handwritten line of the day (a new maxim every IST day);
 *   right  a photograph of what today's case is about, melting into the card
 *          from its left edge (no photo box, no hard corner), with the
 *          practice streak floating on it.
 *
 * Replaces the three hero variants (case / streak / readiness) with one card
 * so a returning user sees the same product as a newcomer; the streak panel
 * carries the streak record and, once it exists, the readiness score.
 * Every number is the viewer's own; the photo and the line are chosen on the
 * server (lib/dashboard/photos.ts, lib/dashboard/daily-lines.ts).
 */

type CasePick = import('@/lib/dashboard/today-meta').TodayMeta['casePick'];

export default function FocusHero({
  u,
  today,
  todayTitle,
  progress,
  proofRail,
  photo,
  line,
}: {
  u: UserVariant;
  today?: CasePick;
  /** Today's case title from the daily pair, when today-meta has no row. */
  todayTitle?: string | null;
  progress?: DailyItemProgress;
  proofRail?: import('@/lib/dashboard/proof-rail').ProofRailData;
  photo: DashPhoto;
  line: string;
}) {
  const router = useRouter();
  const newcomer = u.casesSolved < 5;
  const title = today?.title || todayTitle || null;
  const primaryHref = today?.id ? `/cases/${today.id}` : '/practice?tab=scored';

  return (
    <section
      aria-labelledby="focus-title"
      className={`${dashHand.variable} relative isolate overflow-hidden rounded-[14px] border border-[var(--line)] bg-[linear-gradient(180deg,var(--hero-grad-1)_0%,var(--hero-grad-2)_100%)] md:min-h-[318px]`}
    >
      {/* The photograph: a band across the top on phones, the right half from md,
          fading into the card (masks in globals.css → .dash-photo-hero). */}
      <div aria-hidden className="dash-photo-hero pointer-events-none absolute inset-x-0 top-0 -z-10 h-[190px] md:inset-y-0 md:left-auto md:h-auto md:w-[52%] lg:w-[50%]">
        <HomeImage
          photo={photo}
          decorative
          priority
          sizes="(min-width: 1280px) 640px, (min-width: 768px) 52vw, 100vw"
          widths={[480, 720, 960, 1280]}
          className="dash-photo-img h-full w-full object-cover"
        />
      </div>

      {/* Streak, floating on the photo (md and up). */}
      <StreakPanel u={u} newcomer={newcomer} progress={progress} className="absolute bottom-5 right-5 hidden md:block" />

      <div className="relative px-5 pb-6 pt-[164px] sm:px-7 md:max-w-[60%] md:py-7 lg:max-w-[56%] lg:pl-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="chip red" style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 10 }}>
            {newcomer ? 'Your first focus case' : 'Today · partner round'}
          </span>
          <span className="text-[11.5px] text-[var(--ink-3)]">{u.greeting}</span>
        </div>

        <h1 id="focus-title" className="serif mt-3 max-w-[620px] text-[clamp(22px,2.4vw,30px)] leading-[1.18] text-[var(--ink)]">
          {newcomer ? 'Start with profitability. It’s where most aspirants find their footing.' : title ?? 'Today’s case is on its way.'}
        </h1>
        <p className="mt-2 max-w-[540px] text-[13.5px] leading-[1.55] text-[var(--ink-2)]">
          {newcomer ? (
            <>A gentle intro. 20 minutes. No score pressure on your first three cases.</>
          ) : (
            <>
              In your strongest domain. Crack it under <b className="text-[var(--ink)]">{today?.minutes || 25} min</b> and your streak hits{' '}
              <b className="text-[var(--red)]">{u.streak + 1}</b>
              {u.streak >= u.bestStreak - 1 ? <> — a new record</> : <> — one short of PB</>}.
            </>
          )}
        </p>
        {newcomer && title && (
          <p className="mt-3 flex max-w-[540px] items-baseline gap-2 text-[12.5px] leading-snug text-[var(--ink-3)]">
            <span className="shrink-0 font-semibold uppercase tracking-[0.1em] text-[10px] text-[var(--red)]">Today&apos;s case</span>
            <span className="min-w-0 font-medium text-[var(--ink)]">{title}</span>
          </p>
        )}

        {progress?.attempted && (
          <div className="mt-3">
            <DailyDoneBadge progress={progress} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <DailyCaseCta progress={progress} startHref={primaryHref} startLabel={<><Play className="ico-sm" /> Start the case</>} pulse>
            <button type="button" className="btn ghost" style={{ color: 'var(--ink-2)', fontSize: 12.5 }} onClick={() => router.push('/practice')}>
              {newcomer ? 'Tour first' : '10-min drill instead'}
            </button>
          </DailyCaseCta>
          <span className="ml-1.5">
            <ProofRail u={{ proofRail }} />
          </span>
        </div>

        {/* The line of the day, in a pen hand. */}
        <figure className="mt-5 max-w-[30rem] origin-left -rotate-[1.2deg]">
          <blockquote
            className="text-[19px] leading-[1.3] text-[var(--ink-2)] sm:text-[20px]"
            style={{ fontFamily: 'var(--font-dash-hand), "Segoe Print", cursive', fontWeight: 300 }}
          >
            <span className="text-[var(--red)]">&ldquo;</span>
            {line}
            <span className="text-[var(--red)]">&rdquo;</span>
          </blockquote>
          <svg aria-hidden viewBox="0 0 220 12" preserveAspectRatio="none" className="mt-0.5 h-[9px] w-[min(60%,220px)] text-[var(--red)]">
            <path d="M2 8 C 40 3, 80 10, 120 6 S 190 3, 218 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <figcaption className="sr-only">Today&apos;s line. A new one appears every day.</figcaption>
        </figure>

        {/* Streak inline on phones (the floating panel needs the photo's width). */}
        <StreakPanel u={u} newcomer={newcomer} progress={progress} className="mt-5 md:hidden" inline />

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--line)] pt-3">
          <span className="inline-flex items-baseline gap-1 text-[11.5px] text-[var(--ink-3)]">
            <b className="mono tnum text-[13px] text-[var(--ink)]">{today?.minutes || 25}</b> min
          </span>
          <span aria-hidden className="h-3.5 w-px bg-[var(--line)]" />
          <span className="inline-flex items-baseline gap-1 text-[11.5px] text-[var(--ink-3)]">
            <b className="mono tnum text-[13px] text-[var(--ink)]">+{today?.pointsReward || 85}</b> pts
            <b className="ml-1 text-[var(--red)]">+{today?.streakBoost || 25} streak</b>
          </span>
          <span aria-hidden className="h-3.5 w-px bg-[var(--line)]" />
          <span className="text-[11.5px] text-[var(--ink-3)]">
            {today?.firm || 'BCG'} · {today?.round || 'partner round'}
          </span>
        </div>
        <div className="mt-2.5">
          <PeerProximity u={u} />
        </div>
      </div>
    </section>
  );
}

function StreakPanel({
  u,
  newcomer,
  progress,
  className = '',
  inline = false,
}: {
  u: UserVariant;
  newcomer: boolean;
  progress?: DailyItemProgress;
  className?: string;
  inline?: boolean;
}) {
  const filled = Math.min(u.streak, 7);
  const safeToday = !!progress?.attempted;
  // The countdown reads the viewer's clock, so it only renders after mount —
  // server and browser would otherwise disagree on the seconds (hydration error).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const note =
    u.streak === 0
      ? 'Solve today’s case to start one.'
      : u.streak >= u.bestStreak
        ? 'Personal best.'
        : `${u.bestStreak - u.streak} ${u.bestStreak - u.streak === 1 ? 'day' : 'days'} from your record.`;

  return (
    <div
      className={`${
        inline
          ? 'flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[12px] border border-[var(--line)] bg-[var(--card-hex)] px-4 py-3'
          : 'w-[226px] rounded-[12px] border border-white/70 bg-white/[0.82] p-3.5 shadow-[0_1px_2px_rgba(15,28,51,0.06),0_14px_32px_-14px_rgba(15,28,51,0.35)] backdrop-blur-md dark:border-white/10 dark:bg-[#131A26]/[0.84]'
      } ${className}`}
    >
      <div className={inline ? 'flex items-baseline gap-2.5' : ''}>
        <div className="flex items-center gap-1.5">
          <Flame className="flame h-3.5 w-3.5 text-[var(--red)]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">Practice streak</span>
        </div>
        <div className={`flex items-baseline gap-1.5 ${inline ? '' : 'mt-1.5'}`}>
          <span className={`serif tnum leading-none text-[var(--ink)] ${inline ? 'text-[26px]' : 'text-[40px]'}`}>{u.streak}</span>
          <span className="text-[13px] font-medium text-[var(--ink-3)]">{u.streak === 1 ? 'day' : 'days'}</span>
        </div>
      </div>
      <div className={`flex gap-1.5 ${inline ? '' : 'mt-2.5'}`} aria-label={`${filled} of the last 7 days`}>
        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${i < filled ? 'bg-[var(--red)]' : 'border-[1.5px] border-dashed border-[rgba(200,16,46,0.6)]'}`}
          />
        ))}
      </div>
      <div className={inline ? 'w-full' : 'mt-2.5'}>
        <p className="text-[11.5px] leading-snug text-[var(--ink-3)]">
          {safeToday && u.streak > 0 ? <><b className="text-[var(--green)]">Safe for today.</b> {note}</> : note}
        </p>
        {!newcomer && !safeToday && u.streak > 0 && (
          <div className="mt-1.5 min-h-[17px]">{mounted && <StreakExpiry minimal />}</div>
        )}
        {u.readiness != null && (
          <div className="mt-2.5 flex items-baseline justify-between border-t border-[var(--line)] pt-2 text-[11.5px] text-[var(--ink-3)]">
            <span>Readiness</span>
            <span>
              <b className="mono tnum text-[13px] text-[var(--ink)]">{u.readiness}</b>/100
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
