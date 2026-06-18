'use client';
import { useMemo, useState } from 'react';
import type { CheatSheetItemRow } from '@/lib/types';
import { CHEAT_DOMAINS, UNCATEGORIZED, domainMeta } from '@/lib/cheat-domains';
import { Trash2, StickyNote, ChevronDown, Search, X, Tag as TagIcon } from 'lucide-react';

type Item = CheatSheetItemRow;

const ALL_BUCKETS: string[] = [...CHEAT_DOMAINS.map((d) => d.id), UNCATEGORIZED.id];

export function CheatSheetClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(
    initialItems.map((i) => ({ ...i, tags: i.tags ?? [], domain: i.domain ?? null })),
  );
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function patch(id: string, body: Record<string, unknown>) {
    return fetch(`/api/cheatsheet/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async function remove(id: string) {
    const prev = items;
    setItems(items.filter((i) => i.id !== id));
    const res = await fetch(`/api/cheatsheet/${id}`, { method: 'DELETE' });
    if (!res.ok) setItems(prev);
  }

  function setDomain(id: string, domain: string | null) {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, domain } : i)));
    patch(id, { domain });
  }
  function setTags(id: string, tags: string[]) {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, tags } : i)));
    patch(id, { tags });
  }
  function saveNote(id: string, note: string) {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, note } : i)));
    patch(id, { note });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.content.toLowerCase().includes(q) ||
        (i.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (i.source_topic || '').toLowerCase().includes(q),
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const it of filtered) {
      const key = it.domain && CHEAT_DOMAINS.some((d) => d.id === it.domain) ? it.domain : UNCATEGORIZED.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return ALL_BUCKETS.filter((b) => map.has(b)).map((b) => [b, map.get(b)!] as const);
  }, [filtered]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Nothing saved yet. Open a GD brief and tap the <span className="text-primary">★</span> on any data point to save it here.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search toolbar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search points and tags…"
          className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No points match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        grouped.map(([bucket, list]) => {
          const meta = bucket === UNCATEGORIZED.id ? UNCATEGORIZED : domainMeta(bucket);
          const isCollapsed = collapsed.has(bucket);
          return (
            <section key={bucket} className="overflow-hidden rounded-xl border border-border bg-card">
              <button
                onClick={() =>
                  setCollapsed((s) => {
                    const n = new Set(s);
                    if (n.has(bucket)) n.delete(bucket);
                    else n.add(bucket);
                    return n;
                  })
                }
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/40"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.accent }} />
                <span className="text-sm font-semibold text-foreground">{meta.label}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{list.length}</span>
                <ChevronDown
                  className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                />
              </button>
              {!isCollapsed && (
                <div className="space-y-2 border-t border-border p-3">
                  {list.map((it) => (
                    <ItemCard
                      key={it.id}
                      item={it}
                      onDomain={(d) => setDomain(it.id, d)}
                      onTags={(t) => setTags(it.id, t)}
                      onNote={(n) => saveNote(it.id, n)}
                      onRemove={() => remove(it.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}

function ItemCard({
  item,
  onDomain,
  onTags,
  onNote,
  onRemove,
}: {
  item: Item;
  onDomain: (d: string | null) => void;
  onTags: (t: string[]) => void;
  onNote: (n: string) => void;
  onRemove: () => void;
}) {
  const [tagInput, setTagInput] = useState('');
  const [noteOpen, setNoteOpen] = useState(!!item.note);
  const tags = item.tags || [];

  function addTag() {
    const t = tagInput.trim().slice(0, 40);
    if (!t || tags.includes(t) || tags.length >= 12) {
      setTagInput('');
      return;
    }
    onTags([...tags, t]);
    setTagInput('');
  }

  return (
    <div className="rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed text-foreground">{item.content}</p>
        <button onClick={onRemove} aria-label="Remove" className="shrink-0 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {item.source_topic ? (
        <p className="mt-1 truncate text-xs text-muted-foreground">from &ldquo;{item.source_topic}&rdquo;</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={item.domain ?? ''}
          onChange={(e) => onDomain(e.target.value || null)}
          aria-label="Domain"
          className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">Uncategorized</option>
          {CHEAT_DOMAINS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>

        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
            {t}
            <button onClick={() => onTags(tags.filter((x) => x !== t))} aria-label={`Remove tag ${t}`} className="text-muted-foreground hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground">
          <TagIcon className="h-3 w-3" />
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            onBlur={addTag}
            placeholder="tag"
            className="w-12 bg-transparent text-xs transition-all focus:w-24 focus:outline-none"
          />
        </span>

        <button
          onClick={() => setNoteOpen((v) => !v)}
          className={`ml-auto inline-flex items-center gap-1 text-xs ${
            noteOpen || item.note ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <StickyNote className="h-3.5 w-3.5" /> Note
        </button>
      </div>

      {noteOpen && (
        <textarea
          defaultValue={item.note ?? ''}
          rows={2}
          onBlur={(e) => onNote(e.target.value)}
          placeholder="Add a personal note…"
          className="mt-2 w-full rounded-md border border-border bg-transparent p-2 text-sm focus:border-primary focus:outline-none"
        />
      )}
    </div>
  );
}
