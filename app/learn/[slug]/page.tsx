import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import DomainViewer from '@/components/domain-viewer';
import type { UserRow } from '@/lib/types';
import { getDomainBySlug, getAllSlugs, ALL_DOMAINS, LEARNING_PATHS } from '@/lib/curriculum';


/** Pre-generate all 18 domain slugs */
export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

interface Props {
  params: { slug: string };
}

export default async function DomainPage({ params }: Props) {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const domain = getDomainBySlug(params.slug);
  if (!domain) notFound();

  const userRes = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
  const userRow = userRes.data as UserRow | null;

  return (
    <div className="min-h-screen">
      <AppNav user={userRow} />
      <main className="container max-w-6xl py-10">
        <DomainViewer
          domain={domain}
          allDomains={ALL_DOMAINS}
          learningPaths={LEARNING_PATHS}
        />
      </main>
    </div>
  );
}
