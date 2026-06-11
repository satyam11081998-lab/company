import type { MetadataRoute } from 'next';
import { CASEBOOK_TREE } from '@/lib/casebook/tree';
import type { NavNode } from '@/lib/casebook/types';
import { SITE_URL } from '@/lib/seo';

/**
 * Public, indexable routes only.
 * - /learn/casebook/** is public (guest chrome in the (app) layout).
 * - /learn/<domain> pages self-redirect guests to /login, so they are
 *   deliberately NOT listed — submitting redirecting URLs erodes trust
 *   with crawlers.
 * - The two live framework pages are public and content-rich, so they are.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'weekly'
  ) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  const core = [
    entry('', 1, 'weekly'),
    entry('/methodology', 0.8, 'monthly'),
    entry('/about', 0.6, 'monthly'),
    entry('/signup', 0.7, 'monthly'),
    entry('/login', 0.4, 'monthly'),
    entry('/privacy', 0.2, 'yearly'),
    entry('/terms', 0.2, 'yearly'),
    entry('/refund', 0.2, 'yearly'),
  ];

  const casebookRoutes: MetadataRoute.Sitemap = [];
  const collectCasebookRoutes = (nodes: NavNode[]) => {
    for (const node of nodes) {
      if (node.kind === 'page' && node.slug) {
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

  return [...core, ...casebookRoutes, ...liveFrameworks];
}
