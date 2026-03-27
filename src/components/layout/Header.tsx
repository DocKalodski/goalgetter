"use client";

import { useTheme } from "next-themes";
import { logout } from "@/lib/actions/auth";
import type { JWTPayload } from "@/lib/auth/jwt";
import { Moon, Sun, LogOut, UserCircle } from "lucide-react";
import { useNavigation } from "./DashboardShell";

interface HeaderProps {
  user: JWTPayload;
}

export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { setCurrentPage } = useNavigation();

  const roleLabels: Record<string, string> = {
    head_coach: "Head Coach View",
    coach: "Coach View",
    council_leader: "Council Leader View",
    student: "Student View",
    facilitator: "Facilitator View",
    developer: "Developer View",
  };

  const isL3User = ["council_leader", "student", "facilitator"].includes(user.role);

  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-foreground">GoalGetter for LEAP 99</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">by Doc Kalodski · {roleLabels[user.role] || user.role}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isL3User && (
          <button
            onClick={() => setCurrentPage("profile")}
            className="p-2 rounded-md hover:bg-muted"
            title="My Profile"
          >
            <UserCircle className="h-5 w-5 text-muted-foreground" />
          </button>
        )}

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md hover:bg-muted"
        >
          <Sun className="h-5 w-5 text-muted-foreground dark:hidden" />
          <Moon className="h-5 w-5 text-muted-foreground hidden dark:block" />
        </button>

        <form action={logout}>
          <button
            type="submit"
            className="p-2 rounded-md hover:bg-muted"
            title="Sign out"
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </button>
        </form>
      </div>
    </header>
  );
}
