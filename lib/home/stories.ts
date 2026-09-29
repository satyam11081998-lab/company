import type { Testimonial } from '@/lib/testimonials';

/**
 * Success stories lead with an outcome: testimonials whose placement line
 * names an internship, a role ("@ Company"), a PPO or an offer come first;
 * everything else keeps its admin-set order after them.
 */
export function orderStories(items: Testimonial[]): Testimonial[] {
  const placed = (t: Testimonial) => /intern|@|\bppo\b|offer|placed/i.test(t.placement ?? '');
  return [...items.filter(placed), ...items.filter((t) => !placed(t))];
}
