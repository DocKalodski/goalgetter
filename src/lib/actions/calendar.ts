"use server";

import { db } from "@/lib/db";
import { weeklyMilestones, goals, batches, users } from "@/lib/db/schema";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { eq } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

export type GoalType = "enrollment" | "personal" | "professional";

export interface CalendarActionStep {
  milestoneId: string;
  goalId: string;
  goalType: GoalType;
  weekNumber: number;
  weekStartDate: string | null;
  actionIndex: number;
  text: string;
  done: boolean;
  scheduledDate: string | null;
  pendingDate: string | null;
  /** Day-of-week assignments: 0=Mon 1=Tue 2=Wed 3=Thu 4=Fri */
  days?: number[];
}

export interface CalendarBatchEvent {
  date: string;
  type: "intensive" | "breakfast" | "meeting" | "call";
  label: string;
}

export interface BatchSchedule {
  // Recurring weekly call times: {mon:"09:00", tue:"", wed:"10:00", ...}
  callTimes: Record<string, string>;
  weeklyMeetingDay: string | null;  // "monday"|"tuesday"|...
  weeklyMeetingTime: string | null; // "HH:MM"
}

export interface CalendarMilestone {
  milestoneId: string;
  goalType: GoalType;
  weekNumber: number;
  weekStartDate: string | null;
  description: string | null;
  cumulativePercentage: number;
}

export interface StudentCalendarData {
  actionSteps: CalendarActionStep[];
  milestones: CalendarMilestone[];
  batchEvents: CalendarBatchEvent[];   // specific dates (intensives, breakfasts)
  batchSchedule: BatchSchedule | null; // recurring weekly schedule
}

export async function getStudentCalendarData(studentId: string): Promise<StudentCalendarData> {
  const studentGoals = await db.select().from(goals).where(eq(goals.userId, studentId));
  const actionSteps: CalendarActionStep[] = [];
  const milestones: CalendarMilestone[] = [];

  for (const goal of studentGoals) {
    const dbMilestones = await db
      .select()
      .from(weeklyMilestones)
      .where(eq(weeklyMilestones.goalId, goal.id));

    for (const milestone of dbMilestones) {
      const actions: { text: string; done: boolean; days?: number[] }[] = milestone.actions
        ? JSON.parse(milestone.actions)
        : [];
      const schedule: Record<string, { scheduledDate?: string; pendingDate?: string }> =
        milestone.actionSchedule ? JSON.parse(milestone.actionSchedule) : {};

      actions.forEach((action, index) => {
        if (!action.text?.trim()) return; // skip empty action steps
        actionSteps.push({
          milestoneId: milestone.id,
          goalId: goal.id,
          goalType: goal.goalType as GoalType,
          weekNumber: milestone.weekNumber,
          weekStartDate: milestone.weekStartDate ?? null,
          actionIndex: index,
          text: action.text,
          done: action.done,
          scheduledDate: schedule[String(index)]?.scheduledDate ?? null,
          pendingDate: schedule[String(index)]?.pendingDate ?? null,
          days: action.days,
        });
      });

      if (milestone.milestoneDescription) {
        milestones.push({
          milestoneId: milestone.id,
          goalType: goal.goalType as GoalType,
          weekNumber: milestone.weekNumber,
          weekStartDate: milestone.weekStartDate ?? null,
          description: milestone.milestoneDescription,
          cumulativePercentage: milestone.cumulativePercentage,
        });
      }
    }
  }

  // Batch events + recurring schedule from student's batch
  const batchEvents: CalendarBatchEvent[] = [];
  let batchSchedule: BatchSchedule | null = null;

  const [userRow] = await db.select().from(users).where(eq(users.id, studentId)).limit(1);
  if (userRow?.batchId) {
    const [batch] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, userRow.batchId))
      .limit(1);
    if (batch) {
      // Fixed dates
      const intensiveDates: string[] = batch.intensiveDates
        ? JSON.parse(batch.intensiveDates)
        : [];
      const breakfastDates: string[] = batch.breakfastDates
        ? JSON.parse(batch.breakfastDates)
        : [];
      intensiveDates.forEach((date) =>
        batchEvents.push({ date, type: "intensive", label: "Intensive" })
      );
      breakfastDates.forEach((date) =>
        batchEvents.push({ date, type: "breakfast", label: "Breakfast" })
      );

      // Recurring schedule
      batchSchedule = {
        callTimes: batch.callTimes ? JSON.parse(batch.callTimes) : {},
        weeklyMeetingDay: batch.weeklyMeetingDay ?? null,
        weeklyMeetingTime: batch.weeklyMeetingTime ?? null,
      };
    }
  }

  return { actionSteps, milestones, batchEvents, batchSchedule };
}

export async function scheduleActionStep(
  milestoneId: string,
  actionIndex: number,
  scheduledDate: string // YYYY-MM-DD, or "" to clear
): Promise<void> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const [milestone] = await db
    .select()
    .from(weeklyMilestones)
    .where(eq(weeklyMilestones.id, milestoneId))
    .limit(1);
  if (!milestone) throw new Error("Milestone not found");

  const [goal] = await db
    .select()
    .from(goals)
    .where(eq(goals.id, milestone.goalId))
    .limit(1);
  if (!goal) throw new Error("Goal not found");

  const isCoach = user.role === "coach" || user.role === "head_coach";
  const isOwner = goal.userId === user.userId;
  if (!isCoach && !isOwner) throw new Error("Forbidden");

  const schedule: Record<string, { scheduledDate?: string; pendingDate?: string }> =
    milestone.actionSchedule ? JSON.parse(milestone.actionSchedule) : {};

  const key = String(actionIndex);
  if (!schedule[key]) schedule[key] = {};

  if (isCoach) {
    if (scheduledDate) {
      schedule[key].scheduledDate = scheduledDate;
      delete schedule[key].pendingDate;
    } else {
      delete schedule[key];
    }
  } else {
    // Student edit → pending approval
    if (scheduledDate) {
      schedule[key].pendingDate = scheduledDate;
    } else {
      delete schedule[key].pendingDate;
    }
  }

  await db
    .update(weeklyMilestones)
    .set({ actionSchedule: JSON.stringify(schedule), updatedAt: new Date() })
    .where(eq(weeklyMilestones.id, milestoneId));
}

export async function updateActionStepText(
  milestoneId: string,
  actionIndex: number,
  newText: string,
  done?: boolean
): Promise<void> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const [milestone] = await db
    .select()
    .from(weeklyMilestones)
    .where(eq(weeklyMilestones.id, milestoneId))
    .limit(1);
  if (!milestone) throw new Error("Milestone not found");

  const [goal] = await db
    .select()
    .from(goals)
    .where(eq(goals.id, milestone.goalId))
    .limit(1);
  if (!goal) throw new Error("Goal not found");

  const isCoach = user.role === "coach" || user.role === "head_coach";
  const isOwner = goal.userId === user.userId;
  if (!isCoach && !isOwner) throw new Error("Forbidden");

  const actions: { text: string; done: boolean }[] = milestone.actions
    ? JSON.parse(milestone.actions)
    : [];

  if (actionIndex < 0 || actionIndex >= actions.length) throw new Error("Invalid index");

  actions[actionIndex] = {
    text: newText.trim() || actions[actionIndex].text,
    done: done !== undefined ? done : actions[actionIndex].done,
  };

  await db
    .update(weeklyMilestones)
    .set({ actions: JSON.stringify(actions), updatedAt: new Date() })
    .where(eq(weeklyMilestones.id, milestoneId));
}

export async function updateActionStepDays(
  milestoneId: string,
  actionIndex: number,
  days: number[]
): Promise<void> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const [milestone] = await db
    .select()
    .from(weeklyMilestones)
    .where(eq(weeklyMilestones.id, milestoneId))
    .limit(1);
  if (!milestone) throw new Error("Milestone not found");

  const [goal] = await db
    .select()
    .from(goals)
    .where(eq(goals.id, milestone.goalId))
    .limit(1);
  if (!goal) throw new Error("Goal not found");

  const isCoach = user.role === "coach" || user.role === "head_coach";
  const isOwner = goal.userId === user.userId;
  if (!isCoach && !isOwner) throw new Error("Forbidden");

  const actions: { text: string; done: boolean; days?: number[] }[] = milestone.actions
    ? JSON.parse(milestone.actions)
    : [];

  if (actionIndex < 0 || actionIndex >= actions.length) throw new Error("Invalid index");
  actions[actionIndex] = { ...actions[actionIndex], days };

  await db
    .update(weeklyMilestones)
    .set({ actions: JSON.stringify(actions), updatedAt: new Date() })
    .where(eq(weeklyMilestones.id, milestoneId));
}

export async function approveActionSchedule(
  milestoneId: string,
  actionIndex: number
): Promise<void> {
  const user = await getAuthUser();
  if (!user || (user.role !== "coach" && user.role !== "head_coach"))
    throw new Error("Forbidden");

  const [milestone] = await db
    .select()
    .from(weeklyMilestones)
    .where(eq(weeklyMilestones.id, milestoneId))
    .limit(1);
  if (!milestone) throw new Error("Milestone not found");

  const schedule: Record<string, { scheduledDate?: string; pendingDate?: string }> =
    milestone.actionSchedule ? JSON.parse(milestone.actionSchedule) : {};

  const key = String(actionIndex);
  if (schedule[key]?.pendingDate) {
    schedule[key].scheduledDate = schedule[key].pendingDate;
    delete schedule[key].pendingDate;
    await db
      .update(weeklyMilestones)
      .set({ actionSchedule: JSON.stringify(schedule), updatedAt: new Date() })
      .where(eq(weeklyMilestones.id, milestoneId));
  }
}

export interface CalendarLoadStats {
  // Mon=0 … Fri=4, totals across all 12 weeks
  totalByDay: number[];
  // Per-week: [week1Total, week2Total, …, week12Total]
  weekTotals: number[];
  // Per-week breakdown [week][day 0-4]
  weekByDay: number[][];
  heavyDayCount: number;   // days with ≥ 3 steps
  emptyWeekCount: number;  // weeks with 0 steps
  lightWeekCount: number;  // weeks with 1-2 steps
}

export async function analyzeCalendarLoad(stats: CalendarLoadStats): Promise<string> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const DAY = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weekLines = stats.weekTotals
    .map((total, i) => {
      const byDay = stats.weekByDay[i]?.map((n, d) => `${DAY[d]}:${n}`).join(" ") ?? "";
      return `  Week ${i + 1}: ${total} steps  [${byDay}]`;
    })
    .join("\n");

  const dayTotals = DAY.map((d, i) => `${d}:${stats.totalByDay[i]}`).join("  ");

  const prompt = `You are a performance coaching advisor reviewing a student's 12-week action calendar.

Action step distribution (Mon–Fri only):
${weekLines}

Totals by day across all weeks: ${dayTotals}
Heavy days (3+ items on one day): ${stats.heavyDayCount}
Empty weeks (0 steps): ${stats.emptyWeekCount}
Light weeks (1–2 steps): ${stats.lightWeekCount}

Give 3–5 short, specific, actionable coaching tips. Focus on:
- Which day(s) are overloaded and how to spread the load
- Which weeks need more action steps added in the Action Planner
- Whether overall weekly volume is sufficient (aim for 3–5 steps/week)
- One encouragement if distribution looks reasonable

Rules:
- Use bullet points (•) only — no intro sentence, no conclusion
- Each bullet max 15 words
- Be direct and coaching-positive (not critical)`;

  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 350,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].type === "text" ? response.content[0].text.trim() : "";
}
