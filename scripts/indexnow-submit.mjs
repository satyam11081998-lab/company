#!/usr/bin/env node
/**
 * IndexNow submit — tells Bing (and through it Copilot and ChatGPT search,
 * which partners with Microsoft), plus Yandex, Seznam, Naver and the other
 * IndexNow engines, that URLs on mece.in are new or changed. Google does not
 * use IndexNow; Search Console + the sitemap cover Google.
 *
 * Ownership is proven by the key file served at https://mece.in/<KEY>.txt
 * (public/<KEY>.txt). The key is public by design — that is how the protocol
 * verifies a host — and it only lets someone submit URLs on this host.
 *
 * Usage (after a production deploy):
 *   node scripts/indexnow-submit.mjs                 # every URL in the live sitemap
 *   node scripts/indexnow-submit.mjs --only /us      # only URLs under a path prefix
 *   node scripts/indexnow-submit.mjs --dry-run       # print what would be sent
 *   node scripts/indexnow-submit.mjs https://mece.in/us/learn https://mece.in/us/learn/what-is-mece
 *
 * Needs Node 18+ (global fetch). No dependencies.
 */

const HOST = 'mece.in';
const SITE = `https://${HOST}`;
const KEY = '32253abc39d938d2742a313856778bbf';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH = 10000; // protocol maximum per request

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
const explicit = args.filter((a, i) => /^https?:\/\//.test(a) && (onlyIdx < 0 || i !== onlyIdx + 1));

async function sitemapUrls() {
  const res = await fetch(`${SITE}/sitemap.xml`, { headers: { 'User-Agent': 'mece-indexnow-script' } });
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function verifyKeyFile() {
  const res = await fetch(KEY_LOCATION);
  const body = res.ok ? (await res.text()).trim() : '';
  if (body !== KEY) {
    throw new Error(`Key file check failed: ${KEY_LOCATION} returned ${res.status} "${body.slice(0, 40)}". Deploy public/${KEY}.txt first.`);
  }
}

async function main() {
  let urls = explicit.length ? explicit : await sitemapUrls();
  urls = urls.filter((u) => u.startsWith(SITE));
  if (only) urls = urls.filter((u) => new URL(u).pathname === only || new URL(u).pathname.startsWith(`${only}/`));
  urls = [...new Set(urls)];
  if (!urls.length) {
    console.log('No URLs to submit.');
    return;
  }
  console.log(`${urls.length} URL(s)${only ? ` under ${only}` : ''}.`);
  if (dryRun) {
    urls.forEach((u) => console.log(`  ${u}`));
    return;
  }
  await verifyKeyFile();
  for (let i = 0; i < urls.length; i += BATCH) {
    const urlList = urls.slice(i, i + BATCH);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
    });
    // 200 = accepted, 202 = accepted pending key validation. 4xx = fix the request.
    console.log(`Batch ${i / BATCH + 1}: HTTP ${res.status} ${res.statusText}`);
    if (res.status >= 400) {
      console.error(await res.text());
      process.exitCode = 1;
    }
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
