/** Data shaping shared by the insight pages (server only). */
import { toClientFields } from '@/lib/crm/client-types';
import { can } from '@/lib/crm/permissions';
import type { CrmContext } from '@/lib/crm/types';
import type { Meta } from './meta';

/** Modules this user can view, with the fields they can see (for builders). */
export function builderModules(ctx: CrmContext, meta: Meta) {
  return meta.modules
    .filter((m) => m.active !== false && can(ctx, m.api_name, 'view'))
    .map((m) => ({ api: m.api_name, label: m.label, fields: toClientFields(ctx, m.api_name, meta.fields(m.api_name)) }));
}
