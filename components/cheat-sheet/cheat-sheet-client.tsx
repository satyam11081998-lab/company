'use client';
import { useState } from 'react';
import type { CheatSheetItemRow } from '@/lib/types';
import { Trash2, StickyNote } from 'lucide-react';

function groupByTopic(items: CheatSheetItemRow[]) {
  const map = new Map<string, CheatSheetItemRow[]>();
  for (const it of items) {
    const key = it.source_topic?.trim() || 'Unsorted';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  return Array.from(map.entries());
}

export function CheatSheetClient({ initialItems }: { initialItems: CheatSheetItemRow[] }) {
  const [items, setItems] = useState<CheatSheetItemRow[]>(initialItems);

  async function remove(id: string) {
    const prev = items;
    setItems(items.filter((i) => i.id !== id));
    const res = await fetch(`/api/cheatsheet/${id}`, { method: 'DELETE' });
    if (!res.ok) setItems(prev);
  }
  async function saveNote(id: string, note: string) {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, note } : i)));
    await fetch(`/api/cheatsheet/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Nothing saved yet. Open a GD brief and tap “Add to cheat sheet” on any data point.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupByTopic(items).map(([topic, groupItems]) => (
        <section key={topic} className="rounded-lg border">
          <header className="border-b px-4 py-2 text-sm font-semibold">{topic}</header>
          <ul className="divide-y">
            {groupItems.map((it) => (
              <li key={it.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-relaxed">{it.content}</p>
                  <button onClick={() => remove(it.id)} aria-label="Remove"
                    className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <details className="mt-2">
                  <summary className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground">
                    <StickyNote className="h-3 w-3" /> Note
                  </summary>
                  <textarea defaultValue={it.note ?? ''} rows={2}
                    onBlur={(e) => saveNote(it.id, e.target.value)}
                    placeholder="Add a personal note…"
                    className="mt-2 w-full rounded-md border bg-transparent p-2 text-sm" />
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
