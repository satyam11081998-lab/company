import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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
  return <BulletLab />;
}
