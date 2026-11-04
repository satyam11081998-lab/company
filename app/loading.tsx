import BrandLoader from '@/components/brand-loader';

/**
 * The wait state for every public route — home, pricing, insights, glossary, decks,
 * learn-static, us, about, methodology, the legal pages.
 *
 * WHY THIS FILE DID NOT EXIST AND HAD TO
 *
 * In the App Router a navigation paints nothing until the server responds UNLESS the
 * changed segment sits under a loading.tsx. There was one at (app)/ and a few under
 * (app)/crm, so the signed-in app felt instant — and the entire public tree had none.
 * Clicking Pricing or an Insights post left the old page frozen with no feedback, which
 * reads as a dead click: the user clicks again, and the second click is the one that
 * feels slow. Nothing was actually slower than it is now; it simply said nothing.
 *
 * A root loading.tsx is the smallest correct fix rather than a per-page patch: it is the
 * boundary every public segment inherits, and any route that wants something better
 * (a skeleton shaped like its own layout) still wins by putting a loading.tsx closer to
 * itself. (app)/loading.tsx already does exactly that, so the signed-in skeletons are
 * untouched by this.
 *
 * The mark fades in only after ~140ms, so a fast navigation shows nothing at all. The
 * point is to kill the frozen feeling on slow loads without adding a flicker to quick
 * ones — a loader that flashes on every click is worse than the problem it solves.
 */
export default function Loading() {
  return <BrandLoader fullscreen size={84} />;
}
