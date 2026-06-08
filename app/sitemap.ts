import type { MetadataRoute } from 'next';
import { CASEBOOK_TREE } from '@/lib/casebook/tree';
import { ALL_DOMAINS } from '@/lib/curriculum';
import type { NavNode } from '@/lib/casebook/types';

// Public, indexable routes only — the (app) routes are auth-gated.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mece.in';
  const routes = ['', '/login', '/signup', '/methodology', '/about', '/privacy', '/terms', '/refund'];
  
  const casebookRoutes: string[] = [];
  const collectCasebookRoutes = (nodes: NavNode[]) => {
    for (const node of nodes) {
      if (node.kind === 'page' && node.slug) {
        casebookRoutes.push(`/learn/casebook/${node.slug}`);
      }
      if (node.children) {
        collectCasebookRoutes(node.children);
      }
    }
  };
  collectCasebookRoutes(CASEBOOK_TREE);
  
  const learnRoutes = ALL_DOMAINS.map(d => `/learn/${d.slug}`);
  const allRoutes = [...routes, ...casebookRoutes, ...learnRoutes];
  
  return allRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.6,
  }));
}
