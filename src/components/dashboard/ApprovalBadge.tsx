"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { approveMilestone, approveDeclaration, approveGoal } from "@/lib/actions/approvals";

interface ApprovalBadgeProps {
  status: string;
  type: "milestone" | "declaration" | "goal";
  id: string;
  canApprove: boolean;
  reviewNote?: string | null;
  onStatusChange?: () => void;
}

export function ApprovalBadge({
  status,
  type,
  id,
  canApprove,
  reviewNote,
  onStatusChange,
}: ApprovalBadgeProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleAction(newStatus: "approved" | "rejected") {
    setSubmitting(true);
    try {
      if (type === "milestone") {
        await approveMilestone(id, newStatus);
      } else if (type === "declaration") {
        await approveDeclaration(id, newStatus);
      } else if (type === "goal") {
        await approveGoal(id, newStatus);
      }
      onStatusChange?.();
    } catch (e) {
      console.error(`Failed to ${newStatus} ${type}:`, e);
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
        <CheckCircle className="h-3 w-3" />
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
        {canApprove && (
          <button
            onClick={() => handleAction("approved")}
            disabled={submitting}
            className="text-xs text-primary hover:underline disabled:opacity-50"
          >
            Re-approve
          </button>
        )}
      </div>
    );
  }

  // Pending
  if (canApprove) {
    return (
      <div className="flex flex-col gap-1 items-start">
        {reviewNote && (
          <p className="text-xs text-muted-foreground italic bg-muted/50 px-2 py-1 rounded border border-border max-w-xs">
            <span className="font-semibold not-italic text-foreground">Note: </span>
            {reviewNote}
          </p>
        )}
        <div className="inline-flex items-center gap-1">
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
            <Clock className="h-3 w-3" />
            Pending
          </span>
          <button
            onClick={() => handleAction("approved")}
            disabled={submitting}
            className="ml-1 p-0.5 text-green-600 hover:bg-green-500/10 rounded disabled:opacity-50"
            title="Approve"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleAction("rejected")}
            disabled={submitting}
            className="p-0.5 text-destructive hover:bg-destructive/10 rounded disabled:opacity-50"
            title="Reject"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
      <Clock className="h-3 w-3" />
      Pending Review
    </span>
  );
}
