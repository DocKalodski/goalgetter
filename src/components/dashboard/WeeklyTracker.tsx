"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { updateMilestone } from "@/lib/actions/milestones";
import { useNavigation } from "@/components/layout/DashboardShell";
import { ApprovalBadge } from "./ApprovalBadge";

interface CheckItem {
  text: string;
  done: boolean;
  days?: number[];
}

interface MilestoneData {
  id: string;
  weekNumber: number;
  weekStartDate?: string | null;
  weekEndDate?: string | null;
  milestoneDescription: string | null;
  actions: string | null;
  results: string | null;
  cumulativePercentage: number;
  supportNeeded?: string | null;
  approvalStatus?: string;
  approvedBy?: string | null;
}

// Returns the target label for a given week number (1-12)
function getWeekTarget(weekNumber: number): string {
  if (weekNumber === 1) return "Action Plan";
  if (weekNumber >= 2 && weekNumber <= 10) {
    const min = (weekNumber - 1) * 10;
    const max = weekNumber * 10;
    return `${min}–${max}%`;
  }
  if (weekNumber === 11) return "100%";
  if (weekNumber === 12) return "Enjoy";
  // Beyond 12 weeks: continue pattern
  return `${Math.min((weekNumber - 1) * 10, 100)}–100%`;
}

// Format a YYYY-MM-DD string as "Mon Feb 2"
function formatDate(dateStr: string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // Parse as local date to avoid timezone shifts
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${days[date.getDay()]} ${months[date.getMonth()]} ${d}`;
}

// Returns "Mon Feb 2 – Sun Feb 8" for the given week
function getWeekDates(
  weekNumber: number,
  weekStartDate?: string | null,
  weekEndDate?: string | null,
  batchStartDate?: string
): string {
  if (weekStartDate && weekEndDate) {
    return `${formatDate(weekStartDate)} – ${formatDate(weekEndDate)}`;
  }
  // Compute from batch start date
  const base = batchStartDate || "2026-02-02";
  const [y, m, d] = base.split("-").map(Number);
  const batchStart = new Date(y, m - 1, d);
  const weekStart = new Date(batchStart);
  weekStart.setDate(batchStart.getDate() + (weekNumber - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const pad = (n: number) => String(n).padStart(2, "0");
  const toStr = (dt: Date) =>
    `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;

  return `${formatDate(toStr(weekStart))} – ${formatDate(toStr(weekEnd))}`;
}

const GOAL_TABS = [
  { key: "enrollment",    label: "Enrollment",    bar: "bg-blue-500",   text: "text-blue-500",   border: "border-blue-500",   dot: "bg-blue-500" },
  { key: "personal",     label: "Personal",      bar: "bg-yellow-400", text: "text-yellow-500", border: "border-yellow-500", dot: "bg-yellow-400" },
  { key: "professional", label: "Professional",  bar: "bg-purple-500", text: "text-purple-500", border: "border-purple-500", dot: "bg-purple-500" },
] as const;

export function WeeklyTracker({
  goalId,
  milestones,
  studentId,
  currentWeek,
  batchStartDate,
  allGoals,
  activeTab: controlledTab,
  onTabChange,
}: {
  goalId: string;
  milestones: MilestoneData[];
  studentId: string;
  currentWeek?: number;
  batchStartDate?: string;
  allGoals?: {
    enrollment: { id: string; milestones: MilestoneData[] };
    personal:   { id: string; milestones: MilestoneData[] };
    professional: { id: string; milestones: MilestoneData[] };
  };
  activeTab?: "enrollment" | "personal" | "professional";
  onTabChange?: (tab: "enrollment" | "personal" | "professional") => void;
}) {
  const { user } = useNavigation();
  const [internalTab, setInternalTab] = useState<"enrollment" | "personal" | "professional">("enrollment");
  const activeTab = controlledTab ?? internalTab;
  function handleTabChange(tab: "enrollment" | "personal" | "professional") {
    setInternalTab(tab);
    onTabChange?.(tab);
  }
  const [expandedWeek, setExpandedWeek] = useState<number | null>(currentWeek ?? null);

  // Resolve active goalId + milestones (tabs vs single-pass)
  const activeGoalId = allGoals ? allGoals[activeTab].id : goalId;
  const activeMilestones = allGoals ? allGoals[activeTab].milestones : milestones;
  const activeTabMeta = GOAL_TABS.find((t) => t.key === activeTab)!;
  const [refreshKey, setRefreshKey] = useState(0);
  // Local edit state: keyed by weekNumber
  const [editValues, setEditValues] = useState<Record<number, { description: string; percentage: string }>>({});
  const [supportDrafts, setSupportDrafts] = useState<Record<number, string>>({});
  const [editingActionIdx, setEditingActionIdx] = useState<Record<number, number | null>>({});
  // Optimistic day assignments: key = `${weekNumber}-${actionIndex}`
  const [optimisticDays, setOptimisticDays] = useState<Record<string, number[]>>({});

  const canApprove =
    (user.role === "coach" || user.role === "head_coach") &&
    studentId !== user.userId;

  // TODO: canEditMeta — for now includes head_coach, coach, and student (owner).
  // FUTURE CHANGE: restrict to coach and student only (head_coach = view only).
  const canEditMeta =
    user.role === "coach" ||
    user.role === "head_coach" ||
    studentId === user.userId;

  const totalWeeks = 12;

  // First pass: build raw week data
  const rawWeeks = Array.from({ length: totalWeeks }, (_, i) => {
    const week = i + 1;
    const milestone = activeMilestones.find((m) => m.weekNumber === week);
    const actions: CheckItem[] = milestone?.actions ? (() => { try { return JSON.parse(milestone.actions!); } catch { return []; } })() : [];
    const results: CheckItem[] = milestone?.results ? (() => { try { return JSON.parse(milestone.results!); } catch { return []; } })() : [];
    const nonEmptyActions = actions.filter((a) => a.text && a.text.trim() !== "");
    // Action Steps % — completion of this week's action items
    const actionProgress = nonEmptyActions.length > 0
      ? Math.round(nonEmptyActions.filter((a) => a.done).length / nonEmptyActions.length * 100)
      : 0;
    // Week fully done = all non-empty actions checked (used for cumulative fallback)
    const weekDone = nonEmptyActions.length > 0 && nonEmptyActions.every((a) => a.done);

    return {
      weekNumber: week,
      id: milestone?.id || null,
      description: milestone?.milestoneDescription || "",
      actions,
      results,
      cumulativePercentage: milestone?.cumulativePercentage || 0,
      actionProgress,
      weekDone,
      supportNeeded: milestone?.supportNeeded || "",
      approvalStatus: milestone?.approvalStatus || "pending",
      hasContent: !!milestone?.milestoneDescription || actions.length > 0 || results.length > 0,
      weekStartDate: milestone?.weekStartDate || null,
      weekEndDate: milestone?.weekEndDate || null,
    };
  });

  // Second pass: compute cumulative Milestones bar for each week
  // Primary: cumulativePercentage from DB (Excel sync)
  // Fallback: cumulative completed action-step weeks / totalWeeks × 100
  const weeks = rawWeeks.map((w, idx) => {
    let milestoneProgress: number;
    if (w.cumulativePercentage > 0) {
      milestoneProgress = w.cumulativePercentage;
    } else {
      const completedSoFar = rawWeeks.slice(0, idx + 1).filter((wk) => wk.weekDone).length;
      milestoneProgress = Math.round((completedSoFar / totalWeeks) * 100);
    }
    return { ...w, milestoneProgress };
  });

  async function handleToggle(
    milestoneId: string | null,
    weekNumber: number,
    type: "actions" | "results",
    index: number,
    currentItems: CheckItem[]
  ) {
    const updated = currentItems.map((item, i) =>
      i === index ? { ...item, done: !item.done } : item
    );
    try {
      await updateMilestone(activeGoalId, weekNumber, {
        [type]: JSON.stringify(updated),
      });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Failed to update:", error);
    }
  }

  function getEditValue(weekNumber: number, field: "description" | "percentage", fallback: string) {
    const ev = editValues[weekNumber];
    if (ev && field in ev) return ev[field];
    return fallback;
  }

  function setEditField(weekNumber: number, field: "description" | "percentage", value: string) {
    setEditValues((prev) => ({
      ...prev,
      [weekNumber]: { ...prev[weekNumber], [field]: value },
    }));
  }

  async function handleSaveMeta(weekNumber: number, description: string, percentageStr: string) {
    const percentage = Math.max(0, Math.min(100, parseInt(percentageStr, 10) || 0));
    try {
      await updateMilestone(activeGoalId, weekNumber, {
        milestoneDescription: description,
        cumulativePercentage: percentage,
      });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Failed to save milestone meta:", error);
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden" key={`${refreshKey}-${activeTab}`}>
      <div className="p-4 border-b border-border space-y-3">
        <h3 className="text-lg font-bold">12-Week Progress Tracker</h3>

        {/* Goal tabs — only shown when allGoals provided */}
        {allGoals && (
          <div className="flex gap-1 border-b border-border -mx-4 px-4 pb-0">
            {GOAL_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { handleTabChange(tab.key); setExpandedWeek(currentWeek ?? null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                  activeTab === tab.key
                    ? `${tab.text} ${tab.border}`
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${tab.dot} shrink-0`} />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${activeTabMeta.bar} inline-block`} />
            Milestones/Results — cumulative goal %
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            Action Steps — weekly tasks done
          </span>
        </div>
      </div>
      <div className="divide-y divide-border">
        {weeks.map((week) => {
          const isCurrent = currentWeek !== undefined && week.weekNumber === currentWeek;
          const target = getWeekTarget(week.weekNumber);
          const dateRange = getWeekDates(week.weekNumber, week.weekStartDate, week.weekEndDate, batchStartDate);
          const descVal = getEditValue(week.weekNumber, "description", week.description);
          const pctVal = getEditValue(week.weekNumber, "percentage", String(week.cumulativePercentage));
          return (
          <div key={week.weekNumber} className={isCurrent ? "border-l-2 border-primary bg-primary/5" : ""}>
            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                setExpandedWeek(
                  expandedWeek === week.weekNumber ? null : week.weekNumber
                )
              }
              onKeyDown={(e) => e.key === "Enter" && setExpandedWeek(expandedWeek === week.weekNumber ? null : week.weekNumber)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="shrink-0">
                  <span className={`text-xl font-bold ${isCurrent ? "text-primary" : ""}`}>
                    Week {week.weekNumber}
                  </span>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                    {dateRange}
                  </p>
                </div>
                {isCurrent && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                    Current
                  </span>
                )}
                <span className="text-sm text-muted-foreground truncate max-w-[160px]">
                  {week.description || "No description"}
                </span>
                {canEditMeta && (
                  <Pencil className="h-5 w-5 text-muted-foreground shrink-0 ml-1" />
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {/* Approval badge for milestones with content */}
                {week.hasContent && week.id && (
                  <ApprovalBadge
                    status={week.approvalStatus}
                    type="milestone"
                    id={week.id}
                    canApprove={canApprove}
                    onStatusChange={() => setRefreshKey((k) => k + 1)}
                  />
                )}
                <div className="space-y-2 min-w-[180px]">
                  {/* Milestones/Results bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Milestones/Results <span className="opacity-60">· {target}</span></span>
                    <span className="text-4xl font-black">{week.milestoneProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-5">
                    <div
                      className={`${activeTabMeta.bar} h-5 rounded-full transition-all`}
                      style={{ width: `${week.milestoneProgress}%` }}
                    />
                  </div>
                  {/* Action Steps bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Action Steps</span>
                    <span className="text-3xl font-bold text-emerald-500">{week.actionProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-5">
                    <div
                      className="bg-emerald-500 h-5 rounded-full transition-all"
                      style={{ width: `${week.actionProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {expandedWeek === week.weekNumber && (
              <div className="px-4 pb-4 space-y-4 bg-muted/10">
                {/* Milestone description + cumulative % — editable for coach/HC/student */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                      Milestone Description
                    </p>
                    {canEditMeta ? (
                      <input
                        type="text"
                        value={descVal}
                        placeholder="Enter milestone description…"
                        onChange={(e) => setEditField(week.weekNumber, "description", e.target.value)}
                        onBlur={() => handleSaveMeta(week.weekNumber, descVal, pctVal)}
                        className="w-full text-sm bg-background border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    ) : (
                      <p className="text-sm">{week.description || <span className="text-muted-foreground italic">No description</span>}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Cumulative %
                    </p>
                    {canEditMeta ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={pctVal}
                        onChange={(e) => setEditField(week.weekNumber, "percentage", e.target.value)}
                        onBlur={() => handleSaveMeta(week.weekNumber, descVal, pctVal)}
                        className="w-20 text-sm bg-background border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-center"
                      />
                    ) : (
                      <span className="text-sm font-medium">{week.cumulativePercentage}%</span>
                    )}
                  </div>
                </div>

                {/* Action Steps */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Action Steps</p>
                  {week.actions.filter(a => a.text?.trim()).length > 0 ? (
                    <div className="space-y-2">
                      {week.actions.map((action, i) => {
                        if (!action.text?.trim()) return null;
                        const ALL_DAYS = ["M","T","W","Th","F","Sa","Su"];
                        const dayKey = `${week.weekNumber}-${i}`;
                        const assignedDays = optimisticDays[dayKey] ?? action.days ?? [];
                        const isWeekdays = assignedDays.length === 5 && [0,1,2,3,4].every(d => assignedDays.includes(d));
                        const isDaily    = assignedDays.length === 7;
                        const noDays     = action.text?.trim() !== "" && assignedDays.length === 0;
                        return (
                        <div key={i} className={`space-y-1 rounded-lg p-1.5 -mx-1.5 ${noDays ? "bg-amber-500/5 border border-amber-400/20" : ""}`}>
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={action.done}
                              onChange={() => handleToggle(week.id, week.weekNumber, "actions", i, week.actions)}
                              className="rounded border-border mt-0.5 shrink-0"
                            />
                            {canEditMeta && editingActionIdx[week.weekNumber] === i ? (
                              <input
                                type="text"
                                defaultValue={action.text}
                                autoFocus
                                onBlur={async (e) => {
                                  const newText = e.target.value.trim();
                                  const updated = week.actions.map((a, idx) => idx === i ? { ...a, text: newText } : a);
                                  setEditingActionIdx(prev => ({ ...prev, [week.weekNumber]: null }));
                                  if (newText !== action.text) {
                                    await updateMilestone(goalId, week.weekNumber, { actions: JSON.stringify(updated) });
                                    setRefreshKey(k => k + 1);
                                  }
                                }}
                                className="flex-1 text-sm bg-background border border-primary rounded px-2 py-0.5 focus:outline-none"
                              />
                            ) : (
                              <span
                                className={`flex-1 text-sm ${action.done ? "line-through text-muted-foreground" : ""} ${canEditMeta ? "cursor-pointer hover:text-primary" : ""}`}
                                onClick={() => canEditMeta && setEditingActionIdx(prev => ({ ...prev, [week.weekNumber]: i }))}
                              >
                                {action.text}
                              </span>
                            )}
                          </div>
                          {/* Day pills */}
                          <div className="flex items-center gap-1 pl-5 flex-wrap">
                            {ALL_DAYS.map((label, d) => {
                              const active = assignedDays.includes(d);
                              return (
                                <button
                                  key={d}
                                  type="button"
                                  disabled={!canEditMeta}
                                  onClick={async () => {
                                    if (!canEditMeta) return;
                                    const next = active
                                      ? assignedDays.filter(x => x !== d)
                                      : [...assignedDays, d].sort((a, b) => a - b);
                                    setOptimisticDays(prev => ({ ...prev, [dayKey]: next }));
                                    const updated = week.actions.map((a, idx) => idx === i ? { ...a, days: next } : a);
                                    await updateMilestone(activeGoalId, week.weekNumber, { actions: JSON.stringify(updated) });
                                    setRefreshKey(k => k + 1);
                                  }}
                                  className={`w-7 h-7 text-[10px] font-bold rounded-lg border transition-all select-none ${
                                    active
                                      ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                                      : canEditMeta
                                      ? "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary/10 cursor-pointer"
                                      : "bg-muted/30 text-muted-foreground/40 border-transparent cursor-default"
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                            {canEditMeta && (
                              <>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const next = isWeekdays && !isDaily ? [] : [0,1,2,3,4];
                                    setOptimisticDays(prev => ({ ...prev, [dayKey]: next }));
                                    const updated = week.actions.map((a, idx) => idx === i ? { ...a, days: next } : a);
                                    await updateMilestone(activeGoalId, week.weekNumber, { actions: JSON.stringify(updated) });
                                    setRefreshKey(k => k + 1);
                                  }}
                                  className={`ml-1 text-[9px] px-1.5 py-0.5 rounded font-semibold transition-colors ${isWeekdays && !isDaily ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                                >
                                  {isWeekdays && !isDaily ? "✓ Wkdays" : "Wkdays"}
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const next = isDaily ? [] : [0,1,2,3,4,5,6];
                                    setOptimisticDays(prev => ({ ...prev, [dayKey]: next }));
                                    const updated = week.actions.map((a, idx) => idx === i ? { ...a, days: next } : a);
                                    await updateMilestone(activeGoalId, week.weekNumber, { actions: JSON.stringify(updated) });
                                    setRefreshKey(k => k + 1);
                                  }}
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-semibold transition-colors ${isDaily ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                                >
                                  {isDaily ? "✓ Daily" : "Daily"}
                                </button>
                              </>
                            )}
                            {!canEditMeta && assignedDays.length > 0 && (
                              <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                {isDaily ? "Daily" : isWeekdays ? "Weekdays" : assignedDays.map(d => ALL_DAYS[d]).join(" ")}
                              </span>
                            )}
                            {noDays && canEditMeta && (
                              <span className="text-[10px] text-amber-500 font-semibold ml-1">📅 When?</span>
                            )}
                            {!noDays && assignedDays.length > 0 && (
                              <span className="text-[9px] text-muted-foreground">{assignedDays.length}×/wk</span>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No actions yet</p>
                  )}
                  {canEditMeta && (
                    <button
                      onClick={async () => {
                        const updated = [...week.actions, { text: "New action step", done: false }];
                        await updateMilestone(goalId, week.weekNumber, { actions: JSON.stringify(updated) });
                        setRefreshKey(k => k + 1);
                        setEditingActionIdx(prev => ({ ...prev, [week.weekNumber]: updated.length - 1 }));
                      }}
                      className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      + Add action step
                    </button>
                  )}
                </div>

                {/* Results */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Milestones/Results</p>
                  {week.results.length > 0 ? (
                    <div className="space-y-1.5">
                      {week.results.map((result, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={result.done}
                            onChange={() => handleToggle(week.id, week.weekNumber, "results", i, week.results)}
                            className="rounded border-border"
                          />
                          <span className={result.done ? "line-through text-muted-foreground" : ""}>{result.text}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No results yet</p>
                  )}
                </div>

                {/* Support Needed — HC + coach editable */}
                {canEditMeta && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Support Needed</p>
                    <textarea
                      rows={2}
                      value={supportDrafts[week.weekNumber] ?? week.supportNeeded}
                      onChange={(e) => setSupportDrafts(prev => ({ ...prev, [week.weekNumber]: e.target.value }))}
                      onBlur={async (e) => {
                        const val = e.target.value;
                        if (val !== week.supportNeeded) {
                          await updateMilestone(goalId, week.weekNumber, { supportNeeded: val });
                          setRefreshKey(k => k + 1);
                        }
                      }}
                      placeholder="Note any support or resources needed this week…"
                      className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
                {!canEditMeta && week.supportNeeded && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Support Needed</p>
                    <p className="text-sm">{week.supportNeeded}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}
