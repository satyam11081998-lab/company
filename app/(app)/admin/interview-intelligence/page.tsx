// Admin → Interview Intelligence. The /admin layout already requires users.is_admin; the II
// service checks admin rights again on every call (its own allow-list and/or the signed `adm`
// claim), so this page grants nothing by itself.
import IIAdminClient from '@/components/interview-intelligence/admin/IIAdminClient';

export const metadata = { title: 'Interview Intelligence · Admin · MECE' };

export default function InterviewIntelligenceAdminPage() {
  return <IIAdminClient />;
}
