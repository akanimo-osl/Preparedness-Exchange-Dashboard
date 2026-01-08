
// IndexedDB + SWR-style cache (Dexie.js or idb-keyval recommended)
import { openDB } from 'idb';

/**
 * Camino Frontend Cache Guide
 *
 * Manual cache busting strategies:
 * - Version key: store an app version in localStorage; if it differs from build version, clear IndexedDB.
 * - IndexedDB flush: provide a helper to drop the 'data' store or entire DB.
 * - Network override: force re-fetch paths by appending cache-busting query (e.g., ?v=<buildVersion>). 
 *
 * Version mismatch behavior:
 * - On app boot, compare local version with `import.meta.env.VITE_BUILD_VERSION`.
 * - If mismatch, clear IndexedDB store and update local version to current.
 */

const dbPromise = openDB('camino-store', 1, {
  upgrade(db) {
    db.createObjectStore('data');
  },
});

export async function setCache(key, val) {
  const db = await dbPromise;
  await db.put('data', val, key);
}

export async function getCache(key) {
  const db = await dbPromise;
  return await db.get('data', key);
}

export async function clearCacheStore() {
  const db = await dbPromise;
  // Clear only the 'data' store to avoid full DB drop
  const tx = db.transaction('data', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

export async function dropDatabase() {
  // Full DB drop if needed
  const dbName = 'camino-store';
  (await dbPromise).close();
  await indexedDB.deleteDatabase(dbName);
}

const VERSION_KEY = 'camino.build.version';

export function getLocalVersion(): string | null {
  try { return localStorage.getItem(VERSION_KEY); } catch { return null; }
}

export function setLocalVersion(v: string) {
  try { localStorage.setItem(VERSION_KEY, v); } catch { /* noop */ }
}

export async function bustIfVersionMismatch() {
  const current = (import.meta as any).env?.VITE_BUILD_VERSION ?? '';
  const local = getLocalVersion();
  if (!local || local !== current) {
    await clearCacheStore();
    setLocalVersion(current);
  }
}

/**
 * Usage
 * - Call `bustIfVersionMismatch()` at app bootstrap.
 * - Expose an admin action to call `clearCacheStore()` when needed.
 */
