'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LogOut, LogIn } from 'lucide-react';

/**
 * Sign-out button styled for the navy nav bar.
 *
 * GUEST MODE (0045): an anonymous visitor technically holds a session, so this
 * button used to render "Sign out" at them — offering to log out of an account
 * they never logged into. Worse than confusing: their practice is not saved
 * yet, and signing out is the one action that destroys it irrecoverably, since
 * an anonymous account cannot be signed back into.
 *
 * For a guest we show "Log in" instead. That is the honest label (it is what
 * the control does for someone with an existing account elsewhere) and it
 * cannot eat their work.
 */
export default function SignOutButton({ variant = 'nav' }: { variant?: 'nav' | 'standalone' } = {}) {
  const router = useRouter();
  const supabase = createClient();
  // null = unknown yet. Rendering the sign-out label before we know would flash
  // the wrong control at a guest, which is the exact confusion being fixed.
  const [isGuest, setIsGuest] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setIsGuest(data.session?.user?.is_anonymous === true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignOut() {
    // Release this browser's single-session slot BEFORE the token is dropped,
    // so the account is immediately free on another device. Never blocks the
    // sign-out: any failure here is swallowed.
    try {
      await fetch('/api/session/end', { method: 'POST', keepalive: true });
    } catch { /* sign out regardless */ }
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  // Guests: a link, not a sign-out. Never renders the destructive action.
  if (isGuest) {
    if (variant === 'standalone') {
      return (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <LogIn className="h-4 w-4" />
          Log in
        </Link>
      );
    }
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-[13px] font-medium text-navy-foreground/40 hover:text-navy-foreground/80 transition-colors px-2 py-1"
      >
        <LogIn className="h-3.5 w-3.5" />
        Log in
      </Link>
    );
  }

  // Still resolving the session — render nothing rather than flash the wrong
  // label. It appears within a tick.
  if (isGuest === null) return null;

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
