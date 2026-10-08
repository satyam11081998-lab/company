import { test, eq, ok } from './harness';
import { summarize, validScore, npsBucket, sentiment, cleanSurvey } from '../../lib/crm/surveys';
import { caseStamps, DEFAULT_SLA, slaDue } from '../../lib/crm/sla';

test('nps: buckets and score', () => {
  eq([npsBucket(10), npsBucket(9), npsBucket(8), npsBucket(7), npsBucket(6), npsBucket(0)], ['promoter', 'promoter', 'passive', 'passive', 'detractor', 'detractor']);
  // 5 promoters, 3 passives, 2 detractors → 50% − 20% = 30
  eq(summarize('nps', [10, 10, 9, 9, 9, 8, 7, 7, 3, 0]).score, 30);
  eq(summarize('nps', []).score, null);
  eq(summarize('nps', [6, 6]).score, -100);
  // out-of-range values are ignored, not counted
  eq(summarize('nps', [10, 11, -1]).responses, 1);
});
test('csat and ces', () => {
  const c = summarize('csat', [5, 4, 3, 2, 5]);
  eq(c.score, 60);
  eq(c.breakdown, { '1': 0, '2': 1, '3': 1, '4': 1, '5': 2 });
  const e = summarize('ces', [7, 6, 5, 2]);
  eq(e.score, 5);
  eq(e.easyPct, 75);
});
test('validScore enforces each scale', () => {
  eq(validScore('nps', 0), 0);
  eq(validScore('nps', '10'), 10);
  eq(validScore('nps', 11), null);
  eq(validScore('csat', 0), null);
  eq(validScore('ces', 7), 7);
  eq(validScore('ces', 8), null);
  eq(validScore('csat', 4.5), null);
  eq(validScore('csat', '4; drop table'), null);
});
test('sentiment: explainable, handles negation', () => {
  eq(sentiment('Really helpful and easy').label, 'positive');
  eq(sentiment('voice interview keeps crashing, slow').label, 'negative');
  eq(sentiment('not helpful').label, 'negative');
  eq(sentiment('').label, 'neutral');
  ok(sentiment('great feedback').matched.includes('great'));
});
test('cleanSurvey: defaults and clamps', () => {
  const s = cleanSurvey({ kind: 'csat', question: 'x'.repeat(500), inviteSubject: 'a\r\nb' });
  eq(s.kind, 'csat');
  eq(s.question.length, 300);
  eq(s.inviteSubject, 'a b');
  eq(s.category, 'service');
  eq(cleanSurvey({ kind: 'evil' }).kind, 'nps');
});
test('caseStamps: create, priority change, first response, resolve, reopen', () => {
  const created = new Date('2026-10-12T04:30:00Z'); // Mon 10:00 IST
  const s1 = caseStamps(null, { status: 'New', priority: 'High' }, created, DEFAULT_SLA, created);
  eq(s1.sla_due_at, slaDue(created, 'High').toISOString());
  ok(!('resolved_at' in s1) && !('first_response_at' in s1));
  const before = { status: 'New', priority: 'High', sla_due_at: s1.sla_due_at };
  const s2 = caseStamps(before, { ...before, priority: 'Urgent' }, created, DEFAULT_SLA, created);
  eq(s2.sla_due_at, slaDue(created, 'Urgent').toISOString());
  const t = new Date('2026-10-12T06:00:00Z');
  const s3 = caseStamps(before, { ...before, status: 'In progress' }, created, DEFAULT_SLA, t);
  eq(s3.first_response_at, t.toISOString());
  const s4 = caseStamps({ ...before, status: 'In progress', first_response_at: t.toISOString() }, { ...before, status: 'Resolved', first_response_at: t.toISOString() }, created, DEFAULT_SLA, t);
  eq(s4.resolved_at, t.toISOString());
  ok(!('first_response_at' in s4));
  const s5 = caseStamps({ ...before, status: 'Resolved', resolved_at: t.toISOString() }, { ...before, status: 'Open', resolved_at: t.toISOString() }, created, DEFAULT_SLA, t);
  eq(s5.resolved_at, null);
  // resolved straight from New: first response is stamped too
  const s6 = caseStamps(before, { ...before, status: 'Closed' }, created, DEFAULT_SLA, t);
  eq([s6.resolved_at, s6.first_response_at], [t.toISOString(), t.toISOString()]);
});
