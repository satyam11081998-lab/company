import { test, eq, ok, throws } from './harness';
import { STANDARD_FIELDS, STANDARD_MODULES } from '../../lib/crm/modules';
import {
  cleanWorkflow, triggerFires, matchCondition, chainAllows, resolveValue, dateFireDay, cleanBlueprint, availableTransitions, isTerminal,
  stageApprovers, cleanAssignment, assignmentEntry, roundRobin, cleanScoring, computeScore, cleanValidation, validationErrors, cleanLayoutRule,
  layoutEffect, cleanCadence, cadenceDue, cleanWebhook, isPrivateIp, cleanMacro, cleanApproval, orderActions, type MetaLike,
} from '../../lib/crm/automation';

const meta: MetaLike = {
  module: (api) => { const m = STANDARD_MODULES.find((x) => x.api_name === api); return m ? { api_name: m.api_name, label: m.label, settings: { emailField: m.settings.emailField } } : undefined; },
  fields: (api) => STANDARD_FIELDS.filter((f) => f.module === api),
};
const T1 = '11111111-1111-4111-8111-111111111111';
const U1 = '22222222-2222-4222-8222-222222222221';
const U2 = '22222222-2222-4222-8222-222222222222';
const U3 = '22222222-2222-4222-8222-222222222223';

test('workflow: validation and limits', () => {
  const w = cleanWorkflow({ module: 'leads', trigger: { type: 'create' }, conditions: [{ criteria: { match: 'all', conditions: [{ field: 'rating', op: 'eq', value: 'Hot' }] }, actions: [{ type: 'field_update', field: 'lead_status', value: 'Contacted' }, { type: 'task', subject: 'Call now', dueInDays: 0 }] }] }, meta);
  eq(w.conditions[0].actions.length, 2);
  throws(() => cleanWorkflow({ module: 'leads', trigger: { type: 'create' }, conditions: [{ actions: [{ type: 'field_update', field: 'converted_at', value: '2026-01-01' }] }] }, meta), /can't be updated/);
  throws(() => cleanWorkflow({ module: 'contacts', trigger: { type: 'create' }, conditions: [{ actions: [{ type: 'field_update', field: 'email', value: 'x@y.z' }] }] }, meta), /can't be updated/); // synced
  throws(() => cleanWorkflow({ module: 'leads', trigger: { type: 'delete' }, conditions: [{ actions: [{ type: 'task', subject: 'x' }] }] }, meta), /can't be used/);
  throws(() => cleanWorkflow({ module: 'leads', trigger: { type: 'create' }, conditions: [{ actions: Array(6).fill({ type: 'task', subject: 'x' }) }] }, meta), /At most 5/);
  throws(() => cleanWorkflow({ module: 'leads', trigger: { type: 'field_update', fields: [] }, conditions: [{ actions: [{ type: 'notify', title: 'x' }] }] }, meta), /fields/);
  throws(() => cleanWorkflow({ module: 'nope', trigger: { type: 'create' }, conditions: [] }, meta), /module/);
  throws(() => cleanWorkflow({ module: 'leads', trigger: { type: 'create' }, conditions: [{ actions: [{ type: 'field_update', field: 'rating', value: 'Boiling' }] }] }, meta), /not valid/);
  throws(() => cleanWorkflow({ module: 'leads', trigger: { type: 'create' }, conditions: [{ actions: [{ type: 'email', templateId: T1 }] }] }, meta, { templates: new Set() }), /template/);
  const sched = cleanWorkflow({ module: 'leads', trigger: { type: 'create' }, conditions: [{ actions: [], scheduled: [{ delayMinutes: 0, actions: [{ type: 'notify', title: 'x' }] }] }] }, meta);
  eq(sched.conditions[0].scheduled[0].delayMinutes, 1);
});
test('workflow: triggers', () => {
  const w = (type: string, extra = {}) => ({ module: 'leads', trigger: { type, ...extra }, conditions: [] }) as never;
  const a = { data: { rating: 'Hot' } };
  const b = { data: { rating: 'Cold' } };
  ok(triggerFires(w('create'), { event: 'create', before: null, after: a }));
  ok(!triggerFires(w('create'), { event: 'edit', before: b, after: a }));
  ok(triggerFires(w('create_or_edit'), { event: 'edit', before: b, after: a }));
  ok(triggerFires(w('field_update', { fields: ['rating'] }), { event: 'edit', before: b, after: a }));
  ok(!triggerFires(w('field_update', { fields: ['rating'] }), { event: 'edit', before: a, after: a }));
  ok(triggerFires(w('score', { score: 'increase' }), { event: 'edit', before: a, after: a, scoreBefore: 5, scoreAfter: 10 }));
  ok(!triggerFires(w('score', { score: 'increase' }), { event: 'edit', before: a, after: a, scoreBefore: 10, scoreAfter: 5 }));
  ok(!triggerFires(w('date'), { event: 'create', before: null, after: a }));
});
test('workflow: first matching condition wins', () => {
  const w = { module: 'leads', trigger: { type: 'create' }, conditions: [
    { criteria: { match: 'all', conditions: [{ field: 'rating', op: 'eq', value: 'Hot' }] }, actions: [], scheduled: [] },
    { criteria: null, actions: [], scheduled: [] },
  ] } as never;
  eq(matchCondition(w, { data: { rating: 'Hot' } }), 0);
  eq(matchCondition(w, { data: { rating: 'Cold' } }), 1);
});
test('loop guard', () => {
  ok(chainAllows([], 'a'));
  ok(chainAllows(['a'], 'a'));
  ok(!chainAllows(['a', 'a'], 'a'));
  ok(!chainAllows(['a', 'b', 'c'], 'd'));
});
test('value tokens', () => {
  const now = new Date('2026-10-08T20:00:00Z'); // 9 Oct 01:30 IST
  eq(resolveValue('{{today}}', { ownerId: null, now }), '2026-10-09');
  eq(resolveValue('{{today+7}}', { ownerId: null, now }), '2026-10-16');
  eq(resolveValue('{{today-1}}', { ownerId: null, now }), '2026-10-08');
  eq(resolveValue('{{owner}}', { ownerId: U1, now }), U1);
  eq(resolveValue('plain', { ownerId: null, now }), 'plain');
});
test('date rules: once, yearly, leap day', () => {
  const w = (field: string, offsetDays: number, repeat: 'once' | 'yearly') => ({ module: 'contacts', trigger: { type: 'date', date: { field, offsetDays, repeat } }, conditions: [] }) as never;
  eq(dateFireDay(w('mece_plan_expires_at', -7, 'once'), { data: { mece_plan_expires_at: '2026-11-30' } }), '2026-11-23');
  eq(dateFireDay(w('birthday', 0, 'yearly'), { data: { birthday: '1999-03-15' } }, new Date('2026-06-01T00:00:00Z')), '2026-03-15');
  eq(dateFireDay(w('birthday', 0, 'yearly'), { data: { birthday: '2000-02-29' } }, new Date('2027-01-01T00:00:00Z')), '2027-02-28');
  eq(dateFireDay(w('birthday', 0, 'once'), { data: {} }), null);
});
test('blueprint: validation, transitions, owners, terminal', () => {
  const bp = cleanBlueprint({ module: 'cases', field: 'status', states: ['New', 'Open', 'Resolved', 'Closed'], transitions: [
    { id: 'open', name: 'Start work', from: ['New'], to: 'Open', owners: { type: 'owner' }, requiredFields: ['priority'], after: [] },
    { id: 'resolve', name: 'Resolve', from: ['Open'], to: 'Resolved', owners: { type: 'users', ids: [U2] }, noteRequired: true, after: [] },
    { id: 'close', name: 'Close', from: ['Resolved'], to: 'Closed', owners: { type: 'any' }, after: [] },
    { id: 'spam', name: 'Mark spam', common: true, to: 'Closed', owners: { type: 'roles', ids: [U3] }, after: [] },
  ] }, meta);
  eq(bp.transitions.length, 4);
  const rec = { data: { status: 'New' }, owner_id: U1 };
  eq(availableTransitions(bp, rec, 'New', { userId: U1, roleId: null, superAdmin: false }).map((t) => t.id), ['open']);
  eq(availableTransitions(bp, rec, 'New', { userId: U2, roleId: U3, superAdmin: false }).map((t) => t.id), ['spam']);
  eq(availableTransitions(bp, rec, 'Open', { userId: U2, roleId: null, superAdmin: false }).map((t) => t.id), ['resolve']);
  eq(availableTransitions(bp, rec, 'Closed', { userId: U2, roleId: U3, superAdmin: false }).map((t) => t.id), []); // common → same state hidden
  ok(isTerminal(bp, 'Closed')); // the common "Mark spam" goes INTO Closed, so nothing leaves Closed
  ok(!isTerminal(bp, 'Resolved'));
  throws(() => cleanBlueprint({ module: 'cases', field: 'subject', states: ['a', 'b'], transitions: [] }, meta), /picklist/);
  throws(() => cleanBlueprint({ module: 'cases', field: 'status', states: ['New', 'Bogus'], transitions: [] }, meta), /two states/);
  throws(() => cleanBlueprint({ module: 'cases', field: 'status', states: ['New', 'Open'], transitions: [{ name: 'x', from: ['New'], to: 'Nowhere' }] }, meta), /destination/);
  const simple = cleanBlueprint({ module: 'cases', field: 'status', states: ['New', 'Closed'], transitions: [{ name: 'Close', from: ['New'], to: 'Closed', after: [] }] }, meta);
  ok(isTerminal(simple, 'Closed'));
  ok(!isTerminal(simple, 'New'));
});
test('approvals: manager resolution walks up the hierarchy', () => {
  const roles = { ceo: null, head: 'ceo', rep: 'head' } as Record<string, string | null>;
  const members = [{ id: 'u-rep', roleId: 'rep', active: true }, { id: 'u-ceo', roleId: 'ceo', active: true }, { id: 'u-old', roleId: 'head', active: false }];
  eq(stageApprovers({ approvers: { type: 'manager' }, mode: 'any' }, 'u-rep', members, roles), ['u-ceo']); // empty/inactive head → CEO
  eq(stageApprovers({ approvers: { type: 'users', ids: ['u-ceo', 'u-old'] }, mode: 'any' }, 'u-rep', members, roles), ['u-ceo']);
  eq(stageApprovers({ approvers: { type: 'roles', ids: ['rep'] }, mode: 'all' }, null, members, roles), ['u-rep']);
  throws(() => cleanApproval({ module: 'deals', stages: [{ approvers: { type: 'users', ids: [] } }] }, meta), /approvers/);
});
test('assignment: entries and round robin', () => {
  const a = cleanAssignment({ module: 'leads', entries: [{ criteria: { match: 'all', conditions: [{ field: 'segment', op: 'eq', value: 'College / B-school (B2B)' }] }, userIds: [U1, U2] }, { criteria: null, userIds: [U3] }] }, meta);
  eq(assignmentEntry(a, { data: { segment: 'College / B-school (B2B)' } }), 0);
  eq(assignmentEntry(a, { data: { segment: 'Student (B2C)' } }), 1);
  eq([0, 1, 2, 3].map((n) => roundRobin([U1, U2], n)), [U1, U2, U1, U2]);
  eq(roundRobin([U1, U2, U3], 1, (id) => id !== U2), U3);
  eq(roundRobin([U1], 5, () => false), null);
  throws(() => cleanAssignment({ module: 'leads', entries: [{ userIds: ['not-a-uuid'] }] }, meta), /at least one user/);
});
test('scoring: rules + capped touchpoints, explained', () => {
  const s = cleanScoring({ module: 'leads', rules: [{ criteria: { match: 'all', conditions: [{ field: 'rating', op: 'eq', value: 'Hot' }] }, points: 30, label: 'Hot' }, { criteria: { match: 'all', conditions: [{ field: 'email', op: 'empty' }] }, points: -20, label: 'No email' }], touchpoints: { email_open: 2, email_click: 5, form_submit: 10, survey_answer: 0 } }, meta);
  const r = computeScore(s, { data: { rating: 'Hot' } }, { email_open: 50, email_click: 1, form_submit: 0, survey_answer: 0 });
  eq(r.total, 30 - 20 + 20 + 5);
  eq([r.positive, r.negative], [55, -20]);
  ok(r.matched.some((m) => m.label === 'email open ×10'));
  throws(() => cleanScoring({ module: 'leads', rules: [{ criteria: null, points: 5 }] }, meta), /condition/);
  throws(() => cleanScoring({ module: 'leads', rules: [{ criteria: { match: 'all', conditions: [{ field: 'rating', op: 'eq', value: 'Hot' }] }, points: 0 }] }, meta), /not 0/);
});
test('validation + layout rules', () => {
  const v = cleanValidation({ module: 'deals', criteria: { match: 'all', conditions: [{ field: 'stage', op: 'eq', value: 'closed_lost' }, { field: 'lost_reason', op: 'empty' }] }, field: 'lost_reason', message: 'Say why the deal was lost.' }, meta);
  eq(validationErrors([v], { stage: 'closed_lost' }, 'edit'), [{ field: 'lost_reason', message: 'Say why the deal was lost.' }]);
  eq(validationErrors([v], { stage: 'closed_lost', lost_reason: 'Price' }, 'edit'), []);
  eq(validationErrors([{ ...v, on: 'create' }], { stage: 'closed_lost' }, 'edit'), []);
  const l = cleanLayoutRule({ module: 'leads', when: { match: 'all', conditions: [{ field: 'segment', op: 'eq', value: 'College / B-school (B2B)' }] }, show: ['no_of_students'], require: ['no_of_students'] }, meta);
  eq(layoutEffect([l], { segment: 'Student (B2C)' }), { hidden: ['no_of_students'], required: [] });
  eq(layoutEffect([l], { segment: 'College / B-school (B2B)' }), { hidden: [], required: ['no_of_students'] });
});
test('cadences + business days (Mon–Sat)', () => {
  throws(() => cleanCadence({ module: 'leads', steps: [{ type: 'email' }] }, meta), /template/);
  const c = cleanCadence({ module: 'leads', steps: [{ type: 'task', subject: 'Intro call', delayDays: 0 }, { type: 'call', subject: 'Follow up', delayDays: 2 }] }, meta);
  eq(c.steps.map((s) => s.id), ['s1', 's2']);
  // Friday 12:00 IST + 2 working days → Monday (Sunday skipped)
  eq(cadenceDue(new Date('2026-10-09T06:30:00Z'), 2, true).toISOString(), '2026-10-12T06:30:00.000Z');
  eq(cadenceDue(new Date('2026-10-09T06:30:00Z'), 2, false).toISOString(), '2026-10-11T06:30:00.000Z');
});
test('macros: Zoho limits', () => {
  throws(() => cleanMacro({ module: 'leads', actions: [{ type: 'webhook', webhookId: T1 }] }, meta), /can't be used/);
  throws(() => cleanMacro({ module: 'leads', actions: [1, 2, 3, 4].map(() => ({ type: 'field_update', field: 'rating', value: 'Hot' })) }, meta), /At most|at most/);
});
test('action order: field updates, then tags, then email, then the rest', () => {
  eq(orderActions([{ type: 'webhook' }, { type: 'email' }, { type: 'tag' }, { type: 'field_update' }] as never).map((a) => a.type), ['field_update', 'tag', 'email', 'webhook']);
});
test('webhooks: URL rules + private address detection', () => {
  const ok1 = cleanWebhook({ module: 'leads', url: 'https://hooks.example.com/mece?x=1', fields: ['email', 'nope'] }, meta, 'x'.repeat(32));
  eq(ok1.fields, ['email']);
  for (const bad of ['http://hooks.example.com', 'https://user:pw@hooks.example.com', 'https://localhost/x', 'https://127.0.0.1/x', 'https://[::1]/x', 'https://10.0.0.5', 'https://169.254.169.254/latest/meta-data', 'https://metadata.google.internal', 'https://hooks.example.com:8443/x', 'https://intranet/x', 'ftp://x.com']) {
    throws(() => cleanWebhook({ module: 'leads', url: bad }, meta), undefined, bad);
  }
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', '::', 'fd12:3456::1', 'fe80::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '224.0.0.1', '255.255.255.255', '198.18.0.1', '999.1.1.1']) ok(isPrivateIp(ip), `private: ${ip}`);
  for (const ip of ['8.8.8.8', '1.1.1.1', '172.32.0.1', '100.128.0.1', '2606:4700:4700::1111', '13.235.1.1']) ok(!isPrivateIp(ip), `public: ${ip}`);
});
