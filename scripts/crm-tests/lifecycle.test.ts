/**
 * Lifecycle email — the pure parts. Runs offline inside `npm run test:crm`.
 *
 * Two things are worth testing here and they are both things a reader will
 * judge in an inbox, not things a type checker can catch:
 *
 *   1. The subject line is no longer the constant "Your MECE practice for
 *      today". It has to name the day's real question, rotate its framing
 *      without ever repeating on consecutive days, and fit a phone
 *      notification.
 *   2. The behavioural emails have to render as correspondence — no images, no
 *      table layout, one call to action — with the unsubscribe token replaced
 *      in BOTH the HTML and the text part, and every user-supplied string
 *      escaped.
 *
 * For the real SPF / DKIM / DMARC verdict on the live domain, which needs the
 * network, run `npx tsx scripts/check-deliverability.ts`.
 */
import { test, eq, ok } from './harness';
import { dailySubject } from '../../lib/email/digest';
import { renderNudge } from '../../lib/lifecycle/nudges';
import type { NudgeTarget } from '../../lib/lifecycle/recipients';
import { fromDomain, structuralChecks, worstVerdict, type Check } from '../../lib/lifecycle/deliverability';

const GUESS = 'Estimate the number of air purifiers Delhi households will buy this winter';
const CASE = 'A Pune food-delivery platform’s margins are shrinking';
const WEEK = ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17'];

test('subject: never the old constant, and always names the real question', () => {
  for (const d of WEEK) {
    const s = dailySubject('IN', GUESS, CASE, d);
    ok(s !== 'Your MECE practice for today', `still the constant on ${d}`);
    ok(/air purifiers/i.test(s), `${d}: ${s}`);
  }
});

test('subject: rotates, and never repeats on consecutive days', () => {
  // Held under a CONSTANT title, which is the strict case — in production the
  // title changes daily too, so the subjects differ twice over.
  const subs = WEEK.map((d) => dailySubject('IN', GUESS, CASE, d));
  for (let i = 1; i < subs.length; i++) ok(subs[i] !== subs[i - 1], `${WEEK[i]} repeats ${WEEK[i - 1]}: ${subs[i]}`);
  ok(new Set(subs).size >= 3, `only ${new Set(subs).size} framings in a week`);
});

test('subject: fits a phone notification and never reads awkwardly', () => {
  const long = 'Estimate the total number of electric two-wheelers sold across every tier-two and tier-three city in Maharashtra next year';
  for (const d of WEEK) {
    for (const title of [GUESS, long, 'How many crackers will Delhi burn this Diwali?']) {
      const s = dailySubject('IN', title, CASE, d);
      ok(s.length <= 78, `${s.length} chars: ${s}`);
      // The framings only ever append, or prefix with a bare time word, so they
      // cannot collide with the title's own opening ("Today's number: number…").
      ok(!/number: number|this\? Number of/i.test(s), `awkward: ${s}`);
    }
  }
});

test('subject: deterministic, so a preview matches what was sent', () => {
  eq(dailySubject('IN', GUESS, CASE, WEEK[0]), dailySubject('IN', GUESS, CASE, WEEK[0]));
});

test('subject: falls back to the case, and only goes generic with no content at all', () => {
  ok(/margins/i.test(dailySubject('IN', null, CASE, WEEK[0])));
  eq(dailySubject('IN', null, null, WEEK[0]), 'Your practice for today');
  eq(dailySubject('US', null, null, WEEK[0]), 'Your case practice for today');
});

const target = (kind: NudgeTarget['kind'], over: Partial<NudgeTarget> = {}): NudgeTarget =>
  ({
    user: { id: 'u1', email: 'priya.sharma@example.com', name: 'Priya Sharma', market: 'IN', createdAt: '2026-11-08T00:00:00Z', tier: 'free' },
    kind,
    caseId: 'c1',
    caseTitle: CASE,
    score: 58,
    daysAgo: 2,
    ...over,
  }) as NudgeTarget;

const UNSUB = 'https://www.mece.in/api/unsubscribe?token=abc.def';

test('nudge: the unsubscribe token is replaced in the TEXT part too', () => {
  // The bug this guards: replacing {{UNSUBSCRIBE}} only in the HTML ships a
  // literal "{{UNSUBSCRIBE}}" to every plain-text reader.
  for (const kind of ['abandoned', 'finished', 'never_started'] as const) {
    const m = renderNudge(target(kind), 'IN', UNSUB);
    ok(!/\{\{/.test(m.html), `${kind}: token left in html`);
    ok(!/\{\{/.test(m.text), `${kind}: token left in text`);
    ok(m.html.includes(UNSUB) && m.text.includes(UNSUB), `${kind}: unsubscribe link missing`);
  }
});

test('nudge: renders as correspondence, not as a newsletter', () => {
  for (const kind of ['abandoned', 'finished', 'never_started'] as const) {
    const m = renderNudge(target(kind), 'IN', UNSUB);
    ok(!/<img/i.test(m.html), `${kind}: has an image`);
    ok(!/<table/i.test(m.html), `${kind}: has a table layout`);
    eq((m.html.match(/<a /g) || []).length, 2, `${kind}: link count (want cta + unsubscribe)`);
    ok(m.text.length > 120, `${kind}: text part too thin`);
    ok(m.html.startsWith('<!doctype html>') && m.html.includes('</body>'), `${kind}: not a complete document`);
    ok(!/^MECE/i.test(m.subject), `${kind}: subject is brand-prefixed`);
    ok(m.subject.length <= 78, `${kind}: subject is ${m.subject.length} chars`);
    eq(m.sourceId, `lifecycle:${kind}`, `${kind}: source id drives the cooldown`);
  }
});

test('nudge: names, dates and missing values all degrade sensibly', () => {
  const noName = renderNudge(target('abandoned', { user: { id: 'u', email: 'rahul@example.com', name: null, market: 'IN', createdAt: null, tier: 'free' } as any }), 'IN', UNSUB);
  ok(noName.html.includes('Rahul'), 'should fall back to the email local-part');
  const unusable = renderNudge(target('abandoned', { user: { id: 'u', email: 'x7@example.com', name: '', market: 'IN', createdAt: null, tier: 'free' } as any }), 'IN', UNSUB);
  ok(unusable.html.includes('there'), 'should degrade to "there"');
  const d1 = renderNudge(target('abandoned', { daysAgo: 1 }), 'IN', UNSUB);
  ok(d1.html.includes('yesterday') && !d1.html.includes('1 days'), 'one day should read "yesterday"');
  const noCase = renderNudge(target('abandoned', { caseId: null, caseTitle: null }), 'IN', UNSUB);
  ok(noCase.html.includes('/practice') && !/undefined|null/.test(noCase.html), 'no case should still be coherent');
  const noScore = renderNudge(target('finished', { score: null }), 'IN', UNSUB);
  ok(!/null|NaN|undefined/.test(noScore.html), 'a missing score should be omitted');
});

test('nudge: a case title is escaped, not injected', () => {
  const m = renderNudge(target('abandoned', { caseTitle: '<script>alert(1)</script> & "quoted"' }), 'IN', UNSUB);
  ok(!m.html.includes('<script>'), 'script tag survived');
  ok(m.html.includes('&lt;script&gt;') && m.html.includes('&amp;'), 'not escaped');
});

test('nudge: the market changes the vocabulary', () => {
  const us = renderNudge(target('never_started'), 'US', UNSUB);
  ok(us.html.includes('market sizing question') && !us.html.includes('guesstimate'), 'US copy');
  ok(renderNudge(target('never_started'), 'IN', UNSUB).html.includes('guesstimate'), 'India copy');
});

test('nudge: the abandoner is asked for a reason and offered something for it', () => {
  const m = renderNudge(target('abandoned'), 'IN', UNSUB);
  ok(/reply to this email/i.test(m.html), 'should ask for a reply');
  ok(/free month/i.test(m.html), 'should carry the incentive');
});

test('deliverability: the From domain is parsed out of every header shape', () => {
  eq(fromDomain('MECE <team@mece.in>'), 'mece.in');
  eq(fromDomain('team@mece.in'), 'mece.in');
  eq(fromDomain('X <a@mail.mece.in>'), 'mail.mece.in');
  eq(fromDomain('X <A@MECE.IN>'), 'mece.in');
  eq(fromDomain('not-an-address'), '');
});

test('deliverability: the structural checks grade what code controls', () => {
  const get = (cs: Check[], id: string) => cs.find((c) => c.id === id)!;
  const good = { openPixel: false, replyTo: 'satyam@mece.in', hasResendKey: true, hasSmtp: true, unsubscribeHeader: true, textPart: true };
  eq(worstVerdict(structuralChecks(good)), 'pass');
  eq(get(structuralChecks({ ...good, openPixel: true }), 'pixel').verdict, 'warn');
  eq(get(structuralChecks({ ...good, replyTo: '' }), 'replyto').verdict, 'warn');
  eq(get(structuralChecks({ ...good, unsubscribeHeader: false }), 'unsub').verdict, 'fail');
  eq(get(structuralChecks({ ...good, hasResendKey: false, hasSmtp: false }), 'transport').verdict, 'fail');
  // A finding with no remedy is a finding nobody acts on.
  for (const c of structuralChecks({ openPixel: true, replyTo: '', hasResendKey: false, hasSmtp: false, unsubscribeHeader: false, textPart: false })) {
    if (c.verdict !== 'pass') ok((c.fix || '').length > 30, `${c.id} has no actionable fix`);
  }
});
