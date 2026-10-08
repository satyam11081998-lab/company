'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { setupDeleteConfig, setupSaveProfile } from '@/app/(app)/crm/setup/actions';
import { MODULE_PERMS, SETUP_PERMS, type FieldAccess, type ModulePerm, type ProfileConfig, type SetupPerm } from '@/lib/crm/types';

const SETUP_LABEL: Record<SetupPerm, string> = {
  manage_setup: 'Customise modules, fields, pipelines', manage_users: 'Manage users, roles, profiles, sharing', manage_automation: 'Manage automation',
  approve_outbox: 'Approve customer emails (Outbox)', manage_marketing: 'Templates, campaigns, segments, forms, surveys', view_analytics: 'View analytics',
  manage_reports: 'Create reports and dashboards', manage_ai: 'Configure AI models', manage_privacy: 'Privacy (DPDP) requests and consents',
  view_audit: 'View audit log', manage_data: 'Sync, backups, recycle-bin purge',
};

export default function ProfileEditor({ id, name: n0, description: d0, config, modules }: {
  id: string | null; name: string; description: string; config: ProfileConfig;
  modules: Array<{ api: string; label: string; fields: Array<{ api: string; label: string; required: boolean }> }>;
}) {
  const router = useRouter();
  const [name, setName] = useState(n0);
  const [description, setDescription] = useState(d0);
  const [cfg, setCfg] = useState<ProfileConfig>(config);
  const [fieldsFor, setFieldsFor] = useState(modules[0]?.api ?? '');

  const modPerm = (m: string, p: ModulePerm) => cfg.modules[m]?.[p] ?? cfg.allModules?.[p] ?? false;
  const setModPerm = (m: string, p: ModulePerm, v: boolean) => setCfg((c) => ({ ...c, modules: { ...c.modules, [m]: { ...Object.fromEntries(MODULE_PERMS.map((x) => [x, modPerm(m, x)])), [p]: v } } }));
  const fieldAcc = (m: string, f: string): FieldAccess => cfg.fields[m]?.[f] ?? 'rw';
  const setField = (m: string, f: string, a: FieldAccess) => setCfg((c) => ({ ...c, fields: { ...c.fields, [m]: { ...(c.fields[m] ?? {}), [f]: a } } }));

  const save = async () => {
    const r = await setupSaveProfile({ id, name, description, config: cfg });
    if (!r.ok) return toast.error(r.error);
    toast.success('Profile saved');
    router.push('/crm/setup/users');
    router.refresh();
  };
  const del = async () => {
    if (!id || !confirm('Delete this profile?')) return;
    const r = await setupDeleteConfig(id, 'profile');
    if (!r.ok) return toast.error(r.error);
    router.push('/crm/setup/users');
  };
  const fm = modules.find((m) => m.api === fieldsFor);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{id ? `Profile: ${n0}` : 'New profile'}</h1>
        <Link href="/crm/setup/users" className="text-sm text-muted-foreground hover:underline">Back</Link>
      </div>
      <section className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-4 text-sm md:grid-cols-2">
        <label><span className="mb-1 block text-xs text-muted-foreground">Name</span><input className="h-9 w-full rounded-md border border-border bg-background px-2.5" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label><span className="mb-1 block text-xs text-muted-foreground">Description</span><input className="h-9 w-full rounded-md border border-border bg-background px-2.5" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
      </section>

      <section className="overflow-x-auto rounded-lg border border-border bg-card">
        <h2 className="border-b border-border px-4 py-2 text-sm font-semibold">Module permissions</h2>
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-xs text-muted-foreground"><tr><th className="px-4 py-2 text-left">Module</th>{MODULE_PERMS.map((p) => <th key={p} className="px-2 py-2 capitalize">{p}</th>)}</tr></thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.api} className="border-t border-border">
                <td className="px-4 py-1.5">{m.label}</td>
                {MODULE_PERMS.map((p) => (
                  <td key={p} className="px-2 py-1.5 text-center">
                    <input type="checkbox" aria-label={`${m.label} ${p}`} checked={modPerm(m.api, p)} onChange={(e) => setModPerm(m.api, p, e.target.checked)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 text-sm">
        <h2 className="mb-2 font-semibold">Setup permissions</h2>
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {SETUP_PERMS.map((p) => (
            <label key={p} className="flex items-center gap-2">
              <input type="checkbox" checked={cfg.setup[p] === true} onChange={(e) => setCfg((c) => ({ ...c, setup: { ...c.setup, [p]: e.target.checked } }))} />
              {SETUP_LABEL[p]}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 text-sm">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Field-level security</h2>
          <select className="h-8 rounded-md border border-border bg-background px-2" value={fieldsFor} onChange={(e) => setFieldsFor(e.target.value)} aria-label="Module">
            {modules.map((m) => <option key={m.api} value={m.api}>{m.label}</option>)}
          </select>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">Hidden fields never leave the server for this profile — not in lists, records, exports, reports, search or the timeline.</p>
        <div className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
          {fm?.fields.map((f) => (
            <div key={f.api} className="flex items-center justify-between border-b border-border/60 py-1">
              <span>{f.label}</span>
              <select className="h-7 rounded border border-border bg-background px-1 text-xs" value={fieldAcc(fm.api, f.api)} onChange={(e) => setField(fm.api, f.api, e.target.value as FieldAccess)} aria-label={`${f.label} access`}>
                <option value="rw">Read & write</option><option value="ro">Read only</option>{!f.required && <option value="hidden">Hidden</option>}
              </select>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={!name.trim()} className="h-9 rounded-md bg-navy px-4 text-navy-foreground disabled:opacity-50">Save profile</button>
        {id && <button type="button" onClick={del} className="h-9 rounded-md border border-destructive/40 px-4 text-destructive">Delete</button>}
      </div>
    </div>
  );
}
