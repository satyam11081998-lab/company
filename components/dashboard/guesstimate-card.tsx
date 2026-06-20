'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bolt } from './icons';

/* ── Types ── */
interface GuesstimateCardProps {
  u: any;
  daily?: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
  } | null;
}

/* ── GuesstimateCard ──
 *
 * Whole card is clickable. The 4 MCQ option buttons are still present (no
 * visual change) but each click — including the buttons — routes the user to
 * the real daily guesstimate case at `/cases/${daily.id}`. MCQ options stay
 * mock until the `cases.mcq` column is authored per case; clicking any of
 * them just opens the case so the user can solve it.
 */
export function GuesstimateCard({ u, daily }: GuesstimateCardProps) {
  const router = useRouter();
  const hasDaily = !!daily?.id;
  const href = hasDaily ? `/cases/${daily!.id}` : '/practice?tab=guesstimates';
  const goToCase = () => router.push(href);

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
        <span className="mono tnum" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>60 SEC</span>
      </div>
      <h3 className="serif" style={{ margin: 0, fontSize: 18, lineHeight: 1.25, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
        {titleText}
      </h3>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          <b style={{ color: 'var(--ink)' }}>60-second</b> mental-math warm-up · sharpen your estimation reflex
        </span>
        <button
          type="button"
          className="btn primary"
          style={{ padding: '8px 14px', fontSize: 12.5, fontWeight: 600, borderRadius: 9, whiteSpace: 'nowrap', flexShrink: 0 }}
          onClick={(e) => { e.stopPropagation(); goToCase(); }}
        >
          <Bolt style={{ width: 13, height: 13 }} /> {hasDaily ? 'Start the guesstimate' : 'Browse guesstimates'}
        </button>
      </div>
    </div>
  );
}
