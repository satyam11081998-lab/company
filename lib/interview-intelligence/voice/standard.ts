/**
 * Standard voice: local VAD + record -> /voice/transcribe; interviewer lines spoken sentence by
 * sentence through /voice/speak (the first sentence plays while the rest are synthesised).
 *
 * Cheaper than a live call and works wherever WebRTC to OpenAI is blocked. The mic is not
 * evaluated while the interviewer is speaking (no echo loops on laptop speakers), so the
 * candidate interrupts by tapping or pressing Space rather than by talking over it.
 */

import { LevelMeter, meterForStream } from './audio';
import { splitSentences } from './text';
import { FloorVad } from './vad';
import type { SpeakKind, TransportEvents, VoiceTransport } from './types';

/** Recycle the always-on recorder when nobody is talking, so silence is never uploaded. */
const IDLE_RECYCLE_MS = 4000;
const ACK_PHRASES = ['Okay.', 'Mm-hm.', 'Right.', 'Thank you.', 'Got it.', 'Okay, thanks.'];

type Clip = { text: string; kind: SpeakKind; line: string; first: boolean; audio: Promise<AudioBuffer | null> };

export class StandardTransport implements VoiceTransport {
  readonly kind = 'standard' as const;
  private vad: FloorVad | null = null;
  private rec: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private recStartedAt = 0;
  private uttering = false;
  private micLevel = 0;
  private out: GainNode | null = null;
  private outMeter: LevelMeter | null = null;
  private queue: Clip[] = [];
  private source: AudioBufferSourceNode | null = null;
  private playing = false;
  private announced = false;
  private generation = 0;
  private listening = true;
  private muted = false;
  private closed = false;
  private recycleTimer: ReturnType<typeof setInterval> | null = null;
  private ackCache = new Map<string, AudioBuffer>();
  private micMeter: { meter: LevelMeter; dispose: () => void } | null = null;

  constructor(
    private opts: {
      ctx: AudioContext;
      stream: MediaStream;
      speak: (text: string) => Promise<Blob>;
      transcribe: (audio: Blob) => Promise<string>;
      silenceMs?: number;
    },
    private ev: TransportEvents,
  ) {}

  get userSpeaking() {
    return this.uttering;
  }

  get busy() {
    return this.playing || this.queue.length > 0 || this.announced;
  }

  async start(): Promise<void> {
    const { ctx, stream } = this.opts;
    this.out = ctx.createGain();
    this.out.connect(ctx.destination);
    this.outMeter = new LevelMeter(ctx, this.out, 6);
    this.micMeter = meterForStream(ctx, stream, 6);
    stream.getAudioTracks().forEach((t) => t.addEventListener('ended', () => {
      if (!this.closed) this.ev.onFatal('Your microphone was disconnected.', 'mic');
    }));
    this.vad = new FloorVad(ctx, stream, {
      onLevel: (l) => { this.micLevel = l; },
      onSilent: () => { this.uttering = false; },
      onSpeechStart: () => {
        if (!this.listening || this.muted || this.busy) return;
        this.uttering = true;
        this.ev.onSpeechStart();
      },
      onSpeechEnd: ({ durationMs }) => {
        this.uttering = false;
        if (!this.listening || this.muted) return;
        this.ev.onSpeechStop();
        void this.finishUtterance(durationMs);
      },
    }, { silenceMs: this.opts.silenceMs ?? 1300, minUtteranceMs: 600 });
    this.vad.start();
    this.startRecorder();
    this.recycleTimer = setInterval(() => this.recycleIfIdle(), 1000);
    // Pre-synthesise the short acknowledgements so they play instantly after an answer.
    for (const phrase of ACK_PHRASES.slice(0, 4)) {
      this.fetchAudio(phrase).then((b) => { if (b) this.ackCache.set(phrase, b); }).catch(() => undefined);
    }
  }

  say(text: string, kind: SpeakKind = 'line') {
    const clean = (text || '').trim();
    if (!clean || this.closed) return;
    const gen = this.generation;
    const cached = kind === 'ack' ? this.ackCache.get(clean) : undefined;
    const parts = kind === 'ack' ? [clean] : splitSentences(clean);
    parts.forEach((part, i) => {
      const audio = cached ? Promise.resolve(cached) : this.fetchAudio(part);
      this.queue.push({ text: part, kind, line: clean, first: i === 0, audio: audio.then((b) => (gen === this.generation ? b : null)) });
    });
    if (this.listening) this.vad?.pause(); // never record the interviewer's own voice
    void this.pump();
  }

  interrupt() {
    this.generation += 1;
    this.queue = [];
    if (this.source) {
      try { this.source.onended = null; this.source.stop(); } catch { /* not started */ }
      this.source = null;
    }
    this.playing = false;
    this.drained();
  }

  setListening(on: boolean) {
    this.listening = on;
    this.applyListening();
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.applyListening();
  }

  levels() {
    return {
      mic: this.listening && !this.muted ? Math.max(this.micLevel, this.micMeter?.meter.read() ?? 0) : 0,
      out: this.outMeter?.read() ?? 0,
    };
  }

  stop() {
    if (this.closed) return;
    this.closed = true;
    this.interrupt();
    if (this.recycleTimer) clearInterval(this.recycleTimer);
    this.vad?.stop();
    this.stopRecorder(true);
    this.micMeter?.dispose();
    this.outMeter?.disconnect();
    try { this.out?.disconnect(); } catch { /* gone */ }
  }

  // ------------------------------------------------------------------ playback
  private async fetchAudio(text: string): Promise<AudioBuffer | null> {
    try {
      const blob = await this.opts.speak(text);
      const data = await blob.arrayBuffer();
      return await this.opts.ctx.decodeAudioData(data.slice(0));
    } catch {
      this.ev.onWarning?.('The interviewer’s voice is unavailable for a moment — the question is on screen.');
      return null;
    }
  }

  private async pump() {
    if (this.playing || !this.queue.length || this.closed) return;
    const clip = this.queue[0];
    this.playing = true;
    if (clip.first) {
      this.announced = true;
      this.ev.onSpeaking(true, clip.kind, clip.line);
    }
    const gen = this.generation;
    const buffer = await clip.audio;
    if (gen !== this.generation || this.closed) return; // interrupted while it was loading
    this.queue.shift();
    if (!buffer || !this.out) {
      this.playing = false;
      this.next();
      return;
    }
    const src = this.opts.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.out);
    this.source = src;
    src.onended = () => {
      if (this.source !== src) return;
      this.source = null;
      this.playing = false;
      this.next();
    };
    if (this.opts.ctx.state === 'suspended') await this.opts.ctx.resume().catch(() => undefined);
    src.start();
  }

  private next() {
    if (this.queue.length) void this.pump();
    else this.drained();
  }

  private drained() {
    if (this.announced) {
      this.announced = false;
      this.ev.onSpeaking(false, null);
    }
    this.applyListening();
  }

  // ------------------------------------------------------------------ capture
  private applyListening() {
    const on = this.listening && !this.muted && !this.busy;
    if (on) {
      this.vad?.resume();
      if (!this.rec || this.rec.state !== 'recording') this.startRecorder();
    } else {
      this.vad?.pause();
      this.uttering = false;
      if (!this.listening || this.muted) this.stopRecorder(true);
    }
  }

  private startRecorder() {
    if (this.closed) return;
    try {
      const rec = new MediaRecorder(this.opts.stream);
      this.chunks = [];
      rec.ondataavailable = (e) => { if (e.data.size) this.chunks.push(e.data); };
      rec.start();
      this.rec = rec;
      this.recStartedAt = performance.now();
    } catch {
      this.ev.onFatal('Recording is not supported in this browser.', 'unavailable');
    }
  }

  private stopRecorder(discard: boolean): Promise<Blob | null> {
    const rec = this.rec;
    this.rec = null;
    if (!rec || rec.state !== 'recording') return Promise.resolve(null);
    return new Promise((resolve) => {
      const type = rec.mimeType || 'audio/webm';
      rec.onstop = () => resolve(discard ? null : new Blob(this.chunks, { type }));
      try { rec.stop(); } catch { resolve(null); }
    });
  }

  private recycleIfIdle() {
    if (this.uttering || !this.rec || this.rec.state !== 'recording') return;
    if (performance.now() - this.recStartedAt < IDLE_RECYCLE_MS) return;
    void this.stopRecorder(true).then(() => { if (this.listening && !this.muted && !this.busy) this.startRecorder(); });
  }

  private async finishUtterance(durationMs: number) {
    const blob = await this.stopRecorder(false);
    if (this.listening && !this.muted && !this.busy) this.startRecorder();
    if (!blob || blob.size === 0) {
      this.ev.onFinal('', { durationMs });
      return;
    }
    let text = '';
    try {
      text = await this.opts.transcribe(blob);
    } catch (e) {
      this.ev.onWarning?.((e as Error)?.message || 'Could not hear that.');
    }
    this.ev.onFinal(text, { durationMs });
  }
}
