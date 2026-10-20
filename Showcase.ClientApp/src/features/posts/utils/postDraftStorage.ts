/**
 * Client-side local draft storage for Post creation.
 * Uses localStorage for metadata and IndexedDB for large image File/Blob objects.
 */

const DB_NAME = "pority_post_drafts";
const DB_VERSION = 1;
const STORE_NAME = "draft_images";
const META_STORAGE_KEY = "pority_new_post_draft_meta";

function openDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StagedDraftImageRecord {
  id: string;
  file: File;
  displayOrder: number;
}

export interface DraftMetaRecord {
  title: string;
  description: string;
  externalUrl: string;
  tags: string[];
}

export async function saveDraftImagesToLocal(images: StagedDraftImageRecord[]): Promise<void> {
  try {
    const db = await openDraftDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Clear existing
    store.clear();

    for (const item of images) {
      if (item.file) {
        store.put({
          id: item.id,
          file: item.file,
          displayOrder: item.displayOrder,
        });
      }
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("Failed to save draft images to IndexedDB:", err);
  }
}

export async function loadDraftImagesFromLocal(): Promise<StagedDraftImageRecord[]> {
  try {
    const db = await openDraftDb();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const records = (request.result || []) as StagedDraftImageRecord[];
        records.sort((a, b) => a.displayOrder - b.displayOrder);
        resolve(records);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to load draft images from IndexedDB:", err);
    return [];
  }
}

export async function clearDraftImagesFromLocal(): Promise<void> {
  try {
    const db = await openDraftDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("Failed to clear draft images from IndexedDB:", err);
  }
}

export function saveDraftMetaToStorage(meta: DraftMetaRecord): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
    }
  } catch (err) {
    console.warn("Failed to save draft metadata to localStorage:", err);
  }
}

export function loadDraftMetaFromStorage(): DraftMetaRecord | null {
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(META_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as DraftMetaRecord;
      }
    }
  } catch (err) {
    console.warn("Failed to load draft metadata from localStorage:", err);
  }
  return null;
}

export function clearDraftMetaFromStorage(): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(META_STORAGE_KEY);
    }
  } catch (err) {
    console.warn("Failed to clear draft metadata from localStorage:", err);
  }
}

export async function clearEntireDraft(): Promise<void> {
  clearDraftMetaFromStorage();
  await clearDraftImagesFromLocal();
}
