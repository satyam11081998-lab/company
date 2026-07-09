import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { effectiveTier, TIER_LIMITS } from '@/lib/tier';
import BulletLab from '@/components/resume/bullet-lab';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CV Pointer Lab — resume bullets that fit the line exactly',
  description:
    'Describe an achievement and set your placement portal’s character limit. MECE CV Pointer Lab writes a crisp, quantified one-line resume bullet that fills 95–100% of the limit — never over, never cut.',
};

export default async function BulletLabPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Free-tier rework: the Lab is a Pro feature, but everyone gets 2 lifetime
  // free generations so the value is felt, not imagined. The backend resume
  // routes are the authoritative gate (feature_trials counter, service role);
  // this read just renders the right chip/overlay.
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  const isPro = effectiveTier(profile) === 'pro';

  let trial: { remaining: number; limit: number } | null = null;
  if (!isPro) {
    const limit = TIER_LIMITS.free.cvLabTrialUses as number;
    const svc = createServiceClient();
    const { data: row } = await svc
      .from('feature_trials')
      .select('uses')
      .eq('user_id', user.id)
      .eq('feature', 'cv_pointer_lab')
      .maybeSingle();
    const uses = (row as { uses: number } | null)?.uses ?? 0;
    trial = { remaining: Math.max(0, limit - uses), limit };
  }

  return <BulletLab trial={trial} />;
}
