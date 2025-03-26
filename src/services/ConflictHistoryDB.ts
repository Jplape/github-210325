import { openDB } from 'idb';
import type { Task } from '../types/task';

const DB_NAME = 'ConflictHistory';
const STORE_NAME = 'taskConflicts';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'taskId' });
    }
  });
}

export async function saveConflict(
  taskId: string,
  local: Partial<Task>,
  remote: Partial<Task>,
  resolved: Partial<Task>
) {
  const db = await initDB();
  await db.put(STORE_NAME, {
    taskId,
    local,
    remote,
    resolved,
    timestamp: new Date().toISOString()
  });
}

export async function getConflicts() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}