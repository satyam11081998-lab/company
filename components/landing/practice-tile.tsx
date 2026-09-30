'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Briefcase, Calculator, History, LayoutDashboard, Target, Trophy } from 'lucide-react';
import InterviewSim from '@/components/landing/interview-sim';
import { photoUrl, type UsPhoto } from '@/lib/us-market/photo-url';

/**
 * The landing practice tile, shared by the India ("/") and US ("/us") heroes
 * (2026-09-30): today's warm-up, framed as the MECE app window it opens into —
 * sidebar on the left, the live multiple-choice interview on the right. It
 * sits in front of the hero photograph like a screen lifted off a desk, so a
 * cold visitor has something to DO in the first screen (bounce ↓, time on
 * page ↑).
 *
 * Everything in it works: the sim is the real interactive warm-up
 * (components/landing/interview-sim.tsx, 'tile' variant) and every sidebar
 * entry is a real link. The sidebar's topic card pictures what the current
 * question is about and swaps with the Case / Guesstimate (Market sizing)
 * toggle. Nothing fetches on mount, so the page stays static.
 *
 * `footer` renders a status strip under the window (the US hero puts today's
 * real daily case there).
 */

export type TileTopic = { photo: UsPhoto; kicker: string; title: string };

const NAV: { href: string; label: string; Icon: typeof Target; active?: boolean }[] = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/practice', label: 'Practice', Icon: Target, active: true },
  { href: '/cases', label: 'Cases', Icon: Briefcase },
  { href: '/practice?tab=guesstimates', label: 'Market sizing', Icon: Calculator },
  { href: '/history', label: 'History', Icon: History },
  { href: '/leaderboard', label: 'Leaderboard', Icon: Trophy },
];

function TopicPhoto({ photo, visible }: { photo: UsPhoto; visible: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(photo, 320, { h: 240 })}
      srcSet={photo.src ? undefined : `${photoUrl(photo, 160, { h: 120 })} 160w, ${photoUrl(photo, 320, { h: 240 })} 320w`}
      sizes="148px"
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      width={320}
      height={240}
      style={{ backgroundColor: photo.color, objectPosition: photo.focal ?? '50% 50%' }}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

export default function PracticeTile({
  caseId,
  guesstimateId,
  topics,
  market = 'IN',
  footer,
  className = '',
}: {
  caseId: string | null;
  guesstimateId: string | null;
  topics: { case: TileTopic; guess: TileTopic };
  market?: 'IN' | 'US';
  footer?: ReactNode;
  className?: string;
}) {
  const [mode, setMode] = useState<'case' | 'guess'>('case');
  const topic = topics[mode];
  return (
    <div
      className={`relative flex flex-col overflow-hidden border border-black/[0.07] bg-card shadow-[0_1px_2px_rgba(15,28,51,0.06),0_10px_24px_-12px_rgba(15,28,51,0.22),0_44px_80px_-28px_rgba(58,32,10,0.42)] dark:border-white/10 dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),0_40px_80px_-30px_rgba(0,0,0,0.8)] ${className}`}
    >
      <div className="flex min-h-0 flex-1">
        {/* App sidebar — only where the window is wide enough (≥1400px) to
            carry it without squeezing the options onto two lines. */}
        <nav aria-label="MECE app" className="hidden w-[148px] shrink-0 flex-col border-r border-border/80 bg-[#FBFAF7] px-2.5 py-4 dark:bg-white/[0.03] min-[1400px]:flex">
          <span className="flex items-center gap-2 px-2 pb-4">
            <svg viewBox="50 47 49 32" aria-hidden className="h-[15px] w-auto">
              <polygon points="63.38,77.00 80.00,49.00 96.63,77.00" fill="#C8102E" />
              <polygon points="52.00,77.00 66.88,56.88 81.75,77.00" className="fill-[#0F1C33] dark:fill-white" />
            </svg>
            <span className="text-[14px] font-extrabold tracking-normal text-navy dark:text-white">MECE</span>
          </span>
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, Icon, active }) => (
              <li key={label}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2.5 whitespace-nowrap rounded-[7px] px-2 py-[7px] text-[12.5px] font-medium transition-colors ${
                    active
                      ? 'bg-primary/[0.07] text-primary dark:bg-primary/15 dark:text-rose-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon aria-hidden className="h-[15px] w-[15px]" strokeWidth={1.8} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Topic card: what the warm-up is about, pictured. */}
          <div className="mt-auto overflow-hidden rounded-[10px] border border-border/80 bg-card dark:bg-white/[0.03]">
            <div className="relative aspect-[4/3] overflow-hidden">
              <TopicPhoto photo={topics.case.photo} visible={mode === 'case'} />
              <TopicPhoto photo={topics.guess.photo} visible={mode === 'guess'} />
            </div>
            <div className="px-2.5 pb-2.5 pt-2">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-primary">{topic.kicker}</p>
              <p className="mt-0.5 text-[11.5px] font-semibold leading-snug text-foreground">{topic.title}</p>
            </div>
          </div>
        </nav>

        <div className="min-w-0 flex-1">
          <InterviewSim variant="tile" market={market} caseId={caseId} guesstimateId={guesstimateId} onModeChange={setMode} />
        </div>
      </div>
      {footer && <div className="shrink-0 border-t border-border/80 bg-[#FBFAF7] dark:bg-white/[0.03]">{footer}</div>}
    </div>
  );
}
