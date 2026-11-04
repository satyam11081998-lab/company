-- 0080_case_frameworks.sql
-- The worked approach for a case: the tree a strong candidate builds, the facts that
-- matter, what to notice, and what to recommend. One per case, authored or generated from
-- the case's OWN solution, and shown only once it has been approved.
--
-- WHY A TABLE AND NOT A FIELD ON `cases`
-- Three reasons, each of which would force it out of `cases` on its own: it has its own
-- review lifecycle (draft -> approved) independent of the case being published; it is
-- large JSON that would be dragged into every case list query; and it accumulates
-- candidate contributions, which need their own rows and their own moderation.
--
-- PROVENANCE MATTERS HERE
-- `source` and `model` are not bookkeeping. A framework generated from a solution is a
-- guess that reads with the authority of a model answer, and a wrong model answer teaches
-- the error -- strictly worse than showing nothing. So generated rows land as 'draft',
-- only 'approved' is ever served to a candidate, and the row records what produced it so a
-- bad generation run can be found and retired by model name rather than by hand.

create table if not exists public.case_frameworks (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid not null references public.cases(id) on delete cascade,

  -- The approach tree. Deliberately the SAME node shape services/structure_tree.py emits
  -- for the live diagram: {id, label, value, op, role, formula, kind, children}. One shape
  -- means one renderer, and it means the worked answer and the candidate's own working
  -- are visibly the same kind of object -- which is the moment the framework stops being a
  -- picture and starts being a comparison.
  --   kind='driver' marks the branch that actually explained the case. The casebook pages
  --   this is modelled on carry that in colour; this product's design contract reserves
  --   colour, so it is carried by weight instead.
  tree        jsonb not null,

  -- The rails either side of the diagram, each an array of short strings.
  facts             jsonb not null default '[]'::jsonb,  -- what the candidate is told
  assumptions       jsonb not null default '[]'::jsonb,  -- what a good answer assumes
  interviewee_notes jsonb not null default '[]'::jsonb,  -- what the coach wants them to see
  observations      jsonb not null default '[]'::jsonb,  -- what a strong candidate notices
  recommendations   jsonb not null default '[]'::jsonb,  -- where the case lands

  source      text not null default 'generated'
              check (source in ('authored', 'generated', 'imported')),
  status      text not null default 'draft'
              check (status in ('draft', 'approved', 'retired')),
  model       text,                       -- what generated it, for recall by run
  approved_by uuid references auth.users(id),
  approved_at timestamptz,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One live framework per case. Partial, so retired and draft revisions can sit beside the
-- approved one and a regeneration does not have to destroy the thing currently serving.
create unique index if not exists uq_case_frameworks_live
  on public.case_frameworks (case_id) where status = 'approved';
create index if not exists idx_case_frameworks_case
  on public.case_frameworks (case_id, status);
create index if not exists idx_case_frameworks_review
  on public.case_frameworks (created_at desc) where status = 'draft';

comment on table public.case_frameworks is
  'The worked approach per case. Generated from the case''s own solution, never from '
  'third-party casebook material. Only status=approved is served: a wrong model answer '
  'teaches the error and is worse than showing nothing. See services/case_framework.py.';

alter table public.case_frameworks enable row level security;

-- A candidate may read an approved framework; nothing else is exposed. Draft rows are
-- service-role only, which is what keeps an unreviewed generation off the site.
drop policy if exists case_frameworks_read_approved on public.case_frameworks;
create policy case_frameworks_read_approved on public.case_frameworks
  for select using (status = 'approved');

-- ------------------------------------------------------------------ contributed notes
-- What candidates add after solving: another way to split it, an assumption worth
-- stating, a trap they fell into. This is the half that compounds -- the framework is
-- fixed, the margin notes get better with every person who practises.
--
-- EVERY NOTE IS REVIEWED BEFORE ANYONE ELSE SEES IT. A note is shown next to a worked
-- answer, so it inherits that authority; an unreviewed one is an unsigned edit to the
-- teaching material. Auto-approval by the same kind of model that wrote the framework
-- would be a system grading its own homework, so `auto_verdict` is advisory and
-- `status` is what gates display.
create table if not exists public.case_framework_notes (
  id           uuid primary key default gen_random_uuid(),
  case_id      uuid not null references public.cases(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,

  body         text not null check (length(btrim(body)) between 12 and 600),
  kind         text not null default 'observation'
               check (kind in ('observation', 'assumption', 'alternative', 'trap')),

  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'rejected')),
  -- What the adversarial check thought, and why. Kept even on approval: a reviewer
  -- wants to see where the automatic read disagreed with the human one.
  auto_verdict text check (auto_verdict in ('accept', 'reject', 'unsure')),
  auto_reason  text,
  reviewed_by  uuid references auth.users(id),
  reviewed_at  timestamptz,

  helpful_count integer not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists idx_framework_notes_live
  on public.case_framework_notes (case_id, helpful_count desc) where status = 'approved';
create index if not exists idx_framework_notes_queue
  on public.case_framework_notes (created_at desc) where status = 'pending';
-- One person does not get to post the same thought twice on one case.
create unique index if not exists uq_framework_notes_author
  on public.case_framework_notes (case_id, user_id, md5(lower(btrim(body))));

alter table public.case_framework_notes enable row level security;

drop policy if exists framework_notes_read on public.case_framework_notes;
create policy framework_notes_read on public.case_framework_notes
  for select using (status = 'approved' or user_id = auth.uid());

drop policy if exists framework_notes_insert on public.case_framework_notes;
create policy framework_notes_insert on public.case_framework_notes
  for insert with check (user_id = auth.uid());
-- No update or delete policy: a candidate cannot edit a note into something else after it
-- has been approved, which is the obvious way to get unreviewed text onto the page.

notify pgrst, 'reload schema';
