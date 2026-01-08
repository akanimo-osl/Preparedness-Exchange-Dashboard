const VERSION_KEY = 'camino.build.version';

function getLocalVersion(): string | null {
  try { return localStorage.getItem(VERSION_KEY); } catch { return null; }
}

function setLocalVersion(v: string) {
  try { localStorage.setItem(VERSION_KEY, v); } catch { /* noop */ }
}

async function clearHttpCaches() {
  if (!('caches' in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch {
    // ignore
  }
}

async function dropDatabase(dbName = 'camino-store') {
  try {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase(dbName);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      req.onblocked = () => resolve();
    });
  } catch {
    // ignore
  }
}

export async function bustIfVersionMismatch() {
  const current = (import.meta as any).env?.VITE_BUILD_VERSION ?? '';
  const local = getLocalVersion();
  if (!local || local !== current) {
    await clearHttpCaches();
    await dropDatabase('camino-store');
    setLocalVersion(current);
  }
}

export { clearHttpCaches as clearCacheStore, dropDatabase };
