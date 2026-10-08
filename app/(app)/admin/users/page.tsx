import { redirect } from 'next/navigation';

/**
 * Users moved into the CRM (2026-10): every account is a contact (new sign-ups
 * appear within minutes), the account tools (demo flag, market, sign out
 * everywhere, sessions, submissions) are on the contact page for admins, and
 * revenue + sign-ups are on CRM home. This old route forwards there.
 */
export const dynamic = 'force-dynamic';

export default function AdminUsersPage() {
  redirect('/crm/m/contacts');
}
