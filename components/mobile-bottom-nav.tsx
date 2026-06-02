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
  const { user } = useUser();

  // Don't show if not logged in
  if (!user) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const tabs = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/practice', icon: Brain, label: 'Practice' },
    { href: '/learn/casebook', icon: FileText, label: 'Learn' },
    { href: '/gd-briefs', icon: BookOpen, label: 'GDs' },
    { href: '/leaderboard', icon: Trophy, label: 'Rank' },
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-around px-1 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] transform-gpu"
      style={{ height: 'calc(4rem + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        const Icon = tab.icon;
        return (
          <Link 
            key={tab.href} 
            href={tab.href}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
