import { openDB, IDBPDatabase } from "idb";
import { Result } from "./result";

const DB_NAME = "phaseboard";
const DB_VERSION = 1;

export type PhaseboardDB = IDBPDatabase;

export async function openDatabase(): Promise<Result<PhaseboardDB>> {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("projects")) {
          db.createObjectStore("projects", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("phase1Items")) {
          const phase1Store = db.createObjectStore("phase1Items", {
            keyPath: "id",
          });
          phase1Store.createIndex("projectId", "projectId", {
            unique: false,
          });
        }
      },
    });

    return { success: true, data: db };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Unknown error opening phaseboard database";
    return { success: false, error: message };
  }
}
