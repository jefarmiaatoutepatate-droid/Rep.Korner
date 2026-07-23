/** Schéma SQLite (§5) — version multi-utilisateur (données rattachées à un compte). */
export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;

-- Comptes utilisateurs (auth locale ; miroir du compte cloud quand Supabase est activé)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,               -- uuid
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT,                -- null pour un compte cloud (mot de passe géré serveur)
  password_salt TEXT,
  remote_id TEXT,                    -- id Supabase quand synchronisé
  created_at TEXT
);

-- Cache d'aliments (partagé entre comptes — base de référence commune)
CREATE TABLE IF NOT EXISTS foods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  kcal_per_100g REAL,
  protein_per_100g REAL,
  carbs_per_100g REAL,
  fat_per_100g REAL,
  source TEXT,
  usage_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  food_id INTEGER REFERENCES foods(id),
  food_name TEXT NOT NULL,
  quantity_g REAL NOT NULL,
  kcal REAL, protein_g REAL, carbs_g REAL, fat_g REAL,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_meal_entries_user_date ON meal_entries(user_id, date);

CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  session_type TEXT NOT NULL,
  duration_min INTEGER,
  rating INTEGER,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);

CREATE TABLE IF NOT EXISTS sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  workout_id INTEGER REFERENCES workouts(id),
  exercise_name TEXT NOT NULL,
  set_number INTEGER,
  weight_kg REAL,
  reps INTEGER,
  rir INTEGER
);
CREATE INDEX IF NOT EXISTS idx_sets_workout ON sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_user_exercise ON sets(user_id, exercise_name);

CREATE TABLE IF NOT EXISTS body_measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  weight_kg REAL,
  waist_cm REAL, chest_cm REAL,
  arm_r_cm REAL, arm_l_cm REAL,
  thigh_r_cm REAL, thigh_l_cm REAL,
  calf_cm REAL,
  photo_uri TEXT
);
CREATE INDEX IF NOT EXISTS idx_body_user_date ON body_measurements(user_id, date);

CREATE TABLE IF NOT EXISTS daily_log (
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  water_l REAL DEFAULT 0,
  creatine_taken INTEGER DEFAULT 0,
  sleep_hours REAL,
  mood INTEGER,
  PRIMARY KEY (user_id, date)
);

CREATE TABLE IF NOT EXISTS weekly_reports (
  user_id TEXT NOT NULL,
  week_start TEXT NOT NULL,
  json TEXT NOT NULL,
  created_at TEXT,
  PRIMARY KEY (user_id, week_start)
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
`;
