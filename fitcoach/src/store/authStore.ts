/**
 * Store d'authentification (Zustand). Gère la session : inscription, connexion,
 * déconnexion, suppression de compte. Persiste la session via expo-secure-store
 * et informe la couche DB de l'utilisateur courant (setCurrentUserId).
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { setCurrentUserId } from '@/db';
import { createUser, verifyCredentials, getUserById, deleteAccount as dbDeleteAccount, type AccountUser } from '@/db/authRepository';
import { normalizeEmail, validateSignup } from '@/lib/authValidation';

const SESSION_KEY = 'fitcoach_session_user_id';

type Status = 'loading' | 'authed' | 'guest';

interface AuthState {
  status: Status;
  user: AccountUser | null;
  restore: () => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

async function persist(userId: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, userId);
}
async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,

  restore: async () => {
    try {
      const id = await SecureStore.getItemAsync(SESSION_KEY);
      if (!id) { set({ status: 'guest', user: null }); return; }
      const user = await getUserById(id);
      if (!user) { await clearSession(); set({ status: 'guest', user: null }); return; }
      setCurrentUserId(user.id);
      set({ status: 'authed', user });
    } catch {
      set({ status: 'guest', user: null });
    }
  },

  signUp: async (input) => {
    const err = validateSignup(input);
    if (err) throw new Error(err);
    const user = await createUser({ name: input.name.trim(), email: normalizeEmail(input.email), password: input.password });
    setCurrentUserId(user.id);
    await persist(user.id);
    set({ status: 'authed', user });
  },

  signIn: async (input) => {
    const user = await verifyCredentials(normalizeEmail(input.email), input.password);
    if (!user) throw new Error('E-mail ou mot de passe incorrect.');
    setCurrentUserId(user.id);
    await persist(user.id);
    set({ status: 'authed', user });
  },

  signOut: async () => {
    await clearSession();
    setCurrentUserId(null);
    set({ status: 'guest', user: null });
  },

  deleteAccount: async () => {
    const { user } = get();
    if (user) await dbDeleteAccount(user.id);
    await clearSession();
    setCurrentUserId(null);
    set({ status: 'guest', user: null });
  },
}));
