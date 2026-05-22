'use client';

import { useState, useMemo } from 'react';
import type { LearnContentRow } from '@/lib/types';
import { CASE_TYPES, CASE_TYPE_LABELS } from '@/lib/constants';
import { Card } from '@/components/ui/card';

/** Two-pane learn UI: left sidebar of case types, right pane with content. */
export default function LearnReader({ entries }: { entries: LearnContentRow[] }) {
  const [selectedType, setSelectedType] = useState<string>(CASE_TYPES[0]);

  const filtered = useMemo(() => {
    return entries
      .filter((e) => e.case_type === selectedType)
      .sort((a, b) => a.display_order - b.display_order);
  }, [entries, selectedType]);

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-1">
        {CASE_TYPES.map((type) => {
          const isActive = selectedType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-navy text-navy-foreground'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {CASE_TYPE_LABELS[type]}
            </button>
          );
        })}
      </aside>

      <div className="space-y-6">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">No content yet for this type.</p>
        ) : (
          filtered.map((entry) => (
            <Card key={entry.id} className="p-6">
              <h2 className="text-xl font-semibold text-slate-900">{entry.title}</h2>
              <div className="prose prose-slate mt-3 max-w-none whitespace-pre-line text-slate-700">
                {entry.body}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
