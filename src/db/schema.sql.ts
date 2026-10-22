/**
 * Normalized Supabase / PostgreSQL Schema & Row Level Security (RLS) Policies
 * for PixelQuest Task Manager
 */

export const SUPABASE_MIGRATION_SQL = `-- ====================================================================
-- PixelQuest Task Manager - Supabase PostgreSQL Schema & RLS Policies
-- Compatible with Supabase Postgres & Row Level Security (RLS)
-- ====================================================================

-- 1. PROFILES & USER PREFERENCES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default 'Retro Hero',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. USER PRODUCTIVITY STATS (RPG Mechanics & Gamified Focus Metrics)
create table if not exists public.user_stats (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  xp_to_next_level integer not null default 100 check (xp_to_next_level > 0),
  hp integer not null default 100 check (hp >= 0 and hp <= 100),
  max_hp integer not null default 100,
  streak_days integer not null default 1 check (streak_days >= 0),
  last_active_date date not null default current_date,
  tasks_completed_total integer not null default 0,
  focus_minutes_total integer not null default 0,
  focus_streak_current integer not null default 0,
  focus_streak_best integer not null default 0,
  focus_sessions_attempted integer not null default 0,
  focus_sessions_completed integer not null default 0,
  focus_completion_rate integer not null default 100,
  daily_quest_claimed_date text default '',
  daily_quest_streak integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 3. TASKS TABLE (Eisenhower Matrix, Deadlines & Sync)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) > 0),
  description text default '',
  due_date date,
  due_time text default '',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  category text not null default 'Main Quest',
  is_important boolean not null default false,
  is_urgent boolean not null default false,
  matrix_quadrant text not null default 'q4_eliminate' check (matrix_quadrant in ('q1_do_first', 'q2_schedule', 'q3_delegate', 'q4_eliminate')),
  estimated_minutes integer not null default 25 check (estimated_minutes >= 5),
  is_completed boolean not null default false,
  completed_at timestamptz,
  reminder_set boolean not null default false,
  xp_awarded integer not null default 0,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for lightning fast queries and sync
create index if not exists idx_tasks_user_updated on public.tasks(user_id, updated_at desc);
create index if not exists idx_tasks_user_completed on public.tasks(user_id, is_completed);
create index if not exists idx_tasks_user_due_date on public.tasks(user_id, due_date);
create index if not exists idx_tasks_quadrant on public.tasks(user_id, matrix_quadrant);

-- 4. FOCUS SESSIONS (Pomodoro Logs)
create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  task_title text,
  mode text not null check (mode in ('focus', 'short_break', 'long_break')),
  duration_minutes integer not null check (duration_minutes > 0),
  completed boolean not null default true,
  timestamp timestamptz not null default now()
);

create index if not exists idx_focus_sessions_user on public.focus_sessions(user_id, timestamp desc);

-- 5. ACHIEVEMENTS & UNLOCKED BADGES
create table if not exists public.achievements (
  id text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  icon text not null,
  category text not null,
  xp_bonus integer not null default 50,
  unlocked_at timestamptz not null default now(),
  primary key (id, user_id)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Users can ONLY access and modify their own records!
-- ====================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_stats enable row level security;
alter table public.tasks enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.achievements enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- User Stats Policies
create policy "Users can view own stats" on public.user_stats
  for select using (auth.uid() = user_id);

create policy "Users can update own stats" on public.user_stats
  for update using (auth.uid() = user_id);

create policy "Users can insert own stats" on public.user_stats
  for insert with check (auth.uid() = user_id);

-- Tasks Policies
create policy "Users can view own tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users can insert own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks" on public.tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- Focus Sessions Policies
create policy "Users can view own focus sessions" on public.focus_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert own focus sessions" on public.focus_sessions
  for insert with check (auth.uid() = user_id);

-- Achievements Policies
create policy "Users can view own achievements" on public.achievements
  for select using (auth.uid() = user_id);

create policy "Users can insert own achievements" on public.achievements
  for insert with check (auth.uid() = user_id);

-- ====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', 'Hero'));
  
  insert into public.user_stats (user_id, level, xp, hp, max_hp, streak_days)
  values (new.id, 1, 0, 100, 100, 1);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
`;
