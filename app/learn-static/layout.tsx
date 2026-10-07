import GuestChrome from '@/components/guest/guest-chrome';

/**
 * STATIC LOGGED-OUT COPY of the public learning pages (2026-10-07).
 *
 * Why it exists: everything under app/(app) is `force-dynamic` (the layout
 * reads the session), so every Casebook page view — mostly crawlers — ran a
 * full server render. The Casebook was the most expensive route on the
 * account's Fluid Active CPU. The content itself is identical for every
 * logged-out reader, so it is prerendered here once, at build time.
 *
 * How it is reached: ONLY through the middleware (lib/supabase/middleware.ts).
 * A request for /learn/casebook/<slug> or /learn/mece-framework that carries
 * no Supabase session cookie (crawlers, logged-out readers) is REWRITTEN here;
 * the address bar keeps the /learn/... URL. Anyone with a session (signed in,
 * or an anonymous guest) still gets the live app/(app) page with their own
 * nav. A direct request for /learn-static/... is redirected to /learn/....
 *
 * What it renders: the same GuestChrome the (app) layout gives a logged-out
 * reader of /learn (no preview nav, India chrome), around the same page
 * modules — see the page files, which re-export the originals. Nothing here
 * reads cookies, headers or the database, so no user data can ever be baked
 * into these pages.
 */
export default function LearnStaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestChrome showPreviewNav={false} intl={false}>
      {children}
    </GuestChrome>
  );
}
