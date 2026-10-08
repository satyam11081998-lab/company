'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ClientField, ClientModule } from '@/lib/crm/client-types';
import { autoMap, parseCsv } from '@/lib/crm/csv';
import { crmImport, crmUndoImport } from '@/app/(app)/crm/actions';
import type { Member } from './field-input';

interface Past { id: string; filename: string; total: number; created: number; updated: number; skipped: number; failed: number; created_at: string; undone_at: string | null }

export default function ImportWizard({ module: mod, fields, members, past }: { module: ClientModule; fields: ClientField[]; members: Member[]; past: Past[] }) {
  const router = useRouter();
  const [text, setText] = useState<string | null>(null);
  const [filename, setFilename] = useState('');
  const [header, setHeader] = useState<string[]>([]);
  const [sample, setSample] = useState<string[][]>([]);
  const [rowsCount, setRowsCount] = useState(0);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [dupMode, setDupMode] = useState<'skip' | 'update' | 'add'>('skip');
  const [useAssignment, setUseAssignment] = useState(false);
  const [matchBy, setMatchBy] = useState<'email' | 'name'>(mod.emailField ? 'email' : 'name');
  const [owner, setOwner] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | { importId: string; total: number; created: number; updated: number; skipped: number; failed: number; errors: Array<{ row: number; message: string }> }>(null);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error('Files can be at most 5 MB.');
    const t = await f.text();
    try {
      const p = parseCsv(t);
      setText(t);
      setFilename(f.name);
      setHeader(p.header);
      setSample(p.rows.slice(0, 3));
      setRowsCount(p.rows.length);
      setMapping(autoMap(p.header, fields.map((x) => ({ api_name: x.api, label: x.label }))));
      setResult(null);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const run = async () => {
    if (!text) return;
    setBusy(true);
    const r = await crmImport(mod.api, text, filename, { mapping, dupMode, matchBy, ownerId: owner || null, useAssignment });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    setResult(r.data);
    toast.success(`Imported: ${r.data.created} new, ${r.data.updated} updated`);
    router.refresh();
  };

  const undo = async (id: string) => {
    if (!confirm('Move every record this import created to the recycle bin?')) return;
    const r = await crmUndoImport(id);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Removed ${r.data} record(s)`);
    router.refresh();
  };

  const sel = 'h-8 w-full rounded-md border border-border bg-background px-2 text-sm';
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Import {mod.label.toLowerCase()}</h1>
        <Link href={`/crm/m/${mod.api}`} className="text-sm text-muted-foreground hover:underline">Back</Link>
      </div>

      <section className="rounded-lg border border-border bg-card p-4 text-sm">
        <p className="font-medium">1 · Choose a CSV file</p>
        <p className="mb-2 text-muted-foreground">Up to 5,000 rows and 5 MB. The first row must be the column names. Excel: File → Save as → CSV UTF-8.</p>
        <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} aria-label="CSV file" />
      </section>

      {header.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-4 text-sm">
          <p className="font-medium">2 · Match columns to fields <span className="font-normal text-muted-foreground">({rowsCount} rows in {filename})</span></p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead className="text-xs text-muted-foreground"><tr><th className="py-1 text-left">Column</th><th className="py-1 text-left">Sample</th><th className="py-1 text-left">Field</th></tr></thead>
              <tbody>
                {header.map((h, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-1.5 pr-3 font-medium">{h}</td>
                    <td className="max-w-[220px] truncate py-1.5 pr-3 text-muted-foreground">{sample.map((r) => r[i]).filter(Boolean).slice(0, 2).join(' · ')}</td>
                    <td className="py-1.5">
                      <select className={sel} value={mapping[i] ?? ''} onChange={(e) => setMapping((m) => { const n = { ...m }; if (e.target.value) n[i] = e.target.value; else delete n[i]; return n; })}>
                        <option value="">Don’t import</option>
                        {fields.map((f) => <option key={f.api} value={f.api}>{f.label}{f.required ? ' *' : ''}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {header.length > 0 && (
        <section className="space-y-3 rounded-lg border border-border bg-card p-4 text-sm">
          <p className="font-medium">3 · Duplicates and owner</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="block"><span className="mb-1 block text-xs text-muted-foreground">If a record already exists</span>
              <select className={sel} value={dupMode} onChange={(e) => setDupMode(e.target.value as 'skip')}>
                <option value="skip">Skip it</option><option value="update">Update it</option><option value="add">Add as new anyway</option>
              </select></label>
            <label className="block"><span className="mb-1 block text-xs text-muted-foreground">Match existing records by</span>
              <select className={sel} value={matchBy} onChange={(e) => setMatchBy(e.target.value as 'email')}>
                {mod.emailField && <option value="email">Email</option>}<option value="name">Name</option>
              </select></label>
            <label className="block"><span className="mb-1 block text-xs text-muted-foreground">Owner of new records</span>
              <select className={sel} value={owner} onChange={(e) => setOwner(e.target.value)}>
                <option value="">Me</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select></label>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={useAssignment} onChange={(e) => setUseAssignment(e.target.checked)} /> Use the assignment rule (round robin) for new records, if this module has one</label>
          <button type="button" disabled={busy || !Object.keys(mapping).length} onClick={run} className="h-9 rounded-md bg-navy px-4 text-navy-foreground disabled:opacity-50">{busy ? 'Importing…' : `Import ${rowsCount} rows`}</button>
        </section>
      )}

      {result && (
        <section className="rounded-lg border border-border bg-card p-4 text-sm">
          <p className="font-medium">Done: {result.created} created · {result.updated} updated · {result.skipped} skipped · {result.failed} failed</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 max-h-60 list-disc overflow-y-auto pl-5 text-xs text-destructive">
              {result.errors.map((e, i) => <li key={i}>Row {e.row}: {e.message}</li>)}
            </ul>
          )}
        </section>
      )}

      {past.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-4 text-sm">
          <p className="mb-2 font-medium">Recent imports</p>
          <ul className="divide-y divide-border">
            {past.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span>{p.filename} · {new Date(p.created_at).toLocaleString('en-IN')} · {p.created} new / {p.updated} updated / {p.failed} failed</span>
                {p.undone_at ? <span className="text-xs text-muted-foreground">undone</span> : p.created > 0 && <button type="button" onClick={() => undo(p.id)} className="text-xs text-destructive hover:underline">Undo</button>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
