import type { MealType } from '@/constants/theme';

/** Macros pour 100 g d'un aliment (schéma table `foods`). */
export interface Food {
  id: number;
  name: string;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  source: 'openfoodfacts' | 'claude' | 'manual';
  usage_count: number;
}

/** Macros absolues (pour une portion, un repas, une journée…). */
export interface Macros {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MealEntry {
  id: number;
  date: string; // YYYY-MM-DD
  meal_type: MealType;
  food_id: number | null;
  food_name: string;
  quantity_g: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at: string;
}

export interface Workout {
  id: number;
  date: string;
  session_type: 'lower_a' | 'upper_a' | 'lower_b' | 'upper_b';
  duration_min: number | null;
  rating: number | null;
  notes: string | null;
}

export interface WorkoutSet {
  id: number;
  workout_id: number;
  exercise_name: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rir: number | null;
}

export interface BodyMeasurement {
  id: number;
  date: string;
  weight_kg: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  arm_r_cm: number | null;
  arm_l_cm: number | null;
  thigh_r_cm: number | null;
  thigh_l_cm: number | null;
  calf_cm: number | null;
  photo_uri: string | null;
}

export interface DailyLog {
  date: string;
  water_l: number;
  creatine_taken: boolean;
  sleep_hours: number | null;
  mood: number | null;
}

/** Message de la conversation avec le coach virtuel. */
export interface CoachMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string | null;
}

/** Estimation de macros renvoyée par le fallback Claude / OpenFoodFacts. */
export interface MacroEstimate {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence?: 'high' | 'medium' | 'low';
}
