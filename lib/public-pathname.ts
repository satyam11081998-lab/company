/**
 * The static logged-out copy of the learning pages is prerendered at
 * /learn-static/... and served at /learn/... through a middleware rewrite
 * (app/learn-static/layout.tsx). While it is prerendered, usePathname()
 * returns the /learn-static/... path; in the browser it returns the real
 * /learn/... URL. Components whose OUTPUT depends on the pathname (the
 * Casebook nav's active item, the open section) map it back with this, so the
 * prerendered HTML is the same as the live page's and hydration matches.
 * Every other path is returned unchanged.
 */
const STATIC_PREFIX = '/learn-static';

export function toPublicPathname(pathname: string): string;
export function toPublicPathname(pathname: string | null): string | null;
export function toPublicPathname(pathname: string | null): string | null {
  if (!pathname) return pathname;
  if (pathname === STATIC_PREFIX || pathname.startsWith(STATIC_PREFIX + '/')) {
    return '/learn' + pathname.slice(STATIC_PREFIX.length);
  }
  return pathname;
}
