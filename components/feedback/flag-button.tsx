'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { FeedbackPanel } from './feedback-panel';
import type { FeedbackCategory } from '@/lib/types';

interface FlagButtonProps {
  /** What is being flagged, e.g. 'gd_brief_data_point' | 'casebook_page' | 'case'. */
  entityType: string;
  /** Stable id of the thing being flagged (brief id, page slug, case id). */
  entityId: string;
  /** Defaults to 'data_discrepancy'; pass 'stale_data' etc. where it fits. */
  defaultCategory?: FeedbackCategory;
  /** Compact icon-only vs. text. */
  label?: string;
  className?: string;
}

/**
 * Inline "flag this" affordance. Opens the SAME feedback panel as the global
 * launcher, pre-filled with category + entity context so the report is
 * immediately actionable. Drop next to any data surface.
 *
 * NOTE (handoff Phase 3 — ASK-FIRST): mounting this inside files owned by other
 * brains (GD briefs = brain B, casebook = brain C) needs their sign-off. The
 * component itself is self-contained and safe to ship unmounted.
 */
export function FlagButton({
  entityType,
  entityId,
  defaultCategory = 'data_discrepancy',
  label = 'Flag',
  className = '',
}: FlagButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Flag this ${entityType.replace(/_/g, ' ')}`}
        className={`inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive ${className}`}
      >
        <Flag className="h-3.5 w-3.5" />
        {label ? <span>{label}</span> : null}
      </button>

      <FeedbackPanel
        open={open}
        onClose={() => setOpen(false)}
        defaultCategory={defaultCategory}
        context={{ entity_type: entityType, entity_id: entityId }}
      />
    </>
  );
}

export default FlagButton;
