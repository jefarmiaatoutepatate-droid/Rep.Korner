/** Schéma SQLite (§5 de la spec). Une string SQL exécutée au premier lancement. */
export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;

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
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  food_id INTEGER REFERENCES foods(id),
  food_name TEXT NOT NULL,
  quantity_g REAL NOT NULL,
  kcal REAL, protein_g REAL, carbs_g REAL, fat_g REAL,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_meal_entries_date ON meal_entries(date);

CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  session_type TEXT NOT NULL,
  duration_min INTEGER,
  rating INTEGER,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);

CREATE TABLE IF NOT EXISTS sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER REFERENCES workouts(id),
  exercise_name TEXT NOT NULL,
  set_number INTEGER,
  weight_kg REAL,
  reps INTEGER,
  rir INTEGER
);
CREATE INDEX IF NOT EXISTS idx_sets_workout ON sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_exercise ON sets(exercise_name);

CREATE TABLE IF NOT EXISTS body_measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  weight_kg REAL,
  waist_cm REAL, chest_cm REAL,
  arm_r_cm REAL, arm_l_cm REAL,
  thigh_r_cm REAL, thigh_l_cm REAL,
  calf_cm REAL,
  photo_uri TEXT
);
CREATE INDEX IF NOT EXISTS idx_body_date ON body_measurements(date);

CREATE TABLE IF NOT EXISTS daily_log (
  date TEXT PRIMARY KEY,
  water_l REAL DEFAULT 0,
  creatine_taken INTEGER DEFAULT 0,
  sleep_hours REAL,
  mood INTEGER
);

CREATE TABLE IF NOT EXISTS weekly_reports (
  week_start TEXT PRIMARY KEY,
  json TEXT NOT NULL,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
`;
