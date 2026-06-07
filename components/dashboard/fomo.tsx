'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bolt, Lock } from './icons';

/* ── time helpers ────────────────────────────────────────────────── */

export function useTick(intervalMs = 1000): void {
  const [, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((n) => n + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

interface CountdownResult {
  h: number;
  m: number;
  s: number;
  hh: string;
  mm: string;
  ss: string;
}

export function useCountdownToMidnight(): CountdownResult {
  useTick(1000);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  const ms = tomorrow.getTime() - now.getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return {
    h,
    m,
    s,
    hh: String(h).padStart(2, '0'),
    mm: String(m).padStart(2, '0'),
    ss: String(s).padStart(2, '0'),
  };
}

interface CountdownSoftResult {
  h: number;
  m: number;
  hh: string;
  mm: string;
}

export function useCountdownSoft(hours = 13, mins = 47): CountdownSoftResult {
  useTick(60_000);
  const start = useRef(Date.now()).current;
  const totalMs = (hours * 60 + mins) * 60_000;
  const remaining = Math.max(0, totalMs - (Date.now() - start));
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  return {
    h,
    m,
    hh: String(h).padStart(2, '0'),
    mm: String(m).padStart(2, '0'),
  };
}

/* ── Streak-expires countdown chip ────────────────────────────────── */

interface StreakExpiryProps {
  minimal?: boolean;
}

export const StreakExpiry: React.FC<StreakExpiryProps> = ({ minimal = false }) => {
  const { hh, mm, ss } = useCountdownToMidnight();
  if (minimal) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--ff-mono)' }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--red)', animation: 'pulse-soft 1.6s ease-in-out infinite' }} />
        Streak expires in <b style={{ color: 'var(--red)' }}>{hh}:{mm}:{ss}</b>
      </span>
    );
  }
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(200,16,46,0.08)', border: '1px solid rgba(200,16,46,0.18)' }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--red)', animation: 'pulse-soft 1.6s ease-in-out infinite' }} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontSize: 9.5, color: 'var(--red)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Streak expires</span>
        <span className="mono tnum" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginTop: 2 }}>{hh}:{mm}:{ss}</span>
      </div>
    </div>
  );
};

/* ── LiveTape — horizontal scrolling cohort activity ──────────────── */

interface TapeEvent {
  who: string;
  what: string;
  where: string;
  tone: 'red' | 'amber' | 'green' | 'navy';
  t: string;
}

export const TAPE_EVENTS: TapeEvent[] = [
  { who: 'sneha.r', what: 'scored 92', where: 'on HDFC Life · Profitability', tone: 'red', t: 'just now' },
  { who: 'akhil_92', what: 'overtook 8 peers', where: '#142 → #134', tone: 'amber', t: '1m ago' },
  { who: 'pranav.k', what: 'unlocked Manager', where: '+1,580 pts', tone: 'green', t: '2m ago' },
  { who: 'tara.m', what: 'started', where: "today's boss case", tone: 'navy', t: '2m ago' },
  { who: 'ishita_b', what: 'broke a 30-day streak', where: 'PB 88', tone: 'red', t: '3m ago' },
  { who: 'rohit.99', what: 'scored 88', where: 'Market Entry · Hard', tone: 'green', t: '4m ago' },
  { who: 'kavya.s', what: 'joined your cohort', where: 'IIM-A · 2026', tone: 'navy', t: '5m ago' },
  { who: 'arnav_w', what: 'completed 10 cases this week', where: '+1,240 pts', tone: 'amber', t: '6m ago' },
];

function toneColor(tone: TapeEvent['tone']): string {
  switch (tone) {
    case 'red':   return '#FF6B7E';
    case 'green': return '#34D27A';
    case 'amber': return '#FFB259';
    case 'navy':  return '#7BA0FF';
  }
}

export const LiveTape: React.FC = () => {
  return (
    <div style={{
      position: 'relative',
      background: 'var(--ink)',
      color: '#E4E0D2',
      borderRadius: 10,
      padding: '10px 0',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', borderRight: '1px solid rgba(255,255,255,0.12)', flex: 'none' }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: '#34D27A', animation: 'pulse-soft 1.6s ease-in-out infinite', boxShadow: '0 0 8px #34D27A' }} />
        <span style={{ fontSize: 10, letterSpacing: '0.14em', fontWeight: 700, color: '#9A9587' }}>LIVE · 412 ACTIVE</span>
      </div>
      <div style={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        maskImage: 'linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)',
      }}>
        <div style={{ display: 'flex', gap: 36, whiteSpace: 'nowrap', animation: 'tape-scroll 50s linear infinite', willChange: 'transform' }}>
          {[...TAPE_EVENTS, ...TAPE_EVENTS, ...TAPE_EVENTS].map((e, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'var(--ff-mono)' }}>
              <span style={{
                width: 6, height: 6, borderRadius: 999, flex: 'none',
                background: toneColor(e.tone),
              }} />
              <span style={{ color: '#C7C2B0', fontWeight: 600 }}>{e.who}</span>
              <span style={{ color: '#9A9587' }}>{e.what}</span>
              <span style={{ color: '#7C7868' }}>{e.where}</span>
              <span style={{ color: '#5C5A4E', fontSize: 10.5 }}>· {e.t}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── PeerProximity — pressure line for the hero ───────────────────── */

interface PeerProximityProps {
  u: {
    casesSolved: number;
    streak: number;
  };
}

export const PeerProximity: React.FC<PeerProximityProps> = ({ u }) => {
  if (u.casesSolved < 5) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-3)' }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--green)' }} />
        <b style={{ color: 'var(--ink)' }}>1,247 new aspirants</b> joined this week. You&apos;re on day {u.streak}.
      </div>
    );
  }
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-3)' }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--amber)', animation: 'pulse-soft 2s ease-in-out infinite' }} />
      <b style={{ color: 'var(--ink)' }}>sneha.r</b> is 80 pts behind you, gaining <b style={{ color: 'var(--amber)' }}>240/day</b>. She passes you in 8h if you skip today.
    </div>
  );
};

/* ── BossCountdown — for constellation header ─────────────────────── */

export const BossCountdown: React.FC = () => {
  const { hh, mm } = useCountdownSoft(13, 47);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 999, background: 'linear-gradient(90deg, rgba(200,16,46,0.10), rgba(200,16,46,0.04))', border: '1px solid rgba(200,16,46,0.22)' }}>
      <Bolt style={{ width: 12, height: 12, color: 'var(--red)' }} />
      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--red)', textTransform: 'uppercase' }}>Boss resets in</span>
      <span className="mono tnum" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{hh}h {mm}m</span>
    </div>
  );
};

/* ── PeerOrbit — animated dots traveling the edges ────────────────── */

interface PeerOrbitNode {
  id: string;
  x: number;
  y: number;
  [key: string]: unknown;
}

interface PeerOrbitProps {
  edges: [string, string][];
  nodes: PeerOrbitNode[];
}

export const PeerOrbit: React.FC<PeerOrbitProps> = ({ edges, nodes }) => {
  const pick = edges.slice(0, 6);
  return (
    <>
      {pick.map(([a, b], i) => {
        const na = nodes.find((n) => n.id === a);
        const nb = nodes.find((n) => n.id === b);
        if (!na || !nb) return null;
        const dur = 4 + (i % 3) * 2; // 4,6,8s
        return (
          <circle key={`p-${i}`} r="0.55" fill="#C8102E" opacity="0.85" vectorEffect="non-scaling-stroke">
            <animateMotion dur={`${dur}s`} repeatCount="indefinite"
              path={`M${na.x},${na.y} L${nb.x},${nb.y}`} />
            <animate attributeName="opacity" dur={`${dur}s`} values="0;0.9;0.9;0" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" />
          </circle>
        );
      })}
    </>
  );
};

/* ── HotZone — pulsing halo around the cluster losing ground ──────── */

interface HotZoneNode {
  id: string;
  x: number;
  y: number;
  cluster?: string;
  [key: string]: unknown;
}

interface HotZoneProps {
  cluster: string;
  nodes: HotZoneNode[];
  label?: string;
}

export const HotZone: React.FC<HotZoneProps> = ({ cluster, nodes, label: _label = 'PEERS GAINING' }) => {
  const members = nodes.filter((n) => n.cluster === cluster);
  if (members.length === 0) return null;
  const cx = members.reduce((a, n) => a + n.x, 0) / members.length;
  const cy = members.reduce((a, n) => a + n.y, 0) / members.length;
  return (
    <>
      <circle cx={cx} cy={cy} r="14" fill="rgba(184,119,13,0.10)" stroke="rgba(184,119,13,0.45)" strokeWidth="0.15" vectorEffect="non-scaling-stroke" strokeDasharray="0.6 0.6">
        <animate attributeName="r" values="13;15;13" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </circle>
    </>
  );
};

/* ── PremiumGhostStrip — 4 shimmering locked nodes ────────────────── */

export const PremiumGhostStrip: React.FC = () => {
  const ghosts = [
    { l: 'PE & buyouts' },
    { l: 'Digital strategy' },
    { l: 'GTM motions' },
    { l: 'Negotiation' },
  ];

  return (
    <div style={{
      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
      display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', pointerEvents: 'auto', zIndex: 5,
    }}>
      <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 9.5, letterSpacing: '0.18em', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 4 }}>
        Pro frameworks
      </div>
      {ghosts.map((g, i) => (
        <div key={i} title={`Pro · ${g.l}`} style={{
          position: 'relative', width: 22, height: 22, borderRadius: 999,
          background: 'var(--bg-2)', border: '1.5px dashed var(--line-2)',
          display: 'grid', placeItems: 'center',
          opacity: 0.6 + (Math.sin(i) * 0.1),
          cursor: 'pointer',
        }}>
          <Lock style={{ width: 10, height: 10, color: 'var(--ink-4)' }} />
          <span style={{ position: 'absolute', inset: -3, borderRadius: 999, border: '1px solid rgba(200,16,46,0.3)', animation: `shimmer 3s ${i * 0.4}s ease-in-out infinite` }} />
        </div>
      ))}
      <div style={{ marginTop: 6, padding: '3px 8px', borderRadius: 999, background: 'var(--ink)', color: '#FFF6D9', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em' }}>PRO</div>
    </div>
  );
};

/* ── UnlockTeaser — "Solve 1 more case to unlock 3 nodes" ──────────── */

interface UnlockTeaserProps {
  count?: number;
}

export const UnlockTeaser: React.FC<UnlockTeaserProps> = ({ count = 3 }) => {
  return (
    <div style={{
      position: 'absolute', left: 14, bottom: 56, zIndex: 5,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 999,
      background: 'var(--card)', border: '1px solid var(--line)',
      fontSize: 11, color: 'var(--ink-2)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    }}>
      <Bolt style={{ width: 11, height: 11, color: 'var(--red)' }} />
      Solve today&apos;s case to unlock <b style={{ color: 'var(--ink)' }}>{count} more nodes</b>
    </div>
  );
};

/* ── ProofRail — tiny social proof under the hero CTA ──────────────── */

const PROOF_AVATARS = ['#C8102E', '#0F1C33', '#1F7A3A', '#B8770D'] as const;
const PROOF_INITIALS = ['SR', 'AK', 'PK', 'TM'] as const;

export const ProofRail: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'var(--ink-3)' }}>
      <div style={{ display: 'flex' }}>
        {PROOF_AVATARS.map((c, i) => (
          <div key={i} style={{ width: 20, height: 20, borderRadius: 999, background: c, border: '2px solid var(--card)', marginLeft: i ? -8 : 0, color: 'white', fontSize: 9, display: 'grid', placeItems: 'center', fontWeight: 700, fontFamily: 'var(--ff-mono)' }}>
            {PROOF_INITIALS[i]}
          </div>
        ))}
      </div>
      <span><b style={{ color: 'var(--ink)' }}>23 peers</b> in your cohort started this case today</span>
    </div>
  );
};
