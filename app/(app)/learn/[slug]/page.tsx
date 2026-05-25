import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DomainViewer from '@/components/domain-viewer';
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
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');
  const authUser = session.user;

  const domain = getDomainBySlug(params.slug);
  if (!domain) notFound();

  return (
    <div className="min-h-screen">
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
