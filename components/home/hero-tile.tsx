'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Calculator, History, LayoutDashboard, Target, Trophy } from 'lucide-react';
import InterviewSim from '@/components/landing/interview-sim';
import HomeImage from '@/components/home/photo';
import { HOME_PHOTOS } from '@/lib/home/photos';

/**
 * The hero's practice tile: today's warm-up, framed as the MECE app window it
 * will open into — sidebar on the left, the live multiple-choice interview on
 * the right. It floats in front of the sunrise photograph like a screen lifted
 * off a desk.
 *
 * Everything in it works: the sim is the real interactive warm-up
 * (components/landing/interview-sim.tsx, 'tile' variant) and every sidebar
 * entry is a real link. The sidebar's topic card shows a photograph of what
 * the current question is about — a restaurant counter for the case, a glass
 * of chai for the guesstimate — the way the US dashboard pictures today's
 * case. Nothing here fetches on mount, so "/" stays static.
 */

const NAV: { href: string; label: string; Icon: typeof Target; active?: boolean }[] = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/practice', label: 'Practice', Icon: Target, active: true },
  { href: '/cases', label: 'Cases', Icon: Briefcase },
  { href: '/practice?tab=guesstimates', label: 'Market sizing', Icon: Calculator },
  { href: '/history', label: 'History', Icon: History },
  { href: '/leaderboard', label: 'Leaderboard', Icon: Trophy },
];

const TOPIC = {
  case: { photo: HOME_PHOTOS.qsr, kicker: 'The case', title: 'A quick-service chain’s profit fell 18%' },
  guess: { photo: HOME_PHOTOS.chai, kicker: 'The guesstimate', title: 'Cups of tea sold in a city of 10M' },
} as const;

export default function HeroTile({
  caseId,
  guesstimateId,
  className = '',
}: {
  caseId: string | null;
  guesstimateId: string | null;
  className?: string;
}) {
  const [mode, setMode] = useState<'case' | 'guess'>('case');
  const topic = TOPIC[mode];
  return (
    <div
      className={`home-tile relative flex overflow-hidden rounded-[14px] border border-black/[0.07] bg-card dark:border-white/10 ${className}`}
    >
      {/* App sidebar — only where the window is wide enough (≥1400px) to carry it
          without squeezing the options onto two lines. */}
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

        {/* Topic card: what today's warm-up is about, pictured. */}
        <div className="mt-auto overflow-hidden rounded-[10px] border border-border/80 bg-card dark:bg-white/[0.03]">
          <div className="relative aspect-[4/3] overflow-hidden">
            {(['case', 'guess'] as const).map((m) => (
              <HomeImage
                key={m}
                photo={TOPIC[m].photo}
                decorative
                sizes="148px"
                widths={[160, 320]}
                ratio={4 / 3}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${m === mode ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>
          <div className="px-2.5 pb-2.5 pt-2">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-primary">{topic.kicker}</p>
            <p className="mt-0.5 text-[11.5px] font-semibold leading-snug text-foreground">{topic.title}</p>
          </div>
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        <InterviewSim variant="tile" caseId={caseId} guesstimateId={guesstimateId} onModeChange={setMode} />
      </div>
    </div>
  );
}
