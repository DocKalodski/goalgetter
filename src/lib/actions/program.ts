"use server";

import { db } from "@/lib/db";
import { batches } from "@/lib/db/schema";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { eq } from "drizzle-orm";

export interface WeeklyTargetRange {
  min: number;
  max: number;
}

export interface ProgramEvent {
  id: string;        // unique ID (crypto.randomUUID)
  name: string;      // event name, e.g. "Leadership Summit"
  date: string;      // YYYY-MM-DD
  type?: "event" | "intensive" | "breakfast"; // for styling/categorisation
}

export interface ProgramSettings {
  batchId: string;
  batchName: string;
  startDate: string;
  endDate: string;
  currentWeek: number;
  totalWeeks: number;
  intensiveDates: string[];   // YYYY-MM-DD
  breakfastDates: string[];   // YYYY-MM-DD
  callTimes: Record<string, string>; // { mon, tue, wed, thu, fri, sat, sun }
  weeklyMeetingDay: string;
  weeklyMeetingTime: string;
  weeklyTargets: Record<string, WeeklyTargetRange>; // { "2": { min: 8, max: 12 }, ... }
  events: ProgramEvent[];   // special events that appear in weekly attendance
}

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function defaultCallTimes() {
  return Object.fromEntries(DAYS.map((d) => [d, ""]));
}

function defaultWeeklyTargets(totalWeeks: number): Record<string, WeeklyTargetRange> {
  const targets: Record<string, WeeklyTargetRange> = {};
  const last = totalWeeks - 1; // last editable week
  for (let w = 2; w < totalWeeks; w++) {
    const mid = Math.round(((w - 1) / last) * 100);
    const min = Math.max(0, mid - 2);
    const max = Math.min(100, mid + 2);
    targets[String(w)] = { min, max };
  }
  return targets;
}

/** Migrate legacy single-number target to a range */
function toRange(val: unknown): WeeklyTargetRange {
  if (val && typeof val === "object" && "min" in val && "max" in val) {
    return val as WeeklyTargetRange;
  }
  const n = Number(val) || 0;
  return { min: Math.max(0, n - 2), max: Math.min(100, n + 2) };
}

export async function getProgramSettings(): Promise<ProgramSettings> {
  const user = await getAuthUser();
  if (!user || (user.role !== "head_coach" && user.role !== "coach")) {
    throw new Error("Forbidden");
  }

  const [batch] = await db.select().from(batches).limit(1);
  if (!batch) throw new Error("No batch found");

  const totalWeeks = batch.totalWeeks ?? 12;

  return {
    batchId: batch.id,
    batchName: batch.name,
    startDate: batch.startDate ?? "",
    endDate: batch.endDate ?? "",
    currentWeek: batch.currentWeek ?? 8,
    totalWeeks,
    intensiveDates: batch.intensiveDates ? JSON.parse(batch.intensiveDates) : [],
    breakfastDates: batch.breakfastDates ? JSON.parse(batch.breakfastDates) : [],
    callTimes: batch.callTimes ? JSON.parse(batch.callTimes) : defaultCallTimes(),
    weeklyMeetingDay: batch.weeklyMeetingDay ?? "",
    weeklyMeetingTime: batch.weeklyMeetingTime ?? "",
    weeklyTargets: (() => {
      const raw = batch.weeklyTargets ? JSON.parse(batch.weeklyTargets) : null;
      if (!raw) return defaultWeeklyTargets(totalWeeks);
      // Migrate legacy format (plain numbers → ranges)
      const migrated: Record<string, WeeklyTargetRange> = {};
      for (const [k, v] of Object.entries(raw)) {
        migrated[k] = toRange(v);
      }
      return migrated;
    })(),
    events: batch.events ? JSON.parse(batch.events) : [],
  };
}

export async function saveProgramSettings(settings: Omit<ProgramSettings, "batchId" | "batchName">) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) {
    throw new Error("Forbidden: only the head coach can update program settings");
  }

  const [batch] = await db.select({ id: batches.id }).from(batches).limit(1);
  if (!batch) throw new Error("No batch found");

  await db
    .update(batches)
    .set({
      startDate: settings.startDate || null,
      endDate: settings.endDate || null,
      currentWeek: settings.currentWeek,
      totalWeeks: settings.totalWeeks,
      intensiveDates: JSON.stringify(settings.intensiveDates),
      breakfastDates: JSON.stringify(settings.breakfastDates),
      callTimes: JSON.stringify(settings.callTimes),
      weeklyMeetingDay: settings.weeklyMeetingDay || null,
      weeklyMeetingTime: settings.weeklyMeetingTime || null,
      weeklyTargets: JSON.stringify(settings.weeklyTargets),
      events: JSON.stringify(settings.events.filter((e) => e.name.trim() && e.date)),
      updatedAt: new Date(),
    })
    .where(eq(batches.id, batch.id));

  return { success: true };
}
