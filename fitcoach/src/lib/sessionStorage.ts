/**
 * Stockage de la session — implémentation NATIVE, via expo-secure-store
 * (trousseau iOS / Keystore Android).
 *
 * Metro résout `sessionStorage.web.ts` en web, où SecureStore n'existe pas.
 */
import * as SecureStore from 'expo-secure-store';

export async function getSession(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function setSession(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function clearSession(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
