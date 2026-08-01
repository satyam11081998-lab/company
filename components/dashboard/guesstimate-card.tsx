'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bolt } from './icons';
import type { DailyItemProgress } from '@/lib/dashboard/daily-progress';

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
}

/* Small tick used by the attempted state. Inline so the card keeps its
 * zero-dependency, inline-style structure. */
function Tick({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.16" />
      <path d="M6 10.5l2.6 2.6L14.2 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── GuesstimateCard ──
 *
 * Whole card is clickable. The 4 MCQ option buttons are still present (no
 * visual change) but each click — including the buttons — routes the user to
 * the real daily guesstimate case at `/cases/${daily.id}`. MCQ options stay
 * mock until the `cases.mcq` column is authored per case; clicking any of
 * them just opens the case so the user can solve it.
 */
export function GuesstimateCard({ u, daily, progress }: GuesstimateCardProps) {
  const router = useRouter();
  const hasDaily = !!daily?.id;

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

  // Visual hover hint without restructuring the card or adding new className.
  const [hover, setHover] = React.useState(false);
  const titleText = daily?.title || 'How many cups of chai are drunk in Bangalore on a weekday?';

  return (
    <div
      className="card"
      role="link"
      tabIndex={0}
      onClick={goToCase}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToCase();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: 'linear-gradient(160deg, var(--card) 0%, rgba(200,16,46,0.04) 100%)',
        cursor: 'pointer',
        // Subtle press affordance — boxShadow + translate only, no layout shift.
        boxShadow: hover ? '0 6px 22px rgba(200,16,46,0.10)' : 'none',
        transform: hover ? 'translateY(-1px)' : 'none',
        transition: 'box-shadow .15s ease, transform .15s ease',
      }}
    >
      <div className="between">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bolt style={{ width: 14, height: 14, color: 'var(--red)' }} />
          <span className="eyebrow" style={{ color: 'var(--red)' }}>Daily guesstimate</span>
        </div>
        {done ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--green, #17803d)' }}>
            <Tick /> Done
            {progress?.score != null && (
              <span className="mono tnum" style={{ marginLeft: 2, padding: '1px 6px', borderRadius: 999, background: 'rgba(23,128,61,0.12)', fontSize: 10.5 }}>
                {progress.score}
              </span>
            )}
          </span>
        ) : (
          <span className="mono tnum" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>60 SEC</span>
        )}
      </div>
      <h3 className="serif" style={{ margin: 0, fontSize: 18, lineHeight: 1.25, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
        {titleText}
      </h3>
      {/* MCQ teaser is a pre-attempt affordance only. Once they've solved it,
          four fake options that just re-open the case are noise. */}
      {!done && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 2 }}>
        {['1.2M', '4.8M', '12M', '38M'].map((opt, i) => (
          <button
            key={i}
            type="button"
            className="btn"
            onClick={(e) => {
              // Don't double-fire the card click; route directly.
              e.stopPropagation();
              goToCase();
            }}
            style={{
              padding: '8px 4px',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--ff-mono)',
              background: 'var(--card-hex)',
              color: 'var(--ink)',
              borderColor: 'var(--line-2)',
              justifyContent: 'center',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          {done ? (
            progress?.score != null
              ? <>You scored <b style={{ color: 'var(--ink)' }}>{progress.score}</b> on today&apos;s guesstimate{progress.attempts > 1 ? ` · ${progress.attempts} attempts` : ''} · come back tomorrow for a new one</>
              : <>Already attempted today · finish it or keep practising</>
          ) : (
            <><b style={{ color: 'var(--ink)' }}>60-second</b> mental-math warm-up · sharpen your estimation reflex</>
          )}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {done && (
            <button
              type="button"
              className="btn"
              style={{ padding: '8px 12px', fontSize: 12.5, fontWeight: 600, borderRadius: 9, whiteSpace: 'nowrap', background: 'var(--card-hex)', color: 'var(--ink)', borderColor: 'var(--line-2)' }}
              onClick={(e) => { e.stopPropagation(); goToPractice(); }}
            >
              Practice more
            </button>
          )}
          <button
            type="button"
            className="btn primary"
            style={{ padding: '8px 14px', fontSize: 12.5, fontWeight: 600, borderRadius: 9, whiteSpace: 'nowrap' }}
            onClick={(e) => { e.stopPropagation(); goToCase(); }}
          >
            {done
              ? <>{resultHref ? 'View your score' : 'Finish it'}</>
              : <><Bolt style={{ width: 13, height: 13 }} /> {hasDaily ? 'Start the guesstimate' : 'Browse guesstimates'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
