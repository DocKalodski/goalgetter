"use client";

import { useEffect, useState, useCallback } from "react";
import { getUploadChanges, applyChanges, applyAllChanges } from "@/lib/actions/data-sync";
import type { DataUploadChange } from "@/lib/db/schema";
import {
  ChevronDown,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Plus,
  Pencil,
  Minus,
} from "lucide-react";

interface ChangePreviewPanelProps {
  uploadId: string;
  onDone: () => void;
}

interface GroupedChanges {
  [studentName: string]: {
    [weekKey: string]: {
      [goalType: string]: DataUploadChange[];
    };
  };
}

function groupChanges(changes: DataUploadChange[]): GroupedChanges {
  const grouped: GroupedChanges = {};
  for (const c of changes) {
    const student = c.studentName;
    const weekKey = c.weekNumber ? `Week ${c.weekNumber}` : "General";
    const goalKey = c.goalType || "other";

    if (!grouped[student]) grouped[student] = {};
    if (!grouped[student][weekKey]) grouped[student][weekKey] = {};
    if (!grouped[student][weekKey][goalKey]) grouped[student][weekKey][goalKey] = [];
    grouped[student][weekKey][goalKey].push(c);
  }
  return grouped;
}

const changeTypeConfig = {
  added: { icon: Plus, color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Added" },
  modified: { icon: Pencil, color: "text-amber-600", bg: "bg-amber-500/10", label: "Modified" },
  removed: { icon: Minus, color: "text-red-600", bg: "bg-red-500/10", label: "Removed" },
};

export function ChangePreviewPanel({ uploadId, onDone }: ChangePreviewPanelProps) {
  const [changes, setChanges] = useState<DataUploadChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<{ added: number; modified: number; removed: number }>({
    added: 0,
    modified: 0,
    removed: 0,
  });

  const load = useCallback(async () => {
    const { changes: data } = await getUploadChanges(uploadId);
    setChanges(data);

    const pending = data.filter((c) => c.status === "pending");
    setSummary({
      added: pending.filter((c) => c.changeType === "added").length,
      modified: pending.filter((c) => c.changeType === "modified").length,
      removed: pending.filter((c) => c.changeType === "removed").length,
    });

    // Auto-select all pending
    setSelectedIds(new Set(pending.map((c) => c.id)));

    // Start with all students collapsed
    setExpandedStudents(new Set());

    setLoading(false);
  }, [uploadId]);

  useEffect(() => {
    load();
  }, [load]);

  const pendingChanges = changes.filter((c) => c.status === "pending");
  const grouped = groupChanges(pendingChanges);
  const studentNames = Object.keys(grouped).sort();

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pendingChanges.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingChanges.map((c) => c.id)));
    }
  };

  const toggleStudent = (name: string) => {
    setExpandedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleWeek = (key: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleApplySelected = async () => {
    if (selectedIds.size === 0) return;
    setApplying(true);
    await applyChanges(uploadId, Array.from(selectedIds), "apply");
    await load();
    setApplying(false);
  };

  const handleRejectSelected = async () => {
    if (selectedIds.size === 0) return;
    setApplying(true);
    await applyChanges(uploadId, Array.from(selectedIds), "reject");
    await load();
    setApplying(false);
  };

  const handleApplyAll = async () => {
    setApplying(true);
    await applyAllChanges(uploadId);
    await load();
    setApplying(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (pendingChanges.length === 0) {
    return (
      <div className="text-center py-8">
        <Check className="h-8 w-8 mx-auto mb-3 text-emerald-500" />
        <p className="font-medium">All changes processed</p>
        <p className="text-sm text-muted-foreground mt-1">
          {changes.filter((c) => c.status === "applied").length} applied,{" "}
          {changes.filter((c) => c.status === "rejected").length} rejected,{" "}
          {changes.filter((c) => c.status === "skipped_conflict").length} conflicts
        </p>
        <button
          onClick={onDone}
          className="mt-4 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3 bg-muted/50 rounded-lg px-4 py-3">
        <span className="text-sm font-medium">
          {pendingChanges.length} changes across {studentNames.length} students
        </span>
        <div className="flex gap-2 text-xs">
          {summary.added > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
              +{summary.added} added
            </span>
          )}
          {summary.modified > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
              ~{summary.modified} modified
            </span>
          )}
          {summary.removed > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
              -{summary.removed} removed
            </span>
          )}
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={toggleSelectAll}
          className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          {selectedIds.size === pendingChanges.length ? "Deselect All" : "Select All"}
        </button>
        <button
          onClick={handleApplyAll}
          disabled={applying}
          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {applying ? "Processing..." : "Apply All"}
        </button>
        <button
          onClick={handleApplySelected}
          disabled={applying || selectedIds.size === 0}
          className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          Apply Selected ({selectedIds.size})
        </button>
        <button
          onClick={handleRejectSelected}
          disabled={applying || selectedIds.size === 0}
          className="text-xs px-3 py-1.5 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
        >
          Reject Selected
        </button>
      </div>

      {/* Change tree */}
      <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
        {studentNames.map((studentName) => {
          const studentChanges = pendingChanges.filter(
            (c) => c.studentName === studentName
          );
          const studentExpanded = expandedStudents.has(studentName);
          const weekKeys = Object.keys(grouped[studentName]).sort();

          return (
            <div key={studentName}>
              {/* Student header */}
              <button
                onClick={() => toggleStudent(studentName)}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                {studentExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="font-medium text-sm">{studentName}</span>
                <span className="text-xs text-muted-foreground">
                  ({studentChanges.length} changes)
                </span>
              </button>

              {/* Weeks */}
              {studentExpanded && (
                <div className="bg-muted/20">
                  {weekKeys.map((weekKey) => {
                    const goalTypes = Object.keys(grouped[studentName][weekKey]).sort();
                    const weekId = `${studentName}-${weekKey}`;
                    const weekExpanded = expandedWeeks.has(weekId);

                    return (
                      <div key={weekKey}>
                        <button
                          onClick={() => toggleWeek(weekId)}
                          className="w-full flex items-center gap-2 px-8 py-2 hover:bg-muted/50 transition-colors text-left"
                        >
                          {weekExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-sm text-muted-foreground">{weekKey}</span>
                        </button>

                        {weekExpanded &&
                          goalTypes.map((goalType) => (
                            <div key={goalType} className="px-12 pb-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                                {goalType}
                              </p>
                              {grouped[studentName][weekKey][goalType].map((change) => {
                                const config = changeTypeConfig[change.changeType];
                                const Icon = config.icon;

                                return (
                                  <div
                                    key={change.id}
                                    className="flex items-start gap-2 py-1.5"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.has(change.id)}
                                      onChange={() => toggleSelect(change.id)}
                                      className="mt-1 shrink-0"
                                    />
                                    <span
                                      className={`p-0.5 rounded ${config.bg} shrink-0 mt-0.5`}
                                    >
                                      <Icon className={`h-3 w-3 ${config.color}`} />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs">
                                        <span className="text-muted-foreground">
                                          {change.field}:
                                        </span>{" "}
                                        {change.oldValue && (
                                          <span className="line-through text-muted-foreground/60 mr-1">
                                            {truncate(change.oldValue, 40)}
                                          </span>
                                        )}
                                        {change.newValue && (
                                          <span className={config.color}>
                                            {truncate(change.newValue, 60)}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "...";
}
