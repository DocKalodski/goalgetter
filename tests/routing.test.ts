import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock next/navigation redirect before importing Home
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path) => {
    throw new Error(`NEXT_REDIRECT: ${path}`);
  }),
}));

vi.mock("@/lib/auth/jwt", () => ({
  getAuthUser: vi.fn(),
}));

import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/jwt";

describe("Home Page Routing (src/app/page.tsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Unauthenticated Users", () => {
    it("should redirect unauthenticated users to /login", async () => {
      vi.mocked(getAuthUser).mockResolvedValue(null);

      // Import and call the Home component
      const { default: Home } = await import("../src/app/page");

      try {
        await Home();
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          expect(err.message).toContain("/login");
        } else {
          throw err;
        }
      }

      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("Role-Based Routing", () => {
    it("should route head_coach users to /l1", async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        userId: "hc-1",
        role: "head_coach",
        canViewAllCouncils: false,
      });

      const { default: Home } = await import("../src/app/page");

      try {
        await Home();
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          expect(err.message).toContain("/l1");
        } else {
          throw err;
        }
      }

      expect(redirect).toHaveBeenCalledWith("/l1");
    });

    it("should route facilitator users to /l1", async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        userId: "f-1",
        role: "facilitator",
        canViewAllCouncils: false,
      });

      const { default: Home } = await import("../src/app/page");

      try {
        await Home();
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          expect(err.message).toContain("/l1");
        } else {
          throw err;
        }
      }

      expect(redirect).toHaveBeenCalledWith("/l1");
    });

    it("should route developer users to /l1", async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        userId: "d-1",
        role: "developer",
        canViewAllCouncils: false,
      });

      const { default: Home } = await import("../src/app/page");

      try {
        await Home();
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          expect(err.message).toContain("/l1");
        } else {
          throw err;
        }
      }

      expect(redirect).toHaveBeenCalledWith("/l1");
    });

    it("should route coach users to /l2", async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        userId: "c-1",
        role: "coach",
        canViewAllCouncils: false,
      });

      const { default: Home } = await import("../src/app/page");

      try {
        await Home();
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          expect(err.message).toContain("/l2");
        } else {
          throw err;
        }
      }

      expect(redirect).toHaveBeenCalledWith("/l2");
    });

    it("should route council_leader users to /l3", async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        userId: "cl-1",
        role: "council_leader",
        canViewAllCouncils: false,
      });

      const { default: Home } = await import("../src/app/page");

      try {
        await Home();
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          expect(err.message).toContain("/l3");
        } else {
          throw err;
        }
      }

      expect(redirect).toHaveBeenCalledWith("/l3");
    });

    it("should route student users to /l3", async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        userId: "s-1",
        role: "student",
        canViewAllCouncils: false,
      });

      const { default: Home } = await import("../src/app/page");

      try {
        await Home();
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          expect(err.message).toContain("/l3");
        } else {
          throw err;
        }
      }

      expect(redirect).toHaveBeenCalledWith("/l3");
    });

    it("should default to /l2 for unknown roles", async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        userId: "unknown-1",
        role: "unknown_role" as any,
        canViewAllCouncils: false,
      });

      const { default: Home } = await import("../src/app/page");

      try {
        await Home();
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          expect(err.message).toContain("/l2");
        } else {
          throw err;
        }
      }

      expect(redirect).toHaveBeenCalledWith("/l2");
    });
  });
});
