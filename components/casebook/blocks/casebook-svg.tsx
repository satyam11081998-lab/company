import React from 'react';

interface CasebookSvgProps {
  svg: string;
  caption?: string;
  maxWidth?: number;
  ariaLabel?: string;
}

export function CasebookSvg({ svg, caption, maxWidth = 720, ariaLabel }: CasebookSvgProps) {
  // Authored SVGs must use var(--token) for colors (fills/strokes) to inherit light/dark mode themes cascade-wise.
  // Note: The raw SVG string is trusted, first-party content only.
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
          className="w-full h-auto animate-diagram flex items-center justify-center"
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
