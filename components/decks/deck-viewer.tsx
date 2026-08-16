'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Lock, EyeOff, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Slide viewer for a public deck page.
 *
 * Replaces a vertical list that rendered EVERY slide as its own card — 3 real
 * slides followed by 37 identical lock placeholders. That buried the summary,
 * made the page enormous, and repeated the same "locked" message dozens of
 * times instead of stating the one fact that actually sells: this deck has 40
 * slides and you can see 3.
 *
 * SEO: every free slide <img> is rendered into the server HTML and merely
 * HIDDEN with CSS when not active. A crawler therefore sees all of them with
 * their alt text; only the human navigates. Conditionally rendering the active
 * slide would have made the other previews invisible to Google, which is the
 * entire reason these pages exist.
 *
 * SECURITY: locked slides have no <img> and no URL here — the lock panel is
 * drawn, not a blurred image. The real gate is server-side: the image route
 * returns 403 past the free limit, so there is nothing to reveal in DevTools.
 */
export default function DeckViewer({
  slug,
  title,
  pageCount,
  freePages,
}: {
  slug: string;
  title: string;
  pageCount: number;
  freePages: number;
}) {
  // 1-indexed slide number. Can exceed freePages — that is the locked state.
  const [current, setCurrent] = useState(1);
  const [obscured, setObscured] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  // Fullscreen is driven by the BROWSER's state, not a local boolean, because
  // the user can leave via Escape or the OS chrome without touching our button.
  // Keying the label off `document.fullscreenElement` keeps them in sync.
  useEffect(() => {
    const sync = () => setIsFull(document.fullscreenElement === shellRef.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await shellRef.current?.requestFullscreen();
      }
    } catch {
      // Fullscreen can be refused (iOS Safari has no element fullscreen).
      // Failing silently is right: the deck is still perfectly usable inline.
    }
  }, []);

  const isLocked = current > freePages;
  const go = useCallback(
    (n: number) => setCurrent(Math.min(pageCount, Math.max(1, n))),
    [pageCount],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') go(current - 1);
      if (e.key === 'ArrowRight') go(current + 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, go]);

  // Copy deterrents. Not prevention — a screenshot cannot be blocked by any
  // website. The watermark burned into the image server-side is what survives a
  // capture; this only raises the effort of casual copying.
  useEffect(() => {
    const hide = () => setObscured(true);
    const show = () => setObscured(false);
    const onVis = () => (document.visibilityState === 'hidden' ? hide() : show());
    function onKeyDown(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if (e.key === 'PrintScreen') return hide();
      if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(k)) {
        e.preventDefault();
        hide();
      }
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(k)) hide();
    }
    window.addEventListener('blur', hide);
    window.addEventListener('focus', show);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('blur', hide);
      window.removeEventListener('focus', show);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div
      className="select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      <style>{`@media print { .deck-stage { visibility: hidden !important; } }`}</style>

      <div
        ref={shellRef}
        className={`border border-border bg-card shadow-sm overflow-hidden ${
          isFull ? "flex h-screen w-screen flex-col rounded-none" : "rounded-2xl"
        }`}
      >
        {/* Bar states the ONE number that matters: how much deck exists. */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
          <span className="text-sm font-medium text-foreground tabular-nums">
            Slide {current} <span className="text-muted-foreground">of {pageCount}</span>
          </span>
          <div className="flex items-center gap-2">
            {isLocked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Lock className="h-3 w-3" /> Pro
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                Free preview
              </span>
            )}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFull ? 'Exit full screen' : 'View full screen'}
              title={isFull ? 'Exit full screen' : 'View full screen'}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {isFull ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div
          className={`deck-stage relative w-full bg-muted ${
            isFull ? "flex-1 min-h-0" : "aspect-[16/9]"
          }`}
        >
          {/* deck-free-preview: matches the JSON-LD isAccessibleForFree selector */}
          <div className="deck-free-preview absolute inset-0">
            {Array.from({ length: Math.min(freePages, pageCount) }, (_, i) => i + 1).map((n) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={n}
                src={`/api/decks/${slug}/page/${n}`}
                alt={`${title} slide ${n} of ${pageCount}`}
                loading={n === 1 ? 'eager' : 'lazy'}
                draggable={false}
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-150 ${
                  n === current && !isLocked ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              />
            ))}
          </div>

          {isLocked && (
            <div className="deck-locked-paywall absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/40 px-6 text-center">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0 2px, transparent 2px 10px)' }}
              />
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-primary">
                <Lock className="h-5 w-5" />
              </span>
              <div className="relative z-10 space-y-1">
                <p className="text-base font-semibold text-foreground">
                  Slides {freePages + 1}&ndash;{pageCount} are Pro
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {pageCount - freePages} more slides in this deck, plus every other winning deck in the Vault.
                </p>
              </div>
              <Link href="/upgrade?from=deck" className="relative z-10">
                <Button size="sm" className="gap-1.5">
                  Unlock with Pro <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          )}

          {obscured && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-background/95 backdrop-blur-md text-center">
              <EyeOff className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Slides hidden</p>
              <p className="text-xs text-muted-foreground">Click back into this window to continue.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/20 px-3 py-2.5">
          <Button variant="outline" size="sm" onClick={() => go(current - 1)} disabled={current <= 1} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>

          {/* Progress pips: free slides filled, locked ones outlined, so the
              proportion behind the paywall is visible at a glance. Capped so a
              60-slide deck does not render 60 dots. */}
          <div className="flex items-center gap-1 overflow-hidden">
            {Array.from({ length: Math.min(pageCount, 24) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`Go to slide ${n}`}
                onClick={() => go(n)}
                className={`h-1.5 rounded-full transition-all ${
                  n === current ? 'w-4 bg-primary' : n <= freePages ? 'w-1.5 bg-muted-foreground/40' : 'w-1.5 bg-muted-foreground/15'
                }`}
              />
            ))}
            {pageCount > 24 && <span className="ml-1 text-xs text-muted-foreground">+{pageCount - 24}</span>}
          </div>

          <Button variant="outline" size="sm" onClick={() => go(current + 1)} disabled={current >= pageCount} className="gap-1">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
