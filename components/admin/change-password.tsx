'use client';

/**
 * Change the signed-in admin account's password (2026-10-09). This is how the
 * separate admin login's password is set and rotated: through Supabase Auth
 * itself (its hashing and password policy), never through SQL, so the
 * password never sits in a query history or a log. After a change, every
 * OTHER session of the account is signed out, so a leaked old password stops
 * working everywhere at once; this browser stays signed in.
 */
import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MIN = 12;

function friendly(raw: string, code?: string): string {
  if (code === 'same_password' || /different from the old/i.test(raw)) return 'The new password must be different from the current one.';
  if (code === 'weak_password' || /weak|at least|characters/i.test(raw)) return `That password is too weak. Use ${MIN}+ characters with a mix of letters, numbers and symbols.`;
  if (code === 'reauthentication_needed' || /reauthenticat/i.test(raw)) return 'For security, sign out, sign back in, and change the password straight away.';
  if (/session|jwt|not authenticated/i.test(raw)) return 'Your sign-in has expired. Sign in again, then retry.';
  if (/fetch|network/i.test(raw)) return "Couldn't reach the sign-in service. Check your connection and try again.";
  return raw || "Couldn't change the password. Please try again.";
}

export default function ChangePassword({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function reset(next: boolean) {
    setOpen(next);
    if (!next) { setPw(''); setPw2(''); setError(null); setDone(null); setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (pw.length < MIN) return setError(`Use at least ${MIN} characters.`);
    if (pw !== pw2) return setError("The two passwords don't match.");
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password: pw });
      if (err) {
        setError(friendly(err.message, (err as { code?: string }).code));
        return;
      }
      setPw(''); setPw2('');
      const { error: outErr } = await supabase.auth.signOut({ scope: 'others' });
      setDone(outErr
        ? 'Password changed. Other devices could not be signed out automatically; they will need the new password when their session ends.'
        : 'Password changed. Every other device signed in to this account has been signed out.');
    } catch (err) {
      setError(friendly(err instanceof Error ? err.message : ''));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <button type="button" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          <KeyRound className="h-3.5 w-3.5" />
          Change password
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change admin password</DialogTitle>
          <DialogDescription>
            For <span className="font-medium text-foreground break-all">{email || 'this account'}</span>. Other devices are signed out afterwards.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <>
            <p role="status" className="rounded-md border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{done}</p>
            <DialogFooter>
              <button type="button" onClick={() => reset(false)} className="inline-flex h-9 items-center rounded-md bg-navy px-4 text-sm font-semibold text-white hover:bg-navy/90">Done</button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-3" noValidate aria-busy={busy}>
            {/* Lets password managers attach the new password to the right account. */}
            <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />
            <div className="space-y-1.5">
              <Label htmlFor="admin-new-password">New password</Label>
              <Input id="admin-new-password" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} disabled={busy} className="h-10" />
              <p className="text-[11px] text-muted-foreground">At least {MIN} characters. Use a password you don&apos;t use anywhere else.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-new-password-2">Repeat new password</Label>
              <Input id="admin-new-password-2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} disabled={busy} className="h-10" />
            </div>
            {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <button
                type="submit"
                disabled={busy || !pw || !pw2}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />}
                {busy ? 'Saving…' : 'Change password'}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
