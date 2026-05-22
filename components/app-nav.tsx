'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import SignOutButton from '@/components/sign-out-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { UserRow } from '@/lib/types';

/**
 * Top nav for all routes (public AND authenticated).
 * Fetches user state client-side so the parent page can be static.
 * Shows authenticated UI (points, avatar, sign-out) when logged in.
 * Shows public UI (Login, Sign up buttons) when logged out.
 */
export default function AppNav({ user: initialUser }: { user?: UserRow | null }) {
  const [user, setUser] = useState<UserRow | null>(initialUser ?? null);
  const [loading, setLoading] = useState(initialUser === undefined);

  useEffect(() => {
    // If parent already passed user data, skip the fetch
    if (initialUser !== undefined) return;

    const supabase = createClient();

    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      setUser((data as UserRow | null) ?? null);
      setLoading(false);
    }

    fetchUser();
  }, [initialUser]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href={user ? '/dashboard' : '/'}
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            MECE
          </Link>
          {user && (
            <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/cases">Cases</NavLink>
              <NavLink href="/gd-briefs">GD Briefs</NavLink>
              <NavLink href="/learn">Learn</NavLink>
              <NavLink href="/leaderboard">Leaderboard</NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-slate-100" />
          ) : user ? (
            <>
              <span className="hidden text-sm font-medium text-primary sm:inline">
                {user.points} pts
              </span>
              <Link href="/profile">
                <Avatar className="h-9 w-9 cursor-pointer border border-border">
                  {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name || ''} />}
                  <AvatarFallback className="bg-navy text-navy-foreground text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary-hover">
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

/** Single nav link in the top nav. */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-md px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900">
      {children}
    </Link>
  );
}