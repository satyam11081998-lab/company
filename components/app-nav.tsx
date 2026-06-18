'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/components/user-context';
import SignOutButton from '@/components/sign-out-button';
import ThemeToggle from '@/components/theme-toggle';
import TierBadge from '@/components/tier-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu, X, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import Logo from '@/components/logo';

/**
 * Full-bleed navy navigation bar.
 * Consulting-deck aesthetic: structured, dark, precise.
 * Reads user from UserContext — no auth fetches here.
 */
export default function AppNav() {
  const { user, tier, isFree } = useUser();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  // Split into a primary row (always inline on desktop) and a "More" dropdown.
  // The old flat 8-item bar overflowed and visually collided with the points/
  // avatar/upgrade cluster at common laptop widths (~1280–1366px). Five primary
  // links + a More menu fit comfortably and mirror the mobile bottom-bar "More".
  type NavLink = { href: string; label: string; active?: boolean };
  const PRIMARY_LINKS: NavLink[] = [
    { href: '/dashboard', label: 'Dashboard' },
    // "Learn" owns the casebook EXCEPT the case-competitions track (under More).
    { href: '/learn/casebook', label: 'Learn', active: isActive('/learn/casebook') && !isActive('/learn/casebook/case-competitions') },
    { href: '/practice', label: 'Practice' },
    { href: '/gd-briefs', label: 'GD Briefs' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];
  const MORE_LINKS: NavLink[] = [
    { href: '/learn/casebook/case-competitions/why-they-matter', label: 'Case Competitions', active: isActive('/learn/casebook/case-competitions') },
    { href: '/skeletons', label: 'Deck Vault' },
    { href: '/cheat-sheet', label: 'Cheat Sheet' },
  ];
  const moreActive = MORE_LINKS.some(({ href, active }) => active ?? isActive(href));

  return (
    <header className="nav-bar sticky top-0 z-40 w-full overflow-hidden max-w-[100vw]">
      <div className="container flex h-14 md:h-16 items-center justify-between">

        {/* Left: wordmark + nav links */}
        <div className="flex items-center gap-4 md:gap-12">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center group -ml-4 md:-ml-6 shrink-0 -mt-1.5">
            <Logo variant="light" className="" />
          </Link>

          {/* Hamburger retired on mobile: MobileBottomNav's "More" sheet is now
              the single mobile menu, so the phone no longer has two competing
              menus. Hidden (not deleted) to keep this change minimal and
              reversible; the drawer below is consequently dormant on mobile. */}
          {user && (
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-navy-foreground/70 hover:bg-navy-mid/40 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {user && (
            <nav className="hidden xl:flex items-center gap-0.5">
              {PRIMARY_LINKS.map(({ href, label, active }) => {
                const linkActive = active ?? isActive(href);
                return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 text-[17px] font-medium transition-colors rounded-sm ${
                    linkActive
                      ? 'text-navy-foreground'
                      : 'text-navy-foreground/50 hover:text-navy-foreground/80'
                  }`}
                >
                  {label}
                  {linkActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-none" />
                  )}
                </Link>
                );
              })}

              {/* Secondary destinations, grouped so the bar never overflows. */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`relative flex items-center gap-1 px-4 py-2 text-[17px] font-medium transition-colors rounded-sm outline-none ${
                    moreActive
                      ? 'text-navy-foreground'
                      : 'text-navy-foreground/50 hover:text-navy-foreground/80'
                  }`}
                >
                  More
                  <ChevronDown className="h-4 w-4" />
                  {moreActive && (
                    <span className="absolute bottom-0 left-3 right-7 h-0.5 bg-primary rounded-none" />
                  )}
                </DropdownMenuTrigger>
                {/* @ts-ignore - JSX inferred types lack children */}
                <DropdownMenuContent align="start" className="w-52">
                  {MORE_LINKS.map(({ href, label }) => (
                    /* @ts-ignore - JSX inferred types lack children */
                    <DropdownMenuItem key={href} asChild>
                      <Link href={href} className="cursor-pointer w-full">{label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          )}
        </div>

        {/* Right: points, avatar, theme toggle, sign out */}
        <div className="flex items-center gap-3 md:gap-6">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 border-r border-navy-mid pr-3">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-base font-medium text-primary tabular-nums">{user.points}</span>
                  <span className="text-xs text-navy-foreground/50">pts</span>
                </div>
              </div>
              <Link href="/profile" className="flex-shrink-0 relative inline-block">
                <Avatar className={`h-7 w-7 md:h-7 md:w-7 rounded-full shadow-md bg-gradient-to-br from-navy-mid/20 to-navy-mid/40 backdrop-blur-sm cursor-pointer ${tier === 'pro' ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : tier === 'lite' ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-background' : 'border border-navy-mid/30'}`}>
                  <AvatarImage src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || user.id)}`} alt={user.name || ''} />
                  <AvatarFallback className="rounded-full bg-navy-mid text-navy-foreground text-xs font-semibold shadow-inner">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                {tier !== 'free' && (
                  <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 ${tier === 'pro' ? 'bg-primary' : 'bg-amber-500'} text-white text-[9px] font-bold px-1.5 py-[1px] rounded-full border border-background shadow-sm uppercase leading-none z-10 whitespace-nowrap`}>
                    {tier}
                  </span>
                )}
              </Link>
              {tier !== 'pro' && (
                <Link 
                  href="/upgrade" 
                  className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors px-2 py-1.5 border border-primary/20 rounded bg-primary/5"
                >
                  <Sparkles className="h-3 w-3" />
                  Upgrade
                </Link>
              )}
              <div className="hidden md:block">
                <SignOutButton />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-navy-foreground/60 hover:text-navy-foreground hover:bg-navy-mid h-8 text-base">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary text-white hover:bg-primary-hover h-8 text-sm md:text-base rounded-sm font-semibold">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer — links are hidden md:flex above; this exposes them on phones */}
      {mounted && menuOpen && user && createPortal(
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[82%] max-w-xs bg-navy border-r border-navy-mid/40 shadow-2xl flex flex-col animate-slide-right">
            <div className="flex items-center justify-between h-14 px-4 border-b border-navy-mid/30">
              <span className="text-navy-foreground font-semibold">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center h-10 w-10 rounded-md text-navy-foreground/70 hover:bg-navy-mid/40 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {[...PRIMARY_LINKS, ...MORE_LINKS].map(({ href, label, active }) => {
                const linkActive = active ?? isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-5 py-3 text-[16px] font-medium transition-colors ${
                      linkActive
                        ? 'text-navy-foreground bg-navy-mid/30'
                        : 'text-navy-foreground/60 hover:text-navy-foreground/90'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-navy-mid/30 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-navy-foreground/60">
                <span className="font-mono text-base font-medium text-primary tabular-nums">{user.points}</span>
                <span className="text-xs">points</span>
              </div>
              {tier !== 'pro' && (
                <Link
                  href="/upgrade"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary px-3 py-2 border border-primary/30 rounded bg-primary/5"
                >
                  <Sparkles className="h-4 w-4" /> Upgrade to Pro
                </Link>
              )}
              <SignOutButton />
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}