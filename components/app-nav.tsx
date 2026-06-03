'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/components/user-context';
import SignOutButton from '@/components/sign-out-button';
import ThemeToggle from '@/components/theme-toggle';
import TierBadge from '@/components/tier-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Logo from '@/components/logo';

/**
 * Full-bleed navy navigation bar.
 * Consulting-deck aesthetic: structured, dark, precise.
 * Reads user from UserContext — no auth fetches here.
 */
export default function AppNav() {
  const { user, tier, isFree } = useUser();
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="nav-bar sticky top-0 z-40 w-full overflow-hidden max-w-[100vw]">
      <div className="container flex h-14 md:h-20 items-center justify-between">

        {/* Left: wordmark + nav links */}
        <div className="flex items-center gap-4 md:gap-12">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center group -ml-2">
            <Logo variant="light" className="" />
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-0.5">
              {[
                { href: '/dashboard',   label: 'Dashboard' },
                { href: '/learn/casebook', label: 'Learn' },
                { href: '/practice',    label: 'Practice' },
                { href: '/gd-briefs',   label: 'GD Briefs' },
                { href: '/leaderboard', label: 'Leaderboard' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 text-[17px] font-medium transition-colors rounded-sm ${
                    isActive(href)
                      ? 'text-navy-foreground'
                      : 'text-navy-foreground/50 hover:text-navy-foreground/80'
                  }`}
                >
                  {label}
                  {isActive(href) && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-none" />
                  )}
                </Link>
              ))}
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
                  <span className="font-mono text-[18.4px] font-medium text-primary tabular-nums">{user.points}</span>
                  <span className="text-[13.8px] text-navy-foreground/35">pts</span>
                </div>
              </div>
              <Link href="/profile" className="flex-shrink-0 relative inline-block">
                <Avatar className={`h-8 w-8 md:h-10 md:w-10 rounded-full shadow-md bg-gradient-to-br from-navy-mid/20 to-navy-mid/40 backdrop-blur-sm cursor-pointer ${tier === 'pro' ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : 'border border-navy-mid/30'}`}>
                  <AvatarImage src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || user.id)}`} alt={user.name || ''} />
                  <AvatarFallback className="rounded-full bg-navy-mid text-navy-foreground text-sm md:text-[18.4px] font-semibold shadow-inner">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                {tier === 'pro' && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-bold px-1.5 py-[1px] rounded-full border border-background shadow-sm uppercase leading-none z-10 whitespace-nowrap">
                    {tier}
                  </span>
                )}
              </Link>
              {tier !== 'pro' && (
                <Link 
                  href="/upgrade" 
                  className="hidden md:inline-flex items-center gap-1 text-[13.8px] font-semibold text-primary hover:text-primary-hover transition-colors px-2 py-1 border border-primary/20 rounded-sm bg-primary/5"
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
    </header>
  );
}