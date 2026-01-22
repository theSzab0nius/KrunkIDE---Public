define([], function () {
  const DB_NAME = 'KrunkIDE';
  const STORE_NAME = 'kv';
  const DB_VERSION = 1;

  let dbPromise;

  function sandboxValidate(value, timeoutMs = 1000) {

    if (value === undefined) return Promise.resolve({ ok: true });
    try {
      const workerCode = `self.onmessage = function(e){\n  try {\n    const data = e.data;\n    // Basic serialization check\n    JSON.stringify(data);\n    // Echo success\n    self.postMessage({ ok: true });\n  } catch (err) {\n    self.postMessage({ ok: false, error: (err && err.message) ? err.message : String(err) });\n  }\n};`;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const worker = new Worker(url);
      return new Promise((resolve) => {
        let settled = false;
        const cleanup = () => {
          try { worker.terminate(); } catch (_) {}
          try { URL.revokeObjectURL(url); } catch (_) {}
        };
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            cleanup();
            resolve({ ok: false, error: 'Sandbox timeout' });
          }
        }, timeoutMs);
        worker.onmessage = (ev) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          cleanup();
          resolve(ev.data && typeof ev.data === 'object' ? ev.data : { ok: false, error: 'Sandbox bad response' });
        };
        worker.onerror = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          cleanup();
          resolve({ ok: false, error: 'Sandbox error' });
        };
        try {
          worker.postMessage(value);
        } catch (err) {
          clearTimeout(timer);
          cleanup();
          resolve({ ok: false, error: (err && err.message) ? err.message : String(err) });
        }
      });
    } catch (err) {

      try {
        JSON.stringify(value);
        return Promise.resolve({ ok: true });
      } catch (e) {
        return Promise.resolve({ ok: false, error: (e && e.message) ? e.message : String(e) });
      }
    }
  }

  function openDB() {
    if (!('indexedDB' in window)) {
      return Promise.resolve(null);
    }
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function setItem(key, value) {
    const db = await openDB();
    if (!db) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (_) {}
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ key, value });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getItem(key) {
    const db = await openDB();
    if (!db) {
      try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : undefined;
        const check = await sandboxValidate(parsed);
        if (!check.ok) {
          console.error('[storage] load refused by sandbox (localStorage)', check.error);
          return undefined;
        }
        return parsed;
      } catch (_) {
        return undefined;
      }
    }
    const value = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : undefined);
      req.onerror = () => reject(req.error);
    });
    const check = await sandboxValidate(value);
    if (!check.ok) {
      console.error('[storage] load refused by sandbox (IndexedDB)', check.error);
      return undefined;
    }
    return value;
  }

  async function removeItem(key) {
    const db = await openDB();
    if (!db) {
      try { localStorage.removeItem(key); } catch (_) {}
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function clearProject() {
    try { await removeItem('krunk-project'); } catch (_) {}
    try { localStorage.removeItem('krunk-project'); } catch (_) {}
  }

  async function clearAll() {
    const hasIDB = 'indexedDB' in window;
    if (hasIDB) {
      try {

        const db = await openDB();
        try { db && db.close && db.close(); } catch (_) {}
        await new Promise((resolve, reject) => {
          const req = indexedDB.deleteDatabase(DB_NAME);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } catch (_) {}
    }
    try {
      localStorage.removeItem('krunk-project');
      localStorage.removeItem('krunk-theme');
      localStorage.removeItem('krunk-bg');
    } catch (_) {}
  }

  return { setItem, getItem, removeItem, clearProject, clearAll };
});