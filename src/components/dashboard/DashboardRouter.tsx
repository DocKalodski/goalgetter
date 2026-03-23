"use client";

import { useEffect } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { L1Dashboard } from "./L1Dashboard";
import { L2CouncilDetail } from "./L2CouncilDetail";
import { L3StudentDetail } from "./L3StudentDetail";
import { ProfilePanel } from "./ProfilePanel";

export function DashboardRouter() {
  const { currentPage, user, selectedStudentId, setCurrentPage } = useNavigation();

  // L3 with no student selected → go back to L2 (student rows are in L2)
  useEffect(() => {
    if (currentPage === "L3" && !selectedStudentId && (user.role === "head_coach" || user.role === "coach")) {
      setCurrentPage("L2");
    }
  }, [currentPage, selectedStudentId, user.role, setCurrentPage]);

  if (currentPage === "profile") {
    return <ProfilePanel />;
  }

  if (currentPage === "L1" && (user.role === "head_coach" || user.role === "coach")) {
    return <L1Dashboard />;
  }

  if (currentPage === "L2" && (user.role === "head_coach" || user.role === "coach")) {
    return <L2CouncilDetail />;
  }

  if (currentPage === "L3" && (user.role === "head_coach" || user.role === "coach")) {
    if (selectedStudentId) {
      return <L3StudentDetail />;
    }
    return null; // redirecting via useEffect above
  }

  // Students/council leaders see their own detail
  return <L3StudentDetail />;
}
