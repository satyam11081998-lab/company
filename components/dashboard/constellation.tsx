'use client';

import React, { useState, useMemo } from 'react';
import { Check, Bolt, Lock, Arrow } from './icons';
import {
  BossCountdown,
  PeerOrbit,
  HotZone,
  PremiumGhostStrip,
  UnlockTeaser,
} from './fomo';

/* ─────────────── Types ─────────────── */

interface NodeData {
  id: string;
  x: number;
  y: number;
  lbl: string;
  cluster: string;
  s: 'done' | 'active' | 'next' | 'locked';
  boss?: boolean;
}

type Edge = [string, string];

interface ClusterInfo {
  name: string;
  color: string;
}

interface ConstellationSectionProps {
  u: any;
  filter: string;
  userState: string;
}

interface LegendDotProps {
  color: string;
  filled?: boolean;
  ring?: boolean;
  label: string;
}

/* ─────────────── Data ─────────────── */

export const NODES: NodeData[] = [
  { id: 'p1', x: 14, y: 22, lbl: 'P&L drivers', cluster: 'prof', s: 'done' },
  { id: 'p2', x: 22, y: 14, lbl: 'Cost structure', cluster: 'prof', s: 'done' },
  { id: 'p3', x: 30, y: 26, lbl: 'Margin defense', cluster: 'prof', s: 'done' },
  { id: 'p4', x: 18, y: 34, lbl: 'Combined ratio', cluster: 'prof', s: 'active', boss: true },
  { id: 's1', x: 60, y: 14, lbl: 'Top-down', cluster: 'size', s: 'done' },
  { id: 's2', x: 70, y: 20, lbl: 'Bottom-up', cluster: 'size', s: 'done' },
  { id: 's3', x: 78, y: 12, lbl: 'Sanity checks', cluster: 'size', s: 'active' },
  { id: 's4', x: 84, y: 26, lbl: 'Cross-validation', cluster: 'size', s: 'next' },
  { id: 'r1', x: 76, y: 46, lbl: 'Value-based', cluster: 'pri', s: 'done' },
  { id: 'r2', x: 86, y: 54, lbl: 'Bundle pricing', cluster: 'pri', s: 'active' },
  { id: 'r3', x: 70, y: 60, lbl: 'Elasticity', cluster: 'pri', s: 'next' },
  { id: 'e1', x: 22, y: 56, lbl: 'Market attractive', cluster: 'ent', s: 'done' },
  { id: 'e2', x: 14, y: 64, lbl: 'Mode of entry', cluster: 'ent', s: 'active' },
  { id: 'e3', x: 28, y: 70, lbl: 'Competitive resp.', cluster: 'ent', s: 'next' },
  { id: 'm1', x: 44, y: 78, lbl: 'Synergies', cluster: 'ma', s: 'next' },
  { id: 'm2', x: 56, y: 80, lbl: 'Valuation', cluster: 'ma', s: 'locked' },
  { id: 'm3', x: 38, y: 86, lbl: 'Integration', cluster: 'ma', s: 'locked' },
  { id: 'o1', x: 8, y: 80, lbl: 'Throughput', cluster: 'ops', s: 'next' },
  { id: 'o2', x: 4, y: 70, lbl: 'Bottleneck', cluster: 'ops', s: 'locked' },
  { id: 'c1', x: 44, y: 22, lbl: 'Structuring', cluster: 'soft', s: 'done' },
  { id: 'c2', x: 50, y: 12, lbl: 'Communication', cluster: 'soft', s: 'done' },
  { id: 'c3', x: 38, y: 14, lbl: 'Hypothesis-led', cluster: 'soft', s: 'active' },
];

export const EDGES: Edge[] = [
  ['p1', 'p2'], ['p1', 'p3'], ['p3', 'p4'], ['p2', 'c3'], ['c3', 'c1'], ['c1', 'c2'],
  ['s1', 's2'], ['s2', 's3'], ['s2', 's4'], ['c1', 's1'],
  ['s4', 'r1'], ['r1', 'r2'], ['r2', 'r3'],
  ['p4', 'e1'], ['e1', 'e2'], ['e1', 'e3'], ['e3', 'm1'],
  ['m1', 'm2'], ['m1', 'm3'],
  ['e2', 'o1'], ['o1', 'o2'],
];

export const CLUSTERS: Record<string, ClusterInfo> = {
  prof: { name: 'Profitability', color: '#C8102E' },
  size: { name: 'Market Sizing', color: '#0F1C33' },
  pri: { name: 'Pricing', color: '#1F7A3A' },
  ent: { name: 'Market Entry', color: '#B8770D' },
  ma: { name: 'M&A', color: '#7A4FA8' },
  ops: { name: 'Operations', color: '#5C5A52' },
  soft: { name: 'Foundations', color: '#444' },
};

/* ─────────────── nodesForUser ─────────────── */

export function nodesForUser(state: string): NodeData[] {
  if (state === 'new') {
    return NODES.map((n) => {
      if (n.cluster === 'soft')
        return { ...n, s: n.id === 'c1' ? 'active' as const : 'next' as const, boss: false };
      if (n.id === 'p1') return { ...n, s: 'next' as const, boss: false };
      return { ...n, s: 'locked' as const, boss: false };
    });
  }
  if (state === 'power') {
    return NODES.map((n) => {
      if (n.cluster === 'ma' && n.id !== 'm1')
        return { ...n, s: 'active' as const, boss: false };
      if (n.id === 'm1') return { ...n, s: 'active' as const, boss: true };
      return { ...n, s: 'done' as const, boss: false };
    });
  }
  return NODES; // mid is baseline
}

/* ─────────────── LegendDot ─────────────── */

export function LegendDot({ color, filled, ring, label }: LegendDotProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: 999,
          background: filled ? color : 'transparent',
          border: ring ? `2px solid ${color}` : 'none',
        }}
      />
      {label}
    </span>
  );
}

/* ─────────────── ConstellationSection ─────────────── */

export function ConstellationSection({ u, filter, userState }: ConstellationSectionProps) {
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(() =>
    userState === 'new' ? 'c1' : userState === 'power' ? 'm1' : 'p4'
  );

  const nodes = useMemo(() => nodesForUser(userState), [userState]);
  const node = nodes.find((n) => n.id === (hover || selected)) || nodes[0];

  // counts for the eyebrow
  const counts = useMemo(() => {
    const c: Record<string, number> = { done: 0, active: 0, next: 0, locked: 0 };
    nodes.forEach((n) => {
      c[n.s] = (c[n.s] || 0) + 1;
    });
    return c;
  }, [nodes]);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '22px 28px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="eyebrow">Skill constellation</div>
            <BossCountdown />
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(184,119,13,0.10)',
                border: '1px solid rgba(184,119,13,0.28)',
                fontSize: 10.5,
                color: 'var(--amber)',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: 'var(--amber)',
                  animation: 'pulse-soft 2s ease-in-out infinite',
                }}
              />
              M&A · 12 peers gaining
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
            <b style={{ color: 'var(--ink)' }}>{counts.done} mastered</b> · {counts.active} in
            progress · {counts.next} next · {counts.locked} locked
          </div>
        </div>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(CLUSTERS).map(([k, c]) => {
            const active = filter === 'all' || filter === k;
            return (
              <span
                key={k}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: active ? 'var(--card)' : 'var(--bg-2)',
                  border: '1px solid var(--line)',
                  fontSize: 11,
                  color: active ? 'var(--ink-2)' : 'var(--ink-4)',
                  opacity: active ? 1 : 0.5,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 999, background: c.color }} />
                {c.name}
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 520 }}>
        {/* MAP */}
        <div
          style={{
            position: 'relative',
            background:
              'radial-gradient(circle at 50% 50%, #FFFFFF 0%, var(--bg) 60%, var(--bg-2) 100%)',
            overflow: 'hidden',
          }}
        >
          {/* dot grid */}
          <svg
            width="100%"
            height="100%"
            style={{ position: 'absolute', inset: 0, opacity: 0.5 }}
          >
            <defs>
              <pattern id="fp-dots" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="var(--line-2)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#fp-dots)" />
          </svg>

          {/* edges */}
          <svg
            width="100%"
            height="100%"
            style={{ position: 'absolute', inset: 0 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Hot zone halo — M&A: peers gaining ground */}
            <HotZone cluster="ma" nodes={nodes as any} />
            {EDGES.map(([a, b], i) => {
              const na = nodes.find((n) => n.id === a);
              const nb = nodes.find((n) => n.id === b);
              if (!na || !nb) return null;
              const dim = filter !== 'all' && na.cluster !== filter && nb.cluster !== filter;
              const lit =
                (na.s === 'done' || na.s === 'active') && (nb.s === 'done' || nb.s === 'active');
              return (
                <line
                  key={i}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={lit ? '#C8102E' : 'var(--line-2)'}
                  strokeWidth={lit ? 0.15 : 0.12}
                  opacity={dim ? 0.1 : lit ? 0.5 : 0.6}
                  strokeDasharray={lit ? '0' : '0.3 0.3'}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            <PeerOrbit
              edges={EDGES.filter((e) => {
                const na = nodes.find((n) => n.id === e[0]);
                const nb = nodes.find((n) => n.id === e[1]);
                return na && nb && na.s !== 'locked' && nb.s !== 'locked';
              })}
              nodes={nodes as any}
            />
          </svg>

          {/* cluster labels */}
          {Object.entries(CLUSTERS).map(([k, c]) => {
            const members = nodes.filter((n) => n.cluster === k);
            if (!members.length) return null;
            const cx = members.reduce((a, n) => a + n.x, 0) / members.length;
            const cy = Math.min(...members.map((n) => n.y)) - 5;
            const dim = filter !== 'all' && k !== filter;
            return (
              <div
                key={k}
                style={{
                  position: 'absolute',
                  left: `${cx}%`,
                  top: `${cy}%`,
                  transform: 'translate(-50%, -100%)',
                  fontSize: 9.5,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: c.color,
                  opacity: dim ? 0.25 : 0.6,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {c.name}
              </div>
            );
          })}

          {/* nodes */}
          {nodes.map((n) => {
            const c = CLUSTERS[n.cluster];
            const sz = n.boss ? 50 : n.s === 'done' ? 28 : n.s === 'active' ? 24 : 18;
            const bg =
              n.s === 'done'
                ? c.color
                : n.s === 'active'
                  ? 'var(--card)'
                  : n.s === 'next'
                    ? 'var(--card)'
                    : 'var(--bg-2)';
            const border =
              n.s === 'done'
                ? c.color
                : n.s === 'active'
                  ? c.color
                  : n.s === 'next'
                    ? 'var(--line-2)'
                    : 'var(--line)';
            const isSel = (hover || selected) === n.id;
            const dim = filter !== 'all' && n.cluster !== filter;
            return (
              <div
                key={n.id}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelected(n.id)}
                style={{
                  position: 'absolute',
                  left: `${n.x}%`,
                  top: `${n.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: dim ? 0.25 : 1,
                  transition: 'opacity .2s',
                  alignItems: 'center',
                  gap: '25px',
                }}
              >
                <div
                  style={{
                    width: sz,
                    height: sz,
                    borderRadius: 999,
                    background: bg,
                    border: `${n.boss ? 3 : 2}px solid ${border}`,
                    boxShadow: isSel
                      ? `0 0 0 4px rgba(200,16,46,0.18), 0 6px 20px rgba(0,0,0,0.08)`
                      : n.boss
                        ? `0 6px 28px rgba(200,16,46,0.35)`
                        : 'none',
                    display: 'grid',
                    placeItems: 'center',
                    color: n.s === 'done' ? 'white' : c.color,
                    opacity: n.s === 'locked' ? 0.45 : 1,
                    transition: 'all .25s',
                  }}
                >
                  {n.s === 'done' && (
                    <Check
                      className="ico-sm"
                      style={{
                        width: n.boss ? 20 : 12,
                        height: n.boss ? 20 : 12,
                      }}
                    />
                  )}
                  {n.s === 'active' && !n.boss && (
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: c.color,
                      }}
                    />
                  )}
                  {n.boss && <Bolt className="ico" style={{ color: 'var(--red)' }} />}
                  {n.s === 'next' && (
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 999,
                        background: 'var(--line-2)',
                      }}
                    />
                  )}
                  {n.s === 'locked' && (
                    <Lock style={{ width: 10, height: 10, color: 'var(--ink-4)' }} />
                  )}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: isSel || n.boss ? 600 : 400,
                    color: n.s === 'locked' ? 'var(--ink-4)' : 'var(--ink-2)',
                    background: isSel ? 'var(--card)' : 'transparent',
                    padding: isSel ? '2px 8px' : 0,
                    borderRadius: 4,
                    border: isSel ? '1px solid var(--line)' : 'none',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  {n.lbl}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 10.5,
              color: 'var(--ink-3)',
              background: 'var(--card)',
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--line)',
            }}
          >
            <LegendDot color="var(--red)" filled label="Mastered" />
            <LegendDot color="var(--red)" ring label="Active" />
            <LegendDot color="var(--line-2)" ring label="Next" />
            <LegendDot color="var(--bg-2)" filled label="Locked" />
          </div>

          {/* FOMO overlays */}
          <UnlockTeaser count={3} />
          <PremiumGhostStrip />
        </div>

        {/* Side panel */}
        <div
          style={{
            borderLeft: '1px solid var(--line)',
            background: 'var(--card)',
            padding: '22px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: CLUSTERS[node.cluster].color,
                }}
              />
              <span className="eyebrow">{CLUSTERS[node.cluster].name}</span>
              {node.boss && (
                <span className="chip red" style={{ marginLeft: 'auto' }}>
                  BOSS · today
                </span>
              )}
            </div>
            <h2
              className="serif"
              style={{
                margin: '10px 0 0',
                fontSize: 26,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              {node.lbl}
            </h2>
            <p
              style={{
                marginTop: 8,
                fontSize: 12.5,
                color: 'var(--ink-3)',
                lineHeight: 1.5,
              }}
            >
              {node.boss
                ? "This week's boss case asks you to defend HDFC Life's combined ratio. Partner-round."
                : node.s === 'done'
                  ? 'Cleared. Average 79 across 4 cases.'
                  : node.s === 'active'
                    ? 'In progress. 2 of 3 cases attempted.'
                    : node.s === 'next'
                      ? 'Unlocks after one more case in the parent.'
                      : 'Locked. Clear the prerequisites to unlock.'}
            </p>
          </div>

          <div>
            <div className="between" style={{ marginBottom: 8 }}>
              <span className="eyebrow">Mastery</span>
              <span className="mono tnum" style={{ fontSize: 12 }}>
                {node.s === 'done'
                  ? '4 / 4'
                  : node.s === 'active'
                    ? '2 / 3'
                    : node.s === 'next'
                      ? '0 / 3'
                      : '— / 3'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 7,
                    borderRadius: 4,
                    background:
                      node.s === 'done'
                        ? 'var(--red)'
                        : node.s === 'active' && i < 2
                          ? 'var(--red)'
                          : node.s === 'active' && i === 2
                            ? 'var(--red-soft)'
                            : 'var(--bg-2)',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Recent attempts
            </div>
            <div>
              {[
                { t: 'HDFC Life · combined ratio', s: 0, d: 'TODAY' },
                { t: 'ICICI · margin defense', s: 84, d: 'YST' },
                { t: 'SBI Life · loss ratio', s: 71, d: '3D' },
              ].map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 36px 36px',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                    fontSize: 12.5,
                  }}
                >
                  <span style={{ color: a.s ? 'var(--ink)' : 'var(--ink-4)' }}>{a.t}</span>
                  <span
                    className="mono tnum"
                    style={{
                      textAlign: 'right',
                      color: a.s >= 75 ? 'var(--green)' : a.s ? 'var(--ink)' : 'var(--ink-4)',
                    }}
                  >
                    {a.s || '—'}
                  </span>
                  <span
                    style={{
                      textAlign: 'right',
                      fontSize: 10,
                      color: 'var(--ink-4)',
                      fontFamily: 'var(--ff-mono)',
                    }}
                  >
                    {a.d}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn primary"
              style={{
                justifyContent: 'center',
                padding: '12px',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {node.boss ? 'Take the boss case ' : 'Start a case here '}
              <Arrow className="ico-sm" />
            </button>
            <button className="btn" style={{ justifyContent: 'center', fontSize: 12.5 }}>
              Read the brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
