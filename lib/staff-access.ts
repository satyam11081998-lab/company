/**
 * Is this account staff? (2026-10-09, separate admin sign-in.)
 *
 * Staff = an admin (users.is_admin) or an active CRM team member
 * (crm_users.active). The same two facts the admin layout and the CRM context
 * already gate on — this adds no new kind of access. Fails CLOSED: any read
 * error, a guest row, or a missing CRM table means "not staff".
 *
 * Server-only (service-role client). Never import from a client component.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import type { StaffKind } from '@/lib/staff-paths';

export async function staffKind(userId: string): Promise<StaffKind | null> {
  if (!userId || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const svc = createServiceClient();
    const { data: u, error } = await svc.from('users').select('is_admin, is_guest').eq('id', userId).maybeSingle();
    if (error || !u) return null;
    const row = u as { is_admin: boolean | null; is_guest: boolean | null };
    if (row.is_guest) return null;
    if (row.is_admin) return 'admin';
    const { data: cu, error: cuErr } = await svc.from('crm_users').select('active').eq('user_id', userId).maybeSingle();
    if (cuErr || !cu) return null;
    return (cu as { active: boolean | null }).active ? 'crm' : null;
  } catch {
    return null;
  }
}
