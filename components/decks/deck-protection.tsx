'use client';

import { useEffect, useState } from 'react';
import { EyeOff } from 'lucide-react';

/**
 * Copy deterrents for the public deck slides.
 *
 * READ THIS BEFORE TRUSTING IT.
 *
 * None of this PREVENTS a screenshot, and nothing on the web can. The operating
 * system captures the framebuffer before the browser is involved, and a phone
 * pointed at the monitor defeats every measure ever written. What follows raises
 * the effort of casual copying: right-click-save, drag-to-desktop, select-all,
 * Ctrl+P, and idly leaving a deck open on a shared screen.
 *
 * The measure that actually matters is the WATERMARK burned into the image
 * server-side, because it survives the screenshot and makes a leak traceable.
 * This component is the cheap layer on top of that, not a replacement for it.
 *
 * And the genuinely load-bearing protection is elsewhere entirely: locked slides
 * are never sent to the browser at all (403 from the image route). Everything
 * here applies only to the FREE preview slides, which are deliberately public so
 * Google can index them — so treat this as tidiness, not security.
 */
export default function DeckProtection({ children }: { children: React.ReactNode }) {
  const [obscured, setObscured] = useState(false);

  useEffect(() => {
    // Focus loss is the cheap proxy for "a capture tool just opened". Same
    // behaviour as the Pro DRM reader, so the two surfaces feel consistent.
    const hide = () => setObscured(true);
    const show = () => setObscured(false);

    const onVisibility = () => (document.visibilityState === 'hidden' ? hide() : show());

    function onKeyDown(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      // PrintScreen cannot be cancelled — the OS has already acted. Obscuring
      // on keydown means the NEXT capture is of a covered page, which is the
      // most that can honestly be claimed here.
      if (e.key === 'PrintScreen') {
        hide();
        return;
      }
      // Save / print / select-all / devtools-save shortcuts.
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'a'].includes(k)) {
        e.preventDefault();
        hide();
      }
      // macOS screenshot chords.
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(k)) {
        hide();
      }
    }

    window.addEventListener('blur', hide);
    window.addEventListener('focus', show);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('blur', hide);
      window.removeEventListener('focus', show);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div
      className="relative select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {/* Printing renders the slides as blank space. Trivial to defeat via a
          screenshot, but it stops the one-click "Save as PDF" path. */}
      <style>{`
        @media print {
          .deck-protect-area { visibility: hidden !important; }
          .deck-protect-area::after {
            content: 'Slides are available at mece.in';
            visibility: visible;
            display: block;
            text-align: center;
            padding: 2rem;
          }
        }
      `}</style>

      <div className="deck-protect-area">{children}</div>

      {obscured && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/95 backdrop-blur-md text-center">
          <EyeOff className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Slides hidden</p>
          <p className="text-xs text-muted-foreground">Click back into this window to continue reading.</p>
        </div>
      )}
    </div>
  );
}
