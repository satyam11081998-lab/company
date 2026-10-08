'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { setupDeleteConfig, setupModuleSettings, setupSaveSharingRule } from '@/app/(app)/crm/setup/actions';
import type { ClientField } from '@/lib/crm/client-types';
import type { Criteria, SharingLevel } from '@/lib/crm/types';
import { CriteriaBuilder } from '../criteria-builder';
import { SHARING_LABEL } from './modules-admin';

interface Mod { api: string; label: string; sharing: SharingLevel; fields: ClientField[] }
interface Rule { id: string; module: string; name: string; active: boolean; config: { criteria?: Criteria; ownerRoleIds?: string[]; toRoleIds: string[]; toSubordinates?: boolean; access: 'read' | 'rw' | 'rwd' } }

const sel = 'h-8 rounded-md border border-border bg-background px-2 text-sm';

export default function SharingAdmin({ modules, rules, roles }: { modules: Mod[]; rules: Rule[]; roles: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Rule | null>(null);
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? '?';
  const setDefault = async (m: Mod, sharing: SharingLevel) => {
    const r = await setupModuleSettings(m.api, { sharing });
    if (!r.ok) return toast.error(r.error);
    toast.success(`${m.label}: ${SHARING_LABEL[sharing]}`);
    router.refresh();
  };
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Data sharing</h1>
      <section className="overflow-x-auto rounded-lg border border-border bg-card">
        <h2 className="border-b border-border px-4 py-2 text-sm font-semibold">Org-wide defaults</h2>
        <table className="w-full min-w-[560px] text-sm">
          <tbody>
            {modules.map((m) => (
              <tr key={m.api} className="border-t border-border first:border-0">
                <td className="px-4 py-1.5">{m.label}</td>
                <td className="px-4 py-1.5 text-right">
                  <select className={sel} value={m.sharing} onChange={(e) => setDefault(m, e.target.value as SharingLevel)} aria-label={`${m.label} default sharing`}>
                    {(Object.keys(SHARING_LABEL) as SharingLevel[]).map((s) => <option key={s} value={s}>{SHARING_LABEL[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-4 pb-3 text-xs text-muted-foreground">Private: a record is seen by its owner, the owner’s managers, peers if their role shares, and anyone a rule, territory or manual share lets in. Admins always see everything.</p>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 text-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Sharing rules</h2>
          <button type="button" onClick={() => setEditing({ id: '', module: modules[0]?.api ?? 'deals', name: '', active: true, config: { toRoleIds: [], access: 'read', ownerRoleIds: [] } })} className="text-xs text-navy hover:underline">+ Rule</button>
        </div>
        <ul className="divide-y divide-border">
          {rules.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2">
              <span>
                <span className="font-medium">{r.name}</span>{!r.active && <span className="ml-1 text-xs text-muted-foreground">(off)</span>}
                <span className="block text-xs text-muted-foreground">
                  {modules.find((m) => m.api === r.module)?.label}: {r.config.criteria ? 'records matching criteria' : `records owned by ${(r.config.ownerRoleIds ?? []).map(roleName).join(', ')}`}
                  {' → '}{r.config.toRoleIds.map(roleName).join(', ')}{r.config.toSubordinates ? ' and subordinates' : ''} ({r.config.access})
                </span>
              </span>
              <button type="button" onClick={() => setEditing(r)} className="text-xs text-navy hover:underline">Edit</button>
            </li>
          ))}
          {!rules.length && <li className="py-3 text-muted-foreground">No rules. Defaults and the role hierarchy decide who sees what.</li>}
        </ul>
        {editing && <RuleEditor rule={editing} modules={modules} roles={roles} onDone={() => { setEditing(null); router.refresh(); }} />}
      </section>
    </div>
  );
}

function RuleEditor({ rule, modules, roles, onDone }: { rule: Rule; modules: Mod[]; roles: Array<{ id: string; name: string }>; onDone: () => void }) {
  const [module, setModule] = useState(rule.module);
  const [name, setName] = useState(rule.name);
  const [basis, setBasis] = useState<'owner' | 'criteria'>(rule.config.criteria ? 'criteria' : 'owner');
  const [criteria, setCriteria] = useState<Criteria | null>(rule.config.criteria ?? null);
  const [owners, setOwners] = useState<string[]>(rule.config.ownerRoleIds ?? []);
  const [to, setTo] = useState<string[]>(rule.config.toRoleIds);
  const [subs, setSubs] = useState(!!rule.config.toSubordinates);
  const [access, setAccess] = useState(rule.config.access);
  const [active, setActive] = useState(rule.active);
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const save = async () => {
    const r = await setupSaveSharingRule({ id: rule.id || null, module, name, criteria: basis === 'criteria' ? criteria : undefined, ownerRoleIds: basis === 'owner' ? owners : [], toRoleIds: to, toSubordinates: subs, access, active });
    if (!r.ok) return toast.error(r.error);
    onDone();
  };
  const del = async () => {
    if (!confirm('Delete this rule?')) return;
    const r = await setupDeleteConfig(rule.id, 'sharing_rule');
    if (!r.ok) return toast.error(r.error);
    onDone();
  };
  const fields = modules.find((m) => m.api === module)?.fields ?? [];
  return (
    <div className="mt-3 space-y-3 rounded-md border border-navy/30 p-3">
      <div className="flex flex-wrap gap-2">
        <input className={`${sel} w-56`} placeholder="Rule name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Rule name" />
        <select className={sel} value={module} onChange={(e) => { setModule(e.target.value); setCriteria(null); }} aria-label="Module">{modules.map((m) => <option key={m.api} value={m.api}>{m.label}</option>)}</select>
        <select className={sel} value={access} onChange={(e) => setAccess(e.target.value as 'read')} aria-label="Access"><option value="read">Read only</option><option value="rw">Read & write</option><option value="rwd">Read, write & delete</option></select>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active</label>
      </div>
      <div className="flex gap-3 text-xs">
        <label className="flex items-center gap-1"><input type="radio" checked={basis === 'owner'} onChange={() => setBasis('owner')} /> Records owned by roles</label>
        <label className="flex items-center gap-1"><input type="radio" checked={basis === 'criteria'} onChange={() => setBasis('criteria')} /> Records matching criteria</label>
      </div>
      {basis === 'owner' ? (
        <div className="flex flex-wrap gap-1">{roles.map((r) => <button key={r.id} type="button" onClick={() => setOwners((o) => toggle(o, r.id))} className={`rounded-full border px-2 py-0.5 text-xs ${owners.includes(r.id) ? 'border-navy bg-navy text-navy-foreground' : 'border-border'}`}>{r.name}</button>)}</div>
      ) : (
        <CriteriaBuilder fields={fields} value={criteria} onChange={setCriteria} />
      )}
      <p className="text-xs text-muted-foreground">Share with</p>
      <div className="flex flex-wrap gap-1">{roles.map((r) => <button key={r.id} type="button" onClick={() => setTo((o) => toggle(o, r.id))} className={`rounded-full border px-2 py-0.5 text-xs ${to.includes(r.id) ? 'border-navy bg-navy text-navy-foreground' : 'border-border'}`}>{r.name}</button>)}</div>
      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={subs} onChange={(e) => setSubs(e.target.checked)} /> …and their subordinates</label>
      <div className="flex gap-2">
        <button type="button" onClick={save} className="h-8 rounded-md bg-navy px-3 text-navy-foreground">Save rule</button>
        {rule.id && <button type="button" onClick={del} className="h-8 rounded-md border border-destructive/40 px-3 text-destructive">Delete</button>}
        <button type="button" onClick={onDone} className="h-8 rounded-md border border-border px-3">Cancel</button>
      </div>
    </div>
  );
}
