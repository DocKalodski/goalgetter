"use client";

import { useState } from "react";
import { X, Users, GraduationCap, UserCog } from "lucide-react";
import { ManageCouncilsPanel } from "./ManageCouncilsPanel";
import { ManageStudentsPanel } from "./ManageStudentsPanel";
import { ManageCoachesPanel } from "./ManageCoachesPanel";

type Tab = "councils" | "students" | "coaches";

interface ManageTeamPanelProps {
  batchId: string;
  onClose: () => void;
  onChanged: () => void;
  initialTab?: Tab;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "councils", label: "Councils", icon: <Users className="h-3.5 w-3.5" /> },
  { id: "students", label: "Students", icon: <GraduationCap className="h-3.5 w-3.5" /> },
  { id: "coaches",  label: "Coaches",  icon: <UserCog className="h-3.5 w-3.5" /> },
];

export function ManageTeamPanel({ batchId, onClose, onChanged, initialTab = "councils" }: ManageTeamPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  return (
    <div className="bg-muted/40 rounded-xl border border-border overflow-hidden">
      {/* Panel header + tabs */}
      <div className="flex items-center gap-0 border-b border-border bg-card">
        {/* Tab strip */}
        <div className="flex items-center flex-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
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
          className="p-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tab content — strip the inner header/close since ManageTeamPanel owns that */}
      <div className="p-5">
        {activeTab === "councils" && (
          <ManageCouncilsPanel
            batchId={batchId}
            onClose={onClose}
            onChanged={onChanged}
            embedded
          />
        )}
        {activeTab === "students" && (
          <ManageStudentsPanel
            onClose={onClose}
            embedded
          />
        )}
        {activeTab === "coaches" && (
          <ManageCoachesPanel />
        )}
      </div>
    </div>
  );
}
