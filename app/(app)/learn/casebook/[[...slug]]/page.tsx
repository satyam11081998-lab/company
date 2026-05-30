import { notFound, redirect } from 'next/navigation';
import { ALL_PAGE_SLUGS, getPage } from '@/lib/casebook/content';
import { CasebookReader } from '@/components/casebook/casebook-reader';

export function generateStaticParams() {
  const params = ALL_PAGE_SLUGS.map((slug) => ({
    slug: slug.split('/'),
  }));
  
  // Add the root landing page slug
  params.push({ slug: [] });
  
  if (process.env.NODE_ENV !== 'production') {
    params.push({ slug: ['_test', 'new-blocks'] });
  }
  
  return params;
}

export const dynamicParams = process.env.NODE_ENV !== 'production';

interface PageProps {
  params: { slug?: string[] };
}

export default function CasebookRoute({ params }: PageProps) {
  // If no slug, redirect to the first page
  if (!params.slug || params.slug.length === 0) {
    redirect('/learn/casebook/getting-started/what-it-tests');
  }

  const slugPath = params.slug.join('/');
  const page = getPage(slugPath);

  if (!page) {
    notFound();
  }

  return <CasebookReader page={page} />;
}
