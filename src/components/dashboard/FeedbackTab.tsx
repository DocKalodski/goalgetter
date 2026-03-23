"use client";

import { useEffect, useState, useCallback } from "react";
import { getStudentAttendance, getBatchWeekInfo } from "@/lib/actions/attendance";
import {
  getStudentAlignment,
  updateDeclarationForStudent,
  type AlignmentData,
  type GoalAlignment,
} from "@/lib/actions/alignment";
import { updateGoal } from "@/lib/actions/goals";
import { updateMyDeclaration } from "@/lib/actions/profile";
import { useNavigation } from "@/components/layout/DashboardShell";
import type { ProgramEvent } from "@/lib/actions/program";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Heart,
  Compass,
  Pencil,
  Check,
  X,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────
interface AttendanceRow {
  eventAttendance: string | null;
  weekNumber: number;
  meetingStatus: string | null;
  meetingMon: string | null;
  meetingTue: string | null;
  meetingWed: string | null;
  meetingThu: string | null;
  meetingFri: string | null;
  meetingSat: string | null;
  meetingSun: string | null;
  callMon: string | null;
  callTue: string | null;
  callWed: string | null;
  callThu: string | null;
  callFri: string | null;
  callSat: string | null;
  callSun: string | null;
}

interface WeekRate {
  week: number;
  rate: number; // 0–100
  present: number;
  total: number;
}

type Signal =
  | "out_of_control_high"
  | "out_of_control_low"
  | "run_above"
  | "run_below"
  | "trend_up"
  | "trend_down"
  | "normal";

interface SPCResult {
  weekRates: WeekRate[];
  meetingWeekRates: { week: number; rate: number | null }[];
  callWeekRates: { week: number; rate: number | null }[];
  eventWeekRates: { week: number; rate: number | null }[];
  mean: number;
  stdDev: number;
  ucl: number;
  lcl: number;
  signals: { week: number; type: Signal; message: string }[];
  meetingRate: number;
  callRate: number;
  overallRate: number;
  trend: "improving" | "declining" | "stable";
  momentum: "high" | "on_track" | "building" | "stalled";
  coachingFlags: string[];
}

// ─── SPC Calculations ───────────────────────────────────────────

function getWeekDateRange(weekNumber: number, batchStartDate: string) {
  const [y, m, d] = batchStartDate.split("-").map(Number);
  const start = new Date(y, m - 1, d + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function computeSPC(attendance: AttendanceRow[], events: ProgramEvent[] = [], batchStartDate = "2026-02-02"): SPCResult {
  // Build 12-week rates
  const weekRates: WeekRate[] = Array.from({ length: 12 }, (_, i) => {
    const week = i + 1;
    const row = attendance.find((a) => a.weekNumber === week);
    const statuses = row
      ? [
          row.meetingMon,
          row.meetingTue,
          row.meetingWed,
          row.meetingThu,
          row.meetingFri,
          row.meetingSat,
          row.meetingSun,
          row.callMon,
          row.callTue,
          row.callWed,
          row.callThu,
          row.callFri,
          row.callSat,
          row.callSun,
        ]
      : [];
    const tracked = statuses.filter((s) => s && s !== "no_data");
    const present = tracked.filter((s) => s === "present").length;
    const total = tracked.length;
    return {
      week,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
      present,
      total,
    };
  });

  // Only use weeks with data for SPC calculations
  const activeWeeks = weekRates.filter((w) => w.total > 0);
  const n = activeWeeks.length;

  if (n === 0) {
    const empty12 = Array.from({ length: 12 }, (_, i) => ({ week: i + 1, rate: null }));
    return {
      weekRates,
      meetingWeekRates: empty12,
      callWeekRates: empty12,
      eventWeekRates: empty12,
      mean: 0,
      stdDev: 0,
      ucl: 100,
      lcl: 0,
      signals: [],
      meetingRate: 0,
      callRate: 0,
      overallRate: 0,
      trend: "stable",
      momentum: "stalled",
      coachingFlags: ["No attendance data recorded yet."],
    };
  }

  const rates = activeWeeks.map((w) => w.rate);
  const mean = rates.reduce((a, b) => a + b, 0) / n;
  const variance = rates.reduce((a, r) => a + (r - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  // Control limits (2-sigma for coaching context — tighter than 3-sigma industrial)
  const ucl = Math.min(100, mean + 2 * stdDev);
  const lcl = Math.max(0, mean - 2 * stdDev);

  // ─── Signal Detection ─────────────────────────────────────
  const signals: { week: number; type: Signal; message: string }[] = [];

  // Rule 1: Points outside control limits
  for (const w of activeWeeks) {
    if (w.rate > ucl) {
      signals.push({
        week: w.week,
        type: "out_of_control_high",
        message: `Week ${w.week}: Exceptionally high (${w.rate}%) — above upper limit`,
      });
    } else if (w.rate < lcl) {
      signals.push({
        week: w.week,
        type: "out_of_control_low",
        message: `Week ${w.week}: Below lower limit (${w.rate}%) — needs attention`,
      });
    }
  }

  // Rule 2: Run of 3+ consecutive points on one side of mean
  let aboveRun = 0;
  let belowRun = 0;
  for (const w of activeWeeks) {
    if (w.rate > mean) {
      aboveRun++;
      belowRun = 0;
      if (aboveRun === 3) {
        signals.push({
          week: w.week,
          type: "run_above",
          message: `Week ${w.week}: 3+ consecutive weeks above average — strong streak`,
        });
      }
    } else if (w.rate < mean) {
      belowRun++;
      aboveRun = 0;
      if (belowRun === 3) {
        signals.push({
          week: w.week,
          type: "run_below",
          message: `Week ${w.week}: 3+ consecutive weeks below average — intervention needed`,
        });
      }
    } else {
      aboveRun = 0;
      belowRun = 0;
    }
  }

  // Rule 3: Trend detection (4+ points continuously increasing or decreasing)
  if (n >= 4) {
    let rising = 0;
    let falling = 0;
    for (let i = 1; i < activeWeeks.length; i++) {
      if (activeWeeks[i].rate > activeWeeks[i - 1].rate) {
        rising++;
        falling = 0;
        if (rising >= 3) {
          signals.push({
            week: activeWeeks[i].week,
            type: "trend_up",
            message: `Week ${activeWeeks[i].week}: Upward trend detected — building momentum`,
          });
        }
      } else if (activeWeeks[i].rate < activeWeeks[i - 1].rate) {
        falling++;
        rising = 0;
        if (falling >= 3) {
          signals.push({
            week: activeWeeks[i].week,
            type: "trend_down",
            message: `Week ${activeWeeks[i].week}: Downward trend — schedule coaching conversation`,
          });
        }
      } else {
        rising = 0;
        falling = 0;
      }
    }
  }

  // ─── Separate Rates ───────────────────────────────────────
  let meetingPresent = 0;
  let meetingTotal = 0;
  let callPresent = 0;
  let callTotal = 0;

  for (const row of attendance) {
    for (const day of [row.meetingMon, row.meetingTue, row.meetingWed, row.meetingThu, row.meetingFri, row.meetingSat, row.meetingSun]) {
      if (day && day !== "no_data") {
        meetingTotal++;
        if (day === "present") meetingPresent++;
      }
    }
    for (const day of [row.callMon, row.callTue, row.callWed, row.callThu, row.callFri, row.callSat, row.callSun]) {
      if (day && day !== "no_data") {
        callTotal++;
        if (day === "present") callPresent++;
      }
    }
  }

  const meetingRate = meetingTotal > 0 ? Math.round((meetingPresent / meetingTotal) * 100) : 0;
  const callRate = callTotal > 0 ? Math.round((callPresent / callTotal) * 100) : 0;
  const overallRate = Math.round(mean);

  // ─── Overall Trend ────────────────────────────────────────
  let trend: "improving" | "declining" | "stable" = "stable";
  if (n >= 3) {
    const firstHalf = rates.slice(0, Math.floor(n / 2));
    const secondHalf = rates.slice(Math.floor(n / 2));
    const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (avg2 - avg1 > 10) trend = "improving";
    else if (avg1 - avg2 > 10) trend = "declining";
  }

  // ─── Momentum ─────────────────────────────────────────────
  let momentum: "high" | "on_track" | "building" | "stalled";
  if (overallRate >= 85 && trend !== "declining") momentum = "high";
  else if (overallRate >= 70) momentum = "on_track";
  else if (overallRate >= 50) momentum = "building";
  else momentum = "stalled";

  // ─── Coaching Flags ───────────────────────────────────────
  const coachingFlags: string[] = [];

  if (meetingRate < 60) {
    coachingFlags.push(
      `Meeting attendance is ${meetingRate}%. Weekly meetings anchor the coaching rhythm — prioritize showing up.`
    );
  }
  if (callRate < 60) {
    coachingFlags.push(
      `Coaching call rate is ${callRate}%. Daily calls build accountability habits — aim for at least 4/5 days.`
    );
  }
  if (trend === "declining") {
    coachingFlags.push(
      "Attendance is trending downward. Schedule a 1-on-1 check-in to understand blockers."
    );
  }
  if (trend === "improving") {
    coachingFlags.push(
      "Positive upward trend — reinforce what's working. Acknowledge the effort publicly."
    );
  }
  if (stdDev > 30) {
    coachingFlags.push(
      `High variability (SD: ${Math.round(stdDev)}%). Performance swings week-to-week. Help build consistent daily routines.`
    );
  }
  if (n >= 6 && overallRate >= 85 && stdDev < 15) {
    coachingFlags.push(
      "Exemplary consistency. Consider this student as a peer accountability model for the council."
    );
  }
  if (momentum === "stalled") {
    coachingFlags.push(
      "Student appears stalled. Check for external blockers (schedule, motivation, personal issues)."
    );
  }
  // Check for recent drop (last 2 weeks vs prior average)
  if (n >= 4) {
    const recent = rates.slice(-2);
    const prior = rates.slice(0, -2);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const priorAvg = prior.reduce((a, b) => a + b, 0) / prior.length;
    if (priorAvg - recentAvg > 25) {
      coachingFlags.push(
        "Sudden drop in recent weeks compared to earlier performance. Investigate for special cause."
      );
    }
  }

  if (coachingFlags.length === 0) {
    coachingFlags.push("Student is performing within expected range. Continue current rhythm.");
  }

  // ─── Per-Category Weekly Rates for Chart ──────────────────────
  const meetingWeekRates = Array.from({ length: 12 }, (_, i) => {
    const week = i + 1;
    const row = attendance.find((a) => a.weekNumber === week);
    if (!row) return { week, rate: null };
    const days = [row.meetingMon, row.meetingTue, row.meetingWed, row.meetingThu, row.meetingFri, row.meetingSat, row.meetingSun];
    const tracked = days.filter((s) => s && s !== "no_data");
    if (tracked.length === 0) return { week, rate: null };
    const present = tracked.filter((s) => s === "present").length;
    return { week, rate: Math.round((present / tracked.length) * 100) };
  });

  const callWeekRates = Array.from({ length: 12 }, (_, i) => {
    const week = i + 1;
    const row = attendance.find((a) => a.weekNumber === week);
    if (!row) return { week, rate: null };
    const calls = [row.callMon, row.callTue, row.callWed, row.callThu, row.callFri, row.callSat, row.callSun];
    const tracked = calls.filter((s) => s && s !== "no_data");
    if (tracked.length === 0) return { week, rate: null };
    const present = tracked.filter((s) => s === "present").length;
    return { week, rate: Math.round((present / tracked.length) * 100) };
  });

  const eventWeekRates = Array.from({ length: 12 }, (_, i) => {
    const week = i + 1;
    if (!events.length) return { week, rate: null };
    const { start, end } = getWeekDateRange(week, batchStartDate);
    const weekEvents = events.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date + "T00:00:00");
      return d >= start && d <= end;
    });
    if (weekEvents.length === 0) return { week, rate: null };
    const row = attendance.find((a) => a.weekNumber === week);
    const evtMap: Record<string, string> = row?.eventAttendance ? (() => { try { return JSON.parse(row.eventAttendance!); } catch { return {}; } })() : {};
    const tracked = weekEvents.filter((e) => evtMap[e.id] && evtMap[e.id] !== "no_data");
    if (tracked.length === 0) return { week, rate: null };
    const present = tracked.filter((e) => evtMap[e.id] === "present").length;
    return { week, rate: Math.round((present / tracked.length) * 100) };
  });

  return {
    weekRates,
    meetingWeekRates,
    callWeekRates,
    eventWeekRates,
    mean,
    stdDev,
    ucl,
    lcl,
    signals,
    meetingRate,
    callRate,
    overallRate,
    trend,
    momentum,
    coachingFlags,
  };
}

// ─── Per-Day & Event Rates ──────────────────────────────────────

interface EventCategoryRate {
  label: string;
  attended: number;
  total: number;
  rate: number;
}

function computeDayRate(
  attendance: AttendanceRow[],
  day: "callMon" | "callTue" | "callWed" | "callThu" | "callFri" | "callSat" | "callSun"
): number {
  const tracked = attendance.filter((r) => r[day] && r[day] !== "no_data");
  const present = tracked.filter((r) => r[day] === "present").length;
  return tracked.length > 0 ? Math.round((present / tracked.length) * 100) : 0;
}

function computeEventCategoryRates(
  attendance: AttendanceRow[],
  events: ProgramEvent[]
): Record<string, EventCategoryRate> {
  // Merge all eventAttendance records across weeks
  const merged: Record<string, string> = {};
  for (const row of attendance) {
    if (!row.eventAttendance) continue;
    try {
      const parsed: Record<string, string> = JSON.parse(row.eventAttendance);
      Object.assign(merged, parsed);
    } catch {}
  }

  // Categorize events by name keywords
  const categories: Record<string, { label: string; ids: string[] }> = {
    intensive: { label: "Intensives", ids: [] },
    breakfast: { label: "Breakfasts", ids: [] },
    other: { label: "Other Events", ids: [] },
  };

  for (const ev of events) {
    if (ev.type === "intensive") categories.intensive.ids.push(ev.id);
    else if (ev.type === "breakfast") categories.breakfast.ids.push(ev.id);
    else {
      const name = ev.name.toLowerCase();
      if (name.includes("intensive")) categories.intensive.ids.push(ev.id);
      else if (name.includes("breakfast")) categories.breakfast.ids.push(ev.id);
      else categories.other.ids.push(ev.id);
    }
  }

  const result: Record<string, EventCategoryRate> = {};
  for (const [key, cat] of Object.entries(categories)) {
    if (cat.ids.length === 0) continue;
    const total = cat.ids.length;
    const attended = cat.ids.filter(
      (id) => merged[id] === "present"
    ).length;
    result[key] = {
      label: cat.label,
      attended,
      total,
      rate: Math.round((attended / total) * 100),
    };
  }
  return result;
}

// ─── Attendance Heatmap ──────────────────────────────────────────

const STATUS_CELL: Record<string, { bg: string; label: string; title: string }> = {
  present: { bg: "bg-emerald-500", label: "✓", title: "Present" },
  late:    { bg: "bg-amber-400",   label: "L", title: "Late" },
  absent:  { bg: "bg-red-500",     label: "✗", title: "Absent" },
  no_data: { bg: "bg-muted",       label: "·", title: "No data" },
};

function HeatmapCell({ status, future }: { status: string; future?: boolean }) {
  if (future) {
    return <div className="w-7 h-7 rounded border border-dashed border-border/30" />;
  }
  const cfg = STATUS_CELL[status] ?? STATUS_CELL.no_data;
  return (
    <div
      className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white ${cfg.bg}`}
      title={cfg.title}
    >
      {cfg.label}
    </div>
  );
}

function AttendanceHeatmap({
  attendance,
  events,
  batchStartDate,
  spc,
  currentWeek,
}: {
  attendance: AttendanceRow[];
  events: ProgramEvent[];
  batchStartDate: string;
  spc: SPCResult;
  currentWeek: number;
}) {
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
  const signalWeeks = new Set(spc.signals.map((s) => s.week));

  function getRow(week: number) {
    return attendance.find((a) => a.weekNumber === week);
  }

  function getEventStatus(week: number, eventId: string) {
    const row = getRow(week);
    if (!row?.eventAttendance) return "no_data";
    try {
      const map: Record<string, string> = JSON.parse(row.eventAttendance);
      return map[eventId] || "no_data";
    } catch { return "no_data"; }
  }

  // Collect unique events that fall in any week
  function eventsForWeek(week: number) {
    const { start, end } = getWeekDateRange(week, batchStartDate);
    return events.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date + "T00:00:00");
      return d >= start && d <= end;
    });
  }

  // Rows definition
  const rows: { label: string; icon?: string; getStatus: (week: number) => string }[] = [
    { label: "Mtg Mon", icon: "👥", getStatus: (w) => getRow(w)?.meetingMon || "no_data" },
    { label: "Mtg Tue", icon: "👥", getStatus: (w) => getRow(w)?.meetingTue || "no_data" },
    { label: "Mtg Wed", icon: "👥", getStatus: (w) => getRow(w)?.meetingWed || "no_data" },
    { label: "Mtg Thu", icon: "👥", getStatus: (w) => getRow(w)?.meetingThu || "no_data" },
    { label: "Mtg Fri", icon: "👥", getStatus: (w) => getRow(w)?.meetingFri || "no_data" },
    { label: "Mtg Sat", icon: "👥", getStatus: (w) => getRow(w)?.meetingSat || "no_data" },
    { label: "Mtg Sun", icon: "👥", getStatus: (w) => getRow(w)?.meetingSun || "no_data" },
    { label: "Call Mon", icon: "📞", getStatus: (w) => getRow(w)?.callMon || "no_data" },
    { label: "Call Tue", icon: "📞", getStatus: (w) => getRow(w)?.callTue || "no_data" },
    { label: "Call Wed", icon: "📞", getStatus: (w) => getRow(w)?.callWed || "no_data" },
    { label: "Call Thu", icon: "📞", getStatus: (w) => getRow(w)?.callThu || "no_data" },
    { label: "Call Fri", icon: "📞", getStatus: (w) => getRow(w)?.callFri || "no_data" },
    { label: "Call Sat", icon: "📞", getStatus: (w) => getRow(w)?.callSat || "no_data" },
    { label: "Call Sun", icon: "📞", getStatus: (w) => getRow(w)?.callSun || "no_data" },
  ];

  // Add event rows only if they exist in any week
  const allEvents = events.filter((e) =>
    weeks.some((w) => eventsForWeek(w).some((ev) => ev.id === e.id))
  );
  const eventRows = allEvents.map((evt) => ({
    label: evt.name,
    icon: evt.type === "intensive" ? "⚡" : evt.type === "breakfast" ? "☕" : "⭐",
    getStatus: (w: number) => getEventStatus(w, evt.id),
  }));

  const allRows = [...rows, ...eventRows];

  // Overall weekly rate for bottom summary row
  const weekRate = (week: number) => {
    const wr = spc.weekRates.find((w) => w.week === week);
    return wr?.total ? wr.rate : null;
  };

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 560 }}>
        {/* Week header */}
        <div className="flex items-center gap-1 mb-1 ml-20">
          {weeks.map((w) => (
            <div
              key={w}
              className={`w-7 text-center text-xs font-semibold ${
                signalWeeks.has(w) ? "text-amber-500" : "text-muted-foreground"
              }`}
            >
              W{w}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {allRows.map((row) => (
          <div key={row.label} className="flex items-center gap-1 mb-0.5">
            <div className="w-20 shrink-0 text-[11px] text-muted-foreground flex items-center gap-1 truncate">
              <span>{row.icon}</span>
              <span className="truncate">{row.label}</span>
            </div>
            {weeks.map((w) => (
              <HeatmapCell key={w} status={row.getStatus(w)} future={w > currentWeek} />
            ))}
          </div>
        ))}

        {/* Divider */}
        <div className="flex items-center gap-1 mt-1 mb-0.5">
          <div className="w-20 shrink-0 text-[11px] font-semibold text-muted-foreground">Rate</div>
          {weeks.map((w) => {
            if (w > currentWeek) return <div key={w} className="w-7 h-7" />;
            const rate = weekRate(w);
            return (
              <div
                key={w}
                className={`w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold ${
                  rate === null
                    ? "text-muted-foreground/40"
                    : rate === 100
                    ? "text-emerald-500"
                    : rate >= 80
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {rate !== null ? `${rate}%` : "—"}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
          {Object.entries(STATUS_CELL).map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded ${cfg.bg} inline-block`} />
              {cfg.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Momentum Badge ─────────────────────────────────────────────

function MomentumBadge({ momentum }: { momentum: SPCResult["momentum"] }) {
  const styles: Record<string, string> = {
    high: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    on_track: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    building: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    stalled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  const labels: Record<string, string> = {
    high: "High Momentum",
    on_track: "On Track",
    building: "Building",
    stalled: "Stalled",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[momentum]}`}>
      {labels[momentum]}
    </span>
  );
}

// ─── Trend Icon ─────────────────────────────────────────────────

function TrendIndicator({ trend }: { trend: SPCResult["trend"] }) {
  if (trend === "improving")
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
        <ArrowUpRight className="h-4 w-4" /> Improving
      </span>
    );
  if (trend === "declining")
    return (
      <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
        <ArrowDownRight className="h-4 w-4" /> Declining
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground text-sm font-medium">
      <Minus className="h-4 w-4" /> Stable
    </span>
  );
}

// ─── Signal Icon ────────────────────────────────────────────────

function SignalIcon({ type }: { type: Signal }) {
  switch (type) {
    case "out_of_control_high":
      return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    case "out_of_control_low":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "run_above":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "run_below":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "trend_up":
      return <TrendingUp className="h-4 w-4 text-blue-500" />;
    case "trend_down":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
}

// ─── Shared Theme Map ────────────────────────────────────────────

const themeMap: Record<string, string[]> = {
  love: ["love", "loving", "loved", "lovingly", "adore", "adoring", "heart", "self-love"],
  courage: ["courage", "courageous", "courageously", "bold", "boldly", "brave", "bravely", "daring"],
  power: ["power", "powerful", "powerfully", "empower", "empowers", "empowering", "strength", "strong"],
  trust: ["trust", "trusting", "trustingly", "faith", "faithful", "rely", "confidence"],
  commitment: ["commit", "committed", "commitment", "committedly", "dedicate", "dedicated", "dedication", "devoted", "devotion"],
  joy: ["joy", "joyful", "joyfully", "celebrate", "celebration", "delight", "happy", "happiness", "fun", "playful"],
  greatness: ["great", "greatness", "excellence", "excellent", "best", "exemplary", "outstanding"],
  wholeness: ["whole", "wholeness", "complete", "completeness", "full", "fully", "balanced"],
  vulnerability: ["vulnerable", "vulnerability", "open", "openness", "authentic", "genuine", "real"],
  care: ["care", "caring", "nurture", "nurturing", "compassion", "compassionate", "kind", "kindness"],
  gift: ["gift", "give", "giving", "generous", "generosity", "bless", "blessing", "grace", "divine", "god"],
  inspire: ["inspire", "inspiring", "inspiration", "inspires", "uplift", "uplifting", "motivate", "role model"],
  unstoppable: ["unstoppable", "relentless", "persistent", "persevere", "resilient", "resilience", "whatever it takes"],
  worthy: ["worthy", "worthiness", "worth", "deserving", "value", "self-worth"],
  passion: ["passion", "passionate", "passionately", "fire", "drive", "driven", "zest"],
  responsibility: ["responsible", "responsibly", "responsibility", "accountable", "accountability", "steward"],
  abundance: ["abundance", "abundant", "abundantly", "plenty", "prosper", "prosperity", "flourish"],
  freedom: ["freedom", "free", "liberation", "liberate", "independent", "independence"],
  gratitude: ["grateful", "gratitude", "thankful", "appreciation", "honor", "honoring"],
  miracle: ["miracle", "miracles", "miraculous", "wonder", "wondrous", "extraordinary"],
  creativity: ["creative", "creativity", "create", "creating", "build", "building", "design", "craft"],
};

// ─── Declaration Alignment Analysis ─────────────────────────────

interface AlignmentScore {
  goalId: string;
  goalType: "enrollment" | "personal" | "professional";
  goalStatement: string;
  values: string[];
  themeMatches: string[];
  valueAlignment: string[];
  missingThemes: string[];
  suggestions: string[];
  score: number; // 0–100
  insight: string;
}

interface AlignmentResult {
  declaration: string;
  overallScore: number;
  goalScores: AlignmentScore[];
  coachingInsight: string;
}

function analyzeAlignment(data: AlignmentData): AlignmentResult | null {
  if (!data.declaration || data.goals.length === 0) return null;

  const declaration = data.declaration.toLowerCase();

  // ─── PHILOSOPHY ──────────────────────────────────────────────────
  // The Declaration is the student's core identity statement — who they
  // are BEING. Goal statements and values should flow FROM the
  // declaration so that as students work toward their goals, they are
  // LIVING OUT their declaration. Goals are a manifestation of the
  // declaration; values are the qualities the student embodies while
  // pursuing those goals. Alignment is expected and should be
  // recognized, not questioned.
  // ──────────────────────────────────────────────────────────────────

  // Identify which themes are in the declaration
  const activeThemes: string[] = [];
  for (const [theme, keywords] of Object.entries(themeMap)) {
    if (keywords.some((kw) => declaration.includes(kw))) {
      activeThemes.push(theme);
    }
  }

  // Also extract meaningful words from declaration for direct matching
  const declarationWords = declaration
    .replace(/[^a-z\s'-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["the", "and", "for", "that", "with", "from", "this", "will", "have", "been", "not", "but", "its", "are", "was", "were", "has", "had"].includes(w));

  const goalScores: AlignmentScore[] = data.goals.map((goal) => {
    const stmt = goal.goalStatement.toLowerCase();
    const values = (goal.values || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const valuesLower = values.map((v) => v.toLowerCase());

    // 1. Theme presence: which declaration themes appear in the goal statement?
    const themeMatches: string[] = [];
    for (const theme of activeThemes) {
      const keywords = themeMap[theme];
      if (keywords.some((kw) => stmt.includes(kw))) {
        themeMatches.push(theme);
      }
    }

    // 2. Theme presence in values
    const valueThemeMatches: string[] = [];
    for (const theme of activeThemes) {
      const keywords = themeMap[theme];
      for (const vl of valuesLower) {
        if (keywords.some((kw) => vl.includes(kw)) || vl.includes(theme)) {
          if (!valueThemeMatches.includes(theme)) valueThemeMatches.push(theme);
          break;
        }
      }
    }

    // 3. Check which values are aligned (for highlighting in UI)
    const valueAlignment: string[] = [];
    for (let i = 0; i < values.length; i++) {
      const vl = valuesLower[i];
      // Check against ALL themes (not just active) for broader value recognition
      let aligned = false;
      for (const theme of activeThemes) {
        const keywords = themeMap[theme];
        if (keywords.some((kw) => vl.includes(kw)) || vl.includes(theme)) {
          aligned = true;
          break;
        }
      }
      // Also check direct word overlap with declaration
      if (!aligned) {
        for (const dw of declarationWords) {
          if (vl.includes(dw)) {
            aligned = true;
            break;
          }
        }
      }
      if (aligned) valueAlignment.push(values[i]);
    }

    // 4. Extended semantic bridges: goal language that EMBODIES the declaration
    // even without exact keyword matches (e.g., "cooking 48 bottles" embodies
    // "power" through committed action; "building habits" embodies "love" through self-care)
    const allThemesInGoal = new Set([...themeMatches]);
    const allThemesInValues = new Set([...valueThemeMatches]);
    const combinedThemes = new Set([...allThemesInGoal, ...allThemesInValues]);

    // Score components:
    // A. Declaration themes found in goal statement (0-1)
    const goalThemeCoverage = activeThemes.length > 0
      ? Math.min(themeMatches.length / activeThemes.length, 1)
      : 0;

    // B. Declaration themes echoed in values (0-1)
    const valueThemeCoverage = activeThemes.length > 0
      ? Math.min(valueThemeMatches.length / activeThemes.length, 1)
      : 0;

    // C. Proportion of values that connect to declaration (0-1)
    const valueAlignmentRatio = values.length > 0
      ? valueAlignment.length / values.length
      : 0;

    // D. Combined unique theme coverage across goal + values (0-1)
    const combinedCoverage = activeThemes.length > 0
      ? Math.min(combinedThemes.size / activeThemes.length, 1)
      : 0;

    // Weighted score: goals are designed to manifest the declaration,
    // so we use a generous weighting that recognizes alignment through
    // EITHER goal language OR values (not requiring both)
    const rawScore =
      combinedCoverage * 35 +     // Any theme present in goal OR values
      goalThemeCoverage * 25 +     // Themes in goal statement
      valueAlignmentRatio * 25 +   // Values connected to declaration
      valueThemeCoverage * 15;     // Themes in values

    // Minimum floor: if ANY theme matches in either goal or values,
    // there is at least foundational alignment (the goals were created
    // FROM the declaration)
    let score: number;
    if (combinedThemes.size > 0) {
      score = Math.max(Math.round(rawScore), 40 + combinedThemes.size * 8);
    } else {
      // Even with no keyword match, check if values share semantic space
      // with declaration through broader patterns
      const hasAnyBridge = values.length > 0 || stmt.length > 20;
      score = hasAnyBridge ? Math.max(Math.round(rawScore), 30) : Math.round(rawScore);
    }
    score = Math.min(score, 100);

    // Generate insight — always affirming the connection, with coaching
    // guidance on how to deepen it
    const matchedThemeNames = [...combinedThemes].join(", ");
    let insight: string;
    if (score >= 80) {
      insight = `This ${goal.goalType} goal powerfully manifests the declaration. As the student pursues this goal, they are living "${data.declaration}" through ${matchedThemeNames}. Celebrate this alignment in coaching.`;
    } else if (score >= 60) {
      insight = `This goal carries the spirit of the declaration through ${matchedThemeNames || "its intention"}. In coaching, ask: "As you work on this goal, how do you experience yourself as '${data.declaration}'?" to deepen the felt connection.`;
    } else if (score >= 40) {
      insight = `The foundation is here. Help the student see this goal as an expression of "${data.declaration}" by exploring: "What quality from your declaration are you bringing to this goal each week?"`;
    } else {
      insight = `Invite the student to reconnect this goal to their declaration: "How can pursuing this goal become a way of living '${data.declaration}' every day?"`;
    }

    // ─── Compute missing themes & suggestions ─────────────────────
    const missingThemes = activeThemes.filter((t) => !combinedThemes.has(t));

    const adverbs: Record<string, string> = {
      courage: "courageously", power: "powerfully", love: "lovingly",
      commitment: "committedly", joy: "joyfully", greatness: "with greatness",
      unstoppable: "relentlessly", care: "caringly", inspire: "inspiringly",
      passion: "passionately", freedom: "freely", gratitude: "gratefully",
      responsibility: "responsibly", abundance: "abundantly", creativity: "creatively",
      trust: "with trust", wholeness: "wholeheartedly", vulnerability: "openly",
      worthy: "with confidence", gift: "generously", miracle: "miraculously",
    };

    const suggestions: string[] = [];

    // Suggestion 1: Rewrite opener incorporating declaration language
    if (missingThemes.length > 0) {
      const picks = missingThemes.slice(0, 2).map((t) => adverbs[t] || t).join(" and ");
      const goalCore = goal.goalStatement.replace(/^I\s+(am\s+a\s+\S+.*?as\s+I|will|commit to|want to|am going to)\s*/i, "").slice(0, 60).trim();
      suggestions.push(`Rewrite the goal opener: "${picks.charAt(0).toUpperCase() + picks.slice(1)}, I commit to ${goalCore}…" — this anchors the declaration into daily action.`);
    }

    // Suggestion 2: Specific theme words missing from goal statement
    if (missingThemes.length > 0) {
      const wordExamples = missingThemes.slice(0, 2)
        .flatMap((t) => (themeMap[t] || [t]).slice(0, 2))
        .map((w) => `"${w}"`)
        .join(", ");
      suggestions.push(`Add declaration-aligned language to the goal statement — try including ${wordExamples} to make the connection explicit.`);
    }

    // Suggestion 3: Add missing themes as values
    const missingFromValues = missingThemes.filter((t) => !valueThemeMatches.includes(t));
    if (missingFromValues.length > 0) {
      const valueWords = missingFromValues.slice(0, 3).map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ");
      suggestions.push(`Add these as values to reflect the declaration: ${valueWords}. Values anchor the "how" — the way the student shows up while pursuing the goal.`);
    } else if (values.length === 0) {
      suggestions.push(`No values have been set. Add values that reflect the declaration themes: ${activeThemes.slice(0, 3).map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")}.`);
    }

    // Suggestion 4: Coaching question (always included)
    suggestions.push(`Coaching question: "As ${data.declaration}, which part of your declaration are you living most fully this week as you work toward this goal?"`);

    // Suggestion 5: Weekly ritual if score < 60
    if (score < 60) {
      suggestions.push(`Weekly ritual: Start each coaching session by reading the declaration aloud, then asking "How did I live this declaration this week through my actions toward this goal?"`);
    }

    return {
      goalId: goal.goalId,
      goalType: goal.goalType,
      goalStatement: goal.goalStatement,
      values,
      themeMatches: [...combinedThemes],
      valueAlignment,
      missingThemes,
      suggestions,
      score,
      insight,
    };
  });

  const overallScore = Math.round(
    goalScores.reduce((sum, g) => sum + g.score, 0) / goalScores.length
  );

  // Generate overall coaching insight — the declaration is the source,
  // goals are the manifestation, values are the qualities lived
  const topThemes = [...new Set(goalScores.flatMap((g) => g.themeMatches))];
  let coachingInsight: string;
  if (overallScore >= 80) {
    coachingInsight =
      `This student's goals are a powerful manifestation of their declaration "${data.declaration}." The themes of ${topThemes.join(", ")} run through their goals and values, creating a coherent path where achieving goals IS living the declaration. In coaching, reinforce: "You are already being who you declared yourself to be."`;
  } else if (overallScore >= 60) {
    coachingInsight =
      `The student's goals carry the essence of "${data.declaration}" through themes of ${topThemes.join(", ") || "shared intention"}. To strengthen the felt experience, use the declaration as a weekly touchstone: "This week, as you work on your goals, which part of your declaration are you living most fully?" This deepens alignment from intellectual to experiential.`;
  } else if (overallScore >= 40) {
    coachingInsight =
      `The seeds of alignment are present. Help the student see that their goals are already expressions of "${data.declaration}." A powerful coaching question: "If someone watched you pursue these goals, what would they see about who you are?" Guide them to recognize their declaration in action.`;
  } else {
    coachingInsight =
      `There is an opportunity to deepen the connection between the declaration and goals. In coaching, explore: "When you say '${data.declaration},' what does that look like in your daily life? How can each goal become a way of experiencing that?" This bridges declaration to lived experience.`;
  }

  return {
    declaration: data.declaration,
    overallScore,
    goalScores,
    coachingInsight,
  };
}

// ─── Action Plan Alignment Analysis ─────────────────────────────

interface ActionPlanGoalResult {
  goalType: "enrollment" | "personal" | "professional";
  goalStatement: string;
  overallScore: number;
  goalToMilestonesScore: number;
  milestonesToActionsScore: number;
  weeksWithActions: number;
  totalWeeks: number;
  disconnectedWeeks: number[];
  recommendation: string;
  rating: "Excellent" | "Acceptable" | "Moderate" | "Needs Work";
}

interface ActionPlanAlignmentResult {
  goalResults: ActionPlanGoalResult[];
  overallScore: number;
  coachingInsight: string;
}

const AP_STOP_WORDS = new Set([
  "the","and","for","that","with","from","this","will","have","been","not","but",
  "its","are","was","were","has","had","can","all","each","they","their","about",
  "into","more","also","when","then","than","who","what","how","per","via","by","as",
  "at","to","in","on","of","a","an","be","or","is","it","my","we","i","you","your",
]);

function apExtractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !AP_STOP_WORDS.has(w));
}

function analyzeActionPlanAlignment(
  data: AlignmentData
): ActionPlanAlignmentResult | null {
  if (data.goals.length === 0) return null;

  const goalResults: ActionPlanGoalResult[] = [];

  for (const goal of data.goals) {
    const goalKeywords = apExtractKeywords(goal.goalStatement);
    const expandedGoalTerms = new Set(goalKeywords);
    for (const kw of goalKeywords) {
      for (const family of Object.values(themeMap)) {
        if (family.includes(kw)) family.forEach((f) => expandedGoalTerms.add(f));
      }
    }

    const milestones = goal.milestones || [];
    const weeksWithActions = milestones.filter((m) => {
      try {
        const acts: { text: string }[] = JSON.parse(m.actions || "[]");
        return acts.some((a) => a.text.trim() !== "");
      } catch { return false; }
    }).length;

    let milestonesWithGoalAlignment = 0;
    let actionsAlignedCount = 0;
    let totalActionSets = 0;
    const disconnectedWeeks: number[] = [];

    for (const m of milestones) {
      const descKeywords = apExtractKeywords(m.milestoneDescription || "");
      const goalOverlap = descKeywords.filter((dk) => expandedGoalTerms.has(dk));
      if (goalOverlap.length > 0 || descKeywords.length === 0) milestonesWithGoalAlignment++;

      let actions: { text: string; done: boolean }[] = [];
      try { actions = JSON.parse(m.actions || "[]"); } catch {}
      const nonEmpty = actions.filter((a) => a.text.trim() !== "");

      if (nonEmpty.length > 0) {
        totalActionSets++;
        const actionText = nonEmpty.map((a) => a.text.toLowerCase()).join(" ");
        const actionKeywords = apExtractKeywords(actionText);
        const hasOverlap = actionKeywords.some(
          (ak) => descKeywords.includes(ak) || expandedGoalTerms.has(ak)
        );
        if (hasOverlap) {
          actionsAlignedCount++;
        } else {
          disconnectedWeeks.push(m.weekNumber);
        }
      }
    }

    const totalMilestones = milestones.length || 1;
    const goalToMilestonesScore = Math.round((milestonesWithGoalAlignment / totalMilestones) * 100);
    const milestonesToActionsScore =
      totalActionSets > 0 ? Math.round((actionsAlignedCount / totalActionSets) * 100) : 0;

    let overallScore: number;
    if (totalActionSets > 0) {
      overallScore = Math.round(goalToMilestonesScore * 0.4 + milestonesToActionsScore * 0.6);
    } else {
      overallScore = Math.round(goalToMilestonesScore * 0.5);
    }
    if (totalActionSets > 0 && overallScore < 30) overallScore = 30;

    const rating: ActionPlanGoalResult["rating"] =
      overallScore >= 80 ? "Excellent" :
      overallScore >= 60 ? "Acceptable" :
      overallScore >= 40 ? "Moderate" : "Needs Work";

    let recommendation: string;
    if (totalActionSets === 0) {
      recommendation = "No action plans written yet. Encourage specific weekly actions that directly serve the goal.";
    } else if (rating === "Excellent") {
      recommendation = `Strong coherence from goal → milestones → actions. ${actionsAlignedCount} of ${totalActionSets} weeks clearly connected.`;
    } else if (rating === "Acceptable") {
      recommendation = disconnectedWeeks.length > 0
        ? `Weeks ${disconnectedWeeks.join(", ")} could be more directly tied to the goal statement.`
        : "Good foundation. Encourage stronger goal language in weekly action descriptions.";
    } else if (rating === "Moderate") {
      recommendation = `Goal-to-milestone: ${goalToMilestonesScore}%, milestone-to-actions: ${milestonesToActionsScore}%. Ask: "How does this week's plan move you toward your goal?"`;
    } else {
      recommendation = `Action plans aren't clearly connected to the goal. Ask: "If someone read only your actions, would they know what goal you're pursuing?"`;
    }

    goalResults.push({
      goalType: goal.goalType,
      goalStatement: goal.goalStatement,
      overallScore,
      goalToMilestonesScore,
      milestonesToActionsScore,
      weeksWithActions,
      totalWeeks: milestones.length,
      disconnectedWeeks,
      recommendation,
      rating,
    });
  }

  const overallScore =
    goalResults.length > 0
      ? Math.round(goalResults.reduce((s, r) => s + r.overallScore, 0) / goalResults.length)
      : 0;

  const weakest = goalResults.slice().sort((a, b) => a.overallScore - b.overallScore)[0];
  const strongest = goalResults.slice().sort((a, b) => b.overallScore - a.overallScore)[0];

  let coachingInsight: string;
  if (overallScore >= 80) {
    coachingInsight = `Excellent action plan coherence across all three goals. The student's weekly actions clearly serve their goals — affirm this in coaching and challenge them to deepen intention in each action step.`;
  } else if (overallScore >= 60) {
    coachingInsight = `Good overall coherence. The ${strongest?.goalType} goal shows strong action alignment. Focus coaching attention on the ${weakest?.goalType} goal — ask: "How does each action this week move you toward your goal?"`;
  } else if (overallScore >= 40) {
    coachingInsight = `Partial alignment. Help the student see the thread: Goal → Weekly Milestone → Daily Actions. Ask: "When you wrote these actions, what goal outcome were you aiming for?"`;
  } else {
    coachingInsight = `Action plans need stronger connection to goals. In coaching, rebuild the thread from goal statement to weekly milestone to specific actions. This is a foundational coaching conversation.`;
  }

  return { goalResults, overallScore, coachingInsight };
}

// ─── Alignment Score Ring ───────────────────────────────────────

function AlignmentRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  const color =
    score >= 75
      ? "#10b981"
      : score >= 50
      ? "#3b82f6"
      : score >= 25
      ? "#f59e0b"
      : "#ef4444";

  return (
    <svg width={72} height={72} viewBox="0 0 72 72">
      <circle
        cx={36}
        cy={36}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.1}
        strokeWidth={5}
      />
      <circle
        cx={36}
        cy={36}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - filled}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        className="transition-all duration-700"
      />
      <text
        x={36}
        y={36}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground font-bold"
        fontSize={16}
      >
        {score}
      </text>
    </svg>
  );
}

// ─── Goal Alignment Card ────────────────────────────────────────

function GoalAlignmentCard({
  gs,
  canEdit,
  onSaved,
}: {
  gs: AlignmentScore;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const goalLabels: Record<string, string> = {
    enrollment: "Enrollment Goal",
    personal: "Personal Goal",
    professional: "Professional Goal",
  };
  const goalIcons: Record<string, typeof Heart> = {
    enrollment: Sparkles,
    personal: Heart,
    professional: Compass,
  };
  const Icon = goalIcons[gs.goalType] || Sparkles;

  const barColor =
    gs.score >= 75
      ? "bg-emerald-500"
      : gs.score >= 50
      ? "bg-blue-500"
      : gs.score >= 25
      ? "bg-amber-500"
      : "bg-red-500";

  const alignmentLabel =
    gs.score >= 80 ? "Excellent Alignment" :
    gs.score >= 60 ? "Good Alignment" :
    gs.score >= 40 ? "Developing Alignment" :
    "Needs Alignment";

  const alignmentColors =
    gs.score >= 80
      ? { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", bg: "bg-emerald-50 dark:bg-emerald-950/20" }
      : gs.score >= 60
      ? { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800", bg: "bg-blue-50 dark:bg-blue-950/20" }
      : gs.score >= 40
      ? { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800", bg: "bg-amber-50 dark:bg-amber-950/20" }
      : { badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800", bg: "bg-red-50 dark:bg-red-950/20" };

  const { setActiveL3Tab } = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [draftStatement, setDraftStatement] = useState(gs.goalStatement);
  const [draftValues, setDraftValues] = useState<string[]>(gs.values);
  const [valueInput, setValueInput] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSaveGoal() {
    setSaving(true);
    try {
      await updateGoal(gs.goalId, {
        goalStatement: draftStatement.trim(),
        valuesDeclaration: draftValues.join(", "),
      });
      setIsEditing(false);
      onSaved();
      setActiveL3Tab("goals");
    } catch (e) {
      console.error("Failed to save goal:", e);
    } finally {
      setSaving(false);
    }
  }

  function handleAddValue() {
    const v = valueInput.trim();
    if (v && !draftValues.includes(v)) {
      setDraftValues([...draftValues, v]);
    }
    setValueInput("");
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">{goalLabels[gs.goalType]}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${alignmentColors.badge}`}>
            {alignmentLabel}
          </span>
          <span className="text-sm font-bold">{gs.score}%</span>
          {canEdit && !isEditing && (
            <button
              onClick={() => { setDraftStatement(gs.goalStatement); setDraftValues(gs.values); setIsEditing(true); }}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Edit goal"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${gs.score}%` }}
        />
      </div>

      {/* Low-score CTA */}
      {gs.score < 60 && !isEditing && (
        <button
          onClick={() => setActiveL3Tab("goals")}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
        >
          <AlertTriangle className="h-3 w-3" />
          Edit in Goals
          <ArrowRight className="h-3 w-3" />
        </button>
      )}

      {/* Goal statement — editable or read-only */}
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Goal Statement</p>
            <textarea
              value={draftStatement}
              onChange={(e) => setDraftStatement(e.target.value)}
              rows={3}
              className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Values</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {draftValues.map((v) => (
                <span key={v} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {v}
                  <button onClick={() => setDraftValues(draftValues.filter((x) => x !== v))} className="hover:text-red-500">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddValue())}
                placeholder="Add value, press Enter"
                className="flex-1 text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={handleAddValue} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80">+</button>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSaveGoal}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Check className="h-3 w-3" />
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Goal statement — full */}
          <p className="text-sm text-foreground/80 leading-relaxed">
            &ldquo;{gs.goalStatement}&rdquo;
          </p>

          {/* Values */}
          <div className="flex flex-wrap gap-1.5">
            {gs.values.map((v) => {
              const aligned = gs.valueAlignment.includes(v);
              return (
                <span
                  key={v}
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    aligned
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {v}
                  {aligned && " \u2713"}
                </span>
              );
            })}
          </div>

          {/* Theme matches */}
          {gs.themeMatches.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Declaration themes found:{" "}
              <span className="text-foreground font-medium">
                {gs.themeMatches.join(", ")}
              </span>
            </p>
          )}

          {/* Coaching Insight + Suggestions */}
          <div className={`rounded-lg border p-3 space-y-2 ${alignmentColors.border} ${alignmentColors.bg}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${alignmentColors.label}`}>
              {gs.score >= 80 ? "✨ Coaching Insight" : gs.score >= 60 ? "💡 How to Strengthen" : gs.score >= 40 ? "📝 Alignment Suggestions" : "⚠️ Action Needed"}
            </p>
            <p className="text-xs text-foreground/80 italic">{gs.insight}</p>
            {gs.suggestions.length > 0 && (
              <ul className="space-y-1.5 pt-1 border-t border-current/10">
                {gs.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <span className={`shrink-0 mt-0.5 font-bold ${alignmentColors.label}`}>{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function FeedbackTab({ studentId, view = "all" }: { studentId: string; view?: "all" | "attendance" | "assessments" }) {
  const { user, setActiveL3Tab } = useNavigation();
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [alignmentData, setAlignmentData] = useState<AlignmentData | null>(null);
  const [events, setEvents] = useState<ProgramEvent[]>([]);
  const [batchStartDate, setBatchStartDate] = useState("2026-02-02");
  const [currentWeek, setCurrentWeek] = useState(8);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Declaration editing state
  const [editingDecl, setEditingDecl] = useState(false);
  const [declDraft, setDeclDraft] = useState("");
  const [savingDecl, setSavingDecl] = useState(false);

  // Role-based edit permission:
  // Coach can edit any student in their council
  // Student can edit their own
  // HC is read-only
  const canEdit =
    user.role === "coach" ||
    user.role === "head_coach" ||
    (user.role === "student" && user.userId === studentId) ||
    (user.role === "council_leader" && user.userId === studentId);

  const refreshAlignment = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    async function load() {
      try {
        const [attData, alData, weekInfo] = await Promise.all([
          getStudentAttendance(studentId),
          getStudentAlignment(studentId),
          getBatchWeekInfo(),
        ]);
        setAttendance(attData as AttendanceRow[]);
        setAlignmentData(alData);
        setEvents(weekInfo.events);
        setBatchStartDate(weekInfo.batchStartDate);
        setCurrentWeek(weekInfo.currentWeek);
      } catch (error) {
        console.error("Failed to load feedback data:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId, refreshKey]);

  async function handleSaveDeclaration() {
    if (!declDraft.trim()) return;
    setSavingDecl(true);
    try {
      if (user.role === "student" || user.role === "council_leader") {
        await updateMyDeclaration(declDraft);
      } else if (user.role === "coach" || user.role === "head_coach") {
        await updateDeclarationForStudent(studentId, declDraft);
      }
      setEditingDecl(false);
      refreshAlignment();
    } catch (e) {
      console.error("Failed to save declaration:", e);
    } finally {
      setSavingDecl(false);
    }
  }

  if (loading) {
    return <div className="h-96 bg-muted animate-pulse rounded-xl" />;
  }

  const spc = computeSPC(attendance, events, batchStartDate);
  const dayRates = {
    Mon: computeDayRate(attendance, "callMon"),
    Tue: computeDayRate(attendance, "callTue"),
    Wed: computeDayRate(attendance, "callWed"),
    Thu: computeDayRate(attendance, "callThu"),
    Fri: computeDayRate(attendance, "callFri"),
    Sat: computeDayRate(attendance, "callSat"),
    Sun: computeDayRate(attendance, "callSun"),
  };
  const eventRates = computeEventCategoryRates(attendance, events);
  const alignment = alignmentData ? analyzeAlignment(alignmentData) : null;
  const actionPlanAlignment = alignmentData
    ? analyzeActionPlanAlignment(alignmentData)
    : null;

  return (
    <div className="space-y-6">

      {/* ─── Attendance Analysis (SPC / Heatmap / Coaching) ─── */}
      {view !== "assessments" && <details className="group">
        <summary className="flex items-center gap-3 cursor-pointer list-none mb-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            Attendance Performance Assessment
            <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary group-open:rotate-180 transition-transform duration-200">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
          </span>
          <div className="h-px flex-1 bg-border" />
        </summary>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3 items-start">

        {/* Left: Control Chart */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold text-sm">Attendance Heatmap</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground">Overall <span className="font-bold text-foreground">{spc.overallRate}%</span></span>
              <span className="text-xs text-muted-foreground">Meeting <span className="font-bold text-foreground">{spc.meetingRate}%</span></span>
              <span className="text-xs text-muted-foreground">Calls <span className="font-bold text-foreground">{spc.callRate}%</span></span>
              {Object.entries(eventRates).map(([key, ev]) => (
                <span key={key} className="text-xs text-muted-foreground">{ev.label} <span className="font-bold text-foreground">{ev.rate}%</span></span>
              ))}
              <TrendIndicator trend={spc.trend} />
              <MomentumBadge momentum={spc.momentum} />
            </div>
          </div>
          <AttendanceHeatmap
            attendance={attendance}
            events={events}
            batchStartDate={batchStartDate}
            spc={spc}
            currentWeek={currentWeek}
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground px-1">
            <span>X̄ = {Math.round(spc.mean)}% | SD = {Math.round(spc.stdDev)}%</span>
            <span>UCL = {Math.round(spc.ucl)}% | LCL = {Math.round(spc.lcl)}%</span>
          </div>
        </div>

        {/* Right: Signals + Flags stacked */}
        <div className="flex flex-col gap-3">
          {/* Process Signals */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <h3 className="font-semibold text-xs p-2.5 px-3 border-b border-border flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Process Signals ({spc.signals.length})
            </h3>
            {spc.signals.length === 0 ? (
              <p className="text-xs text-muted-foreground italic px-3 py-2.5">No signals this period.</p>
            ) : (
              <div className="divide-y divide-border">
                {spc.signals.map((signal, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 text-xs">
                    <SignalIcon type={signal.type} />
                    <span className="leading-relaxed">{signal.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance Flags */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <h3 className="font-semibold text-xs p-2.5 px-3 border-b border-border flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Attendance Flags ({spc.coachingFlags.length})
            </h3>
            <div className="p-2.5 flex flex-col gap-1.5">
              {spc.coachingFlags.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No flags.</p>
              ) : spc.coachingFlags.map((flag, i) => {
                const isPositive = flag.includes("Exemplary") || flag.includes("Positive") || flag.includes("within expected");
                const isWarning = flag.includes("low") || flag.includes("Low") || flag.includes("declining") || flag.includes("stalled") || flag.includes("Stalled") || flag.includes("drop") || flag.includes("variability");
                const chipColor = isPositive
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : isWarning
                  ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300";
                const Icon = isPositive ? CheckCircle2 : AlertTriangle;
                return (
                  <div key={i} className={`flex items-start gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] ${chipColor}`}>
                    <Icon className="h-3 w-3 shrink-0 mt-0.5" />
                    <span className="leading-snug">{flag}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
      </details>}

      {/* ─── Post Declaration Assessment ─── */}
      {view === "assessments" && !alignmentData && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No assessment data yet. Goals and declarations must be set first.</p>
        </div>
      )}
      {view !== "attendance" && alignmentData && (
        <>
          <details className="group">
          <summary className="flex items-center gap-3 pt-2 cursor-pointer list-none">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              Post Declaration Assessment
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary group-open:rotate-180 transition-transform duration-200">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </span>
            <div className="h-px flex-1 bg-border" />
          </summary>

          {/* No declaration set — show placeholder */}
          {!alignment && (
            <div className="bg-card rounded-xl border border-border p-5 text-center space-y-3">
              <p className="text-sm text-muted-foreground">No declaration has been set for this student yet.</p>
              {canEdit && (
                <button
                  onClick={() => setEditingDecl(true)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mx-auto"
                >
                  <Pencil className="h-3 w-3" /> Add Declaration
                </button>
              )}
            </div>
          )}

          {/* Declaration + Overall Score */}
          {alignment && <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start gap-5">
              <AlignmentRing score={alignment.overallScore} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Declaration</p>
                  {canEdit && !editingDecl && (
                    <button
                      onClick={() => { setDeclDraft(alignment.declaration); setEditingDecl(true); }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  )}
                </div>
                {editingDecl ? (
                  <div className="space-y-2">
                    <textarea
                      value={declDraft}
                      onChange={(e) => setDeclDraft(e.target.value)}
                      rows={2}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveDeclaration}
                        disabled={savingDecl}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        <Check className="h-3 w-3" />
                        {savingDecl ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingDecl(false)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg font-semibold leading-tight">
                    &ldquo;{alignment.declaration}&rdquo;
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Overall Alignment Score:{" "}
                  <span className="font-bold text-foreground">
                    {alignment.overallScore}%
                  </span>
                </p>
              </div>
            </div>
          </div>}

          {/* Per-goal alignment cards */}
          {alignment && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alignment.goalScores
              .sort((a, b) => {
                const order = { enrollment: 0, personal: 1, professional: 2 };
                return order[a.goalType] - order[b.goalType];
              })
              .map((gs) => (
                <GoalAlignmentCard key={gs.goalType} gs={gs} canEdit={canEdit} onSaved={refreshAlignment} />
              ))}
          </div>}

          {/* Declaration alignment coaching insight */}
          {alignment && <div className="bg-card rounded-xl border border-border overflow-hidden">
            <h3 className="font-semibold text-sm p-4 border-b border-border flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Declaration Assessment Coaching Insight
            </h3>
            <div className="p-4 text-sm text-muted-foreground">
              {alignment.coachingInsight}
            </div>
          </div>}

          {/* Alignment explainer */}
          <details className="bg-card rounded-xl border border-border">
            <summary className="p-4 text-sm font-medium cursor-pointer hover:bg-muted/50 transition-colors">
              What is Declaration Assessment?
            </summary>
            <div className="px-4 pb-4 text-sm text-muted-foreground space-y-2">
              <p>
                The <strong>Declaration</strong> is the student&apos;s core identity
                statement — who they are <em>being</em>. It is the foundation from which
                all goals and values flow. Goal statements are designed as a
                <strong> manifestation</strong> of the declaration, so that as students
                achieve their goals, they <em>experience and live out</em> their declaration.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Declaration as Source</p>
                  <p>
                    The declaration is not separate from the goals — it is the
                    <em> source</em>. Each goal is an expression of the declaration
                    in a specific life domain (enrollment, personal, professional).
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Values as Qualities</p>
                  <p>
                    Values are the qualities the student embodies while pursuing
                    their goals. Values marked with &ldquo;&#10003;&rdquo; directly
                    echo the declaration&apos;s themes, showing the student is
                    <em> being</em> their declaration in action.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Living the Declaration</p>
                  <p>
                    Alignment means the student experiences their declaration
                    through their goals — not as something to achieve <em>someday</em>,
                    but as who they <em>already are</em> while pursuing their goals.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Coaching Application</p>
                  <p>
                    Use alignment insights to deepen the student&apos;s experience:
                    &ldquo;As you work on this goal, how are you experiencing yourself
                    as your declaration?&rdquo; This moves from doing to being.
                  </p>
                </div>
              </div>
            </div>
          </details>
          </details>
        </>
      )}

      {/* ─── Post Action Plan Assessment ─── */}
      {view !== "attendance" && alignmentData && (
        <>
          <details className="group">
          <summary className="flex items-center gap-3 pt-2 cursor-pointer list-none">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              Post Action Plan Assessment
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary group-open:rotate-180 transition-transform duration-200">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </span>
            <div className="h-px flex-1 bg-border" />
          </summary>

          {/* No goals — placeholder */}
          {(!actionPlanAlignment || actionPlanAlignment.goalResults.length === 0) && (
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <p className="text-sm text-muted-foreground">No goals have been set for this student yet.</p>
            </div>
          )}

          {/* Overall score card */}
          {actionPlanAlignment && actionPlanAlignment.goalResults.length > 0 && <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start gap-5">
              <AlignmentRing score={actionPlanAlignment.overallScore} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Action Plan Coherence</p>
                <p className="text-lg font-semibold leading-tight">
                  Goal → Milestone → Actions
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Overall Alignment Score:{" "}
                  <span className="font-bold text-foreground">
                    {actionPlanAlignment.overallScore}%
                  </span>
                </p>
              </div>
            </div>
          </div>}

          {/* Per-goal cards */}
          {actionPlanAlignment && actionPlanAlignment.goalResults.length > 0 && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actionPlanAlignment.goalResults
              .sort((a, b) => {
                const order = { enrollment: 0, personal: 1, professional: 2 };
                return order[a.goalType] - order[b.goalType];
              })
              .map((r) => {
                const Icon = { enrollment: Sparkles, personal: Heart, professional: Compass }[r.goalType] || Sparkles;
                const label = { enrollment: "Enrollment Goal", personal: "Personal Goal", professional: "Professional Goal" }[r.goalType];
                const barColor = r.overallScore >= 80 ? "bg-emerald-500" : r.overallScore >= 60 ? "bg-blue-500" : r.overallScore >= 40 ? "bg-amber-500" : "bg-red-500";
                const badgeColor = r.overallScore >= 80
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                  : r.overallScore >= 60
                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                  : r.overallScore >= 40
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
                return (
                  <button key={r.goalType} onClick={() => setActiveL3Tab("goals")} className="bg-card rounded-xl border border-border p-4 space-y-3 text-left w-full hover:border-primary/50 transition-colors group">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">{label}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeColor}`}>
                        {r.rating}
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Overall</span>
                        <span className="font-bold">{r.overallScore}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${r.overallScore}%` }} />
                      </div>
                    </div>

                    {/* Sub-scores */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Goal → Milestones</span>
                        <span className="font-medium">{r.goalToMilestonesScore}%</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-400 transition-all duration-700" style={{ width: `${r.goalToMilestonesScore}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Milestones → Actions</span>
                        <span className="font-medium">{r.milestonesToActionsScore}%</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-green-400 transition-all duration-700" style={{ width: `${r.milestonesToActionsScore}%` }} />
                      </div>
                    </div>

                    {/* Coverage */}
                    <p className="text-[11px] text-muted-foreground">
                      {r.weeksWithActions} of {r.totalWeeks} weeks have action plans
                    </p>

                    {/* Recommendation */}
                    <p className="text-xs text-foreground/80 italic border-t border-border pt-2">
                      {r.recommendation}
                    </p>
                  </button>
                );
              })}
          </div>}

          {/* Action plan coaching insight — clickable → goals */}
          {actionPlanAlignment && actionPlanAlignment.goalResults.length > 0 && <button
            onClick={() => setActiveL3Tab("goals")}
            className="w-full bg-card rounded-xl border border-border overflow-hidden text-left hover:border-primary/50 transition-colors group"
          >
            <h3 className="font-semibold text-sm p-4 border-b border-border flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Action Plan Assessment Coaching Insight
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary ml-auto transition-colors" />
            </h3>
            <div className="p-4 text-sm text-muted-foreground">
              {actionPlanAlignment.coachingInsight}
            </div>
          </button>}

          {/* What is Action Plan Alignment? */}
          <details className="bg-card rounded-xl border border-border">
            <summary className="p-4 text-sm font-medium cursor-pointer hover:bg-muted/50 transition-colors">
              What is Action Plan Assessment?
            </summary>
            <div className="px-4 pb-4 text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Action Plan Alignment</strong> measures how well a student&apos;s
                weekly actions actually serve their stated goals — the thread from
                <em> Goal → Weekly Milestone → Daily Actions</em>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Goal → Milestones</p>
                  <p>
                    Each week&apos;s milestone description should clearly connect to the
                    goal statement. If the weekly focus drifts from the goal, progress
                    becomes scattered.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Milestones → Actions</p>
                  <p>
                    The specific action items each week should directly support the
                    milestone. Misaligned actions waste effort on tasks that don&apos;t
                    move the goal forward.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Post-Planning Assessment</p>
                  <p>
                    Unlike the Action Planner (which guides planning), this assessment
                    reviews what was <em>actually written</em> — giving coaches a
                    real view of coherence after the fact.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Coaching Application</p>
                  <p>
                    Use alignment gaps to ask: &ldquo;When you wrote these actions, what
                    goal outcome were you aiming for?&rdquo; This rebuilds the
                    intention-action connection.
                  </p>
                </div>
              </div>
            </div>
          </details>
          </details>
        </>
      )}

    </div>
  );
}
