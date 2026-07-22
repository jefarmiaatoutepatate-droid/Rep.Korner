/**
 * Logique de calcul des macros — PURE (aucune dépendance Expo/RN).
 * Couverte par des tests unitaires (__tests__/macros.test.ts).
 */
import type { Food, Macros } from '@/types';

/** Arrondit à `decimals` décimales de façon stable. */
export function round(value: number, decimals = 0): number {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * f) / f;
}

/**
 * Calcule les macros d'une portion à partir des valeurs pour 100 g.
 * `(macros/100g) × quantité` (§4 niveau 1).
 */
export function computeMacros(
  per100g: Pick<Food, 'kcal_per_100g' | 'protein_per_100g' | 'carbs_per_100g' | 'fat_per_100g'>,
  quantityG: number,
): Macros {
  const factor = quantityG / 100;
  return {
    kcal: round(per100g.kcal_per_100g * factor),
    protein_g: round(per100g.protein_per_100g * factor, 1),
    carbs_g: round(per100g.carbs_per_100g * factor, 1),
    fat_g: round(per100g.fat_per_100g * factor, 1),
  };
}

/** Additionne une liste de macros (repas, journée…). */
export function sumMacros(entries: Macros[]): Macros {
  return entries.reduce<Macros>(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein_g: acc.protein_g + m.protein_g,
      carbs_g: acc.carbs_g + m.carbs_g,
      fat_g: acc.fat_g + m.fat_g,
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  );
}

/**
 * Vérifie la cohérence énergétique d'un aliment (4/4/9 kcal par g).
 * Tolérance ±15 % — utile pour flagger une saisie manuelle douteuse.
 */
export function isEnergyConsistent(food: Pick<Food, 'kcal_per_100g' | 'protein_per_100g' | 'carbs_per_100g' | 'fat_per_100g'>): boolean {
  const computed = food.protein_per_100g * 4 + food.carbs_per_100g * 4 + food.fat_per_100g * 9;
  if (food.kcal_per_100g <= 0) return computed === 0;
  const ratio = computed / food.kcal_per_100g;
  return ratio >= 0.85 && ratio <= 1.15;
}

/**
 * Progression (0..1, capée à 1) d'une valeur vers sa cible.
 * Sert aux anneaux / barres du dashboard.
 */
export function progress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(current / target, 1);
}

/** Pourcentage entier 0..100 (non capé) — pour l'affichage type "112 %". */
export function pct(current: number, target: number): number {
  if (target <= 0) return 0;
  return round((current / target) * 100);
}

/** Reste avant d'atteindre la cible (0 si dépassée). */
export function remaining(current: number, target: number): number {
  return Math.max(round(target - current), 0);
}
