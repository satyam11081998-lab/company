/**
 * INDIA LANDING PHOTOGRAPHY — one list, never hard-coded URLs in components.
 *
 * Same source and rules as the US library (lib/us-market/assets.ts): free
 * Unsplash photos (https://unsplash.com/license — commercial use, no permission
 * or attribution needed; credits kept anyway), served from images.unsplash.com,
 * which resizes and picks WebP/AVIF from URL parameters, so next.config's
 * `images.unoptimized` stays untouched and nothing heavy lands in the repo.
 * Every entry was checked as FREE (not Unsplash+) and viewed at full size.
 *
 * Why each one is here:
 *   hero      — first light over a ridge with one person on it: the start of
 *               something. Pale sky on top so it melts into the cream page;
 *               the dark hills below sit behind the practice tile.
 *   boardroom — "Try a real case": an empty meeting room, the room you are
 *               practising for.
 *   estimate  — "Sharpen your estimation skills": printed charts, a notebook,
 *               a calculator — the desk of someone sizing a market.
 *   news      — "Be ready for discussions": a business section, folded.
 *   summit    — the closing band: Kangchenjunga at alpenglow, the navy of the
 *               foreground running straight into the brand navy.
 *
 * No photo shows a legible brand, logo or real person's face.
 */

import type { UsPhoto } from '@/lib/us-market/photo-url';

export type HomePhoto = UsPhoto;
export type HomePhotoId = 'hero' | 'boardroom' | 'estimate' | 'news' | 'summit';

const U = (username: string) => `https://unsplash.com/@${username}`;

export const HOME_PHOTOS: Record<HomePhotoId, HomePhoto> = {
  hero: {
    id: 'hero',
    category: 'brand',
    path: 'photo-1786897162869-b0ccd067affd',
    width: 6016,
    height: 4016,
    alt: 'A lone hiker on a grassy ridge at sunrise, mountains in the haze behind',
    // The hiker stands at ~34% across, ~52% down. Crops keep him in frame.
    focal: '34% 46%',
    color: '#f1d9bd',
    credit: { name: 'Marsumilae', url: U('marsumilae') },
  },
  boardroom: {
    id: 'boardroom',
    category: 'brand',
    path: 'photo-1517502884422-41eaead166d4',
    width: 4800,
    height: 3840,
    alt: 'An empty meeting room with a long wooden table, office chairs and a city view',
    focal: '62% 55%',
    color: '#d8d2c8',
    credit: { name: 'Dane Deaner', url: U('danedeaner') },
  },
  estimate: {
    id: 'estimate',
    category: 'brand',
    path: 'photo-1711097383282-28097ae16b1d',
    width: 3000,
    height: 2001,
    alt: 'A hand holding printed charts over a laptop, beside a notebook and a calculator',
    focal: '40% 40%',
    color: '#d9d9d9',
    credit: { name: 'Jakub Żerdzicki', url: U('jakubzerdzicki') },
  },
  news: {
    id: 'news',
    category: 'brand',
    path: 'photo-1504711434969-e33886168f5c',
    width: 4000,
    height: 2667,
    alt: 'A stack of folded newspapers, the business section on top',
    focal: '62% 45%',
    color: '#c9d6d9',
    credit: { name: 'AbsolutVision', url: U('codzilla_swiss') },
  },
  summit: {
    id: 'summit',
    category: 'brand',
    path: 'photo-1763300092626-e2734aa49415',
    width: 6000,
    height: 4000,
    alt: 'The Kangchenjunga range lit pink and gold at sunset above dark valleys',
    focal: '55% 50%',
    color: '#1d3346',
    credit: { name: 'Deep', url: U('deep_erudite') },
  },
};
