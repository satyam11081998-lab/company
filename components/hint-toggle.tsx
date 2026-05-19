'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/** Collapsible hint section on /cases/[id]. */
export default function HintToggle({ hint }: { hint: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-amber-900"
      >
        <span>{isOpen ? 'Hide hint' : 'Show hint'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t border-amber-200 px-4 py-3 text-sm leading-relaxed text-slate-700">
          {hint}
        </div>
      )}
    </div>
  );
}
