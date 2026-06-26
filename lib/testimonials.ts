/**
 * Testimonials + team ("brains behind") shown on the landing and /about pages.
 *
 * These are now DB-backed (supabase: `testimonials`, `team_members`). The two
 * arrays below are the verified real profiles, kept ONLY as a render fallback
 * so the site is never empty if the DB is unreachable or a request runs before
 * the seed. Admins manage the live list from /admin/testimonials and /admin/team.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { TestimonialRow, TeamMemberRow } from '@/lib/types';

export interface Testimonial {
  id: string;
  name: string;
  school: string;
  placement: string;      // e.g. "Summer Intern @ Bain"
  quote: string;
  avatar_url: string | null;
  linkedin_url?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  school: string;
  placement: string;
  quote?: string;
  avatar_url: string | null;
  linkedin_url?: string;
}

/** Verified real testimonials — fallback only (DB is source of truth). */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Satyam Kumar',
    school: "IMI Delhi PGDM '27",
    placement: 'Ex-TCS | XAT - 99.4 | Mercer Finquest 2025 Winner',
    quote:
      'MECE caught flaws in my hypothesis-driven thinking that no one else had pointed out. Used it daily for three weeks before placement season.',
    avatar_url: '/testimonials/satyam.jpg',
    linkedin_url: 'https://www.linkedin.com/in/satyam-kumar-8254b4157/',
  },
  {
    id: 't2',
    name: 'Mohit Kumar Raj',
    school: "TISS HRM & LR '27",
    placement: 'Summer Intern @ Hindustan Coca-Cola Beverages | Ex-Marine Engineer',
    quote:
      'The 6-dimension scoring is brutally honest. In mock interviews my friends always went easy on me; here nothing slipped through, and it pushed me to write much tighter syntheses.',
    avatar_url: '/testimonials/mohit.jpg',
    linkedin_url: 'https://www.linkedin.com/in/mohit-kumar-raj-b895b6201/',
  },
];

/** Same two, as the team fallback. */
export const TEAM_FALLBACK: TeamMember[] = TESTIMONIALS.map((t) => ({
  id: `team-${t.id}`,
  name: t.name,
  school: t.school,
  placement: t.placement,
  avatar_url: t.avatar_url,
  linkedin_url: t.linkedin_url,
}));

function mapTestimonial(r: TestimonialRow): Testimonial {
  return {
    id: r.id,
    name: r.name,
    school: r.school,
    placement: r.placement,
    quote: r.quote,
    avatar_url: r.avatar_url,
    linkedin_url: r.linkedin_url ?? undefined,
  };
}

function mapTeam(r: TeamMemberRow): TeamMember {
  return {
    id: r.id,
    name: r.name,
    school: r.school,
    placement: r.placement,
    quote: r.quote || undefined,
    avatar_url: r.avatar_url,
    linkedin_url: r.linkedin_url ?? undefined,
  };
}

/** Published testimonials, ordered. Falls back to the verified two if empty. */
export async function getPublishedTestimonials(supabase: SupabaseClient): Promise<Testimonial[]> {
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('status', 'published')
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });
  const rows = (data as TestimonialRow[] | null) ?? [];
  return rows.length ? rows.map(mapTestimonial) : TESTIMONIALS;
}

/** Team members, ordered. Falls back to the verified two if empty. */
export async function getTeamMembers(supabase: SupabaseClient): Promise<TeamMember[]> {
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });
  const rows = (data as TeamMemberRow[] | null) ?? [];
  return rows.length ? rows.map(mapTeam) : TEAM_FALLBACK;
}
