/**
 * Design system « Nocturne » — sobre & classe.
 * Palette harmonisée : bleu encre profond, un accent périwinkle UNIQUE,
 * surfaces claires mises en avant avec parcimonie, macros désaturées.
 * Source de vérité unique pour toute la couleur de l'app.
 */
export const COLORS = {
  // Fonds
  bg: '#0A1120', // encre profonde
  bgTop: '#101B33', // haut du dégradé d'écran
  navy: '#0A1120', // alias historique
  navyLight: '#172743',

  // Surfaces
  card: '#131F38',
  surface: '#131F38',
  surface2: '#172743',
  surfaceHi: '#1E2E50',
  bgElevated: '#172743',

  // Surface claire (« touche blanche » — cartes mises en avant)
  surfaceLight: '#F4F6FC',
  onLight: '#141B33',
  onLightMuted: '#5E6A86',

  // Lignes
  border: 'rgba(255,255,255,0.08)',
  hairline: 'rgba(255,255,255,0.12)',
  lightBorder: 'rgba(20,27,51,0.08)',

  // Texte
  text: '#EDF1FA',
  muted: '#93A1C0',
  faint: '#5E6A88',

  // Accent unique
  accent: '#7C93FF',
  accent2: '#A3B2FF',
  accentInk: '#4E5FC7', // accent lisible sur surface claire
  accentDark: '#4E5FC7',
  accentSoft: 'rgba(124,147,255,0.14)',

  // Sémantique
  success: '#74C29B',
  warn: '#E0B978',
  danger: '#E0808A',

  // Macros (désaturées, harmonisées avec l'accent froid)
  protein: '#82B4E8',
  carbs: '#D9B26B',
  fat: '#C98FB0',
} as const;

/** Dégradé de fond d'écran (haut → bas). */
export const BG_GRADIENT = [COLORS.bgTop, COLORS.bg] as const;

export const MEAL_TYPES = [
  { key: 'breakfast', label: 'Petit-déjeuner', icon: 'food' },
  { key: 'lunch', label: 'Déjeuner', icon: 'food' },
  { key: 'snack', label: 'Collation', icon: 'apple' },
  { key: 'dinner', label: 'Dîner', icon: 'food' },
  { key: 'post_workout', label: 'Post-training', icon: 'flame' },
] as const;

export type MealType = (typeof MEAL_TYPES)[number]['key'];
