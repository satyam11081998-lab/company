'use client';

import React from 'react';

/* ── Types ── */
interface NewsCardProps {
  u: any;
}

/* ── NewsCard ── */
export function NewsCard({ u }: NewsCardProps) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex' }}>
      <div style={{
        width: 160, flex: 'none', position: 'relative',
        background: 'linear-gradient(135deg, #0F1C33 0%, #1E2F4F 60%, #2E4675 100%)',
        overflow: 'hidden'
      }}>
        <svg viewBox="0 0 160 160" width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="news-grid" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,0.10)" />
            </pattern>
          </defs>
          <rect width="160" height="160" fill="url(#news-grid)" />
          <path d="M 12 120 L 40 95 L 64 105 L 92 70 L 118 80 L 148 45" stroke="#C8102E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 12 130 L 40 115 L 64 122 L 92 100 L 118 108 L 148 85" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="3 3" />
          <circle cx="148" cy="45" r="4" fill="#C8102E" />
        </svg>
        <div style={{ position: 'absolute', top: 12, left: 12, padding: '3px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', fontSize: 9, color: '#FFFFFF', letterSpacing: '0.12em', fontWeight: 700 }}>
          DAILY BRIEF
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="chip red" style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>RELEVANT TO YOU</span>
          <span style={{ fontSize: 10.5, color: 'var(--ink-4)', fontFamily: 'var(--ff-mono)' }}>FT · 4 hr ago</span>
          <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--ink-4)' }}>4 min read</span>
        </div>
        <h3 className="serif" style={{ margin: 0, fontSize: 18, lineHeight: 1.25, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
          BCG to acquire Quantis as climate consulting consolidates
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          Why it matters for you: textbook M&amp;A synergy framing — you&apos;re attempting a profitability boss today, and consolidation cases like this <i>are</i> partner-round material.
        </p>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 14, paddingTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', borderBottom: '1.5px solid var(--ink)', paddingBottom: 1, cursor: 'pointer' }}>Read brief →</span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>or <b style={{ color: 'var(--red)' }}>turn it into a 15-min case</b></span>
        </div>
      </div>
    </div>
  );
}
