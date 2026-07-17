import { createServiceClient } from '@/lib/supabase/service';
import DeckVaultAdminClient, { type AdminSubmission } from './deck-vault-admin-client';

// Admin gating happens in the parent admin layout (users.is_admin).
export const dynamic = 'force-dynamic';

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1h — enough for a review session

interface SubmissionRow {
  id: string;
  user_id: string;
  competition_name: string;
  organizer: string;
  competition_type: 'corporate' | 'bschool';
  position: string;
  year: number;
  deck_path: string;
  certificate_path: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string;
  discount_pct: number | null;
  created_at: string;
  reviewed_at: string | null;
}

export default async function AdminDeckVaultPage() {
  const svc = createServiceClient();

  const { data } = await svc
    .from('deck_submissions')
    .select('id, user_id, competition_name, organizer, competition_type, position, year, deck_path, certificate_path, status, admin_note, discount_pct, created_at, reviewed_at')
    .order('created_at', { ascending: false })
    .limit(100);
  const rows = (data as SubmissionRow[] | null) || [];

  // Submitter names/emails for context.
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const usersById = new Map<string, { name: string | null; email: string | null }>();
  if (userIds.length > 0) {
    const { data: users } = await svc
      .from('users')
      .select('id, name, email')
      .in('id', userIds);
    for (const u of (users as { id: string; name: string | null; email: string | null }[] | null) || []) {
      usersById.set(u.id, { name: u.name, email: u.email });
    }
  }

  // Short-lived signed URLs into the PRIVATE bucket — only this admin page
  // (service role) can mint them; the files are unreachable otherwise.
  const storage = svc.storage.from('deck-vault-submissions');
  const submissions: AdminSubmission[] = await Promise.all(
    rows.map(async (r) => {
      let deckUrl: string | null = null;
      let certUrl: string | null = null;
      if (r.status === 'pending') {
        const [deckRes, certRes] = await Promise.all([
          storage.createSignedUrl(r.deck_path, SIGNED_URL_TTL_SECONDS),
          storage.createSignedUrl(r.certificate_path, SIGNED_URL_TTL_SECONDS),
        ]);
        deckUrl = deckRes.data?.signedUrl ?? null;
        certUrl = certRes.data?.signedUrl ?? null;
      }
      const who = usersById.get(r.user_id);
      return {
        id: r.id,
        userName: who?.name || '—',
        userEmail: who?.email || '—',
        competitionName: r.competition_name,
        organizer: r.organizer,
        competitionType: r.competition_type,
        position: r.position,
        year: r.year,
        status: r.status,
        adminNote: r.admin_note,
        discountPct: r.discount_pct,
        createdAt: r.created_at,
        reviewedAt: r.reviewed_at,
        deckUrl,
        certUrl,
      };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Deck Rewards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verify competition-deck submissions. Approving mints a single-use, 30-day coupon
          (defaults: corporate 60% · B-school 40% — editable per case). Approved decks stay in
          the private vault; add the good ones to the public Deck Vault from the Decks section.
        </p>
      </div>
      <DeckVaultAdminClient submissions={submissions} />
    </div>
  );
}
