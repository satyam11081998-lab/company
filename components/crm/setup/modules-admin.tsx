'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { setupCreateModule, setupModuleSettings } from '@/app/(app)/crm/setup/actions';
import type { SharingLevel } from '@/lib/crm/types';

interface Mod { api: string; label: string; singular: string; kind: string; sharing: SharingLevel; active: boolean; fields: number; custom: number }

export const SHARING_LABEL: Record<SharingLevel, string> = {
  private: 'Private (owner + managers)', public_read: 'Public read-only', public_rw: 'Public read/write', public_rwd: 'Public read/write/delete',
};

export default function ModulesAdmin({ modules }: { modules: Mod[] }) {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [singular, setSingular] = useState('');
  const create = async () => {
    const r = await setupCreateModule({ label, singular: singular || label });
    if (!r.ok) return toast.error(r.error);
    toast.success('Module created — add its fields next');
    router.push(`/crm/setup/modules/${r.data}`);
  };
  const toggle = async (m: Mod) => {
    const r = await setupModuleSettings(m.api, { active: !m.active });
    if (!r.ok) return toast.error(r.error);
    router.refresh();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Modules and fields</h1>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr><th className="px-3 py-2">Module</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Fields</th><th className="px-3 py-2">Default sharing</th><th className="px-3 py-2">Status</th><th /></tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.api} className="border-t border-border">
                <td className="px-3 py-2"><Link href={`/crm/setup/modules/${m.api}`} className="font-medium text-navy hover:underline">{m.label}</Link><span className="ml-2 text-xs text-muted-foreground">{m.api}</span></td>
                <td className="px-3 py-2">{m.kind}</td>
                <td className="px-3 py-2">{m.fields}{m.custom ? ` (${m.custom} custom)` : ''}</td>
                <td className="px-3 py-2 text-xs">{SHARING_LABEL[m.sharing]}</td>
                <td className="px-3 py-2">{m.active ? 'Active' : <span className="text-muted-foreground">Off</span>}</td>
                <td className="px-3 py-2 text-right">
                  {!['leads', 'contacts', 'accounts', 'deals'].includes(m.api) && (
                    <button type="button" onClick={() => toggle(m)} className="text-xs text-muted-foreground hover:underline">{m.active ? 'Switch off' : 'Switch on'}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="rounded-lg border border-border bg-card p-4 text-sm">
        <p className="font-medium">New custom module</p>
        <p className="mb-3 text-muted-foreground">For anything MECE tracks that isn’t a standard module — e.g. “Campus ambassadors”, “Workshops”, “Partnerships”.</p>
        <div className="flex flex-wrap gap-2">
          <input className="h-9 w-56 rounded-md border border-border bg-background px-2.5" placeholder="Plural name (Workshops)" value={label} onChange={(e) => setLabel(e.target.value)} aria-label="Plural name" />
          <input className="h-9 w-56 rounded-md border border-border bg-background px-2.5" placeholder="Singular (Workshop)" value={singular} onChange={(e) => setSingular(e.target.value)} aria-label="Singular name" />
          <button type="button" disabled={!label.trim()} onClick={create} className="h-9 rounded-md bg-navy px-4 text-navy-foreground disabled:opacity-50">Create</button>
        </div>
      </section>
    </div>
  );
}
