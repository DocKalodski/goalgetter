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

describe("Attendance Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated users", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const { updateAttendance } = await import("@/lib/actions/attendance");

    await expect(
      updateAttendance("student-1", 1, { meetingStatus: "present" })
    ).rejects.toThrow("Unauthorized");
  });

  it("should reject students from updating attendance", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({
      userId: "student-1",
      role: "student",
    });
    const { updateAttendance } = await import("@/lib/actions/attendance");

    await expect(
      updateAttendance("student-1", 1, { meetingStatus: "present" })
    ).rejects.toThrow("Forbidden");
  });

  it("should allow coaches to update attendance", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({
      userId: "coach-1",
      role: "coach",
    });
    const { updateAttendance } = await import("@/lib/actions/attendance");

    const result = await updateAttendance("student-1", 1, {
      meetingStatus: "present",
    });
    expect(result).toEqual({ success: true });
  });

  it("should allow head coach to update attendance", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({
      userId: "hc-1",
      role: "head_coach",
    });
    const { updateAttendance } = await import("@/lib/actions/attendance");

    const result = await updateAttendance("student-1", 1, {
      meetingStatus: "late",
    });
    expect(result).toEqual({ success: true });
  });
});
