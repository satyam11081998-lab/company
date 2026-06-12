'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { href: '/learn/casebook/getting-started/what-it-tests', label: 'Free Casebook' },
  { href: '/#features', label: 'Features' },
  { href: '/#scoring', label: 'Scoring' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/pricing', label: 'Pricing' },
];

/**
 * Mobile-only nav menu for the marketing landing page. The desktop nav links
 * are `hidden md:flex`; this hamburger exposes the same links on small screens.
 * The panel is portaled to <body> so the nav's backdrop-blur / overflow-hidden
 * containing block cannot clip it.
 */
export default function LandingMobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="md:hidden flex items-center">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center h-10 w-10 -mr-2 rounded-md text-foreground hover:bg-muted transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[60] md:hidden">
            <div
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-x-0 top-0 bg-background border-b border-border shadow-xl animate-slide-up">
              <div className="container flex h-14 items-center justify-between">
                <span className="text-[15px] font-semibold text-foreground">Menu</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center h-10 w-10 -mr-2 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="container flex flex-col pb-4">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="py-3 text-[15px] font-medium text-foreground border-b border-border/60"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="py-3 text-[15px] font-medium text-muted-foreground"
                >
                  Login
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="mt-3">
                  <button className="btn-primary w-full justify-center">Get started</button>
                </Link>
              </nav>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
