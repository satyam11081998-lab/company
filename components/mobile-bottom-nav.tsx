'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Brain,
  FileText,
  BookOpen,
  Trophy,
  Library,
  Medal,
  ScrollText,
  User,
  Sparkles,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '@/components/user-context';
import SignOutButton from '@/components/sign-out-button';

/**
 * Single source of truth for mobile navigation.
 *
 * Previously the phone had TWO competing menus: this bottom bar (5 links) AND a
 * hamburger drawer in app-nav (8 links). They disagreed — Deck Vault, Cheat
 * Sheet and Case Competitions only existed in the hamburger, so they were
 * effectively hidden on the surface most users actually look at. Now the bottom
 * bar holds the 4 primary destinations plus a "More" sheet that exposes
 * everything else (and account actions), so every feature is one tap away from
 * a predictable place. The app-nav hamburger is hidden on mobile to match.
 */

const PRIMARY = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/practice', icon: Brain, label: 'Practice' },
  { href: '/learn/casebook', icon: FileText, label: 'Learn' },
  { href: '/gd-briefs', icon: BookOpen, label: 'GDs' },
];

// Routes that live behind "More" — used to light up the More tab when active.
const SECONDARY_PREFIXES = ['/resume', '/leaderboard', '/skeletons', '/cheat-sheet', '/profile', '/upgrade'];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isPro } = useUser();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  // Close the sheet on navigation.
  useEffect(() => { setMoreOpen(false); }, [pathname]);
  // Lock scroll + Escape-to-close while the sheet is open.
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMoreOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [moreOpen]);

  if (!user) return null;
  // Full-screen focused sessions (the case interview) hide the tab bar so the
  // chat composer owns the bottom of the screen — app-like, and no overlap.
  if (pathname?.startsWith('/cases/')) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const moreActive = SECONDARY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  const moreLinks = [
    { href: '/resume', icon: FileText, label: 'Bullet Lab' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { href: '/skeletons', icon: Library, label: 'Deck Vault' },
    { href: '/learn/casebook/case-competitions/why-they-matter', icon: Medal, label: 'Case Competitions' },
    { href: '/cheat-sheet', icon: ScrollText, label: 'Cheat Sheet' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      <nav
        className="xl:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-around px-1 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] transform-gpu"
        style={{ height: 'calc(4rem + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {PRIMARY.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition active:scale-90 ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}

        {/* More */}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="More"
          aria-expanded={moreOpen}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition active:scale-90 ${moreActive || moreOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <MoreHorizontal className="w-[22px] h-[22px]" strokeWidth={moreActive || moreOpen ? 2.5 : 2} />
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </nav>

      {/* More sheet */}
      {mounted && moreOpen && createPortal(
        <div className="xl:hidden fixed inset-0 z-[110]">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm animate-in fade-in-0"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl shadow-2xl animate-slide-up"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground">More</span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setMoreOpen(false)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-3 pb-2 grid grid-cols-1">
              {moreLinks.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-[15px] font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-border mx-3 my-2" />

            <div className="px-3 pb-1 flex flex-col gap-2">
              {!isPro && (
                <Link
                  href="/upgrade"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white font-semibold text-[15px] hover:bg-primary-hover transition-colors"
                >
                  <Sparkles className="h-4 w-4" /> Upgrade to Pro
                </Link>
              )}
              <div className="px-1">
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
