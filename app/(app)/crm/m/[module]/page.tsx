import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta, pipelineFor } from '@/lib/crm/server/meta';
import { listRecords, queryAll } from '@/lib/crm/server/records';
import { resolveRefs } from '@/lib/crm/server/names';
import { listViews } from '@/lib/crm/server/setup';
import { loadMembers } from '@/lib/crm/server/members';
import { can, canSetup, fieldAccess } from '@/lib/crm/permissions';
import { systemViews } from '@/lib/crm/views';
import { RECORD_COLUMNS, isCriteria, type Criteria } from '@/lib/crm/types';
import { criteriaFields } from '@/lib/crm/criteria';
import { toClientFields, toClientModule, toClientRecord } from '@/lib/crm/client-types';
import RecordList from '@/components/crm/record-list';
import { cadencesFor, loadRules, macrosFor } from '@/lib/crm/server/automation';
import { syncNewReports, syncNewUsers } from '@/lib/crm/server/sync';
import { createServiceClient } from '@/lib/crm/server/svc';

export const dynamic = 'force-dynamic';

function parseCrit(raw: string | undefined): Criteria | null {
  if (!raw || raw.length > 4000) return null;
  try {
    const v = JSON.parse(raw);
    return isCriteria(v) ? v : null;
  } catch {
    return null;
  }
}

export default async function ModuleListPage({ params, searchParams }: {
  params: { module: string };
  searchParams: Record<string, string | undefined>;
}) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx) notFound();
  const meta = await loadMeta();
  const mod = meta.module(params.module);
  if (!mod || mod.active === false || !can(ctx, mod.api_name, 'view')) notFound();
  // Cases: pull in-app reports filed since the last sync, so feedback shows up at once
  if (mod.api_name === 'cases') await syncNewReports(createServiceClient()).catch((e) => console.error('[crm] new reports:', e));
  // Contacts: new sign-ups appear at once (usage facts follow with the daily sync)
  if (mod.api_name === 'contacts') await syncNewUsers(createServiceClient()).catch((e) => console.error('[crm] new users:', e));
  const fields = meta.fields(mod.api_name);

  // A system view whose fields an admin switched off (or this user can't see) is not offered.
  const known = new Set<string>([...fields.filter((f) => f.active !== false).map((f) => f.api_name), ...RECORD_COLUMNS]);
  const sys = systemViews(mod.api_name).filter((v) => criteriaFields(v.criteria).every((f) => known.has(f) && fieldAccess(ctx, mod.api_name, f) !== 'hidden'));
  const custom = await listViews(ctx, mod.api_name);
  const viewKey = searchParams.view ?? 'all';
  const sysView = sys.find((v) => v.key === viewKey);
  const customView = custom.find((v) => v.id === viewKey);
  const viewCriteria = sysView?.criteria ?? customView?.config.criteria ?? null;
  const adhoc = parseCrit(searchParams.crit);
  const criteria: Criteria | null = viewCriteria && adhoc ? { match: 'all', conditions: [viewCriteria, adhoc] } : viewCriteria ?? adhoc;

  const visible = (f: string) => f === 'name' || f === 'owner_id' || f === 'created_at' || f === 'updated_at' || f === 'last_activity_at' || (fields.some((x) => x.api_name === f) && fieldAccess(ctx, mod.api_name, f) !== 'hidden');
  const columns = (customView?.config.columns?.length ? customView.config.columns : mod.settings.defaultColumns ?? ['name', ...fields.slice(0, 5).map((f) => f.api_name), 'owner_id']).filter(visible);
  const sortField = searchParams.sort ?? customView?.config.sort?.field ?? sysView?.sort?.field ?? 'updated_at';
  const sortDir = (searchParams.dir ?? customView?.config.sort?.dir ?? sysView?.sort?.dir ?? 'desc') === 'asc' ? 'asc' : 'desc';
  const kanban = searchParams.kanban === '1' && !!mod.settings.kanbanField;
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);

  let error: string | null = null;
  let rows: Awaited<ReturnType<typeof listRecords>>['rows'] = [];
  let total = 0;
  let truncated = false;
  let pipelineName: string | null = null;
  let kanbanGroups: Array<{ key: string; label: string }> = [];
  try {
    if (kanban) {
      let crit = criteria;
      if (mod.api_name === 'deals') {
        const p = pipelineFor(meta, searchParams.pipeline);
        pipelineName = p?.name ?? null;
        kanbanGroups = (p?.config.stages ?? []).map((s) => ({ key: s.key, label: s.label }));
        const pc: Criteria = { match: 'all', conditions: [{ field: 'pipeline', op: 'eq', value: pipelineName ?? '' }] };
        crit = crit ? { match: 'all', conditions: [crit, pc] } : pc;
      } else {
        const kf = meta.field(mod.api_name, mod.settings.kanbanField!);
        kanbanGroups = (kf?.options?.picklist ?? []).map((p) => ({ key: p.value, label: p.value }));
      }
      const res = await queryAll(ctx, meta, mod.api_name, crit, 2000);
      rows = res.rows.filter((r) => !searchParams.q || r.name.toLowerCase().includes(searchParams.q.toLowerCase()));
      total = rows.length;
      truncated = res.truncated;
    } else {
      const res = await listRecords(ctx, meta, mod.api_name, {
        criteria, search: searchParams.q, sort: { field: sortField, dir: sortDir }, page, pageSize: 50, mine: !!sysView?.mine,
      });
      rows = res.rows;
      total = res.total;
      truncated = res.truncated;
    }
  } catch (e) {
    error = (e as Error).message || 'Could not load records.';
  }
  const refs = await resolveRefs(ctx, meta, rows);
  const members = (await loadMembers()).filter((m) => m.active).map((m) => ({ id: m.id, name: m.name }));
  const [macros, cadences, rules] = await Promise.all([macrosFor(ctx, mod.api_name), cadencesFor(mod.api_name), loadRules()]);
  const canAssign = canSetup(ctx, 'manage_automation') && rules.assignment.some((r) => r.config.module === mod.api_name);

  return (
    <RecordList
      module={toClientModule(mod)}
      fields={toClientFields(ctx, mod.api_name, fields)}
      rows={rows.map(toClientRecord)}
      refs={refs}
      total={total}
      truncated={truncated}
      page={page}
      pageSize={50}
      columns={columns}
      sort={{ field: sortField, dir: sortDir }}
      views={[
        ...sys.map((v) => ({ key: v.key, name: v.name, system: true, mine: false })),
        ...custom.map((v) => ({ key: v.id, name: v.name, system: false, mine: v.owner_id === ctx.userId, shared: v.shared })),
      ]}
      viewKey={viewKey}
      adhoc={adhoc}
      exportCriteria={sysView?.mine ? (criteria ? { match: 'all', conditions: [criteria, { field: 'owner_id', op: 'eq', value: ctx.userId }] } : { match: 'all', conditions: [{ field: 'owner_id', op: 'eq', value: ctx.userId }] }) : criteria}
      search={searchParams.q ?? ''}
      kanban={kanban}
      kanbanGroups={kanbanGroups}
      pipelines={mod.api_name === 'deals' ? meta.pipelines.filter((p) => p.active).map((p) => ({ name: p.name, stages: p.config.stages })) : []}
      pipelineName={pipelineName}
      members={members}
      perms={{
        create: can(ctx, mod.api_name, 'create'), edit: can(ctx, mod.api_name, 'edit'), delete: can(ctx, mod.api_name, 'delete'),
        import: can(ctx, mod.api_name, 'import'), export: can(ctx, mod.api_name, 'export'), shareViews: canSetup(ctx, 'manage_setup'),
      }}
      error={error}
      macros={macros}
      cadences={cadences}
      canAssign={canAssign}
    />
  );
}
