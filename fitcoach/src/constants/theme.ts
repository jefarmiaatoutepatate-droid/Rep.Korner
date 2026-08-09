/**
 * Design system « Clair » — base blanche, sobre & classe, logos colorés.
 * Fond blanc cassé froid, accent périwinkle, une couleur par catégorie
 * (repas / onglets) pour les pastilles d'icônes colorées.
 */
export const COLORS = {
  // Fonds (base blanche)
  bg: '#F4F6FB', // blanc cassé légèrement froid
  bgTop: '#FFFFFF', // haut du dégradé d'écran
  navy: '#FFFFFF', // alias historique
  navyLight: '#EEF1F8',

  // Surfaces
  card: '#FFFFFF',
  surface: '#FFFFFF',
  surface2: '#F1F4FA',
  surfaceHi: '#EDF0F7',
  bgElevated: '#F1F4FA',

  // (compat) surface « mise en avant »
  surfaceLight: '#FFFFFF',
  onLight: '#141B33',
  onLightMuted: '#5E6A86',
  onAccent: '#FFFFFF',

  // Lignes
  border: 'rgba(20,27,51,0.09)',
  hairline: 'rgba(20,27,51,0.14)',
  lightBorder: 'rgba(20,27,51,0.09)',
  trackBg: 'rgba(20,27,51,0.08)',

  // Texte (encre sur blanc)
  text: '#141B33',
  muted: '#5E6A86',
  faint: '#98A3BC',

  // Accent unique
  accent: '#5B6EF5', // périwinkle plus soutenu, lisible sur blanc
  accent2: '#8A97FF',
  accentInk: '#4655C9',
  accentDark: '#4655C9',
  accentSoft: 'rgba(91,110,245,0.12)',

  // Sémantique
  success: '#1FA97E',
  warn: '#E0A100',
  danger: '#E5484D',

  // Macros
  protein: '#3B82C4',
  carbs: '#D69A2E',
  fat: '#C05E93',
} as const;

/** Couleurs de catégories (logos colorés) — vives mais harmonisées. */
export const CATEGORY = {
  breakfast: '#F59E42', // orange
  lunch: '#22B07D', // vert
  snack: '#EC5C8D', // rose
  dinner: '#7C6CF0', // indigo
  post_workout: '#2FA8E0', // bleu
} as const;

/** Couleurs des onglets de la barre du bas (logos colorés). */
export const TAB_COLOR = {
  index: '#5B6EF5', // Home — accent
  coach: '#12B3A6', // teal
  nutrition: '#22B07D', // vert
  entrainement: '#F2683C', // corail
  progression: '#8B5CF6', // violet
  bilan: '#E0A100', // ambre
} as const;

/** Logos réalistes (emoji) des onglets. */
export const TAB_EMOJI = {
  index: '🏠',
  coach: '🧑‍🏫',
  nutrition: '🍽️',
  entrainement: '🏋️',
  progression: '📈',
  bilan: '📊',
} as const;

/** Dégradé de fond d'écran (très léger sur base blanche). */
export const BG_GRADIENT = [COLORS.bgTop, COLORS.bg] as const;

/** Convertit un hex #RRGGBB en rgba(r,g,b,a). */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const MEAL_TYPES = [
  { key: 'breakfast', label: 'Petit-déjeuner', icon: 'food', emoji: '🍳', color: CATEGORY.breakfast },
  { key: 'lunch', label: 'Déjeuner', icon: 'food', emoji: '🍽️', color: CATEGORY.lunch },
  { key: 'snack', label: 'Collation', icon: 'apple', emoji: '🍎', color: CATEGORY.snack },
  { key: 'dinner', label: 'Dîner', icon: 'food', emoji: '🍲', color: CATEGORY.dinner },
  { key: 'post_workout', label: 'Post-training', icon: 'flame', emoji: '🥤', color: CATEGORY.post_workout },
] as const;

export type MealType = (typeof MEAL_TYPES)[number]['key'];
