import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SkeletonLibrary from '@/components/skeleton-library';

export const dynamic = 'force-dynamic';

interface SkeletonRow {
  id: string;
  title: string;
  case_type: string;
  round_type: string;
  slide_count: number;
  description: string;
  tags: string[];
}

export default async function SkeletonsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [skeletonsRes, accessRes] = await Promise.all([
    supabase
      .from('deck_skeletons')
      .select('id, title, case_type, round_type, slide_count, description, tags')
      .eq('is_active', true)
      .order('sort', { ascending: true }),
    supabase.from('skeleton_access').select('user_id').eq('user_id', user.id).maybeSingle(),
  ]);

  const skeletons = (skeletonsRes.data as SkeletonRow[] | null) || [];
  const hasAccess = !!accessRes.data;

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-6xl py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-h1 text-foreground">Deck Skeleton Library</h1>
          <p className="mt-2 text-body text-muted-foreground max-w-2xl">
            Slide-by-slide skeletons distilled from the structures of winning case-competition decks —
            rebuilt as original MECE templates. Pick a structure, keep the discipline, bring your own thinking.
          </p>
        </div>
        <SkeletonLibrary skeletons={skeletons} hasAccess={hasAccess} />
      </main>
    </div>
  );
}
