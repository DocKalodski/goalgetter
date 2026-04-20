"use client";

import { useEffect } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { L1Dashboard } from "./L1Dashboard";
import { L2CouncilDetail } from "./L2CouncilDetail";
import { L3StudentDetail } from "./L3StudentDetail";
import { ProfilePanel } from "./ProfilePanel";
import { EssenceQualitiesPage } from "./EssenceQualitiesPage";

export function DashboardRouter() {
  const { currentPage, user, selectedStudentId, setCurrentPage } = useNavigation();

  const isPrivileged = user.role === "head_coach" || user.role === "coach" || user.role === "admin";
  const isFacilitator = user.role === "facilitator";

  // L3 with no student selected → go back to L2
  useEffect(() => {
    if (currentPage === "L3" && !selectedStudentId && isPrivileged) {
      setCurrentPage("L2");
    }
    // Facilitator can never reach L3
    if (currentPage === "L3" && isFacilitator) {
      setCurrentPage("L1");
    }
  }, [currentPage, selectedStudentId, isPrivileged, isFacilitator, setCurrentPage]);

  if (currentPage === "essence-qualities") {
    return <EssenceQualitiesPage />;
  }

  if (currentPage === "profile") {
    return <ProfilePanel />;
  }

  if (currentPage === "L1" && (isPrivileged || isFacilitator)) {
    return <L1Dashboard />;
  }

  if (currentPage === "L2" && (isPrivileged || isFacilitator)) {
    return <L2CouncilDetail />;
  }

  if (currentPage === "L3" && isPrivileged) {
    if (selectedStudentId) {
      return <L3StudentDetail />;
    }
    return null; // redirecting via useEffect above
  }

  // Students/council leaders see their own detail
  return <L3StudentDetail />;
}
