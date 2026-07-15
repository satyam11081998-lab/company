'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight } from 'lucide-react';
import { useNavLoading } from '@/components/guest/nav-loading';

type Variant = 'hero' | 'nav' | 'cta';

interface AuthCTAProps {
  variant?: Variant;
}

/**
 * Client-side auth CTA — checks Supabase auth state on mount and renders the
 * appropriate call-to-action. Shows a skeleton while loading to prevent CLS.
 *
 * Guests are driven into the PREVIEW/EXPLORE experience (a real, browsable
 * dashboard/practice/leaderboard where actions are gated) rather than straight
 * to signup — "let them see it first". Sign up stays one tap away in the nav.
 *
 * The explore/"Open MECE" buttons navigate through useNavLoading so a full-screen
 * loading overlay appears instantly on click (the destination is server-rendered
 * behind an auth round-trip, so a plain link would feel laggy).
 */

// Where the highlighted "explore" button sends a guest — the live dashboard
// preview (most intriguing surface). One place to change the funnel entry.
const EXPLORE_HREF = '/dashboard';

// Shared prominent-primary styling. `pulse-soft` adds a subtle red glow that
// respects prefers-reduced-motion (see globals.css).
const BIG_PRIMARY =
  'btn-primary pulse-soft shadow-lg shadow-primary/20 !px-7 !py-3.5 !text-[15px] hover:scale-[1.02] transition-transform';

export default function AuthCTA({ variant = 'nav' }: AuthCTAProps) {
  const [state, setState] = useState<'loading' | 'authed' | 'guest'>('loading');
  const { navigate, overlay, router } = useNavLoading('Loading…');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setState(user ? 'authed' : 'guest');
    });
  }, []);

  // Warm the preview route so the transition resolves faster.
  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  /* ── Loading skeleton ────────────────────────────────────────────── */
  if (state === 'loading') {
    if (variant === 'hero') {
      return (
        <div className="flex items-center gap-3">
          <div className="h-12 w-44 rounded-full bg-muted animate-pulse" />
          <div className="h-12 w-32 rounded-full bg-muted animate-pulse" />
        </div>
      );
    }
    if (variant === 'cta') {
      return <div className="mx-auto h-12 w-52 rounded-full bg-muted animate-pulse" />;
    }
    /* nav */
    return (
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:block h-9 w-16 rounded bg-muted animate-pulse" />
        <div className="h-9 w-24 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  /* ── Hero variant ───────────────────────────────────────────────── */
  if (variant === 'hero') {
    return (
      <div>
        {overlay}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(state === 'authed' ? '/dashboard' : EXPLORE_HREF)}
            className={`${BIG_PRIMARY} justify-center`}
          >
            {state === 'authed' ? 'Open MECE' : 'Explore MECE'} <ArrowRight className="h-4 w-4" />
          </button>
          <Link href="/methodology" className="btn-ghost justify-center !py-3.5">
            How it works
          </Link>
        </div>
        {state === 'guest' && (
          <p className="mt-3 text-[12.5px] text-muted-foreground">
            See real cases, guesstimates &amp; the dashboard — no account needed.{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        )}
      </div>
    );
  }

  /* ── CTA variant (bottom navy section) ──────────────────────────── */
  if (variant === 'cta') {
    if (state === 'authed') {
      return (
        <>
          {overlay}
          <button type="button" onClick={() => navigate('/dashboard')} className={`${BIG_PRIMARY} mx-auto w-fit`}>
            Open MECE <ArrowRight className="h-4 w-4" />
          </button>
        </>
      );
    }
    return (
      <div className="flex flex-col items-center gap-3">
        {overlay}
        <button type="button" onClick={() => navigate(EXPLORE_HREF)} className={`${BIG_PRIMARY} w-fit`}>
          Explore the platform <ArrowRight className="h-4 w-4" />
        </button>
        <Link href="/signup" className="text-[13px] font-medium text-white/70 hover:text-white underline underline-offset-2">
          or create an account
        </Link>
      </div>
    );
  }

  /* ── Nav variant (default) ──────────────────────────────────────── */
  if (state === 'authed') {
    return (
      <>
        {overlay}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="btn-primary text-sm md:text-[15px] py-1.5 px-3 md:py-2 md:px-6 whitespace-nowrap shadow-sm"
        >
          Open MECE
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="hidden sm:inline-block text-[15px] font-medium text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
      >
        Log in
      </Link>
      <Link href="/signup" className="btn-primary text-sm md:text-[15px] py-1.5 px-4 md:py-2 md:px-6 whitespace-nowrap shadow-sm">
        Sign up
      </Link>
    </>
  );
}
