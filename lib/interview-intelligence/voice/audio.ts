/**
 * Audio plumbing shared by both transports and the lobby's mic check.
 *
 * iOS Safari only lets a page play sound if the AudioContext was created (or resumed) inside a
 * user gesture. The call creates ONE context in the "Start interview" click handler and every
 * later sound goes through it, so audio keeps working several async hops later.
 */

export function createAudioContext(): AudioContext {
  const Ctor = window.AudioContext
    || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** RMS level meter (0..1) on any audio node. Never connected to the speakers. */
export class LevelMeter {
  private analyser: AnalyserNode;
  private buf: Uint8Array;
  private smoothed = 0;

  constructor(ctx: AudioContext, source: AudioNode, private gain = 5) {
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.4;
    this.buf = new Uint8Array(this.analyser.fftSize);
    source.connect(this.analyser);
  }

  read(): number {
    this.analyser.getByteTimeDomainData(this.buf as unknown as Uint8Array<ArrayBuffer>);
    let sum = 0;
    for (let i = 0; i < this.buf.length; i++) {
      const v = (this.buf[i] - 128) / 128;
      sum += v * v;
    }
    const level = Math.min(1, Math.sqrt(sum / this.buf.length) * this.gain);
    // fast attack, slow release: reads like a voice, not a flicker
    this.smoothed = level > this.smoothed ? level : this.smoothed * 0.85 + level * 0.15;
    return this.smoothed;
  }

  disconnect() {
    try { this.analyser.disconnect(); } catch { /* already gone */ }
  }
}

/** Meter for a MediaStream (local mic or the remote interviewer track). */
export function meterForStream(ctx: AudioContext, stream: MediaStream, gain = 5): { meter: LevelMeter; dispose: () => void } {
  const src = ctx.createMediaStreamSource(stream);
  const meter = new LevelMeter(ctx, src, gain);
  return {
    meter,
    dispose: () => {
      meter.disconnect();
      try { src.disconnect(); } catch { /* already gone */ }
    },
  };
}

export const MIC_CONSTRAINTS = (deviceId?: string | null): MediaStreamConstraints => ({
  audio: {
    ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
});

/** Ask for the mic; maps the browser's errors to something a candidate can act on. */
export async function openMic(deviceId?: string | null): Promise<MediaStream> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('This browser cannot use a microphone here. Try Chrome, Edge or Safari, or use chat.');
  }
  try {
    return await navigator.mediaDevices.getUserMedia(MIC_CONSTRAINTS(deviceId));
  } catch (e) {
    const name = (e as DOMException)?.name;
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      throw new Error('Microphone access is blocked. Allow it from the lock icon in the address bar, then try again.');
    }
    if (name === 'NotFoundError' || name === 'OverconstrainedError') {
      throw new Error('No microphone was found. Plug one in or pick another, or use chat.');
    }
    if (name === 'NotReadableError') {
      throw new Error('Your microphone is in use by another app. Close it (Zoom, Meet, Teams…) and try again.');
    }
    throw new Error('Could not open the microphone. Try again, or use chat.');
  }
}

export async function listMics(): Promise<{ id: string; label: string }[]> {
  try {
    const all = await navigator.mediaDevices.enumerateDevices();
    return all.filter((d) => d.kind === 'audioinput')
      .map((d, i) => ({ id: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
  } catch {
    return [];
  }
}

export function supportsLiveVoice(): boolean {
  return typeof window !== 'undefined' && 'RTCPeerConnection' in window && !!navigator.mediaDevices?.getUserMedia;
}

export function supportsStandardVoice(): boolean {
  return typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;
}

export function supportsGeminiVoice(): boolean {
  return typeof window !== 'undefined' && 'WebSocket' in window && !!navigator.mediaDevices?.getUserMedia
    && !!(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);
}
