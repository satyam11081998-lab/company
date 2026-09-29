/**
 * Browser E2E harness: mounts the REAL VoiceInterviewRealtime component (unmodified)
 * outside Next.js so it can be driven against the mock realtime peer + the real backend
 * routes. Bundled by build-harness.cjs; never part of the app build output.
 */
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import VoiceInterviewRealtime from '@/components/solve/VoiceInterviewRealtime';

const w = window as unknown as { __log: string[]; __closed?: boolean; __errors: string[] };
w.__log = [];
w.__errors = [];
const origLog = console.log;
console.log = (...a: unknown[]) => {
  w.__log.push(a.map(String).join(' '));
  origLog(...a);
};
window.addEventListener('error', (e) => w.__errors.push(String(e.message)));

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <>
      <Toaster />
      <VoiceInterviewRealtime
        token="test-token"
        caseId="c1"
        attemptId="a1"
        messages={[]}
        onTurnPersisted={() => {}}
        onClose={() => {
          w.__closed = true;
        }}
        onSubmitSession={() => {}}
      />
    </>,
  );
}
