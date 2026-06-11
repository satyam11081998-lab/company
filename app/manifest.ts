import type { MetadataRoute } from 'next';
import { SITE_DESC } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MECE — Placement interview prep',
    short_name: 'MECE',
    description: SITE_DESC,
    start_url: '/',
    display: 'standalone',
    background_color: '#0F1C33',
    theme_color: '#0F1C33',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
