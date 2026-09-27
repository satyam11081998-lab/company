'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import UsLogo from '@/components/us/brand';
import ThemeButton from '@/components/us/theme-button';
import { usButton } from '@/components/us/ui';
import { useUsEntry } from '@/components/us/use-us-entry';

/**
 * US marketing navigation (68px, quiet). Links go only to surfaces a US
 * visitor can actually use — the India-only learning tracks are not linked
 * (they are refused for US accounts server-side, see lib/market.ts).
 */
export const US_MARKETING_NAV = [
  { href: '/practice', label: 'Practice' },
  { href: '/us/case-interview-examples', label: 'Case examples' },
  { href: '/us/market-sizing-questions', label: 'Market sizing' },
  { href: '/us#method', label: 'Method' },
  { href: '/us/pricing', label: 'Pricing' },
];

export default function UsHeader() {
  const pathname = usePathname() || '';
  const { state, navigate, overlays } = useUsEntry();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) => !href.includes('#') && (pathname === href || pathname.startsWith(href + '/'));
  const next = pathname && pathname !== '/login' && pathname !== '/signup' ? `?next=${encodeURIComponent(pathname)}` : '';
  const signedIn = state === 'member' || state === 'guest';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      {overlays}
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/us" aria-label="MECE, Method for Evaluating Corporate Excellence: home" className="flex shrink-0 items-center rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
          <UsLogo size="sm" taglineOnPhones className="max-[374px]:hidden sm:hidden" />
          <UsLogo size="sm" tagline={false} className="min-[375px]:hidden" />
          <UsLogo className="hidden sm:inline-flex" />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {US_MARKETING_NAV.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={`relative rounded-[6px] px-3 py-2 text-[14.5px] font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {l.label}
                {active && <span aria-hidden className="absolute inset-x-3 -bottom-[17px] h-[2px] rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeButton />
          {signedIn ? (
            <button type="button" onClick={() => navigate('/dashboard')} className={usButton('primary', 'sm', 'hidden sm:inline-flex')}>
              {state === 'guest' ? 'Continue practicing' : 'Open dashboard'}
            </button>
          ) : (
            <>
              <Link href={`/login${next}`} className={usButton('secondary', 'sm', 'hidden sm:inline-flex')}>
                Log in
              </Link>
              <Link href={`/signup${next}`} className={usButton('primary', 'sm', 'hidden sm:inline-flex')}>
                Get started
              </Link>
            </>
          )}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="us-mobile-menu"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mounted &&
        open &&
        createPortal(
          <div id="us-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-navy/40" onClick={() => setOpen(false)} />
            <div className="absolute inset-x-0 top-0 border-b border-border bg-background shadow-xl">
              <div className="flex h-[72px] items-center justify-between px-4">
                <UsLogo taglineOnPhones />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav aria-label="Main" className="flex flex-col px-4 pb-5">
                {US_MARKETING_NAV.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-border py-3.5 text-[16px] font-medium text-foreground">
                    {l.label}
                  </Link>
                ))}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {signedIn ? (
                    <button type="button" onClick={() => navigate('/dashboard')} className={usButton('primary', 'md', 'col-span-2')}>
                      {state === 'guest' ? 'Continue practicing' : 'Open dashboard'}
                    </button>
                  ) : (
                    <>
                      <Link href={`/login${next}`} className={usButton('secondary', 'md')}>Log in</Link>
                      <Link href={`/signup${next}`} className={usButton('primary', 'md')}>Get started</Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
