/**
 * Comptes utilisateurs — auth locale (mots de passe hachés avec sel, SHA-256).
 * Note : pour la prod multi-appareils, l'auth passe par Supabase (voir README) ;
 * ce module reste le miroir local + le mode hors-ligne.
 */
import * as Crypto from 'expo-crypto';
import { getDB } from './index';

export interface AccountUser {
  id: string;
  email: string;
  name: string;
  remote_id: string | null;
  created_at: string | null;
}

interface UserRow extends AccountUser {
  password_hash: string | null;
  password_salt: string | null;
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

function toPublic(row: UserRow): AccountUser {
  return { id: row.id, email: row.email, name: row.name, remote_id: row.remote_id, created_at: row.created_at };
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE email = ?', email);
  return row ?? null;
}

/** Crée un compte local. Lève si l'e-mail existe déjà. */
export async function createUser(params: { email: string; name: string; password: string }): Promise<AccountUser> {
  const db = await getDB();
  const existing = await findUserByEmail(params.email);
  if (existing) throw new Error('Un compte existe déjà avec cet e-mail.');

  const id = Crypto.randomUUID();
  const saltBytes = await Crypto.getRandomBytesAsync(16);
  const salt = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  const hash = await hashPassword(params.password, salt);
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO users (id, email, name, password_hash, password_salt, remote_id, created_at)
     VALUES (?, ?, ?, ?, ?, NULL, ?)`,
    id,
    params.email,
    params.name,
    hash,
    salt,
    createdAt,
  );
  return { id, email: params.email, name: params.name, remote_id: null, created_at: createdAt };
}

/** Vérifie e-mail + mot de passe. Renvoie l'utilisateur ou null. */
export async function verifyCredentials(email: string, password: string): Promise<AccountUser | null> {
  const row = await findUserByEmail(email);
  if (!row || !row.password_hash || !row.password_salt) return null;
  const hash = await hashPassword(password, row.password_salt);
  if (hash !== row.password_hash) return null;
  return toPublic(row);
}

export async function getUserById(id: string): Promise<AccountUser | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', id);
  return row ? toPublic(row) : null;
}

/** Suppression de compte + toutes ses données (exigence App Store). */
export async function deleteAccount(userId: string): Promise<void> {
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM meal_entries WHERE user_id = ?', userId);
    await db.runAsync('DELETE FROM sets WHERE user_id = ?', userId);
    await db.runAsync('DELETE FROM workouts WHERE user_id = ?', userId);
    await db.runAsync('DELETE FROM body_measurements WHERE user_id = ?', userId);
    await db.runAsync('DELETE FROM daily_log WHERE user_id = ?', userId);
    await db.runAsync('DELETE FROM weekly_reports WHERE user_id = ?', userId);
    await db.runAsync('DELETE FROM users WHERE id = ?', userId);
  });
}
