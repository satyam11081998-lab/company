'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, RotateCcw, Infinity as InfinityIcon, BarChart3 } from 'lucide-react';

/**
 * Shown on the results page to FREE users, right under their score. The moment
 * of peak intent: they've just seen how MECE grades them and where they're weak.
 * Anchored to their own weakest dimension so the pitch is personal, not generic.
 * Pro users and unscored/gibberish attempts never see it (gated by the caller).
 *
 * VOICE WAS REMOVED FROM THIS PITCH (2026-09-20). It promised "full voice
 * interviews" and listed "Voice interview mode" as a Pro benefit, but talk mode
 * is off product-wide behind VOICE_INTERVIEW_ENABLED (unset in every
 * environment), and the upgrade page correctly hides it. So this card was the
 * one surface still selling a feature that nobody — Pro included — can use, at
 * the single highest-intent moment in the funnel. Replaced with the worked case
 * figures, which are real, shipped, and sitting one panel above this card
 * behind a lock the user has just seen.
 */
export default function FirstScorePaywall({
  weakDimLabel,
}: {
  weakDimLabel: string | null;
}) {
  return (
    <div className="mt-6 rounded-xl border border-primary/25 bg-primary/[0.04] p-6">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-primary">
        <Sparkles className="h-4 w-4" /> Turn this score into an offer
      </div>
      <p className="mt-2 text-body leading-relaxed text-foreground/80">
        {weakDimLabel
          ? <>Your lowest dimension right now is <strong>{weakDimLabel}</strong>. On Pro you can re-attempt this exact case to lift it, practise the whole bank, and see the worked figures behind every case you solve.</>
          : <>On Pro you can re-attempt any case to lift your weakest dimension, practise the whole bank, and see the worked figures behind every case you solve.</>}
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
        <li className="flex items-center gap-2 text-small text-foreground/70"><RotateCcw className="h-4 w-4 text-primary" /> Unlimited re-attempts</li>
        <li className="flex items-center gap-2 text-small text-foreground/70"><InfinityIcon className="h-4 w-4 text-primary" /> Unlimited practice bank</li>
        <li className="flex items-center gap-2 text-small text-foreground/70"><BarChart3 className="h-4 w-4 text-primary" /> Worked case figures</li>
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href="/upgrade?src=results"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          See Pro <ArrowRight className="h-4 w-4" />
        </Link>
        <span className="text-small text-muted-foreground">
          Placement-season offer: <strong className="text-foreground">30% off Pro</strong> with code{' '}
          <span className="font-mono font-semibold text-primary">PLACEMENT2026</span>
        </span>
      </div>
    </div>
  );
}
