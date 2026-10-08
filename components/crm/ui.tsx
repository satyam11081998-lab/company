'use client';

/** Small shared building blocks for CRM admin screens. */
import { useEffect, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';

export const inp = 'h-8 w-full rounded-md border border-border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring';
export const area = 'w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring';

export function Button({ children, onClick, primary, danger, disabled, type = 'button', small, title }: {
  children: React.ReactNode; onClick?: () => unknown; primary?: boolean; danger?: boolean; disabled?: boolean; type?: 'button' | 'submit'; small?: boolean; title?: string;
}) {
  // An async onClick shows a spinner and blocks double clicks until it settles.
  const [pending, setPending] = useState(false);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  const handle = () => {
    if (pending || !onClick) return;
    const r = onClick();
    if (r && typeof (r as Promise<unknown>).then === 'function') {
      setPending(true);
      (r as Promise<unknown>).finally(() => { if (alive.current) setPending(false); });
    }
  };
  return (
    <button type={type} onClick={onClick ? handle : undefined} disabled={disabled || pending} title={title} aria-busy={pending || undefined}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 text-sm transition-[background-color,transform,opacity] active:scale-[0.97] disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100 ${small ? 'h-7 text-xs' : 'h-8'} ${
        primary ? 'bg-navy text-navy-foreground hover:bg-navy/90' : danger ? 'border border-destructive/40 text-destructive hover:bg-destructive/10' : 'border border-border bg-card hover:bg-muted'}`}>
      {pending && <Loader2 className={`${small ? 'h-3 w-3' : 'h-3.5 w-3.5'} animate-spin motion-reduce:animate-none`} aria-hidden />}
      {children}
    </button>
  );
}

/** Small spinner for inline busy states. */
export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin text-muted-foreground motion-reduce:animate-none`} aria-hidden />;
}

/** Placeholder block while content loads. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted motion-reduce:animate-none ${className}`} />;
}

export function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`w-full ${wide ? 'max-w-4xl' : 'max-w-xl'} rounded-lg border border-border bg-card shadow-xl`}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export function Card({ title, children, actions, className = '' }: { title?: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-border bg-card p-4 ${className}`}>
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>}
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: React.ReactNode; tone?: 'good' | 'bad' | 'warn' }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${tone === 'good' ? 'text-success' : tone === 'bad' ? 'text-destructive' : tone === 'warn' ? 'text-warning-foreground' : ''}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-0.5 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

/** Horizontal bars for a small categorical breakdown (no chart library). */
export function Bars({ data, format = (n: number) => n.toLocaleString('en-IN'), max }: { data: Array<{ label: string; value: number; tone?: string }>; format?: (n: number) => string; max?: number }) {
  const top = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.label} className="grid grid-cols-[minmax(90px,35%)_1fr_auto] items-center gap-2 text-xs">
          <span className="truncate text-muted-foreground" title={d.label}>{d.label}</span>
          <span className="h-2.5 rounded-sm bg-muted">
            <span className={`block h-2.5 rounded-sm ${d.tone ?? 'bg-viz-1'}`} style={{ width: `${Math.max(0, Math.min(100, (d.value / top) * 100))}%` }} />
          </span>
          <span className="tabular-nums">{format(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

export const fmtDate = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '—');
export const inr = (n: number | null | undefined) => (typeof n === 'number' ? `₹${Math.round(n).toLocaleString('en-IN')}` : '—');
