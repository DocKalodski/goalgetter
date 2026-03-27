"use client";

import { useNavigation } from "@/components/layout/DashboardShell";
import { ExcelImportPanel } from "./ExcelImportPanel";
import { ArrowLeft } from "lucide-react";
import { UpgradeModuleBanner } from "@/components/ui/UpgradeModuleBanner";

export function DataSyncPage({ embedded = false, onClose }: { embedded?: boolean; onClose?: () => void } = {}) {
  const { setL1SubView, setL1ManageOpen } = useNavigation();

  return (
    <div className="space-y-6">
      <UpgradeModuleBanner />
      <div className="flex items-center gap-4">
        <button
          onClick={() => { if (embedded && onClose) { onClose(); } else { setL1SubView("overview"); setL1ManageOpen(true); } }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {embedded ? "Close" : "Back"}
        </button>
        <div>
          <h2 className="text-2xl font-bold">Data Sync</h2>
          <p className="text-muted-foreground text-sm">Upload tracker data and manage changes</p>
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <ExcelImportPanel />
      </div>
    </div>
  );
}
