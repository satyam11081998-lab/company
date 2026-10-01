/**
 * Browser E2E harness: mounts the REAL VoiceInterviewGemini component (unmodified)
 * outside Next.js, against the mock Gemini Live server + the real backend routes.
 */
import { createRoot } from 'react-dom/client';
import VoiceInterviewGemini from '@/components/solve/VoiceInterviewGemini';

const w = window as unknown as { __log: string[]; __played: number };
w.__log = [];
w.__played = 0;
for (const k of ['log', 'warn'] as const) {
  const orig = console[k];
  console[k] = (...a: unknown[]) => { w.__log.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')); orig(...a); };
}
// Count interviewer audio actually scheduled for playback.
const origStart = AudioBufferSourceNode.prototype.start;
AudioBufferSourceNode.prototype.start = function (...args: any[]) { w.__played += 1; return (origStart as any).apply(this, args); };
const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <VoiceInterviewGemini token="test-token" caseId="c1" attemptId="a1" onClose={() => {}} onSubmitSession={() => {}} onTurnPersisted={() => {}} />,
  );
}
