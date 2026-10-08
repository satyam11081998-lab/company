'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { mktDeleteConfig, mktSaveWebform } from '@/app/(app)/crm/mkt-actions';
import { Button, Card, Field, Modal, area, inp } from '../ui';

interface FField { field: string; label?: string; required?: boolean; hidden?: boolean; value?: string }
interface Cfg {
  module: string; title: string; intro?: string; button?: string; thankYou?: string; fields: FField[]; ownerId?: string | null;
  consent?: { required: boolean; text: string }; autoResponseTemplateId?: string | null; notifyOwner?: boolean; abTest?: boolean;
  variantB?: { title?: string; intro?: string; button?: string };
}
interface Form { id: string; name: string; active: boolean; public_key: string | null; module: string | null; config: Cfg }
type Stats = Record<string, { views: number; accepted: number; spam: number; rate: number | null }>;

const DPDP = 'I agree that MECE may use these details to contact me about my request and about MECE’s services, as described in the Privacy Policy. I can withdraw consent at any time by replying to any email.';

export default function FormsAdmin({ forms, stats, modules, fields, templates, members, site }: {
  forms: Form[]; stats: Record<string, Stats>; modules: Array<{ api: string; label: string }>;
  fields: Record<string, Array<{ api: string; label: string; type: string; required: boolean }>>;
  templates: Array<{ id: string; name: string }>; members: Array<{ id: string; name: string }>; site: string;
}) {
  const [editing, setEditing] = useState<Form | null>(null);
  const blank = (): Form => ({ id: '', name: '', active: true, public_key: null, module: 'leads', config: {
    module: 'leads', title: 'Bring MECE to your campus', intro: 'Tell us about your college and we’ll set up a free trial for your batch.', button: 'Request a call',
    thankYou: 'Thanks — we’ll get back to you within one working day.', fields: (fields.leads ?? []).filter((f) => ['first_name', 'last_name', 'email', 'phone', 'company'].includes(f.api)).map((f) => ({ field: f.api, required: f.required || f.api === 'email' })),
    consent: { required: true, text: DPDP }, notifyOwner: true, abTest: false,
  } });
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Web forms</h1>
          <p className="text-sm text-muted-foreground">Web-to-lead and web-to-case forms on mece.in/f/… Spam-checked (honeypot, timing, per-network limits), consent recorded with the exact text shown, optional A/B test.</p>
        </div>
        <Button primary onClick={() => setEditing(blank())}>+ New form</Button>
      </div>
      {forms.map((f) => {
        const st = stats[f.id] ?? {};
        const url = f.public_key ? `${site}/f/${f.public_key}` : '';
        return (
          <Card key={f.id} title={<span className="normal-case tracking-normal text-foreground">{f.name} <span className="text-muted-foreground">· creates {f.config.module}{!f.active ? ' · off' : ''}</span></span>}
            actions={<><Button small onClick={() => { navigator.clipboard?.writeText(url); toast.success('Link copied'); }}>Copy link</Button><Button small onClick={() => window.open(url, '_blank')}>Open</Button><Button small onClick={() => setEditing(f)}>Edit</Button></>}>
            <p className="break-all text-xs text-muted-foreground">{url}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              {(Object.keys(st).length ? Object.entries(st) : [['A', { views: 0, accepted: 0, spam: 0, rate: null }]] as Array<[string, Stats[string]]>).map(([v, s]) => (
                <span key={v}>{f.config.abTest ? <b>Variant {v}: </b> : null}{s.views} views · {s.accepted} submissions · {s.rate ?? 0}% conversion{s.spam ? ` · ${s.spam} blocked as spam` : ''}</span>
              ))}
            </div>
          </Card>
        );
      })}
      {!forms.length && <p className="text-sm text-muted-foreground">No forms yet.</p>}
      {editing && <Editor form={editing} modules={modules} fields={fields} templates={templates} members={members} onClose={() => setEditing(null)} />}
    </div>
  );
}

function Editor({ form, modules, fields, templates, members, onClose }: {
  form: Form; modules: Array<{ api: string; label: string }>; fields: Record<string, Array<{ api: string; label: string; type: string; required: boolean }>>;
  templates: Array<{ id: string; name: string }>; members: Array<{ id: string; name: string }>; onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(form.name);
  const [active, setActive] = useState(form.active);
  const [c, setC] = useState<Cfg>(form.config);
  const upd = (p: Partial<Cfg>) => setC((x) => ({ ...x, ...p }));
  const avail = fields[c.module] ?? [];
  const has = (api: string) => c.fields.find((f) => f.field === api);
  const toggle = (api: string, on: boolean) => upd({ fields: on ? [...c.fields, { field: api, required: avail.find((a) => a.api === api)?.required }] : c.fields.filter((f) => f.field !== api) });
  const setF = (api: string, p: Partial<FField>) => upd({ fields: c.fields.map((f) => (f.field === api ? { ...f, ...p } : f)) });
  const save = async () => {
    const r = await mktSaveWebform({ id: form.id || null, name: name || c.title, active, config: c });
    if (!r.ok) return toast.error(r.error);
    toast.success('Form saved');
    onClose();
    router.refresh();
  };
  const del = async () => {
    if (!confirm('Delete this form? Its link stops working.')) return;
    const r = await mktDeleteConfig('webform', form.id);
    if (!r.ok) return toast.error(r.error);
    onClose();
    router.refresh();
  };
  return (
    <Modal title={form.id ? 'Edit web form' : 'New web form'} onClose={onClose} wide>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Internal name"><input className={inp} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></Field>
            <Field label="Creates a"><select className={inp} value={c.module} disabled={!!form.id} onChange={(e) => upd({ module: e.target.value, fields: [] })}>{modules.map((m) => <option key={m.api} value={m.api}>{m.label}</option>)}</select></Field>
          </div>
          <Field label="Title"><input className={inp} value={c.title} onChange={(e) => upd({ title: e.target.value })} maxLength={120} /></Field>
          <Field label="Intro"><textarea className={area} rows={2} value={c.intro ?? ''} onChange={(e) => upd({ intro: e.target.value })} maxLength={1000} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Button"><input className={inp} value={c.button ?? ''} onChange={(e) => upd({ button: e.target.value })} maxLength={40} /></Field>
            <Field label="Active"><select className={inp} value={active ? '1' : '0'} onChange={(e) => setActive(e.target.value === '1')}><option value="1">On</option><option value="0">Off</option></select></Field>
          </div>
          <Field label="Thank-you message"><input className={inp} value={c.thankYou ?? ''} onChange={(e) => upd({ thankYou: e.target.value })} maxLength={500} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Owner of new records"><select className={inp} value={c.ownerId ?? ''} onChange={(e) => upd({ ownerId: e.target.value || null })}><option value="">Unassigned</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
            <Field label="Auto-reply (goes to Outbox)"><select className={inp} value={c.autoResponseTemplateId ?? ''} onChange={(e) => upd({ autoResponseTemplateId: e.target.value || null })}><option value="">None</option>{templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={c.notifyOwner !== false} onChange={(e) => upd({ notifyOwner: e.target.checked })} /> Notify the owner on each submission</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!c.consent} onChange={(e) => upd({ consent: e.target.checked ? { required: true, text: DPDP } : undefined })} /> Ask for consent (DPDP Act notice)</label>
          {c.consent && <>
            <textarea className={area} rows={3} value={c.consent.text} onChange={(e) => upd({ consent: { ...c.consent!, text: e.target.value } })} maxLength={1000} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={c.consent.required} onChange={(e) => upd({ consent: { ...c.consent!, required: e.target.checked } })} /> Consent is required to submit</label>
          </>}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!c.abTest} onChange={(e) => upd({ abTest: e.target.checked, variantB: e.target.checked ? (c.variantB ?? { title: c.title, intro: c.intro, button: c.button }) : c.variantB })} /> A/B test the wording (half of visitors see variant B)</label>
          {c.abTest && (
            <div className="space-y-2 rounded-md border border-border p-2">
              <Field label="Variant B title"><input className={inp} value={c.variantB?.title ?? ''} onChange={(e) => upd({ variantB: { ...c.variantB, title: e.target.value } })} maxLength={120} /></Field>
              <Field label="Variant B intro"><textarea className={area} rows={2} value={c.variantB?.intro ?? ''} onChange={(e) => upd({ variantB: { ...c.variantB, intro: e.target.value } })} maxLength={1000} /></Field>
              <Field label="Variant B button"><input className={inp} value={c.variantB?.button ?? ''} onChange={(e) => upd({ variantB: { ...c.variantB, button: e.target.value } })} maxLength={40} /></Field>
            </div>
          )}
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">Fields (tick to include; required fields of the module must be on the form)</p>
          <div className="max-h-[520px] space-y-1 overflow-y-auto rounded-md border border-border p-2">
            {avail.map((a) => {
              const f = has(a.api);
              return (
                <div key={a.api} className="rounded px-1 py-1 text-sm hover:bg-muted/40">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!f} onChange={(e) => toggle(a.api, e.target.checked)} />{a.label}{a.required && <span className="text-xs text-destructive">required</span>}</label>
                  {f && (
                    <div className="ml-6 mt-1 grid grid-cols-[1fr_auto_auto] items-center gap-2 text-xs">
                      <input className={inp} placeholder="Label on form" value={f.label ?? ''} onChange={(e) => setF(a.api, { label: e.target.value })} maxLength={120} />
                      <label className="flex items-center gap-1"><input type="checkbox" checked={!!f.required} disabled={a.required} onChange={(e) => setF(a.api, { required: e.target.checked })} />required</label>
                      <label className="flex items-center gap-1"><input type="checkbox" checked={!!f.hidden} onChange={(e) => setF(a.api, { hidden: e.target.checked })} />hidden</label>
                      {f.hidden && <input className={`${inp} col-span-3`} placeholder="Hidden value (set by the form, never by the visitor)" value={f.value ?? ''} onChange={(e) => setF(a.api, { value: e.target.value })} maxLength={255} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between gap-2">
        {form.id ? <Button danger onClick={del}>Delete</Button> : <span />}
        <div className="flex gap-2"><Button onClick={onClose}>Cancel</Button><Button primary onClick={save}>Save</Button></div>
      </div>
    </Modal>
  );
}
