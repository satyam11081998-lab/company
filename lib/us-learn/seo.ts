import type { Metadata } from 'next';
import { absoluteUrl, ORG_ID, WEBSITE_ID, SITE_URL, EEAT_AUTHOR, faqPageJsonLd } from '@/lib/seo';
import { LEARN_BASE, LEARN_HUB, LEARN_PAGES, learnPath, readMinutes } from './index';
import type { LearnPage } from './types';

/**
 * Metadata + JSON-LD for the US Learn library. Everything here is derived
 * from the page records, so the structured data always matches the visible
 * page (Google's rule for structured data; also what AI crawlers quote).
 *
 * The Organization and WebSite nodes are referenced by @id only — they are
 * emitted once by the root layout (lib/seo.ts siteGraphJsonLd).
 */

/**
 * The one sentence that describes MECE-the-product on every Learn page.
 * Keep it identical everywhere: consistent entity statements are how search
 * and AI systems learn what a brand is and tell it apart from the principle.
 */
export const US_ENTITY_LINE =
  'MECE (mece.in) is an AI practice platform for case interviews and business problem solving, named after the consulting principle Mutually Exclusive, Collectively Exhaustive. It is not affiliated with McKinsey or any other consulting firm.';

export function ogImageFor(title: string, subtitle: string, kind: string): string {
  return `/og?title=${encodeURIComponent(title.slice(0, 110))}&subtitle=${encodeURIComponent(subtitle.slice(0, 150))}&kind=${kind}`;
}

/** hreflang map for a page with an India twin; undefined otherwise. */
export function learnLanguages(page: LearnPage): Record<string, string> | undefined {
  if (!page.indiaTwin) return undefined;
  const us = learnPath(page.slug);
  return { 'en-IN': page.indiaTwin, 'en-US': us, 'en-GB': us, 'en-IE': us, 'x-default': page.indiaTwin };
}

export function learnPageMetadata(page: LearnPage): Metadata {
  const path = learnPath(page.slug);
  const image = ogImageFor(page.nav, page.eyebrow === 'Role guides' ? 'Role guide' : 'MECE Learn', page.ogKind);
  const languages = learnLanguages(page);
  return {
    title: { absolute: page.metaTitle },
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: path, ...(languages ? { languages } : {}) },
    openGraph: {
      type: 'article',
      url: path,
      siteName: 'MECE',
      title: page.title,
      description: page.description,
      locale: 'en_US',
      publishedTime: page.published,
      modifiedTime: page.modified,
      images: [{ url: image, width: 1200, height: 630, alt: page.title }],
    },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: [image] },
  };
}

export function learnHubMetadata(): Metadata {
  const image = ogImageFor('MECE Learn', 'Case interviews, frameworks and role guides', 'toolkit');
  return {
    title: { absolute: LEARN_HUB.metaTitle },
    description: LEARN_HUB.description,
    keywords: [
      'case interview prep',
      'business frameworks',
      'consulting frameworks',
      'market sizing',
      'MECE',
      'business problem solving',
      'product manager case interview',
      'HR case interview',
      'sales case interview',
    ],
    alternates: { canonical: LEARN_BASE },
    openGraph: {
      type: 'website',
      url: LEARN_BASE,
      siteName: 'MECE',
      title: LEARN_HUB.title,
      description: LEARN_HUB.description,
      locale: 'en_US',
      images: [{ url: image, width: 1200, height: 630, alt: 'MECE Learn' }],
    },
    twitter: { card: 'summary_large_image', title: LEARN_HUB.title, description: LEARN_HUB.description, images: [image] },
  };
}

const RESOURCE_TYPE: Record<LearnPage['ogKind'], string> = {
  concept: 'Concept explainer',
  framework: 'Framework guide',
  toolkit: 'Interview guide',
};

function breadcrumb(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

/** The JSON-LD graph for one Learn page: Article/LearningResource + breadcrumbs, and the FAQ. */
export function learnPageJsonLd(page: LearnPage): object[] {
  const url = absoluteUrl(learnPath(page.slug));
  const article = {
    '@type': ['Article', 'LearningResource'],
    '@id': `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: page.title,
    description: page.description,
    abstract: page.answer,
    inLanguage: 'en-US',
    datePublished: page.published,
    dateModified: page.modified,
    isAccessibleForFree: true,
    learningResourceType: RESOURCE_TYPE[page.ogKind],
    educationalLevel: 'Undergraduate, graduate and professional',
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
      audienceType: 'Candidates for consulting, product, sales, marketing, operations, HR and finance roles',
    },
    timeRequired: `PT${readMinutes(page)}M`,
    keywords: page.keywords.join(', '),
    image: absoluteUrl(ogImageFor(page.nav, 'MECE Learn', page.ogKind)),
    author: { '@type': 'Organization', name: EEAT_AUTHOR, url: SITE_URL },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': `${absoluteUrl(LEARN_BASE)}#collection` },
    ...(page.slug === 'what-is-mece'
      ? {
          about: {
            '@type': 'DefinedTerm',
            name: 'MECE',
            alternateName: 'Mutually Exclusive, Collectively Exhaustive',
            description:
              'A rule for splitting a problem into parts that do not overlap (mutually exclusive) and together cover every possibility (collectively exhaustive), named by Barbara Minto at McKinsey.',
          },
        }
      : {}),
    ...(page.sources?.length ? { citation: page.sources.map((s) => ({ '@type': 'CreativeWork', name: s.label, url: s.url })) } : {}),
  };
  const crumbs = breadcrumb([
    { name: 'MECE', path: '/us' },
    { name: 'Learn', path: LEARN_BASE },
    { name: page.nav, path: learnPath(page.slug) },
  ]);
  return [
    { '@context': 'https://schema.org', '@graph': [article, crumbs] },
    faqPageJsonLd(page.faqs.map((f) => ({ question: f.q, answer: f.a }))),
  ];
}

/** CollectionPage + ItemList for the hub. */
export function learnHubJsonLd(faqs: { q: string; a: string }[]): object[] {
  const url = absoluteUrl(LEARN_BASE);
  return [
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${url}#collection`,
          url,
          name: LEARN_HUB.title,
          description: LEARN_HUB.description,
          inLanguage: 'en-US',
          datePublished: LEARN_HUB.published,
          dateModified: LEARN_HUB.modified,
          isPartOf: { '@id': WEBSITE_ID },
          publisher: { '@id': ORG_ID },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: LEARN_PAGES.length,
            itemListElement: LEARN_PAGES.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: p.title,
              url: absoluteUrl(learnPath(p.slug)),
            })),
          },
        },
        breadcrumb([
          { name: 'MECE', path: '/us' },
          { name: 'Learn', path: LEARN_BASE },
        ]),
      ],
    },
    faqPageJsonLd(faqs.map((f) => ({ question: f.q, answer: f.a }))),
  ];
}

/** Safe JSON for a <script type="application/ld+json"> (no "</script>" breakout). */
export function jsonLdString(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
