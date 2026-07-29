-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste
-- this whole file -> Run. Same pattern as profiles.sql — see that file for
-- more detail on why each part exists. Run this AFTER profiles.sql (step 5
-- below adds a new admin-only read policy onto the existing profiles table
-- without touching anything already there).

-- 1. One row per user, holding their role. This is a SEPARATE table from
--    `profiles` on purpose: `profiles`'s existing update policy is scoped
--    to `auth.uid() = id` with no column-level restriction (Postgres RLS
--    applies to whole ROWS, not individual columns) — so if `role` lived on
--    `profiles`, any signed-in intern could run
--    `supabase.from("profiles").update({ role: "admin" }).eq("id", myId)`
--    and self-promote. Keeping `role` here, with NO insert/update/delete
--    policy at all (see below), makes that structurally impossible instead
--    of relying on someone remembering a `with check` clause.
create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'intern' check (role in ('intern', 'admin')),
  updated_at timestamptz default now()
);

alter table public.user_roles enable row level security;

-- 2. Reusable helper: "is the currently authenticated caller an admin?".
--    Other RLS policies — the ones below, and future tables that need the
--    same check — call this instead of repeating a self-referencing
--    subquery. `security definer` makes it run as its owner (postgres)
--    internally, which bypasses RLS on user_roles for the single row it
--    reads — this is what avoids any question of circular RLS evaluation
--    (the function itself is not subject to the policies below while it
--    executes). Must be created before the policies that reference it.
create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- 3. Selects only — a user can see their own role, and an admin can see
--    everyone's (needed later so an admin page can list users/roles).
create policy "Users can view their own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.is_admin());

-- (No insert/update/delete policy for any role — see comment in step 1.
-- The ONLY way a row in this table changes is a human editing it directly
-- in the Supabase Studio Table Editor / SQL Editor, which connects as the
-- `postgres` role and bypasses RLS entirely. There is deliberately no
-- self-serve or auto-grant path to becoming an admin from the app.)

-- 4. Auto-create an 'intern' role row the moment someone signs up,
--    mirroring handle_new_user() in profiles.sql. This runs as a second
--    trigger on the same auth.users insert — Postgres allows multiple
--    AFTER INSERT triggers on one table; both fire on every signup.
create function public.handle_new_user_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_roles (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created_role
  after insert on auth.users
  for each row execute procedure public.handle_new_user_role();

-- One-time backfill: the trigger above only covers signups from now on.
-- Give every user who already exists a default 'intern' row too, so
-- granting admin later is always just editing an existing row's `role`
-- cell in Table Editor, never inserting one from scratch.
insert into public.user_roles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- 5. Let admins read every profile too (a future admin dashboard will need
--    to look up display names etc. for all users). This is an ADDITIVE
--    policy only — it does not touch or replace the existing "Users can
--    view/update their own profile" policies in profiles.sql (permissive
--    select policies combine with OR), so the working avatar-save feature
--    is completely unaffected.
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());
