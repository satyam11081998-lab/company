import Link from 'next/link';
import SignOutButton from '@/components/sign-out-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserRow } from '@/lib/types';

/** Top nav for authenticated app routes. */
export default function AppNav({ user }: { user: UserRow | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-slate-900">Consilio</Link>
          <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/cases">Cases</NavLink>
            <NavLink href="/gd-briefs">GD Briefs</NavLink>
            <NavLink href="/learn">Learn</NavLink>
            <NavLink href="/leaderboard">Leaderboard</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm font-medium text-amber-700 sm:inline">{user.points} pts</span>
          )}
          <Link href="/profile">
            <Avatar className="h-9 w-9 cursor-pointer border border-border">
              {user?.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name || ''} />}
              <AvatarFallback className="bg-amber-100 text-sm font-medium text-amber-800">
                {user?.name?.charAt(0).toUpperCase() || user?.email.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <SignOutButton />
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
