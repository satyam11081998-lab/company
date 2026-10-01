/**
 * Model-led realtime voice interviewer (backend VOICE_INTERVIEWER=model_led).
 *
 * In this mode the realtime speech model IS the interviewer: it answers the
 * candidate by itself, the way ChatGPT voice converses. The backend coaches
 * alongside (/voice-coach) and hands out what only it may (/voice-tool: hints,
 * and the worked answer once the candidate has insisted).
 *
 * This file is transport-agnostic and has no browser dependencies, so the
 * guardrail can be tested without a microphone.
 */

/** The steer sent when the spoken-output guardrail trips. */
export const ANSWER_LEAK_STEER =
  'You started giving away the answer. Stop there. Offer a way of thinking or a framework instead, ' +
  'and remind them the full worked answer is on their results page when they finish.';

const ANSWER_PHRASE =
  /\b(the|my|our|your|final)\s+(final\s+)?(answer|estimate|number|figure|result)\s+(is|would be|comes to|should be|works out to)\b/i;
const SOLUTION_PHRASE = /\b(here'?s|here is|let me give you|i'?ll give you)\s+(the\s+)?(full|complete|whole|entire)\s+(solution|answer|working)\b/i;
const HAS_NUMBER = /\d/;

/**
 * Live guardrail on what the interviewer is SAYING, checked as the transcript
 * streams. True when, before the answer is allowed, a sentence states a final
 * answer with a number in it, or announces the full solution. Deliberately
 * narrow: a hint that mentions numbers ("start from 1.1 crore people") is fine.
 */
export function answerLeakTripwire(spokenSoFar: string, answerAllowed: boolean): boolean {
  if (answerAllowed) return false;
  const text = spokenSoFar || '';
  if (SOLUTION_PHRASE.test(text)) return true;
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.some((s) => ANSWER_PHRASE.test(s) && HAS_NUMBER.test(s));
}

export interface ToolCall {
  name: string;
  callId: string;
  arguments: string;
}

/**
 * A function call the realtime model finished, from a `response.output_item.done`
 * event (GA). Returns null for anything that is not a complete function call.
 */
export function toolCallFromEvent(evt: any): ToolCall | null {
  if (!evt || evt.type !== 'response.output_item.done') return null;
  const item = evt.item;
  if (!item || item.type !== 'function_call' || !item.name || !item.call_id) return null;
  return { name: String(item.name), callId: String(item.call_id), arguments: String(item.arguments ?? '{}') };
}

/** What the model hears when a tool call could not be served. */
export const TOOL_UNAVAILABLE_OUTPUT =
  'The hint service is unavailable right now. Give a short, simple nudge yourself, without giving the answer, ' +
  'and hand the floor back.';
