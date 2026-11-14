/**
 * Behavioural emails — the ones that go to one person because of one thing they
 * did, not to a list.
 *
 * These are rendered PLAIN on purpose. No wrapper layout, no logo, no card
 * borders, no image, no tracking pixel, one link. Two reasons:
 *
 *   1. Inbox placement. Gmail sorts on structure as much as words. A short
 *      one-link message with a text/plain twin reads as correspondence; the same
 *      words inside a 600px branded table with four links and a pixel read as a
 *      newsletter and land in Promotions. The daily digest can afford Promotions
 *      (people go looking for it). A "you left this half-finished" email cannot.
 *   2. It is true. One person, one behaviour, one question — a template frame
 *      around that is a costume.
 *
 * Every one of these invites a reply. A reply is the strongest positive signal a
 * mailbox provider can see, and at MECE's size the answer is worth more than the
 * metric.
 */
import type { NudgeKind, NudgeTarget } from './recipients';
import type { ContentMarket } from '@/lib/market';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mece.in').replace(/\/+$/, '');

/**
 * What an abandoner is offered for telling you why they left.
 *
 * Edit this one line to change the offer everywhere. Keep it something you will
 * actually honour by hand — at this scale you are the fulfilment system, and an
 * offer you quietly drop costs more than the feedback was worth.
 */
const FEEDBACK_OFFER = 'I’ll put a free month on your account for it.';

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function firstName(name: string | null, email: string): string {
  const n = (name || '').trim().split(/\s+/)[0];
  if (n && n.length >= 2 && /^[\p{L}'’-]+$/u.test(n)) return n;
  const local = email.split('@')[0].split(/[._-]/)[0];
  return local && /^[a-z]{2,}$/i.test(local) ? local.charAt(0).toUpperCase() + local.slice(1) : 'there';
}

export interface NudgeMail {
  subject: string;
  /** Minimal HTML: paragraphs and one link. */
  html: string;
  /** The real text/plain part, written by hand rather than stripped from HTML. */
  text: string;
  /** For the dedupe key and the cooldown. */
  sourceId: string;
}

/**
 * The copy. One function per bucket so each reads like something a person would
 * send, instead of one template with the nouns swapped.
 */
function copyFor(t: NudgeTarget, market: ContentMarket): { subject: string; paras: string[]; link: { label: string; url: string } } {
  const name = firstName(t.user.name, t.user.email);
  const sizing = market === 'US' ? 'market sizing question' : 'guesstimate';
  const caseRef = t.caseTitle ? `“${t.caseTitle}”` : 'the case you opened';
  const caseUrl = t.caseId ? `${SITE}/cases/${t.caseId}` : `${SITE}/practice`;

  if (t.kind === 'abandoned') {
    return {
      // No brand prefix, no "we noticed". The subject is the fact.
      subject: t.caseTitle ? `You left ${clipTitle(t.caseTitle)} half-done` : 'You left a case half-done',
      paras: [
        `Hi ${name},`,
        `You opened ${caseRef} ${t.daysAgo === 1 ? 'yesterday' : `${t.daysAgo} days ago`} and didn’t finish it. It’s still there — your structure, your numbers, exactly where you stopped.`,
        `If you’d rather tell me why you stopped than go back to it, reply to this email with one line. That’s more useful to me than another finished case, and ${FEEDBACK_OFFER}`,
      ],
      link: { label: 'Pick it back up', url: caseUrl },
    };
  }

  if (t.kind === 'finished') {
    const scored = typeof t.score === 'number' ? ` You scored ${Math.round(t.score)}.` : '';
    return {
      subject: `One case in ${t.daysAgo} days`,
      paras: [
        `Hi ${name},`,
        `You finished ${caseRef} ${t.daysAgo} days ago.${scored} Nothing since.`,
        `One case tells you almost nothing — the score moves around by ten points on mood alone. Three or four is where you start seeing which part of your thinking is actually weak: the structure, the arithmetic, or the recommendation at the end.`,
        `Today’s ${sizing} takes about ten minutes.`,
      ],
      link: { label: 'Do today’s one', url: `${SITE}/practice` },
    };
  }

  return {
    subject: 'You signed up and stopped there',
    paras: [
      `Hi ${name},`,
      `You made a MECE account ${t.daysAgo === 1 ? 'yesterday' : `${t.daysAgo} days ago`} and haven’t opened a case yet.`,
      `Start with a ${sizing} rather than a full case — it’s ten minutes, there’s no preparation, and you get a scored structure at the end instead of a pat on the back.`,
      `If something about the site got in the way, reply and tell me. I read every one.`,
    ],
    link: { label: `Try one ${sizing}`, url: `${SITE}/practice` },
  };
}

function clipTitle(s: string, max = 44): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length <= max ? `“${t}”` : `“${t.slice(0, max - 1).replace(/[\s,;:.]+$/, '')}…”`;
}

/**
 * Render one nudge. `unsubscribeUrl` is required: these are marketing mail under
 * every definition that matters, so they carry a real unsubscribe link and the
 * one-click header, even though they read like a personal note.
 */
export function renderNudge(t: NudgeTarget, market: ContentMarket, unsubscribeUrl: string): NudgeMail {
  const { subject, paras, link } = copyFor(t, market);

  const html = [
    '<!doctype html><html><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>${esc(subject)}</title></head>`,
    '<body style="margin:0;padding:0;background:#ffffff;">',
    '<div style="max-width:560px;margin:0;padding:20px 16px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1A2233;">',
    ...paras.map((p) => `<p style="margin:0 0 14px;">${esc(p)}</p>`),
    `<p style="margin:0 0 20px;"><a href="${esc(link.url)}" style="color:#C8102E;font-weight:600;">${esc(link.label)}</a></p>`,
    '<p style="margin:0 0 4px;">— Satyam</p>',
    '<p style="margin:0;font-size:12px;color:#8A919C;">MECE · mece.in · ',
    `<a href="${esc(unsubscribeUrl)}" style="color:#8A919C;">unsubscribe</a></p>`,
    '</div></body></html>',
  ].join('');

  const text = [
    ...paras,
    `${link.label}: ${link.url}`,
    '',
    '— Satyam',
    'MECE · mece.in',
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join('\n\n');

  return { subject, html, text, sourceId: `lifecycle:${t.kind}` };
}

/** Human label for the admin screen. */
export const NUDGE_LABEL: Record<NudgeKind, string> = {
  abandoned: 'Left a case unfinished',
  finished: 'Finished one, not back since',
  never_started: 'Signed up, never started',
};
