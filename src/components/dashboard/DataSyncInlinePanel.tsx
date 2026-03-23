"use client";

import { DataSyncPage } from "./DataSyncPage";

export function DataSyncInlinePanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-muted/40 rounded-xl border border-border p-5">
      <DataSyncPage embedded onClose={onClose} />
    </div>
  );
}
