/**
 * Voice activity detection — decides when the candidate has finished a turn.
 *
 * Plain Web Audio RMS. No library, no model, no network. The whole job is
 * endpointing: "they have stopped talking, send it". Getting this wrong is the
 * single most annoying failure mode in a voice UI — cut someone off mid-thought
 * and they stop trusting the product immediately.
 *
 * Three guards make it feel human rather than twitchy:
 *  - the noise floor is CALIBRATED from the room, not hard-coded, so a laptop
 *    fan and a quiet bedroom both work;
 *  - a turn only ends after a real pause, and only if the utterance had some
 *    length, so a breath or an "um" does not end it;
 *  - a hard ceiling force-ends the turn before /transcribe's 6 MB limit would
 *    reject the whole recording and lose the answer.
 */

export type VadState = 'silent' | 'speaking';

export interface VadOptions {
  /** Silence needed to end a turn. Case answers have thinking pauses in them. */
  silenceMs?: number;
  /** Sound needed before we believe speech started (rejects a door slam). */
  onsetMs?: number;
  /** Utterances shorter than this cannot end a turn (a breath, a chair creak). */
  minUtteranceMs?: number;
  /** Hard ceiling — force the endpoint rather than lose the turn to a 413. */
  maxUtteranceMs?: number;
  /** How far above the calibrated floor counts as speech. */
  thresholdMultiplier?: number;
  /** Absolute floor so a silent room does not make the threshold ~0. */
  minThreshold?: number;
}

export interface VadCallbacks {
  onStateChange?: (state: VadState) => void;
  /** 0..1, for the orb. Fires every frame — keep the handler cheap. */
  onLevel?: (level: number) => void;
  /** The candidate finished a turn. `forced` = hit the ceiling, not a pause. */
  onSpeechEnd?: (info: { durationMs: number; forced: boolean }) => void;
  onSpeechStart?: () => void;
}

const DEFAULTS: Required<VadOptions> = {
  silenceMs: 1200,
  onsetMs: 150,
  minUtteranceMs: 700,
  maxUtteranceMs: 120_000,
  thresholdMultiplier: 2.5,
  minThreshold: 0.012,
};

export class Vad {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private raf = 0;
  private buf: Uint8Array = new Uint8Array(0);

  private opts: Required<VadOptions>;
  private state: VadState = 'silent';
  private threshold: number;

  // Calibration
  private calibrating = true;
  private calibrationSamples: number[] = [];
  private calibrationUntil = 0;

  // Turn tracking
  private aboveSince = 0;
  private belowSince = 0;
  private utteranceStart = 0;
  private paused = false;

  constructor(
    private stream: MediaStream,
    private cbs: VadCallbacks = {},
    options: VadOptions = {},
  ) {
    this.opts = { ...DEFAULTS, ...options };
    this.threshold = this.opts.minThreshold;
  }

  start() {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctor();
    // iOS Safari hands back a SUSPENDED context unless construction happened
    // inside a user gesture — and ours happens after `await getUserMedia`, by
    // which point the gesture has expired. A suspended context never advances
    // its clock, so the analyser returns flat data and the VAD hears eternal
    // silence: the mic looks live and no turn ever ends.
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.3;
    this.buf = new Uint8Array(this.analyser.fftSize);
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.source.connect(this.analyser);
    // Deliberately NOT connected to destination — routing the mic to the
    // speakers would feed the interviewer's voice back into the room.

    this.calibrating = true;
    this.calibrationSamples = [];
    this.calibrationUntil = performance.now() + 400;

    const tick = () => {
      this.raf = requestAnimationFrame(tick);
      if (!this.analyser) return;

      // getByteTimeDomainData's lib.dom signature is Uint8Array<ArrayBuffer>;
      // pass through a local alias so TS accepts our plain Uint8Array.
      this.analyser.getByteTimeDomainData(this.buf as unknown as Uint8Array<ArrayBuffer>);
      let sum = 0;
      for (let i = 0; i < this.buf.length; i++) {
        const v = (this.buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / this.buf.length);
      const now = performance.now();

      this.cbs.onLevel?.(Math.min(1, rms * 6));

      if (this.paused) return;

      // --- calibration window: learn the room, then set the threshold -------
      if (this.calibrating) {
        this.calibrationSamples.push(rms);
        if (now >= this.calibrationUntil) {
          const sorted = [...this.calibrationSamples].sort((a, b) => a - b);
          // Median, not mean: one cough during calibration should not deafen us.
          const floor = sorted[Math.floor(sorted.length / 2)] || 0;
          this.threshold = Math.max(this.opts.minThreshold, floor * this.opts.thresholdMultiplier);
          this.calibrating = false;
        }
        return;
      }

      const loud = rms > this.threshold;

      if (this.state === 'silent') {
        if (loud) {
          if (!this.aboveSince) this.aboveSince = now;
          if (now - this.aboveSince >= this.opts.onsetMs) {
            this.state = 'speaking';
            this.utteranceStart = this.aboveSince;
            this.belowSince = 0;
            this.cbs.onStateChange?.('speaking');
            this.cbs.onSpeechStart?.();
          }
        } else {
          this.aboveSince = 0;
        }
        return;
      }

      // state === 'speaking'
      const duration = now - this.utteranceStart;

      if (duration >= this.opts.maxUtteranceMs) {
        this.endTurn(duration, true);
        return;
      }

      if (loud) {
        this.belowSince = 0;
        return;
      }

      if (!this.belowSince) this.belowSince = now;
      if (now - this.belowSince >= this.opts.silenceMs) {
        // A pause after almost nothing is a noise blip, not a turn. Drop back to
        // silent without emitting — otherwise every cough posts an empty turn.
        if (duration < this.opts.minUtteranceMs) {
          this.state = 'silent';
          this.aboveSince = 0;
          this.belowSince = 0;
          this.cbs.onStateChange?.('silent');
          return;
        }
        this.endTurn(duration - this.opts.silenceMs, false);
      }
    };

    this.raf = requestAnimationFrame(tick);
  }

  /** Stop evaluating without tearing down the audio graph (mute / hold). */
  pause() {
    this.paused = true;
    if (this.state === 'speaking') {
      this.state = 'silent';
      this.cbs.onStateChange?.('silent');
    }
    this.aboveSince = 0;
    this.belowSince = 0;
  }

  resume() {
    this.paused = false;
    this.aboveSince = 0;
    this.belowSince = 0;
  }

  /** True if the candidate is mid-utterance right now. */
  get isSpeaking() {
    return this.state === 'speaking';
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    try {
      this.source?.disconnect();
      this.analyser?.disconnect();
      void this.ctx?.close();
    } catch {
      /* already torn down */
    }
    this.ctx = null;
    this.analyser = null;
    this.source = null;
  }

  private endTurn(durationMs: number, forced: boolean) {
    this.state = 'silent';
    this.aboveSince = 0;
    this.belowSince = 0;
    this.cbs.onStateChange?.('silent');
    this.cbs.onSpeechEnd?.({ durationMs, forced });
  }
}
