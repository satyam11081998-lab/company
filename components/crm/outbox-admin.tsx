'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { outboxDecide, outboxGetPreview, outboxSendDue, outboxSetCap } from '@/app/(app)/crm/mkt-actions';
import { Button, Modal, fmtDate } from './ui';

interface Row {
  id: string; record_id: string | null; to_email: string; to_name: string | null; subject: string; category: string; source: string; status: string;
  status_reason: string | null; created_at: string; created_by_name: string; decided_by_name: string | null; sent_at: string | null;
  opened_at: string | null; clicked_at: string | null; open_count: number; click_count: number;
}
interface Data { status: string; page: number; total: number; counts: Record<string, number>; sentToday: number; dailyCap: number; rows: Row[] }

const TABS: Array<[string, string]> = [['pending', 'Waiting for approval'], ['approved', 'Approved'], ['sent', 'Sent'], ['suppressed', 'Suppressed'], ['rejected', 'Rejected'], ['failed', 'Failed'], ['cancelled', 'Cancelled']];

export default function OutboxAdmin({ data, canApprove }: { data: Data; canApprove: boolean }) {
  const router = useRouter();
  const [sel, setSel] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<null | { subject: string; to: string; html: string; reason: string | null; links: string[] }>(null);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const act = async (approve: boolean) => {
    if (!sel.length) return;
    let reason = '';
    if (!approve) { reason = prompt('Why reject? (kept in the log)') ?? ''; if (!reason) return; }
    setBusy(true);
    const r = await outboxDecide(sel, approve, reason);
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success(approve ? `Approved ${r.data.changed}; sent ${r.data.sent}` : `Rejected ${r.data.changed}`);
    setSel([]);
    router.refresh();
  };
  const sendDue = async () => {
    setBusy(true);
    const r = await outboxSendDue();
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Sent ${r.data.sent}${r.data.suppressed ? `, suppressed ${r.data.suppressed}` : ''}${r.data.deferred ? `, ${r.data.deferred} wait for tomorrow (daily cap)` : ''}${r.data.failed ? `, ${r.data.failed} failed` : ''}`);
    router.refresh();
  };
  const cap = async () => {
    const v = prompt('Maximum customer emails per day (IST):', String(data.dailyCap));
    if (!v) return;
    const r = await outboxSetCap(Number(v));
    if (!r.ok) return toast.error(r.error);
    router.refresh();
  };
  const open = async (id: string) => {
    const r = await outboxGetPreview(id);
    if (!r.ok) return toast.error(r.error);
    setPreview({ subject: r.data.subject, to: r.data.to_email, html: r.data.html, reason: r.data.status_reason, links: r.data.links ?? [] });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Outbox</h1>
          <p className="text-sm text-muted-foreground">Every email the CRM sends to a customer waits here until someone approves it. Opt-outs, withdrawn consent and erasure requests are re-checked at the moment of sending.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Sent today: <b className="text-foreground">{data.sentToday}</b> / {data.dailyCap}</span>
          {canApprove && <Button small onClick={cap}>Daily cap</Button>}
          {canApprove && <Button small onClick={sendDue} disabled={busy}>Send approved now</Button>}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border text-sm">
        {TABS.map(([k, label]) => (
          <Link key={k} href={`/crm/outbox?status=${k}`} className={`-mb-px border-b-2 px-3 py-2 ${data.status === k ? 'border-navy font-medium text-navy' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {label} <span className="text-xs">({data.counts[k] ?? 0})</span>
          </Link>
        ))}
      </div>
      {data.status === 'pending' && canApprove && (
        <div className="flex flex-wrap items-center gap-2">
          <Button small onClick={() => setSel(sel.length === data.rows.length ? [] : data.rows.map((r) => r.id))}>{sel.length === data.rows.length && sel.length ? 'Clear' : 'Select all on page'}</Button>
          <Button small primary disabled={!sel.length || busy} onClick={() => act(true)}>Approve and send ({sel.length})</Button>
          <Button small danger disabled={!sel.length || busy} onClick={() => act(false)}>Reject ({sel.length})</Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              {data.status === 'pending' && canApprove && <th className="w-8 px-3 py-2" />}
              <th className="px-3 py-2">To</th><th className="px-3 py-2">Subject</th><th className="px-3 py-2">From</th>
              <th className="px-3 py-2">{data.status === 'sent' ? 'Sent' : 'Queued'}</th>
              {data.status === 'sent' && <th className="px-3 py-2">Opened / clicked</th>}
              {['suppressed', 'rejected', 'failed', 'cancelled'].includes(data.status) && <th className="px-3 py-2">Reason</th>}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top hover:bg-muted/30">
                {data.status === 'pending' && canApprove && <td className="px-3 py-2"><input type="checkbox" aria-label={`Select ${r.to_email}`} checked={sel.includes(r.id)} onChange={() => toggle(r.id)} /></td>}
                <td className="px-3 py-2"><p className="font-medium">{r.to_name || r.to_email}</p><p className="text-xs text-muted-foreground">{r.to_email}</p></td>
                <td className="max-w-[380px] px-3 py-2"><button type="button" onClick={() => open(r.id)} className="text-left text-navy hover:underline">{r.subject}</button>
                  <p className="text-xs text-muted-foreground">{r.category === 'service' ? 'Service' : 'Marketing'}</p></td>
                <td className="px-3 py-2 text-xs"><p className="capitalize">{r.source}</p><p className="text-muted-foreground">{r.created_by_name}</p></td>
                <td className="whitespace-nowrap px-3 py-2 text-xs">{fmtDate(r.sent_at ?? r.created_at)}{r.decided_by_name && <p className="text-muted-foreground">by {r.decided_by_name}</p>}</td>
                {data.status === 'sent' && <td className="px-3 py-2 text-xs">{r.opened_at ? `Opened ×${r.open_count}` : 'Not opened'}{r.clicked_at ? ` · clicked ×${r.click_count}` : ''}</td>}
                {['suppressed', 'rejected', 'failed', 'cancelled'].includes(data.status) && <td className="px-3 py-2 text-xs text-muted-foreground">{r.status_reason}</td>}
              </tr>
            ))}
            {!data.rows.length && <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">Nothing here.</td></tr>}
          </tbody>
        </table>
      </div>
      {data.total > 50 && (
        <div className="flex justify-end gap-2 text-sm">
          {data.page > 1 && <Link className="text-navy hover:underline" href={`/crm/outbox?status=${data.status}&page=${data.page - 1}`}>← Previous</Link>}
          {data.page * 50 < data.total && <Link className="text-navy hover:underline" href={`/crm/outbox?status=${data.status}&page=${data.page + 1}`}>Next →</Link>}
        </div>
      )}
      {preview && (
        <Modal title={preview.subject} onClose={() => setPreview(null)} wide>
          <p className="mb-2 text-xs text-muted-foreground">To {preview.to}{preview.reason ? ` · ${preview.reason}` : ''}</p>
          {/* sandbox="" = no scripts, no same-origin, no forms, no navigation */}
          <iframe title="Email preview" sandbox="" srcDoc={preview.html} className="h-[60vh] w-full rounded border border-border bg-white" />
          {preview.links.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Links in this email: {preview.links.join(' · ')}</p>}
        </Modal>
      )}
    </div>
  );
}
