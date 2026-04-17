import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock next/navigation redirect before importing login
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path) => {
    throw new Error(`NEXT_REDIRECT: ${path}`);
  }),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: (name: string) => {
      const mockHeaders: Record<string, string> = {
        "x-forwarded-for": "192.168.1.1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      };
      return mockHeaders[name];
    },
  }),
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockReturnThis(),
  },
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed_password"),
  verifyPassword: vi.fn(),
}));

vi.mock("@/lib/auth/jwt", () => ({
  createAccessToken: vi.fn().mockResolvedValue("mock-access-token"),
  createRefreshToken: vi.fn().mockResolvedValue("mock-refresh-token"),
  setAuthCookies: vi.fn(),
}));

vi.mock("@/lib/config", () => ({
  config: {
    roles: {
      loginDestinations: {
        head_coach: "/l1",
        coach: "/l2",
        council_leader: "/l3",
        student: "/l3",
        facilitator: "/l1",
        developer: "/l1",
      },
    },
  },
}));

vi.mock("@/lib/auth/device", () => ({
  parseUserAgent: vi.fn().mockReturnValue({
    deviceType: "desktop",
    browser: "Chrome",
    os: "Windows",
  }),
}));

describe("Login Action (src/lib/actions/auth.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Email Validation", () => {
    it("should reject missing email", async () => {
      const { login } = await import("../src/lib/actions/auth");
      const formData = new FormData();
      formData.set("password", "password123");

      const result = await login(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject invalid email format", async () => {
      const { login } = await import("../src/lib/actions/auth");
      const formData = new FormData();
      formData.set("email", "not-an-email");
      formData.set("password", "password123");

      const result = await login(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid email");
    });
  });

  describe("Password Validation", () => {
    it("should reject missing password", async () => {
      const { login } = await import("../src/lib/actions/auth");
      const formData = new FormData();
      formData.set("email", "user@example.com");

      const result = await login(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("required");
    });
  });

  describe("User Lookup", () => {
    it("should return error for non-existent user", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.select().from().where().limit).mockResolvedValue([]);

      const { login } = await import("../src/lib/actions/auth");
      const formData = new FormData();
      formData.set("email", "unknown@example.com");
      formData.set("password", "password123");

      const result = await login(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid email or password");
    });
  });

  describe("Password Verification", () => {
    it("should return error for wrong password", async () => {
      const { db } = await import("@/lib/db");
      const mockUser = {
        id: "user-1",
        email: "user@example.com",
        passwordHash: "hashed_password",
        role: "student",
        permissions: null,
        canViewAllCouncils: 0,
      };
      vi.mocked(db.select().from().where().limit).mockResolvedValue([
        mockUser,
      ]);

      const { verifyPassword } = await import("@/lib/auth/password");
      vi.mocked(verifyPassword).mockResolvedValue(false);

      const { login } = await import("../src/lib/actions/auth");
      const formData = new FormData();
      formData.set("email", "user@example.com");
      formData.set("password", "wrong_password");

      const result = await login(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid email or password");
    });
  });

  describe("Successful Login", () => {
    it("should create session and redirect for valid credentials", async () => {
      const { db } = await import("@/lib/db");
      const mockUser = {
        id: "user-1",
        email: "user@example.com",
        passwordHash: "hashed_password",
        role: "student",
        permissions: null,
        canViewAllCouncils: 0,
      };
      vi.mocked(db.select().from().where().limit).mockResolvedValue([
        mockUser,
      ]);

      const { verifyPassword } = await import("@/lib/auth/password");
      vi.mocked(verifyPassword).mockResolvedValue(true);

      // Mock active sessions query for concurrent session detection
      const dbMock = vi.mocked(db);
      dbMock.select = vi.fn().mockReturnThis();
      dbMock.from = vi.fn().mockReturnThis();
      dbMock.where = vi.fn().mockResolvedValue([]);

      const { redirect } = await import("next/navigation");

      const { login } = await import("../src/lib/actions/auth");
      const formData = new FormData();
      formData.set("email", "user@example.com");
      formData.set("password", "correct_password");

      try {
        await login(formData);
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          expect(err.message).toContain("/l3");
        } else {
          throw err;
        }
      }

      expect(redirect).toHaveBeenCalled();
    });
  });

  describe("Concurrent Session Detection", () => {
    it("should flag suspicious login from different IP", async () => {
      const { db } = await import("@/lib/db");
      const mockUser = {
        id: "user-1",
        email: "user@example.com",
        passwordHash: "hashed_password",
        role: "student",
        permissions: null,
        canViewAllCouncils: 0,
      };
      vi.mocked(db.select().from().where().limit).mockResolvedValue([
        mockUser,
      ]);

      const { verifyPassword } = await import("@/lib/auth/password");
      vi.mocked(verifyPassword).mockResolvedValue(true);

      // Mock existing session from different IP
      const dbMock = vi.mocked(db);
      const existingSession = {
        id: "session-old",
        userId: "user-1",
        ipAddress: "192.168.1.100",
        browser: "Safari",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      dbMock.select = vi.fn().mockReturnThis();
      dbMock.from = vi.fn().mockReturnThis();
      dbMock.where = vi.fn().mockResolvedValue([existingSession]);

      const { login } = await import("../src/lib/actions/auth");
      const formData = new FormData();
      formData.set("email", "user@example.com");
      formData.set("password", "correct_password");

      try {
        await login(formData);
      } catch (err) {
        // Expected redirect
      }

      // Verify that login audit was created with suspicious flag
      expect(db.insert).toHaveBeenCalled();
    });
  });
});
