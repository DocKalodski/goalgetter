"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar, ChevronDown, ChevronLeft, ChevronRight,
  AlertTriangle, Check, Clock, X, Pencil, Target,
} from "lucide-react";
import {
  getStudentCalendarData, scheduleActionStep,
  approveActionSchedule, updateActionStepText, updateActionStepDays, analyzeCalendarLoad,
} from "@/lib/actions/calendar";
import type {
  CalendarActionStep, CalendarBatchEvent, CalendarMilestone,
  BatchSchedule, GoalType, CalendarLoadStats,
} from "@/lib/actions/calendar";
import { useNavigation } from "@/components/layout/DashboardShell";

// ─── Styles ───────────────────────────────────────────────────────────────────

const GOAL_COLORS: Record<GoalType, { dot: string; bg: string; text: string; border: string }> = {
  enrollment:   { dot: "bg-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400",   border: "border-blue-300 dark:border-blue-700" },
  personal:     { dot: "bg-yellow-400", bg: "bg-yellow-400/10", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-300 dark:border-yellow-700" },
  professional: { dot: "bg-purple-500", bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-300 dark:border-purple-700" },
};

const BATCH_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  intensive: { bg: "bg-red-500/10",    text: "text-red-600 dark:text-red-400",    border: "border-red-300 dark:border-red-700",    dot: "bg-red-500"    },
  breakfast:  { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-300 dark:border-orange-700", dot: "bg-orange-400" },
  meeting:    { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-300 dark:border-indigo-700", dot: "bg-indigo-500" },
  call:       { bg: "bg-teal-500/10",   text: "text-teal-600 dark:text-teal-400",   border: "border-teal-300 dark:border-teal-700",   dot: "bg-teal-500"   },
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const HEAVY_AMBER = 3;
const HEAVY_RED   = 5;

const DAY_KEY_INDEX: Record<string, number> = {
  mon:0, monday:0, tue:1, tuesday:1, wed:2, wednesday:2,
  thu:3, thursday:3, fri:4, friday:4, sat:5, saturday:5, sun:6, sunday:6,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function getMondayOfBatchWeek(weekNumber: number, batchStartDate: string): Date {
  const [y, m, d] = batchStartDate.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  const monday = new Date(base);
  monday.setDate(base.getDate() + (weekNumber - 1) * 7);
  return monday;
}

function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function fmtDay(d: Date): string {
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${m[d.getMonth()]} ${d.getDate()}`;
}
function fmtFull(iso: string): string {
  const [y, mo, d] = iso.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${days[date.getDay()]} ${months[date.getMonth()]} ${d}, ${y}`;
}

function recurringEventsForWeek(schedule: BatchSchedule | null, weekDates: Date[]): CalendarBatchEvent[] {
  if (!schedule) return [];
  const events: CalendarBatchEvent[] = [];
  for (const [dayKey, time] of Object.entries(schedule.callTimes)) {
    if (!time) continue;
    const idx = DAY_KEY_INDEX[dayKey.toLowerCase()];
    if (idx === undefined) continue;
    events.push({ date: toISO(weekDates[idx]), type: "call", label: `Call ${time}` });
  }
  if (schedule.weeklyMeetingDay) {
    const idx = DAY_KEY_INDEX[schedule.weeklyMeetingDay.toLowerCase()];
    if (idx !== undefined) {
      const t = schedule.weeklyMeetingTime ? ` ${schedule.weeklyMeetingTime}` : "";
      events.push({ date: toISO(weekDates[idx]), type: "meeting", label: `Weekly Meeting${t}` });
    }
  }
  return events;
}

// Build a complete date→steps map for ALL 12 weeks.
// Priority: scheduledDate > days[] (any of Mon-Sun) > unscheduled (no placement)
function buildFullStepMap(
  actionSteps: CalendarActionStep[],
  batchStartDate: string
): Map<string, CalendarActionStep[]> {
  const map = new Map<string, CalendarActionStep[]>();
  const push = (k: string, step: CalendarActionStep) => {
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(step);
  };
  for (let week = 1; week <= 12; week++) {
    const monday = getMondayOfBatchWeek(week, batchStartDate);
    const allDays = getWeekDates(monday).map(toISO); // 7 days Mon-Sun
    const weekSteps = actionSteps.filter((s) => s.weekNumber === week && s.text?.trim());
    for (const step of weekSteps) {
      if (step.scheduledDate) {
        push(step.scheduledDate, step);
      } else if (step.days && step.days.length > 0) {
        for (const d of step.days) {
          if (d >= 0 && d < 7) push(allDays[d], step);
        }
      }
      // No days assigned → not placed (shows in "Unscheduled" section)
    }
  }
  return map;
}

// Build date→milestones map (milestone appears on its weekStartDate / Monday of its week)
function buildMilestoneMap(
  milestones: CalendarMilestone[],
  batchStartDate: string
): Map<string, CalendarMilestone[]> {
  const map = new Map<string, CalendarMilestone[]>();
  for (const m of milestones) {
    const key = m.weekStartDate ?? toISO(getMondayOfBatchWeek(m.weekNumber, batchStartDate));
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return map;
}

// Build date→batchEvents map (fixed + recurring for all 12 weeks)
function buildBatchEventMap(
  batchEvents: CalendarBatchEvent[],
  batchSchedule: BatchSchedule | null,
  batchStartDate: string
): Map<string, CalendarBatchEvent[]> {
  const map = new Map<string, CalendarBatchEvent[]>();
  for (const ev of batchEvents) {
    if (!map.has(ev.date)) map.set(ev.date, []);
    map.get(ev.date)!.push(ev);
  }
  for (let week = 1; week <= 12; week++) {
    const monday = getMondayOfBatchWeek(week, batchStartDate);
    const weekDates = getWeekDates(monday);
    for (const ev of recurringEventsForWeek(batchSchedule, weekDates)) {
      if (!map.has(ev.date)) map.set(ev.date, []);
      map.get(ev.date)!.push(ev);
    }
  }
  return map;
}

// ─── Shared: Step Detail Card (expandable editor) ─────────────────────────────

function StepCard({
  step, canApprove, canEdit, weekDates, onMove, onApprove, onUpdate,
}: {
  step: CalendarActionStep;
  canApprove: boolean;
  canEdit: boolean;
  weekDates: Date[];
  onMove: (milestoneId: string, actionIndex: number, date: string) => Promise<void>;
  onApprove: (milestoneId: string, actionIndex: number) => Promise<void>;
  onUpdate: (milestoneId: string, actionIndex: number, text: string, done: boolean) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(step.text);
  const [saving, setSaving] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const colors = GOAL_COLORS[step.goalType];
  const isPending = !!step.pendingDate;

  async function handleSave() {
    setSaving(true);
    try { await onUpdate(step.milestoneId, step.actionIndex, draft, step.done); setEditing(false); }
    finally { setSaving(false); }
  }
  async function handleToggleDone() {
    setSaving(true);
    try { await onUpdate(step.milestoneId, step.actionIndex, step.text, !step.done); }
    finally { setSaving(false); }
  }

  return (
    <div className={`rounded-xl border transition-all ${step.done ? "opacity-60 bg-muted/30 border-border" : isPending ? "bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700" : `${colors.bg} ${colors.border}`} ${expanded ? "shadow-md" : ""}`}>
      <button onClick={() => setExpanded((v) => !v)} className="w-full text-left flex items-start gap-2.5 p-3 min-h-[48px]">
        <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${colors.dot}`} />
        <span className={`flex-1 text-sm font-medium leading-snug ${step.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{step.text}</span>
        {step.done && <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />}
        {isPending && <span title="Pending approval"><Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /></span>}
        <ChevronDown className={`h-4 w-4 shrink-0 mt-0.5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-border/50 px-3 pb-3 pt-2 space-y-3">
          {editing
            ? <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} className="w-full text-sm font-medium border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
            : <p className="text-sm font-medium text-foreground leading-relaxed">{step.text}</p>
          }
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${colors.bg} ${colors.text} ${colors.border} border`}>{step.goalType}</span>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">Week {step.weekNumber}</span>
            {step.scheduledDate && <span className="text-xs font-medium text-muted-foreground">📅 {step.scheduledDate}</span>}
          </div>
          {canEdit && (
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={handleToggleDone} disabled={saving} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg min-h-[36px] transition-colors ${step.done ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-700"}`}>
                <Check className="h-3.5 w-3.5" />{step.done ? "Mark Undone" : "Mark Done"}
              </button>
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg min-h-[36px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">{saving ? "Saving…" : "Save"}</button>
                  <button onClick={() => { setEditing(false); setDraft(step.text); }} className="text-xs font-semibold px-3 py-1.5 rounded-lg min-h-[36px] bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">Cancel</button>
                </>
              ) : (
                <button onClick={() => { setEditing(true); setDraft(step.text); }} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-muted border border-border text-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-400/50 transition-colors">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              )}
              <div className="relative">
                <button onClick={() => setShowDayPicker((v) => !v)} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg min-h-[36px] bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                  <Calendar className="h-3.5 w-3.5" />Move Day<ChevronDown className="h-3 w-3" />
                </button>
                {showDayPicker && (
                  <div className="absolute bottom-full left-0 mb-1 z-30 bg-popover border border-border rounded-xl shadow-lg p-2 min-w-[140px] space-y-0.5">
                    {weekDates.map((d, i) => (
                      <button key={toISO(d)} onClick={async () => { await onMove(step.milestoneId, step.actionIndex, toISO(d)); setShowDayPicker(false); }} className="w-full text-left text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                        {DAY_LABELS[i]} · {fmtDay(d)}
                      </button>
                    ))}
                    <button onClick={async () => { await onMove(step.milestoneId, step.actionIndex, ""); setShowDayPicker(false); }} className="w-full text-left text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground flex items-center gap-1.5 transition-colors">
                      <X className="h-3.5 w-3.5" />Clear date
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {isPending && (
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-700">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="flex-1">Proposed: move to <strong>{step.pendingDate}</strong></span>
              {canApprove && (
                <button onClick={() => onApprove(step.milestoneId, step.actionIndex)} className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors min-h-[32px]">
                  <Check className="h-3.5 w-3.5" />Approve
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Unscheduled Step Card ────────────────────────────────────────────────────

const WEEK_DAY_LABELS = ["M", "T", "W", "Th", "F", "Sa", "Su"];

function UnscheduledStepCard({
  step, weekDates, canEdit, onDaysUpdate, onMove,
}: {
  step: CalendarActionStep;
  weekDates: Date[];
  canEdit: boolean;
  onDaysUpdate: (milestoneId: string, actionIndex: number, days: number[]) => Promise<void>;
  onMove: (milestoneId: string, actionIndex: number, date: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"days" | "date">("days");
  const assignedDays: number[] = step.days ?? [];
  const isWeekdays = assignedDays.length === 5 && [0,1,2,3,4].every(d => assignedDays.includes(d));
  const isDaily = assignedDays.length === 7;

  async function toggleDay(d: number) {
    if (!canEdit || saving) return;
    setSaving(true);
    const next = assignedDays.includes(d)
      ? assignedDays.filter((x) => x !== d)
      : [...assignedDays, d].sort((a, b) => a - b);
    await onDaysUpdate(step.milestoneId, step.actionIndex, next);
    setSaving(false);
  }

  async function setPreset(days: number[]) {
    if (!canEdit || saving) return;
    setSaving(true);
    await onDaysUpdate(step.milestoneId, step.actionIndex, days);
    setSaving(false);
  }

  async function pinToDate(dateKey: string) {
    if (!canEdit || saving) return;
    setSaving(true);
    await onMove(step.milestoneId, step.actionIndex, dateKey);
    setSaving(false);
  }

  const c = GOAL_COLORS[step.goalType];
  return (
    <div className={`rounded-xl border p-3 space-y-2.5 ${c.bg} ${c.border} ${saving ? "opacity-60" : ""}`}>
      {/* Header */}
      <div className="flex items-start gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${c.dot}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-wide ${c.text} mb-0.5`}>{step.goalType} · Wk {step.weekNumber}</p>
          <p className="text-sm font-medium text-foreground leading-snug">{step.text}</p>
        </div>
      </div>

      {canEdit && (
        <>
          {/* Mode toggle */}
          <div className="flex gap-1 text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setMode("days")}
              className={`px-2 py-0.5 rounded transition-colors ${mode === "days" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              📅 Set days/week
            </button>
            <button
              type="button"
              onClick={() => setMode("date")}
              className={`px-2 py-0.5 rounded transition-colors ${mode === "date" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              📌 Pin to date
            </button>
          </div>

          {mode === "days" && (
            <div className="flex items-center gap-1 flex-wrap">
              {WEEK_DAY_LABELS.map((label, d) => {
                const active = assignedDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`w-7 h-7 text-[10px] font-bold rounded-lg border transition-all select-none ${
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary/10 cursor-pointer"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              <button type="button" onClick={() => setPreset(isWeekdays && !isDaily ? [] : [0,1,2,3,4])}
                className={`text-[9px] px-2 py-1 rounded font-semibold border transition-colors ml-1 ${isWeekdays && !isDaily ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border hover:border-primary/30"}`}>
                {isWeekdays && !isDaily ? "✓ Wkdays" : "Wkdays"}
              </button>
              <button type="button" onClick={() => setPreset(isDaily ? [] : [0,1,2,3,4,5,6])}
                className={`text-[9px] px-2 py-1 rounded font-semibold border transition-colors ${isDaily ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border hover:border-primary/30"}`}>
                {isDaily ? "✓ Daily" : "Daily"}
              </button>
              {assignedDays.length > 0 && (
                <span className="text-[9px] text-muted-foreground ml-1">{assignedDays.length}×/wk</span>
              )}
            </div>
          )}

          {mode === "date" && (
            <div className="flex flex-wrap gap-1.5">
              {weekDates.map((d) => {
                const key = toISO(d);
                const dayLabel = WEEK_DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pinToDate(key)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-border bg-muted hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {dayLabel} {d.getDate()}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Shared: Day Detail Panel ─────────────────────────────────────────────────

function DayPanel({
  dateKey, steps, milestones, batchEvents, unscheduledSteps, canApprove, canEdit,
  weekDates, onMove, onApprove, onUpdate, onDaysUpdate, onClose,
}: {
  dateKey: string;
  steps: CalendarActionStep[];
  milestones: CalendarMilestone[];
  batchEvents: CalendarBatchEvent[];
  unscheduledSteps: CalendarActionStep[];
  canApprove: boolean;
  canEdit: boolean;
  weekDates: Date[];
  onMove: (milestoneId: string, actionIndex: number, date: string) => Promise<void>;
  onApprove: (milestoneId: string, actionIndex: number) => Promise<void>;
  onUpdate: (milestoneId: string, actionIndex: number, text: string, done: boolean) => Promise<void>;
  onDaysUpdate: (milestoneId: string, actionIndex: number, days: number[]) => Promise<void>;
  onClose: () => void;
}) {
  const total = steps.length + batchEvents.length;
  return (
    <div className="mt-3 bg-muted/30 rounded-2xl border border-border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-bold">{fmtFull(dateKey)}</p>
          <p className="text-sm font-medium text-muted-foreground">{total} item{total !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Milestones for this day */}
      {milestones.map((ms) => {
        const c = GOAL_COLORS[ms.goalType];
        return (
          <div key={ms.milestoneId} className={`flex items-start gap-2.5 p-3 rounded-xl border ${c.bg} ${c.border}`}>
            <Target className={`h-4 w-4 shrink-0 mt-0.5 ${c.text}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold uppercase tracking-wide ${c.text} mb-0.5`}>{ms.goalType} · Week {ms.weekNumber} Milestone</p>
              <p className="text-sm font-medium text-foreground leading-snug">{ms.description}</p>
            </div>
            <span className="text-xl font-black shrink-0">{ms.cumulativePercentage}%</span>
          </div>
        );
      })}

      {/* Batch events */}
      {batchEvents.map((ev, i) => {
        const ec = BATCH_COLORS[ev.type] ?? BATCH_COLORS.meeting;
        return (
          <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${ec.bg} ${ec.border}`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ec.dot}`} />
            <span className={`text-sm font-semibold ${ec.text}`}>{ev.label}</span>
          </div>
        );
      })}

      {/* Action steps */}
      {steps.length === 0 && batchEvents.length === 0 && milestones.length === 0 && unscheduledSteps.length === 0 && (
        <p className="text-sm font-medium text-muted-foreground text-center py-4">No items scheduled for this day.</p>
      )}
      {steps.map((step) => (
        <StepCard
          key={`${step.milestoneId}-${step.actionIndex}`}
          step={step}
          canApprove={canApprove}
          canEdit={canEdit}
          weekDates={weekDates}
          onMove={onMove}
          onApprove={onApprove}
          onUpdate={onUpdate}
        />
      ))}

      {/* Unscheduled steps for this week — assign days or pin to a date inline */}
      {unscheduledSteps.length > 0 && (
        <div className="border-t border-border pt-3 mt-1 space-y-3">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
            <span>📅</span> Unscheduled this week — set days or pin to a date
          </p>
          {unscheduledSteps.map((step) => (
            <UnscheduledStepCard
              key={`u-${step.milestoneId}-${step.actionIndex}`}
              step={step}
              weekDates={weekDates}
              canEdit={canEdit}
              onDaysUpdate={onDaysUpdate}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StudentCalendarWidget({
  studentId, currentWeek, batchStartDate,
}: {
  studentId: string;
  currentWeek: number;
  batchStartDate: string;
}) {
  const { user } = useNavigation();
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthDate, setMonthDate] = useState<Date>(() => {
    const mon = getMondayOfBatchWeek(currentWeek, batchStartDate);
    return new Date(mon.getFullYear(), mon.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [data, setData] = useState<{
    actionSteps: CalendarActionStep[];
    milestones: CalendarMilestone[];
    batchEvents: CalendarBatchEvent[];
    batchSchedule: BatchSchedule | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAssessment, setAiAssessment] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const isCoach  = user.role === "coach" || user.role === "head_coach";
  const canApprove = isCoach;
  const canEdit    = isCoach || user.userId === studentId;

  const displayWeek  = Math.max(1, Math.min(12, currentWeek + weekOffset));
  const displayMonday = getMondayOfBatchWeek(displayWeek, batchStartDate);
  const weekDates    = getWeekDates(displayMonday);
  const pendingCount = data?.actionSteps.filter((s) => s.pendingDate).length ?? 0;

  // Pre-computed maps for all 12 weeks
  const stepMap = useMemo(
    () => (data ? buildFullStepMap(data.actionSteps, batchStartDate) : new Map<string, CalendarActionStep[]>()),
    [data, batchStartDate]
  );
  const milestoneMap = useMemo(
    () => (data ? buildMilestoneMap(data.milestones, batchStartDate) : new Map<string, CalendarMilestone[]>()),
    [data, batchStartDate]
  );
  const batchMap = useMemo(
    () => (data ? buildBatchEventMap(data.batchEvents, data.batchSchedule, batchStartDate) : new Map<string, CalendarBatchEvent[]>()),
    [data, batchStartDate]
  );

  // Compute load stats for AI assessment
  const loadStats = useMemo((): CalendarLoadStats => {
    const totalByDay = [0, 0, 0, 0, 0, 0, 0];
    const weekTotals: number[] = [];
    const weekByDay: number[][] = [];
    let heavyDayCount = 0;
    for (let week = 1; week <= 12; week++) {
      const monday = getMondayOfBatchWeek(week, batchStartDate);
      const byDay = [0, 0, 0, 0, 0, 0, 0];
      for (let d = 0; d < 7; d++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + d);
        const key = toISO(day);
        const count = stepMap.get(key)?.length ?? 0;
        byDay[d] = count;
        totalByDay[d] += count;
        if (count >= 3) heavyDayCount++;
      }
      const weekTotal = byDay.reduce((a, b) => a + b, 0);
      weekTotals.push(weekTotal);
      weekByDay.push(byDay);
    }
    return {
      totalByDay,
      weekTotals,
      weekByDay,
      heavyDayCount,
      emptyWeekCount: weekTotals.filter((t) => t === 0).length,
      lightWeekCount: weekTotals.filter((t) => t > 0 && t <= 2).length,
    };
  }, [stepMap, batchStartDate]);

  async function handleAiAssess() {
    setAiLoading(true);
    setAiAssessment(null);
    try {
      const result = await analyzeCalendarLoad(loadStats);
      setAiAssessment(result);
    } catch {
      setAiAssessment("Unable to generate assessment. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await getStudentCalendarData(studentId)); }
    finally { setLoading(false); }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  async function handleMove(milestoneId: string, actionIndex: number, date: string) {
    await scheduleActionStep(milestoneId, actionIndex, date);
    await load();
  }
  async function handleApprove(milestoneId: string, actionIndex: number) {
    await approveActionSchedule(milestoneId, actionIndex);
    await load();
  }
  async function handleDaysUpdate(milestoneId: string, actionIndex: number, days: number[]) {
    await updateActionStepDays(milestoneId, actionIndex, days);
    await load();
  }
  async function handleUpdate(milestoneId: string, actionIndex: number, text: string, done: boolean) {
    await updateActionStepText(milestoneId, actionIndex, text, done);
    await load();
  }

  // ── Day detail helpers ────────────────────────────────────────────────────

  function getDayData(dateKey: string) {
    return {
      steps:      stepMap.get(dateKey) ?? [],
      milestones: milestoneMap.get(dateKey) ?? [],
      events:     batchMap.get(dateKey) ?? [],
    };
  }

  function totalForDay(dateKey: string) {
    const d = getDayData(dateKey);
    return d.steps.length + d.milestones.length + d.events.length;
  }

  // ── Weekly View ────────────────────────────────────────────────────────────

  function WeeklyView() {
    return (
      <>
        <div className="overflow-x-auto -mx-4 px-4 mt-4">
          <div className="grid grid-cols-7 gap-2 min-w-[560px]">
            {weekDates.map((d, i) => {
              const key     = toISO(d);
              const total   = totalForDay(key);
              const isHeavy = total >= HEAVY_AMBER;
              const isVeryH = total >= HEAVY_RED;
              const isToday = toISO(new Date()) === key;
              const isSelected = selectedDay === key;
              const daySteps    = stepMap.get(key) ?? [];
              const dayEvents   = batchMap.get(key) ?? [];
              const dayMils     = milestoneMap.get(key) ?? [];

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  className={`flex flex-col gap-1.5 p-2.5 rounded-xl border text-left transition-all min-h-[100px] ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : isToday
                      ? "border-primary/50 bg-primary/5"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  {/* Day header */}
                  <div className={`text-center ${isToday ? "text-primary" : ""}`}>
                    <p className="text-sm font-bold">{DAY_LABELS[i]}</p>
                    <p className="text-xs font-medium text-muted-foreground">{fmtDay(d)}</p>
                  </div>

                  {/* Count badge */}
                  {total > 0 && (
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full text-center w-full ${
                      isVeryH ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : isHeavy ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                    }`}>
                      {isHeavy && <AlertTriangle className="h-3 w-3 inline mr-0.5" />}
                      {total} {total === 1 ? "item" : "items"}
                    </div>
                  )}

                  {/* Colored dots preview */}
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayMils.map((ms, mi) => (
                      <span key={mi} className={`w-2 h-2 rounded-sm ${GOAL_COLORS[ms.goalType].dot}`} title="Milestone" />
                    ))}
                    {daySteps.filter((s) => s.goalType === "enrollment").slice(0, 3).map((_, si) => (
                      <span key={`e${si}`} className="w-2 h-2 rounded-full bg-blue-500" />
                    ))}
                    {daySteps.filter((s) => s.goalType === "personal").slice(0, 3).map((_, si) => (
                      <span key={`p${si}`} className="w-2 h-2 rounded-full bg-yellow-400" />
                    ))}
                    {daySteps.filter((s) => s.goalType === "professional").slice(0, 3).map((_, si) => (
                      <span key={`pr${si}`} className="w-2 h-2 rounded-full bg-purple-500" />
                    ))}
                    {dayEvents.map((ev, ei) => (
                      <span key={`ev${ei}`} className={`w-2 h-2 rounded-full ${BATCH_COLORS[ev.type]?.dot ?? "bg-indigo-500"}`} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        {selectedDay && (() => {
          const { steps, milestones: mils, events } = getDayData(selectedDay);
          const unscheduledSteps = (data?.actionSteps ?? []).filter(
            (s) => s.weekNumber === displayWeek && !s.scheduledDate && (!s.days || s.days.length === 0)
          );
          return (
            <DayPanel
              dateKey={selectedDay}
              steps={steps}
              milestones={mils}
              batchEvents={events}
              unscheduledSteps={unscheduledSteps}
              canApprove={canApprove}
              canEdit={canEdit}
              weekDates={weekDates}
              onMove={handleMove}
              onApprove={handleApprove}
              onUpdate={handleUpdate}
              onDaysUpdate={handleDaysUpdate}
              onClose={() => setSelectedDay(null)}
            />
          );
        })()}
      </>
    );
  }

  // ── Monthly View ──────────────────────────────────────────────────────────

  function MonthlyView() {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const gridStart = new Date(firstDay);
    gridStart.setDate(1 - offset);

    const cells: Date[] = Array.from({ length: 35 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      return d;
    });

    return (
      <>
        <div className="mt-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-xs font-bold text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {cells.map((d, i) => {
              const key       = toISO(d);
              const inMonth   = d.getMonth() === month;
              const isToday   = toISO(new Date()) === key;
              const isSelected = selectedDay === key;
              const total     = totalForDay(key);
              const isHeavy   = total >= HEAVY_AMBER;
              const isVeryH   = total >= HEAVY_RED;
              const daySteps  = stepMap.get(key) ?? [];
              const dayMils   = milestoneMap.get(key) ?? [];
              const dayEvents = batchMap.get(key) ?? [];

              return (
                <button
                  key={i}
                  onClick={() => inMonth ? setSelectedDay(isSelected ? null : key) : undefined}
                  className={`bg-card min-h-[80px] p-2 text-left transition-colors ${
                    !inMonth ? "opacity-30 cursor-default" : "hover:bg-muted/30 cursor-pointer"
                  } ${isToday ? "ring-2 ring-inset ring-primary" : ""} ${isSelected ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}>
                      {d.getDate()}
                    </span>
                    {isHeavy && (
                      <AlertTriangle className={`h-3 w-3 mt-0.5 ${isVeryH ? "text-red-500" : "text-amber-500"}`} />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {dayMils.map((ms, mi) => (
                      <span key={mi} className={`w-2 h-2 rounded-sm ${GOAL_COLORS[ms.goalType].dot}`} title="Milestone" />
                    ))}
                    {daySteps.filter((s) => s.goalType === "enrollment").length > 0 && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    {daySteps.filter((s) => s.goalType === "personal").length > 0 && <span className="w-2 h-2 rounded-full bg-yellow-400" />}
                    {daySteps.filter((s) => s.goalType === "professional").length > 0 && <span className="w-2 h-2 rounded-full bg-purple-500" />}
                    {dayEvents.some((e) => e.type === "intensive") && <span className="w-2 h-2 rounded-full bg-red-500" />}
                    {dayEvents.some((e) => e.type === "breakfast") && <span className="w-2 h-2 rounded-full bg-orange-400" />}
                    {dayEvents.some((e) => e.type === "meeting") && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                    {dayEvents.some((e) => e.type === "call") && <span className="w-2 h-2 rounded-full bg-teal-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        {selectedDay && (() => {
          const { steps, milestones: mils, events } = getDayData(selectedDay);
          // Find which week this day falls in for the day-picker weekDates
          const [sy, sm, sd] = selectedDay.split("-").map(Number);
          const selDate = new Date(sy, sm - 1, sd);
          const selDay = selDate.getDay();
          const selMonday = new Date(selDate);
          selMonday.setDate(selDate.getDate() - (selDay === 0 ? 6 : selDay - 1));
          const selWeekDates = getWeekDates(selMonday);
          const selWeekISOs = new Set(selWeekDates.map(toISO));
          // Determine the batch week number for this selected day
          const selWeekNum = (data?.actionSteps ?? []).find((s) => {
            const mon = getMondayOfBatchWeek(s.weekNumber, batchStartDate);
            return selWeekISOs.has(toISO(mon)) || getWeekDates(mon).some((d) => toISO(d) === selectedDay);
          })?.weekNumber ?? displayWeek;
          const unscheduledSteps = (data?.actionSteps ?? []).filter(
            (s) => s.weekNumber === selWeekNum && !s.scheduledDate && (!s.days || s.days.length === 0)
          );
          return (
            <DayPanel
              dateKey={selectedDay}
              steps={steps}
              milestones={mils}
              batchEvents={events}
              unscheduledSteps={unscheduledSteps}
              canApprove={canApprove}
              canEdit={canEdit}
              weekDates={selWeekDates}
              onMove={handleMove}
              onApprove={handleApprove}
              onUpdate={handleUpdate}
              onDaysUpdate={handleDaysUpdate}
              onClose={() => setSelectedDay(null)}
            />
          );
        })()}
      </>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-border overflow-hidden text-sm font-semibold">
            <button onClick={() => { setViewMode("weekly"); setSelectedDay(null); }} className={`px-4 py-2 min-h-[40px] transition-colors ${viewMode === "weekly" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>Weekly</button>
            <button onClick={() => { setViewMode("monthly"); setSelectedDay(null); }} className={`px-4 py-2 min-h-[40px] transition-colors ${viewMode === "monthly" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>Monthly</button>
          </div>
          {pendingCount > 0 && canApprove && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
              {pendingCount} pending approval
            </span>
          )}
          {loading && <span className="text-xs font-medium text-muted-foreground animate-pulse">Loading…</span>}
        </div>

        {viewMode === "weekly" ? (
          <div className="flex items-center gap-1">
            <button onClick={() => { setWeekOffset((o) => o - 1); setSelectedDay(null); }} disabled={displayWeek <= 1} className="p-2 rounded-lg hover:bg-muted min-h-[40px] min-w-[40px] flex items-center justify-center disabled:opacity-30 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-sm font-bold px-1">Week {displayWeek}</span>
            <span className="text-sm font-medium text-muted-foreground">· {fmtDay(weekDates[0])}–{fmtDay(weekDates[6])}</span>
            <button onClick={() => { setWeekOffset((o) => o + 1); setSelectedDay(null); }} disabled={displayWeek >= 12} className="p-2 rounded-lg hover:bg-muted min-h-[40px] min-w-[40px] flex items-center justify-center disabled:opacity-30 transition-colors"><ChevronRight className="h-4 w-4" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={() => { setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1)); setSelectedDay(null); }} className="p-2 rounded-lg hover:bg-muted min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-sm font-bold px-1">{MONTH_NAMES[monthDate.getMonth()]} {monthDate.getFullYear()}</span>
            <button onClick={() => { setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)); setSelectedDay(null); }} className="p-2 rounded-lg hover:bg-muted min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>

      {/* View */}
      {viewMode === "weekly" ? <WeeklyView /> : <MonthlyView />}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-3 border-t border-border">
        {[
          { dot: "bg-blue-500",   label: "Enrollment" },
          { dot: "bg-yellow-400", label: "Personal" },
          { dot: "bg-purple-500", label: "Professional" },
          { dot: "bg-red-500",    label: "Intensive" },
          { dot: "bg-orange-400", label: "Breakfast" },
          { dot: "bg-indigo-500", label: "Meeting" },
          { dot: "bg-teal-500",   label: "Call" },
          { dot: "bg-amber-400",  label: "Pending" },
        ].map(({ dot, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <AlertTriangle className="h-3 w-3 text-amber-500" />Heavy day (3+)
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 shrink-0" />Milestone
        </span>
      </div>

      {/* AI Load Assessment */}
      {data && (
        <div className="bg-muted/30 rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold shrink-0">AI</span>
              <div>
                <p className="text-sm font-bold">Distribution Assessment</p>
                <p className="text-xs text-muted-foreground">
                  {loadStats.heavyDayCount} heavy day{loadStats.heavyDayCount !== 1 ? "s" : ""} · {loadStats.emptyWeekCount} empty week{loadStats.emptyWeekCount !== 1 ? "s" : ""} · {loadStats.lightWeekCount} light week{loadStats.lightWeekCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={handleAiAssess}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors min-h-[40px]"
            >
              {aiLoading ? (
                <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />Analyzing…</>
              ) : (
                <>{aiAssessment ? "Re-analyze" : "Analyze Load"}</>
              )}
            </button>
          </div>

          {aiAssessment && (
            <div className="space-y-2 pt-1">
              {aiAssessment.split("\n").filter((l) => l.trim()).map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-sm font-medium text-foreground leading-snug">
                  <span className="text-primary shrink-0 mt-0.5">•</span>
                  <span>{line.replace(/^[•\-\*]\s*/, "")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
