import React from 'react';
import { parseInlineMd } from './prose';
import { Calculator } from 'lucide-react';

interface MathBoxProps {
  title?: string;
  md: string;
}

export function MathBoxBlock({ title, md }: MathBoxProps) {
  return (
    <div className="my-4 p-4 rounded-lg bg-navy/5 border border-navy/10 flex gap-4">
      <Calculator className="w-5 h-5 text-navy dark:text-navy-foreground mt-1 shrink-0" />
      <div className="flex-1">
        {title && <h4 className="text-strong text-navy dark:text-navy-foreground mb-2">{title}</h4>}
        <div className="font-mono-data text-body text-navy-mid dark:text-foreground/80 break-words leading-relaxed">
          {parseInlineMd(md)}
        </div>
      </div>
    </div>
  );
}
