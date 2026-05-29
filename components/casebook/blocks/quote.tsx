import React from 'react';
import { parseInlineMd } from './prose';
import { QuoteIcon } from 'lucide-react';

interface QuoteProps {
  md: string;
  attribution?: string;
}

export function QuoteBlock({ md, attribution }: QuoteProps) {
  return (
    <blockquote className="my-6 relative pl-8 border-l-4 border-primary/30">
      <QuoteIcon className="absolute left-1 top-0 w-5 h-5 text-primary/20 rotate-180" />
      <p className="text-h3 font-normal italic text-foreground/80 mb-3">
        "{parseInlineMd(md)}"
      </p>
      {attribution && (
        <footer className="text-body font-medium text-navy">
          — {attribution}
        </footer>
      )}
    </blockquote>
  );
}
