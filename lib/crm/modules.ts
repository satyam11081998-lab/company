/**
 * Standard CRM modules and their fields — the Zoho standard modules, adapted
 * to MECE. This file is the single source of truth: the server upserts it into
 * crm_modules / crm_fields (`ensureMetadata`), and admins add custom modules
 * and fields on top. Pure (no '@/…' imports).
 */
import type { FieldDef, FieldOptions, FieldType, ModuleDef, PicklistOption, PipelineConfig } from './types';

const pl = (...values: string[]): PicklistOption[] => values.map((value) => ({ value }));

type F = Omit<FieldDef, 'module'>;
const f = (api_name: string, label: string, type: FieldType, extra: Partial<F> = {}): F => ({ api_name, label, type, ...extra });
const pick = (api_name: string, label: string, values: string[], extra: Partial<F> = {}): F =>
  f(api_name, label, 'picklist', { ...extra, options: { ...(extra.options ?? {}), picklist: pl(...values) } });
const lookup = (api_name: string, label: string, module: string, extra: Partial<F> = {}): F =>
  f(api_name, label, 'lookup', { ...extra, options: { ...(extra.options ?? {}), module } });
/** A MECE fact: written only by sync, read-only for everyone (even on manual records). */
const synced = (api_name: string, label: string, type: FieldType, options: FieldOptions = {}): F =>
  f(api_name, label, type, { synced: true, readonly: true, section: 'MECE activity', options });

export const MARKETS = ['IN', 'US', 'EU'];
export const CURRENCIES = ['INR', 'USD', 'EUR'];

export const LEAD_SOURCES = [
  'Website', 'Web form', 'Campus event', 'Referral', 'Instagram', 'LinkedIn', 'YouTube', 'WhatsApp',
  'Google search', 'AI search (ChatGPT etc.)', 'Partner college', 'Influencer coupon', 'Email campaign',
  'Cold outreach', 'Import', 'Other',
];

export const LIFECYCLE_STAGES = ['Signed up', 'Onboarded', 'Activated', 'Paying', 'Lapsed', 'Churned'];

const RELATED_TARGETS = ['leads', 'contacts', 'accounts', 'deals', 'cases', 'campaigns', 'quotes', 'invoices'];

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

export const STANDARD_MODULES: ModuleDef[] = [
  { api_name: 'leads', label: 'Leads', singular: 'Lead', kind: 'standard', icon: 'UserPlus', position: 10,
    settings: { nameFields: ['first_name', 'last_name'], sharing: 'public_rw', emailField: 'email', phoneField: 'phone',
      kanbanField: 'lead_status', supports: { convert: true, activities: true, campaigns: true, email: true },
      defaultColumns: ['name', 'company', 'email', 'lead_source', 'lead_status', 'rating', 'owner_id', 'created_at'],
      description: 'Prospects who are not MECE users yet — campus and B2B inquiries, web-form sign-ups, imported lists.' } },
  { api_name: 'contacts', label: 'Contacts', singular: 'Contact', kind: 'standard', icon: 'Users', position: 20,
    settings: { nameFields: ['full_name'], sharing: 'public_rw', emailField: 'email', phoneField: 'phone',
      kanbanField: 'lifecycle_stage', supports: { activities: true, campaigns: true, email: true },
      defaultColumns: ['name', 'email', 'account_id', 'lifecycle_stage', 'mece_tier', 'mece_cases_solved', 'mece_last_active_at', 'owner_id'],
      description: 'Every registered MECE user (synced) plus B2B people such as placement officers and club heads.' } },
  { api_name: 'accounts', label: 'Accounts', singular: 'Account', kind: 'standard', icon: 'Building2', position: 30,
    settings: { nameFields: ['account_name'], sharing: 'public_rw', phoneField: 'phone', kanbanField: 'relationship_stage',
      supports: { activities: true },
      defaultColumns: ['name', 'account_type', 'tier', 'city', 'mece_users', 'mece_paying_users', 'relationship_stage', 'owner_id'],
      description: 'Colleges and B-schools (key accounts) and companies.' } },
  { api_name: 'deals', label: 'Deals', singular: 'Deal', kind: 'standard', icon: 'Handshake', position: 40,
    settings: { nameFields: ['deal_name'], sharing: 'public_rw', kanbanField: 'stage',
      supports: { activities: true, pipelines: true, lineItems: false },
      defaultColumns: ['name', 'pipeline', 'stage', 'amount', 'currency', 'closing_date', 'contact_id', 'owner_id'],
      description: 'B2C orders and abandoned checkouts (synced), B2B campus licences and renewals.' } },
  { api_name: 'tasks', label: 'Tasks', singular: 'Task', kind: 'standard', icon: 'CheckSquare', position: 50,
    settings: { nameFields: ['subject'], sharing: 'public_rw', kanbanField: 'status',
      defaultColumns: ['name', 'due_date', 'status', 'priority', 'related_to', 'owner_id'] } },
  { api_name: 'calls', label: 'Calls', singular: 'Call', kind: 'standard', icon: 'Phone', position: 51,
    settings: { nameFields: ['subject'], sharing: 'public_rw', kanbanField: 'call_status',
      defaultColumns: ['name', 'call_type', 'call_status', 'call_start_time', 'call_duration_sec', 'related_to', 'owner_id'] } },
  { api_name: 'meetings', label: 'Meetings', singular: 'Meeting', kind: 'standard', icon: 'CalendarDays', position: 52,
    settings: { nameFields: ['title'], sharing: 'public_rw', kanbanField: 'status',
      defaultColumns: ['name', 'start_at', 'end_at', 'status', 'related_to', 'owner_id'] } },
  { api_name: 'products', label: 'Products', singular: 'Product', kind: 'standard', icon: 'Package', position: 60,
    settings: { nameFields: ['product_name'], sharing: 'public_read',
      defaultColumns: ['name', 'product_code', 'product_category', 'unit_price', 'currency', 'period', 'active'] } },
  { api_name: 'price_books', label: 'Price Books', singular: 'Price Book', kind: 'standard', icon: 'BookOpen', position: 61,
    settings: { nameFields: ['price_book_name'], sharing: 'public_read', supports: { lineItems: true },
      defaultColumns: ['name', 'currency', 'pricing_model', 'active'] } },
  { api_name: 'quotes', label: 'Quotes', singular: 'Quote', kind: 'standard', icon: 'FileText', position: 62,
    settings: { nameFields: ['subject'], sharing: 'public_rw', kanbanField: 'quote_stage', supports: { lineItems: true, activities: true },
      defaultColumns: ['quote_number', 'name', 'quote_stage', 'account_id', 'grand_total', 'currency', 'valid_until'] } },
  { api_name: 'sales_orders', label: 'Sales Orders', singular: 'Sales Order', kind: 'standard', icon: 'ShoppingCart', position: 63,
    settings: { nameFields: ['subject'], sharing: 'public_rw', kanbanField: 'status', supports: { lineItems: true },
      defaultColumns: ['so_number', 'name', 'status', 'account_id', 'grand_total', 'currency', 'due_date'] } },
  { api_name: 'invoices', label: 'Invoices', singular: 'Invoice', kind: 'standard', icon: 'Receipt', position: 64,
    settings: { nameFields: ['subject'], sharing: 'public_rw', kanbanField: 'status', supports: { lineItems: true },
      defaultColumns: ['invoice_number', 'name', 'status', 'contact_id', 'grand_total', 'currency', 'invoice_date'] } },
  { api_name: 'vendors', label: 'Vendors', singular: 'Vendor', kind: 'standard', icon: 'Truck', position: 65,
    settings: { nameFields: ['vendor_name'], sharing: 'public_read', emailField: 'email',
      defaultColumns: ['name', 'category', 'monthly_cost_estimate', 'website'] } },
  { api_name: 'purchase_orders', label: 'Purchase Orders', singular: 'Purchase Order', kind: 'standard', icon: 'ClipboardList', position: 66,
    settings: { nameFields: ['subject'], sharing: 'public_read', kanbanField: 'status', supports: { lineItems: true },
      defaultColumns: ['po_number', 'name', 'vendor_id', 'cost_category', 'grand_total', 'po_date', 'status'] } },
  { api_name: 'cases', label: 'Cases', singular: 'Case', kind: 'standard', icon: 'LifeBuoy', position: 70,
    settings: { nameFields: ['subject'], sharing: 'public_rw', kanbanField: 'status', supports: { activities: true, email: true },
      emailField: 'reporter_email',
      defaultColumns: ['case_number', 'name', 'status', 'priority', 'case_origin', 'contact_id', 'sla_due_at', 'owner_id'],
      description: 'Support tickets: in-app problem reports (synced), web-to-case forms and manual entries.' } },
  { api_name: 'solutions', label: 'Solutions', singular: 'Solution', kind: 'standard', icon: 'Lightbulb', position: 71,
    settings: { nameFields: ['solution_title'], sharing: 'public_rw', kanbanField: 'status',
      defaultColumns: ['solution_number', 'name', 'category', 'status', 'updated_at'] } },
  { api_name: 'campaigns', label: 'Campaigns', singular: 'Campaign', kind: 'standard', icon: 'Megaphone', position: 80,
    settings: { nameFields: ['campaign_name'], sharing: 'public_rw', kanbanField: 'status', supports: { campaigns: true },
      defaultColumns: ['name', 'type', 'status', 'start_date', 'end_date', 'budgeted_cost', 'actual_cost', 'owner_id'] } },
];

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

const LINE_ITEM_FIELDS = (prefix: string): F[] => [
  f('line_items', 'Items', 'line_items', { section: 'Items', options: { mode: 'sale' } }),
  f('sub_total', 'Sub total', 'currency', { system: true, section: 'Totals' }),
  f('discount_total', 'Discount', 'currency', { system: true, section: 'Totals' }),
  f('tax_total', 'Tax', 'currency', { system: true, section: 'Totals' }),
  f('adjustment', 'Adjustment', 'currency', { section: 'Totals' }),
  f('grand_total', 'Grand total', 'currency', { system: true, section: 'Totals' }),
  pick('currency', 'Currency', CURRENCIES, { section: 'Totals', options: { defaultValue: 'INR' } }),
  f('terms', 'Terms and conditions', 'textarea', { section: 'Terms', options: { maxLength: 4000, help: `Printed on the ${prefix}.` } }),
];

/** DPDP Act 2023: lawful basis + consent per purpose (consent fields are written only from the consent ledger). */
const PRIVACY_FIELDS: F[] = [
  pick('data_basis', 'Processing basis', ['Consent', 'Legitimate use (s.7)', 'Not set'], { section: 'Data privacy', options: { defaultValue: 'Not set', help: 'DPDP Act 2023: consent, or a legitimate use under section 7.' } }),
  pick('consent_marketing', 'Marketing consent', ['Given', 'Withdrawn', 'Pending', 'Not asked'], { system: true, section: 'Data privacy' }),
  pick('consent_profiling', 'AI profiling consent', ['Given', 'Withdrawn', 'Pending', 'Not asked'], { system: true, section: 'Data privacy' }),
];

const FIELDS: Record<string, F[]> = {
  leads: [
    f('first_name', 'First name', 'text'),
    f('last_name', 'Last name', 'text', { required: true }),
    f('email', 'Email', 'email'),
    f('phone', 'Phone', 'phone'),
    f('company', 'Company / college', 'text'),
    f('title', 'Designation', 'text'),
    pick('lead_source', 'Lead source', LEAD_SOURCES),
    pick('lead_status', 'Lead status', ['New', 'Contacted', 'Qualified', 'Nurturing', 'Unqualified', 'Converted', 'Closed - lost'],
      { options: { defaultValue: 'New' } }),
    pick('rating', 'Rating', ['Hot', 'Warm', 'Cold']),
    pick('segment', 'Segment', ['Student (B2C)', 'College / B-school (B2B)', 'Consulting club', 'Corporate', 'Coaching institute']),
    multi('interest', 'Interested in', ['Case practice', 'Guesstimates', 'GD prep', 'Voice interviews', 'Deck Vault', 'Campus licence', 'Workshops']),
    pick('market', 'Market', MARKETS, { options: { defaultValue: 'IN' } }),
    f('batch_year', 'Batch year', 'integer', { options: { min: 2000, max: 2100 } }),
    f('no_of_students', 'No. of students (B2B)', 'integer', { options: { min: 0 } }),
    f('annual_budget', 'Annual budget (B2B)', 'currency'),
    f('city', 'City', 'text'),
    f('country', 'Country', 'text'),
    f('website', 'Website', 'url'),
    f('linkedin_url', 'LinkedIn', 'url'),
    lookup('campaign_id', 'Campaign source', 'campaigns'),
    f('email_opt_out', 'Email opt-out', 'boolean'),
    f('description', 'Description', 'textarea', { section: 'Description' }),
    lookup('converted_contact_id', 'Converted contact', 'contacts', { system: true, section: 'Conversion' }),
    lookup('converted_account_id', 'Converted account', 'accounts', { system: true, section: 'Conversion' }),
    lookup('converted_deal_id', 'Converted deal', 'deals', { system: true, section: 'Conversion' }),
    f('converted_at', 'Converted at', 'datetime', { system: true, section: 'Conversion' }),
    f('conversion_probability', 'Conversion probability (%)', 'percent', { system: true, section: 'Scores' }),
    ...PRIVACY_FIELDS,
  ],
  contacts: [
    f('full_name', 'Full name', 'text', { required: true, synced: true }),
    f('email', 'Email', 'email', { synced: true }),
    f('phone', 'Phone', 'phone', { synced: true }),
    lookup('account_id', 'Account (college / company)', 'accounts', { synced: true }),
    pick('contact_type', 'Contact type', ['Student', 'Placement officer', 'Club head', 'Faculty', 'Corporate recruiter', 'Partner', 'Other'],
      { options: { defaultValue: 'Student' } }),
    f('title', 'Designation', 'text'),
    pick('lead_source', 'Lead source', LEAD_SOURCES),
    pick('lifecycle_stage', 'Lifecycle stage', LIFECYCLE_STAGES, { synced: true }),
    pick('market', 'Market', MARKETS, { synced: true }),
    f('city', 'City', 'text'),
    f('linkedin_url', 'LinkedIn', 'url', { synced: true }),
    f('email_opt_out', 'Email opt-out', 'boolean', { synced: true }),
    lookup('campaign_id', 'Campaign source', 'campaigns'),
    lookup('converted_from_lead_id', 'Converted from lead', 'leads', { system: true, section: 'Conversion' }),
    f('description', 'Description', 'textarea', { section: 'Description' }),
    // MECE facts (sync only)
    synced('mece_signed_up_at', 'Signed up', 'datetime'),
    synced('mece_onboarded_at', 'Onboarded', 'datetime'),
    synced('mece_tier', 'Plan', 'picklist', { picklist: pl('free', 'lite', 'pro') }),
    synced('mece_tier_expires_at', 'Plan expires', 'datetime'),
    synced('mece_college', 'College (as entered)', 'text'),
    synced('mece_batch_year', 'Batch year', 'integer'),
    synced('mece_placement_focus', 'Placement focus', 'picklist', { picklist: pl('summer', 'final', 'both') }),
    synced('mece_referral_source', 'How they found MECE', 'text'),
    synced('mece_cases_solved', 'Cases solved', 'integer'),
    synced('mece_avg_score', 'Average score', 'decimal'),
    synced('mece_best_score', 'Best score', 'integer'),
    synced('mece_first_solved_at', 'First case solved', 'datetime'),
    synced('mece_last_active_at', 'Last active', 'datetime'),
    synced('mece_active_days_30', 'Active days (last 30)', 'integer'),
    synced('mece_streak', 'Streak', 'integer'),
    synced('mece_points', 'Points', 'integer'),
    synced('mece_revenue_inr', 'Lifetime revenue (₹, verified)', 'currency'),
    synced('mece_revenue_intl', 'Lifetime revenue (USD/EUR)', 'text'),
    synced('mece_payments_count', 'Paid orders', 'integer'),
    synced('mece_first_paid_at', 'First paid', 'datetime'),
    synced('mece_last_paid_at', 'Last paid', 'datetime'),
    synced('mece_ai_cost_usd', 'AI cost to serve (USD)', 'decimal'),
    synced('mece_voice_minutes', 'Voice minutes used', 'decimal'),
    synced('mece_internal', 'Internal account', 'boolean'),
    synced('mece_account_deleted', 'App account deleted', 'boolean'),
    // Scores written by the CRM itself (segments, surveys, AI) — never user-editable
    f('rfm_r', 'RFM recency (1–5)', 'integer', { system: true, section: 'Scores' }),
    f('rfm_f', 'RFM frequency (1–5)', 'integer', { system: true, section: 'Scores' }),
    f('rfm_m', 'RFM monetary (1–5)', 'integer', { system: true, section: 'Scores' }),
    f('rfm_segment', 'RFM segment', 'text', { system: true, section: 'Scores' }),
    f('nps_last', 'Last NPS answer (0–10)', 'integer', { system: true, section: 'Scores' }),
    f('csat_last', 'Last CSAT answer (1–5)', 'integer', { system: true, section: 'Scores' }),
    f('health_score', 'Health score (0–100)', 'integer', { system: true, section: 'Scores' }),
    f('churn_risk', 'Churn risk (%)', 'percent', { system: true, section: 'Scores' }),
    f('next_best_action', 'Next best action', 'text', { system: true, section: 'Scores' }),
    ...PRIVACY_FIELDS,
  ],
  accounts: [
    f('account_name', 'Account name', 'text', { required: true, synced: true }),
    pick('account_type', 'Account type', ['College / B-school', 'Consulting club', 'Company', 'Coaching institute', 'Partner', 'Other'], { synced: true }),
    lookup('parent_account_id', 'Parent account', 'accounts'),
    pick('tier', 'Tier', ['1', '2', '3'], { synced: true }),
    f('website', 'Website', 'url'),
    f('phone', 'Phone', 'phone'),
    pick('industry', 'Industry', ['Education', 'Consulting', 'Technology', 'Finance', 'FMCG', 'Healthcare', 'Other']),
    f('city', 'City', 'text', { synced: true }),
    f('state', 'State', 'text', { synced: true }),
    f('country', 'Country', 'text'),
    f('no_of_students', 'No. of students', 'integer', { options: { min: 0 } }),
    f('annual_budget', 'Annual budget', 'currency'),
    pick('relationship_stage', 'Relationship stage', ['Prospect', 'Engaged', 'Pilot', 'Customer', 'Champion', 'At risk', 'Lost'],
      { options: { defaultValue: 'Prospect' } }),
    f('key_account', 'Key account (KAM)', 'boolean'),
    pick('rating', 'Rating', ['Hot', 'Warm', 'Cold']),
    f('description', 'Description', 'textarea', { section: 'Description' }),
    synced('mece_college_id', 'MECE college id', 'text'),
    synced('mece_users', 'MECE users', 'integer'),
    synced('mece_paying_users', 'Paying users', 'integer'),
    synced('mece_revenue_inr', 'Revenue (₹, verified)', 'currency'),
    synced('mece_avg_score', 'Average score', 'decimal'),
  ],
  deals: [
    f('deal_name', 'Deal name', 'text', { required: true, synced: true }),
    f('pipeline', 'Pipeline', 'text', { required: true, synced: true, options: { help: 'One of the pipelines in Setup → Pipelines.' } }),
    f('stage', 'Stage', 'picklist', { required: true, synced: true, options: { help: 'Stages come from the selected pipeline.' } }),
    f('amount', 'Amount', 'currency', { synced: true }),
    pick('currency', 'Currency', CURRENCIES, { synced: true, options: { defaultValue: 'INR' } }),
    f('closing_date', 'Closing date', 'date', { synced: true }),
    f('probability', 'Probability (%)', 'percent'),
    f('expected_revenue', 'Expected revenue', 'formula', { system: true, options: { expr: 'amount * probability / 100', returns: 'currency' } }),
    f('forecast_category', 'Forecast category', 'text', { system: true }),
    lookup('account_id', 'Account', 'accounts', { synced: true }),
    lookup('contact_id', 'Contact', 'contacts', { synced: true }),
    pick('type', 'Type', ['New business', 'Upgrade', 'Renewal', 'Add-on', 'Campus licence', 'Workshop'], { synced: true }),
    pick('product_line', 'Product', ['Lite', 'Pro', 'Deck', 'Vault access', 'Voice minutes', 'Campus licence', 'Workshop', 'Other'], { synced: true }),
    pick('period', 'Billing period', ['monthly', 'quarter', 'annual', 'one-time'], { synced: true }),
    pick('lead_source', 'Lead source', LEAD_SOURCES),
    lookup('campaign_id', 'Campaign source', 'campaigns'),
    f('next_step', 'Next step', 'text'),
    pick('lost_reason', 'Lost reason', ['Price', 'Chose competitor', 'No budget', 'Payment failed', 'Abandoned checkout', 'Refunded', 'No response', 'Not a fit', 'Timing', 'Other'], { synced: true }),
    f('description', 'Description', 'textarea', { section: 'Description' }),
    synced('payment_ref', 'Razorpay payment id', 'text'),
    synced('order_ref', 'Razorpay order id', 'text'),
    synced('paid_at', 'Paid at', 'datetime'),
    synced('coupon_code', 'Coupon', 'text'),
    synced('internal_test', 'Internal / test payment', 'boolean'),
    f('deal_health', 'Deal health (0–100)', 'integer', { system: true, section: 'Scores' }),
  ],
  tasks: [
    f('subject', 'Subject', 'text', { required: true }),
    f('due_date', 'Due date', 'date'),
    pick('status', 'Status', ['Not started', 'In progress', 'Waiting', 'Deferred', 'Completed'], { options: { defaultValue: 'Not started' } }),
    pick('priority', 'Priority', ['High', 'Normal', 'Low'], { options: { defaultValue: 'Normal' } }),
    f('related_to', 'Related to', 'related', { options: { modules: RELATED_TARGETS } }),
    f('reminder_at', 'Reminder', 'datetime'),
    pick('recurrence', 'Repeat', ['None', 'Daily', 'Weekly', 'Monthly'], { options: { defaultValue: 'None' } }),
    f('completed_at', 'Completed at', 'datetime', { system: true }),
    f('description', 'Description', 'textarea', { section: 'Description' }),
  ],
  calls: [
    f('subject', 'Subject', 'text', { required: true }),
    pick('call_type', 'Call type', ['Outbound', 'Inbound', 'Missed'], { options: { defaultValue: 'Outbound' } }),
    pick('call_purpose', 'Purpose', ['Prospecting', 'Onboarding', 'Demo', 'Support', 'Renewal', 'Negotiation', 'Follow-up', 'Win-back']),
    pick('call_status', 'Status', ['Scheduled', 'Completed', 'Cancelled'], { options: { defaultValue: 'Scheduled' } }),
    f('call_start_time', 'Start time', 'datetime'),
    f('call_duration_sec', 'Duration (seconds)', 'integer', { options: { min: 0, max: 86400 } }),
    f('call_result', 'Result', 'text'),
    f('phone', 'Number', 'phone'),
    f('related_to', 'Related to', 'related', { options: { modules: RELATED_TARGETS } }),
    f('reminder_at', 'Reminder', 'datetime'),
    f('description', 'Notes / agenda', 'textarea', { section: 'Description' }),
  ],
  meetings: [
    f('title', 'Title', 'text', { required: true }),
    f('start_at', 'From', 'datetime', { required: true }),
    f('end_at', 'To', 'datetime'),
    f('location', 'Location / link', 'text'),
    pick('status', 'Status', ['Scheduled', 'Completed', 'Cancelled', 'No-show'], { options: { defaultValue: 'Scheduled' } }),
    f('participants', 'Participants (emails)', 'textarea', { options: { maxLength: 2000 } }),
    f('related_to', 'Related to', 'related', { options: { modules: RELATED_TARGETS } }),
    f('reminder_at', 'Reminder', 'datetime'),
    f('description', 'Agenda', 'textarea', { section: 'Description' }),
  ],
  products: [
    f('product_name', 'Product name', 'text', { required: true }),
    f('product_code', 'Product code', 'text', { is_unique: true }),
    pick('product_category', 'Category', ['Subscription', 'Deck', 'Vault access', 'Voice minutes', 'Campus licence', 'Workshop', 'Other']),
    f('unit_price', 'Unit price', 'currency'),
    pick('currency', 'Currency', CURRENCIES, { options: { defaultValue: 'INR' } }),
    pick('period', 'Billing period', ['monthly', 'quarter', 'annual', 'one-time']),
    f('tax_pct', 'Tax (%)', 'percent', { options: { defaultValue: 18 } }),
    f('active', 'Active', 'boolean', { options: { defaultValue: true } }),
    f('description', 'Description', 'textarea', { section: 'Description' }),
  ],
  price_books: [
    f('price_book_name', 'Price book name', 'text', { required: true }),
    pick('currency', 'Currency', CURRENCIES, { options: { defaultValue: 'INR' } }),
    pick('pricing_model', 'Pricing model', ['Flat', 'Differential'], { options: { defaultValue: 'Flat' } }),
    f('active', 'Active', 'boolean', { options: { defaultValue: true } }),
    f('entries', 'Prices', 'line_items', { section: 'Prices', options: { mode: 'pricebook' } }),
    f('description', 'Description', 'textarea', { section: 'Description' }),
  ],
  quotes: [
    f('quote_number', 'Quote number', 'autonumber', { system: true, options: { prefix: 'QT-', pad: 4 } }),
    f('subject', 'Subject', 'text', { required: true }),
    pick('quote_stage', 'Stage', ['Draft', 'Sent', 'Negotiation', 'Accepted', 'Rejected', 'Expired'], { options: { defaultValue: 'Draft' } }),
    f('valid_until', 'Valid until', 'date'),
    lookup('deal_id', 'Deal', 'deals'),
    lookup('account_id', 'Account', 'accounts'),
    lookup('contact_id', 'Contact', 'contacts'),
    lookup('price_book_id', 'Price book', 'price_books'),
    lookup('converted_so_id', 'Sales order', 'sales_orders', { system: true, section: 'Conversion' }),
    ...LINE_ITEM_FIELDS('quote'),
  ],
  sales_orders: [
    f('so_number', 'SO number', 'autonumber', { system: true, options: { prefix: 'SO-', pad: 4 } }),
    f('subject', 'Subject', 'text', { required: true }),
    pick('status', 'Status', ['Created', 'Approved', 'Delivered', 'Cancelled'], { options: { defaultValue: 'Created' } }),
    f('due_date', 'Due date', 'date'),
    lookup('quote_id', 'Quote', 'quotes'),
    lookup('deal_id', 'Deal', 'deals'),
    lookup('account_id', 'Account', 'accounts'),
    lookup('contact_id', 'Contact', 'contacts'),
    lookup('converted_invoice_id', 'Invoice', 'invoices', { system: true, section: 'Conversion' }),
    ...LINE_ITEM_FIELDS('sales order'),
  ],
  invoices: [
    f('invoice_number', 'Invoice number', 'autonumber', { system: true, options: { prefix: 'INV-', pad: 5 } }),
    f('subject', 'Subject', 'text', { required: true, synced: true }),
    f('invoice_date', 'Invoice date', 'date', { synced: true }),
    f('due_date', 'Due date', 'date'),
    pick('status', 'Status', ['Draft', 'Sent', 'Paid', 'Partially paid', 'Overdue', 'Cancelled', 'Refunded'], { synced: true, options: { defaultValue: 'Draft' } }),
    lookup('sales_order_id', 'Sales order', 'sales_orders'),
    lookup('deal_id', 'Deal', 'deals', { synced: true }),
    lookup('account_id', 'Account', 'accounts', { synced: true }),
    lookup('contact_id', 'Contact', 'contacts', { synced: true }),
    synced('payment_ref', 'Razorpay payment id', 'text'),
    ...LINE_ITEM_FIELDS('invoice').map((x) => (['line_items', 'currency', 'adjustment'].includes(x.api_name) ? { ...x, synced: true } : x)),
  ],
  vendors: [
    f('vendor_name', 'Vendor name', 'text', { required: true }),
    pick('category', 'Category', ['AI / LLM', 'Hosting', 'Database', 'Email', 'Payments', 'Marketing', 'Content', 'Tools', 'Other']),
    f('email', 'Email', 'email'),
    f('phone', 'Phone', 'phone'),
    f('website', 'Website', 'url'),
    f('monthly_cost_estimate', 'Monthly cost (estimate)', 'currency'),
    pick('currency', 'Currency', CURRENCIES, { options: { defaultValue: 'INR' } }),
    f('description', 'Description', 'textarea', { section: 'Description' }),
  ],
  purchase_orders: [
    f('po_number', 'PO number', 'autonumber', { system: true, options: { prefix: 'PO-', pad: 4 } }),
    f('subject', 'Subject', 'text', { required: true }),
    lookup('vendor_id', 'Vendor', 'vendors'),
    f('po_date', 'PO date', 'date'),
    f('due_date', 'Due date', 'date'),
    pick('status', 'Status', ['Created', 'Approved', 'Delivered', 'Cancelled'], { options: { defaultValue: 'Created' } }),
    pick('cost_category', 'Cost category', ['Cost to serve (variable)', 'Platform (fixed)', 'Marketing (acquisition)', 'Content', 'Other'],
      { options: { help: 'Drives customer profitability (activity-based costing) and CAC.' } }),
    ...LINE_ITEM_FIELDS('purchase order'),
  ],
  cases: [
    f('case_number', 'Case number', 'autonumber', { system: true, options: { prefix: 'CS-', pad: 5 } }),
    f('subject', 'Subject', 'text', { required: true, synced: true }),
    pick('status', 'Status', ['New', 'Open', 'In progress', 'Waiting on customer', 'Escalated', 'Resolved', 'Closed'], { synced: true, options: { defaultValue: 'New' } }),
    pick('priority', 'Priority', ['Urgent', 'High', 'Medium', 'Low'], { options: { defaultValue: 'Medium' } }),
    pick('case_origin', 'Origin', ['Web form', 'Email', 'In-app report', 'Phone', 'WhatsApp', 'Social', 'Internal'], { synced: true }),
    pick('type', 'Type', ['Problem', 'Question', 'Feature request', 'Billing', 'Bug', 'Content error', 'Feedback'], { synced: true }),
    lookup('contact_id', 'Contact', 'contacts', { synced: true }),
    lookup('account_id', 'Account', 'accounts'),
    lookup('product_id', 'Product', 'products'),
    f('reporter_email', 'Reporter email', 'email', { synced: true }),
    f('description', 'Description', 'textarea', { synced: true, section: 'Description', options: { maxLength: 32000 } }),
    f('internal_comments', 'Internal comments', 'textarea', { section: 'Description', options: { maxLength: 3000 } }),
    lookup('solution_id', 'Solution', 'solutions'),
    f('sla_due_at', 'SLA due', 'datetime', { system: true, section: 'Service level' }),
    f('first_response_at', 'First response', 'datetime', { system: true, section: 'Service level' }),
    f('resolved_at', 'Resolved at', 'datetime', { system: true, section: 'Service level' }),
    f('escalated', 'Escalated', 'boolean', { system: true, section: 'Service level' }),
    f('csat_score', 'CSAT (1–5)', 'integer', { system: true, section: 'Service level' }),
    synced('mece_report_id', 'MECE report id', 'text'),
    synced('mece_page', 'Reported from page', 'text'),
  ],
  solutions: [
    f('solution_number', 'Solution number', 'autonumber', { system: true, options: { prefix: 'SOL-', pad: 4 } }),
    f('solution_title', 'Title', 'text', { required: true }),
    pick('status', 'Status', ['Draft', 'Reviewed', 'Published', 'Archived'], { options: { defaultValue: 'Draft' } }),
    pick('category', 'Category', ['Account & login', 'Billing & refunds', 'Cases & scoring', 'Voice interviews', 'Deck Vault', 'Technical', 'Other']),
    f('question', 'Question', 'textarea', { section: 'Content', options: { maxLength: 4000 } }),
    f('answer', 'Answer', 'textarea', { section: 'Content', options: { maxLength: 32000 } }),
    f('helpful_count', 'Marked helpful', 'integer', { system: true }),
  ],
  campaigns: [
    f('campaign_name', 'Campaign name', 'text', { required: true }),
    pick('type', 'Type', ['Email broadcast', 'Social', 'Webinar / workshop', 'Campus event', 'Referral', 'Influencer / coupon', 'Paid ads', 'SEO / content', 'Partnership']),
    pick('status', 'Status', ['Planning', 'Active', 'Inactive', 'Completed', 'Cancelled'], { options: { defaultValue: 'Planning' } }),
    f('start_date', 'Start date', 'date'),
    f('end_date', 'End date', 'date'),
    f('budgeted_cost', 'Budgeted cost (₹)', 'currency'),
    f('actual_cost', 'Actual cost (₹)', 'currency'),
    f('expected_revenue', 'Expected revenue (₹)', 'currency'),
    f('expected_response', 'Expected response (%)', 'percent'),
    f('utm_campaign', 'UTM campaign', 'text', { options: { help: 'Matches ?utm_campaign= on landing pages.' } }),
    f('coupon_code', 'Coupon code', 'text', { options: { help: 'Revenue from orders that used this coupon is attributed here.' } }),
    lookup('parent_campaign_id', 'Parent campaign', 'campaigns'),
    f('description', 'Description', 'textarea', { section: 'Description' }),
  ],
};

function multi(api_name: string, label: string, values: string[], extra: Partial<F> = {}): F {
  return f(api_name, label, 'multipicklist', { ...extra, options: { ...(extra.options ?? {}), picklist: pl(...values) } });
}

export const STANDARD_FIELDS: FieldDef[] = Object.entries(FIELDS).flatMap(([module, defs]) =>
  defs.map((d, i) => ({
    ...d,
    module,
    section: d.section ?? 'Details',
    position: (i + 1) * 10,
    active: true,
  })),
);

// ---------------------------------------------------------------------------
// Default pipelines (Setup → Pipelines can change them)
// ---------------------------------------------------------------------------

export const DEFAULT_PIPELINES: Array<{ name: string; config: PipelineConfig }> = [
  {
    name: 'B2C subscriptions',
    config: {
      isDefault: true,
      description: 'Every MECE checkout. Paid orders close as won; checkouts left unpaid for 3 days close as lost (abandoned).',
      stages: [
        { key: 'checkout_started', label: 'Checkout started', probability: 30, forecast: 'Pipeline', state: 'open' },
        { key: 'payment_failed', label: 'Payment failed', probability: 10, forecast: 'Pipeline', state: 'open' },
        { key: 'closed_won', label: 'Closed won', probability: 100, forecast: 'Closed Won', state: 'won' },
        { key: 'closed_lost', label: 'Closed lost', probability: 0, forecast: 'Omitted', state: 'lost' },
      ],
    },
  },
  {
    name: 'Campus partnerships (B2B)',
    config: {
      description: 'College, consulting-club and corporate licences.',
      stages: [
        { key: 'prospecting', label: 'Prospecting', probability: 10, forecast: 'Pipeline', state: 'open' },
        { key: 'qualification', label: 'Qualification', probability: 20, forecast: 'Pipeline', state: 'open' },
        { key: 'needs_analysis', label: 'Needs analysis', probability: 35, forecast: 'Pipeline', state: 'open' },
        { key: 'demo_pilot', label: 'Demo / pilot', probability: 50, forecast: 'Best Case', state: 'open' },
        { key: 'proposal', label: 'Proposal / quote', probability: 65, forecast: 'Best Case', state: 'open' },
        { key: 'negotiation', label: 'Negotiation', probability: 80, forecast: 'Commit', state: 'open' },
        { key: 'closed_won', label: 'Closed won', probability: 100, forecast: 'Closed Won', state: 'won' },
        { key: 'closed_lost', label: 'Closed lost', probability: 0, forecast: 'Omitted', state: 'lost' },
      ],
    },
  },
  {
    name: 'Renewals',
    config: {
      description: 'Paid plans approaching expiry (created 14 days before the plan ends).',
      stages: [
        { key: 'up_for_renewal', label: 'Up for renewal', probability: 40, forecast: 'Pipeline', state: 'open' },
        { key: 'reminder_sent', label: 'Reminder sent', probability: 50, forecast: 'Best Case', state: 'open' },
        { key: 'negotiation', label: 'Win-back offer', probability: 60, forecast: 'Commit', state: 'open' },
        { key: 'closed_won', label: 'Renewed', probability: 100, forecast: 'Closed Won', state: 'won' },
        { key: 'closed_lost', label: 'Churned', probability: 0, forecast: 'Omitted', state: 'lost' },
      ],
    },
  },
];

/** Name of a record from its data, per module settings. */
export function recordName(settings: { nameFields: string[] }, data: Record<string, unknown>): string {
  const parts = settings.nameFields
    .map((k) => data[k])
    .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
    .map((v) => String(v).trim());
  return parts.join(' ').slice(0, 300);
}
