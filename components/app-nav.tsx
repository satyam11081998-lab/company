'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/components/user-context';
import SignOutButton from '@/components/sign-out-button';
import ThemeToggle from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

/**
 * Full-bleed navy navigation bar.
 * Consulting-deck aesthetic: structured, dark, precise.
 * Reads user from UserContext — no auth fetches here.
 */
export default function AppNav() {
  const { user } = useUser();
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="nav-bar sticky top-0 z-40">
      <div className="container flex h-14 items-center justify-between">

        {/* Left: wordmark + nav links */}
        <div className="flex items-center gap-8">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <span className="text-[17px] font-bold tracking-tightest leading-none">
              <span className="text-primary">M</span>
              <span className="text-navy-foreground">ECE</span>
            </span>
            <span className="hidden sm:block h-3.5 w-px bg-navy-mid" />
            <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-widest text-navy-foreground/40 leading-none">
              Placement prep
            </span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-0.5">
              {[
                { href: '/dashboard',   label: 'Dashboard' },
                { href: '/learn',       label: 'Learn' },
                { href: '/practice',    label: 'Practice' },
                { href: '/gd-briefs',   label: 'GD Briefs' },
                { href: '/leaderboard', label: 'Leaderboard' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-1 text-[13px] font-medium transition-colors rounded-sm ${
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

        {/* Right: points + avatar + theme + sign out */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <>
              <div className="hidden sm:flex items-baseline gap-1 border-r border-navy-mid pr-3">
                <span className="font-mono text-base font-medium text-primary tabular-nums">{user.points}</span>
                <span className="text-label text-navy-foreground/35">pts</span>
              </div>
              <Link href="/profile" className="flex-shrink-0">
                <Avatar className="h-7 w-7 rounded-sm border border-navy-mid cursor-pointer">
                  {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name || ''} />}
                  <AvatarFallback className="rounded-sm bg-navy-mid text-navy-foreground text-base font-semibold">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-navy-foreground/60 hover:text-navy-foreground hover:bg-navy-mid h-8 text-base">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary text-white hover:bg-primary-hover h-8 text-base rounded-sm font-semibold">
                  Sign up free
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}