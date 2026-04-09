"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { getPendingApprovals, approveGoal, approveDeclaration, approveMilestone } from "@/lib/actions/approvals";
import {
  ArrowLeft,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  FileText,
  Target,
  Milestone,
} from "lucide-react";

interface PendingItem {
  type: "coach" | "declaration" | "goal" | "milestone";
  id: string;
  studentName: string | null;
  studentId: string;
  detail: string;
  createdAt: Date;
}

export function L2PendingApprovalsPage() {
  const { setL2SubView, setSelectedStudentId, setActiveL3Tab, setCurrentPage } =
    useNavigation();
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const data = await getPendingApprovals();
      setItems(data);
    } catch (error) {
      console.error("Failed to load pending approvals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleApprove = async (item: PendingItem) => {
    setProcessing(item.id);
    try {
      if (item.type === "goal") {
        await approveGoal(item.id, "approved");
      } else if (item.type === "declaration") {
        await approveDeclaration(item.id, "approved");
      } else if (item.type === "milestone") {
        await approveMilestone(item.id, "approved");
      }
      await loadItems();
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (item: PendingItem) => {
    setProcessing(item.id);
    try {
      if (item.type === "goal") {
        await approveGoal(item.id, "rejected");
      } else if (item.type === "declaration") {
        await approveDeclaration(item.id, "rejected");
      } else if (item.type === "milestone") {
        await approveMilestone(item.id, "rejected");
      }
      await loadItems();
    } catch (error) {
      console.error("Rejection failed:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveAll = async () => {
    const approvable = items.filter((i) => i.type !== "coach");
    if (approvable.length === 0) return;
    setApprovingAll(true);
    try {
      for (const item of approvable) {
        if (item.type === "goal") await approveGoal(item.id, "approved");
        else if (item.type === "declaration") await approveDeclaration(item.id, "approved");
        else if (item.type === "milestone") await approveMilestone(item.id, "approved");
      }
      await loadItems();
    } catch (error) {
      console.error("Approve all failed:", error);
    } finally {
      setApprovingAll(false);
    }
  };

  const handleStudentClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveL3Tab("goals");
    setCurrentPage("L3");
  };

  const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "declaration":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "goal":
        return <Target className="h-4 w-4 text-blue-500" />;
      case "milestone":
        return <Milestone className="h-4 w-4 text-green-500" />;
      default:
        return <ClipboardCheck className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const typeLabel: Record<string, string> = {
    coach: "Coach",
    declaration: "Declaration",
    goal: "Goal",
    milestone: "Milestone",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setL2SubView("overview")}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Pending Approvals</h2>
          <p className="text-muted-foreground text-sm">
            {items.length} item{items.length !== 1 ? "s" : ""} awaiting review
          </p>
        </div>
        {items.filter((i) => i.type !== "coach").length > 0 && (
          <button
            type="button"
            disabled={approvingAll}
            onClick={handleApproveAll}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors shrink-0"
          >
            <CheckCircle className="h-4 w-4" />
            {approvingAll ? "Approving…" : `Approve All (${items.filter((i) => i.type !== "coach").length})`}
          </button>
        )}
      </div>

      {/* Approval items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="bg-card rounded-xl border border-border p-4 flex items-start gap-4"
          >
            <div className="p-2 rounded-lg bg-muted mt-0.5">
              <TypeIcon type={item.type} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {typeLabel[item.type]}
                </span>
                <button
                  onClick={() => handleStudentClick(item.studentId)}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {item.studentName || "Unknown"}
                </button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.detail}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleApprove(item)}
                disabled={processing === item.id}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                onClick={() => handleReject(item)}
                disabled={processing === item.id}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>All caught up! No pending approvals.</p>
          </div>
        )}
      </div>
    </div>
  );
}
