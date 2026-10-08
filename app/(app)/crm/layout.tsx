import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCrmContext, isMissingTable } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { can, canSetup } from '@/lib/crm/permissions';
import { createServiceClient } from '@/lib/crm/server/svc';
import CrmShell, { type NavModule } from '@/components/crm/crm-shell';
import { maybeTick } from '@/lib/crm/server/jobs';

export const dynamic = 'force-dynamic';
// Sync, imports and exports run as server actions from CRM pages.
export const maxDuration = 60;
export async function generateMetadata(): Promise<Metadata> {
  // Non-members get a plain not-found page; don't even name the CRM in its title.
  const ctx = await getCrmContext();
  return { title: ctx ? 'MECE CRM' : 'Page not found', robots: { index: false, follow: false } };
}

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCrmContext();
  // Not a CRM user → the CRM does not exist for them.
  if (!ctx) notFound();

  let modules: NavModule[] = [];
  let setupError: string | null = null;
  try {
    const meta = await loadMeta();
    modules = meta.modules
      .filter((m) => m.active !== false && can(ctx, m.api_name, 'view'))
      .map((m) => ({ api: m.api_name, label: m.label, icon: m.icon ?? 'Boxes', kind: m.kind }));
  } catch (e) {
    setupError = isMissingTable(e as { code?: string; message?: string })
      ? 'The CRM tables are not in the database yet. Run supabase/migrations/0071_crm_core.sql in the Supabase SQL editor, then reload.'
      : 'The CRM could not load its settings. Check the server logs.';
  }

  let unread = 0;
  if (!setupError) {
    // Time-based work (SLA escalation, due emails, scheduled actions): at most every 5 minutes.
    await maybeTick();
    const { count } = await createServiceClient().from('crm_notifications').select('id', { count: 'exact', head: true }).eq('user_id', ctx.userId).is('read_at', null);
    unread = count ?? 0;
  }

  const perms = {
    analytics: canSetup(ctx, 'view_analytics'),
    reports: canSetup(ctx, 'manage_reports') || canSetup(ctx, 'view_analytics'),
    setup: ['manage_setup', 'manage_users', 'manage_automation', 'manage_marketing', 'manage_data'].some((p) => canSetup(ctx, p as never)),
    audit: canSetup(ctx, 'view_audit'),
    privacy: canSetup(ctx, 'manage_privacy'),
    outbox: canSetup(ctx, 'approve_outbox') || canSetup(ctx, 'manage_marketing'),
    ai: canSetup(ctx, 'manage_ai') || canSetup(ctx, 'view_analytics'),
    marketing: canSetup(ctx, 'manage_marketing'),
    surveys: canSetup(ctx, 'manage_marketing') || canSetup(ctx, 'view_analytics'),
    service: can(ctx, 'cases', 'view'),
    automation: canSetup(ctx, 'manage_automation'),
  };

  return (
    <CrmShell modules={modules} perms={perms} unread={unread} superAdmin={ctx.superAdmin}>
      {setupError ? (
        <div className="rounded-xl border border-warning/40 bg-warning-soft p-6 text-sm">
          <p className="font-semibold">CRM setup needed</p>
          <p className="mt-1 text-muted-foreground">{setupError}</p>
        </div>
      ) : (
        children
      )}
    </CrmShell>
  );
}
