"use client";

import { useNavigation } from "@/components/layout/DashboardShell";
import { L1OverviewPage } from "./L1OverviewPage";
import { L2OverviewPage } from "./L2OverviewPage";
import { L1CoachesPage } from "./L1CoachesPage";
import { L1StudentsPage } from "./L1StudentsPage";
import { L1CouncilRankingsPage } from "./L1CouncilRankingsPage";
import { DataSyncPage } from "./DataSyncPage";
import { L1EavesdropPage } from "./L1EavesdropPage";
import { L1SecurityPage } from "./L1SecurityPage";

export function L1Dashboard() {
  const { l1SubView, user } = useNavigation();

  // Coaches always see their council overview — no sub-views
  if (user.role === "coach") {
    return <L2OverviewPage />;
  }

  switch (l1SubView) {
    case "coaches":
      return <L1CoachesPage />;
    case "students":
      return <L1StudentsPage />;
    case "councils":
      return <L1CouncilRankingsPage />;
    case "data-sync":
      return <DataSyncPage />;
    case "eavesdrop":
      return <L1EavesdropPage />;
    case "security":
      return <L1SecurityPage />;
    default:
      return <L2OverviewPage />;
  }
}
