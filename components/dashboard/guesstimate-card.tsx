'use client';

import React from 'react';
import { Bolt } from './icons';

/* ── Types ── */
interface GuesstimateCardProps {
  u: any;
}

/* ── GuesstimateCard ── */
export function GuesstimateCard({ u }: GuesstimateCardProps) {
  return (
    <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, background: 'linear-gradient(160deg, var(--card) 0%, rgba(200,16,46,0.04) 100%)' }}>
      <div className="between">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bolt style={{ width: 14, height: 14, color: 'var(--red)' }} />
          <span className="eyebrow" style={{ color: 'var(--red)' }}>Daily guesstimate</span>
        </div>
        <span className="mono tnum" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>60 SEC</span>
      </div>
      <h3 className="serif" style={{ margin: 0, fontSize: 18, lineHeight: 1.25, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
        How many cups of chai are drunk in Bangalore on a weekday?
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 2 }}>
        {['1.2M', '4.8M', '12M', '38M'].map((opt, i) =>
        <button key={i} className="btn" style={{
          padding: '8px 4px', fontSize: 12, fontWeight: 600, fontFamily: 'var(--ff-mono)',
          background: 'var(--card)', color: 'var(--ink)', borderColor: 'var(--line-2)',
          justifyContent: 'center'
        }}>{opt}</button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, fontSize: 11, color: 'var(--ink-3)' }}>
        <span>
          <b style={{ color: 'var(--ink)' }}>312 peers</b> tried this morning · <b style={{ color: 'var(--green)' }}>61%</b> got it
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--amber)', fontWeight: 500 }}>
          streak +1
        </span>
      </div>
    </div>
  );
}
