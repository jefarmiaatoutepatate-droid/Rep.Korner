/**
 * Client du coach virtuel (Coach Léo). Assemble le contexte perso en direct
 * (cibles, macros du jour, poids, prochaine séance) et interroge l'API Claude
 * via le Worker proxy (endpoint /chat). La clé API reste côté serveur.
 */
import Constants from 'expo-constants';
import { TARGETS, USER } from '@/constants/profile';
import { PROGRAM } from '@/constants/program';
import { todayISO } from '@/lib/dates';
import { remaining } from '@/lib/macros';
import { getDayTotals, getLatestWeight } from '@/db/repositories';

const ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export interface CoachTurn {
  role: 'user' | 'assistant';
  content: string;
}

function proxyBase(): string | null {
  const base = (Constants.expoConfig?.extra as { claudeProxyUrl?: string } | undefined)?.claudeProxyUrl;
  if (!base || base.includes('YOUR-WORKER')) return null;
  return base;
}

/** Le proxy Claude est-il configuré ? (sinon le coach répond un message d'aide). */
export function isCoachAvailable(): boolean {
  return proxyBase() !== null;
}

/** Prochaine séance du programme selon le jour courant. */
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
      poids_depart_kg: USER.weight_start_kg,
      poids_cible_kg: USER.weight_target_kg,
      restrictions: USER.dietary_restrictions,
      complements: USER.supplements,
      lieu: USER.training_venue,
    },
    cibles_jour: {
      kcal: TARGETS.daily_kcal,
      proteines_g: TARGETS.protein_g,
      glucides_g: TARGETS.carbs_g,
      lipides_g: TARGETS.fat_g,
      eau_l: TARGETS.water_l,
    },
    consomme_aujourdhui: {
      kcal: Math.round(totals.kcal),
      proteines_g: Math.round(totals.protein_g),
      glucides_g: Math.round(totals.carbs_g),
      lipides_g: Math.round(totals.fat_g),
    },
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

/**
 * Envoie l'historique au coach et renvoie sa réponse.
 * L'historique doit commencer par un message `user` (on retire un éventuel
 * message d'accueil `assistant` en tête).
 */
export async function askCoach(history: CoachTurn[], firstName: string): Promise<string> {
  const base = proxyBase();
  if (!base) {
    return "Je suis prêt à t'aider ! 💪 Mais mon cerveau (l'IA) n'est pas encore branché : configure le proxy Claude (voir README, `expo.extra.claudeProxyUrl`) et je pourrai répondre à toutes tes questions.";
  }

  const messages = [...history];
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (messages.length === 0) throw new Error('Aucun message utilisateur');

  const context = await buildCoachContext(firstName);
  const res = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  });
  if (!res.ok) throw new Error(`Coach ${res.status}`);
  const data = (await res.json()) as { reply?: string };
  return data.reply?.trim() || "Désolé, je n'ai pas de réponse là. Reformule ?";
}

/** Message d'accueil personnalisé (local, instantané) affiché à l'ouverture. */
export function greeting(firstName: string): string {
  const name = firstName || 'toi';
  return `Bonjour ${name} 👋 Je suis Coach Léo, ton coach nutrition & muscu. Pose-moi tout : calculer un repas, ajuster tes calories, un conseil sur ta séance… Par quoi on commence ?`;
}
