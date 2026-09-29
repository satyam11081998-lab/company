/**
 * Browser E2E harness for STT talk mode: mounts the REAL VoiceInterview component
 * (real VAD, MediaRecorder, /transcribe, TTS queue, /speak playback). The only glue is
 * `onSend`, which does what ConversationalSolve.send('voice', text, 'stt') does on the
 * wire: postMessageStream with channel 'stt' and a turn id, piping tokens to the
 * component's registered sinks. Bundled by build-harness.cjs; never part of the app build.
 */
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import VoiceInterview from '@/components/solve/VoiceInterview';
import { newTurnId, postMessageStream } from '@/lib/interview-api';

const w = window as unknown as { __errors: string[]; __sends: { text: string; silent: boolean; reply: string }[] };
w.__errors = [];
w.__sends = [];
window.addEventListener('error', (e) => w.__errors.push(String(e.message)));

let tokenSink: ((c: string) => void) | null = null;
let doneSink: (() => void) | null = null;

async function onSend(text: string): Promise<boolean> {
  const r = await postMessageStream('a1', 'test-token', { content: text, kind: 'voice', channel: 'stt', turn_id: newTurnId() }, {
    onToken: (c) => tokenSink?.(c),
    onDone: () => doneSink?.(),
  });
  w.__sends.push({ text, silent: r.silent, reply: r.assistantText });
  return true;
}

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <>
      <Toaster />
      <VoiceInterview
        token="test-token"
        onSend={onSend}
        registerTokenSink={(s) => { tokenSink = s; }}
        registerDoneSink={(s) => { doneSink = s; }}
        messages={[]}
        onClose={() => {}}
        onSubmitSession={() => {}}
        voiceOut={false}
        attemptId="a1"
        caseId="c1"
      />
    </>,
  );
}
