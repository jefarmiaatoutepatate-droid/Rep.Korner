/**
 * Bilan hebdomadaire (§8) — logique PURE, testée (__tests__/weeklyReport.test.ts).
 * Les données sont injectées (pas d'accès DB ici) → facile à tester.
 */
import { REPORT_THRESHOLDS, TARGETS } from '@/constants/profile';
import { KEY_LIFTS } from '@/constants/program';
import { round } from '@/lib/macros';

export interface DayNutrition {
  date: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface ReportInput {
  weekStart: string; // YYYY-MM-DD (lundi)
  days: DayNutrition[]; // jours loggés de la semaine
  sessionsCompleted: number;
  totalVolumeKg: number; // Σ (poids × reps)
  weekWeights: number[]; // pesées de la semaine
  prevWeekWeightAvg: number | null;
  /** Meilleure charge (e1RM approx ou top set) par exercice clé, semaine courante vs précédente. */
  keyLiftBests: Record<string, { current: number | null; previous: number | null }>;
  /** Semaine 1 à 3 de créatine → rétention d'eau attendue, on n'ajuste pas les kcal. */
  isCreatineWeek1to3: boolean;
}

export interface WeeklyReport {
  nutrition: {
    avg_kcal_per_day: number;
    avg_protein: number;
    avg_carbs: number;
    avg_fat: number;
    days_logged: number;
    days_hit_protein_target: number;
    days_over_kcal_target: number;
    compliance_pct: number;
  };
  training: {
    sessions_completed: number;
    sessions_planned: number;
    total_volume_kg: number;
    prs_this_week: string[];
  };
  body: {
    weight_current: number | null;
    weight_delta_kg: number | null;
    trend: 'loss' | 'gain' | 'stable' | 'unknown';
  };
  recommendation: string;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Détecte les records battus sur les exos clés cette semaine. */
export function comparePersonalRecords(
  keyLiftBests: ReportInput['keyLiftBests'],
): string[] {
  const prs: string[] = [];
  for (const lift of KEY_LIFTS) {
    const b = keyLiftBests[lift];
    if (!b) continue;
    if (b.current != null && (b.previous == null || b.current > b.previous)) {
      prs.push(lift);
    }
  }
  return prs;
}

export function interpretTrend(delta: number | null): WeeklyReport['body']['trend'] {
  if (delta == null) return 'unknown';
  if (delta <= -0.2) return 'loss';
  if (delta >= 0.2) return 'gain';
  return 'stable';
}

/**
 * Règles de recommandation d'ajustement calorique (§8).
 * Objectif : perte lente ~0,2-0,4 kg/sem (80 → 77 kg).
 */
export function generateRecommendation(args: {
  weightDelta: number | null;
  daysHitProtein: number;
  isCreatineWeek1to3: boolean;
}): string {
  const { weightDelta, daysHitProtein, isCreatineWeek1to3 } = args;

  // Protéines d'abord : levier prioritaire, indépendant du poids.
  if (daysHitProtein < REPORT_THRESHOLDS.proteinComplianceMinDays) {
    return 'Manque de protéines cette semaine. Ajoute une whey/jour pour tenir la cible de 160 g.';
  }

  if (weightDelta == null) {
    return 'Pas assez de pesées cette semaine. Pèse-toi lundi et jeudi matin à jeun.';
  }

  if (weightDelta < -0.7) {
    return 'Tu perds trop vite (risque de perte musculaire). +100 kcal de glucides/jour.';
  }
  if (weightDelta > 0.3) {
    if (isCreatineWeek1to3) {
      return 'Léger gain, probablement la rétention d\'eau de la créatine (S1-3). On ne touche à rien.';
    }
    return 'Le poids stagne / remonte. -100 kcal de glucides/jour.';
  }
  if (weightDelta > -0.2 && weightDelta <= 0.3) {
    return 'Perte un peu lente mais dans la marge. Maintiens les cibles, réévalue dans 1 semaine.';
  }
  // -0.7 <= delta <= -0.2 : cible idéale
  return 'Cible OK (perte lente et propre), continue exactement pareil.';
}

export function generateWeeklyReport(input: ReportInput): WeeklyReport {
  const { days } = input;

  const avgKcal = mean(days.map((d) => d.kcal));
  const avgProtein = mean(days.map((d) => d.protein_g));
  const avgCarbs = mean(days.map((d) => d.carbs_g));
  const avgFat = mean(days.map((d) => d.fat_g));

  const daysHitProtein = days.filter((d) => d.protein_g >= TARGETS.protein_g).length;
  const daysOverKcal = days.filter((d) => d.kcal > REPORT_THRESHOLDS.kcalOverLimit).length;
  const daysWithinRange = days.filter(
    (d) => d.kcal >= REPORT_THRESHOLDS.kcalLowerBand && d.kcal <= REPORT_THRESHOLDS.kcalUpperBand,
  ).length;

  const weightCurrent = input.weekWeights.length ? mean(input.weekWeights) : null;
  const weightDelta =
    weightCurrent != null && input.prevWeekWeightAvg != null
      ? weightCurrent - input.prevWeekWeightAvg
      : null;

  return {
    nutrition: {
      avg_kcal_per_day: round(avgKcal),
      avg_protein: round(avgProtein),
      avg_carbs: round(avgCarbs),
      avg_fat: round(avgFat),
      days_logged: days.length,
      days_hit_protein_target: daysHitProtein,
      days_over_kcal_target: daysOverKcal,
      compliance_pct: round((daysWithinRange / 7) * 100),
    },
    training: {
      sessions_completed: input.sessionsCompleted,
      sessions_planned: 4,
      total_volume_kg: round(input.totalVolumeKg),
      prs_this_week: comparePersonalRecords(input.keyLiftBests),
    },
    body: {
      weight_current: weightCurrent != null ? round(weightCurrent, 1) : null,
      weight_delta_kg: weightDelta != null ? round(weightDelta, 2) : null,
      trend: interpretTrend(weightDelta),
    },
    recommendation: generateRecommendation({
      weightDelta,
      daysHitProtein,
      isCreatineWeek1to3: input.isCreatineWeek1to3,
    }),
  };
}
