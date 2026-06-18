import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCachedAuthUser, getCachedUserRow } from '@/lib/supabase/auth-cached';
import type { CollegeRow } from '@/lib/types-onboarding';
import type { SubmissionRow, BadgeRow } from '@/lib/types';
import ProfileClient from '@/components/profile/profile-client';
import SignOutButton from '@/components/sign-out-button';

export const dynamic = 'force-dynamic';

/**
 * Profile page — owner directive 2026-06-08.
 * Shows everything captured at onboarding (editable), an avatar uploader
 * (Supabase Storage `avatars` bucket), the "verify college email" affordance,
 * and the historical submissions + badges that the old page used to show.
 *
 * All the editable bits live in the client component so we keep auth + data
 * fetching on the server and ship form interactivity client-side.
 */
export default async function ProfilePage() {
  const authUser = await getCachedAuthUser();
  if (!authUser) redirect('/login');
  const userRow = await getCachedUserRow(authUser.id);

  const supabase = createClient();
  const [collegesRes, submissionsRes, badgesRes] = await Promise.all([
    supabase.from('colleges').select('*').eq('is_active', true).order('tier').order('name'),
    supabase
      .from('submissions')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', authUser.id)
      .order('earned_at', { ascending: false }),
  ]);

  const colleges = (collegesRes.data as CollegeRow[] | null) ?? [];
  const submissions = (submissionsRes.data as SubmissionRow[] | null) ?? [];
  const userBadges =
    (badgesRes.data as Array<{ id: string; earned_at: string; badges: BadgeRow }> | null) ?? [];

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-4xl py-10">
        <div className="mb-4 flex justify-end">
          <SignOutButton variant="standalone" />
        </div>
        <ProfileClient
          user={userRow}
          authEmail={authUser.email ?? ''}
          colleges={colleges}
          submissions={submissions}
          badges={userBadges}
        />
      </main>
    </div>
  );
}
