"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { logout } from "@/lib/actions/auth";
import { getPendingApprovalsCount } from "@/lib/actions/approvals";
import type { JWTPayload } from "@/lib/auth/jwt";
import { Moon, Sun, LogOut, UserCircle, Sparkles, Bell, ALargeSmall } from "lucide-react";
import { useNavigation } from "./DashboardShell";

interface HeaderProps {
  user: JWTPayload;
}


export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { setCurrentPage, setL2SubView } = useNavigation();
  const [pendingCount, setPendingCount] = useState(0);
  const FONT_SIZES = ["100%", "112.5%", "125%"];
  const FONT_LABELS = ["Normal", "Large", "X-Large"];
  const [fontIdx, setFontIdx] = useState(0);

  function cycleFontSize() {
    const next = (fontIdx + 1) % FONT_SIZES.length;
    setFontIdx(next);
    document.documentElement.style.fontSize = FONT_SIZES[next];
  }

  const isCoach = user.role === "coach" || user.role === "head_coach";
  const isL3User = ["council_leader", "student", "facilitator"].includes(user.role);

  const roleLabels: Record<string, string> = {
    head_coach: "Head Coach View",
    admin: "Head Coach View",
    coach: "Coach View",
    council_leader: "Council Leader View",
    student: "Student View",
    facilitator: "Facilitator View",
    developer: "Developer View",
  };

  // Poll pending approvals count every 30s for coaches
  useEffect(() => {
    if (!isCoach) return;
    const load = () => getPendingApprovalsCount().then(setPendingCount).catch(() => {});
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [isCoach]);

  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-foreground">GoalGetter-LEAP 99 v3.25</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">by Doc Kalodski · {roleLabels[user.role] || user.role}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Pending approvals bell — coaches only */}
        {isCoach && (
          <div className="relative">
            <button
              type="button"
              onClick={() => { setCurrentPage("L2"); setL2SubView("approvals"); }}
              className="p-2 rounded-md hover:bg-muted"
              title={pendingCount > 0 ? `${pendingCount} pending approval${pendingCount !== 1 ? "s" : ""}` : "No pending approvals"}
              aria-label={`Pending approvals: ${pendingCount}`}
            >
              <Bell className={`h-5 w-5 ${pendingCount > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
            </button>
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center leading-none pointer-events-none">
                {pendingCount > 99 ? "99+" : pendingCount}
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setCurrentPage("essence-qualities")}
          className="p-2 rounded-md hover:bg-muted"
          title="Essence Qualities"
          aria-label="Essence Qualities"
        >
          <Sparkles className="h-5 w-5 text-muted-foreground" />
        </button>

        {isL3User && (
          <button
            type="button"
            onClick={() => setCurrentPage("profile")}
            className="p-2 rounded-md hover:bg-muted"
            title="My Profile"
            aria-label="My Profile"
          >
            <UserCircle className="h-5 w-5 text-muted-foreground" />
          </button>
        )}

        <button
          type="button"
          onClick={cycleFontSize}
          className={`p-2 rounded-md hover:bg-muted ${fontIdx > 0 ? "text-primary" : "text-muted-foreground"}`}
          title={`Font size: ${FONT_LABELS[fontIdx]} — click to increase`}
          aria-label="Cycle font size"
        >
          <ALargeSmall className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md hover:bg-muted"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 text-muted-foreground dark:hidden" />
          <Moon className="h-5 w-5 text-muted-foreground hidden dark:block" />
        </button>

        <form action={logout}>
          <button
            type="submit"
            className="p-2 rounded-md hover:bg-muted"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </button>
        </form>
      </div>
    </header>
  );
}
