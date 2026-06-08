'use client';

import React, { useMemo } from 'react';

/* ── Types ── */
interface ConsistencyCardProps {
  u: any;
}

interface HRStatProps {
  label: string;
  value: string;
  accent?: boolean;
}

/* ── HRStat ── */
export function HRStat({ label, value, accent }: HRStatProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <span style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
      <span className="mono tnum" style={{ fontSize: 16, color: accent ? 'var(--red)' : 'var(--ink)', fontWeight: 700, marginTop: 2 }}>{value}</span>
    </div>
  );
}

/* ── ConsistencyCard ── */
export function ConsistencyCard({ u }: ConsistencyCardProps) {
  // Build 52 weeks of deterministic activity data (HackerRank-style year heatmap).
  const weeks = 52;
  const data = useMemo(() => {
    if (u.heatmap && u.heatmap.weeks.length === weeks) return u.heatmap.weeks;
    const out: number[][] = [];
    let seed = 19;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280, seed / 233280);
    const intensity = u.casesSolved < 5 ? 0.15 : u.casesSolved > 100 ? 0.92 : 0.68;
    for (let w = 0; w < weeks; w++) {
      const week: number[] = [];
      // Ramp activity towards present (bias later weeks higher)
      const phase = (w / weeks) * 0.5 + intensity * 0.7;
      for (let d = 0; d < 7; d++) {
        const r = rnd();
        const isWeekend = d >= 5;
        const skip = r < (isWeekend ? 0.55 - phase * 0.3 : 0.38 - phase * 0.3);
        let v: number;
        if (skip) v = 0;
        else if (r < 0.55) v = 1;
        else if (r < 0.82) v = 2;
        else if (r < 0.95) v = 3;
        else v = 4;
        week.push(v);
      }
      out.push(week);
    }
    // Make the last 14 days a hot streak.
    for (let i = weeks - 2; i < weeks; i++)
      for (let d = 0; d < 7; d++) out[i][d] = Math.max(out[i][d], 2 + (d % 2));
    return out;
  }, [u.casesSolved]);

  const totalCases = u.heatmap?.totalCases ?? data.flat().filter((v: number) => v > 0).length;
  const maxStreak = u.heatmap?.maxStreak ?? (u.casesSolved > 100 ? 47 : u.casesSolved > 10 ? 21 : 2);
  const weeklyCadence = u.heatmap?.weeklyCadence ?? (u.weekCases >= 9 ? 5.4 : 3.1);
  const cohortCadence = u.heatmap?.cohortCadence ?? 2.8;
  const palette = ['#F1ECDD', '#F5C9CF', '#E37685', '#C8102E', '#8E0A20'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  // Month labels — approx position: month i lives near col (i / 12) * 52
  const monthCols = months.map((m: string, i: number) => ({ label: m, col: Math.round(i * 52 / 12) }));

  return (
    <div className="card" style={{ padding: 'var(--pad-card, 18px 20px)' }}>
      <div className="between" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow">Submission activity</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span className="serif" style={{ fontSize: 24, color: 'var(--ink)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{totalCases.toLocaleString('en-IN')}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>cases in the last year</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <HRStat label="Max streak" value={`${maxStreak}d`}/>
          <HRStat label="Current" value={`${u.streak}d`} accent/>
        </div>
      </div>

      {/* Calendar — horizontally scrollable on mobile. 52 columns × ~10px =
          ~520px wide; a phone is 360-400px wide, so we'd otherwise shrink
          each cell to a sub-pixel ribbon. Wrapping in an overflow-x:auto
          div + giving the inner grid a min-width keeps cells legible and
          lets the user swipe through the year. Momentum scrolling on iOS
          via -webkit-overflow-scrolling. */}
      <div style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        // Subtle fade at the right edge so the user gets a "more to the
        // right" affordance on mobile without an explicit scrollbar.
        maskImage: 'linear-gradient(to right, black 0, black calc(100% - 16px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, black 0, black calc(100% - 16px), transparent 100%)',
      }}>
        {/* Day-of-week labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5, fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--ff-mono)', paddingTop: 16, marginRight: 2, flex: 'none' }}>
          {['','M','','W','','F',''].map((l: string, i: number) => (
            <div key={i} style={{ height: 10, lineHeight: '10px' }}>{l}</div>
          ))}
        </div>
        {/* Grid + month labels above. min-width forces the 52 cols to a
            legible size on mobile (~10px per week × 52 = 520px) so the
            container overflows and scrolls instead of squishing cells. */}
        <div style={{ flex: 1, minWidth: 520 }}>
          {/* Month labels */}
          <div style={{ position: 'relative', height: 14, marginBottom: 2, fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--ff-mono)' }}>
            {monthCols.map((m: any, i: number) => (
              <span key={i} style={{ position: 'absolute', left: `${(m.col / weeks) * 100}%`, top: 0 }}>{m.label}</span>
            ))}
          </div>
          {/* Weeks grid */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 2.5 }}>
            {data.map((week: number[], wi: number) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {week.map((v: number, di: number) => (
                  <div key={di} title={`Week ${wi+1} · ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][di]} · ${v} ${v === 1 ? 'case' : 'cases'}`}
                    style={{ aspectRatio: '1 / 1', width: '100%', borderRadius: 2, background: palette[v], cursor: 'pointer' }}/>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)', fontSize: 11, color: 'var(--ink-3)' }}>
        <span>
          {u.casesSolved < 5
            ? <>Two days last week. Streak you&apos;re building starts <b style={{color:'var(--ink)'}}>today</b>.</>
            : <>You show up <b style={{ color: 'var(--ink)' }}>{weeklyCadence}</b> days / week · cohort {cohortCadence}</>
          }
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--ff-mono)', fontSize: 10 }}>
          <span>Less</span>
          {palette.map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }}/>
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
