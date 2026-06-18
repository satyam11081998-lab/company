'use client';
import { useMemo, useState } from 'react';
import type { CheatSheetItemRow } from '@/lib/types';
import { CHEAT_DOMAINS, UNCATEGORIZED, domainMeta } from '@/lib/cheat-domains';
import { Trash2, StickyNote, X, Tag as TagIcon, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CategoryRail, type RailBucket } from './category-rail';

type Item = CheatSheetItemRow;

const ALL = 'all';

/** A point belongs to a real domain only if its id is in CHEAT_DOMAINS; else Uncategorized. */
function bucketOf(it: Item): string {
  return it.domain && CHEAT_DOMAINS.some((d) => d.id === it.domain) ? it.domain : UNCATEGORIZED.id;
}

export function CheatSheetClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(
    initialItems.map((i) => ({ ...i, tags: i.tags ?? [], domain: i.domain ?? null })),
  );
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string>(ALL);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Rail counts come from the FULL item set (pre-search) so they stay stable.
  const buckets: RailBucket[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) {
      const b = bucketOf(it);
      counts.set(b, (counts.get(b) ?? 0) + 1);
    }
    const out: RailBucket[] = [{ id: ALL, label: 'All points', accent: '', count: items.length }];
    for (const d of CHEAT_DOMAINS) {
      const c = counts.get(d.id) ?? 0;
      if (c > 0) out.push({ id: d.id, label: d.label, accent: d.accent, count: c });
    }
    const uncat = counts.get(UNCATEGORIZED.id) ?? 0;
    if (uncat > 0) out.push({ id: UNCATEGORIZED.id, label: UNCATEGORIZED.label, accent: UNCATEGORIZED.accent, count: uncat });
    return out;
  }, [items]);

  // Category filter first, then search.
  const visible = useMemo(() => {
    const byCat = active === ALL ? items : items.filter((it) => bucketOf(it) === active);
    const q = query.trim().toLowerCase();
    if (!q) return byCat;
    return byCat.filter(
      (i) =>
        i.content.toLowerCase().includes(q) ||
        (i.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (i.source_topic || '').toLowerCase().includes(q),
    );
  }, [items, active, query]);

  const activeMeta =
    active === ALL
      ? { label: 'All points', accent: '' }
      : active === UNCATEGORIZED.id
        ? UNCATEGORIZED
        : domainMeta(active);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Nothing saved yet. Open a GD brief and tap the <span className="text-primary">★</span> on any data point to save it here.
      </div>
    );
  }

  const rail = (
    <CategoryRail
      buckets={buckets}
      active={active}
      onSelect={setActive}
      query={query}
      onQuery={setQuery}
      onAfterSelect={() => setDrawerOpen(false)}
    />
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-0 lg:gap-6">
      {/* Left rail (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden rounded-xl border border-border bg-card/50">
          {rail}
        </div>
      </aside>

      {/* Right content */}
      <main className="min-w-0">
        {/* Mobile: open rail in a drawer */}
        <div className="mb-4 flex items-center gap-3 lg:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium">
              <Menu className="h-4 w-4" /> Categories
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              {rail}
            </SheetContent>
          </Sheet>
          <span className="text-sm text-muted-foreground">
            {activeMeta.label} · {visible.length}
          </span>
        </div>

        {/* Desktop header for the active category */}
        <div className="mb-3 hidden items-center gap-2.5 lg:flex">
          {active !== ALL && (activeMeta as { accent?: string }).accent ? (
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: (activeMeta as { accent: string }).accent }} />
          ) : null}
          <h2 className="text-sm font-semibold text-foreground">{activeMeta.label}</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{visible.length}</span>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            {query.trim()
              ? <>No points match &ldquo;{query}&rdquo;.</>
              : <>No points in {activeMeta.label} yet.</>}
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((it) => (
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
      </main>
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
