'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/user-context';
import { Star, Lock, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { CheatSheetItemKind } from '@/lib/types';

/**
 * Star toggle that saves a data point to the user's cheat sheet.
 * Outline star when idle -> input mode -> filled checkmark once saved.
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
  const { user, hasTierAccess } = useUser();
  const isPro = hasTierAccess('pro');
  const [state, setState] = useState<'idle' | 'input' | 'saving' | 'added' | 'already_added'>('idle');
  const [tag, setTag] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

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

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setState('idle');
      return;
    }
    if (e.key === 'Enter') {
      if (!tag.trim()) return;
      if (tag.length > 30) {
        toast.error('Domain tag must be 30 characters or less');
        return;
      }
      if (content.length > 2000) {
        toast.error('Data point is too long to save');
        return;
      }
      
      setState('saving');
      const supabase = createClient();
      const { error } = await supabase.from('cheatsheet_points').insert({
        user_id: user!.id,
        point_text: content,
        source: sourceTopic,
        headline_id: sourceHeadlineId ?? null,
        tag: tag.trim(),
      });

      if (error) {
        if (error.code === '23505') {
          setState('already_added');
          toast.info('Already on your cheat sheet in this domain');
        } else {
          setState('idle');
          toast.error('Failed to save to cheat sheet');
          console.error(error);
        }
      } else {
        setState('added');
        toast.success('Saved to cheat sheet');
      }
    }
  }

  if (state === 'input') {
    return (
      <input
        ref={inputRef}
        type="text"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setState('idle')}
        placeholder="Enter domain..."
        className="h-6 w-32 px-2 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
      />
    );
  }

  const isSuccess = state === 'added' || state === 'already_added';
  return (
    <button
      onClick={() => isSuccess ? null : setState('input')}
      disabled={state === 'saving'}
      aria-pressed={isSuccess}
      title={isSuccess ? 'Saved to your cheat sheet' : 'Save to cheat sheet'}
      aria-label={isSuccess ? 'Saved to cheat sheet' : 'Save to cheat sheet'}
      className={`shrink-0 transition-colors disabled:cursor-default ${
        isSuccess ? 'text-primary' : 'text-muted-foreground/60 hover:text-primary'
      } ${state === 'saving' ? 'opacity-60' : ''}`}
    >
      {isSuccess ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
    </button>
  );
}
