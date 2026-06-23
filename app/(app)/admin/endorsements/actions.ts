'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { UserRow, EndorsementStatus } from '@/lib/types';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!(data as Partial<UserRow>)?.is_admin) throw new Error('Forbidden');
}

export interface EndorsementInput {
  name: string;
  role?: string;
  organization?: string;
  credential?: string;
  quote: string;
  avatar_url?: string | null;
  linkedin_url?: string | null;
  verified?: boolean;
  position?: number;
}

type Result = { success: boolean; error?: string; id?: string };

function revalidate() {
  revalidatePath('/admin/endorsements');
  revalidatePath('/'); // landing endorsements section
}

export async function createEndorsement(input: EndorsementInput): Promise<Result> {
  try {
    await requireAdmin();
    if (!input.name?.trim() || !input.quote?.trim()) {
      return { success: false, error: 'Name and quote are required.' };
    }
    const svc = createServiceClient();
    const { data, error } = await svc
      .from('endorsements')
      .insert({
        name: input.name.trim(),
        role: input.role?.trim() ?? '',
        organization: input.organization?.trim() ?? '',
        credential: input.credential?.trim() ?? '',
        quote: input.quote.trim(),
        avatar_url: input.avatar_url || null,
        linkedin_url: input.linkedin_url || null,
        verified: input.verified ?? false,
        position: input.position ?? 0,
        status: 'published',
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

export async function updateEndorsement(id: string, input: Partial<EndorsementInput>): Promise<Result> {
  try {
    await requireAdmin();
    const svc = createServiceClient();
    const { error } = await svc
      .from('endorsements')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function setEndorsementStatus(id: string, status: EndorsementStatus): Promise<Result> {
  try {
    await requireAdmin();
    const svc = createServiceClient();
    const { error } = await svc
      .from('endorsements')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function setEndorsementVerified(id: string, verified: boolean): Promise<Result> {
  try {
    await requireAdmin();
    const svc = createServiceClient();
    const { error } = await svc
      .from('endorsements')
      .update({ verified, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteEndorsement(id: string): Promise<Result> {
  try {
    await requireAdmin();
    const svc = createServiceClient();
    const { error } = await svc.from('endorsements').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
