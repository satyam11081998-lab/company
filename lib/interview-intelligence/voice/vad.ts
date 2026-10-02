/**
 * Voice activity detection for standard voice: decides when the candidate starts and stops
 * talking. Plain Web Audio RMS.
 *
 * The noise floor is tracked CONTINUOUSLY (falls fast, rises slowly) instead of being measured
 * once at the start. A one-shot calibration that happens to land on the candidate saying "hi",
 * or on a fan switching on, would set the threshold above their voice for the whole interview.
 */

export interface VadCallbacks {
  onLevel?: (level: number) => void;
  onSpeechStart?: () => void;
  /** durationMs = how long they spoke; forced = hit the length ceiling. */
  onSpeechEnd?: (info: { durationMs: number; forced: boolean }) => void;
  onSilent?: () => void;
}

export interface VadOptions {
  silenceMs?: number;
  onsetMs?: number;
  minUtteranceMs?: number;
  maxUtteranceMs?: number;
  multiplier?: number;
  minThreshold?: number;
}

const DEFAULTS: Required<VadOptions> = {
  silenceMs: 1200,
  onsetMs: 160,
  minUtteranceMs: 600,
  maxUtteranceMs: 150_000,
  multiplier: 3,
  minThreshold: 0.012,
};

export class FloorVad {
  private ctx: AudioContext | null = null;
  private src: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private buf = new Uint8Array(1024);
  private raf = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private o: Required<VadOptions>;
  private floor = 0.01;
  private speaking = false;
  private aboveSince = 0;
  private belowSince = 0;
  private startedAt = 0;
  private paused = false;

  constructor(private audio: AudioContext, private stream: MediaStream, private cb: VadCallbacks, opts: VadOptions = {}) {
    this.o = { ...DEFAULTS, ...opts };
  }

  get isSpeaking() {
    return this.speaking;
  }

  start() {
    this.ctx = this.audio;
    this.src = this.audio.createMediaStreamSource(this.stream);
    this.analyser = this.audio.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.2;
    this.buf = new Uint8Array(this.analyser.fftSize);
    this.src.connect(this.analyser); // never to the speakers
    // a timer, not requestAnimationFrame: keeps working when the tab is in the background
    this.timer = setInterval(() => this.tick(), 30);
  }

  pause() {
    this.paused = true;
    if (this.speaking) {
      this.speaking = false;
      this.cb.onSilent?.();
    }
    this.aboveSince = 0;
    this.belowSince = 0;
  }

  resume() {
    this.paused = false;
    this.aboveSince = 0;
    this.belowSince = 0;
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    cancelAnimationFrame(this.raf);
    try { this.src?.disconnect(); this.analyser?.disconnect(); } catch { /* gone */ }
    this.src = null;
    this.analyser = null;
  }

  private tick() {
    if (!this.analyser) return;
    this.analyser.getByteTimeDomainData(this.buf as unknown as Uint8Array<ArrayBuffer>);
    let sum = 0;
    for (let i = 0; i < this.buf.length; i++) {
      const v = (this.buf[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / this.buf.length);
    this.cb.onLevel?.(Math.min(1, rms * 6));
    // noise floor: follow quiet quickly, follow loud only very slowly (and never while speaking)
    if (rms < this.floor) this.floor = this.floor * 0.85 + rms * 0.15;
    else if (!this.speaking) this.floor = this.floor * 0.998 + rms * 0.002;
    if (this.paused) return;
    const threshold = Math.max(this.o.minThreshold, this.floor * this.o.multiplier);
    const now = performance.now();
    const loud = rms > threshold;
    if (!this.speaking) {
      if (!loud) { this.aboveSince = 0; return; }
      if (!this.aboveSince) this.aboveSince = now;
      if (now - this.aboveSince >= this.o.onsetMs) {
        this.speaking = true;
        this.startedAt = this.aboveSince;
        this.belowSince = 0;
        this.cb.onSpeechStart?.();
      }
      return;
    }
    const dur = now - this.startedAt;
    if (dur >= this.o.maxUtteranceMs) { this.end(dur, true); return; }
    if (loud) { this.belowSince = 0; return; }
    if (!this.belowSince) this.belowSince = now;
    if (now - this.belowSince >= this.o.silenceMs) {
      if (dur - this.o.silenceMs < this.o.minUtteranceMs) {
        this.speaking = false;
        this.aboveSince = 0;
        this.belowSince = 0;
        this.cb.onSilent?.();
        return;
      }
      this.end(dur - this.o.silenceMs, false);
    }
  }

  private end(durationMs: number, forced: boolean) {
    this.speaking = false;
    this.aboveSince = 0;
    this.belowSince = 0;
    this.cb.onSpeechEnd?.({ durationMs, forced });
  }
}
