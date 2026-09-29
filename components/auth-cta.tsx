'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ensureGuestSession } from '@/lib/guest';
import { ArrowRight } from 'lucide-react';
import { useNavLoading } from '@/components/guest/nav-loading';

type Variant = 'hero' | 'nav' | 'cta';

interface AuthCTAProps {
  variant?: Variant;
  /**
   * 'editorial' (2026-09-30): the India landing redesign — squared 8px
   * buttons, no pulse, copy as in the approved mockup. 'default' is the
   * unchanged look every other page uses.
   */
  look?: 'default' | 'editorial';
  /** Where the hero's secondary "How it works" button goes. */
  howHref?: string;
}

// Editorial look: one shape (8px) for every control on the new landing.
const ED_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-[8px] bg-primary font-semibold text-primary-foreground ' +
  'shadow-[0_1px_2px_rgba(200,16,46,0.25),0_10px_24px_-12px_rgba(200,16,46,0.6)] transition-[background-color,transform] duration-150 ' +
  'hover:bg-primary-hover active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60';
const ED_SECONDARY =
  'inline-flex items-center justify-center gap-2 rounded-[8px] border border-border-strong/70 bg-card font-semibold text-foreground ' +
  'shadow-[0_1px_2px_rgba(15,28,51,0.06)] transition-colors hover:border-border-strong hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

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

export default function AuthCTA({ variant = 'nav', look = 'default', howHref = '/methodology' }: AuthCTAProps) {
  const ed = look === 'editorial';
  const [state, setState] = useState<'loading' | 'authed' | 'guest'>('loading');
  const [busy, setBusy] = useState(false);
  // Portals need document; guard the server render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { navigate, overlay, router } = useNavLoading('Loading…');

  // Preserve where the visitor is when they choose to authenticate, so login /
  // sign-up returns them to THIS page instead of always dumping them on the
  // dashboard. auth-form.tsx already reads `?next=` and honours it for OAuth,
  // email confirmation and password. Uses ONLY usePathname() (never
  // useSearchParams) so a statically rendered page like "/" is not forced out
  // of static generation.
  const pathname = usePathname();
  const authNext =
    pathname && pathname !== '/login' && pathname !== '/signup'
      ? `?next=${encodeURIComponent(pathname)}`
      : '';
  const loginHref = `/login${authNext}`;
  const signupHref = `/signup${authNext}`;

  /**
   * "Explore MECE" for a logged-out visitor.
   *
   * Mints the anonymous session BEFORE navigating. Without this the button
   * lands on /dashboard with no session, which renders the cold-start page —
   * a headline and a list, no dashboard. The real dashboard needs a user id to
   * build against, so the session has to exist first.
   *
   * This is still a CLICK, never a mount effect, so crawlers never trigger it
   * and "/" stays statically renderable. If minting fails we navigate anyway:
   * the cold-start page is a worse experience but an honest one, and better
   * than a button that does nothing.
   */
  async function exploreAsGuest() {
    // Overlay FIRST. Minting a session is a network round-trip, and without
    // this the button sat dead for a second or two with no feedback.
    setBusy(true);
    try {
      await ensureGuestSession();
      // Confirm the session is actually readable before leaving. signInAnonymously
      // resolving is not the same as the cookie being available.
      const supabase = createClient();
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) break;
        await new Promise((r) => setTimeout(r, 100));
      }
    } catch {
      /* fall through — a hard load still lands somewhere sane */
    }
    // HARD navigation, not router.push. A client-side route change asks the
    // server for /dashboard before the auth cookie is necessarily attached, so
    // the first render saw no session and produced the cold-start page — which
    // is why the real dashboard only appeared on the SECOND visit. A full page
    // load always carries the cookie, so the dashboard is built for a real
    // (anonymous) user on the very first paint. The daily lookup also runs
    // authenticated rather than as `anon`, which is what made the set look
    // "not ready".
    window.location.assign(EXPLORE_HREF);
  }

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
    if (ed) {
      // Same footprint as the loaded controls, so nothing shifts when auth resolves.
      if (variant === 'hero') {
        return (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="h-[52px] w-full rounded-[8px] bg-muted animate-pulse sm:w-[238px]" />
              <div className="h-[52px] w-full rounded-[8px] bg-muted animate-pulse sm:w-[150px]" />
            </div>
            <div className="mt-3.5 h-[20px]" />
          </div>
        );
      }
      if (variant === 'cta') {
        return (
          <div className="flex flex-col items-center gap-3 lg:items-end">
            <div className="h-[52px] w-[238px] rounded-[8px] bg-white/10 animate-pulse" />
            <div className="h-[20px]" />
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden h-10 w-16 rounded-[8px] bg-muted animate-pulse sm:block" />
          <div className="h-10 w-[92px] rounded-[8px] bg-muted animate-pulse" />
        </div>
      );
    }
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

  /* Full-screen "Setting up MECE…" while the anonymous session is created and
     the hard navigation is in flight. The button used to look inert for the
     whole round-trip, which reads as a broken click. */
  // PORTALLED to document.body, not rendered in place. The hero wrapper carries
  // `animate-fade-in`, and any ancestor with a transform/filter/animation
  // creates a containing block — which makes `position: fixed` anchor to THAT
  // element instead of the viewport. Rendered inline, the overlay landed inside
  // the hero column, sat behind the demo card and let the page show through it.
  // A portal escapes every ancestor stacking context there is.
  // `mounted` guards SSR, where `document` does not exist.
  const busyOverlay =
    busy && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary/25 border-t-primary" />
            <div className="px-6 text-center">
              <p className="text-[15px] font-semibold text-foreground">Setting up MECE…</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Getting today&apos;s case ready. No account needed.
              </p>
            </div>
          </div>,
          document.body,
        )
      : null;

  /* ── Editorial look (India landing, 2026-09-30) ─────────────────── */
  if (ed) {
    const go = () => (state === 'authed' ? navigate('/dashboard') : exploreAsGuest());
    const primaryLabel = state === 'authed' ? 'Open MECE' : 'Start your practice here';
    if (variant === 'hero') {
      return (
        <div>
          {overlay}
          {busyOverlay}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={go} className={`${ED_PRIMARY} h-[52px] whitespace-nowrap px-7 text-[15px] lg:px-6 xl:px-7`}>
              {primaryLabel} <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
            <Link href={howHref} className={`${ED_SECONDARY} h-[52px] whitespace-nowrap px-7 text-[15px] lg:px-6 xl:px-7`}>
              How it works
            </Link>
          </div>
          <p className="mt-3.5 min-h-[20px] text-[13.5px] text-muted-foreground">
            {state === 'guest' ? (
              <>
                See real cases, guesstimates &amp; the dashboard — no account needed.{' '}
                <Link href={signupHref} className="font-semibold text-primary underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </>
            ) : (
              'Welcome back. Pick up where you left off.'
            )}
          </p>
        </div>
      );
    }
    if (variant === 'cta') {
      return (
        <div className="flex flex-col items-start gap-3 lg:items-center">
          {overlay}
          {busyOverlay}
          <button
            type="button"
            onClick={go}
            className={`${ED_PRIMARY} h-[54px] px-8 text-[15.5px] focus-visible:ring-offset-navy`}
          >
            {primaryLabel} <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
          <p className="text-[13.5px] text-white/75">
            {state === 'authed' ? 'Your dashboard is ready.' : 'Free to start. No account needed.'}
          </p>
        </div>
      );
    }
    /* nav */
    if (state === 'authed') {
      return (
        <>
          {overlay}
          <button type="button" onClick={() => navigate('/dashboard')} className={`${ED_PRIMARY} h-10 whitespace-nowrap px-5 text-[14px]`}>
            Open MECE
          </button>
        </>
      );
    }
    return (
      <>
        <Link
          href={loginHref}
          className="hidden h-10 items-center rounded-[8px] px-3 text-[14.5px] font-medium text-foreground/80 transition-colors hover:text-foreground sm:inline-flex"
        >
          Log in
        </Link>
        <Link href={signupHref} className={`${ED_PRIMARY} h-10 whitespace-nowrap px-5 text-[14px]`}>
          Sign up
        </Link>
      </>
    );
  }

  /* ── Hero variant ───────────────────────────────────────────────── */
  if (variant === 'hero') {
    return (
      <div>
        {overlay}
        {busyOverlay}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => (state === 'authed' ? navigate('/dashboard') : exploreAsGuest())}
            className={`${BIG_PRIMARY} justify-center`}
          >
            {state === 'authed' ? 'Open MECE' : 'Start your practice here'} <ArrowRight className="h-4 w-4" />
          </button>
          <Link href="/methodology" className="btn-ghost justify-center !py-3.5">
            How it works
          </Link>
        </div>
        {state === 'guest' && (
          <p className="mt-3 text-[12.5px] text-muted-foreground">
            See real cases, guesstimates &amp; the dashboard — no account needed.{' '}
            <Link href={signupHref} className="font-semibold text-primary hover:underline">
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
        {busyOverlay}
        <button type="button" onClick={exploreAsGuest} className={`${BIG_PRIMARY} w-fit`}>
          Start your practice here <ArrowRight className="h-4 w-4" />
        </button>
        <Link href={signupHref} className="text-[13px] font-medium text-white/70 hover:text-white underline underline-offset-2">
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
        href={loginHref}
        className="hidden sm:inline-block text-[15px] font-medium text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
      >
        Log in
      </Link>
      <Link href={signupHref} className="btn-primary text-sm md:text-[15px] py-1.5 px-4 md:py-2 md:px-6 whitespace-nowrap shadow-sm">
        Sign up
      </Link>
    </>
  );
}
