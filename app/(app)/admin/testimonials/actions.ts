'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { UserRow, TestimonialStatus } from '@/lib/types';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!(data as Partial<UserRow>)?.is_admin) throw new Error('Forbidden');
}

export interface TestimonialInput {
  name: string;
  school?: string;
  placement?: string;
  quote: string;
  avatar_url?: string | null;
  linkedin_url?: string | null;
  position?: number;
}

type Result = { success: boolean; error?: string; id?: string };

function revalidate() {
  revalidatePath('/admin/testimonials');
  revalidatePath('/'); // landing carousel
  revalidatePath('/about');
}

export async function createTestimonial(input: TestimonialInput): Promise<Result> {
  try {
    await requireAdmin();
    if (!input.name?.trim() || !input.quote?.trim()) return { success: false, error: 'Name and quote are required.' };
    const svc = createServiceClient();
    const { data, error } = await svc
      .from('testimonials')
      .insert({
        name: input.name.trim(),
        school: input.school?.trim() ?? '',
        placement: input.placement?.trim() ?? '',
        quote: input.quote.trim(),
        avatar_url: input.avatar_url || null,
        linkedin_url: input.linkedin_url || null,
        position: input.position ?? 0,
        status: 'published', // admin-added go live immediately
        source: 'admin',
      })
      .select('id')
      .single();
    if (error) return { success: false, error: error.message };
    revalidate();
    return { success: true, id: data?.id as string };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateTestimonial(id: string, input: Partial<TestimonialInput>): Promise<Result> {
  try {
    await requireAdmin();
    const svc = createServiceClient();
    const { error } = await svc
      .from('testimonials')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function setTestimonialStatus(id: string, status: TestimonialStatus): Promise<Result> {
  try {
    await requireAdmin();
    const svc = createServiceClient();
    const { error } = await svc
      .from('testimonials')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteTestimonial(id: string): Promise<Result> {
  try {
    await requireAdmin();
    const svc = createServiceClient();
    const { error } = await svc.from('testimonials').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

/**
 * Best-effort OpenGraph preview for a pasted URL (name/photo). Works for many
 * generic sites. NOTE: LinkedIn profiles are gated behind a login wall and
 * block bots, so this will usually return nothing for LinkedIn — paste the URL
 * for the badge and upload the photo manually instead.
 */
export async function fetchOgPreview(url: string): Promise<{ image?: string; title?: string; error?: string }> {
  try {
    await requireAdmin();
    if (!/^https?:\/\//i.test(url)) return { error: 'Enter a full http(s) URL.' };
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MECEBot/1.0)' },
      redirect: 'follow',
      cache: 'no-store',
    });
    if (!res.ok) return { error: `Site returned ${res.status} (often the case for LinkedIn — upload the photo instead).` };
    const html = await res.text();
    const og = (prop: string) =>
      html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1] ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i'))?.[1];
    return { image: og('image'), title: og('title') };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not fetch.' };
  }
}
