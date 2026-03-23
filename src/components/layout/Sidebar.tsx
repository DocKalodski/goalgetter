"use client";

import { useNavigation, type NavigationLevel } from "./DashboardShell";
import type { JWTPayload } from "@/lib/auth/jwt";
import { User, X, Settings } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  user: JWTPayload;
}

export function Sidebar({ open, onClose, user }: SidebarProps) {
  const { currentPage, setCurrentPage, l1SubView, setL1SubView, setL2SubView, setSelectedCouncilId, setSelectedStudentId } = useNavigation();

  const navItems: {
    level: NavigationLevel;
    label: string;
    icon: typeof LayoutDashboard;
    roles: string[];
    tag?: string;
    subView?: string;
  }[] = [
    {
      level: "L3",
      label: "Student Goals",
      icon: User,
      roles: ["council_leader", "student"],
      tag: "L3",
    },
    {
      level: "profile",
      label: "My Profile",
      icon: Settings,
      roles: ["council_leader", "student"],
    },
  ];

  const accessibleItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GoalGetter
            </h1>
            <p className="text-xs text-muted-foreground">by Doc Kalodski</p>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-md hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {accessibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.subView
              ? currentPage === "L1" && l1SubView === item.subView
              : currentPage === item.level && !item.subView;
            return (
              <button
                key={item.subView || item.level}
                onClick={() => {
                  setCurrentPage(item.level);
                  if (item.subView) {
                    setL1SubView(item.subView as "data-sync");
                  } else {
                    if (item.level === "L1") setL1SubView("overview");
                    if (item.level === "L2") {
                      setL2SubView("overview");
                      setSelectedStudentId(null);
                      // keep selectedCouncilId so L2 stays in the council's student list
                    }
                    if (item.level === "L3") {
                      setSelectedStudentId(null);
                    }
                  }
                  onClose();
                }}
                className={`flex items-center w-full gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.tag && (
                  <span className="ml-auto text-xs opacity-70">{item.tag}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
