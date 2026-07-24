/**
 * Client du coach virtuel (Coach Léo). Assemble le contexte perso en direct
 * (cibles, macros du jour, poids, prochaine séance) et interroge l'API Claude
 * via le Worker proxy (endpoint /chat). La clé API reste côté serveur.
 *
 * Le coach peut aussi AGIR : quand Claude appelle l'outil `log_meal`, l'app
 * résout les aliments, calcule les macros et les ajoute au journal du jour,
 * puis renvoie le résultat au coach qui confirme.
 */
import Constants from 'expo-constants';
import { TARGETS, USER } from '@/constants/profile';
import { PROGRAM } from '@/constants/program';
import { MEAL_TYPES, type MealType } from '@/constants/theme';
import { todayISO } from '@/lib/dates';
import { remaining, round, computeMacros } from '@/lib/macros';
import { searchLocal, searchOpenFoodFacts, estimateWithClaude } from '@/lib/foodService';
import { getDayTotals, getLatestWeight, upsertFood, addMealEntry } from '@/db/repositories';
import type { Food } from '@/types';

const ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const VALID_MEALS = MEAL_TYPES.map((m) => m.key);

export interface CoachTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface CoachResult {
  reply: string;
  logged: boolean;
}

function proxyBase(): string | null {
  const base = (Constants.expoConfig?.extra as { claudeProxyUrl?: string } | undefined)?.claudeProxyUrl;
  if (!base || base.includes('YOUR-WORKER')) return null;
  return base;
}

export function isCoachAvailable(): boolean {
  return proxyBase() !== null;
}

function nextSession() {
  const today = new Date().getDay();
  const sorted = [...PROGRAM.sessions].sort((a, b) => ORDER.indexOf(a.day) - ORDER.indexOf(b.day));
  return sorted.find((s) => ORDER.indexOf(s.day) >= today) ?? sorted[0];
}

/** Contexte perso en direct, envoyé au coach à chaque message. */
export async function buildCoachContext(firstName: string): Promise<Record<string, unknown>> {
  const date = todayISO();
  const [totals, weight] = await Promise.all([getDayTotals(date), getLatestWeight()]);
  const session = nextSession();

  return {
    prenom: firstName,
    date,
    profil: {
      sexe: USER.sex,
      age: USER.age,
      taille_cm: USER.height_cm,
      poids_cible_kg: USER.weight_target_kg,
      restrictions: USER.dietary_restrictions,
      complements: USER.supplements,
      lieu: USER.training_venue,
    },
    cibles_jour: { kcal: TARGETS.daily_kcal, proteines_g: TARGETS.protein_g, glucides_g: TARGETS.carbs_g, lipides_g: TARGETS.fat_g, eau_l: TARGETS.water_l },
    consomme_aujourdhui: { kcal: Math.round(totals.kcal), proteines_g: Math.round(totals.protein_g), glucides_g: Math.round(totals.carbs_g), lipides_g: Math.round(totals.fat_g) },
    restant_aujourdhui: {
      kcal: remaining(totals.kcal, TARGETS.daily_kcal),
      proteines_g: remaining(totals.protein_g, TARGETS.protein_g),
      glucides_g: remaining(totals.carbs_g, TARGETS.carbs_g),
      lipides_g: remaining(totals.fat_g, TARGETS.fat_g),
    },
    poids_actuel_kg: weight,
    prochaine_seance: session.name,
  };
}

/** Repas par défaut selon l'heure (fallback si le coach ne précise pas). */
function defaultMealByTime(): MealType {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 18) return 'snack';
  if (h < 22) return 'dinner';
  return 'post_workout';
}

type Candidate = Omit<Food, 'id' | 'usage_count'>;

/** Résout un aliment : cache local → OpenFoodFacts → estimation Claude. */
async function resolveFood(name: string, quantityG: number): Promise<Candidate | null> {
  const local = await searchLocal(name).catch(() => []);
  if (local[0]) return local[0];
  const off = await searchOpenFoodFacts(name, 1).catch(() => []);
  if (off[0]) return off[0];
  const est = await estimateWithClaude(name, quantityG).catch(() => null);
  if (est) {
    const f = 100 / (quantityG || 100);
    return {
      name,
      kcal_per_100g: round(est.kcal * f),
      protein_per_100g: round(est.protein_g * f, 1),
      carbs_per_100g: round(est.carbs_g * f, 1),
      fat_per_100g: round(est.fat_g * f, 1),
      source: 'claude',
    };
  }
  return null;
}

interface LogMealInput {
  items?: { name?: string; quantity_g?: number; meal_type?: string }[];
}

/**
 * Exécute l'outil log_meal : ajoute chaque aliment au journal du jour.
 * Renvoie un résumé texte (pour le coach) et si au moins un ajout a eu lieu.
 */
async function executeLogMeal(input: LogMealInput): Promise<{ summary: string; added: boolean }> {
  const items = Array.isArray(input?.items) ? input.items : [];
  if (items.length === 0) return { summary: 'Aucun aliment fourni.', added: false };

  const date = todayISO();
  const okLines: string[] = [];
  const failed: string[] = [];
  let added = false;

  for (const it of items) {
    const name = (it?.name ?? '').trim();
    const qty = Number(it?.quantity_g) || 0;
    if (!name || qty <= 0) { failed.push(name || '(sans nom)'); continue; }
    const mealType: MealType = VALID_MEALS.includes(it?.meal_type as MealType) ? (it!.meal_type as MealType) : defaultMealByTime();

    const cand = await resolveFood(name, qty);
    if (!cand) { failed.push(name); continue; }

    const foodId = await upsertFood(cand);
    const food: Food = { ...cand, id: foodId, usage_count: 0 };
    await addMealEntry({ date, meal_type: mealType, food, quantity_g: qty });
    added = true;

    const m = computeMacros(cand, qty);
    const label = MEAL_TYPES.find((x) => x.key === mealType)?.label ?? mealType;
    okLines.push(`${cand.name} ${qty} g → ${m.kcal} kcal (P${m.protein_g} G${m.carbs_g} L${m.fat_g}) [${label}]`);
  }

  // Total restant après ajout, pour que le coach le rappelle.
  const totals = await getDayTotals(date);
  const rest = {
    kcal: remaining(totals.kcal, TARGETS.daily_kcal),
    proteines_g: remaining(totals.protein_g, TARGETS.protein_g),
  };

  const parts: string[] = [];
  if (okLines.length) parts.push(`Ajouté(s) au journal :\n- ${okLines.join('\n- ')}`);
  if (failed.length) parts.push(`Introuvable(s) : ${failed.join(', ')}.`);
  parts.push(`Restant aujourd'hui : ${rest.kcal} kcal, ${rest.proteines_g} g de protéines.`);
  return { summary: parts.join('\n'), added };
}

interface ChatResponse {
  type?: 'text' | 'tool_use';
  reply?: string;
  tool_use_id?: string;
  name?: string;
  input?: unknown;
  assistant_content?: unknown;
}

async function postChat(base: string, messages: unknown[], context: Record<string, unknown>): Promise<ChatResponse> {
  const res = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  });
  if (!res.ok) throw new Error(`Coach ${res.status}`);
  return (await res.json()) as ChatResponse;
}

/**
 * Envoie l'historique au coach et renvoie sa réponse. Gère la boucle d'outil
 * log_meal (exécution locale + relance), plafonnée à 3 tours.
 */
export async function askCoach(history: CoachTurn[], firstName: string): Promise<CoachResult> {
  const base = proxyBase();
  if (!base) {
    return {
      reply:
        "Je suis prêt à t'aider ! 💪 Mais mon cerveau (l'IA) n'est pas encore branché : configure le proxy Claude (voir README, `expo.extra.claudeProxyUrl`) et je pourrai répondre — et même ajouter tes repas au journal.",
      logged: false,
    };
  }

  const messages: unknown[] = history.map((m) => ({ role: m.role, content: m.content }));
  while (messages.length && (messages[0] as CoachTurn).role !== 'user') messages.shift();
  if (messages.length === 0) throw new Error('Aucun message utilisateur');

  const context = await buildCoachContext(firstName);
  let logged = false;

  for (let i = 0; i < 3; i++) {
    const res = await postChat(base, messages, context);
    if (res.type === 'tool_use' && res.name === 'log_meal') {
      const { summary, added } = await executeLogMeal(res.input as LogMealInput);
      if (added) logged = true;
      messages.push({ role: 'assistant', content: res.assistant_content });
      messages.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: res.tool_use_id, content: summary }] });
      continue;
    }
    return { reply: res.reply?.trim() || "Désolé, je n'ai pas de réponse là. Reformule ?", logged };
  }
  return { reply: "C'est noté ! 👍", logged };
}

/** Message d'accueil personnalisé (local, instantané) affiché à l'ouverture. */
export function greeting(firstName: string): string {
  const name = firstName || 'toi';
  return `Bonjour ${name} 👋 Je suis Coach Léo, ton coach nutrition & muscu. Dis-moi ce que tu as mangé et je peux l'ajouter à ton journal, calculer un repas, ajuster tes calories ou te conseiller sur ta séance. Par quoi on commence ?`;
}
