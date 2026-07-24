-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste
-- this whole file -> Run. Same pattern as profiles.sql — see that file for
-- more detail on why each part exists.

-- One row per user, holding the entire College Process Tracker state as a
-- single JSON blob. The app's own code already treats its data as one
-- object (schools/essays/recs/scholarships/calls/visits/links/achievements/
-- emailDraft/scholarshipProfile/etc.) — storing it as one jsonb column
-- keeps that shape intact instead of splitting it into many tables.
create table public.college_tracker_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.college_tracker_data enable row level security;

create policy "Users can view their own tracker data"
  on public.college_tracker_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tracker data"
  on public.college_tracker_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tracker data"
  on public.college_tracker_data for update
  using (auth.uid() = user_id);

-- (No delete policy, matching profiles.sql — nothing in the app deletes this
-- row directly; it only goes away if the auth user itself is deleted, via
-- the foreign key above.)
