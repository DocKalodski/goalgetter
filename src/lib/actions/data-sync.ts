"use server";

import { db } from "@/lib/db";
import {
  dataUploads,
  dataUploadChanges,
  weeklyMilestones,
  goals,
  declarations,
  type DataUpload,
  type DataUploadChange,
} from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";

// ─── List Uploads ───────────────────────────────────────────────────────────

export async function getDataUploads(): Promise<DataUpload[]> {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) return [];

  return db.select().from(dataUploads).orderBy(desc(dataUploads.createdAt));
}

// ─── Get Upload with Changes ────────────────────────────────────────────────

export async function getUploadChanges(uploadId: string): Promise<{
  upload: DataUpload | null;
  changes: DataUploadChange[];
}> {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) return { upload: null, changes: [] };

  const uploads = await db
    .select()
    .from(dataUploads)
    .where(eq(dataUploads.id, uploadId));

  if (uploads.length === 0) return { upload: null, changes: [] };

  const changes = await db
    .select()
    .from(dataUploadChanges)
    .where(eq(dataUploadChanges.uploadId, uploadId))
    .orderBy(dataUploadChanges.studentName, dataUploadChanges.weekNumber);

  return { upload: uploads[0], changes };
}

// ─── Apply or Reject Selected Changes ───────────────────────────────────────

export async function applyChanges(
  uploadId: string,
  changeIds: string[],
  action: "apply" | "reject"
): Promise<{ success: boolean; applied: number; rejected: number; conflicts: number }> {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) {
    return { success: false, applied: 0, rejected: 0, conflicts: 0 };
  }

  if (changeIds.length === 0) {
    return { success: true, applied: 0, rejected: 0, conflicts: 0 };
  }

  const changes = await db
    .select()
    .from(dataUploadChanges)
    .where(
      and(
        eq(dataUploadChanges.uploadId, uploadId),
        inArray(dataUploadChanges.id, changeIds)
      )
    );

  let applied = 0;
  let rejected = 0;
  let conflicts = 0;
  const now = new Date();

  for (const change of changes) {
    if (change.status !== "pending") continue;

    if (action === "reject") {
      await db
        .update(dataUploadChanges)
        .set({ status: "rejected", appliedAt: now })
        .where(eq(dataUploadChanges.id, change.id));
      rejected++;
      continue;
    }

    // Apply logic
    const result = await applySingleChange(change);
    if (result === "applied") {
      await db
        .update(dataUploadChanges)
        .set({ status: "applied", appliedAt: now })
        .where(eq(dataUploadChanges.id, change.id));
      applied++;
    } else if (result === "conflict") {
      await db
        .update(dataUploadChanges)
        .set({ status: "skipped_conflict", appliedAt: now })
        .where(eq(dataUploadChanges.id, change.id));
      conflicts++;
    }
  }

  // Update upload totals
  await updateUploadTotals(uploadId);

  return { success: true, applied, rejected, conflicts };
}

// ─── Apply All Pending ──────────────────────────────────────────────────────

export async function applyAllChanges(
  uploadId: string
): Promise<{ success: boolean; applied: number; conflicts: number }> {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) {
    return { success: false, applied: 0, conflicts: 0 };
  }

  const pendingChanges = await db
    .select()
    .from(dataUploadChanges)
    .where(
      and(
        eq(dataUploadChanges.uploadId, uploadId),
        eq(dataUploadChanges.status, "pending")
      )
    );

  const ids = pendingChanges.map((c) => c.id);
  const result = await applyChanges(uploadId, ids, "apply");
  return { success: result.success, applied: result.applied, conflicts: result.conflicts };
}

// ─── Delete Upload ──────────────────────────────────────────────────────────

export async function deleteUpload(
  uploadId: string
): Promise<{ success: boolean }> {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) return { success: false };

  const uploads = await db
    .select()
    .from(dataUploads)
    .where(eq(dataUploads.id, uploadId));

  if (uploads.length === 0) return { success: false };

  const upload = uploads[0];
  if (upload.status !== "pending_review" && upload.status !== "error") {
    return { success: false };
  }

  await db.delete(dataUploadChanges).where(eq(dataUploadChanges.uploadId, uploadId));
  await db.delete(dataUploads).where(eq(dataUploads.id, uploadId));

  return { success: true };
}

// ─── Internal: Apply a Single Change ────────────────────────────────────────

async function applySingleChange(
  change: DataUploadChange
): Promise<"applied" | "conflict" | "error"> {
  try {
    switch (change.entityType) {
      case "action_item":
        return await applyActionItemChange(change);
      case "milestone_desc":
        return await applyMilestoneDescChange(change);
      case "goal_statement":
        return await applyGoalStatementChange(change);
      case "declaration":
        return await applyDeclarationChange(change);
      case "cumulative_pct":
        return await applyCumulativePctChange(change);
      default:
        return "error";
    }
  } catch (error) {
    console.error("Error applying change:", change.id, error);
    return "error";
  }
}

async function applyActionItemChange(change: DataUploadChange): Promise<"applied" | "conflict"> {
  if (!change.entityId) return "conflict";

  const milestones = await db
    .select()
    .from(weeklyMilestones)
    .where(eq(weeklyMilestones.id, change.entityId));

  if (milestones.length === 0) return "conflict";
  const milestone = milestones[0];

  let currentActions: { text: string; done: boolean }[] = [];
  if (milestone.actions) {
    try {
      currentActions = JSON.parse(milestone.actions);
    } catch {
      currentActions = [];
    }
  }

  // Extract index from field like "actions[3].text" or "actions[3].done" or "actions[3]"
  const match = change.field.match(/actions\[(\d+)\](?:\.(text|done))?/);
  if (!match) return "conflict";

  const index = parseInt(match[1], 10);
  const subField = match[2]; // "text", "done", or undefined (whole item)

  // Filter out empty items (same logic as diff engine)
  const nonEmpty = currentActions.filter((a) => a.text.trim() !== "");

  if (change.changeType === "added") {
    // Add new item
    const newItem = subField ? undefined : JSON.parse(change.newValue);
    if (newItem) {
      nonEmpty.splice(index, 0, newItem);
    }
  } else if (change.changeType === "removed") {
    if (index < nonEmpty.length) {
      // Conflict check: verify old value matches
      const oldItem = nonEmpty[index];
      if (change.oldValue && JSON.stringify(oldItem) !== change.oldValue) {
        return "conflict";
      }
      nonEmpty.splice(index, 1);
    }
  } else if (change.changeType === "modified" && subField) {
    if (index < nonEmpty.length) {
      if (subField === "text") {
        if (change.oldValue !== null && nonEmpty[index].text !== change.oldValue) {
          return "conflict";
        }
        nonEmpty[index].text = change.newValue;
      } else if (subField === "done") {
        if (change.oldValue !== null && String(nonEmpty[index].done) !== change.oldValue) {
          return "conflict";
        }
        nonEmpty[index].done = change.newValue === "true";
      }
    } else {
      return "conflict";
    }
  }

  // Rebuild full 10-slot array: non-empty items first, then empty padding
  const rebuilt: { text: string; done: boolean }[] = nonEmpty.map((a) => ({
    text: a.text,
    done: a.done,
  }));
  while (rebuilt.length < 10) {
    rebuilt.push({ text: "", done: false });
  }

  // NOTE: Do NOT overwrite cumulativePercentage here.
  // cumulativePercentage is the Excel's own cumulative goal progress (set by cumulative_pct
  // change records). The per-week action completion % is a different metric and is derived
  // on-the-fly from the done flags — it should not be stored as cumulativePercentage.
  await db
    .update(weeklyMilestones)
    .set({
      actions: JSON.stringify(rebuilt),
      updatedAt: new Date(),
    })
    .where(eq(weeklyMilestones.id, change.entityId));

  return "applied";
}

async function applyMilestoneDescChange(change: DataUploadChange): Promise<"applied" | "conflict"> {
  if (!change.entityId) return "conflict";

  const milestones = await db
    .select()
    .from(weeklyMilestones)
    .where(eq(weeklyMilestones.id, change.entityId));

  if (milestones.length === 0) return "conflict";

  const current = milestones[0].milestoneDescription || "";
  if (change.oldValue !== null && current.trim() !== (change.oldValue || "").trim()) {
    return "conflict";
  }

  await db
    .update(weeklyMilestones)
    .set({ milestoneDescription: change.newValue, updatedAt: new Date() })
    .where(eq(weeklyMilestones.id, change.entityId));

  return "applied";
}

async function applyGoalStatementChange(change: DataUploadChange): Promise<"applied" | "conflict"> {
  if (!change.entityId) return "conflict";

  const existing = await db
    .select()
    .from(goals)
    .where(eq(goals.id, change.entityId));

  if (existing.length === 0) return "conflict";

  if (change.oldValue !== null && existing[0].goalStatement.trim() !== change.oldValue.trim()) {
    return "conflict";
  }

  await db
    .update(goals)
    .set({ goalStatement: change.newValue, updatedAt: new Date() })
    .where(eq(goals.id, change.entityId));

  return "applied";
}

async function applyDeclarationChange(change: DataUploadChange): Promise<"applied" | "conflict"> {
  if (!change.entityId) return "conflict";

  const existing = await db
    .select()
    .from(declarations)
    .where(eq(declarations.id, change.entityId));

  if (existing.length === 0) return "conflict";

  if (change.oldValue !== null && existing[0].text.trim() !== change.oldValue.trim()) {
    return "conflict";
  }

  await db
    .update(declarations)
    .set({ text: change.newValue, updatedAt: new Date() })
    .where(eq(declarations.id, change.entityId));

  return "applied";
}

async function applyCumulativePctChange(change: DataUploadChange): Promise<"applied" | "conflict"> {
  if (!change.entityId) return "conflict";

  const milestones = await db
    .select()
    .from(weeklyMilestones)
    .where(eq(weeklyMilestones.id, change.entityId));

  if (milestones.length === 0) return "conflict";

  // Cumulative percentage from Excel is authoritative — always apply without conflict check
  await db
    .update(weeklyMilestones)
    .set({ cumulativePercentage: parseInt(change.newValue, 10), updatedAt: new Date() })
    .where(eq(weeklyMilestones.id, change.entityId));

  return "applied";
}

// ─── Internal: Update Upload Totals ─────────────────────────────────────────

async function updateUploadTotals(uploadId: string) {
  const allChanges = await db
    .select()
    .from(dataUploadChanges)
    .where(eq(dataUploadChanges.uploadId, uploadId));

  const appliedCount = allChanges.filter((c) => c.status === "applied").length;
  const rejectedCount = allChanges.filter(
    (c) => c.status === "rejected" || c.status === "skipped_conflict"
  ).length;
  const pendingCount = allChanges.filter((c) => c.status === "pending").length;

  let status: "pending_review" | "partially_applied" | "applied" | "rejected";
  if (pendingCount > 0) {
    status = "pending_review";
  } else if (appliedCount > 0 && rejectedCount > 0) {
    status = "partially_applied";
  } else if (appliedCount > 0) {
    status = "applied";
  } else {
    status = "rejected";
  }

  await db
    .update(dataUploads)
    .set({
      status,
      appliedChanges: appliedCount,
      rejectedChanges: rejectedCount,
      appliedAt: pendingCount === 0 ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(dataUploads.id, uploadId));
}
