'use client';

/**
 * Live microphone waveform — the small/large bars that scroll RIGHT → LEFT while
 * recording (the ChatGPT voice-input look). Heights react to the actual audio via
 * the Web Audio API (AnalyserNode on the live MediaStream).
 *
 * Pass the active MediaStream while recording; pass null to stop/blank it. The bars
 * take their colour from the CSS `color` of the canvas (set `text-*` on className),
 * so it themes automatically (light/dark, primary red, etc.).
 */

import { useEffect, useRef } from 'react';

interface MicWaveformProps {
  stream: MediaStream | null;
  className?: string;
  /** Number of bars kept on screen. More = finer, denser wave. */
  bars?: number;
}

const FLOOR = 0.08; // minimum bar height (so silence still shows a thin line)

export default function MicWaveform({ stream, className, bars = 32 }: MicWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const levelsRef = useRef<number[]>(new Array(bars).fill(FLOOR));

  useEffect(() => {
    levelsRef.current = new Array(bars).fill(FLOOR);
    if (!stream) {
      // Blank the canvas when not recording.
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
      return;
    }

    let mounted = true;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;

    try {
      const AC: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AC();
      source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    } catch {
      return; // Web Audio unavailable — mic still works, just no visualiser
    }

    const data = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      if (!mounted || !analyser) return;
      analyser.getByteTimeDomainData(data);

      // Peak deviation from the 128 midline = loudness of this frame.
      let peak = 0;
      for (let i = 0; i < data.length; i++) {
        const v = Math.abs(data[i] - 128) / 128;
        if (v > peak) peak = v;
      }

      // Newest sample enters on the RIGHT, oldest drops off the LEFT → the wave
      // visibly travels right-to-left as you speak.
      const arr = levelsRef.current;
      arr.push(Math.min(1, Math.max(FLOOR, peak * 1.7)));
      if (arr.length > bars) arr.shift();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth || 1;
        const h = canvas.clientHeight || 1;
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = getComputedStyle(canvas).color || '#C8102E';

        const n = arr.length;
        const gap = 2;
        const barW = Math.max(2, (w - gap * (n - 1)) / n);
        for (let i = 0; i < n; i++) {
          const bh = Math.max(2, arr[i] * (h - 2));
          const x = i * (barW + gap);
          const y = (h - bh) / 2;
          const r = Math.min(barW / 2, bh / 2, 3);
          ctx.beginPath();
          const rr = (ctx as CanvasRenderingContext2D & { roundRect?: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect;
          if (typeof rr === 'function') rr.call(ctx, x, y, barW, bh, r);
          else ctx.rect(x, y, barW, bh);
          ctx.fill();
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      try {
        source?.disconnect();
        analyser?.disconnect();
      } catch {
        /* ignore */
      }
      try {
        audioCtx?.close();
      } catch {
        /* ignore */
      }
    };
  }, [stream, bars]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
