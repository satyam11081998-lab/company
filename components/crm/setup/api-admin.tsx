'use client';

/** Developer settings: REST API keys and the data backup download. */
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiCreateKey, apiRevokeKey } from '@/app/(app)/crm/insight-actions';
import { Button, Card, Field, fmtDate, inp } from '../ui';

interface Key { id: string; name: string; prefix: string; user: string; scopes: string[]; created_at: string; last_used_at: string | null; expires_at: string | null; revoked_at: string | null; calls24h: number }

export default function ApiAdmin({ keys, members, me, canKeys, canBackup, base }: { keys: Key[]; members: Array<{ id: string; name: string }>; me: string; canKeys: boolean; canBackup: boolean; base: string }) {
  const router = useRouter();
  const [form, setForm] = useState<{ name: string; userId: string; scopes: string[]; expiresDays: number } | null>(null);
  const [shown, setShown] = useState<string | null>(null);
  const create = async () => {
    if (!form) return;
    const r = await apiCreateKey(form);
    if (!r.ok) return toast.error(r.error);
    setShown(r.data.key);
    setForm(null);
    router.refresh();
  };
  const revoke = async (k: Key) => {
    if (!confirm(`Revoke “${k.name}”? Anything using it stops working at once.`)) return;
    const r = await apiRevokeKey(k.id);
    if (!r.ok) return toast.error(r.error);
    toast.success('Revoked');
    router.refresh();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Developer: API and backup</h1>
      {canKeys && (
        <Card title="REST API keys" actions={!form ? <Button small primary onClick={() => setForm({ name: '', userId: me, scopes: ['read'], expiresDays: 365 })}>New key</Button> : null}>
          {shown && (
            <div className="mb-3 rounded-md border border-warning/50 bg-warning-soft p-3 text-sm">
              <p className="font-medium">Copy this key now — it will not be shown again.</p>
              <div className="mt-2 flex gap-2"><code className="flex-1 overflow-x-auto rounded bg-card px-2 py-1 text-xs">{shown}</code><Button small onClick={() => { navigator.clipboard.writeText(shown).then(() => toast.success('Copied')); }}>Copy</Button><Button small onClick={() => setShown(null)}>Done</Button></div>
            </div>
          )}
          {form && (
            <div className="mb-4 rounded-md border border-border p-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <Field label="Name (what will use it)"><input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} placeholder="e.g. Zapier" /></Field>
                <Field label="Acts as" hint="The key gets exactly this user’s access."><select className={inp} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
                <Field label="Expires after (days)"><input className={inp} type="number" min={1} max={730} value={form.expiresDays} onChange={(e) => setForm({ ...form, expiresDays: Number(e.target.value) })} /></Field>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Scopes</p>
                  <div className="mt-1 flex flex-col gap-1 text-sm">
                    {['read', 'write', 'delete'].map((s) => <label key={s} className="flex items-center gap-1.5"><input type="checkbox" checked={form.scopes.includes(s)} disabled={s === 'read'} onChange={(e) => setForm({ ...form, scopes: e.target.checked ? [...form.scopes, s] : form.scopes.filter((x) => x !== s) })} />{s}</label>)}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2"><Button onClick={() => setForm(null)}>Cancel</Button><Button primary onClick={create} disabled={!form.name.trim()}>Create key</Button></div>
            </div>
          )}
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-1 font-medium">Name</th><th className="font-medium">Acts as</th><th className="font-medium">Scopes</th><th className="font-medium">Last used</th><th className="font-medium">Calls (24 h)</th><th className="font-medium">Expires</th><th /></tr></thead>
            <tbody>{keys.map((k) => (
              <tr key={k.id} className={`border-t border-border ${k.revoked_at ? 'text-muted-foreground line-through' : ''}`}>
                <td className="py-1.5">{k.name} <code className="text-[11px] text-muted-foreground">mcrm_{k.prefix}_…</code></td><td>{k.user}</td><td>{k.scopes.join(', ')}</td><td>{fmtDate(k.last_used_at)}</td><td>{k.calls24h}</td><td>{fmtDate(k.expires_at)}</td>
                <td className="text-right">{!k.revoked_at && <Button small danger onClick={() => revoke(k)}>Revoke</Button>}</td>
              </tr>
            ))}{!keys.length && <tr><td colSpan={7} className="py-4 text-center text-muted-foreground">No keys.</td></tr>}</tbody>
          </table></div>
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-medium">How to call the API</summary>
            <pre className="mt-2 overflow-x-auto rounded bg-muted/50 p-3 text-xs">{`# who am I
curl -H "Authorization: Bearer mcrm_…" ${base}/me

# modules and fields you can see
curl -H "Authorization: Bearer mcrm_…" ${base}/modules
curl -H "Authorization: Bearer mcrm_…" ${base}/modules/leads/fields

# list (200 per page), one record, search
curl -H "Authorization: Bearer mcrm_…" "${base}/leads?page=1&per_page=200&sort_by=created_at&sort_order=desc"
curl -H "Authorization: Bearer mcrm_…" ${base}/leads/<id>
curl -X POST -H "Authorization: Bearer mcrm_…" -H "Content-Type: application/json" \\
  -d '{"criteria":{"match":"all","conditions":[{"field":"rating","op":"eq","value":"Hot"}]}}' ${base}/leads/search

# create up to 100 (write scope); "assign": true applies assignment rules
curl -X POST -H "Authorization: Bearer mcrm_…" -H "Content-Type: application/json" \\
  -d '{"data":[{"last_name":"Sharma","email":"a@example.com","lead_source":"Partner college"}],"assign":true}' ${base}/leads

# update (write) / delete to the recycle bin (delete)
curl -X PUT -H "Authorization: Bearer mcrm_…" -H "Content-Type: application/json" -d '{"data":{"rating":"Hot"}}' ${base}/leads/<id>
curl -X DELETE -H "Authorization: Bearer mcrm_…" ${base}/leads/<id>`}</pre>
            <p className="mt-2 text-xs text-muted-foreground">100 calls per minute per key. Records, fields and actions follow the key user’s profile, role, sharing rules and field security; workflows, approvals and validation rules run as they do in the app. Customer emails still wait for approval in the Outbox.</p>
          </details>
        </Card>
      )}
      {canBackup && (
        <Card title="Data backup">
          <p className="text-sm text-muted-foreground">Download every record you may export, in every module, with field definitions{canKeys ? ' and the CRM configuration (secrets removed)' : ''}, as one JSON file. The download is recorded in the audit log.</p>
          <a href="/api/crm/backup" className="mt-3 inline-flex h-8 items-center rounded-md bg-navy px-3 text-sm text-navy-foreground hover:bg-navy/90">Download backup</a>
        </Card>
      )}
    </div>
  );
}
