import { Redirect } from 'expo-router';

/** Écran par défaut du groupe (auth) → connexion. */
export default function AuthIndex() {
  return <Redirect href="/(auth)/login" />;
}
