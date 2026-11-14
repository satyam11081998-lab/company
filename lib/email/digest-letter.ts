/**
 * The nightly email, as a letter.
 *
 * PURE: no database, no environment. Tested offline in
 * scripts/crm-tests/lifecycle.test.ts.
 *
 * This replaced a branded newsletter — navy header, logo image, three bordered
 * cards, a "more from the bank" table, three social icons, a dozen links — that
 * landed in Spam on its first send (2026-11-14). Nothing about a message can
 * guarantee the inbox, but everything a filter reads as "bulk promotion" was in
 * that layout, so all of it is gone:
 *
 *   · no images at all (a new sending domain with images and little text is the
 *     classic shape of junk);
 *   · no layout tables, no buttons, no coloured bands;
 *   · at most four links, every one to www.mece.in;
 *   · a real text/plain part written by hand, not stripped from the HTML;
 *   · signed by a person, with a Reply-To a person reads.
 *
 * The other half of the brief: the old email opened with the constant heading
 * "Your MECE practice for today", so the subject, the preview line and the first
 * line on screen said the same nothing three times. Here the subject is the
 * question, the preview line is something ELSE, and the first thing in the body
 * is the question at reading size.
 */

export type LetterMarket = 'IN' | 'US';

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Trim on a word boundary. */
function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:.\s—-]+$/, '')}…`;
}

const isQuestion = (t: string) => /\?\s*$/.test(t);

/**
 * "Estimate the number of daily metro commuters in Kolkata" → "Daily metro
 * commuters in Kolkata". Only ever REMOVES the instruction at the front; the
 * rest is left exactly as written, so it cannot produce broken grammar the way
 * rewriting it into "How many …?" does when the title carries a clause.
 */
export function coreOf(title: string): string {
  const t = title
    .replace(/\s+/g, ' ')
    .replace(/^\s*(estimate|guesstimate|calculate|work out|figure out|size)\s+(the\s+)?/i, '')
    .replace(/^(total\s+)?number of\s+/i, '')
    .replace(/[.!]\s*$/, '')
    .trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

const dayIndex = (dateKey: string, n: number, shift = 0) => {
  const day = Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86_400_000);
  return Number.isFinite(day) ? (((day + shift) % n) + n) % n : 0;
};

const SUBJECT_MAX = 78;

/**
 * Subject for one day. It is the question, framed three ways in rotation so two
 * nights never read alike, and never brand-prefixed. Deterministic: a preview
 * and the real send always agree.
 */
export function dailySubject(market: LetterMarket, guessTitle: string | null, caseTitle: string | null, dateKey: string): string {
  const guess = (guessTitle || '').replace(/\s+/g, ' ').trim();
  const kase = (caseTitle || '').replace(/\s+/g, ' ').trim();
  if (!guess && !kase) return market === 'US' ? 'Your case practice for today' : 'Your practice for today';
  const i = dayIndex(dateKey, 3);
  const fit = (pre: string, body: string, post: string) => `${pre}${clip(body, SUBJECT_MAX - pre.length - post.length)}${post}`;

  if (!guess) {
    // A case is a situation, not a number — it gets its own three framings.
    return [fit('', kase, ''), fit('', kase.replace(/[.?!]\s*$/, ''), ' — what would you do?'), fit('Tonight’s case: ', kase, '')][i];
  }
  if (isQuestion(guess)) {
    return [fit('', guess, ''), fit('Guess first: ', guess, ''), fit('', guess, ' Ten minutes.')][i];
  }
  const core = coreOf(guess);
  return [fit('', core, ': what’s your number?'), fit('Guess first: ', core, ''), fit('', core, '. Ten minutes.')][i];
}

/**
 * The grey preview line beside the subject. Its one job is to NOT repeat the
 * subject: it says what happens after the click, or names the case instead.
 */
export function dailyPreheader(market: LetterMarket, caseTitle: string | null, dateKey: string): string {
  const kase = (caseTitle || '').replace(/\s+/g, ' ').replace(/[.?!]\s*$/, '').trim();
  const opts = [
    'Write a number down before you open this. Then find out how far off you were.',
    kase ? `And if you have twenty more minutes, a full case: ${kase}.` : 'You get ten minutes, and the structure is scored, not just the answer.',
    'You get ten minutes, and the structure is scored, not just the answer.',
  ];
  // Shifted against the subject's rotation so the pairing changes too.
  return clip(opts[dayIndex(dateKey, opts.length, 1)], 110);
}

export interface LetterInput {
  market: LetterMarket;
  site: string;
  dateKey: string;
  guess: { id: string; title: string } | null;
  kase: { id: string; title: string; difficulty?: string | null } | null;
  /** India only: the top headline for the GD line. */
  headline?: string | null;
  /** Company identity lines for the footer (Companies Act s.12(3)(c)). */
  identity?: string[];
  /** A URL, or the literal token the outbox replaces per recipient. */
  unsubscribe: string;
}

export interface Letter {
  subject: string;
  preheader: string;
  html: string;
  text: string;
  /** How many practice links the letter carries. */
  links: number;
}

export function renderDailyLetter(i: LetterInput): Letter {
  const us = i.market === 'US';
  const site = i.site.replace(/\/+$/, '');
  const subject = dailySubject(i.market, i.guess?.title ?? null, i.kase?.title ?? null, i.dateKey);
  const preheader = dailyPreheader(i.market, i.guess ? i.kase?.title ?? null : null, i.dateKey);
  const sizing = us ? 'market sizing question' : 'guesstimate';
  const P = 'margin:0 0 14px;';
  const A = 'color:#C8102E;font-weight:600;';

  const html: string[] = [];
  const text: string[] = [];
  let links = 0;
  const link = (label: string, url: string) => {
    links += 1;
    html.push(`<p style="margin:0 0 22px;"><a href="${esc(url)}" style="${A}">${esc(label)}</a></p>`);
    text.push(`${label}: ${url}`);
  };

  if (i.guess) {
    html.push(`<p style="margin:0 0 6px;font-size:13px;color:#6B7280;">Tonight’s ${sizing}</p>`);
    html.push(`<p style="margin:0 0 14px;font-size:20px;line-height:1.35;font-weight:700;color:#0F1C33;">${esc(i.guess.title)}</p>`);
    html.push(`<p style="${P}">Write a number down before you click. Then build it properly: you get ten minutes, and it is the structure that gets scored, not just the answer.</p>`);
    text.push(`Tonight’s ${sizing}:`, i.guess.title, 'Write a number down before you click. Then build it properly: you get ten minutes, and it is the structure that gets scored, not just the answer.');
    link('Work it out', `${site}/cases/${i.guess.id}`);
  }
  if (i.kase) {
    const lead = i.guess ? 'If you have twenty more minutes, today’s case:' : 'Tonight’s case:';
    const tail = 'The interviewer pushes back on your structure, then scores it.';
    html.push(`<p style="${P}">${esc(lead)} <strong style="color:#0F1C33;">${esc(i.kase.title)}</strong>${/[.?!]$/.test(i.kase.title.trim()) ? '' : '.'} ${esc(tail)}</p>`);
    text.push(`${lead} ${i.kase.title}`, tail);
    link('Open the case', `${site}/cases/${i.kase.id}`);
  }
  if (!i.guess && !i.kase) {
    html.push(`<p style="${P}">Tonight’s practice is ready.</p>`);
    text.push('Tonight’s practice is ready.');
    link('Open practice', `${site}/practice`);
  }
  if (!us && i.headline) {
    html.push(`<p style="${P}">One for your next group discussion: ${esc(i.headline.replace(/\s+/g, ' ').trim())}</p>`);
    text.push(`One for your next group discussion: ${i.headline.replace(/\s+/g, ' ').trim()}`);
    link('Read the brief', `${site}/gd-briefs`);
  }

  const identity = (i.identity ?? []).filter(Boolean);
  const doc = [
    '<!doctype html><html lang="en"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>${esc(subject)}</title></head>`,
    '<body style="margin:0;padding:0;background:#ffffff;">',
    `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(preheader)}</div>`,
    '<div style="max-width:560px;margin:0;padding:20px 16px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1A2233;">',
    ...html,
    '<p style="margin:0 0 18px;">— Satyam, MECE</p>',
    '<p style="margin:0;font-size:12px;line-height:1.6;color:#8A919C;">',
    identity.length ? `${identity.map(esc).join('<br>')}<br>` : '',
    `You get this because you have a MECE account. <a href="${esc(i.unsubscribe)}" style="color:#8A919C;">Unsubscribe</a></p>`,
    '</div></body></html>',
  ].join('');

  const plain = [...text, '— Satyam, MECE', [...identity, `You get this because you have a MECE account. Unsubscribe: ${i.unsubscribe}`].join('\n')].join('\n\n');
  return { subject, preheader, html: doc, text: plain, links };
}
