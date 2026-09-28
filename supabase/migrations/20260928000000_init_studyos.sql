-- StudyOS Initial Supabase Migration
-- Created: 2026-09-28
-- Normalized schema for personal academic management

-- 1. Profiles & Preferences
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  daily_study_goal_minutes integer not null default 240 check (daily_study_goal_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Semesters
create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  academic_year text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Subjects
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  semester_id uuid not null references public.semesters(id) on delete cascade,
  name text not null,
  code text not null,
  color text not null default '#3B82F6',
  description text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Syllabus Topics
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  confidence text not null check (confidence in ('not_studied', 'learning', 'needs_practice', 'confident')) default 'not_studied',
  last_reviewed_date date,
  next_review_date date,
  handbook_url text,
  notes_count integer not null default 0 check (notes_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Tasks & Subtasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  semester_id uuid not null references public.semesters(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  description text,
  due_date date not null,
  priority text not null check (priority in ('high', 'medium', 'low')) default 'medium',
  estimated_minutes integer not null default 30 check (estimated_minutes >= 0),
  status text not null check (status in ('todo', 'in_progress', 'blocked', 'completed')) default 'todo',
  scheduled_date date,
  is_important boolean not null default false,
  completed_at timestamptz,
  subtasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Study Sessions (Individual records; preserve history even if subjects or tasks are deleted)
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  duration_minutes integer not null check (duration_minutes > 0),
  start_time time,
  end_time time,
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Quick Notes
create table if not exists public.quick_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content text not null,
  subject_id uuid references public.subjects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Performance Indexes
create index if not exists idx_semesters_user on public.semesters(user_id);
create index if not exists idx_subjects_user_semester on public.subjects(user_id, semester_id);
create index if not exists idx_topics_user_subject on public.topics(user_id, subject_id);
create index if not exists idx_tasks_user_status_due on public.tasks(user_id, status, due_date);
create index if not exists idx_study_sessions_user_date on public.study_sessions(user_id, date);
create index if not exists idx_quick_notes_user_created on public.quick_notes(user_id, created_at desc);

-- Enable Row Level Security (RLS) on all tables
alter table public.user_profiles enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.tasks enable row level security;
alter table public.study_sessions enable row level security;
alter table public.quick_notes enable row level security;

-- 1. user_profiles RLS
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2. semesters RLS
create policy "Users can view own semesters"
  on public.semesters for select
  using (auth.uid() = user_id);

create policy "Users can insert own semesters"
  on public.semesters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own semesters"
  on public.semesters for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own semesters"
  on public.semesters for delete
  using (auth.uid() = user_id);

-- 3. subjects RLS
create policy "Users can view own subjects"
  on public.subjects for select
  using (auth.uid() = user_id);

create policy "Users can insert own subjects"
  on public.subjects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subjects"
  on public.subjects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own subjects"
  on public.subjects for delete
  using (auth.uid() = user_id);

-- 4. topics RLS
create policy "Users can view own topics"
  on public.topics for select
  using (auth.uid() = user_id);

create policy "Users can insert own topics"
  on public.topics for insert
  with check (auth.uid() = user_id);

create policy "Users can update own topics"
  on public.topics for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own topics"
  on public.topics for delete
  using (auth.uid() = user_id);

-- 5. tasks RLS
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- 6. study_sessions RLS
create policy "Users can view own study sessions"
  on public.study_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own study sessions"
  on public.study_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own study sessions"
  on public.study_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own study sessions"
  on public.study_sessions for delete
  using (auth.uid() = user_id);

-- 7. quick_notes RLS
create policy "Users can view own quick notes"
  on public.quick_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own quick notes"
  on public.quick_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own quick notes"
  on public.quick_notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own quick notes"
  on public.quick_notes for delete
  using (auth.uid() = user_id);

-- Auto-provision user_profiles row on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, daily_study_goal_minutes)
  values (new.id, 240)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
