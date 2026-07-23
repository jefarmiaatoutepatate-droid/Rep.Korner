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
