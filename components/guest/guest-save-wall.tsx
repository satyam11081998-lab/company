'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2, Bookmark } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/**
 * The single conversion moment in guest mode.
 *
 * Shown once, when a guest reaches past today's daily pair. It is a SAVE
 * prompt, not a login nag and not an upsell — the product decision was
 * explicitly "no login/login/login, and don't call it a demo". The guest has
 * already solved two cases and has a real score; the honest ask is to keep it.
 *
 * Mechanically this is what makes anonymous auth worth the security cost:
 * `updateUser({ email })` and `linkIdentity({ provider })` upgrade the SAME
 * `auth.users` row, so every attempt, submission, score and streak survives.
 * Nothing is copied or re-parented. `handle_user_converted` (0045 §2b) then
 * flips `public.users.is_guest` to false, which is what puts them on the
 * leaderboard and — critically — takes them out of the 30-day cleanup.
 */
export default function GuestSaveWall({
  next,
  onConverted,
  title = 'Save your work',
  message,
}: {
  next?: string;
  /**
   * Fired the moment an identity is attached. The caller is responsible for
   * refreshing the access token (it still says `is_anonymous: true`) and then
   * completing whatever action the wall interrupted — on the solve screen that
   * is the submit the user was mid-way through.
   */
  onConverted?: () => void | Promise<void>;
  title?: string;
  message?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<'idle' | 'working' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function saveWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState('working');
    const supabase = createClient();
    // Email AND password in one call. Attaching only an email leaves the user
    // unable to sign back in later, which defeats the entire point of "save
    // your work" — they would return to a browser that had forgotten them.
    // NOTE: no captchaToken here, deliberately. `updateUser` runs on an
    // already-authenticated session and its options type accepts only
    // `emailRedirectTo` — Supabase's CAPTCHA protection covers sign-up,
    // sign-in and password reset, not authenticated profile updates. Passing
    // one is a type error, which is how this was caught.
    const { error: updErr } = await supabase.auth.updateUser({
      email: email.trim(),
      password,
    });

    if (!updErr) {
      // If the project does not require email confirmation, the session is
      // already permanent and we can finish the interrupted action right away.
      // If it does, `is_anonymous` stays true until they click the link, so we
      // fall through to the "check your email" state instead of submitting
      // against a token the backend will still read as a guest.
      const { data } = await supabase.auth.refreshSession();
      if (data.session?.user && data.session.user.is_anonymous !== true) {
        await onConverted?.();
        return;
      }
      setState('sent');
      return;
    }

    // IDENTITY CONFLICT. The email already belongs to a permanent account.
    // Supabase cannot merge the two, and we deliberately do NOT re-parent the
    // guest's rows onto the existing account: `case_attempts` carries
    // first-attempt semantics that a merge would silently corrupt (a "first"
    // attempt appearing twice for one case). We tell them plainly instead —
    // silent data loss here is exactly the kind of thing that turns into a
    // support ticket nobody can reproduce.
    setState('idle');
    setError(
      'That email already has a MECE account. Log in to it below — today’s practice won’t carry over.',
    );
  }

  /**
   * OAuth conversion. `linkIdentity` attaches the provider to the EXISTING
   * anonymous user rather than creating a second account, so the attempt the
   * wall interrupted is still theirs when they come back from the redirect.
   *
   * Unlike the email path there is no confirmation step — the account is
   * permanent the moment they return, which is why these two sit above the
   * form. `linkedin_oidc` is the provider id this project already uses in
   * components/auth-form.tsx; plain 'linkedin' is a different, older provider
   * and will fail.
   */
  async function saveWithOAuth(provider: 'google' | 'linkedin_oidc') {
    setError(null);
    setState('working');
    const supabase = createClient();
    const { error: linkErr } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`,
      },
    });
    if (linkErr) {
      setState('idle');
      const label = provider === 'google' ? 'Google' : 'LinkedIn';
      setError(
        linkErr.message?.toLowerCase().includes('already')
          ? `That ${label} account is already registered. Log in to it below — today’s practice won’t carry over.`
          : `Could not connect ${label}. Try email instead.`,
      );
    }
  }

  if (state === 'sent') {
    return (
      <div className="mx-auto w-full max-w-sm rounded-xl border border-primary/20 bg-card p-6 text-center shadow-xl">
        <h2 className="text-lg font-bold text-foreground">Confirm your email</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          We sent a link to <span className="font-medium text-foreground">{email}</span>. Open it, then come back
          here — your answer is saved and will be scored the moment you do.
        </p>
        <button
          onClick={async () => {
            // Their click happened in another tab, so this session has not
            // heard about it yet. Refresh, and if the account is now permanent
            // finish the action they were interrupted mid-way through.
            const supabase = createClient();
            const { data } = await supabase.auth.refreshSession();
            if (data.session?.user && data.session.user.is_anonymous !== true) {
              await onConverted?.();
              return;
            }
            setError('Not confirmed yet — open the link in the email first.');
          }}
          className="mt-4 text-[12px] font-medium text-primary underline underline-offset-2"
        >
          I&apos;ve confirmed — score my answer
        </button>
        {error && <p className="mt-3 text-[12px] text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-xl border border-primary/20 bg-card p-6 text-center shadow-xl">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
        <Bookmark className="h-5 w-5 text-primary" />
      </div>
      <h2 className="text-lg font-bold text-foreground sm:text-xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
        {message ??
          "You've done the work. Create a free account and we'll score it — your answer, feedback and score stay yours."}
      </p>

      {/* OAuth first: both are instant, with no confirmation step between the
          user and their score. Email is the fallback below the divider. */}
      <div className="mt-5 space-y-2.5">
        <button
          onClick={() => saveWithOAuth('google')}
          disabled={state === 'working'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-70"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
          </svg>
          Continue with Google
        </button>
        <button
          onClick={() => saveWithOAuth('linkedin_oidc')}
          disabled={state === 'working'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-70"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden>
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
          </svg>
          Continue with LinkedIn
        </button>
      </div>

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={saveWithEmail} className="space-y-2.5">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@college.edu"
          className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-primary"
        />
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password (8+ characters)"
          className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={state === 'working'}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-70"
        >
          {state === 'working' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>See my score <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-[12px] leading-relaxed text-destructive">
          {error}{' '}
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="underline underline-offset-2">
            Log in
          </Link>
        </p>
      )}

      <p className="mt-3 text-[11px] text-muted-foreground/70">Free. No credit card.</p>
    </div>
  );
}
