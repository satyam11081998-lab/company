'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/user-context';
import { Star, Lock } from 'lucide-react';
import type { CheatSheetItemKind } from '@/lib/types';

/**
 * Star toggle that saves a data point to the user's cheat sheet.
 * Outline star when idle → filled cardinal-red star once saved. Non-pro users
 * get a lock that links to /upgrade.
 */
export function AddToCheatSheetButton({
  content,
  sourceTopic,
  sourceHeadlineId,
  sourceKind = 'data_point',
}: {
  content: string;
  sourceTopic: string;
  sourceHeadlineId?: string | null;
  sourceKind?: CheatSheetItemKind;
}) {
  const { hasTierAccess } = useUser();
  const isPro = hasTierAccess('pro');
  const [state, setState] = useState<'idle' | 'saving' | 'added'>('idle');

  if (!isPro) {
    return (
      <Link
        href="/upgrade"
        title="Saving to your cheat sheet is a Pro feature"
        aria-label="Saving to your cheat sheet is a Pro feature"
        className="shrink-0 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
      >
        <Lock className="h-4 w-4" />
      </Link>
    );
  }

  async function add() {
    if (state !== 'idle') return;
    setState('saving');
    const res = await fetch('/api/cheatsheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        source_topic: sourceTopic,
        source_headline_id: sourceHeadlineId ?? null,
        source_kind: sourceKind,
      }),
    });
    setState(res.ok ? 'added' : 'idle');
  }

  const added = state === 'added';
  return (
    <button
      onClick={add}
      disabled={state !== 'idle'}
      aria-pressed={added}
      title={added ? 'Saved to your cheat sheet' : 'Save to cheat sheet'}
      aria-label={added ? 'Saved to cheat sheet' : 'Save to cheat sheet'}
      className={`shrink-0 transition-colors disabled:cursor-default ${
        added ? 'text-primary' : 'text-muted-foreground/60 hover:text-primary'
      } ${state === 'saving' ? 'opacity-60' : ''}`}
    >
      <Star className={`h-4 w-4 ${added ? 'fill-primary' : ''}`} />
    </button>
  );
}
