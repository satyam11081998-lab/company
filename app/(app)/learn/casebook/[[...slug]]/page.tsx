import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ALL_PAGE_SLUGS, getPage } from '@/lib/casebook/content';
import { CasebookReader } from '@/components/casebook/casebook-reader';
import {
  absoluteUrl,
  extractPageDescription,
  casebookArticleJsonLd,
  casebookBreadcrumbJsonLd,
} from '@/lib/seo';

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

/** Per-page SEO: title, description, canonical, OG/Twitter card, article tags. */
export function generateMetadata({ params }: PageProps): Metadata {
  const slugPath = (params.slug ?? []).join('/');
  const page = slugPath ? getPage(slugPath) : null;
  if (!page) return { robots: { index: false, follow: false } };

  const description = extractPageDescription(page);
  const canonical = `/learn/casebook/${page.slug}`;
  const ogImage = `/og?title=${encodeURIComponent(page.title)}${
    page.subtitle ? `&subtitle=${encodeURIComponent(page.subtitle)}` : ''
  }&kind=${encodeURIComponent(page.kind)}`;

  return {
    title: page.title,
    description,
    keywords: page.meta?.tags,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: absoluteUrl(canonical),
      siteName: 'MECE',
      title: page.title,
      description,
      locale: 'en_IN',
      images: [{ url: ogImage, width: 1200, height: 630, alt: page.title }],
      ...(page.meta?.caseType ? { section: page.meta.caseType } : {}),
      ...(page.meta?.tags ? { tags: page.meta.tags } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description,
      images: [ogImage],
    },
  };
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

  const articleLd = casebookArticleJsonLd(page);
  const breadcrumbLd = casebookBreadcrumbJsonLd(page.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      <CasebookReader page={page} />
    </>
  );
}
