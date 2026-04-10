import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';

const DB_NAME = 'docs_vault';
const STORE_NAME = 'staged_files';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export const fileStorage = {
  /**
   * Sauvegarde un fichier binaire avec un ID unique
   */
  async saveFile(id: string, file: File): Promise<void> {
    const db = await getDB();
    await db.put(STORE_NAME, file, id);
  },

  /**
   * Récupère un fichier binaire par son ID
   */
  async getFile(id: string): Promise<File | undefined> {
    const db = await getDB();
    return db.get(STORE_NAME, id);
  },

  /**
   * Supprime un fichier par son ID
   */
  async deleteFile(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },

  /**
   * Vide tout le stockage des fichiers
   */
  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear(STORE_NAME);
  }
};
