'use client';

import { useState } from 'react';
import type { GdBriefRow } from '@/lib/types';
import { ChevronDown, ExternalLink } from 'lucide-react';

/** Single expandable GD brief card. */
export default function GdBriefCard({ brief }: { brief: GdBriefRow }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ui-card rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 p-6 text-left"
      >
        <div>
          <p className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
            {new Date(brief.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">{brief.topic}</h2>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">{brief.summary}</p>
        </div>
        <ChevronDown className={`mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="space-y-6 border-t border-border bg-muted p-6">
          <BriefSection title="Points for" items={brief.points_for} accent="emerald" />
          <BriefSection title="Points against" items={brief.points_against} accent="rose" />
          <BriefSection title="Smart angles" items={brief.smart_angles} accent="amber" />
          <BriefSection title="Data points" items={brief.data_points} accent="slate" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-base font-semibold uppercase tracking-wide text-muted-foreground">How to open</p>
              <p className="mt-2 text-base leading-relaxed text-foreground/80">{brief.how_to_open}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-base font-semibold uppercase tracking-wide text-muted-foreground">How to close</p>
              <p className="mt-2 text-base leading-relaxed text-foreground/80">{brief.how_to_close}</p>
            </div>
          </div>
          {brief.source_url && (
            <a href={brief.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-base font-medium text-primary hover:underline">
              Read the source article <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

const ACCENTS: Record<string, string> = {
  emerald: 'border-emerald-200 bg-emerald-50',
  rose: 'border-rose-200 bg-rose-50',
  amber: 'border-primary/20 bg-accent',
  slate: 'border-border bg-card',
};

/** Bullet-list section inside an expanded brief. */
function BriefSection({ title, items, accent }: { title: string; items: string[]; accent: keyof typeof ACCENTS | string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={`rounded-xl border p-4 ${ACCENTS[accent] || ACCENTS.slate}`}>
      <p className="text-base font-semibold uppercase tracking-wide text-foreground/80">{title}</p>
      <ul className="mt-2 space-y-1.5 text-base text-foreground/80">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2"><span>•</span><span>{item}</span></li>
        ))}
      </ul>
    </div>
  );
}
