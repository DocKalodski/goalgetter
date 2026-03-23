"use client";

import { useOffline } from "@/hooks/useOffline";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineIndicator() {
  const { isOnline, pendingCount } = useOffline();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOnline && (
        <div className="flex items-center gap-2 bg-warning/90 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
          <WifiOff className="h-4 w-4" />
          Offline
        </div>
      )}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 bg-primary/90 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium mt-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {pendingCount} pending sync
        </div>
      )}
    </div>
  );
}
