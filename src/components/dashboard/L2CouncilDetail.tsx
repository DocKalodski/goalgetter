"use client";

import { useEffect } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { L2PendingApprovalsPage } from "./L2PendingApprovalsPage";
import { L2CouncilStudentsView } from "./L2CouncilStudentsView";

export function L2CouncilDetail() {
  const { l2SubView, selectedCouncilId, setCurrentPage, user } = useNavigation();

  // HC with no council selected → redirect back to L1 to pick one
  useEffect(() => {
    if (!selectedCouncilId && user.role === "head_coach") {
      setCurrentPage("L1");
    }
  }, [selectedCouncilId, user.role, setCurrentPage]);

  if (l2SubView === "approvals") {
    return <L2PendingApprovalsPage />;
  }

  // Coach auto-loads their council when selectedCouncilId is null
  // HC will redirect to L1 via useEffect above
  return <L2CouncilStudentsView />;
}
