/**
 * REST API keys (Zoho: "Developer space → APIs"). A key acts as the CRM user
 * it belongs to — the same profile, role, sharing and field security — and
 * is further limited by its scopes (read / write / delete). Only the SHA-256
 * of a key is stored; the key itself is shown once, when it is created.
 */
import { createHash, randomBytes } from 'crypto';
import { createServiceClient } from '@/lib/crm/server/svc';
import { isUuid } from '@/lib/crm/fields';
import { canSetup } from '@/lib/crm/permissions';
import type { CrmContext } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError, buildCrmContext } from './context';
import { audit } from './db';
import { loadMembers } from './members';

export const API_SCOPES = ['read', 'write', 'delete'] as const;
export type ApiScope = (typeof API_SCOPES)[number];
export const API_RATE_PER_MIN = 100;
const MAX_KEYS_PER_USER = 10;
const KEY_RE = /^mcrm_([0-9a-f]{8})_([A-Za-z0-9_-]{43})$/;

const hashKey = (key: string) => createHash('sha256').update(key).digest('hex');

function need(ctx: CrmContext) {
  if (!canSetup(ctx, 'manage_setup')) throw new CrmAccessError('Only CRM administrators can manage API keys.');
}

export async function createApiKey(ctx: CrmContext, input: { name: string; userId?: string | null; scopes?: string[]; expiresDays?: number | null }) {
  need(ctx);
  const name = String(input.name ?? '').trim().slice(0, 80);
  if (!name) throw new CrmUserError('Name the key after what will use it (e.g. “Zapier”).');
  const userId = input.userId && isUuid(input.userId) ? input.userId : ctx.userId;
  const members = await loadMembers();
  if (!members.some((m) => m.id === userId && m.active)) throw new CrmUserError('The key must belong to an active CRM user.');
  // a non-admin manager can't mint a key for someone with more access than themselves
  if (!ctx.superAdmin && userId !== ctx.userId && !ctx.subordinateUserIds.includes(userId)) throw new CrmUserError('You can create keys only for yourself or your team.');
  const scopes = [...new Set((input.scopes ?? ['read']).filter((s): s is ApiScope => (API_SCOPES as readonly string[]).includes(s)))];
  if (!scopes.includes('read')) scopes.unshift('read');
  const days = input.expiresDays === null || input.expiresDays === undefined ? 365 : Math.floor(Number(input.expiresDays));
  if (!Number.isFinite(days) || days < 1 || days > 730) throw new CrmUserError('Expiry must be between 1 and 730 days.');
  const svc = createServiceClient();
  const { count } = await svc.from('crm_api_keys').select('id', { count: 'exact', head: true }).eq('user_id', userId).is('revoked_at', null);
  if ((count ?? 0) >= MAX_KEYS_PER_USER) throw new CrmUserError(`A user can have at most ${MAX_KEYS_PER_USER} active keys. Revoke one first.`);
  const prefix = randomBytes(4).toString('hex');
  const key = `mcrm_${prefix}_${randomBytes(32).toString('base64url')}`;
  const { data, error } = await svc.from('crm_api_keys').insert({
    name, prefix, key_hash: hashKey(key), user_id: userId, scopes, created_by: ctx.userId, expires_at: new Date(Date.now() + days * 86_400_000).toISOString(),
  }).select('id').single();
  if (error) throw error;
  await audit(svc, { actor_id: ctx.userId, action: 'api_key_create', module: 'api', meta: { id: (data as { id: string }).id, name, prefix, user: userId, scopes } });
  return { id: (data as { id: string }).id, key, prefix };
}

export async function listApiKeys(ctx: CrmContext) {
  need(ctx);
  const svc = createServiceClient();
  const { data } = await svc.from('crm_api_keys').select('id, name, prefix, user_id, scopes, created_at, last_used_at, expires_at, revoked_at').order('created_at', { ascending: false }).limit(200);
  const rows = (data ?? []) as Array<{ id: string; name: string; prefix: string; user_id: string; scopes: string[]; created_at: string; last_used_at: string | null; expires_at: string | null; revoked_at: string | null }>;
  const ids = rows.map((r) => r.id);
  const { data: usage } = ids.length ? await svc.from('crm_api_usage').select('key_id, calls').in('key_id', ids).gte('minute', new Date(Date.now() - 86_400_000).toISOString()).limit(20_000) : { data: [] };
  const calls = new Map<string, number>();
  for (const u of (usage ?? []) as Array<{ key_id: string; calls: number }>) calls.set(u.key_id, (calls.get(u.key_id) ?? 0) + u.calls);
  const members = await loadMembers();
  const visible = ctx.superAdmin ? rows : rows.filter((r) => r.user_id === ctx.userId || ctx.subordinateUserIds.includes(r.user_id));
  return visible.map((r) => ({ ...r, user: members.find((m) => m.id === r.user_id)?.name ?? 'Former user', calls24h: calls.get(r.id) ?? 0 }));
}

export async function revokeApiKey(ctx: CrmContext, id: string) {
  need(ctx);
  if (!isUuid(id)) throw new CrmAccessError('Not found.');
  const svc = createServiceClient();
  const { data: row } = await svc.from('crm_api_keys').select('user_id, prefix').eq('id', id).maybeSingle();
  const r = row as { user_id: string; prefix: string } | null;
  if (!r || (!ctx.superAdmin && r.user_id !== ctx.userId && !ctx.subordinateUserIds.includes(r.user_id))) throw new CrmAccessError('Not found.');
  await svc.from('crm_api_keys').update({ revoked_at: new Date().toISOString() }).eq('id', id).is('revoked_at', null);
  await audit(svc, { actor_id: ctx.userId, action: 'api_key_revoke', module: 'api', meta: { id, prefix: r.prefix } });
}

export type ApiAuth =
  | { ok: true; ctx: CrmContext; keyId: string; scopes: ApiScope[]; remaining: number }
  | { ok: false; status: 401 | 403 | 429; message: string; retryAfter?: number };

/** Authenticate a REST call from its Authorization header. */
export async function authenticateApiKey(header: string | null): Promise<ApiAuth> {
  const m = /^Bearer\s+(\S+)$/i.exec(header ?? '');
  const key = m?.[1] ?? '';
  if (!KEY_RE.test(key)) return { ok: false, status: 401, message: 'Missing or malformed API key. Send “Authorization: Bearer mcrm_…”.' };
  const svc = createServiceClient();
  const { data } = await svc.from('crm_api_keys').select('id, user_id, scopes, expires_at, revoked_at, last_used_at').eq('key_hash', hashKey(key)).maybeSingle();
  const row = data as { id: string; user_id: string; scopes: string[]; expires_at: string | null; revoked_at: string | null; last_used_at: string | null } | null;
  if (!row || row.revoked_at) return { ok: false, status: 401, message: 'This API key is not valid.' };
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return { ok: false, status: 401, message: 'This API key has expired.' };
  const { data: calls } = await svc.rpc('crm_api_hit', { p_key: row.id });
  const n = Number(calls ?? 0);
  if (n > API_RATE_PER_MIN) return { ok: false, status: 429, message: `Rate limit: ${API_RATE_PER_MIN} calls per minute.`, retryAfter: 60 - new Date().getSeconds() };
  // the key's user must still be a CRM user; their current permissions apply
  const ctx = await buildCrmContext(row.user_id);
  if (!ctx) return { ok: false, status: 403, message: 'The user this key belongs to no longer has CRM access.' };
  if (!row.last_used_at || Date.now() - new Date(row.last_used_at).getTime() > 60_000) {
    await svc.from('crm_api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', row.id);
  }
  return { ok: true, ctx, keyId: row.id, scopes: row.scopes.filter((s): s is ApiScope => (API_SCOPES as readonly string[]).includes(s)), remaining: Math.max(0, API_RATE_PER_MIN - n) };
}
