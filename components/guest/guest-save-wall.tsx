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
export default function GuestSaveWall({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'working' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function saveWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState('working');
    const supabase = createClient();
    const { error: updErr } = await supabase.auth.updateUser({ email: email.trim() });

    if (!updErr) {
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

  async function saveWithGoogle() {
    setError(null);
    setState('working');
    const supabase = createClient();
    const { error: linkErr } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}` },
    });
    if (linkErr) {
      setState('idle');
      setError(
        linkErr.message?.toLowerCase().includes('already')
          ? 'That Google account is already registered. Log in to it below — today’s practice won’t carry over.'
          : 'Could not link that account. Try the email option instead.',
      );
    }
  }

  if (state === 'sent') {
    return (
      <div className="mx-auto w-full max-w-sm rounded-xl border border-primary/20 bg-card p-6 text-center shadow-xl">
        <h2 className="text-lg font-bold text-foreground">Check your email</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Open it and
          everything you&apos;ve solved today becomes permanently yours.
        </p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 text-[12px] font-medium text-primary underline underline-offset-2"
        >
          I&apos;ve confirmed — continue
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-xl border border-primary/20 bg-card p-6 text-center shadow-xl">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
        <Bookmark className="h-5 w-5 text-primary" />
      </div>
      <h2 className="text-lg font-bold text-foreground sm:text-xl">Save your work</h2>
      <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
        You&apos;ve done today&apos;s case and guesstimate. Add an email and your scores, streak and progress stay
        yours — otherwise they&apos;re gone when you close this browser.
      </p>

      <form onSubmit={saveWithEmail} className="mt-5 space-y-2.5">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@college.edu"
          className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={state === 'working'}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-70"
        >
          {state === 'working' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Save my progress <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <button
        onClick={saveWithGoogle}
        disabled={state === 'working'}
        className="mt-2.5 inline-flex w-full items-center justify-center rounded-full border border-border px-5 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-70"
      >
        Continue with Google
      </button>

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
