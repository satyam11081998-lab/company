/**
 * Fake-microphone audio for the STT E2E: leading silence (VAD calibration), then N
 * speech-like bursts (voiced harmonics with a syllable envelope) separated by pauses
 * long enough for the VAD to end each turn. 48 kHz mono 16-bit PCM WAV.
 *   node make-speech-wav.cjs out.wav [bursts]
 */
const fs = require('fs');
const out = process.argv[2] || 'speech.wav';
const bursts = Number(process.argv[3] || 6);
const SR = 48000;
const seg = [];
const silence = (ms) => seg.push(new Float32Array(Math.round(SR * ms / 1000)));
const voice = (ms, f0) => {
  const n = Math.round(SR * ms / 1000);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const syll = 0.55 + 0.45 * Math.sin(2 * Math.PI * 4 * t);          // ~4 syllables/s
    const env = Math.min(1, i / (SR * 0.03), (n - i) / (SR * 0.03));
    let v = 0;
    for (let h = 1; h <= 6; h++) v += Math.sin(2 * Math.PI * f0 * h * t) / h;
    a[i] = 0.35 * env * syll * v;
  }
  seg.push(a);
};
silence(2500);
for (let b = 0; b < bursts; b++) { voice(1400, 140 + 15 * b); silence(6500); }
const total = seg.reduce((s, a) => s + a.length, 0);
const buf = Buffer.alloc(44 + total * 2);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + total * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36);
buf.writeUInt32LE(total * 2, 40);
let o = 44;
for (const a of seg) for (let i = 0; i < a.length; i++) { buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(a[i] * 32767))), o); o += 2; }
fs.writeFileSync(out, buf);
console.log(`[make-speech-wav] ${out} ${(total / SR).toFixed(1)}s`);
