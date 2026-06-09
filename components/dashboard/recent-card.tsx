'use client';

import React from 'react';
import Link from 'next/link';
import { ChevR } from './icons';

/* ── Types ── */
interface RecentItem {
  id: string;
  title: string;
  domain: string;
  score: number;
  when: string;
  duration: string;
}

interface RecentCardProps {
  u: any;
}

/* ── Mock data (fallback only — kept verbatim so the visual still renders
 *   for users with zero scored submissions). ── */
export const RECENT: RecentItem[] = [
  { id: 'c-201', title: 'Profitability of a regional dairy', domain: 'Profitability', score: 84, when: 'Yesterday', duration: '23m' },
  { id: 'c-198', title: 'Market size: cold-pressed coffee, India', domain: 'Market Sizing', score: 76, when: '2d ago', duration: '31m' },
  { id: 'c-194', title: 'Pricing strategy for an OTT bundle', domain: 'Pricing', score: 58, when: '4d ago', duration: '27m' },
  { id: 'c-189', title: 'Should a fintech enter Tier-2 cities?', domain: 'Market Entry', score: 65, when: '5d ago', duration: '35m' },
];

// Owner directive (2026-06-07): show only the LAST THREE recent submissions.
const RECENT_LIMIT = 3;

/* ── RecentCard ── */
export function RecentCard({ u }: RecentCardProps) {
  // Real recent submissions only — no mock fallback. When there are none, the
  // empty-state below renders honestly instead of fabricated rows.
  const cases: RecentItem[] = (u.activityFeed ?? []).slice(0, RECENT_LIMIT);

  // Each row links to the submission's results page so the user can re-read
  // their scored answer + feedback (the existing /results/[submission_id]
  // route). `c.id` is the submission id from lib/dashboard/recent.ts.
  return (
    <div className="card" style={{ padding: 'var(--pad-card, 18px 20px)' }}>
      <div className="between" style={{ marginBottom: 12 }}>
        <div className="eyebrow">Recent</div>
        <Link
          href="/profile"
          style={{
            fontSize: 11,
            color: 'var(--ink-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            textDecoration: 'none',
          }}
        >
          See all <ChevR className="ico-sm" />
        </Link>
      </div>
      {cases.length === 0 ? (
        <div style={{ padding: '20px 0', fontSize: 12.5, color: 'var(--ink-4)', textAlign: 'center' }}>
          Your first solved case appears here.
        </div>
      ) : (
        <div>
          {cases.map((c: RecentItem, i: number) => (
            <Link
              key={c.id}
              href={`/results/${c.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: 12,
                alignItems: 'center',
                padding: '10px 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 7,
                  background: c.score >= 75 ? 'var(--green-soft)' : c.score >= 60 ? 'var(--bg-2)' : 'var(--amber-soft)',
                  color: c.score >= 75 ? 'var(--green)' : c.score >= 60 ? 'var(--ink)' : 'var(--amber)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--ff-mono)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {c.score}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 13, color: 'var(--ink)' }}>{c.title}</span>
                <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>
                  {c.domain} · {c.when} · {c.duration}
                </span>
              </div>
              <ChevR className="ico-sm" style={{ color: 'var(--ink-4)' }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
