import type { MetadataRoute } from 'next';
import { CASEBOOK_TREE } from '@/lib/casebook/tree';
import type { NavNode } from '@/lib/casebook/types';
import { GLOSSARY_TERMS } from '@/lib/glossary/terms';
import { SITE_URL, isCanonicalisedAway, HREFLANG_HOME, HREFLANG_PRICING } from '@/lib/seo';
import { getIndexableDecks } from '@/lib/decks';
import { getPublishedSeoPages } from '@/lib/seo-pages';
import { LEARN_BASE, LEARN_HUB, LEARN_PAGES, learnPath } from '@/lib/us-learn';
import { learnLanguages } from '@/lib/us-learn/seo';

/**
 * Public, indexable routes only.
 * - /learn/casebook/** is public (guest chrome in the (app) layout).
 * - /learn/<domain> pages self-redirect guests to /login, so they are
 *   deliberately NOT listed — submitting redirecting URLs erodes trust
 *   with crawlers.
 * - The two live framework pages are public and content-rich, so they are.
 * - All 75 glossary term pages are individually listed.
 * - Public competition deck pages (/decks/<slug>) are listed with 0.8 priority.
 * - Casebook pages that canonicalise elsewhere are excluded via
 *   isCanonicalisedAway(). A canonicalised page must not appear in the sitemap:
 *   submitting a URL you have told Google not to index is a contradictory
 *   signal and Search Console flags it as "Alternate page with proper
 *   canonical tag".
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // lastmod is emitted ONLY when a real modification date is known (decks,
  // insights, the US Learn library). It used to default to the build time for
  // every URL, which tells Google every page changes on every deploy; Google
  // then ignores lastmod for the whole sitemap, including the accurate ones.
  // Omitting an unknown date is the documented alternative (2026-09-27).
  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'weekly',
    lastModified?: Date
  ) => ({
    url: `${SITE_URL}${path}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
  });

  const withAlt = (path: string, priority: number, languages?: Record<string, string>) => ({
    ...entry(path, priority, 'weekly'),
    ...(languages
      ? { alternates: { languages: Object.fromEntries(Object.entries(languages).map(([k, v]) => [k, `${SITE_URL}${v === '/' ? '' : v}`])) } }
      : {}),
  });
  const mecePage = LEARN_PAGES.find((p) => p.indiaTwin === '/learn/mece-framework');
  const meceLanguages = mecePage ? learnLanguages(mecePage) : undefined;

  const core = [
    withAlt('', 1, HREFLANG_HOME),
    // The definitive MECE reference. Highest-priority non-home URL: it is the
    // page that has to rank for our own brand term and for the concept.
    // hreflang-paired with its US edition (/us/learn/what-is-mece) — both
    // sides of the pair are declared here, as sitemap hreflang requires.
    { ...withAlt('/learn/mece-framework', 0.9, meceLanguages), changeFrequency: 'monthly' as const },
    entry('/methodology', 0.8, 'monthly'),
    entry('/about', 0.6, 'monthly'),
    { ...withAlt('/pricing', 0.7, HREFLANG_PRICING), changeFrequency: 'monthly' as const },
    entry('/testimonials', 0.6, 'weekly'),
    entry('/glossary', 0.6, 'weekly'),
    entry('/privacy', 0.2, 'yearly'),
    entry('/terms', 0.2, 'yearly'),
    entry('/refund', 0.2, 'yearly'),
  ];

  /* Glossary — 75 individual term pages */
  const glossaryEntries = GLOSSARY_TERMS.map((t) =>
    entry(`/glossary/${t.slug}`, 0.5, 'monthly')
  );

  const casebookRoutes: MetadataRoute.Sitemap = [];
  const collectCasebookRoutes = (nodes: NavNode[]) => {
    for (const node of nodes) {
      if (node.kind === 'page' && node.slug && !isCanonicalisedAway(node.slug)) {
        casebookRoutes.push(entry(`/learn/casebook/${node.slug}`, 0.7, 'monthly'));
      }
      if (node.children) {
        collectCasebookRoutes(node.children);
      }
    }
  };
  collectCasebookRoutes(CASEBOOK_TREE);

  const liveFrameworks = [
    entry('/learn/growth/growth-strategy', 0.7, 'monthly'),
    entry('/learn/market/market-entry', 0.7, 'monthly'),
  ];

  /* Indexable public deck pages */
  let deckEntries: MetadataRoute.Sitemap = [];
  try {
    const decks = await getIndexableDecks();
    deckEntries = decks.map((d) =>
      entry(
        `/decks/${d.slug}`,
        0.8,
        'monthly',
        d.pages_rendered_at ? new Date(d.pages_rendered_at) : (d.created_at ? new Date(d.created_at) : undefined)
      )
    );
  } catch (err) {
    console.error('Failed to load decks for sitemap:', err);
  }

  /* Growth-Agent SEO pages (/insights/**) — published only */
  let insightEntries: MetadataRoute.Sitemap = [];
  try {
    const pages = await getPublishedSeoPages();
    if (pages.length > 0) {
      insightEntries.push(entry('/insights', 0.7, 'daily'));
      insightEntries.push(
        ...pages.map((p) =>
          entry(
            `/insights/${p.slug}`,
            0.7,
            'monthly',
            p.published_at ? new Date(p.published_at) : (p.updated_at ? new Date(p.updated_at) : undefined),
          ),
        ),
      );
    }
  } catch (err) {
    console.error('Failed to load SEO pages for sitemap:', err);
  }

  /* International (US + Europe) site — 2026-09-25. hreflang alternates are
     declared both here and in each page's metadata, so crawlers see the
     India ⇄ US pairing from either direction. */
  const intlEntries: MetadataRoute.Sitemap = [
    withAlt('/us', 0.9, HREFLANG_HOME),
    withAlt('/us/pricing', 0.7, HREFLANG_PRICING),
    withAlt('/us/case-interview-examples', 0.8),
    withAlt('/us/market-sizing-questions', 0.8),
  ];

  /* US Learn library — 2026-09-27. Real publish/modified dates (not the build
     time), so lastmod stays a signal crawlers can trust. The one page with an
     India twin (what-is-mece ⇄ /learn/mece-framework) carries hreflang. */
  const learnEntries: MetadataRoute.Sitemap = [
    entry(LEARN_BASE, 0.8, 'weekly', new Date(`${LEARN_HUB.modified}T00:00:00Z`)),
    ...LEARN_PAGES.map((p) => {
      const languages = learnLanguages(p);
      return {
        ...entry(learnPath(p.slug), 0.7, 'monthly', new Date(`${p.modified}T00:00:00Z`)),
        ...(languages
          ? { alternates: { languages: Object.fromEntries(Object.entries(languages).map(([k, v]) => [k, `${SITE_URL}${v}`])) } }
          : {}),
      };
    }),
  ];

  return [...core, ...intlEntries, ...learnEntries, ...glossaryEntries, ...casebookRoutes, ...liveFrameworks, ...deckEntries, ...insightEntries];
}

