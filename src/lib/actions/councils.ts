"use server";

import { db } from "@/lib/db";
import { councils, users, goals, weeklyMilestones, declarations, attendance, directMessages } from "@/lib/db/schema";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { eq, inArray, desc, isNull, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { getCurrentWeek, getUserProgress } from "@/lib/progress";

export async function getCouncilsWithStats() {
  const user = await getAuthUser();
  if (!user || (user.role !== "head_coach" && user.role !== "coach" && user.role !== "facilitator")) {
    throw new Error("Forbidden");
  }

  const currentWeek = await getCurrentWeek();
  const allCouncils = (user.role === "head_coach" || user.role === "facilitator")
    ? await db.select().from(councils)
    : await db.select().from(councils).where(eq(councils.coachId, user.userId));

  // Get head coach name for display
  const [headCoach] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.role, "head_coach"))
    .limit(1);

  const result = [];

  for (const council of allCouncils) {
    const adminCoach = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, council.coachId))
      .limit(1);

    const members = await db
      .select({ id: users.id, name: users.name, role: users.role })
      .from(users)
      .where(eq(users.councilId, council.id));

    // Find council leader
    const leader = members.find((m) => m.role === "council_leader");

    // Calculate avg progress for council
    let totalProgress = 0;
    let totalResults = 0;
    let totalCurrentWeek = 0;
    let memberCount = 0;
    for (const member of members) {
      const prog = await getUserProgress(member.id, currentWeek);
      totalProgress += (prog.enrollment + prog.personal + prog.professional) / 3;
      totalResults += (prog.enrollmentResults + prog.personalResults + prog.professionalResults) / 3;
      totalCurrentWeek += (prog.enrollmentCurrentWeek + prog.personalCurrentWeek + prog.professionalCurrentWeek) / 3;
      memberCount++;
    }

    result.push({
      id: council.id,
      name: council.name,
      theme: council.theme,
      coachId: council.coachId,
      coachName: headCoach?.name || null,
      adminCoachName: adminCoach[0]?.name || null,
      leaderName: leader?.name || null,
      studentCount: members.length,
      avgProgress: memberCount > 0 ? Math.round(totalProgress / memberCount) : 0,
      avgResults: memberCount > 0 ? Math.round(totalResults / memberCount) : 0,
      avgCurrentWeek: memberCount > 0 ? Math.round(totalCurrentWeek / memberCount) : 0,
    });
  }

  return result;
}

export async function getCouncilStudents(councilId: string | null) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const currentWeek = await getCurrentWeek();

  // If no council selected, find the coach's council
  let targetCouncilId = councilId;
  if (!targetCouncilId && user.role === "coach") {
    const [council] = await db
      .select()
      .from(councils)
      .where(eq(councils.coachId, user.userId))
      .limit(1);
    targetCouncilId = council?.id || null;
  }

  if (!targetCouncilId) {
    return { councilName: "No Council", students: [] };
  }

  const [council] = await db
    .select()
    .from(councils)
    .where(eq(councils.id, targetCouncilId))
    .limit(1);

  const members = await db
    .select()
    .from(users)
    .where(and(eq(users.councilId, targetCouncilId), eq(users.role, "student")));

  // Fetch all declarations for these members — order by newest first so the Map keeps the latest per user
  const memberIds = members.map((m) => m.id);
  const memberDeclarations = memberIds.length > 0
    ? await db.select({ userId: declarations.userId, text: declarations.text, approvalStatus: declarations.approvalStatus })
        .from(declarations)
        .where(inArray(declarations.userId, memberIds))
        .orderBy(desc(declarations.updatedAt))
    : [];
  // Build map: first occurrence per userId = most recent (due to DESC order)
  const declMap = new Map<string, string>();
  const declApprovalMap = new Map<string, string>();
  for (const d of memberDeclarations) {
    if (!declMap.has(d.userId)) {
      declMap.set(d.userId, d.text);
      declApprovalMap.set(d.userId, d.approvalStatus);
    }
  }

  // Fetch all attendance rows for all members in one query
  const memberAttendanceRows = memberIds.length > 0
    ? await db.select().from(attendance).where(inArray(attendance.userId, memberIds))
    : [];
  // Group by userId
  const attMap = new Map<string, typeof memberAttendanceRows>();
  for (const row of memberAttendanceRows) {
    if (!attMap.has(row.userId)) attMap.set(row.userId, []);
    attMap.get(row.userId)!.push(row);
  }

  // Batch-fetch unread DM counts: messages sent by students (not by coach) that are unread
  const unreadDmRows = memberIds.length > 0
    ? await db.select({ studentId: directMessages.studentId, senderId: directMessages.senderId })
        .from(directMessages)
        .where(and(inArray(directMessages.studentId, memberIds), isNull(directMessages.readAt)))
    : [];
  const unreadDmMap = new Map<string, number>();
  for (const row of unreadDmRows) {
    // Only count messages sent BY the student (not the coach replying)
    if (memberIds.includes(row.senderId)) {
      unreadDmMap.set(row.studentId, (unreadDmMap.get(row.studentId) ?? 0) + 1);
    }
  }

  // Batch-fetch support_needed for current week across all members
  const supportRows = memberIds.length > 0
    ? await db
        .select({ userId: goals.userId, supportNeeded: weeklyMilestones.supportNeeded })
        .from(weeklyMilestones)
        .innerJoin(goals, eq(weeklyMilestones.goalId, goals.id))
        .where(and(
          inArray(goals.userId, memberIds),
          eq(weeklyMilestones.weekNumber, currentWeek)
        ))
    : [];
  const supportMap = new Map<string, boolean>();
  for (const row of supportRows) {
    if (row.supportNeeded?.trim()) supportMap.set(row.userId, true);
  }

  const students = [];
  for (const member of members) {
    const prog = await getUserProgress(member.id, currentWeek);

    // Compute per-week attendance rate (0-100) split by meeting vs call
    const weeklyMeetingAttendance: Record<number, number> = {};
    const weeklyCallAttendance: Record<number, number> = {};
    for (const row of attMap.get(member.id) ?? []) {
      const mtgSlots = [row.meetingMon, row.meetingTue, row.meetingWed, row.meetingThu, row.meetingFri, row.meetingSat, row.meetingSun];
      const callSlots = [row.callMon, row.callTue, row.callWed, row.callThu, row.callFri, row.callSat, row.callSun];
      const mtgTracked = mtgSlots.filter((s) => s && s !== "no_data").length;
      const mtgPresent = mtgSlots.filter((s) => s === "present" || s === "late").length;
      const callTracked = callSlots.filter((s) => s && s !== "no_data").length;
      const callPresent = callSlots.filter((s) => s === "present" || s === "late").length;
      if (mtgTracked > 0) weeklyMeetingAttendance[row.weekNumber] = Math.round((mtgPresent / mtgTracked) * 100);
      if (callTracked > 0) weeklyCallAttendance[row.weekNumber] = Math.round((callPresent / callTracked) * 100);
    }

    students.push({
      id: member.id,
      name: member.name,
      email: member.email,
      declaration: declMap.get(member.id) ?? null,
      declarationApprovalStatus: declApprovalMap.get(member.id) ?? null,
      enrollmentProgress: prog.enrollment,
      personalProgress: prog.personal,
      professionalProgress: prog.professional,
      enrollmentResults: prog.enrollmentResults,
      personalResults: prog.personalResults,
      professionalResults: prog.professionalResults,
      enrollmentCurrentWeek: prog.enrollmentCurrentWeek,
      personalCurrentWeek: prog.personalCurrentWeek,
      professionalCurrentWeek: prog.professionalCurrentWeek,
      weeklyMeetingAttendance,
      weeklyCallAttendance,
      unreadDmCount: unreadDmMap.get(member.id) ?? 0,
      hasSupportNeeded: supportMap.get(member.id) ?? false,
    });
  }

  // Fetch coach name for HC chat
  const coachId = council?.coachId || null;
  let coachName: string | null = null;
  if (coachId) {
    const [coachUser] = await db.select({ name: users.name }).from(users).where(eq(users.id, coachId)).limit(1);
    coachName = coachUser?.name || null;
  }

  return {
    councilName: council?.name || "Unknown",
    coachId,
    coachName,
    students,
  };
}

export async function getCouncilList() {
  const user = await getAuthUser();
  if (!user || (user.role !== "head_coach" && user.role !== "coach" && user.role !== "facilitator")) {
    throw new Error("Forbidden");
  }
  const rows = user.role === "coach"
    ? await db.select({ id: councils.id, name: councils.name }).from(councils).where(eq(councils.coachId, user.userId))
    : await db.select({ id: councils.id, name: councils.name }).from(councils);
  return rows;
}

export async function getUnassignedStudents() {
  const user = await getAuthUser();
  if (!user || (user.role !== "head_coach" && user.role !== "coach")) throw new Error("Forbidden");
  // Find the batch the coach belongs to
  const [coachRow] = await db.select({ batchId: users.batchId }).from(users).where(eq(users.id, user.userId)).limit(1);
  if (!coachRow?.batchId) return [];
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, councilId: users.councilId, role: users.role })
    .from(users)
    .where(eq(users.batchId, coachRow.batchId));
  return rows
    .filter((u) => !u.councilId && u.role !== "coach" && u.role !== "head_coach")
    .map(({ id, name, email }) => ({ id, name, email }));
}

export async function getCouncilRoster() {
  const user = await getAuthUser();
  if (!user || (user.role !== "head_coach" && user.role !== "coach")) throw new Error("Forbidden");

  // Get batch
  const [coachRow] = await db.select({ batchId: users.batchId }).from(users).where(eq(users.id, user.userId)).limit(1);
  if (!coachRow?.batchId) return { unassigned: [], councils: [] };

  // All students in batch
  const allStudents = await db
    .select({ id: users.id, name: users.name, email: users.email, councilId: users.councilId, role: users.role })
    .from(users)
    .where(eq(users.batchId, coachRow.batchId));

  const students = allStudents.filter((u) => u.role !== "coach" && u.role !== "head_coach");
  const unassigned = students.filter((u) => !u.councilId).map(({ id, name, email }) => ({ id, name, email }));

  // All councils with full detail
  const allCouncils = await db.select({
    id: councils.id,
    name: councils.name,
    theme: councils.theme,
    coachId: councils.coachId,
  }).from(councils);

  const councilMap = allCouncils.map((c) => ({
    id: c.id,
    name: c.name,
    theme: c.theme,
    coachId: c.coachId,
    students: students
      .filter((s) => s.councilId === c.id)
      .map(({ id, name, email }) => ({ id, name, email })),
  }));

  return { unassigned, councils: councilMap };
}

export async function updateCouncil(id: string, data: { name: string; theme?: string; coachId: string }) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");
  await db.update(councils).set({
    name: data.name,
    theme: data.theme || null,
    coachId: data.coachId,
    updatedAt: new Date(),
  }).where(eq(councils.id, id));
}

export async function deleteCouncil(id: string) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");
  // Unassign all students first
  await db.update(users).set({ councilId: null, updatedAt: new Date() }).where(eq(users.councilId, id));
  // Delete council
  await db.delete(councils).where(eq(councils.id, id));
}

export async function assignStudentsToCouncil(councilId: string, studentIds: string[]) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");
  const now = new Date();
  for (const id of studentIds) {
    await db.update(users).set({ councilId, updatedAt: now }).where(eq(users.id, id));
  }
}

export async function removeStudentFromCouncil(studentId: string) {
  const user = await getAuthUser();
  if (!user || (user.role !== "head_coach" && user.role !== "coach")) throw new Error("Forbidden");
  await db.update(users).set({ councilId: null, updatedAt: new Date() }).where(eq(users.id, studentId));
}

export async function assignCoachToCouncil(councilId: string, coachId: string) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");
  await db.update(councils).set({ coachId, updatedAt: new Date() }).where(eq(councils.id, councilId));
  return { success: true };
}

export async function createCouncil(data: {
  name: string;
  theme?: string;
  coachId: string;
  batchId: string;
}) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) {
    throw new Error("Forbidden");
  }

  const now = new Date();
  const id = createId();

  await db.insert(councils).values({
    id,
    name: data.name,
    theme: data.theme || null,
    coachId: data.coachId,
    batchId: data.batchId,
    createdAt: now,
    updatedAt: now,
  });

  return { success: true, id };
}
