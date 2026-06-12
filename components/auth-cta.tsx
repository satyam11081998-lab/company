'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight } from 'lucide-react';

type Variant = 'hero' | 'nav' | 'cta';

interface AuthCTAProps {
  variant?: Variant;
}

/**
 * Client-side auth CTA — checks Supabase auth state on mount and renders
 * the appropriate call-to-action buttons. Shows a skeleton placeholder
 * while loading to prevent CLS.
 *
 * Variants:
 *   - hero: "Start now" / "Open MECE" with ArrowRight icon (primary button)
 *   - nav:  "Login" + "Get started" / "Open MECE" (nav bar buttons)
 *   - cta:  "Get started" / "Open MECE" (primary button, no icon)
 */
export default function AuthCTA({ variant = 'nav' }: AuthCTAProps) {
  const [state, setState] = useState<'loading' | 'authed' | 'guest'>('loading');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setState(user ? 'authed' : 'guest');
    });
  }, []);

  /* ── Loading skeleton ────────────────────────────────────────────── */
  if (state === 'loading') {
    if (variant === 'hero') {
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 rounded-full bg-muted animate-pulse" />
          <div className="h-10 w-28 rounded-full bg-muted animate-pulse" />
        </div>
      );
    }
    if (variant === 'cta') {
      return <div className="h-10 w-36 rounded-full bg-muted animate-pulse" />;
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
      <div className="flex items-center gap-3">
        <Link href={state === 'authed' ? '/dashboard' : '/signup'}>
          <button className="btn-primary">
            {state === 'authed' ? 'Open MECE' : 'Start now'} <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
        <Link href="/methodology">
          <button className="btn-ghost">
            How it works
          </button>
        </Link>
      </div>
    );
  }

  /* ── CTA variant ────────────────────────────────────────────────── */
  if (variant === 'cta') {
    return state === 'authed' ? (
      <Link href="/dashboard">
        <button className="btn-primary">Open MECE</button>
      </Link>
    ) : (
      <Link href="/signup">
        <button className="btn-primary">Get started</button>
      </Link>
    );
  }

  /* ── Nav variant (default) ──────────────────────────────────────── */
  if (state === 'authed') {
    return (
      <Link href="/dashboard">
        <button className="btn-primary text-sm md:text-[15px] py-1.5 px-3 md:py-2 md:px-6 whitespace-nowrap">
          Open MECE
        </button>
      </Link>
    );
  }

  return (
    <>
      <Link href="/login" className="hidden sm:block">
        <button className="text-[15px] font-medium text-muted-foreground hover:text-foreground px-4 py-2 transition-colors">
          Login
        </button>
      </Link>
      <Link href="/signup">
        <button className="btn-primary text-sm md:text-[15px] py-1.5 px-4 md:py-2 md:px-6 whitespace-nowrap">
          Get started
        </button>
      </Link>
    </>
  );
}
