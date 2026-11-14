/**
 * Upgrade emails — who is worth asking to pay, and what to say to each.
 *
 * PURE: no database, no environment, no '@/…' runtime import. Everything here
 * can be unit-tested offline, and is (scripts/crm-tests/upgrade.test.ts).
 *
 * Three rules shape this file.
 *
 *   1. Nobody is asked to pay before the product has done something for them.
 *      A free account with fewer than three finished cases gets no upgrade
 *      email at all — the behavioural nudges cover them. Asking a stranger for
 *      money is how a sender earns spam complaints.
 *   2. Every sentence about the product is a limit that exists in lib/tier.ts.
 *      Free: the daily case and guesstimate, one attempt per case. Lite: the
 *      bank and re-attempts. Pro: the worked figures. Nothing here promises a
 *      discount, a deadline or a result, because none of those exist.
 *   3. The email says why THIS person is getting it — their own counts and
 *      scores — or it is not sent. The same numbers are shown to the reviewer.
 */

export type UpgradeSegment =
  /** Paid plan ends within five days. */
  | 'expiring'
  /** Paid plan ended 1–45 days ago. */
  | 'lapsed'
  /** Active Lite, three or more cases this month. */
  | 'lite_to_pro'
  /** Free, score has climbed across at least three scored cases. */
  | 'improving'
  /** Free, four or more scored cases and the score is not moving. */
  | 'plateau'
  /** Free, four or more cases in thirty days. */
  | 'habit';

export const UPGRADE_LABEL: Record<UpgradeSegment, string> = {
  expiring: 'Plan ending soon',
  lapsed: 'Plan ended',
  lite_to_pro: 'Lite, active',
  improving: 'Free, improving',
  plateau: 'Free, stuck',
  habit: 'Free, regular',
};

export interface UpgradeInput {
  /** Stored subscription tier, whatever the expiry says. */
  storedTier: 'free' | 'lite' | 'pro';
  /** ISO expiry, or null. */
  expiresAt: string | null;
  /** Finished cases, OLDEST FIRST. */
  submits: Array<{ at: string; score: number | null; title: string | null }>;
  now?: number;
}

export interface UpgradeFacts {
  segment: UpgradeSegment;
  plan: 'lite' | 'pro' | null;
  total: number;
  last30: number;
  firstScore: number | null;
  lastScore: number | null;
  low: number | null;
  high: number | null;
  lastTitle: string | null;
  daysSinceLast: number | null;
  /** Positive = days until the plan ends; negative = days since it ended. */
  expiryDays: number | null;
  expiresOn: string | null;
}

export interface Offer {
  liteMonthly: number;
  proMonthly: number;
  proQuarter: number;
  /** Whole-number percentage saved by the 3-month Pro prepay. */
  proQuarterSaving: number;
}

const DAY = 86_400_000;

/**
 * Classify one account. Returns null when no upgrade email is warranted —
 * which is the common case, and the correct one.
 */
export function classifyUpgrade(i: UpgradeInput): UpgradeFacts | null {
  const now = i.now ?? Date.now();
  const subs = i.submits.filter((s) => s && s.at && !Number.isNaN(new Date(s.at).getTime()));
  const scored = subs.map((s) => s.score).filter((n): n is number => typeof n === 'number' && Number.isFinite(n));
  const last = subs[subs.length - 1] ?? null;
  const last30 = subs.filter((s) => now - new Date(s.at).getTime() <= 30 * DAY).length;
  const daysSinceLast = last ? Math.floor((now - new Date(last.at).getTime()) / DAY) : null;

  const exp = i.expiresAt ? new Date(i.expiresAt).getTime() : null;
  const expValid = exp !== null && !Number.isNaN(exp);
  const paidStored = i.storedTier === 'lite' || i.storedTier === 'pro';
  const active = paidStored && (!expValid || (exp as number) > now);
  const expiryDays = paidStored && expValid ? Math.ceil(((exp as number) - now) / DAY) : null;

  const base = {
    plan: paidStored ? (i.storedTier as 'lite' | 'pro') : null,
    total: subs.length,
    last30,
    firstScore: scored.length ? scored[0] : null,
    lastScore: scored.length ? scored[scored.length - 1] : null,
    low: scored.length ? Math.min(...scored) : null,
    high: scored.length ? Math.max(...scored) : null,
    lastTitle: last?.title ?? null,
    daysSinceLast,
    expiryDays,
    expiresOn: expValid ? new Date(exp as number).toISOString().slice(0, 10) : null,
  };

  if (active && expiryDays !== null && expiryDays >= 0 && expiryDays <= 5) return { segment: 'expiring', ...base };
  if (paidStored && !active && expiryDays !== null && expiryDays <= -1 && expiryDays >= -45) return { segment: 'lapsed', ...base };
  if (active) {
    // An active Pro account has nothing to be sold. Active Lite only if in use.
    if (i.storedTier === 'lite' && last30 >= 3) return { segment: 'lite_to_pro', ...base };
    return null;
  }

  // Free from here. Only people who are here NOW — a fortnight of silence means
  // the conversation to have is "come back", not "pay".
  if (daysSinceLast === null || daysSinceLast > 14) return null;
  if (subs.length < 3) return null;

  // Scores are compared on their own scale (0–10 or 0–100), never assumed.
  const scale = scored.length && Math.max(...scored) <= 10 ? 10 : 100;
  const step = scale * 0.08;
  if (scored.length >= 3 && (base.lastScore as number) - (base.firstScore as number) >= step) return { segment: 'improving', ...base };
  if (scored.length >= 4 && (base.high as number) - (base.low as number) <= step * 1.5) return { segment: 'plateau', ...base };
  if (last30 >= 4) return { segment: 'habit', ...base };
  return null;
}

/** One line for the reviewer: the facts that put this person in this segment. */
export function whyLine(f: UpgradeFacts): string {
  const sc = (n: number | null) => (n === null ? '?' : String(Math.round(n * 10) / 10));
  switch (f.segment) {
    case 'expiring':
      return `${cap(f.plan)} ends ${f.expiresOn} (${f.expiryDays === 0 ? 'today' : `in ${f.expiryDays}d`}); ${f.last30} cases in 30d`;
    case 'lapsed':
      return `${cap(f.plan)} ended ${f.expiresOn} (${Math.abs(f.expiryDays as number)}d ago); ${f.last30} cases in 30d`;
    case 'lite_to_pro':
      return `Active Lite; ${f.last30} cases in 30d, ${f.total} in all`;
    case 'improving':
      return `Free; score ${sc(f.firstScore)} → ${sc(f.lastScore)} over ${f.total} cases; last one ${f.daysSinceLast}d ago`;
    case 'plateau':
      return `Free; ${f.total} cases all scoring ${sc(f.low)}–${sc(f.high)}; last one ${f.daysSinceLast}d ago`;
    default:
      return `Free; ${f.last30} cases in 30d, ${f.total} in all; last one ${f.daysSinceLast}d ago`;
  }
}

const cap = (s: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Plan');
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const round = (n: number | null) => (n === null ? '' : String(Math.round(n)));

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function firstNameOf(name: string | null, email: string): string {
  const n = (name || '').trim().split(/\s+/)[0];
  if (n && n.length >= 2 && /^[\p{L}'’-]+$/u.test(n)) return n.charAt(0).toUpperCase() + n.slice(1);
  const local = email.split('@')[0].split(/[._-]/)[0];
  return local && /^[a-z]{2,}$/i.test(local) ? local.charAt(0).toUpperCase() + local.slice(1) : 'there';
}

function clip(s: string, max = 48): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).replace(/[\s,;:.]+$/, '')}…`;
}

function when(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

interface Copy {
  subject: string;
  paras: string[];
  link: string;
}

function copyFor(f: UpgradeFacts, name: string, o: Offer): Copy {
  const price = `${inr(o.proMonthly)} a month, or ${inr(o.proQuarter)} for three months`;
  const lastCase = f.lastTitle ? `“${clip(f.lastTitle)}”` : 'your latest one';
  const sign = 'If it isn’t worth it to you, reply and tell me why. I read every reply, and that answer is more use to me than the money.';

  switch (f.segment) {
    case 'improving':
      return {
        subject: `${round(f.firstScore)} to ${round(f.lastScore)} in ${f.total} cases`,
        paras: [
          `Hi ${name},`,
          `Your first case on MECE scored ${round(f.firstScore)}. ${cap(lastCase)} scored ${round(f.lastScore)}. That is ${f.total} cases, and the line is going the right way.`,
          `Here is the part the free plan can’t do for you: every case is a single attempt. You can’t go back to the one that went badly, redo it a week later and find out whether the fix actually held — and that is how a jump like yours turns into a score you can rely on in the room.`,
          `Pro opens re-attempts on every case, the whole bank instead of the daily two, and the worked figures for each case so you can put your structure next to a complete one. It is ${price}.`,
          sign,
        ],
        link: 'See what Pro adds',
      };
    case 'plateau':
      return {
        subject: `${f.total} cases, and the score hasn’t moved`,
        paras: [
          `Hi ${name},`,
          `You have finished ${f.total} cases on MECE and every one has scored between ${round(f.low)} and ${round(f.high)}.`,
          `When a score sits still like that it is rarely a knowledge gap. It is usually that you can see your own answer but not a complete one beside it, so the same piece goes missing every time and nothing tells you which piece.`,
          `That is what Pro is for. It adds the worked figures for every case — the profit bridge, the 2×2, the driver tree the case really breaks into — and lets you re-attempt a case after you have seen them. It is ${price}.`,
          sign,
        ],
        link: 'See the worked figures in Pro',
      };
    case 'habit':
      return {
        subject: `${f.last30} cases this month`,
        paras: [
          `Hi ${name},`,
          `You have finished ${f.last30} cases on MECE in the last thirty days. That is somebody doing the daily one and then running out.`,
          `The free plan stops at the daily case and the daily guesstimate, one attempt each. Pro is the whole bank, as many a day as you want, with re-attempts and the worked figures for every case.`,
          `It is ${price}. If your interviews are this season, the three-month one works out ${o.proQuarterSaving}% cheaper.`,
          sign,
        ],
        link: 'Open the whole bank',
      };
    case 'lite_to_pro':
      return {
        subject: 'The one thing Lite doesn’t show you',
        paras: [
          `Hi ${name},`,
          `You are on Lite and you have finished ${f.last30} cases this month, so you are using what you paid for.`,
          `Lite is volume: the bank and the re-attempts. What it leaves out is the worked figures — the profit bridge, the 2×2, the driver tree each case actually breaks into — which is the part that shows you what your structure was missing rather than only that it was.`,
          `Pro has them for every case. It is ${inr(o.proMonthly)} a month against the ${inr(o.liteMonthly)} you pay now.`,
          'If Lite is enough for you, ignore this — I won’t send it again.',
        ],
        link: 'Compare Lite and Pro',
      };
    case 'expiring':
      return {
        subject: `Your ${cap(f.plan)} plan ends ${when(f.expiryDays as number)}`,
        paras: [
          `Hi ${name},`,
          `Your ${cap(f.plan)} plan on MECE ends ${when(f.expiryDays as number)}${f.expiresOn ? ` (${f.expiresOn})` : ''}. After that the account goes back to the free plan: the daily case and guesstimate, one attempt each.`,
          f.last30 > 0
            ? `You have finished ${f.last30} ${f.last30 === 1 ? 'case' : 'cases'} in the last thirty days, so I am assuming you are still preparing.`
            : 'You haven’t done a case in the last thirty days, so if you are finished with interviews, ignore this — and congratulations.',
          `If you want to keep it, three months of Pro is ${inr(o.proQuarter)}, which is ${o.proQuarterSaving}% less than paying ${inr(o.proMonthly)} monthly.`,
        ],
        link: 'Keep my plan',
      };
    default:
      return {
        subject: `Your ${cap(f.plan)} plan ended ${Math.abs(f.expiryDays as number)} days ago`,
        paras: [
          `Hi ${name},`,
          `Your ${cap(f.plan)} plan on MECE ended ${Math.abs(f.expiryDays as number)} days ago. You are back on the free plan: the daily case and guesstimate, one attempt each.`,
          'If you stopped because your placements are done — congratulations, and ignore this.',
          'If you stopped because it wasn’t worth the money, reply and tell me what was missing. That is the most useful email I could get this week.',
          `And if it simply slipped: Pro is ${price}.`,
        ],
        link: 'Renew',
      };
  }
}

export interface UpgradeMail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Render one upgrade email. Plain on purpose, like the behavioural nudges: no
 * layout table, no image, one link. `unsubscribe` may be the literal token
 * `{{UNSUBSCRIBE}}`, which the outbox replaces per recipient in both parts.
 */
export function renderUpgrade(f: UpgradeFacts, to: { name: string | null; email: string }, o: Offer, site: string, unsubscribe: string): UpgradeMail {
  const c = copyFor(f, firstNameOf(to.name, to.email), o);
  const url = `${site.replace(/\/+$/, '')}/upgrade`;
  const html = [
    '<!doctype html><html><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>${esc(c.subject)}</title></head>`,
    '<body style="margin:0;padding:0;background:#ffffff;">',
    '<div style="max-width:560px;margin:0;padding:20px 16px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1A2233;">',
    ...c.paras.map((p) => `<p style="margin:0 0 14px;">${esc(p)}</p>`),
    `<p style="margin:0 0 20px;"><a href="${esc(url)}" style="color:#C8102E;font-weight:600;">${esc(c.link)}</a></p>`,
    '<p style="margin:0 0 4px;">— Satyam</p>',
    '<p style="margin:0;font-size:12px;color:#8A919C;">MECE · mece.in · ',
    `<a href="${esc(unsubscribe)}" style="color:#8A919C;">unsubscribe</a></p>`,
    '</div></body></html>',
  ].join('');
  const text = [...c.paras, `${c.link}: ${url}`, '', '— Satyam', '', `MECE · mece.in · unsubscribe: ${unsubscribe}`].join('\n\n').replace(/\n{3,}/g, '\n\n');
  return { subject: c.subject, html, text };
}
