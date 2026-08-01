/**
 * Pilote de base de données — implémentation NATIVE (iOS / Android), via expo-sqlite.
 *
 * Metro résout automatiquement `driver.web.ts` sur la plateforme web : ce fichier
 * n'est donc jamais chargé dans un navigateur. Les deux implémentations exposent
 * la même interface `Database`, ce qui laisse tout le reste du code inchangé.
 */
import * as SQLite from 'expo-sqlite';

export interface RunResult {
  lastInsertRowId: number;
  changes: number;
}

/** Surface minimale réellement utilisée par les repositories. */
export interface Database {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: unknown[]): Promise<RunResult>;
  getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export async function openDB(name: string): Promise<Database> {
  // SQLiteDatabase expose déjà exactement cette surface.
  return (await SQLite.openDatabaseAsync(name)) as unknown as Database;
}
