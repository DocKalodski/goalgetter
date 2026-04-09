"use client";

import { useState, createContext, useContext } from "react";
import { Header } from "./Header";
import type { JWTPayload } from "@/lib/auth/jwt";

export type NavigationLevel = "L1" | "L2" | "L3" | "profile" | "essence-qualities";
export type L1SubView = "overview" | "coaches" | "students" | "councils" | "data-sync" | "eavesdrop" | "security";
export type L2SubView = "overview" | "approvals";
export type L3Tab = "attendance" | "goals" | "feedback" | "action-planner" | "ask-ai" | "ai-coach" | "voice-coach" | "journey" | "calendar" | "ask-me-chat";

interface NavigationContextType {
  currentPage: NavigationLevel;
  setCurrentPage: (page: NavigationLevel) => void;
  l1SubView: L1SubView;
  setL1SubView: (view: L1SubView) => void;
  l1ManageOpen: boolean;
  setL1ManageOpen: (open: boolean) => void;
  l2SubView: L2SubView;
  setL2SubView: (view: L2SubView) => void;
  selectedCouncilId: string | null;
  setSelectedCouncilId: (id: string | null) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  selectedGoalType: "enrollment" | "personal" | "professional";
  setSelectedGoalType: (type: "enrollment" | "personal" | "professional") => void;
  activeL3Tab: L3Tab;
  setActiveL3Tab: (tab: L3Tab) => void;
  user: JWTPayload;
}

const NavigationContext = createContext<NavigationContextType>(null!);
export const useNavigation = () => useContext(NavigationContext);

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: JWTPayload;
}) {
  const isHC = user.role === "head_coach" || user.canViewAllCouncils;
  const defaultPage: NavigationLevel =
    isHC ? "L1" : user.role === "coach" ? "L2" : "L3";

  const [currentPage, setCurrentPage] = useState<NavigationLevel>(defaultPage);
  const [l1SubView, setL1SubView] = useState<L1SubView>("overview");
  const [l1ManageOpen, setL1ManageOpen] = useState(false);
  const [l2SubView, setL2SubView] = useState<L2SubView>("overview");
  const [selectedCouncilId, setSelectedCouncilId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedGoalType, setSelectedGoalType] = useState<
    "enrollment" | "personal" | "professional"
  >("enrollment");
  const [activeL3Tab, setActiveL3Tab] = useState<L3Tab>("goals");

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        l1SubView,
        setL1SubView,
        l1ManageOpen,
        setL1ManageOpen,
        l2SubView,
        setL2SubView,
        selectedCouncilId,
        setSelectedCouncilId,
        selectedStudentId,
        setSelectedStudentId,
        selectedGoalType,
        setSelectedGoalType,
        activeL3Tab,
        setActiveL3Tab,
        user,
      }}
    >
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </NavigationContext.Provider>
  );
}
