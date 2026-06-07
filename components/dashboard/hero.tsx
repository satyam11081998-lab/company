'use client';

import React from 'react';
import { Flame, Play, Arrow } from './icons';
import { StreakExpiry, ProofRail, PeerProximity } from './fomo';

/* ─────────────── types ─────────────── */

export interface UserVariant {
  name: string;
  greeting: string;
  streak: number;
  bestStreak: number;
  rank: number | null;
  totalUsers: number;
  percentile: number | null;
  readiness: number | null;
  readinessDelta: number | null;
  latest: number;
  best: number;
  casesSolved: number;
  totalPoints: number;
  tier: string;
  nextTier: string;
  toNext: number;
  trajectory: number[];
  weekCases: number;
  sessionMinutes: number;
}

/* ─────────────── mock data ─────────────── */

export const TODAY = {
  pick: {
    id: 'c-220',
    title: "Why is HDFC Life's combined ratio creeping up?",
    domain: 'Profitability',
    difficulty: 'Hard',
    time: '25 min',
    interviewer: 'BCG, partner round',
  },
  rank: {
    id: 'c-221',
    title: 'Size the at-home fitness equipment market',
    domain: 'Market Sizing',
    difficulty: 'Medium',
    time: '20 min',
    participants: 384,
  },
};

export const VARIANTS: Record<string, UserVariant> = {
  new: {
    name: 'Arjun',
    greeting: 'Saturday, 6 June',
    streak: 2,
    bestStreak: 2,
    rank: null,
    totalUsers: 8214,
    percentile: null,
    readiness: null,
    readinessDelta: null,
    latest: 52,
    best: 58,
    casesSolved: 3,
    totalPoints: 240,
    tier: 'Associate',
    nextTier: 'Analyst',
    toNext: 760,
    trajectory: [48, 52, 58],
    weekCases: 3,
    sessionMinutes: 25,
  },
  mid: {
    name: 'Arjun',
    greeting: 'Saturday, 6 June',
    streak: 14,
    bestStreak: 21,
    rank: 142,
    totalUsers: 8214,
    percentile: 98,
    readiness: 71,
    readinessDelta: 6,
    latest: 78,
    best: 84,
    casesSolved: 47,
    totalPoints: 8420,
    tier: 'Senior Analyst',
    nextTier: 'Manager',
    toNext: 1580,
    trajectory: [44, 52, 48, 55, 51, 58, 62, 57, 65, 61, 68, 64, 70, 66, 72, 75, 71, 78, 74, 82],
    weekCases: 9,
    sessionMinutes: 40,
  },
  power: {
    name: 'Arjun',
    greeting: 'Saturday, 6 June',
    streak: 47,
    bestStreak: 47,
    rank: 18,
    totalUsers: 8214,
    percentile: 99.8,
    readiness: 89,
    readinessDelta: 2,
    latest: 91,
    best: 96,
    casesSolved: 184,
    totalPoints: 24820,
    tier: 'Manager',
    nextTier: 'Sr. Manager',
    toNext: 5180,
    trajectory: [70, 72, 75, 71, 78, 82, 80, 84, 79, 86, 88, 84, 90, 87, 92, 89, 94, 91, 96, 91],
    weekCases: 18,
    sessionMinutes: 60,
  },
};

/* ─────────────── Ring (from atoms.jsx) ─────────────── */

export function Ring({
  value,
  size = 120,
  thick = 8,
  color = '#C8102E',
  trackColor = '#E6E2D8',
  children,
}: {
  value: number;
  size?: number;
  thick?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}) {
  const r = (size - thick) / 2;
  const C = 2 * Math.PI * r;
  const off = C - (value / 100) * C;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={thick} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={thick}
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────── helpers ─────────────── */

export function MetaBit({ l, v, sub }: { l: string; v: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{l}</div>
      <div className="serif" style={{ fontSize: 16, lineHeight: 1.1, marginTop: 4, color: 'var(--ink)' }}>{v}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function MiniStat({ label, value, sub }: { label: string; value: React.ReactNode; sub: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 8 }}>
      <span style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <span className="mono tnum" style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{value}</span>
      <span style={{ fontSize: 10.5, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</span>
    </div>
  );
}

/* ─────────────── HERO variants ─────────────── */

export function HeroShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(180deg, #FAF9F6 0%, #F3EFE5 100%)',
      borderRadius: 14,
      padding: 'var(--hero-pad, 22px 28px)',
      overflow: 'hidden',
      border: '1px solid var(--line)',
    }}>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: 999, background: 'radial-gradient(circle, rgba(200,16,46,0.10) 0%, rgba(200,16,46,0) 70%)' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -60, width: 240, height: 240, borderRadius: 999, background: 'radial-gradient(circle, rgba(15,28,51,0.07) 0%, rgba(15,28,51,0) 70%)' }} />
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

export function StreakMonument({ u, big = true }: { u: UserVariant; big?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 8px 0 20px', borderLeft: big ? '1px solid var(--line)' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Flame className="flame" style={{ width: 16, height: 16, color: 'var(--red)' }} />
        <span className="eyebrow">Streak</span>
      </div>
      <div className="serif" style={{ fontSize: big ? 'clamp(56px, 5.5vw, 80px)' : 56, lineHeight: 0.95, color: 'var(--ink)' }}>{u.streak}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', maxWidth: 170, lineHeight: 1.4 }}>
        {u.streak === u.bestStreak ? (
          <><b style={{ color: 'var(--red)' }}>Personal best.</b></>
        ) : (
          <><b style={{ color: 'var(--ink)' }}>{u.bestStreak - u.streak} days</b> from your record</>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: i < Math.min(u.streak, 7) ? 'var(--red)' : 'transparent',
              border: i < Math.min(u.streak, 7) ? 'none' : '1.5px dashed var(--red)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroCase({ u }: { u: UserVariant }) {
  const newcomer = u.casesSolved < 5;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <span className="chip red" style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 10 }}>
            {newcomer ? 'YOUR FIRST FOCUS CASE' : 'TODAY · PARTNER ROUND'}
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{u.greeting}</span>
          {!newcomer && (
            <span style={{ marginLeft: 'auto' }}>
              <StreakExpiry minimal />
            </span>
          )}
        </div>
        <h1 className="serif" style={{ margin: 0, fontSize: 'clamp(22px, 2.4vw, 30px)', lineHeight: 1.18, color: 'var(--ink)', maxWidth: 620 }}>
          {newcomer
            ? "Start with profitability. It's where most aspirants find their footing."
            : TODAY.pick.title}
        </h1>
        <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: 540 }}>
          {newcomer ? (
            <>A gentle intro. 20 minutes. No score pressure on your first three cases.</>
          ) : (
            <>
              In your strongest domain. Crack it under <b style={{ color: 'var(--ink)' }}>25 min</b> and your streak hits{' '}
              <b style={{ color: 'var(--red)' }}>{u.streak + 1}</b>
              {u.streak >= u.bestStreak - 1 ? <> — a new record</> : <> — one short of PB</>}.
            </>
          )}
        </p>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn primary pulse-soft" style={{ padding: '10px 18px', fontSize: 13, fontWeight: 600, borderRadius: 9 }}>
            <Play className="ico-sm" /> Start the case
          </button>
          <button className="btn ghost" style={{ color: 'var(--ink-2)', fontSize: 12.5 }}>
            {newcomer ? 'Tour first' : '10-min drill instead'}
          </button>
          <span style={{ marginLeft: 6 }}>
            <ProofRail />
          </span>
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, fontSize: 11.5, color: 'var(--ink-3)' }}>
            <b className="mono tnum" style={{ fontSize: 13, color: 'var(--ink)' }}>25</b> min
          </span>
          <span style={{ width: 1, height: 14, background: 'var(--line)' }} />
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, fontSize: 11.5, color: 'var(--ink-3)' }}>
            <b className="mono tnum" style={{ fontSize: 13, color: 'var(--ink)' }}>+85</b> pts{' '}
            <b style={{ color: 'var(--red)', marginLeft: 4 }}>+25 streak</b>
          </span>
          <span style={{ width: 1, height: 14, background: 'var(--line)' }} />
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>BCG · partner round</span>
          <span style={{ marginLeft: 'auto' }}>
            <PeerProximity u={u} />
          </span>
        </div>
      </div>
      <StreakMonument u={u} big />
    </div>
  );
}

export function HeroStreak({ u }: { u: UserVariant }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Flame className="flame" style={{ width: 22, height: 22, color: 'var(--red)' }} />
          <span className="eyebrow">Day {u.streak} of your best run</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span className="serif" style={{ fontSize: 'clamp(96px, 10vw, 140px)', lineHeight: 0.85, color: 'var(--ink)' }}>{u.streak}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 22, color: 'var(--ink-3)', fontWeight: 500 }}>days</span>
            <span className="chip red">+{u.weekCases} cases this week</span>
          </div>
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-2)', maxWidth: 460, marginTop: 4 }}>
          {u.streak >= u.bestStreak ? (
            <>You&apos;re rewriting the record every day now.</>
          ) : (
            <>You&apos;re <b>{u.bestStreak - u.streak} days</b> from your longest run. Tomorrow makes it real.</>
          )}
        </p>
        <button className="btn primary pulse-soft" style={{ marginTop: 10, padding: '12px 20px', fontSize: 13.5, fontWeight: 600, borderRadius: 10 }}>
          Keep it alive — start today&apos;s case <Arrow className="ico-sm" />
        </button>
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>TODAY&apos;S CASE</div>
        <div className="serif" style={{ fontSize: 22, lineHeight: 1.2 }}>{TODAY.pick.title}</div>
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-3)' }}>{TODAY.pick.domain} · {TODAY.pick.difficulty} · {TODAY.pick.time}</div>
        <div style={{ marginTop: 14, height: 1, background: 'var(--line)' }} />
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-3)' }}>
          <b style={{ color: 'var(--ink)' }}>Then:</b> 10-min sizing warm-up · 5-min review of yesterday
        </div>
      </div>
    </div>
  );
}

export function HeroReadiness({ u }: { u: UserVariant }) {
  const ready = u.readiness ?? 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 36, alignItems: 'center' }}>
      <div style={{ position: 'relative' }}>
        <Ring value={ready} size={200} thick={14}>
          <span className="serif" style={{ fontSize: 64, lineHeight: 0.9 }}>{u.readiness ?? '—'}</span>
          <span style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.1em', marginTop: 4 }}>/100 READINESS</span>
        </Ring>
        {u.readinessDelta != null && (
          <div style={{ position: 'absolute', top: -4, right: -8, background: 'var(--green)', color: 'white', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontFamily: 'var(--ff-mono)', fontWeight: 600 }}>
            ↑ {u.readinessDelta} this week
          </div>
        )}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="chip red" style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 10 }}>
            READINESS · {u.greeting.split(',')[0].toUpperCase()}
          </span>
        </div>
        <h1 className="serif" style={{ margin: 0, fontSize: 'clamp(26px, 3vw, 38px)', lineHeight: 1.15 }}>
          {u.readiness == null
            ? 'A few more cases and your readiness score appears.'
            : u.readiness >= 85
              ? "You're in the top tier. Sharpen the edges."
              : u.readiness >= 65
                ? "You're in the strong middle. Today's case targets your weakest dim."
                : "You're building. Today's case fills your biggest gap."}
        </h1>
        <p style={{ marginTop: 12, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, maxWidth: 480 }}>
          {u.readiness == null ? (
            <>
              You&apos;ve solved <b>{u.casesSolved}</b> {u.casesSolved === 1 ? 'case' : 'cases'} so far. Readiness unlocks at 5 — we need a small sample before the number means anything.
            </>
          ) : (
            <>
              Driven by your last 10 cases, weighted by domain coverage and dimension balance. Today&apos;s case is in your strongest domain; expect a +1 to +2.
            </>
          )}
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn primary" style={{ padding: '12px 20px', fontSize: 13.5, fontWeight: 600, borderRadius: 10 }}>
            Start today&apos;s case <Arrow className="ico-sm" />
          </button>
          <button className="btn ghost" style={{ color: 'var(--ink-2)', fontSize: 13 }}>How is readiness calculated?</button>
        </div>
      </div>
    </div>
  );
}

export function Hero({ u, variant }: { u: UserVariant; variant: 'case' | 'streak' | 'readiness' }) {
  return (
    <HeroShell>
      {variant === 'streak' ? (
        <HeroStreak u={u} />
      ) : variant === 'readiness' ? (
        <HeroReadiness u={u} />
      ) : (
        <HeroCase u={u} />
      )}
    </HeroShell>
  );
}
