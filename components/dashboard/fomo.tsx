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
  { who: 'tara.m', what: 'started', where: "today's focus", tone: 'navy', t: '2m ago' },
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

export const LiveTape: React.FC<{ events?: TapeEvent[] }> = ({ events = TAPE_EVENTS }) => {
  const displayEvents = events.length > 0 ? events : TAPE_EVENTS;
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
          {[...displayEvents, ...displayEvents, ...displayEvents].map((e, i) => (
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
    peerProximity?: import('@/lib/dashboard/peer-proximity').PeerProximityData;
  };
}

export const PeerProximity: React.FC<PeerProximityProps> = ({ u }) => {
  const data = u.peerProximity;
  
  if (u.casesSolved < 5 || !data?.competitor) {
    const aspirants = data?.newAspirantsThisWeek ?? 0;
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-3)' }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--green)' }} />
        {aspirants > 0 ? (
          <span><b style={{ color: 'var(--ink)' }}>{aspirants.toLocaleString()} new aspirant{aspirants === 1 ? '' : 's'}</b> joined this week. You&apos;re on day {u.streak}.</span>
        ) : (
          <span>You&apos;re on day {u.streak} — solve today&apos;s case to climb the board.</span>
        )}
      </div>
    );
  }

  const c = data.competitor;
  // Real ETA from the lib: prefer hours when < 24h (matches the original mock
  // copy "passes you in 8h"); fall back to days. Use `dailyGainRate` literal
  // — earlier rendering said "fast" and discarded the real number.
  const eta =
    c.etaHours == null
      ? 'soon'
      : c.etaHours < 24
        ? `${c.etaHours}h`
        : `${Math.round(c.etaHours / 24)}d`;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-3)' }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--amber)', animation: 'pulse-soft 2s ease-in-out infinite' }} />
      <b style={{ color: 'var(--ink)' }}>{c.name}</b> is {c.ptsBehind} pts behind you, gaining{' '}
      <b style={{ color: 'var(--amber)' }}>{c.dailyGainRate}/day</b>. They pass you in {eta} if you skip today.
    </div>
  );
};

/* ── BossCountdown — for constellation header ─────────────────────── */

export const BossCountdown: React.FC = () => {
  const { hh, mm } = useCountdownSoft(13, 47);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 999, background: 'linear-gradient(90deg, rgba(200,16,46,0.10), rgba(200,16,46,0.04))', border: '1px solid rgba(200,16,46,0.22)' }}>
      <Bolt style={{ width: 12, height: 12, color: 'var(--red)' }} />
      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--red)', textTransform: 'uppercase' }}>Focus resets in</span>
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

// Renders as absolutely-positioned DIVs (not SVG circles) because the parent
// constellation SVG uses `preserveAspectRatio="none"`, which stretches SVG
// shapes — SVG circles render as ellipses in that container. Divs with
// border-radius:50% stay perfectly round regardless of aspect.
//
// IMPORTANT: this component must be rendered inside the map's relatively-
// positioned wrapper (a sibling of the edges SVG), NOT inside the SVG.
export const PeerOrbit: React.FC<PeerOrbitProps> = ({ edges, nodes }) => {
  const pick = edges
    .slice(0, 6)
    .map(([a, b], i) => {
      const na = nodes.find((n) => n.id === a);
      const nb = nodes.find((n) => n.id === b);
      if (!na || !nb) return null;
      return { i, na, nb, dur: 4 + (i % 3) * 2 };
    })
    .filter(Boolean) as Array<{ i: number; na: PeerOrbitNode; nb: PeerOrbitNode; dur: number }>;

  // Generate one keyframe per edge that interpolates left/top between the
  // two endpoint percentages. Inline so the names are stable per edge index
  // and we don't need a CSS-in-JS runtime.
  const keyframes = pick
    .map(
      ({ i, na, nb }) => `
@keyframes po-${i} {
  0%   { left: ${na.x}%; top: ${na.y}%; opacity: 0; }
  15%  { opacity: 0.95; }
  85%  { opacity: 0.95; }
  100% { left: ${nb.x}%; top: ${nb.y}%; opacity: 0; }
}`,
    )
    .join('\n');

  return (
    <>
      <style>{keyframes}</style>
      {pick.map(({ i, dur }) => (
        <div
          key={`po-${i}`}
          style={{
            position: 'absolute',
            // 4×4 px dot centered on the coordinate via negative margins —
            // owner directive: "very very small" + "proper circle".
            width: 4,
            height: 4,
            marginLeft: -2,
            marginTop: -2,
            borderRadius: '50%',
            background: '#C8102E',
            boxShadow: '0 0 4px rgba(200,16,46,0.6)',
            pointerEvents: 'none',
            willChange: 'left, top, opacity',
            animation: `po-${i} ${dur}s linear infinite`,
            zIndex: 2,
          }}
        />
      ))}
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
  // Moved from bottom-left to TOP-LEFT (top: 14) to stop overlapping the
  // Operations cluster ("Throughput" / "Bottleneck" labels) and the legend.
  // Owner directive 2026-06-07: text overlapping → fix.
  return (
    <div style={{
      position: 'absolute', left: 14, top: 14, zIndex: 5,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 999,
      background: 'var(--card-hex)', border: '1px solid var(--line)',
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

export const ProofRail: React.FC<{ u?: { proofRail?: import('@/lib/dashboard/proof-rail').ProofRailData } }> = ({ u }) => {
  const data = u?.proofRail;
  const avatars = data?.initials ?? [];
  const total = data?.totalStartedToday ?? 0;

  // Honest empty state — no fabricated avatars or counts.
  if (total === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--ink-3)' }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--green)' }} />
        <span>Be the first to solve today&apos;s case.</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'var(--ink-3)' }}>
      {avatars.length > 0 && (
        <div style={{ display: 'flex' }}>
          {avatars.map((initials, i) => (
            <div key={i} style={{ width: 20, height: 20, borderRadius: 999, background: PROOF_AVATARS[i % PROOF_AVATARS.length], border: '2px solid var(--card)', marginLeft: i ? -8 : 0, color: 'white', fontSize: 9, display: 'grid', placeItems: 'center', fontWeight: 700, fontFamily: 'var(--ff-mono)' }}>
              {initials}
            </div>
          ))}
        </div>
      )}
      <span><b style={{ color: 'var(--ink)' }}>{total} {total === 1 ? 'peer' : 'peers'}</b> started today&apos;s case</span>
    </div>
  );
};
