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
 *   industry  — broad fallbacks when a case has no closer topic photo.
 *   topic     — (v3) the dashboard shows a photo of what the case or market
 *               sizing question is actually ABOUT: a solar case shows solar
 *               panels, a pizza estimate shows a pizza. Picked by keyword,
 *               deterministically per item, so the same item always shows the
 *               same photo and today's items change the picture every day.
 *   skyline   — (v3) the dashboard's greeting banner; one US city per day.
 *
 * Photos showing a legible brand name or logo (a TV service's wordmark, a
 * car maker's badge, a team's end zone, a ball maker's logo) were rejected
 * when the library was assembled.
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

export type { UsPhoto } from './photo-url';
export { photoUrl, photoSrcSet } from './photo-url';
import type { UsPhoto } from './photo-url';

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

/* ── Topic library (v3) ──────────────────────────────────────────────────
   Every entry is a free Unsplash photo (served from images.unsplash.com, which
   never serves Unsplash+ images), checked to load and checked by eye against
   its topic. */

function P(
  path: string,
  width: number,
  height: number,
  color: string,
  name: string,
  username: string,
  alt: string,
  focal?: string,
  id?: string,
): UsPhoto {
  return { id: id ?? path, category: id?.startsWith('sky-') ? 'skyline' : 'topic', path, width, height, color, alt, focal, credit: { name, url: U(username) } };
}

const TOPIC_PHOTOS = {
  'coffee-shop': P('photo-1469631423273-6995642a6a40', 5184, 3333, '#262626', 'Matt Hoffman', '__matthoffman__', 'A coffee shop counter lined with espresso machines'),
  'coffee-cup': P('photo-1619067762055-51ffaa8ec913', 3246, 2160, '#d9d9d9', 'Marco Bicca', 'mbicca', 'A takeaway coffee cup on a wooden table'),
  'hvac': P('photo-1776653244534-69d59028af6c', 3531, 2354, '#737340', 'Seyjoon Park', 'seyjoon', 'Rooftop ventilation and air-conditioning units on a metal roof', '50% 50%'),
  'streaming-2': P('photo-1593784991188-c899ca07263b', 6240, 4160, '#262626', 'Jonas Leupe', 'jonasleupe', 'A hand holding a TV remote control'),
  'mobile-bank': P('photo-1681826291722-70bd7e9e6fc3', 7680, 4320, '#735940', 'Atlantic Money', 'atlanticmoney', 'A woman holding a phone'),
  'mobile-bank-2': P('photo-1616077168712-fc6c788db4af', 3800, 2533, '#a68c73', 'Tech Daily', 'techdailyca', 'A hand holding a smartphone'),
  'cyber': P('photo-1614064641938-3bbee52942c7', 7952, 5304, '#260c0c', 'FlyD', 'flyd2069', 'A red padlock on a black computer keyboard'),
  'cyber-2': P('photo-1614064548237-096f735f344f', 7952, 5304, '#260c0c', 'FlyD', 'flyd2069', 'A padlock on a laptop with light trails'),
  'vet': P('photo-1770836037793-95bdbf190f71', 4160, 6240, '#d9d9d9', 'Alexander Mass', 'alexandermassph', 'A veterinarian examining a dachshund', '50% 35%'),
  'dog-rest': P('photo-1614509689507-5ededae510a2', 6000, 4000, '#d9d9d9', 'cal gao', 'ginnta', 'A brown dog lying on a blue blanket'),
  'parking': P('photo-1548343361-02248be15911', 7952, 5304, '#c0c0c0', 'Claudio Schwarz', 'purzlbaum', 'An empty parking garage with concrete pillars'),
  'parking-2': P('photo-1637970067784-927e66e07e36', 5304, 7952, '#262626', 'Josh McCausland', 'joshmccausland', 'An empty parking garage at night', '50% 60%'),
  'cell-tower': P('photo-1602823284936-463177448097', 4827, 2715, '#0c4059', 'Kabiur Rahman Riyad', 'riiyad', 'A telecom tower under a blue sky'),
  'trucking': P('photo-1766785368863-f2188a8c8b32', 6000, 4000, '#0c2626', 'Bhargav Panchal', 'bhargavpanchal1986', 'Two semi-trucks driving on a highway'),
  'dental': P('photo-1629909613654-28e377c37b09', 5472, 3658, '#8c8c8c', 'Benyamin Bohlouli', 'benyamin_bohlouli', 'A modern dental office with a chair and equipment'),
  'hardware': P('photo-1759200165738-6366977a73c6', 3648, 5472, '#404040', 'Darien Attridge', 'dariendesigns', 'A wall display of tools and hardware in a store', '50% 45%'),
  'hardware-2': P('photo-1631856955350-77f4023dff2b', 7816, 5175, '#8c8c73', 'Oxana Melis', 'oksdesign', 'A man walking down a store aisle'),
  'pharma': P('photo-1628771065518-0d82f1938462', 6240, 4160, '#73c0f3', 'Towfiqu barbhuiya', 'towfiqu999999', 'Colorful pills spilling from an orange bottle'),
  'bakery': P('photo-1568254183919-78a4f43a2877', 4271, 2851, '#260c0c', 'Yeh Xintong', 'blsnki', 'Breads on bakery display shelves'),
  'call-center': P('photo-1766066014237-00645c74e9c6', 7952, 5304, '#260c0c', 'BaljkanN 4', 'baljkann4', 'A smiling agent wearing a headset at a computer'),
  'ski': P('photo-1705205148375-a845e74dbe4b', 5992, 3995, '#f3f3f3', 'Alex Moliski', 'alexmoliski', 'A ski lift going up a mountain'),
  'ski-2': P('photo-1636581563864-16c4d8fe34b9', 5184, 3456, '#c0c0d9', 'Michael Starkie', 'starkie_pics', 'A skier on a snow-covered slope'),
  'senior-care': P('photo-1631217868264-e5b90bb7e133', 6000, 3910, '#c0c0c0', 'National Cancer Institute', 'nci', 'A doctor talking with a patient in a clinic'),
  'senior-care-2': P('photo-1758691462123-8a17ae95d203', 3840, 2160, '#405959', 'Vitaly Gariev', 'silverkblack', 'A doctor checking a patient\'s blood pressure'),
  'brewery': P('photo-1779591211763-7a54431e16ab', 4096, 2731, '#26260c', 'Lens Fables', 'lensfables', 'A brewery taproom with steel fermentation tanks'),
  'car-wash-2': P('photo-1608506375591-b90e1f955e4b', 5103, 5103, '#0c2626', 'Andre Tan', 'andredantan19', 'Soapy foam sprayed onto a car'),
  'theme-park': P('photo-1713426225330-014fbfd04aa0', 6032, 3392, '#8cc0f3', 'Hannes Knutsson', 'hannesknutsson', 'Riders on a roller coaster'),
  'med-supplies': P('photo-1603398938378-e54eab446dde', 6000, 4000, '#d9d9d9', 'Julia Zyablova', 'foyu', 'A stethoscope, pill organizer and medical supplies'),
  'hospital-bed': P('photo-1538108149393-fbbd81895907', 2953, 1847, '#d9d9d9', 'Adhy Savala', 'adhy', 'An empty hospital bed in a patient room'),
  'operating-room': P('photo-1551076805-e1869033e561', 7952, 4472, '#d9d9d9', 'Arseny Togulev', 'tetrakiss', 'An operating room with surgical lights'),
  'pos': P('photo-1556740720-776b84291f8e', 8192, 5461, '#d9d9a6', 'Blake Wisz', 'blakewisz', 'A hand holding a card payment terminal'),
  'pos-2': P('photo-1556742031-c6961e8560b0', 2400, 3000, '#d9c0c0', 'Clay Banks', 'claybanks', 'A credit card inserted into a payment terminal', '50% 55%'),
  'restaurant-counter': P('photo-1556745750-68295fefafc5', 3600, 2700, '#260c0c', 'Patrick Tomasso', 'impatrickt', 'A server standing at a restaurant counter'),
  'produce-2': P('photo-1779893457658-ef97d16743d8', 5812, 3875, '#262626', 'jin cl', 'jackpaul', 'Covered market stalls under a skylit roof'),
  'steel': P('photo-1474674556023-efef886fa147', 5584, 3723, '#262626', 'Ant Rozetsky', 'rozetsky', 'A crane lifting a molten metal ladle in a steel mill'),
  'steel-2': P('photo-1613970351372-9804e380bd09', 5202, 3468, '#260c0c', 'yasin hemmati', 'yasinb3da', 'Molten metal pouring from a furnace'),
  'outdoor': P('photo-1615143277496-f7fb0b1878d8', 4496, 3000, '#4073d9', 'Polina Kocheva', 'kocheva', 'A hiker in a red jacket on a rock formation'),
  'cabin': P('photo-1641447093043-241f064568fb', 6000, 4000, '#c0c0c0', 'Mohammad Arrahmanur', 'arrahmanur', 'A row of empty seats in an airplane cabin'),
  'cabin-2': P('photo-1622967752036-9e4fd162725f', 5758, 3839, '#8c8c8c', 'Its me Pravin', 'paul__pro', 'Blue and white airplane seats'),
  'bank-building': P('photo-1663286357473-39dacb93b5d4', 6171, 4114, '#595940', 'Megan O\'Hanlon', 'megohanlon', 'A building with classical columns on a city street'),
  'data-center': P('photo-1558494949-ef010cbdcc31', 3956, 2220, '#262626', 'Taylor Vick', 'tvick', 'Network cables in a data center'),
  'pilates': P('photo-1747239685045-fcbcf98985db', 5963, 3354, '#a68c73', 'ROXANA POPOVICI', 'roxanarxx', 'A woman doing pilates on a reformer in a studio'),
  'smartwatch': P('photo-1659366100463-9e29a63adcc2', 5568, 3712, '#d9d9d9', 'Nik', 'helloimnik', 'A person checking heart rate on a smartwatch'),
  'cinema': P('photo-1561722798-9a732d141027', 4032, 3024, '#262626', 'Augusto Oazi', 'augustooazi', 'A movie theater interior'),
  'cinema-2': P('photo-1668890094751-6986d0ca9dfc', 5760, 3840, '#590c0c', 'Jacob Mejicanos', 'jacobmejicanos', 'A large empty auditorium'),
  'dealership': P('photo-1770319942638-a5989632f2ad', 8256, 5504, '#f3f3f3', 'Rob Dean', 'robhdean', 'Rows of new cars parked in a large lot'),
  'dog-food': P('photo-1714068691210-073dc52c6c1d', 4608, 3072, '#c0c0c0', 'Ayla Verschueren', 'moob', 'A dog eating food out of a bowl'),
  'dog-food-2': P('photo-1695023267262-7f4ab64152b2', 7008, 4672, '#262626', 'Gayatri Malhotra', 'gmalhotra', 'A dog eating out of a metal bowl'),
  'cheese': P('photo-1752401984776-edc407a13e1e', 5206, 3470, '#594026', 'Luba Glazunova', 'l_glazunova', 'Cheeses on display at a market stall'),
  'cheese-2': P('photo-1634925353703-451b16b6d1a8', 5184, 3456, '#260c0c', 'Dana Ward', 'danaward', 'A shelf of aging cheese wheels'),
  'soda': P('photo-1696739696228-eee49592ff07', 3000, 2250, '#f3f3f3', 'Ambo Ampeng', 'ambo_ampeng', 'Three cans of soda'),
  'sparkling': P('photo-1616556425595-93db848a50c7', 5520, 3680, '#0c2626', 'Andrew R', 'mouldy_coffee', 'Water pouring into a drinking glass'),
  'office-team': P('photo-1522071820081-009f0129c71c', 7952, 5304, '#262626', 'Annie Spratt', 'anniespratt', 'A group of people working on a laptop together'),
  'boxes': P('photo-1700165644892-3dd6b67b25bc', 6720, 4480, '#40260c', 'Luke Heibert', 'lukeheibert', 'Open brown cardboard boxes'),
  'gas-station': P('photo-1695561324569-5e47c76dc0a3', 5472, 3648, '#0c2626', 'Hans Eiskonen', 'eiskonen', 'A gas station at night'),
  'nyc-taxi': P('photo-1630717285906-29364ffacea0', 3888, 5184, '#0c2626', 'Maxime Doré', 'maxime_dore', 'A yellow taxi cab on a city street', '50% 70%'),
  'city-traffic': P('photo-1605617697069-959ec9dfc9de', 3500, 2137, '#595959', 'Vidar Nordli-Mathisen', 'vidarnm', 'Cars on a road between high-rise buildings'),
  'pizza': P('photo-1513104890138-7c749659a591', 5184, 3456, '#40260c', 'Ivan Torres', 'iavnt', 'A sliced pizza on a wooden board'),
  'golf': P('photo-1627955433445-d233480dd65d', 5805, 3870, '#738c40', 'Sugar Golf', 'sugargolf', 'A golf ball on green grass'),
  'football': P('photo-1560354765-02010876efff', 4608, 3072, '#737373', 'Patrick Ogilvie', 'patrickogilvie', 'A football field in a stadium'),
  'smartphone': P('photo-1488509082528-cefbba5ad692', 5472, 3648, '#260c0c', 'Priscilla Du Preez', 'priscilladupreez', 'A person using a smartphone'),
  'school-bus': P('photo-1650172101138-c0bb7bc32ffa', 4774, 3183, '#a6a6a6', 'Julian Gentile', 'juliangentile', 'Two yellow school buses in a parking lot'),
  'hot-dog': P('photo-1613482084286-41f25b486fa2', 4608, 3456, '#f3f3f3', 'Mateusz Feliksik', 'mateusz_feliksik', 'A hot dog on a white plate'),
  'airport': P('photo-1653795163859-9ee39ecc6d62', 8023, 5354, '#262626', 'Daniel', 'unsplashbydan', 'Travelers walking through an airport terminal'),
  'turkey': P('photo-1669151846702-09426d89bba0', 5472, 3648, '#c07326', 'Jessica Christian', 'lovesquish', 'A person carving a roast turkey'),
  'chicken': P('photo-1574672280600-4accfa5b6f98', 7952, 5304, '#260c0c', 'Claudio Schwarz', 'purzlbaum', 'A roasted chicken'),
  'barbershop': P('photo-1585747860715-2ba37e788b70', 4288, 2848, '#260c0c', 'Nathon Oski', 'onatecan', 'A leather barber chair by a brick wall'),
  'barbershop-2': P('photo-1503951914875-452162b0f3f1', 4858, 3239, '#260c0c', 'Allef Vinicius', 'seteph', 'A man sitting in a barber\'s chair'),
  'rental': P('photo-1697462247955-48cbe944f703', 3000, 2000, '#a6a6a6', 'Clay Banks', 'claybanks', 'A furnished living room with a large window'),
  'chicken-sandwich': P('photo-1700768400970-428c50bffc11', 5148, 6435, '#59260c', 'Crunch', 'crunch_london', 'A chicken sandwich with pickles', '50% 50%'),
  'running': P('photo-1639843093167-ed40b985c01e', 8889, 5000, '#8c5940', 'James Lee', 'jbl12761', 'A runner in motion'),
  'halloween': P('photo-1477516561410-f0b5dd8319e4', 4896, 2754, '#260c0c', 'Beth Teutschmann', 'teutschmann', 'Two lit jack-o\'-lanterns at night'),
  'burger': P('photo-1568901346375-23c9450c58cd', 4338, 3604, '#262626', 'amirali mirhashemian', 'amir_v_ali', 'A burger with lettuce and tomato'),
  'wedding': P('photo-1670529776180-60e4132ab90c', 6048, 4024, '#f3f3f3', 'Soulseeker - Creative Photography', 'soulseekerphoto', 'A floral wedding arch with chairs'),
  'wedding-2': P('photo-1505944357431-27579db47558', 6016, 4000, '#d9c0a6', 'Matthew Essman', 'thetruth23', 'Wedding chairs set out by the water'),
  'subway': P('photo-1529256879299-f530fa27a9de', 4771, 3181, '#595959', 'Billy Williams', 'billyryanwilliams', 'An empty subway station'),
  'tennis': P('photo-1541744573515-478c959628a0', 2448, 3264, '#0c4073', 'Mario Gogh', 'mariogogh', 'A tennis ball on a hard court', '50% 55%'),
  'airliner': P('photo-1570710891163-6d3b5c47248b', 6000, 4000, '#c0d9d9', 'Kevin Woblick', 'kovah', 'An airliner in flight'),
  'piano': P('photo-1520523839897-bd0b52f945a0', 5472, 3648, '#0c2640', 'Geert Pieters', 'shotsbywolf', 'A close-up of piano keys'),
  'christmas-trees': P('photo-1633863856058-d8d866c00df8', 5184, 3456, '#26260c', 'Sean Foster', 'fosterious', 'Rows of cut Christmas trees for sale'),
  'toilet-paper': P('photo-1584556812952-905ffd0c611a', 4608, 3072, '#c0c0c0', 'Erik Mclean', 'introspectivedsgn', 'A roll of toilet paper on a wooden table'),
  'food-delivery': P('photo-1617347454431-f49d7ff5c3b1', 4294, 3059, '#735940', 'Rowan Freeman', 'rowanfreeman', 'A delivery rider on a scooter at night'),
  'pickleball': P('photo-1659318006095-4d44845f3a1b', 3840, 1842, '#405973', 'Brendan Sapp', 'hypelights', 'A pickleball paddle and balls on a court'),
  'birthday-cake': P('photo-1464349153735-7db50ed83c84', 4000, 2407, '#0c2626', 'Annie Spratt', 'anniespratt', 'A birthday cake with a candle'),
  'construction': P('photo-1587582423116-ec07293f0395', 3649, 2433, '#408ca6', 'Josh Olalde', 'josholalde', 'A builder on a new house frame'),
  'construction-2': P('photo-1556156653-e5a7c69cc263', 5464, 3640, '#a6a6a6', 'Avel Chuklanov', 'chuklanov', 'The timber frame of a house under construction'),
  'atm': P('photo-1601597111158-2fceff292cdc', 5157, 3438, '#262626', 'Eduardo Soares', 'eduschadesoares', 'A person pressing buttons on an ATM keypad'),
  'baseball': P('photo-1651526863031-070aa9bdcb5a', 6000, 4000, '#262626', 'Matt Dodd', 'mdodd16', 'A baseball stadium with a full crowd'),
  'paint': P('photo-1456086272160-b28b0645b729', 3705, 2084, '#d9c0d9', 'russn_fckr', 'russn_fckr', 'Assorted colors of paint'),
  'campus': P('photo-1663162551013-8bb8ab151e11', 5472, 3648, '#d9d9d9', 'Meredith Spencer', 'meredithspencer22', 'Students walking on a campus road'),
  'mall-2': P('photo-1533481405265-e9ce0c044abb', 6000, 3375, '#f3f3f3', 'Michael Weidemann', 'weidemann', 'An escalator inside a shopping mall'),
  'analytics': P('photo-1551288049-bebda4e38f71', 4810, 3207, '#f3f3f3', 'Luke Chesser', 'lukechesser', 'Performance analytics graphs on a laptop screen'),
  'analytics-2': P('photo-1591696205602-2f950c417cb9', 3999, 2666, '#f3f3f3', 'Markus Winkler', 'markuswinkler', 'A stock market chart on a laptop screen'),
  'analytics-3': P('photo-1618044733300-9472054094ee', 3500, 2333, '#d9d9c0', 'Markus Spiske', 'markusspiske', 'A financial newspaper with a stock chart'),
  'whiteboard': P('photo-1532622785990-d2c36a76f5a6', 5029, 3353, '#c0c0c0', 'Kaleidico', 'kaleidico', 'Two people drawing on a whiteboard'),
  'whiteboard-2': P('photo-1557804506-669a67965ba0', 5355, 4016, '#d9d9d9', 'Austin Distel', 'austindistel', 'A team watching a presenter at a whiteboard'),
  'ev': P('photo-1615829386703-e2bb66a7cb7d', 4000, 6000, '#c0d9d9', 'Precious Madubuike', 'preciousm', 'An electric car charging on a city street', '50% 55%'),
  'dogs': P('photo-1703733572989-026dbaf7fc96', 5184, 3456, '#597359', 'Judy Beth Morris', 'judy_beth_morris_idaho', 'Dogs running across a green field'),
  'boardroom': P('photo-1758518730037-a16581a040e8', 3800, 2138, '#c0c0c0', 'Vitaly Gariev', 'silverkblack', 'Business professionals meeting around a table'),
  'house-keys': P('photo-1741156386380-0236c72eb6f9', 3000, 2001, '#f3f3f3', 'Jakub Zerdzicki', 'jakubzerdzicki', 'House keys held in front of a front door'),
  'solar': P('photo-1658298775754-5839ffd434cc', 6000, 4000, '#8cc0d9', 'Soren H', 'hosoren', 'Solar panels on a residential roof'),
  'solar-2': P('photo-1509391366360-2e959784a276', 6144, 4088, '#595926', 'American Public Power Association', 'publicpowerorg', 'Rows of solar panels on a green field'),
  'basketball': P('photo-1604484486383-28c5b48a0c57', 6090, 4060, '#73a6c0', 'Nikola Radojcic', 'nikolor', 'A basketball hoop against a blue sky'),
} satisfies Record<string, UsPhoto>;

export type UsTopicId = keyof typeof TOPIC_PHOTOS;
export const US_TOPIC_PHOTOS: Record<UsTopicId, UsPhoto> = Object.fromEntries(
  Object.entries(TOPIC_PHOTOS).map(([k, v]) => [k, { ...v, id: k }]),
) as Record<UsTopicId, UsPhoto>;

type PhotoKey = UsTopicId | UsPhotoId;
const photoByKey = (k: PhotoKey): UsPhoto => (k in US_TOPIC_PHOTOS ? US_TOPIC_PHOTOS[k as UsTopicId] : US_PHOTOS[k as UsPhotoId]);

/* ── Which photo illustrates a case ─────────────────────────────────────────
   1. TOPIC_RULES against the title (what the item is about), then the industry
   2. INDUSTRY_RULES (broad sector photos)
   3. the case type's own set
   Where a rule lists several photos, the item's id (or title) picks one, so a
   given item always shows the same photo. Order matters: specific first. */

const TOPIC_RULES: [RegExp, PhotoKey[]][] = [
  [/solar|photovolt|home batter/i, ['solar', 'solar-2']],
  [/auto-parts|auto parts|factory|manufactur|assembly line/i, ['industrial']],
  [/hot dogs?/i, ['hot-dog']],
  [/bakery|bread|pastr/i, ['bakery']],
  [/house paint|\bpaint\b/i, ['paint']],
  [/dog[- ]food|pet food|\btreats\b/i, ['dog-food', 'dog-food-2']],
  [/veterinar|\bvet\b|pet[- ]supply/i, ['vet', 'dog-rest']],
  [/\bdogs?\b|\bpets?\b/i, ['dogs', 'dog-rest']],
  [/charg(er|ing)|\bevs?\b|electric (vehicle|car)|driver-assist/i, ['ev']],
  [/coffee|caf[eé]\b|espresso|\bchai\b|\btea\b/i, ['coffee-shop', 'coffee-cup']],
  [/birthday|\bcakes?\b/i, ['birthday-cake']],
  [/\bhvac\b|air[- ]condition|heating/i, ['hvac']],
  [/stream|ad-supported|\btv\b|television/i, ['streaming-2']],
  [/cyber|security software|antivirus/i, ['cyber', 'cyber-2']],
  [/digital-only|gen z|neobank|mobile bank|banking app/i, ['mobile-bank', 'mobile-bank-2']],
  [/credit card|card transactions|payments?\b|point of sale|\bpos\b|payroll/i, ['pos', 'pos-2']],
  [/\batms?\b|cash machine/i, ['atm']],
  [/parking/i, ['parking', 'parking-2']],
  [/broadband|\b5g\b|cable company|telecom|wireless|cell(ular)? tower/i, ['cell-tower']],
  [/truck|freight|empty miles|haul/i, ['trucking']],
  [/dental|dentist/i, ['dental']],
  [/hardware|home improvement|big-box/i, ['hardware', 'hardware-2']],
  [/pharmac(y|ies|ist)/i, ['pharmacy']],
  [/pharma|patent|\bdrugs?\b|\bpills?\b|pharmac|prescription/i, ['pharma']],
  [/call cent|hold times|customer service|contact cent/i, ['call-center']],
  [/\bski\b|ski resort|snow/i, ['ski', 'ski-2']],
  [/medicare|health insur|senior|elder/i, ['senior-care', 'senior-care-2']],
  [/brew|\bbeer\b|craft/i, ['brewery']],
  [/car[- ]wash/i, ['car-wash-2']],
  [/theme park|amusement|disney|skip-the-line|roller coaster/i, ['theme-park']],
  [/hospital beds?/i, ['hospital-bed']],
  [/supply costs|medical suppl|hospital system/i, ['med-supplies', 'operating-room']],
  [/emergency department|hospital|operating room|surg/i, ['operating-room', 'hospital-bed']],
  [/grocer|supermarket|produce|farmers? market/i, ['retail', 'produce-2']],
  [/steel|mini-mill|metal|foundry/i, ['steel', 'steel-2']],
  [/outdoor|hiking|camping/i, ['outdoor']],
  [/in the air|commercial flights|airliner|aircraft/i, ['airliner']],
  [/airport|jfk|passengers depart/i, ['airport']],
  [/airline|basic economy|\bfares?\b|flight/i, ['cabin', 'cabin-2', 'airliner']],
  [/pilates|yoga|boutique (studio|fitness)/i, ['pilates']],
  [/\bgyms?\b|fitness/i, ['fitness']],
  [/wearable|heart monitor|cardiolog|smartwatch/i, ['smartwatch']],
  [/robotaxi|ride-hail|\buber\b|\blyft\b|\btaxi|self-driving|autonomous/i, ['nyc-taxi', 'city-traffic']],
  [/commut|traffic|rickshaw/i, ['city-traffic', 'subway']],
  [/subway|metro|transit/i, ['subway']],
  [/cinema|movie|theater|theatre/i, ['cinema', 'cinema-2']],
  [/dealership|car-dealer|car dealer|auto retail/i, ['dealership']],
  [/cheese|dairy/i, ['cheese', 'cheese-2']],
  [/sparkling|bottled water|drinking water|water bottles?/i, ['sparkling']],
  [/soft drink|\bsoda\b|\bcola\b|beverage/i, ['soda']],
  [/universit|college|enrol+ment|campus|school applic/i, ['campus', 'education']],
  [/school bus/i, ['school-bus']],
  [/gas station|\bfuel\b|gasoline|petrol/i, ['gas-station']],
  [/pizza/i, ['pizza']],
  [/golf/i, ['golf']],
  [/\bnfl\b|football|super bowl/i, ['football']],
  [/basketball|\bnba\b/i, ['basketball']],
  [/baseball|\bmlb\b/i, ['baseball']],
  [/pickleball/i, ['pickleball']],
  [/tennis/i, ['tennis']],
  [/running shoes|sneaker|marathon|\brunn(ing|ers?)\b/i, ['running']],
  [/iphone|smartphone|mobile phone|cell ?phones?/i, ['smartphone']],
  [/turkey|thanksgiving/i, ['turkey']],
  [/chick-fil-a|chicken sandwich/i, ['chicken-sandwich']],
  [/chicken/i, ['chicken']],
  [/burger/i, ['burger']],
  [/salon|barber|haircut/i, ['barbershop', 'barbershop-2']],
  [/airbnb|vacation rental|short-term rental|nights booked/i, ['rental']],
  [/halloween|costume/i, ['halloween']],
  [/wedding/i, ['wedding', 'wedding-2']],
  [/piano/i, ['piano']],
  [/christmas/i, ['christmas-trees']],
  [/toilet paper|tissue/i, ['toilet-paper']],
  [/food[- ]delivery|delivery app|takeout|tiffin/i, ['food-delivery']],
  [/new homes|homebuild|home ?build|construction/i, ['construction', 'construction-2']],
  [/self-storage|storage units?/i, ['boxes']],
  [/packages|parcels|same-day|warehouse|fulfil|shipping/i, ['logistics', 'boxes']],
  [/restaurant|diner|fast food|quick[- ]service/i, ['restaurant-counter', 'restaurants']],
  [/\bmalls?\b|shopping cent/i, ['mall-2']],
  [/apparel|fashion|clothing/i, ['outdoor', 'mall-2']],
  [/software|\bsaas\b|\bcloud\b|data cent|\bhr\b/i, ['data-center', 'analytics']],
  [/\bbanks?\b|banking|lender/i, ['bank-building']],
  [/insur/i, ['house-keys', 'boardroom']],
];

const INDUSTRY_RULES: [RegExp, UsPhotoId][] = [
  [/e-?commerce logistic|fulfil+ment|\blast[- ]mile/i, 'logistics'],
  [/pharma(cy|ceutical)|\bdrugs?\b|medic(ine|ation)/i, 'pharmacy'],
  [/health|hospital|clinic|medical|patient/i, 'healthcare'],
  [/bank|financ|insur|lend|credit|payment|asset management|wealth|fintech|private equity/i, 'finance'],
  [/software|\bsaas\b|\btech|telecom|\bcloud\b|\bdata\b|\bapps?\b|platform|\bai\b|semiconductor|wireless/i, 'technology'],
  [/airline|airport|travel|hotel|leisure|cruise|transportation|rail/i, 'travel'],
  [/restaurant|food|beverage|coffee|bakery|dining|quick[- ]service/i, 'restaurants'],
  [/grocer|retail|store|apparel|e-?commerce|consumer (goods|packaged)|cpg|fashion|mall/i, 'retail'],
  [/\bevs?\b|electric vehicle|energy|\butilit|solar|\bwind\b|\boil\b|\bgas\b|\bpower\b/i, 'energy'],
  [/\bauto|\bcars?\b|vehicle|manufactur|industrial|factory|\bplants?\b|\bsteel\b|chemical/i, 'industrial'],
  [/logistic|warehouse|shipping|freight|delivery|supply chain|mobility|scooter|fleet/i, 'logistics'],
  [/fitness|gym|wellness|sport/i, 'fitness'],
  [/media|stream|entertainment|film|music|studio|publishing|gaming/i, 'media'],
  [/education|university|college|school|edtech|campus/i, 'education'],
  [/\bhomes?\b|real estate|housing|construction|property/i, 'housing'],
];

/** Photos for an item nothing more specific matched, by case type. */
const TYPE_FALLBACK: Record<string, PhotoKey[]> = {
  profitability: ['analytics-3', 'analytics'],
  'market entry': ['skyline', 'city-traffic'],
  growth: ['analytics-2', 'analytics'],
  pricing: ['pos', 'pos-2'],
  'm&a': ['boardroom'],
  operations: ['logistics', 'industrial'],
  'cost reduction': ['industrial', 'analytics-3'],
  'go to market': ['whiteboard-2', 'office-team'],
  'competitive strategy': ['mall-2', 'city-traffic'],
  guesstimate: ['whiteboard', 'city-traffic', 'office-team', 'analytics-2'],
};

/** FNV-1a — a small, stable string hash (same input → same photo, everywhere). */
export function stableHash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const pick = <T,>(xs: T[], seed: string): T => xs[stableHash(seed) % xs.length];

export function photoForCase(input: { industry?: string | null; title?: string | null; type?: string | null; seed?: string | null }): UsPhoto {
  const seed = input.seed || input.title || input.industry || input.type || 'mece';
  for (const text of [input.title, input.industry]) {
    if (!text) continue;
    for (const [re, keys] of TOPIC_RULES) if (re.test(text)) return photoByKey(pick(keys, seed));
  }
  for (const text of [input.industry, input.title]) {
    if (!text) continue;
    for (const [re, id] of INDUSTRY_RULES) if (re.test(text)) return US_PHOTOS[id];
  }
  const byType = (input.type && TYPE_FALLBACK[input.type]) || TYPE_FALLBACK.profitability;
  return photoByKey(pick(byType, seed));
}

/** The photo beside "What to do next": the focus type's own look, else analysis on paper. */
export function photoForAdvice(focusType: string | null | undefined): UsPhoto {
  if (focusType === 'guesstimate') return US_TOPIC_PHOTOS['whiteboard'];
  if (focusType === 'm&a') return US_TOPIC_PHOTOS['boardroom'];
  if (focusType === 'pricing') return US_TOPIC_PHOTOS['pos'];
  if (focusType === 'operations' || focusType === 'cost reduction') return US_PHOTOS.logistics;
  return US_TOPIC_PHOTOS['analytics-3'];
}

/* ── Daily skyline (v3) ─────────────────────────────────────────────────────
   Six US skylines, one per day in rotation, behind the dashboard greeting
   (New York twice: Midtown and Lower Manhattan). */

const MORE_SKYLINES: UsPhoto[] = [
  P('photo-1493134799591-2c9eed26201a', 5328, 3552, '#405973', 'Jeff Brown', 'jbrown1276', 'The Chicago skyline across Lake Michigan', '50% 60%', 'sky-chicago'),
  P('photo-1625726411847-8cbb60cc71e6', 4777, 3164, '#d9f3f3', 'Andrew Whitmore', 'andrewdavid90', 'The San Francisco skyline across the bay', '50% 65%', 'sky-sf'),
  P('photo-1565127803082-69dd82351360', 4502, 3000, '#4073d9', 'jacob Licht', 'jolicht', 'The Boston skyline across the water', '50% 55%', 'sky-boston'),
  P('photo-1502175353174-a7a70e73b362', 4219, 2175, '#c0c0c0', 'Thom Milkovic', 'thommilkovic', 'The Seattle skyline with Mount Rainier behind', '50% 60%', 'sky-seattle'),
];

export const US_SKYLINES: UsPhoto[] = [US_PHOTOS.skyline, ...MORE_SKYLINES.slice(0, 2), US_PHOTOS.band, ...MORE_SKYLINES.slice(2)];

/** Days since 1970-01-01 for a YYYY-MM-DD key — the rotation index for "daily" things. */
export function dayNumber(dayKey: string): number {
  const t = Date.parse(dayKey + 'T00:00:00Z');
  return Number.isNaN(t) ? 0 : Math.floor(t / 86400000);
}

/**
 * Where each skyline sits in the dashboard banner (a wide, short crop whose
 * bottom fades out): the towers should rise into the upper half and the sky
 * stay above them for the line of the day.
 */
const BANNER_FOCAL: Record<string, string> = {
  skyline: '50% 58%',
  band: '50% 86%',
  'sky-chicago': '50% 58%',
  'sky-sf': '50% 70%',
  'sky-boston': '50% 64%',
  'sky-seattle': '50% 68%',
};

export function skylineForDay(dayKey: string): UsPhoto {
  const photo = US_SKYLINES[dayNumber(dayKey) % US_SKYLINES.length];
  return { ...photo, focal: BANNER_FOCAL[photo.id] ?? photo.focal };
}
