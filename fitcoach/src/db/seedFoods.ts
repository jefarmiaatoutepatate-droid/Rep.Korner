/**
 * Seed d'aliments courants (valeurs pour 100 g, réf. CIQUAL/ANSES arrondies).
 * Amorce le cache local pour que l'autocomplete ne soit pas vide au 1er lancement.
 */
export interface SeedFood {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const SEED_FOODS: SeedFood[] = [
  { name: 'Blanc de poulet grillé', kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Riz basmati cuit', kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Riz basmati cru', kcal: 350, protein: 7.5, carbs: 78, fat: 0.6 },
  { name: 'Pâtes cuites', kcal: 158, protein: 5.8, carbs: 31, fat: 0.9 },
  { name: 'Œuf entier', kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.9 },
  { name: 'Blanc d\'œuf', kcal: 52, protein: 11, carbs: 0.7, fat: 0.2 },
  { name: 'Flocons d\'avoine', kcal: 379, protein: 13, carbs: 67, fat: 6.9 },
  { name: 'Banane', kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Pomme', kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: 'Brocolis cuits', kcal: 35, protein: 2.4, carbs: 7, fat: 0.4 },
  { name: 'Patate douce cuite', kcal: 90, protein: 2, carbs: 21, fat: 0.1 },
  { name: 'Whey (poudre)', kcal: 400, protein: 80, carbs: 8, fat: 6 },
  { name: 'Fromage blanc 0%', kcal: 47, protein: 8, carbs: 4, fat: 0.2 },
  { name: 'Skyr nature', kcal: 63, protein: 11, carbs: 4, fat: 0.2 },
  { name: 'Thon au naturel égoutté', kcal: 116, protein: 26, carbs: 0, fat: 1 },
  { name: 'Saumon', kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Steak haché 5% cuit', kcal: 170, protein: 26, carbs: 0, fat: 7 },
  { name: 'Amandes', kcal: 579, protein: 21, carbs: 22, fat: 50 },
  { name: 'Beurre de cacahuète', kcal: 588, protein: 25, carbs: 20, fat: 50 },
  { name: 'Huile d\'olive', kcal: 900, protein: 0, carbs: 0, fat: 100 },
  { name: 'Pain complet', kcal: 247, protein: 9, carbs: 41, fat: 3.4 },
  { name: 'Lentilles cuites', kcal: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: 'Yaourt grec nature', kcal: 97, protein: 9, carbs: 4, fat: 5 },
  { name: 'Miel', kcal: 304, protein: 0.3, carbs: 82, fat: 0 },
];
