/**
 * Calcul des besoins caloriques personnalisés — logique PURE (aucune dépendance
 * Expo/RN), couverte par des tests unitaires (__tests__/nutritionCalc.test.ts).
 *
 * Méthode : BMR Mifflin-St Jeor → TDEE (× facteur d'activité déduit du nombre de
 * séances/semaine) → ajustement selon l'objectif → répartition des macros.
 */

export type Sex = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';

/** Données saisies par l'utilisateur à l'inscription. */
export interface ProfileInput {
  sex: Sex;
  age: number;
  height_cm: number;
  weight_kg: number;
  weight_target_kg: number;
  sessions_per_week: number;
  goal: Goal;
}

/** Cibles quotidiennes calculées à partir du profil. */
export interface Targets {
  tdee_kcal: number;
  daily_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_l: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}
const round5 = (v: number): number => Math.round(v / 5) * 5;
const round10 = (v: number): number => Math.round(v / 10) * 10;

/** Métabolisme de base (kcal/j) — équation de Mifflin-St Jeor. */
export function bmrMifflin(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

/**
 * Facteur d'activité déduit du nombre de séances hebdomadaires
 * (musculation intense + vie courante). 0 séance ≈ sédentaire.
 */
export function activityFactor(sessionsPerWeek: number): number {
  const s = clamp(sessionsPerWeek, 0, 14);
  if (s <= 0) return 1.2;
  if (s <= 2) return 1.375;
  if (s <= 4) return 1.55;
  if (s <= 6) return 1.725;
  return 1.9;
}

/** Ajustement calorique (kcal/j) selon l'objectif. */
export function goalAdjustment(goal: Goal): number {
  if (goal === 'lose') return -450; // déficit modéré ≈ -0,4 kg/sem
  if (goal === 'gain') return 350; // léger surplus (prise propre)
  return 0;
}

/** Objectif suggéré d'après l'écart poids actuel / poids cible. */
export function suggestGoal(weightKg: number, weightTargetKg: number): Goal {
  const d = weightTargetKg - weightKg;
  if (d <= -1.5) return 'lose';
  if (d >= 1.5) return 'gain';
  return 'maintain';
}

/**
 * Calcule les cibles quotidiennes complètes à partir du profil.
 * Protéines & lipides indexés sur le poids ; glucides = reste de l'énergie.
 */
export function computeTargets(p: ProfileInput): Targets {
  const bmr = bmrMifflin(p.sex, p.weight_kg, p.height_cm, p.age);
  const tdee = Math.round(bmr * activityFactor(p.sessions_per_week));

  const floor = p.sex === 'male' ? 1500 : 1200; // garde-fou santé
  const daily = Math.max(round10(tdee + goalAdjustment(p.goal)), floor);

  const proteinPerKg = p.goal === 'lose' ? 2.0 : 1.8;
  const protein_g = round5(p.weight_kg * proteinPerKg);

  const fatPerKg = p.goal === 'lose' ? 0.8 : 0.9;
  let fat_g = round5(p.weight_kg * fatPerKg);
  // On garde au moins ~15 % de l'énergie pour les glucides.
  const maxFatKcal = daily * 0.9 - protein_g * 4;
  if (fat_g * 9 > maxFatKcal) fat_g = round5(Math.max(maxFatKcal, 0) / 9);

  const carbs_g = Math.max(round5((daily - protein_g * 4 - fat_g * 9) / 4), 0);
  const water_l = clamp(Math.round(p.weight_kg * 0.035 * 10) / 10, 2, 4);

  return { tdee_kcal: tdee, daily_kcal: daily, protein_g, carbs_g, fat_g, water_l };
}

/** Libellés FR des objectifs (UI). */
export const GOAL_LABELS: Record<Goal, string> = {
  lose: 'Perdre du gras',
  maintain: 'Me maintenir',
  gain: 'Prendre du muscle',
};
