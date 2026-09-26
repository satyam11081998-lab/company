'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { History, Home, LifeBuoy, LogIn, LogOut, Search, Trophy, TrendingUp, User, WalletCards, X } from 'lucide-react';
import Logo from '@/components/logo';
import ThemeButton from '@/components/us/theme-button';
import { GlyphChain, GlyphTree } from '@/components/us/art';
import { usButton } from '@/components/us/ui';
import { useUser } from '@/components/user-context';
import { createClient } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * US / Europe app shell (2026-09-26). Rendered by app/(app)/layout.tsx for
 * international accounts ONLY; India keeps AppNav + MobileBottomNav.
 *
 *   desktop  64px utility bar (logo · search · plan · theme · account) and a
 *            232px sidebar grouped Daily / Practice / Progress / Account
 *   mobile   compact top bar and a 4-tab bottom bar (Home · Practice ·
 *            Progress · Ranks)
 *
 * The case workspace (/cases/…) draws itself full-screen below the 64px bar
 * (components/solve/ConversationalSolve.tsx), so the sidebar and bottom bar
 * are not rendered there at all — nothing hidden stays focusable behind it.
 *
 * Every link goes to a surface a US account can use; India-only tracks
 * (learning, GD, deck vault, CV lab, copilot) are not linked here and are
 * refused server-side for international accounts anyway.
 */

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Active when pathname matches and, if given, ?tab= matches. */
  match: { path: string; tab?: string | null; prefix?: boolean };
  external?: boolean;
};

const ICON = 'h-[18px] w-[18px] shrink-0';

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Daily',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: <Home className={ICON} strokeWidth={1.5} />, match: { path: '/dashboard' } }],
  },
  {
    group: 'Practice',
    items: [
      { href: '/practice?tab=scored', label: 'Cases', icon: <GlyphTree className={ICON} />, match: { path: '/practice', tab: 'scored' } },
      { href: '/practice?tab=guesstimates', label: 'Market sizing', icon: <GlyphChain className={ICON} />, match: { path: '/practice', tab: 'guesstimates' } },
      { href: '/history', label: 'History', icon: <History className={ICON} strokeWidth={1.5} />, match: { path: '/history', prefix: true } },
    ],
  },
  {
    group: 'Progress',
    items: [
      { href: '/leaderboard', label: 'Leaderboard', icon: <Trophy className={ICON} strokeWidth={1.5} />, match: { path: '/leaderboard' } },
      { href: '/profile', label: 'Profile', icon: <User className={ICON} strokeWidth={1.5} />, match: { path: '/profile' } },
    ],
  },
  {
    group: 'Account',
    items: [
      { href: '/upgrade', label: 'Plans', icon: <WalletCards className={ICON} strokeWidth={1.5} />, match: { path: '/upgrade', prefix: true } },
      { href: 'mailto:team@mece.in', label: 'Support', icon: <LifeBuoy className={ICON} strokeWidth={1.5} />, match: { path: '__none__' }, external: true },
    ],
  },
];

const TABS: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: <Home className="h-5 w-5" strokeWidth={1.5} />, match: { path: '/dashboard' } },
  { href: '/practice', label: 'Practice', icon: <GlyphTree className="h-5 w-5" />, match: { path: '/practice', prefix: true } },
  { href: '/history', label: 'Progress', icon: <TrendingUp className="h-5 w-5" strokeWidth={1.5} />, match: { path: '/history', prefix: true } },
  { href: '/leaderboard', label: 'Ranks', icon: <Trophy className="h-5 w-5" strokeWidth={1.5} />, match: { path: '/leaderboard' } },
];

function useIsActive() {
  const pathname = usePathname() || '';
  const params = useSearchParams();
  const tab = params?.get('tab') ?? null;
  return (m: NavItem['match']) => {
    const onPath = m.prefix ? pathname === m.path || pathname.startsWith(m.path + '/') : pathname === m.path;
    if (!onPath) return false;
    if (m.tab === undefined) return true;
    // "Cases" is also the default practice view.
    return m.tab === 'scored' ? tab === 'scored' || tab === null || tab === 'all' : tab === m.tab;
  };
}

export default function UsAppShell({
  children,
  fontClassName = '',
  previewBar = null,
}: {
  children: React.ReactNode;
  fontClassName?: string;
  previewBar?: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const workspace = pathname.startsWith('/cases/');
  return (
    <div className={`${fontClassName} us-scope relative z-[1] min-h-screen bg-background`}>
      <a href="#app-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[6px] focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow">
        Skip to content
      </a>
      <TopBar />
      {previewBar}
      <div className="flex">
        {!workspace && (
          <Suspense fallback={<aside className="hidden w-[232px] shrink-0 lg:block" />}>
            <Sidebar />
          </Suspense>
        )}
        <main id="app-main" className={`min-w-0 flex-1 ${workspace ? '' : 'pb-24 lg:pb-0'}`}>
          {children}
          {!workspace && <AppFooter />}
        </main>
      </div>
      {!workspace && (
        <Suspense fallback={null}>
          <BottomTabs />
        </Suspense>
      )}
    </div>
  );
}

/* ── Top bar ───────────────────────────────────────────────────────────── */

function TopBar() {
  const { user, tier } = useUser();
  const isGuest = !!user?.is_guest;
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setSearchOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="flex h-16 items-center gap-3 px-3 sm:px-4 lg:gap-6 lg:px-0">
        <div className="flex shrink-0 items-center lg:w-[232px] lg:px-3">
          <Link href="/dashboard" aria-label="MECE dashboard" className="-ml-3 flex items-center rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Logo isLanding full={false} className="!h-[56px]" />
          </Link>
        </div>

        <SearchForm className="hidden max-w-md flex-1 md:flex" />
        <div className="flex-1 md:hidden" />

        <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:pr-6">
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            aria-label={searchOpen ? 'Close search' : 'Search cases'}
            aria-expanded={searchOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
          >
            {searchOpen ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
          </button>
          {!isGuest && (
            <Link
              href="/upgrade"
              className={`hidden items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-[12px] font-semibold transition-colors sm:inline-flex ${
                tier === 'free' ? 'border-primary/40 text-primary hover:bg-primary/5' : 'border-border text-foreground hover:bg-muted'
              }`}
            >
              {tier === 'free' ? 'Free · Upgrade' : tier === 'pro' ? 'Pro plan' : 'Lite plan'}
            </Link>
          )}
          <ThemeButton />
          {isGuest ? (
            <>
              <Link href="/login?next=/dashboard" className={usButton('ghost', 'sm', 'hidden sm:inline-flex')}>Log in</Link>
              <Link href="/signup?next=/dashboard" className={usButton('primary', 'sm')}>Sign up free</Link>
            </>
          ) : (
            <AccountMenu />
          )}
        </div>
      </div>
      {searchOpen && (
        <div className="border-t border-border px-3 py-3 md:hidden">
          <SearchForm autoFocus />
        </div>
      )}
    </header>
  );
}

function SearchForm({ className = '', autoFocus = false }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/practice?q=${encodeURIComponent(term)}` : '/practice');
      }}
    >
      <label htmlFor={autoFocus ? 'us-search-m' : 'us-search'} className="sr-only">
        Search cases and market sizing questions
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={autoFocus ? 'us-search-m' : 'us-search'}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Search cases and market sizing questions"
        className="h-10 w-full rounded-[8px] border border-border bg-card pl-9 pr-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      />
    </form>
  );
}

function AccountMenu() {
  const { user, tier } = useUser();
  const router = useRouter();
  const name = user?.name || user?.email || 'Account';
  const initials = (user?.name || user?.email || '?')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

  async function signOut() {
    try {
      await fetch('/api/session/end', { method: 'POST', keepalive: true });
    } catch {
      /* sign out regardless */
    }
    await createClient().auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-[8px] p-1 pr-1.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {user?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-[12px] font-semibold text-white dark:bg-navy-mid">
            {initials || '?'}
          </span>
        )}
        <span className="hidden text-left leading-tight xl:block">
          <span className="block max-w-[140px] truncate text-[13px] font-semibold text-foreground">{user?.name?.split(' ')[0] || 'Account'}</span>
          <span className="block text-[11px] text-muted-foreground">{tier === 'pro' ? 'Pro plan' : tier === 'lite' ? 'Lite plan' : 'Free plan'}</span>
        </span>
      </DropdownMenuTrigger>
      {/* @ts-ignore - JSX inferred types lack children */}
      <DropdownMenuContent align="end" className="w-60">
        <div className="px-2 py-2">
          <p className="truncate text-[13px] font-semibold text-foreground">{name}</p>
          {user?.email && user.email !== name && <p className="truncate text-[12px] text-muted-foreground">{user.email}</p>}
        </div>
        <DropdownMenuSeparator />
        {/* @ts-ignore - JSX inferred types lack children */}
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full cursor-pointer">Profile</Link>
        </DropdownMenuItem>
        {/* @ts-ignore - JSX inferred types lack children */}
        <DropdownMenuItem asChild>
          <Link href="/upgrade" className="w-full cursor-pointer">Plan &amp; billing</Link>
        </DropdownMenuItem>
        {/* @ts-ignore - JSX inferred types lack children */}
        <DropdownMenuItem asChild>
          <Link href="/history" className="w-full cursor-pointer">Your sessions</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* @ts-ignore - JSX inferred types lack children */}
        <DropdownMenuItem onSelect={signOut} className="cursor-pointer">
          <LogOut aria-hidden className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Sidebar (desktop) ─────────────────────────────────────────────────── */

function Sidebar() {
  const isActive = useIsActive();
  const { user, tier } = useUser();
  const isGuest = !!user?.is_guest;
  return (
    <aside aria-label="Sections" className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[232px] shrink-0 flex-col border-r border-border bg-background lg:flex">
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {NAV.map((g) => (
          <div key={g.group} className="mb-6 last:mb-0">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{g.group}</p>
            <ul className="mt-2 space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(it.match);
                const cls = `relative flex items-center gap-3 rounded-[8px] px-3 py-2 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? 'bg-primary/[0.07] font-semibold text-primary' : 'text-foreground/75 hover:bg-muted hover:text-foreground'
                }`;
                return (
                  <li key={it.label}>
                    {it.external ? (
                      <a href={it.href} className={cls}>{it.icon}{it.label}</a>
                    ) : (
                      <Link href={it.href} aria-current={active ? 'page' : undefined} className={cls}>
                        {active && <span aria-hidden className="absolute -left-3 top-1.5 h-[calc(100%-12px)] w-[2px] rounded-full bg-primary" />}
                        {it.icon}
                        {it.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        {isGuest ? (
          <>
            <p className="text-[12px] font-semibold text-foreground">Practicing as a guest</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">Sign up to keep your scores and history.</p>
            <Link href="/signup?next=/dashboard" className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline underline-offset-4">
              <LogIn aria-hidden className="h-3.5 w-3.5" /> Create free account
            </Link>
          </>
        ) : tier === 'free' ? (
          <>
            <p className="text-[12px] font-semibold text-foreground">Free plan</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">Open the full US case bank with Lite or Pro.</p>
            <Link href="/upgrade" className="mt-2 inline-flex text-[12px] font-semibold text-primary hover:underline underline-offset-4">See plans</Link>
          </>
        ) : (
          <p className="text-[12px] text-muted-foreground">
            <span className="font-semibold text-foreground">{tier === 'pro' ? 'Pro' : 'Lite'} plan</span> · full access
          </p>
        )}
      </div>
    </aside>
  );
}

/* ── Bottom tabs (phones) ──────────────────────────────────────────────── */

function BottomTabs() {
  const isActive = useIsActive();
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-4">
        {TABS.map((t) => {
          const active = isActive(t.match);
          return (
            <li key={t.label}>
              <Link
                href={t.href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {t.icon}
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ── Footer (inside the content column) ────────────────────────────────── */

function AppFooter() {
  return (
    <footer className="border-t border-border px-4 py-6 text-[12px] text-muted-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} MECE Prep. Not affiliated with any consulting firm.</p>
        <nav aria-label="Legal" className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/refund" className="hover:text-foreground">Refunds</Link>
          <a href="mailto:team@mece.in" className="hover:text-foreground">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
