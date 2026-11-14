/**
 * Upgrade emails — who qualifies and what they are told. Offline.
 *
 * The expensive mistakes here are all of one kind: asking the wrong person for
 * money, or putting a number in the email that is not theirs. So the tests are
 * about who is LEFT OUT as much as who is included.
 */
import { test, eq, ok } from './harness';
import { classifyUpgrade, renderUpgrade, whyLine, firstNameOf, type Offer, type UpgradeInput } from '../../lib/lifecycle/upgrade-copy';

const NOW = Date.parse('2026-11-14T12:00:00Z');
const DAY = 86_400_000;
const ago = (d: number) => new Date(NOW - d * DAY).toISOString();
const OFFER: Offer = { liteMonthly: 299, proMonthly: 599, proQuarter: 1499, proQuarterSaving: 17 };
const sub = (d: number, score: number | null, title: string | null = 'A Pune food-delivery platform’s margins are shrinking') => ({ at: ago(d), score, title });
const free = (submits: UpgradeInput['submits']): UpgradeInput => ({ storedTier: 'free', expiresAt: null, submits, now: NOW });

test('upgrade: a free account with fewer than three cases is never asked to pay', () => {
  eq(classifyUpgrade(free([])), null);
  eq(classifyUpgrade(free([sub(1, 40)])), null);
  eq(classifyUpgrade(free([sub(2, 40), sub(1, 90)])), null);
});

test('upgrade: a free account silent for over a fortnight is left to the nudges', () => {
  eq(classifyUpgrade(free([sub(40, 50), sub(30, 60), sub(20, 70), sub(15, 80)])), null);
});

test('upgrade: segments', () => {
  eq(classifyUpgrade(free([sub(9, 52), sub(5, 58), sub(1, 71)]))?.segment, 'improving');
  eq(classifyUpgrade(free([sub(9, 60), sub(7, 62), sub(4, 58), sub(1, 61)]))?.segment, 'plateau');
  eq(classifyUpgrade(free([sub(9, null), sub(7, null), sub(4, null), sub(1, null)]))?.segment, 'habit');
  // falling score, three cases: none of the three stories is true, so no email
  eq(classifyUpgrade(free([sub(9, 80), sub(5, 60), sub(1, 40)])), null);
});

test('upgrade: a ten-point scale is read as a ten-point scale', () => {
  eq(classifyUpgrade(free([sub(9, 5), sub(5, 5.5), sub(1, 7)]))?.segment, 'improving');
  eq(classifyUpgrade(free([sub(9, 6), sub(7, 6.2), sub(4, 6.1), sub(1, 6)]))?.segment, 'plateau');
});

test('upgrade: paid accounts', () => {
  const s = [sub(9, 60), sub(5, 62), sub(1, 61)];
  eq(classifyUpgrade({ storedTier: 'pro', expiresAt: ago(-20), submits: s, now: NOW }), null, 'active Pro has nothing to be sold');
  eq(classifyUpgrade({ storedTier: 'pro', expiresAt: null, submits: s, now: NOW }), null, 'Pro with no expiry is active');
  eq(classifyUpgrade({ storedTier: 'pro', expiresAt: ago(-3), submits: s, now: NOW })?.segment, 'expiring');
  eq(classifyUpgrade({ storedTier: 'lite', expiresAt: ago(10), submits: [], now: NOW })?.segment, 'lapsed');
  eq(classifyUpgrade({ storedTier: 'lite', expiresAt: ago(90), submits: s, now: NOW }), classifyUpgrade(free(s)), 'long-lapsed is judged as a free account');
  eq(classifyUpgrade({ storedTier: 'lite', expiresAt: ago(-20), submits: s, now: NOW })?.segment, 'lite_to_pro');
  eq(classifyUpgrade({ storedTier: 'lite', expiresAt: ago(-20), submits: [sub(1, 60)], now: NOW }), null, 'idle Lite is left alone');
});

test('upgrade: every email is plain, has one link, real prices and the recipient’s own numbers', () => {
  const cases: UpgradeInput[] = [
    free([sub(9, 52), sub(5, 58), sub(1, 71)]),
    free([sub(9, 60), sub(7, 62), sub(4, 58), sub(1, 61)]),
    free([sub(9, null), sub(7, null), sub(4, null), sub(1, null)]),
    { storedTier: 'pro', expiresAt: ago(-3), submits: [sub(1, 60)], now: NOW },
    { storedTier: 'pro', expiresAt: ago(-1), submits: [], now: NOW },
    { storedTier: 'lite', expiresAt: ago(10), submits: [], now: NOW },
    { storedTier: 'lite', expiresAt: ago(-20), submits: [sub(9, 60), sub(5, 62), sub(1, 61)], now: NOW },
  ];
  const seen = new Set<string>();
  for (const c of cases) {
    const f = classifyUpgrade(c)!;
    ok(f, 'classified');
    seen.add(f.segment);
    const m = renderUpgrade(f, { name: 'riya sharma', email: 'riya@example.com' }, OFFER, 'https://www.mece.in/', '{{UNSUBSCRIBE}}');
    ok(m.subject.length > 5 && m.subject.length <= 78, `subject length: ${m.subject}`);
    ok(!/undefined|null|NaN|\?\?/.test(m.subject + m.text), `no holes: ${f.segment}\n${m.text}`);
    ok(!/<img|<table/i.test(m.html), 'no image, no table');
    eq((m.html.match(/<a /g) || []).length, 2, 'one link plus unsubscribe');
    ok(m.html.includes('https://www.mece.in/upgrade"'), 'links to /upgrade with no double slash');
    ok(m.html.includes('{{UNSUBSCRIBE}}') && m.text.includes('{{UNSUBSCRIBE}}'), 'unsubscribe token in both parts');
    ok(m.text.startsWith('Hi Riya,'), 'first name, capitalised');
    ok(/₹(599|1,499)/.test(m.text), `quotes a real price: ${f.segment}`);
    ok(!/free month|discount|% off|offer ends|last chance|guarantee/i.test(m.text), 'promises nothing that does not exist');
    ok(whyLine(f).length > 10 && whyLine(f).length <= 300, 'reviewer line');
  }
  eq(seen.size, 6, 'all six segments rendered');
});

test('upgrade: the numbers in the email are the recipient’s', () => {
  const f = classifyUpgrade(free([sub(9, 52), sub(5, 58), sub(1, 71)]))!;
  const m = renderUpgrade(f, { name: null, email: 'x9@example.com' }, OFFER, 'https://www.mece.in', '#');
  eq(m.subject, '52 to 71 in 3 cases');
  ok(m.text.startsWith('Hi there,'), 'no guessed name from a junk local part');
  ok(m.text.includes('scored 52') && m.text.includes('scored 71'));
});

test('upgrade: user-supplied text is escaped', () => {
  const f = classifyUpgrade(free([sub(9, 52), sub(5, 58), sub(1, 71, '<script>alert(1)</script>')]))!;
  const m = renderUpgrade(f, { name: '<b>x</b>', email: 'a@example.com' }, OFFER, 'https://www.mece.in', '#');
  ok(!m.html.includes('<script>') && !m.html.includes('<b>x</b>'));
  eq(firstNameOf('<b>x</b>', 'a@example.com'), 'there');
});
