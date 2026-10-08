import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { canSetup } from '@/lib/crm/permissions';
import type { SetupPerm } from '@/lib/crm/types';

export const dynamic = 'force-dynamic';

const SETUP_SECTIONS: Array<{ group: string; items: Array<{ href: string; title: string; text: string; perm: SetupPerm }> }> = [
  {
    group: 'Customisation',
    items: [
      { href: '/crm/setup/modules', title: 'Modules and fields', text: 'Rename modules, add custom modules, custom fields, picklists, formulas and roll-ups.', perm: 'manage_setup' },
      { href: '/crm/setup/pipelines', title: 'Pipelines', text: 'Deal stages, probabilities and forecast categories for each pipeline.', perm: 'manage_setup' },
    ],
  },
  {
    group: 'Users and control',
    items: [
      { href: '/crm/setup/users', title: 'Users, roles and profiles', text: 'Who can open the CRM, who reports to whom, and what each person may do.', perm: 'manage_users' },
      { href: '/crm/setup/sharing', title: 'Data sharing', text: 'Org-wide defaults per module and sharing rules that widen access.', perm: 'manage_users' },
      { href: '/crm/setup/territories', title: 'Territories', text: 'Rule-based record access for teams (e.g. by city or college tier), with a hierarchy.', perm: 'manage_users' },
      { href: '/crm/privacy', title: 'Privacy (DPDP Act)', text: 'Consent ledger, rights requests, erasure and the breach register.', perm: 'manage_privacy' },
    ],
  },
  {
    group: 'Automation',
    items: [
      { href: '/crm/automation?tab=workflow', title: 'Workflow rules', text: 'Instant and scheduled actions when records are created, edited, reach a date or change score.', perm: 'manage_automation' },
      { href: '/crm/automation?tab=blueprint', title: 'Blueprints', text: 'Guided stage-by-stage processes with required fields, notes and SLAs.', perm: 'manage_automation' },
      { href: '/crm/automation?tab=approval_process', title: 'Approval processes', text: 'Multi-stage approvals by user, role or manager.', perm: 'manage_automation' },
      { href: '/crm/automation?tab=assignment_rule', title: 'Assignment and scoring', text: 'Round-robin ownership and lead/contact/deal scores.', perm: 'manage_automation' },
      { href: '/crm/automation?tab=cadence', title: 'Cadences, macros and webhooks', text: 'Follow-up sequences, one-click bundles and signed calls to other systems.', perm: 'manage_automation' },
    ],
  },
  {
    group: 'Marketing and service',
    items: [
      { href: '/crm/marketing/templates', title: 'Email templates', text: 'Reusable emails with merge fields for campaigns, workflows and one-off sends.', perm: 'manage_marketing' },
      { href: '/crm/marketing/forms', title: 'Web forms', text: 'Web-to-lead and web-to-case forms with spam protection, consent and A/B tests.', perm: 'manage_marketing' },
      { href: '/crm/marketing/surveys', title: 'Surveys', text: 'NPS, CSAT and CES questions, invites and results.', perm: 'manage_marketing' },
      { href: '/crm/service', title: 'SLA and service settings', text: 'Response and resolution targets, business hours, holidays, CSAT after resolution.', perm: 'manage_setup' },
      { href: '/crm/outbox', title: 'Outbox', text: 'Approve customer emails; daily sending cap.', perm: 'approve_outbox' },
    ],
  },
  {
    group: 'Analytics and AI',
    items: [
      { href: '/crm/analytics', title: 'Analytics assumptions', text: 'Discount rate, CLV horizon, payment fees and cost to serve used in CLV and profitability (Assumptions tab).', perm: 'manage_reports' },
      { href: '/crm/ai?tab=models', title: 'Iris models', text: 'Train Iris’s churn and conversion models, build custom predictions, refresh scores.', perm: 'manage_ai' },
    ],
  },
  {
    group: 'Data administration',
    items: [
      { href: '/crm/setup/data', title: 'MECE sync and imports', text: 'Sync history, run a sync now, and recent imports.', perm: 'manage_data' },
      { href: '/crm/setup/api#backup', title: 'Backup', text: 'Download all CRM data and configuration as one file.', perm: 'manage_data' },
      { href: '/crm/setup/api', title: 'REST API keys', text: 'Keys for other systems (Zapier, scripts) that act as a CRM user, with scopes and rate limits.', perm: 'manage_setup' },
    ],
  },
];

export default async function SetupHome() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx) notFound();
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Setup</h1>
      {SETUP_SECTIONS.map((g) => {
        const items = g.items.filter((i) => canSetup(ctx, i.perm));
        if (!items.length) return null;
        return (
          <section key={g.group}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.group}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((i) => (
                <Link key={i.href} href={i.href} className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-navy/40">
                  <p className="font-medium">{i.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{i.text}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
