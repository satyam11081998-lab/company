'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { UserRow } from '@/lib/types';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!(data as Partial<UserRow>)?.is_admin) throw new Error('Forbidden');
}

export interface TeamInput {
  name: string;
  school?: string;
  placement?: string;
  quote?: string;
  avatar_url?: string | null;
  linkedin_url?: string | null;
  position?: number;
}

type Result = { success: boolean; error?: string; id?: string };

function revalidate() {
  revalidatePath('/admin/team');
  revalidatePath('/about');
}

export async function createTeamMember(input: TeamInput): Promise<Result> {
  try {
    await requireAdmin();
    if (!input.name?.trim()) return { success: false, error: 'Name is required.' };
    const svc = createServiceClient();
    const { data, error } = await svc
      .from('team_members')
      .insert({
        name: input.name.trim(),
        school: input.school?.trim() ?? '',
        placement: input.placement?.trim() ?? '',
        quote: input.quote?.trim() ?? '',
        avatar_url: input.avatar_url || null,
        linkedin_url: input.linkedin_url || null,
        position: input.position ?? 0,
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

export async function updateTeamMember(id: string, input: Partial<TeamInput>): Promise<Result> {
  try {
    await requireAdmin();
    const svc = createServiceClient();
    const { error } = await svc
      .from('team_members')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteTeamMember(id: string): Promise<Result> {
  try {
    await requireAdmin();
    const svc = createServiceClient();
    const { error } = await svc.from('team_members').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
