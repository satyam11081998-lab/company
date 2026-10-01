'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import HomeImage from '@/components/home/photo';
import { Bolt } from './icons';
import type { DailyItemProgress } from '@/lib/dashboard/daily-progress';
import type { DashPhoto } from '@/lib/dashboard/photos';

/* ── Types ── */
interface GuesstimateCardProps {
  u: any;
  daily?: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
  } | null;
  /** Done-state for today's daily guesstimate. Undefined = treat as not attempted. */
  progress?: DailyItemProgress;
  /** A photograph of what the question is about, chosen on the server. */
  photo?: DashPhoto;
}

/* Small tick used by the attempted state. */
function Tick({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.16" />
      <path d="M6 10.5l2.6 2.6L14.2 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Four orders of magnitude, in the Indian system. A gut call, not an answer
 * key: they fit a count (cups of chai, petrol pumps) and a rupee value
 * (a market in crores) alike, and none of them claims to be right. The old
 * card showed 1.2M / 4.8M / 12M / 38M under every question, whatever it asked.
 */
const GUT = ['Under 1 lakh', '1–10 lakh', '10 lakh–1 cr', 'Over 1 crore'] as const;

/* ── GuesstimateCard ──
 *
 * Today's guesstimate (India, 2026-09-30 redesign): the question, a photo of
 * what it is about melting in from the right, and a one-tap gut call before
 * you solve it. Tapping a band commits you (it is remembered for this case in
 * sessionStorage) and turns the button into "Test your gut"; the case itself
 * is where the real estimate and the score happen.
 */
export function GuesstimateCard({ u: _u, daily, progress, photo }: GuesstimateCardProps) {
  const router = useRouter();
  const hasDaily = !!daily?.id;
  const [gut, setGut] = React.useState<string | null>(null);

  // Already done today? Send them to their result rather than back into a case
  // they cannot re-attempt on free tier. `attempted` without a submissionId
  // (abandoned / unscored) falls back to the case itself so they can finish.
  const done = !!progress?.attempted;
  const resultHref = progress?.submissionId ? `/results/${progress.submissionId}` : null;
  const href = done
    ? (resultHref ?? `/cases/${daily!.id}`)
    : hasDaily
      ? `/cases/${daily!.id}`
      : '/practice?tab=guesstimates';
  const goToCase = () => router.push(href);
  const goToPractice = () => router.push('/practice?tab=guesstimates');

  const gutKey = daily?.id ? `mece:gut:${daily.id}` : null;
  React.useEffect(() => {
    if (!gutKey) return;
    try {
      const saved = window.sessionStorage.getItem(gutKey);
      if (saved && (GUT as readonly string[]).includes(saved)) setGut(saved);
    } catch {
      /* storage blocked — the pick just isn't remembered */
    }
  }, [gutKey]);
  const pickGut = (g: string) => {
    setGut(g);
    if (!gutKey) return;
    try {
      window.sessionStorage.setItem(gutKey, g);
    } catch {
      /* ignore */
    }
  };

  const titleText = daily?.title || 'Today’s guesstimate is on its way.';

  return (
    <section
      aria-labelledby="guess-title"
      className="relative isolate flex min-h-[214px] flex-col overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--card-hex)] px-5 pb-4 pt-4"
    >
      {/* Photo: top-right, fading out to the left and downward (two layers). */}
      {photo && (
        <div aria-hidden className="dash-fade-b pointer-events-none absolute right-0 top-0 -z-10 h-[78%] w-[62%] sm:w-[56%]">
          <div className="dash-fade-l h-full w-full">
            <HomeImage
              photo={photo}
              decorative
              sizes="(min-width: 1280px) 280px, (min-width: 768px) 24vw, 60vw"
              widths={[320, 480, 720]}
              className="dash-photo-img h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <Bolt style={{ width: 14, height: 14, color: 'var(--red)' }} />
        <span className="eyebrow whitespace-nowrap" style={{ color: 'var(--red)' }}>Daily guesstimate</span>
        {done ? (
          <span className="inline-flex items-center gap-[5px] text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--green)]">
            <Tick /> Done
            {progress?.score != null && (
              <span className="mono tnum ml-0.5 rounded-full bg-[rgba(23,128,61,0.12)] px-1.5 py-px text-[10.5px]">{progress.score}</span>
            )}
          </span>
        ) : (
          <span className="mono tnum whitespace-nowrap text-[10.5px] text-[var(--ink-4)]">60 SEC</span>
        )}
      </div>

      <h3 id="guess-title" className="serif mb-0 mt-2.5 max-w-[62%] text-[18px] leading-[1.25] tracking-[-0.01em] text-[var(--ink)] sm:max-w-[58%]">
        {titleText}
      </h3>

      {/* The gut call — a pre-attempt affordance only. */}
      {!done && hasDaily && (
        <div className="mt-auto pt-4">
          <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-4)]">Your gut call</p>
          <div role="radiogroup" aria-label="Your gut call" className="grid grid-cols-2 gap-1.5 xl:grid-cols-4">
            {GUT.map((g) => {
              const on = gut === g;
              return (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pickGut(g)}
                  className={`whitespace-nowrap rounded-[8px] border px-1 py-2 text-[12px] font-semibold tabular-nums transition-colors ${
                    on
                      ? 'border-[var(--red)] bg-[var(--red-soft)] text-[var(--red)]'
                      : 'border-[var(--line-2)] bg-[var(--card-hex)] text-[var(--ink)] hover:border-[var(--ink-4)]'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between ${!done && hasDaily ? 'mt-3' : 'mt-auto pt-4'}`}>
        <span className="min-w-0 flex-1 text-[11px] leading-snug text-[var(--ink-3)]">
          {done ? (
            progress?.score != null ? (
              <>You scored <b className="text-[var(--ink)]">{progress.score}</b> on today&apos;s guesstimate{progress.attempts > 1 ? ` · ${progress.attempts} attempts` : ''} · a new one tomorrow</>
            ) : (
              <>Already attempted today · finish it or keep practising</>
            )
          ) : gut ? (
            <>Locked in: <b className="text-[var(--ink)]">{gut}</b>. Now build it and see how close you were.</>
          ) : (
            <><b className="text-[var(--ink)]">60-second</b> mental-maths warm-up · sharpen your estimation reflex</>
          )}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {done && (
            <button
              type="button"
              className="btn"
              style={{ padding: '8px 12px', fontSize: 12.5, fontWeight: 600, borderRadius: 9, whiteSpace: 'nowrap', background: 'var(--card-hex)', color: 'var(--ink)', borderColor: 'var(--line-2)' }}
              onClick={goToPractice}
            >
              Practice more
            </button>
          )}
          <button
            type="button"
            className="btn primary"
            style={{ padding: '8px 14px', fontSize: 12.5, fontWeight: 600, borderRadius: 9, whiteSpace: 'nowrap' }}
            onClick={goToCase}
          >
            {done ? (
              <>{resultHref ? 'View your score' : 'Finish it'}</>
            ) : (
              <>
                <Bolt style={{ width: 13, height: 13 }} /> {hasDaily ? (gut ? 'Test your gut' : 'Start the guesstimate') : 'Browse guesstimates'}
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
