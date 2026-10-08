'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { crmComposeEmail, mktPreviewTemplate } from '@/app/(app)/crm/mkt-actions';
import { aiEmailDraft } from '@/app/(app)/crm/insight-actions';
import type { TemplateConfig } from '@/lib/crm/templates';
import { Button, Card, Field, Modal, area, fmtDate, inp } from './ui';

export interface EmailInfo {
  templates: Array<{ id: string; name: string; config: TemplateConfig }>;
  history: Array<{ id: string; subject: string; status: string; status_reason: string | null; source: string; created_at: string; sent_at: string | null; opened_at: string | null; clicked_at: string | null }>;
  canSendNow: boolean;
  to: string | null;
}

export function EmailHistory({ info }: { info: EmailInfo }) {
  if (!info.history.length) return null;
  return (
    <Card title="Emails">
      <table className="w-full text-sm"><tbody>{info.history.map((h) => (
        <tr key={h.id} className="border-b border-border/60">
          <td className="py-1.5 pr-2">{h.subject}<span className="ml-1 text-xs capitalize text-muted-foreground">· {h.source}</span></td>
          <td className="py-1.5 pr-2 text-xs capitalize">{h.status}{h.status_reason ? ` (${h.status_reason})` : ''}</td>
          <td className="py-1.5 pr-2 text-xs text-muted-foreground">{fmtDate(h.sent_at ?? h.created_at)}</td>
          <td className="py-1.5 text-xs">{h.clicked_at ? 'Clicked' : h.opened_at ? 'Opened' : h.status === 'sent' ? 'Not opened' : ''}</td>
        </tr>
      ))}</tbody></table>
    </Card>
  );
}

export default function EmailCompose({ module, recordId, info, onClose }: { module: string; recordId: string; info: EmailInfo; onClose: () => void }) {
  const router = useRouter();
  const forCase = module === 'cases';
  const first = info.templates.find((t) => (forCase ? t.config.category === 'service' : t.config.category !== 'service')) ?? info.templates[0];
  const [tid, setTid] = useState<string>(first?.id ?? '');
  const [c, setC] = useState<TemplateConfig>(first?.config ?? { subject: '', body: 'Hi {{first_name}},\n\n', cta: null, category: forCase ? 'service' : 'marketing' });
  const [html, setHtml] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [goal, setGoal] = useState('');
  const draft = async () => {
    setBusy(true);
    const r = await aiEmailDraft(recordId, goal || (forCase ? 'reply to their support request' : 'a helpful check-in'));
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    setTid('');
    setC({ ...c, subject: r.data.subject, body: r.data.body });
    setHtml(null);
    toast.message(r.data.note);
  };
  const pickT = (id: string) => {
    setTid(id);
    const t = info.templates.find((x) => x.id === id);
    if (t) setC(t.config);
    setHtml(null);
  };
  const preview = async () => {
    const r = await mktPreviewTemplate({ config: c, module, recordId });
    if (!r.ok) return toast.error(r.error);
    setHtml(r.data.html);
  };
  const send = async (now: boolean) => {
    setBusy(true);
    const r = await crmComposeEmail({ module, recordId, templateId: tid || null, config: c, sendNow: now });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    if (r.data.suppressed) toast.error('Not sent: this person opted out of marketing email (or a privacy request applies).');
    else if (r.data.sent) toast.success('Sent');
    else toast.success('Queued — it will go out once approved in the Outbox');
    onClose();
    router.refresh();
  };
  return (
    <Modal title={`Email ${info.to ?? ''}`} onClose={onClose} wide>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Template"><select className={inp} value={tid} onChange={(e) => pickT(e.target.value)}><option value="">Blank</option>{info.templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
          <div className="flex items-end gap-2">
            <div className="flex-1"><Field label="Or ask Iris to draft it — what is the email for?"><input className={inp} value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={200} placeholder="e.g. invite them back after 45 days away" /></Field></div>
            <Button small onClick={draft} disabled={busy}>Draft</Button>
          </div>
          <Field label="Subject"><input className={inp} value={c.subject} onChange={(e) => setC({ ...c, subject: e.target.value })} maxLength={200} /></Field>
          <Field label="Message" hint="**bold**, [link](https://…), - bullets; {{first_name}} etc. are filled in."><textarea className={area} rows={12} value={c.body} onChange={(e) => setC({ ...c, body: e.target.value })} maxLength={20000} /></Field>
          {!forCase && <p className="text-[11px] text-muted-foreground">Marketing email: skipped automatically if this person has opted out; includes an unsubscribe link.</p>}
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between"><p className="text-xs font-medium text-muted-foreground">Preview for this person</p><Button small onClick={preview}>Preview</Button></div>
          {html ? <iframe title="Email preview" sandbox="" srcDoc={html} className="h-[420px] w-full rounded border border-border bg-white" /> : <p className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Press Preview.</p>}
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => send(false)} disabled={busy}>Queue for approval</Button>
        {info.canSendNow && <Button primary onClick={() => send(true)} disabled={busy}>Send now</Button>}
      </div>
    </Modal>
  );
}
