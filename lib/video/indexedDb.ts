import type { VideoProject } from "./types";
const DB = "trackfy-video-engine";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => { const db = request.result; if (!db.objectStoreNames.contains("projects")) db.createObjectStore("projects", { keyPath: "id" }); };
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
}

export async function saveProject(project: VideoProject) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => { const tx = db.transaction("projects", "readwrite"); tx.objectStore("projects").put(project); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
  db.close();
}

export async function loadProject(id = "default"): Promise<VideoProject | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => { const request = db.transaction("projects").objectStore("projects").get(id); request.onsuccess = () => { db.close(); resolve(request.result ?? null); }; request.onerror = () => reject(request.error); });
}
