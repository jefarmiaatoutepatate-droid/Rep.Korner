/**
 * Profil utilisateur & cibles — hardcodés dans l'app (§1 de la spec).
 * Une seule source de vérité, importée partout où on a besoin des cibles.
 */

export interface UserProfile {
  sex: 'male' | 'female';
  age: number;
  height_cm: number;
  weight_start_kg: number;
  weight_target_kg: number;
  activity_level: string;
  training_venue: string;
  dietary_restrictions: string[];
  supplements: string[];
}

export interface Targets {
  tdee_kcal: number;
  daily_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_l: number;
}

export const USER: UserProfile = {
  sex: 'male',
  age: 23,
  height_cm: 178,
  weight_start_kg: 80,
  weight_target_kg: 77,
  activity_level: 'sedentary_job_+_4x_training',
  training_venue: 'gym',
  dietary_restrictions: ['no_pork'],
  supplements: ['creatine_monohydrate_5g_daily'],
};

export const TARGETS: Targets = {
  tdee_kcal: 2700,
  daily_kcal: 2450,
  protein_g: 160,
  carbs_g: 290,
  fat_g: 70,
  water_l: 3.0,
};

export const PROGRAM_DURATION_WEEKS = 8;
export const TRAINING_SPLIT = 'upper_lower_4_days';

/** Seuils utilisés par le bilan hebdo (§8). */
export const REPORT_THRESHOLDS = {
  /** kcal au-delà de laquelle une journée est "over" */
  kcalOverLimit: 2550,
  /** nb de jours/semaine où atteindre la cible protéines */
  proteinComplianceMinDays: 5,
  /** kcal max pour rester "dans la fourchette" (compliance) */
  kcalUpperBand: 2600,
  /** kcal min pour rester "dans la fourchette" */
  kcalLowerBand: 2250,
};
