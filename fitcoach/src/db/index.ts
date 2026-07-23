/**
 * Point d'entrée SQLite (expo-sqlite, API async v14+).
 * Ouvre la base, applique le schéma multi-utilisateur et amorce les données.
 */
import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';
import { SEED_FOODS } from './seedFoods';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    // v2 : schéma multi-utilisateur (données rattachées à un compte).
    dbPromise = SQLite.openDatabaseAsync('fitcoach2.db');
  }
  return dbPromise;
}

// ---- Utilisateur courant (défini par le store d'auth) ----
let currentUserId: string | null = null;

/** Défini au login / restauration de session ; effacé au logout. */
export function setCurrentUserId(id: string | null): void {
  currentUserId = id;
}

/** Id de l'utilisateur connecté. Lève si on interroge des données hors session. */
export function requireUserId(): string {
  if (!currentUserId) throw new Error('Aucun utilisateur connecté');
  return currentUserId;
}

export function getCurrentUserId(): string | null {
  return currentUserId;
}

export async function initDatabase(): Promise<void> {
  const db = await getDB();
  await db.execAsync(SCHEMA_SQL);
  await seedIfNeeded(db);
}

async function seedIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', 'foods_seeded');
  if (row?.value === '1') return;

  await db.withTransactionAsync(async () => {
    for (const f of SEED_FOODS) {
      await db.runAsync(
        `INSERT INTO foods (name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, source, usage_count)
         VALUES (?, ?, ?, ?, ?, 'manual', 0)`,
        f.name,
        f.kcal,
        f.protein,
        f.carbs,
        f.fat,
      );
    }
    await db.runAsync("INSERT OR REPLACE INTO meta (key, value) VALUES ('foods_seeded', '1')");
  });
}

export * from './repositories';
export * from './authRepository';
