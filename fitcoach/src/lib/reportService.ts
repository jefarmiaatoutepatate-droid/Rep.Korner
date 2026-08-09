/**
 * Fait le pont DB → logique pure du bilan hebdo.
 * Récupère les données de la semaine puis délègue à generateWeeklyReport (§8).
 */
import { generateWeeklyReport, type ReportInput, type DayNutrition, type WeeklyReport } from '@/lib/weeklyReport';
import { KEY_LIFTS } from '@/constants/program';
import { startOfWeek, weekDates, toISODate, addDays } from '@/lib/dates';
import {
  getMealEntriesRange,
  getWorkouts,
  getWeightsRange,
  getWeeklyVolume,
  getBestWeight,
  saveWeeklyReport,
} from '@/db/repositories';
import { USER } from '@/constants/profile';
import { getActiveTargets } from '@/lib/activeProfile';

/** Numéro de semaine du programme (1..8) pour la détection créatine S1-3. */
function programWeekIndex(weekStartISO: string): number {
  // Approximation : semaine calendaire depuis le début du suivi.
  // Ici on ne stocke pas la date de départ, on considère S1 = semaine courante
  // au 1er lancement ; ajustable via meta plus tard.
  return 1;
}

export async function buildWeeklyReport(reference: Date = new Date()): Promise<WeeklyReport> {
  const start = startOfWeek(reference);
  const startISO = toISODate(start);
  const dates = weekDates(start);
  const endISO = dates[dates.length - 1];

  // Nutrition : agrégée par jour
  const meals = await getMealEntriesRange(startISO, endISO);
  const byDay = new Map<string, DayNutrition>();
  for (const m of meals) {
    const d = byDay.get(m.date) ?? { date: m.date, kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    d.kcal += m.kcal;
    d.protein_g += m.protein_g;
    d.carbs_g += m.carbs_g;
    d.fat_g += m.fat_g;
    byDay.set(m.date, d);
  }

  // Training
  const workouts = await getWorkouts(startISO, endISO);
  const totalVolumeKg = await getWeeklyVolume(startISO, endISO);

  // Records : semaine courante vs semaine précédente pour les 4 exos clés
  const prevStartISO = addDays(startISO, -7);
  const prevEndISO = addDays(startISO, -1);
  const keyLiftBests: ReportInput['keyLiftBests'] = {};
  for (const lift of KEY_LIFTS) {
    keyLiftBests[lift] = {
      current: await getBestWeight(lift, startISO, endISO),
      previous: await getBestWeight(lift, prevStartISO, prevEndISO),
    };
  }

  // Poids
  const weekWeights = await getWeightsRange(startISO, endISO);
  const prevWeights = await getWeightsRange(prevStartISO, prevEndISO);
  const prevWeekWeightAvg = prevWeights.length
    ? prevWeights.reduce((a, b) => a + b, 0) / prevWeights.length
    : null;

  const targets = getActiveTargets();
  const input: ReportInput = {
    weekStart: startISO,
    days: [...byDay.values()],
    sessionsCompleted: workouts.length,
    totalVolumeKg,
    weekWeights,
    prevWeekWeightAvg,
    keyLiftBests,
    isCreatineWeek1to3:
      USER.supplements.some((s) => s.includes('creatine')) && programWeekIndex(startISO) <= 3,
    // Cibles personnalisées → fourchettes de compliance calées sur l'objectif.
    proteinTarget: targets.protein_g,
    kcalOverLimit: targets.daily_kcal + 100,
    kcalLowerBand: targets.daily_kcal - 200,
    kcalUpperBand: targets.daily_kcal + 150,
  };

  const report = generateWeeklyReport(input);
  await saveWeeklyReport(startISO, JSON.stringify(report));
  return report;
}
