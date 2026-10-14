'use client';

/**
 * Staff sign-in form. Email + password against Supabase from the browser
 * (same as /login, CAPTCHA included), then `finishStaffSignIn` checks on the
 * server that the account is an admin or a CRM team member. Anything else is
 * signed straight back out.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getCaptchaToken } from '@/lib/turnstile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { finishStaffSignIn } from './actions';

function friendly(raw: string, status?: number): string {
  if (/invalid login credentials/i.test(raw)) return "That email and password don't match an admin account.";
  if (/email not confirmed/i.test(raw)) return 'This admin email has not been confirmed yet.';
  if (status === 429 || /rate limit|too many/i.test(raw)) return 'Too many sign-in attempts. Wait a few minutes, then try again.';
  if (/captcha/i.test(raw)) return 'The security check did not pass. Reload the page and try again.';
  if (/fetch|network/i.test(raw)) return "Couldn't reach the sign-in service. Check your connection and try again.";
  return raw || 'Sign-in failed. Please try again.';
}

export default function AdminLoginForm({ next }: { next: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    let leaving = false;
    let signedIn = false;
    let supabase: ReturnType<typeof createClient> | null = null;
    try {
      supabase = createClient();
      // The page only shows this form when the browser holds no session. If one
      // appeared since (another tab signed in), don't sign over it: that would
      // orphan its device slot. Re-render, which offers "sign out first".
      const { data: { session: existing } } = await supabase.auth.getSession();
      if (existing) {
        setError('This browser just signed in to another account. Sign out of it first.');
        router.refresh();
        return;
      }
      const captchaToken = await getCaptchaToken();
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
        ...(captchaToken ? { options: { captchaToken } } : {}),
      });
      if (authErr) {
        setError(friendly(authErr.message, (authErr as { status?: number }).status));
        return;
      }
      signedIn = true;
      const res = await finishStaffSignIn(next);
      if (!res.ok) {
        // Clears this tab's copy of the session (and its refresh timer) too.
        try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* already gone */ }
        setPassword('');
        setError(res.error);
        return;
      }
      leaving = true;
      router.replace(res.dest);
      router.refresh();
    } catch (err) {
      // Signed in but the staff check never answered (network, or a deploy in
      // between): don't leave an unchecked session behind in this browser.
      if (signedIn && supabase) {
        try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* best effort */ }
        setError("Couldn't finish signing in. Please try again.");
      } else {
        setError(friendly(err instanceof Error ? err.message : ''));
      }
    } finally {
      // Keep the spinner up while the admin console loads.
      if (!leaving) setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate aria-busy={busy}>
      <div className="space-y-1.5">
        <Label htmlFor="admin-email">Admin email</Label>
        <Input
          id="admin-email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          className="h-10"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="admin-password">Password</Label>
          <a href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Input
            id="admin-password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            className="h-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={show ? 'Hide password' : 'Show password'}
            aria-pressed={show}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !email.trim() || !password}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <LockKeyhole className="h-4 w-4" />}
        {busy ? 'Signing in…' : 'Sign in to Admin'}
      </button>
    </form>
  );
}
