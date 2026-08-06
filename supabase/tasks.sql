-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste
-- this whole file -> Run. Same pattern as profiles.sql — see that file for
-- more detail on why each part exists.

-- One row per to-do item (not one row per user, unlike college_tracker_data
-- — a user can have many tasks, so `id` is the row's own identity and
-- `user_id` is a plain foreign-key column, not the primary key).
create table public.tasks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create index tasks_user_id_idx on public.tasks (user_id, created_at);

create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

-- Unlike every other table in this project (profiles, user_roles,
-- college_tracker_data, the event logs), this one has a delete policy.
-- Deleting your own to-do item is a normal, low-risk personal action —
-- not a role assignment or an audit trail — so there's no reason to
-- withhold it the way those other tables deliberately do.
create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);
