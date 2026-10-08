import { test, eq, ok, throws } from './harness';
import { renderBody, trackLinks, validateTemplate, merge, bodyToHtml } from '../../lib/crm/templates';
import { quintileScores, scoreRfm, rfmLabel } from '../../lib/crm/rfm';
import { addBusinessHours, DEFAULT_SLA, slaDue, cleanSla } from '../../lib/crm/sla';

test('template: merge values are escaped and markup-neutral', () => {
  const r = renderBody('Hi {{first_name}},\n\nSee [your plan](https://mece.in/upgrade).', { first_name: '<b>Ana</b> **[x](http://evil.com)**' });
  ok(r.html.includes('&lt;b&gt;Ana&lt;/b&gt;'), r.html);
  ok(!r.html.includes('href="http://evil.com"'), 'no injected link');
  ok(r.html.includes('href="https://mece.in/upgrade"'));
  ok(r.text.includes('your plan (https://mece.in/upgrade)'));
});
test('template: only http(s) links become anchors', () => {
  const h = bodyToHtml('[a](javascript:alert(1)) [b](data:text/html,x) [c](https://ok.com/x?a=1&b=2)');
  ok(!h.includes('javascript:') || !h.includes('href="javascript'), h);
  ok(!h.includes('href="data:'));
  ok(h.includes('href="https://ok.com/x?a=1&amp;b=2"'));
});
test('template: bullets, bold, unknown merge fields', () => {
  eq(bodyToHtml('- one\n- **two**'), '<ul style="margin:0 0 16px;padding-left:20px"><li style="margin:0 0 6px">one</li><li style="margin:0 0 6px"><strong>two</strong></li></ul>');
  eq(merge('{{nope}}x{{ First_Name }}', { first_name: 'A' }, true), 'xA');
  eq(merge('{{constructor}}{{toString}}', {}, true), '');
  eq(merge('{{__proto__}}', {}, true), '{{__proto__}}'); // not a merge field at all
});
test('template: subject newlines stripped; bad CTA refused', () => {
  eq(validateTemplate({ subject: 'Hi\r\nBcc: x@y.com', body: 'b' }).subject, 'Hi Bcc: x@y.com');
  throws(() => validateTemplate({ subject: 's', body: 'b', cta: { label: 'Go', url: 'javascript:alert(1)' } }), /http/);
  throws(() => validateTemplate({ subject: '', body: 'b' }), /subject/);
});
test('tracking: every link rewritten, originals kept in order', () => {
  const t = trackLinks('<a href="https://a.com/x?y=1&amp;z=2">A</a> <a href="https://b.com">B</a>', (i) => `https://t/${i}`);
  eq(t.links, ['https://a.com/x?y=1&z=2', 'https://b.com']);
  ok(t.html.includes('href="https://t/0"') && t.html.includes('href="https://t/1"'));
});

test('rfm: quintiles with ties, recency reversed', () => {
  eq(quintileScores([0, 0, 0, 0, 100]), [3, 3, 3, 3, 5]);
  eq(quintileScores([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
  eq(quintileScores([1, 2, 3, 4, 5], true), [5, 4, 3, 2, 1]);
  eq(quintileScores([null, 5]), [1, 3]);
});
test('rfm: labels', () => {
  eq(rfmLabel(5, 5, 5), 'Champions');
  eq(rfmLabel(1, 1, 1), 'Lost');
  eq(rfmLabel(1, 5, 5), "Can't lose them");
  eq(rfmLabel(5, 1, 1), 'New');
  const s = scoreRfm([{ id: 'a', recencyDays: 1, frequency: 50, monetary: 5000 }, { id: 'b', recencyDays: 200, frequency: 1, monetary: 0 }]);
  ok(s[0].label !== s[1].label);
  const m = scoreRfm([{ id: 'a', recencyDays: 3, frequency: 12, monetary: 900 }], { r: [7, 30, 90, 180], f: [2, 5, 10, 20], m: [100, 300, 600, 1000] });
  eq([m[0].r, m[0].f, m[0].m], [5, 4, 4]);
});

test('sla: business hours (IST, Mon–Sat 10–19)', () => {
  // Friday 2026-10-09 18:00 IST = 12:30Z; +2 working hours → Sat 11:00 IST = 05:30Z
  eq(addBusinessHours(new Date('2026-10-09T12:30:00Z'), 2, DEFAULT_SLA.hours).toISOString(), '2026-10-10T05:30:00.000Z');
  // Saturday 18:30 IST + 1h → Monday 10:30 IST (Sunday off)
  eq(addBusinessHours(new Date('2026-10-10T13:00:00Z'), 1, DEFAULT_SLA.hours).toISOString(), '2026-10-12T05:00:00.000Z');
  // before opening: Mon 08:00 IST + 1h → Mon 11:00 IST
  eq(addBusinessHours(new Date('2026-10-12T02:30:00Z'), 1, DEFAULT_SLA.hours).toISOString(), '2026-10-12T05:30:00.000Z');
  eq(addBusinessHours(new Date('2026-10-12T02:30:00Z'), 5, { ...DEFAULT_SLA.hours, twentyFourSeven: true }).toISOString(), '2026-10-12T07:30:00.000Z');
  ok(slaDue(new Date('2026-10-12T05:00:00Z'), 'Urgent').getTime() < slaDue(new Date('2026-10-12T05:00:00Z'), 'Low').getTime());
  eq(cleanSla({ resolveHours: { Urgent: -5 }, hours: { start: '25:00', days: [9, 1] } }).hours.days, [1]);
});
