'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/** Collapsible hint section on /cases/[id]. */
export default function HintToggle({ hint }: { hint: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="rounded-lg border border-primary/20 bg-accent">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-base font-semibold text-foreground"
      >
        <span>{isOpen ? 'Hide hint' : 'Show hint'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t border-primary/20 px-4 py-3 text-base leading-relaxed text-foreground/80">
          {hint}
        </div>
      )}
    </div>
  );
}
