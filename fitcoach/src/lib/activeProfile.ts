/**
 * Profil & cibles de l'utilisateur CONNECTÉ, tenus en mémoire.
 *
 * Défini par le store d'auth au login / à la restauration de session, effacé au
 * logout. Permet aux modules non-React (ex. le coach) de lire les cibles perso
 * sans dépendre du store. Repli sur les valeurs par défaut si absent.
 */
import { DEFAULT_PROFILE, DEFAULT_TARGETS } from '@/constants/profile';
import type { ProfileInput, Targets } from '@/lib/nutritionCalc';

let activeProfile: ProfileInput | null = null;
let activeTargets: Targets | null = null;

export function setActiveProfile(profile: ProfileInput | null, targets: Targets | null): void {
  activeProfile = profile;
  activeTargets = targets;
}

export function clearActiveProfile(): void {
  activeProfile = null;
  activeTargets = null;
}

/** Cibles de l'utilisateur connecté (ou repli). */
export function getActiveTargets(): Targets {
  return activeTargets ?? DEFAULT_TARGETS;
}

/** Profil de l'utilisateur connecté (ou repli). */
export function getActiveProfile(): ProfileInput {
  return activeProfile ?? DEFAULT_PROFILE;
}
