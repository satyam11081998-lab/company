'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';

/** Sign-out button styled for the navy nav bar. */
export default function SignOutButton({ variant = 'nav' }: { variant?: 'nav' | 'standalone' } = {}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  if (variant === 'standalone') {
    return (
      <button
        onClick={handleSignOut}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-destructive"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-1.5 text-[13px] font-medium text-navy-foreground/40 hover:text-navy-foreground/80 transition-colors px-2 py-1"
      aria-label="Sign out"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
