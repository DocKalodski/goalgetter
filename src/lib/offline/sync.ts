import { processPendingUpdates, getPendingCount } from "./db";

export async function syncAll(): Promise<{ synced: number; remaining: number }> {
  const beforeCount = await getPendingCount();
  await processPendingUpdates();
  const afterCount = await getPendingCount();

  return {
    synced: beforeCount - afterCount,
    remaining: afterCount,
  };
}

export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
        })
        .catch((error) => {
          console.error("SW registration failed:", error);
        });
    });
  }
}
