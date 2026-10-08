'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { mktDeleteConfig, mktPreviewTemplate, mktSaveTemplate } from '@/app/(app)/crm/mkt-actions';
import type { TemplateConfig } from '@/lib/crm/templates';
import { Button, Field, Modal, area, inp } from '../ui';

interface T { id: string; name: string; active: boolean; config: TemplateConfig; updated_at: string }

const BLANK: T = { id: '', name: '', active: true, updated_at: '', config: { subject: '', heading: '', body: 'Hi {{first_name}},\n\n', cta: null, category: 'marketing' } };

export default function TemplatesAdmin({ templates }: { templates: T[] }) {
  const [editing, setEditing] = useState<T | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Email templates</h1>
          <p className="text-sm text-muted-foreground">Used by campaigns, workflows, cadences and one-off emails. Merge fields like <code>{'{{first_name}}'}</code> are filled per person and always escaped.</p>
        </div>
        <Button primary onClick={() => setEditing(BLANK)}>+ New template</Button>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {templates.map((t) => (
          <button key={t.id} type="button" onClick={() => setEditing(t)} className="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-navy/40">
            <p className="font-medium">{t.name} {!t.active && <span className="text-xs text-muted-foreground">(off)</span>}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.config.category === 'service' ? 'Service' : 'Marketing'} · {t.config.subject}</p>
            <p className="mt-2 line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">{t.config.body}</p>
          </button>
        ))}
      </div>
      {editing && <Editor t={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function Editor({ t, onClose }: { t: T; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(t.name);
  const [active, setActive] = useState(t.active);
  const [c, setC] = useState<TemplateConfig>({ ...t.config, cta: t.config.cta ?? null });
  const [html, setHtml] = useState<string | null>(null);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const upd = (p: Partial<TemplateConfig>) => setC((x) => ({ ...x, ...p }));

  const preview = async () => {
    const r = await mktPreviewTemplate({ config: c, module: c.category === 'service' ? 'cases' : 'contacts' });
    if (!r.ok) return toast.error(r.error);
    setHtml(r.data.html);
    setUnknown(r.data.unknownFields);
  };
  const save = async () => {
    setBusy(true);
    const r = await mktSaveTemplate({ id: t.id || null, name, active, config: c });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success('Template saved');
    onClose();
    router.refresh();
  };
  const del = async () => {
    if (!confirm('Delete this template? Campaign history keeps the emails already sent.')) return;
    const r = await mktDeleteConfig('email_template', t.id);
    if (!r.ok) return toast.error(r.error);
    onClose();
    router.refresh();
  };

  return (
    <Modal title={t.id ? 'Edit template' : 'New template'} onClose={onClose} wide>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Name"><input className={inp} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" hint="Marketing emails respect opt-outs and carry an unsubscribe link.">
              <select className={inp} value={c.category} onChange={(e) => upd({ category: e.target.value as 'marketing' | 'service' })}>
                <option value="marketing">Marketing</option><option value="service">Service (support replies)</option>
              </select>
            </Field>
            <Field label="Active"><select className={inp} value={active ? '1' : '0'} onChange={(e) => setActive(e.target.value === '1')}><option value="1">On</option><option value="0">Off</option></select></Field>
          </div>
          <Field label="Subject"><input className={inp} value={c.subject} onChange={(e) => upd({ subject: e.target.value })} maxLength={200} /></Field>
          <Field label="Heading (optional)"><input className={inp} value={c.heading ?? ''} onChange={(e) => upd({ heading: e.target.value })} maxLength={200} /></Field>
          <Field label="Body" hint="**bold**, _italic_, [link text](https://…), lines starting with - become bullets. Blank line = new paragraph.">
            <textarea className={area} rows={10} value={c.body} onChange={(e) => upd({ body: e.target.value })} maxLength={20000} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Button label (optional)"><input className={inp} value={c.cta?.label ?? ''} onChange={(e) => upd({ cta: e.target.value ? { label: e.target.value, url: c.cta?.url ?? 'https://www.mece.in/' } : null })} maxLength={60} /></Field>
            <Field label="Button link"><input className={inp} value={c.cta?.url ?? ''} disabled={!c.cta} onChange={(e) => upd({ cta: c.cta ? { ...c.cta, url: e.target.value } : null })} maxLength={2000} /></Field>
          </div>
          <p className="text-[11px] text-muted-foreground">Merge fields: {'{{first_name}} {{full_name}} {{owner_name}} {{college}} {{plan}}'} and any field name of the module, e.g. {'{{mece_cases_solved}}'}, {'{{case_number}}'}.</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between"><p className="text-xs font-medium text-muted-foreground">Preview (sample customer)</p><Button small onClick={preview}>Refresh preview</Button></div>
          {unknown.length > 0 && <p className="rounded bg-warning-soft px-2 py-1 text-xs">Unknown merge fields (will be blank): {unknown.join(', ')}</p>}
          {html ? <iframe title="Template preview" sandbox="" srcDoc={html} className="h-[520px] w-full rounded border border-border bg-white" /> : <p className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Press “Refresh preview”.</p>}
        </div>
      </div>
      <div className="mt-4 flex justify-between gap-2">
        {t.id ? <Button danger onClick={del}>Delete</Button> : <span />}
        <div className="flex gap-2"><Button onClick={onClose}>Cancel</Button><Button primary onClick={save} disabled={busy}>Save</Button></div>
      </div>
    </Modal>
  );
}
