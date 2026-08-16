import { createClient } from '@/lib/supabase/server';
import DeckUploadManager from '@/components/admin/deck-upload-manager';

// Admin gating happens in the parent admin layout.
export const dynamic = 'force-dynamic';

export interface VaultDeckRow {
  id: string;
  title: string;
  source_kind: string;
  competition: string;
  organizer?: string;
  year?: number | null;
  result: string;
  case_type: string;
  round_type: string;
  file_type: string;
  description: string;
  storage_path: string;
  is_active: boolean;
  slug: string | null;
  page_count: number | null;
  free_pages: number | null;
  summary: string | null;
  summary_generated_at: string | null;
  pages_rendered_at: string | null;
  is_indexable: boolean;
  sort: number;
  created_at: string;
}

export default async function AdminDecksPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('deck_skeletons')
    .select('id, title, source_kind, competition, organizer, year, result, case_type, round_type, file_type, description, storage_path, is_active, slug, page_count, free_pages, summary, summary_generated_at, pages_rendered_at, is_indexable, sort, created_at')
    .order('created_at', { ascending: false });

  const decks = (data as VaultDeckRow[] | null) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 text-foreground">Deck Vault — Admin</h1>
        <p className="mt-2 text-body text-muted-foreground max-w-2xl">
          Upload case decks one by one. Each upload goes to the private storage bucket and
          appears instantly in the paid Deck Vault for buyers.
        </p>
      </div>
      <DeckUploadManager initialDecks={decks} />
    </div>
  );
}
