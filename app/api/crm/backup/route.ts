/**
 * Data backup (Zoho: Data Administration → Backup). A signed-in CRM user with
 * the `manage_data` setup permission downloads every record they may see in
 * every module they may export, plus the CRM's configuration — as one JSON
 * file. Field security applies; secrets (webhook signing keys) are never
 * included. Audited.
 */
import { NextResponse } from 'next/server';
import { getCrmContext } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { queryAll } from '@/lib/crm/server/records';
import { createServiceClient } from '@/lib/crm/server/svc';
import { audit } from '@/lib/crm/server/db';
import { can, canSetup } from '@/lib/crm/permissions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SECRET_KEYS = /secret|token|password|api_?key/i;
function scrub(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(scrub);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v as Record<string, unknown>).filter(([k]) => !SECRET_KEYS.test(k)).map(([k, x]) => [k, scrub(x)]));
  return v;
}

export async function GET() {
  const ctx = await getCrmContext();
  if (!ctx) return new NextResponse('Not found', { status: 404 });
  if (!canSetup(ctx, 'manage_data')) return new NextResponse('Forbidden', { status: 403 });
  const meta = await loadMeta();
  const out: Record<string, unknown> = { generated_at: new Date().toISOString(), format: 'mece-crm-backup/1', modules: {}, records: {} };
  let total = 0;
  const truncated: string[] = [];
  for (const m of meta.modules.filter((x) => x.active !== false)) {
    if (!can(ctx, m.api_name, 'view') || !can(ctx, m.api_name, 'export')) continue;
    (out.modules as Record<string, unknown>)[m.api_name] = { label: m.label, fields: meta.fields(m.api_name).map((f) => ({ api_name: f.api_name, label: f.label, type: f.type })) };
    const { rows, truncated: t } = await queryAll(ctx, meta, m.api_name, null, 50_000);
    if (t) truncated.push(m.api_name);
    (out.records as Record<string, unknown>)[m.api_name] = rows.map((r) => ({ id: r.id, name: r.name, owner_id: r.owner_id, tags: r.tags, created_at: r.created_at, updated_at: r.updated_at, data: r.data }));
    total += rows.length;
  }
  if (canSetup(ctx, 'manage_setup')) {
    const { data } = await createServiceClient().from('crm_config').select('kind, module, name, active, config').limit(5000);
    out.configuration = scrub(data ?? []);
  }
  out.truncated = truncated;
  await audit(createServiceClient(), { actor_id: ctx.userId, action: 'backup_download', meta: { records: total, modules: Object.keys(out.records as object).length } });
  const name = `mece-crm-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(out), { headers: { 'content-type': 'application/json; charset=utf-8', 'content-disposition': `attachment; filename="${name}"`, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
}
