import type { SupabaseClient } from '@supabase/supabase-js';
import type { CheatSheetItemRow } from '@/lib/types';

const DEFAULT_TITLE = 'My Cheat Sheet';

export async function getOrCreateDefaultSheet(
  supabase: SupabaseClient, userId: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('cheat_sheets').select('id').eq('user_id', userId)
    .order('created_at', { ascending: true }).limit(1).maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from('cheat_sheets').insert({ user_id: userId, title: DEFAULT_TITLE })
    .select('id').single();
  if (error || !created) return null; // non-pro is blocked here by the RLS insert policy
  return created.id as string;
}

export async function listCheatSheetItems(
  supabase: SupabaseClient, userId: string,
): Promise<CheatSheetItemRow[]> {
  const { data } = await supabase
    .from('cheat_sheet_items').select('*').eq('user_id', userId)
    .order('source_topic', { ascending: true })
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });
  return (data as CheatSheetItemRow[] | null) ?? [];
}
