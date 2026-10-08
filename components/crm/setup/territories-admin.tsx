'use client';

/** Territory management: criteria-based record access for a team, with a hierarchy. */
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { setupDeleteConfig, setupSaveTerritory } from '@/app/(app)/crm/setup/actions';
import type { Criteria } from '@/lib/crm/types';
import { CriteriaBuilder } from '../criteria-builder';
import { Button, Card, Field, inp } from '../ui';
import type { BuilderModule } from '../insights/report-builder';

interface Terr { id: string; name: string; module: string; active: boolean; config: { parentId: string | null; criteria?: Criteria; memberIds: string[]; managerId?: string | null; access: 'read' | 'rw' | 'rwd' } }
const ACCESS = { read: 'View', rw: 'View and edit', rwd: 'View, edit and delete' };

export default function TerritoriesAdmin({ territories, modules, members }: { territories: Terr[]; modules: BuilderModule[]; members: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [edit, setEdit] = useState<Terr | null>(null);
  const name = (id: string | null | undefined) => members.find((m) => m.id === id)?.name ?? '—';
  const depth = (t: Terr): number => { let d = 0; let p = t.config.parentId; const seen = new Set<string>(); while (p && !seen.has(p) && d < 10) { seen.add(p); d++; p = territories.find((x) => x.id === p)?.config.parentId ?? null; } return d; };
  const ordered: Terr[] = [];
  const walk = (parent: string | null) => { for (const t of territories.filter((x) => (x.config.parentId ?? null) === parent)) { ordered.push(t); walk(t.id); } };
  walk(null);
  for (const t of territories) if (!ordered.includes(t)) ordered.push(t);
  const save = async () => {
    if (!edit) return;
    const r = await setupSaveTerritory({ id: edit.id || null, name: edit.name, module: edit.module, parentId: edit.config.parentId, criteria: edit.config.criteria, memberIds: edit.config.memberIds, managerId: edit.config.managerId ?? null, access: edit.config.access, active: edit.active });
    if (!r.ok) return toast.error(r.error);
    toast.success('Territory saved');
    setEdit(null);
    router.refresh();
  };
  const remove = async (t: Terr) => {
    if (!confirm(`Delete territory “${t.name}”?`)) return;
    const r = await setupDeleteConfig(t.id, 'territory');
    if (!r.ok) return toast.error(r.error);
    router.refresh();
  };
  const mod = modules.find((m) => m.api === edit?.module) ?? modules[0];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Territories</h1>
          <p className="text-sm text-muted-foreground">Give a team access to the records that match a rule — e.g. Delhi NCR colleges to the North team. A parent territory sees its children’s records.</p>
        </div>
        {!edit && <Button primary onClick={() => setEdit({ id: '', name: '', module: modules.find((m) => m.api === 'accounts')?.api ?? modules[0]?.api ?? 'accounts', active: true, config: { parentId: null, memberIds: [], managerId: null, access: 'rw', criteria: { match: 'all', conditions: [] } } })}>New territory</Button>}
      </div>
      {edit && mod && (
        <Card title={edit.id ? `Edit ${edit.name}` : 'New territory'}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Field label="Name"><input className={inp} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} maxLength={80} /></Field>
            <Field label="Records of"><select className={inp} value={edit.module} onChange={(e) => setEdit({ ...edit, module: e.target.value, config: { ...edit.config, criteria: { match: 'all', conditions: [] } } })}>{modules.map((m) => <option key={m.api} value={m.api}>{m.label}</option>)}</select></Field>
            <Field label="Parent territory"><select className={inp} value={edit.config.parentId ?? ''} onChange={(e) => setEdit({ ...edit, config: { ...edit.config, parentId: e.target.value || null } })}><option value="">None (top level)</option>{territories.filter((t) => t.id !== edit.id).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
            <Field label="Access"><select className={inp} value={edit.config.access} onChange={(e) => setEdit({ ...edit, config: { ...edit.config, access: e.target.value as 'rw' } })}>{Object.entries(ACCESS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
          </div>
          <p className="mb-1 mt-3 text-xs font-medium text-muted-foreground">Records in this territory</p>
          <CriteriaBuilder fields={mod.fields} value={edit.config.criteria ?? null} onChange={(c) => setEdit({ ...edit, config: { ...edit.config, criteria: c ?? undefined } })} />
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Manager"><select className={inp} value={edit.config.managerId ?? ''} onChange={(e) => setEdit({ ...edit, config: { ...edit.config, managerId: e.target.value || null } })}><option value="">None</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
            <div className="md:col-span-2">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Members</p>
              <div className="flex max-h-40 flex-wrap gap-x-4 gap-y-1 overflow-y-auto rounded border border-border p-2 text-sm">
                {members.map((m) => <label key={m.id} className="flex items-center gap-1.5"><input type="checkbox" checked={edit.config.memberIds.includes(m.id)} onChange={(e) => setEdit({ ...edit, config: { ...edit.config, memberIds: e.target.checked ? [...edit.config.memberIds, m.id] : edit.config.memberIds.filter((x) => x !== m.id) } })} />{m.name}</label>)}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Active</label>
            <div className="flex gap-2"><Button onClick={() => setEdit(null)}>Cancel</Button><Button primary onClick={save}>Save</Button></div>
          </div>
        </Card>
      )}
      <Card>
        <table className="w-full text-sm"><tbody>
          {ordered.map((t) => (
            <tr key={t.id} className="border-t border-border first:border-0">
              <td className="py-2" style={{ paddingLeft: depth(t) * 20 }}><span className="font-medium">{t.name}</span>{!t.active && <span className="ml-1 text-xs text-muted-foreground">(off)</span>}<span className="block text-xs text-muted-foreground">{modules.find((m) => m.api === t.module)?.label ?? t.module} · {t.config.criteria?.conditions.length ?? 0} condition(s) · {ACCESS[t.config.access]}</span></td>
              <td className="text-xs text-muted-foreground">Manager: {name(t.config.managerId)} · {t.config.memberIds.length} member(s)</td>
              <td className="text-right"><span className="inline-flex gap-1"><Button small onClick={() => setEdit(t)}>Edit</Button><Button small danger onClick={() => remove(t)}>Delete</Button></span></td>
            </tr>
          ))}
          {!territories.length && <tr><td className="py-6 text-center text-muted-foreground">No territories. Without them, ownership, roles and sharing rules decide access.</td></tr>}
        </tbody></table>
      </Card>
    </div>
  );
}
