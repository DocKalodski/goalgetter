import { describe, expect, it } from "vitest";
import { config } from "@/lib/config";

describe("Configuration", () => {
  it("should have correct program settings", () => {
    expect(config.program.name).toBe("LEAP");
    expect(config.program.totalWeeks).toBe(12);
    expect(config.program.goalTypes).toHaveLength(3);
    expect(config.program.goalTypes).toContain("enrollment");
    expect(config.program.goalTypes).toContain("personal");
    expect(config.program.goalTypes).toContain("professional");
  });

  it("should have correct auth settings", () => {
    expect(config.auth.saltRounds).toBe(12);
    expect(config.auth.accessTokenExpiry).toBe("1h");
    expect(config.auth.refreshTokenExpiry).toBe("7d");
  });

  it("should have correct role hierarchy", () => {
    expect(config.roles.hierarchy).toHaveLength(4);
    expect(config.roles.hierarchy[0]).toBe("head_coach");
    expect(config.roles.hierarchy[3]).toBe("student");
  });

  it("should map roles to correct login destinations", () => {
    expect(config.roles.loginDestinations.head_coach).toBe("/l1");
    expect(config.roles.loginDestinations.coach).toBe("/l2");
    expect(config.roles.loginDestinations.council_leader).toBe("/l3");
    expect(config.roles.loginDestinations.student).toBe("/l3");
  });

  it("should have correct attendance statuses", () => {
    expect(config.attendance.statuses).toHaveLength(4);
    expect(config.attendance.statuses).toContain("present");
    expect(config.attendance.statuses).toContain("no_data");
  });
});
