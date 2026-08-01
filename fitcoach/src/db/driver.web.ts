/**
 * Pilote de base de données — implémentation WEB (PWA), via sql.js.
 *
 * sql.js est SQLite compilé en WebAssembly : le SQL des repositories tourne donc
 * à l'identique dans le navigateur, sans réécriture. La base vit en mémoire et est
 * persistée dans IndexedDB après chaque écriture (sauvegarde différée), ce qui la
 * rend durable entre les sessions et disponible hors ligne.
 */
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import type { Database, RunResult } from './driver';

export type { Database, RunResult };

const IDB_NAME = 'fitcoach-store';
const IDB_STORE = 'sqlite';
const SAVE_DEBOUNCE_MS = 250;

// ---- Persistance IndexedDB ----

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<Uint8Array | null> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve((req.result as Uint8Array) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key: string, value: Uint8Array): Promise<void> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---- Adaptateur sql.js -> interface Database ----

class WebDatabase implements Database {
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private db: SqlJsDatabase, private key: string) {}

  /** Sauvegarde différée : évite d'exporter la base à chaque requête. */
  private scheduleSave(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      void idbPut(this.key, this.db.export()).catch(() => {});
    }, SAVE_DEBOUNCE_MS);
  }

  /** Force l'écriture immédiate (utile avant fermeture d'onglet). */
  async flush(): Promise<void> {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    await idbPut(this.key, this.db.export());
  }

  async execAsync(sql: string): Promise<void> {
    this.db.exec(sql);
    this.scheduleSave();
  }

  async runAsync(sql: string, ...params: unknown[]): Promise<RunResult> {
    this.db.run(sql, params as never[]);
    const res = this.db.exec('SELECT last_insert_rowid() AS id');
    const lastInsertRowId = Number(res[0]?.values?.[0]?.[0] ?? 0);
    const changes = this.db.getRowsModified();
    this.scheduleSave();
    return { lastInsertRowId, changes };
  }

  async getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]> {
    const stmt = this.db.prepare(sql);
    try {
      if (params.length) stmt.bind(params as never[]);
      const rows: T[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as T);
      return rows;
    } finally {
      stmt.free();
    }
  }

  async getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null> {
    const rows = await this.getAllAsync<T>(sql, ...params);
    return rows[0] ?? null;
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    this.db.exec('BEGIN');
    try {
      await task();
      this.db.exec('COMMIT');
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
    this.scheduleSave();
  }
}

let instance: Promise<Database> | null = null;

export function openDB(name: string): Promise<Database> {
  if (instance) return instance;

  instance = (async () => {
    const SQL = await initSqlJs({ locateFile: (f: string) => `/${f}` });
    const saved = await idbGet(name).catch(() => null);
    const db = saved ? new SQL.Database(saved) : new SQL.Database();
    const wrapper = new WebDatabase(db, name);

    // Filet de sécurité : écrire avant que l'onglet ne disparaisse.
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', () => { void wrapper.flush(); });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') void wrapper.flush();
      });
    }
    return wrapper;
  })();

  return instance;
}
