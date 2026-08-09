/**
 * Repositories : toutes les requêtes SQL, groupées par domaine.
 * Chaque donnée est rattachée au compte connecté (user_id via requireUserId()).
 */
import { getDB, requireUserId } from './index';
import type { Food, MealEntry, Workout, WorkoutSet, BodyMeasurement, DailyLog, Macros, CoachMessage } from '@/types';
import type { MealType } from '@/constants/theme';
import { computeMacros } from '@/lib/macros';

// ---------- Foods (cache partagé) ----------

export async function searchFoods(term: string, limit = 20): Promise<Food[]> {
  const db = await getDB();
  const like = `%${term.trim()}%`;
  return db.getAllAsync<Food>(
    `SELECT * FROM foods WHERE name LIKE ? ORDER BY usage_count DESC, name ASC LIMIT ?`,
    like,
    limit,
  );
}

export async function allFoods(): Promise<Food[]> {
  const db = await getDB();
  return db.getAllAsync<Food>('SELECT * FROM foods ORDER BY usage_count DESC, name ASC');
}

export async function upsertFood(food: Omit<Food, 'id' | 'usage_count'>): Promise<number> {
  const db = await getDB();
  const existing = await db.getFirstAsync<Food>('SELECT * FROM foods WHERE LOWER(name) = LOWER(?)', food.name);
  if (existing) return existing.id;
  const res = await db.runAsync(
    `INSERT INTO foods (name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, source, usage_count)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
    food.name,
    food.kcal_per_100g,
    food.protein_per_100g,
    food.carbs_per_100g,
    food.fat_per_100g,
    food.source,
  );
  return res.lastInsertRowId;
}

async function bumpFoodUsage(foodId: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('UPDATE foods SET usage_count = usage_count + 1 WHERE id = ?', foodId);
}

// ---------- Meal entries ----------

export async function addMealEntry(params: { date: string; meal_type: MealType; food: Food; quantity_g: number }): Promise<void> {
  const db = await getDB();
  const uid = requireUserId();
  const m = computeMacros(params.food, params.quantity_g);
  await db.runAsync(
    `INSERT INTO meal_entries (user_id, date, meal_type, food_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    uid,
    params.date,
    params.meal_type,
    params.food.id,
    params.food.name,
    params.quantity_g,
    m.kcal,
    m.protein_g,
    m.carbs_g,
    m.fat_g,
    new Date().toISOString(),
  );
  await bumpFoodUsage(params.food.id);
}

export async function getMealEntries(date: string): Promise<MealEntry[]> {
  const db = await getDB();
  return db.getAllAsync<MealEntry>('SELECT * FROM meal_entries WHERE user_id = ? AND date = ? ORDER BY created_at ASC', requireUserId(), date);
}

export async function getMealEntriesRange(from: string, to: string): Promise<MealEntry[]> {
  const db = await getDB();
  return db.getAllAsync<MealEntry>('SELECT * FROM meal_entries WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC', requireUserId(), from, to);
}

export async function deleteMealEntry(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM meal_entries WHERE id = ? AND user_id = ?', id, requireUserId());
}

export async function getDayTotals(date: string): Promise<Macros> {
  const db = await getDB();
  const row = await db.getFirstAsync<Macros>(
    `SELECT COALESCE(SUM(kcal),0) as kcal, COALESCE(SUM(protein_g),0) as protein_g,
            COALESCE(SUM(carbs_g),0) as carbs_g, COALESCE(SUM(fat_g),0) as fat_g
     FROM meal_entries WHERE user_id = ? AND date = ?`,
    requireUserId(),
    date,
  );
  return row ?? { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
}

// ---------- Daily log ----------

export async function getDailyLog(date: string): Promise<DailyLog> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ date: string; water_l: number; creatine_taken: number; sleep_hours: number | null; mood: number | null }>(
    'SELECT * FROM daily_log WHERE user_id = ? AND date = ?',
    requireUserId(),
    date,
  );
  if (!row) return { date, water_l: 0, creatine_taken: false, sleep_hours: null, mood: null };
  return { date: row.date, water_l: row.water_l, creatine_taken: !!row.creatine_taken, sleep_hours: row.sleep_hours, mood: row.mood };
}

export async function setWater(date: string, water_l: number): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO daily_log (user_id, date, water_l) VALUES (?, ?, ?)
     ON CONFLICT(user_id, date) DO UPDATE SET water_l = excluded.water_l`,
    requireUserId(),
    date,
    water_l,
  );
}

export async function setCreatine(date: string, taken: boolean): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO daily_log (user_id, date, creatine_taken) VALUES (?, ?, ?)
     ON CONFLICT(user_id, date) DO UPDATE SET creatine_taken = excluded.creatine_taken`,
    requireUserId(),
    date,
    taken ? 1 : 0,
  );
}

// ---------- Workouts & sets ----------

export async function createWorkout(date: string, session_type: Workout['session_type']): Promise<number> {
  const db = await getDB();
  const res = await db.runAsync('INSERT INTO workouts (user_id, date, session_type) VALUES (?, ?, ?)', requireUserId(), date, session_type);
  return res.lastInsertRowId;
}

export async function finishWorkout(id: number, data: { duration_min?: number; rating?: number; notes?: string }): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'UPDATE workouts SET duration_min = ?, rating = ?, notes = ? WHERE id = ? AND user_id = ?',
    data.duration_min ?? null,
    data.rating ?? null,
    data.notes ?? null,
    id,
    requireUserId(),
  );
}

export async function getWorkouts(from: string, to: string): Promise<Workout[]> {
  const db = await getDB();
  return db.getAllAsync<Workout>('SELECT * FROM workouts WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC', requireUserId(), from, to);
}

export async function addSet(set: Omit<WorkoutSet, 'id'>): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO sets (user_id, workout_id, exercise_name, set_number, weight_kg, reps, rir) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    requireUserId(),
    set.workout_id,
    set.exercise_name,
    set.set_number,
    set.weight_kg,
    set.reps,
    set.rir ?? null,
  );
}

export async function getSetsForWorkout(workoutId: number): Promise<WorkoutSet[]> {
  const db = await getDB();
  return db.getAllAsync<WorkoutSet>('SELECT * FROM sets WHERE workout_id = ? AND user_id = ? ORDER BY exercise_name, set_number', workoutId, requireUserId());
}

export async function getLastSetsForExercise(exercise: string, limit = 6): Promise<WorkoutSet[]> {
  const db = await getDB();
  return db.getAllAsync<WorkoutSet>(
    `SELECT s.* FROM sets s JOIN workouts w ON w.id = s.workout_id
     WHERE s.user_id = ? AND s.exercise_name = ? ORDER BY w.date DESC, s.set_number ASC LIMIT ?`,
    requireUserId(),
    exercise,
    limit,
  );
}

export async function getBestWeight(exercise: string, from: string, to: string): Promise<number | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ best: number | null }>(
    `SELECT MAX(s.weight_kg) as best FROM sets s JOIN workouts w ON w.id = s.workout_id
     WHERE s.user_id = ? AND s.exercise_name = ? AND w.date BETWEEN ? AND ?`,
    requireUserId(),
    exercise,
    from,
    to,
  );
  return row?.best ?? null;
}

export async function getWeeklyVolume(from: string, to: string): Promise<number> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ vol: number }>(
    `SELECT COALESCE(SUM(s.weight_kg * s.reps),0) as vol FROM sets s JOIN workouts w ON w.id = s.workout_id
     WHERE s.user_id = ? AND w.date BETWEEN ? AND ?`,
    requireUserId(),
    from,
    to,
  );
  return row?.vol ?? 0;
}

// ---------- Body measurements ----------

export async function addMeasurement(m: Omit<BodyMeasurement, 'id'>): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO body_measurements
       (user_id, date, weight_kg, waist_cm, chest_cm, arm_r_cm, arm_l_cm, thigh_r_cm, thigh_l_cm, calf_cm, photo_uri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    requireUserId(),
    m.date,
    m.weight_kg,
    m.waist_cm,
    m.chest_cm,
    m.arm_r_cm,
    m.arm_l_cm,
    m.thigh_r_cm,
    m.thigh_l_cm,
    m.calf_cm,
    m.photo_uri,
  );
}

export async function getMeasurements(limit = 100): Promise<BodyMeasurement[]> {
  const db = await getDB();
  return db.getAllAsync<BodyMeasurement>('SELECT * FROM body_measurements WHERE user_id = ? ORDER BY date DESC LIMIT ?', requireUserId(), limit);
}

export async function getWeightsRange(from: string, to: string): Promise<number[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<{ weight_kg: number }>(
    'SELECT weight_kg FROM body_measurements WHERE user_id = ? AND date BETWEEN ? AND ? AND weight_kg IS NOT NULL ORDER BY date ASC',
    requireUserId(),
    from,
    to,
  );
  return rows.map((r) => r.weight_kg);
}

export async function getLatestWeight(): Promise<number | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ weight_kg: number }>(
    'SELECT weight_kg FROM body_measurements WHERE user_id = ? AND weight_kg IS NOT NULL ORDER BY date DESC LIMIT 1',
    requireUserId(),
  );
  return row?.weight_kg ?? null;
}

// ---------- Weekly reports ----------

export async function saveWeeklyReport(weekStart: string, json: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO weekly_reports (user_id, week_start, json, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, week_start) DO UPDATE SET json = excluded.json, created_at = excluded.created_at`,
    requireUserId(),
    weekStart,
    json,
    new Date().toISOString(),
  );
}

export async function getArchivedReports(): Promise<{ week_start: string; json: string }[]> {
  const db = await getDB();
  return db.getAllAsync<{ week_start: string; json: string }>('SELECT week_start, json FROM weekly_reports WHERE user_id = ? ORDER BY week_start DESC', requireUserId());
}

// ---------- Coach virtuel ----------

export async function getCoachMessages(): Promise<CoachMessage[]> {
  const db = await getDB();
  return db.getAllAsync<CoachMessage>('SELECT id, role, content, created_at FROM coach_messages WHERE user_id = ? ORDER BY id ASC', requireUserId());
}

export async function addCoachMessage(role: 'user' | 'assistant', content: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('INSERT INTO coach_messages (user_id, role, content, created_at) VALUES (?, ?, ?, ?)', requireUserId(), role, content, new Date().toISOString());
}

export async function clearCoachMessages(): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM coach_messages WHERE user_id = ?', requireUserId());
}
