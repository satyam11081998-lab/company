'use client';

/**
 * Bottom of the admin rail: which account is signed in, its password, and a
 * sign-out that returns to the admin sign-in (2026-10-09). Signs out THIS browser only
 * (scope 'local'), so an admin signed in on another device stays signed in.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ADMIN_LOGIN_PATH } from '@/lib/staff-paths';
import ChangePassword from '@/components/admin/change-password';

export default function AdminAccount({ email }: { email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    let error: unknown = null;
    try {
      ({ error } = await createClient().auth.signOut({ scope: 'local' }));
    } catch (e) {
      error = e;
    }
    // On a network failure Supabase keeps the session, so say so rather than
    // bouncing to the sign-in page and straight back into the console.
    if (error) {
      setBusy(false);
      setFailed(true);
      return;
    }
    router.replace(ADMIN_LOGIN_PATH);
    router.refresh();
  }

  return (
    <div className="mt-2 border-t border-border px-3 pb-1 pt-3">
      <p className="text-[11px] text-muted-foreground">Signed in as</p>
      <p className="truncate text-xs font-medium text-foreground" title={email}>{email || 'admin'}</p>
      <ChangePassword email={email} />
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        aria-busy={busy}
        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" /> : <LogOut className="h-3.5 w-3.5" />}
        Sign out of admin
      </button>
      {failed && (
        <p role="alert" className="mt-1 text-[11px] text-destructive">Couldn&apos;t sign out. Check your connection and try again.</p>
      )}
    </div>
  );
}
