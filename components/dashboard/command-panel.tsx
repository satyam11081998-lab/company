'use client';

import React, { useCallback } from 'react';
import { Check, ChevR } from './icons';

/* ── Types ── */
interface CommandPanelProps {
  u: any;
  show: { session: boolean; progress: boolean; growth: boolean };
}

interface InlineStatProps {
  label: string;
  value: string | number;
  sub: string;
}

/* ── TIERS ── */
const TIERS = [
  'Senior Partner',
  'Partner',
  'Director',
  'Principal',
  'Sr. Manager',
  'Manager',
  'Senior Analyst',
  'Analyst',
  'Junior Analyst',
  'Associate',
];

/* ── InlineStat ── */
export function InlineStat({ label, value, sub }: InlineStatProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span style={{ fontSize: 9.5, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
      <span className="mono tnum" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{value}</span>
      <span style={{ fontSize: 10.5, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{sub}</span>
    </div>
  );
}

/* ── CommandPanel ── */
export function CommandPanel({ u, show }: CommandPanelProps) {
  const traj: number[] = u.trajectory || [];
  const hasData = traj.length > 1;
  const W = 460, H = 110;
  const max = hasData ? Math.max(...traj, u.best || 0) : 100;
  const min = hasData ? Math.min(...traj) : 0;
  const range = max - min || 1;
  const pts: [number, number][] = hasData ? traj.map((v: number, i: number) => [
    (i / (traj.length - 1)) * W,
    H - (v - min) / range * (H - 20) - 10,
  ] as [number, number]) : [[0, H], [W, H]];

  // Smooth path via Catmull-Rom → cubic bezier conversion (tension 0.5)
  const smoothD = (() => {
    if (pts.length < 2) return '';
    let p = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      p += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return p;
  })();
  const d = smoothD;
  const fillD = `${d} L${W},${H} L0,${H} Z`;
  const lastY = pts[pts.length - 1][1];
  const lastX = pts[pts.length - 1][0];
  const pbY = hasData ? H - (u.best - min) / range * (H - 20) - 10 : H;
  const gain = hasData ? traj[traj.length - 1] - traj[0] : 0;

  const growth = u.casesSolved < 5
    ? [
        { l: 'Foundations',   v: 48, d: +12, c: 'var(--green)' },
        { l: 'Profitability', v: 30, d: +8,  c: 'var(--red)' },
        { l: 'Communication', v: 55, d: +5,  c: 'var(--ink-3)' },
      ]
    : [
        { l: 'Pricing',       v: 58, d: +7, c: 'var(--green)' },
        { l: 'Profitability', v: 82, d: +4, c: 'var(--red)' },
        { l: 'Operations',    v: 41, d: +3, c: 'var(--ink-3)' },
      ];

  const cols = [show.session, show.progress, show.growth].filter(Boolean).length;
  const template = cols === 3 ? '1.05fr 1.25fr 1fr' : cols === 2 ? '1fr 1fr' : '1fr';

  const tierIdx = Math.max(0, TIERS.findIndex((t) => t === u.tier));

  const scrollRef = useCallback((el: HTMLDivElement | null) => {
    if (el && !el.dataset.scrolled) {
      el.dataset.scrolled = '1';
      setTimeout(() => {
        const target = el.querySelector('[data-current]') as HTMLElement | null;
        if (target) el.scrollTop = target.offsetTop - el.clientHeight / 2 + target.clientHeight / 2;
      }, 50);
    }
  }, []);

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Unified header strip */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 22px', borderBottom: '1px solid var(--line)', background: 'linear-gradient(180deg, var(--bg-2) 0%, transparent 100%)', gap: 14 }}>
        <div className="eyebrow">Today&apos;s command</div>
        <span style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--ink-4)' }} />
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{u.greeting}</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: 'var(--ink-4)', fontFamily: 'var(--ff-mono)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--green)' }} />
          AUTO-BUILT · {u.sessionMinutes} MIN
        </span>
      </div>

      {/* Three-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: template, alignItems: 'stretch' }}>
        {/* ── Career Ladder ── */}
        {show.session &&
        <div style={{ padding: '20px 22px', borderRight: cols > 1 ? '1px solid var(--line)' : 'none', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          <div className="between">
            <span className="eyebrow" style={{ color: 'var(--red)' }}>Career ladder</span>
            <span className="chip" style={{ background: 'rgba(15,28,51,0.06)', color: 'var(--navy)', borderColor: 'transparent', fontSize: 10 }}>{u.tier}</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span className="serif" style={{ fontSize: 28, color: 'var(--ink)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{u.totalPoints.toLocaleString('en-IN')}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>pts</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4 }}>
              <b style={{ color: 'var(--red)' }}>{u.toNext.toLocaleString('en-IN')}</b> to {u.nextTier} · ~{Math.ceil(u.toNext / 85)} cases
            </div>
          </div>
          <div style={{ position: 'relative', flex: 1, minHeight: 200 }}>
            <div style={{
              position: 'absolute', inset: 0, overflowY: 'auto',
              maskImage: 'linear-gradient(to bottom, transparent 0, black 28px, black calc(100% - 28px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, black 28px, black calc(100% - 28px), transparent 100%)'
            }} ref={scrollRef}>
              <div style={{ position: 'relative', padding: '20px 0' }}>
                {/* continuous vertical line, centered through circles */}
                <div style={{ position: 'absolute', left: 11, top: -20, bottom: -20, width: 1.5, background: 'var(--line-2)' }}/>
                {TIERS.map((tname, i) => {
                  const isPast = i > tierIdx;
                  const isCurrent = i === tierIdx;
                  const isNext = i === tierIdx - 1;
                  return (
                    <div key={tname} {...(isCurrent ? { 'data-current': '1' } : {})}
                      style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', columnGap: 12, alignItems: 'center', padding: '9px 0', position: 'relative' }}>
                      <div style={{ display: 'grid', placeItems: 'center', width: 24, height: 24 }}>
                        <span style={{
                          width: 14, height: 14, borderRadius: 999,
                          background: isPast || isCurrent ? 'var(--red)' : 'var(--card)',
                          border: isCurrent ? '2px solid var(--card)' : isPast ? 'none' : '2px solid var(--line-2)',
                          boxShadow: isCurrent ? '0 0 0 2px var(--red)' : 'none',
                          display: 'grid', placeItems: 'center', color: 'white'
                        }}>
                          {isPast && <Check style={{ width: 8, height: 8 }}/>}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0 }}>
                        <span style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.1em', fontWeight: 700 }}>
                          {isPast ? 'CLEARED' : isCurrent ? 'YOU ARE HERE' : isNext ? 'NEXT' : 'AHEAD'}
                        </span>
                        <span style={{ fontSize: 13, color: isCurrent ? 'var(--ink)' : 'var(--ink-2)', fontWeight: isCurrent ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tname}</span>
                      </div>
                      {isNext &&
                      <span className="mono tnum" style={{ fontSize: 10.5, color: 'var(--red)', fontWeight: 600 }}>+{u.toNext >= 1000 ? `${(u.toNext / 1000).toFixed(1)}k` : u.toNext}</span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        }

        {/* ── Trajectory (graph dominant) ── */}
        {show.progress &&
        <div style={{ padding: '20px 22px', borderRight: cols > 1 && show.growth ? '1px solid var(--line)' : 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="between" style={{ alignItems: 'flex-start' }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--red)' }}>Trajectory</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span className="serif" style={{ fontSize: 28, color: 'var(--ink)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {u.readiness ?? '—'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>readiness</span>
                {u.readinessDelta != null &&
                <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--ff-mono)', fontWeight: 600 }}>↑ {u.readinessDelta}</span>
                }
              </div>
            </div>
            {hasData &&
            <div style={{ textAlign: 'right' }}>
              <div className="mono tnum" style={{ fontSize: 18, color: gain >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{gain >= 0 ? '+' : ''}{gain}</div>
              <div style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>20-case gain</div>
            </div>
            }
          </div>
          <div style={{ position: 'relative', flex: 1, minHeight: 110 }}>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block', height: '100%', minHeight: 110 }}>
              <defs>
                <linearGradient id="cmd-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8102E" stopOpacity={0.24} />
                  <stop offset="100%" stopColor="#C8102E" stopOpacity={0} />
                </linearGradient>
              </defs>
              {[0, 0.33, 0.66, 1].map((p, i) =>
                <line key={i} x1="0" x2={W} y1={p * H} y2={p * H} stroke="var(--line)" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
              )}
              {hasData &&
                <line x1="0" x2={W} y1={pbY} y2={pbY} stroke="var(--ink-4)" strokeDasharray="3 3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              }
              <path d={fillD} fill="url(#cmd-grad)" />
              <path d={d} stroke="var(--red)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              {hasData &&
                <>
                  <circle cx={lastX} cy={lastY} r={4} fill="var(--red)" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <circle cx={lastX} cy={lastY} r={9} fill="none" stroke="var(--red)" strokeWidth="1" opacity="0.4" vectorEffect="non-scaling-stroke">
                    <animate attributeName="r" values="5;13;5" dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                </>
              }
            </svg>
            {hasData &&
            <div style={{ position: 'absolute', top: 2, right: 2, fontSize: 9.5, color: 'var(--ink-4)', fontFamily: 'var(--ff-mono)' }}>PB · {u.best}</div>
            }
          </div>
          {/* mini stats row */}
          <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
            <InlineStat label="Cases/wk" value={u.weekCases} sub={u.casesSolved < 5 ? 'building' : '+3 last'} />
            <InlineStat label="Best" value={u.best} sub={u.casesSolved < 5 ? 'all-time' : '3d'} />
            <InlineStat label={`→ ${u.nextTier.split(' ')[0]}`} value={u.toNext >= 1000 ? `${(u.toNext / 1000).toFixed(1)}k` : u.toNext} sub="pts" />
          </div>
        </div>
        }

        {/* ── Growth ── */}
        {show.growth &&
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="between">
            <span className="eyebrow" style={{ color: 'var(--red)' }}>Momentum</span>
            <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>rolling 30d</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {growth.map((r, i) =>
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 4, alignItems: 'baseline' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{r.l}</span>
                <span className="mono tnum" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>{r.v}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--ff-mono)', fontWeight: 600 }}>↑ {r.d}</span>
              <div style={{ gridColumn: '1 / -1', height: 4, background: 'var(--bg-2)', borderRadius: 2, marginTop: 2 }}>
                <div style={{ width: `${r.v}%`, height: '100%', background: r.c, borderRadius: 2 }} />
              </div>
            </div>
            )}
          </div>
          <div style={{ paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: 'var(--ink-3)' }}>
            <span>{u.casesSolved < 5 ? 'Re-attempts double retention' : 'Re-attempts lift weakest dim by'} <b style={{ fontSize: 12, color: 'var(--ink)', marginLeft: 2 }}>{u.casesSolved < 5 ? '×2' : '+9'}</b></span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--ink)', fontWeight: 500, cursor: 'pointer' }}>Plan a drill <ChevR className="ico-sm" /></span>
          </div>
        </div>
        }
      </div>
    </div>
  );
}
