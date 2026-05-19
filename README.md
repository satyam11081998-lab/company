# Consilio

AI co-pilot for case interviews and GD prep — built for Indian MBA / PGDM aspirants.

This repo contains the **Next.js 14 + TypeScript + Supabase** frontend for Consilio.
The AI scoring service lives in a **separate FastAPI repo** and is reached via the
`NEXT_PUBLIC_API_URL` env variable.

---

## ✨ Features

- Landing page + Google OAuth & email/password auth (with forgot-password / reset-password flow)
- Dashboard with today's case, today's GD brief, points & rank, recent activity
- Cases list with type & difficulty filters
- Case detail with collapsible hint and ≥200-char answer submission to external AI scorer
- Results page with score, 5-dimension breakdown bars, strengths & improvements
- Learn library (frameworks per case type)
- GD Briefs (expandable cards with points-for / against / smart angles / data points)
- Leaderboard (top 3 medal styling, current user highlighted)
- Profile with submissions history

---

## 🛠 Tech stack

- **Next.js 14** (App Router) + **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui** primitives
- **Supabase** for auth (Google OAuth + email/password) and PostgreSQL
- Auth handled via `@supabase/ssr` cookie-based sessions + Next.js middleware
- Deploy target: **Vercel**

---

## 📋 Prerequisites

| Tool         | Version       |
| ------------ | ------------- |
| Node.js      | **≥ 18.17**   |
| npm or yarn  | npm ≥ 9, yarn 1.22+ |
| A Supabase project | free tier is fine |

---

## 🚀 Local setup

```bash
# 1. Clone
git clone https://github.com/satyam11081998-lab/company.git
cd company

# 2. Install dependencies
npm install
#   or:  yarn install

# 3. Configure environment
cp .env.example .env.local
# Then open .env.local and fill in your real Supabase + API URL values

# 4. Run the dev server
npm run dev
#   or:  yarn dev
```

The app will be available at **http://localhost:3000**.

---

## 🔑 Required environment variables

Create `.env.local` (it is git-ignored) with the following keys:

| Variable                          | Description                                       | Example                                    |
| --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`        | Your Supabase project URL                         | `https://abc123.supabase.co`               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | The anon / public key (NOT the service-role key)  | `eyJhbGci...`                              |
| `NEXT_PUBLIC_API_URL`             | URL of the FastAPI scoring backend                | `http://localhost:8000` (dev)              |

Both Supabase values are found under **Supabase Dashboard → Project Settings → API**.

A template is provided in `.env.example`.

---

## 🗄 Supabase setup

The frontend expects the following tables to already exist (they are created in your
Supabase project — this repo does **not** ship migrations):

- `users` (id, name, email, avatar_url, points, created_at)
- `cases` (id, title, type, difficulty, content, hint, is_active, created_at)
- `submissions` (id, user_id, case_id, answer_text, score, feedback_json, created_at)
- `gd_briefs` (id, topic, summary, points_for[], points_against[], smart_angles[], data_points[], how_to_open, how_to_close, source_url, created_at)
- `learn_content` (id, case_type, title, body, display_order)

### 1. Enable auth providers

In **Supabase → Authentication → Providers**, enable:

- **Google** (paste in your OAuth client ID / secret)
- **Email** (with email + password)

### 2. Configure redirect URLs

In **Supabase → Authentication → URL Configuration → Redirect URLs**, add:

```
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

The `/auth/callback` route handles both OAuth and password-reset code exchanges.

### 3. Auto-create user row

Make sure a trigger inserts a row into `public.users` whenever a row is created in
`auth.users`. The app reads `public.users` for points, avatar, name and never
inserts users manually.

Example trigger (run once in the SQL editor if you don't already have one):

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, name, email, avatar_url, points)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    0
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 4. Seed sample data

Open `supabase/seed.sql` and paste the contents into **Supabase → SQL Editor**, then **Run**.
This populates:

- 5 Indian-context cases across all 4 types
- 1 sample GD brief
- 4 `learn_content` entries (one per case type)

The script uses `ON CONFLICT (id) DO NOTHING`, so it is safe to re-run.

### 5. (If RLS is enabled) Row Level Security policies

If RLS is on, add at minimum these read policies so anon users can fetch content
through the frontend:

```sql
create policy "public read cases"      on public.cases         for select using (true);
create policy "public read gd_briefs"  on public.gd_briefs     for select using (true);
create policy "public read learn"      on public.learn_content for select using (true);

-- and for the authenticated user's own data:
create policy "users read own row"     on public.users         for select using (auth.uid() = id);
create policy "users read own subs"    on public.submissions   for select using (auth.uid() = user_id);
```

---

## 🤖 How the scoring loop works

1. User opens `/cases/[id]`, writes an answer (min 200 chars), clicks **Submit**.
2. Frontend POSTs `{ user_id, case_id, answer_text }` to `${NEXT_PUBLIC_API_URL}/submit`.
3. The FastAPI scoring service:
   - calls its AI provider (Anthropic / OpenAI),
   - inserts a row into `submissions`,
   - returns `{ submission_id }`.
4. Frontend redirects to `/results/<submission_id>` which renders the score & feedback
   directly from Supabase (no LLM call from the frontend, ever).

---

## 🗂 Project structure

```
app/
  page.tsx                # /
  login/page.tsx
  signup/page.tsx
  forgot-password/page.tsx
  reset-password/page.tsx
  auth/callback/route.ts  # OAuth / magic-link code exchange
  dashboard/page.tsx      # auth required
  cases/page.tsx          # list with filters
  cases/[id]/page.tsx     # detail + submission form
  results/[id]/page.tsx   # AI score view
  learn/page.tsx
  gd-briefs/page.tsx
  leaderboard/page.tsx
  profile/page.tsx
components/
  app-nav.tsx
  auth-form.tsx
  sign-out-button.tsx
  cases-browser.tsx
  submission-form.tsx
  hint-toggle.tsx
  gd-brief-card.tsx
  learn-reader.tsx
  ui/                     # shadcn primitives
lib/
  api.ts                  # external scoring API calls
  constants.ts            # case types, score dimensions, routes
  types.ts                # DB row types
  supabase/
    client.ts
    server.ts
    middleware.ts
middleware.ts             # session refresh + route protection
supabase/seed.sql
```

---

## ▶️ Available scripts

| Command         | What it does                       |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start the local dev server on :3000 |
| `npm run build` | Production build                   |
| `npm start`     | Start the production build         |

---

## ☁️ Deploying to Vercel

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Add the three env vars listed above under **Project Settings → Environment Variables**.
4. Update your Supabase **Redirect URLs** to include the Vercel production URL.

That's it. The frontend deploys statelessly — all data lives in Supabase.

---

## 🪪 License

Private — © Consilio. All rights reserved.
