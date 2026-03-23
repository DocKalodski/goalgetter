import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/jwt", () => ({
  getAuthUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { getAuthUser } from "@/lib/auth/jwt";

describe("Goal Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated users from creating goals", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const { createGoal } = await import("@/lib/actions/goals");

    await expect(
      createGoal({
        goalType: "enrollment",
        goalStatement: "Test goal statement for enrollment",
      })
    ).rejects.toThrow("Unauthorized");
  });

  it("should reject non-student roles from creating goals", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({
      userId: "coach-1",
      role: "coach",
    });
    const { createGoal } = await import("@/lib/actions/goals");

    await expect(
      createGoal({
        goalType: "enrollment",
        goalStatement: "Test goal statement for enrollment",
      })
    ).rejects.toThrow("Only students can create goals");
  });

  it("should reject unauthenticated users from getting goals", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const { getMyGoals } = await import("@/lib/actions/goals");

    await expect(getMyGoals()).rejects.toThrow("Unauthorized");
  });

  it("should allow students to get their goals", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({
      userId: "student-1",
      role: "student",
    });

    const { getMyGoals } = await import("@/lib/actions/goals");
    const result = await getMyGoals();
    expect(result).toBeDefined();
  });
});
