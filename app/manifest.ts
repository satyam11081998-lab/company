import type { MetadataRoute } from 'next';
import { SITE_DESC } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MECE — Placement interview prep',
    short_name: 'MECE',
    description: SITE_DESC,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0F1C33',
    theme_color: '#0F1C33',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
