/**
 * Profil & cibles PAR DÉFAUT (fallback).
 *
 * Depuis l'ajout de l'onboarding, chaque compte a SON profil (âge, taille, poids,
 * séances…) et SES cibles calculées (voir `src/lib/nutritionCalc.ts`), stockés en
 * base et exposés via le store d'auth. Ces constantes servent uniquement de repli
 * pour les comptes créés avant l'onboarding et pour les tests.
 */
import type { ProfileInput, Targets as ComputedTargets } from '@/lib/nutritionCalc';

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

/** Profil par défaut (repli), au format attendu par le calcul des cibles. */
export const DEFAULT_PROFILE: ProfileInput = {
  sex: USER.sex,
  age: USER.age,
  height_cm: USER.height_cm,
  weight_kg: USER.weight_start_kg,
  weight_target_kg: USER.weight_target_kg,
  sessions_per_week: 4,
  goal: 'lose',
};

/** Cibles par défaut (repli) — alias explicite de TARGETS. */
export const DEFAULT_TARGETS: ComputedTargets = TARGETS;

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
