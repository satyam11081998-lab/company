'use client';

/**
 * Shown on the admin sign-in instead of the form when this browser already
 * holds a learner or guest session. Signing in over a live session would leave
 * it half-alive: its single-device slot stays taken (the next /login on this
 * browser then reports a "session on another device"), and a guest's unsaved
 * practice would be moved onto the admin account. So it is ended properly
 * first — the slot released (/api/session/end, as the normal sign-out does),
 * then this browser's session revoked — and the page re-renders with the form.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SwitchAccount({ current }: { current: { kind: 'learner'; email: string } | { kind: 'guest' } }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOutFirst() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (current.kind === 'learner') {
        try { await fetch('/api/session/end', { method: 'POST', keepalive: true }); } catch { /* never blocks sign-out */ }
      }
      const { error: err } = await createClient().auth.signOut({ scope: 'local' });
      if (err) throw err;
      router.refresh();
    } catch {
      setError("Couldn't sign out. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        {current.kind === 'learner' ? (
          <>
            This browser is signed in as <span className="font-semibold break-all">{current.email || 'a learner account'}</span>,
            which doesn&apos;t have admin access. Sign out of it to sign in to Admin here.
          </>
        ) : (
          <>
            This browser is using MECE as a guest. Ending the guest session discards practice that hasn&apos;t been saved
            to an account.
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <button
        type="button"
        onClick={signOutFirst}
        disabled={busy}
        aria-busy={busy}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <LogOut className="h-4 w-4" />}
        {current.kind === 'learner' ? 'Sign out and continue' : 'End guest session and continue'}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        To stay signed in to both, open Admin in a private window.
      </p>
    </div>
  );
}
