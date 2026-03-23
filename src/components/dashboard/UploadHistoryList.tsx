"use client";

import { useEffect, useState, useCallback } from "react";
import { getDataUploads, getUploadChanges, deleteUpload } from "@/lib/actions/data-sync";
import type { DataUpload, DataUploadChange } from "@/lib/db/schema";
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  FileSpreadsheet,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Clock,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Check }> = {
  processing: { label: "Processing", color: "text-blue-600", bg: "bg-blue-500/10", icon: Loader2 },
  pending_review: { label: "Pending Review", color: "text-amber-600", bg: "bg-amber-500/10", icon: Clock },
  applied: { label: "Applied", color: "text-emerald-600", bg: "bg-emerald-500/10", icon: Check },
  partially_applied: { label: "Partial", color: "text-orange-600", bg: "bg-orange-500/10", icon: AlertTriangle },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-500/10", icon: X },
  error: { label: "Error", color: "text-red-600", bg: "bg-red-500/10", icon: X },
};

export function UploadHistoryList() {
  const [uploads, setUploads] = useState<DataUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedChanges, setExpandedChanges] = useState<DataUploadChange[]>([]);
  const [loadingChanges, setLoadingChanges] = useState(false);

  const load = useCallback(async () => {
    const data = await getDataUploads();
    setUploads(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleExpand = async (uploadId: string) => {
    if (expandedId === uploadId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(uploadId);
    setLoadingChanges(true);
    const { changes } = await getUploadChanges(uploadId);
    setExpandedChanges(changes);
    setLoadingChanges(false);
  };

  const handleDelete = async (uploadId: string) => {
    await deleteUpload(uploadId);
    if (expandedId === uploadId) setExpandedId(null);
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>No uploads yet</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
      {uploads.map((upload) => {
        const status = statusConfig[upload.status] || statusConfig.error;
        const StatusIcon = status.icon;
        const isExpanded = expandedId === upload.id;
        const canDelete = upload.status === "pending_review" || upload.status === "error";

        return (
          <div key={upload.id}>
            {/* Row */}
            <button
              onClick={() => handleExpand(upload.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {upload.filename}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color} shrink-0`}>
                    <StatusIcon className="h-3 w-3 inline mr-1" />
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>
                    {upload.createdAt
                      ? new Date(upload.createdAt).toLocaleString()
                      : "—"}
                  </span>
                  <span>
                    {upload.appliedChanges}/{upload.totalChanges} applied
                  </span>
                </div>
              </div>
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(upload.id);
                  }}
                  className="p-1.5 rounded hover:bg-destructive/10 transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </button>

            {/* Expanded changes */}
            {isExpanded && (
              <div className="bg-muted/20 px-8 py-3 max-h-80 overflow-y-auto">
                {loadingChanges ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : expandedChanges.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    No changes detected (data matched current DB)
                  </p>
                ) : (
                  <div className="space-y-1">
                    {expandedChanges.map((c) => {
                      const changeStatus =
                        c.status === "applied"
                          ? "text-emerald-600"
                          : c.status === "rejected"
                          ? "text-red-600"
                          : c.status === "skipped_conflict"
                          ? "text-orange-600"
                          : "text-muted-foreground";
                      const statusLabel =
                        c.status === "applied"
                          ? "Applied"
                          : c.status === "rejected"
                          ? "Rejected"
                          : c.status === "skipped_conflict"
                          ? "Conflict"
                          : "Pending";

                      return (
                        <div
                          key={c.id}
                          className="flex items-start gap-2 text-xs py-1"
                        >
                          <span className={`font-medium shrink-0 w-16 ${changeStatus}`}>
                            {statusLabel}
                          </span>
                          <span className="text-muted-foreground shrink-0">
                            {c.studentName}
                          </span>
                          {c.weekNumber && (
                            <span className="text-muted-foreground shrink-0">
                              W{c.weekNumber}
                            </span>
                          )}
                          {c.goalType && (
                            <span className="text-muted-foreground capitalize shrink-0">
                              {c.goalType}
                            </span>
                          )}
                          <span className="truncate">
                            {c.field}: {c.oldValue ? `"${truncate(c.oldValue, 20)}" → ` : ""}
                            "{truncate(c.newValue, 30)}"
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "...";
}
