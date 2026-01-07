
// IndexedDB + SWR-style cache (Dexie.js or idb-keyval recommended)
import { openDB } from 'idb';

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
