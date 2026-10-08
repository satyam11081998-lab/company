import type { Metadata } from 'next';
import { createServiceClient } from '@/lib/crm/server/svc';
import { loadMetaWith } from '@/lib/crm/server/meta';
import { loadPublicForm, renderToken } from '@/lib/crm/server/forms';
import WebformClient, { type PublicField } from '@/components/crm/public/webform-client';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'MECE', robots: { index: false, follow: false } };

/**
 * Public web form: mece.in/f/<key>. Renders only what the form lists, from the
 * server; the submit route re-checks everything. Hidden fields never reach the
 * browser (their values are applied server-side).
 */
export default async function PublicFormPage({ params }: { params: { key: string } }) {
  const form = await loadPublicForm(params.key).catch(() => null);
  if (!form) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-lg font-semibold">This form is not available</p>
        <p className="mt-2 text-sm text-muted-foreground">It may have been switched off. Visit <a className="text-navy underline" href="https://www.mece.in">mece.in</a>.</p>
      </main>
    );
  }
  const svc = createServiceClient();
  const meta = await loadMetaWith(svc);
  const cfg = form.config;
  const variant: 'A' | 'B' = cfg.abTest && Math.random() < 0.5 ? 'B' : 'A';
  await svc.rpc('crm_form_view', { p_form: form.id, p_variant: variant });
  const defs = new Map(meta.fields(cfg.module).map((f) => [f.api_name, f]));
  const fields: PublicField[] = cfg.fields
    .filter((f) => !f.hidden && defs.has(f.field))
    .map((f) => {
      const d = defs.get(f.field)!;
      return { name: f.field, label: f.label || d.label, type: d.type, required: !!f.required, options: (d.options?.picklist ?? []).map((p) => p.value) };
    });
  const v = variant === 'B' && cfg.variantB ? { ...cfg, ...Object.fromEntries(Object.entries(cfg.variantB).filter(([, x]) => x)) } : cfg;
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="mb-4 inline-block rounded bg-navy px-1.5 py-0.5 text-xs font-bold tracking-wide text-navy-foreground">MECE</p>
        <WebformClient
          formKey={params.key}
          title={v.title}
          intro={v.intro ?? ''}
          button={v.button ?? 'Submit'}
          fields={fields}
          consent={cfg.consent ?? null}
          token={renderToken(form.id)}
          variant={variant}
        />
      </div>
    </main>
  );
}
