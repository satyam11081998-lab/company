'use client';

import { useState } from 'react';
import { getCaptchaToken, isTurnstileEnabled } from '@/lib/turnstile';

export interface PublicField { name: string; label: string; type: string; required: boolean; options: string[] }

const inp = 'mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring';

export default function WebformClient(p: {
  formKey: string; title: string; intro: string; button: string; fields: PublicField[];
  consent: { required: boolean; text: string } | null; token: string; variant: 'A' | 'B';
}) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: string, v: unknown) => setValues((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setErrors({});
    try {
      const turnstile = isTurnstileEnabled() ? await getCaptchaToken() : undefined;
      const res = await fetch(`/api/crm/forms/${encodeURIComponent(p.formKey)}`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fields: values, hp, t: p.token, variant: p.variant, consent, turnstile }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; errors?: Record<string, string> };
      if (j.ok) setDone(j.message ?? 'Thanks!');
      else { setError(j.message ?? 'Please try again.'); setErrors(j.errors ?? {}); }
    } catch {
      setError('Could not send. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) return (<div><h1 className="text-xl font-semibold">{p.title}</h1><p className="mt-3 text-sm" role="status">{done}</p></div>);

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="text-xl font-semibold">{p.title}</h1>
      {p.intro && <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{p.intro}</p>}
      <div className="mt-5 space-y-3">
        {p.fields.map((f) => (
          <label key={f.name} className="block text-sm">
            <span className="font-medium">{f.label}{f.required && <span className="text-destructive"> *</span>}</span>
            {f.type === 'textarea' ? (
              <textarea className={inp} rows={4} maxLength={4000} required={f.required} onChange={(e) => set(f.name, e.target.value)} />
            ) : f.type === 'picklist' ? (
              <select className={inp} required={f.required} defaultValue="" onChange={(e) => set(f.name, e.target.value)}>
                <option value="" disabled>Choose…</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : f.type === 'multipicklist' ? (
              <span className="mt-1 flex flex-wrap gap-3">
                {f.options.map((o) => (
                  <span key={o} className="inline-flex items-center gap-1.5 text-sm">
                    <input type="checkbox" onChange={(e) => set(f.name, e.target.checked ? [...((values[f.name] as string[]) ?? []), o] : ((values[f.name] as string[]) ?? []).filter((x) => x !== o))} /> {o}
                  </span>
                ))}
              </span>
            ) : f.type === 'boolean' ? (
              <input type="checkbox" className="ml-2" onChange={(e) => set(f.name, e.target.checked)} />
            ) : (
              <input className={inp} maxLength={255} required={f.required}
                type={f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : f.type === 'url' ? 'url' : f.type === 'date' ? 'date' : ['integer', 'decimal', 'currency', 'percent'].includes(f.type) ? 'number' : 'text'}
                onChange={(e) => set(f.name, e.target.value)} />
            )}
            {errors[f.name] && <span className="mt-1 block text-xs text-destructive">{errors[f.name]}</span>}
          </label>
        ))}
        {/* honeypot: invisible to people, irresistible to bots */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
          <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
        </div>
        {p.consent && (
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="mt-0.5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span className="whitespace-pre-line">{p.consent.text}{p.consent.required && <span className="text-destructive"> *</span>}</span>
          </label>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className="mt-5 h-10 w-full rounded-md bg-navy text-sm font-semibold text-navy-foreground disabled:opacity-60">
        {busy ? 'Sending…' : p.button}
      </button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">Your details go to MECE only. <a className="underline" href="https://www.mece.in/privacy" target="_blank" rel="noreferrer">Privacy</a></p>
    </form>
  );
}
