'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Quote as QuoteIcon, Lightbulb } from 'lucide-react';
import { pickRotation, type LoadingItem } from '@/lib/loading-content';

/** Stable per-day seed so the rotation order feels fresh each day, no backend. */
function todaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/**
 * Shows a rotating curated business quote / fact while something loads, so the
 * wait stays engaging. `fullscreen` centres in the viewport; `inline` is a
 * compact block that drops into a card or chat thread.
 */
export default function EngagingLoader({
  label = 'Loading…',
  variant = 'fullscreen',
  intervalMs = 5000,
}: {
  label?: string;
  variant?: 'fullscreen' | 'inline';
  intervalMs?: number;
}) {
  const items = useMemo(() => pickRotation(todaySeed()), []);
  // Start at 0 for SSR-safe hydration; randomise + rotate after mount.
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    setIdx(Math.floor(Math.random() * items.length));
    if (items.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % items.length), intervalMs);
    return () => clearInterval(id);
  }, [items.length, intervalMs]);

  const item = items[idx % items.length] ?? items[0];
  if (!item) return null;

  const body = (
    <div className="w-full max-w-md">
      <div className="mb-4 flex items-center justify-center gap-2 text-small text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>{label}</span>
      </div>
      <LoaderCard item={item} />
    </div>
  );

  if (variant === 'inline') {
    return <div className="flex w-full justify-center py-6">{body}</div>;
  }
  return <div className="flex min-h-[60vh] w-full items-center justify-center px-4">{body}</div>;
}

function LoaderCard({ item }: { item: LoadingItem }) {
  const isQuote = item.type === 'quote';
  return (
    <div
      key={item.text}
      className="animate-fade-in rounded-2xl border border-border bg-card p-5 text-center shadow-sm"
    >
      <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        {isQuote ? <QuoteIcon className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
      </div>
      <p className="text-[15px] leading-relaxed text-foreground" style={isQuote ? { fontStyle: 'italic' } : undefined}>
        {isQuote ? `“${item.text}”` : item.text}
      </p>
      {item.by ? (
        <p className="mt-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {isQuote ? `— ${item.by}` : item.by}
        </p>
      ) : null}
    </div>
  );
}
