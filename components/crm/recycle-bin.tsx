'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { crmPurge, crmRestore } from '@/app/(app)/crm/actions';

interface Row { id: string; module: string; moduleApi: string; name: string; deletedAt: string; deletedBy: string }

export default function RecycleBin({ rows, canPurge }: { rows: Row[]; canPurge: boolean }) {
  const router = useRouter();
  const [sel, setSel] = useState<string[]>([]);
  const restore = async () => {
    const r = await crmRestore(sel);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Restored ${r.data}`);
    setSel([]);
    router.refresh();
  };
  const purge = async () => {
    if (!confirm(`Permanently delete ${sel.length} record(s)? This can’t be undone.`)) return;
    const r = await crmPurge(sel);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Deleted ${r.data} permanently`);
    setSel([]);
    router.refresh();
  };
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-semibold">Recycle bin</h1>
        <p className="text-sm text-muted-foreground">Deleted records stay here for 60 days, then they are removed for good.</p>
      </div>
      {sel.length > 0 && (
        <div className="flex gap-2">
          <button type="button" onClick={restore} className="h-8 rounded-md bg-navy px-3 text-sm text-navy-foreground">Restore {sel.length}</button>
          {canPurge && <button type="button" onClick={purge} className="h-8 rounded-md border border-destructive/40 px-3 text-sm text-destructive">Delete permanently</button>}
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr><th className="w-9 px-3 py-2" /><th className="px-3 py-2">Record</th><th className="px-3 py-2">Module</th><th className="px-3 py-2">Deleted</th><th className="px-3 py-2">By</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2"><input type="checkbox" aria-label={`Select ${r.name}`} checked={sel.includes(r.id)} onChange={(e) => setSel((s) => (e.target.checked ? [...s, r.id] : s.filter((x) => x !== r.id)))} /></td>
                <td className="px-3 py-2"><Link href={`/crm/m/${r.moduleApi}/${r.id}`} className="text-navy hover:underline">{r.name || '(no name)'}</Link></td>
                <td className="px-3 py-2">{r.module}</td>
                <td className="px-3 py-2 text-muted-foreground">{new Date(r.deletedAt).toLocaleString('en-IN')}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.deletedBy}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">The recycle bin is empty.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
