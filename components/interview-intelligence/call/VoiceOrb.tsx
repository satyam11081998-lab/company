'use client';

import { useEffect, useRef } from 'react';

/**
 * The interviewer's presence: a voiceprint of fine concentric contour lines that ripple with
 * whoever is speaking. Crimson when the interviewer talks (driven by its actual audio level),
 * mint when the candidate talks (driven by the mic), a slow periwinkle drift while it thinks.
 * Canvas, no libraries; respects prefers-reduced-motion (no displacement, level shown as glow).
 */

export type OrbMode = 'idle' | 'connecting' | 'speaking' | 'listening' | 'hearing' | 'thinking' | 'paused' | 'muted';

const COLORS: Record<OrbMode, [number, number, number]> = {
  idle: [147, 161, 184],
  connecting: [147, 161, 184],
  speaking: [224, 58, 82],     // interviewer — brand crimson, lifted for dark ground
  listening: [127, 214, 194],  // candidate — mint
  hearing: [127, 214, 194],
  thinking: [142, 162, 255],   // periwinkle
  paused: [110, 122, 145],
  muted: [110, 122, 145],
};

const RINGS = 22;
const POINTS = 120;

export default function VoiceOrb({
  mode,
  getLevels,
  size = 320,
  label,
}: {
  mode: OrbMode;
  getLevels: () => { mic: number; out: number };
  size?: number;
  label?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<OrbMode>(mode);
  const levelsRef = useRef(getLevels);
  modeRef.current = mode;
  levelsRef.current = getLevels;

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    el.width = size * dpr;
    el.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    let t = 0;
    let level = 0;
    const color = [...COLORS[modeRef.current]];
    let last = performance.now();

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const m = modeRef.current;
      const lv = levelsRef.current();
      let target = 0;
      if (m === 'speaking') target = lv.out;
      else if (m === 'hearing' || m === 'listening') target = lv.mic;
      else if (m === 'thinking') target = 0.18 + 0.08 * Math.sin(now / 600);
      else if (m === 'connecting') target = 0.1 + 0.08 * Math.sin(now / 420);
      level += (target - level) * (target > level ? 0.35 : 0.08);
      const goal = COLORS[m];
      for (let i = 0; i < 3; i++) color[i] += (goal[i] - color[i]) * Math.min(1, dt * 4);
      const speed = m === 'thinking' ? 0.55 : m === 'speaking' || m === 'hearing' ? 1.4 : 0.35;
      t += dt * speed * (0.6 + level * 1.8);

      const c = size / 2;
      const R = size * 0.46;
      ctx.clearRect(0, 0, size, size);

      // soft core glow
      const glow = ctx.createRadialGradient(c, c, 0, c, c, R);
      const [r, g, b] = color.map((v) => Math.round(v));
      glow.addColorStop(0, `rgba(${r},${g},${b},${0.16 + level * 0.32})`);
      glow.addColorStop(0.55, `rgba(${r},${g},${b},${0.05 + level * 0.08})`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < RINGS; i++) {
        const k = i / (RINGS - 1);
        const base = R * (0.2 + 0.78 * k);
        const amp = reduce ? 0 : (0.012 + level * 0.11) * (0.35 + k * 0.9);
        const alpha = (0.85 - k * 0.62) * (0.35 + Math.min(1, level * 1.6) * 0.65) + 0.04;
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        ctx.lineWidth = i === 0 ? 1.6 : 1;
        ctx.beginPath();
        for (let p = 0; p <= POINTS; p++) {
          const th = (p / POINTS) * Math.PI * 2;
          const n = Math.sin(3 * th + t * 1.3 + i * 0.42) * 0.5
            + Math.sin(5 * th - t * 0.9 + i * 0.71) * 0.3
            + Math.sin(2 * th + t * 0.5 - i * 0.2) * 0.2;
          const rad = base * (1 + amp * n);
          const x = c + rad * Math.cos(th);
          const y = c + rad * Math.sin(th);
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={label || 'Interviewer'}
      style={{ width: size, height: size }}
      className="block max-w-full"
    />
  );
}
