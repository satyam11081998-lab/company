import { redirect } from 'next/navigation';

/**
 * Deck Rewards (case-competition discount) admin panel has been disconnected.
 *
 * Submissions are no longer accepted from users, so there is nothing new to
 * review here. The route redirects to the admin home. The submission data,
 * `deck_submissions` table, and the review/approve API were intentionally left
 * intact (reversible); the original review UI lives in git history.
 */
export const dynamic = 'force-dynamic';

export default function AdminDeckVaultPage() {
  redirect('/admin');
}
