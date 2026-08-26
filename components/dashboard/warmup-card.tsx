'use client';

/**
 * WarmupCard — carries the landing "interview sim" result forward.
 *
 * The sim on "/" is a tap-through warm-up on a SAMPLE case; it writes its result
 * to localStorage (`mece:warmup`). After sign-up + onboarding the user lands
 * here with an otherwise-empty account, so we surface that warm-up as a labelled
 * BASELINE — visible, personal, never on the leaderboard — and point them at the
 * real daily case to turn it into a saved, ranked score. Pure client + one
 * localStorage read; renders null when there is nothing to show, so it is safe
 * to mount unconditionally on the dashboard.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Sparkles } from 'lucide-react';

interface WarmupDim { name: string; score: number; max: number }
interface Warmup { score: number; craft: number; mode: string; dims: WarmupDim[]; ts: number }

const KEY = 'mece:warmup';
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // a fortnight — after that it's stale

export default function WarmupCard({
  caseId = null,
  guessId = null,
}: {
  caseId?: string | null;
  guessId?: string | null;
}) {
  const [w, setW] = useState<Warmup | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Warmup;
      if (!parsed || typeof parsed.score !== 'number' || !Array.isArray(parsed.dims)) return;
      if (Date.now() - (parsed.ts || 0) > MAX_AGE_MS) {
        localStorage.removeItem(KEY);
        return;
      }
      setW(parsed);
    } catch {
      /* storage blocked (private mode) — just show nothing */
    }
  }, []);

  if (!w) return null;

  const clear = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setW(null);
  };

  const ranked = [...w.dims].sort((a, b) => a.score / a.max - b.score / b.max);
  const weak = ranked[0];
  const strong = ranked[ranked.length - 1];
  const href = caseId ? `/cases/${caseId}` : guessId ? `/cases/${guessId}` : '/dashboard';

  return (
    <div className="ui-card relative overflow-hidden border-primary/30 p-5">
      <button
        type="button"
        onClick={clear}
        aria-label="Dismiss warm-up"
        className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
        <Sparkles className="h-3.5 w-3.5" /> Your warm-up
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <div className="font-mono text-[34px] font-bold leading-none tracking-tight tabular-nums">
          {w.score}
          <span className="text-[16px] text-muted-foreground">/100</span>
        </div>
        <p className="text-[13px] text-muted-foreground">from the case you tapped through before signing up.</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {strong && <span className="tag tag-green">Strong: {strong.name}</span>}
        {weak && <span className="tag tag-amber">Work on: {weak.name}</span>}
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
        That was a tap-through — it isn’t ranked. Do today’s real case to turn it into a saved, ranked score.
      </p>

      <Link href={href} onClick={clear} className="btn-primary mt-4 inline-flex">
        Do today’s case for real <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
