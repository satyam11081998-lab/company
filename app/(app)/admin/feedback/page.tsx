import { createClient } from '@/lib/supabase/server';
import { listFeedback } from '@/lib/feedback';
import { FeedbackAdminClient } from './feedback-admin-client';

export const dynamic = 'force-dynamic';

// Gating: the parent app/(app)/admin/layout.tsx already redirects non-admins.
export default async function AdminFeedbackPage() {
  const supabase = createClient();
  // RLS feedback_select_admin lets an admin's own session read all rows.
  const reports = await listFeedback(supabase, { status: 'all', category: 'all', limit: 300 });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Feedback &amp; flags</h1>
      <p className="mb-6 text-muted-foreground">
        Reports from the global feedback launcher and contextual flag buttons. Triage and resolve here.
      </p>
      <FeedbackAdminClient initialReports={reports} />
    </div>
  );
}
