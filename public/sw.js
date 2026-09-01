/*
 * MECE PWA service worker — deliberately conservative.
 * - Pages (navigations): NETWORK-FIRST, so SSR/SEO/auth HTML is never stale.
 *   Falls back to /offline.html only when the network is unreachable.
 * - Static hashed assets (/_next/static, /icons, fonts, images): cache-first
 *   (safe because Next content-hashes these URLs).
 * - API, auth, _next/data and all cross-origin (Supabase, Razorpay, analytics):
 *   passed straight through, never cached.
 */
const VERSION = 'mece-v1';
const STATIC_CACHE = 'mece-static-' + VERSION;
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Only same-origin; let everything cross-origin pass through untouched.
  if (url.origin !== self.location.origin) return;

  // Never intercept dynamic/server surfaces.
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/_next/data')
  ) return;

  // Page navigations: network-first, offline fallback.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Static, content-hashed assets: cache-first.
  const isStatic =
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons/') ||
    /\.(?:css|js|woff2?|ttf|otf|png|jpe?g|svg|webp|gif|ico)$/.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }
  // Everything else: pass through to the network by default.
});
