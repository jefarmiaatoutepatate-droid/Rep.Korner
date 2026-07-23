/**
 * Config de la sync cloud (Supabase). Lue depuis app.json → expo.extra.
 * Tant que les valeurs sont vides, l'app fonctionne en comptes locaux.
 * Pour activer : renseigne supabaseUrl + supabaseAnonKey, installe
 * @supabase/supabase-js, puis branche le provider (voir README).
 */
import Constants from 'expo-constants';

interface CloudExtra {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export function getCloudConfig(): { url: string; anonKey: string } | null {
  const extra = (Constants.expoConfig?.extra ?? {}) as CloudExtra;
  if (extra.supabaseUrl && extra.supabaseAnonKey) {
    return { url: extra.supabaseUrl, anonKey: extra.supabaseAnonKey };
  }
  return null;
}

export function isCloudConfigured(): boolean {
  return getCloudConfig() !== null;
}
