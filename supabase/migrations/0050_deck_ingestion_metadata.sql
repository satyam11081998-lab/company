-- ============================================================================
-- 0050: Deck Ingestion Pipeline Metadata & Queryable Indexing
-- Extends deck_skeletons to support automated batch ingestion, SHA-256 deduplication,
-- normalized naming, hierarchical Google Drive syncing, and structured SQL queries.
-- Additive & fully idempotent. Safe to run repeatedly.
-- ============================================================================

-- 1. Ingestion, deduplication, and file tracking columns -----------------------
alter table public.deck_skeletons
  add column if not exists file_hash text,
  add column if not exists original_filename text,
  add column if not exists normalized_filename text,
  add column if not exists company text not null default '',
  add column if not exists industry text not null default '',
  add column if not exists function text not null default '',
  add column if not exists geography text not null default 'India',
  add column if not exists difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  add column if not exists executive_summary text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists ai_summary text,
  add column if not exists gist jsonb,
  add column if not exists gdrive_file_id text,
  add column if not exists gdrive_folder_id text,
  add column if not exists gdrive_url text,
  add column if not exists gdrive_path text,
  add column if not exists processing_status text not null default 'completed' check (processing_status in ('pending', 'processing', 'completed', 'needs_review', 'failed', 'skipped')),
  add column if not exists classification_confidence jsonb,
  add column if not exists metadata_confidence numeric check (metadata_confidence is null or (metadata_confidence >= 0 and metadata_confidence <= 1)),
  add column if not exists error_message text,
  add column if not exists processed_at timestamptz;

-- 2. Indexes for deduplication, status queries, and taxonomy filters ----------
create index if not exists deck_skeletons_file_hash_idx
  on public.deck_skeletons (file_hash) where (file_hash is not null);

create index if not exists deck_skeletons_processing_status_idx
  on public.deck_skeletons (processing_status);

create index if not exists deck_skeletons_industry_idx
  on public.deck_skeletons (industry);

create index if not exists deck_skeletons_company_idx
  on public.deck_skeletons (company);

create index if not exists deck_skeletons_case_type_idx
  on public.deck_skeletons (case_type);

create index if not exists deck_skeletons_year_idx
  on public.deck_skeletons (year);

-- 3. Update public deck reader function to include new enriched fields --------
drop function if exists public.get_public_deck(text);

create or replace function public.get_public_deck(p_slug text)
returns table (
  id uuid,
  slug text,
  title text,
  source_kind text,
  competition text,
  organizer text,
  company text,
  industry text,
  function text,
  result text,
  case_type text,
  round_type text,
  difficulty text,
  file_type text,
  description text,
  page_count int,
  free_pages int,
  effective_free_pages int,
  summary text,
  executive_summary text,
  seo_title text,
  seo_description text,
  ai_summary text,
  summary_generated_at timestamptz,
  pages_rendered_at timestamptz,
  is_indexable boolean,
  is_active boolean,
  year int,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.id, d.slug, d.title, d.source_kind, d.competition, d.organizer,
    d.company, d.industry, d.function,
    d.result, d.case_type, d.round_type, d.difficulty, d.file_type, d.description,
    d.page_count, d.free_pages,
    public.effective_free_pages(d.free_pages, d.page_count),
    d.summary, d.executive_summary, d.seo_title, d.seo_description, d.ai_summary,
    d.summary_generated_at, d.pages_rendered_at,
    d.is_indexable, d.is_active, d.year, d.created_at
  from public.deck_skeletons d
  where d.slug = p_slug
    and d.is_active = true;
$$;

grant execute on function public.get_public_deck(text) to anon, authenticated;
