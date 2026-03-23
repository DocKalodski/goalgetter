import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/auth/jwt", () => ({
  getAuthUser: vi.fn(),
  createAccessToken: vi.fn().mockResolvedValue("mock-access-token"),
  createRefreshToken: vi.fn().mockResolvedValue("mock-refresh-token"),
  setAuthCookies: vi.fn(),
  clearAuthCookies: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed"),
  verifyPassword: vi.fn().mockResolvedValue(true),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { getAuthUser } from "@/lib/auth/jwt";

describe("Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAuthUser", () => {
    it("should return null when no token present", async () => {
      vi.mocked(getAuthUser).mockResolvedValue(null);
      const result = await getAuthUser();
      expect(result).toBeNull();
    });

    it("should return payload when valid token", async () => {
      const mockPayload = { userId: "user-1", role: "student" as const };
      vi.mocked(getAuthUser).mockResolvedValue(mockPayload);
      const result = await getAuthUser();
      expect(result).toEqual(mockPayload);
      expect(result?.role).toBe("student");
    });

    it("should return head_coach role for HC users", async () => {
      const mockPayload = { userId: "hc-1", role: "head_coach" as const };
      vi.mocked(getAuthUser).mockResolvedValue(mockPayload);
      const result = await getAuthUser();
      expect(result?.role).toBe("head_coach");
    });
  });
});
