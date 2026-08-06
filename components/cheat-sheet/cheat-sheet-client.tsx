'use client';
import { useMemo, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CheatsheetPointRow } from '@/lib/types';
import { Trash2, Menu, Download, Share2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import TierGate from '@/components/tier-gate';

type Item = CheatsheetPointRow;

const ALL = 'all';

export function CheatSheetClient({ ownerName }: { ownerName?: string | null } = {}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>(ALL);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

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

  const asPoints = () =>
    items.map((i) => ({ tag: i.tag, point_text: i.point_text, source: i.source }));

  async function handleDownloadPdf() {
    if (downloading) return;
    if (!items.length) return;
    setDownloading(true);
    try {
      const { downloadCheatSheetPdf } = await import('./cheat-sheet-pdf');
      // Stamp an existing share link into the footer so a downloaded copy
      // still points back to the live page.
      await downloadCheatSheetPdf(asPoints(), { shareUrl: shareUrl, ownerName });
    } catch (e) {
      console.error('cheat-sheet pdf failed', e);
    } finally {
      setDownloading(false);
    }
  }

  /**
   * Publish: render the branded PDF, upload it, then re-render ONCE more with
   * the minted link baked into the footer and replace the stored file. Two
   * renders is the honest cost of a self-referencing document — the alternative
   * is a PDF whose footer link points nowhere.
   */
  async function handleShare() {
    if (sharing || !items.length) return;
    setSharing(true);
    setShareError(null);
    try {
      const { buildCheatSheetPdf } = await import('./cheat-sheet-pdf');
      const draft = await buildCheatSheetPdf(asPoints(), { ownerName });

      const form = new FormData();
      form.append('file', new File([draft], 'cheat-sheet.pdf', { type: 'application/pdf' }));
      form.append('pointCount', String(items.length));

      const res = await fetch('/api/cheat-sheet/share', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Could not publish the sheet.');

      // Second pass: same document, now carrying its own public link.
      const final = await buildCheatSheetPdf(asPoints(), { shareUrl: json.url, ownerName });
      const replace = new FormData();
      replace.append('file', new File([final], 'cheat-sheet.pdf', { type: 'application/pdf' }));
      replace.append('id', json.id);
      await fetch('/api/cheat-sheet/share', { method: 'PUT', body: replace }).catch(() => {});

      setShareUrl(json.url);
      try { await navigator.clipboard?.writeText(json.url); } catch { /* clipboard is optional */ }
    } catch (e: any) {
      setShareError(e?.message || 'Could not publish the sheet.');
    } finally {
      setSharing(false);
    }
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

  // Export block reused by the desktop rail and the mobile drawer.
  const exportControls = (
    <div className="space-y-2">
      <button
        onClick={handleDownloadPdf}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-primary/10 text-primary px-3 py-2 text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-60"
      >
        <Download className="h-4 w-4" /> {downloading ? 'Generating…' : 'Download PDF'}
      </button>
      <button
        onClick={handleShare}
        disabled={sharing}
        className="w-full flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
      >
        <Share2 className="h-4 w-4" /> {sharing ? 'Publishing…' : shareUrl ? 'Re-publish' : 'Get shareable link'}
      </button>
      {shareUrl && (
        <div className="rounded-md border border-border bg-muted/40 p-2">
          <p className="text-[11px] text-muted-foreground">Link copied. Anyone can open this:</p>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-0.5 block break-all text-xs font-medium text-primary hover:underline"
          >
            {shareUrl}
          </a>
        </div>
      )}
      {shareError && <p className="text-xs text-destructive">{shareError}</p>}
    </div>
  );

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
            <TierGate required="pro">{exportControls}</TierGate>
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
                <TierGate required="pro">{exportControls}</TierGate>
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
