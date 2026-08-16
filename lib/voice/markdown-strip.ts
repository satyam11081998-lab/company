/**
 * Strip markdown before handing text to TTS.
 *
 * The interviewer emits `**bold**` (that is why `renderWithBold` exists in
 * ConversationalSolve). Spoken aloud, a TTS engine either reads the asterisks
 * out or stumbles over them. We fix this on the CLIENT rather than in
 * prompts/interview_prompts.py on purpose: those prompts carry the interviewer
 * voice work from 2026-08-01 and every behavioural guardrail in the product.
 * Editing them to solve a rendering problem would risk the interviewer's
 * register for no reason.
 */

/** Characters TTS should never have to pronounce. */
export function stripMarkdown(input: string): string {
  if (!input) return '';

  let out = input;

  // Fenced + inline code. Fences first, or the inner backticks survive.
  out = out.replace(/```[\s\S]*?```/g, ' ');
  out = out.replace(/`([^`]*)`/g, '$1');

  // Links + images: keep the label, drop the URL. A spoken URL is noise.
  out = out.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  out = out.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // Emphasis. Longest markers first so ** is not left as a stray *.
  out = out.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  out = out.replace(/\*\*([^*]+)\*\*/g, '$1');
  out = out.replace(/\*([^*]+)\*/g, '$1');
  out = out.replace(/___([^_]+)___/g, '$1');
  out = out.replace(/__([^_]+)__/g, '$1');
  // Single underscores are left alone: they appear inside identifiers far more
  // often than as emphasis, and "snake_case" should not become "snakecase".

  // Any orphaned emphasis markers left by unbalanced input.
  out = out.replace(/\*+/g, '');

  // Block syntax at line starts: headings, quotes, list bullets, rules.
  out = out.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  out = out.replace(/^\s{0,3}>\s?/gm, '');
  out = out.replace(/^\s{0,3}[-*+]\s+/gm, '');
  out = out.replace(/^\s{0,3}\d+[.)]\s+/gm, '');
  out = out.replace(/^\s{0,3}([-*_]\s?){3,}\s*$/gm, ' ');

  // Collapse whitespace — TTS pauses on newlines and reads a run of them as a
  // long silence, which in a live interview sounds like the line dropped.
  out = out.replace(/\s+/g, ' ').trim();

  return out;
}

/**
 * True when the text has nothing a TTS engine could say. Guards against paying
 * for a /speak call that returns silence (e.g. a chunk that was pure markdown).
 */
export function isSpeakable(text: string): boolean {
  return /[a-z0-9]/i.test(stripMarkdown(text));
}
