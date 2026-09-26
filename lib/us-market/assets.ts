/**
 * US PHOTOGRAPHY — one structured list, never hard-coded URLs in components.
 *
 * Source: Unsplash (https://unsplash.com/license). Free for commercial use, no
 * permission or attribution required; credits are kept here anyway. Every
 * entry was checked as a FREE photo, not "Unsplash+" (paid). Images are served
 * from Unsplash's own image CDN (images.unsplash.com, imgix), which resizes and
 * picks WebP/AVIF per browser from URL parameters — so there is no image
 * pipeline to run, nothing heavy in the repo, and next.config's
 * `images.unoptimized` stays untouched.
 *
 * To replace a photo: change `path` (the part after images.unsplash.com/),
 * `width`/`height` (the original's pixels, for the aspect ratio), the credit
 * and the alt text. To add a licensed photo from elsewhere, give it a full
 * `src` instead of `path`.
 *
 * Why these images exist (each must earn its place):
 *   hero      — sets the premium, late-night-preparation tone of the landing.
 *   band      — US context behind the one editorial statement on the landing.
 *   industry  — the "Today's practice" module shows the industry of the
 *               actual case (a retail case shows retail, etc.).
 */

export type UsPhotoId =
  | 'hero'
  | 'band'
  | 'skyline'
  | 'retail'
  | 'finance'
  | 'healthcare'
  | 'pharmacy'
  | 'technology'
  | 'travel'
  | 'restaurants'
  | 'industrial'
  | 'energy'
  | 'logistics'
  | 'fitness'
  | 'media'
  | 'education'
  | 'housing';

export interface UsPhoto {
  id: UsPhotoId;
  category: 'brand' | 'industry';
  /** Path on images.unsplash.com (preferred) … */
  path?: string;
  /** … or a full URL for a photo hosted elsewhere. */
  src?: string;
  width: number;
  height: number;
  alt: string;
  /** CSS object-position, e.g. '60% 40%'. Keeps the subject in frame when cropped. */
  focal?: string;
  /** Average colour, painted while the image loads (no white flash). */
  color: string;
  credit: { name: string; url: string };
}

const U = (username: string) => `https://unsplash.com/@${username}`;

export const US_PHOTOS: Record<UsPhotoId, UsPhoto> = {
  hero: {
    id: 'hero', category: 'brand', path: 'photo-1779444480588-77001f36871b', width: 3000, height: 2000,
    alt: 'A laptop on a wooden desk at night, lit by a desk lamp, with books and city lights behind',
    focal: '55% 50%', color: '#260c0c', credit: { name: 'Avtar Singh', url: U('avtar9w') },
  },
  band: {
    id: 'band', category: 'brand', path: 'photo-1514565131-fce0801e5785', width: 2532, height: 1537,
    alt: 'Lower Manhattan across the water at dusk',
    focal: '50% 55%', color: '#8cc0d9', credit: { name: 'Jonathan Roger', url: U('jonathanroger') },
  },
  skyline: {
    id: 'skyline', category: 'industry', path: 'photo-1518235506717-e1ed3306a89b', width: 5472, height: 3648,
    alt: 'The New York City skyline across the Hudson River at golden hour',
    focal: '50% 60%', color: '#c0c0c0', credit: { name: 'Mike Chavarri', url: U('mikechv') },
  },
  retail: {
    id: 'retail', category: 'industry', path: 'photo-1612819052787-618023ea329f', width: 4032, height: 3024,
    alt: 'Fresh produce on wooden shelves in a grocery store',
    focal: '50% 50%', color: '#262626', credit: { name: 'Marques Thomas', url: U('querysprout') },
  },
  finance: {
    id: 'finance', category: 'industry', path: 'photo-1483129804960-cb1964499894', width: 3600, height: 2400,
    alt: 'Wall Street street sign between Manhattan buildings, in black and white',
    focal: '45% 40%', color: '#f3f3f3', credit: { name: 'Chris Li', url: U('chrisli') },
  },
  healthcare: {
    id: 'healthcare', category: 'industry', path: 'photo-1517120026326-d87759a7b63b', width: 4896, height: 3264,
    alt: 'A clinician in blue scrubs walking down a hospital corridor',
    focal: '60% 50%', color: '#d9d9d9', credit: { name: 'Hush Naidoo Jade Photography', url: U('hush52') },
  },
  pharmacy: {
    id: 'pharmacy', category: 'industry', path: 'photo-1580281657527-47f249e8f4df', width: 3000, height: 2000,
    alt: 'A pharmacist reaching for a box of medication on a shelf',
    focal: '55% 45%', color: '#d9c0a6', credit: { name: 'National Cancer Institute', url: U('nci') },
  },
  technology: {
    id: 'technology', category: 'industry', path: 'photo-1580894908361-967195033215', width: 7952, height: 5304,
    alt: 'An engineer working at two monitors in an open-plan office',
    focal: '60% 45%', color: '#c0c0c0', credit: { name: 'ThisisEngineering', url: U('thisisengineering') },
  },
  travel: {
    id: 'travel', category: 'industry', path: 'photo-1758531491352-7887c1fe45b3', width: 5760, height: 3240,
    alt: 'An airliner at the gate, seen through airport terminal windows',
    focal: '50% 50%', color: '#0c2626', credit: { name: 'D YQ', url: U('18180604860d') },
  },
  restaurants: {
    id: 'restaurants', category: 'industry', path: 'photo-1622021142947-da7dedc7c39a', width: 5468, height: 3076,
    alt: 'A chef preparing vegetables in a restaurant kitchen',
    focal: '45% 45%', color: '#262626', credit: { name: 'Pylyp Sukhenko', url: U('novokayn') },
  },
  industrial: {
    id: 'industrial', category: 'industry', path: 'photo-1567789884554-0b844b597180', width: 6000, height: 4000,
    alt: 'Robotic arms assembling a car body on a factory line',
    focal: '50% 50%', color: '#404040', credit: { name: 'Lenny Kuhne', url: U('lennykuhne') },
  },
  energy: {
    id: 'energy', category: 'industry', path: 'photo-1593941707874-ef25b8b4a92b', width: 6048, height: 4024,
    alt: 'An electric vehicle charging cable plugged into a car',
    focal: '45% 50%', color: '#404040', credit: { name: 'CHUTTERSNAP', url: U('chuttersnap') },
  },
  logistics: {
    id: 'logistics', category: 'industry', path: 'photo-1644079446600-219068676743', width: 6000, height: 4000,
    alt: 'A long warehouse aisle with shelves of boxed inventory',
    focal: '50% 50%', color: '#738ca6', credit: { name: 'Lance Chang', url: U('carmendis') },
  },
  fitness: {
    id: 'fitness', category: 'industry', path: 'photo-1632077804406-188472f1a810', width: 6720, height: 4480,
    alt: 'Rows of kettlebells on a gym floor',
    focal: '50% 55%', color: '#404040', credit: { name: 'Heidi Erickson', url: U('herickson7') },
  },
  media: {
    id: 'media', category: 'industry', path: 'photo-1632187981988-40f3cbaeef5e', width: 6720, height: 4480,
    alt: 'A film crew with cameras and lights on a production set',
    focal: '55% 45%', color: '#262626', credit: { name: 'Jakob Owens', url: U('jakobowens1') },
  },
  education: {
    id: 'education', category: 'industry', path: 'photo-1776112645860-189997694f49', width: 6000, height: 4000,
    alt: 'A university library aisle between tall bookshelves',
    focal: '50% 50%', color: '#40260c', credit: { name: 'Will Grobbelaar', url: U('wgmusic') },
  },
  housing: {
    id: 'housing', category: 'industry', path: 'photo-1785301839387-68227c0b7ae9', width: 3000, height: 1688,
    alt: 'Overhead view of a suburban road lined with houses and trees',
    focal: '50% 50%', color: '#737340', credit: { name: 'Chris Grant', url: U('christheisland') },
  },
};

const CDN = 'https://images.unsplash.com/';

/** One sized URL. `w` in CSS pixels × DPR is the caller's job (see srcSet). */
export function photoUrl(photo: UsPhoto, w: number, opts: { h?: number; q?: number } = {}): string {
  if (photo.src) return photo.src;
  const q = opts.q ?? 72;
  const params = new URLSearchParams({ auto: 'format', fit: 'crop', w: String(Math.round(w)), q: String(q) });
  if (opts.h) params.set('h', String(Math.round(opts.h)));
  return `${CDN}${photo.path}?${params.toString()}`;
}

/** A width-descriptor srcset. The CDN crops to `ratio` (w/h) when given. */
export function photoSrcSet(photo: UsPhoto, widths: number[], ratio?: number): string | undefined {
  if (photo.src) return undefined;
  return widths
    .map((w) => `${photoUrl(photo, w, ratio ? { h: w / ratio } : {})} ${w}w`)
    .join(', ');
}

/* ── Which photo illustrates a case ─────────────────────────────────────────
   Industry first (US bank rows carry interview_meta.industry), then keywords
   in the title for generated cases, then the case type, then the skyline. */

const INDUSTRY_RULES: [RegExp, UsPhotoId][] = [
  [/e-?commerce logistic|fulfil+ment|\blast[- ]mile/i, 'logistics'],
  [/pharma(cy|ceutical)|\bdrugs?\b|medic(ine|ation)/i, 'pharmacy'],
  [/health|hospital|clinic|medical|insur(ance|er)\b.*health|patient/i, 'healthcare'],
  [/bank|financ|insur|lend|credit|payment|asset management|wealth|fintech|private equity/i, 'finance'],
  [/software|\bsaas\b|\btech|telecom|\bcloud\b|\bdata\b|\bapps?\b|platform|\bai\b|semiconductor|wireless/i, 'technology'],
  [/airline|airport|travel|hotel|leisure|cruise|transportation|rail/i, 'travel'],
  [/restaurant|food|beverage|coffee|bakery|dining|quick[- ]service|grocery.*meal/i, 'restaurants'],
  [/grocer|retail|store|apparel|e-?commerce|consumer (goods|packaged)|cpg|fashion|mall/i, 'retail'],
  [/\bevs?\b|electric vehicle|energy|\butilit|solar|\bwind\b|\boil\b|\bgas\b|\bpower\b/i, 'energy'],
  [/\bauto|\bcars?\b|vehicle|manufactur|industrial|factory|\bplants?\b|\bsteel\b|chemical/i, 'industrial'],
  [/logistic|warehouse|shipping|freight|delivery|supply chain|mobility|scooter|fleet/i, 'logistics'],
  [/fitness|gym|wellness|sport/i, 'fitness'],
  [/media|stream|entertainment|film|music|studio|publishing|gaming/i, 'media'],
  [/education|university|college|school|edtech|campus/i, 'education'],
  [/\bhomes?\b|real estate|housing|construction|property/i, 'housing'],
];

const TYPE_FALLBACK: Record<string, UsPhotoId> = {
  profitability: 'skyline',
  'market entry': 'skyline',
  growth: 'skyline',
  pricing: 'retail',
  'm&a': 'finance',
  operations: 'logistics',
  'cost reduction': 'industrial',
  'go to market': 'retail',
  'competitive strategy': 'skyline',
};

export function photoForCase(input: { industry?: string | null; title?: string | null; type?: string | null }): UsPhoto {
  for (const text of [input.industry, input.title]) {
    if (!text) continue;
    for (const [re, id] of INDUSTRY_RULES) if (re.test(text)) return US_PHOTOS[id];
  }
  const byType = input.type ? TYPE_FALLBACK[input.type] : undefined;
  return US_PHOTOS[byType ?? 'skyline'];
}
