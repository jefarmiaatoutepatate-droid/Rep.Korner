/**
 * Comptes utilisateurs — auth locale (mots de passe hachés avec sel, SHA-256).
 * Note : pour la prod multi-appareils, l'auth passe par Supabase (voir README) ;
 * ce module reste le miroir local + le mode hors-ligne.
 */
import * as Crypto from 'expo-crypto';
import { getDB } from './index';
import type { ProfileInput, Targets, Sex, Goal } from '@/lib/nutritionCalc';

export interface AccountUser {
  id: string;
  email: string;
  name: string;
  remote_id: string | null;
  created_at: string | null;
  /** Profil saisi à l'inscription (null pour un compte legacy). */
  profile: ProfileInput | null;
  /** Cibles quotidiennes calculées (null pour un compte legacy). */
  targets: Targets | null;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  remote_id: string | null;
  created_at: string | null;
  password_hash: string | null;
  password_salt: string | null;
  sex: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  weight_target_kg: number | null;
  goal: string | null;
  sessions_per_week: number | null;
  tdee_kcal: number | null;
  daily_kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  water_l: number | null;
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

function toPublic(row: UserRow): AccountUser {
  const hasProfile = row.sex != null && row.age != null && row.height_cm != null && row.weight_kg != null;
  const profile: ProfileInput | null = hasProfile
    ? {
        sex: row.sex as Sex,
        age: row.age as number,
        height_cm: row.height_cm as number,
        weight_kg: row.weight_kg as number,
        weight_target_kg: (row.weight_target_kg ?? row.weight_kg) as number,
        sessions_per_week: row.sessions_per_week ?? 0,
        goal: (row.goal as Goal) ?? 'maintain',
      }
    : null;
  const targets: Targets | null = row.daily_kcal != null
    ? {
        tdee_kcal: row.tdee_kcal ?? 0,
        daily_kcal: row.daily_kcal,
        protein_g: row.protein_g ?? 0,
        carbs_g: row.carbs_g ?? 0,
        fat_g: row.fat_g ?? 0,
        water_l: row.water_l ?? 0,
      }
    : null;
  return {
    id: row.id, email: row.email, name: row.name,
    remote_id: row.remote_id, created_at: row.created_at,
    profile, targets,
  };
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE email = ?', email);
  return row ?? null;
}

/** Crée un compte local avec son profil et ses cibles. Lève si l'e-mail existe déjà. */
export async function createUser(params: {
  email: string;
  name: string;
  password: string;
  profile: ProfileInput;
  targets: Targets;
}): Promise<AccountUser> {
  const db = await getDB();
  const existing = await findUserByEmail(params.email);
  if (existing) throw new Error('Un compte existe déjà avec cet e-mail.');

  const id = Crypto.randomUUID();
  const saltBytes = await Crypto.getRandomBytesAsync(16);
  const salt = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  const hash = await hashPassword(params.password, salt);
  const createdAt = new Date().toISOString();
  const { profile: p, targets: t } = params;

  await db.runAsync(
    `INSERT INTO users (
       id, email, name, password_hash, password_salt, remote_id, created_at,
       sex, age, height_cm, weight_kg, weight_target_kg, goal, sessions_per_week,
       tdee_kcal, daily_kcal, protein_g, carbs_g, fat_g, water_l
     ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, params.email, params.name, hash, salt, createdAt,
    p.sex, p.age, p.height_cm, p.weight_kg, p.weight_target_kg, p.goal, p.sessions_per_week,
    t.tdee_kcal, t.daily_kcal, t.protein_g, t.carbs_g, t.fat_g, t.water_l,
  );
  return { id, email: params.email, name: params.name, remote_id: null, created_at: createdAt, profile: p, targets: t };
}

/** Met à jour le profil et les cibles d'un compte (édition depuis les réglages). */
export async function updateUserProfile(userId: string, profile: ProfileInput, targets: Targets): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE users SET
       sex = ?, age = ?, height_cm = ?, weight_kg = ?, weight_target_kg = ?, goal = ?, sessions_per_week = ?,
       tdee_kcal = ?, daily_kcal = ?, protein_g = ?, carbs_g = ?, fat_g = ?, water_l = ?
     WHERE id = ?`,
    profile.sex, profile.age, profile.height_cm, profile.weight_kg, profile.weight_target_kg, profile.goal, profile.sessions_per_week,
    targets.tdee_kcal, targets.daily_kcal, targets.protein_g, targets.carbs_g, targets.fat_g, targets.water_l,
    userId,
  );
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
