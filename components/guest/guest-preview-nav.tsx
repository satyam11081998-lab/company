'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Brain, Trophy, BookOpen, Eye } from 'lucide-react';
import { useNavLoading } from '@/components/guest/nav-loading';

/**
 * Section nav shown to logged-out visitors while they explore the guest
 * PREVIEW experience (dashboard / practice / leaderboard / casebook). Renders
 * under the GuestChrome top bar. Mobile-first: a horizontally scrollable pill
 * row that never wraps or overflows the viewport; promotes to a centered row on
 * wider screens.
 *
 * Navigation runs through useNavLoading so a loading overlay shows instantly on
 * tap (preview routes are server-rendered behind an auth round-trip).
 */
const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/practice', label: 'Practice', icon: Brain },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/learn/casebook', label: 'Casebook', icon: BookOpen },
];

export default function GuestPreviewNav() {
  const pathname = usePathname() || '';
  const { navigate, overlay } = useNavLoading('Loading…');
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="border-t border-border/70 bg-background/80">
      {overlay}
      <div className="container flex items-center gap-2 h-11 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 pr-1">
          <Eye className="h-3.5 w-3.5" /> Preview
        </span>
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <button
              key={href}
              type="button"
              onClick={() => navigate(href)}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
