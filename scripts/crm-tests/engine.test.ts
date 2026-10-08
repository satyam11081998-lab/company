import { test, eq, ok } from './harness';
import { prepareRecord, syncedFieldLocked } from '../../lib/crm/engine';
import { STANDARD_FIELDS, STANDARD_MODULES, DEFAULT_PIPELINES } from '../../lib/crm/modules';
import { DEFAULT_PROFILES } from '../../lib/crm/permissions';
import type { CrmContext } from '../../lib/crm/types';

const mod = (m: string) => STANDARD_MODULES.find((x) => x.api_name === m)!;
const fields = (m: string) => STANDARD_FIELDS.filter((f) => f.module === m);
const admin: CrmContext = { userId: 'a', superAdmin: true, profileId: null, roleId: null, profile: { modules: {}, setup: {}, fields: {} }, subordinateRoleIds: [], subordinateUserIds: [], peerUserIds: [], sharingRules: [], territories: [], userRoles: {} };
const rep: CrmContext = { ...admin, superAdmin: false, userId: 'r', profile: DEFAULT_PROFILES[1].config };
const pipelines = DEFAULT_PIPELINES.map((p) => ({ name: p.name, active: true, config: p.config }));

test('deal defaults: pipeline, first stage, probability, forecast, expected revenue', () => {
  const r = prepareRecord({ module: mod('deals'), fields: fields('deals'), existing: null, patch: { deal_name: 'X', amount: '1000' }, ctx: admin, pipelines, defaultPipeline: 'B2C subscriptions' });
  eq(r.errors, []);
  eq([r.data.pipeline, r.data.stage, r.data.probability, r.data.forecast_category, r.data.expected_revenue], ['B2C subscriptions', 'checkout_started', 30, 'Pipeline', 300]);
});
test('deal stage must belong to the pipeline; label accepted', () => {
  const bad = prepareRecord({ module: mod('deals'), fields: fields('deals'), existing: null, patch: { deal_name: 'X', pipeline: 'Renewals', stage: 'proposal' }, ctx: admin, pipelines });
  ok(bad.errors.some((e) => e.field === 'stage'));
  const good = prepareRecord({ module: mod('deals'), fields: fields('deals'), existing: null, patch: { deal_name: 'X', pipeline: 'Renewals', stage: 'Win-back offer' }, ctx: admin, pipelines });
  eq(good.data.stage, 'negotiation');
  eq(good.data.probability, 60);
});
test('explicit probability survives a stage change', () => {
  const existing = { data: { deal_name: 'X', pipeline: 'Campus partnerships (B2B)', stage: 'prospecting', probability: 10 }, external_key: null };
  const r = prepareRecord({ module: mod('deals'), fields: fields('deals'), existing, patch: { stage: 'negotiation', probability: 55 }, ctx: admin, pipelines });
  eq([r.data.stage, r.data.probability, r.data.forecast_category], ['negotiation', 55, 'Commit']);
});
test('synced record: synced fields locked, CRM fields open; renewal stage unlocked', () => {
  const synced = { data: { full_name: 'A', email: 'a@x.com' }, external_key: 'user:1' };
  const r1 = prepareRecord({ module: mod('contacts'), fields: fields('contacts'), existing: synced, patch: { email: 'b@x.com', title: 'Head' }, ctx: admin });
  ok(r1.errors.some((e) => e.field === 'email' && /MECE/.test(e.message)));
  ok(!r1.errors.some((e) => e.field === 'title'));
  ok(!syncedFieldLocked('deals', 'renewal:u:2026-10-10', 'stage'));
  ok(syncedFieldLocked('deals', 'payment:1', 'stage'));
  const ren = { data: { deal_name: 'R', pipeline: 'Renewals', stage: 'up_for_renewal' }, external_key: 'renewal:u:2026-10-10' };
  const r2 = prepareRecord({ module: mod('deals'), fields: fields('deals'), existing: ren, patch: { stage: 'reminder_sent' }, ctx: admin, pipelines });
  eq(r2.errors, []);
});
test('MECE facts are read-only even on manual records', () => {
  const r = prepareRecord({ module: mod('contacts'), fields: fields('contacts'), existing: null, patch: { full_name: 'B2B person', mece_revenue_inr: 99999 }, ctx: admin });
  ok(r.errors.some((e) => e.field === 'mece_revenue_inr'));
});
test('field security: read-only and hidden fields refused', () => {
  const ctx: CrmContext = { ...rep, profile: { ...rep.profile, fields: { leads: { rating: 'ro', company: 'hidden' } } } };
  const r = prepareRecord({ module: mod('leads'), fields: fields('leads'), existing: null, patch: { last_name: 'L', rating: 'Hot', company: 'C' }, ctx });
  eq(r.errors.map((e) => e.field).sort(), ['company', 'rating']);
});
test('required + name + unknown fields', () => {
  const r = prepareRecord({ module: mod('leads'), fields: fields('leads'), existing: null, patch: { first_name: 'Only', nonsense: 1 }, ctx: admin });
  ok(r.errors.some((e) => e.field === 'last_name'));
  ok(r.errors.some((e) => e.field === 'nonsense'));
  const ok2 = prepareRecord({ module: mod('leads'), fields: fields('leads'), existing: null, patch: { last_name: 'Solo' }, ctx: admin });
  eq(ok2.errors, []);
  eq(ok2.name, 'Solo');
  eq(ok2.data.lead_status, 'New');
});
test('system/computed fields refused unless the engine allows them', () => {
  const r = prepareRecord({ module: mod('quotes'), fields: fields('quotes'), existing: null, patch: { subject: 'Q', quote_number: 'QT-9', grand_total: 1 }, ctx: admin });
  eq(r.errors.map((e) => e.field).sort(), ['grand_total', 'quote_number']);
  const r2 = prepareRecord({ module: mod('leads'), fields: fields('leads'), existing: null, patch: { last_name: 'L', converted_at: '2026-10-01T00:00:00Z' }, ctx: admin, allowSystem: ['converted_at'] });
  eq(r2.errors, []);
});
test('line totals recomputed on every save', () => {
  const r = prepareRecord({ module: mod('invoices'), fields: fields('invoices'), existing: null, ctx: admin,
    patch: { subject: 'I', adjustment: '10', line_items: [{ product_name: 'A', quantity: 2, list_price: 100, discount: 20, tax_pct: 18 }] } });
  eq(r.errors, []);
  eq([r.data.sub_total, r.data.discount_total, r.data.tax_total, r.data.grand_total], [200, 20, 32.4, 222.4]);
});
test('changed list only contains real changes', () => {
  const existing = { data: { last_name: 'L', rating: 'Hot' }, external_key: null };
  const r = prepareRecord({ module: mod('leads'), fields: fields('leads'), existing, patch: { rating: 'Hot', city: 'Pune' }, ctx: admin });
  eq(r.changed, ['city']);
});
