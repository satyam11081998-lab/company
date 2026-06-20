'use client';
import { useMemo, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CheatsheetPointRow } from '@/lib/types';
import { Trash2, Menu, Download } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import TierGate from '@/components/tier-gate';

type Item = CheatsheetPointRow;

const ALL = 'all';

export function CheatSheetClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>(ALL);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchPoints() {
      const { data, error } = await supabase
        .from('cheatsheet_points')
        .select('*')
        .order('tag_norm', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (!error && data) setItems(data as Item[]);
      setLoading(false);
    }
    fetchPoints();
  }, [supabase]);

  async function remove(id: string) {
    const prev = items;
    setItems(items.filter((i) => i.id !== id));
    const { error } = await supabase.from('cheatsheet_points').delete().eq('id', id);
    if (error) setItems(prev);
  }

  // Print function: open new window, render HTML, print
  function handlePrint() {
    const w = window.open('', '_blank');
    if (!w) return;
    
    // Group items
    const grouped = new Map<string, Item[]>();
    for (const it of items) {
      if (!grouped.has(it.tag)) grouped.set(it.tag, []);
      grouped.get(it.tag)!.push(it);
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cheat Sheet</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #111; max-width: 800px; margin: 0 auto; padding: 2rem; }
          h1 { border-bottom: 2px solid #eaeaea; padding-bottom: 0.5rem; margin-bottom: 2rem; }
          h2 { color: #444; margin-top: 2.5rem; text-transform: capitalize; }
          .point { margin-bottom: 1rem; padding: 1rem; border-left: 3px solid #ccc; background: #fafafa; page-break-inside: avoid; }
          .source { font-size: 0.85rem; color: #666; margin-top: 0.5rem; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>My Cheat Sheet</h1>
        ${Array.from(grouped.entries()).sort((a,b) => a[0].localeCompare(b[0])).map(([tag, pts]) => `
          <h2>${tag}</h2>
          ${pts.map(p => `
            <div class="point">
              <div>${p.point_text}</div>
              ${p.source ? `<div class="source">from "${p.source}"</div>` : ''}
            </div>
          `).join('')}
        `).join('')}
        <script>
          window.onload = () => { window.print(); };
        </script>
      </body>
      </html>
    `;
    w.document.write(html);
    w.document.close();
  }

  const buckets = useMemo(() => {
    const counts = new Map<string, number>();
    const originalTags = new Map<string, string>(); // tag_norm -> original case
    for (const it of items) {
      counts.set(it.tag_norm, (counts.get(it.tag_norm) ?? 0) + 1);
      if (!originalTags.has(it.tag_norm)) originalTags.set(it.tag_norm, it.tag);
    }
    const out = [{ id: ALL, label: 'All points', count: items.length }];
    for (const [norm, count] of counts.entries()) {
      out.push({ id: norm, label: originalTags.get(norm)!, count });
    }
    return out.sort((a, b) => a.id === ALL ? -1 : b.id === ALL ? 1 : a.id.localeCompare(b.id));
  }, [items]);

  const visible = useMemo(() => {
    if (active === ALL) return items;
    return items.filter((it) => it.tag_norm === active);
  }, [items, active]);

  if (loading) {
    return <div className="py-10 text-center text-muted-foreground">Loading cheat sheet...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Nothing saved yet. Open a GD brief and tap the <span className="text-primary">★</span> on any data point to save it here.
      </div>
    );
  }

  const activeLabel = buckets.find(b => b.id === active)?.label ?? 'All points';

  const rail = (
    <div className="flex flex-col py-2">
      {buckets.map((b) => (
        <button
          key={b.id}
          onClick={() => { setActive(b.id); setDrawerOpen(false); }}
          className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted/50 ${active === b.id ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground'}`}
        >
          <span className="truncate">{b.label}</span>
          <span className="ml-2 rounded-full bg-background/50 px-2 py-0.5 text-xs">{b.count}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-0 lg:gap-6">
      {/* Left rail (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden rounded-xl border border-border bg-card/50 flex flex-col">
          <div className="p-3 border-b border-border bg-card">
            <TierGate required="pro">
              <button 
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-primary/10 text-primary px-3 py-2 text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </TierGate>
          </div>
          <div className="overflow-y-auto">
            {rail}
          </div>
        </div>
      </aside>

      {/* Right content */}
      <main className="min-w-0">
        {/* Mobile header / drawer */}
        <div className="mb-4 flex items-center gap-3 lg:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium">
              <Menu className="h-4 w-4" /> Categories
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
              <div className="p-4 border-b border-border">
                <TierGate required="pro">
                  <button 
                    onClick={handlePrint}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-primary/10 text-primary px-3 py-2 text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                </TierGate>
              </div>
              <div className="overflow-y-auto flex-1">
                {rail}
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-sm text-muted-foreground">
            {activeLabel} · {visible.length}
          </span>
        </div>

        <div className="mb-3 hidden items-center gap-2.5 lg:flex">
          <h2 className="text-sm font-semibold text-foreground">{activeLabel}</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{visible.length}</span>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No points in {activeLabel} yet.
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((it) => (
              <div key={it.id} className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                        {it.tag}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{it.point_text}</p>
                    {it.source ? (
                      <p className="text-xs text-muted-foreground mt-2">from &ldquo;{it.source}&rdquo;</p>
                    ) : null}
                  </div>
                  <button onClick={() => remove(it.id)} aria-label="Remove" className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
