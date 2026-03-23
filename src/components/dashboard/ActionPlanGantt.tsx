"use client";
import { useState } from "react";

interface MilestoneData {
  id: string;
  weekNumber: number;
  weekStartDate: string | null;
  weekEndDate: string | null;
  milestoneDescription: string | null;
  actions: string | null;
  results: string | null;
  cumulativePercentage: number;
}

interface GoalData {
  id: string;
  goalType: string;
  goalStatement: string;
  milestones: MilestoneData[];
}

interface ActionPlanGanttProps {
  goals: GoalData[];
  currentWeek: number;
  totalWeeks: number;
  batchStartDate: string;
}

interface SelectedMilestone {
  goal: GoalData;
  milestone: MilestoneData;
}

const GOAL_COLORS = {
  enrollment: {
    bg: "bg-blue-500",
    fill: "#3b82f6",
    track: "#dbeafe",
    border: "border-blue-300",
    text: "text-blue-700",
    light: "bg-blue-50",
    pill: "bg-blue-100 text-blue-700 border-blue-300",
    dot: "bg-blue-500",
  },
  personal: {
    bg: "bg-yellow-400",
    fill: "#facc15",
    track: "#fef9c3",
    border: "border-yellow-300",
    text: "text-yellow-700",
    light: "bg-yellow-50",
    pill: "bg-yellow-100 text-yellow-700 border-yellow-300",
    dot: "bg-yellow-400",
  },
  professional: {
    bg: "bg-purple-500",
    fill: "#a855f7",
    track: "#f3e8ff",
    border: "border-purple-300",
    text: "text-purple-700",
    light: "bg-purple-50",
    pill: "bg-purple-100 text-purple-700 border-purple-300",
    dot: "bg-purple-500",
  },
} as const;

const GOAL_LABELS: Record<string, string> = {
  enrollment: "Enrollment",
  personal: "Personal",
  professional: "Professional",
};

const GOAL_ORDER = ["enrollment", "personal", "professional"];

const CELL_W = 90; // px per week column
const ROW_H = 56;  // px per goal row
const LABEL_W = 130; // px for left label column

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return "";
  const fmt = (d: string) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  if (!end) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

export function ActionPlanGantt({ goals, currentWeek, totalWeeks, batchStartDate }: ActionPlanGanttProps) {
  const [selected, setSelected] = useState<SelectedMilestone | null>(null);
  void batchStartDate; // available for future use

  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  // One row per goal type (first goal of that type)
  const goalsByType: Record<string, GoalData> = {};
  for (const goal of goals) {
    const type = goal.goalType.toLowerCase();
    if (!goalsByType[type]) goalsByType[type] = goal;
  }

  const orderedGoalTypes = GOAL_ORDER.filter((t) => goalsByType[t]);

  function handleCellClick(goal: GoalData, milestone: MilestoneData) {
    setSelected(selected?.milestone.id === milestone.id ? null : { goal, milestone });
  }

  if (orderedGoalTypes.length === 0) return null;

  return (
    <div className="w-full bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-base font-semibold flex items-center gap-2">
          <span>📅</span>
          <span>Milestone Gantt — {totalWeeks}-Week Timeline</span>
        </span>
        {selected && (
          <button
            onClick={() => setSelected(null)}
            className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors"
          >
            Close detail
          </button>
        )}
      </div>

      {/* Scrollable chart */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${LABEL_W + totalWeeks * CELL_W}px` }}>

          {/* Week-number header row */}
          <div className="flex border-b border-border bg-muted/30">
            <div
              className="shrink-0 flex items-end px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              style={{ width: LABEL_W, minWidth: LABEL_W }}
            >
              Goal
            </div>
            {weeks.map((week) => (
              <div
                key={week}
                className={`shrink-0 flex flex-col items-center justify-end py-2 border-l border-border text-xs font-medium relative ${
                  week === currentWeek
                    ? "bg-orange-50/70 text-orange-600 font-bold"
                    : "text-muted-foreground"
                }`}
                style={{ width: CELL_W, minWidth: CELL_W }}
              >
                {week === currentWeek && (
                  <span className="absolute top-1 text-[9px] text-orange-500 font-bold tracking-wider">NOW</span>
                )}
                <span>W{week}</span>
              </div>
            ))}
          </div>

          {/* One row per goal type */}
          {orderedGoalTypes.map((goalType) => {
            const goal = goalsByType[goalType];
            const colors = GOAL_COLORS[goalType as keyof typeof GOAL_COLORS] ?? GOAL_COLORS.enrollment;

            return (
              <div
                key={goalType}
                className="flex border-b border-border last:border-b-0"
                style={{ minHeight: ROW_H }}
              >
                {/* Goal label */}
                <div
                  className="shrink-0 flex items-center px-3"
                  style={{ width: LABEL_W, minWidth: LABEL_W }}
                >
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${colors.pill}`}>
                    {GOAL_LABELS[goalType] ?? goalType}
                  </span>
                </div>

                {/* Week cells */}
                {weeks.map((week) => {
                  const milestone = goal.milestones.find((m) => m.weekNumber === week) ?? null;
                  const isSelected = selected?.milestone.id === milestone?.id;
                  const isCurrentWeek = week === currentWeek;

                  return (
                    <div
                      key={week}
                      className={`shrink-0 border-l border-border flex items-center px-1 relative ${
                        isCurrentWeek ? "bg-orange-50/30" : ""
                      }`}
                      style={{ width: CELL_W, minWidth: CELL_W, height: ROW_H }}
                    >
                      {/* Current-week vertical line */}
                      {isCurrentWeek && (
                        <div className="absolute inset-y-0 left-0 w-0.5 bg-orange-400 opacity-60 z-10 pointer-events-none" />
                      )}

                      {milestone ? (
                        <button
                          onClick={() => handleCellClick(goal, milestone)}
                          title={milestone.milestoneDescription ?? `Week ${week} — ${milestone.cumulativePercentage}%`}
                          className={`relative w-full rounded-md overflow-hidden flex flex-col justify-center cursor-pointer transition-all ${
                            isSelected ? "ring-2 ring-offset-1 ring-gray-700" : "hover:brightness-95"
                          }`}
                          style={{ height: 40 }}
                        >
                          {/* Track (background) */}
                          <div
                            className="absolute inset-0 rounded-md"
                            style={{ backgroundColor: colors.track }}
                          />
                          {/* Progress fill */}
                          <div
                            className="absolute inset-y-0 left-0 rounded-l-md transition-all"
                            style={{
                              width: `${milestone.cumulativePercentage}%`,
                              backgroundColor: colors.fill,
                              opacity: 0.75,
                            }}
                          />
                          {/* Milestone label */}
                          <span className="relative z-10 text-xs font-semibold text-gray-800 px-1.5 leading-tight line-clamp-2 text-center w-full">
                            {milestone.milestoneDescription
                              ? milestone.milestoneDescription.length > 22
                                ? milestone.milestoneDescription.slice(0, 20) + "…"
                                : milestone.milestoneDescription
                              : `${milestone.cumulativePercentage}%`}
                          </span>
                        </button>
                      ) : (
                        <div
                          className="w-full rounded-md"
                          style={{ height: 40, backgroundColor: "#f3f4f6", opacity: 0.5 }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel — appears below chart when a milestone is selected */}
      {selected && (() => {
        const colors = GOAL_COLORS[selected.goal.goalType.toLowerCase() as keyof typeof GOAL_COLORS] ?? GOAL_COLORS.enrollment;
        return (
          <div className={`border-t border-border p-4 ${colors.light}`}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <span>{GOAL_LABELS[selected.goal.goalType.toLowerCase()] ?? selected.goal.goalType}</span>
                  <span className="text-muted-foreground font-normal">·</span>
                  <span>Week {selected.milestone.weekNumber}</span>
                  {selected.milestone.weekStartDate && (
                    <span className="text-muted-foreground font-normal text-xs">
                      ({formatDateRange(selected.milestone.weekStartDate, selected.milestone.weekEndDate)})
                    </span>
                  )}
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${colors.pill}`}>
                    {selected.milestone.cumulativePercentage}% cumulative
                  </span>
                </h4>
                {selected.milestone.milestoneDescription && (
                  <p className="text-sm mt-1.5 font-medium">{selected.milestone.milestoneDescription}</p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none shrink-0"
              >
                ×
              </button>
            </div>

            {selected.milestone.actions && (
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Action Steps
                </p>
                <ul className="space-y-1">
                  {selected.milestone.actions
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span
                          className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center text-xs font-semibold ${colors.border} ${colors.light}`}
                        >
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {selected.milestone.results && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Results
                </p>
                <p className="text-sm">{selected.milestone.results}</p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
