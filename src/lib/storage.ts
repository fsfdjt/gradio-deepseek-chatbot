import type { AppData } from "./types";

const DB_NAME = "work-life-hub";
const DB_VERSION = 1;
const STORE_NAME = "secureVault";
const APP_DATA_KEY = "appData";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = callback(store);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

export async function loadAppData(): Promise<AppData | null> {
  if (!isIndexedDbAvailable()) {
    return null;
  }

  return withStore<AppData | undefined>("readonly", (store) =>
    store.get(APP_DATA_KEY),
  ).then((result) => result ?? null);
}

export async function saveAppData(data: AppData): Promise<void> {
  await withStore<IDBValidKey>("readwrite", (store) => store.put(data, APP_DATA_KEY));
}

export async function clearAppData(): Promise<void> {
  if (!isIndexedDbAvailable()) {
    return;
  }

  await withStore<undefined>("readwrite", (store) => store.clear());
}
