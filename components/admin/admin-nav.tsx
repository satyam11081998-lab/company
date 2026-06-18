'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MessageSquareQuote, Users, Megaphone, FileText,
  FolderLock, Flag, Sparkles,
} from 'lucide-react';

const SECTIONS: { href: string; label: string; icon: React.FC<{ className?: string }> }[] = [
  { href: '/admin', label: 'Operations', icon: LayoutDashboard },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { href: '/admin/team', label: 'Brains behind', icon: Users },
  { href: '/admin/cases', label: 'Cases', icon: Sparkles },
  { href: '/admin/broadcast', label: 'Broadcast', icon: Megaphone },
  { href: '/admin/decks', label: 'Deck Vault', icon: FolderLock },
  { href: '/admin/feedback', label: 'Feedback', icon: Flag },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {SECTIONS.map(({ href, label, icon: Icon }) => {
        // Exact match for /admin; prefix match for the rest.
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
              active ? 'bg-muted font-semibold text-navy' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
