-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste
-- this whole file -> Run. See README.md "Auth setup" for the full walkthrough.

-- 1. One row per user, holding their display name + avatar look.
--    `id` matches auth.users.id 1:1, and rows are removed automatically if
--    the auth user is ever deleted.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_color text,
  avatar_energy text default 'still',
  avatar_symbols text[] default '{}',
  updated_at timestamptz default now()
);

-- 2. Row Level Security (RLS): OFF by default in Postgres means any request
--    using the app's anon key could read or write ANY row in this table.
--    Turning it on switches to "deny by default" — after this line, every
--    select/insert/update/delete is blocked unless a policy below allows it.
alter table public.profiles enable row level security;

-- 3. Policies: each one grants exactly one kind of access, scoped to "only
--    your own row" via auth.uid() (the ID of whoever is making the request).
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- (No delete policy — nobody can delete a profile row directly; it only goes
-- away automatically if the auth user itself is deleted, via the foreign key
-- above.)

-- 4. Auto-create a profile row the moment someone signs up, seeded with the
--    display name they typed on the signup form (stored as auth metadata).
--    `security definer` lets this function insert into `profiles` on the new
--    user's behalf, even though RLS would normally block it at that instant
--    (the new user has no session yet when this fires).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
