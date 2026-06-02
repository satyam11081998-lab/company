import React from 'react';

interface CasebookSvgProps {
  svg: string;
  caption?: string;
  maxWidth?: number;
  ariaLabel?: string;
}

export function CasebookSvg({ svg, caption, maxWidth = 720, ariaLabel }: CasebookSvgProps) {
  /**
   * CasebookSvg renders trusted, first-party SVG markup authored in content files.
   *
   * COLOR CONVENTION (required for dark mode):
   * This project's design tokens are HSL CHANNEL values (e.g. --primary: 356 84% 43%).
   * Therefore ALL colors in authored SVG markup MUST be wrapped in hsl():
   *   fill="hsl(var(--card))"   stroke="hsl(var(--border))"   fill="hsl(var(--primary))"
   * Using bare var(--token) renders BLACK (invalid color). Pure #ffffff/#000000 are
   * allowed only where a color must stay fixed across themes (e.g. white text on red).
   */
  const resolvedMaxWidth = maxWidth === 0 ? '100%' : maxWidth;

  return (
    <figure 
      className="my-6 mx-auto w-full" 
      style={{ maxWidth: resolvedMaxWidth }}
    >
      <div 
        className="w-full overflow-hidden rounded-xl border border-border/50 bg-muted/10 shadow-sm"
      >
        <style>{`
          @keyframes diagramEnter {
            0% { opacity: 0; transform: scale(0.98) translateY(5px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-diagram {
            animation: diagramEnter 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-diagram {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
          }
        `}</style>
        <div
          className="w-full h-auto animate-diagram flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-w-full"
          {...(ariaLabel 
            ? { role: 'img', 'aria-label': ariaLabel } 
            : { 'aria-hidden': true }
          )}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-small text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
