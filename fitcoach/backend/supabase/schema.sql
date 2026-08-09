-- ============================================================
-- FitCoach — schéma Supabase (Postgres) pour la sync cloud.
-- À coller dans l'éditeur SQL de ton projet Supabase.
-- L'auth (table auth.users) est fournie par Supabase ; on rattache
-- toutes les données à auth.uid() via Row Level Security (RLS).
-- ============================================================

-- Profil applicatif (1 ligne par utilisateur)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  weight_start_kg real,
  weight_target_kg real,
  created_at timestamptz default now()
);

create table if not exists meal_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal_type text not null,
  food_name text not null,
  quantity_g real not null,
  kcal real, protein_g real, carbs_g real, fat_g real,
  created_at timestamptz default now()
);

create table if not exists workouts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  session_type text not null,
  duration_min int, rating int, notes text
);

create table if not exists sets (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id bigint references workouts(id) on delete cascade,
  exercise_name text not null,
  set_number int, weight_kg real, reps int, rir int
);

create table if not exists body_measurements (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg real, waist_cm real, chest_cm real,
  arm_r_cm real, arm_l_cm real, thigh_r_cm real, thigh_l_cm real, calf_cm real,
  photo_uri text
);

create table if not exists daily_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  water_l real default 0,
  creatine_taken boolean default false,
  sleep_hours real, mood int,
  primary key (user_id, date)
);

create table if not exists weekly_reports (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  json jsonb not null,
  created_at timestamptz default now(),
  primary key (user_id, week_start)
);

-- ---------- Row Level Security : chacun ne voit que ses données ----------
alter table profiles          enable row level security;
alter table meal_entries      enable row level security;
alter table workouts          enable row level security;
alter table sets              enable row level security;
alter table body_measurements enable row level security;
alter table daily_log         enable row level security;
alter table weekly_reports    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['meal_entries','workouts','sets','body_measurements','daily_log','weekly_reports']
  loop
    execute format($f$
      create policy "own_rows_select" on %1$I for select using (user_id = auth.uid());
      create policy "own_rows_insert" on %1$I for insert with check (user_id = auth.uid());
      create policy "own_rows_update" on %1$I for update using (user_id = auth.uid());
      create policy "own_rows_delete" on %1$I for delete using (user_id = auth.uid());
    $f$, t);
  end loop;
end $$;

create policy "own_profile_all" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
