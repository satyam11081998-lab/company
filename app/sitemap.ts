import type { MetadataRoute } from 'next';

// Public, indexable routes only — the (app) routes are auth-gated.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mece.in';
  const routes = ['', '/login', '/signup', '/methodology', '/about', '/privacy', '/terms'];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.6,
  }));
}
