'use client';

import React from 'react';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { DailyContentResponse } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-is-mobile';

/* ── Types ── */
interface NewsCardProps {
  u: any;
  brief?: DailyContentResponse['brief'];
}

/* ── NewsCard ── */
export function NewsCard({ u, brief }: NewsCardProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [loading, setLoading] = React.useState(false);

  const handleToCase = async () => {
    if (!brief?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/news/${brief.id}/to-case`, { method: 'POST' });

      // Try to read the JSON body in both success and error paths so we can
      // surface the real server-side reason (RLS violation, missing brief, etc.)
      // instead of a generic "Failed to create case" toast.
      let payload: { case_id?: string; error?: string } | null = null;
      try {
        payload = (await res.json()) as { case_id?: string; error?: string };
      } catch {
        // body wasn't JSON — keep payload null
      }

      if (res.status === 429) {
        toast('Daily free tier quota exhausted.', {
          action: { label: 'Upgrade', onClick: () => router.push('/pricing') },
        });
        return;
      }
      if (!res.ok) {
        throw new Error(payload?.error || `Failed (HTTP ${res.status})`);
      }
      if (payload?.case_id) {
        router.push(`/cases/${payload.case_id}`);
      } else {
        throw new Error('No case_id in response');
      }
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{
      padding: 0,
      overflow: 'hidden',
      display: 'flex',
      // Stack image strip ON TOP on mobile so the text isn't squeezed into a
      // tiny right column. Desktop keeps the side-by-side layout.
      flexDirection: isMobile ? 'column' : 'row',
    }}>
      <div style={{
        // Mobile: full-width thin strip across the top (~72px tall).
        // Desktop: 160px-wide left rail at full card height.
        width: isMobile ? '100%' : 160,
        height: isMobile ? 72 : 'auto',
        flex: 'none',
        position: 'relative',
        background: 'linear-gradient(135deg, #0F1C33 0%, #1E2F4F 60%, #2E4675 100%)',
        overflow: 'hidden',
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
          {brief?.title || 'BCG to acquire Quantis as climate consulting consolidates'}
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          Why it matters for you: textbook M&amp;A synergy framing — your profitability focus today maps directly onto cases like this <i>at</i> partner-round depth.
        </p>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 14, paddingTop: 8 }}>
          <span onClick={() => brief?.id && router.push(`/gd-briefs/${brief.id}`)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', borderBottom: '1.5px solid var(--ink)', paddingBottom: 1, cursor: 'pointer' }}>Read brief →</span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            or{' '}
            <button
              onClick={handleToCase}
              disabled={loading || !brief?.id}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: 'var(--red)', fontWeight: 700, cursor: (loading || !brief?.id) ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1, font: 'inherit'
              }}
            >
              {loading ? 'generating...' : 'turn it into a 15-min case'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
