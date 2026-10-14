/**
 * Staff area paths (2026-10-09): the admin console (/admin) and the CRM (/crm)
 * have their own sign-in page, /admin/login, separate from the learner /login.
 *
 * Pure and edge-safe: the middleware imports this. The server-side "is this
 * account staff?" check lives in lib/staff-access.ts.
 */
import { sanitizeNextPath } from '@/lib/constants';

/** The staff sign-in page. Public; never indexed (robots.ts disallows /admin). */
export const ADMIN_LOGIN_PATH = '/admin/login';

/** The kind of staff account: an admin (users.is_admin) or an active CRM team member. */
export type StaffKind = 'admin' | 'crm';

const under = (p: string, root: string) => p === root || p.startsWith(root + '/');

/** True for the admin console, the CRM, and anything below them. */
export function isStaffPath(pathname: string): boolean {
  return under(pathname, '/admin') || under(pathname, '/crm');
}

/**
 * Where a staff member goes after signing in. `next` is honoured only when it
 * is a staff page this kind of account may open; anything else (another part
 * of the site, the sign-in page itself, an absolute or protocol-relative URL,
 * a path with dot segments, doubled or encoded slashes) falls back to the
 * account's home: /admin for admins, /crm for CRM team members.
 *
 * The PATH is checked strictly and must already be in normal form; the QUERY
 * is only checked for characters that have no business in a link, so real deep
 * links like /crm/reports?return=%2Fcrm%2Fx survive.
 */
export function staffDestination(next: string | null | undefined, kind: StaffKind): string {
  const home = kind === 'admin' ? '/admin' : '/crm';
  const n = sanitizeNextPath(next ?? null, '');
  if (!n || n.length > 512 || /[\s<>"'`\\]/.test(n) || n.includes('#')) return home;

  const q = n.indexOf('?');
  const path = q === -1 ? n : n.slice(0, q);
  const query = q === -1 ? '' : n.slice(q);
  // Encoded dots/slashes/backslashes, doubled slashes or dot segments in the path: refuse.
  if (/%2e|%2f|%5c/i.test(path) || path.includes('//') || /(^|\/)\.\.?(\/|$)/.test(path)) return home;
  let normal: string;
  try {
    const u = new URL(path, 'http://staff.invalid');
    if (u.origin !== 'http://staff.invalid') return home;
    normal = u.pathname;
  } catch {
    return home;
  }
  if (normal !== path) return home; // only paths already in normal form
  if (under(path, ADMIN_LOGIN_PATH)) return home;
  if (under(path, '/crm')) return path + query;
  if (kind === 'admin' && under(path, '/admin')) return path + query;
  return home;
}
