-- =====================================================================
-- RUN-ALL-growth-kit.sql — one file, run top to bottom.
-- Generated 2026-08-06.
--
-- EXECUTION-TESTED, not just parsed: this file is run end to end against a
-- real PostgreSQL instance with ON_ERROR_STOP=1, on THREE schema variants
-- (display_x/x_pos node columns, source_id/src edge columns) before shipping.
--
-- ORDER
--   0. set the demo email                  <- the ONLY thing you edit
--   1. migrations/0044_growth_kit.sql      schema
--   2. seed-skill-graph.sql                22 constellation nodes + edges
--   3. seed-cases-constellation.sql        tags cases onto those nodes
--   4. seed-demo-account.sql               the demo account's Pro history
--   5. verification                        one table showing what landed
--
-- PREREQUISITE — deliberately NOT in this file:
--   The demo LOGIN must already exist. Run supabase/create-demo-login.sql
--   first. It needs a password typed in, and this repo is public, so no
--   credential belongs in a file meant to be committed.
--
-- IDEMPOTENT
--   Every step is safe to re-run. Step 4 deletes only the rows a previous run
--   of ITSELF created (stamped feedback_json->>'seed' = 'demo') before
--   re-inserting. It never touches a row it did not create.
--
-- OUTPUT
--   The Supabase SQL editor shows only the LAST result set, so RAISE NOTICE
--   lines will not appear. Section 5 is your confirmation.
-- =====================================================================


-- =====================================================================
-- STEP 0 of 5 · THE ONE THING YOU EDIT
-- =====================================================================

select set_config('mece.demo_email', 'demo@mece.in', false);   -- <- EDIT


-- =====================================================================
-- STEP 1 of 5 · MIGRATION 0044 — schema for the whole growth kit
-- Additive + idempotent. Nothing here drops data.
-- source: supabase/migrations/0044_growth_kit.sql
-- =====================================================================

-- 0044_growth_kit.sql — Influencer marketing kit.
-- 2026-08-06
--
-- Four independent, additive features. NOTHING here rewrites an existing
-- column, drops a policy, or changes an existing check constraint. Fully
-- idempotent: safe to run twice.
--
--   1. users.is_demo / users.phone  — demo accounts excluded from the public
--      leaderboard + cohort aggregates; phone captured for admin support.
--   2. discount_coupons extended for PUBLIC (influencer) codes — nullable
--      user_id, commission %, redemption cap + counter. User-locked deck-vault
--      coupons keep behaving exactly as they do today (C7 v1 semantics are a
--      strict subset of C7 v2).
--   3. coupon_redemptions — per-redemption money ledger. Service-role only;
--      the commission an influencer earns is NEVER readable by any client.
--   4. user_sessions — one active session per user (Netflix-style device lock).
--   5. shared_cheat_sheets + public `cheat-sheets` bucket — a downloaded cheat
--      sheet can be published at mece.in/s/<id> and opened by anyone.
--
-- Run AFTER 0041, 0042, 0043.

-- ═══════════════════════════════════════════════════════════════════════
-- 1 · users — demo flag + phone
-- ═══════════════════════════════════════════════════════════════════════

alter table public.users add column if not exists is_demo boolean not null default false;
alter table public.users add column if not exists phone text;

-- Demo lookups are rare; a partial index keeps it near-free.
create index if not exists users_is_demo_idx on public.users (is_demo) where is_demo = true;
-- Admin "who joined when" list sorts by signup date.
create index if not exists users_created_at_idx on public.users (created_at desc);

-- Extend the privileged-column guard from 0006 so a logged-in user cannot
-- flag themselves as a demo account (which would hide them from the
-- leaderboard while keeping their points). Same function, same trigger —
-- only `is_demo` is added to the reverted set.
create or replace function public.guard_user_privileged_cols()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() is distinct from 'service_role' then
    new.subscription_tier       := old.subscription_tier;
    new.subscription_started_at := old.subscription_started_at;
    new.subscription_expires_at := old.subscription_expires_at;
    new.points                  := old.points;
    new.is_admin                := old.is_admin;
    new.is_demo                 := old.is_demo;
  end if;
  return new;
end $$;

-- leaderboard_top() is the anon-callable board. Demo accounts must not appear.
-- Signature and return shape are unchanged, so every existing caller is safe.
create or replace function public.leaderboard_top(p_limit int default 50)
returns table(id uuid, name text, avatar_url text, points int)
language sql security definer set search_path = public as $$
  select id, name, avatar_url, points
  from public.users
  where coalesce(is_demo, false) = false
  order by points desc nulls last
  limit greatest(1, least(p_limit, 200));
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- 2 · discount_coupons — public / influencer codes  (C7 → v2)
-- ═══════════════════════════════════════════════════════════════════════
-- A coupon is now one of two shapes:
--   user_id NOT NULL  → user-locked, single-use  (deck-vault rewards, unchanged)
--   user_id NULL      → public, multi-use        (influencer codes, new)
--
-- The existing partial unique index `discount_coupons_one_active` is scoped to
-- `source = 'deck_vault'`, so public codes never collide with it. NULL user_id
-- is also ignored by that index by construction.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'discount_coupons'
      and column_name = 'user_id' and is_nullable = 'NO'
  ) then
    alter table public.discount_coupons alter column user_id drop not null;
  end if;
end $$;

alter table public.discount_coupons add column if not exists owner_name       text;
alter table public.discount_coupons add column if not exists owner_handle     text;
alter table public.discount_coupons add column if not exists owner_contact    text;
-- Percent of LIST price paid out to the coupon owner. Never shown to buyers.
alter table public.discount_coupons add column if not exists commission_pct   numeric(5,2) not null default 0;
-- NULL = unlimited redemptions. User-locked coupons are capped at 1 below.
alter table public.discount_coupons add column if not exists max_redemptions  int;
alter table public.discount_coupons add column if not exists redemption_count int not null default 0;
alter table public.discount_coupons add column if not exists admin_note       text not null default '';

-- Backfill: every pre-existing coupon is a single-use deck-vault reward.
update public.discount_coupons
   set max_redemptions = 1
 where max_redemptions is null
   and user_id is not null;

alter table public.discount_coupons drop constraint if exists discount_coupons_commission_pct_check;
alter table public.discount_coupons
  add constraint discount_coupons_commission_pct_check check (commission_pct >= 0 and commission_pct <= 50);

create index if not exists discount_coupons_source_idx on public.discount_coupons (source);
create index if not exists discount_coupons_owner_idx  on public.discount_coupons (owner_name);

-- RLS is untouched: `discount_coupons_select_own` (auth.uid() = user_id) still
-- applies. Public codes have user_id NULL, so `auth.uid() = user_id` is NULL →
-- not true → no client can enumerate them. Validation is service-role only.

-- ═══════════════════════════════════════════════════════════════════════
-- 3 · coupon_redemptions — money ledger (admin eyes only)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.coupon_redemptions (
  id                  uuid primary key default gen_random_uuid(),
  coupon_id           uuid not null references public.discount_coupons(id) on delete cascade,
  code                text not null,
  user_id             uuid null references public.users(id) on delete set null,
  razorpay_order_id   text not null default '',
  -- Unique: the same payment can never be counted twice, so /verify and the
  -- webhook racing each other cannot double-credit an influencer.
  razorpay_payment_id text not null,
  tier                text not null,
  period              text not null,
  list_price_paise    int  not null,
  paid_paise          int  not null,
  discount_paise      int  not null,
  commission_pct      numeric(5,2) not null default 0,
  commission_paise    int  not null default 0,
  payout_status       text not null default 'pending'
                        check (payout_status in ('pending', 'paid', 'void')),
  paid_out_at         timestamptz null,
  created_at          timestamptz not null default now()
);

create unique index if not exists coupon_redemptions_payment_key
  on public.coupon_redemptions (razorpay_payment_id);
create index if not exists coupon_redemptions_coupon_idx on public.coupon_redemptions (coupon_id, created_at desc);
create index if not exists coupon_redemptions_user_idx   on public.coupon_redemptions (user_id);

alter table public.coupon_redemptions enable row level security;
-- Deliberately NO policies: RLS on with zero policies = deny all for anon and
-- authenticated. Only the service role (admin console) can read commissions.

-- ═══════════════════════════════════════════════════════════════════════
-- 4 · user_sessions — one active device at a time
-- ═══════════════════════════════════════════════════════════════════════
-- `session_id` is the Supabase JWT `session_id` claim (stable for the life of
-- a login, rotates on re-login). A row with revoked_at IS NULL is a live login.

create table if not exists public.user_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  session_id   text not null,
  ip           text null,
  city         text null,
  region       text null,
  country      text null,
  user_agent   text null,
  device_label text null,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at   timestamptz null,
  revoked_by   text null
);

create unique index if not exists user_sessions_session_key on public.user_sessions (session_id);
create index if not exists user_sessions_active_idx on public.user_sessions (user_id, last_seen_at desc)
  where revoked_at is null;

alter table public.user_sessions enable row level security;
-- Owner may READ their own sessions (the conflict screen names the other
-- device). All writes are service-role.
drop policy if exists user_sessions_select_own on public.user_sessions;
create policy user_sessions_select_own on public.user_sessions
  for select using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 5 · shared_cheat_sheets — public, watermarked PDF at mece.in/s/<id>
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.shared_cheat_sheets (
  id           text primary key,                       -- short url-safe slug
  user_id      uuid null references public.users(id) on delete set null,
  title        text not null default 'MECE Cheat Sheet',
  storage_path text not null,
  point_count  int  not null default 0,
  view_count   int  not null default 0,
  created_at   timestamptz not null default now(),
  revoked_at   timestamptz null
);

create index if not exists shared_cheat_sheets_user_idx on public.shared_cheat_sheets (user_id, created_at desc);

alter table public.shared_cheat_sheets enable row level security;
-- Owner reads their own share history. The public /s/<id> route resolves the
-- row with the service role, so no anon select policy is needed (and none is
-- given — the table lists who shared what).
drop policy if exists shared_cheat_sheets_select_own on public.shared_cheat_sheets;
create policy shared_cheat_sheets_select_own on public.shared_cheat_sheets
  for select using (auth.uid() = user_id);

-- PRIVATE bucket, deliberately. The sheet is public to *readers*, but it is
-- served by `/s/<id>/file`, which streams the object with the service role
-- after checking `revoked_at`. A public bucket would hand out a permanent
-- direct object URL that bypasses that check — revoking a shared sheet would
-- not actually revoke anything. No storage policies are created either, so
-- anon and authenticated clients cannot read or write it at all.
insert into storage.buckets (id, name, public)
values ('cheat-sheets', 'cheat-sheets', false)
on conflict (id) do update set public = false;

-- ═══════════════════════════════════════════════════════════════════════
-- 6 · Seed the first influencer code
-- ═══════════════════════════════════════════════════════════════════════
-- 10% off for the buyer, 5% of LIST price accrued to Anushka. Unlimited uses,
-- valid one year. Edit or revoke from /admin/coupons.

insert into public.discount_coupons
  (code, user_id, discount_pct, tier_scope, source, status, expires_at,
   owner_name, owner_handle, commission_pct, max_redemptions, admin_note)
values
  ('ANUSHKA10', null, 10, 'any', 'influencer', 'active', now() + interval '365 days',
   'Anushka', 'anushka', 5, null, 'Launch influencer collab — Instagram reels')
on conflict (code) do nothing;

-- =====================================================================
-- STEP 2 of 5 · SEED — skill constellation topology (22 nodes + edges)
-- Schema-adaptive: detects display_x/x_pos and source_id/src at runtime.
-- source: supabase/seed-skill-graph.sql
-- =====================================================================

-- =====================================================================
-- Seed: Skill Constellation Graph — 22 nodes + their edges.
--
-- SCHEMA-ADAPTIVE ON PURPOSE.
-- Two column namings for this table exist in the wild:
--   · live / production → display_x / display_y
--   · migration 0004    → x_pos / y_pos
-- The previous version hardcoded x_pos and hard-failed against the live
-- schema with `column "x_pos" does not exist`. It now detects the real
-- column names at runtime and builds the INSERT to match, so it works on
-- either and cannot rot when one of them changes.
--
-- Idempotent: upserts by id, and edges use ON CONFLICT DO NOTHING.
-- =====================================================================

do $$
declare
  v_x     text;
  v_y     text;
  v_boss  text;
  v_src   text;
  v_dst   text;
  v_sql   text;
  n       jsonb;
  e       jsonb;
  v_nodes int := 0;
  v_edges int := 0;

  -- [id, cluster, label, x, y, is_boss]
  c_nodes jsonb := $j$[
    ["p1","prof","P&L drivers",14,22,false],
    ["p2","prof","Cost structure",22,14,false],
    ["p3","prof","Margin defense",30,26,false],
    ["p4","prof","Combined ratio",18,34,true],
    ["s1","size","Top-down",60,14,false],
    ["s2","size","Bottom-up",70,20,false],
    ["s3","size","Sanity checks",78,12,false],
    ["s4","size","Cross-validation",84,26,false],
    ["r1","pri","Value-based",76,46,false],
    ["r2","pri","Bundle pricing",86,54,false],
    ["r3","pri","Elasticity",70,60,false],
    ["e1","ent","Market attractive",22,56,false],
    ["e2","ent","Mode of entry",14,64,false],
    ["e3","ent","Competitive resp.",28,70,false],
    ["m1","ma","Synergies",44,78,false],
    ["m2","ma","Valuation",56,80,false],
    ["m3","ma","Integration",38,86,false],
    ["o1","ops","Throughput",8,80,false],
    ["o2","ops","Bottleneck",4,70,false],
    ["c1","soft","Structuring",44,22,false],
    ["c2","soft","Communication",50,12,false],
    ["c3","soft","Hypothesis-led",38,14,false]
  ]$j$::jsonb;

  c_edges jsonb := $j$[
    ["p1","p2"],["p1","p3"],["p3","p4"],["p2","c3"],["c3","c1"],["c1","c2"],
    ["s1","s2"],["s2","s3"],["s2","s4"],["c1","s1"],
    ["s4","r1"],["r1","r2"],["r2","r3"],
    ["p4","e1"],["e1","e2"],["e1","e3"],["e3","m1"],
    ["m1","m2"],["m1","m3"],
    ["e2","o1"],["o1","o2"]
  ]$j$::jsonb;
begin
  if to_regclass('public.skill_nodes') is null then
    raise exception 'public.skill_nodes does not exist — run migration 0004 first.';
  end if;

  ------------------------------------------------------------------
  -- Detect the real column names
  ------------------------------------------------------------------
  select c.column_name into v_x
    from information_schema.columns c
   where c.table_schema = 'public' and c.table_name = 'skill_nodes'
     and c.column_name = any (array['display_x', 'x_pos', 'x'])
   order by array_position(array['display_x','x_pos','x'], c.column_name)
   limit 1;

  select c.column_name into v_y
    from information_schema.columns c
   where c.table_schema = 'public' and c.table_name = 'skill_nodes'
     and c.column_name = any (array['display_y', 'y_pos', 'y'])
   order by array_position(array['display_y','y_pos','y'], c.column_name)
   limit 1;

  select c.column_name into v_boss
    from information_schema.columns c
   where c.table_schema = 'public' and c.table_name = 'skill_nodes'
     and c.column_name = 'is_boss'
   limit 1;

  select c.column_name into v_src
    from information_schema.columns c
   where c.table_schema = 'public' and c.table_name = 'skill_edges'
     and c.column_name = any (array['source_id', 'src', 'from_id'])
   order by array_position(array['source_id','src','from_id'], c.column_name)
   limit 1;

  select c.column_name into v_dst
    from information_schema.columns c
   where c.table_schema = 'public' and c.table_name = 'skill_edges'
     and c.column_name = any (array['target_id', 'dst', 'to_id'])
   order by array_position(array['target_id','dst','to_id'], c.column_name)
   limit 1;

  if v_x is null or v_y is null then
    raise exception 'skill_nodes has no recognised position columns.'
      using hint = 'Looked for display_x/x_pos/x and display_y/y_pos/y. Inspect with: '
                || 'select column_name from information_schema.columns where table_name = ''skill_nodes'';';
  end if;

  raise notice 'skill_nodes positions: % / %  ·  skill_edges: % -> %', v_x, v_y, v_src, v_dst;

  ------------------------------------------------------------------
  -- Nodes
  ------------------------------------------------------------------
  v_sql := format(
    'insert into public.skill_nodes (id, cluster, label, %I, %I%s) values ($1, $2, $3, $4, $5%s)
       on conflict (id) do update set cluster = excluded.cluster, label = excluded.label,
         %I = excluded.%I, %I = excluded.%I%s',
    v_x, v_y,
    case when v_boss is null then '' else ', ' || quote_ident(v_boss) end,
    case when v_boss is null then '' else ', $6' end,
    v_x, v_x, v_y, v_y,
    case when v_boss is null then '' else format(', %I = excluded.%I', v_boss, v_boss) end
  );

  for n in select * from jsonb_array_elements(c_nodes) loop
    if v_boss is null then
      execute v_sql using n->>0, n->>1, n->>2, (n->>3)::int, (n->>4)::int;
    else
      execute v_sql using n->>0, n->>1, n->>2, (n->>3)::int, (n->>4)::int, (n->>5)::boolean;
    end if;
    v_nodes := v_nodes + 1;
  end loop;

  ------------------------------------------------------------------
  -- Edges
  ------------------------------------------------------------------
  if to_regclass('public.skill_edges') is not null and v_src is not null and v_dst is not null then
    v_sql := format(
      'insert into public.skill_edges (%I, %I) values ($1, $2) on conflict do nothing',
      v_src, v_dst
    );
    for e in select * from jsonb_array_elements(c_edges) loop
      execute v_sql using e->>0, e->>1;
      v_edges := v_edges + 1;
    end loop;
  else
    raise notice 'skill_edges missing or column names unrecognised — edges skipped.';
  end if;

  raise notice 'Seeded % nodes, % edges.', v_nodes, v_edges;
end $$;

-- =====================================================================
-- STEP 3 of 5 · SEED — tag cases onto constellation nodes
-- A node with no case behind it can never be mastered.
-- source: supabase/seed-cases-constellation.sql
-- =====================================================================

-- =====================================================================
-- Constellation case seed — owner directive 2026-06-07
--
-- Makes the constellation actually navigable end-to-end:
--   1. Round-robin existing cases across skill_nodes within their cluster
--      so every node that already has data backing it ends up tagged.
--   2. Insert starter cases for the four clusters that had no case_type
--      match (pri / ma / ops / soft) so users clicking those nodes don't
--      land on an empty practice list.
--
-- Idempotent: re-runnable safely.
--   - Backfill only touches rows where skill_node IS NULL.
--   - Starter inserts use ON CONFLICT (code) DO NOTHING so a second run
--     is a no-op.
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- Step 1: round-robin existing cases across nodes within their cluster.
-- ─────────────────────────────────────────────────────────────────────
-- Each case_type (profitability, market_sizing, growth) maps to one
-- cluster; within that cluster we spread cases across the cluster's
-- nodes using a deterministic modulo on row_number.

with ranked as (
  select
    c.id,
    c.type,
    row_number() over (partition by c.type order by c.created_at, c.id) - 1 as rn
  from public.cases c
  where c.skill_node is null
    and c.is_active = true
    and c.type in ('profitability', 'market_sizing', 'growth')
),
node_lookup as (
  -- Distinct nodes per cluster, with a stable index per node for the
  -- modulo step below.
  select
    cluster,
    id as node_id,
    row_number() over (partition by cluster order by id) - 1 as idx,
    count(*) over (partition by cluster) as cluster_size
  from public.skill_nodes
),
case_to_cluster as (
  select
    r.id,
    case
      when r.type = 'profitability' then 'prof'
      when r.type = 'market_sizing' then 'size'
      when r.type = 'growth'        then 'ent'
    end as cluster,
    r.rn
  from ranked r
),
assignments as (
  select
    c.id,
    nl.node_id,
    c.cluster
  from case_to_cluster c
  join node_lookup nl
    on nl.cluster = c.cluster
   and nl.idx = (c.rn % nl.cluster_size)
)
update public.cases
   set skill_node    = a.node_id,
       skill_cluster = coalesce(public.cases.skill_cluster, a.cluster)
  from assignments a
 where public.cases.id = a.id
   and public.cases.skill_node is null;

-- ─────────────────────────────────────────────────────────────────────
-- Step 2: starter cases for clusters with no matching case_type.
-- ─────────────────────────────────────────────────────────────────────
-- These four clusters (pricing, M&A, operations, foundations) have no
-- corresponding `case_type` in the CHECK constraint, so we author cases
-- under the closest existing type and tag them with the real cluster.
-- Each insert has a stable `code` so the upsert is idempotent and the
-- cases are easy to find / replace later.

-- Helper: list of starter cases. Title is short; content is a real
-- 15-minute prompt so the user can actually solve it.
insert into public.cases (code, title, type, difficulty, content, is_active, skill_node, skill_cluster, interview_meta)
values
  -- ── Pricing (pri) ───────────────────────────────────────────────
  (
    'PRI-001',
    'Bundle pricing for a 4G+OTT telco combo',
    'profitability',
    'medium',
    E'# Bundle pricing for a 4G+OTT telco combo\n\n**Client situation.** A national telco operator is launching a bundle: 4G data + 3 OTT subscriptions (1 video, 1 music, 1 sports). The marketing team has proposed three price points (₹399 / ₹499 / ₹699 a month) and wants a recommendation.\n\n## Your task (≈ 15 min)\n\n1. **What does the bundle cost the telco?** Decompose the unit economics — data, OTT rev-share, customer-acquisition cost.\n2. **What''s the right willingness-to-pay anchor?** Estimate it. State your assumptions.\n3. **Which of the three price points wins?** Defend with a margin / volume tradeoff.\n4. **What''s the one risk you''d flag to the CFO?**',
    true,
    'r2',
    'pri',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'PRI-002',
    'Value-based pricing for an enterprise SaaS upgrade',
    'profitability',
    'hard',
    E'# Value-based pricing for an enterprise SaaS upgrade\n\n**Client situation.** A B2B analytics SaaS is releasing a Pro tier (real-time dashboards, custom alerts). Current Standard tier is $49/seat/mo. The CRO wants a defensible Pro price and a migration plan.\n\n## Your task (≈ 15 min)\n\n1. **Quantify the value gap.** What does the Pro tier save / earn for a typical customer? Pick a representative segment.\n2. **What''s the upper bound on price?** Use a value-based framework — not cost-plus.\n3. **Recommend the price and the migration nudge.** How aggressive should the upsell be?\n4. **What metric do you track in week 4 to know it''s working?**',
    true,
    'r1',
    'pri',
    '{"firm":"McKinsey","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'PRI-003',
    'Demand elasticity for a quick-commerce category',
    'profitability',
    'medium',
    E'# Demand elasticity for a quick-commerce category\n\n**Client situation.** A 10-minute grocery delivery app is testing price elasticity on packaged snacks (₹50 SKUs). A/B tests show a 10% price drop lifts units 18%.\n\n## Your task (≈ 15 min)\n\n1. **What''s the implied elasticity?** Is the category elastic or inelastic at this margin?\n2. **Should they drop the price permanently?** Consider basket effects, not just per-SKU revenue.\n3. **What''s the second-order risk?** Competitor response, supplier reaction, customer expectation.\n4. **One sentence to the founder.**',
    true,
    'r3',
    'pri',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),

  -- ── M&A (ma) ────────────────────────────────────────────────────
  (
    'MA-001',
    'Synergy case: acquiring a niche cybersecurity firm',
    'profitability',
    'hard',
    E'# Synergy case: acquiring a niche cybersecurity firm\n\n**Client situation.** A large enterprise software vendor is bidding for a 200-person cybersecurity startup with $40M ARR. The thesis is cross-sell to existing enterprise accounts.\n\n## Your task (≈ 15 min)\n\n1. **Size the cross-sell synergy.** How many accounts? What attach rate? What ASP?\n2. **What synergies are hard, what''s soft?** Separate cost from revenue, defendable from speculative.\n3. **What''s the breakeven multiple?** If they paid 10x ARR, when does it pay back?\n4. **What''s the deal-killer you''d raise in DD?**',
    true,
    'm1',
    'ma',
    '{"firm":"BCG","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'MA-002',
    'Valuation: a regional retail chain takeover',
    'profitability',
    'medium',
    E'# Valuation: a regional retail chain takeover\n\n**Client situation.** A PE firm is bidding for a 60-store regional supermarket chain. Standalone EBITDA is ₹240 cr. Asking price is ₹2,400 cr (10x).\n\n## Your task (≈ 15 min)\n\n1. **Is 10x EBITDA reasonable for this category?** What''s the comp set?\n2. **Where''s the value-creation lever?** Same-store growth, new stores, margin expansion, or exit multiple?\n3. **What''s your bid?** Justify with one or two of the levers above.\n4. **What''s the single biggest assumption that could be wrong?**',
    true,
    'm2',
    'ma',
    '{"firm":"Bain","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'MA-003',
    'Post-merger integration of two consumer brands',
    'growth',
    'medium',
    E'# Post-merger integration of two consumer brands\n\n**Client situation.** Two mid-size FMCG brands (skincare + haircare) just merged. CEO wants a 100-day integration plan that protects revenue and unlocks ₹80 cr of cost synergy.\n\n## Your task (≈ 15 min)\n\n1. **Where''s the ₹80 cr coming from?** Decompose by function (procurement, supply chain, headcount, marketing).\n2. **What do you NOT touch in the first 100 days?** Revenue-protecting decisions.\n3. **Who owns each workstream?** One sentence on governance.\n4. **What''s the one early signal that integration is going off the rails?**',
    true,
    'm3',
    'ma',
    '{"firm":"McKinsey","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),

  -- ── Operations (ops) ────────────────────────────────────────────
  (
    'OPS-001',
    'Throughput at a regional dairy processing plant',
    'profitability',
    'medium',
    E'# Throughput at a regional dairy processing plant\n\n**Client situation.** A cooperative dairy''s flagship plant processes 4 lakh litres/day. Demand has grown 25% YoY; the plant is at 92% utilisation. CEO wants more throughput without a greenfield expansion.\n\n## Your task (≈ 15 min)\n\n1. **Where''s the bottleneck?** Walk through receiving → pasteurisation → packaging → dispatch.\n2. **What''s the quickest 15% capacity gain?** Process change, shift change, capex — rank by ROI and time.\n3. **What breaks if you push past 100% utilisation?** Quality, maintenance, staffing.\n4. **What do you tell the CEO in one line?**',
    true,
    'o1',
    'ops',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'OPS-002',
    'Identifying the bottleneck in an e-commerce warehouse',
    'profitability',
    'medium',
    E'# Identifying the bottleneck in an e-commerce warehouse\n\n**Client situation.** A pure-play e-commerce warehouse ships 12k orders/day but promises 24-hour delivery. SLA breaches have climbed from 2% to 9% in three months.\n\n## Your task (≈ 15 min)\n\n1. **Where''s the breach happening?** Pick → pack → ship → last-mile.\n2. **Diagnose the cause.** Volume, layout, staffing, software, or carrier?\n3. **What''s the fix this week vs the fix this quarter?**\n4. **One metric you''d watch daily to know it''s working.**',
    true,
    'o2',
    'ops',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),

  -- ── Foundations (soft) ──────────────────────────────────────────
  (
    'SOFT-001',
    'Structure a profitability case from a one-line brief',
    'profitability',
    'easy',
    E'# Structure a profitability case from a one-line brief\n\n**Client situation.** "Our profits are down. Fix it."\n\nThat''s the entire brief from the CEO of a mid-size insurance company. No data, no context.\n\n## Your task (≈ 15 min)\n\n1. **What are your first three clarifying questions?** Order them — most important first.\n2. **Lay out a MECE structure for diagnosing this.** Revenue side and cost side.\n3. **Where would you dig first, and why?** Use industry priors.\n4. **How would you know in one hour whether your hypothesis is right?**',
    true,
    'c1',
    'soft',
    '{"firm":"McKinsey","round":"associate","est_minutes":15,"points_reward":75,"source":"seed"}'::jsonb
  ),
  (
    'SOFT-002',
    'Communicate a tough recommendation in 60 seconds',
    'profitability',
    'easy',
    E'# Communicate a tough recommendation in 60 seconds\n\n**Client situation.** You''ve concluded that a client''s pet project (a new flagship store) should be killed. You have 60 seconds with their CEO at the end of an unrelated meeting.\n\n## Your task (≈ 15 min)\n\n1. **What''s your opening sentence?** One line, no fluff.\n2. **What are the two pieces of evidence you lead with?** Numbers, not adjectives.\n3. **What''s the alternative you propose so the conversation doesn''t end at "no"?**\n4. **What objection do you pre-empt before the CEO can raise it?**',
    true,
    'c2',
    'soft',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":75,"source":"seed"}'::jsonb
  ),
  (
    'SOFT-003',
    'Hypothesis-led: a SaaS company''s churn just spiked',
    'profitability',
    'medium',
    E'# Hypothesis-led: a SaaS company''s churn just spiked\n\n**Client situation.** Monthly churn jumped from 2.1% to 3.4% over Q3. CRO wants a diagnosis by Friday.\n\n## Your task (≈ 15 min)\n\n1. **State your top-three hypotheses.** Be specific: not "churn went up", but a mechanism.\n2. **For each, what''s the one data cut that proves or kills it?**\n3. **Which do you investigate first, and why?**\n4. **If all three are wrong, what would you look at next?**',
    true,
    'c3',
    'soft',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  )
on conflict (code) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- Sanity counts — uncomment to verify after running.
-- ─────────────────────────────────────────────────────────────────────
-- select skill_cluster, count(*) from public.cases where is_active = true group by skill_cluster order by 1;
-- select skill_node, count(*) from public.cases where is_active = true and skill_node is not null group by skill_node order by 1;

-- =====================================================================
-- STEP 4 of 5 · SEED — the demo account's history, tier and points
-- Reads the email from the setting configured in STEP 0.
-- source: supabase/seed-demo-account.sql
-- =====================================================================

-- =====================================================================
-- seed-demo-account.sql — the influencer / press demo account.
-- 2026-08-06
--
-- Produces a REAL, fully working Pro account whose dashboard is computed
-- from real rows, not mocked: skill constellation ~77% mastered, a points
-- total that is the exact sum of its first-attempt scores, a 12-week
-- heatmap, badges, a stocked cheat sheet, and guesstimate skills.
--
-- ── RUN ORDER ────────────────────────────────────────────────────────
--   0. Run migration 0044_growth_kit.sql   (adds users.is_demo)
--   1. Sign the demo account up NORMALLY at mece.in/signup and finish
--      onboarding. Auth identities cannot be minted safely from SQL.
--   2. Run supabase/seed-skill-graph.sql        (22 nodes + edges)
--   3. Run supabase/seed-cases-constellation.sql (tags cases onto nodes)
--   4. Set v_email below, then run THIS file.
--
--   Steps 2 and 3 are idempotent and already in the repo. Step 2 is what
--   switches the constellation from its built-in mock to live data — the
--   reader (lib/dashboard/skill-graph.ts) already prefers live rows and
--   falls back to the mock only when skill_nodes is empty. Rollback is
--   `delete from public.skill_edges; delete from public.skill_nodes;`
--
-- ── IDEMPOTENT ───────────────────────────────────────────────────────
-- Every row this writes is stamped `feedback_json->>'seed' = 'demo'` (or
-- source 'MECE demo brief'), and the script deletes its own previous rows
-- before re-inserting. Re-run it as often as you like. It NEVER touches a
-- row it did not create, and never touches another user.
-- =====================================================================

do $$
declare
  -- ── EDIT THIS ──────────────────────────────────────────────────────
  -- Reads the session setting `mece.demo_email` when present (RUN-ALL sets it
  -- once at the top so there is a single edit point), otherwise falls back to
  -- the literal below. Edit the literal for a standalone run.
  v_email    text := coalesce(nullif(current_setting('mece.demo_email', true), ''), 'demo@mece.in');
  -- Only applied when the account has no name yet (e.g. created from the
  -- Supabase dashboard rather than /signup). An existing name is never overwritten.
  v_name     text := 'Ananya Rao';
  -- Nodes to show as MASTERED. 17 of 22 = 77% of the constellation lit.
  -- Drop one for 16/22 = 73%. Mastery rule (lib/dashboard/skill-graph.ts):
  -- best score >= 75 AND at least 2 scored attempts on that node.
  v_done     text[] := array['p1','p2','p3','p4','c1','c2','c3',
                             's1','s2','s3','r1','r2',
                             'e1','e2','e3','m1','o1'];
  -- Nodes shown as IN PROGRESS: attempted, best score below the 75 bar.
  v_partial  text[] := array['s4','r3','m2'];
  -- ───────────────────────────────────────────────────────────────────

  v_user     uuid;
  v_node     text;
  v_case     uuid;
  v_cases    uuid[];
  v_sub      uuid;
  v_score    int;
  v_scores   int[];
  v_i        int;
  v_idx      int := 0;
  v_first    boolean;
  v_attempt  int;
  v_when     timestamptz;
  v_points   int;
  v_missing  text[] := '{}';
  v_made     int := 0;
  v_hint     text;
  v_guard_off boolean := false;
begin
  ------------------------------------------------------------------
  -- 0. Resolve the account
  ------------------------------------------------------------------
  select id into v_user from public.users where lower(email) = lower(v_email);
  if v_user is null then
    -- Show the most recent accounts so you can point v_email at an existing
    -- one instead of creating a new account, if that is what you meant.
    select string_agg(email, ', ') into v_hint
      from (select email from public.users order by created_at desc limit 6) t;
    raise exception 'No user with email %.', v_email
      using hint =
        'Sign that account up at /signup and finish onboarding, then re-run. '
        || 'Or point v_email (top of this block) at an existing account. Most recent signups: '
        || coalesce(v_hint, '(no users in this database yet)');
  end if;

  if not exists (select 1 from public.skill_nodes limit 1) then
    raise exception
      'public.skill_nodes is empty — run supabase/seed-skill-graph.sql first, or the constellation will render its built-in mock and ignore this seed.';
  end if;

  ------------------------------------------------------------------
  -- 0b. Get past trg_guard_user_cols (migration 0006)
  ------------------------------------------------------------------
  -- That trigger SILENTLY reverts subscription_tier / subscription_*_at /
  -- points / is_admin / is_demo for any caller whose auth.role() is not
  -- 'service_role'. The Supabase SQL editor has no JWT, so auth.role() is
  -- NULL and every privileged write below would report success and change
  -- nothing. Transaction-local, so it resets the moment this block ends.
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  begin
    perform set_config('request.jwt.claim.role', 'service_role', true);
  exception when others then null;
  end;

  -- Belt and braces: if auth.role() still does not read back as service_role
  -- (different GoTrue helper definition, or the function is absent), turn the
  -- trigger off for THIS TRANSACTION. Safe: DDL is transactional in Postgres,
  -- so if anything below raises, the disable rolls back with it and the guard
  -- can never be left off. It is re-enabled explicitly before the assertion.
  begin
    if coalesce(auth.role(), '') is distinct from 'service_role' then
      execute 'alter table public.users disable trigger trg_guard_user_cols';
      v_guard_off := true;
    end if;
  exception when others then
    null;   -- no rights or no auth.role(): the assertion at the end will catch it
  end;

  ------------------------------------------------------------------
  -- 1. Wipe only what a previous run of THIS script created
  ------------------------------------------------------------------
  -- case_attempts cascade off submissions (ON DELETE CASCADE).
  delete from public.submissions
   where user_id = v_user and feedback_json->>'seed' = 'demo';
  delete from public.cheatsheet_points
   where user_id = v_user and source = 'MECE demo brief';

  ------------------------------------------------------------------
  -- 2. Profile — Pro, flagged as a demo account, onboarding complete
  ------------------------------------------------------------------
  -- is_demo keeps this account off the public leaderboard, out of the
  -- "N aspirants" headcount, out of the cohort benchmark and out of the
  -- live activity tape. It stays a completely normal account to use.
  update public.users
     set is_demo                  = true,
         name                     = coalesce(nullif(btrim(name), ''), v_name),
         subscription_tier        = 'pro',
         subscription_started_at  = now() - interval '84 days',
         subscription_expires_at  = now() + interval '365 days',
         -- MUST stay under 31. dashboard-client.tsx:119 flips the hero to the
         -- streak variant when streak > 30, which renders a 140px number that
         -- swallows the tile. Below the line you get the readiness/case hero.
         streak_count             = 18,
         streak_last_date         = (now() at time zone 'Asia/Kolkata')::date,
         onboarding_completed_at  = coalesce(onboarding_completed_at, now() - interval '90 days'),
         placement_focus          = coalesce(placement_focus, 'final'),
         batch_year               = coalesce(batch_year, extract(year from now())::int + 1),
         weekly_hours_target      = coalesce(weekly_hours_target, 10),
         goal_text                = coalesce(nullif(goal_text, ''), 'Convert a Day 1 consulting offer'),
         show_linkedin            = coalesce(show_linkedin, false)
   where id = v_user;

  ------------------------------------------------------------------
  -- 3. Mastered nodes — 3 scored attempts each, best comfortably >= 75
  ------------------------------------------------------------------
  foreach v_node in array v_done loop
    select array_agg(id) into v_cases
      from (select id from public.cases
             where skill_node = v_node and is_active = true
             order by created_at, id limit 3) t;

    if v_cases is null then
      v_missing := v_missing || v_node;
      continue;
    end if;

    v_scores := array[78, 86, 91];

    for v_i in 1..3 loop
      -- Reuse cases round-robin when a node has fewer than 3 authored.
      v_case  := v_cases[((v_i - 1) % array_length(v_cases, 1)) + 1];
      v_score := v_scores[v_i];

      select count(*) + 1 into v_attempt
        from public.case_attempts where user_id = v_user and case_id = v_case;
      v_first := (v_attempt = 1);

      -- Spread across the last 12 weeks, most recent first, so the
      -- activity heatmap fills in densely instead of one hot day.
      v_when := now() - make_interval(days => (v_idx % 84), hours => (v_idx % 9) + 9);
      v_idx  := v_idx + 1;

      insert into public.submissions (user_id, case_id, answer_text, score, feedback_json, created_at)
      values (
        v_user, v_case,
        'Demo submission. Structured the problem into revenue and cost branches, sized the '
        || 'addressable pool bottom-up, pressure-tested the two assumptions the answer actually '
        || 'turns on, and closed with a recommendation plus the one risk worth flagging.',
        v_score,
        jsonb_build_object(
          'seed', 'demo',
          'rubric', 'case',
          'breakdown', jsonb_build_object(
            'structure',         round(25 * v_score / 100.0),
            'quantitative',      round(20 * v_score / 100.0),
            'synthesis',         round(20 * v_score / 100.0),
            'business_judgment', round(15 * v_score / 100.0),
            'creativity',        round(10 * v_score / 100.0),
            'presence',          round(10 * v_score / 100.0)
          ),
          'strengths', jsonb_build_array(
            'Clean MECE break before touching any number',
            'Quantified the recommendation instead of asserting it'),
          'improvements', jsonb_build_array(
            'State the hypothesis earlier so the analysis has a spine'),
          'summary', 'Structured, numerate and decisive. Lead with the answer next time.'
        ),
        v_when
      )
      returning id into v_sub;

      insert into public.case_attempts
        (user_id, case_id, submission_id, attempt_number, is_first_attempt, created_at)
      values (v_user, v_case, v_sub, v_attempt, v_first, v_when);

      v_made := v_made + 1;
    end loop;
  end loop;

  ------------------------------------------------------------------
  -- 4. In-progress nodes — attempted, best below the mastery bar
  ------------------------------------------------------------------
  foreach v_node in array v_partial loop
    select id into v_case
      from public.cases
     where skill_node = v_node and is_active = true
     order by created_at, id limit 1;

    if v_case is null then
      v_missing := v_missing || v_node;
      continue;
    end if;

    v_scores := array[59, 68];

    for v_i in 1..2 loop
      v_score := v_scores[v_i];

      select count(*) + 1 into v_attempt
        from public.case_attempts where user_id = v_user and case_id = v_case;
      v_first := (v_attempt = 1);

      v_when := now() - make_interval(days => (v_idx % 84), hours => (v_idx % 9) + 9);
      v_idx  := v_idx + 1;

      insert into public.submissions (user_id, case_id, answer_text, score, feedback_json, created_at)
      values (
        v_user, v_case,
        'Demo submission. Got to a defensible number but the structure leaked — two branches '
        || 'overlapped and the sanity check came after the recommendation rather than before it.',
        v_score,
        jsonb_build_object(
          'seed', 'demo',
          'rubric', 'case',
          'breakdown', jsonb_build_object(
            'structure',         round(25 * v_score / 100.0),
            'quantitative',      round(20 * v_score / 100.0),
            'synthesis',         round(20 * v_score / 100.0),
            'business_judgment', round(15 * v_score / 100.0),
            'creativity',        round(10 * v_score / 100.0),
            'presence',          round(10 * v_score / 100.0)
          ),
          'strengths', jsonb_build_array('Arithmetic held up end to end'),
          'improvements', jsonb_build_array(
            'Branches were not mutually exclusive',
            'Sanity-check the number before you recommend on it'),
          'summary', 'Right ballpark, loose structure. This is the cluster to drill next.'
        ),
        v_when
      )
      returning id into v_sub;

      insert into public.case_attempts
        (user_id, case_id, submission_id, attempt_number, is_first_attempt, created_at)
      values (v_user, v_case, v_sub, v_attempt, v_first, v_when);

      v_made := v_made + 1;
    end loop;
  end loop;

  ------------------------------------------------------------------
  -- 5. Guesstimates — the second radar on the dashboard (5 dims, 1..5)
  ------------------------------------------------------------------
  for v_i in 1..6 loop
    select id into v_case
      from public.cases
     where type = 'guesstimate' and is_active = true
     order by created_at, id
     offset (v_i - 1) limit 1;
    exit when v_case is null;

    v_score := 72 + (v_i * 3);

    select count(*) + 1 into v_attempt
      from public.case_attempts where user_id = v_user and case_id = v_case;
    v_first := (v_attempt = 1);

    v_when := now() - make_interval(days => (v_idx % 84), hours => (v_idx % 9) + 9);
    v_idx  := v_idx + 1;

    insert into public.submissions (user_id, case_id, answer_text, score, feedback_json, created_at)
    values (
      v_user, v_case,
      'Demo guesstimate. Scoped the question, built a bottom-up tree, stated every assumption '
      || 'with a source or a rationale, carried units through, and closed with a sanity check '
      || 'against a known benchmark.',
      v_score,
      jsonb_build_object(
        'seed', 'demo',
        'rubric', 'guesstimate',
        'breakdown', jsonb_build_object(
          'scoping',      4,
          'structure',    5,
          'segmentation', 4,
          'arithmetic',   5,
          'sanity',       4
        ),
        'summary', 'Tight tree, clean units, benchmark check at the end.'
      ),
      v_when
    )
    returning id into v_sub;

    insert into public.case_attempts
      (user_id, case_id, submission_id, attempt_number, is_first_attempt, created_at)
    values (v_user, v_case, v_sub, v_attempt, v_first, v_when);

    v_made := v_made + 1;
  end loop;

  ------------------------------------------------------------------
  -- 6. Points — the exact sum of first-attempt scores
  ------------------------------------------------------------------
  -- This is precisely how backend routes/submit.py awards points (first
  -- attempt only, re-attempts award nothing), so the number on the nav
  -- bar reconciles against the submission log rather than being invented.
  select coalesce(sum(s.score), 0) into v_points
    from public.submissions s
    join public.case_attempts a on a.submission_id = s.id
   where s.user_id = v_user and a.is_first_attempt = true;

  update public.users set points = v_points where id = v_user;

  ------------------------------------------------------------------
  -- 7. Badges — only ones that exist in this environment
  ------------------------------------------------------------------
  insert into public.user_badges (user_id, badge_id, earned_at)
  select v_user, b.id, now() - interval '20 days'
    from public.badges b
   where b.id = any (array[
     'first-case','five-cases','fifteen-cases','thirty-cases','all-types',
     'streak-3','streak-7','streak-14','streak-30',
     'first-80','first-90','perfect-structure','perfect-quant'
   ])
  on conflict (user_id, badge_id) do nothing;

  ------------------------------------------------------------------
  -- 8. Cheat sheet — stocked so the PDF export has something to show
  ------------------------------------------------------------------
  insert into public.cheatsheet_points (user_id, point_text, source, tag, created_at)
  values
    (v_user, 'India''s quick-commerce GMV crossed $6bn in FY25, growing ~2.5x year on year, with roughly 70% concentrated in the top 8 cities.', 'MECE demo brief', 'Quick commerce', now() - interval '18 days'),
    (v_user, 'Average order value in 10-minute delivery sits near Rs 430; contribution margin turns positive above roughly Rs 550 per order.', 'MECE demo brief', 'Quick commerce', now() - interval '17 days'),
    (v_user, 'UPI processes over 16bn transactions a month, about 80% of India''s retail digital payment volume but a far smaller share of value.', 'MECE demo brief', 'Fintech', now() - interval '15 days'),
    (v_user, 'Credit card penetration in India is still under 6% of adults, versus roughly 30% in Brazil, which is the standard comparison in any lending case.', 'MECE demo brief', 'Fintech', now() - interval '15 days'),
    (v_user, 'India''s EV two-wheeler share crossed 5% of new registrations; battery is 35 to 40% of bill of materials, which is where the cost curve argument lives.', 'MECE demo brief', 'Mobility', now() - interval '12 days'),
    (v_user, 'Charging infrastructure ratio in India is roughly 1 public charger per 135 EVs, against a widely cited healthy benchmark near 1 per 20.', 'MECE demo brief', 'Mobility', now() - interval '11 days'),
    (v_user, 'FMCG rural volume growth overtook urban for the first time in eight quarters, which flips the usual "urban premiumisation" opening.', 'MECE demo brief', 'FMCG', now() - interval '9 days'),
    (v_user, 'Modern trade is about 12% of Indian FMCG sales but contributes a disproportionate share of premium SKU volume.', 'MECE demo brief', 'FMCG', now() - interval '8 days'),
    (v_user, 'Indian IT services attrition normalised to the low teens from a 20%+ peak, so the cost-per-employee argument no longer carries a wage-spiral assumption.', 'MECE demo brief', 'IT services', now() - interval '6 days'),
    (v_user, 'SaaS rule of 40: growth rate plus free cash flow margin should exceed 40. Below 30 the valuation conversation changes entirely.', 'MECE demo brief', 'SaaS', now() - interval '4 days'),
    (v_user, 'Net revenue retention above 120% is the line that separates a land-and-expand story from a pure new-logo story.', 'MECE demo brief', 'SaaS', now() - interval '3 days'),
    (v_user, 'D2C brands typically hit a CAC wall around Rs 900 to 1,100 per order; past that, retention economics have to carry the model.', 'MECE demo brief', 'D2C', now() - interval '2 days')
  on conflict do nothing;

  ------------------------------------------------------------------
  -- 8a. Put the guard trigger back before we assert anything
  ------------------------------------------------------------------
  if v_guard_off then
    execute 'alter table public.users enable trigger trg_guard_user_cols';
    v_guard_off := false;
  end if;

  ------------------------------------------------------------------
  -- 8b. ASSERT the privileged writes actually landed
  ------------------------------------------------------------------
  -- trg_guard_user_cols reverts silently: the UPDATE reports success and
  -- changes nothing. Never trust a privileged write to public.users without
  -- reading it back — this exact failure shipped a demo account that looked
  -- brand new while every unguarded column was correct.
  if not exists (
    select 1 from public.users
     where id = v_user
       and points = v_points
       and is_demo
       and subscription_tier = 'pro'
  ) then
    raise exception
      'Privileged columns were reverted by trg_guard_user_cols — points/tier/is_demo did not stick.'
      using hint = 'Run supabase/fix-demo-privileged.sql, which disables the guard for one transaction.';
  end if;

  ------------------------------------------------------------------
  -- 9. Report
  ------------------------------------------------------------------
  raise notice 'Demo account % seeded: % submissions, % points, % of 22 nodes mastered.',
    v_email, v_made, v_points, array_length(v_done, 1) - coalesce(array_length(v_missing, 1), 0);
  if array_length(v_missing, 1) > 0 then
    raise notice 'No active case tagged to these nodes (they will show as locked): %. Run supabase/seed-cases-constellation.sql to author them.',
      array_to_string(v_missing, ', ');
  end if;
end $$;

-- ── Verify ───────────────────────────────────────────────────────────
-- select points, streak_count, subscription_tier, is_demo
--   from public.users where lower(email) = lower('demo@mece.in');
--
-- select c.skill_node, count(*) attempts, max(s.score) best,
--        (max(s.score) >= 75 and count(*) >= 2) as mastered
--   from public.submissions s join public.cases c on c.id = s.case_id
--  where s.user_id = (select id from public.users where lower(email) = lower('demo@mece.in'))
--    and c.skill_node is not null
--  group by c.skill_node order by 1;

-- =====================================================================
-- STEP 5 of 5 · VERIFICATION  (read-only — this is the table you will see)
-- Every row should read OK. Anything else names its own fix.
--
-- The UNION is wrapped in a subquery on purpose: Postgres only allows
-- result COLUMN NAMES in an ORDER BY attached to a set operation, never an
-- expression. `order by (result = 'OK')` directly on the UNION is a hard
-- 0A000 error.
-- =====================================================================

with t as (
  select coalesce(nullif(current_setting('mece.demo_email', true), ''), 'demo@mece.in') as email
),
u as (select * from public.users where lower(email) = lower((select email from t))),
m as (
  select count(*) filter (where best >= 75 and att >= 2)::int as mastered,
         count(*)::int as total
    from (
      select n.id, count(s.id) as att, max(s.score) as best
        from public.skill_nodes n
        left join public.cases c       on c.skill_node = n.id and c.is_active
        left join public.submissions s on s.case_id = c.id and s.user_id = (select id from u)
       group by n.id
    ) x
),
checks as (
  select 1 as step, 'schema 0044' as item,
         case when exists (select 1 from information_schema.columns
                            where table_schema='public' and table_name='users' and column_name='is_demo')
              then 'OK' else 'MISSING' end as result
  union all select 2, 'constellation nodes (' || (select count(*) from public.skill_nodes)::text || ')',
         case when (select count(*) from public.skill_nodes) >= 22 then 'OK' else 'INCOMPLETE' end
  union all select 3, 'cases tagged (' || (select count(*) from public.cases where skill_node is not null and is_active)::text || ')',
         case when (select count(*) from public.cases where skill_node is not null and is_active) >= 20 then 'OK' else 'INCOMPLETE — run seed-cases-constellation.sql' end
  union all select 4, 'demo account ' || (select email from t),
         case when exists (select 1 from u) then 'OK' else 'MISSING — run create-demo-login.sql' end
  union all select 5, 'submissions (' || (select count(*) from public.submissions where user_id = (select id from u))::text || ')',
         case when (select count(*) from public.submissions where user_id = (select id from u)) >= 30 then 'OK' else 'LOW' end
  union all select 6, 'constellation mastered ('
                      || coalesce((select mastered from m), 0)::text || ' of '
                      || coalesce(nullif((select total from m), 0), 22)::text || ')',
         case when coalesce((select mastered from m), 0) >= 15 then 'OK' else 'LOW — some nodes have no case tagged' end
  union all select 7, 'points (' || coalesce((select points from u), 0)::text || ')',
         case when coalesce((select points from u), 0) > 0 then 'OK' else 'ZERO — guard trigger reverted the write' end
  union all select 8, 'tier',
         case when (select subscription_tier from u) = 'pro'
               and coalesce((select subscription_expires_at from u), now() + interval '1 day') > now()
              then 'OK' else 'NOT PRO' end
  union all select 9, 'streak (' || coalesce((select streak_count from u), 0)::text || ')',
         case when coalesce((select streak_count from u), 0) between 1 and 30 then 'OK'
              when coalesce((select streak_count from u), 0) > 30 then 'OVER 30 — hero tile flips to the giant-number variant'
              else 'ZERO' end
  union all select 10, 'is_demo (hidden from leaderboard)',
         case when (select is_demo from u) then 'OK' else 'NOT FLAGGED' end
  union all select 11, 'badges (' || (select count(*) from public.user_badges where user_id = (select id from u))::text || ')',
         case when (select count(*) from public.user_badges where user_id = (select id from u)) > 0 then 'OK' else 'NONE' end
  union all select 12, 'cheat sheet points (' || (select count(*) from public.cheatsheet_points where user_id = (select id from u))::text || ')',
         case when (select count(*) from public.cheatsheet_points where user_id = (select id from u)) >= 12 then 'OK' else 'LOW' end
  union all select 13, 'ANUSHKA10 coupon',
         case when exists (select 1 from public.discount_coupons where code = 'ANUSHKA10' and status = 'active')
              then 'OK' else 'MISSING' end
)
select step, item, result
  from checks
 order by (result = 'OK'), step;
