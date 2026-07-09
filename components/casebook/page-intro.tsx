'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface PageIntroProps {
  title: string;
  subtitle?: string;
  /** Everything that follows the headline (byline / EEAT signals, meta bar). */
  children?: React.ReactNode;
}

/**
 * Casebook page header.
 *
 * Desktop (lg+): unchanged — headline, dek, byline (EEAT), meta bar all visible.
 * Mobile: only the headline renders; the dek + byline + meta collapse behind a
 * "Read more" toggle so the actual case / guesstimate content starts within the
 * first screen instead of below a full screen of header chrome.
 */
export function PageIntro({ title, subtitle, children }: PageIntroProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`mb-6 lg:mb-0 ${open ? '' : 'border-b border-border pb-3 lg:border-0 lg:pb-0'}`}>
      <header className="mb-2 lg:mb-6">
        <h1 className="text-h1 text-foreground mb-1 lg:mb-4">{title}</h1>
        {subtitle && (
          <p
            className={`text-h3 font-normal text-muted-foreground leading-relaxed mt-2 lg:mt-0 ${
              open ? 'block' : 'hidden'
            } lg:block`}
          >
            {subtitle}
          </p>
        )}
      </header>

      {/* Byline + meta — collapsed on mobile until "Read more" */}
      <div className={`${open ? 'block' : 'hidden'} lg:block`}>{children}</div>

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="lg:hidden inline-flex items-center gap-1 text-small font-medium text-primary"
      >
        {open ? 'Show less' : 'Read more'}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}
