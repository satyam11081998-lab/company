/**
 * Shared wrapper for CRM server actions: turns known errors into a safe
 * { ok:false, error } and hides everything else behind a generic message.
 */
import { CrmAccessError, CrmUserError } from './context';
import { SaveError } from './records';
import { isUuid } from '@/lib/crm/fields';

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; duplicateOf?: { id: string; name: string } };

export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof SaveError) {
      const dup = e.errors.find((x) => x.duplicateOf)?.duplicateOf;
      return { ok: false, error: e.message, fieldErrors: Object.fromEntries(e.errors.map((x) => [x.field, x.message])), duplicateOf: dup };
    }
    if (e instanceof CrmAccessError || e instanceof CrmUserError) return { ok: false, error: e.message };
    console.error('[crm] action failed:', e);
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}

export const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
export const ids = (v: unknown, max = 500): string[] => (Array.isArray(v) ? v.filter(isUuid).slice(0, max) : []);
export const str = (v: unknown, max = 200): string => (typeof v === 'string' ? v.slice(0, max) : '');
