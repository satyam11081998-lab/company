import Link from 'next/link';
import { BarChart3, Briefcase, Calculator, History, LayoutDashboard, Target, Trophy } from 'lucide-react';
import InterviewSim from '@/components/landing/interview-sim';

/**
 * The hero's practice tile: today's warm-up case, framed as the MECE app
 * window it will open into — sidebar on the left, the live multiple-choice
 * interview on the right. It floats in front of the sunrise photograph like a
 * screen lifted off a desk.
 *
 * Everything in it works: the sim is the real interactive warm-up
 * (components/landing/interview-sim.tsx, 'tile' variant) and every sidebar
 * entry is a real link. Nothing here fetches on mount, so "/" stays static.
 */

const NAV: { href: string; label: string; Icon: typeof Target; active?: boolean }[] = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/practice', label: 'Practice', Icon: Target, active: true },
  { href: '/cases', label: 'Cases', Icon: Briefcase },
  { href: '/practice?tab=guesstimates', label: 'Market sizing', Icon: Calculator },
  { href: '/history', label: 'History', Icon: History },
  { href: '/leaderboard', label: 'Leaderboard', Icon: Trophy },
];

export default function HeroTile({
  caseId,
  guesstimateId,
  className = '',
}: {
  caseId: string | null;
  guesstimateId: string | null;
  className?: string;
}) {
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
        <div className="mt-auto rounded-[9px] border border-border/80 bg-card px-2.5 py-2.5 dark:bg-white/[0.03]">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            <BarChart3 aria-hidden className="h-3.5 w-3.5 text-primary" /> Warm-up
          </p>
          <p className="mt-1 text-[10.5px] leading-snug text-muted-foreground">A sample case in the real format. No sign-up.</p>
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        <InterviewSim variant="tile" caseId={caseId} guesstimateId={guesstimateId} />
      </div>
    </div>
  );
}
