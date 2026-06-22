'use client';

import React from 'react';
import { ExternalLink, Maximize2, Maximize, Minimize, ChevronLeft, X } from 'lucide-react';
import type { Primer } from '@/lib/primers';

interface PrimerEmbedProps {
  primer: Primer;
}

/**
 * Renders an Industry Primer inside the Casebook reader.
 *
 * The primer itself is a self-contained, fact-checked static page served from
 * /public/primers/<folder>/index.html. It is embedded in an isolated <iframe>
 * so its own CSS/fonts render exactly as designed and never collide with the
 * MECE app styles ("lands like that, no overlap"). Graphics are never touched.
 *
 * Two ways to get more room:
 *  - "Full screen" opens an in-app overlay (back button top-left) covering the
 *    whole viewport.
 *  - Inside the overlay, "Fullscreen" enters true native browser fullscreen via
 *    the Fullscreen API; ESC (or the same button) exits back to the overlay.
 *
 * Below the frame we render a horizontal strip of source links so anyone can
 * open the underlying documents the data is drawn from.
 */
export function PrimerEmbed({ primer }: PrimerEmbedProps) {
  const [overlay, setOverlay] = React.useState(false);
  const [nativeFs, setNativeFs] = React.useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const src = `/primers/${primer.folder}/index.html`;
  const frameTitle = `${primer.title} — Industry Primer`;

  // Lock background scroll while the in-app overlay is open.
  React.useEffect(() => {
    if (!overlay) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [overlay]);

  // Track native fullscreen so the toggle label/icon stays in sync.
  React.useEffect(() => {
    const onFsChange = () => setNativeFs(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ESC closes the in-app overlay (when not in native fullscreen — there the
  // browser consumes the first ESC to exit fullscreen).
  React.useEffect(() => {
    if (!overlay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) setOverlay(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay]);

  const toggleNativeFs = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (overlayRef.current) {
        await overlayRef.current.requestFullscreen();
      }
    } catch {
      /* fullscreen can be blocked by browser policy — fail silently */
    }
  };

  const closeOverlay = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore */
      }
    }
    setOverlay(false);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full rounded-xl overflow-hidden border border-border bg-background relative">
        <iframe
          src={src}
          title={frameTitle}
          loading="lazy"
          className="w-full border-none bg-background block"
          style={{ height: 'calc(100vh - 220px)', minHeight: 640 }}
        />
        <button
          type="button"
          onClick={() => setOverlay(true)}
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/90 backdrop-blur px-3 h-9 text-small font-medium text-foreground shadow-sm hover:bg-muted active:scale-95 transition"
        >
          <Maximize2 className="w-4 h-4 text-primary" /> Full screen
        </button>
      </div>

      {/* Horizontal source strip — where the data comes from */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Sources
        </span>
        {primer.sources.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-navy dark:text-navy-foreground hover:text-primary transition-colors border-b border-border hover:border-primary"
          >
            {s.label}
            <ExternalLink className="w-3 h-3" />
          </a>
        ))}
      </div>

      {/* In-app full-screen overlay */}
      {overlay && (
        <div ref={overlayRef} className="fixed inset-0 z-[60] bg-background flex flex-col">
          <div className="flex items-center justify-between gap-3 h-14 px-3 sm:px-4 border-b border-border bg-card shrink-0">
            <button
              type="button"
              onClick={closeOverlay}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 h-9 text-small font-medium text-foreground hover:bg-muted active:scale-95 transition"
            >
              <ChevronLeft className="w-4 h-4 text-primary" /> Back
            </button>
            <span className="hidden sm:block text-small font-semibold text-foreground truncate px-2">
              {frameTitle}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleNativeFs}
                aria-label={nativeFs ? 'Exit fullscreen' : 'Enter fullscreen'}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 h-9 text-small font-medium text-foreground hover:bg-muted active:scale-95 transition"
              >
                {nativeFs ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                <span className="hidden sm:inline">{nativeFs ? 'Exit' : 'Fullscreen'}</span>
              </button>
              <button
                type="button"
                onClick={closeOverlay}
                aria-label="Close full screen"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background text-foreground hover:bg-muted active:scale-95 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <iframe
            src={src}
            title={frameTitle}
            className="flex-1 w-full border-none bg-background block"
          />
        </div>
      )}
    </div>
  );
}
