"use client";

import { useState } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { ExcelUploadForm } from "./ExcelUploadForm";
import { ExcelImportPanel } from "./ExcelImportPanel";
import { ChangePreviewPanel } from "./ChangePreviewPanel";
import { UploadHistoryList } from "./UploadHistoryList";
import { ArrowLeft, Upload, History, FileSpreadsheet } from "lucide-react";

type Tab = "upload" | "import" | "history";

export function DataSyncPage({ embedded = false, onClose }: { embedded?: boolean; onClose?: () => void } = {}) {
  const { setL1SubView } = useNavigation();
  const [activeTab, setActiveTab] = useState<Tab>("import");
  const [previewUploadId, setPreviewUploadId] = useState<string | null>(null);

  const tabs: { id: Tab; label: string; icon: typeof Upload }[] = [
    { id: "import", label: "LEAP 99 Import", icon: FileSpreadsheet },
    { id: "upload", label: "Diff Upload", icon: Upload },
    { id: "history", label: "History", icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => embedded && onClose ? onClose() : setL1SubView("overview")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {embedded ? "Close" : "Back"}
        </button>
        <div>
          <h2 className="text-2xl font-bold">Data Sync</h2>
          <p className="text-muted-foreground text-sm">
            Upload tracker data and manage changes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPreviewUploadId(null);
              }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-card rounded-xl border border-border p-6">
        {activeTab === "import" && <ExcelImportPanel />}

        {activeTab === "upload" && !previewUploadId && (
          <ExcelUploadForm
            onUploadComplete={(result) => {
              if (result.success && result.uploadId) {
                if (result.summary && result.summary.totalChanges > 0) {
                  setPreviewUploadId(result.uploadId);
                } else {
                  // No changes found
                  setActiveTab("history");
                }
              }
            }}
          />
        )}

        {activeTab === "upload" && previewUploadId && (
          <ChangePreviewPanel
            uploadId={previewUploadId}
            onDone={() => {
              setPreviewUploadId(null);
              setActiveTab("history");
            }}
          />
        )}

        {activeTab === "history" && <UploadHistoryList />}
      </div>
    </div>
  );
}
