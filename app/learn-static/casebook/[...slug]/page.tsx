import CasebookRoute, {
  generateMetadata as casebookMetadata,
  generateStaticParams as casebookStaticParams,
} from '@/app/(app)/learn/casebook/[[...slug]]/page';

/**
 * Static logged-out copy of /learn/casebook/<slug> — see app/learn-static/layout.tsx.
 * Same component, same metadata (canonical stays /learn/casebook/...), every
 * page prerendered at build. The bare /learn/casebook (a redirect) is not
 * mirrored; the middleware only rewrites real page slugs.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return casebookStaticParams().filter((p) => p.slug.length > 0);
}

export const generateMetadata = casebookMetadata;

export default CasebookRoute;
