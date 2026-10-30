// Lokaler Speicher in IndexedDB. Keine Übertragung, kein Server.
const DB_NAME = 'fokus-training';
const DB_VERSION = 1;
let dbp = null;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('records')) {
        const s = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
        s.createIndex('date', 'date');
        s.createIndex('game', 'game');
        s.createIndex('unit', 'unit');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

function tx(store, mode, fn) {
  return open().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    let out;
    Promise.resolve(fn(s)).then(v => { out = v; });
    t.oncomplete = () => resolve(out instanceof IDBRequest ? out.result : out);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

export const kv = {
  get: key => tx('kv', 'readonly', s => s.get(key)),
  set: (key, val) => tx('kv', 'readwrite', s => { s.put(val, key); })
};

export const records = {
  add: rec => tx('records', 'readwrite', s => s.add(rec)),
  put: rec => tx('records', 'readwrite', s => { s.put(rec); }),
  all: () => tx('records', 'readonly', s => s.getAll()),
  byUnit: unit => tx('records', 'readonly', s => s.index('unit').getAll(unit)),
  clear: () => tx('records', 'readwrite', s => { s.clear(); }),
  bulkAdd: list => tx('records', 'readwrite', s => { list.forEach(r => { const c = { ...r }; delete c.id; s.add(c); }); })
};

export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      if (await navigator.storage.persisted()) return true;
      return await navigator.storage.persist();
    }
  } catch (e) { /* ignoriert */ }
  return false;
}

export async function isPersisted() {
  try { return navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : false; } catch (e) { return false; }
}
