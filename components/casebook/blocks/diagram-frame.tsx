import React from 'react';
import { DIAGRAMS } from '../diagram-registry';

interface DiagramFrameProps {
  refId: string; // "ref" is a reserved prop in React, so we use refId
  caption?: string;
  maxWidth?: number;
}

export function DiagramFrameBlock({ refId, caption, maxWidth = 650 }: DiagramFrameProps) {
  const DiagramComponent = DIAGRAMS[refId];

  return (
    <figure className="my-6" style={{ maxWidth: maxWidth === 0 ? '100%' : maxWidth, margin: '1.5rem auto' }}>
      {DiagramComponent ? (
        <DiagramComponent />
      ) : (
        <div className="w-full h-[200px] bg-muted/20 border border-dashed border-border rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground text-small">Diagram in progress: <strong>{refId}</strong></p>
        </div>
      )}
      {caption && (
        <figcaption className="mt-3 text-center text-small text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
