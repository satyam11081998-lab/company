import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCachedAuthUser, getCachedUserRow } from '@/lib/supabase/auth-cached';
import type { CollegeRow } from '@/lib/types-onboarding';
import OnboardingForm from '@/components/onboarding/onboarding-form';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  // The (app) layout already runs auth; this is belt-and-suspenders in case
  // the layout's redirect chain changes later.
  const authUser = await getCachedAuthUser();
  if (!authUser) redirect('/login');

  // Already onboarded? Send them to the dashboard.
  const userRow = await getCachedUserRow(authUser.id);
  if (userRow?.onboarding_completed_at) redirect('/dashboard');

  // Load college taxonomy (public read, no RLS hop).
  const supabase = createClient();
  const { data: collegeRows } = await supabase
    .from('colleges')
    .select('*')
    .eq('is_active', true)
    .order('tier', { ascending: true })
    .order('name', { ascending: true });
  const colleges = (collegeRows as CollegeRow[] | null) ?? [];

  return (
    <div className="container max-w-3xl py-10">
      <OnboardingForm
        colleges={colleges}
        prefill={{
          full_name: userRow?.full_name ?? userRow?.name ?? authUser.user_metadata?.full_name ?? '',
        }}
      />
    </div>
  );
}
