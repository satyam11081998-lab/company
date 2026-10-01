/**
 * Browser E2E harness: mounts the REAL VoiceInterviewRealtime component (unmodified)
 * outside Next.js, driven against the mock realtime peer + the real backend routes.
 * Bundled by build-harness.cjs; never part of the app build.
 */
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import VoiceInterviewRealtime from '@/components/solve/VoiceInterviewRealtime';

const w = window as unknown as { __log: string[]; __closed?: boolean };
w.__log = [];
for (const k of ['log', 'warn'] as const) {
  const orig = console[k];
  console[k] = (...a: unknown[]) => { w.__log.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')); orig(...a); };
}
const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <>
      <Toaster />
      <VoiceInterviewRealtime token="test-token" caseId="c1" attemptId="a1" messages={[]}
        onTurnPersisted={() => {}} onClose={() => { w.__closed = true; }} onSubmitSession={() => {}} />
    </>,
  );
}
