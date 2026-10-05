'use client';

/**
 * The two interactive bits of an Insights article: a hairline reading-progress bar and the
 * share row (copy link, WhatsApp, LinkedIn, X). Everything else on the page is server-rendered.
 */

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Check, Link2, Moon, Sun } from 'lucide-react';

/** Light / dark switch for the reading pages (works on the black stage and on paper). */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className={`inline-block h-9 w-9 ${className}`} aria-hidden />;
  const dark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${className}`}
    >
      {dark ? <Sun className="h-[17px] w-[17px]" strokeWidth={1.8} /> : <Moon className="h-[17px] w-[17px]" strokeWidth={1.8} />}
    </button>
  );
}

export function ReadingProgress({ color }: { color: string }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = document.getElementById('insight-body');
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setP(Math.min(1, Math.max(0, -r.top / Math.max(1, total))));
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[3px]" aria-hidden>
      <div className="h-full origin-left transition-transform duration-150" style={{ backgroundColor: color, transform: `scaleX(${p})` }} />
    </div>
  );
}

export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: 'X', href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}` },
  ];
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked: the links still work */ }
  }
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-[0.78rem] font-medium uppercase tracking-[0.12em] text-neutral-500">
      <span className="text-neutral-400">Share</span>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100">
          {l.label}
        </a>
      ))}
      <button type="button" onClick={copy} className="inline-flex items-center gap-1 uppercase hover:text-neutral-900 dark:hover:text-neutral-100">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
