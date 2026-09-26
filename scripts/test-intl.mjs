#!/usr/bin/env node
/**
 * Gate for the international launch (2026-09-25). Transpiles the pure modules
 * with the repo's tsc and asserts the rules that money and routing depend on.
 *   node scripts/test-intl.mjs
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = mkdtempSync(join(tmpdir(), 'intl-test-'));
// tier.ts imports '@/lib/types' (types only) and '@/lib/market' (type only) — both erased.
// '@/lib/...' aliases are not resolvable outside the Next config, so tsc
// reports them (type-only imports are erased anyway) but still emits; the one
// runtime alias (payments-region → telegram) is rewritten to a relative path.
try {
  execSync(`npx tsc --ignoreConfig lib/market.ts lib/tier.ts lib/tier-core.ts lib/billing.ts lib/pricing-intl.ts lib/intl-plans.ts lib/payments-region.ts lib/telegram.ts --outDir ${out} --module commonjs --target es2020 --skipLibCheck --esModuleInterop`, { cwd: root, stdio: 'pipe' });
} catch { /* alias resolution errors only; outputs checked below */ }
for (const f of ['market.js', 'tier.js', 'tier-core.js', 'billing.js', 'pricing-intl.js', 'intl-plans.js', 'payments-region.js', 'telegram.js']) {
  if (!existsSync(join(out, f))) { console.error('tsc did not emit', f); process.exit(1); }
}
// Rewrite the '@/lib/x' aliases the emitted CommonJS still carries.
for (const f of ['tier.js', 'pricing-intl.js', 'payments-region.js', 'intl-plans.js']) {
  const fp = join(out, f);
  writeFileSync(fp, readFileSync(fp, 'utf8').replace(/require\("@\/lib\/([a-z-]+)"\)/g, 'require("./$1")'));
}
const require = createRequire(import.meta.url);
const m = require(join(out, 'market.js'));
const t = require(join(out, 'tier.js'));
const pr = require(join(out, 'payments-region.js'));
const pi = require(join(out, 'pricing-intl.js'));
const plans = require(join(out, 'intl-plans.js'));
rmSync(out, { recursive: true, force: true });

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('  ✓', name); };

console.log('detectRegion');
ok('India IP + India clock → IN', () => assert.equal(m.detectRegion({ ipCountry: 'IN', timeZone: 'Asia/Kolkata' }).market, 'IN'));
ok('India IP + legacy Asia/Calcutta → IN', () => assert.equal(m.detectRegion({ ipCountry: 'IN', timeZone: 'Asia/Calcutta' }).market, 'IN'));
ok('India IP, no clock yet → IN (basis ip)', () => assert.deepEqual(m.detectRegion({ ipCountry: 'IN' }), { market: 'IN', basis: 'ip' }));
ok('VPN into India with New York clock → US', () => assert.equal(m.detectRegion({ ipCountry: 'IN', timeZone: 'America/New_York' }).market, 'US'));
ok('VPN into India with Berlin clock → EU', () => assert.equal(m.detectRegion({ ipCountry: 'IN', timeZone: 'Europe/Berlin' }).market, 'EU'));
ok('US IP with India clock stays US (no clock-only unlock)', () => assert.equal(m.detectRegion({ ipCountry: 'US', timeZone: 'Asia/Kolkata' }).market, 'US'));
ok('UK IP → EU (euro-priced)', () => assert.equal(m.detectRegion({ ipCountry: 'GB', timeZone: 'Europe/London' }).market, 'EU'));
ok('Germany → EU', () => assert.equal(m.detectRegion({ ipCountry: 'DE' }).market, 'EU'));
ok('Russia → US bucket (USD)', () => assert.equal(m.detectRegion({ ipCountry: 'RU' }).market, 'US'));
ok('Singapore → US bucket', () => assert.equal(m.detectRegion({ ipCountry: 'SG' }).market, 'US'));
ok('Tor / unknown IP falls back to clock', () => assert.equal(m.detectRegion({ ipCountry: 'T1', timeZone: 'America/Chicago' }).market, 'US'));
ok('No signals at all → IN default', () => assert.deepEqual(m.detectRegion({}), { market: 'IN', basis: 'default' }));
ok('UTC clock carries no signal', () => assert.equal(m.detectRegion({ ipCountry: 'IN', timeZone: 'UTC' }).market, 'IN'));
ok('Garbage clock carries no signal', () => assert.equal(m.detectRegion({ ipCountry: 'IN', timeZone: '<script>' }).market, 'IN'));
ok('Moscow clock is not EU', () => assert.equal(m.marketForTimeZone('Europe/Moscow'), 'US'));
ok('Istanbul clock is not EU', () => assert.equal(m.marketForTimeZone('Europe/Istanbul'), 'US'));

console.log('market helpers');
ok('normalizeMarket(null) → IN', () => assert.equal(m.normalizeMarket(null), 'IN'));
ok('EU content market is US bank', () => assert.equal(m.contentMarketOf('EU'), 'US'));
ok('currencies', () => { assert.equal(m.currencyOf('IN'), 'INR'); assert.equal(m.currencyOf('US'), 'USD'); assert.equal(m.currencyOf('EU'), 'EUR'); assert.equal(m.currencyOf(undefined), 'INR'); });
ok('India-only paths', () => { assert.ok(m.isIndiaOnlyPath('/learn/casebook/x')); assert.ok(m.isIndiaOnlyPath('/gd-briefs')); assert.ok(!m.isIndiaOnlyPath('/learning')); assert.ok(!m.isIndiaOnlyPath('/practice')); assert.ok(m.isIndiaOnlyPath('/decks/mckinsey-deck')); assert.ok(m.isIndiaOnlyPath('/deck-vault')); assert.ok(!m.isIndiaOnlyPath('/decksx')); assert.ok(!m.isIndiaOnlyPath('/api/decks/x/og')); });
ok('crawlers are recognised', () => { for (const ua of ['Mozilla/5.0 (compatible; Googlebot/2.1)', 'GPTBot/1.1', 'Mozilla/5.0 (compatible; bingbot/2.0)', 'PerplexityBot', 'ClaudeBot/1.0', '']) assert.ok(m.isCrawler(ua), ua); });
ok('browsers are not crawlers', () => { for (const ua of ['Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Version/17.5 Safari/605.1.15', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36']) assert.ok(!m.isCrawler(ua), ua); });
ok('US day starts at New York midnight (EDT)', () => assert.equal(m.zonedMidnightIso('2026-09-25', 'America/New_York'), '2026-09-25T04:00:00.000Z'));
ok('US day starts at New York midnight (EST)', () => assert.equal(m.zonedMidnightIso('2026-12-01', 'America/New_York'), '2026-12-01T05:00:00.000Z'));
ok('IST midnight', () => assert.equal(m.zonedMidnightIso('2026-09-25', 'Asia/Kolkata'), '2026-09-24T18:30:00.000Z'));
ok('marketToday US vs IN around IST midnight', () => {
  const at = new Date('2026-09-24T19:00:00Z'); // 00:30 IST on the 25th, 15:00 in New York on the 24th
  assert.equal(m.marketToday('IN', at), '2026-09-25');
  assert.equal(m.marketToday('US', at), '2026-09-24');
});
ok('money labels', () => { assert.equal(m.formatMoney(599, 'INR'), '₹599'); assert.equal(m.formatMoney(49, 'USD'), '$49'); assert.equal(m.formatMoney(119, 'EUR'), '€119'); });

console.log('pricing');
ok('India prices unchanged (2-arg callers)', () => { assert.equal(t.priceFor('lite'), 299); assert.equal(t.priceFor('pro', 'quarter'), 1499); assert.equal(t.TIER_PRICES.pro, 599); });
ok('US monthly $29 / $49', () => { assert.equal(t.priceFor('lite', 'monthly', 'USD'), 29); assert.equal(t.priceFor('pro', 'monthly', 'USD'), 49); });
ok('US quarter $69 / $119', () => { assert.equal(t.priceFor('lite', 'quarter', 'USD'), 69); assert.equal(t.priceFor('pro', 'quarter', 'USD'), 119); });
ok('EUR mirrors USD numbers', () => { assert.equal(t.priceFor('pro', 'quarter', 'EUR'), 119); });
ok('minor units', () => { assert.equal(t.listMinor('pro', 'monthly', 'USD'), 4900); assert.equal(t.listMinor('pro', 'monthly'), 59900); });
ok('3-month plan is a real discount in every currency', () => {
  for (const c of ['INR', 'USD', 'EUR']) for (const tier of ['lite', 'pro']) {
    const s = t.periodSavingPct(tier, 'quarter', c);
    assert.ok(s >= 15 && s <= 25, `${c} ${tier} saving ${s}%`);
  }
});
ok('per-month shows cents for USD', () => assert.equal(t.perMonthEquivalent('pro', 'quarter', 'USD'), 39.67));
ok('INR per-month still whole rupees', () => assert.equal(t.perMonthEquivalent('pro', 'quarter'), 500));
ok('coupon maths untouched (INR)', () => assert.equal(t.discountedPaise('pro', 'monthly', 10), 53910));
ok('Pro > Lite everywhere', () => { for (const c of ['INR', 'USD', 'EUR']) for (const p of ['monthly', 'quarter']) assert.ok(t.priceFor('pro', p, c) > t.priceFor('lite', p, c)); });

ok('pricing-intl agrees with tier.priceFor (one table)', () => {
  for (const c of ['USD', 'EUR']) for (const tier of ['lite', 'pro']) for (const p of ['monthly', 'quarter']) {
    assert.equal(pi.intlPriceFor(tier, p, c), t.priceFor(tier, p, c));
    assert.equal(pi.intlPerMonthEquivalent(tier, p, c), t.perMonthEquivalent(tier, p, c));
    assert.equal(pi.intlPeriodSavingPct(tier, p, c), t.periodSavingPct(tier, p, c));
  }
});
ok('pricing-intl carries no rupee figures', () => {
  const src = readFileSync(join(root, 'lib', 'pricing-intl.ts'), 'utf8');
  assert.ok(!/299|599|749|1499|₹/.test(src.replace(/\/\*[\s\S]*?\*\//g, '')), 'INR numbers leaked into pricing-intl');
});
ok('C9: international copy matches TIER_LIMITS', () => {
  assert.equal(plans.INTL_CLARIFICATIONS.free, t.TIER_LIMITS.free.maxHintQuestions);
  assert.equal(plans.INTL_CLARIFICATIONS.lite, t.TIER_LIMITS.lite.maxHintQuestions);
  assert.equal(plans.INTL_CLARIFICATIONS.pro, t.TIER_LIMITS.pro.maxHintQuestions);
});
ok('tier re-exports still work', () => { assert.equal(typeof t.effectiveTier, 'function'); assert.equal(t.BILLING_PERIOD_DAYS.quarter, 91); assert.equal(t.periodDays('quarter'), 91); assert.equal(t.TIER_LABELS.pro, 'Pro'); });

console.log('domestic wall');
ok('INR + international card → violation', () => assert.equal(pr.violatesDomesticWall('INR', { international: true }), true));
ok('INR + domestic → fine', () => assert.equal(pr.violatesDomesticWall('INR', { international: false }), false));
ok('INR + field missing → fine (UPI/netbanking)', () => assert.equal(pr.violatesDomesticWall('INR', {}), false));
ok('USD + international card → fine', () => assert.equal(pr.violatesDomesticWall('USD', { international: true }), false));
ok('order currency parsing', () => { assert.equal(pr.orderCurrency({ currency: 'usd' }), 'USD'); assert.equal(pr.orderCurrency({ currency: 'GBP' }), null); assert.equal(pr.orderCurrency(null), null); });

console.log(`\n${n} checks passed.`);
