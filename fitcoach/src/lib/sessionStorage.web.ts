/**
 * Stockage de la session — implémentation WEB (PWA).
 *
 * SecureStore n'existe pas dans un navigateur : on utilise localStorage. Seul
 * l'identifiant de session y est écrit (jamais le mot de passe, jamais son
 * empreinte), et il ne sort pas de l'appareil.
 */
export async function getSession(key: string): Promise<string | null> {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setSession(key: string, value: string): Promise<void> {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* stockage indisponible (mode privé) : la session ne survivra pas au rechargement */
  }
}

export async function clearSession(key: string): Promise<void> {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* rien à faire */
  }
}
