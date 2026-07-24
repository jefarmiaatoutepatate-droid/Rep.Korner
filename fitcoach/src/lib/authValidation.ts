/** Validation PURE des saisies d'authentification (testée en Node). */

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const e = normalizeEmail(email);
  // Validation simple et robuste (un @, un domaine avec point).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export interface PasswordCheck {
  ok: boolean;
  reason?: string;
}

/** Règle minimale : ≥ 8 caractères, au moins une lettre et un chiffre. */
export function checkPassword(pw: string): PasswordCheck {
  if (pw.length < 8) return { ok: false, reason: 'Au moins 8 caractères.' };
  if (!/[a-zA-Z]/.test(pw)) return { ok: false, reason: 'Ajoute au moins une lettre.' };
  if (!/[0-9]/.test(pw)) return { ok: false, reason: 'Ajoute au moins un chiffre.' };
  return { ok: true };
}

/** Valide un formulaire d'inscription ; renvoie le 1er message d'erreur ou null. */
export function validateSignup(input: { name: string; email: string; password: string }): string | null {
  if (input.name.trim().length < 2) return 'Entre ton prénom.';
  if (!isValidEmail(input.email)) return 'Adresse e-mail invalide.';
  const p = checkPassword(input.password);
  if (!p.ok) return p.reason ?? 'Mot de passe trop faible.';
  return null;
}

// ---- Profil (onboarding) ----

import type { ProfileInput, Sex, Goal } from '@/lib/nutritionCalc';

/** Brouillon de profil tel que saisi dans le formulaire (numériques en texte). */
export interface ProfileDraft {
  sex: Sex;
  age: string;
  height_cm: string;
  weight_kg: string;
  weight_target_kg: string;
  goal: Goal;
  sessions_per_week: number;
}

/** Parse un nombre FR (virgule ou point). NaN si vide/invalide. */
export function parseNum(s: string): number {
  return parseFloat(String(s).replace(',', '.').trim());
}

/**
 * Valide un brouillon de profil. Renvoie soit une erreur, soit le ProfileInput prêt.
 */
export function validateProfile(
  d: ProfileDraft,
): { error: string } | { error: null; profile: ProfileInput } {
  const age = parseNum(d.age);
  const height = parseNum(d.height_cm);
  const weight = parseNum(d.weight_kg);
  const target = parseNum(d.weight_target_kg);
  const sessions = d.sessions_per_week;

  if (!Number.isFinite(age) || age < 14 || age > 100) return { error: 'Âge invalide (14–100 ans).' };
  if (!Number.isFinite(height) || height < 120 || height > 230) return { error: 'Taille invalide (120–230 cm).' };
  if (!Number.isFinite(weight) || weight < 30 || weight > 300) return { error: 'Poids invalide (30–300 kg).' };
  if (!Number.isFinite(target) || target < 30 || target > 300) return { error: 'Poids cible invalide (30–300 kg).' };
  if (!Number.isFinite(sessions) || sessions < 0 || sessions > 14) return { error: 'Nombre de séances invalide.' };

  return {
    error: null,
    profile: {
      sex: d.sex,
      age: Math.round(age),
      height_cm: Math.round(height),
      weight_kg: Math.round(weight * 10) / 10,
      weight_target_kg: Math.round(target * 10) / 10,
      sessions_per_week: Math.round(sessions),
      goal: d.goal,
    },
  };
}
