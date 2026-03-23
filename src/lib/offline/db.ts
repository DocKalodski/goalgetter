import { openDB, type IDBPDatabase } from "idb";

interface GoalGetterDB {
  goals: { key: string; value: Record<string, unknown> };
  milestones: { key: string; value: Record<string, unknown> };
  pendingUpdates: {
    key: number;
    value: { action: string; data: Record<string, unknown>; timestamp: number };
  };
}

let dbInstance: IDBPDatabase<GoalGetterDB> | null = null;

export async function getOfflineDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<GoalGetterDB>("goalgetter-offline", 1, {
    upgrade(db) {
      db.createObjectStore("goals", { keyPath: "id" });
      db.createObjectStore("milestones", { keyPath: "id" });
      db.createObjectStore("pendingUpdates", {
        keyPath: "id",
        autoIncrement: true,
      });
    },
  });

  return dbInstance;
}

export async function queueOfflineAction(
  action: string,
  data: Record<string, unknown>
) {
  const db = await getOfflineDB();
  await db.add("pendingUpdates", {
    action,
    data,
    timestamp: Date.now(),
  } as GoalGetterDB["pendingUpdates"]["value"]);
}

export async function processPendingUpdates() {
  const db = await getOfflineDB();
  const pending = await db.getAll("pendingUpdates");

  for (const update of pending) {
    try {
      const response = await fetch(`/api/${update.action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update.data),
      });

      if (response.ok) {
        await db.delete(
          "pendingUpdates",
          (update as Record<string, unknown>).id as number
        );
      }
    } catch (error) {
      console.error("Failed to sync update:", error);
    }
  }
}

export async function getPendingCount(): Promise<number> {
  const db = await getOfflineDB();
  return db.count("pendingUpdates");
}
