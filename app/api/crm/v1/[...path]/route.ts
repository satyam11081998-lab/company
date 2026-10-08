/**
 * MECE CRM REST API v1 (Zoho CRM API–style). Authenticate with
 *   Authorization: Bearer mcrm_xxxxxxxx_…
 * A key acts as its CRM user (same module permissions, record sharing and
 * field security) and is limited further by its scopes. 100 calls/minute.
 *
 *   GET    /api/crm/v1/me
 *   GET    /api/crm/v1/modules
 *   GET    /api/crm/v1/modules/{module}/fields
 *   GET    /api/crm/v1/{module}?page=1&per_page=200&sort_by=field&sort_order=asc|desc&q=text
 *   GET    /api/crm/v1/{module}/{id}
 *   POST   /api/crm/v1/{module}            { "data": [ {…}, … ] }  (≤100; "assign": true uses assignment rules)
 *   PUT    /api/crm/v1/{module}/{id}       { "data": {…} }         (write scope)
 *   DELETE /api/crm/v1/{module}/{id}                               (delete scope; to the recycle bin)
 *   POST   /api/crm/v1/{module}/search     { "criteria": {…}, "limit": 200 }
 */
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/crm/server/svc';
import { API_RATE_PER_MIN, authenticateApiKey, type ApiScope } from '@/lib/crm/server/api-keys';
import { CrmAccessError } from '@/lib/crm/server/context';
import { loadMetaWith } from '@/lib/crm/server/meta';
import { SaveError, createRecord, deleteRecords, getRecord, listRecords, queryAll, updateRecord } from '@/lib/crm/server/records';
import { audit } from '@/lib/crm/server/db';
import { can, fieldAccess } from '@/lib/crm/permissions';
import { isUuid } from '@/lib/crm/fields';
import type { CrmRecord } from '@/lib/crm/types';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 1024 * 1024;
const NO_STORE = { 'cache-control': 'no-store' };

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) => NextResponse.json(body, { status, headers: { ...NO_STORE, ...extra } });
const fail = (status: number, code: string, message: string, details?: unknown) => json({ status: 'error', code, message, ...(details ? { details } : {}) }, status);

function out(r: CrmRecord) {
  return { id: r.id, name: r.name, owner_id: r.owner_id, tags: r.tags, created_at: r.created_at, updated_at: r.updated_at, approval_status: r.approval_status ?? null, locked: !!r.locked, data: r.data };
}

async function readBody(req: Request): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; res: NextResponse }> {
  if (!(req.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return { ok: false, res: fail(415, 'UNSUPPORTED_MEDIA_TYPE', 'Send JSON (Content-Type: application/json).') };
  const raw = await req.text();
  if (raw.length > MAX_BYTES) return { ok: false, res: fail(413, 'PAYLOAD_TOO_LARGE', 'Request body is larger than 1 MB.') };
  try {
    const b = JSON.parse(raw);
    if (!b || typeof b !== 'object' || Array.isArray(b)) return { ok: false, res: fail(400, 'INVALID_DATA', 'Body must be a JSON object.') };
    return { ok: true, body: b as Record<string, unknown> };
  } catch {
    return { ok: false, res: fail(400, 'INVALID_DATA', 'Body is not valid JSON.') };
  }
}

function errorOf(e: unknown) {
  if (e instanceof SaveError) return fail(400, 'INVALID_DATA', e.message, e.errors.map((x) => ({ field: x.field, message: x.message })));
  if (e instanceof CrmAccessError) return /permission|can['’]t|only view/i.test(e.message) ? fail(403, 'NO_PERMISSION', e.message) : fail(404, 'NOT_FOUND', e.message || 'Not found.');
  const err = e as Error & { expose?: boolean };
  if (err?.name === 'CrmUserError' || err?.expose) return fail(400, 'INVALID_REQUEST', err.message);
  console.error('[crm api] failed:', e);
  return fail(500, 'INTERNAL_ERROR', 'Something went wrong.');
}

async function handle(req: Request, path: string[], method: string) {
  const auth = await authenticateApiKey(req.headers.get('authorization'));
  if (!auth.ok) {
    if (auth.status === 429) return json({ status: 'error', code: 'RATE_LIMITED', message: auth.message }, 429, { 'retry-after': String(auth.retryAfter ?? 60) });
    return fail(auth.status, auth.status === 403 ? 'NO_PERMISSION' : 'INVALID_TOKEN', auth.message);
  }
  const { ctx, scopes } = auth;
  const needScope = (s: ApiScope) => scopes.includes(s);
  const rateHeaders = { 'x-ratelimit-limit': String(API_RATE_PER_MIN), 'x-ratelimit-remaining': String(auth.remaining) };
  const svc = createServiceClient();
  const meta = await loadMetaWith(svc);
  const [a, b, c] = path;
  const log = (action: string, module: string | null, extra: Record<string, unknown> = {}) => audit(svc, { actor_id: ctx.userId, actor_kind: 'api', action, module, meta: { key: auth.keyId, ...extra } });

  try {
    if (method === 'GET' && a === 'me' && path.length === 1) {
      return json({ data: { user_id: ctx.userId, admin: ctx.superAdmin, scopes } }, 200, rateHeaders);
    }
    if (method === 'GET' && a === 'modules' && path.length === 1) {
      const mods = meta.modules.filter((m) => m.active !== false && can(ctx, m.api_name, 'view')).map((m) => ({ api_name: m.api_name, label: m.label, singular: m.singular, permissions: { create: can(ctx, m.api_name, 'create'), edit: can(ctx, m.api_name, 'edit'), delete: can(ctx, m.api_name, 'delete') } }));
      return json({ data: mods }, 200, rateHeaders);
    }
    if (method === 'GET' && a === 'modules' && c === 'fields' && path.length === 3) {
      if (!meta.module(b) || !can(ctx, b, 'view')) return fail(404, 'NOT_FOUND', 'Module not found.');
      const fields = meta.fields(b).filter((f) => f.active !== false && fieldAccess(ctx, b, f.api_name) !== 'hidden').map((f) => ({
        api_name: f.api_name, label: f.label, type: f.type, required: !!f.required, read_only: !!f.system || f.synced === true || fieldAccess(ctx, b, f.api_name) === 'ro',
        unique: !!f.is_unique, picklist: f.options?.picklist?.map((p) => p.value) ?? undefined, lookup: f.options?.module ?? undefined,
      }));
      return json({ data: fields }, 200, rateHeaders);
    }
    const module = a;
    if (!module || !/^[a-z][a-z0-9_]{1,40}$/.test(module) || !meta.module(module) || meta.module(module)!.active === false || !can(ctx, module, 'view')) {
      return fail(404, 'NOT_FOUND', 'Module not found.');
    }

    // list
    if (method === 'GET' && path.length === 1) {
      const u = new URL(req.url);
      const page = Math.max(1, Math.min(1000, Number(u.searchParams.get('page') ?? 1) || 1));
      const perPage = Math.max(1, Math.min(200, Number(u.searchParams.get('per_page') ?? 200) || 200));
      const sortBy = u.searchParams.get('sort_by');
      const dir = u.searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';
      if (sortBy && fieldAccess(ctx, module, sortBy) === 'hidden') return fail(400, 'INVALID_REQUEST', 'You can’t sort by that field.');
      const q = (u.searchParams.get('q') ?? '').slice(0, 100);
      const res = await listRecords(ctx, meta, module, { page, pageSize: perPage, sort: sortBy ? { field: sortBy, dir } : undefined, search: q || undefined });
      return json({ data: res.rows.map(out), info: { page: res.page, per_page: res.pageSize, count: res.rows.length, total: res.total, more_records: res.page * res.pageSize < res.total } }, 200, rateHeaders);
    }
    // search
    if (method === 'POST' && path.length === 2 && b === 'search') {
      const body = await readBody(req);
      if (!body.ok) return body.res;
      const limit = Math.max(1, Math.min(200, Number(body.body.limit ?? 200) || 200));
      const { rows, truncated } = await queryAll(ctx, meta, module, (body.body.criteria ?? null) as never, 20_000);
      return json({ data: rows.slice(0, limit).map(out), info: { count: Math.min(limit, rows.length), total: rows.length, truncated: truncated || rows.length > limit } }, 200, rateHeaders);
    }
    // get one
    if (method === 'GET' && path.length === 2) {
      if (!isUuid(b)) return fail(404, 'NOT_FOUND', 'Record not found.');
      const rec = await getRecord(ctx, meta, module, b);
      return json({ data: [out(rec)] }, 200, rateHeaders);
    }
    // create (bulk ≤ 100, per-row results like Zoho)
    if (method === 'POST' && path.length === 1) {
      if (!needScope('write')) return fail(403, 'OAUTH_SCOPE_MISMATCH', 'This key has no write scope.');
      const body = await readBody(req);
      if (!body.ok) return body.res;
      const rows = Array.isArray(body.body.data) ? body.body.data : body.body.data && typeof body.body.data === 'object' ? [body.body.data] : null;
      if (!rows?.length) return fail(400, 'INVALID_DATA', 'Send { "data": [ { …fields… } ] }.');
      if (rows.length > 100) return fail(400, 'LIMIT_EXCEEDED', 'At most 100 records per call.');
      const results = [];
      let created = 0;
      for (const raw of rows) {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { results.push({ status: 'error', code: 'INVALID_DATA', message: 'Each item must be an object.' }); continue; }
        const { owner_id, tags, ...data } = raw as Record<string, unknown>;
        try {
          const rec = await createRecord(ctx, meta, module, data, {
            source: 'api', sourceRef: auth.keyId,
            ownerId: body.body.assign === true ? null : typeof owner_id === 'string' ? owner_id : undefined,
            tags: Array.isArray(tags) ? (tags as string[]) : undefined,
          });
          created++;
          results.push({ status: 'success', code: 'SUCCESS', details: { id: rec.id, name: rec.name, created_at: rec.created_at } });
        } catch (e) {
          const r = errorOf(e);
          results.push(await r.json());
        }
      }
      await log('api_create', module, { requested: rows.length, created });
      return json({ data: results }, created === rows.length ? 201 : created ? 207 : 400, rateHeaders);
    }
    // update
    if ((method === 'PUT' || method === 'PATCH') && path.length === 2) {
      if (!needScope('write')) return fail(403, 'OAUTH_SCOPE_MISMATCH', 'This key has no write scope.');
      if (!isUuid(b)) return fail(404, 'NOT_FOUND', 'Record not found.');
      const body = await readBody(req);
      if (!body.ok) return body.res;
      const item = Array.isArray(body.body.data) ? body.body.data[0] : body.body.data;
      if (!item || typeof item !== 'object' || Array.isArray(item)) return fail(400, 'INVALID_DATA', 'Send { "data": { …fields… } }.');
      const { owner_id, tags, ...data } = item as Record<string, unknown>;
      const rec = await updateRecord(ctx, meta, module, b, data, {
        source: 'api', sourceRef: auth.keyId,
        expectedUpdatedAt: typeof body.body.expected_updated_at === 'string' ? body.body.expected_updated_at : null,
        ownerId: typeof owner_id === 'string' || owner_id === null ? (owner_id as string | null) : undefined,
        tags: Array.isArray(tags) ? (tags as string[]) : undefined,
      });
      return json({ data: [{ status: 'success', code: 'SUCCESS', details: out(rec) }] }, 200, rateHeaders);
    }
    // delete
    if (method === 'DELETE' && path.length === 2) {
      if (!needScope('delete')) return fail(403, 'OAUTH_SCOPE_MISMATCH', 'This key has no delete scope.');
      if (!isUuid(b)) return fail(404, 'NOT_FOUND', 'Record not found.');
      const r = await deleteRecords(ctx, meta, module, [b]);
      if (!r.deleted) return fail(r.skipped.length && r.skipped[0] !== b ? 409 : 404, r.skipped.length && r.skipped[0] !== b ? 'CANNOT_DELETE' : 'NOT_FOUND', r.skipped.length && r.skipped[0] !== b ? `Not deleted: ${r.skipped[0]}` : 'Record not found.');
      await log('api_delete', module, { id: b });
      return json({ data: [{ status: 'success', code: 'SUCCESS', details: { id: b } }] }, 200, rateHeaders);
    }
    return fail(404, 'NOT_FOUND', 'No such endpoint.');
  } catch (e) {
    return errorOf(e);
  }
}

type P = { params: { path: string[] } };
export const GET = (req: Request, { params }: P) => handle(req, params.path ?? [], 'GET');
export const POST = (req: Request, { params }: P) => handle(req, params.path ?? [], 'POST');
export const PUT = (req: Request, { params }: P) => handle(req, params.path ?? [], 'PUT');
export const PATCH = (req: Request, { params }: P) => handle(req, params.path ?? [], 'PATCH');
export const DELETE = (req: Request, { params }: P) => handle(req, params.path ?? [], 'DELETE');

