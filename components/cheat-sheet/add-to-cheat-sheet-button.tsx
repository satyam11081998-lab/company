'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/user-context';
import { Plus, Check, Lock } from 'lucide-react';
import type { CheatSheetItemKind } from '@/lib/types';

export function AddToCheatSheetButton({
  content, sourceTopic, sourceHeadlineId, sourceKind = 'data_point',
}: {
  content: string; sourceTopic: string;
  sourceHeadlineId?: string | null; sourceKind?: CheatSheetItemKind;
}) {
  // Phase 1 #3: confirm useUser() exposes hasTierAccess(required)
  const { hasTierAccess } = useUser();
  const isPro = hasTierAccess('pro');
  const [state, setState] = useState<'idle' | 'saving' | 'added'>('idle');

  if (!isPro) {
    return (
      <Link href="/upgrade" title="Cheat Sheet is a Pro feature"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <Lock className="h-3 w-3" /> Add to cheat sheet
      </Link>
    );
  }

  async function add() {
    if (state !== 'idle') return;
    setState('saving');
    const res = await fetch('/api/cheatsheet', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content, source_topic: sourceTopic,
        source_headline_id: sourceHeadlineId ?? null, source_kind: sourceKind,
      }),
    });
    setState(res.ok ? 'added' : 'idle');
  }

  return (
    <button onClick={add} disabled={state !== 'idle'}
      className="inline-flex items-center gap-1 text-xs text-primary hover:opacity-80 disabled:opacity-60">
      {state === 'added' ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      {state === 'added' ? 'Added' : state === 'saving' ? 'Adding…' : 'Add to cheat sheet'}
    </button>
  );
}
