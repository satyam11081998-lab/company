'use client';

import Link from 'next/link';
import type { ClientField } from '@/lib/crm/client-types';
import { formatMoney, formatValue } from '@/lib/crm/fields';

export type Refs = Record<string, { name: string; module?: string; restricted?: boolean }>;

const STAGE_LABEL: Record<string, string> = {};

/** Display a field value. Lookups render as links to the referenced record. */
export function FieldValue({ field, value, refs, currency, stageLabels }: {
  field: ClientField | undefined;
  value: unknown;
  refs?: Refs;
  currency?: string;
  stageLabels?: Record<string, string>;
}) {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length)) {
    return <span className="text-muted-foreground/60">—</span>;
  }
  if (!field) return <span>{String(value)}</span>;
  switch (field.type) {
    case 'lookup':
    case 'related': {
      const id = field.type === 'related' ? (value as { id?: string }).id : (value as string);
      const ref = id ? refs?.[id] : undefined;
      if (!ref) return <span className="text-muted-foreground">…</span>;
      if (ref.restricted || !ref.module) return <span className="text-muted-foreground italic">{ref.name}</span>;
      return <Link className="text-navy underline-offset-2 hover:underline" href={`/crm/m/${ref.module}/${id}`}>{ref.name}</Link>;
    }
    case 'user':
      return <span>{refs?.[String(value)]?.name ?? '—'}</span>;
    case 'email':
      return <a className="text-navy underline-offset-2 hover:underline" href={`mailto:${String(value)}`}>{String(value)}</a>;
    case 'phone':
      return <a className="text-navy underline-offset-2 hover:underline" href={`tel:${String(value).replace(/[^\d+]/g, '')}`}>{String(value)}</a>;
    case 'url': {
      const s = String(value);
      // stored urls are validated http(s) on write; check again before rendering a link
      if (!/^https?:\/\//i.test(s)) return <span>{s}</span>;
      return <a className="text-navy underline-offset-2 hover:underline" href={s} target="_blank" rel="noopener noreferrer nofollow">{s.replace(/^https?:\/\//, '').slice(0, 60)}</a>;
    }
    case 'currency':
      return <span className="tabular-nums">{formatMoney(Number(value), currency || 'INR')}</span>;
    case 'formula':
      if (field.returns === 'currency') return <span className="tabular-nums">{formatMoney(Number(value), currency || 'INR')}</span>;
      return <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}</span>;
    case 'picklist':
      if (field.api === 'stage' && stageLabels) return <span>{stageLabels[String(value)] ?? STAGE_LABEL[String(value)] ?? String(value)}</span>;
      return <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{String(value)}</span>;
    case 'boolean':
      return <span>{value === true ? 'Yes' : 'No'}</span>;
    case 'textarea':
      return <span className="whitespace-pre-wrap break-words">{String(value)}</span>;
    default:
      return <span className={['integer', 'decimal', 'percent'].includes(field.type) ? 'tabular-nums' : ''}>{formatValue(field, value)}</span>;
  }
}
