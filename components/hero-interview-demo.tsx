'use client';

/**
 * Landing hero — auto-playing typed AI case-interview demo.
 *
 * Shows the core product loop to visitors who will never click around:
 * interviewer asks → candidate structures → pushback → score card animates in.
 * Pure DOM/CSS (no video bytes); respects prefers-reduced-motion by rendering
 * the finished conversation statically; loops forever otherwise.
 */

import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

type Role = 'ai' | 'user';

const SCRIPT: { role: Role; text: string }[] = [
  {
    role: 'ai',
    text: 'Your client is a QSR chain in India. Profit fell 18% in two quarters — while revenue grew. Where do you start?',
  },
  {
    role: 'user',
    text: "If revenue is growing, the leak is on the cost side. I'd split costs into COGS, labour, rent and delivery commissions — and find which line outgrew revenue.",
  },
  {
    role: 'ai',
    text: 'Sharp. Delivery commissions doubled to 28% of sales. Your move?',
  },
  {
    role: 'user',
    text: 'Renegotiate aggregator rates, shift repeat orders to our own app with a 5% incentive, and cap deep discounts to profitable dayparts.',
  },
];

const SCORES: [string, number][] = [
  ['Structure', 86],
  ['Quantitative', 78],
  ['Synthesis', 84],
  ['Business Judgment', 88],
];

const TYPE_MS: Record<Role, number> = { ai: 16, user: 11 };
const GAP_MS = 750;
const SCORE_HOLD_MS = 5200;

export default function HeroInterviewDemo() {
  // msg = index of the message currently typing; chars = how much of it is out.
  const [msg, setMsg] = useState(0);
  const [chars, setChars] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [scoreBars, setScoreBars] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      setMsg(SCRIPT.length - 1);
      setChars(SCRIPT[SCRIPT.length - 1].text.length);
      setShowScore(true);
      setScoreBars(true);
    }
  }, []);

  // Pause the loop while the card is scrolled out of view — no point typing
  // to nobody, and it keeps timers/CPU quiet on long reads further down.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? true),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !inView) return;
    let timer: ReturnType<typeof setTimeout>;

    if (msg < SCRIPT.length) {
      const full = SCRIPT[msg].text;
      if (chars < full.length) {
        timer = setTimeout(() => setChars((c) => c + 1), TYPE_MS[SCRIPT[msg].role]);
      } else if (msg < SCRIPT.length - 1) {
        timer = setTimeout(() => { setMsg((m) => m + 1); setChars(0); }, GAP_MS);
      } else {
        timer = setTimeout(() => {
          setShowScore(true);
          // let the panel mount, then grow the bars (CSS transition)
          requestAnimationFrame(() => requestAnimationFrame(() => setScoreBars(true)));
        }, GAP_MS);
      }
    } else return;

    if (showScore) {
      timer = setTimeout(() => {
        setShowScore(false);
        setScoreBars(false);
        setMsg(0);
        setChars(0);
      }, SCORE_HOLD_MS);
    }
    return () => clearTimeout(timer);
  }, [msg, chars, showScore, reduced, inView]);

  // keep the newest line in view
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chars, msg, showScore]);

  const total = Math.round(SCORES.reduce((s, [, v]) => s + v, 0) / SCORES.length);

  return (
    <div ref={rootRef} className="ui-card-floating relative z-10 overflow-hidden p-0">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xs font-bold text-primary">M</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">AI Case Interview</p>
            <p className="text-[11px] text-muted-foreground">This is the real product</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Live demo
        </span>
      </div>

      {/* conversation */}
      <div ref={scrollRef} className="h-[300px] space-y-3 overflow-hidden px-4 py-4 sm:h-[330px]">
        {SCRIPT.slice(0, Math.min(msg + 1, SCRIPT.length)).map((m, i) => {
          const isTyping = i === msg && !showScore;
          const text = isTyping ? m.text.slice(0, chars) : m.text;
          if (isTyping && chars === 0) return null;
          return (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.role === 'user'
                    ? 'rounded-br-md bg-primary text-primary-foreground'
                    : 'rounded-bl-md bg-muted text-foreground'
                }`}
              >
                {text}
                {isTyping && text.length < m.text.length && (
                  <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse rounded-full bg-current align-middle" />
                )}
              </div>
            </div>
          );
        })}

        {/* score card */}
        {showScore && (
          <div className="animate-fade-in rounded-xl border border-primary/20 bg-card p-3.5 shadow-sm">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Scored in 60 seconds
              </p>
              <p className="text-[13px] font-bold text-foreground">
                {total}<span className="text-muted-foreground">/100</span>
                <span className="ml-1.5 rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-bold text-success">Would advance</span>
              </p>
            </div>
            {SCORES.map(([dim, pct]) => (
              <div key={dim} className="mb-1.5 flex items-center gap-2.5 last:mb-0">
                <span className="w-24 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-muted-foreground">{dim}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                    style={{ width: scoreBars ? `${pct}%` : '0%' }}
                  />
                </div>
                <span className="w-6 text-right font-mono text-[11px] text-muted-foreground">{pct}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
