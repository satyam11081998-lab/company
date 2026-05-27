'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Brain, FileText, Menu, X, Sparkles, BookOpen, Trophy, User } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '@/components/user-context';
import TierBadge from '@/components/tier-badge';
import SignOutButton from '@/components/sign-out-button';
import { Button } from '@/components/ui/button';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, tier } = useUser();

  // Don't show if not logged in
  if (!user) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const tabs = [
    { href: '/home', icon: Home, label: 'Home' },
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/practice', icon: Brain, label: 'Practice' },
    { href: '/learn', icon: FileText, label: 'Learn' },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[4.5rem] bg-navy/98 backdrop-blur-md border-t border-navy-mid pb-safe flex items-center justify-around px-1 shadow-2xl">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link 
              key={tab.href} 
              href={tab.href}
              onClick={() => setMoreOpen(false)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 touch-target ${active ? 'text-primary' : 'text-navy-foreground/50 hover:text-navy-foreground/80'}`}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
        
        <button 
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 touch-target ${moreOpen ? 'text-primary' : 'text-navy-foreground/50 hover:text-navy-foreground/80'}`}
        >
          {moreOpen ? <X className="w-[22px] h-[22px]" strokeWidth={2.5} /> : <Menu className="w-[22px] h-[22px]" strokeWidth={2} />}
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* More Sheet */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMoreOpen(false)}>
          <div 
            className="absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-xl overflow-hidden animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                {user?.avatar_url ? (
                   <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                   <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white font-bold">{user?.name?.[0] || '?'}</div>
                )}
                <div>
                  <div className="font-semibold text-foreground">{user?.name || 'User'}</div>
                  <div className="text-sm font-mono text-primary font-medium">{user?.points} pts</div>
                </div>
                {tier !== 'free' && <TierBadge tier={tier} size="sm" className="ml-auto" />}
              </div>
            </div>

            <div className="p-2 flex flex-col">
              <Link href="/gd-briefs" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 p-3 touch-target hover:bg-muted rounded-md text-foreground">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-[15px]">GD Briefs</span>
              </Link>
              <Link href="/leaderboard" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 p-3 touch-target hover:bg-muted rounded-md text-foreground">
                <Trophy className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-[15px]">Leaderboard</span>
              </Link>
              <Link href="/profile" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 p-3 touch-target hover:bg-muted rounded-md text-foreground">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-[15px]">Profile</span>
              </Link>
            </div>

            <div className="p-4 border-t border-border flex flex-col gap-3">
              {tier !== 'pro' && (
                <Link href="/upgrade" onClick={() => setMoreOpen(false)}>
                  <Button className="w-full bg-primary text-white font-semibold gap-2 min-h-[44px] text-[15px]">
                    <Sparkles className="w-4 h-4" /> Upgrade to Pro
                  </Button>
                </Link>
              )}
              <div onClick={() => setMoreOpen(false)} className="flex justify-center w-full min-h-[44px] items-center">
                 <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
