import { createServiceClient } from '@/lib/supabase/service';
import CertificatesAdminClient from './certificates-client';
import type { CertificateRow } from '@/lib/certificates';

// Admin gating happens in the parent admin layout (users.is_admin), and again
// in every /api/admin/certificates* handler.
export const dynamic = 'force-dynamic';

const SELECT_COLUMNS =
  'id, cert_id, recipient_name, recipient_program, recipient_email, cert_title, ' +
  'role_title, project_title, start_date, end_date, duration_label, engagement_mode, ' +
  'reporting_to, scope_line, work_notes, engagement_type, sig1_name, sig1_title, ' +
  'sig2_name, sig2_title, issued_at, revoked_at, revoked_reason, created_at, updated_at';

export default async function AdminCertificatesPage() {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('certificates')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <CertificatesAdminClient
      initial={(data ?? []) as unknown as CertificateRow[]}
      loadError={error?.message ?? null}
    />
  );
}
