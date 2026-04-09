"use client";

import { useState } from "react";
import { Bell, Loader2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { sendMilestoneReminder } from "@/lib/actions/notifications";

interface MilestoneData {
  id: string;
  weekNumber: number;
  weekStartDate?: string | null;
  weekEndDate?: string | null;
  milestoneDescription: string | null;
  actions: string | null;
  results: string | null;
  cumulativePercentage: number;
  approvalStatus?: string;
}

interface GoalCalendarProps {
  milestones: MilestoneData[];
  currentWeek?: number;
  studentId: string;
  goalType: string;
  canRemind?: boolean;
  batchStartDate?: string;
  // Optional: pass all 3 goals so we can tab between them inside the calendar
  allGoals?: {
    enrollment: MilestoneData[];
    personal: MilestoneData[];
    professional: MilestoneData[];
  };
  defaultExpanded?: boolean;
  activeTab?: "enrollment" | "personal" | "professional";
  onTabChange?: (tab: "enrollment" | "personal" | "professional") => void;
  totalWeeks?: number;
}

// Format a YYYY-MM-DD string as "Feb 2"
function formatShort(dateStr: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [, m, d] = dateStr.split("-").map(Number);
  return `${months[m - 1]} ${d}`;
}

function getWeekStart(weekNumber: number, batchStartDate?: string): string {
  const base = batchStartDate || "2026-02-02";
  const [y, m, d] = base.split("-").map(Number);
  const batchStart = new Date(y, m - 1, d);
  const weekStart = new Date(batchStart);
  weekStart.setDate(batchStart.getDate() + (weekNumber - 1) * 7);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${weekStart.getFullYear()}-${pad(weekStart.getMonth() + 1)}-${pad(weekStart.getDate())}`;
}

type WeekStatus = "done" | "in-progress" | "current" | "upcoming" | "empty";

function getWeekStatus(
  milestone: MilestoneData | undefined,
  weekNumber: number,
  currentWeek: number
): WeekStatus {
  if (weekNumber < currentWeek) {
    if (!milestone) return "empty";
    const pct = milestone.cumulativePercentage || 0;
    if (pct >= (weekNumber * 10)) return "done";
    return "in-progress";
  }
  if (weekNumber === currentWeek) return "current";
  return "upcoming";
}

const STATUS_STYLES: Record<WeekStatus, { cell: string; label: string; dot: string }> = {
  done: {
    cell: "bg-emerald-500 border-emerald-600 text-white",
    label: "Done",
    dot: "bg-emerald-500",
  },
  "in-progress": {
    cell: "bg-amber-400 border-amber-500 text-white",
    label: "In Progress",
    dot: "bg-amber-400",
  },
  current: {
    cell: "bg-primary border-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
    label: "Current Week",
    dot: "bg-primary",
  },
  upcoming: {
    cell: "bg-muted border-border text-muted-foreground",
    label: "Upcoming",
    dot: "bg-muted-foreground/30",
  },
  empty: {
    cell: "bg-muted/40 border-border text-muted-foreground/60",
    label: "No Data",
    dot: "bg-muted-foreground/20",
  },
};

const GOAL_TABS = [
  { key: "enrollment", label: "Enrollment", color: "text-blue-500 border-blue-500", dot: "bg-blue-500" },
  { key: "personal",   label: "Personal",   color: "text-yellow-500 border-yellow-500", dot: "bg-yellow-400" },
  { key: "professional", label: "Professional", color: "text-purple-500 border-purple-500", dot: "bg-purple-500" },
] as const;

export function GoalCalendar({
  milestones,
  currentWeek = 1,
  studentId,
  goalType,
  canRemind = false,
  batchStartDate,
  allGoals,
  defaultExpanded = false,
  activeTab: controlledTab,
  onTabChange,
  totalWeeks = 8,
}: GoalCalendarProps) {
  const [remindingWeek, setRemindingWeek] = useState<number | null>(null);
  const [sentWeeks, setSentWeeks] = useState<Set<number>>(new Set());
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [internalTab, setInternalTab] = useState<"enrollment" | "personal" | "professional">(
    (goalType as "enrollment" | "personal" | "professional") || "enrollment"
  );
  const activeTab = controlledTab ?? internalTab;
  function handleTabChange(tab: "enrollment" | "personal" | "professional") {
    setInternalTab(tab);
    onTabChange?.(tab);
  }

  // Resolve which milestones to display
  const activeMilestones = allGoals ? (allGoals[activeTab] ?? []) : milestones;
  const activeGoalType = allGoals ? activeTab : goalType;

  // totalWeeks comes from prop (default 8)

  const weeks = Array.from({ length: totalWeeks }, (_, i) => {
    const weekNumber = i + 1;
    const milestone = activeMilestones.find((m) => m.weekNumber === weekNumber);
    const status = getWeekStatus(milestone, weekNumber, currentWeek);
    const weekStartStr = milestone?.weekStartDate || getWeekStart(weekNumber, batchStartDate);
    return { weekNumber, milestone, status, weekStartStr };
  });

  const overallPct = activeMilestones.find((m) => m.weekNumber === Math.min(currentWeek, 12))?.cumulativePercentage ?? 0;
  const barColor = activeTab === "enrollment" ? "bg-blue-500" : activeTab === "personal" ? "bg-yellow-400" : "bg-purple-500";

  async function handleRemind(weekNumber: number, milestoneDescription: string | null | undefined) {
    if (remindingWeek !== null || sentWeeks.has(weekNumber)) return;
    setRemindingWeek(weekNumber);
    try {
      await sendMilestoneReminder({
        studentId,
        weekNumber,
        goalType: activeGoalType,
        milestoneDescription: milestoneDescription ?? null,
      });
      setSentWeeks((prev) => new Set(prev).add(weekNumber));
    } catch {
      // silent
    } finally {
      setRemindingWeek(null);
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] hover:bg-muted/30 transition-colors text-left"
      >
        <div>
          <h3 className="text-base font-bold leading-tight">{totalWeeks}-Week Goal Calendar</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Weekly milestone progress at a glance</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!expanded && (
            <span className="text-xs text-muted-foreground hidden sm:block">click to expand</span>
          )}
          {expanded
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Goal tabs — only shown when allGoals provided */}
          {allGoals && (
            <div className="flex gap-1 border-b border-border pb-0">
              {GOAL_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                    activeTab === tab.key
                      ? tab.color
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${tab.dot} shrink-0`} />
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Done", dot: "bg-emerald-500" },
              { label: "In Progress", dot: "bg-amber-400" },
              { label: "Current Week", dot: "bg-primary" },
              { label: "Upcoming", dot: "bg-muted-foreground/30" },
            ].map(({ label, dot }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className={`w-2.5 h-2.5 rounded-full ${dot} inline-block`} />
                {label}
              </span>
            ))}
          </div>

          {/* Week grid — 6 columns, 2 rows */}
          <div className="grid grid-cols-6 gap-2">
            {weeks.map(({ weekNumber, milestone, status, weekStartStr }) => {
              const styles = STATUS_STYLES[status];
              const isHovered = hoveredWeek === weekNumber;
              const sent = sentWeeks.has(weekNumber);
              const reminding = remindingWeek === weekNumber;
              const pct = milestone?.cumulativePercentage ?? 0;

              return (
                <div
                  key={weekNumber}
                  className="relative"
                  onMouseEnter={() => setHoveredWeek(weekNumber)}
                  onMouseLeave={() => setHoveredWeek(null)}
                >
                  {/* Week cell */}
                  <div
                    className={`rounded-lg border p-2 text-center transition-all cursor-default select-none ${styles.cell}`}
                  >
                    <p className="text-sm font-bold leading-none mb-1">W{weekNumber}</p>
                    <p className="text-xl font-black leading-none">{pct > 0 ? `${pct}%` : "—"}</p>
                    <p className="text-xs font-medium mt-1 opacity-80 leading-tight">{formatShort(weekStartStr)}</p>
                  </div>

                  {/* Remind bell */}
                  {canRemind && weekNumber <= currentWeek && (
                    <button
                      onClick={() => handleRemind(weekNumber, milestone?.milestoneDescription)}
                      disabled={reminding || sent}
                      title={sent ? "Reminder sent" : "Send milestone reminder"}
                      className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm transition-all ${
                        sent
                          ? "bg-emerald-500 text-white"
                          : "bg-background border border-border text-muted-foreground hover:border-primary hover:text-primary"
                      } ${!isHovered && !sent ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
                    >
                      {reminding ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : sent ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Bell className="h-3 w-3" />
                      )}
                    </button>
                  )}

                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-popover border border-border rounded-lg shadow-lg p-2.5 text-xs space-y-1 pointer-events-none">
                      <p className="font-bold text-sm">Week {weekNumber}</p>
                      <p className="text-muted-foreground">{styles.label}</p>
                      {milestone?.milestoneDescription && (
                        <p className="text-foreground leading-snug line-clamp-3">{milestone.milestoneDescription}</p>
                      )}
                      {pct > 0 && (
                        <p className="font-semibold text-primary">{pct}% cumulative</p>
                      )}
                      {canRemind && weekNumber <= currentWeek && !sent && (
                        <p className="text-primary/80 mt-1">Click bell to remind student</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress summary bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
              <span className="text-2xl font-black">{overallPct}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-6">
              <div
                className={`${barColor} h-6 rounded-full transition-all`}
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
