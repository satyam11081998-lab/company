import { test, eq, ok, throws, near } from './harness';
import { coerceValue, computeTotals, coerceLineItems } from '../../lib/crm/fields';
import { evaluate, evalCondition, validateCriteria } from '../../lib/crm/criteria';
import { parseFormula, evalFormula, castFormula } from '../../lib/crm/formula';
import { parseCsv, toCsv, csvCell } from '../../lib/crm/csv';
import { recordAccess, can, fieldAccess, visibleData, descendants, ancestors, wouldCycle, cleanProfile, DEFAULT_PROFILES } from '../../lib/crm/permissions';
import { STANDARD_FIELDS, STANDARD_MODULES, recordName } from '../../lib/crm/modules';
import type { CrmContext, FieldDef } from '../../lib/crm/types';

const F = (type: FieldDef['type'], options: FieldDef['options'] = {}): FieldDef => ({ module: 'm', api_name: 'x', label: 'X', type, options });

// ---------------- fields
test('email coerces + rejects', () => {
  eq(coerceValue(F('email'), '  A@B.co '), 'a@b.co');
  throws(() => coerceValue(F('email'), 'not-an-email'), /valid email/);
  throws(() => coerceValue(F('email'), 'a@b'), /valid email/);
  throws(() => coerceValue(F('email'), '<script>@x.com'), /valid email/);
});
test('url only http(s); javascript: refused', () => {
  eq(coerceValue(F('url'), 'mece.in'), 'https://mece.in/');
  throws(() => coerceValue(F('url'), 'javascript:alert(1)'), /http/);
  throws(() => coerceValue(F('url'), 'data:text/html,<b>x</b>'), /http/);
  throws(() => coerceValue(F('url'), 'JaVaScRiPt:alert(1)'), /http/);
});
test('text strips control chars and caps length', () => {
  eq(coerceValue(F('text'), 'a\u0000b\u0007c'), 'abc');
  throws(() => coerceValue(F('text'), 'x'.repeat(256)), /at most 255/);
  throws(() => coerceValue(F('text'), { a: 1 }), /must be text/);
});
test('numbers: integer/decimal/currency/percent', () => {
  eq(coerceValue(F('integer'), '1,234'), 1234);
  throws(() => coerceValue(F('integer'), '1.5'), /whole/);
  eq(coerceValue(F('currency'), '₹ 1,299.456'), 1299.46);
  throws(() => coerceValue(F('percent'), 120), /at most 100/);
  throws(() => coerceValue(F('decimal'), 'NaN'), /number/);
  throws(() => coerceValue(F('decimal'), Infinity), /number/);
  throws(() => coerceValue(F('integer'), '1e400'), /number/);
});
test('dates', () => {
  eq(coerceValue(F('date'), '2026-02-28'), '2026-02-28');
  throws(() => coerceValue(F('date'), '2026-02-30'), /date/);
  eq(coerceValue(F('datetime'), '2026-10-08T10:00:00+05:30'), '2026-10-08T04:30:00.000Z');
  throws(() => coerceValue(F('datetime'), 'yesterday'), /date/);
});
test('picklists', () => {
  const p = F('picklist', { picklist: [{ value: 'Hot' }, { value: 'Cold' }] });
  eq(coerceValue(p, 'hot'), 'Hot');
  throws(() => coerceValue(p, 'Lukewarm'), /one of/);
  const m = F('multipicklist', { picklist: [{ value: 'A' }, { value: 'B' }] });
  eq(coerceValue(m, 'a; b; a'), ['A', 'B']);
  throws(() => coerceValue(m, ['C']), /not an allowed/);
});
test('lookup/related need uuids and allowed modules', () => {
  throws(() => coerceValue(F('lookup', { module: 'accounts' }), "1' or 1=1"), /reference/);
  eq(coerceValue(F('lookup'), 'A1B2C3D4-0000-4000-8000-000000000000'), 'a1b2c3d4-0000-4000-8000-000000000000');
  const r = F('related', { modules: ['deals'] });
  throws(() => coerceValue(r, { module: 'users', id: 'a1b2c3d4-0000-4000-8000-000000000000' }), /unsupported/);
});
test('computed types refuse input', () => {
  throws(() => coerceValue(F('formula'), 1), /automatically/);
  throws(() => coerceValue(F('autonumber'), 'QT-1'), /automatically/);
});
test('line items + totals', () => {
  const items = coerceLineItems([
    { product_name: 'Pro (campus)', quantity: 100, list_price: 599, discount: 5990, tax_pct: 18 },
    { product_name: '', quantity: '', list_price: '' },
  ], 'Items', 'sale')!;
  eq(items.length, 1);
  near(items[0].total!, (59900 - 5990) * 1.18, 0.01);
  const t = computeTotals(items, -100);
  near(t.sub_total, 59900); near(t.discount_total, 5990); near(t.tax_total, 9703.8, 0.01); near(t.grand_total, 59900 - 5990 + 9703.8 - 100, 0.01);
  throws(() => coerceLineItems([{ product_name: 'x', quantity: 1, list_price: 10, discount: 11 }], 'Items', 'sale'), /exceed/);
  throws(() => coerceLineItems(Array(201).fill({ product_name: 'x' }), 'Items', 'sale'), /200/);
  throws(() => coerceLineItems([{ product_name: 'x', quantity: -1, list_price: 10 }], 'Items', 'sale'), /quantity/);
});

// ---------------- criteria
const rec = { data: { amount: 5000, stage: 'closed_won', email: 'a@x.com', interest: ['GD prep'], closing_date: '2026-10-08' }, tags: ['VIP'], owner_id: 'u1', created_at: '2026-10-01T00:00:00Z' };
const now = new Date('2026-10-08T06:00:00Z');
test('criteria basics', () => {
  ok(evaluate(rec, { match: 'all', conditions: [{ field: 'amount', op: 'gt', value: 1000 }, { field: 'stage', op: 'eq', value: 'CLOSED_WON' }] }));
  ok(!evaluate(rec, { match: 'all', conditions: [{ field: 'amount', op: 'gt', value: 10000 }] }));
  ok(evaluate(rec, { match: 'any', conditions: [{ field: 'amount', op: 'gt', value: 10000 }, { field: 'tags', op: 'has_tag', value: 'vip' }] }));
  ok(evaluate(rec, { match: 'all', conditions: [{ field: 'interest', op: 'eq', value: 'gd prep' }] }));
  ok(evaluate(rec, { match: 'all', conditions: [{ field: 'phone', op: 'empty' }] }));
  ok(evaluate(rec, { match: 'all', conditions: [{ field: 'stage', op: 'in', value: ['open', 'closed_won'] }] }));
  ok(evaluate(rec, null));
});
test('criteria dates (IST)', () => {
  ok(evalCondition(rec, { field: 'closing_date', op: 'today' }, { now }));
  ok(evalCondition(rec, { field: 'created_at', op: 'in_last_days', value: 7 }, { now }));
  ok(!evalCondition(rec, { field: 'created_at', op: 'in_last_days', value: 6 }, { now }));
  ok(evalCondition(rec, { field: 'created_at', op: 'older_than_days', value: 5 }, { now }));
  ok(evalCondition(rec, { field: 'closing_date', op: 'this_month' }, { now }));
  ok(!evalCondition(rec, { field: 'closing_date', op: 'last_month' }, { now }));
  // 2026-10-07T20:00Z is 2026-10-08 01:30 IST → today in IST
  ok(evalCondition({ data: { d: '2026-10-07T20:00:00Z' } }, { field: 'd', op: 'today' }, { now }));
});
test('criteria change operators', () => {
  const prev = { data: { stage: 'proposal' }, owner_id: 'u1', tags: [], name: '' };
  ok(evalCondition(rec, { field: 'stage', op: 'changed' }, { prev }));
  ok(evalCondition(rec, { field: 'stage', op: 'changed_to', value: 'closed_won' }, { prev }));
  ok(evalCondition(rec, { field: 'stage', op: 'changed_from', value: 'proposal' }, { prev }));
  ok(!evalCondition(rec, { field: 'amount', op: 'changed' }, { prev: { ...prev, data: { amount: 5000 } } }));
  ok(!evalCondition(rec, { field: 'stage', op: 'changed' }, {}));
});
test('criteria validation refuses unknown fields/ops/depth', () => {
  const fields = [{ api_name: 'amount' }];
  throws(() => validateCriteria({ match: 'all', conditions: [{ field: 'secret', op: 'eq', value: 1 }] }, fields), /Unknown field/);
  throws(() => validateCriteria({ match: 'all', conditions: [{ field: 'amount', op: 'drop table', value: 1 }] }, fields), /Unknown operator/);
  const deep = { match: 'all', conditions: [{ match: 'all', conditions: [{ match: 'all', conditions: [{ match: 'all', conditions: [] }] }] }] };
  throws(() => validateCriteria(deep, fields), /deep/);
  eq(validateCriteria({ match: 'weird', conditions: [{ field: 'amount', op: 'gt', value: 1, junk: 1 }] }, fields), { match: 'all', conditions: [{ field: 'amount', op: 'gt', value: 1 }] });
});

// ---------------- formula
test('formula arithmetic + functions', () => {
  const t = parseFormula('amount * probability / 100', ['amount', 'probability']);
  eq(evalFormula(t, { amount: 1000, probability: 65 }), 650);
  eq(evalFormula(t, { amount: 1000 }), null);
  eq(evalFormula(parseFormula('IF(stage == "won", amount, 0)', ['stage', 'amount']), { stage: 'won', amount: 7 }), 7);
  eq(evalFormula(parseFormula('CONCAT(first, " ", last)', ['first', 'last']), { first: 'A', last: null }), 'A ');
  eq(evalFormula(parseFormula('DAYS_BETWEEN("2026-10-01", "2026-10-08")', []), {}), 7);
  eq(evalFormula(parseFormula('1/0', []), {}), null);
  eq(evalFormula(parseFormula('ROUND(10/3, 2)', []), {}), 3.33);
  eq(evalFormula(parseFormula('-(2+3)*2', []), {}), -10);
  eq(castFormula(true, 'number'), 1);
});
test('formula is not eval', () => {
  throws(() => parseFormula('constructor.constructor("return process")()', []), /Unknown|Unexpected|Bad/);
  throws(() => parseFormula('__proto__', []), /Unknown field/);
  throws(() => parseFormula('process.exit(1)', []), /Unknown|Unexpected|Bad/);
  throws(() => parseFormula('a; b', ['a', 'b']), /Unexpected/);
  throws(() => parseFormula('EVAL("1")', []), /Unknown function/);
  throws(() => parseFormula('('.repeat(60) + '1' + ')'.repeat(60), []), /deep/);
  throws(() => parseFormula('1+'.repeat(600) + '1', []), /long|complex/);
  // a field literally called "constructor" is only readable if the module defines it
  eq(evalFormula(parseFormula('toString', ['toString']), {}), null);
  eq(evalCondition({ data: {} }, { field: 'constructor', op: 'not_empty' }), false);
});

// ---------------- csv
test('csv parse: quotes, newlines, BOM, semicolons', () => {
  const p = parseCsv('﻿Name,Email\n"Doe, Jane","j@x.com"\n"multi\nline",x@y.com\n');
  eq(p.header, ['Name', 'Email']);
  eq(p.rows, [['Doe, Jane', 'j@x.com'], ['multi\nline', 'x@y.com']]);
  eq(parseCsv('a;b\n1;2').rows, [['1', '2']]);
  throws(() => parseCsv('a\n"open'), /unclosed/);
  throws(() => parseCsv('a\n' + 'x\n'.repeat(5002)), /more than/);
});
test('csv export neutralises formulas', () => {
  eq(csvCell('=HYPERLINK("http://evil","x")'), `"'=HYPERLINK(""http://evil"",""x"")"`);
  eq(csvCell('+91 98'), "'+91 98");
  eq(csvCell('-1'), "'-1");
  eq(csvCell('@SUM(1)'), "'@SUM(1)");
  ok(toCsv(['a'], [['x']]).startsWith('﻿'));
});

// ---------------- permissions
const base: CrmContext = {
  userId: 'rep', superAdmin: false, profileId: 'p', roleId: 'r_rep',
  profile: DEFAULT_PROFILES.find((p) => p.name === 'Sales Representative')!.config,
  subordinateRoleIds: [], subordinateUserIds: [], peerUserIds: [], sharingRules: [], territories: [], userRoles: {},
};
test('module perms from profile', () => {
  ok(can(base, 'leads', 'convert'));
  ok(!can(base, 'leads', 'delete'));
  ok(!can(base, 'vendors', 'view'));
  ok(can(base, 'campaigns', 'view'));
  ok(!can(base, 'campaigns', 'edit'));
  ok(can({ ...base, superAdmin: true }, 'vendors', 'delete'));
});
test('record sharing: private module', () => {
  const r = { module: 'deals', owner_id: 'other', data: {} };
  eq(recordAccess(base, r, 'private'), null);
  eq(recordAccess(base, { ...r, owner_id: 'rep' }, 'private'), 'rwd');
  eq(recordAccess({ ...base, subordinateUserIds: ['other'] }, r, 'private'), 'rwd');
  eq(recordAccess(base, r, 'public_read'), 'read');
  eq(recordAccess(base, { ...r, shared_with: [{ user_id: 'rep', access: 'rw' }] }, 'private'), 'rw');
  eq(recordAccess(base, { ...r, shared_with: [{ user_id: 'someone', access: 'rwd' }] }, 'private'), null);
  eq(recordAccess({ ...base, sharingRules: [{ module: 'deals', criteria: { match: 'all', conditions: [{ field: 'amount', op: 'gt', value: 10 }] }, toRoleIds: ['r_rep'], access: 'read' }] },
    { ...r, data: { amount: 50 } }, 'private'), 'read');
  eq(recordAccess(base, { module: 'vendors', owner_id: 'rep', data: {} }, 'public_rwd'), null); // no view perm on module
});
test('field security', () => {
  const ctx = { ...base, profile: { ...base.profile, fields: { contacts: { mece_ai_cost_usd: 'hidden' as const, email: 'ro' as const } } } };
  eq(fieldAccess(ctx, 'contacts', 'email'), 'ro');
  eq(visibleData(ctx, 'contacts', { email: 'a', mece_ai_cost_usd: 3 }), { email: 'a' });
});
test('role tree helpers + cycle guard', () => {
  const roles = { ceo: null, sm: 'ceo', rep: 'sm', sup: 'ceo' } as Record<string, string | null>;
  eq(descendants(roles, 'ceo').sort(), ['rep', 'sm', 'sup']);
  eq(ancestors(roles, 'rep'), ['sm', 'ceo']);
  ok(wouldCycle(roles, 'ceo', 'rep'));
  ok(!wouldCycle(roles, 'sup', 'sm'));
  eq(descendants({ a: 'b', b: 'a' }, 'a'), ['b']); // cycle-safe
});
test('cleanProfile drops junk', () => {
  const p = cleanProfile({ modules: { leads: { view: true, hack: true, edit: 'yes' }, evil: { view: true } }, setup: { manage_users: true, root: true },
    fields: { leads: { email: 'hidden', 'x; drop': 'rw', phone: 'weird' } } }, ['leads']);
  eq(p.modules, { leads: { view: true } });
  eq(p.setup, { manage_users: true });
  eq(p.fields, { leads: { email: 'hidden' } });
});

// ---------------- metadata sanity
test('standard metadata is consistent', () => {
  const names = new Set(STANDARD_MODULES.map((m) => m.api_name));
  for (const m of STANDARD_MODULES) {
    const fs = STANDARD_FIELDS.filter((f) => f.module === m.api_name);
    for (const nf of m.settings.nameFields) ok(fs.some((f) => f.api_name === nf), `${m.api_name} name field ${nf}`);
    const seen = new Set<string>();
    for (const f of fs) {
      ok(!seen.has(f.api_name), `dup ${m.api_name}.${f.api_name}`);
      seen.add(f.api_name);
      ok(/^[a-z][a-z0-9_]{0,50}$/.test(f.api_name), `bad api ${f.api_name}`);
      if (f.type === 'lookup') ok(names.has(f.options!.module!), `lookup target ${m.api_name}.${f.api_name}`);
      if (f.type === 'related') ok(f.options!.modules!.every((x) => names.has(x)), `related ${m.api_name}.${f.api_name}`);
    }
    for (const c of m.settings.defaultColumns ?? []) ok(c === 'name' || c === 'owner_id' || c === 'created_at' || c === 'updated_at' || seen.has(c), `column ${m.api_name}.${c}`);
    if (m.settings.kanbanField) ok(seen.has(m.settings.kanbanField), `kanban ${m.api_name}`);
  }
  eq(recordName({ nameFields: ['first_name', 'last_name'] }, { first_name: ' Asha ', last_name: 'Rao' }), 'Asha Rao');
});
