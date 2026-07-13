'use client';

/**
 * Landing-page scroll vignettes — small, play-once micro-animations that fire
 * when their section scrolls into view (IntersectionObserver). One hero
 * showpiece (hero-interview-demo) + these quiet vignettes; nothing loops in
 * parallel. All DOM/CSS, reduced-motion renders the finished state.
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronRight, BarChart3, Quote, Trophy } from 'lucide-react';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
    }
  }, []);
  return reduced;
}

function useInView<T extends HTMLElement>(threshold = 0.35): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) { setInView(true); obs.disconnect(); }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── Count-up number ─────────────────────────────────────────────────────── */

export function CountUp({ to, suffix = '', duration = 1100 }: { to: number; suffix?: string; duration?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.6);
  const reduced = usePrefersReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setVal(to); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setVal(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduced]);

  return <span ref={ref} className="tabular-nums">{val}{suffix}</span>;
}

/* ── GD Brief vignette — the brief assembles itself ──────────────────────── */

const ANGLES = [
  "Compare India's approach to the EU AI Act — what can we borrow?",
  'Startups face 3x compliance cost — innovation penalty or necessary guardrail?',
  'Data localisation creates a moat for Indian AI companies.',
];
const OPENING = '"Regulation that arrives before the harm is foresight — the question is whether India can afford the compliance bill."';

export function GdBriefVignette() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const reduced = usePrefersReducedMotion();
  const [stage, setStage] = useState(0); // 1 summary · 2-4 angles · 5 data · 6 opening
  const [typed, setTyped] = useState(0);

  const done = reduced;
  useEffect(() => {
    if (!inView || reduced) return;
    if (stage >= 6) return;
    const delays = [350, 420, 380, 380, 480, 400];
    const t = setTimeout(() => setStage((s) => s + 1), delays[stage] ?? 400);
    return () => clearTimeout(t);
  }, [inView, stage, reduced]);

  useEffect(() => {
    if (reduced) { setTyped(OPENING.length); return; }
    if (stage < 6 || typed >= OPENING.length) return;
    const t = setTimeout(() => setTyped((c) => c + 2), 14);
    return () => clearTimeout(t);
  }, [stage, typed, reduced]);

  const show = (n: number) => done || stage >= n;
  const item = (visible: boolean) =>
    `transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`;

  return (
    <div ref={ref} className="ui-card-floating overflow-hidden">
      <div className="bg-muted/50 px-5 py-3 border-b border-border flex items-center justify-between">
        <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">GD Brief</span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Building your brief…
        </span>
      </div>
      <div className="p-5">
        <span className="tag tag-navy mb-3 inline-flex">Policy & Economy</span>
        <h3 className="text-[15px] font-bold text-foreground leading-snug mb-2">
          India&apos;s AI policy and its impact on the startup ecosystem
        </h3>
        <p className={`text-[13px] text-muted-foreground leading-relaxed mb-4 ${item(show(1))}`}>
          The new AI regulatory framework has split industry leaders. Key angles: data sovereignty,
          startup compliance costs, and global competitiveness.
        </p>
        <div className="space-y-2.5">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Smart angles to open with</p>
          {ANGLES.map((angle, i) => (
            <div key={angle} className={`flex items-start gap-2 text-[13px] text-foreground ${item(show(2 + i))}`}>
              <ChevronRight className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
              {angle}
            </div>
          ))}
        </div>
        <div className={`mt-4 flex items-start gap-2 rounded-lg bg-muted px-3 py-2 ${item(show(5))}`}>
          <BarChart3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-[12px] text-foreground">
            <span className="font-semibold">Data point:</span> India&apos;s AI market to touch{' '}
            <span className="font-semibold">$17 Bn by 2027</span> (Nasscom) — cite it, sound prepared.
          </p>
        </div>
        <div className={`mt-3 ${item(show(6))}`}>
          <p className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
            <Quote className="h-3 w-3" /> Opening line
          </p>
          <p className="text-[13px] italic leading-relaxed text-foreground">
            {done ? OPENING : OPENING.slice(0, typed)}
            {!done && stage >= 6 && typed < OPENING.length && (
              <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse rounded-full bg-foreground align-middle" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Deck Vault vignette — a winning deck's storyline builds slide by slide ─ */

const SLIDES: [string, string][] = [
  ['01', 'Cover & the ask'],
  ['02', 'Problem framing'],
  ['03', 'Insight engine'],
  ['04', 'Recommendation'],
  ['05', 'Impact & roadmap'],
];

export function DeckVaultVignette() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(0); // slides shown; SLIDES.length+1 = badge

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setShown(SLIDES.length + 1); return; }
    if (shown > SLIDES.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 300 : shown === SLIDES.length ? 550 : 380);
    return () => clearTimeout(t);
  }, [inView, shown, reduced]);

  return (
    <div ref={ref} className="ui-card-floating overflow-hidden">
      <div className="bg-muted/50 px-5 py-3 border-b border-border flex items-center justify-between">
        <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Deck Vault · winning-deck skeleton</span>
        <span className="text-[11px] text-muted-foreground">5 slides · 8 min study</span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
          {SLIDES.map(([no, label], i) => {
            const visible = reduced || i < shown;
            return (
              <div
                key={no}
                className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}
              >
                <div className={`aspect-[4/3] rounded-md border p-1.5 ${i === 3 ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted/60'}`}>
                  <div className={`mb-1 h-1 w-3/4 rounded-full ${i === 3 ? 'bg-primary/70' : 'bg-foreground/25'}`} />
                  <div className="mb-0.5 h-0.5 w-full rounded-full bg-foreground/15" />
                  <div className="mb-0.5 h-0.5 w-5/6 rounded-full bg-foreground/15" />
                  <div className="h-0.5 w-2/3 rounded-full bg-foreground/15" />
                  {i === 2 && (
                    <div className="mt-1 flex items-end gap-0.5">
                      {[40, 65, 50, 85].map((h, j) => (
                        <span key={j} className="w-1.5 rounded-sm bg-primary/50" style={{ height: `${h / 10}px` }} />
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-center text-[10px] font-medium leading-tight text-muted-foreground">
                  <span className="font-mono text-foreground/60">{no}</span> {label}
                </p>
              </div>
            );
          })}
        </div>
        <div
          className={`mt-4 flex items-center justify-between rounded-lg bg-muted px-3 py-2.5 transition-all duration-500 ${
            reduced || shown > SLIDES.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="flex items-center gap-2 text-[12px] text-foreground">
            <Trophy className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span><span className="font-semibold">National finalist deck</span> — FMCG growth case, corporate flagship</span>
          </p>
          <span className="tag tag-red shrink-0">Study it</span>
        </div>
      </div>
    </div>
  );
}

/* ── Leaderboard vignette — rows slide in, points count up ───────────────── */

const ROWS: [string, string, number, string, boolean][] = [
  ['🥇', 'Arjun S.', 612, '14d', false],
  ['🥈', 'Priya M.', 589, '9d', false],
  ['🥉', 'Rohit K.', 541, '7d', false],
  ['#4', 'Sneha T.', 498, '5d', false],
  ['#12', 'You', 248, '3d', true],
];

export function LeaderboardVignette() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setShown(ROWS.length); return; }
    if (shown >= ROWS.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 250 : 320);
    return () => clearTimeout(t);
  }, [inView, shown, reduced]);

  return (
    <div ref={ref} className="ui-card-floating overflow-hidden">
      <div className="bg-muted/50 px-5 py-3 border-b border-border flex items-center justify-between">
        <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Leaderboard</span>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-muted-foreground">Live · 37 students</span>
        </div>
      </div>
      <div className="overflow-x-auto table-scroll-mobile">
        <table className="data-table min-w-[500px]">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Points</th>
              <th>Streak</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([rank, name, pts, streak, highlight], i) => {
              const visible = reduced || i < shown;
              return (
                <tr
                  key={name}
                  className={`transition-all duration-500 ${
                    visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
                  } ${highlight ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                >
                  <td className="font-mono font-semibold text-[13px]">{rank}</td>
                  <td className={`text-[13px] font-medium ${highlight ? 'text-primary' : 'text-foreground'}`}>{name}</td>
                  <td className="font-mono font-bold text-[14px] text-foreground">
                    {visible ? <CountUp to={pts} duration={900} /> : 0}
                  </td>
                  <td className="text-[12px] text-muted-foreground">{streak}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
