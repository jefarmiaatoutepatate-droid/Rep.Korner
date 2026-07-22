/**
 * Palette centrale — dark mode par défaut, accent orange (#E85D04), navy (#0B2545).
 * Inspiration MyFitnessPal + Strong. Réutilisée par les composants qui n'utilisent
 * pas les classes NativeWind (charts, SVG, etc.).
 */
export const COLORS = {
  accent: '#E85D04',
  accentDark: '#C44D00',
  navy: '#0B2545',
  navyLight: '#13315C',
  bg: '#081A30',
  bgElevated: '#0F2440',
  card: '#0F2440',
  border: '#1D3A5F',
  text: '#F2F6FB',
  muted: '#8AA0B8',
  success: '#43AA8B',
  danger: '#F94144',
  // Macros
  protein: '#4CC9F0',
  carbs: '#F9C74F',
  fat: '#F94144',
} as const;

export const MEAL_TYPES = [
  { key: 'breakfast', label: 'Petit-déjeuner', icon: '🌅' },
  { key: 'lunch', label: 'Déjeuner', icon: '🍽️' },
  { key: 'snack', label: 'Collation', icon: '🍎' },
  { key: 'dinner', label: 'Dîner', icon: '🌙' },
  { key: 'post_workout', label: 'Post-training', icon: '💪' },
] as const;

export type MealType = (typeof MEAL_TYPES)[number]['key'];
