"use client";

import { useEffect, useState, useCallback } from "react";
import { getStudentAttendance, updateAttendance, getBatchWeekInfo } from "@/lib/actions/attendance";
import { useNavigation } from "@/components/layout/DashboardShell";
import { ChevronDown, ChevronRight, Star, Zap, Coffee } from "lucide-react";
import type { ProgramEvent } from "@/lib/actions/program";

function getWeekDateRange(weekNumber: number, batchStartDate: string): { label: string; start: Date; end: Date } {
  const [y, m, d] = batchStartDate.split("-").map(Number);
  const start = new Date(y, m - 1, d + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmt = (dt: Date) => `${days[dt.getDay()]} ${months[dt.getMonth()]} ${dt.getDate()}`;
  return { label: `${fmt(start)} – ${fmt(end)}`, start, end };
}

function getEventsForWeek(events: ProgramEvent[], weekNumber: number, batchStartDate: string): ProgramEvent[] {
  if (!events.length || !batchStartDate) return [];
  const { start, end } = getWeekDateRange(weekNumber, batchStartDate);
  return events.filter((evt) => {
    if (!evt.date) return false;
    const evtDate = new Date(evt.date + "T00:00:00");
    return evtDate >= start && evtDate <= end;
  });
}

interface AttendanceRow {
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
  eventAttendance: string | null; // JSON: { eventId: status }
}

const statusColors: Record<string, string> = {
  present: "bg-success text-white",
  late: "bg-warning text-white",
  absent: "bg-destructive text-white",
  no_data: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  present: "P",
  late: "L",
  absent: "A",
  no_data: "-",
};

const STATUS_CYCLE = ["no_data", "present", "late", "absent"] as const;
type AttendanceStatus = typeof STATUS_CYCLE[number];

function nextStatus(current: string): AttendanceStatus {
  const idx = STATUS_CYCLE.indexOf(current as AttendanceStatus);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

function parseEventAttendance(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

type AttendanceField = "meetingStatus" | "meetingMon" | "meetingTue" | "meetingWed" | "meetingThu" | "meetingFri" | "meetingSat" | "meetingSun" | "callMon" | "callTue" | "callWed" | "callThu" | "callFri" | "callSat" | "callSun";

export function AttendanceTab({ studentId }: { studentId: string }) {
  const { user } = useNavigation();
  const canEdit = user.role === "coach" || user.role === "head_coach";

  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(8);
  const [batchStartDate, setBatchStartDate] = useState<string>("2026-02-02");
  const [events, setEvents] = useState<ProgramEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    try {
      const [data, info] = await Promise.all([
        getStudentAttendance(studentId),
        getBatchWeekInfo(),
      ]);
      setAttendance(data as AttendanceRow[]);
      setCurrentWeek(info.currentWeek);
      setBatchStartDate(info.batchStartDate);
      setEvents(info.events);
      setExpandedWeeks(new Set([info.currentWeek]));
    } catch (error) {
      console.error("Failed to load attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusClick = async (weekNumber: number, field: AttendanceField, currentStatus: string) => {
    if (!canEdit) return;
    const next = nextStatus(currentStatus);
    setAttendance((prev) =>
      prev.map((row) =>
        row.weekNumber === weekNumber ? { ...row, [field]: next } : row
      )
    );
    try {
      await updateAttendance(studentId, weekNumber, { [field]: next });
    } catch (error) {
      console.error("Failed to update attendance:", error);
      load();
    }
  };

  const handleEventStatusClick = async (weekNumber: number, eventId: string, currentStatus: string) => {
    if (!canEdit) return;
    const next = nextStatus(currentStatus);
    setAttendance((prev) =>
      prev.map((row) => {
        if (row.weekNumber !== weekNumber) return row;
        const parsed = parseEventAttendance(row.eventAttendance);
        return { ...row, eventAttendance: JSON.stringify({ ...parsed, [eventId]: next }) };
      })
    );
    try {
      await updateAttendance(studentId, weekNumber, { eventAttendance: { [eventId]: next } });
    } catch (error) {
      console.error("Failed to update event attendance:", error);
      load();
    }
  };

  if (loading) {
    return <div className="h-96 bg-muted animate-pulse rounded-xl" />;
  }

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  // Build 12-week grid
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const week = i + 1;
    const row = attendance.find((a) => a.weekNumber === week);
    return {
      weekNumber: week,
      meetingStatus: row?.meetingStatus || "no_data",
      meetingMon: row?.meetingMon || "no_data",
      meetingTue: row?.meetingTue || "no_data",
      meetingWed: row?.meetingWed || "no_data",
      meetingThu: row?.meetingThu || "no_data",
      meetingFri: row?.meetingFri || "no_data",
      meetingSat: row?.meetingSat || "no_data",
      meetingSun: row?.meetingSun || "no_data",
      callMon: row?.callMon || "no_data",
      callTue: row?.callTue || "no_data",
      callWed: row?.callWed || "no_data",
      callThu: row?.callThu || "no_data",
      callFri: row?.callFri || "no_data",
      callSat: row?.callSat || "no_data",
      callSun: row?.callSun || "no_data",
      eventAttendance: row?.eventAttendance || null,
    };
  });

  // Consistency score — includes event slots
  const totalSlots = weeks.reduce((acc, w) => {
    const base = [w.meetingMon, w.meetingTue, w.meetingWed, w.meetingThu, w.meetingFri, w.meetingSat, w.meetingSun, w.callMon, w.callTue, w.callWed, w.callThu, w.callFri, w.callSat, w.callSun];
    const baseCount = base.filter((s) => s !== "no_data").length;
    const weekEvents = getEventsForWeek(events, w.weekNumber, batchStartDate);
    const evtMap = parseEventAttendance(w.eventAttendance);
    const evtCount = weekEvents.filter((e) => evtMap[e.id] && evtMap[e.id] !== "no_data").length;
    return acc + baseCount + evtCount;
  }, 0);

  const presentSlots = weeks.reduce((acc, w) => {
    const base = [w.meetingMon, w.meetingTue, w.meetingWed, w.meetingThu, w.meetingFri, w.meetingSat, w.meetingSun, w.callMon, w.callTue, w.callWed, w.callThu, w.callFri, w.callSat, w.callSun];
    const baseCount = base.filter((s) => s === "present").length;
    const weekEvents = getEventsForWeek(events, w.weekNumber, batchStartDate);
    const evtMap = parseEventAttendance(w.eventAttendance);
    const evtCount = weekEvents.filter((e) => evtMap[e.id] === "present").length;
    return acc + baseCount + evtCount;
  }, 0);

  const consistencyScore = totalSlots > 0 ? Math.round((presentSlots / totalSlots) * 100) : 0;

  const statusBtn = (weekNumber: number, field: AttendanceField, status: string) => (
    <button
      onClick={() => handleStatusClick(weekNumber, field, status)}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-md text-sm font-bold transition-all
        ${statusColors[status]}
        ${canEdit ? "cursor-pointer hover:opacity-80 active:scale-95" : "cursor-default"}`}
      title={canEdit ? `Click to change (${statusLabels[status]})` : undefined}
    >
      {statusLabels[status]}
    </button>
  );

  const eventStatusBtn = (weekNumber: number, eventId: string, status: string) => (
    <button
      onClick={() => handleEventStatusClick(weekNumber, eventId, status)}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-md text-sm font-bold transition-all
        ${statusColors[status] ?? statusColors.no_data}
        ${canEdit ? "cursor-pointer hover:opacity-80 active:scale-95" : "cursor-default"}`}
      title={canEdit ? `Click to change (${statusLabels[status] ?? "-"})` : undefined}
    >
      {statusLabels[status] ?? "-"}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Consistency score */}
      <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-black text-primary">{consistencyScore}%</p>
          <p className="text-sm text-muted-foreground">Consistency</p>
        </div>
        <div className="flex-1">
          <div className="w-full bg-muted rounded-full h-5">
            <div
              className="bg-primary h-5 rounded-full transition-all"
              style={{ width: `${consistencyScore}%` }}
            />
          </div>
        </div>
        {canEdit && (
          <p className="text-sm text-muted-foreground italic">Click any button to change status</p>
        )}
      </div>

      {/* Combined weekly attendance */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <h3 className="text-lg font-bold p-4 border-b border-border">
          Weekly Attendance
        </h3>
        <div className="divide-y divide-border">
          {weeks.map((week) => {
            const expanded = expandedWeeks.has(week.weekNumber);
            const allStatuses = [week.meetingMon, week.meetingTue, week.meetingWed, week.meetingThu, week.meetingFri, week.meetingSat, week.meetingSun, week.callMon, week.callTue, week.callWed, week.callThu, week.callFri, week.callSat, week.callSun];
            const allNoData = allStatuses.every((s) => s === "no_data");
            const present = allStatuses.filter((s) => s === "present").length;
            const tracked = allStatuses.filter((s) => s !== "no_data").length;
            const isCurrent = week.weekNumber === currentWeek;
            const weekEvents = getEventsForWeek(events, week.weekNumber, batchStartDate);
            const evtMap = parseEventAttendance(week.eventAttendance);
            const { label: weekLabel } = getWeekDateRange(week.weekNumber, batchStartDate);

            return (
              <div key={week.weekNumber} className={isCurrent ? "bg-primary/5" : ""}>
                {/* Summary row */}
                <button
                  onClick={() => toggleWeek(week.weekNumber)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left
                    ${isCurrent ? "border-l-2 border-primary" : ""}`}
                >
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold">Week {week.weekNumber}</span>
                      {isCurrent && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Current
                        </span>
                      )}
                      {weekEvents.length > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-600 flex items-center gap-0.5">
                          <Star className="h-3 w-3" />
                          {weekEvents.length} event{weekEvents.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground leading-tight">{weekLabel}</span>
                  </div>
                  <div className="flex-1" />
                  {allNoData && weekEvents.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No data</span>
                  ) : (
                    <span className="text-base font-semibold text-muted-foreground">
                      {present}/{tracked} present
                    </span>
                  )}
                  {/* Mini status dots */}
                  <div className="flex gap-1">
                    {[
                      week.meetingMon,
                      week.meetingTue,
                      week.meetingWed,
                      week.meetingThu,
                      week.meetingFri,
                      week.meetingSat,
                      week.meetingSun,
                      week.callMon,
                      week.callTue,
                      week.callWed,
                      week.callThu,
                      week.callFri,
                      week.callSat,
                      week.callSun,
                    ].map((status, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          status === "present"
                            ? "bg-success"
                            : status === "late"
                            ? "bg-warning"
                            : status === "absent"
                            ? "bg-destructive"
                            : "bg-muted-foreground/30"
                        }`}
                      />
                    ))}
                    {weekEvents.map((evt) => {
                      const s = evtMap[evt.id] || "no_data";
                      return (
                        <span
                          key={evt.id}
                          className={`w-2 h-2 rounded-full ${
                            s === "present" ? "bg-success"
                            : s === "late" ? "bg-warning"
                            : s === "absent" ? "bg-destructive"
                            : "bg-yellow-400/40"
                          }`}
                          title={evt.name}
                        />
                      );
                    })}
                  </div>
                </button>

                {/* Expanded detail */}
                {expanded && (
                  <div className="px-4 pb-4 pt-0 ml-7 space-y-3">
                    {/* Meeting — per-day */}
                    <div className="flex items-center gap-3">
                      <span className="text-base text-muted-foreground w-28">Meeting</span>
                      <div className="flex gap-2">
                        {(
                          [
                            { label: "M", key: "meetingMon" },
                            { label: "T", key: "meetingTue" },
                            { label: "W", key: "meetingWed" },
                            { label: "T", key: "meetingThu" },
                            { label: "F", key: "meetingFri" },
                            { label: "Sa", key: "meetingSat" },
                            { label: "Su", key: "meetingSun" },
                          ] as const
                        ).map((day) => {
                          const status = week[day.key] as string;
                          return (
                            <div key={day.key} className="flex flex-col items-center gap-1">
                              <span className="text-xs text-muted-foreground">{day.label}</span>
                              {statusBtn(week.weekNumber, day.key, status)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Daily calls */}
                    <div className="flex items-center gap-3">
                      <span className="text-base text-muted-foreground w-28">Calls</span>
                      <div className="flex gap-2">
                        {(
                          [
                            { label: "M", key: "callMon" },
                            { label: "T", key: "callTue" },
                            { label: "W", key: "callWed" },
                            { label: "T", key: "callThu" },
                            { label: "F", key: "callFri" },
                            { label: "Sa", key: "callSat" },
                            { label: "Su", key: "callSun" },
                          ] as const
                        ).map((day) => {
                          const status = week[day.key] as string;
                          return (
                            <div key={day.key} className="flex flex-col items-center gap-1">
                              <span className="text-xs text-muted-foreground">{day.label}</span>
                              {statusBtn(week.weekNumber, day.key, status)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Events for this week */}
                    {weekEvents.map((evt) => {
                      const status = evtMap[evt.id] || "no_data";
                      const evtDate = new Date(evt.date + "T00:00:00");
                      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                      const dateLabel = `${months[evtDate.getMonth()]} ${evtDate.getDate()}`;
                      const EvtIcon = evt.type === "intensive" ? Zap : evt.type === "breakfast" ? Coffee : Star;
                      const iconColor = evt.type === "intensive" ? "text-orange-500" : evt.type === "breakfast" ? "text-amber-600" : "text-yellow-500";
                      return (
                        <div key={evt.id} className="flex items-center gap-3">
                          <span className="text-base text-muted-foreground w-28 flex items-center gap-1">
                            <EvtIcon className={`h-3 w-3 ${iconColor} shrink-0`} />
                            <span className="truncate">{evt.name}</span>
                          </span>
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-xs text-muted-foreground">{dateLabel}</span>
                            {eventStatusBtn(week.weekNumber, evt.id, status)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
