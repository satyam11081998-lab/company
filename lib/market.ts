/**
 * MARKETS — India vs International (US + Europe).
 *
 * One pure module (no Node, no DOM, no Supabase) so the SAME rules run in the
 * Edge middleware, in Server Components, in route handlers and in the browser.
 * If two call sites ever disagree about where a visitor is, the product shows
 * one price on the page and charges another at checkout — so there is exactly
 * one implementation, here.
 *
 * VOCABULARY
 *   Region / Market  'IN' | 'US' | 'EU'  — stored on users.market (locked).
 *   Content market   'IN' | 'US'          — which case/guesstimate bank a
 *                                           user practises. EU → 'US'.
 *   Currency         'INR' | 'USD' | 'EUR'
 *
 * HOW A VISITOR IS PLACED (detectRegion)
 *   Two independent signals:
 *     1. IP country  — `x-vercel-ip-country`, set by Vercel's edge. A VPN
 *                      changes this.
 *     2. Timezone    — the browser's IANA zone, written to the `mece_tz`
 *                      cookie by <RegionProbe/>. A VPN does NOT change this.
 *   India is granted only when the IP says India AND the timezone agrees (or
 *   is not known yet on the very first request). An Indian IP with a New York
 *   clock is a VPN, and is treated as the US. A foreign IP is always foreign,
 *   whatever the clock says — otherwise changing one OS setting would unlock
 *   India pricing without even needing a VPN.
 *
 * WHY DETECTION IS NOT THE WALL
 *   Both signals can be faked by someone who changes their VPN AND their OS
 *   timezone. So detection only decides what a visitor SEES. What they can PAY
 *   is enforced at checkout: an INR order must be paid with an Indian
 *   instrument (Razorpay `payment.international === false`), otherwise nothing
 *   is granted and the payment is refunded. See lib/payments-region.ts.
 */

export type Market = 'IN' | 'US' | 'EU';
export type ContentMarket = 'IN' | 'US';
export type Currency = 'INR' | 'USD' | 'EUR';

export const MARKETS: readonly Market[] = ['IN', 'US', 'EU'] as const;

export function isMarket(v: unknown): v is Market {
  return v === 'IN' || v === 'US' || v === 'EU';
}

/** Anything unknown (NULL row, pre-migration, bad value) is India — the legacy default. */
export function normalizeMarket(v: unknown): Market {
  return isMarket(v) ? v : 'IN';
}

/** True for every market that is NOT India. */
export function isIntlMarket(v: unknown): boolean {
  const m = normalizeMarket(v);
  return m !== 'IN';
}

export function contentMarketOf(v: unknown): ContentMarket {
  return isIntlMarket(v) ? 'US' : 'IN';
}

export function currencyOf(v: unknown): Currency {
  const m = normalizeMarket(v);
  if (m === 'EU') return 'EUR';
  if (m === 'US') return 'USD';
  return 'INR';
}

/**
 * The IANA zone that defines "today" for a content market. India's daily
 * rolls over at IST midnight (unchanged); the US daily rolls over at US
 * Eastern midnight, which is when an American's "today" actually starts.
 */
export function dayTimeZoneOf(content: ContentMarket): string {
  return content === 'US' ? 'America/New_York' : 'Asia/Kolkata';
}

/** YYYY-MM-DD for "now" in the given IANA zone (DST-correct via Intl). */
export function todayInZone(timeZone: string, now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Minutes the zone is ahead of UTC at `date` (IST → 330, New York → -240/-300). */
export function tzOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** ISO instant of local midnight on `dateStr` (YYYY-MM-DD) in `timeZone`. DST-safe. */
export function zonedMidnightIso(dateStr: string, timeZone: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utcGuess = Date.UTC(y, (m || 1) - 1, d || 1, 0, 0, 0);
  const off1 = tzOffsetMinutes(new Date(utcGuess), timeZone);
  let ts = utcGuess - off1 * 60000;
  const off2 = tzOffsetMinutes(new Date(ts), timeZone);
  if (off2 !== off1) ts = utcGuess - off2 * 60000;
  return new Date(ts).toISOString();
}

/** "Today" for a content market, as the daily schedule keys it. */
export function marketToday(content: ContentMarket, now: Date = new Date()): string {
  return todayInZone(dayTimeZoneOf(content), now);
}

/* ─────────────────────────────────────────────────────────────────────────
 * Country → market
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Countries priced in EUR. The EU-27, the EEA, Switzerland, the UK and the
 * rest of geographic Europe that commonly transacts in euros. Russia, Belarus
 * and Turkey are deliberately NOT here — they fall through to USD.
 * One list, so moving a country is a one-line change.
 */
export const EUR_COUNTRIES: ReadonlySet<string> = new Set([
  // EU-27
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EEA + CH + UK
  'IS', 'LI', 'NO', 'CH', 'GB',
  // Euro micro-states + wider Europe
  'AD', 'MC', 'SM', 'VA', 'ME', 'XK', 'AL', 'BA', 'MK', 'RS', 'MD', 'UA',
  // Crown dependencies / territories that follow the UK/EU
  'GI', 'IM', 'JE', 'GG', 'FO', 'AX',
]);

/** Market for an ISO-3166 alpha-2 country code; null when unknown. */
export function marketForCountry(country: string | null | undefined): Market | null {
  const c = (country || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return null;
  // Vercel reports XX / T1 (Tor) style placeholders for unknown/anonymous IPs.
  if (c === 'XX' || c === 'T1' || c === 'ZZ') return null;
  if (c === 'IN') return 'IN';
  if (EUR_COUNTRIES.has(c)) return 'EU';
  return 'US';
}

/* ─────────────────────────────────────────────────────────────────────────
 * Timezone → market
 * ───────────────────────────────────────────────────────────────────────── */

const INDIA_ZONES = new Set(['Asia/Kolkata', 'Asia/Calcutta']);

/** European zones that are NOT euro-priced (Russia, Belarus, Turkey). */
const NON_EUR_EUROPE_ZONES = new Set([
  'Europe/Moscow', 'Europe/Minsk', 'Europe/Istanbul', 'Europe/Kaliningrad',
  'Europe/Samara', 'Europe/Volgograd', 'Europe/Kirov', 'Europe/Astrakhan',
  'Europe/Saratov', 'Europe/Ulyanovsk', 'Asia/Istanbul',
]);

/** Atlantic zones that belong to euro-priced Europe. */
const EUR_ATLANTIC_ZONES = new Set([
  'Atlantic/Reykjavik', 'Atlantic/Canary', 'Atlantic/Madeira', 'Atlantic/Faroe',
  'Atlantic/Azores',
]);

/**
 * Market implied by an IANA timezone; null when the zone is missing, invalid,
 * or carries no location (UTC, Etc/*, GMT) — those say nothing about where the
 * person is and must not tip a decision either way.
 */
export function marketForTimeZone(tz: string | null | undefined): Market | null {
  const z = (tz || '').trim();
  if (!z || z.length > 64) return null;
  if (!/^[A-Za-z_]+(?:\/[A-Za-z0-9_+\-]+){1,2}$/.test(z)) return null;
  if (z.startsWith('Etc/') || z === 'UTC' || z === 'GMT') return null;
  if (INDIA_ZONES.has(z)) return 'IN';
  if (NON_EUR_EUROPE_ZONES.has(z)) return 'US';
  if (z.startsWith('Europe/') || EUR_ATLANTIC_ZONES.has(z)) return 'EU';
  return 'US';
}

/* ─────────────────────────────────────────────────────────────────────────
 * The decision
 * ───────────────────────────────────────────────────────────────────────── */

export interface RegionSignals {
  /** ISO country from the edge (x-vercel-ip-country). */
  ipCountry?: string | null;
  /** IANA zone from the `mece_tz` cookie. */
  timeZone?: string | null;
}

export interface RegionDecision {
  market: Market;
  /** 'ip+tz' = both signals used; 'ip' = no timezone yet; 'tz' = no IP; 'default' = neither. */
  basis: 'ip+tz' | 'ip' | 'tz' | 'default';
}

export function detectRegion(signals: RegionSignals): RegionDecision {
  const ip = marketForCountry(signals.ipCountry);
  const tz = marketForTimeZone(signals.timeZone);

  if (ip === 'IN') {
    // India IP. Only a foreign clock can overturn it (VPN into India).
    if (tz === null) return { market: 'IN', basis: 'ip' };
    return { market: tz === 'IN' ? 'IN' : tz, basis: 'ip+tz' };
  }
  if (ip !== null) {
    // Foreign IP is always foreign. An Indian clock on a foreign IP is either a
    // traveller or someone trying their luck — neither unlocks India pricing.
    return { market: ip, basis: tz === null ? 'ip' : 'ip+tz' };
  }
  // No IP country (local dev, some proxies). Fall back to the clock, then India.
  if (tz !== null) return { market: tz, basis: 'tz' };
  return { market: 'IN', basis: 'default' };
}

/* ─────────────────────────────────────────────────────────────────────────
 * Crawlers — never geo-routed
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Search and AI crawlers are NOT geo-routed. Googlebot crawls from US IPs; if
 * it were redirected like a US human, the India homepage would be indexed as
 * the US page and the India site would vanish from Indian results. Each
 * market instead has its own canonical URL (/ and /us) joined by hreflang, and
 * crawlers read both as they are.
 */
const BOT_RE =
  /bot\b|bot\/|crawler|spider|crawling|slurp|mediapartners|googlebot|google-inspectiontool|google-extended|storebot|bingbot|bingpreview|duckduckbot|baiduspider|yandex|facebookexternalhit|facebookcatalog|meta-externalagent|twitterbot|linkedinbot|embedly|quora link preview|pinterest|slackbot|vkshare|w3c_validator|whatsapp|telegrambot|discordbot|applebot|gptbot|chatgpt-user|oai-searchbot|perplexity|claudebot|claude-web|claude-user|anthropic-ai|ccbot|bytespider|amazonbot|petalbot|semrush|ahrefs|mj12bot|dotbot|lighthouse|pagespeed|chrome-lighthouse|headlesschrome|prerender|youbot|diffbot|cohere-ai|timpibot|ia_archiver/i;

export function isCrawler(userAgent: string | null | undefined): boolean {
  const ua = userAgent || '';
  if (!ua) return true; // no UA at all: treat as a machine, never redirect it
  return BOT_RE.test(ua);
}

/* ─────────────────────────────────────────────────────────────────────────
 * Cookies + headers shared by middleware, probe and pages
 * ───────────────────────────────────────────────────────────────────────── */

/** Browser timezone, written by <RegionProbe/>. Readable by the server. */
export const TZ_COOKIE = 'mece_tz';
/**
 * The region the middleware decided for this browser, plus HOW it decided:
 * e.g. `US.ip+tz`, `IN.ip`, `EU.acct`. `.ip` means "decided before the
 * timezone was known" — the probe reloads once when the clock disagrees.
 */
export const REGION_COOKIE = 'mece_rg';
/** `<userId>:<market>` — caches that the account's market is stamped. */
export const MARKET_STAMP_COOKIE = 'mece_mkt';
/** Request header the middleware sets (always overwritten — never client-trusted). */
export const REGION_HEADER = 'x-mece-region';

/* ─────────────────────────────────────────────────────────────────────────
 * Geo-routing of the public marketing pages
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * India marketing URL → its international twin. Only these pages carry
 * prices or India-specific positioning; everything else is shared.
 */
export const INTL_TWIN: Readonly<Record<string, string>> = {
  '/': '/us',
  '/pricing': '/us/pricing',
};

/** Paths that exist only for the international market. */
export function isIntlPath(pathname: string): boolean {
  return pathname === '/us' || pathname.startsWith('/us/');
}

/**
 * Routes that are India-only product surfaces (learning, GD, India content).
 * An international account is sent to /practice instead. Kept here so the
 * nav, the middleware and the page guards read one list.
 */
export const INDIA_ONLY_PREFIXES: readonly string[] = [
  '/learn',
  '/gd-briefs',
  '/cheat-sheet',
  '/skeletons',
  '/deck-vault',
  '/decks',        // public deck pages carry rupee unlock prices
  '/resume',
  '/coach',
];

export function isIndiaOnlyPath(pathname: string): boolean {
  return INDIA_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/* ─────────────────────────────────────────────────────────────────────────
 * Money formatting
 * ───────────────────────────────────────────────────────────────────────── */

const CURRENCY_SYMBOL: Record<Currency, string> = { INR: '₹', USD: '$', EUR: '€' };

export function currencySymbol(c: Currency): string {
  return CURRENCY_SYMBOL[c];
}

/** Whole-unit price label: ₹599, $49, €49. Thousands grouped per locale. */
export function formatMoney(amount: number, currency: Currency): string {
  const locale = currency === 'INR' ? 'en-IN' : currency === 'EUR' ? 'en-IE' : 'en-US';
  const n = Math.round(amount).toLocaleString(locale);
  return `${CURRENCY_SYMBOL[currency]}${n}`;
}

/** Minor units (paise / cents) → display label with 2dp only when needed. */
export function formatMinor(minor: number, currency: Currency): string {
  const major = minor / 100;
  if (Number.isInteger(major)) return formatMoney(major, currency);
  const locale = currency === 'INR' ? 'en-IN' : currency === 'EUR' ? 'en-IE' : 'en-US';
  return `${CURRENCY_SYMBOL[currency]}${major.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
