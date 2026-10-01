/**
 * INDIA DASHBOARD PHOTOGRAPHY (2026-09-30) — the photo beside today's focus
 * case, today's GD brief and today's guesstimate.
 *
 * Same idea as the US dashboard (lib/us-market/assets.ts → photoForCase): show
 * what the item is ABOUT — a chai guesstimate shows chai, a telecom case shows
 * a tower, an airline brief shows a cabin. Picked by keyword, deterministically
 * per item, so an item always shows the same photo and the picture changes
 * whenever today's items do.
 *
 * Sources, all free Unsplash photos served from images.unsplash.com (see the
 * licence note in lib/us-market/assets.ts):
 *   - IN_PHOTOS below: India-specific scenes (an auto-rickshaw, a Mumbai
 *     skyline, an Indian Railways locomotive, a tea estate …), each checked as
 *     FREE (not Unsplash+) and viewed before it was added;
 *   - the landing library (lib/home/photos.ts): chai, a QSR counter,
 *     newspapers, a planning desk, a whiteboard;
 *   - the US topic library, only its location-neutral photos (a pharmacy
 *     shelf, solar panels, a data centre …). Nothing that reads as America —
 *     no yellow cabs, school buses, gridiron or US skylines — is used here.
 *
 * Server-only: the rules and the library stay out of the browser bundle. The
 * dashboard page picks the photos and hands the three photo objects down.
 */

import { US_PHOTOS, US_TOPIC_PHOTOS, stableHash, type UsPhotoId, type UsTopicId } from '@/lib/us-market/assets';
import { HOME_PHOTOS, type HomePhotoId } from '@/lib/home/photos';
import type { UsPhoto } from '@/lib/us-market/photo-url';

export type DashPhoto = UsPhoto;

const U = (username: string) => `https://unsplash.com/@${username}`;

function P(id: string, path: string, width: number, height: number, color: string, name: string, username: string, alt: string, focal?: string): UsPhoto {
  return { id, category: 'topic', path, width, height, color, alt, focal, credit: { name, url: U(username) } };
}

/** India-specific scenes. */
export const IN_PHOTOS = {
  rickshaw: P('rickshaw', 'photo-1626149637281-4e227308da18', 2970, 3712, '#8ca6a6', 'Prabhav Kashyap Godavarthy', 'prabhavkashyapg', 'A yellow and black auto-rickshaw on a city road', '50% 58%'),
  'mumbai-towers': P('mumbai-towers', 'photo-1710582308582-55cc0c461c4e', 7486, 4210, '#a6d9f3', 'Drone Master', 'dronemaster', 'High-rise towers of Mumbai against a clear evening sky', '50% 55%'),
  'marine-drive': P('marine-drive', 'photo-1666843527155-14ec5f016802', 4032, 3024, '#595973', 'Nishith Parikh', 'nishithparikh90', 'The Mumbai waterfront lit up at dusk', '50% 55%'),
  train: P('train', 'photo-1592844002373-a55ecd7af140', 6000, 4000, '#0c2640', 'Anirudh', 'underroot', 'An Indian Railways locomotive pulling through a freight yard', '50% 55%'),
  cricket: P('cricket', 'photo-1675693303492-9a5bc898bf94', 4624, 3472, '#260c0c', 'Aditya Chandegara', 'aditya__11', 'A floodlit cricket stadium under a red evening sky', '50% 62%'),
  spices: P('spices', 'photo-1775433205046-86e060feff06', 5184, 3888, '#d9d9d9', 'Caitlin James', 'caitlin_j', 'Sacks of turmeric and chilli powder at a spice stall', '40% 65%'),
  'market-stall': P('market-stall', 'photo-1772460759097-ad68b3232a4f', 3000, 3498, '#402626', 'Aditya Sethia', 'aditya_sethia_97', 'A busy market stall stocked with spices and packaged goods', '50% 55%'),
  // Portrait; the focal point sits low so the crop keeps the counter and
  // shelves and leaves out the shop's name board.
  kirana: P('kirana', 'photo-1739066598279-1297113f5c6a', 3356, 5635, '#f3f3d9', 'Zoshua Colah', 'zoshuacolah', 'A neighbourhood general store with shelves of daily goods', '50% 75%'),
  scooters: P('scooters', 'photo-1711358876889-ed28e5594e2f', 4592, 3448, '#262626', 'Lukas Kienzler', 'beamehr', 'Scooters and auto-rickshaws in city traffic', '50% 55%'),
  'tea-estate': P('tea-estate', 'photo-1491497895121-1334fc14d8c9', 4824, 3216, '#f3f3f3', 'Vivek Kumar', 'qriusv', 'Misty tea gardens on rolling hills in Munnar, Kerala', '50% 55%'),
  gold: P('gold', 'photo-1640183298005-3a4497cc6a37', 5556, 3843, '#594040', 'Shruti Singh', 'halyzia', 'A gold necklace and earrings in a jeweller\u2019s display case', '45% 40%'),
  'street-food': P('street-food', 'photo-1621334721541-370a13974de8', 3016, 4528, '#260c0c', 'Pooja Roy', 'roy_nishi', 'Fresh jalebis piled high at a sweet stall', '50% 72%'),
} satisfies Record<string, UsPhoto>;

type InId = keyof typeof IN_PHOTOS;
type Key = InId | `us:${UsTopicId}` | `usi:${UsPhotoId}` | `home:${HomePhotoId}`;

function photo(key: Key): UsPhoto {
  if (key.startsWith('us:')) {
    const k = key.slice(3) as UsTopicId;
    return US_TOPIC_PHOTOS[k];
  }
  if (key.startsWith('usi:')) return US_PHOTOS[key.slice(4) as UsPhotoId];
  if (key.startsWith('home:')) return HOME_PHOTOS[key.slice(5) as HomePhotoId];
  return IN_PHOTOS[key as InId];
}

/* ── What an item is about → which photos may show it ─────────────────────
   Specific first. Titles are Indian business cases, guesstimates and news
   headlines ("Estimate the number of cups of chai sold in Pune in a day",
   "Why is a D2C snack brand's margin falling?"). */
const RULES: [RegExp, Key[]][] = [
  [/tea (estates?|gardens?|plantations?|exports?|industry)|darjeeling|assam tea/i, ['tea-estate']],
  [/\bchai\b|\btea\b/i, ['home:chai']],
  [/coffee|caf[eé]\b|espresso/i, ['us:coffee-shop', 'us:coffee-cup']],
  [/rickshaw|ride[- ]?hail|\bola\b|\buber\b|rapido|cab aggregator|\bcabs?\b|\btaxis?\b/i, ['rickshaw', 'scooters']],
  [/two[- ]wheeler|scooter|motorcycle|\bbikes?\b/i, ['scooters']],
  [/electric vehicle|\bevs?\b|charging|battery swap/i, ['us:ev']],
  [/railway|\btrains?\b|irctc|vande bharat|metro (rail|stations?|lines?)|(delhi|mumbai|namma|kolkata|chennai) metro/i, ['train']],
  [/cricket|\bipl\b|stadium/i, ['cricket']],
  [/jewell?ery|\bgold\b|diamond/i, ['gold']],
  [/kirana|general store|mom[- ]and[- ]pop/i, ['kirana', 'market-stall']],
  [/quick[- ]commerce|q-?commerce|10[- ]minute|dark stores?|instamart|zepto|blinkit/i, ['us:boxes', 'us:food-delivery']],
  [/food[- ]delivery|swiggy|zomato|tiffin|cloud[- ]kitchen|takeaway/i, ['us:food-delivery']],
  [/street food|samosa|jalebi|vada pav|pani ?puri|dhaba|sweet shop|mithai|namkeen/i, ['street-food']],
  [/spice|masala|fmcg|packaged food|snacks?\b|biscuit/i, ['spices', 'market-stall']],
  [/\bqsr\b|quick[- ]service|burger|fast food/i, ['home:qsr', 'us:burger']],
  [/pizza/i, ['us:pizza']],
  [/bakery|bread|\bcakes?\b/i, ['us:bakery']],
  [/restaurant|\bdine\b|dining|diner/i, ['us:restaurant-counter', 'usi:restaurants']],
  [/dental|dentist/i, ['us:dental']],
  [/pharmac(y|ies|ist)|chemist/i, ['usi:pharmacy', 'us:pharma']],
  [/pharma|medicine|\bdrugs?\b|generic/i, ['us:pharma', 'usi:pharmacy']],
  [/hospital|healthcare|clinic|diagnostic|patient|doctor|surg/i, ['us:operating-room', 'us:hospital-bed', 'usi:healthcare']],
  [/insur/i, ['us:house-keys', 'home:boardroom']],
  [/\brbi\b|repo rate|inflation|monetary policy|interest rates?/i, ['us:analytics-3', 'us:bank-building']],
  [/\bupi\b|payments?\b|fintech|wallet|paytm|phonepe|credit card|\bpos\b/i, ['us:pos', 'us:mobile-bank-2']],
  [/\batms?\b/i, ['us:atm']],
  [/\bnbfc|\bbanks?\b|banking|lend|\bloans?\b|microfinance|deposit/i, ['us:bank-building', 'us:atm', 'us:analytics-3']],
  [/telecom|\b5g\b|\bjio\b|airtel|broadband|towers?\b/i, ['us:cell-tower']],
  [/smartphone|mobile phone|handset/i, ['us:smartphone']],
  [/cyber|security breach/i, ['us:cyber', 'us:cyber-2']],
  [/saas|software|\bit services|\bai\b|\bcloud\b(?![- ]kitchen)|data cent|semiconductor/i, ['us:data-center', 'us:analytics']],
  [/solar|renewable|electricity|discom|power (plant|sector|utility)|energy/i, ['us:solar', 'us:solar-2']],
  [/cement|construction|real estate|housing|infrastructure|builder|flats?\b/i, ['us:construction', 'us:construction-2', 'mumbai-towers']],
  [/steel|metals?\b|mining|aluminium/i, ['us:steel', 'us:steel-2']],
  [/paints?\b/i, ['us:paint']],
  [/airline|aviation|flights?\b|indigo|air india/i, ['us:cabin', 'us:airliner']],
  [/airport/i, ['us:airport']],
  [/logistic|warehouse|courier|shipping|supply chain|freight|trucks?\b/i, ['usi:logistics', 'us:trucking']],
  [/e-?commerce|online retail|marketplace|flipkart|amazon|\bd2c\b/i, ['us:boxes', 'usi:logistics']],
  [/grocer|supermarket|\bretail|\bmalls?\b|\bstores?\b/i, ['usi:retail', 'us:mall-2']],
  [/edtech|coaching|education|schools?\b|college|universit|students?\b/i, ['us:campus', 'usi:education']],
  [/cinema|movie|\bfilms?\b|\bott\b|stream|multiplex/i, ['us:cinema', 'us:streaming-2']],
  [/\bgyms?\b|fitness|yoga|wellness/i, ['usi:fitness', 'us:pilates']],
  [/wedding/i, ['us:wedding', 'us:wedding-2']],
  [/hotel|tourism|travel|hospitality|homestay/i, ['us:rental', 'us:cabin']],
  [/dairy|\bmilk\b|cheese|paneer/i, ['us:cheese', 'us:cheese-2']],
  [/beverage|soft drinks?|\bcola\b|juice|bottled water/i, ['us:soda', 'us:sparkling']],
  [/\bfuel\b|petrol|diesel|oil (and|&) gas|refiner/i, ['us:gas-station']],
  [/automobile|automotive|auto sector|\bcars?\b|dealership|passenger vehicle/i, ['us:dealership']],
  [/salon|barber|haircut/i, ['us:barbershop', 'us:barbershop-2']],
  [/mumbai|delhi|bengaluru|bangalore|hyderabad|chennai|kolkata|pune|\bcity\b|urban/i, ['mumbai-towers', 'scooters', 'marine-drive']],
];

/** Photos for an item nothing above matched, by case type. */
const BY_TYPE: Record<string, Key[]> = {
  profitability: ['us:analytics-3', 'home:estimate'],
  growth: ['us:analytics-2', 'mumbai-towers'],
  market_sizing: ['home:whiteboard', 'home:estimate'],
  'market entry': ['mumbai-towers', 'marine-drive'],
  pricing: ['us:pos', 'us:pos-2'],
  'm&a': ['home:boardroom'],
  operations: ['usi:logistics', 'usi:industrial'],
  guesstimate: ['home:whiteboard', 'home:estimate', 'marine-drive'],
};

const pick = <T,>(xs: T[], seed: string): T => xs[stableHash(seed) % xs.length];

function choose(keys: Key[], seed: string, avoid: string[]): UsPhoto {
  const open = keys.filter((k) => !avoid.includes(photo(k).id));
  return photo(pick(open.length ? open : keys, seed));
}

/**
 * The photo for a case or guesstimate. `avoid` keeps the three cards from
 * showing the same picture on a day when two items share a topic.
 */
export function dashPhotoForItem(
  input: { title?: string | null; cluster?: string | null; type?: string | null; seed?: string | null },
  avoid: string[] = [],
): DashPhoto {
  const seed = input.seed || input.title || input.type || 'mece';
  for (const text of [input.title, input.cluster]) {
    if (!text) continue;
    for (const [re, keys] of RULES) if (re.test(text)) return choose(keys, seed, avoid);
  }
  const type = (input.type || '').toLowerCase();
  const cluster = (input.cluster || '').toLowerCase();
  const byType = BY_TYPE[type] ?? Object.entries(BY_TYPE).find(([k]) => cluster.includes(k.replace('_', ' ')))?.[1] ?? BY_TYPE.profitability;
  return choose(byType, seed, avoid);
}

/** The photo for today's GD brief: its headline, then its keywords and category, else newspapers. */
export function dashPhotoForBrief(
  brief: { id?: string | null; title?: string | null; category?: string | null; keywords?: string[] | null } | null | undefined,
  avoid: string[] = [],
): DashPhoto {
  const seed = brief?.id || brief?.title || 'brief';
  const texts = [brief?.title, (brief?.keywords ?? []).join(' '), brief?.category];
  for (const text of texts) {
    if (!text) continue;
    for (const [re, keys] of RULES) if (re.test(text)) return choose(keys, seed, avoid);
  }
  return choose(['home:news', 'us:analytics-3'], seed, avoid);
}
