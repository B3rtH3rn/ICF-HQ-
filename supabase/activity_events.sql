-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste
-- this whole file -> Run. Run AFTER user_roles.sql — both tables' admin
-- read policy below calls public.is_admin(), defined there.

-- Two append-only event logs powering the admin dashboard's engagement
-- view: one row per sign-in, one row per app page an intern opens.
create table public.login_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.app_open_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  app_id text not null,
  created_at timestamptz not null default now()
);

alter table public.login_events enable row level security;
alter table public.app_open_events enable row level security;

-- Speeds up the admin dashboard's per-user aggregation (grouping/sorting by
-- user, most-recent-first).
create index login_events_user_id_idx
  on public.login_events (user_id, created_at desc);
create index app_open_events_user_id_idx
  on public.app_open_events (user_id, created_at desc);

-- Unlike user_roles.sql, these tables DO need an insert path — this is
-- exactly what the login/signup pages and the app-open tracker call from
-- the browser. Known, accepted limitation: RLS only checks "is this your
-- own user_id," so a curious intern could in principle call this insert
-- repeatedly to inflate their own apparent engagement. This is an internal
-- staff-facing engagement view for a small nonprofit, not a fraud-critical
-- metric, so no extra rate-limiting/trigger is being added for that.
create policy "Users can record their own login events"
  on public.login_events for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own login events"
  on public.login_events for select
  using (auth.uid() = user_id);

create policy "Admins can view all login events"
  on public.login_events for select
  using (public.is_admin());

create policy "Users can record their own app-open events"
  on public.app_open_events for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own app-open events"
  on public.app_open_events for select
  using (auth.uid() = user_id);

create policy "Admins can view all app-open events"
  on public.app_open_events for select
  using (public.is_admin());

-- No update/delete policy on either table — both are append-only logs.
-- No retention/deletion policy is set up here either; that's a deliberate
-- decision left to the foundation given this hub serves minors, not an
-- oversight.
