/**
 * System views per module (Zoho's predefined list views). Pure. Custom views
 * live in crm_config(kind='view') and use the same shape.
 */
import type { Criteria } from './types';

export interface SystemView {
  key: string;
  name: string;
  criteria: Criteria | null;
  mine?: boolean;
  sort?: { field: string; dir: 'asc' | 'desc' };
}

const all = (...conditions: Criteria['conditions']): Criteria => ({ match: 'all', conditions });

const COMMON: SystemView[] = [
  { key: 'all', name: 'All', criteria: null },
  { key: 'mine', name: 'Mine', criteria: null, mine: true },
  { key: 'recent', name: 'Created this week', criteria: all({ field: 'created_at', op: 'in_last_days', value: 7 }), sort: { field: 'created_at', dir: 'desc' } },
  { key: 'unowned', name: 'Unassigned', criteria: all({ field: 'owner_id', op: 'empty' }) },
];

const BY_MODULE: Record<string, SystemView[]> = {
  leads: [
    { key: 'open', name: 'Open leads', criteria: all({ field: 'lead_status', op: 'not_in', value: ['Converted', 'Unqualified', 'Closed - lost'] }) },
    { key: 'hot', name: 'Hot leads', criteria: all({ field: 'rating', op: 'eq', value: 'Hot' }, { field: 'lead_status', op: 'neq', value: 'Converted' }) },
    { key: 'converted', name: 'Converted leads', criteria: all({ field: 'lead_status', op: 'eq', value: 'Converted' }) },
    { key: 'untouched', name: 'Not contacted in 7 days', criteria: all({ field: 'lead_status', op: 'in', value: ['New', 'Contacted'] }, { field: 'updated_at', op: 'older_than_days', value: 7 }) },
  ],
  contacts: [
    { key: 'paying', name: 'Paying customers', criteria: all({ field: 'lifecycle_stage', op: 'eq', value: 'Paying' }) },
    { key: 'lapsed', name: 'Lapsed (win-back)', criteria: all({ field: 'lifecycle_stage', op: 'eq', value: 'Lapsed' }) },
    { key: 'activated_free', name: 'Active free users (upsell)', criteria: all({ field: 'lifecycle_stage', op: 'eq', value: 'Activated' }, { field: 'mece_last_active_at', op: 'in_last_days', value: 14 }) },
    { key: 'not_onboarded', name: 'Signed up, not onboarded', criteria: all({ field: 'lifecycle_stage', op: 'eq', value: 'Signed up' }) },
    { key: 'expiring', name: 'Plan expiring in 14 days', criteria: all({ field: 'mece_tier_expires_at', op: 'in_next_days', value: 14 }) },
    { key: 'b2b', name: 'B2B people', criteria: all({ field: 'contact_type', op: 'neq', value: 'Student' }) },
    { key: 'internal', name: 'Internal accounts', criteria: all({ field: 'mece_internal', op: 'eq', value: true }) },
  ],
  accounts: [
    { key: 'key', name: 'Key accounts', criteria: all({ field: 'key_account', op: 'eq', value: true }) },
    { key: 'colleges', name: 'Colleges with users', criteria: all({ field: 'mece_users', op: 'gt', value: 0 }), sort: { field: 'mece_users', dir: 'desc' } },
    { key: 'at_risk', name: 'At risk', criteria: all({ field: 'relationship_stage', op: 'eq', value: 'At risk' }) },
  ],
  deals: [
    { key: 'open', name: 'Open deals', criteria: all({ field: 'forecast_category', op: 'not_in', value: ['Closed Won', 'Omitted'] }) },
    { key: 'b2b', name: 'Campus partnerships', criteria: all({ field: 'pipeline', op: 'eq', value: 'Campus partnerships (B2B)' }) },
    { key: 'renewals', name: 'Renewals', criteria: all({ field: 'pipeline', op: 'eq', value: 'Renewals' }) },
    { key: 'closing', name: 'Closing this month', criteria: all({ field: 'closing_date', op: 'this_month' }, { field: 'forecast_category', op: 'not_in', value: ['Closed Won', 'Omitted'] }) },
    { key: 'won', name: 'Won this month', criteria: all({ field: 'stage', op: 'eq', value: 'closed_won' }, { field: 'closing_date', op: 'this_month' }) },
    { key: 'abandoned', name: 'Abandoned checkouts', criteria: all({ field: 'lost_reason', op: 'eq', value: 'Abandoned checkout' }) },
  ],
  tasks: [
    { key: 'my_open', name: 'My open tasks', criteria: all({ field: 'status', op: 'neq', value: 'Completed' }), mine: true, sort: { field: 'due_date', dir: 'asc' } },
    { key: 'overdue', name: 'Overdue', criteria: all({ field: 'status', op: 'neq', value: 'Completed' }, { field: 'due_date', op: 'older_than_days', value: 0 }), sort: { field: 'due_date', dir: 'asc' } },
    { key: 'today', name: 'Due today', criteria: all({ field: 'due_date', op: 'today' }) },
  ],
  calls: [
    { key: 'scheduled', name: 'Scheduled calls', criteria: all({ field: 'call_status', op: 'eq', value: 'Scheduled' }), sort: { field: 'call_start_time', dir: 'asc' } },
    { key: 'missed', name: 'Missed calls', criteria: all({ field: 'call_type', op: 'eq', value: 'Missed' }) },
  ],
  meetings: [
    { key: 'upcoming', name: 'Upcoming', criteria: all({ field: 'start_at', op: 'in_next_days', value: 30 }, { field: 'status', op: 'eq', value: 'Scheduled' }), sort: { field: 'start_at', dir: 'asc' } },
  ],
  cases: [
    { key: 'open', name: 'Open cases', criteria: all({ field: 'status', op: 'not_in', value: ['Resolved', 'Closed'] }), sort: { field: 'created_at', dir: 'asc' } },
    { key: 'sla_breached', name: 'SLA breached', criteria: all({ field: 'status', op: 'not_in', value: ['Resolved', 'Closed'] }, { field: 'sla_due_at', op: 'older_than_days', value: 0 }) },
    { key: 'escalated', name: 'Escalated', criteria: all({ field: 'status', op: 'eq', value: 'Escalated' }) },
    { key: 'urgent', name: 'Urgent / high', criteria: all({ field: 'priority', op: 'in', value: ['Urgent', 'High'] }, { field: 'status', op: 'not_in', value: ['Resolved', 'Closed'] }) },
  ],
  solutions: [{ key: 'published', name: 'Published', criteria: all({ field: 'status', op: 'eq', value: 'Published' }) }],
  campaigns: [{ key: 'active', name: 'Active campaigns', criteria: all({ field: 'status', op: 'eq', value: 'Active' }) }],
  quotes: [{ key: 'open', name: 'Open quotes', criteria: all({ field: 'quote_stage', op: 'in', value: ['Draft', 'Sent', 'Negotiation'] }) }],
  invoices: [
    { key: 'unpaid', name: 'Unpaid', criteria: all({ field: 'status', op: 'in', value: ['Draft', 'Sent', 'Overdue', 'Partially paid'] }) },
    { key: 'paid', name: 'Paid', criteria: all({ field: 'status', op: 'eq', value: 'Paid' }) },
  ],
  products: [{ key: 'active', name: 'Active products', criteria: all({ field: 'active', op: 'eq', value: true }) }],
};

export function systemViews(module: string): SystemView[] {
  return [...COMMON.slice(0, 2), ...(BY_MODULE[module] ?? []), ...COMMON.slice(2)];
}
