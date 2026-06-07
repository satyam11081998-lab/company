# ANTIGRAVITY_HANDOFF — dashboard-wire (Focus+ overhaul → live data)

**Owner brain:** A (Cowork) — proposed 2026-06-07
**Feature:** Dashboard (Focus+ full rewrite, commit ac007c4 on `main`)
**Target branch:** `feat/dashboard-wire` (cut from `main`)

**touches:**
- `app/(app)/dashboard/page.tsx` (extend server-side data fetch)
- `components/dashboard-client.tsx` (pass real props, drop VARIANTS fallback)
- `components/dashboard/hero.tsx` (consume real daily case + tier)
- `components/dashboard/fomo.tsx` (LiveTape, PeerProximity, ProofRail → real props)
- `components/dashboard/news-card.tsx` (consume real brief)
- `components/dashboard/guesstimate-card.tsx` (consume real daily guesstimate + MCQ)
- `components/dashboard/consistency-card.tsx` (drop seeded RNG, consume real heatmap)
- `components/dashboard/recent-card.tsx` (consume submissions prop)
- `components/dashboard/command-panel.tsx` (swap TIERS → CAREER_TIERS, real growth)
- `components/dashboard/constellation.tsx` (consume server-built skill graph)
- `lib/dashboard/activity-feed.ts` **(new)** — recent activity query
- `lib/dashboard/peer-proximity.ts` **(new)** — nearest-rank lookup
- `lib/dashboard/skill-graph.ts` **(new)** — case→skill_node aggregation
- `lib/dashboard/growth-deltas.ts` **(new)** — 30d-vs-prev-30d per-dim deltas
- `lib/dashboard/heatmap.ts` **(new)** — 52w × 7d submission counts
- `supabase/migrations/0004_dashboard_skills.sql` **(new)**
- `lib/types.ts` (additive: new types for above)
- `lib/career-tiers.ts` (extend CAREER_TIERS from 7 → 10 entries — see Phase 0)
- `app/api/news/[briefId]/to-case/route.ts` **(new)** — POST: news brief → generated case
- `services/news_to_case.py` **(new, backend)** — generation worker (mirrors `services/content_generator.py`)
- `lib/dashboard/node-to-case.ts` **(new)** — picks the right case to open when a constellation node is clicked

**breaking:** **yes — C1 (cases schema v3 → v4)**
**affects:** Dashboard, Guesstimate end-to-end, Daily content + admin, Casebook (skill_node references)

---

## Why this exists

Commit `ac007c4 feat(dashboard): full rewrite from Focus+ prototype` shipped a fully redesigned dashboard whose visual structure is a forced fit on top of mock data: hero, live tape, news card, guesstimate MCQ, constellation, command panel (career ladder + trajectory + momentum), consistency heatmap, recent. `dashboard-client.tsx` already maps real props into a `UserVariant` (name, streak, points, rank, totalUsers, percentile, readiness, latest, best, casesSolved, trajectory) — but every component falls back to mock for: tier name, daily case title/interviewer, news brief, MCQ options, consistency heatmap, recent items, growth deltas, constellation nodes, all "social pressure" widgets.

Owner directive (2026-06-07): **preserve every visual element**, extend backend where the data model can't feed it. No removals, no "coming soon" placeholders. **Every button, link, or affordance that's drawn must work** — "turn it into a 15-min case" is a real action, clicking a constellation node opens that node's case, the career ladder visually has 10 rungs and the data model must have 10 too.

The non-negotiable lock for the entire feature: **zero JSX structure, className, inline-style, or layout changes.** Value swaps + `onClick`/`href` attachment only. Labels (the human-readable text on a node or a tier) MAY change to match the real taxonomy — text-only edits that don't alter geometry. Every component below already accepts a `u: UserVariant` (or `any`); we extend `UserVariant` additively and route real data through it.

---

## Owner mandates (2026-06-07 follow-up)

These three came in after the first draft and are LOAD-BEARING — they reshape Phases 0, 3, and 4.

### 1. News card → real "turn it into a case" action

The card already renders "**turn it into a 15-min case**" as a styled link. Today it's dead text. Wire it as a real action:
- **Frontend:** `news-card.tsx` accepts `briefId?: string`. The span becomes a `<button>` (same styling) that POSTs to `/api/news/${briefId}/to-case`, then `router.push('/cases/${returned.case_id}')`.
- **Backend route** `app/api/news/[briefId]/to-case/route.ts`: auth via existing supabase server client; reject if user is past free-tier daily limit (reuse `computeFreeQuota`); call backend service.
- **Backend service** `services/news_to_case.py`: mirror `services/content_generator.py`. Inputs: news_headline row (already has `title`, `summary`, `keywords`, `category`, `source_name`). Output: a new `cases` row with `type` inferred from `keywords` (default `profitability`), `difficulty='medium'`, `interview_meta.firm` inferred or null, `interview_meta.est_minutes=15`, `code=null`, `is_active=true`. Set `cases.skill_node` + `skill_cluster` if a confident map exists (else leave null — case is still openable).
- **Idempotency:** if the same `briefId` has already been turned into a case by this user, return the existing case id instead of creating another. Index hint: `cases.source_brief_id uuid references public.news_headlines(id)` — add as an additive column in the 0004 migration (see schema section below).
- **CTA next to it ("Read brief →"):** route to `/news/${briefId}` if that page exists, else `/gd-briefs/${briefId}` (we already have a GD briefs route per LEDGER). Confirm route by checking `app/(app)/gd-briefs/[id]/page.tsx` exists.

### 2. Constellation nodes are clickable links to real cases / learn pages

Today `onClick` just sets `selected` for the side panel. Add navigation: every node maps to one *opening move* — a single case the user should attempt next for that node. The side panel's two buttons ("Start a case here" / "Read the brief") and the node itself all route to the same destinations.

- **Data:** `cases.skill_node` (added in 0004) is the join. A node may have many cases; pick deterministically via `lib/dashboard/node-to-case.ts`:
  1. If the user has an in-progress `attempts` row for any case on this node → resume it.
  2. Else: next unattempted case ordered by `(difficulty asc, created_at asc)`.
  3. Else (all cleared): the most recently solved one — re-attempt UX.
  4. Else (no cases tagged yet): fall back to `/learn/${cluster_slug}` so the click is never dead.
- **"Read the brief"** button → `/learn/${cluster_slug}` (the existing learn route, e.g. `/learn/profitability`).
- **Clicks on locked nodes:** show a small tooltip (no new component — reuse the existing `title` attribute pattern from `PremiumGhostStrip`) and do NOT navigate. The visual lock state stays.
- **Node labels MAY be renamed** in the seed (e.g., "Structuring" → "Communication" inside the Foundations cluster) to match the real curriculum. Geometry (`x`, `y`, count = 22) is frozen. The label edits live in the `supabase/seed-skill-graph.sql` seed only, not in TSX.

### 3. Career ladder: extend backend from 7 → 10 tiers

The mockup's `command-panel.tsx` renders 10 ladder rungs. The real SSOT `lib/career-tiers.ts` has 7. The owner has built a real ladder with custom labels (different from the mockup's consulting-firm names). The fix:
- Extend `CAREER_TIERS` to **exactly 10** entries (3 new). Keep the existing tone of voice (`Day 0 Dreamer`, `MECE Believer`, `Summer Legend` — playful, milestone-specific, India-aspirant flavored).
- Reuse `currentTier(points)`, `nextTier(points)`, `pointsToNextTier(points)` unchanged — they walk the array, so they auto-extend.
- `command-panel.tsx` deletes its local `TIERS` array (the consulting-firm one) and iterates `[...CAREER_TIERS].reverse()` (top down). Count of rendered rungs auto-matches array length = 10.
- The 3 new names + thresholds need owner input (see Open Items at bottom). Until provided, Phase 0 ships a draft set behind a comment marker `// TODO(owner): confirm names/thresholds` so the visual is real but Antigravity flags it for review before merge.

---

## C1 contract change — `cases` table (v3 → v4)

Additive only. Existing readers continue to work.

```sql
-- 0004_dashboard_skills.sql
alter table public.cases
  add column if not exists skill_node text,            -- e.g. 'p4' / 'combined_ratio'
  add column if not exists skill_cluster text,         -- e.g. 'prof' / 'profitability'
  add column if not exists interview_meta jsonb,       -- { firm, round, est_minutes, points_reward }
  add column if not exists mcq jsonb,                  -- { options:[{label,value,is_correct}], explainer }
  add column if not exists source_brief_id uuid;       -- nullable FK to news_headlines.id for news-generated cases

alter table public.cases
  add constraint cases_source_brief_fk
    foreign key (source_brief_id) references public.news_headlines(id) on delete set null
    not valid;  -- not valid → no scan on existing rows; backfill is no-op (all NULL).

create index if not exists cases_skill_node_idx on public.cases(skill_node);
create index if not exists cases_skill_cluster_idx on public.cases(skill_cluster);
create unique index if not exists cases_source_brief_user_idx
  on public.cases(source_brief_id) where source_brief_id is not null;
-- Note: above is global. For per-user idempotency we use the existing user→case attempt
-- check at the API layer (the route reads any prior case with same source_brief_id
-- and returns it instead of creating a duplicate).
```

Reason for jsonb on `interview_meta` + `mcq`: keeps schema flexible while we still derive the 4 keys we need today. No backfill required — readers must treat all four as nullable.

### New tables

```sql
create table if not exists public.skill_nodes (
  id text primary key,                 -- 'p4', 'c1', 'm1' …  (mock NODES.id is the seed)
  cluster text not null,               -- prof | size | pri | ent | ma | ops | soft
  label text not null,                 -- 'Combined ratio'
  is_boss boolean not null default false,
  display_x numeric not null,          -- 0..100 viewport coord (seed from NODES.x)
  display_y numeric not null,          -- 0..100
  created_at timestamptz not null default now()
);

create table if not exists public.skill_edges (
  src text not null references public.skill_nodes(id) on delete cascade,
  dst text not null references public.skill_nodes(id) on delete cascade,
  primary key (src, dst)
);

create table if not exists public.dimension_snapshots (
  user_id uuid not null references public.users(id) on delete cascade,
  taken_on date not null,              -- weekly snapshot, week-of-monday
  dimension text not null,             -- 'structure' | 'quantitative' | …
  rubric text not null,                -- 'case' | 'guesstimate'
  earned_avg numeric not null,         -- recency-weighted avg, 0..max
  n int not null,
  primary key (user_id, taken_on, dimension, rubric)
);
create index if not exists dim_snap_user_idx on public.dimension_snapshots(user_id, taken_on desc);
```

### Seed (idempotent)

Seed `skill_nodes` + `skill_edges` from `components/dashboard/constellation.tsx`'s NODES/EDGES so the constellation has data from day one. Use `on conflict (id) do update` so the seed can be re-run when the taxonomy expands.

### RLS

`skill_nodes`, `skill_edges`: public read (taxonomy is not user data).
`dimension_snapshots`: read-only for `auth.uid() = user_id`. Writes are server-side (cron).

---

## Phased build — each phase is a green-CI commit

### Phase 0 — branch + migration scaffold + career-tiers extension (no UI behaviour change)

1. `git checkout -b feat/dashboard-wire` off `main`.
2. Add `supabase/migrations/0004_dashboard_skills.sql`. Run twice locally; second run must be a no-op (idempotency gate).
3. Seed `skill_nodes` + `skill_edges` in a separate file `supabase/seed-skill-graph.sql`; `on conflict do nothing` for edges, `on conflict (id) do update` for nodes. Keep the 22 mock node ids (`p1..p4, s1..s4, r1..r3, e1..e3, m1..m3, o1..o2, c1..c3`) and their `x`/`y`. Labels may be edited in the seed to match the real curriculum — geometry is frozen.
4. **Extend `lib/career-tiers.ts` to 10 tiers.** Add 3 new entries with `// TODO(owner): confirm` markers, preserving the playful India-aspirant tone. Suggested draft (replace once owner confirms via Open Items):
   ```ts
   { threshold: 3500, name: 'Shortlist Maker',  tagline: 'On the list. Now stay on it.' },
   { threshold: 6000, name: 'Final Round Regular', tagline: 'Coffee meetings and case rounds' },
   { threshold: 10000, name: 'Day 1 Hero',      tagline: 'Offer in hand. Story to tell.' },
   ```
   Keep array sorted ascending by threshold. `Summer Legend` (current top) becomes the 7th rung; 3 new ones sit above it. Total = 10.
5. Extend `lib/types.ts`:
   ```ts
   export interface SkillNodeRow { id: string; cluster: string; label: string; is_boss: boolean; display_x: number; display_y: number; }
   export interface SkillEdgeRow { src: string; dst: string; }
   export interface DimensionSnapshotRow { user_id: string; taken_on: string; dimension: string; rubric: string; earned_avg: number; n: number; }
   export interface CaseRow {
     /* …existing… */
     skill_node?: string | null;
     skill_cluster?: string | null;
     interview_meta?: { firm?: string; round?: string; est_minutes?: number; points_reward?: number } | null;
     mcq?: { options: { label: string; value: string; is_correct?: boolean }[]; explainer?: string } | null;
   }
   ```

**Gates:** `npx tsc --noEmit` clean · `next build` clean · `psql -f 0004 -f 0004` no-op second run.

---

### Phase 1 — server-side data layer (new lib/dashboard/*)

Each module is a pure async function that takes the supabase client + minimal args and returns a typed payload. Tested by being called from `dashboard/page.tsx` in Phase 2.

**`lib/dashboard/skill-graph.ts`**
```ts
export interface SkillGraphPayload {
  nodes: { id: string; cluster: string; label: string; is_boss: boolean; x: number; y: number;
            state: 'done'|'active'|'next'|'locked'; attempts: number; best: number | null; }[];
  edges: [string, string][];
  counts: { done: number; active: number; next: number; locked: number };
  todayBossNodeId: string | null;          // from daily_schedule.case_id → cases.skill_node
}
```
Logic: load all skill_nodes + skill_edges, join `cases` by `skill_node` to count user's `submissions` per node. State rules: `done` if best ≥ 75 AND attempts ≥ 2 (mirror `personal-stats.MASTERY_*`), `active` if attempts ≥ 1, `next` if any incoming edge has `done|active` parent, else `locked`. Boss = node behind today's daily case.

**`lib/dashboard/activity-feed.ts`** (LiveTape source)
```ts
export interface FeedEvent {
  who: string;        // first name lowercased, last initial: 'sneha r' (PII rule below)
  what: string;       // 'scored 92' | 'overtook 8 peers' | 'unlocked Manager' | 'started today\'s boss case'
  where: string;
  tone: 'red'|'amber'|'green'|'navy';
  t: string;          // 'just now' | '1m ago'
}
export async function getActivityFeed(sb: SupabaseClient, limit = 12): Promise<FeedEvent[]>
```
Query: `case_attempts` + `users.name` + `cases.title/skill_cluster` for last 30 min, ordered by `created_at desc`. **PII rule:** show `firstName[0..15] + ' ' + lastInitial`. Fall back to `'an aspirant'` if name missing. `412 active` count = distinct user_id in `case_attempts` in last 15 min.

**`lib/dashboard/peer-proximity.ts`** (PeerProximity source)
```ts
export interface PeerProximity {
  competitor: { displayName: string; pointsBehind: number; dailyGainRate: number; etaHours: number | null } | null;
  newAspirantsThisWeek: number;
}
```
Query: nearest user by points where `points < me.points`, plus their last-7-day `points` delta to compute daily gain rate.

**`lib/dashboard/proof-rail.ts`** (ProofRail source)
```ts
export interface ProofRailPayload {
  startedToday: number;       // count(distinct user_id) case_attempts on today's daily case
  avatars: { color: string; initials: string }[]; // up to 4 deterministic colors per user_id hash
  cohortLabel: string;        // 'your cohort' | 'IIM-A · 2026' if user.cohort exists, else generic
}
```

**`lib/dashboard/heatmap.ts`** (ConsistencyCard source — replaces seeded RNG)
```ts
export interface HeatmapPayload {
  weeks: number[][];          // 52 × 7 case counts
  totalCases: number;         // sum
  maxStreak: number;          // longest run of consecutive active days in window
  weeklyCadence: number;      // active days / weeks-with-any-activity
  cohortCadence: number;      // global avg of weeklyCadence
}
```
Query: `case_attempts` for this user grouped by `date(created_at AT TIME ZONE 'Asia/Kolkata')` over last 364 days.

**`lib/dashboard/recent.ts`** (RecentCard source)
```ts
export interface RecentItem { id: string; title: string; domain: string; score: number; when: string; duration: string; }
export function getRecent(submissions: ReadinessSubmission[], cases: Map<string, CaseRow>, limit = 4): RecentItem[]
```
Pure transform over already-fetched submissions; join titles via a pre-loaded Map. `domain` = `CASE_TYPE_LABELS[case_type]`. `duration` = derived from `attempts.submitted_at - attempts.created_at` (table is `attempts`, not `conversational_attempts`; see migration 0002). If no matching `attempts` row, show `'—'`.

**`lib/dashboard/growth-deltas.ts`** (CommandPanel "Momentum" source)
```ts
export interface GrowthRow { dimension: string; label: string; ratio: number; delta: number; }
export async function getGrowthDeltas(sb, userId): Promise<GrowthRow[]>
```
Logic: read last 4 dimension_snapshots rows; if < 2, return rows with `delta: 0`. Otherwise `delta = round(thisWeek.earned_avg - lastWeek.earned_avg)`.

**`lib/dashboard/snapshot-writer.ts`**
Weekly cron-callable. Computes per-dim earned_avg over last 14 days (mirror `computeDimensions` from readiness) and upserts dimension_snapshots for `taken_on = monday(now)`. Wire to `routes/cron.py` or a Next.js API route under `/api/cron/dimension-snapshot` invoked by the GH Actions weekly worker (mirror existing `feat/daily` pattern).

**`lib/dashboard/node-to-case.ts`** (Constellation click target)
```ts
export interface NodeOpenTarget {
  kind: 'case' | 'learn' | 'locked';
  href: string;          // '/cases/<id>' | '/learn/<cluster>' | '#'
  resumeHint?: string;   // 'Resume' | 'Start' | 'Re-attempt' — drives the side-panel button label
}
export async function getNodeOpenTargets(
  sb: SupabaseClient, userId: string, nodeIds: string[]
): Promise<Map<string, NodeOpenTarget>>
```
Logic per node:
1. If any `attempts` row for this user with `status='active'` and `case.skill_node = node` → `{kind:'case', href:'/cases/<that case_id>', resumeHint:'Resume'}`.
2. Else: pick the first `cases` row where `skill_node = node`, no submission by this user, `is_active=true`, ordered by `difficulty asc, created_at asc` → `{kind:'case', href:'/cases/<id>', resumeHint:'Start'}`.
3. Else (all attempted): most recent submission's case → `{kind:'case', href:'/cases/<id>', resumeHint:'Re-attempt'}`.
4. Else (no cases tagged with this node): `{kind:'learn', href:'/learn/<cluster_slug>', resumeHint:'Read brief'}`.
5. If node state is `'locked'`: `{kind:'locked', href:'#'}` (click is a no-op + native tooltip).

`cluster_slug` mapping: `prof → profitability`, `size → market_sizing`, `pri → pricing`, `ent → market_entry`, `ma → mna`, `ops → operations`, `soft → foundations`. Slugs that don't have a learn page yet should still return `/learn/<slug>` — the existing learn router has a 404 catcher, and Phase 4 backfills content.

**`lib/dashboard/today-meta.ts`** (Hero source)
```ts
export interface TodayMeta {
  casePick: { id: string; title: string; cluster: string; difficulty: string; minutes: number; firm: string; round: string; pointsReward: number; streakBoost: number } | null;
}
```
Reads today's daily case from `initialDaily`, augments with `cases.interview_meta`. Falls back gracefully when `interview_meta` is null (display `—`).

**Gates:** `npx tsc --noEmit` clean. No tests required this phase; coverage comes via Phase 2 page wiring.

---

### Phase 2 — wire `dashboard/page.tsx` + DashboardClient

`app/(app)/dashboard/page.tsx`: extend the existing Promise.all with the 6 new fetches (skill graph, activity feed, peer proximity, proof rail, heatmap, growth deltas, today meta). Build a `caseTitleMap` from submissions' `case_id` set with one `supabase.from('cases').select('id,title,type').in('id', ids)` call. Pass everything down to DashboardClient as additive props.

`components/dashboard-client.tsx`: extend `DashboardClientProps` additively (all new props optional with safe defaults). Drop the `VARIANTS[userState]` spread; keep the variable for **layout-mode selection only** (`heroVariant` logic stays). Build the final `UserVariant` directly:

```ts
const u: UserVariant = {
  name: userName,
  greeting: new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long' }),
  streak,
  bestStreak: stats.maxStreak ?? streak,                  // from heatmap payload
  rank: rankNum,
  totalUsers,
  percentile,
  readiness: readinessVal,
  readinessDelta: weeklyReadinessDelta ?? null,           // see note
  latest, best, casesSolved: solved,
  totalPoints: points,
  tier: currentTier(points).name,                         // from lib/career-tiers
  nextTier: (nextTier(points) ?? currentTier(points)).name,
  toNext: pointsToNextTier(points),
  trajectory: trajectory.length > 1 ? trajectory : [],
  weekCases: heatmap.weeks[51].filter(v => v > 0).length,
  sessionMinutes: avgSessionMinutes ?? 0,                 // avg of (attempts.submitted_at - created_at) over last 7d submitted attempts
};
```

Pass the new payloads as separate props (`feed`, `peer`, `proof`, `heatmap`, `recent`, `growth`, `todayMeta`, `skillGraph`) to each component below.

**Gates:** `npx tsc --noEmit` clean · `next build` clean · route count 142 unchanged (no new routes added; new lib files don't create routes).

---

### Phase 3 — component prop drilling (zero visual change)

For each file, extend the props interface additively and replace the literal mock with the prop. No other change. If a prop is absent, render the existing mock string verbatim as a fallback so visual regressions stay caught.

**`hero.tsx`**
- `HeroCase` / `HeroStreak` / `HeroReadiness` accept new `today?: TodayMeta['casePick']` prop.
- Replace `TODAY.pick.title` → `today?.title ?? TODAY.pick.title` (keep TODAY export for fallback).
- Replace `'BCG · partner round'` → `${today?.firm ?? 'BCG'} · ${today?.round ?? 'partner round'}`.
- Replace `<b>25</b> min`, `<b>+85</b> pts`, `<b>+25 streak</b>` → from `today?.minutes`, `pointsReward`, `streakBoost`.
- `StreakMonument`: no change (already prop-driven).
- The `u.tier`/`u.nextTier`/`u.toNext` now come from real CAREER_TIERS via DashboardClient.

**`command-panel.tsx`**
- **Critical:** delete the local `const TIERS = […]` array. Import `CAREER_TIERS, currentTier, nextTier, pointsToNextTier` from `@/lib/career-tiers`. Iterate `[...CAREER_TIERS].reverse()` (top-down) and compute `tierIdx = CAREER_TIERS.findIndex(t => t.name === u.tier)`. This is the SSOT fix called out in `lib/career-tiers.ts` comments.
- Replace local `growth` array → `growth?: GrowthRow[]` prop. Fallback to the existing computed mock if not present (newcomer state).
- Real trajectory already flows through `u.trajectory`; verify `pbY` math still works when `u.best` is `0`.

**`fomo.tsx`**
- `LiveTape` accepts `events?: FeedEvent[]` and `activeCount?: number`. Replace `TAPE_EVENTS` literal usage with `events ?? TAPE_EVENTS`, `412 ACTIVE` → `${activeCount ?? 412} ACTIVE`.
- `PeerProximity` accepts `peer?: PeerProximityPayload['competitor']` and `aspirantsThisWeek?: number`. Render real `displayName`, `pointsBehind`, daily rate, eta — fall back to mock string when null.
- `ProofRail` accepts `proof?: ProofRailPayload`. Replace `PROOF_AVATARS`/`PROOF_INITIALS` and `'23 peers'` with real values.
- `BossCountdown`, `StreakExpiry`, `HotZone`, `PremiumGhostStrip`, `UnlockTeaser`: no change. (Countdowns are real-time clocks already; PremiumGhostStrip remains static product-marketing.)
- `UnlockTeaser` `count` prop: derive from `skillGraph.counts.next` (nodes that will go from locked→next when the user clears one more parent). Default fallback `3` stays.

**`news-card.tsx`**
- Accept `brief?: DailyContentResponse['brief']` prop.
- Replace headline `<h3>BCG to acquire Quantis…</h3>` → `brief?.title ?? '…'` fallback.
- Replace `FT · 4 hr ago` → `${brief?.source_name ?? 'FT'} · ${relativeTime(brief?.published_at)}`. **Required `DailyContentResponse.brief` shape change in `lib/api.ts`:** add `published_at: string`. Then `lib/daily-server.ts` already SELECTs `published_at` from `news_headlines` (it ORDERs by it) — just include it in the projection. Not a CONTRACTS event (api.ts isn't versioned), but every consumer of `brief` must be checked. Grep `\.brief\.` first.
- "Why it matters for you" body: derive from `brief.summary` if present, else keep mock. No new field on news_headlines.
- **"Read brief →"** span becomes a real link: `router.push('/gd-briefs/' + brief.id)` (existing route per LEDGER).
- **"turn it into a 15-min case"** span becomes a `<button>` (visually identical inline styling preserved) that:
  - Disables itself while in flight, shows the existing red text colour throughout.
  - POSTs `/api/news/${brief.id}/to-case` with no body. Expects `{ case_id: string }` or `{ error: string }`.
  - On success: `router.push('/cases/' + case_id)`.
  - On 429 (quota): show a soft toast — reuse existing `hooks/use-toast` — and surface a `Free quota used. Upgrade.` link to `/pricing`.
  - On 5xx: toast `Couldn't generate a case from this brief. Try again in a moment.`
- The action button is gated by `quota.remaining > 0 || quota.unlimited` — same gate as starting a new case. Disable visually if 0 remaining (keep style, drop pointer-events).

**`guesstimate-card.tsx`**
- Accept `daily?: DailyContentResponse['guesstimate']` and `mcq?: CaseRow['mcq']`.
- Title → `daily?.title ?? mock`. The 4 button labels iterate `mcq?.options ?? [mock options]`. Clicking submits the chosen value (or routes to `/cases/${daily.id}` if MCQ is null — preserves card behaviour for daily cases that haven't been authored with MCQ yet).
- `312 peers tried` / `61% got it`: query `case_attempts` for today's guesstimate case, count attempts + accuracy_rate (compare to MCQ correct). Add to `lib/dashboard/guesstimate-stats.ts` (new). Falls back to the mock when daily case has no MCQ yet.

**`consistency-card.tsx`**
- Accept `heatmap?: HeatmapPayload` prop. **Delete the seeded RNG `useMemo`.** Replace `data` with `heatmap?.weeks ?? fallback`. Compute fallback once via the existing RNG kept inline as an `else` branch so DEV without data still renders something.
- `totalCases`, `maxStreak`, `weekCases`, cohort comparison string: all from `heatmap` payload.

**`recent-card.tsx`**
- Accept `recent?: RecentItem[]`. Replace `RECENT.slice(0, …)` with `recent ?? RECENT.slice(…)`.

**`constellation.tsx`**
- Accept `graph?: SkillGraphPayload` and `nodeTargets?: Map<string, NodeOpenTarget>`.
- Replace static `NODES`/`EDGES`/`CLUSTERS` consumption with `graph?.nodes`, `graph?.edges`. Keep the static constants as exported fallbacks (the file's named exports are imported elsewhere — guesstimate skills chart and learn pages may reference them; preserve to avoid breaking the build).
- `nodesForUser` function is no longer needed if `graph.nodes` already carries `state` per user. Keep it as an unused export for now; delete in a follow-up.
- **Node click → navigation.** Each node `<div>` wraps its existing JSX in a Next `<Link>` (or wires `onClick` to `router.push`) using `nodeTargets.get(n.id).href`. Visual presentation is unchanged: the `<Link>` carries `style={{display:'contents'}}` so it doesn't introduce a new box. For `kind:'locked'`, keep the current `onClick` (`setSelected(n.id)`) and skip navigation — clicking still updates the side panel.
- **Side panel buttons** ("Start a case here" / "Take the boss case" → primary, "Read the brief" → secondary): wire `onClick` to `router.push`. Primary uses `nodeTargets.get(node.id).href`. Secondary uses `/learn/${CLUSTER_SLUG[node.cluster]}`. Button **label** is `nodeTargets.get(node.id).resumeHint + ' ' + (node.boss ? 'the boss case' : 'a case here')` (`Resume…` / `Start…` / `Re-attempt…`).
- Hardcoded side-panel "Recent attempts" array (`HDFC Life`, `ICICI`, `SBI Life`): derive from `recent` prop filtered by the selected node's `skill_cluster`. Fall back to "No attempts yet" empty state when nothing matches — empty state must reuse the existing card styling (no new className).
- "M&A · 12 peers gaining" badge: bind to `graph.peerPressureCluster` (new payload field; pick the cluster where the user's percentile rank is lowest relative to cohort).
- **Labels may be edited** in the seed (`supabase/seed-skill-graph.sql`) to match real curriculum naming (e.g. "Structuring" → "Communication" inside `soft` cluster). The TSX renders `n.lbl` as today — text is data-driven. No JSX change beyond wrapping the node in a link.

**Gates per file:** `npx tsc --noEmit` after each. `next build` after the last component lands.

---

### Phase 4 — admin authoring tooling + news→case backend

The new `interview_meta` + `mcq` + `skill_node` + `skill_cluster` + `source_brief_id` columns are dead weight if there's no way to populate them. Extend the existing admin surface (`app/(app)/admin/*` — already BUILT per LEDGER) with:
- Edit form for `cases.interview_meta` (firm / round / est_minutes / points_reward).
- MCQ editor for guesstimate-type cases (1..5 options + one `is_correct`).
- Skill node + cluster selector (dropdowns sourced from `skill_nodes` table).

If admin is gated by `users.is_admin`, no new auth. Otherwise add `is_admin` check.

**Backfill script** (one-shot, idempotent): infer `skill_cluster` from `case_type` for existing rows. Mapping: `profitability → 'prof'`, `market_sizing → 'size'`, `growth → 'ent'` (market entry is the closest existing cluster), `guesstimate → 'soft'`. Do NOT infer `skill_node` — that requires per-case curation.

**News → case generation backend** (`services/news_to_case.py` + `routes/news.py` extension OR `app/api/news/[briefId]/to-case/route.ts`):
- Pick the simpler path first: an **all-Next.js route** in `app/api/news/[briefId]/to-case/route.ts` that calls the existing FastAPI case-generator service if one exists, else writes the row directly via the supabase server client. Inspect `services/content_generator.py` for the prompt template — reuse it for consistency with daily-generated cases.
- Auth: server-side supabase client, redirect on unauth.
- Quota: import `computeFreeQuota` from `lib/next-action`; return 429 if exhausted.
- Idempotency: `select id from cases where source_brief_id = $1 limit 1` first; if hit, return that id without generating.
- Insert: `is_active=true`, `code=null`, `source_brief_id=$briefId`, `type` inferred from headline category, `difficulty='medium'`, `interview_meta={est_minutes:15, source:'news'}`, `title` from brief, `content` from generator.
- Audit: append a row to `submissions`-adjacent audit if any exists, else just rely on `created_at` for traceability.

**Gates:** Admin route renders. Save round-trips through Supabase. Manual POST to `/api/news/<real-brief-id>/to-case` returns 200 + `case_id`. Second call with same brief returns same `case_id`. `next build` clean.

---

### Phase 5 — weekly cron for dimension snapshots

Add `/api/cron/dimension-snapshot/route.ts` invoked by an existing GH Actions weekly schedule (`.github/workflows/*` already exists per `feat/daily`). Iterates all users, calls `snapshot-writer.writeForUser`. Guarded by a shared CRON_SECRET header.

**Gates:** Manual hit returns 200. Re-running same week is idempotent (PK on `(user_id, taken_on, dimension, rubric)`).

---

## Locks (do not violate)

1. **No JSX structure / className / inline-style / layout change** — anywhere. Value swaps + attaching `onClick` / `href` are allowed; geometry, spacing, colors, and DOM tree shape are not. If a prop is absent, render the literal mock string so visual diffs stay quiet.
2. **Text labels MAY change** (node labels, tier names) to match real curriculum/SSOT — but only via data (seed file, `lib/career-tiers.ts`). No string literals replaced inside TSX.
3. **Node count, tier count, recent-card row count, MCQ option count** are all frozen at the mock's geometry: 22 constellation nodes, 10 ladder rungs, 4 recent rows, 4 MCQ buttons.
4. **New API routes are allowed** (`/api/news/[briefId]/to-case`, `/api/cron/dimension-snapshot`) — route count grows from 142 → 144 maximum. CHANGELOG must note the new routes.
5. **No removal of components.** PremiumGhostStrip, HotZone, UnlockTeaser, BossCountdown stay intact and continue to render.
6. **No removal of fallback mocks** in component files. They are the safety net for partial data.
7. **No edits to STATE.md / CHANGELOG.md / CONTRACTS.md** by the implementing brain — Antigravity owns those. CHANGELOG entry on merge must say `breaking: yes — C1 cases (v3→v4)` `affects: Dashboard, Guesstimate, Daily-content, Casebook`.

---

## Final-state checks (run before opening PR)

1. `npx tsc --noEmit` — clean.
2. `npm run lint` — clean (or as-existing).
3. `next build` — clean; route count is 142.
4. Supabase migration replays from a clean DB: `0001 → 0002 → 0003 → 0004` — no errors.
5. Idempotency: re-run `0004` and the seed file — both no-op the second time.
6. Manual visual smoke: open `/dashboard` as a real user with ≥ 5 attempts. Every visual element from the Focus+ mock renders, no `[object Object]`, no missing tier names.
7. RLS: log in as user A, confirm `dimension_snapshots` rows for user B are not visible.

---

## Open items the implementing brain should confirm with the owner before Phase 4

- **3 new career tiers** (Phase 0 ships placeholders `Shortlist Maker` / `Final Round Regular` / `Day 1 Hero` with thresholds 3500 / 6000 / 10000). **Confirm the names, taglines, and thresholds before Phase 4 merges.** This is user-facing copy.
- **Skill taxonomy & labels:** Phase 0 seeds the 22 mock node ids with their mock labels. Owner has authorized text-only label edits in the seed. Confirm the canonical label set before the seed lands — or accept the current Focus+ labels as canonical.
- **Cluster→case_type mapping for navigation:** Phase 4 backfill assumes `prof→profitability`, `size→market_sizing`, `ent→market_entry/growth`, `soft→foundations`. Confirm `growth` is the right `case_type` for the Market Entry cluster (`ent`) — they're conflated today.
- **PII for LiveTape:** `firstName + ' ' + lastInitial` — confirm before going live. Default: only show users who set a display name; otherwise omit.
- **Cohort string** on ProofRail ('IIM-A · 2026'): no `users.cohort` field exists today. Either add `users.cohort text` (additive, non-breaking) or hard-code 'your cohort'. Default: hard-code, defer the column to a later feature.
- **News→case generator prompt:** the FastAPI service has its own daily-case generator. Confirm whether the new news-to-case route should reuse that exact pipeline (call backend) or run a lightweight inline generator in Next.js. Default: backend reuse for tone consistency.
