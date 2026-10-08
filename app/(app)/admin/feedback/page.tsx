import { redirect } from 'next/navigation';

/**
 * Feedback triage moved into the CRM (2026-10): every in-app report becomes a
 * case within minutes, and a case's status and internal comments are written
 * back to the report. This old route forwards to that view.
 */
export const dynamic = 'force-dynamic';

export default function AdminFeedbackPage() {
  redirect('/crm/m/cases?view=feedback');
}
