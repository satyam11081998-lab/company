'use client';

import { Search } from 'lucide-react';

export interface RailBucket {
  id: string;
  label: string;
  accent: string;
  count: number;
}

interface CategoryRailProps {
  buckets: RailBucket[];
  active: string;
  onSelect: (id: string) => void;
  query: string;
  onQuery: (q: string) => void;
  /** Called after a selection — used to close the mobile drawer. */
  onAfterSelect?: () => void;
}

/**
 * Left category rail for the Cheat Sheet, mirroring the Learn/Casebook reader
 * nav. Presentational only: parent owns `active`, counts, and filtering.
 */
export function CategoryRail({
  buckets,
  active,
  onSelect,
  query,
  onQuery,
  onAfterSelect,
}: CategoryRailProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search points and tags…"
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categories */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {buckets.map((b) => {
          const isActive = b.id === active;
          return (
            <button
              key={b.id}
              onClick={() => {
                onSelect(b.id);
                onAfterSelect?.();
              }}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                isActive
                  ? 'bg-muted font-semibold text-navy'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              }`}
            >
              {b.id === 'all' ? (
                <span className="h-2.5 w-2.5 rounded-sm border border-muted-foreground/50" />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.accent }} />
              )}
              <span className="flex-1 truncate">{b.label}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {b.count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
