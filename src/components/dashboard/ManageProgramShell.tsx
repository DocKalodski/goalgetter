"use client";

import { useState, useCallback } from "react";
import { X, Calendar, Users, GraduationCap, UserCog, Database } from "lucide-react";
import { ManageCouncilsPanel } from "./ManageCouncilsPanel";
import { ManageStudentsPanel } from "./ManageStudentsPanel";
import { ManageCoachesPanel } from "./ManageCoachesPanel";
import { ManageProgramPanel } from "./ManageProgramPanel";
import { DataSyncPage } from "./DataSyncPage";

type Tab = "schedule" | "councils" | "students" | "coaches" | "data";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "coaches",   label: "Coaches",   icon: <UserCog       className="h-3.5 w-3.5" /> },
  { id: "students",  label: "Students",  icon: <GraduationCap className="h-3.5 w-3.5" /> },
  { id: "councils",  label: "Councils",  icon: <Users         className="h-3.5 w-3.5" /> },
  { id: "schedule",  label: "Schedule",  icon: <Calendar      className="h-3.5 w-3.5" /> },
  { id: "data",      label: "Data",      icon: <Database      className="h-3.5 w-3.5" /> },
];

interface ManageProgramShellProps {
  batchId: string;
  onClose: () => void;
  onChanged: () => void;
  initialTab?: Tab;
}

export function ManageProgramShell({
  batchId,
  onClose,
  onChanged,
  initialTab = "coaches",
}: ManageProgramShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [refreshCount, setRefreshCount] = useState(0);

  const handleChanged = useCallback(() => {
    setRefreshCount((n) => n + 1);
    onChanged();
  }, [onChanged]);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-lg">
      {/* Tab bar */}
      <div className="flex items-center border-b border-border bg-muted/30">
        <div className="flex items-center flex-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="p-3 text-muted-foreground hover:text-foreground transition-colors shrink-0 border-l border-border"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tab content */}
      <div className="p-5">
        {activeTab === "schedule" && <ManageProgramPanel />}
        {activeTab === "councils" && (
          <ManageCouncilsPanel batchId={batchId} onClose={onClose} onChanged={handleChanged} embedded refreshKey={refreshCount} />
        )}
        {activeTab === "students" && (
          <ManageStudentsPanel onClose={onClose} onChanged={handleChanged} embedded refreshKey={refreshCount} />
        )}
        {activeTab === "coaches" && (
          <ManageCoachesPanel onChanged={handleChanged} refreshKey={refreshCount} />
        )}
        {activeTab === "data" && (
          <DataSyncPage embedded onClose={onClose} />
        )}
      </div>
    </div>
  );
}
